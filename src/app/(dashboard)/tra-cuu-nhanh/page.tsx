'use strict';
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Search,
  ChevronDown,
  Info,
  Activity,
  Printer,
  RotateCcw
} from 'lucide-react';
import {
  DATA,
  DOSE_LABELS,
  parseDate,
  fmtDate,
  fmtDateIso,
  maskDateText,
  addInterval,
  monthsAge,
  parseAgeRange,
  parseSchedule,
  sequentialInterval,
  norm,
  matchSearch
} from '@/lib/vaccineData';

const toInputDate = (v: string) => {
  const d = parseDate(v);
  return d ? fmtDate(d) : v;
};

export default function TraCuuNhanhPage() {
  // Planner States
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [selectedVaccine, setSelectedVaccine] = useState('');
  const [selectedProtocolId, setSelectedProtocolId] = useState('');
  
  const [dates, setDates] = useState<string[]>(Array(6).fill(''));
  const [dueOverrides, setDueOverrides] = useState<string[]>(Array(6).fill(''));
  const [notes, setNotes] = useState<string[]>(Array(6).fill(''));

  // Autocomplete dropdown
  const [vaccineInputVal, setVaccineInputVal] = useState('');
  const [showVaccineDropdown, setShowVaccineDropdown] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vac_app_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.dob) setDob(toInputDate(parsed.dob));
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.vaccine) {
          setSelectedVaccine(parsed.vaccine);
          setVaccineInputVal(parsed.vaccine);
        }
        if (parsed.protocolId) setSelectedProtocolId(parsed.protocolId);
        if (parsed.dates) setDates(parsed.dates.map((d: string) => toInputDate(d)));
        if (parsed.dueOverrides) setDueOverrides(parsed.dueOverrides.map((d: string) => toInputDate(d)));
        if (parsed.notes) setNotes(parsed.notes);
      } catch (e) {
        console.error('Error loading saved state:', e);
      }
    }
  }, []);

  // Save state to localStorage when anything changes
  useEffect(() => {
    if (selectedVaccine || dob || gender || selectedProtocolId || dates.some(d => d) || dueOverrides.some(d => d) || notes.some(n => n)) {
      const stateToSave = {
        dob,
        gender,
        vaccine: selectedVaccine,
        protocolId: selectedProtocolId,
        dates,
        dueOverrides,
        notes
      };
      localStorage.setItem('vac_app_v3', JSON.stringify(stateToSave));
    }
  }, [dob, gender, selectedVaccine, selectedProtocolId, dates, dueOverrides, notes]);

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
    
    const matching = DATA.protocols.filter(
      (p) =>
        norm(p.vaccine) === q ||
        norm(p.vaccine).includes(q) ||
        q.includes(norm(p.vaccine))
    );

    const parsedDob = parseDate(dob);
    if (parsedDob) {
      const at = parseDate(dates[0]) || new Date();
      const ageInMonths = monthsAge(parsedDob, at);
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
    if (recommendedProtocols.length > 0 && !selectedProtocolId) {
      setSelectedProtocolId(recommendedProtocols[0].id);
    }
  }, [selectedVaccine, dob]);

  // Active protocol details
  const activeProtocol = DATA.protocols.find((p) => p.id === selectedProtocolId);

  // Live Scheduler Math Calculations
  const computedDates = useMemo(() => {
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
  }, [activeProtocol, dates, dueOverrides]);

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

  const handleResetPlanner = () => {
    if (confirm('Bạn có chắc muốn Reset toàn bộ thông tin tra cứu?')) {
      setDob('');
      setGender('');
      setSelectedVaccine('');
      setVaccineInputVal('');
      setSelectedProtocolId('');
      setDates(Array(6).fill(''));
      setDueOverrides(Array(6).fill(''));
      setNotes(Array(6).fill(''));
      localStorage.removeItem('vac_app_v3');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            🔍 TRA CỨU NHANH PHÁC ĐỒ TIÊM
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Không lưu database • Tự động lưu trình duyệt (localStorage) • Phù hợp tra cứu tính lịch nhanh
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" /> In Lịch Hẹn
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
            Thông tin người tiêm & Vắc xin
          </h3>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Ngày sinh (dd/mm/yyyy)</label>
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

            {/* Vaccine Dropdown */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 mb-1">Chọn vắc xin tiêm *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Gõ tìm nhanh hoặc chọn..."
                  value={vaccineInputVal}
                  onFocus={() => setShowVaccineDropdown(true)}
                  onClick={() => setShowVaccineDropdown(true)}
                  onBlur={() => setTimeout(() => setShowVaccineDropdown(false), 200)}
                  onChange={(e) => {
                    setVaccineInputVal(e.target.value);
                    setSelectedVaccine(e.target.value);
                    setSelectedProtocolId('');
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
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-55 border-b border-slate-100 last:border-0"
                      >
                        {v}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Protocol select */}
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

          {/* Protocol details summary */}
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
              className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="h-4 w-4" /> Reset Planner
            </button>
          </div>
        </div>

        {/* Right Table */}
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
        </div>
      </div>
    </div>
  );
}
