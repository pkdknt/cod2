'use client';

import React from 'react';
import { Search, Trash2, Download } from 'lucide-react';
import { MedicalRecordData } from '@/services/MedicalRecordService';

interface MedicalRecordListProps {
  items: MedicalRecordData[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  recordTypeFilter: string;
  onRecordTypeFilterChange: (val: string) => void;
  selectedIds: string[];
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onEdit: (item: MedicalRecordData) => void;
  onDelete: (id: string) => void;
  onBulkDelete: () => void;
  onBulkExport?: () => void;
}

export default function MedicalRecordList({
  items,
  loading,
  searchTerm,
  onSearchChange,
  recordTypeFilter,
  onRecordTypeFilterChange,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onEdit,
  onDelete,
  onBulkDelete,
  onBulkExport
}: MedicalRecordListProps) {

  const getRecordTypeName = (type: string) => {
    switch (type) {
      case 'ngoai-tru': return 'Bìa Ngoại trú';
      case 'bia-rhm': return 'Bìa Răng Hàm Mặt';
      case 'rhm': return 'Bệnh án Răng Hàm Mặt';
      case 'yhct': return 'Bìa Y học cổ truyền';
      default: return type;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 gap-2 flex-wrap max-w-2xl">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên bệnh nhân, số hồ sơ, số lưu trữ, BHYT, CCCD..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500 bg-white"
            />
          </div>
          <select
            value={recordTypeFilter}
            onChange={(e) => onRecordTypeFilterChange(e.target.value)}
            className="rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none w-48"
          >
            <option value="">Tất cả loại bệnh án</option>
            <option value="ngoai-tru">Bìa Ngoại trú</option>
            <option value="bia-rhm">Bìa Răng Hàm Mặt</option>
            <option value="rhm">Bệnh án Răng Hàm Mặt</option>
            <option value="yhct">Bìa Y học cổ truyền</option>
          </select>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {onBulkExport && (
              <button
                onClick={onBulkExport}
                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition-colors"
              >
                <Download className="h-4 w-4" /> Xuất PDF ({selectedIds.length})
              </button>
            )}
            <button
              onClick={onBulkDelete}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Xóa ({selectedIds.length}) mục đã chọn
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-teal-50/50 text-teal-800 font-bold h-11 border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <th className="w-12 text-center pl-4">
                  <input
                    type="checkbox"
                    onChange={onSelectAll}
                    checked={items.length > 0 && selectedIds.length === items.length}
                  />
                </th>
                <th className="w-20 text-center">Số ngoại trú</th>
                <th className="w-20 text-center">Số lưu trữ</th>
                <th className="w-32 text-center">Loại bệnh án</th>
                <th className="pl-4">Họ và tên</th>
                <th className="w-20 text-center">Giới tính</th>
                <th className="w-24 text-center">Năm sinh</th>
                <th className="w-32 text-center">Số thẻ BHYT</th>
                <th className="w-32 text-center">Ngày vào viện</th>
                <th className="w-28 text-center">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-20 text-slate-450 font-bold">
                    Đang truy vấn database...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-20 text-slate-400 font-bold">
                    Không tìm thấy dữ liệu hồ sơ bệnh án nào.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100 h-11 hover:bg-slate-50 transition-colors">
                    <td className="text-center pl-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item._id as string)}
                        onChange={(e) => onSelectRow(item._id as string, e.target.checked)}
                      />
                    </td>
                    <td className="text-center text-slate-400 font-bold">{item.soNgoaiTru || '-'}</td>
                    <td className="text-center text-slate-400 font-bold">{item.soLuuTru || '-'}</td>
                    <td className="text-center">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-50 border border-teal-200 text-teal-700">
                        {getRecordTypeName(item.recordType)}
                      </span>
                    </td>
                    <td className="pl-4 font-bold text-slate-800">{item.hoTen}</td>
                    <td className="text-center text-slate-600">{item.gioiTinh}</td>
                    <td className="text-center text-slate-500">{item.namSinh}</td>
                    <td className="text-center font-mono text-slate-600">{item.soTheBHYT}</td>
                    <td className="text-center text-slate-500">{item.denKhamLuc}</td>
                    <td className="text-center space-x-2.5">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-teal-600 hover:text-teal-800 font-bold"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => onDelete(item._id!)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
