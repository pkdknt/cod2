'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { detectHeaderRow, mapColumnsByRegex, readSheetMatrix, rowsToObjects, readSheetNames } from '@/lib/excelImport';
import type { BhytCustomerInput } from '@/lib/types';

const COLUMN_RULES: [RegExp, string][] = [
  [/ho ten|ho va ten|^ten$|ten khach|ten benh nhan|ten nguoi benh|ten nguoi tiem/, 'hoTen'],
  [/ma so bhxh|ma bhxh|ma so bhyt|ma bhyt|ma the bhyt/, 'maBHXH'],
  [/cccd|cmnd|can cuoc|so dinh danh/, 'cccd'],
  [/ngay.*sinh|nam sinh/, 'ngaySinh'],
  [/gioi tinh/, 'gioiTinh'],
  [/khai sinh/, 'noiKhaiSinh'],
  [/kcb ban dau/, 'noiKCB'],
  [/ngay bien lai/, 'ngayBienLai'],
  [/so bien lai/, 'soBienLai'],
  [/tien luong|so tien dong/, 'soTienDong'],
  [/ho tro/, 'hoTroThem'],
  [/ma so nhan vien thu|ma nv thu/, 'maNVThu'],
  [/dien thoai|so dien thoai/, 'dienThoai'],
  [/thoi han su dung the.*den ngay|han the den ngay/, 'hanThe'],
  [/gia han tang moi|loai ho so/, 'loaiHoSo'],
  [/ngay goi/, 'ngayGoi'],
  [/trang thai xu ly/, 'workflowStatus'],
  [/nguoi quen|nguoi nha nv/, 'nguoiGioiThieu'],
  [/ghi chu/, 'ghiChu'],
];

interface ImportBhytModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function ImportBhytModal({ open, onClose, onImported }: ImportBhytModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [sheet, setSheet] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setFile(null);
    setSheets([]);
    setSheet('');
    setStatus('');
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setStatus('Đang đọc file...');
    try {
      const names = await readSheetNames(picked);
      setSheets(names);
      setSheet(names[0] || '');
      setStatus(`Đọc được ${names.length} sheet. Chọn sheet rồi bấm Nhập.`);
    } catch (err) {
      setStatus('Lỗi đọc file: ' + (err as Error).message);
    }
  };

  const runImport = async () => {
    if (!file) return;
    setBusy(true);
    setStatus('Đang phân tích file...');
    try {
      const matrix = await readSheetMatrix(file, sheet || undefined);
      const headerIndex = detectHeaderRow(
        matrix,
        [
          (k) => k.includes('ten'),
          (k) => k.includes('bhxh') || k.includes('bhyt') || k.includes('sinh') || k.includes('cccd'),
        ],
        0
      );
      const headers = (matrix[headerIndex] || []).map((c) => String(c ?? ''));
      const fieldMap = mapColumnsByRegex(headers, COLUMN_RULES);

      if (fieldMap.hoTen === undefined && fieldMap.maBHXH === undefined) {
        throw new Error('Không tìm thấy cột Họ tên hoặc Mã số BHXH trong file.');
      }

      const raw = rowsToObjects(matrix, headerIndex, fieldMap);
      const records: BhytCustomerInput[] = raw
        .map((r) => {
          const out: BhytCustomerInput = { hoTen: String(r.hoTen ?? '').trim() };
          for (const [field, value] of Object.entries(r)) {
            if (field === 'hoTen') continue;
            (out as Record<string, unknown>)[field] = value == null ? '' : String(value).trim();
          }
          return out;
        })
        .filter((r) => r.hoTen || r.maBHXH);

      if (records.length === 0) {
        const found = headers.filter(Boolean).join('", "');
        throw new Error(`Không tìm thấy dòng dữ liệu hợp lệ. Các cột đọc được: "${found}"`);
      }

      setStatus(`Đang tải lên ${records.length} dòng...`);
      const res = await fetch('/api/bhyt/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: records }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast(result.message, 'success');
      reset();
      onClose();
      onImported();
    } catch (err) {
      setStatus('Lỗi import: ' + (err as Error).message);
      toast('Nhập dữ liệu thất bại', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Nhập dữ liệu BHYT từ Excel"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Hủy
          </Button>
          <Button variant="primary" onClick={runImport} loading={busy} disabled={!file}>
            <Upload className="h-4 w-4" /> Bắt đầu nhập
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-ink-soft mb-1">Chọn file Excel / CSV</label>
          <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-canvas p-6">
            <FileSpreadsheet className="mb-2 h-8 w-8 text-primary" />
            <span className="text-xs font-bold text-ink-soft">{file ? file.name : 'Click để chọn file'}</span>
            <input
              type="file"
              accept=".xlsx,.xls,.xlsm,.xlsb,.csv,.ods,.json"
              onChange={onPickFile}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>
        </div>

        {sheets.length > 1 && (
          <div>
            <label className="block text-xs font-bold text-ink-soft mb-1">Sheet dữ liệu</label>
            <select
              value={sheet}
              onChange={(e) => setSheet(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs font-semibold outline-none focus:border-primary"
            >
              {sheets.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {status && (
          <div className="rounded-xl border border-teal-100 bg-primary-soft p-3 text-[11px] font-semibold leading-relaxed text-primary-strong">
            {status}
          </div>
        )}

        <p className="text-[11px] font-medium leading-relaxed text-ink-muted">
          Hệ thống tự dò dòng tiêu đề và map cột (Họ tên, Mã số BHXH, CCCD, Ngày sinh, Hạn thẻ, Điện thoại, Ghi chú…).
          Bản ghi trùng (trùng tên + năm sinh + khớp BHYT/CCCD) sẽ được gộp, bản có hạn thẻ mới hơn được giữ.
        </p>
      </div>
    </Modal>
  );
}
