'use client';

import React from 'react';
import { Search, Trash2 } from 'lucide-react';
import { TheXanhCustomerData } from '@/services/TheXanhService';

interface TheXanhListProps {
  items: TheXanhCustomerData[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedIds: string[];
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onEdit: (item: TheXanhCustomerData) => void;
  onDelete: (id: string) => void;
  onBulkDelete: () => void;
}

export default function TheXanhList({
  items,
  loading,
  searchTerm,
  onSearchChange,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onEdit,
  onDelete,
  onBulkDelete
}: TheXanhListProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-md relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên khách, mã thẻ, địa chỉ, công ty..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500 bg-white"
          />
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={onBulkDelete}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Xóa ({selectedIds.length}) mục đã chọn
          </button>
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
                <th className="w-20 text-center">Mã Code</th>
                <th className="pl-4">Họ và tên</th>
                <th className="w-24 text-center">Năm sinh</th>
                <th className="w-24 text-center">Giới tính</th>
                <th className="pl-4">Hiện cư ngụ</th>
                <th className="pl-4">Đơn vị</th>
                <th className="w-32 text-center">Ngày khám</th>
                <th className="w-28 text-center">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-20 text-slate-450 font-bold">
                    Đang truy vấn database...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-20 text-slate-400 font-bold">
                    Không tìm thấy dữ liệu thẻ xanh sức khỏe nào.
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
                    <td className="text-center text-slate-400 font-bold">{item.code}</td>
                    <td className="pl-4 font-bold text-slate-800">{item.name}</td>
                    <td className="text-center text-slate-600">{item.birthYear}</td>
                    <td className="text-center text-slate-500">{item.gender}</td>
                    <td className="pl-4 text-slate-500 truncate max-w-xs">{item.address}</td>
                    <td className="pl-4 text-slate-600 font-semibold">{item.unit}</td>
                    <td className="text-center text-slate-500">{item.examDate}</td>
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
