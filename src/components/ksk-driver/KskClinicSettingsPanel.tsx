'use client';

import React from 'react';

export interface ClinicSettings {
  company: string;
  clinic: string;
  codeLoai: string;
  codeCoSo: string;
  codeNam: string;
  codePrefix: string;
  province: string;
  legal: string;
  title: string;
  nguoiKetLuanLabel: string;
}

interface KskClinicSettingsPanelProps {
  settings: ClinicSettings;
  onChange: (settings: ClinicSettings) => void;
}

export default function KskClinicSettingsPanel({ settings, onChange }: KskClinicSettingsPanelProps) {
  const handleChange = (field: keyof ClinicSettings, value: string) => {
    onChange({
      ...settings,
      [field]: value
    });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-inner grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">Tên công ty chủ quản</label>
        <input
          type="text"
          value={settings.company}
          onChange={(e) => handleChange('company', e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-teal-500 focus:outline-none bg-white"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">Tên phòng khám</label>
        <input
          type="text"
          value={settings.clinic}
          onChange={(e) => handleChange('clinic', e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-teal-500 focus:outline-none bg-white"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">Chức danh người ký kết luận</label>
        <input
          type="text"
          value={settings.nguoiKetLuanLabel}
          onChange={(e) => handleChange('nguoiKetLuanLabel', e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-teal-500 focus:outline-none bg-white"
        />
      </div>
    </div>
  );
}
