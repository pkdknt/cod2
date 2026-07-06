'use client';

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Search } from 'lucide-react';
import { DATA, parseDate, parseSchedule, addInterval, sequentialInterval, fmtDate, DOSE_LABELS } from '@/lib/vaccineData';

interface RemindersTabProps {
  data: any[];
}

export default function RemindersTab({ data }: RemindersTabProps) {
  const [filterDays, setFilterDays] = useState('30'); // Default < 1 month
  const [qSearch, setQSearch] = useState('');

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
                dob: patient.dob || '',
                gender: patient.gender || '',
                address: patient.address || '',
                vaccineAndDose: `${patient.vaccine} ${DOSE_LABELS[i].replace('Mũi ', '')}`,
                doseLabel: DOSE_LABELS[i],
                actualDateStr: dates[i] || '',
                plannedDateStr: fmtDate(activeDue),
                diff,
                due: activeDue,
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
        item.vaccineAndDose.toLowerCase().includes(q)
      );
    }

    return list;
  }, [data, filterDays, qSearch]);

  const handleExport = () => {
    const exportData = reminders.map((item, index) => ({
      '#': index + 1,
      'Mã đối tượng': item.patientCode,
      'Họ tên': item.patientName,
      'Ngày sinh': item.dob,
      'Giới tính': item.gender,
      'Địa chỉ': item.address,
      'Mũi tiêm': item.vaccineAndDose,
      'Ngày tiêm': item.actualDateStr,
      'Kế hoạch tiêm': item.plannedDateStr
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
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
              placeholder="Tên, Mã BN, Vắc xin..."
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
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-white text-slate-500 font-bold h-11 border-b border-slate-200">
                <th className="pl-6 w-12">#</th>
                <th className="w-32">Mã đối tượng</th>
                <th className="w-48">Họ tên</th>
                <th className="w-24">Ngày sinh</th>
                <th className="w-20 text-center">Giới tính</th>
                <th className="min-w-[150px]">Địa chỉ</th>
                <th className="w-32">Mũi tiêm</th>
                <th className="w-28 text-center">Ngày tiêm</th>
                <th className="w-28 text-center">Kế hoạch tiêm</th>
                <th className="w-32 pr-6">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {reminders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-20 text-slate-400 font-bold">
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

                  return (
                    <tr key={item._id} className="border-b border-slate-100 h-12 hover:bg-slate-50 transition-colors">
                      <td className="pl-6 text-slate-400 font-bold">{index + 1}</td>
                      <td className="font-semibold text-slate-600">{item.patientCode}</td>
                      <td className="font-bold text-slate-800 uppercase">{item.patientName}</td>
                      <td className="text-slate-500">{item.dob}</td>
                      <td className="text-center text-slate-500 font-semibold">
                        {item.gender === 'Nữ' ? <span className="text-pink-500">♀</span> : item.gender === 'Nam' ? <span className="text-blue-500">♂</span> : ''}
                      </td>
                      <td className="text-slate-600 truncate max-w-[200px]" title={item.address}>{item.address}</td>
                      <td className="font-bold text-teal-800">{item.vaccineAndDose}</td>
                      <td className="text-center text-slate-400">{item.actualDateStr}</td>
                      <td className="text-center font-bold text-slate-700">{item.plannedDateStr}</td>
                      <td className="pr-6">{statusBadge}</td>
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
