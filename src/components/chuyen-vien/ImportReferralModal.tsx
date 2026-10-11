'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { detectHeaderRow, mapColumnsByRegex, readSheetMatrix, readSheetNames, rowsToObjects } from '@/lib/excelImport';
import { REFERRAL_COLUMN_RULES, type ReferralInput } from '@/lib/referral';

interface ImportReferralModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export default function ImportReferralModal({ open, onClose, onImported }: ImportReferralModalProps) {
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

  const close = () => {
    reset();
    onClose();
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
        [(k) => k.includes('ten'), (k) => k.includes('chuyen') || k.includes('benh vien') || k.includes('ngay')],
        0
      );
      const headers = (matrix[headerIndex] || []).map((c) => String(c ?? ''));
      const fieldMap = mapColumnsByRegex(headers, REFERRAL_COLUMN_RULES);

      if (fieldMap.name === undefined) {
        throw new Error('Không tìm thấy cột "Họ tên" trong file.');
      }

      const raw = rowsToObjects(matrix, headerIndex, fieldMap);
      const records: ReferralInput[] = raw
        .map((r) => {
          const out: ReferralInput = { name: String(r.name ?? '').trim() };
          for (const [field, value] of Object.entries(r)) {
            if (field === 'name') continue;
            (out as Record<string, unknown>)[field] = value == null ? '' : String(value).trim();
          }
          return out;
        })
        .filter((r) => r.name || r.patientCode || r.admissionNo || r.phone);

      if (records.length === 0) {
        throw new Error('Không có dòng dữ liệu hợp lệ nào (cần ít nhất Họ tên / Mã BN / Số nhập viện / SĐT).');
      }

      setStatus(`Đang tải lên ${records.length} dòng...`);
      const res = await fetch('/api/cskh-chuyen-vien/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: records }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast(result.message, 'success');
      close();
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
      onClose={close}
      title="Nhập danh sách chuyển viện từ Excel"
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={busy}>Hủy</Button>
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
              accept=".xlsx,.xls,.xlsm,.xlsb,.csv,.ods"
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
              {sheets.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {status && (
          <div className="rounded-xl border border-teal-100 bg-primary-soft p-3 text-[11px] font-semibold leading-relaxed text-primary-strong">
            {status}
          </div>
        )}

        <p className="text-[11px] font-medium leading-relaxed text-ink-muted">
          Hệ thống tự dò dòng tiêu đề và map cột (Ngày, Số nhập viện, Mã BN, Họ tên, Giới tính, Tuổi, SĐT, BHYT,
          Hạn thẻ, BV chuyển đến, Chẩn đoán, Bác sĩ, Kết quả gọi, Trạng thái, Ghi chú, VIP…). Dòng thiếu cả
          Họ tên / Mã BN / Số nhập viện / SĐT sẽ bị bỏ qua.
        </p>
      </div>
    </Modal>
  );
}
