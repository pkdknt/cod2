'use client';

import React from 'react';
import { Search, Copy, Edit3, MessageSquare, PhoneCall, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { BhytCustomerData } from '@/services/BhytService';
import { getDaysRemaining, formatVnDate } from '@/lib/utils';

interface BhytRenewalListProps {
  customers: BhytCustomerData[];
  loading: boolean;
  q: string;
  onSearchChange: (val: string) => void;
  renewalScope: string;
  onScopeChange: (val: string) => void;
  workflowFilter: string;
  onWorkflowFilterChange: (val: string) => void;
  phoneFilter: string;
  onPhoneFilterChange: (val: string) => void;
  
  // Sorting
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;

  // Actions
  onCopyPhones: () => void;
  onEdit: (customer: BhytCustomerData) => void;
  onSendMessage: (customer: BhytCustomerData) => void;
  onCall: (customer: BhytCustomerData) => void;
}

export default function BhytRenewalList({
  customers,
  loading,
  q,
  onSearchChange,
  renewalScope,
  onScopeChange,
  workflowFilter,
  onWorkflowFilterChange,
  phoneFilter,
  onPhoneFilterChange,
  sortBy,
  sortDir,
  onSort,
  onCopyPhones,
  onEdit,
  onSendMessage,
  onCall
}: BhytRenewalListProps) {

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
    if (days < 0) return `Quá ${Math.abs(days)} ngày`;
    if (days === 0) return 'Hết hạn hôm nay';
    return `Còn ${days} ngày`;
  };

  return (
    <div className="space-y-4">
      {/* Header action with Copy button */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-wrap gap-3">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Danh sách nhắc gia hạn</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Ưu tiên liên hệ khách hàng sắp hoặc đã quá hạn</p>
        </div>
        <button
          onClick={onCopyPhones}
          className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition-colors shadow-sm"
        >
          <Copy className="h-4 w-4" /> Sao chép danh sách SĐT
        </button>
      </div>

      {/* Filter Options */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm khách cần nhắc..."
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
          />
        </div>

        <select
          value={renewalScope}
          onChange={(e) => onScopeChange(e.target.value)}
          className="text-sm rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-500 bg-white font-semibold text-slate-700"
        >
          <option value="priority">Ưu tiên: hết hạn + ≤15 ngày</option>
          <option value="expired">Chỉ đã hết hạn</option>
          <option value="due15">Chỉ còn ≤15 ngày</option>
          <option value="due30_all">Cả nhóm ≤30 ngày</option>
          <option value="all">Tất cả hồ sơ có hạn thẻ</option>
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
      </div>

      {/* Renewal Queue Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative max-h-[64vh] scrollbar-thin">
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
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('expiry')}>
                  Hạn thẻ {renderSortIcon('expiry')}
                </th>
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('days')}>
                  Còn lại {renderSortIcon('days')}
                </th>
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('workflow')}>
                  Xử lý {renderSortIcon('workflow')}
                </th>
                <th className="px-4 text-left">Ghi chú</th>
                <th className="px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-20 text-slate-500 font-bold text-sm">
                    Đang tải danh sách nhắc gia hạn...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-20 text-slate-400 font-bold text-sm">
                    Không tìm thấy hồ sơ nhắc gia hạn nào phù hợp
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors h-11">
                    <td className="px-4 font-bold text-slate-800">
                      <div>{cust.name}</div>
                      <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-bold mt-1 ${getBadgeClass(cust.expiry)}`}>
                        {getBadgeLabel(cust.expiry)}
                      </span>
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
                    <td className="px-4 font-bold text-slate-700">{cust.expiry || '—'}</td>
                    <td className="px-4 font-semibold text-slate-700">{getDaysRemainingText(cust.expiry)}</td>
                    <td className="px-4">
                      <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {cust.workflowStatus || 'Chưa liên hệ'}
                      </span>
                    </td>
                    <td className="px-4 text-slate-600 max-w-[200px] truncate" title={cust.note}>
                      {cust.note || '—'}
                    </td>
                    <td className="px-4 text-center">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          onClick={() => onSendMessage(cust)}
                          title="Sao chép tin nhắn"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onCall(cust)}
                          title="Gọi điện"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-600 transition-colors"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onEdit(cust)}
                          title="Sửa thông tin"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 text-slate-600 transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
