'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Download, FileBadge, Plus, Printer, Trash2, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardHeader } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import RecordCover from '@/components/print/RecordCover';
import PageStyle from '@/components/print/PageStyle';
import { detectHeaderRow, mapColumnsByRegex, readSheetMatrix, rowsToObjects } from '@/lib/excelImport';
import { exportElementsToPdf, printNow } from '@/lib/pdf';
import {
  CLINIC_LINES,
  COVER_COLUMN_RULES,
  COVER_FIELDS,
  COVER_PRESETS,
  defaultCoverHeader,
  type CoverHeader,
  type CoverRecord,
  type CoverType,
} from '@/lib/recordCover';
import '@/styles/print.css';
import '@/styles/record-cover.css';

export default function BiaBenhAnPage() {
  const { toast } = useToast();
  const [type, setType] = useState<CoverType>('ngoaitru');
  const [header, setHeader] = useState<CoverHeader>(defaultCoverHeader('ngoaitru'));
  const [rows, setRows] = useState<CoverRecord[]>([]);
  const [current, setCurrent] = useState(0);
  const [logoSrc, setLogoSrc] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const currentRow = rows[current] ?? {};

  const changeType = (next: CoverType) => {
    setType(next);
    setHeader((prev) => ({ ...prev, tenBenhAn: COVER_PRESETS[next], ...CLINIC_LINES }));
  };

  const updateRow = (patch: Partial<CoverRecord>) => {
    setRows((prev) => {
      const next = [...prev];
      next[current] = { ...(next[current] ?? {}), ...patch };
      return next;
    });
  };

  const addRow = () => {
    setRows((prev) => [...prev, {}]);
    setCurrent(rows.length);
  };

  const deleteRow = () => {
    if (rows.length === 0) return;
    setRows((prev) => prev.filter((_, i) => i !== current));
    setCurrent((c) => Math.max(0, c - 1));
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    try {
      const collected: CoverRecord[] = [];
      for (const file of files) {
        const matrix = await readSheetMatrix(file);
        const headerIndex = detectHeaderRow(
          matrix,
          [(k) => k.includes('ten'), (k) => k.includes('luu tru') || k.includes('ho so') || k.includes('vao vien')],
          0
        );
        const headers = (matrix[headerIndex] || []).map((c) => String(c ?? ''));
        const fieldMap = mapColumnsByRegex(headers, COVER_COLUMN_RULES);
        const raw = rowsToObjects(matrix, headerIndex, fieldMap);
        for (const r of raw) {
          const rec: CoverRecord = {};
          for (const [k, v] of Object.entries(r)) (rec as Record<string, unknown>)[k] = v == null ? '' : String(v).trim();
          if (rec.hoTen || rec.soLuuTru || rec.maBenhNhan) collected.push(rec);
        }
      }
      if (collected.length === 0) throw new Error('Không tìm thấy dòng dữ liệu hợp lệ (cần Họ tên / Số lưu trữ / Mã bệnh nhân).');
      setRows(collected);
      setCurrent(0);
      toast(`Đã đọc ${collected.length} bìa.`, 'success');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoSrc(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  };

  const previewRows = useMemo(() => (rows.length > 0 ? rows : [{}]), [rows]);

  const handlePdf = async () => {
    try {
      await exportElementsToPdf('.cv-sheet', {
        fileName: `BIA_BENH_AN_${type.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.pdf`,
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
            <FileBadge className="h-5 w-5 text-primary md:h-6 md:w-6" /> IN BÌA BỆNH ÁN
          </h1>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-muted md:text-xs">
            1 bìa / 1 trang A3 ngang — 3 mẫu: Ngoại trú / Răng hàm mặt / Y học cổ truyền.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<Upload className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>Nhập Excel</Button>
          <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={handlePdf}>Xuất PDF</Button>
          <Button variant="primary" icon={<Printer className="h-4 w-4" />} onClick={printNow}>In tất cả</Button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" multiple onChange={handleImport} className="hidden" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_1fr]">
        <div className="space-y-4 print:hidden">
          <Card flush>
            <div className="p-5">
              <CardHeader title="Đầu bìa (mẫu phòng khám)" />
              <div className="space-y-3">
                <Field label="Loại bìa">
                  <Select value={type} onChange={(e) => changeType(e.target.value as CoverType)}>
                    <option value="ngoaitru">Bệnh án Ngoại Trú</option>
                    <option value="rhm">Bệnh án Răng Hàm Mặt</option>
                    <option value="yhct">Bệnh án Y học Cổ truyền</option>
                  </Select>
                </Field>
                <Field label="Tiêu đề bệnh án">
                  <Input value={header.tenBenhAn} onChange={(e) => setHeader({ ...header, tenBenhAn: e.target.value })} />
                </Field>
                <div className="grid grid-cols-1 gap-3">
                  <Field label="Dòng 1 (khoá theo mẫu)">
                    <Input value={header.dongPK1} onChange={(e) => setHeader({ ...header, dongPK1: e.target.value })} />
                  </Field>
                  <Field label="Dòng 2 (khoá theo mẫu)">
                    <Input value={header.dongPK2} onChange={(e) => setHeader({ ...header, dongPK2: e.target.value })} />
                  </Field>
                  <Field label="Dòng 3 (khoá theo mẫu)">
                    <Input value={header.dongPK3} onChange={(e) => setHeader({ ...header, dongPK3: e.target.value })} />
                  </Field>
                </div>
                <Button variant="secondary" size="sm" onClick={() => { setHeader({ ...header, ...CLINIC_LINES }); toast('Đã khôi phục mẫu đầu bìa.', 'success'); }}>
                  Khôi phục mẫu đầu bìa
                </Button>
                <Field label="Logo phòng khám">
                  <input ref={logoRef} type="file" accept="image/*" onChange={handleLogo} className="block w-full text-xs" />
                </Field>
              </div>
            </div>
          </Card>

          <Card flush>
            <div className="p-5">
              <CardHeader
                title="Thông tin bìa"
                actions={
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={addRow}>Thêm</Button>
                    <Button variant="secondary" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={deleteRow} disabled={rows.length === 0}>Xoá</Button>
                  </div>
                }
              />
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-ink-muted">
                <span>Bìa {Math.min(current + 1, previewRows.length)}/{previewRows.length}</span>
                <button type="button" onClick={() => setCurrent((c) => Math.max(0, c - 1))} className="pressable rounded border border-line px-2 py-0.5">◀</button>
                <button type="button" onClick={() => setCurrent((c) => Math.min(previewRows.length - 1, c + 1))} className="pressable rounded border border-line px-2 py-0.5">▶</button>
              </div>
              <div className="max-h-[46vh] space-y-3 overflow-y-auto pr-1">
                {COVER_FIELDS.map((f) => (
                  <Field key={String(f.key)} label={f.label}>
                    <Input
                      value={String(currentRow[f.key as keyof CoverRecord] ?? '')}
                      onChange={(e) => updateRow({ [f.key]: e.target.value } as Partial<CoverRecord>)}
                    />
                  </Field>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="print-area">
          {rows.length === 0 ? (
            <EmptyState
              title="Chưa có dữ liệu bìa"
              description="Nhập file Excel (nhiều file cùng lúc) hoặc bấm Thêm để nhập tay."
              action={<Button variant="primary" size="sm" onClick={() => fileRef.current?.click()}>Chọn file Excel</Button>}
            />
          ) : (
            previewRows.map((record, index) => (
              <RecordCover key={index} record={record} header={header} logoSrc={logoSrc || undefined} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
