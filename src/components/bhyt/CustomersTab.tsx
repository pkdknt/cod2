'use client';

import React, { useState } from 'react';
import { Download, Edit2, Search, Trash2, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge, { type BadgeTone } from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Field';
import SortHeader from '@/components/ui/SortHeader';
import TableShell, { BatchActionBar, FilterBar } from '@/components/ui/TableShell';
import Pagination from '@/components/ui/Pagination';
import { EmptyState, LoadingRows } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import {
  EXPIRY_STATUS_META,
  dayText,
  daysToExpiry,
  displayDate,
  expiryStatus,
  getWorkflow,
  isoDate,
} from '@/lib/bhyt';
import { loadXLSX, writeSheet, type Worksheet } from '@/lib/excel';
import type { BhytCustomerRecord, ExpiryBucket } from '@/lib/types';
import type { BhytList } from '@/hooks/useBhytList';

const EXPORT_HEADERS = [
  'HỌ TÊN', 'Mã số BHXH', 'CCCD', 'Ngày tháng năm sinh', 'Giới tính', 'Nơi đăng ký giấy khai sinh',
  'Nơi đăng ký KCB ban đầu', 'Ngày biên lai', 'Số biên lai', 'Tiền lương, trợ cấp hoặc số tiền đóng',
  'Hỗ trợ thêm', 'Thời hạn sử dụng thẻ', 'Mã số nhân viên thu', 'Điện thoại',
  'Thời hạn sử dụng thẻ đến ngày', 'Số ngày còn lại', 'Cần gọi/ nhắn tin', 'Gia hạn Tăng mới',
  'Ngày gọi', 'Trạng thái xử lý', 'Người quen/ người nhà NV', 'Ghi chú', 'Tình trạng thẻ',
];

const EXPORT_COLS = [28, 16, 17, 14, 10, 35, 45, 14, 14, 18, 12, 15, 14, 17, 17, 13, 16, 15, 14, 18, 25, 42, 22].map((wch) => ({ wch }));

type EditFieldKey = keyof BhytCustomerRecord;

const EDIT_FIELDS: { key: EditFieldKey; label: string; type?: 'text' | 'select' | 'textarea'; options?: string[] }[] = [
  { key: 'hoTen', label: 'Họ tên *' },
  { key: 'maBHXH', label: 'Mã số BHXH' },
  { key: 'cccd', label: 'CCCD' },
  { key: 'ngaySinh', label: 'Ngày sinh', type: 'text' },
  { key: 'gioiTinh', label: 'Giới tính', type: 'select', options: ['', 'Nam', 'Nữ', 'Khác'] },
  { key: 'noiKhaiSinh', label: 'Nơi đăng ký giấy khai sinh' },
  { key: 'noiKCB', label: 'Nơi đăng ký KCB ban đầu' },
  { key: 'ngayBienLai', label: 'Ngày biên lai' },
  { key: 'soBienLai', label: 'Số biên lai' },
  { key: 'soTienDong', label: 'Tiền đóng' },
  { key: 'hoTroThem', label: 'Hỗ trợ thêm' },
  { key: 'thoiHanTheThang', label: 'Thời hạn thẻ (tháng)' },
  { key: 'maNVThu', label: 'Mã NV thu' },
  { key: 'dienThoai', label: 'Điện thoại' },
  { key: 'hanThe', label: 'Hạn thẻ đến ngày' },
  { key: 'loaiHoSo', label: 'Gia hạn / Tăng mới', type: 'select', options: ['', 'Gia hạn', 'Tăng mới'] },
  { key: 'ngayGoi', label: 'Ngày gọi' },
  { key: 'nguoiGioiThieu', label: 'Người quen / người nhà NV' },
  { key: 'workflowStatus', label: 'Trạng thái xử lý', type: 'select', options: ['Chưa liên hệ', 'Đã gọi', 'Đã gửi tin', 'Hẹn liên hệ lại', 'Không liên lạc được', 'Không có nhu cầu', 'Đã gia hạn'] },
  { key: 'ghiChu', label: 'Ghi chú', type: 'textarea' },
];

const BUCKET_TONE: Record<ExpiryBucket, BadgeTone> = {
  expired: 'danger',
  due15: 'warning',
  due30: 'info',
  active: 'success',
  unknown: 'neutral',
};

interface CustomersTabProps {
  list: BhytList;
  editing: Partial<BhytCustomerRecord> | null;
  onEditingChange: (value: Partial<BhytCustomerRecord> | null) => void;
  onDelete: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onSave: (data: Partial<BhytCustomerRecord>) => Promise<void>;
  onImport: () => void;
}

export default function CustomersTab({
  list,
  editing,
  onEditingChange,
  onDelete,
  onDeleteSelected,
  onSave,
  onImport,
}: CustomersTabProps) {
  const { toast } = useToast();
  const [confirmIds, setConfirmIds] = useState<string[] | null>(null);
  const [saving, setSaving] = useState(false);

  /** Fetch every matching row (not just the visible page) for a complete export. */
  const fetchAllRows = async (): Promise<BhytCustomerRecord[]> => {
    const params = new URLSearchParams({ q: list.qSearch, bucket: list.bucket, loaiHoSo: list.loaiHoSo, all: 'true' });
    const res = await fetch(`/api/bhyt?${params.toString()}`);
    const result = await res.json();
    return result.items || [];
  };

  const buildExportRows = (rows: BhytCustomerRecord[]): (string | number)[][] =>
    rows.map((r) => {
      const days = daysToExpiry(r);
      return [
        r.hoTen || '', String(r.maBHXH ?? ''), String(r.cccd ?? ''),
        displayDate(r.ngaySinhISO || r.ngaySinh) || r.ngaySinh || '', r.gioiTinh || '', r.noiKhaiSinh || '', r.noiKCB || '',
        displayDate(r.ngayBienLaiISO || r.ngayBienLai), r.soBienLai || '', r.soTienDong || '', r.hoTroThem || '',
        r.thoiHanTheThang || '', r.maNVThu || '', r.dienThoai || '',
        displayDate(r.hanTheISO || r.hanThe), days ?? '', ['expired', 'due15'].includes(expiryStatus(r)) ? 'Có' : 'Không',
        r.loaiHoSo || '', displayDate(r.ngayGoiISO || r.ngayGoi), getWorkflow(r), r.nguoiGioiThieu || '', r.ghiChu || '',
        EXPIRY_STATUS_META[expiryStatus(r)],
      ];
    });

  const handleExportXlsx = async () => {
    const rows = await fetchAllRows();
    if (!rows.length) { toast('Không có dữ liệu để xuất.', 'error'); return; }
    const XLSX = await loadXLSX();
    const ws: Worksheet = XLSX.utils.aoa_to_sheet([EXPORT_HEADERS, ...buildExportRows(rows)]);
    writeSheet(XLSX, { ws, sheetName: 'Khach_BHYT', fileName: `Quan_ly_khach_BHYT_${isoDate(new Date())}.xlsx`, cols: EXPORT_COLS });
    toast(`Đã xuất ${rows.length} khách hàng.`, 'success');
  };

  const handleExportCsv = async () => {
    const rows = await fetchAllRows();
    if (!rows.length) { toast('Không có dữ liệu để xuất.', 'error'); return; }
    const esc = (v: unknown) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
    };
    const csv = [EXPORT_HEADERS, ...buildExportRows(rows)].map((row) => row.map(esc).join(',')).join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Danh_sach_BHYT_${isoDate(new Date())}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast(`Đã xuất ${rows.length} khách hàng.`, 'success');
  };

  const submitEdit = async () => {
    if (!editing?.hoTen?.trim()) {
      toast('Vui lòng nhập Họ tên', 'error');
      return;
    }
    setSaving(true);
    try {
      await onSave(editing);
      onEditingChange(null);
    } catch {
      // Keep the dialog open on failure so the user doesn't lose their input.
    } finally {
      setSaving(false);
    }
  };

  const { items, pagination } = list;

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-3">
      <FilterBar>
        <div>
          <label className="block text-[10px] font-bold text-ink-muted uppercase mb-1">Tìm nhanh</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
            <input
              value={list.qSearch}
              onChange={(e) => list.setQSearch(e.target.value)}
              placeholder="Tên, Mã BHXH, CCCD, SĐT..."
              className="w-full rounded-xl border border-line bg-surface py-2 pl-9 pr-3 text-xs font-semibold outline-none focus:border-primary"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-ink-muted uppercase mb-1">Tình trạng thẻ</label>
          <Select value={list.bucket} onChange={(e) => list.setBucket(e.target.value as ExpiryBucket | '')}>
            <option value="">Tất cả hạn thẻ</option>
            <option value="expired">Đã hết hạn</option>
            <option value="due15">Còn ≤ 15 ngày</option>
            <option value="due30">Còn 16–30 ngày</option>
            <option value="active">Còn hiệu lực</option>
            <option value="unknown">Chưa có hạn thẻ</option>
          </Select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-ink-muted uppercase mb-1">Loại hồ sơ</label>
          <Select value={list.loaiHoSo} onChange={(e) => list.setLoaiHoSo(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="Gia hạn">Gia hạn</option>
            <option value="Tăng mới">Tăng mới</option>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button variant="primary" size="md" className="flex-1" icon={<Upload className="h-4 w-4" />} onClick={onImport}>
            Nhập Excel
          </Button>
        </div>
      </FilterBar>

      <TableShell
        toolbar={
          <>
            <span className="text-xs font-semibold text-ink-muted">
              Tổng cộng <strong className="text-primary-strong">{pagination.totalFiltered}</strong> khách hàng
            </span>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={handleExportXlsx}>
                Xuất Excel
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExportCsv}>
                Xuất CSV
              </Button>
            </div>
          </>
        }
        footer={
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalFiltered={pagination.totalFiltered}
            pageSize={list.pageSize}
            onPageChange={list.setPage}
            disabled={list.loading}
          />
        }
      >
        {list.selectedIds.length > 0 && (
          <div className="p-3">
            <BatchActionBar count={list.selectedIds.length} onClear={() => list.setSelectedIds([])}>
              <Button variant="danger" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setConfirmIds(list.selectedIds)}>
                Xóa đã chọn
              </Button>
            </BatchActionBar>
          </div>
        )}

        {list.loading && items.length === 0 ? (
          <LoadingRows cols={8} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Chưa có khách hàng nào"
            description="Nhập file Excel để bắt đầu, hoặc thêm khách hàng thủ công."
            action={<Button variant="primary" size="sm" icon={<Upload className="h-4 w-4" />} onClick={onImport}>Nhập Excel</Button>}
          />
        ) : (
          <table className="w-full min-w-[1100px] border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-slate-50">
              <tr className="border-b border-line text-[10px] font-bold uppercase text-ink-soft">
                <th className="border border-line px-2 py-2">
                  <input
                    type="checkbox"
                    aria-label="Chọn tất cả"
                    checked={items.length > 0 && list.selectedIds.length === items.length}
                    onChange={(e) => list.setSelectedIds(e.target.checked ? items.map((i) => i._id) : [])}
                  />
                </th>
                <th className="border border-line px-2 py-2 text-center">STT</th>
                <SortHeader label="Họ tên" sortKey="name" activeKey={list.sortKey} direction={list.sortDirection} onSort={list.requestSort} />
                <SortHeader label="Mã BHXH" sortKey="bhxh" activeKey={list.sortKey} direction={list.sortDirection} onSort={list.requestSort} />
                <SortHeader label="Điện thoại" sortKey="phone" activeKey={list.sortKey} direction={list.sortDirection} onSort={list.requestSort} align="center" />
                <SortHeader label="Nơi KCB" sortKey="kcb" activeKey={list.sortKey} direction={list.sortDirection} onSort={list.requestSort} />
                <SortHeader label="Hạn thẻ" sortKey="expiry" activeKey={list.sortKey} direction={list.sortDirection} onSort={list.requestSort} align="center" />
                <th className="border border-line px-2 py-2 text-center">Còn lại</th>
                <th className="border border-line px-2 py-2 text-center">Tình trạng thẻ</th>
                <th className="border border-line px-2 py-2 text-center">Xử lý</th>
                <th className="border border-line px-2 py-2 text-center">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const bucket = expiryStatus(item);
                const days = daysToExpiry(item);
                return (
                  <tr key={item._id} className="border-b border-line bg-surface transition-colors hover:bg-canvas">
                    <td className="border border-line px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        aria-label={`Chọn ${item.hoTen}`}
                        checked={list.selectedIds.includes(item._id)}
                        onChange={(e) =>
                          list.setSelectedIds((prev) =>
                            e.target.checked ? [...prev, item._id] : prev.filter((id) => id !== item._id)
                          )
                        }
                      />
                    </td>
                    <td className="border border-line px-2 py-2 text-center font-bold text-ink-muted">
                      {(pagination.page - 1) * list.pageSize + index + 1}
                    </td>
                    <td className="border border-line px-3 py-2">
                      <div className="font-bold text-ink">{item.hoTen}</div>
                      {item.cccd && <div className="text-[10px] text-ink-muted">CCCD: {item.cccd}</div>}
                    </td>
                    <td className="border border-line px-3 py-2 font-semibold text-ink-soft">{item.maBHXH || '—'}</td>
                    <td className="border border-line px-3 py-2 text-center font-semibold text-ink-soft">{item.dienThoai || '—'}</td>
                    <td className="max-w-[220px] truncate border border-line px-3 py-2 text-ink-soft" title={item.noiKCB}>
                      {item.noiKCB || '—'}
                    </td>
                    <td className="border border-line px-3 py-2 text-center font-semibold text-ink-soft">
                      {displayDate(item.hanTheISO || item.hanThe) || '—'}
                    </td>
                    <td className="border border-line px-3 py-2 text-center">{days === null ? '—' : dayText(item)}</td>
                    <td className="border border-line px-3 py-2 text-center">
                      <Badge tone={BUCKET_TONE[bucket]}>{EXPIRY_STATUS_META[bucket]}</Badge>
                    </td>
                    <td className="border border-line px-3 py-2 text-center">
                      <Badge tone={getWorkflow(item) === 'Đã gia hạn' ? 'success' : 'neutral'}>{getWorkflow(item)}</Badge>
                    </td>
                    <td className="border border-line px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditingChange(item)}
                          aria-label={`Sửa ${item.hoTen}`}
                          className="pressable rounded-lg p-1.5 text-primary hover:bg-primary-soft"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmIds([item._id])}
                          aria-label={`Xóa ${item.hoTen}`}
                          className="pressable rounded-lg p-1.5 text-danger hover:bg-danger-soft"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </TableShell>

      {/* Edit / create dialog */}
      <Modal
        open={!!editing}
        onClose={() => onEditingChange(null)}
        title={editing?._id ? 'Cập nhật khách hàng' : 'Thêm khách hàng'}
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => onEditingChange(null)} disabled={saving}>
              Hủy
            </Button>
            <Button variant="primary" onClick={submitEdit} loading={saving}>
              Lưu
            </Button>
          </>
        }
      >
        {editing && (
          <div className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
            {EDIT_FIELDS.map((f) => (
              <div key={String(f.key)} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label className="mb-1 block text-xs font-bold text-ink-soft">{f.label}</label>
                {f.type === 'select' ? (
                  <Select
                    value={String(editing[f.key] ?? '')}
                    onChange={(e) => onEditingChange({ ...editing, [f.key]: e.target.value })}
                  >
                    {f.options!.map((o) => (
                      <option key={o} value={o}>{o || '—'}</option>
                    ))}
                  </Select>
                ) : f.type === 'textarea' ? (
                  <Textarea
                    value={String(editing[f.key] ?? '')}
                    onChange={(e) => onEditingChange({ ...editing, [f.key]: e.target.value })}
                  />
                ) : (
                  <Input
                    value={String(editing[f.key] ?? '')}
                    onChange={(e) => onEditingChange({ ...editing, [f.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmIds}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa ${confirmIds?.length ?? 0} khách hàng? Thao tác này không thể hoàn tác.`}
        tone="danger"
        confirmLabel="Xóa"
        onCancel={() => setConfirmIds(null)}
        onConfirm={() => {
          if (!confirmIds) return;
          if (confirmIds.length === 1) onDelete(confirmIds[0]);
          else onDeleteSelected(confirmIds);
          setConfirmIds(null);
        }}
      />
    </div>
  );
}
