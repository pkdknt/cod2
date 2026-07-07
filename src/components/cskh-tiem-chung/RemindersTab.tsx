'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Search } from 'lucide-react';
import { DATA, parseDate, parseSchedule, addInterval, sequentialInterval, fmtDate, DOSE_LABELS } from '@/lib/vaccineData';

interface RemindersTabProps {
  data: any[];
  onRefresh?: () => void;
}

export default function RemindersTab({ data, onRefresh }: RemindersTabProps) {
  const [filterDays, setFilterDays] = useState('30'); // Default < 1 month
  const [qSearch, setQSearch] = useState('');

  // Local state to keep track of live edits so that the UI updates immediately
  const [localEdits, setLocalEdits] = useState<{
    [patientId: string]: {
      dates?: string[];
      called?: boolean[];
      messaged?: boolean[];
      notes?: string[];
    }
  }>({});

  const [savingStatus, setSavingStatus] = useState<{ [patientId: string]: 'idle' | 'dirty' | 'saving' | 'saved' | 'error' }>({});
  const [unsavedPatientIds, setUnsavedPatientIds] = useState<Set<string>>(new Set());
  const timersRef = useRef<{ [patientId: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    return () => {
      // Clear all timers on unmount
      Object.values(timersRef.current).forEach(t => clearTimeout(t));
    };
  }, []);

  const getPatientValue = (patient: any, doseIndex: number) => {
    const patientId = patient._id;
    const edits = localEdits[patientId] || {};
    
    const dates = edits.dates || patient.dates || Array(6).fill('');
    const notes = edits.notes || patient.notes || Array(6).fill('');
    const called = edits.called || patient.called || Array(6).fill(false);
    const messaged = edits.messaged || patient.messaged || Array(6).fill(false);

    return {
      hasDate: !!dates[doseIndex],
      dateStr: dates[doseIndex] || '',
      noteStr: notes[doseIndex] || '',
      isCalled: !!called[doseIndex],
      isMessaged: !!messaged[doseIndex]
    };
  };

  const handleChange = (patientId: string, doseIndex: number, field: string, value: any) => {
    const patient = data.find(p => p._id === patientId);
    if (!patient) return;

    const currentEdits = localEdits[patientId] || {};
    const dates = [...(currentEdits.dates || patient.dates || Array(6).fill(''))];
    const notes = [...(currentEdits.notes || patient.notes || Array(6).fill(''))];
    const called = [...(currentEdits.called || patient.called || Array(6).fill(false))];
    const messaged = [...(currentEdits.messaged || patient.messaged || Array(6).fill(false))];

    if (field === 'dates') {
      dates[doseIndex] = value;
    } else if (field === 'notes') {
      notes[doseIndex] = value;
    } else if (field === 'called') {
      called[doseIndex] = value;
    } else if (field === 'messaged') {
      messaged[doseIndex] = value;
    }

    setLocalEdits(prev => ({
      ...prev,
      [patientId]: { dates, notes, called, messaged }
    }));

    setUnsavedPatientIds(prev => {
      const next = new Set(prev);
      next.add(patientId);
      return next;
    });

    setSavingStatus(prev => ({ ...prev, [patientId]: 'dirty' }));

    if (timersRef.current[patientId]) {
      clearTimeout(timersRef.current[patientId]);
    }

    timersRef.current[patientId] = setTimeout(() => {
      savePatient(patientId, { dates, notes, called, messaged });
    }, 10000);
  };

  const savePatient = async (patientId: string, edits: any) => {
    const patient = data.find(p => p._id === patientId);
    if (!patient) return;

    setSavingStatus(prev => ({ ...prev, [patientId]: 'saving' }));

    try {
      const res = await fetch('/api/cskh-tiem-chung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: patientId,
          patientCode: patient.patientCode,
          patientName: patient.patientName,
          phone: patient.phone,
          dob: patient.dob,
          gender: patient.gender,
          address: patient.address,
          vaccine: patient.vaccine,
          protocolId: patient.protocolId,
          dueOverrides: patient.dueOverrides,
          dates: edits.dates,
          notes: edits.notes,
          called: edits.called,
          messaged: edits.messaged
        })
      });

      if (!res.ok) throw new Error('Auto-save failed');

      setSavingStatus(prev => ({ ...prev, [patientId]: 'saved' }));
      
      setUnsavedPatientIds(prev => {
        const next = new Set(prev);
        next.delete(patientId);
        return next;
      });

      setTimeout(() => {
        if (onRefresh) onRefresh();
      }, 800);

    } catch (e) {
      console.error(e);
      setSavingStatus(prev => ({ ...prev, [patientId]: 'error' }));
    }
  };

  // Compute upcoming doses for all patients
  const reminders = useMemo(() => {
    const list: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    data.forEach((patient) => {
      const protocol = DATA.protocols.find(p => p.id === patient.protocolId);
      if (!protocol) return;

      const plan = parseSchedule(protocol.schedule);
      const computed: (Date | null)[] = Array(6).fill(null);
      const dates = patient.dates || Array(6).fill('');
      const dueOverrides = patient.dueOverrides || Array(6).fill('');

      // Math for dates
      for (let i = 0; i < 6; i++) {
        const actual = parseDate(dates[i]);
        const override = parseDate(dueOverrides[i]);

        if (actual) {
          computed[i] = actual;
        } else if (i >= 1 && override) {
          computed[i] = override;
        } else {
          const it = plan.intervals[i];
          if (i === 0) {
            computed[i] = null;
          } else {
            const prevActual = parseDate(dates[i - 1]) || parseDate(dueOverrides[i - 1]) || computed[i - 1];
            const seq = prevActual ? sequentialInterval(plan, i) : null;
            if (seq && computed[i - 1]) {
              computed[i] = addInterval(computed[i - 1] as Date, seq);
            } else if (it && computed[it.from]) {
              computed[i] = addInterval(computed[it.from] as Date, it);
            }
          }
        }

        // Check if this dose is NOT injected yet
        if (!actual) {
          const activeDue = override || computed[i];
          if (activeDue) {
            const diff = Math.round((activeDue.getTime() - today.getTime()) / 86400000);
            
            // Apply filter based on dropdown
            let isMatch = false;
            if (filterDays === 'all') isMatch = true;
            else if (filterDays === 'overdue') isMatch = diff < 0;
            else if (filterDays === 'today') isMatch = diff === 0;
            else isMatch = diff <= parseInt(filterDays);

            if (isMatch) {
              list.push({
                _id: patient._id + '_' + i,
                patientId: patient._id,
                patientCode: patient.patientCode || '',
                patientName: patient.patientName || '',
                phone: patient.phone || '',
                dob: patient.dob || '',
                gender: patient.gender || '',
                address: patient.address || '',
                vaccineAndDose: `${patient.vaccine} ${DOSE_LABELS[i].replace('Mũi ', '')}`,
                doseLabel: DOSE_LABELS[i],
                actualDateStr: dates[i] || '',
                plannedDateStr: fmtDate(activeDue),
                diff,
                due: activeDue,
                doseIndex: i,
                patient: patient
              });
            }
          }
        }
      }
    });

    // Sort by due date ascending
    list.sort((a, b) => a.due.getTime() - b.due.getTime());

    // Apply text search filter
    if (qSearch) {
      const q = qSearch.toLowerCase();
      return list.filter(item => 
        item.patientName.toLowerCase().includes(q) ||
        item.patientCode.toLowerCase().includes(q) ||
        item.vaccineAndDose.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q)
      );
    }

    return list;
  }, [data, filterDays, qSearch]);

  const handleExport = () => {
    const exportData = reminders.map((item, index) => {
      const vals = getPatientValue(item.patient, item.doseIndex);
      return {
        '#': index + 1,
        'Mã đối tượng': item.patientCode,
        'Họ tên': item.patientName,
        'Số điện thoại': item.phone,
        'Ngày sinh': item.dob,
        'Giới tính': item.gender,
        'Địa chỉ': item.address,
        'Mũi tiêm': item.vaccineAndDose,
        'Ngày tiêm': vals.dateStr,
        'Kế hoạch tiêm': item.plannedDateStr,
        'Đã tiêm': vals.hasDate ? 'Đã tiêm' : 'Chưa tiêm',
        'Đã gọi': vals.isCalled ? 'Đã gọi' : 'Chưa gọi',
        'Đã nhắn tin': vals.isMessaged ? 'Đã nhắn tin' : 'Chưa nhắn tin',
        'Ghi chú nhắc hẹn': vals.noteStr
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!views'] = [{ showGridLines: true }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Nhac_Hen");
    XLSX.writeFile(wb, "DanhSachNhacHenTiem.xlsx");
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tìm kiếm nhanh</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tên, Mã BN, SĐT, Vắc xin..."
              value={qSearch}
              onChange={(e) => setQSearch(e.target.value)}
              className="w-full pl-9 rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
            />
          </div>
        </div>
        <div className="w-[200px]">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Thời gian giới hạn</label>
          <select
            value={filterDays}
            onChange={(e) => setFilterDays(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
          >
            <option value="overdue">Đã quá hạn</option>
            <option value="today">Trong hôm nay</option>
            <option value="7">Dưới 1 tuần (7 ngày)</option>
            <option value="30">Dưới 1 tháng (30 ngày)</option>
            <option value="all">Tất cả lịch chưa tiêm</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            Kết quả thống kê <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">{reminders.length} mũi</span>
          </h2>
          <button
            onClick={handleExport}
            disabled={reminders.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-500 disabled:opacity-50"
          >
            Xuất Danh Sách
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[1200px] border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold h-11 border-b border-slate-200 uppercase text-[10px]">
                <th className="pl-6 w-12 border border-slate-200 text-center">#</th>
                <th className="w-32 border border-slate-200 px-3">Mã đối tượng</th>
                <th className="w-44 border border-slate-200 px-3">Họ tên</th>
                <th className="w-28 border border-slate-200 text-center px-3">Số điện thoại</th>
                <th className="w-24 border border-slate-200 text-center px-3">Ngày sinh</th>
                <th className="w-20 border border-slate-200 text-center px-3">Giới tính</th>
                <th className="min-w-[120px] max-w-[200px] border border-slate-200 px-3">Địa chỉ</th>
                <th className="w-32 border border-slate-200 px-3">Mũi tiêm</th>
                <th className="w-28 border border-slate-200 text-center px-3">Ngày tiêm</th>
                <th className="w-28 border border-slate-200 text-center px-3">Kế hoạch tiêm</th>
                <th className="w-20 border border-slate-200 text-center px-3">Đã tiêm</th>
                <th className="w-20 border border-slate-200 text-center px-3">Đã gọi</th>
                <th className="w-20 border border-slate-200 text-center px-3">Đã nhắn</th>
                <th className="w-40 border border-slate-200 px-3">Ghi chú nhắc hẹn</th>
                <th className="w-28 border border-slate-200 px-3">Trạng thái</th>
                <th className="w-24 border border-slate-200 text-center pr-6">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reminders.length === 0 ? (
                <tr>
                  <td colSpan={16} className="text-center py-20 text-slate-400 font-bold">
                    Không có lịch hẹn nào thỏa mãn điều kiện.
                  </td>
                </tr>
              ) : (
                reminders.map((item, index) => {
                  let statusBadge = null;
                  if (item.diff < 0) {
                    statusBadge = <span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold border border-red-200">Quá hạn {Math.abs(item.diff)} ngày</span>;
                  } else if (item.diff === 0) {
                    statusBadge = <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">Hôm nay</span>;
                  } else {
                    statusBadge = <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 font-bold border border-amber-200">Còn {item.diff} ngày</span>;
                  }

                  const vals = getPatientValue(item.patient, item.doseIndex);
                  const status = savingStatus[item.patientId] || 'idle';

                  return (
                    <tr key={item._id} className="border-b border-slate-100 h-12 hover:bg-slate-50 transition-colors">
                      <td className="pl-6 text-slate-400 font-bold border border-slate-200 text-center">{index + 1}</td>
                      <td className="font-semibold text-slate-600 border border-slate-200 px-3">{item.patientCode}</td>
                      <td className="font-bold text-slate-800 uppercase border border-slate-200 px-3">{item.patientName}</td>
                      <td className="text-center text-slate-650 font-semibold border border-slate-200 px-3">{item.phone || '—'}</td>
                      <td className="text-center text-slate-550 border border-slate-200 px-3">{item.dob}</td>
                      <td className="text-center text-slate-500 font-semibold border border-slate-200 px-3">
                        {item.gender === 'Nữ' ? <span className="text-pink-500">♀</span> : item.gender === 'Nam' ? <span className="text-blue-500">♂</span> : ''}
                      </td>
                      <td className="text-slate-600 truncate max-w-[150px] border border-slate-200 px-3" title={item.address}>{item.address}</td>
                      <td className="font-bold text-teal-800 border border-slate-200 px-3">{item.vaccineAndDose}</td>
                      <td className="text-center text-slate-500 font-semibold border border-slate-200 px-3">{vals.dateStr || '—'}</td>
                      <td className="text-center font-bold text-slate-700 border border-slate-200 px-3">{item.plannedDateStr}</td>
                      
                      {/* Checkboxes */}
                      <td className="text-center border border-slate-200">
                        <input
                          type="checkbox"
                          checked={vals.hasDate}
                          onChange={(e) => {
                            const dateVal = e.target.checked ? fmtDate(new Date()) : '';
                            handleChange(item.patientId, item.doseIndex, 'dates', dateVal);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>
                      <td className="text-center border border-slate-200">
                        <input
                          type="checkbox"
                          checked={vals.isCalled}
                          onChange={(e) => {
                            handleChange(item.patientId, item.doseIndex, 'called', e.target.checked);
                          }}
                          className="w-4 h-4 rounded border-slate-350 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>
                      <td className="text-center border border-slate-200">
                        <input
                          type="checkbox"
                          checked={vals.isMessaged}
                          onChange={(e) => {
                            handleChange(item.patientId, item.doseIndex, 'messaged', e.target.checked);
                          }}
                          className="w-4 h-4 rounded border-slate-350 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>
                      
                      {/* Note Input */}
                      <td className="py-1 border border-slate-200 px-3">
                        <input
                          type="text"
                          value={vals.noteStr}
                          placeholder="Ghi chú..."
                          onChange={(e) => {
                            handleChange(item.patientId, item.doseIndex, 'notes', e.target.value);
                          }}
                          className="w-full max-w-[130px] text-xs px-2 py-1.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                        />
                      </td>
                      
                      <td className="border border-slate-200 px-3">{statusBadge}</td>
                      
                      {/* Thao tác (Save Status / Manual Save) */}
                      <td className="pr-6 text-center border border-slate-200">
                        <div className="flex flex-col items-center gap-1 justify-center min-w-[70px]">
                          {status === 'saving' && (
                            <span className="text-[10px] text-teal-600 font-bold animate-pulse">Đang lưu...</span>
                          )}
                          {status === 'saved' && (
                            <span className="text-[10px] text-emerald-600 font-bold">Đã lưu</span>
                          )}
                          {status === 'error' && (
                            <span className="text-[10px] text-red-500 font-bold">Lỗi lưu!</span>
                          )}
                          {status === 'dirty' && (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[9px] text-amber-600 font-semibold">Chờ 10s...</span>
                              <button
                                onClick={() => {
                                  if (timersRef.current[item.patientId]) {
                                    clearTimeout(timersRef.current[item.patientId]);
                                  }
                                  const currentEdits = localEdits[item.patientId] || {};
                                  savePatient(item.patientId, currentEdits);
                                }}
                                className="px-1.5 py-0.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-[8px] font-extrabold uppercase tracking-wide shadow-sm"
                              >
                                Lưu ngay
                              </button>
                            </div>
                          )}
                          {(!status || status === 'idle') && (
                            <span className="text-[10px] text-slate-400 font-semibold">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
