'use client';

import { useEffect, useState } from 'react';
import { DATA, fmtDate, matchSearch, maskDateText, monthsAge, norm, parseAgeRange, parseDate } from '@/lib/vaccineData';
import { computeDoseDates } from '@/lib/schedule';
import type { PatientRecord } from '@/lib/types';

interface UsePlannerOptions {
  onSaved?: () => void;
  onEditStart?: () => void;
}

const emptySix = () => Array(6).fill('') as string[];

/** Owns the "Lập lịch tiêm" form state, protocol recommendation and dose math. */
export function usePlanner({ onSaved, onEditStart }: UsePlannerOptions = {}) {
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [patientCode, setPatientCode] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [selectedVaccine, setSelectedVaccine] = useState('');
  const [selectedProtocolId, setSelectedProtocolId] = useState('');
  const [vaccineInputVal, setVaccineInputVal] = useState('');
  const [showVaccineDropdown, setShowVaccineDropdown] = useState(false);

  const [dates, setDates] = useState<string[]>(emptySix());
  const [dueOverrides, setDueOverrides] = useState<string[]>(emptySix());
  const [notes, setNotes] = useState<string[]>(emptySix());

  const filteredVaccineList = DATA.vaccines.filter((v) => matchSearch(v, vaccineInputVal));

  const getProtocolsForVaccine = () => {
    if (!selectedVaccine) return [];
    const raw = selectedVaccine || '';
    const q = raw.includes(' - ') ? raw.split(' - ').slice(1).join(' - ') : raw;
    if (!q) return [];
    const nq = norm(q);
    return DATA.protocols.filter(
      (p) => norm(p.vaccine) === nq || norm(p.vaccine).includes(nq) || nq.includes(norm(p.vaccine))
    );
  };

  const availableProtocols = getProtocolsForVaccine();

  const getRecommendedProtocolId = () => {
    if (availableProtocols.length === 0) return '';
    const parsedDob = parseDate(dob);
    if (parsedDob) {
      const ageInMonths = monthsAge(parsedDob, new Date());
      const ageMatching = availableProtocols.filter((p) => {
        const { min, max } = parseAgeRange(p.object);
        if (min !== null && ageInMonths < min) return false;
        if (max !== null && ageInMonths > max) return false;
        return true;
      });
      if (ageMatching.length > 0) return ageMatching[0].id;
    }
    return availableProtocols[0].id;
  };

  useEffect(() => {
    const recId = getRecommendedProtocolId();
    if (recId && !selectedProtocolId) setSelectedProtocolId(recId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVaccine, dob]);

  const activeProtocol = DATA.protocols.find((p) => p.id === selectedProtocolId);

  const computedDates = computeDoseDates(selectedProtocolId, dates, dueOverrides);

  const getDoseStatus = (i: number, due: Date | null) => {
    const actual = parseDate(dates[i]);
    if (actual) {
      return { label: `Đã tiêm: ${fmtDate(actual)}`, className: 'bg-emerald-50 text-emerald-800 border border-emerald-200' };
    }

    const activeDue = parseDate(dueOverrides[i]) || due;
    if (!activeDue) {
      return { label: 'Tự động tính', className: 'bg-slate-50 text-slate-400 border border-slate-100' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((activeDue.getTime() - today.getTime()) / 86400000);
    const fmtDue = fmtDate(activeDue);

    if (diff < 0) {
      return { label: `Quá hạn: ${fmtDue}`, className: 'bg-red-50 text-red-800 border border-red-200 animate-pulse' };
    }
    if (diff === 0) {
      return { label: `Hẹn tiêm HÔM NAY: ${fmtDue}`, className: 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold' };
    }
    if (diff <= 7) {
      return { label: `Sắp đến hạn (${diff} ngày): ${fmtDue}`, className: 'bg-amber-50 text-amber-950 border border-amber-200' };
    }
    return { label: `Ngày hẹn: ${fmtDue}`, className: 'bg-indigo-50 text-indigo-900 border border-indigo-200' };
  };

  const handleActualDateInput = (i: number, val: string) => {
    setDates((prev) => prev.map((d, idx) => (idx === i ? val : d)));
  };
  const handleDueOverrideInput = (i: number, val: string) => {
    setDueOverrides((prev) => prev.map((d, idx) => (idx === i ? val : d)));
  };
  const handleNoteInput = (i: number, val: string) => {
    setNotes((prev) => prev.map((d, idx) => (idx === i ? val : d)));
  };
  const handleActualDatePicker = (i: number, val: string) => {
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    setDates((prev) => prev.map((v, idx) => (idx === i ? fmtDate(new Date(y, m - 1, d)) : v)));
  };
  const handleDueDatePicker = (i: number, val: string) => {
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    setDueOverrides((prev) => prev.map((v, idx) => (idx === i ? fmtDate(new Date(y, m - 1, d)) : v)));
  };

  const reset = () => {
    setActiveEditId(null);
    setPatientCode('');
    setPatientName('');
    setPatientPhone('');
    setDob('');
    setGender('');
    setAddress('');
    setSelectedVaccine('');
    setVaccineInputVal('');
    setSelectedProtocolId('');
    setDates(emptySix());
    setDueOverrides(emptySix());
    setNotes(emptySix());
  };

  const save = async () => {
    if (!patientName.trim()) {
      alert('Vui lòng điền Họ tên người tiêm');
      return;
    }
    if (!selectedVaccine || !selectedProtocolId) {
      alert('Vui lòng chọn Vắc xin và Phác đồ tiêm ngừa');
      return;
    }

    try {
      const response = await fetch('/api/cskh-tiem-chung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeEditId,
          patientCode,
          patientName,
          phone: patientPhone,
          dob,
          gender,
          address,
          vaccine: selectedVaccine,
          protocolId: selectedProtocolId,
          dates,
          dueOverrides,
          notes,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      alert(activeEditId ? 'Cập nhật lịch tiêm thành công!' : 'Đã lưu lịch tiêm bệnh nhân mới thành công!');
      reset();
      onSaved?.();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const loadFromRecord = (item: PatientRecord) => {
    setActiveEditId(item._id);
    setPatientCode(item.patientCode || '');
    setPatientName(item.patientName);
    setPatientPhone(item.phone || '');
    setDob(item.dob ? maskDateText(item.dob) : '');
    setGender(item.gender || '');
    setAddress(item.address || '');
    setSelectedVaccine(item.vaccine);
    setVaccineInputVal(item.vaccine);
    setSelectedProtocolId(item.protocolId);
    setDates(item.dates ? item.dates.map((d) => maskDateText(d)) : emptySix());
    setDueOverrides(item.dueOverrides ? item.dueOverrides.map((d) => maskDateText(d)) : emptySix());
    setNotes(item.notes || emptySix());

    onEditStart?.();
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    activeEditId,
    patientCode, setPatientCode,
    patientName, setPatientName,
    patientPhone, setPatientPhone,
    dob, setDob,
    gender, setGender,
    address, setAddress,
    selectedVaccine, setSelectedVaccine,
    selectedProtocolId, setSelectedProtocolId,
    vaccineInputVal, setVaccineInputVal,
    showVaccineDropdown, setShowVaccineDropdown,
    dates, dueOverrides, notes,
    filteredVaccineList,
    availableProtocols,
    activeProtocol,
    computedDates,
    getDoseStatus,
    handleActualDateInput,
    handleDueOverrideInput,
    handleNoteInput,
    handleActualDatePicker,
    handleDueDatePicker,
    reset,
    save,
    loadFromRecord,
  };
}

export type PlannerState = ReturnType<typeof usePlanner>;
