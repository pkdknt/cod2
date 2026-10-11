'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { fmtDate } from '@/lib/vaccineData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSortableTable } from '@/hooks/useSortableTable';
import { toUpperNoAccent } from '@/lib/format';
import { applyCellStyle, loadXLSX, THIN_BORDER, writeSheet } from '@/lib/excel';
import Pagination from '@/components/ui/Pagination';
import type { Pagination as PaginationType, PatientRecord, ReminderFilter, ReminderRow } from '@/lib/types';

interface RemindersTabProps {
  onEdit?: (patient: PatientRecord) => void;
  onDelete?: (id: string) => void;
}

const PAGE_SIZE = 100;

export default function RemindersTab({ onEdit, onDelete }: RemindersTabProps) {
  const [filterDays, setFilterDays] = useState<ReminderFilter>('30');
  const [qSearch, setQSearch] = useState('');
  const debouncedQ = useDebouncedValue(qSearch, 400);

  const { sortKey, sortDirection, requestSort, renderSortIcon } = useSortableTable('due');

  const [rows, setRows] = useState<ReminderRow[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalFiltered: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);

  // Local state to keep track of live edits so that the UI updates immediately
  const [localEdits, setLocalEdits] = useState<{
    [patientId: string]: {
      dates?: string[];
      called?: boolean[];
      messaged?: boolean[];
      notes?: string[];
    };
  }>({});

  const [savingStatus, setSavingStatus] = useState<{
    [patientId: string]: 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
  }>({});
  const timersRef = useRef<{ [patientId: string]: NodeJS.Timeout }>({});

  const patientById = useMemo(() => {
    const map = new Map<string, PatientRecord>();
    rows.forEach((row) => map.set(row.patientId, row.patient));
    return map;
  }, [rows]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      Object.values(timers).forEach((t) => clearTimeout(t));
    };
  }, []);

  const abortRef = useRef<AbortController | null>(null);

  const fetchReminders = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        filter: filterDays,
        q: debouncedQ,
        sortKey,
        sortDir: sortDirection,
        page: String(pagination.page),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/cskh-tiem-chung/reminders?${params.toString()}`, { signal: controller.signal });
      if (!res.ok) throw new Error('API query failed');
      const result = await res.json();
      if (controller.signal.aborted) return;
      setRows(result.items || []);
      if (result.pagination) setPagination(result.pagination);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') console.error(e);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [filterDays, debouncedQ, sortKey, sortDirection, pagination.page]);

  useEffect(() => {
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, [filterDays, debouncedQ]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const getPatientValue = (patient: PatientRecord, doseIndex: number) => {
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
      isMessaged: !!messaged[doseIndex],
    };
  };

  const savePatient = async (patientId: string, edits: Record<string, unknown>) => {
    const patient = patientById.get(patientId);
    if (!patient) return;

    setSavingStatus((prev) => ({ ...prev, [patientId]: 'saving' }));

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
          messaged: edits.messaged,
        }),
      });

      if (!res.ok) throw new Error('Auto-save failed');

      setSavingStatus((prev) => ({ ...prev, [patientId]: 'saved' }));
      setTimeout(() => fetchReminders(), 800);
    } catch (e) {
      console.error(e);
      setSavingStatus((prev) => ({ ...prev, [patientId]: 'error' }));
    }
  };

  const handleChange = (patientId: string, doseIndex: number, field: string, value: unknown) => {
    const patient = patientById.get(patientId);
    if (!patient) return;

    const currentEdits = localEdits[patientId] || {};
    const dates = [...(currentEdits.dates || patient.dates || Array(6).fill(''))];
    const notes = [...(currentEdits.notes || patient.notes || Array(6).fill(''))];
    const called = [...(currentEdits.called || patient.called || Array(6).fill(false))];
    const messaged = [...(currentEdits.messaged || patient.messaged || Array(6).fill(false))];

    if (field === 'dates') dates[doseIndex] = value as string;
    else if (field === 'notes') notes[doseIndex] = value as string;
    else if (field === 'called') called[doseIndex] = value as boolean;
    else if (field === 'messaged') messaged[doseIndex] = value as boolean;

    setLocalEdits((prev) => ({ ...prev, [patientId]: { dates, notes, called, messaged } }));
    setSavingStatus((prev) => ({ ...prev, [patientId]: 'dirty' }));

    if (timersRef.current[patientId]) clearTimeout(timersRef.current[patientId]);
    timersRef.current[patientId] = setTimeout(() => {
      savePatient(patientId, { dates, notes, called, messaged });
    }, 1500);
  };

  const handleInputBlur = (patientId: string) => {
    if (timersRef.current[patientId]) clearTimeout(timersRef.current[patientId]);
    const currentEdits = localEdits[patientId];
    if (currentEdits) savePatient(patientId, currentEdits);
  };

  const handleEditClick = (item: ReminderRow) => {
    const patientId = item.patientId;
    if (timersRef.current[patientId]) clearTimeout(timersRef.current[patientId]);
    const edits = localEdits[patientId];
    if (edits) savePatient(patientId, edits);

    const mergedPatient: PatientRecord = {
      ...item.patient,
      dates: edits?.dates || item.patient.dates,
      notes: edits?.notes || item.patient.notes,
      called: edits?.called || item.patient.called,
      messaged: edits?.messaged || item.patient.messaged,
    };
    if (onEdit) onEdit(mergedPatient);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        filter: filterDays,
        q: debouncedQ,
        sortKey,
        sortDir: sortDirection,
        all: 'true',
      });
      const res = await fetch(`/api/cskh-tiem-chung/reminders?${params.toString()}`);
      const result = await res.json();
      const exportRows: ReminderRow[] = result.items || [];
      if (exportRows.length === 0) {
        alert('Không có dữ liệu để xuất.');
        return;
      }

      const headers = [
        'STT', 'Mã đối tượng', 'Họ tên', 'Họ tên không dấu', 'Số điện thoại', 'Ngày sinh',
        'Giới tính', 'Địa chỉ', 'Mũi tiêm', 'Ngày tiêm', 'Kế hoạch tiêm', 'Đã tiêm',
        'Đã gọi', 'Đã nhắn tin', 'Ghi chú nhắc hẹn',
      ];

      const dataRows = exportRows.map((item, index) => {
        const vals = getPatientValue(item.patient, item.doseIndex);
        return [
          index + 1, item.patientCode, item.patientName, toUpperNoAccent(item.patientName || ''),
          item.phone, item.dob, item.gender, item.address, item.vaccineAndDose, vals.dateStr,
          item.plannedDateStr, vals.hasDate ? 'Đã tiêm' : 'Chưa tiêm',
          vals.isCalled ? 'Đã gọi' : 'Chưa gọi', vals.isMessaged ? 'Đã nhắn tin' : 'Chưa nhắn tin', vals.noteStr,
        ];
      });

      const XLSX = await loadXLSX();
      const aoa = [['DANH SÁCH NHẮC HẸN TIÊM VẮC XIN'], [], headers, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(aoa);

      applyCellStyle(XLSX, ws, (R, C) => {
        if (R === 0) {
          return { font: { name: 'Arial', sz: 14, bold: true, color: { rgb: '0F766E' } }, alignment: { horizontal: 'center', vertical: 'center' } };
        }
        if (R === 1) return undefined;
        if (R === 2) {
          return {
            border: THIN_BORDER,
            font: { name: 'Arial', sz: 10, bold: true },
            alignment: { horizontal: 'center', vertical: 'center' },
            fill: { fgColor: { rgb: 'F2F2F2' } },
          };
        }
        return {
          border: THIN_BORDER,
          font: { name: 'Arial', sz: 10 },
          alignment: {
            horizontal: [0, 3, 4, 5, 8, 9, 10, 11, 12].includes(C) ? 'center' : 'left',
            vertical: 'center',
          },
        };
      }, { createMissing: true });

      writeSheet(XLSX, {
        ws,
        sheetName: 'Nhac_Hen',
        fileName: 'DanhSachNhacHenTiem.xlsx',
        merges: [{ s: { c: 0, r: 0 }, e: { c: 14, r: 0 } }],
        rows: [{ hpt: 30 }, { hpt: 15 }, { hpt: 22 }],
      });
    } catch (e) {
      alert('Không thể xuất Excel: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-auto md:h-full gap-4 flex-1 min-h-0">
      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-wrap gap-3 items-end shrink-0">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tìm kiếm nhanh</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tên, Mã BN, SĐT, Vắc xin..."
              value={qSearch}
              onChange={(e) => setQSearch(e.target.value)}
              className="w-full pl-9 rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
            />
          </div>
        </div>
        <div className="w-[200px]">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Thời gian giới hạn</label>
          <select
            value={filterDays}
            onChange={(e) => setFilterDays(e.target.value as ReminderFilter)}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
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
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px] md:min-h-0">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            Kết quả thống kê
            <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
              {pagination.totalFiltered} mũi
            </span>
          </h2>
          <button
            onClick={handleExport}
            disabled={loading || pagination.totalFiltered === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-500 disabled:opacity-50"
          >
            Xuất Danh Sách
          </button>
        </div>

        <div className="flex-1 overflow-auto min-h-0 relative">
          <table className="w-full text-xs text-left min-w-[1200px] border-collapse border border-slate-200">
            <thead className="sticky top-0 z-30 shadow-sm bg-slate-50">
              <tr className="bg-slate-50 text-slate-700 font-bold h-11 border-b border-slate-200 uppercase text-[10px]">
                <th className="pl-6 border border-slate-200 text-center sticky top-0 left-0 z-30 bg-slate-50" style={{ minWidth: '48px', maxWidth: '48px' }}>STT</th>
                <th className="border border-slate-200 px-3 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-30 bg-slate-50" style={{ left: '48px', minWidth: '128px', maxWidth: '128px' }} onClick={() => requestSort('patientCode')}>
                  <div className="flex items-center gap-1">Mã đối tượng {renderSortIcon('patientCode')}</div>
                </th>
                <th className="border border-slate-200 px-3 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-30 bg-slate-50" style={{ left: '176px', minWidth: '176px', maxWidth: '176px' }} onClick={() => requestSort('name')}>
                  <div className="flex items-center gap-1">Họ tên {renderSortIcon('name')}</div>
                </th>
                <th className="border border-slate-200 px-3 sticky top-0 z-30 bg-slate-50" style={{ left: '352px', minWidth: '160px', maxWidth: '160px' }}>
                  <div className="flex items-center gap-1 text-slate-500">Họ tên không dấu</div>
                </th>
                <th className="border border-slate-200 text-center px-3 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-30 bg-slate-50" style={{ left: '512px', minWidth: '112px', maxWidth: '112px' }} onClick={() => requestSort('phone')}>
                  <div className="flex items-center justify-center gap-1">Số điện thoại {renderSortIcon('phone')}</div>
                </th>
                <th className="border border-slate-200 text-center px-3 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-30 bg-slate-50" style={{ left: '624px', minWidth: '96px', maxWidth: '96px' }} onClick={() => requestSort('dob')}>
                  <div className="flex items-center justify-center gap-1">Ngày sinh {renderSortIcon('dob')}</div>
                </th>
                <th className="w-20 border border-slate-200 text-center px-3 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-20 bg-slate-50" onClick={() => requestSort('gender')}>
                  <div className="flex items-center justify-center gap-1">Giới tính {renderSortIcon('gender')}</div>
                </th>
                <th className="min-w-[120px] max-w-[200px] border border-slate-200 px-3 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-20 bg-slate-50" onClick={() => requestSort('address')}>
                  <div className="flex items-center gap-1">Địa chỉ {renderSortIcon('address')}</div>
                </th>
                <th className="w-32 border border-slate-200 px-3 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-20 bg-slate-50" onClick={() => requestSort('vaccineAndDose')}>
                  <div className="flex items-center gap-1">Mũi tiêm {renderSortIcon('vaccineAndDose')}</div>
                </th>
                <th className="w-28 border border-slate-200 text-center px-3 sticky top-0 z-20 bg-slate-50">Ngày tiêm</th>
                <th className="w-28 border border-slate-200 text-center px-3 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-20 bg-slate-50" onClick={() => requestSort('due')}>
                  <div className="flex items-center justify-center gap-1">Kế hoạch tiêm {renderSortIcon('due')}</div>
                </th>
                <th className="w-20 border border-slate-200 text-center px-3 sticky top-0 z-20 bg-slate-50">Đã tiêm</th>
                <th className="w-20 border border-slate-200 text-center px-3 sticky top-0 z-20 bg-slate-50">Đã gọi</th>
                <th className="w-20 border border-slate-200 text-center px-3 sticky top-0 z-20 bg-slate-50">Đã nhắn</th>
                <th className="w-40 border border-slate-200 px-3 sticky top-0 z-20 bg-slate-50">Ghi chú nhắc hẹn</th>
                <th className="w-28 border border-slate-200 px-3 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-20 bg-slate-50" onClick={() => requestSort('diff')}>
                  <div className="flex items-center justify-center gap-1">Trạng thái {renderSortIcon('diff')}</div>
                </th>
                <th className="w-24 border border-slate-200 text-center pr-6 sticky top-0 z-20 bg-slate-50">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={17} className="text-center py-20 text-slate-400 font-bold">
                    {loading ? 'Đang tải...' : 'Không có lịch hẹn nào thỏa mãn điều kiện.'}
                  </td>
                </tr>
              ) : (
                rows.map((item, index) => {
                  let statusBadge;
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
                    <tr key={item._id} className="group border-b border-slate-100 h-12 bg-white hover:bg-slate-50 transition-colors">
                      <td className="pl-6 text-slate-400 font-bold border border-slate-200 text-center sticky left-0 z-10 bg-white group-hover:bg-slate-50" style={{ minWidth: '48px', maxWidth: '48px' }}>{(pagination.page - 1) * PAGE_SIZE + index + 1}</td>
                      <td className="font-semibold text-slate-600 border border-slate-200 px-3 sticky z-10 bg-white group-hover:bg-slate-50" style={{ left: '48px', minWidth: '128px', maxWidth: '128px' }}>{item.patientCode}</td>
                      <td className="font-bold text-slate-800 uppercase border border-slate-200 px-3 sticky z-10 bg-white group-hover:bg-slate-50" style={{ left: '176px', minWidth: '176px', maxWidth: '176px' }}>{item.patientName}</td>
                      <td className="font-semibold text-slate-500 border border-slate-200 px-3 sticky z-10 bg-white group-hover:bg-slate-50 tracking-wide text-[11px]" style={{ left: '352px', minWidth: '160px', maxWidth: '160px' }}>{toUpperNoAccent(item.patientName || '')}</td>
                      <td className="text-center text-slate-650 font-semibold border border-slate-200 px-3 sticky z-10 bg-white group-hover:bg-slate-50" style={{ left: '512px', minWidth: '112px', maxWidth: '112px' }}>{item.phone || '—'}</td>
                      <td className="text-center text-slate-550 border border-slate-200 px-3 sticky z-10 bg-white group-hover:bg-slate-50" style={{ left: '624px', minWidth: '96px', maxWidth: '96px' }}>{item.dob}</td>
                      <td className="text-center text-slate-500 font-semibold border border-slate-200 px-3">
                        {item.gender === 'Nữ' ? <span className="text-pink-500">♀</span> : item.gender === 'Nam' ? <span className="text-blue-500">♂</span> : ''}
                      </td>
                      <td className="text-slate-600 truncate max-w-[150px] border border-slate-200 px-3" title={item.address}>{item.address}</td>
                      <td className="font-bold text-teal-800 border border-slate-200 px-3">{item.vaccineAndDose}</td>
                      <td className="text-center text-slate-500 font-semibold border border-slate-200 px-3">{vals.dateStr || '—'}</td>
                      <td className="text-center font-bold text-slate-700 border border-slate-200 px-3">{item.plannedDateStr}</td>

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
                          onChange={(e) => handleChange(item.patientId, item.doseIndex, 'called', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-350 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>
                      <td className="text-center border border-slate-200">
                        <input
                          type="checkbox"
                          checked={vals.isMessaged}
                          onChange={(e) => handleChange(item.patientId, item.doseIndex, 'messaged', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-350 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-1 border border-slate-200 px-3">
                        <input
                          type="text"
                          value={vals.noteStr}
                          placeholder="Ghi chú..."
                          onChange={(e) => handleChange(item.patientId, item.doseIndex, 'notes', e.target.value)}
                          onBlur={() => handleInputBlur(item.patientId)}
                          className="w-full max-w-[130px] text-xs px-2 py-1.5 border border-slate-200 rounded-xl outline-none focus:border-teal-500"
                        />
                      </td>

                      <td className="border border-slate-200 px-3">{statusBadge}</td>

                      <td className="pr-6 text-center border border-slate-200">
                        <div className="flex flex-col items-center gap-1.5 justify-center min-w-[80px] py-1">
                          {status === 'saving' && <span className="text-[10px] text-teal-600 font-bold animate-pulse">Đang lưu...</span>}
                          {status === 'saved' && <span className="text-[10px] text-emerald-600 font-bold">Đã lưu</span>}
                          {status === 'error' && <span className="text-[10px] text-red-500 font-bold">Lỗi lưu!</span>}
                          {status === 'dirty' && (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[9px] text-amber-600 font-semibold">Chờ 1.5s...</span>
                              <button
                                onClick={() => {
                                  if (timersRef.current[item.patientId]) clearTimeout(timersRef.current[item.patientId]);
                                  const currentEdits = localEdits[item.patientId] || {};
                                  savePatient(item.patientId, currentEdits);
                                }}
                                className="px-1.5 py-0.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-[8px] font-extrabold uppercase tracking-wide shadow-sm"
                              >
                                Lưu ngay
                              </button>
                            </div>
                          )}
                          {(!status || status === 'idle') && <span className="text-[10px] text-slate-400 font-semibold">—</span>}

                          <div className="flex gap-2.5 justify-center border-t border-slate-100 pt-1 w-full">
                            {onEdit && (
                              <button onClick={() => handleEditClick(item)} className="text-teal-600 hover:text-teal-800 font-bold text-[10px]" title="Chỉnh sửa hồ sơ">
                                Sửa
                              </button>
                            )}
                            {onDelete && (
                              <button onClick={() => onDelete(item.patientId)} className="text-red-500 hover:text-red-700 font-bold text-[10px]" title="Xóa lịch hẹn">
                                Xóa
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalFiltered={pagination.totalFiltered}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        />
      </div>
    </div>
  );
}
