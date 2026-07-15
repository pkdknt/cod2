'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BhytCustomerData } from '@/services/BhytService';

interface BhytCustomerModalProps {
  customer: BhytCustomerData | null; // Null means create new
  onClose: () => void;
  onSave: (data: BhytCustomerData) => void;
}

export default function BhytCustomerModal({ customer, onClose, onSave }: BhytCustomerModalProps) {
  const [formData, setFormData] = useState<Partial<BhytCustomerData>>({
    name: '',
    bhxh: '',
    cccd: '',
    phone: '',
    dob: '',
    gender: '',
    kcb: '',
    birthPlace: '',
    expiry: '',
    callDate: '',
    workflowStatus: 'Chưa liên hệ',
    relation: '',
    note: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        ...customer,
        // Convert to yyyy-mm-dd format if they are in dd/mm/yyyy for HTML5 date inputs
        dob: convertDateToInputFormat(customer.dob),
        expiry: convertDateToInputFormat(customer.expiry),
        callDate: convertDateToInputFormat(customer.callDate),
        workflowStatus: customer.workflowStatus || 'Chưa liên hệ'
      });
    } else {
      setFormData({
        name: '',
        bhxh: '',
        cccd: '',
        phone: '',
        dob: '',
        gender: '',
        kcb: '',
        birthPlace: '',
        expiry: '',
        callDate: '',
        workflowStatus: 'Chưa liên hệ',
        relation: '',
        note: ''
      });
    }
    setErrors({});
  }, [customer]);

  const convertDateToInputFormat = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    // If already in yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // If in dd/mm/yyyy
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };

  const convertDateToDisplayFormat = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    // If in yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handleChange = (field: keyof BhytCustomerData, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Họ và tên là bắt buộc';
    if (!formData.bhxh?.trim()) newErrors.bhxh = 'Mã số BHXH là bắt buộc';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare dates back to standard Vietnamese display format: dd/mm/yyyy
    const preparedData: BhytCustomerData = {
      ...customer, // Keep _id if existing
      name: formData.name!.trim(),
      bhxh: formData.bhxh!.trim(),
      cccd: formData.cccd?.trim() || '',
      phone: formData.phone?.trim() || '',
      dob: convertDateToDisplayFormat(formData.dob),
      gender: formData.gender || '',
      kcb: formData.kcb?.trim() || '',
      birthPlace: formData.birthPlace?.trim() || '',
      expiry: convertDateToDisplayFormat(formData.expiry),
      callDate: convertDateToDisplayFormat(formData.callDate),
      workflowStatus: formData.workflowStatus || 'Chưa liên hệ',
      relation: formData.relation?.trim() || '',
      note: formData.note?.trim() || ''
    };

    onSave(preparedData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">
            {customer ? 'Thông tin khách hàng BHYT' : 'Thêm khách hàng BHYT'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Họ và tên *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.name ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-teal-200'
                } focus:border-teal-500 outline-none focus:ring-2 transition-all`}
                placeholder="Nguyễn Văn A"
              />
              {errors.name && <span className="text-[10px] text-red-500 font-bold block">{errors.name}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Mã số BHXH (Số thẻ) *</label>
              <input
                type="text"
                required
                value={formData.bhxh || ''}
                onChange={(e) => handleChange('bhxh', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-xl border ${
                  errors.bhxh ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-teal-200'
                } focus:border-teal-500 outline-none focus:ring-2 transition-all`}
                placeholder="GD47979..."
              />
              {errors.bhxh && <span className="text-[10px] text-red-500 font-bold block">{errors.bhxh}</span>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">CCCD</label>
              <input
                type="text"
                value={formData.cccd || ''}
                onChange={(e) => handleChange('cccd', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all"
                placeholder="12 chữ số"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Số điện thoại</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all"
                placeholder="09xxx..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Ngày sinh</label>
              <input
                type="date"
                value={formData.dob || ''}
                onChange={(e) => handleChange('dob', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Giới tính</label>
              <select
                value={formData.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all bg-white"
              >
                <option value=""></option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 block">Nơi đăng ký KCB ban đầu</label>
              <input
                type="text"
                value={formData.kcb || ''}
                onChange={(e) => handleChange('kcb', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all"
                placeholder="Bệnh viện huyện Nhà Bè..."
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 block">Nơi đăng ký khai sinh</label>
              <input
                type="text"
                value={formData.birthPlace || ''}
                onChange={(e) => handleChange('birthPlace', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all"
                placeholder="Xã Long Hậu, Huyện Cần Giuộc..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Hạn thẻ đến ngày</label>
              <input
                type="date"
                value={formData.expiry || ''}
                onChange={(e) => handleChange('expiry', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Ngày gọi / liên hệ</label>
              <input
                type="date"
                value={formData.callDate || ''}
                onChange={(e) => handleChange('callDate', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Trạng thái xử lý</label>
              <select
                value={formData.workflowStatus || 'Chưa liên hệ'}
                onChange={(e) => handleChange('workflowStatus', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all bg-white"
              >
                <option value="Chưa liên hệ">Chưa liên hệ</option>
                <option value="Đã gửi tin">Đã gửi tin</option>
                <option value="Đã gọi">Đã gọi</option>
                <option value="Hẹn liên hệ lại">Hẹn liên hệ lại</option>
                <option value="Đã gia hạn">Đã gia hạn</option>
                <option value="Không liên lạc được">Không liên lạc được</option>
                <option value="Không có nhu cầu">Không có nhu cầu</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Người quen / người nhà NV</label>
              <input
                type="text"
                value={formData.relation || ''}
                onChange={(e) => handleChange('relation', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 block">Ghi chú</label>
              <textarea
                value={formData.note || ''}
                onChange={(e) => handleChange('note', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all resize-none"
                placeholder="Thêm các thông tin ghi chú..."
              />
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-colors shadow-sm"
            >
              Lưu thông tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
