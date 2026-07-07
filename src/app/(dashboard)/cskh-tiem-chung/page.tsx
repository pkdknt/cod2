'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import XLSX from 'xlsx-js-style';
import {
  CalendarDays,
  User,
  Phone,
  Search,
  Plus,
  Save,
  Trash2,
  Download,
  Printer,
  ChevronDown,
  Info,
  Calendar,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Clock,
  Briefcase,
  Syringe,
  ClipboardList
} from 'lucide-react';
import RemindersTab from '@/components/cskh-tiem-chung/RemindersTab';
import {
  DATA,
  DOSE_LABELS,
  VaccineProtocol,
  parseDate,
  fmtDate,
  fmtDateIso,
  maskDateText,
  addInterval,
  monthsAge,
  parseAgeRange,
  parseSchedule,
  sequentialInterval,
  isValidDate,
  norm,
  matchSearch
} from '@/lib/vaccineData';

export default function CskhTiemChungPage() {
  const [activeTab, setActiveTab] = useState('plannerSec');

  // Active Planner States (Form input)
  const [patientCode, setPatientCode] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [address, setAddress] = useState('');
  const [selectedVaccine, setSelectedVaccine] = useState('');
  const [selectedProtocolId, setSelectedProtocolId] = useState('');
  
  const [dates, setDates] = useState<string[]>(Array(6).fill(''));
  const [dueOverrides, setDueOverrides] = useState<string[]>(Array(6).fill(''));
  const [notes, setNotes] = useState<string[]>(Array(6).fill(''));

  // Database list states
  const [savedSchedules, setSavedSchedules] = useState<any[]>([]);
  const [qSearch, setQSearch] = useState('');
  const [filterVaccine, setFilterVaccine] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Protocols autocomplete dropdown filter
  const [vaccineInputVal, setVaccineInputVal] = useState('');
  const [showVaccineDropdown, setShowVaccineDropdown] = useState(false);

  // Load saved schedules from database
  const fetchSavedSchedules = async () => {
    try {
      const qParams = new URLSearchParams({
        q: qSearch,
        vaccine: filterVaccine
      });
      const res = await fetch(`/api/cskh-tiem-chung?${qParams.toString()}`);
      if (!res.ok) throw new Error('API query failed');
      const result = await res.json();
      setSavedSchedules(result.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSavedSchedules();
  }, [qSearch, filterVaccine]);

  // Autocomplete search match
  const filteredVaccineList = DATA.vaccines.filter((v) =>
    matchSearch(v, vaccineInputVal)
  );

  // Dynamic protocol recommendation logic
  const getRecommendedProtocols = () => {
    if (!selectedVaccine) return [];
    
    let raw = selectedVaccine || "";
    let q = norm(raw.includes(" - ") ? raw.split(" - ").slice(-1)[0] : raw);
    if (!q) return [];
    
    // Filter protocols by chosen vaccine
    const matching = DATA.protocols.filter(
      (p) =>
        norm(p.vaccine) === q ||
        norm(p.vaccine).includes(q) ||
        q.includes(norm(p.vaccine))
    );

    // If DOB is entered, refine list by patient age range
    const parsedDob = parseDate(dob);
    if (parsedDob) {
      const ageInMonths = monthsAge(parsedDob, new Date());
      return matching.filter((p) => {
        const { min, max } = parseAgeRange(p.object);
        if (min !== null && ageInMonths < min) return false;
        if (max !== null && ageInMonths > max) return false;
        return true;
      });
    }

    return matching;
  };

  const recommendedProtocols = getRecommendedProtocols();

  useEffect(() => {
    // Automatically select the first recommended protocol when lists refresh
    if (recommendedProtocols.length > 0 && !selectedProtocolId) {
      setSelectedProtocolId(recommendedProtocols[0].id);
    }
  }, [selectedVaccine, dob]);

  // Protocol configuration object
  const activeProtocol = DATA.protocols.find((p) => p.id === selectedProtocolId);

  // Scheduler Math calculations (Live)
  const computeScheduleDates = () => {
    if (!activeProtocol) return Array(6).fill(null);

    const plan = parseSchedule(activeProtocol.schedule);
    const computed: (Date | null)[] = Array(6).fill(null);

    for (let i = 0; i < 6; i++) {
      const actual = parseDate(dates[i]);
      const override = parseDate(dueOverrides[i]);

      if (actual) {
        computed[i] = actual;
      } else if (i >= 1 && override) {
        computed[i] = override;
      } else {
        const it = plan.intervals[i];
        if (i === 0) {
          computed[i] = null;
        } else {
          const prevActual = parseDate(dates[i - 1]) || parseDate(dueOverrides[i - 1]) || computed[i - 1];
          const seq = prevActual ? sequentialInterval(plan, i) : null;
          if (seq && computed[i - 1]) {
            computed[i] = addInterval(computed[i - 1] as Date, seq);
          } else if (it && computed[it.from]) {
            computed[i] = addInterval(computed[it.from] as Date, it);
          }
        }
      }
    }
    return computed;
  };

  const computedDates = computeScheduleDates();

  // Badge class helper
  const getDoseStatus = (i: number, due: Date | null) => {
    const actual = parseDate(dates[i]);
    if (actual) {
      return {
        label: `Đã tiêm: ${fmtDate(actual)}`,
        className: 'bg-emerald-50 text-emerald-800 border border-emerald-200'
      };
    }

    const activeDue = parseDate(dueOverrides[i]) || due;
    if (!activeDue) {
      return {
        label: 'Tự động tính',
        className: 'bg-slate-50 text-slate-400 border border-slate-100'
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((activeDue.getTime() - today.getTime()) / 86400000);

    const fmtDue = fmtDate(activeDue);

    if (diff < 0) {
      return {
        label: `Quá hạn: ${fmtDue}`,
        className: 'bg-red-50 text-red-800 border border-red-200 animate-pulse'
      };
    } else if (diff === 0) {
      return {
        label: `Hẹn tiêm HÔM NAY: ${fmtDue}`,
        className: 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold'
      };
    } else if (diff <= 7) {
      return {
        label: `Sắp đến hạn (${diff} ngày): ${fmtDue}`,
        className: 'bg-amber-50 text-amber-950 border border-amber-200'
      };
    }

    return {
      label: `Ngày hẹn: ${fmtDue}`,
      className: 'bg-indigo-50 text-indigo-900 border border-indigo-200'
    };
  };

  // Date input text masking
  const handleActualDateInput = (i: number, val: string) => {
    const updated = [...dates];
    updated[i] = val;
    setDates(updated);
  };

  const handleDueOverrideInput = (i: number, val: string) => {
    const updated = [...dueOverrides];
    updated[i] = val;
    setDueOverrides(updated);
  };

  const handleNoteInput = (i: number, val: string) => {
    const updated = [...notes];
    updated[i] = val;
    setNotes(updated);
  };

  // Date picker picker synchronizers
  const handleActualDatePicker = (i: number, val: string) => {
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    const updated = [...dates];
    updated[i] = fmtDate(new Date(y, m - 1, d));
    setDates(updated);
  };

  const handleDueDatePicker = (i: number, val: string) => {
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    const updated = [...dueOverrides];
    updated[i] = fmtDate(new Date(y, m - 1, d));
    setDueOverrides(updated);
  };

  // Save patient schedule plan
  const handleSaveSchedule = async () => {
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
          notes
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      alert(activeEditId ? 'Cập nhật lịch tiêm thành công!' : 'Đã lưu lịch tiêm bệnh nhân mới thành công!');
      handleResetPlanner();
      fetchSavedSchedules();
      setActiveTab('savedSec');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Load a saved schedule to edit/view
  const handleLoadSchedule = (item: any) => {
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
    setDates(item.dates ? item.dates.map((d: string) => maskDateText(d)) : Array(6).fill(''));
    setDueOverrides(item.dueOverrides ? item.dueOverrides.map((d: string) => maskDateText(d)) : Array(6).fill(''));
    setNotes(item.notes || Array(6).fill(''));
    
    setActiveTab('plannerSec');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete saved schedule
  const handleDeleteSchedule = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa lịch tiêm của bệnh nhân này?')) {
      try {
        const res = await fetch(`/api/cskh-tiem-chung?id=${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        alert(result.message);
        fetchSavedSchedules();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleResetPlanner = () => {
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
    setDates(Array(6).fill(''));
    setDueOverrides(Array(6).fill(''));
    setNotes(Array(6).fill(''));
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-teal-600" /> QUẢN LÝ CSKH TIÊM CHỦNG
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Lập kế hoạch, theo dõi tiến độ và xuất danh sách nhắc hẹn vắc xin CSKH.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-55"
          >
            <Printer className="h-4 w-4" /> In Phiếu Tiêm Chủng
          </button>
          <button
            onClick={handleSaveSchedule}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-900/10 hover:bg-teal-500"
          >
            Lưu Lịch Tiêm
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-[500px] gap-1">
        <button
          onClick={() => setActiveTab('plannerSec')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'plannerSec'
              ? 'bg-white text-teal-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Lập lịch tiêm
        </button>
        <button
          onClick={() => setActiveTab('savedSec')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'savedSec'
              ? 'bg-white text-teal-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <Clock className="h-4 w-4" />
          DS Khách hàng
        </button>
        <button
          onClick={() => setActiveTab('remindersSec')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'remindersSec'
              ? 'bg-white text-teal-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Nhắc lịch hẹn
        </button>
      </div>

      {/* TAB 1: LẬP LỊCH TIÊM */}
      {activeTab === 'plannerSec' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Profile Form + Vaccine choosing */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
              {activeEditId ? 'Cập nhật lịch tiêm khách' : 'Thông tin người tiêm & Vắc xin'}
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Mã đối tượng</label>
                  <input
                    type="text"
                    placeholder="Mã BN (nếu có)"
                    value={patientCode}
                    onChange={(e) => setPatientCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Họ tên người tiêm *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập họ và tên..."
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  placeholder="Nhập SĐT..."
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Ngày sinh</label>
                  <input
                    placeholder="dd/mm/yyyy"
                    value={dob}
                    onChange={(e) => setDob(maskDateText(e.target.value, e.target.value.length < (dob || "").length))}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                  >
                    <option value=""></option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  placeholder="Xã, Phường, Quận, Huyện..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>

              {/* Vaccine dropdown autocomplete */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 mb-1">Chọn vắc xin tiêm *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Gõ tên vắc xin..."
                    value={vaccineInputVal}
                    onFocus={() => setShowVaccineDropdown(true)}
                    onClick={() => setShowVaccineDropdown(true)}
                    onBlur={() => setTimeout(() => setShowVaccineDropdown(false), 200)}
                    onChange={(e) => {
                      setVaccineInputVal(e.target.value);
                      setSelectedVaccine(e.target.value);
                      setSelectedProtocolId(''); // reset protocol when changing vaccine
                      setShowVaccineDropdown(true);
                    }}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                  />
                  <ChevronDown 
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowVaccineDropdown(prev => !prev)}
                    className="absolute right-3 top-3 h-4 w-4 text-slate-400 cursor-pointer hover:text-teal-600 transition-colors" 
                  />
                </div>

                {showVaccineDropdown && (
                  <div 
                    className="absolute left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl mt-1.5 max-h-[200px] overflow-y-auto"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {filteredVaccineList.length === 0 ? (
                      <div className="p-3 text-xs text-slate-400 font-bold">Không tìm thấy vắc xin nào</div>
                    ) : (
                      filteredVaccineList.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSelectedVaccine(v);
                            setVaccineInputVal(v);
                            setShowVaccineDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                        >
                          {v}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Protocol selector */}
              {selectedVaccine && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Chọn phác đồ tiêm ngừa</label>
                  <select
                    value={selectedProtocolId}
                    onChange={(e) => setSelectedProtocolId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                  >
                    {recommendedProtocols.length === 0 ? (
                      <option value="">Lưu ý: Không tìm thấy phác đồ khớp độ tuổi</option>
                    ) : (
                      recommendedProtocols.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.object} (Dòng {p.sourceRow})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Protocol summary information */}
            {activeProtocol && (
              <div className="mt-4 bg-teal-50/50 border border-teal-100 rounded-2xl p-4 space-y-2">
                <h4 className="font-extrabold text-teal-950 text-xs flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-teal-700" /> Chi tiết phác đồ
                </h4>
                <div className="text-[11px] font-semibold text-teal-900 space-y-1.5 leading-relaxed">
                  <p><b>Phòng ngừa bệnh:</b> {activeProtocol.disease}</p>
                  <p><b>Độ tuổi chỉ định:</b> {activeProtocol.object}</p>
                  <p><b>Đường dùng:</b> {activeProtocol.route}</p>
                  <p className="whitespace-pre-line border-t border-teal-200/50 pt-1.5 mt-1.5 font-bold">
                    {activeProtocol.schedule}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetPlanner}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-55"
              >
                Reset Planner
              </button>
            </div>
          </div>

          {/* Doses Grid Schedule Card */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                BẢNG TIẾN ĐỘ TIÊM NGỪA (6 MŨI PHÁC ĐỒ)
              </h3>
              
              {!activeProtocol ? (
                <div className="py-20 text-center text-slate-450 font-bold">
                  Vui lòng chọn Vắc xin và Phác đồ ở cột bên trái để thiết lập lịch tiêm.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-teal-50/50 text-teal-800 font-bold h-9">
                        <th className="pl-4 w-20">Mũi tiêm</th>
                        <th className="w-40 text-center">Ngày tiêm thực tế</th>
                        <th className="w-40 text-center">Ngày hẹn tự tính</th>
                        <th className="w-40 text-center">Đường tiêm</th>
                        <th className="pl-4">Ghi chú mũi tiêm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DOSE_LABELS.map((label, idx) => {
                        const statusObj = getDoseStatus(idx, computedDates[idx]);
                        
                        return (
                          <tr key={label} className="border-b border-slate-100 h-11 hover:bg-slate-50/50">
                            <td className="pl-4 font-bold text-slate-700">{label}</td>
                            <td className="text-center px-2">
                              <div className="flex items-center gap-1">
                                <input
                                  placeholder="dd/mm/yyyy"
                                  value={dates[idx]}
                                  onChange={(e) => {
                                    const isDel = e.target.value.length < (dates[idx] || "").length;
                                    handleActualDateInput(idx, maskDateText(e.target.value, isDel));
                                  }}
                                  className="w-full text-center border border-slate-200 rounded-lg p-1 text-xs font-semibold outline-none focus:border-teal-500"
                                />
                                <input
                                  type="date"
                                  onChange={(e) => handleActualDatePicker(idx, e.target.value)}
                                  className="w-6 h-6 p-0 border-0 outline-none cursor-pointer bg-transparent"
                                />
                              </div>
                            </td>
                            <td className="text-center px-2">
                              {idx === 0 ? (
                                <span className="text-[10px] font-bold text-slate-400">Mốc gốc</span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <input
                                    placeholder="dd/mm/yyyy"
                                    value={dueOverrides[idx] || (computedDates[idx] ? fmtDate(computedDates[idx]) : '')}
                                    onChange={(e) => {
                                      const currentVal = dueOverrides[idx] || (computedDates[idx] ? fmtDate(computedDates[idx]) : '');
                                      const isDel = e.target.value.length < currentVal.length;
                                      handleDueOverrideInput(idx, maskDateText(e.target.value, isDel));
                                    }}
                                    className="w-full text-center border border-slate-200 rounded-lg p-1 text-xs font-semibold outline-none focus:border-teal-500"
                                  />
                                  <input
                                    type="date"
                                    onChange={(e) => handleDueDatePicker(idx, e.target.value)}
                                    className="w-6 h-6 p-0 border-0 outline-none cursor-pointer bg-transparent"
                                  />
                                </div>
                              )}
                            </td>
                            <td className="text-center px-2 text-[10px] text-slate-500 italic leading-tight max-w-[120px]">
                              {activeProtocol.route}
                            </td>
                            <td className="pl-4 px-2">
                              <div className="flex flex-col gap-1">
                                <input
                                  type="text"
                                  placeholder="Ghi chú..."
                                  value={notes[idx]}
                                  onChange={(e) => handleNoteInput(idx, e.target.value)}
                                  className="w-full border border-slate-200 rounded-lg p-1 text-xs font-medium outline-none focus:border-teal-500"
                                />
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold text-center self-start ${statusObj.className}`}>
                                  {statusObj.label}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {activeProtocol && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-teal-500"
                >
                  {activeEditId ? 'Cập Nhật Lịch Hẹn' : 'Lưu Lịch Hẹn Vào Database'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DANH SÁCH LỊCH TIÊM ĐÃ LƯU */}
      {activeTab === 'savedSec' && (
        <div className="space-y-4">
          {/* Quick Filters */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tìm nhanh</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tên, Số điện thoại..."
                    value={qSearch}
                    onChange={(e) => setQSearch(e.target.value)}
                    className="w-full pl-9 rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Lọc loại Vắc xin</label>
                <select
                  value={filterVaccine}
                  onChange={(e) => setFilterVaccine(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                >
                  <option value="">Tất cả</option>
                  {DATA.vaccines.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Database Table view */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full">
                Tổng cộng {savedSchedules.length} hồ sơ theo dõi
              </span>
            </div>

            <div className="overflow-x-auto max-h-[60vh] relative scrollbar-thin scrollbar-thumb-slate-200">
              {selectedIds.length > 0 && (
                <div className="mb-3 px-6 py-2 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800">Đã chọn {selectedIds.length} hồ sơ</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const selectedData = savedSchedules
                          .filter(item => selectedIds.includes(item._id))
                          .map(item => ({
                            'Họ tên': item.patientName,
                            'Số điện thoại': item.phone || '',
                            'Ngày sinh': item.dob || '',
                            'Vắc xin': item.vaccine,
                          }));
                      
                        const ws = XLSX.utils.json_to_sheet(selectedData);
                        
                        // Style all cells in the sheet with borders, fonts, alignments, and fills
                        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
                        for (let R = range.s.r; R <= range.e.r; ++R) {
                          for (let C = range.s.c; C <= range.e.c; ++C) {
                            const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
                            if (!ws[cell_ref]) continue;

                            ws[cell_ref].s = {
                              border: {
                                top: { style: 'thin', color: { rgb: 'A0A0A0' } },
                                bottom: { style: 'thin', color: { rgb: 'A0A0A0' } },
                                left: { style: 'thin', color: { rgb: 'A0A0A0' } },
                                right: { style: 'thin', color: { rgb: 'A0A0A0' } }
                              },
                              font: {
                                name: 'Arial',
                                sz: 10,
                                bold: R === 0
                              },
                              alignment: {
                                horizontal: (R === 0 || C === 0 || C === 2 || C === 3) ? 'center' : 'left',
                                vertical: 'center'
                              }
                            };

                            if (R === 0) {
                              ws[cell_ref].s.fill = {
                                fgColor: { rgb: 'F2F2F2' }
                              };
                            }
                          }
                        }

                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "Danh_Sach_Tiem");
                        XLSX.writeFile(wb, "DanhSachGuiTinNhan.xlsx");
                        alert('Đã tải file Excel thành công! Bạn có thể chuyển sang trang Quản Lý Tin Nhắn để tải file này lên.');
                      }}
                      className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-500 transition-colors"
                    >
                      Xuất Excel gửi tin nhắn
                    </button>
                    <button 
                      onClick={async () => {
                         if(confirm(`Bạn có chắc muốn xóa ${selectedIds.length} hồ sơ đã chọn?`)) {
                            try {
                              const res = await fetch(`/api/cskh-tiem-chung?ids=${selectedIds.join(',')}`, { method: 'DELETE' });
                              const result = await res.json();
                              if (!res.ok) throw new Error(result.message);
                              alert(result.message);
                              setSelectedIds([]);
                              fetchSavedSchedules();
                            } catch (err: any) {
                              alert(err.message);
                            }
                         }
                      }}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500 transition-colors"
                    >
                      Xóa đã chọn
                    </button>
                  </div>
                </div>
              )}
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold h-10 border-b border-slate-200 uppercase text-[10px]">
                    <th className="pl-4 w-10 text-center border border-slate-200">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        checked={savedSchedules.length > 0 && selectedIds.length === savedSchedules.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(savedSchedules.map(item => item._id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                      />
                    </th>
                    <th className="text-center w-12 border border-slate-200">STT</th>
                    <th className="pl-4 border border-slate-200 py-2">Họ tên người tiêm</th>
                    <th className="w-28 text-center border border-slate-200">Điện thoại</th>
                    <th className="w-28 text-center border border-slate-200">Ngày sinh</th>
                    <th className="w-32 text-center border border-slate-200">Vắc xin theo dõi</th>
                    <th className="w-44 pl-4 border border-slate-200">Phác đồ áp dụng</th>
                    <th className="w-40 text-center border border-slate-200">Tiến độ tiêm gần nhất</th>
                    <th className="w-24 text-center border border-slate-200">Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {savedSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-20 text-slate-400 font-bold border border-slate-200">
                        Không tìm thấy hồ sơ theo dõi tiêm chủng nào.
                      </td>
                    </tr>
                  ) : (
                    savedSchedules.map((item, index) => {
                      // Find last actual date index
                      const lastActualIndex = item.dates ? [...item.dates].reverse().findIndex(d => d !== '') : -1;
                      const nextDoseIndex = lastActualIndex === -1 ? 0 : 5 - lastActualIndex;
                      
                      const actualDoseCount = item.dates ? item.dates.filter((d: string) => d !== '').length : 0;
                      
                      return (
                        <tr key={item._id} className="border-b border-slate-100 h-10 hover:bg-slate-50 transition-colors">
                          <td className="pl-4 text-center border border-slate-200">
                            <input 
                              type="checkbox" 
                              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                              checked={selectedIds.includes(item._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds(prev => [...prev, item._id]);
                                } else {
                                  setSelectedIds(prev => prev.filter(id => id !== item._id));
                                }
                              }}
                            />
                          </td>
                          <td className="text-center text-slate-400 font-bold border border-slate-200">{index + 1}</td>
                          <td className="pl-4 font-bold text-slate-800 border border-slate-200 py-1.5">
                            {item.patientCode && <div className="text-[10px] text-teal-600 mb-0.5">{item.patientCode}</div>}
                            {item.patientName}
                            {item.address && <div className="text-[9px] text-slate-400 font-normal mt-0.5 max-w-[120px] truncate">{item.address}</div>}
                          </td>
                          <td className="text-center text-slate-650 font-semibold border border-slate-200">{item.phone || 'Chưa có'}</td>
                          <td className="text-center text-slate-500 border border-slate-200">{item.dob || ''}</td>
                          <td className="text-center font-bold text-teal-800 bg-teal-50/10 border border-slate-200">{item.vaccine}</td>
                          <td className="pl-4 text-slate-500 text-[11px] truncate max-w-xs border border-slate-200" title={item.protocolId}>
                            {DATA.protocols.find(p => p.id === item.protocolId)?.object || item.protocolId}
                          </td>
                          <td className="text-center border border-slate-200">
                            <span className="px-2 py-0.5 rounded-full text-[9px] bg-sky-100 text-sky-800 font-bold">
                              Đã tiêm {actualDoseCount}/6 mũi
                            </span>
                          </td>
                          <td className="text-center space-x-2 border border-slate-200">
                            <button
                              onClick={() => handleLoadSchedule(item)}
                              className="text-teal-600 hover:text-teal-800 font-bold"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(item._id)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DANH SÁCH NHẮC HẸN */}
      {activeTab === 'remindersSec' && (
        <RemindersTab 
          data={savedSchedules} 
          onRefresh={fetchSavedSchedules} 
          onEdit={handleLoadSchedule}
          onDelete={handleDeleteSchedule}
        />
      )}
    </div>
  );
}
