'use client';

import React from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { DOSE_LABELS, fmtDate, maskDateText } from '@/lib/vaccineData';
import type { PlannerState } from '@/hooks/usePlanner';

interface PlannerTabProps {
  planner: PlannerState;
}

export default function PlannerTab({ planner }: PlannerTabProps) {
  const p = planner;
  const protocol = planner.activeProtocol;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto">
      {/* Patient Profile Form + Vaccine choosing */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
          {p.activeEditId ? 'Cập nhật lịch tiêm khách' : 'Thông tin người tiêm & Vắc xin'}
        </h3>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Mã đối tượng</label>
              <input
                type="text"
                placeholder="Mã BN (nếu có)"
                value={p.patientCode}
                onChange={(e) => p.setPatientCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Họ tên người tiêm *</label>
              <input
                type="text"
                required
                placeholder="Nhập họ và tên..."
                value={p.patientName}
                onChange={(e) => p.setPatientName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Số điện thoại liên hệ</label>
            <input
              type="text"
              placeholder="Nhập SĐT..."
              value={p.patientPhone}
              onChange={(e) => p.setPatientPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Ngày sinh</label>
              <input
                placeholder="dd/mm/yyyy"
                value={p.dob}
                onChange={(e) => p.setDob(maskDateText(e.target.value, e.target.value.length < (p.dob || '').length))}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Giới tính</label>
              <select
                value={p.gender}
                onChange={(e) => p.setGender(e.target.value)}
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
              value={p.address}
              onChange={(e) => p.setAddress(e.target.value)}
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
                value={p.vaccineInputVal}
                onFocus={() => p.setShowVaccineDropdown(true)}
                onClick={() => p.setShowVaccineDropdown(true)}
                onBlur={() => setTimeout(() => p.setShowVaccineDropdown(false), 200)}
                onChange={(e) => {
                  p.setVaccineInputVal(e.target.value);
                  p.setSelectedVaccine(e.target.value);
                  p.setSelectedProtocolId('');
                  p.setShowVaccineDropdown(true);
                }}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
              />
              <ChevronDown
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => p.setShowVaccineDropdown((prev) => !prev)}
                className="absolute right-3 top-3 h-4 w-4 text-slate-400 cursor-pointer hover:text-teal-600 transition-colors"
              />
            </div>

            {p.showVaccineDropdown && (
              <div
                className="absolute left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl mt-1.5 max-h-[200px] overflow-y-auto"
                onMouseDown={(e) => e.preventDefault()}
              >
                {p.filteredVaccineList.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 font-bold">Không tìm thấy vắc xin nào</div>
                ) : (
                  p.filteredVaccineList.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        p.setSelectedVaccine(v);
                        p.setVaccineInputVal(v);
                        // Reset the protocol so it is re-recommended for the new vaccine.
                        p.setSelectedProtocolId('');
                        p.setShowVaccineDropdown(false);
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
          {p.selectedVaccine && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Chọn phác đồ tiêm ngừa</label>
              <select
                value={p.selectedProtocolId}
                onChange={(e) => p.setSelectedProtocolId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
              >
                {p.availableProtocols.length === 0 ? (
                  <option value="">Lưu ý: Không tìm thấy phác đồ khớp</option>
                ) : (
                  p.availableProtocols.map((proto) => (
                    <option key={proto.id} value={proto.id}>
                      {proto.object} (Dòng {proto.sourceRow})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}
        </div>

        {/* Protocol summary information */}
        {protocol && (
          <div className="mt-4 bg-teal-50/50 border border-teal-100 rounded-2xl p-4 space-y-2">
            <h4 className="font-extrabold text-teal-950 text-xs flex items-center gap-1.5">
              <Info className="h-4 w-4 text-teal-700" /> Chi tiết phác đồ
            </h4>
            <div className="text-[11px] font-semibold text-teal-900 space-y-1.5 leading-relaxed">
              <p><b>Phòng ngừa bệnh:</b> {protocol.disease}</p>
              <p><b>Độ tuổi chỉ định:</b> {protocol.object}</p>
              <p><b>Đường dùng:</b> {protocol.route}</p>
              <p className="whitespace-pre-line border-t border-teal-200/50 pt-1.5 mt-1.5 font-bold">
                {protocol.schedule}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={p.reset}
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

          {!protocol ? (
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
                    const statusObj = p.getDoseStatus(idx, p.computedDates[idx]);

                    return (
                      <tr key={label} className="border-b border-slate-100 h-11 hover:bg-slate-50/50">
                        <td className="pl-4 font-bold text-slate-700">{label}</td>
                        <td className="text-center px-2">
                          <div className="flex items-center gap-1">
                            <input
                              placeholder="dd/mm/yyyy"
                              value={p.dates[idx]}
                              onChange={(e) => {
                                const isDel = e.target.value.length < (p.dates[idx] || '').length;
                                p.handleActualDateInput(idx, maskDateText(e.target.value, isDel));
                              }}
                              className="w-full text-center border border-slate-200 rounded-lg p-1 text-xs font-semibold outline-none focus:border-teal-500"
                            />
                            <input
                              type="date"
                              onChange={(e) => p.handleActualDatePicker(idx, e.target.value)}
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
                                value={p.dueOverrides[idx] || (p.computedDates[idx] ? fmtDate(p.computedDates[idx]) : '')}
                                onChange={(e) => {
                                  const currentVal = p.dueOverrides[idx] || (p.computedDates[idx] ? fmtDate(p.computedDates[idx]) : '');
                                  const isDel = e.target.value.length < currentVal.length;
                                  p.handleDueOverrideInput(idx, maskDateText(e.target.value, isDel));
                                }}
                                className="w-full text-center border border-slate-200 rounded-lg p-1 text-xs font-semibold outline-none focus:border-teal-500"
                              />
                              <input
                                type="date"
                                onChange={(e) => p.handleDueDatePicker(idx, e.target.value)}
                                className="w-6 h-6 p-0 border-0 outline-none cursor-pointer bg-transparent"
                              />
                            </div>
                          )}
                        </td>
                        <td className="text-center px-2 text-[10px] text-slate-500 italic leading-tight max-w-[120px]">
                          {protocol.route}
                        </td>
                        <td className="pl-4 px-2">
                          <div className="flex flex-col gap-1">
                            <input
                              type="text"
                              placeholder="Ghi chú..."
                              value={p.notes[idx]}
                              onChange={(e) => p.handleNoteInput(idx, e.target.value)}
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

        {protocol && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={p.save}
              className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-teal-500"
            >
              {p.activeEditId ? 'Cập nhật Lịch Hẹn' : 'Lưu Lịch Hẹn Vào Database'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
