'use client';

import React from 'react';
import { User, Info } from 'lucide-react';
import { KskDriverExamData } from '@/services/KskDriverService';
import { BOOLS } from './constants';

interface KskDriverEditorProps {
  formState: KskDriverExamData;
  onChange: (val: KskDriverExamData) => void;
  onSubmit: () => void;
  onReset: () => void;
  isEdit: boolean;
}

export default function KskDriverEditor({
  formState,
  onChange,
  onSubmit,
  onReset,
  isEdit
}: KskDriverEditorProps) {

  const handleFieldChange = (field: keyof KskDriverExamData, value: any) => {
    onChange({
      ...formState,
      [field]: value
    });
  };

  const handleBoolChange = (question: string, value: string) => {
    onChange({
      ...formState,
      bool: {
        ...formState.bool,
        [question]: value
      }
    });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        handleFieldChange('photo', evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Left panel: Form editor */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
          Biểu mẫu nhập liệu hồ sơ lái xe
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Số phiếu *</label>
            <input
              type="text"
              required
              placeholder="VD: 001/GKSKLX..."
              value={formState.soPhieu}
              onChange={(e) => handleFieldChange('soPhieu', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">Họ tên người khám *</label>
            <input
              type="text"
              required
              placeholder="IN HOA CÓ DẤU..."
              value={formState.hoTen}
              onChange={(e) => handleFieldChange('hoTen', e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Giới tính</label>
            <select
              value={formState.gioiTinh}
              onChange={(e) => handleFieldChange('gioiTinh', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Ngày sinh (dd/mm/yyyy)</label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={formState.ngaySinh}
              onChange={(e) => handleFieldChange('ngaySinh', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tuổi</label>
            <input
              type="text"
              value={formState.tuoi}
              onChange={(e) => handleFieldChange('tuoi', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Số CCCD / Hộ chiếu</label>
            <input
              type="text"
              value={formState.cccd}
              onChange={(e) => handleFieldChange('cccd', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Cấp ngày (dd/mm/yyyy)</label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={formState.capNgay}
              onChange={(e) => handleFieldChange('capNgay', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Cấp tại</label>
            <input
              type="text"
              value={formState.capTai}
              onChange={(e) => handleFieldChange('capTai', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 mb-1">Hộ khẩu thường trú</label>
            <input
              type="text"
              value={formState.hoKhau}
              onChange={(e) => handleFieldChange('hoKhau', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Đăng ký hạng lái xe</label>
            <input
              type="text"
              placeholder="A1, B2, C, D..."
              value={formState.hangLaiXe}
              onChange={(e) => handleFieldChange('hangLaiXe', e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
            />
          </div>
        </div>

        {/* Medical history booleans */}
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
            Tiền sử bệnh lý của người lái xe (19 câu hỏi)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2">
            {BOOLS.map((q) => (
              <div key={q} className="flex items-center justify-between gap-3 text-xs bg-slate-50 p-2 rounded-xl">
                <span className="font-semibold text-slate-650 max-w-[200px]">{q}</span>
                <select
                  value={formState.bool[q] || 'Không'}
                  onChange={(e) => handleBoolChange(q, e.target.value)}
                  className="border border-slate-200 rounded-lg p-1 text-[11px] font-bold bg-white focus:outline-none"
                >
                  <option value="Không">Không</option>
                  <option value="Có">Có</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Exam findings */}
        <div className="border-t border-slate-100 pt-4 space-y-4">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
            Kết quả khám lâm sàng & cận lâm sàng
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Mắt phải không kính</label>
              <input
                type="text"
                value={formState.matKhongKinhP}
                onChange={(e) => handleFieldChange('matKhongKinhP', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Mắt trái không kính</label>
              <input
                type="text"
                value={formState.matKhongKinhT}
                onChange={(e) => handleFieldChange('matKhongKinhT', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Mắt: Sắc giác (Màu)</label>
              <input
                type="text"
                value={formState.sacGiac}
                onChange={(e) => handleFieldChange('sacGiac', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Tim mạch: Mạch (lần/phút)</label>
              <input
                type="text"
                value={formState.mach}
                onChange={(e) => handleFieldChange('mach', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Tim mạch: Huyết áp (mmHg)</label>
              <input
                type="text"
                value={formState.huyetAp}
                onChange={(e) => handleFieldChange('huyetAp', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Xét nghiệm Ma túy</label>
              <input
                type="text"
                value={formState.maTuyKQ}
                onChange={(e) => handleFieldChange('maTuyKQ', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Conclusions */}
        <div className="border-t border-slate-100 pt-4 space-y-4">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
            Kết luận hội đồng & Ký tên
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Ngày kết luận (dd/mm/yyyy)</label>
              <input
                type="text"
                value={formState.ngayKetLuan}
                onChange={(e) => handleFieldChange('ngayKetLuan', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Bác sĩ ký kết luận</label>
              <input
                type="text"
                value={formState.nguoiKetLuan}
                onChange={(e) => handleFieldChange('nguoiKetLuan', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white focus:border-teal-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1">Kết luận chung</label>
              <textarea
                value={formState.ketLuan}
                onChange={(e) => handleFieldChange('ketLuan', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold min-h-[60px] bg-white focus:border-teal-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Hủy / Nhập mới
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-teal-600 animate-pulse"
          >
            {isEdit ? 'Cập Nhật Hồ Sơ' : 'Lưu Hồ Sơ Vào Database'}
          </button>
        </div>
      </div>

      {/* Right panel: Photo selection + Info notes */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
          Ảnh thẻ giáp lai (4x6 cm)
        </h3>
        
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-slate-100/50 cursor-pointer relative min-h-[160px]">
          {formState.photo ? (
            <img
              src={formState.photo}
              alt="Ảnh chân dung giáp lai"
              className="w-32 h-44 object-cover border border-slate-300 shadow rounded-lg"
            />
          ) : (
            <div className="text-center space-y-2">
              <User className="h-10 w-10 text-slate-400 mx-auto" />
              <span className="block text-xs font-bold text-slate-650">Bấm để tải lên ảnh chân dung</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        <div className="mt-4 bg-teal-50/50 border border-teal-100 rounded-2xl p-4 space-y-2">
          <h4 className="font-extrabold text-teal-950 text-xs flex items-center gap-1.5">
            <Info className="h-4 w-4 text-teal-700" /> Hướng dẫn in ấn
          </h4>
          <p className="text-[11px] font-semibold text-teal-900 leading-relaxed">
            Để in Giấy KSK lái xe TT36 đúng kích thước A3 ngang hai mặt, chuyển sang tab <b>“Xem bản in & In ấn A3”</b>, kiểm tra hiển thị và bấm nút <b>“In phiếu”</b>. Trên hộp thoại in của trình duyệt, chọn khổ giấy <b>A3</b> và hướng <b>Ngang (Landscape)</b>.
          </p>
        </div>
      </div>
    </div>
  );
}
