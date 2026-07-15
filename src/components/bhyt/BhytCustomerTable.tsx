'use client';

import React from 'react';
import { Search, ChevronLeft, ChevronRight, Edit3, MessageSquare, PhoneCall, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { BhytCustomerData } from '@/services/BhytService';
import { getDaysRemaining, formatVnDate, parseVnDate } from '@/lib/utils';

interface BhytCustomerTableProps {
  customers: BhytCustomerData[];
  loading: boolean;
  q: string;
  onSearchChange: (val: string) => void;
  expiryFilter: string;
  onExpiryFilterChange: (val: string) => void;
  workflowFilter: string;
  onWorkflowFilterChange: (val: string) => void;
  phoneFilter: string;
  onPhoneFilterChange: (val: string) => void;
  onClearFilters: () => void;
  
  // Sorting
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  
  // Pagination
  page: number;
  pageSize: number;
  totalFiltered: number;
  onPageChange: (val: number) => void;

  // Actions
  onEdit: (customer: BhytCustomerData) => void;
  onDelete: (id: string) => void;
  onSendMessage: (customer: BhytCustomerData) => void;
  onCall: (customer: BhytCustomerData) => void;
}

export default function BhytCustomerTable({
  customers,
  loading,
  q,
  onSearchChange,
  expiryFilter,
  onExpiryFilterChange,
  workflowFilter,
  onWorkflowFilterChange,
  phoneFilter,
  onPhoneFilterChange,
  onClearFilters,
  sortBy,
  sortDir,
  onSort,
  page,
  pageSize,
  totalFiltered,
  onPageChange,
  onEdit,
  onDelete,
  onSendMessage,
  onCall
}: BhytCustomerTableProps) {
  const pages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  const renderSortIcon = (key: string) => {
    if (sortBy !== key) {
      return <ArrowUpDown className="inline-block ml-1.5 h-3.5 w-3.5 opacity-40 text-slate-400" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="inline-block ml-1.5 h-3.5 w-3.5 text-teal-600 font-bold" />
    ) : (
      <ArrowDown className="inline-block ml-1.5 h-3.5 w-3.5 text-teal-600 font-bold" />
    );
  };

  const getBadgeClass = (expiryStr: string | undefined) => {
    const days = getDaysRemaining(expiryStr);
    if (days === null) return 'bg-slate-100 text-slate-700';
    if (days < 0) return 'bg-red-50 text-red-700 border border-red-100';
    if (days <= 15) return 'bg-amber-50 text-amber-700 border border-amber-100';
    if (days <= 30) return 'bg-blue-50 text-blue-700 border border-blue-100';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  };

  const getBadgeLabel = (expiryStr: string | undefined) => {
    const days = getDaysRemaining(expiryStr);
    if (days === null) return 'Chưa có hạn';
    if (days < 0) return 'Đã hết hạn';
    if (days <= 15) return 'Còn ≤ 15 ngày';
    if (days <= 30) return 'Còn 16–30 ngày';
    return 'Còn hiệu lực';
  };

  const getDaysRemainingText = (expiryStr: string | undefined) => {
    const days = getDaysRemaining(expiryStr);
    if (days === null) return 'Chưa xác định';
    if (days < 0) return `${days}`;
    if (days === 0) return 'Hết hạn hôm nay';
    return `Còn ${days} ngày`;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã BHXH, CCCD..."
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
          />
        </div>

        <select
          value={expiryFilter}
          onChange={(e) => onExpiryFilterChange(e.target.value)}
          className="text-sm rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-500 bg-white font-semibold text-slate-700"
        >
          <option value="">Tất cả hạn thẻ</option>
          <option value="expired">Đã hết hạn</option>
          <option value="due15">Còn ≤ 15 ngày</option>
          <option value="due30">Còn 16–30 ngày</option>
          <option value="active">Còn hiệu lực</option>
          <option value="unknown">Chưa có hạn thẻ</option>
        </select>

        <select
          value={workflowFilter}
          onChange={(e) => onWorkflowFilterChange(e.target.value)}
          className="text-sm rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-500 bg-white font-semibold text-slate-700"
        >
          <option value="">Tất cả xử lý</option>
          <option value="Chưa liên hệ">Chưa liên hệ</option>
          <option value="Đã gửi tin">Đã gửi tin</option>
          <option value="Đã gọi">Đã gọi</option>
          <option value="Hẹn liên hệ lại">Hẹn liên hệ lại</option>
          <option value="Đã gia hạn">Đã gia hạn</option>
          <option value="Không liên lạc được">Không liên lạc được</option>
          <option value="Không có nhu cầu">Không có nhu cầu</option>
        </select>

        <select
          value={phoneFilter}
          onChange={(e) => onPhoneFilterChange(e.target.value)}
          className="text-sm rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-500 bg-white font-semibold text-slate-700"
        >
          <option value="">Tất cả số điện thoại</option>
          <option value="has">Có số điện thoại</option>
          <option value="missing">Thiếu số điện thoại</option>
        </select>

        <button
          onClick={onClearFilters}
          className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative max-h-[60vh] scrollbar-thin">
          <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold h-11">
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('name')}>
                  Khách hàng {renderSortIcon('name')}
                </th>
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('bhxh')}>
                  Mã BHXH {renderSortIcon('bhxh')}
                </th>
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('phone')}>
                  Điện thoại {renderSortIcon('phone')}
                </th>
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('kcb')}>
                  Nơi KCB ban đầu {renderSortIcon('kcb')}
                </th>
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('expiry')}>
                  Hạn thẻ {renderSortIcon('expiry')}
                </th>
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('days')}>
                  Còn lại {renderSortIcon('days')}
                </th>
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('workflow')}>
                  Xử lý {renderSortIcon('workflow')}
                </th>
                <th className="px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-20 text-slate-500 font-bold text-sm">
                    Đang tải dữ liệu khách hàng...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-20 text-slate-400 font-bold text-sm">
                    Không tìm thấy khách hàng phù hợp
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors h-11">
                    <td className="px-4 font-bold text-slate-800">
                      <div>{cust.name}</div>
                      {cust.dob && (
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {cust.gender || ''} {cust.dob ? `· ${cust.dob}` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-4 font-mono font-medium text-slate-600">{cust.bhxh}</td>
                    <td className="px-4 font-bold text-slate-700">
                      {cust.phone ? (
                        <a href={`tel:${cust.phone}`} className="text-teal-600 hover:underline">
                          {cust.phone}
                        </a>
                      ) : (
                        <span className="text-slate-300 font-medium">Chưa có</span>
                      )}
                    </td>
                    <td className="px-4 text-slate-600 max-w-[240px] truncate" title={cust.kcb}>
                      {cust.kcb || '—'}
                    </td>
                    <td className="px-4">
                      <div className="font-bold text-slate-700">{cust.expiry || '—'}</div>
                      <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-bold mt-1 ${getBadgeClass(cust.expiry)}`}>
                        {getBadgeLabel(cust.expiry)}
                      </span>
                    </td>
                    <td className="px-4 font-semibold text-slate-700">{getDaysRemainingText(cust.expiry)}</td>
                    <td className="px-4">
                      <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {cust.workflowStatus || 'Chưa liên hệ'}
                      </span>
                    </td>
                    <td className="px-4 text-center">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          onClick={() => onEdit(cust)}
                          title="Sửa thông tin"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 text-slate-600 transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onSendMessage(cust)}
                          title="Sao chép tin nhắn"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onCall(cust)}
                          title="Gọi điện thoại"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-600 transition-colors"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(cust._id!)}
                          title="Xóa khách hàng"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-bold">
          <span>
            {totalFiltered > 0
              ? `Hiển thị ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalFiltered)} / ${totalFiltered} khách`
              : '0 khách'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3">Trang {page} / {pages}</span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
