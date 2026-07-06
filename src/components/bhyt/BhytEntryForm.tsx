'use strict';

import React from 'react';
import { BhytCustomerData } from '@/services/BhytService';

interface BhytEntryFormProps {
  formState: BhytCustomerData;
  setFormState: React.Dispatch<React.SetStateAction<BhytCustomerData>>;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  editingId: string | null;
  autoSaveStatus: string;
}

export default function BhytEntryForm({
  formState,
  setFormState,
  onSubmit,
  onReset,
  editingId,
  autoSaveStatus
}: BhytEntryFormProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
          {editingId ? 'Cập nhật thông tin khách hàng' : 'Ghi nhận khách hàng BHYT mới'}
        </h3>
        {autoSaveStatus && (
          <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold border border-teal-100 animate-pulse">
            {autoSaveStatus}
          </span>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-500 mb-1">Họ tên khách hàng *</label>
          <input
            type="text"
            required
            placeholder="Họ và tên..."
            value={formState.name || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Mã BHXH / Số thẻ *</label>
          <input
            type="text"
            required
            placeholder="Số thẻ / Mã BHXH..."
            value={formState.bhxh || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, bhxh: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Số CCCD</label>
          <input
            type="text"
            value={formState.cccd || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, cccd: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Ngày sinh (dd/mm/yyyy)</label>
          <input
            type="text"
            placeholder="dd/mm/yyyy"
            value={formState.dob || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, dob: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Giới tính</label>
          <select
            value={formState.gender || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, gender: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
          >
            <option value=""></option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Nơi khai sinh</label>
          <input
            type="text"
            value={formState.birthPlace || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, birthPlace: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-500 mb-1">ĐKKCB ban đầu</label>
          <input
            type="text"
            placeholder="Nơi đăng ký khám chữa bệnh..."
            value={formState.kcb || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, kcb: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Ngày biên lai (dd/mm/yyyy)</label>
          <input
            type="text"
            placeholder="dd/mm/yyyy"
            value={formState.receiptDate || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, receiptDate: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Số biên lai</label>
          <input
            type="text"
            value={formState.receiptNo || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, receiptNo: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Số tiền đóng</label>
          <input
            type="text"
            value={formState.amount || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Tiền hỗ trợ</label>
          <input
            type="text"
            value={formState.support || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, support: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Số tháng đóng</label>
          <input
            type="text"
            value={formState.months || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, months: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Mã nhân viên thu</label>
          <input
            type="text"
            value={formState.staffCode || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, staffCode: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Số điện thoại</label>
          <input
            type="text"
            value={formState.phone || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Hạn thẻ BHYT (dd/mm/yyyy)</label>
          <input
            type="text"
            placeholder="dd/mm/yyyy"
            value={formState.expiry || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, expiry: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Cần liên hệ (Call)</label>
          <select
            value={formState.needCall || 'Có'}
            onChange={(e) => setFormState(prev => ({ ...prev, needCall: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
          >
            <option value="Có">Có</option>
            <option value="Không">Không</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Loại gia hạn</label>
          <select
            value={formState.renewType || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, renewType: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
          >
            <option value=""></option>
            <option value="Gia hạn mới">Gia hạn mới</option>
            <option value="Đổi thẻ">Đổi thẻ</option>
            <option value="Tăng mới">Tăng mới</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Ngày gọi nhắc (dd/mm/yyyy)</label>
          <input
            type="text"
            placeholder="dd/mm/yyyy"
            value={formState.callDate || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, callDate: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Mối quan hệ chủ thẻ</label>
          <input
            type="text"
            value={formState.relation || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, relation: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Trạng thái liên hệ</label>
          <select
            value={formState.contactStatus || 'Chưa liên hệ'}
            onChange={(e) => setFormState(prev => ({ ...prev, contactStatus: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
          >
            <option value="Chưa liên hệ">Chưa liên hệ</option>
            <option value="Đang liên hệ">Đang liên hệ</option>
            <option value="Đã liên hệ">Đã liên hệ</option>
            <option value="Sai số / Không liên lạc được">Sai số / Không liên lạc được</option>
          </select>
        </div>

        <div className="sm:col-span-2 md:col-span-4 lg:col-span-6">
          <label className="block text-xs font-bold text-slate-500 mb-1">Ghi chú CSKH</label>
          <textarea
            value={formState.note || ''}
            onChange={(e) => setFormState(prev => ({ ...prev, note: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 p-2 text-xs font-medium outline-none focus:border-teal-500 min-h-[50px] resize-y"
          />
        </div>

        <div className="sm:col-span-2 md:col-span-4 lg:col-span-6 flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Hủy / Nhập mới
          </button>
          <button
            type="submit"
            className="rounded-xl bg-teal-650 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-600 transition-colors"
          >
            {editingId ? 'Cập nhật' : 'Lưu hồ sơ'}
          </button>
        </div>
      </form>
    </div>
  );
}
