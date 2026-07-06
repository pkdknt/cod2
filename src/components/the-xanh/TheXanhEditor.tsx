'use client';

import React from 'react';
import { TheXanhCustomerData } from '@/services/TheXanhService';

export interface TheXanhTemplateSettings {
  tplCompanyLine1: string;
  tplCompanyLine2: string;
  tplCompanyLine3: string;
  tplCertPrefix: string;
  tplCertSuffix: string;
  tplNation: string;
  tplNationSub: string;
  tplTitle: string;
  tplLabelName: string;
  tplLabelBirth: string;
  tplLabelGender: string;
  tplLabelAddress: string;
  tplLabelUnit: string;
  tplLabelExamDate: string;
  tplLabelConclusion: string;
  tplConclusion: string;
}

export interface TheXanhSignSettings {
  signMode: 'alternate' | 'director' | 'vice';
  role1: string;
  signer1: string;
  role2: string;
  signer2: string;
}

interface TheXanhEditorProps {
  formState: TheXanhCustomerData;
  onChange: (val: TheXanhCustomerData) => void;
  onSubmit: () => void;
  onReset: () => void;
  isEdit: boolean;
  
  // Sign & Date props
  dateMode: 'manual' | 'column';
  onDateModeChange: (val: 'manual' | 'column') => void;
  manualDate: string;
  onManualDateChange: (val: string) => void;
  signSettings: TheXanhSignSettings;
  onSignSettingsChange: (val: TheXanhSignSettings) => void;
  
  // Template props
  templateSettings: TheXanhTemplateSettings;
  onTemplateSettingsChange: (val: TheXanhTemplateSettings) => void;
}

export default function TheXanhEditor({
  formState,
  onChange,
  onSubmit,
  onReset,
  isEdit,
  dateMode,
  onDateModeChange,
  manualDate,
  onManualDateChange,
  signSettings,
  onSignSettingsChange,
  templateSettings,
  onTemplateSettingsChange
}: TheXanhEditorProps) {

  const handleFieldChange = (field: keyof TheXanhCustomerData, value: string) => {
    onChange({
      ...formState,
      [field]: value
    });
  };

  const handleSignChange = (field: keyof TheXanhSignSettings, value: string) => {
    onSignSettingsChange({
      ...signSettings,
      [field]: value
    });
  };

  const handleTemplateChange = (field: keyof TheXanhTemplateSettings, value: string) => {
    onTemplateSettingsChange({
      ...templateSettings,
      [field]: value
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Editor & Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Edit Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
            Biểu mẫu nhập liệu thẻ xanh
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Mã Code *</label>
              <input
                type="text"
                required
                placeholder="VD: 001..."
                value={formState.code}
                onChange={(e) => handleFieldChange('code', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Họ tên người khám *</label>
              <input
                type="text"
                required
                placeholder="IN HOA CÓ DẤU..."
                value={formState.name}
                onChange={(e) => handleFieldChange('name', e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Năm sinh</label>
              <input
                type="text"
                placeholder="VD: 1995"
                value={formState.birthYear || ''}
                onChange={(e) => handleFieldChange('birthYear', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Giới tính</label>
              <select
                value={formState.gender || 'Nam'}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Ngày khám (ở chế độ cột)</label>
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                disabled={dateMode === 'manual'}
                value={formState.examDate || ''}
                onChange={(e) => handleFieldChange('examDate', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Đơn vị công tác</label>
              <input
                type="text"
                placeholder="Tên công ty / Trường học..."
                value={formState.unit || ''}
                onChange={(e) => handleFieldChange('unit', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Kết luận sức khỏe</label>
              <input
                type="text"
                value={formState.conclusion || 'ĐỦ SỨC KHỎE'}
                onChange={(e) => handleFieldChange('conclusion', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 mb-1">Địa chỉ thường trú</label>
              <input
                type="text"
                placeholder="Số nhà, đường, xã, huyện, tỉnh..."
                value={formState.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Hủy / Nhập mới
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-teal-650 transition-colors"
            >
              {isEdit ? 'Cập Nhật Hồ Sơ' : 'Lưu Hồ Sơ Vào Database'}
            </button>
          </div>
        </div>

        {/* Right Column: Print Settings & Signers */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
            Thiết lập in & ký nhận
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Chế độ ngày khám</label>
              <select
                value={dateMode}
                onChange={(e) => onDateModeChange(e.target.value as 'manual' | 'column')}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              >
                <option value="manual">Dùng ngày nhập tay cho tất cả</option>
                <option value="column">Lấy theo cột Ngày khám trong Excel</option>
              </select>
            </div>

            {dateMode === 'manual' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Ngày khám nhập tay</label>
                <input
                  type="text"
                  placeholder="VD: 29/05/2026"
                  value={manualDate}
                  onChange={(e) => onManualDateChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Người ký</label>
              <select
                value={signSettings.signMode}
                onChange={(e) => handleSignChange('signMode', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              >
                <option value="alternate">Luân phiên 2 người ký</option>
                <option value="director">Tất cả: NGƯỜI KÝ 1 (GIÁM ĐỐC)</option>
                <option value="vice">Tất cả: NGƯỜI KÝ 2 (PHÓ GIÁM ĐỐC)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Chức danh 1</label>
                <input
                  type="text"
                  value={signSettings.role1}
                  onChange={(e) => handleSignChange('role1', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tên người ký 1</label>
                <input
                  type="text"
                  value={signSettings.signer1}
                  onChange={(e) => handleSignChange('signer1', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Chức danh 2</label>
                <input
                  type="text"
                  value={signSettings.role2}
                  onChange={(e) => handleSignChange('role2', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tên người ký 2</label>
                <input
                  type="text"
                  value={signSettings.signer2}
                  onChange={(e) => handleSignChange('signer2', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Template Config Panel */}
      <details className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm">
        <summary className="font-extrabold text-slate-800 text-xs uppercase tracking-wider cursor-pointer outline-none select-none">
          Nhập dữ liệu mẫu / Thu nhỏ - Mở rộng cấu hình nhãn thẻ
        </summary>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Dòng công ty</label>
            <input
              type="text"
              value={templateSettings.tplCompanyLine1}
              onChange={(e) => handleTemplateChange('tplCompanyLine1', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Dòng PK 1</label>
            <input
              type="text"
              value={templateSettings.tplCompanyLine2}
              onChange={(e) => handleTemplateChange('tplCompanyLine2', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Dòng PK 2</label>
            <input
              type="text"
              value={templateSettings.tplCompanyLine3}
              onChange={(e) => handleTemplateChange('tplCompanyLine3', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tiêu đề thẻ</label>
            <input
              type="text"
              value={templateSettings.tplTitle}
              onChange={(e) => handleTemplateChange('tplTitle', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Chữ trước Code</label>
            <input
              type="text"
              value={templateSettings.tplCertPrefix}
              onChange={(e) => handleTemplateChange('tplCertPrefix', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Chữ sau Code</label>
            <input
              type="text"
              value={templateSettings.tplCertSuffix}
              onChange={(e) => handleTemplateChange('tplCertSuffix', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Quốc hiệu</label>
            <input
              type="text"
              value={templateSettings.tplNation}
              onChange={(e) => handleTemplateChange('tplNation', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tiêu ngữ</label>
            <input
              type="text"
              value={templateSettings.tplNationSub}
              onChange={(e) => handleTemplateChange('tplNationSub', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nhãn họ tên</label>
            <input
              type="text"
              value={templateSettings.tplLabelName}
              onChange={(e) => handleTemplateChange('tplLabelName', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nhãn năm sinh</label>
            <input
              type="text"
              value={templateSettings.tplLabelBirth}
              onChange={(e) => handleTemplateChange('tplLabelBirth', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nhãn giới tính</label>
            <input
              type="text"
              value={templateSettings.tplLabelGender}
              onChange={(e) => handleTemplateChange('tplLabelGender', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nhãn địa chỉ</label>
            <input
              type="text"
              value={templateSettings.tplLabelAddress}
              onChange={(e) => handleTemplateChange('tplLabelAddress', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nhãn đơn vị</label>
            <input
              type="text"
              value={templateSettings.tplLabelUnit}
              onChange={(e) => handleTemplateChange('tplLabelUnit', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nhãn ngày khám</label>
            <input
              type="text"
              value={templateSettings.tplLabelExamDate}
              onChange={(e) => handleTemplateChange('tplLabelExamDate', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nhãn kết luận</label>
            <input
              type="text"
              value={templateSettings.tplLabelConclusion}
              onChange={(e) => handleTemplateChange('tplLabelConclusion', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nội dung kết luận mặc định</label>
            <input
              type="text"
              value={templateSettings.tplConclusion}
              onChange={(e) => handleTemplateChange('tplConclusion', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
            />
          </div>
        </div>
      </details>
    </div>
  );
}
