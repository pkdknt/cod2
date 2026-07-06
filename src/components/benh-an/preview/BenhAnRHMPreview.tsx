'use client';

import React, { useState } from 'react';
import { BenhAnRow, BenhAnMapKeys } from '../types';
import { extractBirthDate, formatNgayGioVaoVien } from '../utils';

interface BenhAnRHMPreviewProps {
  rows: BenhAnRow[];
  mapKeys: BenhAnMapKeys;
  logoUrl: string;
}

export default function BenhAnRHMPreview({ rows, mapKeys, logoUrl }: BenhAnRHMPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);

  if (!rows || rows.length === 0) return null;

  const validRows = rows.filter(r => r && typeof r === 'object');
  if (validRows.length === 0) return null;

  const r = validRows[currentPage] || validRows[0];

  const m = {
    soLuuTru: mapKeys.soLuuTru ? r[mapKeys.soLuuTru] : '',
    maVaoVien: mapKeys.maVaoVien ? r[mapKeys.maVaoVien] : '',
    maBenhNhan: mapKeys.maBenhNhan ? r[mapKeys.maBenhNhan] : '',
    hoTen: mapKeys.hoTen ? String(r[mapKeys.hoTen] || '').toUpperCase() : '',
    gioiTinh: mapKeys.gioiTinh ? r[mapKeys.gioiTinh] : '',
    namSinh: mapKeys.namSinh ? extractBirthDate(r[mapKeys.namSinh]) : '',
    diaChi: mapKeys.diaChi ? r[mapKeys.diaChi] : '',
    maBHYT: mapKeys.maBHYT ? r[mapKeys.maBHYT] : '',
    ngayVaoVien: mapKeys.ngayVaoVien ? formatNgayGioVaoVien(r[mapKeys.ngayVaoVien]) : '',
    dienThoai: mapKeys.dienThoai ? r[mapKeys.dienThoai] : '',
    cccd: mapKeys.cccd ? r[mapKeys.cccd] : '',
    // Thêm các trường RHM đặc thù
    quaTrinhBenhLy: r['quaTrinhBenhLy'] || r['Quá trình bệnh lý'] || '',
    chanDoan: r['chanDoan'] || r['Chẩn đoán'] || '',
    xuTri: r['xuTri'] || r['Xử trí'] || '',
  };

  const line = (txt: string, w: string = '100%') => (
    <span className="inline-block border-b border-dotted border-slate-600 leading-tight min-h-[1.2rem]" style={{ width: w }}>
      {txt || <span className="opacity-0">.</span>}
    </span>
  );

  return (
    <>
      <style>{`
        .sheet-a3 {
          width: 420mm;
          height: 297mm;
          background: white;
          position: relative;
          margin: 0 auto 20px;
          box-shadow: 0 0 8px #0008;
          overflow: hidden;
          font-family: 'Times New Roman', serif;
        }
        .a3grid {
          display: flex;
          width: 100%;
          height: 100%;
        }
        .half {
          width: 210mm;
          height: 297mm;
          padding: 15mm;
          position: relative;
        }
        .half:first-child { border-right: 1px dashed #ccc; }
        
        .titleBox { text-align: center; margin-bottom: 15px; }
        .mainTitle { font-size: 24pt; font-weight: bold; margin: 10px 0; }
        .row-text { font-size: 13pt; line-height: 1.6; margin-bottom: 5px; }
        
        .dailyTable { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .dailyTable th, .dailyTable td { border: 1px solid #000; padding: 4px; font-size: 12pt; }
        .dailyTable th { text-align: center; }
        .dailyTable td { height: 28px; }
        
        .recordTable { width: 100%; border-collapse: collapse; margin-top: 15px; border: 2px solid #000; }
        .recordTable td { border: 1px solid #000; padding: 5px; vertical-align: top; }
        
        @media print {
          @page { size: A3 landscape; margin: 0; }
          body { background: white; }
          .sheet-a3 { box-shadow: none; margin: 0; page-break-after: always; }
          .half:first-child { border-right: none; }
          .previewNav { display: none !important; }
        }
      `}</style>

      {/* Điều hướng Preview */}
      <div className="previewNav flex items-center justify-center gap-4 bg-slate-800 text-white py-2 px-6 rounded-full w-max mx-auto mb-6 print:hidden shadow-lg sticky top-4 z-50">
        <button 
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={currentPage <= 0}
          className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-full font-medium disabled:opacity-50"
        >
          ◀ Lùi
        </button>
        <span className="font-bold min-w-[150px] text-center">
          Hồ sơ {currentPage + 1} / {validRows.length}
        </span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(validRows.length - 1, p + 1))}
          disabled={currentPage >= validRows.length - 1}
          className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-full font-medium disabled:opacity-50"
        >
          Tới ▶
        </button>
      </div>

      <div className="overflow-auto bg-slate-300 p-8 rounded-xl print:p-0 print:bg-white print:overflow-visible flex flex-col items-center">
        
        {/* MẶT TRƯỚC (Sheet Front) */}
        <div className="sheet-a3">
          <div className="a3grid">
            {/* Nửa Trái - Kế hoạch điều trị */}
            <div className="half">
              <div className="text-center font-bold text-[16pt] mb-2">KẾ HOẠCH ĐIỀU TRỊ</div>
              <table className="dailyTable">
                <thead>
                  <tr>
                    <th style={{ width: '11%' }}>NGÀY<br/>GIỜ</th>
                    <th style={{ width: '31%' }}>DIỄN BIẾN</th>
                    <th style={{ width: '31%' }}>XỬ TRÍ</th>
                    <th style={{ width: '13%' }}>KÝ TÊN</th>
                    <th style={{ width: '14%' }}>GHI CHÚ</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 30 }).map((_, i) => (
                    <tr key={i}>
                      <td></td>
                      <td>{i === 0 && <span className="text-[10pt]">Mạch:... HA:... Nhịp thở:... Nhiệt độ:...</span>}</td>
                      <td>{i === 0 ? m.xuTri : ''}</td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Nửa Phải - Hành chính */}
            <div className="half">
              <div className="flex justify-between items-start text-[12pt]">
                <div>
                  SỞ Y TẾ TP. HỒ CHÍ MINH<br/>
                  <b>PHÒNG KHÁM ĐA KHOA NHƠN TÂM</b><br/>
                  Khoa: Răng Hàm Mặt
                </div>
                <div className="text-right border border-slate-700 p-2 text-[11pt]">
                  Số lưu trữ: {m.soLuuTru || '................'}<br/>
                  Mã y tế: {m.maVaoVien || '................'}
                </div>
              </div>
              <div className="titleBox">
                <div className="mainTitle">BỆNH ÁN RĂNG HÀM MẶT</div>
              </div>
              
              <div className="font-bold text-[14pt] mt-4 mb-2">I. HÀNH CHÍNH:</div>
              <div className="row-text">1. Họ và tên: <b>{m.hoTen}</b></div>
              <div className="flex gap-4 row-text">
                <div className="flex-1">2. Sinh ngày: {line(m.namSinh, '80px')}</div>
                <div className="flex-1">3. Giới tính: {line(m.gioiTinh, '80px')}</div>
              </div>
              <div className="flex gap-4 row-text">
                <div className="flex-1">4. Nghề nghiệp: {line('', '150px')}</div>
                <div className="flex-1">5. Dân tộc: <b>Kinh</b></div>
              </div>
              <div className="row-text">6. Địa chỉ: <b>{m.diaChi}</b></div>
              <div className="flex gap-4 row-text">
                <div className="flex-[2]">7. CCCD/Mã định danh: <b>{m.cccd}</b></div>
                <div className="flex-1">8. Điện thoại: <b>{m.dienThoai}</b></div>
              </div>
              <div className="row-text">9. Thẻ BHYT: <b>{m.maBHYT}</b></div>
              <div className="row-text">10. Ngày giờ vào viện: <b>{m.ngayVaoVien}</b></div>
              
              <div className="font-bold text-[14pt] mt-4 mb-2">II. LÝ DO VÀO VIỆN:</div>
              <div className="row-text pl-4">{m.quaTrinhBenhLy}</div>
              
              <div className="font-bold text-[14pt] mt-4 mb-2">III. HỎI BỆNH:</div>
              <div className="row-text font-bold">1. Quá trình bệnh lý:</div>
              <div className="row-text pl-4 min-h-[60px]">{m.quaTrinhBenhLy}</div>
              
              <div className="font-bold text-[14pt] mt-4 mb-2">IV. KHÁM BỆNH:</div>
              <div className="row-text font-bold">1. Bệnh chuyên khoa:</div>
              <div className="row-text pl-4 min-h-[60px]">{m.chanDoan}</div>
            </div>
          </div>
        </div>
        
        {/* MẶT SAU (Sheet Back) */}
        <div className="sheet-a3">
          <div className="a3grid">
            {/* Nửa Trái - Tóm tắt bệnh án */}
            <div className="half">
              <div className="font-bold text-[14pt] mt-4 mb-2">3. Hình vẽ mô tả tổn thương</div>
              <div className="border border-slate-400 h-[150px] w-full flex items-center justify-center text-slate-400 bg-slate-50 italic mb-4">
                (Sơ đồ răng - RHM)
              </div>
              
              <div className="font-bold text-[14pt] mt-4 mb-2">4. Tóm tắt bệnh án:</div>
              <div className="row-text pl-4 min-h-[80px]">{m.quaTrinhBenhLy}</div>
              
              <div className="font-bold text-[14pt] mt-4 mb-2">5. Chẩn đoán của khoa khám bệnh:</div>
              <div className="row-text pl-4 min-h-[60px] font-bold">{m.chanDoan}</div>
              
              <div className="font-bold text-[14pt] mt-4 mb-2">6. Xử trí:</div>
              <div className="row-text pl-4 min-h-[80px]">{m.xuTri}</div>
            </div>
            
            {/* Nửa Phải - Tổng kết bệnh án */}
            <div className="half flex flex-col">
              <div className="font-bold text-[16pt] mb-2 text-center">TỔNG KẾT BỆNH ÁN</div>
              
              <div className="row-text font-bold mt-2">1. Quá trình bệnh lý và diễn biến lâm sàng:</div>
              <div className="row-text pl-4 min-h-[80px]">{m.quaTrinhBenhLy}</div>
              
              <div className="row-text font-bold mt-2">2. Tóm tắt kết quả xét nghiệm cận lâm sàng:</div>
              <div className="row-text pl-4 min-h-[60px]"></div>
              
              <div className="row-text font-bold mt-2">3. Chẩn đoán ra viện:</div>
              <div className="row-text pl-4">- Bệnh chính: <b>{m.chanDoan}</b></div>
              <div className="row-text pl-4">- Bệnh kèm theo: </div>
              
              <div className="row-text font-bold mt-2">4. Phương pháp điều trị:</div>
              <div className="row-text pl-4 min-h-[60px]">{m.xuTri}</div>
              
              <div className="row-text font-bold mt-2">5. Tình trạng người bệnh ra viện:</div>
              <div className="row-text pl-4 min-h-[40px]">Ổn định</div>
              
              <div className="mt-auto">
                <table className="recordTable">
                  <tbody>
                    <tr>
                      <td style={{ width: '40%' }}>
                        <div className="text-center font-bold mb-2">Hồ sơ, phim, ảnh</div>
                        <div>- X - quang:</div>
                        <div>- CT Scanner:</div>
                        <div>- Xét nghiệm:</div>
                        <div>- Toàn bộ hồ sơ:</div>
                      </td>
                      <td style={{ width: '30%' }}>
                        <b>Người giao hồ sơ</b><br/><br/><br/>
                        <b>Người nhận hồ sơ</b>
                      </td>
                      <td style={{ width: '30%' }}>
                        <div className="text-right italic text-[11pt]">Ngày...tháng...năm 20...</div>
                        <div className="text-center font-bold mt-2">Bác sỹ điều trị</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </>
  );
}
