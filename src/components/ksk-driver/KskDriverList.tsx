'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { KskDriverExamData } from '@/services/KskDriverService';

interface KskDriverListProps {
  patients: KskDriverExamData[];
  loading: boolean;
  totalItems: number;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onEdit: (item: KskDriverExamData) => void;
  onDelete: (id: string) => void;
}

export default function KskDriverList({
  patients,
  loading,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete
}: KskDriverListProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="max-w-md relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên bệnh nhân, số phiếu, CCCD..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500 bg-white"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-teal-50/50 text-teal-800 font-bold h-11 border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <th className="w-14 text-center pl-4">STT</th>
                <th className="w-16 text-center">Số phiếu</th>
                <th className="pl-4">Họ và tên</th>
                <th className="w-24 text-center">Giới tính</th>
                <th className="w-32 text-center">Ngày sinh</th>
                <th className="w-36 text-center">CCCD</th>
                <th className="w-28 text-center">Hạng lái xe</th>
                <th className="pl-4">Địa chỉ hộ khẩu</th>
                <th className="w-32 text-center">Ngày khám</th>
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
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-20 text-slate-400 font-bold">
                    Không tìm thấy hồ sơ sức khỏe lái xe nào.
                  </td>
                </tr>
              ) : (
                patients.map((item, index) => (
                  <tr key={item._id} className="border-b border-slate-100 h-11 hover:bg-slate-50 transition-colors">
                    <td className="text-center pl-4 text-slate-400 font-bold">{index + 1}</td>
                    <td className="text-center text-slate-450 font-bold">{item.soPhieu}</td>
                    <td className="pl-4 font-bold text-slate-800">{item.hoTen}</td>
                    <td className="text-center text-slate-600">{item.gioiTinh}</td>
                    <td className="text-center text-slate-500">{item.ngaySinh}</td>
                    <td className="text-center font-mono text-slate-600">{item.cccd}</td>
                    <td className="text-center font-bold text-teal-800">{item.hangLaiXe}</td>
                    <td className="pl-4 text-slate-500 truncate max-w-xs">{item.hoKhau}</td>
                    <td className="text-center text-slate-500">{item.ngayKham}</td>
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
