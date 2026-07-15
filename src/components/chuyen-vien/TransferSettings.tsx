'use client';

import React, { useState, useEffect } from 'react';
import { Save, Trash2 } from 'lucide-react';

interface TransferSettingsProps {
  initialSettings: {
    appTitle: string;
    clinicName: string;
    owner: string;
  };
  onSave: (settings: any) => void;
  onResetData: () => void;
}

export default function TransferSettings({ initialSettings, onSave, onResetData }: TransferSettingsProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3 mb-2">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Cấu hình phân hệ</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Quản lý các thông số hiển thị chính</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">Tên ứng dụng</label>
            <input
              type="text"
              value={settings.appTitle || ''}
              onChange={(e) => handleChange('appTitle', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all font-semibold text-slate-700"
              placeholder="CSKH CHUYỂN VIỆN - Nhơn Tâm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">Tên đơn vị phòng khám</label>
            <input
              type="text"
              value={settings.clinicName || ''}
              onChange={(e) => handleChange('clinicName', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all font-semibold text-slate-700"
              placeholder="PHÒNG KHÁM ĐA KHOA NHƠN TÂM"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">Người phụ trách CSKH</label>
            <input
              type="text"
              value={settings.owner || ''}
              onChange={(e) => handleChange('owner', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-teal-500 outline-none focus:ring-2 focus:ring-teal-200 transition-all font-semibold text-slate-700"
            />
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
      </form>

      {/* Danger Zone */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-3 mb-2">
            <h3 className="font-extrabold text-red-800 text-sm tracking-wide uppercase">Khu vực nguy hiểm</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Xóa dữ liệu hoặc khôi phục hệ thống</p>
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Nhấp nút bên dưới sẽ xóa toàn bộ danh sách bệnh nhân chuyển tuyến trong cơ sở dữ liệu. 
            Lưu ý rằng hành động này không thể khôi phục lại trừ khi bạn đã sao lưu file Excel hoặc JSON trước đó.
          </p>
        </div>

        <div className="mt-6 flex">
          <button
            type="button"
            onClick={onResetData}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 px-5 py-2.5 text-xs font-bold hover:bg-red-100 transition-colors shadow-sm"
          >
            <Trash2 className="h-4 w-4" /> Xóa toàn bộ dữ liệu chuyển viện
          </button>
        </div>
      </div>
    </div>
  );
}
