'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BenhAnRow, BenhAnMapKeys, BenhAnFormType } from '../types';
import { extractBirthDate, formatNgayGioVaoVien, fitCoverText } from '../utils';

interface BiaPreviewProps {
  rows: BenhAnRow[];
  mapKeys: BenhAnMapKeys;
  logoUrl: string;
  formType: BenhAnFormType;
}

export default function BiaPreview({ rows, mapKeys, logoUrl, formType }: BiaPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const getTitle = () => {
    switch (formType) {
      case 'BIA_RHM': return 'BỆNH ÁN RĂNG HÀM MẶT';
      case 'BIA_YHCT': return 'BỆNH ÁN Y HỌC CỔ TRUYỀN';
      case 'BIA_NGOAI_TRU':
      default:
        return 'BỆNH ÁN NGOẠI TRÚ';
    }
  };

  useEffect(() => {
    // Fit text cho tất cả các cover (cả trong DOM hiện tại)
    const covers = document.querySelectorAll('.bia-cover');
    covers.forEach(c => fitCoverText(c as HTMLElement));
  }, [rows, currentPage, formType]);

  const mapRowData = (row: BenhAnRow) => {
    return {
      tenBenhAn: getTitle(),
      dongPK1: 'PHÒNG KHÁM ĐA KHOA NHƠN TÂM',
      dongPK2: 'Địa chỉ: 469 Nguyễn Văn Tạo, xã Hiệp Phước, TP. HCM',
      dongPK3: 'ĐT: 028 3780 1479 – Hotline: 0987 519 115',
      soLuuTru: mapKeys.soLuuTru ? row[mapKeys.soLuuTru] : '',
      maVaoVien: mapKeys.maVaoVien ? row[mapKeys.maVaoVien] : '',
      maBenhNhan: mapKeys.maBenhNhan ? row[mapKeys.maBenhNhan] : '',
      hoTen: mapKeys.hoTen ? String(row[mapKeys.hoTen] || '').toUpperCase() : '',
      gioiTinh: mapKeys.gioiTinh ? row[mapKeys.gioiTinh] : '',
      namSinh: mapKeys.namSinh ? extractBirthDate(row[mapKeys.namSinh]) : '',
      diaChi: mapKeys.diaChi ? row[mapKeys.diaChi] : '',
      maBHYT: mapKeys.maBHYT ? row[mapKeys.maBHYT] : '',
      ngayVaoVien: mapKeys.ngayVaoVien ? formatNgayGioVaoVien(row[mapKeys.ngayVaoVien]) : '',
      dienThoai: mapKeys.dienThoai ? row[mapKeys.dienThoai] : '',
      cccd: mapKeys.cccd ? row[mapKeys.cccd] : ''
    };
  };

  if (!rows || rows.length === 0) return null;

  const validRows = rows.filter(r => r && typeof r === 'object');
  if (validRows.length === 0) return null;

  const row = mapRowData(validRows[currentPage] || validRows[0]);

  return (
    <>
      <style>{`
        .sheet-a3 {
          width: 420mm;
          height: 297mm;
          background: white;
          position: relative;
          margin: auto;
          box-shadow: 0 0 8px #0008;
          overflow: hidden;
        }
        .bia-cover {
          position: absolute;
          left: 220mm;
          top: 20mm;
          width: 190mm;
          height: 267mm;
          border: 1.4mm solid #111;
          padding: 9mm 7mm;
          text-align: center;
          font-family: 'Times New Roman', serif;
          overflow: hidden;
          --cover-scale: 1;
        }
        .coverContent {
          transform: scale(var(--cover-scale));
          transform-origin: top center;
          width: 100%;
        }
        .topSmall {
          position: absolute;
          left: 220mm;
          top: 4mm;
          min-width: 42mm;
          width: max-content;
          height: 13mm;
          z-index: 20;
          border: 0.5mm solid #111;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Times New Roman', serif;
          font-weight: bold;
          text-align: center;
          white-space: nowrap;
          overflow: visible;
          padding: 0 3mm;
        }
        .clinicLine { font-weight: bold; font-size: 20pt; line-height: 1.12; }
        .addrLine { font-size: 10pt; line-height: 1.25; }
        .logo-box { width: 42mm; height: 42mm; margin: 8mm auto 5mm; display: flex; align-items: center; justify-content: center; }
        .title-box { font-size: 32pt; font-weight: bold; margin: 5mm 0 8mm; line-height: 1.05; }
        .codeBox { width: 110mm; margin: 0 auto 14mm; text-align: left; border: 0.35mm solid #777; font-size: 12pt; line-height: 1.45; padding: 1.5mm 3mm; }
        .info-box { margin-top: 8mm; text-align: left; font-size: 13.5pt; line-height: 1.55; }
        .infoRow { display: flex; align-items: flex-start; gap: 2mm; margin-bottom: 2.3mm; }
        .info-box b { display: inline-block; flex: 0 0 44mm; width: 44mm; min-width: 44mm; vertical-align: top; }
        .cccdRow b { white-space: nowrap; flex-basis: 64mm; width: 64mm; min-width: 64mm; }
        .val-text { font-weight: bold; word-break: break-word; flex: 1; }
        
        @media print {
          @page { size: A3 landscape; margin: 0; }
          body { background: white; }
          .sheet-a3 { box-shadow: none; margin: 0; }
          .bia-cover { border: 1.4mm solid #111; }
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
        <span className="font-bold min-w-[120px] text-center">
          Bìa {currentPage + 1} / {validRows.length}
        </span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(validRows.length - 1, p + 1))}
          disabled={currentPage >= validRows.length - 1}
          className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-full font-medium disabled:opacity-50"
        >
          Tới ▶
        </button>
      </div>

      <div ref={containerRef} className="overflow-auto bg-slate-300 p-8 rounded-xl print:p-0 print:bg-white print:overflow-visible flex flex-col gap-[20px] items-center">
        {validRows.map((r, idx) => {
          const m = mapRowData(r);
          return (
            <div key={idx} className={`sheet-a3 ${idx !== currentPage ? 'print:block hidden' : 'block'}`}>
              <div className="topSmall">
                <span className="text-[25pt] whitespace-nowrap">{m.soLuuTru}</span>
              </div>
              <div className="bia-cover">
                <div className="coverContent flex flex-col">
                  <div className="clinicLine">{m.dongPK1}</div>
                  <div className="addrLine">{m.dongPK2}</div>
                  <div className="addrLine">{m.dongPK3}</div>
                  <div className="logo-box">
                    {logoUrl && <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />}
                  </div>
                  <div className="title-box">{m.tenBenhAn}</div>
                  <div className="codeBox">
                    <b>Mã số vào viện:</b> <span className="val-text">{m.maVaoVien}</span><br/>
                    <b>Mã bệnh nhân:</b> <span className="val-text">{m.maBenhNhan}</span>
                  </div>
                  <div className="info-box">
                    <div className="infoRow"><b>Họ và tên bệnh nhân:</b> <span className="val-text">{m.hoTen}</span></div>
                    <div className="infoRow"><b>Giới tính:</b> <span className="val-text">{m.gioiTinh}</span></div>
                    <div className="infoRow"><b>Năm sinh:</b> <span className="val-text">{m.namSinh}</span></div>
                    <div className="infoRow cccdRow"><b>Mã định danh cá nhân/CCCD:</b> <span className="val-text">{m.cccd}</span></div>
                    <div className="infoRow"><b>Địa chỉ:</b> <span className="val-text">{m.diaChi}</span></div>
                    <div className="infoRow"><b>Mã BHYT:</b> <span className="val-text">{m.maBHYT}</span></div>
                    <div className="infoRow"><b>Ngày giờ vào viện:</b> <span className="val-text">{m.ngayVaoVien}</span></div>
                    <div className="infoRow"><b>Số điện thoại:</b> <span className="val-text">{m.dienThoai}</span></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
