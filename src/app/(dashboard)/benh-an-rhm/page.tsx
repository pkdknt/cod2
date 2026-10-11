'use client';

import React, { useRef, useState } from 'react';
import { Download, FileText, Plus, Printer, Trash2, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardHeader } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import DentalRecord from '@/components/print/DentalRecord';
import PageStyle from '@/components/print/PageStyle';
import { detectHeaderRow, mapColumnsByRegex, readSheetMatrix, rowsToObjects } from '@/lib/excelImport';
import { exportElementsToPdf, printNow } from '@/lib/pdf';
import {
  DENTAL_COLUMN_RULES,
  DENTAL_FIELDS,
  DEFAULT_DENTAL_HEADER,
  type DentalHeader,
  type DentalRecord as DentalRecordType,
} from '@/lib/dentalRecord';
import '@/styles/print.css';
import '@/styles/dental-record.css';

type Side = 'both' | 'front' | 'back';

export default function BenhAnRhmPage() {
  const { toast } = useToast();
  const [header, setHeader] = useState<DentalHeader>(DEFAULT_DENTAL_HEADER);
  const [records, setRecords] = useState<DentalRecordType[]>([]);
  const [current, setCurrent] = useState(0);
  const [from, setFrom] = useState('1');
  const [to, setTo] = useState('');
  const [side, setSide] = useState<Side>('both');
  const fileRef = useRef<HTMLInputElement>(null);

  const record = records[current] ?? {};

  const updateRecord = (patch: Partial<DentalRecordType>) => {
    setRecords((prev) => {
      const next = [...prev];
      next[current] = { ...(next[current] ?? {}), ...patch };
      return next;
    });
  };

  const addRecord = () => {
    setRecords((prev) => [...prev, {}]);
    setCurrent(records.length);
  };

  const deleteRecord = () => {
    if (records.length === 0) return;
    const nextLen = records.length - 1;
    setRecords((prev) => prev.filter((_, i) => i !== current));
    setCurrent((c) => Math.min(c, Math.max(0, nextLen - 1)));
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const matrix = await readSheetMatrix(file);
      const headerIndex = detectHeaderRow(
        matrix,
        [(k) => k.includes('ten'), (k) => k.includes('ngoai tru') || k.includes('benh nhan') || k.includes('chan doan')],
        0
      );
      const headers = (matrix[headerIndex] || []).map((c) => String(c ?? ''));
      const fieldMap = mapColumnsByRegex(headers, DENTAL_COLUMN_RULES);
      const raw = rowsToObjects(matrix, headerIndex, fieldMap);
      const rows: DentalRecordType[] = raw
        .map((r) => {
          const rec: DentalRecordType = {};
          for (const [k, v] of Object.entries(r)) (rec as Record<string, unknown>)[k] = v == null ? '' : String(v).trim();
          return rec;
        })
        .filter((r) => r.hoTen || r.soNgoaiTru || r.soLuuTru);
      if (rows.length === 0) throw new Error('Không tìm thấy hồ sơ hợp lệ (cần Họ tên / Số ngoại trú / Số lưu trữ).');
      setRecords(rows);
      setCurrent(0);
      setTo(String(rows.length));
      toast(`Đã đọc ${rows.length} hồ sơ.`, 'success');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const total = records.length || 1;
  const fromN = Math.max(1, parseInt(from || '1', 10));
  const toN = Math.min(total, parseInt(to || String(total), 10));
  // Index of the last record inside the print range — used to avoid a trailing blank page.
  const lastIndex = toN >= fromN ? toN - 1 : -1;

  const handlePdf = async () => {
    try {
      await exportElementsToPdf('.dr-sheet:not(.dr-hidden)', {
        fileName: `Benh_an_RHM_${new Date().toISOString().slice(0, 10)}.pdf`,
        format: 'a3',
        orientation: 'landscape',
      });
      toast('Đã xuất PDF.', 'success');
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageStyle size="A3 landscape" />
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-ink md:text-2xl">
            <FileText className="h-5 w-5 text-primary md:h-6 md:w-6" /> BỆNH ÁN RĂNG HÀM MẶT (A3)
          </h1>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-muted md:text-xs">
            In A3 ngang 2 mặt: kế hoạch điều trị + hành chính (mặt trước), tổn thương + tổng kết (mặt sau).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<Upload className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>Nhập Excel</Button>
          <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={handlePdf}>Xuất PDF</Button>
          <Button variant="primary" icon={<Printer className="h-4 w-4" />} onClick={printNow}>In</Button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[400px_1fr]">
        <div className="space-y-4 print:hidden">
          <Card flush>
            <div className="p-5">
              <CardHeader title="Phạm vi in" />
              <div className="grid grid-cols-3 gap-3">
                <Field label="Từ hồ sơ">
                  <Input type="number" min={1} value={from} onChange={(e) => setFrom(e.target.value)} />
                </Field>
                <Field label="Đến hồ sơ">
                  <Input type="number" min={1} value={to} onChange={(e) => setTo(e.target.value)} />
                </Field>
                <Field label="Mặt in">
                  <Select value={side} onChange={(e) => setSide(e.target.value as Side)}>
                    <option value="both">Cả 2 mặt</option>
                    <option value="front">Mặt trước</option>
                    <option value="back">Mặt sau</option>
                  </Select>
                </Field>
              </div>
            </div>
          </Card>

          <Card flush>
            <div className="p-5">
              <CardHeader title="Đầu bìa / tiêu đề" />
              <div className="space-y-3">
                <Field label="Sở Y tế"><Input value={header.soYTe} onChange={(e) => setHeader({ ...header, soYTe: e.target.value })} /></Field>
                <Field label="Phòng khám"><Input value={header.tenPhongKham} onChange={(e) => setHeader({ ...header, tenPhongKham: e.target.value })} /></Field>
                <Field label="Khoa"><Input value={header.khoa} onChange={(e) => setHeader({ ...header, khoa: e.target.value })} /></Field>
                <Field label="Tiêu đề 1"><Input value={header.tieuDe1} onChange={(e) => setHeader({ ...header, tieuDe1: e.target.value })} /></Field>
                <Field label="Tiêu đề 2"><Input value={header.tieuDe2} onChange={(e) => setHeader({ ...header, tieuDe2: e.target.value })} /></Field>
              </div>
            </div>
          </Card>

          <Card flush>
            <div className="p-5">
              <CardHeader
                title="Thông tin hồ sơ"
                actions={
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={addRecord}>Thêm</Button>
                    <Button variant="secondary" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={deleteRecord} disabled={!records.length}>Xoá</Button>
                  </div>
                }
              />
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-ink-muted">
                <span>Hồ sơ {Math.min(current + 1, total)}/{total}</span>
                <button type="button" onClick={() => setCurrent((c) => Math.max(0, c - 1))} className="pressable rounded border border-line px-2 py-0.5">◀</button>
                <button type="button" onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))} className="pressable rounded border border-line px-2 py-0.5">▶</button>
              </div>
              <div className="max-h-[46vh] grid grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                {DENTAL_FIELDS.map((f) => (
                  <Field key={String(f.key)} label={f.label}>
                    <Input value={String(record[f.key] ?? '')} onChange={(e) => updateRecord({ [f.key]: e.target.value } as Partial<DentalRecordType>)} />
                  </Field>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="print-area">
          {records.length === 0 ? (
            <EmptyState
              title="Chưa có hồ sơ bệnh án"
              description="Nhập file Excel hoặc bấm Thêm để nhập tay."
              action={<Button variant="primary" size="sm" onClick={() => fileRef.current?.click()}>Chọn file Excel</Button>}
            />
          ) : (
            records.map((r, index) => {
              const inRange = index + 1 >= fromN && index + 1 <= toN;
              return (
                <DentalRecord
                  key={index}
                  record={r}
                  header={header}
                  index={index}
                  showFront={inRange && side !== 'back'}
                  showBack={inRange && side !== 'front'}
                  frontLast={side === 'front' && index === lastIndex}
                  backLast={side !== 'front' && index === lastIndex}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
