'use client';

import React, { useEffect, useRef } from 'react';
import { ExcelRow, MapKeys, TemplateSettings, SignerConfig, DateConfig } from './types';

interface TheXanhPreviewProps {
  rows: ExcelRow[];
  mapKeys: MapKeys;
  settings: TemplateSettings;
  signerConfig: SignerConfig;
  dateConfig: DateConfig;
  logoUrl: string;
}

export default function TheXanhPreview({
  rows,
  mapKeys,
  settings,
  signerConfig,
  dateConfig,
  logoUrl
}: TheXanhPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const getSigner = (index: number) => {
    if (signerConfig.signMode === 'director') return { role: signerConfig.role1, name: signerConfig.signer1 };
    if (signerConfig.signMode === 'vice') return { role: signerConfig.role2, name: signerConfig.signer2 };
    return index % 2 === 0
      ? { role: signerConfig.role1, name: signerConfig.signer1 }
      : { role: signerConfig.role2, name: signerConfig.signer2 };
  };

  const getDisplayValue = (row: ExcelRow, key: string) => {
    if (!key) return '';
    const val = row[key];
    if (val == null) return '';
    // Format if it's a date object
    if (val instanceof Date) {
      const dd = String(val.getDate()).padStart(2, '0');
      const mm = String(val.getMonth() + 1).padStart(2, '0');
      const yyyy = val.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
    // Handle excel date serials (roughly between 20000 and 70000)
    if (typeof val === 'number' && val > 20000 && val < 70000) {
      const dateInfo = new Date((Math.floor(val - 25569) * 86400) * 1000);
      const dd = String(dateInfo.getUTCDate()).padStart(2, '0');
      const mm = String(dateInfo.getUTCMonth() + 1).padStart(2, '0');
      const yyyy = dateInfo.getUTCFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
    return String(val).trim();
  };

  const renderCard = (row: ExcelRow, globalIndex: number) => {
    const code = getDisplayValue(row, mapKeys.colCode);
    const name = getDisplayValue(row, mapKeys.colName);
    const birth = getDisplayValue(row, mapKeys.colBirth);
    const gender = getDisplayValue(row, mapKeys.colGender);
    const address = getDisplayValue(row, mapKeys.colAddress);
    const unit = getDisplayValue(row, mapKeys.colUnit);
    
    const examDate = dateConfig.dateMode === 'column'
      ? getDisplayValue(row, mapKeys.colDate)
      : dateConfig.manualDate;
      
    const signer = getSigner(globalIndex);

    return (
      <section className="tx-card" key={`card-${globalIndex}`}>
        <img className="tx-logo" src={logoUrl} alt="logo" />
        <div className="tx-company">
          {settings.tplCompanyLine1}<br />
          <b>{settings.tplCompanyLine2}<br />{settings.tplCompanyLine3}</b>
        </div>
        <div className="tx-cert-no">
          {settings.tplCertPrefix} <b>{code || settings.tplDefaultCode}</b> &nbsp;&nbsp; {settings.tplCertSuffix}
        </div>
        
        <div className="tx-nation">
          {settings.tplNation}
          <span className="tx-sub">{settings.tplNationSub}</span>
          <span className="tx-ornament">
            {/* Embedded ornament base64 from original */}
            <img src="data:image/png;base64,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" alt="hoa văn" />
          </span>
        </div>
        
        <div className="tx-title">{settings.tplTitle}</div>
        <div className="tx-photo-box"></div>
        
        <div className="tx-fields">
          <div className="tx-line">{settings.tplLabelName} <b>{name || settings.tplDefaultName}</b></div>
          <div className="tx-line">{settings.tplLabelBirth} <b>{birth || settings.tplDefaultBirth}</b></div>
          <div className="tx-line">{settings.tplLabelGender} &nbsp;<b>{gender || settings.tplDefaultGender}</b></div>
          <div className="tx-line">{settings.tplLabelAddress} <b>{address || settings.tplDefaultAddress}</b></div>
          <div className="tx-line">{settings.tplLabelUnit} <b>{unit || settings.tplDefaultUnit}</b></div>
          <div className="tx-line">{settings.tplLabelExamDate} <b>{examDate}</b></div>
          <div className="tx-line">{settings.tplLabelConclusion} <b>{settings.tplConclusion}</b></div>
        </div>
        
        <div className="tx-signature">{signer.role}</div>
        <div className="tx-doctor">{signer.name}</div>
      </section>
    );
  };

  const renderPages = () => {
    const pages = [];
    for (let i = 0; i < rows.length; i += 4) {
      const slice = rows.slice(i, i + 4);
      pages.push(
        <div className="tx-page" key={`page-${i}`}>
          {slice.map((row, offset) => renderCard(row, i + offset))}
        </div>
      );
    }
    return pages;
  };

  // Shrink to fit text inside specific elements if they overflow
  const shrinkToFit = (el: HTMLElement, minPt = 7.2, step = 0.2) => {
    if (!el) return;
    const computed = window.getComputedStyle(el);
    let px = parseFloat(computed.fontSize);
    const minPx = minPt * 96 / 72;
    el.style.fontSize = '';
    el.style.lineHeight = '';
    px = parseFloat(window.getComputedStyle(el).fontSize);
    let guard = 0;
    while (guard++ < 30 && px > minPx && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)) {
      px -= step * 96 / 72;
      el.style.fontSize = px + 'px';
      el.style.lineHeight = '1.12';
    }
  };

  useEffect(() => {
    if (!previewRef.current) return;
    const fields = previewRef.current.querySelectorAll('.tx-fields') as NodeListOf<HTMLElement>;
    const titles = previewRef.current.querySelectorAll('.tx-title') as NodeListOf<HTMLElement>;
    const nations = previewRef.current.querySelectorAll('.tx-nation') as NodeListOf<HTMLElement>;
    const companies = previewRef.current.querySelectorAll('.tx-company') as NodeListOf<HTMLElement>;
    const doctors = previewRef.current.querySelectorAll('.tx-doctor') as NodeListOf<HTMLElement>;
    
    fields.forEach(el => el.style.lineHeight = '1.28');
    titles.forEach(el => el.style.lineHeight = '1.28');
    nations.forEach(el => shrinkToFit(el, 7.2, 0.2));
    companies.forEach(el => shrinkToFit(el, 7.2, 0.2));
    doctors.forEach(el => shrinkToFit(el, 8.2, 0.2));
  }, [rows, mapKeys, settings, signerConfig, dateConfig]);

  if (!rows || rows.length === 0) {
    return (
      <div className="p-10 bg-white rounded-xl border border-dashed border-slate-400 text-slate-500 text-center max-w-3xl mx-auto my-8 print:hidden">
        Upload file Excel rồi chọn sheet + map cột để hiển thị thẻ nha.
      </div>
    );
  }

  return (
    <div className="tx-preview-wrap print:p-0 print:block" ref={previewRef}>
      <style dangerouslySetInnerHTML={{__html: `
        :root { --tx-ink:#111; --tx-border:#222; --tx-paper:#fff; }
        .tx-preview-wrap { padding: 22px; display: flex; flex-direction: column; align-items: center; gap: 18px; background: #f2f4f7; overflow: auto; }
        .tx-page { width: 29.7cm; height: 21cm; background: var(--tx-paper); display: grid; grid-template-columns: 14.6cm 14.6cm; grid-template-rows: 9.9cm 9.9cm; column-gap: 0; row-gap: 0; padding: .60cm .25cm; page-break-after: always; box-shadow: 0 6px 28px rgba(15,23,42,.12); transform-origin: top center; flex-shrink: 0; }
        .tx-card { width: 14.6cm; height: 9.9cm; border: 1px solid var(--tx-border); position: relative; overflow: hidden; background: white; unicode-bidi: embed; font-family: 'Times New Roman', 'Arial', 'Tahoma', 'Segoe UI', sans-serif; color: var(--tx-ink); box-sizing: border-box; }
        .tx-card::after { content: ""; position: absolute; inset: .07cm; border: 0.45px solid var(--tx-border); pointer-events: none; }
        .tx-logo { position: absolute; left: .28cm; top: .20cm; width: .78cm; height: .88cm; object-fit: contain; z-index: 1; }
        .tx-company { position: absolute; left: 1.05cm; top: .18cm; width: 4.15cm; text-align: center; font-size: 8.4pt; line-height: 1.03; font-weight: 400; overflow: hidden; }
        .tx-company b { font-size: 8.7pt; }
        .tx-cert-no { position: absolute; left: 1.60cm; top: 1.28cm; width: 4.55cm; font-size: 11.2pt; white-space: nowrap; overflow: hidden; }
        .tx-cert-no b { font-weight: 700; }
        .tx-nation { position: absolute; right: .25cm; top: .18cm; width: 6.75cm; text-align: center; font-size: 8.45pt; font-weight: 700; line-height: 1.05; overflow: hidden; }
        .tx-nation .tx-sub { display: block; font-weight: 700; font-size: 8.25pt; margin-top: .04cm; }
        .tx-ornament { display: flex; justify-content: center; align-items: center; margin-top: .02cm; }
        .tx-ornament img { width: 2.65cm; height: auto; display: block; object-fit: contain; }
        .tx-title { position: absolute; right: .25cm; top: 1.26cm; width: 6.65cm; height: .85cm; text-align: center; font-size: 13.2pt; line-height: 1.28; font-weight: 700; letter-spacing: .15px; overflow: visible; padding-top: .04cm; }
        .tx-photo-box { position: absolute; left: .36cm; top: 2.18cm; width: 3.10cm; height: 4.45cm; border: 1px solid var(--tx-border); }
        .tx-fields { position: absolute; left: 3.65cm; top: 2.10cm; width: 10.50cm; height: 6.40cm; font-size: 11.2pt; line-height: 1.28; overflow: visible; }
        .tx-fields .tx-line { white-space: normal; overflow-wrap: normal; word-break: normal; margin-bottom: .08cm; max-width: 10.50cm; }
        .tx-fields b { overflow-wrap: normal; word-break: normal; font-weight: 700; }
        .tx-fields .tx-line:nth-child(4), .tx-fields .tx-line:nth-child(5) { line-height: 1.25; max-width: 10.50cm; }
        .tx-signature { position: absolute; right: .50cm; top: 6.15cm; width: 3.30cm; text-align: center; font-size: 10.15pt; line-height: 1.05; font-weight: 700; z-index: 2; }
        .tx-doctor { position: absolute; right: .25cm; bottom: .30cm; width: 6.20cm; text-align: right; font-size: 10.1pt; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: clip; }
        
        @media screen and (max-width: 1300px) { .tx-preview-wrap { align-items: flex-start; } .tx-page { zoom: .75; } }
        @media screen and (max-width: 900px) { .tx-page { zoom: .55; } }

        @media print {
          @page { size: A4 landscape; margin: 0; }
          html, body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .tx-preview-wrap { padding: 0 !important; gap: 0 !important; display: block !important; background: white !important; }
          .tx-page { margin: 0 !important; box-shadow: none !important; zoom: 1 !important; transform: none !important; }
        }
      `}} />
      {renderPages()}
    </div>
  );
}
