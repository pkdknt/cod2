'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Download, Image as ImageIcon, Eye, Plus } from 'lucide-react';
import { BhytCustomerData } from '@/services/BhytService';
import { compressImageFile } from '@/lib/utils';
import CccdImageModal from './CccdImageModal';

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
    cccdImage: '',
    cccdImages: [],
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
  const [showZoomModal, setShowZoomModal] = useState<boolean>(false);
  const [zoomIndex, setZoomIndex] = useState<number>(0);

  const convertDateToInputFormat = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
  };

  const convertDateToDisplayFormat = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  /** Helper: merge legacy cccdImage into cccdImages */
  const getAllImages = (data: Partial<BhytCustomerData>): string[] => {
    const imgs = data.cccdImages ? [...data.cccdImages] : [];
    if (data.cccdImage && !imgs.includes(data.cccdImage)) {
      imgs.unshift(data.cccdImage);
    }
    return imgs.filter(Boolean);
  };

  useEffect(() => {
    if (customer) {
      setFormData({
        ...customer,
        cccdImage: customer.cccdImage || '',
        cccdImages: customer.cccdImages || [],
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
        cccdImage: '',
        cccdImages: [],
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
    setShowZoomModal(false);
  }, [customer]);

  const handleChange = (field: keyof BhytCustomerData, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field as string];
        return copy;
      });
    }
  };

  /** Add one or more images to cccdImages array */
  const handleAddImages = async (files: File[]) => {
    if (!files.length) return;
    try {
      const newBase64s = await Promise.all(files.map(f => compressImageFile(f)));
      const existing = getAllImages(formData);
      const merged = [...existing, ...newBase64s].slice(0, 10);
      setFormData(prev => ({ ...prev, cccdImages: merged, cccdImage: merged[0] ?? '' }));
    } catch (err: any) {
      alert('Lỗi xử lý ảnh: ' + (err?.message || 'Không thể đọc file'));
    }
  };

  /** Delete image at index */
  const handleDeleteImage = (index: number) => {
    const existing = getAllImages(formData);
    const updated = existing.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, cccdImages: updated, cccdImage: updated[0] ?? '' }));
    if (showZoomModal && zoomIndex >= updated.length) {
      if (updated.length === 0) setShowZoomModal(false);
      else setZoomIndex(Math.max(0, updated.length - 1));
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

    const allImgs = getAllImages(formData);

    const preparedData: BhytCustomerData = {
      ...customer,
      name: formData.name!.trim(),
      bhxh: formData.bhxh!.trim(),
      cccd: formData.cccd?.trim() || '',
      cccdImages: allImgs,
      cccdImage: allImgs[0] ?? '',
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

  const allImages = getAllImages(formData);

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

            {/* Ảnh thẻ CCCD — multi-image */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600">
                  Ảnh thẻ CCCD
                  {allImages.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold">
                      {allImages.length} ảnh
                    </span>
                  )}
                </label>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                  <Plus className="h-3.5 w-3.5" />
                  <span>{allImages.length > 0 ? 'Thêm ảnh' : 'Tải lên ảnh thẻ CCCD'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files ?? []);
                      await handleAddImages(files);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {allImages.length > 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <div className="flex flex-wrap gap-2">
                    {allImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div
                          onClick={() => { setZoomIndex(idx); setShowZoomModal(true); }}
                          className="w-20 h-14 rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-slate-100 cursor-pointer relative hover:ring-2 hover:ring-teal-400 transition-all"
                          title={`Xem ảnh ${idx + 1} phóng to`}
                        >
                          <img
                            src={img}
                            alt={`Ảnh CCCD ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="h-4 w-4 text-white drop-shadow" />
                          </div>
                          <span className="absolute bottom-0.5 left-0.5 text-[9px] font-bold px-1 rounded bg-black/50 text-white leading-tight pointer-events-none">
                            {idx + 1}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(idx)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition-colors z-10 opacity-0 group-hover:opacity-100"
                          title="Xóa ảnh này"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-2">
                    Click ảnh để xem phóng to · Hover để xóa từng ảnh · Tối đa 10 ảnh
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center gap-2 text-slate-400">
                  <ImageIcon className="h-8 w-8 opacity-40" />
                  <span className="text-xs font-semibold">Chưa có ảnh CCCD · Hỗ trợ JPG, PNG, WEBP</span>
                </div>
              )}
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

        {/* CCCD Image Zoom Modal */}
        {showZoomModal && allImages.length > 0 && (
          <CccdImageModal
            images={allImages}
            customerName={formData.name || 'Khách hàng'}
            bhxh={formData.bhxh}
            cccd={formData.cccd}
            onClose={() => setShowZoomModal(false)}
            onAddImages={async (files) => {
              await handleAddImages(files);
            }}
            onDeleteImage={(idx) => handleDeleteImage(idx)}
          />
        )}
      </div>
    </div>
  );
}
