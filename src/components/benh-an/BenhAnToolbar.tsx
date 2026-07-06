'use client';

import React, { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BenhAnRow, BenhAnMapKeys, BenhAnFormType } from './types';

// Helper for Tailwind
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface BenhAnToolbarProps {
  onDataLoaded: (rows: BenhAnRow[], headers: string[]) => void;
  onMapKeysChange: (keys: BenhAnMapKeys) => void;
  onLogoChange: (url: string) => void;
  onClear: () => void;
  onRenderCards: () => void;
  headers: string[];
  mapKeys: BenhAnMapKeys;
  formType: BenhAnFormType;
  onFormTypeChange: (type: BenhAnFormType) => void;
  onPrint: () => void;
}

const DEFAULT_MAP_KEYS: BenhAnMapKeys = {
  tenApp: '',
  tenBenhAn: '',
  soLuuTru: '',
  dongPK1: '',
  dongPK2: '',
  dongPK3: '',
  maVaoVien: '',
  maBenhNhan: '',
  hoTen: '',
  gioiTinh: '',
  namSinh: '',
  cccd: '',
  diaChi: '',
  maBHYT: '',
  ngayVaoVien: '',
  dienThoai: ''
};

export default function BenhAnToolbar({
  onDataLoaded,
  onMapKeysChange,
  onLogoChange,
  onClear,
  onRenderCards,
  headers,
  mapKeys,
  formType,
  onFormTypeChange,
  onPrint
}: BenhAnToolbarProps) {
  const [fileName, setFileName] = useState('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data, { type: 'array' });
    setWorkbook(wb);
    setSheetNames(wb.SheetNames);
    
    if (wb.SheetNames.length > 0) {
      setSelectedSheet(wb.SheetNames[0]);
    }
  };

  useEffect(() => {
    if (!workbook || !selectedSheet) return;

    const ws = workbook.Sheets[selectedSheet];
    // get headers
    const jsonStr = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (jsonStr.length > 0) {
      const headerRow = jsonStr[0] as string[];
      const validHeaders = headerRow.map(h => String(h || '').trim()).filter(Boolean);
      
      const jsonData = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false }) as any[];
      onDataLoaded(jsonData, validHeaders);
      
      // Auto mapping
      const newMapKeys = { ...DEFAULT_MAP_KEYS };
      const norm = (s: string) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]/g, '');
      
      const findBestCol = (keys: string[]) => {
        let best = '';
        validHeaders.forEach(h => {
          const hn = norm(h);
          if (keys.some(k => hn.includes(norm(k)))) {
            best = h;
          }
        });
        return best;
      };

      newMapKeys.hoTen = findBestCol(['họ tên', 'ho ten', 'bệnh nhân']);
      newMapKeys.gioiTinh = findBestCol(['giới tính', 'gioi tinh', 'phái']);
      newMapKeys.namSinh = findBestCol(['năm sinh', 'nam sinh', 'ngày sinh', 'ngay sinh']);
      newMapKeys.diaChi = findBestCol(['địa chỉ', 'dia chi', 'cư ngụ']);
      newMapKeys.maBHYT = findBestCol(['mã bhyt', 'thẻ bhyt']);
      newMapKeys.ngayVaoVien = findBestCol(['ngày vào viện', 'ngày khám']);
      newMapKeys.dienThoai = findBestCol(['điện thoại', 'sdt']);
      newMapKeys.cccd = findBestCol(['cccd', 'cmnd', 'căn cước']);
      newMapKeys.soLuuTru = findBestCol(['số lưu trữ', 'số hồ sơ']);
      newMapKeys.maVaoVien = findBestCol(['mã vào viện']);
      newMapKeys.maBenhNhan = findBestCol(['mã bệnh nhân', 'mã bn']);

      onMapKeysChange(newMapKeys);
    }
  }, [selectedSheet, workbook]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onLogoChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleKeyChange = (key: keyof BenhAnMapKeys, value: string) => {
    onMapKeysChange({ ...mapKeys, [key]: value });
  };

  const mapFields = [
    { key: 'soLuuTru', label: 'Số lưu trữ' },
    { key: 'maVaoVien', label: 'Mã số vào viện' },
    { key: 'maBenhNhan', label: 'Mã bệnh nhân' },
    { key: 'hoTen', label: 'Họ tên' },
    { key: 'gioiTinh', label: 'Giới tính' },
    { key: 'namSinh', label: 'Năm sinh' },
    { key: 'cccd', label: 'Mã định danh/CCCD' },
    { key: 'diaChi', label: 'Địa chỉ' },
    { key: 'maBHYT', label: 'Mã BHYT' },
    { key: 'ngayVaoVien', label: 'Ngày giờ vào viện' },
    { key: 'dienThoai', label: 'Số điện thoại' }
  ] as const;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 print:hidden mb-6">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800">Cấu hình Bệnh án</h2>
        
        <select 
          className="ml-auto px-4 py-2 bg-blue-50 text-blue-800 font-semibold border border-blue-200 rounded-lg outline-none cursor-pointer"
          value={formType}
          onChange={(e) => onFormTypeChange(e.target.value as BenhAnFormType)}
        >
          <option value="RHM">Bệnh án RHM (A3 2 mặt)</option>
          <option value="BIA_NGOAI_TRU">Bìa bệnh án Ngoại trú (A3)</option>
          <option value="BIA_RHM">Bìa bệnh án RHM (A3)</option>
          <option value="BIA_YHCT">Bìa bệnh án YHCT (A3)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* File Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">1. Chọn file Excel</label>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg border border-slate-300 transition-colors text-left truncate"
          >
            {fileName || '📁 Click để chọn file...'}
          </button>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            accept=".xlsx,.xls,.csv" 
            onChange={handleFileUpload} 
          />
        </div>

        {/* Sheet Select */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">2. Chọn Sheet</label>
          <select 
            className="px-4 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:border-teal-500 disabled:bg-slate-50"
            value={selectedSheet}
            onChange={e => setSelectedSheet(e.target.value)}
            disabled={sheetNames.length === 0}
          >
            {sheetNames.length === 0 && <option>-- Trống --</option>}
            {sheetNames.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Logo Upload */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">3. Tùy chỉnh Logo</label>
          <button 
            onClick={() => logoInputRef.current?.click()}
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg border border-emerald-200 transition-colors text-left"
          >
            🖼️ Tải logo mới...
          </button>
          <input 
            type="file" 
            className="hidden" 
            ref={logoInputRef} 
            accept="image/*" 
            onChange={handleLogoUpload} 
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">4. Thao tác</label>
          <div className="flex gap-2">
            <button 
              onClick={onRenderCards}
              disabled={headers.length === 0}
              className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xem trước
            </button>
            <button 
              onClick={onPrint}
              disabled={headers.length === 0}
              className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              In ngay
            </button>
          </div>
        </div>
      </div>

      {headers.length > 0 && (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Ghép cột (Mapping)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mapFields.map(field => (
              <div key={field.key} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">{field.label}</label>
                <select 
                  className="px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-md outline-none focus:border-teal-500"
                  value={mapKeys[field.key]}
                  onChange={e => handleKeyChange(field.key, e.target.value)}
                >
                  <option value="">-- Bỏ trống --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
