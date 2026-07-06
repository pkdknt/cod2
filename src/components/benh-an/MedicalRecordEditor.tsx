'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MedicalRecordService, MedicalRecordData } from '@/services/MedicalRecordService';

interface MedicalRecordEditorProps {
  formState: MedicalRecordData;
  onChange: (val: MedicalRecordData) => void;
  onSubmit: () => void;
  onReset: () => void;
  isEdit: boolean;
}

export default function MedicalRecordEditor({
  formState,
  onChange,
  onSubmit,
  onReset,
  isEdit
}: MedicalRecordEditorProps) {

  const handleFieldChange = (field: keyof MedicalRecordData, value: string) => {
    onChange({
      ...formState,
      [field]: value
    });
  };

  const [suggestions, setSuggestions] = useState<MedicalRecordData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNameChange = (val: string) => {
    handleFieldChange('hoTen', val.toUpperCase());
    if (val.trim().length > 1) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      setIsSearching(true);
      setShowSuggestions(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await MedicalRecordService.getAll({ q: val, pageSize: 5 });
          setSuggestions(res.items || []);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: MedicalRecordData) => {
    onChange({
      ...formState,
      hoTen: suggestion.hoTen || '',
      gioiTinh: suggestion.gioiTinh || '',
      namSinh: suggestion.namSinh || '',
      cccd: suggestion.cccd || '',
      soTheBHYT: suggestion.soTheBHYT || '',
      diaChi: suggestion.diaChi || '',
      dienThoai: suggestion.dienThoai || '',
      ngheNghiep: suggestion.ngheNghiep || '',
      danToc: suggestion.danToc || '',
      ngoaiKieu: suggestion.ngoaiKieu || '',
      noiLamViec: suggestion.noiLamViec || '',
      nguoiNha: suggestion.nguoiNha || '',
    });
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const isSpecialist = formState.recordType === 'rhm' || formState.recordType === 'yhct';

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">
          Biểu mẫu nhập liệu hồ sơ bệnh án
        </h3>
        <div>
          <label className="inline-block text-xs font-bold text-slate-500 mr-2">Loại bệnh án:</label>
          <select
            value={formState.recordType}
            onChange={(e) => handleFieldChange('recordType', e.target.value as any)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold bg-teal-50 border-teal-200 text-teal-700 outline-none"
          >
            <option value="ngoai-tru">Bìa Ngoại trú</option>
            <option value="bia-rhm">Bìa Răng Hàm Mặt</option>
            <option value="rhm">Bệnh án Răng Hàm Mặt (RHM)</option>
            <option value="yhct">Bìa Y học cổ truyền (YHCT)</option>
          </select>
        </div>
      </div>

      {/* SECTION 1: Administrative Details */}
      <div className="space-y-4">
        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-teal-650">
          I. Thông tin hành chính
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Số ngoại trú</label>
            <input
              type="text"
              placeholder="VD: NT-001..."
              value={formState.soNgoaiTru || ''}
              onChange={(e) => handleFieldChange('soNgoaiTru', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Số lưu trữ</label>
            <input
              type="text"
              placeholder="VD: LT-001..."
              value={formState.soLuuTru || ''}
              onChange={(e) => handleFieldChange('soLuuTru', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div className="md:col-span-2 relative" ref={wrapperRef}>
            <label className="block text-xs font-bold text-slate-500 mb-1">Họ tên bệnh nhân *</label>
            <input
              type="text"
              required
              placeholder="Nhập để tìm hoặc IN HOA CÓ DẤU..."
              value={formState.hoTen}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none relative z-10"
            />
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {isSearching ? (
                  <div className="p-3 text-xs text-slate-500 text-center">Đang tìm...</div>
                ) : suggestions.length > 0 ? (
                  <ul className="max-h-60 overflow-y-auto">
                    {suggestions.map((s, idx) => (
                      <li
                        key={s._id || idx}
                        onClick={() => handleSelectSuggestion(s)}
                        className="px-3 py-2.5 hover:bg-teal-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-700 text-xs">{s.hoTen}</span>
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{s.dienThoai || 'No Phone'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                          {s.namSinh ? `${s.namSinh} - ` : ''}{s.gioiTinh ? `${s.gioiTinh} - ` : ''}{s.diaChi || ''}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : formState.hoTen?.length > 1 && (
                  <div className="p-3 text-xs text-slate-500 text-center">Không tìm thấy bệnh nhân cũ</div>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Giới tính</label>
            <select
              value={formState.gioiTinh || 'Nam'}
              onChange={(e) => handleFieldChange('gioiTinh', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Năm sinh / Ngày sinh</label>
            <input
              type="text"
              placeholder="VD: 1995"
              value={formState.namSinh || ''}
              onChange={(e) => handleFieldChange('namSinh', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tuổi</label>
            <input
              type="text"
              placeholder="VD: 31"
              value={formState.tuoi || ''}
              onChange={(e) => handleFieldChange('tuoi', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Mã bệnh nhân</label>
            <input
              type="text"
              placeholder="VD: BN-001..."
              value={formState.maBenhNhan || ''}
              onChange={(e) => handleFieldChange('maBenhNhan', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Định danh cá nhân / CCCD</label>
            <input
              type="text"
              placeholder="CCCD hoặc hộ chiếu..."
              value={formState.cccd || ''}
              onChange={(e) => handleFieldChange('cccd', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Số thẻ BHYT</label>
            <input
              type="text"
              placeholder="Số thẻ BHYT..."
              value={formState.soTheBHYT || ''}
              onChange={(e) => handleFieldChange('soTheBHYT', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Hạn thẻ BHYT đến</label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={formState.bhytDen || ''}
              onChange={(e) => handleFieldChange('bhytDen', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Số điện thoại liên hệ</label>
            <input
              type="text"
              placeholder="Số điện thoại..."
              value={formState.dienThoai || ''}
              onChange={(e) => handleFieldChange('dienThoai', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Đến khám lúc (ngày giờ)</label>
            <input
              type="text"
              placeholder="08 giờ, ngày 29/06/2026..."
              value={formState.denKhamLuc || ''}
              onChange={(e) => handleFieldChange('denKhamLuc', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-500 mb-1">Địa chỉ thường trú</label>
            <input
              type="text"
              placeholder="Địa chỉ cư ngụ hiện tại..."
              value={formState.diaChi || ''}
              onChange={(e) => handleFieldChange('diaChi', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Specialist Demographics (RHM / YHCT) */}
      {isSpecialist && (
        <div className="border-t border-slate-100 pt-4 space-y-4 animate-fade-in">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-teal-650">
            II. Thông tin nghề nghiệp và gia cảnh
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Nghề nghiệp</label>
              <input
                type="text"
                value={formState.ngheNghiep || ''}
                onChange={(e) => handleFieldChange('ngheNghiep', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Dân tộc</label>
              <input
                type="text"
                value={formState.danToc || ''}
                onChange={(e) => handleFieldChange('danToc', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Ngoại kiều</label>
              <input
                type="text"
                value={formState.ngoaiKieu || ''}
                onChange={(e) => handleFieldChange('ngoaiKieu', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Nơi làm việc</label>
              <input
                type="text"
                value={formState.noiLamViec || ''}
                onChange={(e) => handleFieldChange('noiLamViec', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Đối tượng (BHYT/Thu phí/...)</label>
              <input
                type="text"
                placeholder="BHYT, Thu phí, Miễn..."
                value={formState.doiTuong || ''}
                onChange={(e) => handleFieldChange('doiTuong', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 mb-1">Họ tên, địa chỉ người nhà cần báo tin</label>
              <input
                type="text"
                value={formState.nguoiNha || ''}
                onChange={(e) => handleFieldChange('nguoiNha', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Clinical Findings & Vitals */}
      {isSpecialist && (
        <div className="border-t border-slate-100 pt-4 space-y-4 animate-fade-in">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-teal-650">
            III. Triệu chứng và kết quả thăm khám
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Mạch (lần/phút)</label>
              <input
                type="text"
                value={formState.mach || ''}
                onChange={(e) => handleFieldChange('mach', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Nhiệt độ (°C)</label>
              <input
                type="text"
                value={formState.nhietDo || ''}
                onChange={(e) => handleFieldChange('nhietDo', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Huyết áp (mmHg)</label>
              <input
                type="text"
                value={formState.huyetAp || ''}
                onChange={(e) => handleFieldChange('huyetAp', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Nhịp thở (lần/phút)</label>
              <input
                type="text"
                value={formState.nhipTho || ''}
                onChange={(e) => handleFieldChange('nhipTho', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Cân nặng (kg)</label>
              <input
                type="text"
                value={formState.canNang || ''}
                onChange={(e) => handleFieldChange('canNang', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>

            <div className="md:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Lý do vào viện</label>
                <textarea
                  value={formState.lyDo || ''}
                  onChange={(e) => handleFieldChange('lyDo', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none min-h-[60px]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Quá trình bệnh lý</label>
                <textarea
                  value={formState.quaTrinhBenhLy || ''}
                  onChange={(e) => handleFieldChange('quaTrinhBenhLy', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none min-h-[60px]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tiền sử bản thân</label>
                <textarea
                  value={formState.tienSuBanThan || ''}
                  onChange={(e) => handleFieldChange('tienSuBanThan', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none min-h-[60px]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tiền sử gia đình</label>
                <textarea
                  value={formState.giaDinh || ''}
                  onChange={(e) => handleFieldChange('giaDinh', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none min-h-[60px]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">Chẩn đoán và xử trí nơi giới thiệu</label>
                <textarea
                  value={formState.chanDoanNoiGioiThieu || ''}
                  onChange={(e) => handleFieldChange('chanDoanNoiGioiThieu', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none min-h-[60px]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">Khám toàn thân</label>
                <textarea
                  value={formState.toanThan || ''}
                  onChange={(e) => handleFieldChange('toanThan', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none min-h-[60px]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Diagnosis & Treatment */}
      {isSpecialist && (
        <div className="border-t border-slate-100 pt-4 space-y-4 animate-fade-in">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-teal-650">
            IV. Chẩn đoán & Hướng điều trị ngoại trú
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Chẩn đoán xác định</label>
              <textarea
                value={formState.chanDoan || ''}
                onChange={(e) => handleFieldChange('chanDoan', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none min-h-[70px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Hướng xử trí / Thuốc điều trị</label>
              <textarea
                value={formState.xuTri || ''}
                onChange={(e) => handleFieldChange('xuTri', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none min-h-[70px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Năm ký hồ sơ ngoại trú</label>
              <input
                type="text"
                placeholder="VD: 2026"
                value={formState.namKy || ''}
                onChange={(e) => handleFieldChange('namKy', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Ghi chú bệnh án</label>
              <input
                type="text"
                value={formState.ghiChu || ''}
                onChange={(e) => handleFieldChange('ghiChu', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Button Actions */}
      <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Hủy / Nhập mới
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-teal-650 transition-colors"
        >
          {isEdit ? 'Cập Nhật Bệnh Án' : 'Lưu Bệnh Án Vào Database'}
        </button>
      </div>
    </div>
  );
}
