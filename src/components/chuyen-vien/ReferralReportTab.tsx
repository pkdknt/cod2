'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, StatCard } from '@/components/ui/Card';
import { Field, Select } from '@/components/ui/Field';
import { EmptyState, LoadingRows } from '@/components/ui/States';
import { fmtReferralDate, type ReferralGroup, type ReferralRecord } from '@/lib/referral';

interface Report {
  month: string;
  compareMonth: string;
  total: number;
  called: number;
  needCall: number;
  done: number;
  vip: number;
  diff: number;
  byHospital: ReferralGroup[];
  byDoctor: ReferralGroup[];
  byCallResult: ReferralGroup[];
  needList: ReferralRecord[];
}
interface Periods { months: string[]; doctors: string[]; hospitals: string[] }

const monthLabel = (m: string) => (m ? `${m.slice(5)}/${m.slice(0, 4)}` : '');

function prevMonth(m: string): string {
  if (!m) return '';
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(y, mo - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function ReferralReportTab() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [compareMonth, setCompareMonth] = useState(prevMonth(new Date().toISOString().slice(0, 7)));
  const [doctor, setDoctor] = useState('');
  const [hospital, setHospital] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [periods, setPeriods] = useState<Periods>({ months: [], doctors: [], hospitals: [] });
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month, compareMonth, doctor, hospital });
      const res = await fetch(`/api/cskh-chuyen-vien/report?${params.toString()}`);
      const result = await res.json();
      if (res.ok) {
        setReport(result.report);
        setPeriods(result.periods ?? { months: [], doctors: [], hospitals: [] });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [month, compareMonth, doctor, hospital]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  return (
    <div className="space-y-4">
      <Card flush>
        <div className="p-5">
          <CardHeader
            title="Bộ lọc báo cáo"
            actions={<Button variant="ghost" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={fetchReport}>Làm mới</Button>}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Tháng báo cáo">
              <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                {[month, ...periods.months.filter((m) => m !== month)].filter(Boolean).map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
              </Select>
            </Field>
            <Field label="So sánh với">
              <Select value={compareMonth} onChange={(e) => setCompareMonth(e.target.value)}>
                {[compareMonth, ...periods.months.filter((m) => m !== compareMonth)].filter(Boolean).map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
              </Select>
            </Field>
            <Field label="Bác sĩ">
              <Select value={doctor} onChange={(e) => setDoctor(e.target.value)}>
                <option value="">Tất cả</option>
                {periods.doctors.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            </Field>
            <Field label="Bệnh viện chuyển đến">
              <Select value={hospital} onChange={(e) => setHospital(e.target.value)}>
                <option value="">Tất cả</option>
                {periods.hospitals.map((h) => <option key={h} value={h}>{h}</option>)}
              </Select>
            </Field>
          </div>
        </div>
      </Card>

      {loading && !report ? (
        <LoadingRows cols={6} />
      ) : !report ? (
        <EmptyState title="Chưa có dữ liệu báo cáo" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            <StatCard label="Tổng ca" value={report.total} />
            <StatCard label="Đã gọi CSKH" value={report.called} tone="info" />
            <StatCard label="Cần gọi / gọi lại" value={report.needCall} tone="warning" />
            <StatCard label="Hoàn tất" value={report.done} tone="success" />
            <StatCard label="VIP" value={report.vip} />
            <StatCard
              label={`So với ${monthLabel(report.compareMonth)}`}
              value={`${report.diff > 0 ? '+' : ''}${report.diff}`}
              tone={report.diff >= 0 ? 'success' : 'danger'}
              hint="Chênh lệch số ca"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <GroupTable title="Theo bệnh viện" rows={report.byHospital} />
            <GroupTable title="Theo bác sĩ" rows={report.byDoctor} />
            <GroupTable title="Theo kết quả gọi" rows={report.byCallResult} />
          </div>

          <Card flush>
            <div className="p-5">
              <CardHeader title={`Danh sách cần gọi / gọi lại (${report.needList.length})`} />
              {report.needList.length === 0 ? (
                <p className="text-xs font-semibold text-ink-muted">Không có hồ sơ nào cần gọi.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-line text-[10px] font-bold uppercase text-ink-muted">
                        <th className="py-2 text-left">Ngày</th>
                        <th className="py-2 text-left">Họ tên</th>
                        <th className="py-2 text-left">SĐT</th>
                        <th className="py-2 text-left">BV chuyển đến</th>
                        <th className="py-2 text-left">Trạng thái</th>
                        <th className="py-2 text-left">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.needList.map((r) => (
                        <tr key={r._id} className="border-b border-line last:border-0">
                          <td className="py-1.5 text-ink-soft">{fmtReferralDate(r.date)}</td>
                          <td className="py-1.5 font-bold text-ink">{r.name}</td>
                          <td className="py-1.5 font-semibold text-ink-soft">{r.phone || '—'}</td>
                          <td className="py-1.5 text-ink-soft">{r.destinationHospital || '—'}</td>
                          <td className="py-1.5 text-ink-soft">{r.status || '—'}</td>
                          <td className="py-1.5 text-ink-muted">{r.note || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function GroupTable({ title, rows }: { title: string; rows: ReferralGroup[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <Card flush>
      <div className="p-5">
        <CardHeader title={title} />
        {rows.length === 0 ? (
          <p className="text-xs font-semibold text-ink-muted">Chưa có dữ liệu.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.key} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-xs font-semibold text-ink-soft" title={r.key}>{r.key}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(r.count / max) * 100}%` }} />
                </div>
                <span className="w-16 text-right text-xs font-bold text-ink">{r.count} · {r.pct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
