'use strict';

import React from 'react';
import { Search } from 'lucide-react';

interface BhytFilterBarProps {
  q: string;
  setQ: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  callFilter: string;
  setCallFilter: (v: string) => void;
  renewFilter: string;
  setRenewFilter: (v: string) => void;
  selectedIds: string[];
  onBulkUpdate: (field: string, val: string) => void;
  onBulkDelete: () => void;
}

export default function BhytFilterBar({
  q,
  setQ,
  statusFilter,
  setStatusFilter,
  callFilter,
  setCallFilter,
  renewFilter,
  setRenewFilter,
  selectedIds,
  onBulkUpdate,
  onBulkDelete
}: BhytFilterBarProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tìm nhanh khách hàng</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tên, Số điện thoại, Mã..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Thời hạn thẻ BHYT</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
          >
            <option value="">Tất cả thời hạn</option>
            <option value="expired">Đã quá hạn (hết hạn)</option>
            <option value="30">Hết hạn trong 30 ngày</option>
            <option value="60">Hết hạn trong 60 ngày</option>
            <option value="90">Hết hạn trong 90 ngày</option>
            <option value="ok">Thời hạn an toàn (&gt;90 ngày)</option>
            <option value="missing">Hồ sơ thiếu hạn thẻ</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cần liên hệ (Call)</label>
          <select
            value={callFilter}
            onChange={(e) => setCallFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
          >
            <option value="">Tất cả</option>
            <option value="Có">Có</option>
            <option value="Không">Không</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Loại gia hạn</label>
          <select
            value={renewFilter}
            onChange={(e) => setRenewFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
          >
            <option value="">Tất cả</option>
            <option value="Gia hạn mới">Gia hạn mới</option>
            <option value="Đổi thẻ">Đổi thẻ</option>
            <option value="Tăng mới">Tăng mới</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-teal-50/50 border border-teal-150 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <span className="text-xs font-bold text-teal-800">
            Đã chọn {selectedIds.length} khách hàng BHYT
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onBulkUpdate('contactStatus', 'Đã liên hệ')}
              className="bg-white border border-teal-200 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-teal-100/50"
            >
              Đánh dấu Đã liên hệ
            </button>
            <button
              onClick={() => onBulkUpdate('needCall', 'Không')}
              className="bg-white border border-teal-200 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-teal-100/50"
            >
              Bỏ cần liên hệ
            </button>
            <button
              onClick={onBulkDelete}
              className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100"
            >
              Xóa các khách hàng chọn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
