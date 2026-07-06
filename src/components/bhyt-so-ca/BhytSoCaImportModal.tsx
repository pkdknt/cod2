'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { BhytSoCaService } from '@/services/BhytSoCaService';

interface BhytSoCaImportModalProps {
  onClose: () => void;
  onImportSuccess: () => void;
}

export default function BhytSoCaImportModal({ onClose, onImportSuccess }: BhytSoCaImportModalProps) {
  const [xlsxModule, setXlsxModule] = useState<any>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [sheetsList, setSheetsList] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('xlsx').then((module) => {
        setXlsxModule(module);
      });
    }
  }, []);

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!xlsxModule) {
      setImportStatus('Vui lòng đợi trong giây lát, thư viện Excel đang được tải...');
      return;
    }

    setImportFile(file);
    setImportStatus('Đang đọc file...');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = xlsxModule.read(data, { type: 'array' });
        setSheetsList(workbook.SheetNames);
        setSelectedSheet(workbook.SheetNames[0] || '');
        setImportStatus('Đọc file thành công. Hãy chọn sheet để nhập.');
      } catch (err: any) {
        setImportStatus('Lỗi đọc file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const triggerImport = async () => {
    if (!importFile || !selectedSheet) {
      alert('Vui lòng chọn file và sheet');
      return;
    }
    setIsImporting(true);
    setImportStatus('Đang phân tích và tải lên database...');
    try {
      if (!xlsxModule) throw new Error('Thư viện Excel chưa được tải');
      
      const fileData = await importFile.arrayBuffer();
      const workbook = xlsxModule.read(new Uint8Array(fileData), { type: 'array' });
      const sheet = workbook.Sheets[selectedSheet];
      const json = xlsxModule.utils.sheet_to_json(sheet) as any[];

      const mappedItems = json.map((row: any) => {
        const findVal = (keys: string[]) => {
          const matchKey = Object.keys(row).find((k) =>
            keys.includes(k.trim().toLowerCase())
          );
          return matchKey ? String(row[matchKey]).trim() : '';
        };

        const rawType = findVal(['loại ca', 'loại', 'type', 'loai_ca', 'loai']).toLowerCase();
        const type = rawType.includes('gia') || rawType.includes('hạn') || rawType.includes('han') || rawType.includes('renew') ? 'Gia hạn' : 'Mua mới';

        const rawDate = findVal(['ngày', 'ngay', 'date', 'ngày tháng', 'ngay thang']);
        // Parse date format and normalize to YYYY-MM-DD
        let normalizedDate = '';
        if (rawDate) {
          // If format is dd/mm/yyyy
          const parts = rawDate.split('/');
          if (parts.length === 3) {
            normalizedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          } else if (rawDate.includes('-')) {
            const partsDash = rawDate.split('-');
            if (partsDash.length === 3) {
              if (partsDash[0].length === 4) {
                // yyyy-mm-dd
                normalizedDate = `${partsDash[0]}-${partsDash[1].padStart(2, '0')}-${partsDash[2].padStart(2, '0')}`;
              } else {
                // dd-mm-yyyy
                normalizedDate = `${partsDash[2]}-${partsDash[1].padStart(2, '0')}-${partsDash[0].padStart(2, '0')}`;
              }
            }
          }
        }

        const qty = parseInt(findVal(['số ca', 'so ca', 'số lượng', 'so luong', 'qty', 'quantity', 'sl']), 10) || 1;

        return {
          date: normalizedDate || new Date().toISOString().slice(0, 10),
          type,
          qty,
          note: findVal(['ghi chú', 'ghi chu', 'note', 'khách', 'khach'])
        };
      });

      const validItems = mappedItems.filter(item => item.date && item.qty > 0);
      if (validItems.length === 0) {
        throw new Error('Không tìm thấy dòng dữ liệu hợp lệ nào chứa đầy đủ Ngày và Số lượng');
      }

      setImportStatus(`Đang import ${validItems.length} ca BHYT...`);

      const result = await BhytSoCaService.importExcel(validItems);
      alert(result.message);
      onImportSuccess();
      onClose();
    } catch (err: any) {
      setImportStatus('Lỗi import: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider">
            Nhập số ca từ Excel
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Chọn file Excel (.xlsx / .xls)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 cursor-pointer relative">
              <FileSpreadsheet className="h-8 w-8 text-teal-650 mb-2 animate-bounce" />
              <span className="text-xs font-bold text-slate-650">
                {importFile ? importFile.name : 'Kéo thả hoặc click chọn file'}
              </span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {sheetsList.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Chọn Sheet dữ liệu</label>
              <select
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500 bg-white"
              >
                {sheetsList.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {importStatus && (
            <div className="rounded-xl bg-teal-50/50 border border-teal-100 p-3 text-[11px] font-semibold text-teal-700 leading-relaxed">
              {importStatus}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isImporting || !importFile || sheetsList.length === 0}
            onClick={triggerImport}
            className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-650 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? 'Đang nhập...' : 'Bắt đầu Nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}
