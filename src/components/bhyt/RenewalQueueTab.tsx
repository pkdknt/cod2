'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Copy, Download, Phone, Send, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Select } from '@/components/ui/Field';
import TableShell from '@/components/ui/TableShell';
import Pagination from '@/components/ui/Pagination';
import { EmptyState, LoadingRows } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { cleanPhone, dayText, displayDate, getWorkflow } from '@/lib/bhyt';
import { buildFptRows, exportFptSms } from '@/lib/sms';
import type { BhytCustomerRecord, Pagination as PaginationType } from '@/lib/types';

const PAGE_SIZE = 50;

const SCOPES = [
  { value: 'priority', label: 'Ưu tiên: hết hạn + ≤15 ngày' },
  { value: 'expired', label: 'Chỉ đã hết hạn' },
  { value: 'due15', label: 'Chỉ còn ≤15 ngày' },
  { value: 'due30', label: 'Cả nhóm ≤30 ngày' },
  { value: 'all', label: 'Tất cả hồ sơ có hạn thẻ' },
];

interface RenewalQueueTabProps {
  template: string;
  thresholdDays: number;
  onEdit: (item: BhytCustomerRecord) => void;
  onMarked: () => void;
}

export default function RenewalQueueTab({ template, thresholdDays, onEdit, onMarked }: RenewalQueueTabProps) {
  const { toast } = useToast();
  const [scope, setScope] = useState('priority');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<BhytCustomerRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({ page: 1, pageSize: PAGE_SIZE, totalFiltered: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ scope, page: String(page), pageSize: String(PAGE_SIZE) });
      const res = await fetch(`/api/bhyt/reminders?${params.toString()}`);
      if (!res.ok) throw new Error('API query failed');
      const result = await res.json();
      setItems(result.items || []);
      if (result.pagination) setPagination(result.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [scope, page]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    setPage(1);
  }, [scope]);

  const markWorkflow = async (item: BhytCustomerRecord, status: string) => {
    try {
      const res = await fetch('/api/bhyt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: item._id, workflowStatus: status, ngayGoi: displayDate(new Date()) }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast(result.message, 'success');
      fetchQueue();
      onMarked();
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  // Exports must cover the whole queue, not just the visible page.
  const fetchAllRows = async (): Promise<BhytCustomerRecord[]> => {
    const params = new URLSearchParams({ scope, all: 'true' });
    const res = await fetch(`/api/bhyt/reminders?${params.toString()}`);
    const result = await res.json();
    return result.items || [];
  };

  const copyPhones = async () => {
    const all = await fetchAllRows();
    const withPhone = all.filter((i) => cleanPhone(i.dienThoai));
    if (!withPhone.length) {
      toast('Không có số điện thoại nào trong danh sách.', 'error');
      return;
    }
    try {
      await navigator.clipboard.writeText(withPhone.map((i) => cleanPhone(i.dienThoai)).join(', '));
      toast(`Đã sao chép ${withPhone.length} số điện thoại.`, 'success');
    } catch {
      toast('Không thể sao chép (trình duyệt chặn clipboard).', 'error');
    }
  };

  const exportSms = async () => {
    const all = await fetchAllRows();
    const rows = buildFptRows(all, template, thresholdDays);
    if (!rows.length) {
      toast('Không có dữ liệu để xuất.', 'error');
      return;
    }
    await exportFptSms(rows, `FPT_SMS_Nhac_BHYT_${displayDate(new Date()).replaceAll('/', '-')}.xlsx`);
    toast(`Đã xuất file FPT SMS (${rows.length} dòng).`, 'success');
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3">
      <TableShell
        toolbar={
          <>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-ink-soft">Hàng đợi gia hạn</span>
              <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold text-primary-strong">
                {pagination.totalFiltered} hồ sơ
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={scope} onChange={(e) => setScope(e.target.value)} className="w-[220px]">
                {SCOPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
              <Button variant="secondary" size="sm" icon={<Copy className="h-3.5 w-3.5" />} onClick={copyPhones}>
                Sao chép SĐT
              </Button>
              <Button variant="primary" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={exportSms}>
                Xuất FPT SMS
              </Button>
            </div>
          </>
        }
        footer={
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalFiltered={pagination.totalFiltered}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            disabled={loading}
          />
        }
      >
        {loading && items.length === 0 ? (
          <LoadingRows cols={6} />
        ) : items.length === 0 ? (
          <EmptyState title="Không có hồ sơ nào cần nhắc" description="Thử chọn phạm vi rộng hơn." />
        ) : (
          <table className="w-full min-w-[900px] border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-slate-50">
              <tr className="border-b border-line text-[10px] font-bold uppercase text-ink-soft">
                <th className="border border-line px-2 py-2 text-center">STT</th>
                <th className="border border-line px-2 py-2">Họ tên</th>
                <th className="border border-line px-2 py-2 text-center">Điện thoại</th>
                <th className="border border-line px-2 py-2 text-center">Hạn thẻ</th>
                <th className="border border-line px-2 py-2 text-center">Thời gian</th>
                <th className="border border-line px-2 py-2 text-center">Trạng thái</th>
                <th className="border border-line px-2 py-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item._id} className="border-b border-line bg-surface transition-colors hover:bg-canvas">
                  <td className="border border-line px-2 py-2 text-center font-bold text-ink-muted">
                    {(pagination.page - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="border border-line px-3 py-2">
                    <div className="font-bold text-ink">{item.hoTen}</div>
                    <div className="text-[10px] text-ink-muted">{item.maBHXH || '—'}</div>
                  </td>
                  <td className="border border-line px-3 py-2 text-center font-semibold text-ink-soft">{item.dienThoai || '—'}</td>
                  <td className="border border-line px-3 py-2 text-center font-semibold text-ink-soft">
                    {displayDate(item.hanTheISO || item.hanThe) || '—'}
                  </td>
                  <td className="border border-line px-3 py-2 text-center">{dayText(item)}</td>
                  <td className="border border-line px-3 py-2 text-center">
                    <Badge tone={getWorkflow(item) === 'Đã gia hạn' ? 'success' : 'neutral'}>{getWorkflow(item)}</Badge>
                  </td>
                  <td className="border border-line px-2 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => markWorkflow(item, 'Đã gọi')}
                        aria-label="Đánh dấu đã gọi"
                        title="Đã gọi"
                        className="pressable rounded-lg p-1.5 text-primary hover:bg-primary-soft"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => markWorkflow(item, 'Đã gửi tin')}
                        aria-label="Đánh dấu đã gửi tin"
                        title="Đã gửi tin"
                        className="pressable rounded-lg p-1.5 text-success hover:bg-success-soft"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="pressable rounded-lg px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary-soft"
                      >
                        Sửa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableShell>
    </div>
  );
}
