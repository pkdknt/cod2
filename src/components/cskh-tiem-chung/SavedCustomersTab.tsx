'use client';

import React, { useMemo, useRef, useState } from 'react';
import { RotateCcw, Search, Trash2 } from 'lucide-react';
import { DATA } from '@/lib/vaccineData';
import { toUpperNoAccent } from '@/lib/format';
import { applyCellStyle, loadXLSX, THIN_BORDER, writeSheet } from '@/lib/excel';
import Pagination from '@/components/ui/Pagination';
import type { useSavedSchedules } from '@/hooks/useSavedSchedules';
import type { PatientRecord } from '@/lib/types';

interface SavedCustomersTabProps {
  list: ReturnType<typeof useSavedSchedules>;
  onEdit: (item: PatientRecord) => void;
  onDelete: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onDeleteAll: () => void;
}

export default function SavedCustomersTab({
  list,
  onEdit,
  onDelete,
  onDeleteSelected,
  onDeleteAll,
}: SavedCustomersTabProps) {
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const deleteAllTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleDeleteAllLock = () => {
    if (deleteAllTimerRef.current) clearTimeout(deleteAllTimerRef.current);
    const next = !showDeleteAll;
    setShowDeleteAll(next);
    if (next) deleteAllTimerRef.current = setTimeout(() => setShowDeleteAll(false), 5000);
  };

  const handleExportSelected = async () => {
    const selectedData = list.items
      .filter((item) => list.selectedIds.includes(item._id))
      .map((item) => ({
        'Họ tên': item.patientName,
        'Số điện thoại': item.phone || '',
        'Ngày sinh': item.dob || '',
        'Vắc xin': item.vaccine,
      }));

    const XLSX = await loadXLSX();
    const ws = XLSX.utils.json_to_sheet(selectedData);

    applyCellStyle(XLSX, ws, (R, C) => ({
      border: THIN_BORDER,
      font: { name: 'Arial', sz: 10, bold: R === 0 },
      alignment: {
        horizontal: R === 0 || C === 0 || C === 2 || C === 3 ? 'center' : 'left',
        vertical: 'center',
      },
      ...(R === 0 ? { fill: { fgColor: { rgb: 'F2F2F2' } } } : {}),
    }));

    writeSheet(XLSX, {
      ws,
      sheetName: 'Danh_Sach_Tiem',
      fileName: 'DanhSachGuiTinNhan.xlsx',
    });
    alert('Đã xuất file Excel thành công!');
  };

  const items = useMemo(() => {
    if (list.sortKey !== 'progress') return list.items;
    const dir = list.sortDirection === 'asc' ? 1 : -1;
    return [...list.items].sort((a, b) => {
      const aCount = a.dates ? a.dates.filter((d) => d !== '').length : 0;
      const bCount = b.dates ? b.dates.filter((d) => d !== '').length : 0;
      return (aCount - bCount) * dir;
    });
  }, [list.items, list.sortKey, list.sortDirection]);

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      {/* Quick Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm shrink-0">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tìm nhanh</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tên, Số điện thoại..."
                value={list.qSearch}
                onChange={(e) => list.setQSearch(e.target.value)}
                className="w-full pl-9 rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
              />
            </div>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Lọc loại Vắc xin</label>
            <select
              value={list.filterVaccine}
              onChange={(e) => list.setFilterVaccine(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
            >
              <option value="">Tất cả</option>
              {DATA.vaccines.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          {(list.qSearch || list.filterVaccine) && (
            <div className="shrink-0">
              <button
                onClick={() => {
                  list.setQSearch('');
                  list.setFilterVaccine('');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors"
                title="Reset toàn bộ bộ lọc danh sách"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Database Table view */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px] md:min-h-0">
        <div className="px-5 py-3 border-b border-slate-100 shrink-0 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full">
            Tổng cộng {list.pagination.totalFiltered} hồ sơ theo dõi
          </span>
          {items.length > 0 && (
            <div className="flex items-center gap-1.5">
              {showDeleteAll ? (
                <button
                  onClick={onDeleteAll}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer animate-pulse"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Xóa Toàn Bộ Danh Sách
                </button>
              ) : null}
              <button
                title={showDeleteAll ? 'Khóa lại nút xóa' : 'Mở khóa để hiện nút Xóa Toàn Bộ'}
                onClick={toggleDeleteAllLock}
                className={`inline-flex items-center justify-center rounded-lg border px-2 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  showDeleteAll
                    ? 'border-red-300 bg-red-100 text-red-600 hover:bg-red-200'
                    : 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }`}
              >
                {showDeleteAll ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-slate-200 min-h-0">
          {list.selectedIds.length > 0 && (
            <div className="mb-3 px-6 py-2 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-teal-800">Đã chọn {list.selectedIds.length} hồ sơ</span>
              <div className="flex gap-2">
                <button
                  onClick={handleExportSelected}
                  className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-500 transition-colors"
                >
                  Xuất Excel
                </button>
                <button
                  onClick={() => onDeleteSelected(list.selectedIds)}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500 transition-colors"
                >
                  Xóa đã chọn
                </button>
              </div>
            </div>
          )}
          <table className="w-full text-xs text-left border-collapse border border-slate-200 relative">
            <thead className="sticky top-0 z-30 shadow-sm bg-slate-50">
              <tr className="bg-slate-50 text-slate-700 font-bold h-10 border-b border-slate-200 uppercase text-[10px]">
                <th className="pl-4 border border-slate-200 sticky top-0 left-0 z-40 bg-slate-50" style={{ minWidth: '40px', maxWidth: '40px' }}>
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    checked={items.length > 0 && list.selectedIds.length === items.length}
                    onChange={(e) => {
                      if (e.target.checked) list.setSelectedIds(items.map((item) => item._id));
                      else list.setSelectedIds([]);
                    }}
                  />
                </th>
                <th className="text-center border border-slate-200 sticky top-0 z-40 bg-slate-50" style={{ left: '40px', minWidth: '48px', maxWidth: '48px' }}>STT</th>
                <th className="pl-4 border border-slate-200 py-2 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-20 bg-slate-50" onClick={() => list.requestSort('name')}>
                  <div className="flex items-center gap-1">Họ tên người tiêm {list.renderSortIcon('name')}</div>
                </th>
                <th className="pl-4 border border-slate-200 py-2 sticky top-0 z-20 bg-slate-50" style={{ minWidth: '140px' }}>
                  <div className="flex items-center gap-1 text-slate-500">Họ tên không dấu</div>
                </th>
                <th className="w-28 text-center border border-slate-200 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-20 bg-slate-50" onClick={() => list.requestSort('phone')}>
                  <div className="flex items-center justify-center gap-1">Điện thoại {list.renderSortIcon('phone')}</div>
                </th>
                <th className="w-28 text-center border border-slate-200 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-20 bg-slate-50" onClick={() => list.requestSort('dob')}>
                  <div className="flex items-center justify-center gap-1">Ngày sinh {list.renderSortIcon('dob')}</div>
                </th>
                <th className="w-32 text-center border border-slate-200 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-20 bg-slate-50" onClick={() => list.requestSort('vaccine')}>
                  <div className="flex items-center justify-center gap-1">Vắc xin theo dõi {list.renderSortIcon('vaccine')}</div>
                </th>
                <th className="w-44 pl-4 border border-slate-200 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-20 bg-slate-50" onClick={() => list.requestSort('protocol')}>
                  <div className="flex items-center gap-1">Phác đồ áp dụng {list.renderSortIcon('protocol')}</div>
                </th>
                <th className="w-40 text-center border border-slate-200 cursor-pointer select-none group hover:bg-slate-100 hover:text-slate-700 transition-colors sticky top-0 z-20 bg-slate-50" onClick={() => list.requestSort('progress')}>
                  <div className="flex items-center justify-center gap-1">Tiến độ tiêm gần nhất {list.renderSortIcon('progress')}</div>
                </th>
                <th className="w-24 text-center border border-slate-200 sticky top-0 z-20 bg-slate-50">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-20 text-slate-400 font-bold border border-slate-200">
                    {list.loading ? 'Đang tải...' : 'Không tìm thấy hồ sơ theo dõi tiêm chủng nào.'}
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const actualDoseCount = item.dates ? item.dates.filter((d) => d !== '').length : 0;

                  return (
                    <tr key={item._id} className="group border-b border-slate-100 h-10 bg-white hover:bg-slate-50 transition-colors">
                      <td className="pl-4 text-center border border-slate-200 sticky left-0 z-10 bg-white group-hover:bg-slate-50" style={{ minWidth: '40px', maxWidth: '40px' }}>
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          checked={list.selectedIds.includes(item._id)}
                          onChange={(e) => {
                            if (e.target.checked) list.setSelectedIds((prev) => [...prev, item._id]);
                            else list.setSelectedIds((prev) => prev.filter((id) => id !== item._id));
                          }}
                        />
                      </td>
                      <td className="text-center text-slate-400 font-bold border border-slate-200 sticky z-10 bg-white group-hover:bg-slate-50" style={{ left: '40px', minWidth: '48px', maxWidth: '48px' }}>
                        {(list.pagination.page - 1) * list.pageSize + index + 1}
                      </td>
                      <td className="pl-4 font-bold text-slate-800 border border-slate-200 py-1.5">
                        {item.patientCode && <div className="text-[10px] text-teal-600 mb-0.5">{item.patientCode}</div>}
                        {item.patientName}
                        {item.address && <div className="text-[9px] text-slate-400 font-normal mt-0.5 max-w-[120px] truncate">{item.address}</div>}
                      </td>
                      <td className="pl-4 font-semibold text-slate-500 border border-slate-200 py-1.5 tracking-wide text-[11px]">
                        {toUpperNoAccent(item.patientName || '')}
                      </td>
                      <td className="text-center text-slate-650 font-semibold border border-slate-200">{item.phone || 'Chưa có'}</td>
                      <td className="text-center text-slate-500 border border-slate-200">{item.dob || ''}</td>
                      <td className="text-center font-bold text-teal-800 bg-teal-50/10 border border-slate-200">{item.vaccine}</td>
                      <td className="pl-4 text-slate-500 text-[11px] truncate max-w-xs border border-slate-200" title={item.protocolId}>
                        {DATA.protocols.find((proto) => proto.id === item.protocolId)?.object || item.protocolId}
                      </td>
                      <td className="text-center border border-slate-200">
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-sky-100 text-sky-800 font-bold">
                          Đã tiêm {actualDoseCount}/6 mũi
                        </span>
                      </td>
                      <td className="text-center space-x-2 border border-slate-200">
                        <button onClick={() => onEdit(item)} className="text-teal-600 hover:text-teal-800 font-bold">
                          Sửa
                        </button>
                        <button onClick={() => onDelete(item._id)} className="text-red-500 hover:text-red-700 font-bold">
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={list.pagination.page}
          totalPages={list.pagination.totalPages}
          totalFiltered={list.pagination.totalFiltered}
          pageSize={list.pageSize}
          onPageChange={list.setPage}
          disabled={list.loading}
        />
      </div>
    </div>
  );
}
