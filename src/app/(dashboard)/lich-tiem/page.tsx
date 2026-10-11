'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Edit2, Plus, Printer, Settings2, Trash2, Syringe } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardHeader } from '@/components/ui/Card';
import Modal, { ConfirmDialog } from '@/components/ui/Modal';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { printNow } from '@/lib/pdf';
import {
  DATA,
  DOSE_LABELS,
  fmtDate,
  matchSearch,
  maskDateText,
  monthsAge,
  norm,
  parseAgeRange,
  parseDate,
  type VaccineProtocol,
} from '@/lib/vaccineData';
import { computeDoseDates } from '@/lib/schedule';
import '@/styles/print.css';

const emptySix = () => Array(6).fill('') as string[];
const EMPTY_OVERRIDES = emptySix();

interface ProtocolForm {
  id?: string | null;
  vaccine: string;
  object: string;
  schedule: string;
  route: string;
  disease: string;
}

const EMPTY_PROTOCOL: ProtocolForm = { vaccine: '', object: '', schedule: '', route: '', disease: '' };

const matchesVaccine = (protocolVaccine: string, query: string) => {
  const q = norm(query);
  if (!q) return false;
  const pv = norm(protocolVaccine);
  return pv === q || pv.includes(q) || q.includes(pv);
};

export default function LichTiemPage() {
  const { toast } = useToast();
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [vaccineInput, setVaccineInput] = useState('');
  const [selectedVaccine, setSelectedVaccine] = useState('');
  const [selectedProtocolId, setSelectedProtocolId] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [dates, setDates] = useState<string[]>(emptySix());
  const [notes, setNotes] = useState<string[]>(emptySix());

  const [customProtocols, setCustomProtocols] = useState<VaccineProtocol[]>([]);
  const [showProtocols, setShowProtocols] = useState(false);
  const [protoForm, setProtoForm] = useState<ProtocolForm | null>(null);
  const [savingProto, setSavingProto] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const allProtocols = useMemo(() => [...DATA.protocols, ...customProtocols], [customProtocols]);

  const fetchProtocols = useCallback(async () => {
    try {
      const res = await fetch('/api/vaccine-protocols');
      const result = await res.json();
      if (res.ok) setCustomProtocols(result.items || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchProtocols();
  }, [fetchProtocols]);

  // Vaccine list = built-ins + any vaccine that only exists in a custom protocol.
  const vaccineList = useMemo(() => {
    const custom = [...new Set(customProtocols.map((p) => p.vaccine))].filter((v) => !DATA.vaccines.includes(v));
    return [...DATA.vaccines, ...custom].filter((v) => matchSearch(v, vaccineInput));
  }, [customProtocols, vaccineInput]);

  const protocolsForVaccine = useCallback(
    (vaccine: string): VaccineProtocol[] => {
      if (!vaccine) return [];
      const raw = vaccine.includes(' - ') ? vaccine.split(' - ').slice(1).join(' - ') : vaccine;
      return allProtocols.filter((p) => matchesVaccine(p.vaccine, raw));
    },
    [allProtocols]
  );

  const availableProtocols = useMemo(() => protocolsForVaccine(selectedVaccine), [protocolsForVaccine, selectedVaccine]);

  const activeProtocol = allProtocols.find((p) => p.id === selectedProtocolId);
  const computedDates = computeDoseDates(selectedProtocolId, dates, EMPTY_OVERRIDES, allProtocols);

  const selectVaccine = (v: string) => {
    setSelectedVaccine(v);
    setVaccineInput(v);
    setShowDropdown(false);
    const protos = protocolsForVaccine(v);
    let best = protos[0]?.id ?? '';
    const parsedDob = parseDate(dob);
    if (parsedDob && protos.length > 0) {
      const months = monthsAge(parsedDob, new Date());
      const fit = protos.find((p) => {
        const { min, max } = parseAgeRange(p.object);
        if (min !== null && months < min) return false;
        if (max !== null && months > max) return false;
        return true;
      });
      best = fit?.id ?? best;
    }
    setSelectedProtocolId(best);
  };

  const setAt = (setter: React.Dispatch<React.SetStateAction<string[]>>, i: number, val: string) =>
    setter((prev) => prev.map((v, idx) => (idx === i ? val : v)));

  const saveProtocol = async () => {
    if (!protoForm) return;
    if (!protoForm.vaccine.trim() || !protoForm.object.trim() || !protoForm.schedule.trim()) {
      toast('Vắc xin, đối tượng và phác đồ là bắt buộc', 'error');
      return;
    }
    setSavingProto(true);
    try {
      const res = await fetch('/api/vaccine-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(protoForm),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast(result.message || 'Đã lưu phác đồ.', 'success');
      setProtoForm(null);
      await fetchProtocols();
    } catch (err) {
      toast((err as Error).message, 'error');
    } finally {
      setSavingProto(false);
    }
  };

  const deleteProtocol = async (id: string) => {
    const res = await fetch(`/api/vaccine-protocols?id=${id}`, { method: 'DELETE' });
    const result = await res.json();
    toast(result.message || 'Đã xóa.', res.ok ? 'success' : 'error');
    if (res.ok) await fetchProtocols();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-ink md:text-2xl">
            <Syringe className="h-5 w-5 text-primary md:h-6 md:w-6" /> TÍNH LỊCH TIÊM VẮC XIN
          </h1>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-muted md:text-xs">
            Chọn vắc xin và phác đồ theo tuổi, hệ thống tự tính ngày hẹn cho 6 mũi.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<Settings2 className="h-4 w-4" />} onClick={() => setShowProtocols(true)}>
            Phác đồ tùy chỉnh ({customProtocols.length})
          </Button>
          <Button variant="primary" icon={<Printer className="h-4 w-4" />} onClick={printNow}>In phiếu</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="print:hidden lg:col-span-1">
          <Card>
            <CardHeader title="Thông tin người tiêm" />
            <div className="space-y-3">
              <Field label="Ngày sinh">
                <Input
                  placeholder="dd/mm/yyyy"
                  value={dob}
                  onChange={(e) => setDob(maskDateText(e.target.value, e.target.value.length < (dob || '').length))}
                />
              </Field>
              <Field label="Giới tính">
                <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">—</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </Select>
              </Field>

              <div className="relative">
                <label className="block text-xs font-bold text-ink-soft mb-1">Chọn vắc xin</label>
                <div className="relative">
                  <Input
                    placeholder="Gõ tên vắc xin..."
                    value={vaccineInput}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    onChange={(e) => setVaccineInput(e.target.value)}
                  />
                  <ChevronDown
                    className="absolute right-3 top-3 h-4 w-4 cursor-pointer text-ink-muted"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowDropdown((s) => !s)}
                  />
                </div>
                {showDropdown && (
                  <div
                    className="absolute left-0 right-0 z-40 mt-1 max-h-[220px] overflow-y-auto rounded-2xl border border-line bg-surface shadow-pop"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {vaccineList.length === 0 ? (
                      <div className="p-3 text-xs font-bold text-ink-muted">Không tìm thấy vắc xin</div>
                    ) : (
                      vaccineList.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); selectVaccine(v); }}
                          className="w-full border-b border-line px-4 py-2.5 text-left text-xs font-bold text-ink-soft last:border-0 hover:bg-canvas"
                        >
                          {v}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {selectedVaccine && (
                <Field label="Phác đồ">
                  <Select value={selectedProtocolId} onChange={(e) => setSelectedProtocolId(e.target.value)}>
                    {availableProtocols.length === 0 ? (
                      <option value="">Không tìm thấy phác đồ khớp</option>
                    ) : (
                      availableProtocols.map((p) => (
                        <option key={p.id} value={p.id}>{p.object} ({p.sourceRow})</option>
                      ))
                    )}
                  </Select>
                </Field>
              )}

              {activeProtocol && (
                <div className="rounded-2xl border border-teal-100 bg-primary-soft p-4 text-[11px] font-semibold leading-relaxed text-primary-strong">
                  <p><b>Bệnh:</b> {activeProtocol.disease}</p>
                  <p><b>Đường dùng:</b> {activeProtocol.route}</p>
                  <p className="mt-1 whitespace-pre-line border-t border-teal-200/50 pt-1.5 font-bold">{activeProtocol.schedule}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="print-area lg:col-span-2">
          <div className="print-sheet rounded-3xl border border-line bg-surface p-6 shadow-card">
            <div className="mb-4 text-center">
              <h2 className="text-base font-black uppercase tracking-wide text-ink">PHIẾU LỊCH TIÊM VẮC XIN</h2>
              <p className="mt-1 text-xs font-semibold text-ink-muted">
                {selectedVaccine || '—'} · Ngày sinh: {dob || '—'} {gender ? `· ${gender}` : ''}
              </p>
            </div>

            {!activeProtocol ? (
              <p className="py-16 text-center text-sm font-bold text-ink-muted">
                Vui lòng chọn vắc xin và phác đồ để tính lịch tiêm.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-primary-soft text-[11px] font-bold text-primary-strong">
                      <th className="border border-line px-3 py-2 text-left">Mũi tiêm</th>
                      <th className="border border-line px-3 py-2">Ngày tiêm thực tế</th>
                      <th className="border border-line px-3 py-2">Ngày hẹn</th>
                      <th className="border border-line px-3 py-2">Đường tiêm</th>
                      <th className="border border-line px-3 py-2 text-left">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DOSE_LABELS.map((label, idx) => (
                      <tr key={label} className="border-b border-line">
                        <td className="border border-line px-3 py-2 font-bold text-ink">{label}</td>
                        <td className="border border-line px-2 py-1">
                          <input
                            placeholder="dd/mm/yyyy"
                            value={dates[idx]}
                            onChange={(e) => {
                              const isDel = e.target.value.length < (dates[idx] || '').length;
                              setAt(setDates, idx, maskDateText(e.target.value, isDel));
                            }}
                            className="w-full rounded-lg border border-line px-2 py-1 text-center text-xs outline-none focus:border-primary print:border-0"
                          />
                        </td>
                        <td className="border border-line px-3 py-2 text-center font-bold text-ink">
                          {idx === 0 ? (dates[0] ? dates[0] : '—') : computedDates[idx] ? fmtDate(computedDates[idx]) : '—'}
                        </td>
                        <td className="border border-line px-3 py-2 text-center text-[10px] italic text-ink-muted">{activeProtocol.route}</td>
                        <td className="border border-line px-2 py-1">
                          <input
                            placeholder="Ghi chú..."
                            value={notes[idx]}
                            onChange={(e) => setAt(setNotes, idx, e.target.value)}
                            className="w-full rounded-lg border border-line px-2 py-1 text-xs outline-none focus:border-primary print:border-0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom protocol manager */}
      <Modal
        open={showProtocols}
        onClose={() => setShowProtocols(false)}
        title="Phác đồ tùy chỉnh"
        maxWidth="max-w-3xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowProtocols(false)}>Đóng</Button>
            <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setProtoForm({ ...EMPTY_PROTOCOL })}>
              Thêm phác đồ
            </Button>
          </>
        }
      >
        {customProtocols.length === 0 ? (
          <EmptyState
            title="Chưa có phác đồ tùy chỉnh"
            description="Thêm phác đồ mới với vắc xin, đối tượng (độ tuổi) và lịch tiêm — sẽ xuất hiện cùng các phác đồ có sẵn."
          />
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <table className="w-full border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="border-b border-line text-[10px] font-bold uppercase text-ink-soft">
                  <th className="border border-line px-2 py-2 text-left">Vắc xin</th>
                  <th className="border border-line px-2 py-2 text-left">Đối tượng</th>
                  <th className="border border-line px-2 py-2 text-center">Tác vụ</th>
                </tr>
              </thead>
              <tbody>
                {customProtocols.map((p) => (
                  <tr key={p.id} className="border-b border-line">
                    <td className="border border-line px-2 py-2 font-bold text-ink">{p.vaccine}</td>
                    <td className="border border-line px-2 py-2 text-ink-soft">{p.object}</td>
                    <td className="border border-line px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          aria-label="Sửa"
                          onClick={() => setProtoForm({ id: p.id, vaccine: p.vaccine, object: p.object, schedule: p.schedule, route: p.route, disease: p.disease })}
                          className="pressable rounded-lg p-1.5 text-primary hover:bg-primary-soft"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Xóa"
                          onClick={() => setConfirmDelete(p.id)}
                          className="pressable rounded-lg p-1.5 text-danger hover:bg-danger-soft"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Create / edit protocol */}
      <Modal
        open={!!protoForm}
        onClose={() => setProtoForm(null)}
        title={protoForm?.id ? 'Sửa phác đồ tùy chỉnh' : 'Thêm phác đồ tùy chỉnh'}
        maxWidth="max-w-xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setProtoForm(null)} disabled={savingProto}>Hủy</Button>
            <Button variant="primary" onClick={saveProtocol} loading={savingProto}>Lưu</Button>
          </>
        }
      >
        {protoForm && (
          <div className="space-y-3">
            <Field label="Tên vắc xin *">
              <Input value={protoForm.vaccine} onChange={(e) => setProtoForm({ ...protoForm, vaccine: e.target.value })} placeholder="VD: Prevenar 13" />
            </Field>
            <Field label="Đối tượng (độ tuổi) *" hint="VD: Từ 2 tháng đến 6 tháng tuổi">
              <Input value={protoForm.object} onChange={(e) => setProtoForm({ ...protoForm, object: e.target.value })} />
            </Field>
            <Field label="Phác đồ *" hint="Mỗi dòng một mũi, VD: 'Mũi 1: Tiêm lần đầu' / 'Mũi 2: 1 tháng sau mũi 1'">
              <Textarea value={protoForm.schedule} onChange={(e) => setProtoForm({ ...protoForm, schedule: e.target.value })} rows={5} />
            </Field>
            <Field label="Đường dùng">
              <Input value={protoForm.route} onChange={(e) => setProtoForm({ ...protoForm, route: e.target.value })} placeholder="VD: Tiêm bắp" />
            </Field>
            <Field label="Phòng bệnh">
              <Input value={protoForm.disease} onChange={(e) => setProtoForm({ ...protoForm, disease: e.target.value })} />
            </Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa phác đồ tùy chỉnh này?"
        tone="danger"
        confirmLabel="Xóa"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) deleteProtocol(confirmDelete);
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}
