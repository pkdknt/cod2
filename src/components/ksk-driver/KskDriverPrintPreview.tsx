'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { KskDriverExamData } from '@/services/KskDriverService';
import { ClinicSettings } from './KskClinicSettingsPanel';

interface KskDriverPrintPreviewProps {
  formState: KskDriverExamData;
  settings: ClinicSettings;
}

export default function KskDriverPrintPreview({ formState, settings }: KskDriverPrintPreviewProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs font-bold text-slate-650">
          Đang xem bản in của hồ sơ: <b>{formState.hoTen || 'Chưa chọn'}</b> (Số phiếu: {formState.soPhieu || 'Trống'})
        </span>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-600"
        >
          <Printer className="h-4 w-4" /> Bắt đầu in A3 ngang
        </button>
      </div>

      {/* Renders the A3 layout horizontally exactly like the legacy html */}
      <div id="print-preview-section" className="overflow-x-auto bg-slate-600 p-8 rounded-3xl">
        <div className="bg-white p-9 font-serif text-[11.5px] leading-tight text-black w-[420mm] h-[297mm] mx-auto shadow-2xl relative print:m-0 print:shadow-none print:p-8">
          {/* Grid 2 halves */}
          <div className="grid grid-cols-2 gap-8 h-full">
            
            {/* Trang trái: Cận lâm sàng & Kết luận */}
            <div className="flex flex-col justify-between border-r border-dashed border-slate-205 pr-4">
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wide border-b border-black pb-1.5 mb-3">
                  III. KHÁM CẬN LÂM SÀNG
                </h3>
                <table className="w-full border-collapse border border-black text-[11px] mb-4">
                  <thead>
                    <tr className="border-b border-black h-8 bg-slate-50 font-bold">
                      <th className="border-r border-black p-2 text-center">Nội dung khám</th>
                      <th className="w-40 p-2 text-center">Họ tên, chữ ký của Bác sỹ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black min-h-[50px]">
                      <td className="border-r border-black p-2">
                        <b>1. Xét nghiệm ma túy</b><br />
                        (Xét nghiệm sàng lọc các loại ma túy: Amphetamin, Marijuana, Heroin, v.v.)<br />
                        <span className="font-bold text-slate-800">Kết quả: {formState.maTuyKQ || 'Âm tính'}</span>
                      </td>
                      <td className="p-2 text-center"></td>
                    </tr>
                    <tr className="min-h-[50px]">
                      <td className="border-r border-black p-2">
                        <b>2. Xét nghiệm cận lâm sàng khác khi có chỉ định</b><br />
                        Kết quả xét nghiệm máu/hơi thở nồng độ cồn, điện tâm đồ, X-quang, v.v.<br />
                        <span className="font-bold text-slate-800">Kết quả khác: {formState.xetNghiemKhacKQ || 'Bình thường'}</span>
                      </td>
                      <td className="p-2 text-center"></td>
                    </tr>
                  </tbody>
                </table>

                <h3 className="font-extrabold text-sm uppercase tracking-wide border-b border-black pb-1.5 mb-2 mt-4">
                  IV. KẾT LUẬN
                </h3>
                <div className="border border-black p-3 rounded-lg min-h-[90px] text-[11.5px] leading-relaxed">
                  <p className="font-bold">{formState.ketLuan}</p>
                  <p className="italic mt-3 text-[10.5px] text-slate-500">
                    (Giấy khám sức khỏe này có giá trị sử dụng trong vòng 12 tháng kể từ ngày ký kết luận)
                  </p>
                </div>
              </div>

              <div className="text-center self-end w-56 font-serif">
                <p className="italic text-[10.5px] mb-1">
                  {settings.province}, ngày {formState.ngayKetLuan || new Date().toLocaleDateString('vi-VN')}
                </p>
                <p className="font-bold uppercase text-[11px]">{settings.nguoiKetLuanLabel}</p>
                <p className="italic text-[10px] text-slate-450 mt-1">(Ký, ghi rõ họ tên và đóng dấu)</p>
                <p className="font-bold text-slate-850 mt-16">{formState.nguoiKetLuan}</p>
              </div>
            </div>

            {/* Trang phải: Hành chính & Tiền sử */}
            <div className="pl-4 flex flex-col justify-between">
              <div>
                {/* Brand layout */}
                <div className="flex justify-between items-start mb-4">
                  <div className="text-center font-bold text-[10.5px] leading-snug">
                    <p>{settings.company}</p>
                    <p>{settings.clinic}</p>
                    <p className="font-normal border-t border-black/40 pt-0.5 mt-1 inline-block">
                      Số: {formState.soPhieu || '...'} / {settings.codePrefix}
                    </p>
                  </div>
                  <div className="text-center font-bold text-[10.5px] leading-snug">
                    <p>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="text-[9.5px]">Độc lập - Tự do - Hạnh phúc</p>
                  </div>
                </div>

                <h2 className="text-center font-black text-[13.5px] uppercase mt-2">
                  GIẤY KHÁM SỨC KHỎE LÁI XE
                </h2>
                <p className="text-center italic text-[9.5px] text-slate-500 mb-4">{settings.legal}</p>

                <div className="flex gap-4 items-start">
                  <div className="w-24 h-32 border border-slate-300 bg-slate-50 flex items-center justify-center text-center text-[9px] text-slate-400 rounded">
                    {formState.photo ? (
                      <img src={formState.photo} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      'Ảnh 4x6 cm'
                    )}
                  </div>
                  <div className="flex-1 space-y-2 text-[11px] font-serif">
                    <p><b>1. Họ và tên (chữ in hoa):</b> <span className="uppercase font-bold">{formState.hoTen}</span></p>
                    <p><b>2. Giới tính:</b> {formState.gioiTinh} &nbsp;&nbsp;&nbsp;&nbsp; <b>3. Ngày sinh:</b> {formState.ngaySinh} (Tuổi: {formState.tuoi})</p>
                    <p><b>4. Số CCCD/Hộ chiếu:</b> {formState.cccd}</p>
                    <p><b>5. Cấp ngày:</b> {formState.capNgay} &nbsp;&nbsp; <b>Tại:</b> {formState.capTai}</p>
                    <p><b>6. Hộ khẩu thường trú:</b> {formState.hoKhau}</p>
                    <p><b>7. Khám sức khỏe để lái xe hạng:</b> <span className="font-bold text-teal-800">{formState.hangLaiXe}</span></p>
                  </div>
                </div>

                <h3 className="font-extrabold text-[12px] uppercase mt-4 mb-1">
                  I. TIỀN SỬ BỆNH LÝ
                </h3>
                <div className="text-[10.5px] leading-relaxed font-serif space-y-1">
                  <p>• <b>Tiền sử gia đình:</b> {formState.tienSuGiaDinh || 'Không phát hiện bất thường'}</p>
                  <p>• <b>Tiền sử bản thân:</b> {formState.benhSuBanThan || 'Không phát hiện bất thường'}</p>
                  <p>• <b>Thuốc đang sử dụng:</b> {formState.dangDieuTri || 'Không'}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-end border-t border-black/10 pt-4 text-[11px] font-serif">
                <p className="italic text-slate-400 text-[10px]">Trang 1/2 Giấy KSK LX</p>
                <div className="text-center font-bold">
                  <p className="font-normal italic text-[10.5px]">Người đề nghị khám cam đoan ký tên</p>
                  <p className="mt-8 uppercase text-slate-800">{formState.hoTen}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
