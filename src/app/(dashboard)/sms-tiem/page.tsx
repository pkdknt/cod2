'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Download, FileSpreadsheet, MessageSquare, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, StatCard } from '@/components/ui/Card';
import { Field, Textarea } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { detectHeaderRow, mapColumnsByRegex, readSheetMatrix, rowsToObjects } from '@/lib/excelImport';
import {
  buildVaccineRows,
  DEFAULT_VACCINE_SMS_TEMPLATE,
  exportVaccineSms,
  VACCINE_SMS_COLUMN_RULES,
  type VaccineSmsRow,
} from '@/lib/sms';

export default function SmsTiemPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<VaccineSmsRow[]>([]);
  const [template, setTemplate] = useState(DEFAULT_VACCINE_SMS_TEMPLATE);
  const [q, setQ] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((r) =>
      `${r.phone} ${r.Ho_Ten} ${r.Vacxin} ${r.Mui_Tiem} ${r.Ngay_Tiem}`.toLowerCase().includes(query)
    );
  }, [rows, q]);

  const stats = useMemo(
    () => ({
      total: rows.length,
      withPhone: rows.filter((r) => r.phone).length,
      withDate: rows.filter((r) => r.Ngay_Tiem).length,
      withTemplate: rows.filter((r) => r.Template).length,
    }),
    [rows]
  );

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const matrix = await readSheetMatrix(file);
      const headerIndex = detectHeaderRow(
        matrix,
        [(k) => k.includes('phone') || k.includes('dien thoai') || k.includes('sdt'), (k) => k.includes('ten')],
        0
      );
      const headers = (matrix[headerIndex] || []).map((c) => String(c ?? ''));
      const fieldMap = mapColumnsByRegex(headers, VACCINE_SMS_COLUMN_RULES);
      const raw = rowsToObjects(matrix, headerIndex, fieldMap);
      const built = buildVaccineRows(raw, template).filter((r) => r.phone || r.Ho_Ten);

      if (built.length === 0) {
        throw new Error('Không đọc được dòng dữ liệu nào (cần cột SĐT hoặc Họ tên).');
      }
      setRows(built);
      toast(`Đã đọc ${built.length} dòng.`, 'success');
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const refillTemplate = () => {
    setRows((prev) => prev.map((r) => ({ ...r, Template: template })));
    toast('Đã điền lại mẫu tin nhắn cho tất cả dòng.', 'success');
  };

  const handleExport = async () => {
    if (!rows.length) return;
    const count = await exportVaccineSms(rows, `Ket_qua_nhac_lich_tiem_ngua_${new Date().toISOString().slice(0, 10)}.xlsx`);
    if (count === 0) {
      toast('Không có dòng nào có SĐT + Template để xuất.', 'error');
      return;
    }
    toast(`Đã xuất ${count} dòng ra file FPT SMS.`, 'success');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-ink md:text-2xl">
            <MessageSquare className="h-5 w-5 text-primary md:h-6 md:w-6" /> SMS NHẮC LỊCH TIÊM NGỪA
          </h1>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-muted md:text-xs">
            Nhập Excel → sinh file FPT SMS (6 cột) để gửi tin nhắc lịch tiêm.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<FileSpreadsheet className="h-4 w-4" />} onClick={() => fileRef.current?.click()}>
            Nhập Excel
          </Button>
          <Button variant="primary" icon={<Download className="h-4 w-4" />} onClick={handleExport} disabled={!rows.length}>
            Xuất FPT SMS
          </Button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Tổng dòng đã nhập" value={stats.total} />
        <StatCard label="Có số điện thoại" value={stats.withPhone} tone="info" />
        <StatCard label="Có ngày tiêm" value={stats.withDate} />
        <StatCard label="Template đã điền" value={stats.withTemplate} tone="success" />
      </div>

      <Card flush>
        <div className="p-5">
          <CardHeader
            title="Mẫu tin nhắn (Template)"
            actions={<Button variant="secondary" size="sm" onClick={refillTemplate} disabled={!rows.length}>Điền lại cho tất cả</Button>}
          />
          <Field label="Nội dung" hint="Giữ nguyên các biến [Ho_Ten], [Vacxin], [Mui_Tiem], [Ngay_Tiem] — FPT thay thế khi gửi.">
            <Textarea value={template} onChange={(e) => setTemplate(e.target.value)} rows={3} />
          </Field>
        </div>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title="Chưa có dữ liệu"
          description="Nhập file Excel với các cột: SĐT, Họ tên, Vắc xin, Mũi tiêm, Ngày tiêm."
          action={<Button variant="primary" size="sm" onClick={() => fileRef.current?.click()}>Chọn file Excel</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm SĐT, tên, vắc xin..."
              className="w-full rounded-xl border border-line bg-surface py-2 pl-9 pr-3 text-xs font-semibold outline-none focus:border-primary"
            />
          </div>

          <div className="overflow-auto rounded-2xl border border-line bg-surface shadow-card">
            <table className="w-full min-w-[1000px] border-collapse text-xs">
              <thead className="sticky top-0 z-20 bg-slate-50">
                <tr className="border-b border-line text-[10px] font-bold uppercase text-ink-soft">
                  <th className="border border-line px-2 py-2 text-center">STT</th>
                  <th className="border border-line px-2 py-2">phone</th>
                  <th className="border border-line px-2 py-2">Template</th>
                  <th className="border border-line px-2 py-2">Ho_Ten</th>
                  <th className="border border-line px-2 py-2">Vacxin</th>
                  <th className="border border-line px-2 py-2 text-center">Mui_Tiem</th>
                  <th className="border border-line px-2 py-2 text-center">Ngay_Tiem</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.STT} className="border-b border-line bg-surface">
                    <td className="border border-line px-2 py-1.5 text-center font-bold text-ink-muted">{r.STT}</td>
                    <td className="border border-line px-2 py-1">
                      <input
                        value={r.phone}
                        onChange={(e) => setRows((prev) => prev.map((x) => (x.STT === r.STT ? { ...x, phone: e.target.value } : x)))}
                        className="w-full rounded-lg border border-line px-2 py-1 text-xs outline-none focus:border-primary"
                      />
                    </td>
                    <td className="border border-line px-2 py-1">
                      <input
                        value={r.Template}
                        onChange={(e) => setRows((prev) => prev.map((x) => (x.STT === r.STT ? { ...x, Template: e.target.value } : x)))}
                        className="w-full rounded-lg border border-line px-2 py-1 text-xs outline-none focus:border-primary"
                      />
                    </td>
                    <td className="border border-line px-2 py-1">
                      <input
                        value={r.Ho_Ten}
                        onChange={(e) => setRows((prev) => prev.map((x) => (x.STT === r.STT ? { ...x, Ho_Ten: e.target.value } : x)))}
                        className="w-full rounded-lg border border-line px-2 py-1 text-xs outline-none focus:border-primary"
                      />
                    </td>
                    <td className="border border-line px-3 py-1.5 text-ink-soft">{r.Vacxin || '—'}</td>
                    <td className="border border-line px-3 py-1.5 text-center text-ink-soft">{r.Mui_Tiem || '—'}</td>
                    <td className="border border-line px-3 py-1.5 text-center text-ink-soft">{r.Ngay_Tiem || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] font-semibold text-ink-muted">
            Hiển thị {filtered.length}/{rows.length} dòng. File xuất gồm 1 sheet <b>FPT_SMS</b> 6 cột, cột SĐT ở dạng Text.
          </p>
        </div>
      )}
    </div>
  );
}
