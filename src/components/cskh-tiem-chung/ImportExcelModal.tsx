'use client';

import React, { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { DATA, maskDateText, monthsAge, norm, parseDate } from '@/lib/vaccineData';

interface ImportExcelModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function ImportExcelModal({ open, onClose, onImported }: ImportExcelModalProps) {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [sheetsList, setSheetsList] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const reset = () => {
    setImportFile(null);
    setSheetsList([]);
    setSelectedSheet('');
    setImportStatus('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportStatus('Đang đọc file...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const { default: XLSX } = await import('xlsx-js-style');
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        setSheetsList(workbook.SheetNames);
        setSelectedSheet(workbook.SheetNames[0] || '');
        setImportStatus('Đọc file thành công. Hãy chọn sheet để nhập.');
      } catch (err) {
        setImportStatus('Lỗi đọc file: ' + (err as Error).message);
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
      const { default: XLSX } = await import('xlsx-js-style');

      const fileData = await importFile.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' });
      const sheet = workbook.Sheets[selectedSheet];

      const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

      const cleanString = (str: string) => norm(str).replace(/[^a-z0-9]/g, '');

      let headerRowIndex = 0;
      const nameKeywords = ['họ tên', 'ho ten', 'tên người tiêm', 'họ tên người tiêm', 'họ và tên', 'tên khách hàng', 'tên bệnh nhân', 'bệnh nhân'].map(cleanString);
      const vaccineKeywords = ['vắc xin', 'vacxin', 'vaccine', 'tên vắc xin', 'tên thuốc', 'vắc-xin', 'vac-xin', 'tên thuốc tiêm', 'dịch vụ'].map(cleanString);

      for (let i = 0; i < Math.min(aoa.length, 15); i++) {
        const row = aoa[i];
        if (!Array.isArray(row)) continue;

        let hasName = false;
        let hasVaccine = false;

        for (const cell of row) {
          if (!cell) continue;
          const cellStr = cleanString(String(cell));

          if (nameKeywords.some((kw) => cellStr.includes(kw) || kw.includes(cellStr))) hasName = true;
          if (vaccineKeywords.some((kw) => cellStr.includes(kw) || kw.includes(cellStr))) hasVaccine = true;
        }

        if (hasName || hasVaccine) {
          headerRowIndex = i;
          break;
        }
      }

      const headers = (aoa[headerRowIndex] || []).map((h) => (h ? String(h).trim() : ''));
      const json: Record<string, unknown>[] = [];

      for (let i = headerRowIndex + 1; i < aoa.length; i++) {
        const rowData = aoa[i];
        if (!rowData || rowData.length === 0) continue;

        const obj: Record<string, unknown> = {};
        let hasData = false;
        for (let j = 0; j < headers.length; j++) {
          const key = headers[j];
          if (!key) continue;
          const cellVal = rowData[j];
          if (cellVal !== undefined && cellVal !== null && cellVal !== '') {
            obj[key] = cellVal;
            hasData = true;
          }
        }
        if (hasData) json.push(obj);
      }

      const mappedItems = json.map((row) => {
        const findVal = (keys: string[]) => {
          const matchKey = Object.keys(row).find((k) => {
            const cleanK = cleanString(k);
            return keys.some((key) => {
              const cleanKey = cleanString(key);
              return cleanK.includes(cleanKey) || cleanKey.includes(cleanK);
            });
          });
          return matchKey ? String(row[matchKey]).trim() : '';
        };

        const patientName = findVal(['họ tên', 'ho ten', 'tên người tiêm', 'họ tên người tiêm', 'patientname', 'name', 'họ và tên', 'khách hàng', 'bệnh nhân']);
        const rawVaccine = findVal(['mũi tiêm', 'mui tiem', 'vắc xin', 'vacxin', 'vaccine', 'tên vắc xin', 'tên thuốc', 'tên vacxin', 'vắc-xin', 'vac-xin', 'tên thuốc tiêm', 'dịch vụ', 'dich vu', 'tên hàng', 'ten hang', 'tên sản phẩm', 'ten san pham', 'sản phẩm', 'san pham', 'mặt hàng', 'mat hang', 'tên dịch vụ', 'ten dich vu']);
        const rawProtocol = findVal(['phác đồ', 'phac do', 'đối tượng', 'doi tuong', 'protocol']);

        let vaccine = 'Chưa chọn vắc xin';
        let protocolId = 'CUSTOM';
        let doseIndex = 0;

        if (rawVaccine) {
          const lowerV = rawVaccine.toLowerCase();
          let cleanVaccineStr = rawVaccine;
          if (lowerV.includes('mũi 1') || lowerV.includes('mui 1')) {
            doseIndex = 0;
            cleanVaccineStr = rawVaccine.replace(/mũi 1|mui 1/gi, '').trim();
          } else if (lowerV.includes('mũi 2') || lowerV.includes('mui 2')) {
            doseIndex = 1;
            cleanVaccineStr = rawVaccine.replace(/mũi 2|mui 2/gi, '').trim();
          } else if (lowerV.includes('mũi 3') || lowerV.includes('mui 3')) {
            doseIndex = 2;
            cleanVaccineStr = rawVaccine.replace(/mũi 3|mui 3/gi, '').trim();
          } else if (lowerV.includes('mũi 4') || lowerV.includes('mui 4')) {
            doseIndex = 3;
            cleanVaccineStr = rawVaccine.replace(/mũi 4|mui 4/gi, '').trim();
          } else if (lowerV.includes('mũi 5') || lowerV.includes('mui 5')) {
            doseIndex = 4;
            cleanVaccineStr = rawVaccine.replace(/mũi 5|mui 5/gi, '').trim();
          } else if (lowerV.includes('mũi 6') || lowerV.includes('mui 6')) {
            doseIndex = 5;
            cleanVaccineStr = rawVaccine.replace(/mũi 6|mui 6/gi, '').trim();
          } else if (lowerV.includes('mũi nhắc') || lowerV.includes('mui nhac') || lowerV.includes('nhắc') || lowerV.includes('nhac')) {
            doseIndex = 5;
            cleanVaccineStr = rawVaccine.replace(/mũi nhắc|mui nhac|nhắc|nhac/gi, '').trim();
          }

          const matchedProto = DATA.protocols.find((p) =>
            p.vaccine.toLowerCase().trim() === cleanVaccineStr.toLowerCase().trim() ||
            p.vaccine.toLowerCase().includes(cleanVaccineStr.toLowerCase().trim()) ||
            cleanVaccineStr.toLowerCase().includes(p.vaccine.toLowerCase().trim())
          );

          if (matchedProto) {
            vaccine = matchedProto.vaccine;
            protocolId = matchedProto.id;

            const allMatchingProtos = DATA.protocols.filter((p) => p.vaccine === matchedProto.vaccine);
            if (allMatchingProtos.length > 1) {
              if (rawProtocol) {
                const bestProto = allMatchingProtos.find((p) =>
                  p.object.toLowerCase().includes(rawProtocol.toLowerCase().trim()) ||
                  p.id.toLowerCase() === rawProtocol.toLowerCase().trim()
                );
                if (bestProto) protocolId = bestProto.id;
              } else {
                const dobVal = findVal(['ngày sinh', 'ngay sinh', 'dob', 'birth', 'năm sinh']);
                const dobDate = dobVal ? parseDate(dobVal) : null;
                if (dobDate) {
                  const ageMonths = monthsAge(dobDate, new Date());
                  if (matchedProto.vaccine === 'Prevenar 13' || matchedProto.vaccine === 'Prevenar 20') {
                    if (ageMonths < 7) {
                      const p = allMatchingProtos.find((p) => p.id.includes('P2_0') || p.id.includes('P50_50'));
                      if (p) protocolId = p.id;
                    } else if (ageMonths < 12) {
                      const p = allMatchingProtos.find((p) => p.id.includes('P3_1') || p.id.includes('P51_51'));
                      if (p) protocolId = p.id;
                    } else if (ageMonths < 24) {
                      const p = allMatchingProtos.find((p) => p.id.includes('P4_2') || p.id.includes('P52_52'));
                      if (p) protocolId = p.id;
                    } else {
                      const p = allMatchingProtos.find((p) => p.id.includes('ADULT') || p.id.includes('P53_53'));
                      if (p) protocolId = p.id;
                    }
                  }
                }
              }
            }
          } else {
            vaccine = cleanVaccineStr;
            protocolId = 'CUSTOM';
          }
        }

        const findDateVal = (doseNum: number) => {
          const matchKey = Object.keys(row).find((k) => {
            const cleanK = cleanString(k);
            const hasDose = cleanK.includes(`mui${doseNum}`) || cleanK.includes(`ngaytiem${doseNum}`) || (doseNum === 6 && cleanK.includes('muinhac'));
            if (!hasDose) return false;
            const isReminder = cleanK.includes('hen') || cleanK.includes('kehoach') || cleanK.includes('dukien');
            return !isReminder;
          });
          return matchKey ? String(row[matchKey]).trim() : '';
        };

        const dates = [1, 2, 3, 4, 5, 6].map((idx) => {
          const v = findDateVal(idx);
          return v ? maskDateText(v) : '';
        });

        const dueOverrides = Array(6).fill('');

        const hasSeparateDoseCols = dates.some((d) => d !== '');
        if (!hasSeparateDoseCols) {
          const singleActualDate = findVal(['ngày tiêm', 'ngay tiem', 'ngày tiêm thực tế', 'ngay tiem thuc te']);
          const singlePlannedDate = findVal(['kế hoạch tiêm', 'ke hoach tiem', 'kế hoạch', 'ke hoach', 'ngày hẹn', 'ngay hen']);

          if (singleActualDate) dates[doseIndex] = maskDateText(singleActualDate);
          if (singlePlannedDate && doseIndex < 5) dueOverrides[doseIndex + 1] = maskDateText(singlePlannedDate);
        }

        const notes = Array(6).fill('');
        const canBoTiem = findVal(['cán bộ tiêm', 'can bo tiem', 'người tiêm', 'nguoi tiem', 'bác sĩ', 'bac si', 'y tá', 'y ta', 'điều dưỡng', 'dieu duong']);
        if (canBoTiem) notes[doseIndex] = `CB tiêm: ${canBoTiem}`;

        return {
          patientCode: findVal(['mã đối tượng', 'mã bn', 'ma doi tuong', 'mã bệnh nhân', 'code', 'patientcode']),
          patientName,
          phone: findVal(['số điện thoại', 'điện thoại', 'sđt', 'so dien thoai', 'phone', 'đt', 'dt']),
          dob: findVal(['ngày sinh', 'ngay sinh', 'dob', 'birth', 'năm sinh'])
            ? maskDateText(findVal(['ngày sinh', 'ngay sinh', 'dob', 'birth', 'năm sinh']))
            : '',
          gender: findVal(['giới tính', 'gioi tinh', 'gender', 'sex', 'nam/nữ']),
          address: findVal(['địa chỉ', 'dia chi', 'address', 'nơi ở', 'noi o']),
          vaccine,
          protocolId,
          dates,
          dueOverrides,
          notes,
        };
      });

      const validItems = mappedItems.filter((item) => item.patientName);
      if (validItems.length === 0) {
        const allKeys = Object.keys(json[0] || {});
        const debugMsg = allKeys.length > 0
          ? `\n\n(Các cột hệ thống đọc được trong file của bạn: "${allKeys.join('", "')}")`
          : '\n\n(Không tìm thấy dữ liệu hoặc cột nào trong file)';
        throw new Error('Không tìm thấy dòng dữ liệu hợp lệ nào chứa cột Họ tên khách hàng.' + debugMsg);
      }

      setImportStatus(`Đang upload ${validItems.length} dòng dữ liệu...`);

      const response = await fetch('/api/cskh-tiem-chung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validItems),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      alert(result.message);
      handleClose();
      onImported();
    } catch (err) {
      setImportStatus('Lỗi import: ' + (err as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider">
            Nhập danh sách từ Excel
          </h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-650 text-lg font-bold">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Chọn file Excel (.xlsx / .xls)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 cursor-pointer relative">
              <FileSpreadsheet className="h-8 w-8 text-teal-600 mb-2 animate-bounce" />
              <span className="text-xs font-bold text-slate-600">
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
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
              >
                {sheetsList.map((sheetName) => (
                  <option key={sheetName} value={sheetName}>
                    {sheetName}
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
            onClick={handleClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-55"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isImporting || !importFile || sheetsList.length === 0}
            onClick={triggerImport}
            className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-teal-900/10"
          >
            {isImporting ? 'Đang nhập...' : 'Bắt đầu Nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}
