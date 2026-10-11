'use client';

import React, { useState } from 'react';
import { Download, Edit2, Plus, Search, Trash2, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal, { ConfirmDialog } from '@/components/ui/Modal';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import SortHeader from '@/components/ui/SortHeader';
import TableShell, { BatchActionBar, FilterBar } from '@/components/ui/TableShell';
import Pagination from '@/components/ui/Pagination';
import { EmptyState, LoadingRows } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { CALL_RESULTS, REFERRAL_STATUSES, fmtReferralDate, todayReferralISO, type ReferralInput, type ReferralRecord } from '@/lib/referral';
import { loadXLSX, writeSheet, type Worksheet } from '@/lib/excel';
import type { ReferralList } from '@/hooks/useReferralList';

const EXPORT_HEADERS = [
  'STT', 'Ngày', 'Số nhập viện', 'Mã BN', 'Họ tên', 'GT', 'Tuổi', 'Điện thoại', 'BHYT', 'Số thẻ BHYT',
  'Hạn thẻ', 'BV chuyển đến', 'Chẩn đoán', 'Phòng khám', 'Bác sĩ', 'Ngày gọi', 'Kết quả gọi', 'Trạng thái',
  'Ghi chú', 'VIP', 'Địa chỉ', 'CCCD', 'Chỉ định điều trị',
];

type FieldKey = keyof ReferralRecord;

const EDIT_FIELDS: { key: FieldKey; label: string; type?: 'date' | 'select' | 'textarea'; options?: readonly string[] }[] = [
  { key: 'date', label: 'Ngày chuyển viện', type: 'date' },
  { key: 'admissionNo', label: 'Số nhập viện' },
  { key: 'patientCode', label: 'Mã BN' },
  { key: 'cccd', label: 'CCCD' },
  { key: 'name', label: 'Họ tên *' },
  { key: 'gender', label: 'Giới tính', type: 'select', options: ['', 'Nam', 'Nữ'] },
  { key: 'age', label: 'Tuổi' },
  { key: 'birthDate', label: 'Ngày sinh' },
  { key: 'phone', label: 'Điện thoại' },
  { key: 'address', label: 'Địa chỉ' },
  { key: 'bhyt', label: 'Có BHYT', type: 'select', options: ['', 'Có', 'Không'] },
  { key: 'bhytNo', label: 'Số thẻ BHYT' },
  { key: 'bhytExpiry', label: 'Hạn thẻ' },
  { key: 'destinationHospital', label: 'Bệnh viện chuyển đến' },
  { key: 'clinic', label: 'Phòng khám' },
  { key: 'doctor', label: 'Bác sĩ' },
  { key: 'callDate', label: 'Ngày gọi' },
  { key: 'callResult', label: 'Kết quả gọi', type: 'select', options: CALL_RESULTS },
  { key: 'status', label: 'Trạng thái', type: 'select', options: REFERRAL_STATUSES },
  { key: 'vip', label: 'VIP', type: 'select', options: ['', 'Có', 'Không'] },
  { key: 'diagnosis', label: 'Chẩn đoán', type: 'textarea' },
  { key: 'treatment', label: 'Chỉ định điều trị', type: 'textarea' },
  { key: 'note', label: 'Ghi chú CSKH', type: 'textarea' },
];

interface ReferralListTabProps {
  list: ReferralList;
  editing: ReferralInput | null;
  onEditingChange: (value: ReferralInput | null) => void;
  onSave: (data: ReferralInput) => Promise<void>;
  onDelete: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onImport: () => void;
}

export default function ReferralListTab({
  list,
  editing,
  onEditingChange,
  onSave,
  onDelete,
  onDeleteSelected,
  onImport,
}: ReferralListTabProps) {
  const { toast } = useToast();
  const [confirmIds, setConfirmIds] = useState<string[] | null>(null);
  const [saving, setSaving] = useState(false);

  const { items, pagination } = list;

  const handleExport = async () => {
    try {
      const rows = items.map((r, i) => [
        i + 1, fmtReferralDate(r.date), r.admissionNo || '', r.patientCode || '', r.name, r.gender || '', r.age || '',
        r.phone || '', r.bhyt || '', r.bhytNo || '', fmtReferralDate(r.bhytExpiry || ''), r.destinationHospital || '',
        r.diagnosis || '', r.clinic || '', r.doctor || '', fmtReferralDate(r.callDate || ''), r.callResult || '',
        r.status || '', r.note || '', r.vip || '', r.address || '', r.cccd || '', r.treatment || '',
      ]);
      const XLSX = await loadXLSX();
      const ws: Worksheet = XLSX.utils.aoa_to_sheet([EXPORT_HEADERS, ...rows]);
      writeSheet(XLSX, {
        ws,
        sheetName: 'CSKH Chuyen Vien',
        fileName: `CSKH_Chuyen_Vien_${new Date().toISOString().slice(0, 10)}.xlsx`,
      });
    } catch (err) {
      toast('Không thể xuất Excel: ' + (err as Error).message, 'error');
    }
  };

  const submitEdit = async () => {
    if (!editing?.name?.trim()) {
      toast('Vui lòng nhập Họ tên', 'error');
      return;
    }
    setSaving(true);
    try {
      await onSave(editing);
      onEditingChange(null);
    } catch {
      // keep the dialog open on failure
    } finally {
      setSaving(false);
    }
  };

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
              placeholder="Tên, SĐT, BV, chẩn đoán..."
              className="w-full rounded-xl border border-line bg-surface py-2 pl-9 pr-3 text-xs font-semibold outline-none focus:border-primary"
            />
          </div>
        </div>
        <Field label="Từ ngày">
          <Input type="date" value={list.from} onChange={(e) => list.setFrom(e.target.value)} />
        </Field>
        <Field label="Đến ngày">
          <Input type="date" value={list.to} onChange={(e) => list.setTo(e.target.value)} />
        </Field>
        <Field label="Trạng thái">
          <Select value={list.status} onChange={(e) => list.setStatus(e.target.value)}>
            <option value="">Tất cả</option>
            {REFERRAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Kết quả gọi">
          <Select value={list.callResult} onChange={(e) => list.setCallResult(e.target.value)}>
            <option value="">Tất cả</option>
            {CALL_RESULTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
      </FilterBar>

      <TableShell
        toolbar={
          <>
            <span className="text-xs font-semibold text-ink-muted">
              Tổng <strong className="text-primary-strong">{pagination.totalFiltered}</strong> hồ sơ
            </span>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" icon={<Upload className="h-3.5 w-3.5" />} onClick={onImport}>Nhập Excel</Button>
              <Button variant="secondary" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={handleExport} disabled={!items.length}>Xuất Excel</Button>
              <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => onEditingChange({ date: todayReferralISO(), callResult: 'Chưa gọi', status: 'Mới', vip: 'Không', bhyt: 'Không' })}>
                Thêm hồ sơ
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
              <Button variant="danger" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setConfirmIds(list.selectedIds)}>Xóa đã chọn</Button>
            </BatchActionBar>
          </div>
        )}

        {list.loading && items.length === 0 ? (
          <LoadingRows cols={8} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Chưa có hồ sơ chuyển viện"
            description="Nhập file Excel hoặc thêm hồ sơ thủ công."
            action={<Button variant="primary" size="sm" icon={<Upload className="h-4 w-4" />} onClick={onImport}>Nhập Excel</Button>}
          />
        ) : (
          <table className="w-full min-w-[1200px] border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-slate-50">
              <tr className="border-b border-line text-[10px] font-bold uppercase text-ink-soft">
                <th className="border border-line px-2 py-2">
                  <input
                    type="checkbox"
                    aria-label="Chọn tất cả"
                    checked={selectedAll(items, list.selectedIds)}
                    onChange={(e) => list.setSelectedIds(e.target.checked ? items.map((i) => i._id) : [])}
                  />
                </th>
                <th className="border border-line px-2 py-2 text-center">STT</th>
                <SortHeader label="Ngày" sortKey="date" activeKey={list.sortKey} direction={list.sortDirection} onSort={list.requestSort} align="center" />
                <SortHeader label="Họ tên" sortKey="name" activeKey={list.sortKey} direction={list.sortDirection} onSort={list.requestSort} />
                <th className="border border-line px-2 py-2">Mã BN / Số NV</th>
                <th className="border border-line px-2 py-2 text-center">Tuổi</th>
                <th className="border border-line px-2 py-2 text-center">Điện thoại</th>
                <SortHeader label="BV chuyển đến" sortKey="hospital" activeKey={list.sortKey} direction={list.sortDirection} onSort={list.requestSort} />
                <SortHeader label="Bác sĩ" sortKey="doctor" activeKey={list.sortKey} direction={list.sortDirection} onSort={list.requestSort} />
                <SortHeader label="Kết quả gọi" sortKey="callResult" activeKey={list.sortKey} direction={list.sortDirection} onSort={list.requestSort} align="center" />
                <SortHeader label="Trạng thái" sortKey="status" activeKey={list.sortKey} direction={list.sortDirection} onSort={list.requestSort} align="center" />
                <th className="border border-line px-2 py-2 text-center">VIP</th>
                <th className="border border-line px-2 py-2 text-center">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item._id} className="border-b border-line bg-surface transition-colors hover:bg-canvas">
                  <td className="border border-line px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      aria-label={`Chọn ${item.name}`}
                      checked={list.selectedIds.includes(item._id)}
                      onChange={(e) => list.setSelectedIds((prev) => (e.target.checked ? [...prev, item._id] : prev.filter((id) => id !== item._id)))}
                    />
                  </td>
                  <td className="border border-line px-2 py-2 text-center font-bold text-ink-muted">
                    {(pagination.page - 1) * list.pageSize + index + 1}
                  </td>
                  <td className="border border-line px-3 py-2 text-center text-ink-soft">{fmtReferralDate(item.date) || '—'}</td>
                  <td className="border border-line px-3 py-2 font-bold text-ink">{item.name}</td>
                  <td className="border border-line px-3 py-2 text-ink-soft">
                    {item.patientCode && <div className="text-[10px] text-primary-strong">Mã: {item.patientCode}</div>}
                    {item.admissionNo && <div className="text-[10px]">{item.admissionNo}</div>}
                    {!item.patientCode && !item.admissionNo && '—'}
                  </td>
                  <td className="border border-line px-3 py-2 text-center text-ink-soft">{item.age || '—'}</td>
                  <td className="border border-line px-3 py-2 text-center font-semibold text-ink-soft">{item.phone || '—'}</td>
                  <td className="max-w-[220px] truncate border border-line px-3 py-2 text-ink-soft" title={item.destinationHospital}>
                    {item.destinationHospital || '—'}
                  </td>
                  <td className="border border-line px-3 py-2 text-ink-soft">{item.doctor || '—'}</td>
                  <td className="border border-line px-3 py-2 text-center">
                    <Badge tone={item.callResult === 'Chưa gọi' ? 'neutral' : 'info'}>{item.callResult || '—'}</Badge>
                  </td>
                  <td className="border border-line px-3 py-2 text-center">
                    <Badge tone={item.status === 'Hoàn tất' ? 'success' : item.status === 'Cần gọi lại' ? 'warning' : 'neutral'}>
                      {item.status || '—'}
                    </Badge>
                  </td>
                  <td className="border border-line px-3 py-2 text-center">{item.vip === 'Có' ? '★' : ''}</td>
                  <td className="border border-line px-2 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" aria-label="Sửa" onClick={() => onEditingChange(item)} className="pressable rounded-lg p-1.5 text-primary hover:bg-primary-soft">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="Xóa" onClick={() => setConfirmIds([item._id])} className="pressable rounded-lg p-1.5 text-danger hover:bg-danger-soft">
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

      <Modal
        open={!!editing}
        onClose={() => onEditingChange(null)}
        title={editing?._id ? 'Cập nhật hồ sơ chuyển viện' : 'Thêm hồ sơ chuyển viện'}
        maxWidth="max-w-3xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => onEditingChange(null)} disabled={saving}>Hủy</Button>
            <Button variant="primary" onClick={submitEdit} loading={saving}>Lưu</Button>
          </>
        }
      >
        {editing && (
          <div className="grid max-h-[62vh] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-3">
            {EDIT_FIELDS.map((f) => (
              <div key={String(f.key)} className={f.type === 'textarea' ? 'sm:col-span-3' : ''}>
                <label className="mb-1 block text-xs font-bold text-ink-soft">{f.label}</label>
                {f.type === 'select' ? (
                  <Select value={String(editing[f.key] ?? '')} onChange={(e) => onEditingChange({ ...editing, [f.key]: e.target.value })}>
                    {(f.options ?? []).map((o) => <option key={o} value={o}>{o || '—'}</option>)}
                  </Select>
                ) : f.type === 'textarea' ? (
                  <Textarea value={String(editing[f.key] ?? '')} onChange={(e) => onEditingChange({ ...editing, [f.key]: e.target.value })} />
                ) : f.type === 'date' ? (
                  <Input type="date" value={String(editing[f.key] ?? '').slice(0, 10)} onChange={(e) => onEditingChange({ ...editing, [f.key]: e.target.value })} />
                ) : (
                  <Input value={String(editing[f.key] ?? '')} onChange={(e) => onEditingChange({ ...editing, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmIds}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa ${confirmIds?.length ?? 0} hồ sơ chuyển viện?`}
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

function selectedAll(items: ReferralRecord[], selected: string[]): boolean {
  return items.length > 0 && selected.length === items.length;
}
