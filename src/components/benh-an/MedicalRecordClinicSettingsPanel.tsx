'use client';

import React from 'react';

export interface MedicalRecordClinicSettings {
  soYTe: string;
  tenPhongKham: string;
  khoa: string;
  diaChi: string;
  hotline: string;
  giamDoc: string;
  bacSy: string;
}

export const MEDICAL_RECORD_CLINIC_DEFAULT: MedicalRecordClinicSettings = {
  soYTe: 'SỞ Y TẾ TP. HỒ CHÍ MINH',
  tenPhongKham: 'PHÒNG KHÁM ĐA KHOA NHƠN TÂM',
  khoa: 'Khoa: Răng Hàm Mặt',
  diaChi: 'Địa chỉ: 469 Nguyễn Văn Tạo, xã Hiệp Phước, TP. HCM',
  hotline: 'ĐT: 028 3780 1479 – Hotline: 0987 519 115',
  giamDoc: 'GIÁM ĐỐC PHÒNG KHÁM',
  bacSy: 'BÁC SỸ KHÁM BỆNH'
};

interface MedicalRecordClinicSettingsPanelProps {
  settings: MedicalRecordClinicSettings;
  onChange: (settings: MedicalRecordClinicSettings) => void;
}

export default function MedicalRecordClinicSettingsPanel({
  settings,
  onChange
}: MedicalRecordClinicSettingsPanelProps) {
  const handleChange = (field: keyof MedicalRecordClinicSettings, value: string) => {
    onChange({
      ...settings,
      [field]: value
    });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-inner grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">Sở y tế</label>
        <input
          type="text"
          value={settings.soYTe}
          onChange={(e) => handleChange('soYTe', e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-teal-500 focus:outline-none bg-white"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">Tên phòng khám / đơn vị</label>
        <input
          type="text"
          value={settings.tenPhongKham}
          onChange={(e) => handleChange('tenPhongKham', e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-teal-500 focus:outline-none bg-white"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">Khoa / Phòng chuyên môn</label>
        <input
          type="text"
          value={settings.khoa}
          onChange={(e) => handleChange('khoa', e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-teal-500 focus:outline-none bg-white"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs font-bold text-slate-500 mb-1">Địa chỉ</label>
        <input
          type="text"
          value={settings.diaChi}
          onChange={(e) => handleChange('diaChi', e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-teal-500 focus:outline-none bg-white"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">Hotline / Điện thoại liên hệ</label>
        <input
          type="text"
          value={settings.hotline}
          onChange={(e) => handleChange('hotline', e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-teal-500 focus:outline-none bg-white"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">Chức danh ký tên (trái)</label>
        <input
          type="text"
          value={settings.giamDoc}
          onChange={(e) => handleChange('giamDoc', e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-teal-500 focus:outline-none bg-white"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">Chức danh ký tên (phải)</label>
        <input
          type="text"
          value={settings.bacSy}
          onChange={(e) => handleChange('bacSy', e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold focus:border-teal-500 focus:outline-none bg-white"
        />
      </div>
    </div>
  );
}
