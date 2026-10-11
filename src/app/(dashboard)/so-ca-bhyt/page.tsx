'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, CalendarRange, Edit2, Plus, RefreshCw, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, StatCard } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Field, Input, Select } from '@/components/ui/Field';
import Tabs from '@/components/ui/Tabs';
import TableShell, { FilterBar } from '@/components/ui/TableShell';
import Pagination from '@/components/ui/Pagination';
import { EmptyState, LoadingRows } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import {
  fmtCaseDate,
  monthLabel,
  safeNum,
  todayISO,
  type BhytCaseInput,
  type BhytCaseRecord,
} from '@/lib/bhytCase';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { Pagination as PaginationType } from '@/lib/types';

const PAGE_SIZE = 20;

interface GroupStat { key: string; total: number; buy: number; renew: number }
interface Stats {
  today: number; todayBuy: number; todayRenew: number;
  month: number; monthBuy: number; monthRenew: number;
  year: number; yearBuy: number; yearRenew: number;
  all: number; rows: number;
  dayStats: GroupStat[]; monthStats: GroupStat[]; yearStats: GroupStat[];
  typeStats: { type: string; total: number }[];
}
interface Periods { months: string[]; years: string[] }

export default function SoCaBhytPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState('data');
  const [items, setItems] = useState<BhytCaseRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({ page: 1, pageSize: PAGE_SIZE, totalFiltered: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 400);
  const [month, setMonth] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Start empty (rendered on the server) and fill today on the client to avoid a hydration mismatch.
  const [form, setForm] = useState<BhytCaseInput>({ date: '', type: 'Mua mới', qty: 1, note: '' });
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [stats, setStats] = useState<Stats | null>(null);
  const [periods, setPeriods] = useState<Periods>({ months: [], years: [] });
  const [cmp, setCmp] = useState<{ kind: 'month' | 'year'; a: string; b: string }>({ kind: 'month', a: '', b: '' });

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: debouncedQ, month, type: typeFilter, page: String(pagination.page), pageSize: String(PAGE_SIZE) });
      const res = await fetch(`/api/bhyt-cases?${params.toString()}`);
      const result = await res.json();
      setItems(result.items || []);
      if (result.pagination) setPagination(result.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedQ, month, typeFilter, pagination.page]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/bhyt-cases/stats');
      const result = await res.json();
      if (res.ok) {
        setStats(result.stats);
        setPeriods(result.periods ?? { months: [], years: [] });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPagination((p) => (p.page === 1 ? p : { ...p, page: 1 })); }, [debouncedQ, month, typeFilter]);
  useEffect(() => { setForm((f) => (f.date ? f : { ...f, date: todayISO() })); }, []);

  const submit = async () => {
    if (!form.date) { toast('Vui lòng chọn ngày', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/bhyt-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast(result.message, 'success');
      setForm({ date: todayISO(), type: 'Mua mới', qty: 1, note: '' });
      fetchList();
      fetchStats();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/bhyt-cases?id=${id}`, { method: 'DELETE' });
    const result = await res.json();
    toast(result.message || 'Đã xóa.', res.ok ? 'success' : 'error');
    if (res.ok) { fetchList(); fetchStats(); }
  };

  const runCompare = async () => {
    if (!cmp.a || !cmp.b) return;
    const params = new URLSearchParams({ kind: cmp.kind, a: cmp.a, b: cmp.b });
    const res = await fetch(`/api/bhyt-cases/stats?${params.toString()}`);
    const result = await res.json();
    return result.compare as { labelA: string; valueA: number; labelB: string; valueB: number; diff: number; pct: number };
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-ink md:text-2xl">
            <BarChart3 className="h-5 w-5 text-primary md:h-6 md:w-6" /> SỐ CA BHYT MUA / GIA HẠN
          </h1>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-muted md:text-xs">
            Ghi nhận hằng ngày số ca đăng ký mới và gia hạn thẻ BHYT, thống kê và so sánh theo tháng/năm.
          </p>
        </div>
        <Button variant="ghost" icon={<RefreshCw className="h-4 w-4" />} onClick={() => { fetchList(); fetchStats(); }}>
          Làm mới
        </Button>
      </div>

      <Tabs
        className="max-w-[420px]"
        active={tab}
        onChange={setTab}
        items={[
          { key: 'data', label: 'Dữ liệu', icon: <CalendarRange className="h-4 w-4" /> },
          { key: 'stats', label: 'Thống kê', icon: <BarChart3 className="h-4 w-4" /> },
          { key: 'compare', label: 'So sánh', icon: <RefreshCw className="h-4 w-4" /> },
        ]}
      />

      {tab === 'data' && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Hôm nay" value={stats?.today ?? 0} hint={`Mua ${stats?.todayBuy ?? 0} • Gia hạn ${stats?.todayRenew ?? 0}`} />
            <StatCard label="Tháng này" value={stats?.month ?? 0} hint={`Mua ${stats?.monthBuy ?? 0} • Gia hạn ${stats?.monthRenew ?? 0}`} />
            <StatCard label="Năm nay" value={stats?.year ?? 0} hint={`Mua ${stats?.yearBuy ?? 0} • Gia hạn ${stats?.yearRenew ?? 0}`} />
            <StatCard label="Tất cả" value={stats?.all ?? 0} hint={`${stats?.rows ?? 0} dòng dữ liệu`} />
          </div>

          <Card flush>
            <div className="p-5">
              <CardHeader title={form._id ? 'Cập nhật số ca' : 'Nhập số ca'} />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <Field label="Ngày">
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </Field>
                <Field label="Loại ca">
                  <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'Mua mới' | 'Gia hạn' })}>
                    <option value="Mua mới">Mua mới</option>
                    <option value="Gia hạn">Gia hạn</option>
                  </Select>
                </Field>
                <Field label="Số ca">
                  <Input type="number" min={1} value={String(form.qty)} onChange={(e) => setForm({ ...form, qty: safeNum(e.target.value) })} />
                </Field>
                <Field label="Ghi chú">
                  <Input value={form.note ?? ''} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </Field>
              </div>
              <div className="mt-4">
                <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={submit} loading={saving}>
                  {form._id ? 'Cập nhật' : 'Nhập ca'}
                </Button>
              </div>
            </div>
          </Card>

          <FilterBar>
            <Field label="Tìm ghi chú">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tên khách / công ty..." />
            </Field>
            <Field label="Tháng">
              <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                <option value="">Tất cả</option>
                {periods.months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
              </Select>
            </Field>
            <Field label="Loại ca">
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="Mua mới">Mua mới</option>
                <option value="Gia hạn">Gia hạn</option>
              </Select>
            </Field>
          </FilterBar>

          <TableShell
            toolbar={<span className="text-xs font-semibold text-ink-muted">Tổng <strong className="text-primary-strong">{pagination.totalFiltered}</strong> dòng</span>}
            footer={
              <Pagination page={pagination.page} totalPages={pagination.totalPages} totalFiltered={pagination.totalFiltered} pageSize={PAGE_SIZE} onPageChange={(p) => setPagination((s) => ({ ...s, page: p }))} disabled={loading} />
            }
          >
            {loading && items.length === 0 ? (
              <LoadingRows cols={5} />
            ) : items.length === 0 ? (
              <EmptyState title="Chưa có dữ liệu" description="Nhập số ca ở biểu mẫu phía trên." />
            ) : (
              <table className="w-full min-w-[720px] border-collapse text-xs">
                <thead className="sticky top-0 z-20 bg-slate-50">
                  <tr className="border-b border-line text-[10px] font-bold uppercase text-ink-soft">
                    <th className="border border-line px-2 py-2 text-center">STT</th>
                    <th className="border border-line px-2 py-2">Ngày</th>
                    <th className="border border-line px-2 py-2 text-center">Loại ca</th>
                    <th className="border border-line px-2 py-2 text-center">Số ca</th>
                    <th className="border border-line px-2 py-2">Ghi chú</th>
                    <th className="border border-line px-2 py-2 text-center">Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item._id} className="border-b border-line bg-surface transition-colors hover:bg-canvas">
                      <td className="border border-line px-2 py-2 text-center font-bold text-ink-muted">
                        {(pagination.page - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="border border-line px-3 py-2 font-semibold text-ink">{fmtCaseDate(item.date)}</td>
                      <td className="border border-line px-3 py-2 text-center">{item.type}</td>
                      <td className="border border-line px-3 py-2 text-center font-bold text-primary-strong">{item.qty}</td>
                      <td className="border border-line px-3 py-2 text-ink-soft">{item.note || '—'}</td>
                      <td className="border border-line px-2 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button type="button" aria-label="Sửa" onClick={() => { setForm(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="pressable rounded-lg p-1.5 text-primary hover:bg-primary-soft">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button type="button" aria-label="Xóa" onClick={() => setConfirmId(item._id)} className="pressable rounded-lg p-1.5 text-danger hover:bg-danger-soft">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </TableShell>
        </>
      )}

      {tab === 'stats' && stats && (
        <div className="space-y-4">
          <Card flush>
            <div className="p-5">
              <CardHeader title="Theo loại ca" />
              <div className="space-y-2">
                {stats.typeStats.map((t) => (
                  <div key={t.type} className="flex items-center gap-3">
                    <span className="w-28 text-xs font-semibold text-ink-soft">{t.type}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(t.total / Math.max(1, stats.all)) * 100}%` }} />
                    </div>
                    <span className="w-16 text-right text-xs font-bold text-ink">{t.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <MiniTable title="Theo ngày (gần nhất)" rows={stats.dayStats} renderKey={fmtCaseDate} />
            <MiniTable title="Theo tháng" rows={stats.monthStats} renderKey={monthLabel} />
            <MiniTable title="Theo năm" rows={stats.yearStats} renderKey={(k) => k} />
          </div>
        </div>
      )}

      {tab === 'compare' && (
        <Card>
          <CardHeader title="So sánh số ca" subtitle="Chênh lệch = kỳ sau − kỳ trước" />
          <div className="space-y-5">
            <CompareRow
              label="Tháng"
              options={periods.months.map((m) => ({ value: m, label: monthLabel(m) }))}
              value={cmp.kind === 'month' ? cmp : { kind: 'month', a: '', b: '' }}
              onChange={(a, b) => setCmp({ kind: 'month', a, b })}
              onRun={runCompare}
            />
            <CompareRow
              label="Năm"
              options={periods.years.map((y) => ({ value: y, label: y }))}
              value={cmp.kind === 'year' ? cmp : { kind: 'year', a: '', b: '' }}
              onChange={(a, b) => setCmp({ kind: 'year', a, b })}
              onRun={runCompare}
            />
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={!!confirmId}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa dòng dữ liệu này?"
        tone="danger"
        confirmLabel="Xóa"
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) remove(confirmId);
          setConfirmId(null);
        }}
      />
    </div>
  );
}

function MiniTable({ title, rows, renderKey }: { title: string; rows: GroupStat[]; renderKey: (k: string) => string }) {
  return (
    <Card flush>
      <div className="p-5">
        <CardHeader title={title} />
        {rows.length === 0 ? (
          <p className="text-xs font-semibold text-ink-muted">Chưa có dữ liệu.</p>
        ) : (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-line text-[10px] font-bold uppercase text-ink-muted">
                <th className="py-1.5 text-left">Kỳ</th>
                <th className="py-1.5 text-right">Mua</th>
                <th className="py-1.5 text-right">Gia hạn</th>
                <th className="py-1.5 text-right">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-line last:border-0">
                  <td className="py-1.5 font-semibold text-ink">{renderKey(r.key)}</td>
                  <td className="py-1.5 text-right text-ink-soft">{r.buy}</td>
                  <td className="py-1.5 text-right text-ink-soft">{r.renew}</td>
                  <td className="py-1.5 text-right font-bold text-primary-strong">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

function CompareRow({
  label,
  options,
  value,
  onChange,
  onRun,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: { kind: 'month' | 'year'; a: string; b: string };
  onChange: (a: string, b: string) => void;
  onRun: () => Promise<{ labelA: string; valueA: number; labelB: string; valueB: number; diff: number; pct: number } | undefined>;
}) {
  const [result, setResult] = useState<{ labelA: string; valueA: number; labelB: string; valueB: number; diff: number; pct: number } | null>(null);

  return (
    <div className="rounded-2xl border border-line bg-canvas p-4">
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
        <Field label={`${label} 1`}>
          <Select value={value.a} onChange={(e) => onChange(e.target.value, value.b)}>
            <option value="">—</option>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label={`${label} 2`}>
          <Select value={value.b} onChange={(e) => onChange(value.a, e.target.value)}>
            <option value="">—</option>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Button variant="primary" disabled={!value.a || !value.b} onClick={async () => setResult((await onRun()) ?? null)}>
          So sánh
        </Button>
      </div>
      {result && (
        <p className="mt-3 text-sm font-semibold text-ink">
          {result.labelA}: <strong>{result.valueA}</strong> ca / {result.labelB}: <strong>{result.valueB}</strong> ca —{' '}
          Chênh lệch: <strong className={result.diff >= 0 ? 'text-success' : 'text-danger'}>{result.diff > 0 ? '+' : ''}{result.diff}</strong> ca{' '}
          ({result.diff > 0 ? '+' : ''}{result.pct.toFixed(1)}%)
        </p>
      )}
    </div>
  );
}
