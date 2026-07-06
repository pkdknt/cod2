'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { MedicalRecordService } from '@/services/MedicalRecordService';

interface MedicalRecordImportModalProps {
  onClose: () => void;
  onImportSuccess: () => void;
}

export default function MedicalRecordImportModal({ onClose, onImportSuccess }: MedicalRecordImportModalProps) {
  const [xlsxModule, setXlsxModule] = useState<any>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [sheetsList, setSheetsList] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importRecordType, setImportRecordType] = useState<'ngoai-tru' | 'bia-rhm' | 'rhm' | 'yhct'>('ngoai-tru');

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
        setImportStatus('Đọc file thành công. Hãy chọn sheet và loại bệnh án để nhập.');
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
          // 1. Try exact match
          let matchKey = Object.keys(row).find((k) =>
            keys.includes(k.trim().toLowerCase())
          );
          // 2. Try approximate match for longer key phrases
          if (!matchKey) {
            matchKey = Object.keys(row).find((k) => {
              const lowerK = k.trim().toLowerCase();
              return keys.some(key => {
                if (key.length <= 3) return false;
                return lowerK.includes(key);
              });
            });
          }
          return matchKey ? String(row[matchKey]).trim() : '';
        };

        const detectType = (): 'ngoai-tru' | 'bia-rhm' | 'rhm' | 'yhct' => {
          const raw = findVal(['loại bệnh án', 'loai benh an', 'recordtype', 'type']).toLowerCase();
          if (raw.includes('bìa rhm') || raw.includes('bia rhm') || raw.includes('bìa răng')) return 'bia-rhm';
          if (raw.includes('rhm') || raw.includes('răng')) return 'rhm';
          if (raw.includes('yhct') || raw.includes('cổ truyền')) return 'yhct';
          return importRecordType; // Fallback to user selected
        };

        return {
          recordType: detectType(),
          soNgoaiTru: findVal(['số ngoại trú', 'so ngoai tru', 'so_ngoai_tru', 'mã số', 'ma so']),
          soLuuTru: findVal(['số lưu trữ', 'so luu tru', 'so_luu_tru', 'số hs', 'so hs']),
          hoTen: findVal(['họ tên', 'ho ten', 'họ và tên', 'ho va ten', 'tên bệnh nhân', 'ten benh nhan', 'bệnh nhân', 'benh nhan', 'tên', 'ten', 'name']),
          namSinh: findVal(['ngày sinh', 'ngay sinh', 'năm sinh', 'nam sinh', 'sinh năm', 'sinh nam', 'dob']),
          tuoi: findVal(['tuổi', 'tuoi', 'age']),
          gioiTinh: findVal(['giới tính', 'gioi tinh', 'phái', 'phai', 'gender']),
          diaChi: findVal(['địa chỉ', 'dia chi', 'nơi cư ngụ', 'noi cu ngu', 'address']),
          bhytDen: findVal(['bhyt đến', 'bhyt den', 'hạn bhyt', 'han bhyt']),
          soTheBHYT: findVal(['số thẻ bhyt', 'so the bhyt', 'mã bhyt', 'ma bhyt', 'bhyt']),
          dienThoai: findVal(['số điện thoại', 'so dien thoai', 'sđt', 'phone', 'dien thoại']),
          denKhamLuc: findVal(['ngày khám', 'ngay kham', 'đến khám lúc', 'den kham luc', 'date']),
          cccd: findVal(['cccd', 'số cccd', 'cmnd', 'số cmnd']),
          maBenhNhan: findVal(['mã bệnh nhân', 'ma benh nhan', 'ma_benh_nhan', 'mã bn', 'ma bn', 'mabenhnhan']),
          
          // Specialist fields (optional mapping fallback)
          lyDo: findVal(['lý do', 'ly do vao vien', 'lý do vào viện']),
          quaTrinhBenhLy: findVal(['quá trình bệnh lý', 'qua trinh benh ly']),
          tienSuBanThan: findVal(['tiền sử', 'tien su ban than', 'tiền sử bản thân']),
          chanDoan: findVal(['chẩn đoán', 'chan doan', 'bệnh chính', 'benh chinh']),
          xuTri: findVal(['xử trí', 'xu tri', 'hướng xử trí', 'dùng thuốc']),
          namKy: findVal(['năm ký', 'nam ky']) || '2026'
        };
      });

      const validItems = mappedItems.filter(item => item.hoTen);
      if (validItems.length === 0) {
        throw new Error('Không tìm thấy dòng dữ liệu hợp lệ nào chứa đầy đủ Họ tên bệnh nhân');
      }

      setImportStatus(`Đang import ${validItems.length} hồ sơ bệnh án...`);

      const result = await MedicalRecordService.importExcel(validItems);
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
            Nhập danh sách Bệnh án từ Excel
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
            <label className="block text-xs font-bold text-slate-500 mb-1">Loại bệnh án mặc định (nếu Excel không có cột phân loại)</label>
            <select
              value={importRecordType}
              onChange={(e) => setImportRecordType(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold bg-teal-50 border-teal-200 text-teal-700 outline-none"
            >
              <option value="ngoai-tru">Bìa Ngoại trú</option>
              <option value="bia-rhm">Bìa Răng Hàm Mặt</option>
              <option value="rhm">Bệnh án Răng Hàm Mặt (RHM)</option>
              <option value="yhct">Bìa Y học cổ truyền (YHCT)</option>
            </select>
          </div>

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
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-55"
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
