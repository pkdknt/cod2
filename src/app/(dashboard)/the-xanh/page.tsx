'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Download, FileSpreadsheet, Printer, Settings2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardHeader } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import HealthCard, { type HealthCardData, type HealthCardTemplate, type Signer } from '@/components/print/HealthCard';
import PageStyle from '@/components/print/PageStyle';
import { detectHeaderRow, mapColumnsByRegex, readSheetMatrix, rowsToObjects } from '@/lib/excelImport';
import { displayDate } from '@/lib/bhyt';
import { exportElementsToPdf, printNow } from '@/lib/pdf';
import '@/styles/print.css';
import '@/styles/health-card.css';

const DEFAULT_TEMPLATE: HealthCardTemplate = {
  companyLine1: 'CTY TNHH PKĐK NHƠN TÂM',
  companyLine2: 'PHÒNG KHÁM ĐA KHOA',
  companyLine3: 'NHƠN TÂM',
  certPrefix: 'Số:',
  certSuffix: '/26/CNSKTX',
  nation: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
  nationSub: 'Độc lập - Tự do - Hạnh phúc',
  title: 'CHỨNG NHẬN SỨC KHỎE',
  labelName: 'Họ tên:',
  labelBirth: 'Sinh năm:',
  labelGender: 'Giới tính:',
  labelAddress: 'Hiện cư ngụ tại:',
  labelUnit: 'Đơn vị:',
  labelExamDate: 'Kiểm tra sức khỏe ngày:',
  labelConclusion: 'Kết luận:',
  conclusion: 'ĐỦ SỨC KHỎE',
};

const TEMPLATE_FIELDS: { key: keyof HealthCardTemplate; label: string }[] = [
  { key: 'companyLine1', label: 'Dòng 1' },
  { key: 'companyLine2', label: 'Dòng 2' },
  { key: 'companyLine3', label: 'Dòng 3' },
  { key: 'certPrefix', label: 'Tiền tố số' },
  { key: 'certSuffix', label: 'Hậu tố số' },
  { key: 'title', label: 'Tiêu đề' },
  { key: 'conclusion', label: 'Kết luận' },
];

const COLUMN_RULES: [RegExp, string][] = [
  [/^code$|^ma$|^ma so$|^so$|^stt$|^so tt$|^so the$|^so phieu$|^so chung nhan$/, 'code'],
  [/^ten$|ho ten|ho va ten|ten khach|ten nguoi/, 'name'],
  [/nam sinh|ngay sinh/, 'birth'],
  [/gioi tinh/, 'gender'],
  [/dia chi|cu ngu|cu tru/, 'address'],
  [/don vi|cong ty|to chuc/, 'unit'],
  [/ngay kham|ngay kiem tra/, 'examDate'],
];

const DIRECTOR: Signer = { role: 'GIÁM ĐỐC', name: 'BS. CKI. NGUYỄN THỊ HIỀN' };
const VICE: Signer = { role: 'PHÓ GIÁM ĐỐC', name: 'BS. CKI. LÊ THỊ THU BA' };

/** Render a date cell as dd/mm/yyyy (Excel dates arrive as serial numbers). */
function fmtDateCell(value: unknown): string {
  return displayDate(value) || String(value ?? '').trim();
}

function signerFor(index: number, mode: string): Signer {
  if (mode === 'director') return DIRECTOR;
  if (mode === 'vice') return VICE;
  return index % 2 === 0 ? DIRECTOR : VICE;
}

export default function TheXanhPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<HealthCardData[]>([]);
  const [template, setTemplate] = useState<HealthCardTemplate>(DEFAULT_TEMPLATE);
  const [signMode, setSignMode] = useState('alternate');
  const [defaultCode, setDefaultCode] = useState('07072602');
  const [showSettings, setShowSettings] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const pages = useMemo(() => {
    const out: HealthCardData[][] = [];
    for (let i = 0; i < rows.length; i += 4) out.push(rows.slice(i, i + 4));
    return out;
  }, [rows]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const matrix = await readSheetMatrix(file);
      const headerIndex = detectHeaderRow(
        matrix,
        [(k) => k.includes('ten'), (k) => k.includes('sinh') || k.includes('code') || k.includes('ma')],
        0
      );
      const headers = (matrix[headerIndex] || []).map((c) => String(c ?? ''));
      const fieldMap = mapColumnsByRegex(headers, COLUMN_RULES);
      const raw = rowsToObjects(matrix, headerIndex, fieldMap);

      const data: HealthCardData[] = raw.map((r) => ({
        code: String(r.code ?? ''),
        name: String(r.name ?? ''),
        birth: fmtDateCell(r.birth),
        gender: String(r.gender ?? ''),
        address: String(r.address ?? ''),
        unit: String(r.unit ?? ''),
        examDate: fmtDateCell(r.examDate),
      }));

      if (!data.some((d) => d.name)) {
        throw new Error('Không tìm thấy cột tên người kiểm tra trong file.');
      }
      setRows(data);
      toast(`Đã đọc ${data.length} dòng dữ liệu.`, 'success');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleExportPdf = async () => {
    try {
      await exportElementsToPdf('.hc-page', {
        fileName: 'The_Chung_Nhan_Suc_Khoe.pdf',
        format: 'a4',
        orientation: 'landscape',
      });
      toast('Đã xuất PDF.', 'success');
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageStyle size="A4 landscape" margin="4mm" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-ink md:text-2xl">
            <FileSpreadsheet className="h-5 w-5 text-primary md:h-6 md:w-6" /> THẺ CHỨNG NHẬN SỨC KHỎE
          </h1>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-muted md:text-xs">
            Mail merge A4 ngang — 4 thẻ lớn 14.6 × 9.9cm mỗi trang, luân phiên người ký.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<Settings2 className="h-4 w-4" />} onClick={() => setShowSettings((s) => !s)}>
            {showSettings ? 'Ẩn cài đặt' : 'Hiện cài đặt'}
          </Button>
          <Button variant="secondary" icon={<Download className="h-4 w-4" />} onClick={handleExportPdf} disabled={!rows.length}>
            Xuất PDF
          </Button>
          <Button variant="primary" icon={<Printer className="h-4 w-4" />} onClick={printNow} disabled={!rows.length}>
            In thẻ
          </Button>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-4 ${showSettings ? 'xl:grid-cols-[360px_1fr]' : ''}`}>
        {showSettings && (
          <div className="space-y-4">
            <Card flush>
              <div className="p-5">
                <CardHeader title="Dữ liệu nguồn" subtitle="Đọc file Excel (.xlsx / .csv)" />
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="block w-full text-xs" />
                <p className="mt-3 text-[11px] font-medium leading-relaxed text-ink-muted">
                  Cột cần có: Mã/Số, Tên, Năm sinh, Giới tính, Địa chỉ, Đơn vị, Ngày khám.
                </p>
              </div>
            </Card>

            <Card flush>
              <div className="p-5">
                <CardHeader title="Nội dung thẻ" />
                <div className="space-y-3">
                  {TEMPLATE_FIELDS.map((f) => (
                    <Field key={String(f.key)} label={f.label}>
                      <Input
                        value={template[f.key]}
                        onChange={(e) => setTemplate({ ...template, [f.key]: e.target.value })}
                      />
                    </Field>
                  ))}
                  <Field label="Mã số mặc định (khi thiếu trong Excel)">
                    <Input value={defaultCode} onChange={(e) => setDefaultCode(e.target.value)} />
                  </Field>
                  <Field label="Người ký">
                    <Select value={signMode} onChange={(e) => setSignMode(e.target.value)}>
                      <option value="alternate">Luân phiên 2 người</option>
                      <option value="director">Tất cả: Giám đốc</option>
                      <option value="vice">Tất cả: Phó Giám đốc</option>
                    </Select>
                  </Field>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="print-area">
          {rows.length === 0 ? (
            <EmptyState
              title="Chưa có dữ liệu"
              description="Nhập file Excel hoặc thêm tay để xem trước thẻ chứng nhận sức khỏe."
              action={
                <Button variant="primary" size="sm" onClick={() => fileRef.current?.click()}>
                  Chọn file Excel
                </Button>
              }
            />
          ) : (
            pages.map((pageRows, pageIndex) => (
              <div key={pageIndex} className="hc-page">
                {pageRows.map((row, i) => (
                  <HealthCard
                    key={`${pageIndex}-${i}`}
                    data={{ ...row, code: row.code || defaultCode }}
                    template={template}
                    signer={signerFor(pageIndex * 4 + i, signMode)}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
