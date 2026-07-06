'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Printer, BookOpen, Layers, Download } from 'lucide-react';
import { MedicalRecordData } from '@/services/MedicalRecordService';
import { MedicalRecordClinicSettings, MEDICAL_RECORD_CLINIC_DEFAULT } from './MedicalRecordClinicSettingsPanel';
import { LESION_PATHS } from './LesionPaths';

interface MedicalRecordPrintPreviewProps {
  formState: MedicalRecordData;
  clinicSettings?: MedicalRecordClinicSettings;
}

const LESION_ITEMS = [
  ['phai', 'Phải'],
  ['thang', 'Thẳng'],
  ['trai', 'Trái'],
  ['hamtren', 'Hàm trên và họng'],
  ['hamduoi', 'Hàm dưới'],
  ['kheho', 'Phân loại khe hở']
] as const;

export default function MedicalRecordPrintPreview({
  formState,
  clinicSettings = MEDICAL_RECORD_CLINIC_DEFAULT
}: MedicalRecordPrintPreviewProps) {
  const [viewMode, setViewMode] = useState<'cover' | 'details'>('cover');
  const coverRef = useRef<HTMLDivElement>(null);
  const [coverScale, setCoverScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportProgress('Đang tải thư viện tạo PDF...');
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      setExportProgress('Đang chuẩn bị trang in...');
      await new Promise((resolve) => setTimeout(resolve, 300));

      const previewContainer = document.getElementById('medical-print-preview');
      if (!previewContainer) {
        throw new Error('Không tìm thấy vùng xem trước bản in');
      }

      const sheets = previewContainer.querySelectorAll('.sheet');
      if (sheets.length === 0) {
        throw new Error('Không tìm thấy tài liệu để xuất PDF');
      }

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a3'
      });

      for (let i = 0; i < sheets.length; i++) {
        setExportProgress(`Đang xử lý trang ${i + 1}/${sheets.length}...`);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const canvas = await html2canvas(sheets[i] as HTMLElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          scrollX: 0,
          scrollY: 0
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) {
          pdf.addPage('a3', 'landscape');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 420, 297);
      }

      setExportProgress('Đang tải xuống tệp PDF...');
      const cleanName = (formState.hoTen || 'Benh_An').trim().replace(/[\/:*?"<>|]+/g, '_');
      const recordTypeSuffix = formState.recordType === 'ngoai-tru' ? 'Bia_Ngoai_Tru' :
                            formState.recordType === 'rhm' ? 'Benh_An_RHM' :
                            formState.recordType === 'bia-rhm' ? 'Bia_RHM' : 'Bia_YHCT';
      pdf.save(`${recordTypeSuffix}_${cleanName}.pdf`);
    } catch (err: any) {
      alert('Lỗi xuất PDF: ' + err.message);
      console.error(err);
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  // Auto scale logic for cover page to prevent overflow
  useEffect(() => {
    if (viewMode === 'cover' && coverRef.current) {
      const cover = coverRef.current;
      const content = cover.querySelector('.coverContent') as HTMLDivElement;
      if (content) {
        cover.style.setProperty('--cover-scale', '1');
        content.style.width = '100%';
        const maxH = cover.clientHeight;
        const maxW = cover.clientWidth;
        const h = content.scrollHeight;
        const w = content.scrollWidth;
        let scale = Math.min(1, maxH / (h || maxH), maxW / (w || maxW));
        if (scale < 1) {
          scale = scale - 0.01;
        }
        setCoverScale(scale);
      }
    }
  }, [formState, viewMode]);

  const cleanGender = (v?: string) => {
    if (!v) return '';
    const norm = v.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
    if (norm.includes('nu') || norm === 'f' || norm === 'female') return 'Nữ';
    if (norm.includes('nam') || norm === 'm' || norm === 'male') return 'Nam';
    return v;
  };

  const isBHYT = formState.doiTuong === 'BHYT';
  const isThuPhi = formState.doiTuong === 'Thu phí';
  const isMien = formState.doiTuong === 'Miễn';
  const isKhac = formState.doiTuong && !['BHYT', 'Thu phí', 'Miễn'].includes(formState.doiTuong);

  // Generates 30 rows for treatment plan
  const renderDailyTableRows = () => {
    const vitalRows: Record<number, string> = {
      2: 'Mạch: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; lần/phút',
      3: 'Huyết áp: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mmHg',
      4: 'Nhiệt độ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; °C',
      5: 'Nhịp thở: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; lần/phút',
      10: 'Mạch: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; lần/phút',
      11: 'Huyết áp: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mmHg',
      12: 'Nhiệt độ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; °C',
      13: 'Nhịp thở: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; lần/phút',
      18: 'Mạch: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; lần/phút',
      19: 'Huyết áp: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mmHg',
      20: 'Nhiệt độ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; °C',
      21: 'Nhịp thở: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; lần/phút',
      26: 'Mạch: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; lần/phút',
      27: 'Huyết áp: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; mmHg',
      28: 'Nhiệt độ: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; °C',
      29: 'Nhịp thở: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; lần/phút'
    };

    return Array.from({ length: 30 }).map((_, r) => {
      const vitalText = vitalRows[r] || '';
      const cls = vitalText ? 'vitalLineRow' : 'normalScheduleRow';
      return (
        <tr key={r} className={cls}>
          <td style={{ border: '1px solid #333', padding: '3px' }}>&nbsp;</td>
          <td style={{ border: '1px solid #333', padding: '3px' }}>
            {vitalText ? (
              <span className="dailyVitalLine" dangerouslySetInnerHTML={{ __html: vitalText }} />
            ) : (
              '&nbsp;'
            )}
          </td>
          <td style={{ border: '1px solid #333', padding: '3px' }}>
            {r === 0 ? (formState.xuTri || '\u00a0') : '\u00a0'}
          </td>
          <td style={{ border: '1px solid #333', padding: '3px' }}>&nbsp;</td>
          <td style={{ border: '1px solid #333', padding: '3px' }}>
            {r === 0 ? (formState.ghiChu || '\u00a0') : '\u00a0'}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Scope specific styles to guarantee alignment on A3 prints */}
      <style dangerouslySetInnerHTML={{ __html: `
        .sheet {
          width: 420mm;
          height: 297mm;
          background: white;
          margin: 0 auto 16px;
          position: relative;
          color: #000;
          padding: 9mm;
          font-family: 'Times New Roman', Times, serif;
          font-size: 15px;
          line-height: 1.35;
          box-sizing: border-box;
          overflow: hidden;
        }
        .cover {
          position: absolute;
          left: 220mm;
          top: 20mm;
          width: 190mm;
          height: 267mm;
          border: 1.4mm solid #111;
          padding: 9mm 7mm;
          text-align: center;
          box-sizing: border-box;
          overflow: hidden;
        }
        .coverContent {
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
          font-weight: bold;
          text-align: center;
          white-space: nowrap;
          overflow: visible;
          padding: 0 3mm;
          box-sizing: border-box;
        }
        .clinicLine {
          font-weight: bold;
          font-size: 20pt;
          line-height: 1.12;
          overflow-wrap: anywhere;
          word-break: break-word;
          text-align: left;
        }
        .addrLine {
          font-size: 10pt;
          line-height: 1.25;
          overflow-wrap: anywhere;
          word-break: break-word;
          text-align: left;
        }
        .logo {
          width: 42mm;
          height: 42mm;
          margin: 8mm auto 5mm;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .title {
          font-size: 32pt;
          font-weight: bold;
          margin: 5mm 0 8mm;
          line-height: 1.05;
          text-align: center;
          letter-spacing: -0.2mm;
        }
        .codeBox {
          width: 110mm;
          margin: 0 auto 14mm;
          text-align: left;
          border: 0.35mm solid #777;
          font-size: 12pt;
          line-height: 1.45;
          padding: 1.5mm 3mm;
          box-sizing: border-box;
        }
        .info {
          margin-top: 8mm;
          text-align: left;
          font-size: 13.5pt;
          line-height: 1.55;
        }
        .infoRow {
          display: flex;
          align-items: flex-start;
          gap: 2mm;
          margin-bottom: 2.3mm;
          max-width: 100%;
        }
        .info b {
          display: inline-block;
          flex: 0 0 44mm;
          width: 44mm;
          min-width: 44mm;
          vertical-align: top;
        }
        .cccdRow b {
          white-space: nowrap;
          flex-basis: 64mm;
          width: 64mm;
          min-width: 64mm;
        }
        .value {
          font-weight: bold;
          white-space: normal;
          display: inline-block;
          flex: 1;
        }
        .codeBox .value {
          max-width: calc(100% - 45mm);
          display: inline-block;
          vertical-align: top;
        }
        .a3grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9mm;
          height: 100%;
          box-sizing: border-box;
        }
        .half {
          position: relative;
          border: 0 solid #000;
          height: 100%;
          overflow: hidden;
          box-sizing: border-box;
        }
        .clinic {
          font-size: 15px;
          text-align: left;
          line-height: 1.25;
        }
        .mainTitle {
          font-size: 22px;
          font-weight: bold;
          text-align: center;
          margin-top: 8px;
          line-height: 1.2;
        }
        .code {
          position: absolute;
          right: 0;
          top: 2mm;
          font-size: 15px;
          text-align: right;
          line-height: 1.25;
        }
        .sectionTitle {
          font-weight: bold;
          margin-top: 7px;
        }
        .line {
          border-bottom: 1px dotted #222;
          min-height: 18px;
          display: inline-block;
          vertical-align: bottom;
          padding: 0 3px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .full {
          width: 100%;
        }
        .inlineFull {
          flex: 1;
          width: auto;
          min-width: 0;
        }
        .wSmall {
          width: 80px;
        }
        .wMed {
          width: 145px;
        }
        .row {
          margin: 3px 0;
          display: flex;
          align-items: flex-end;
          gap: 4px;
          flex-wrap: wrap;
          font-size: 14px;
        }
        .paraLine {
          border-bottom: 1px dotted #333;
          min-height: 19px;
          width: 100%;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: break-word;
          padding: 1px 3px;
          box-sizing: border-box;
        }
        .vitalBox {
          float: right;
          width: 42mm;
          border: 1px solid #333;
          padding: 4px;
          margin-left: 5px;
          font-size: 12px;
          line-height: 1.3;
          box-sizing: border-box;
        }
        .dailyTitle {
          text-align: center;
          font-size: 23px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .dailyTable {
          width: 100%;
          height: 93%;
          border-collapse: collapse;
          font-size: 14px;
          margin-top: 2px;
        }
        .dailyTable th, .dailyTable td {
          border: 1px solid #333;
          padding: 3px;
          font-family: 'Times New Roman', Times, serif;
        }
        .dailyTable th {
          text-align: center;
          background: #fff;
        }
        .summaryBox {
          border: 1px solid #333;
          padding: 5px;
          height: 100%;
          box-sizing: border-box;
        }
        .signs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10mm;
          text-align: center;
          margin-top: 18px;
        }
        .signName {
          margin-top: 50px;
          text-align: left;
        }
        .recordTable {
          border: 1px solid #333;
          margin-top: 8px;
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 12px;
        }
        .recordTable td, .recordTable th {
          border: 1px solid #333;
          font-size: 12px;
          padding: 0;
          font-family: 'Times New Roman', Times, serif;
          vertical-align: middle;
        }
        .recordTable .recLeft {
          width: 42%;
        }
        .recordTable .recMid {
          width: 27%;
        }
        .recordTable .recRight {
          width: 31%;
        }
        .recordTable .recTitle {
          text-align: center;
          font-weight: bold;
          font-size: 18px;
          height: 22px;
        }
        .recordTable .recSub {
          display: grid;
          grid-template-columns: 2fr 1fr;
          text-align: center;
          font-weight: bold;
          height: 20px;
          border-top: 1px solid #333;
          border-bottom: 1px solid #333;
        }
        .recordTable .recSub div {
          border-right: 1px solid #333;
          padding: 3px;
        }
        .recordTable .recSub div:last-child {
          border-right: 0;
        }
        .recordTable .recLeftRow {
          display: grid;
          grid-template-columns: 2fr 1fr;
          min-height: 20px;
          border-bottom: 1px solid #333;
        }
        .recordTable .recLeftRow:last-child {
          border-bottom: 0;
        }
        .recordTable .recLeftRow div {
          border-right: 1px solid #333;
          padding: 2px 6px;
        }
        .recordTable .recLeftRow div:last-child {
          border-right: 0;
        }
        .recordTable .recPerson {
          padding: 3px 8px;
          height: 67px;
          box-sizing: border-box;
        }
        .recordTable .recPerson b {
          display: block;
          text-align: center;
          font-size: 18px;
          margin-bottom: 24px;
        }
        .recordTable .recDoctor {
          padding: 3px 8px;
          text-align: center;
          height: 134px;
          box-sizing: border-box;
        }
        .recordTable .recDoctor .date {
          font-style: italic;
          font-size: 17px;
          margin-bottom: 6px;
        }
        .recordTable .recDoctor b {
          display: block;
          font-size: 18px;
          margin-bottom: 85px;
        }
        .recordTable .recLine {
          text-align: left;
        }
        .lesionDiagram {
          height: 62mm;
          padding-top: 1mm;
          border-bottom: 1px dotted #333;
          font-family: 'Times New Roman', Times, serif;
          color: #000;
          overflow: hidden;
        }
        .lesionGrid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 1.5mm;
          align-items: end;
          text-align: center;
          white-space: nowrap;
        }
        .lesionItem {
          min-width: 0;
          overflow: hidden;
        }
        .lesionImageBox {
          height: 31mm;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          border: 1px dashed transparent;
          position: relative;
          overflow: hidden;
        }
        .lesionPhotoWrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          max-width: 100%;
          max-height: 31mm;
        }
        .lesionPhotoWrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .lesionLabel {
          font-size: 11px;
          margin-top: .7mm;
          white-space: nowrap;
          line-height: 1.05;
          overflow: hidden;
          text-overflow: clip;
        }
        .cleftNote {
          text-align: left;
          font-size: 11px;
          line-height: 1.15;
          margin-top: 1mm;
          margin-left: 104mm;
        }
        .doiTuongMau {
          display: inline-flex;
          align-items: flex-end;
          gap: 7mm;
          white-space: nowrap;
          font-style: italic;
        }
        .doiTuongMau .doiTuongItem {
          display: inline-flex;
          align-items: center;
          gap: 1.1mm;
          white-space: nowrap;
        }
        .doiTuongMau .checkBox {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 3.2mm;
          height: 3.2mm;
          border: 1px solid #000;
          font-style: normal;
          font-family: 'Times New Roman', Times, serif;
          font-size: 10px;
          font-weight: bold;
          line-height: 1;
          box-sizing: border-box;
        }
        .doiTuongMau .checkBox.checked {
          padding-bottom: .2mm;
        }
        .sheet-back .half:first-child .signs {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 10mm !important;
          margin-top: 18px !important;
          text-align: center !important;
          align-items: start !important;
        }
        .sheet-back .half:first-child .signs > div {
          position: relative !important;
          min-height: 39mm !important;
          text-align: center !important;
        }
        .sheet-back .half:first-child .signs > div:first-child > b {
          display: block !important;
          padding-top: 5.2mm !important;
        }
        .sheet-back .half:first-child .signs > div:nth-child(2) > i {
          display: block !important;
          line-height: 5.2mm !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .sheet-back .half:first-child .signs > div:nth-child(2) > b {
          display: block !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .sheet-back .half:first-child .signName {
          position: absolute !important;
          left: 8mm !important;
          bottom: 0 !important;
          margin-top: 0 !important;
          text-align: left !important;
          white-space: nowrap !important;
          min-width: 70mm !important;
          width: 70mm !important;
          max-width: 78mm !important;
          overflow: visible !important;
        }
        .sheet-back .half:first-child .outpatientBlock {
          position: absolute !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 11mm !important;
        }
        .sheet-back .half:first-child .outpatientBlock .sectionTitle {
          margin-top: 0 !important;
        }
        .recordTable .recMid {
          position: relative !important;
          vertical-align: top !important;
          height: 134px !important;
          padding: 0 !important;
        }
        .recordTable .recMid::before {
          content: '' !important;
          position: absolute !important;
          left: 0 !important;
          right: 0 !important;
          top: 50% !important;
          border-top: 1px solid #333 !important;
          z-index: 2 !important;
          pointer-events: none !important;
        }
        .recordTable .recMid .recPerson {
          position: absolute !important;
          left: 0 !important;
          right: 0 !important;
          height: 50% !important;
          min-height: 0 !important;
          padding: 1mm .7mm .8mm 8px !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          border-bottom: 0 !important;
          overflow: hidden !important;
        }
        .recordTable .recMid .recPerson:first-child {
          top: 0 !important;
          bottom: auto !important;
          border-bottom: 0 !important;
          border-bottom: 1px solid #333 !important;
        }
        .recordTable .recMid .recPerson:nth-child(2) {
          top: 50% !important;
          bottom: auto !important;
        }
        .recordTable .recMid .recPerson b {
          display: block !important;
          width: 100% !important;
          text-align: center !important;
          font-size: 18px !important;
          line-height: 1.12 !important;
          margin: 0 !important;
          padding: 0 !important;
          white-space: nowrap !important;
        }
        .recordTable .recMid .recPerson:first-child .recLine,
        .recordTable .recMid .recPerson:nth-child(2) .recLine {
          position: absolute !important;
          left: 8px !important;
          right: .35mm !important;
          bottom: .8mm !important;
          width: auto !important;
          margin: 0 !important;
        }
        .recordTable .recMid .recLine::after {
          min-width: 0 !important;
          transform: translateY(-.25mm) !important;
        }
        .recordTable .recDoctor .recLine {
          position: absolute !important;
          left: 8px !important;
          right: .35mm !important;
          bottom: 1.5mm !important;
          width: auto !important;
          margin: 0 !important;
        }
        .recordTable .recLine::before {
          content: 'Họ tên' !important;
          font-size: 12px !important;
          font-family: 'Times New Roman', Times, serif !important;
          white-space: nowrap !important;
        }
        .recordTable .recLine::after {
          content: '' !important;
          flex: 1 1 auto !important;
          border-bottom: 1px dotted #222 !important;
          height: 0 !important;
          min-width: 8mm !important;
          transform: translateY(-.4mm) !important;
        }
      ` }} />

      {/* Controller bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between flex-wrap gap-3 noPrint">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('cover')}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'cover'
                ? 'bg-teal-700 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="h-4 w-4" /> Bìa bệnh án A3
          </button>
          {formState.recordType === 'rhm' && (
            <button
              onClick={() => setViewMode('details')}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'details'
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Layers className="h-4 w-4" /> Ruột & Tờ điều trị RHM
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-teal-650 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Xuất PDF
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-650 transition-colors"
          >
            <Printer className="h-4 w-4" /> In A3 ngang
          </button>
        </div>
      </div>

      {isExporting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in noPrint">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 mx-4">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-teal-600 border-t-transparent animate-spin"></div>
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Đang xuất PDF</h3>
            <p className="text-xs text-slate-500 font-semibold">{exportProgress}</p>
          </div>
        </div>
      )}

      {/* Preview Section */}
      <div id="medical-print-preview" className="overflow-x-auto bg-slate-600 p-8 rounded-3xl print:p-0 print:bg-transparent">
        
        {viewMode === 'cover' ? (
          /* SHEET 1: OUTPATIENT/RHM/YHCT COVER PAGE */
          <div className="sheet" style={{ position: 'relative' }}>
            {/* topSmall box */}
            <div className="topSmall">
              <span className="soLuuTruText" style={{ fontSize: '25pt' }}>{formState.soLuuTru || ''}</span>
            </div>

            {/* cover block */}
            <div ref={coverRef} className="cover">
              <div 
                className="coverContent"
                style={{
                  transform: `scale(${coverScale})`,
                  transformOrigin: 'top center'
                }}
              >
                {/* Clinic name and slogan */}
                <div className="clinic">
                  <div className="clinicLine">{clinicSettings.soYTe}</div>
                  <div className="addrLine">{clinicSettings.tenPhongKham}</div>
                  <div className="addrLine">{clinicSettings.khoa}</div>
                </div>

                {/* Logo Emblem */}
                <div className="logo">
                  <img 
                    src="/logo-nhontam.png" 
                    alt="Logo Nhơn Tâm" 
                  />
                </div>

                {/* Document Title */}
                <h2 className="title">
                  {formState.recordType === 'ngoai-tru' && 'BỆNH ÁN NGOẠI TRÚ'}
                  {(formState.recordType === 'rhm' || formState.recordType === 'bia-rhm') && 'BỆNH ÁN RĂNG HÀM MẶT'}
                  {formState.recordType === 'yhct' && 'BỆNH ÁN Y HỌC CỔ TRUYỀN'}
                </h2>

                {/* Admission Codes Box */}
                <div className="codeBox">
                  <b>Mã số vào viện:</b> <span className="value">{formState.soNgoaiTru || ''}</span><br />
                  <b>Mã bệnh nhân:</b> <span className="value">{formState.maBenhNhan || ''}</span>
                </div>

                {/* Administrative Patient Details */}
                <div className="info">
                  <div className="infoRow">
                    <b>Họ và tên bệnh nhân:</b> 
                    <span className="value uppercase">{formState.hoTen}</span>
                  </div>
                  <div className="infoRow">
                    <b>Giới tính:</b> 
                    <span className="value">{cleanGender(formState.gioiTinh)}</span>
                  </div>
                  <div className="infoRow">
                    <b>Năm sinh:</b> 
                    <span className="value">{formState.namSinh || ''}</span>
                  </div>
                  <div className="infoRow cccdRow">
                    <b>Mã định danh cá nhân/CCCD:</b> 
                    <span className="value">{formState.cccd || ''}</span>
                  </div>
                  <div className="infoRow">
                    <b>Địa chỉ:</b> 
                    <span className="value">{formState.diaChi || ''}</span>
                  </div>
                  <div className="infoRow">
                    <b>Mã BHYT:</b> 
                    <span className="value">{formState.soTheBHYT || ''}</span>
                  </div>
                  <div className="infoRow">
                    <b>Ngày giờ vào viện:</b> 
                    <span className="value">{formState.denKhamLuc || ''}</span>
                  </div>
                  <div className="infoRow">
                    <b>Số điện thoại:</b> 
                    <span className="value">{formState.dienThoai || ''}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SHEET 2: RHM SPECIALIST MULTI-SHEET DETAILS VIEW (RUỘT BỆNH ÁN) */
          <div className="space-y-6 print:space-y-0">
            
            {/* SHEET 1: FRONT SIDE (MAT TRUOC) */}
            <div className="sheet">
              <div className="a3grid">
                
                {/* Left Column: Treatment Plan (Kế hoạch điều trị) */}
                <div className="half">
                  <div className="dailyTitle">KẾ HOẠCH ĐIỀU TRỊ</div>
                  <table className="dailyTable">
                    <thead>
                      <tr>
                        <th style={{ width: '11%', border: '1px solid #333', padding: '3px' }}>NGÀY<br />GIỜ</th>
                        <th style={{ width: '31%', border: '1px solid #333', padding: '3px' }}>DIỄN BIẾN</th>
                        <th style={{ width: '31%', border: '1px solid #333', padding: '3px' }}>XỬ TRÍ</th>
                        <th style={{ width: '13%', border: '1px solid #333', padding: '3px' }}>KÝ TÊN</th>
                        <th style={{ width: '14%', border: '1px solid #333', padding: '3px' }}>GHI CHÚ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderDailyTableRows()}
                    </tbody>
                  </table>
                </div>

                {/* Right Column: Administrative details & Exam block */}
                <div className="half frontAdmin">
                  <div className="clinic">
                    {clinicSettings.soYTe}<br />
                    <b>{clinicSettings.tenPhongKham}</b><br />
                    {clinicSettings.khoa}
                  </div>
                  <div className="code">
                    MS16/BV-01<br />
                    Số ngoại trú: <span className="line wMed">{formState.soNgoaiTru || '\u00a0'}</span><br />
                    Số lưu trữ: <span className="line wMed">{formState.soLuuTru || '\u00a0'}</span>
                  </div>
                  <div className="mainTitle">
                    BỆNH ÁN NGOẠI TRÚ<br />
                    CHUYÊN KHOA RĂNG HÀM MẶT
                  </div>
                  <div style={{ height: '15mm' }} />
                  
                  <div className="sectionTitle">I. HÀNH CHÍNH:</div>
                  <div className="row">
                    1. Họ và tên <i>(In hoa)</i>: <span className="line inlineFull font-bold">{formState.hoTen}</span>
                  </div>
                  <div className="row">
                    2. Năm sinh: <span className="line wSmall">{formState.namSinh || '\u00a0'}</span> 
                    Tuổi: <span className="line wSmall">{formState.tuoi || '\u00a0'}</span>
                  </div>
                  <div className="row">
                    3. Giới tính: <span className="line wSmall">{cleanGender(formState.gioiTinh)}</span>
                  </div>
                  <div className="row">
                    4. Nghề nghiệp: <span className="line wMed">{formState.ngheNghiep || '\u00a0'}</span>
                  </div>
                  <div className="row">
                    5. Dân tộc: <span className="font-bold">{formState.danToc || 'Kinh'}</span> &nbsp;&nbsp;&nbsp; 
                    6. Ngoại kiều: <span className="line wMed">{formState.ngoaiKieu || '\u00a0'}</span>
                  </div>
                  <div className="row">
                    7. Địa chỉ: <span className="line inlineFull">{formState.diaChi || '\u00a0'}</span>
                  </div>
                  <div className="row">
                    8. Nơi làm việc: <span className="line wMed">{formState.noiLamViec || '\u00a0'}</span> &nbsp;
                    9. Đối tượng: &nbsp;
                    <span className="doiTuongMau">
                      <span className="doiTuongItem">BHYT <span className={`checkBox ${isBHYT ? 'checked' : ''}`}>{isBHYT ? 'X' : ''}</span></span>
                      <span className="doiTuongItem">2.Thu phí <span className={`checkBox ${isThuPhi ? 'checked' : ''}`}>{isThuPhi ? 'X' : ''}</span></span>
                      <span className="doiTuongItem">3.Miễn <span className={`checkBox ${isMien ? 'checked' : ''}`}>{isMien ? 'X' : ''}</span></span>
                      <span className="doiTuongItem">4.Khác <span className={`checkBox ${isKhac ? 'checked' : ''}`}>{isKhac ? 'X' : ''}</span></span>
                    </span>
                  </div>
                  <div className="row">
                    10. BHYT giá trị đến: <span className="line wMed">{formState.bhytDen || '\u00a0'}</span> 
                    Số thẻ BHYT: <span className="line wMed font-bold">{formState.soTheBHYT || '\u00a0'}</span>
                  </div>
                  <div className="row">
                    11. Họ tên, địa chỉ người nhà khi cần báo tin: <span className="line inlineFull">{formState.nguoiNha || '\u00a0'}</span>
                  </div>
                  <div className="row">
                    <span className="line inlineFull">\u00a0</span> 
                    Điện thoại số: <span className="line wMed">{formState.dienThoai || '\u00a0'}</span>
                  </div>
                  <div className="row">
                    12. Đến khám bệnh ngày: <span className="line inlineFull">{formState.denKhamLuc || '\u00a0'}</span> 
                    &nbsp;&nbsp; 1.Y tế &nbsp;&nbsp; 2.Tự đến ☒
                  </div>
                  <div className="row">
                    13. Chẩn đoán và xử lý của nơi giới thiệu: <span className="line inlineFull">{formState.chanDoanNoiGioiThieu || '\u00a0'}</span>
                  </div>

                  <div className="sectionTitle">II. LÝ DO VÀO VIỆN: <span className="line inlineFull">{formState.lyDo || '\u00a0'}</span></div>
                  
                  <div className="sectionTitle">III. HỎI BỆNH:</div>
                  <b>1. Quá trình bệnh lý:</b>
                  <div className="paraLine">{formState.quaTrinhBenhLy || '\u00a0'}</div>
                  <div className="paraLine">&nbsp;</div>
                  <div className="paraLine">&nbsp;</div>
                  
                  <b>2. Tiền sử bệnh:</b>
                  <div className="paraLine">+ Bản thân: {formState.tienSuBanThan || '\u00a0'}</div>
                  <div className="paraLine">+ Gia đình: {formState.giaDinh || '\u00a0'}</div>
                  
                  <div className="sectionTitle">IV. KHÁM BỆNH:</div>
                  <div className="vitalBox">
                    Mạch {formState.mach || '........'} lần/ph<br />
                    Nhiệt độ {formState.nhietDo || '......'} °C<br />
                    Huyết áp {formState.huyetAp || '..../....'} mmHg<br />
                    Nhịp thở {formState.nhipTho || '......'} lần/ph<br />
                    Cân nặng {formState.canNang || '......'} kg
                  </div>
                  <b>1. Toàn thân:</b>
                  <div className="paraLine">{formState.toanThan || '\u00a0'}</div>
                  <div className="paraLine">&nbsp;</div>
                  <div className="paraLine">&nbsp;</div>
                  
                  <b>2. Bệnh chuyên khoa:</b>
                  <div style={{ display: 'block', width: '100%', clear: 'both' }}>
                    <div className="paraLine">{formState.chanDoan || '\u00a0'}</div>
                    {Array.from({ length: 11 }).map((_, idx) => (
                      <div key={idx} className="paraLine">&nbsp;</div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* SHEET 2: BACK SIDE (MẶT SAU) */}
            <div className="sheet sheet-back">
              <div className="a3grid">
                
                {/* Left Column: Lesion drawings & Summary block */}
                <div className="half">
                  <b>3. Hình vẽ mô tả tổn thương khi vào viện</b>
                  <div className="lesionDiagram">
                    <div className="lesionGrid">
                      {LESION_ITEMS.map(([key, label]) => {
                        const imgSrc = LESION_PATHS[key];
                        return (
                          <div key={key} className="lesionItem">
                            <div className="lesionImageBox">
                              <span className="lesionPhotoWrap" style={{ width: '27mm', height: '29mm' }}>
                                <img src={imgSrc} alt={label} />
                              </span>
                            </div>
                            <div className="lesionLabel">{label}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="cleftNote">
                      1 và 4 là Khe hở môi.<br />
                      2 và 5 là Khe hở xương ổ răng<br />
                      3 và 6 là Khe hở cung hàm<br />
                      7 và 8 là Khe hở vòm miệng<br />
                      9 là khe hở vòm miệng mềm
                    </div>
                  </div>

                  <div className="sectionTitle">4. Tóm tắt bệnh án:</div>
                  <div className="paraLine">{formState.quaTrinhBenhLy || '\u00a0'}</div>
                  {Array.from({ length: 6 }).map((_, r) => (
                    <div key={r} className="paraLine">&nbsp;</div>
                  ))}

                  <div className="sectionTitle">5. Chẩn đoán của khoa khám bệnh:</div>
                  <div className="paraLine">{formState.chanDoan || '\u00a0'}</div>
                  {Array.from({ length: 3 }).map((_, r) => (
                    <div key={r} className="paraLine">&nbsp;</div>
                  ))}

                  <div className="sectionTitle">6. Đã xử lý của tuyến dưới:</div>
                  <div className="paraLine">{formState.xuTri || '\u00a0'}</div>
                  {Array.from({ length: 10 }).map((_, r) => (
                    <div key={r} className="paraLine">&nbsp;</div>
                  ))}

                  <div className="outpatientBlock">
                    <div className="sectionTitle">
                      7. Điều trị ngoại trú từ ngày ....../....../........ đến ngày ....../....../........
                    </div>
                    <div className="signs">
                      <div>
                        <b>{clinicSettings.giamDoc}</b>
                        <div className="signName">
                          Họ và tên................................................................
                        </div>
                      </div>
                      <div>
                        <i>Ngày.......tháng.......năm {formState.namKy || '2026'}</i><br />
                        <b>{clinicSettings.bacSy}</b>
                        <div className="signName">
                          Họ và tên................................................................
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Tổng kết bệnh án (summaryBox) */}
                <div className="half summaryBox">
                  <div className="topTitle" style={{ fontSize: '18px', marginBottom: '8px' }}>TỔNG KẾT BỆNH ÁN:</div>
                  
                  <b>1. Quá trình bệnh lý và diễn biến lâm sàng:</b>
                  <div className="paraLine">{formState.quaTrinhBenhLy || '\u00a0'}</div>
                  {Array.from({ length: 7 }).map((_, r) => (
                    <div key={r} className="paraLine">&nbsp;</div>
                  ))}

                  <b>2. Tóm tắt kết quả xét nghiệm cận lâm sàng có giá trị chẩn đoán:</b>
                  {Array.from({ length: 4 }).map((_, r) => (
                    <div key={r} className="paraLine">&nbsp;</div>
                  ))}

                  <b>3. Chẩn đoán ra viện:</b>
                  <div className="paraLine">- Bệnh chính: {formState.chanDoan || '\u00a0'}</div>
                  <div className="paraLine">- Bệnh kèm theo (nếu có):</div>

                  <b>4. Phương pháp điều trị:</b>
                  <div className="paraLine">{formState.xuTri || '\u00a0'}</div>
                  {Array.from({ length: 3 }).map((_, r) => (
                    <div key={r} className="paraLine">&nbsp;</div>
                  ))}

                  <b>5. Tình trạng người bệnh ra viện:</b>
                  {Array.from({ length: 3 }).map((_, r) => (
                    <div key={r} className="paraLine">&nbsp;</div>
                  ))}

                  <b>6. Hướng điều trị và các chế độ tiếp theo:</b>
                  {Array.from({ length: 18 }).map((_, r) => (
                    <div key={r} className="paraLine">&nbsp;</div>
                  ))}

                  <table className="recordTable">
                    <tbody>
                      <tr>
                        <td className="recLeft" style={{ border: '1px solid #333' }}>
                          <div className="recTitle">Hồ sơ, phim, ảnh</div>
                          <div className="recSub">
                            <div>Loại</div>
                            <div>Số tờ</div>
                          </div>
                          {['- X - quang', '- CT Scanner', '- Siêu âm', '- Xét nghiệm', '- Khác................', '- Toàn bộ hồ sơ'].map((x, idx) => (
                            <div key={idx} className="recLeftRow">
                              <div>{x}</div>
                              <div>&nbsp;</div>
                            </div>
                          ))}
                        </td>
                        <td className="recMid" style={{ border: '1px solid #333' }}>
                          <div className="recPerson">
                            <b>Người giao hồ sơ:</b>
                            <div className="recLine">Họ tên...........................</div>
                          </div>
                          <div className="recPerson">
                            <b>Người nhận hồ sơ:</b>
                            <div className="recLine">Họ tên...........................</div>
                          </div>
                        </td>
                        <td className="recRight" style={{ border: '1px solid #333' }}>
                          <div className="recDoctor">
                            <div className="date">Ngày......tháng......năm {formState.namKy || '2026'}</div>
                            <b>Bác sỹ điều trị</b>
                            <div className="recLine">Họ tên..............................</div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
