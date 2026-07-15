'use client';

import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, Settings, Database, Trash2 } from 'lucide-react';
import { BhytCustomerData } from '@/services/BhytService';

interface BhytImportExportProps {
  onImportExcel: (items: any[], mode: 'replace' | 'append') => Promise<void>;
  onExportExcel: () => void;
  onExportCsv: () => void;
  onBackupJson: () => void;
  onResetData: () => void;
  totalCustomers: number;
}

export default function BhytImportExport({
  onImportExcel,
  onExportExcel,
  onExportCsv,
  onBackupJson,
  onResetData,
  totalCustomers
}: BhytImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewItems, setPreviewItems] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [importError, setImportError] = useState('');

  // Dynamically load XLSX
  const parseFile = async (file: File) => {
    setImportError('');
    setFileName(file.name);
    try {
      if (file.name.toLowerCase().endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const records = Array.isArray(parsed) ? parsed : parsed.records || [];
        setPreviewItems(records);
        setShowConfirmModal(true);
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        const text = await file.text();
        const parsed = parseCsv(text);
        setPreviewItems(parsed);
        setShowConfirmModal(true);
      } else {
        const { default: XLSX } = await import('xlsx-js-style');
        const ab = await file.arrayBuffer();
        const book = XLSX.read(ab, { type: 'array', cellDates: true });
        const sheet = book.Sheets[book.SheetNames[0]];
        const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) as any[][];
        const records = rowsToRecords(matrix);
        setPreviewItems(records);
        setShowConfirmModal(true);
      }
    } catch (err: any) {
      console.error(err);
      setImportError(err.message || 'Không thể đọc file. Vui lòng kiểm tra định dạng.');
    }
  };

  const parseCsv = (text: string): any[] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];
      if (inQuotes) {
        if (c === '"' && next === '"') {
          cell += '"';
          i++;
        } else if (c === '"') {
          inQuotes = false;
        } else {
          cell += c;
        }
      } else {
        if (c === '"') {
          inQuotes = true;
        } else if (c === ',') {
          row.push(cell);
          cell = '';
        } else if (c === '\n') {
          row.push(cell.replace(/\r$/, ''));
          rows.push(row);
          row = [];
          cell = '';
        } else {
          cell += c;
        }
      }
    }
    if (cell || row.length) {
      row.push(cell);
      rows.push(row);
    }
    return rowsToRecords(rows);
  };

  const normalizeText = (v: any) => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();

  const headerKey = (h: string): string | null => {
    const s = normalizeText(h).replace(/\s+/g, ' ');
    const map: [RegExp, string][] = [
      [/^ho ten$/, 'name'],
      [/ma so bhxh|ma bhxh|ma so bhyt|ma bhyt|ma the bhyt/, 'bhxh'],
      [/^cccd/, 'cccd'],
      [/ngay.*sinh|nam sinh/, 'dob'],
      [/gioi tinh/, 'gender'],
      [/khai sinh/, 'birthPlace'],
      [/kcb ban dau/, 'kcb'],
      [/ngay bien lai/, 'receiptDate'],
      [/so bien lai/, 'receiptNo'],
      [/tien luong|so tien dong/, 'amount'],
      [/ho tro/, 'support'],
      [/ma so nhan vien thu|ma nv thu/, 'staffCode'],
      [/dien thoai|so dien thoai/, 'phone'],
      [/thoi han su dung the.*den ngay|han the den ngay/, 'expiry'],
      [/gia han tang moi|loai ho so/, 'renewType'],
      [/ngay goi/, 'callDate'],
      [/trang thai xu ly/, 'workflowStatus'],
      [/nguoi quen|nguoi nha nv/, 'relation'],
      [/ghi chu/, 'note']
    ];
    for (const [re, k] of map) {
      if (re.test(s)) return k;
    }
    return null;
  };

  const rowsToRecords = (matrix: any[][]): any[] => {
    if (!matrix.length) return [];
    let headIndex = matrix.findIndex(row => 
      row.some(c => /họ tên|ho ten/i.test(String(c || ''))) && 
      row.some(c => /bhxh/i.test(String(c || '')))
    );
    if (headIndex < 0) headIndex = 0;
    const headers = matrix[headIndex].map(h => headerKey(String(h || '')));
    return matrix.slice(headIndex + 1).filter(row => row.some(v => String(v ?? '').trim())).map((row, i) => {
      const r: any = { workflowStatus: 'Chưa liên hệ' };
      headers.forEach((k, j) => {
        if (k) r[k] = String(row[j] ?? '').trim();
      });
      return r;
    }).filter(r => r.name || r.bhxh);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  const handleConfirmImport = async () => {
    if (previewItems.length === 0) return;
    await onImportExcel(previewItems, importMode);
    setShowConfirmModal(false);
    setPreviewItems([]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Import Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase mb-2">Nhập dữ liệu</h3>
          <p className="text-xs text-slate-400 font-semibold mb-4 leading-relaxed">
            Hỗ trợ nhập tệp Excel (.xlsx, .xls), CSV hoặc bản sao lưu JSON. Cột sẽ được đối chiếu tự động.
          </p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-teal-500 bg-teal-50/50'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <Upload className="h-10 w-10 text-teal-600 mb-2" />
            <span className="text-xs font-extrabold text-slate-700">Kéo thả hoặc click chọn file</span>
            <span className="text-[10px] text-slate-450 mt-1 font-semibold">xlsx, xls, csv, json</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv,.json"
              className="hidden"
            />
          </div>
          {importError && (
            <div className="mt-3 bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 font-bold">
              {importError}
            </div>
          )}
        </div>
      </div>

      {/* Export / Storage Tools Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Công cụ dữ liệu</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Xuất báo cáo & quản lý bộ nhớ</p>
            </div>
            <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {totalCustomers} hồ sơ
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div>
                <strong className="text-xs font-extrabold text-slate-800 block">Xuất Excel (.xlsx)</strong>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Tải danh sách định dạng bảng Excel chuẩn</span>
              </div>
              <button
                onClick={onExportExcel}
                className="bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold px-3 py-1.5 rounded-lg text-xs"
              >
                Tải về .xlsx
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div>
                <strong className="text-xs font-extrabold text-slate-800 block">Xuất CSV (.csv)</strong>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Nhẹ và nhanh, hỗ trợ encode UTF-8</span>
              </div>
              <button
                onClick={onExportCsv}
                className="bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold px-3 py-1.5 rounded-lg text-xs"
              >
                Tải về .csv
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div>
                <strong className="text-xs font-extrabold text-slate-800 block">Sao lưu JSON (.json)</strong>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Sao lưu đầy đủ trạng thái hệ thống</span>
              </div>
              <button
                onClick={onBackupJson}
                className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs"
              >
                Tải sao lưu
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl border border-red-50 bg-red-50/20">
              <div>
                <strong className="text-xs font-extrabold text-red-800 block">Reset toàn bộ dữ liệu</strong>
                <span className="text-[10px] text-red-550 font-semibold block mt-0.5">Xóa vĩnh viễn tất cả khách hàng BHYT</span>
              </div>
              <button
                onClick={onResetData}
                className="bg-red-50 text-red-700 hover:bg-red-100 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" /> Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 p-6 space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Xác nhận nhập dữ liệu</h3>
            
            <div className="bg-teal-50 border border-teal-150 p-3 rounded-2xl text-xs text-teal-800 font-bold leading-relaxed">
              Phát hiện <b>{previewItems.length} hồ sơ</b> từ file <b>{fileName}</b>. 
              Vui lòng chọn cách tích hợp vào hệ thống hiện tại.
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Phương thức nhập</label>
              <select
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as 'replace' | 'append')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-teal-500 bg-white font-semibold text-slate-700"
              >
                <option value="replace">Ghi đè (Thay thế toàn bộ, tự loại trùng)</option>
                <option value="append">Bổ sung (Giữ hạn thẻ mới nhất của trùng)</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPreviewItems([]);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-colors shadow-sm"
              >
                Nhập dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
