'use client';

import React, { useState } from 'react';
import { TemplateSettings } from './types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TheXanhTemplateSettingsProps {
  settings: TemplateSettings;
  onChange: (settings: TemplateSettings) => void;
}

export default function TheXanhTemplateSettings({ settings, onChange }: TheXanhTemplateSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: keyof TemplateSettings, value: string) => {
    onChange({ ...settings, [key]: value });
  };

  const renderInput = (label: string, key: keyof TemplateSettings) => (
    <label className="text-xs font-bold text-slate-700 flex flex-col gap-1.5 w-full">
      {label}
      <input
        type="text"
        className="border border-slate-300 rounded-lg p-2 bg-white text-sm focus:ring-2 focus:ring-teal-500 outline-none w-full"
        value={settings[key]}
        onChange={(e) => handleChange(key, e.target.value)}
      />
    </label>
  );

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl m-4 overflow-hidden print:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-3 bg-teal-700 text-white font-bold text-sm hover:bg-teal-800 transition-colors"
      >
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        Nhập dữ liệu mẫu / Thu nhỏ - Mở rộng
      </button>
      
      {isOpen && (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderInput('Dòng công ty', 'tplCompanyLine1')}
            {renderInput('Dòng phòng khám 1', 'tplCompanyLine2')}
            {renderInput('Dòng phòng khám 2', 'tplCompanyLine3')}
            {renderInput('Chữ trước mã Code', 'tplCertPrefix')}
            
            {renderInput('Chữ sau mã Code', 'tplCertSuffix')}
            {renderInput('Quốc hiệu', 'tplNation')}
            {renderInput('Tiêu ngữ', 'tplNationSub')}
            {renderInput('Tiêu đề thẻ', 'tplTitle')}
            
            {renderInput('Nhãn Họ tên', 'tplLabelName')}
            {renderInput('Nhãn Sinh năm', 'tplLabelBirth')}
            {renderInput('Nhãn Giới tính', 'tplLabelGender')}
            {renderInput('Nhãn Hiện cư ngụ', 'tplLabelAddress')}
            
            {renderInput('Nhãn Đơn vị', 'tplLabelUnit')}
            {renderInput('Nhãn Ngày khám', 'tplLabelExamDate')}
            {renderInput('Nhãn Kết luận', 'tplLabelConclusion')}
            {renderInput('Nội dung Kết luận', 'tplConclusion')}
            
            {renderInput('Chữ mẫu khi trống - Code', 'tplDefaultCode')}
            {renderInput('Chữ mẫu khi trống - Tên', 'tplDefaultName')}
            {renderInput('Chữ mẫu khi trống - Năm sinh', 'tplDefaultBirth')}
            {renderInput('Chữ mẫu khi trống - Giới tính', 'tplDefaultGender')}
            
            {renderInput('Chữ mẫu khi trống - Địa chỉ', 'tplDefaultAddress')}
            {renderInput('Chữ mẫu khi trống - Đơn vị', 'tplDefaultUnit')}
          </div>
          <div className="mt-4 text-xs text-slate-500">
            Các dòng trong khung này có thể sửa tự do. Sau khi sửa, bảng xem trước sẽ tự cập nhật.
          </div>
        </div>
      )}
    </div>
  );
}
