'use client';

import React from 'react';
import { BhytSoCaData } from '@/services/BhytSoCaService';

interface BhytSoCaEditorProps {
  formState: BhytSoCaData;
  onChange: (val: BhytSoCaData) => void;
  onSubmit: () => void;
  onReset: () => void;
  isEdit: boolean;
}

export default function BhytSoCaEditor({
  formState,
  onChange,
  onSubmit,
  onReset,
  isEdit
}: BhytSoCaEditorProps) {

  const handleFieldChange = (field: keyof BhytSoCaData, value: any) => {
    onChange({
      ...formState,
      [field]: value
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fade-in">
      <h2 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
        {isEdit ? '✏️ Chỉnh sửa ca' : '📝 Nhập ca mới'}
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Ngày chọn</label>
          <input
            type="date"
            required
            value={formState.date}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Loại ca</label>
            <select
              value={formState.type}
              onChange={(e) => handleFieldChange('type', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            >
              <option value="Mua mới">Mua mới</option>
              <option value="Gia hạn">Gia hạn</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Số lượng ca</label>
            <input
              type="number"
              required
              min={1}
              value={formState.qty}
              onChange={(e) => handleFieldChange('qty', parseInt(e.target.value, 10) || 1)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Ghi chú ca</label>
          <textarea
            placeholder="VD: Tên khách hàng / Đơn vị..."
            value={formState.note || ''}
            onChange={(e) => handleFieldChange('note', e.target.value)}
            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none min-h-[80px]"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onSubmit}
            className="flex-1 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-650 transition-colors shadow"
          >
            {isEdit ? 'Cập nhật' : 'Lưu vào DB'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
