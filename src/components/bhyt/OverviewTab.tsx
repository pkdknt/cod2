'use client';

import React from 'react';
import { AlertCircle, PhoneOff, RefreshCw, ShieldCheck } from 'lucide-react';
import { StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { EXPIRY_STATUS_META } from '@/lib/bhyt';
import type { ExpiryBucket } from '@/lib/types';

interface BhytStats {
  total: number;
  counts: Record<ExpiryBucket, number>;
  renewed: number;
  missingPhone: number;
}

const BAR_COLORS: Record<ExpiryBucket, string> = {
  expired: '#dc2626',
  due15: '#b45309',
  due30: '#0284c7',
  active: '#16a34a',
  unknown: '#94a3b8',
};

export default function OverviewTab({ stats, loading, onRefresh }: {
  stats: BhytStats | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  const counts = stats?.counts ?? { expired: 0, due15: 0, due30: 0, active: 0, unknown: 0 };
  const total = Math.max(1, stats?.total ?? 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Tổng khách hàng" value={loading ? '…' : stats?.total ?? 0} />
        <StatCard label="Đã hết hạn" value={counts.expired} tone="danger" hint="Cần liên hệ ngay" />
        <StatCard label="Còn ≤ 15 ngày" value={counts.due15} tone="warning" />
        <StatCard label="Còn 16–30 ngày" value={counts.due30} tone="info" />
        <StatCard label="Còn hiệu lực" value={counts.active} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-ink">Phân bố hạn thẻ</h3>
            <Button variant="ghost" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={onRefresh}>
              Làm mới
            </Button>
          </div>
          <div className="space-y-3">
            {(Object.keys(EXPIRY_STATUS_META) as ExpiryBucket[]).map((key) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-xs font-semibold text-ink-soft">{EXPIRY_STATUS_META[key]}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(counts[key] / total) * 100}%`, backgroundColor: BAR_COLORS[key] }}
                  />
                </div>
                <span className="w-12 text-right text-xs font-bold text-ink">{counts[key]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-success" />
              <h3 className="text-sm font-extrabold text-ink">Đã gia hạn</h3>
            </div>
            <p className="mt-2 text-3xl font-black text-success">{stats?.renewed ?? 0}</p>
            <p className="mt-1 text-[11px] font-semibold text-ink-muted">Trên tổng {stats?.total ?? 0} hồ sơ</p>
          </div>

          <div className="rounded-3xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2">
              <PhoneOff className="h-5 w-5 text-danger" />
              <h3 className="text-sm font-extrabold text-ink">Thiếu số điện thoại</h3>
            </div>
            <p className="mt-2 text-3xl font-black text-danger">{stats?.missingPhone ?? 0}</p>
            <p className="mt-1 text-[11px] font-semibold text-ink-muted">Không thể gửi tin nhắn nhắc</p>
          </div>

          <div className="rounded-3xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <h3 className="text-sm font-extrabold text-ink">Cần hành động</h3>
            </div>
            <p className="mt-2 text-3xl font-black text-warning">{counts.expired + counts.due15}</p>
            <p className="mt-1 text-[11px] font-semibold text-ink-muted">Hết hạn hoặc còn ≤ 15 ngày</p>
          </div>
        </div>
      </div>
    </div>
  );
}
