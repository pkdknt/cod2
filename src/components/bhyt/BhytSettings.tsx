'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';

interface BhytSettingsProps {
  initialSettings: {
    clinicName: string;
    clinicAddress: string;
    clinicHotline: string;
    messageTemplate: string;
  };
  onSave: (settings: any) => void;
}

export default function BhytSettings({ initialSettings, onSave }: BhytSettingsProps) {
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleChange = (field: string, val: string) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Clinic Info */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3 mb-2">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Thông tin đơn vị</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Hiển thị trong mẫu tin nhắn nhắc gia hạn</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">Tên đơn vị</label>
            <input
              type="text"
              value={settings.clinicName || ''}
              onChange={(e) => handleChange('clinicName', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all font-semibold text-slate-700"
              placeholder="PHÒNG KHÁM ĐA KHOA NHƠN TÂM"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">Địa chỉ</label>
            <input
              type="text"
              value={settings.clinicAddress || ''}
              onChange={(e) => handleChange('clinicAddress', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all font-semibold text-slate-700"
              placeholder="469 Nguyễn Văn Tạo, X. Hiệp Phước..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">Hotline</label>
            <input
              type="text"
              value={settings.clinicHotline || ''}
              onChange={(e) => handleChange('clinicHotline', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all font-semibold text-slate-700"
              placeholder="0987..."
            />
          </div>
        </div>
      </div>

      {/* Message Template */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3 mb-2">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Mẫu tin nhắn nhắc</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Mẫu soạn tin nhắn gửi khách hàng gia hạn</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">Nội dung mẫu</label>
            <textarea
              value={settings.messageTemplate || ''}
              onChange={(e) => handleChange('messageTemplate', e.target.value)}
              rows={5}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all font-semibold text-slate-700 resize-none"
              placeholder="Nhập mẫu tin nhắn..."
            />
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-2">
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block mb-1">Cú pháp thẻ hỗ trợ:</span>
              <div className="flex flex-wrap gap-1.5">
                {['[Ho_Ten]', '[Ngay_Het_Han]', '{ten}', '{han_the}', '{so_ngay}', '{hotline}', '{dia_chi}'].map((tag) => (
                  <code key={tag} className="bg-slate-200 text-slate-700 text-[10px] font-mono px-1 py-0.5 rounded">
                    {tag}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-900/10 hover:bg-teal-500 transition-colors"
          >
            <Save className="h-4 w-4" /> Lưu cài đặt
          </button>
        </div>
      </div>
    </form>
  );
}
