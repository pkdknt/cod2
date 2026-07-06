'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { ExcelRow, MapKeys, SignerConfig, DateConfig } from './types';

interface TheXanhToolbarProps {
  onDataLoaded: (rows: ExcelRow[], headers: string[]) => void;
  onMapKeysChange: (keys: MapKeys) => void;
  onSignerConfigChange: (config: SignerConfig) => void;
  onDateConfigChange: (config: DateConfig) => void;
  onLogoChange: (logoUrl: string | null) => void;
  onRenderCards: () => void;
  onClear: () => void;
  headers: string[];
  mapKeys: MapKeys;
  signerConfig: SignerConfig;
  dateConfig: DateConfig;
}

export default function TheXanhToolbar({
  onDataLoaded,
  onMapKeysChange,
  onSignerConfigChange,
  onDateConfigChange,
  onLogoChange,
  onRenderCards,
  onClear,
  headers,
  mapKeys,
  signerConfig,
  dateConfig
}: TheXanhToolbarProps) {
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [headerRowIndex, setHeaderRowIndex] = useState<number>(1);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      try {
        const wb = XLSX.read(data, { type: 'array', cellDates: true });
        setWorkbook(wb);
        setSheets(wb.SheetNames);
        const firstSheet = wb.SheetNames[0];
        setSelectedSheet(firstSheet);
        loadSheetData(wb, firstSheet, headerRowIndex);
      } catch (err) {
        console.error('Error reading Excel file:', err);
        alert('Lỗi đọc file Excel. Vui lòng kiểm tra lại.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const loadSheetData = (wb: XLSX.WorkBook, sheetName: string, hRow: number) => {
    if (!wb || !sheetName) return;
    const worksheet = wb.Sheets[sheetName];
    if (!worksheet) return;

    const aoa = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, raw: false, dateNF: 'dd/mm/yyyy' });
    const hIdx = Math.max(0, hRow - 1);
    
    if (aoa.length <= hIdx) {
      onDataLoaded([], []);
      return;
    }

    const currentHeaders = (aoa[hIdx] || []).map((h, i) => String(h || `Cột ${i + 1}`).trim());
    const rows = aoa.slice(hIdx + 1)
      .filter(r => r.some(c => String(c == null ? '' : c).trim() !== ''))
      .map(r => {
        const obj: any = {};
        currentHeaders.forEach((h, i) => {
          obj[h] = r[i] == null ? '' : r[i];
        });
        return obj;
      });

    onDataLoaded(rows, currentHeaders);
    autoMapColumns(currentHeaders);
  };

  const handleSheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sheet = e.target.value;
    setSelectedSheet(sheet);
    if (workbook) loadSheetData(workbook, sheet, headerRowIndex);
  };

  const handleHeaderRowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 1;
    setHeaderRowIndex(val);
    if (workbook && selectedSheet) loadSheetData(workbook, selectedSheet, val);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onLogoChange(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const autoMapColumns = (currentHeaders: string[]) => {
    const norm = (s: string) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/\s+/g, ' ');
    
    const aliases: Record<keyof MapKeys, string[]> = {
      colCode: ['code', 'mã', 'ma', 'số', 'so'],
      colName: ['họ tên', 'ho ten', 'tên', 'ten', 'name'],
      colBirth: ['năm sinh', 'nam sinh', 'birth', 'dob', 'sinh'],
      colGender: ['giới tính', 'gioi tinh', 'gender', 'sex'],
      colAddress: ['địa chỉ', 'dia chi', 'hiện cư ngụ', 'hien cu ngu', 'dc', 'address'],
      colUnit: ['đơn vị', 'don vi', 'công ty', 'cong ty', 'unit'],
      colDate: ['ngày khám', 'ngay kham', 'ngày', 'ngay', 'date']
    };

    const newMap = { ...mapKeys };
    (Object.keys(aliases) as Array<keyof MapKeys>).forEach(key => {
      const choices = aliases[key].map(norm);
      const found = currentHeaders.find(h => choices.some(a => norm(h).includes(a)));
      if (found) newMap[key] = found;
    });

    onMapKeysChange(newMap);
  };

  const renderColSelect = (label: string, mapKey: keyof MapKeys) => (
    <label className="text-xs font-bold text-slate-700 flex flex-col gap-1.5">
      {label}
      <select
        className="border border-slate-300 rounded-lg p-2 bg-white min-h-[38px] text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
        value={mapKeys[mapKey]}
        onChange={(e) => onMapKeysChange({ ...mapKeys, [mapKey]: e.target.value })}
      >
        <option value="">-- bỏ trống --</option>
        {headers.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
    </label>
  );

  return (
    <div className="bg-white border-b border-slate-200 p-4 shadow-sm relative z-10 print:hidden">
      <h1 className="text-xl font-black text-slate-800 tracking-tight mb-2">App Mail Merge Thẻ Chứng Nhận Sức Khỏe</h1>
      <p className="text-sm text-slate-600 mb-4">Đọc Excel ngay trên trình duyệt → chọn sheet → map cột → in A4 ngang, 4 thẻ/trang, mỗi thẻ 14.6 × 9.9 cm.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <label className="text-xs font-bold text-slate-700 flex flex-col gap-1.5">
          File Excel (.xlsx, .csv)
          <input
            type="file"
            accept=".xlsx,.xls,.xlsm,.csv"
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 min-h-[38px] border border-slate-300 rounded-lg bg-white"
            onChange={handleFileUpload}
          />
        </label>
        <label className="text-xs font-bold text-slate-700 flex flex-col gap-1.5">
          Sheet dữ liệu
          <select
            className="border border-slate-300 rounded-lg p-2 bg-white min-h-[38px] text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            value={selectedSheet}
            onChange={handleSheetChange}
            disabled={sheets.length === 0}
          >
            {sheets.length === 0 && <option>Chưa có file</option>}
            {sheets.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold text-slate-700 flex flex-col gap-1.5">
          Dòng tiêu đề cột
          <input
            type="number"
            min="1"
            className="border border-slate-300 rounded-lg p-2 bg-white min-h-[38px] text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            value={headerRowIndex}
            onChange={handleHeaderRowChange}
          />
        </label>
        <label className="text-xs font-bold text-slate-700 flex flex-col gap-1.5">
          Logo khác (không bắt buộc)
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 min-h-[38px] border border-slate-300 rounded-lg bg-white"
            onChange={handleLogoUpload}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 items-end mb-4">
        {renderColSelect('Cột Code', 'colCode')}
        {renderColSelect('Cột Tên', 'colName')}
        {renderColSelect('Cột Năm sinh', 'colBirth')}
        {renderColSelect('Cột Giới tính', 'colGender')}
        {renderColSelect('Cột Địa chỉ', 'colAddress')}
        {renderColSelect('Cột Đơn vị', 'colUnit')}
        {renderColSelect('Cột Ngày khám', 'colDate')}
        
        <label className="text-xs font-bold text-slate-700 flex flex-col gap-1.5">
          Ngày khám nhập tay
          <input
            type="text"
            placeholder="VD: 29/05/2026"
            className="border border-slate-300 rounded-lg p-2 bg-white min-h-[38px] text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            value={dateConfig.manualDate}
            onChange={(e) => onDateConfigChange({ ...dateConfig, manualDate: e.target.value })}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3 items-end p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
        <label className="text-xs font-bold text-slate-700 flex flex-col gap-1.5 w-full sm:w-auto">
          Chế độ ngày khám
          <select
            className="border border-slate-300 rounded-lg p-2 bg-white min-h-[38px] text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            value={dateConfig.dateMode}
            onChange={(e) => onDateConfigChange({ ...dateConfig, dateMode: e.target.value as any })}
          >
            <option value="manual">Dùng ngày nhập tay cho tất cả</option>
            <option value="column">Lấy theo cột Ngày khám trong Excel</option>
          </select>
        </label>
        
        <label className="text-xs font-bold text-slate-700 flex flex-col gap-1.5 w-full sm:w-auto">
          Người ký
          <select
            className="border border-slate-300 rounded-lg p-2 bg-white min-h-[38px] text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            value={signerConfig.signMode}
            onChange={(e) => onSignerConfigChange({ ...signerConfig, signMode: e.target.value as any })}
          >
            <option value="alternate">Luân phiên 2 người ký</option>
            <option value="director">Tất cả: GIÁM ĐỐC</option>
            <option value="vice">Tất cả: PHÓ GIÁM ĐỐC</option>
          </select>
        </label>
        
        <div className="flex gap-2">
          <label className="text-xs font-bold text-slate-700 flex flex-col gap-1.5 w-24">
            Chức danh 1
            <input type="text" className="border border-slate-300 rounded-lg p-2 bg-white text-sm" value={signerConfig.role1} onChange={(e) => onSignerConfigChange({ ...signerConfig, role1: e.target.value })} />
          </label>
          <label className="text-xs font-bold text-slate-700 flex flex-col gap-1.5 flex-1 min-w-[150px]">
            Tên ký 1
            <input type="text" className="border border-slate-300 rounded-lg p-2 bg-white text-sm" value={signerConfig.signer1} onChange={(e) => onSignerConfigChange({ ...signerConfig, signer1: e.target.value })} />
          </label>
        </div>

        <div className="flex gap-2">
          <label className="text-xs font-bold text-slate-700 flex flex-col gap-1.5 w-24">
            Chức danh 2
            <input type="text" className="border border-slate-300 rounded-lg p-2 bg-white text-sm" value={signerConfig.role2} onChange={(e) => onSignerConfigChange({ ...signerConfig, role2: e.target.value })} />
          </label>
          <label className="text-xs font-bold text-slate-700 flex flex-col gap-1.5 flex-1 min-w-[150px]">
            Tên ký 2
            <input type="text" className="border border-slate-300 rounded-lg p-2 bg-white text-sm" value={signerConfig.signer2} onChange={(e) => onSignerConfigChange({ ...signerConfig, signer2: e.target.value })} />
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRenderCards}
          className="bg-teal-700 text-white font-bold px-6 py-2 rounded-lg shadow-sm hover:bg-teal-800 transition-colors"
        >
          Tạo thẻ
        </button>
        <button
          onClick={() => window.print()}
          className="bg-slate-800 text-white font-bold px-6 py-2 rounded-lg shadow-sm hover:bg-slate-900 transition-colors"
        >
          In / Lưu PDF
        </button>
        <button
          onClick={onClear}
          className="bg-slate-200 text-slate-800 font-bold px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors"
        >
          Xóa preview
        </button>
      </div>
    </div>
  );
}
