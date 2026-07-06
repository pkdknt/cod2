'use client';

import React from 'react';
import { Printer } from 'lucide-react';
import { TheXanhCustomerData } from '@/services/TheXanhService';
import { TheXanhTemplateSettings, TheXanhSignSettings } from './TheXanhEditor';

interface TheXanhPrintPreviewProps {
  items: TheXanhCustomerData[];
  templateSettings: TheXanhTemplateSettings;
  signSettings: TheXanhSignSettings;
  dateMode: 'manual' | 'column';
  manualDate: string;
}

export default function TheXanhPrintPreview({
  items,
  templateSettings,
  signSettings,
  dateMode,
  manualDate
}: TheXanhPrintPreviewProps) {
  // Chunk items array into sizes of 4
  const chunkArray = (arr: any[], size: number) => {
    const chunked = [];
    for (let i = 0; i < arr.length; i += size) {
      chunked.push(arr.slice(i, i + size));
    }
    return chunked;
  };

  const pages = chunkArray(items, 4);

  const getSignerInfo = (globalIdx: number) => {
    const mode = signSettings.signMode;
    if (mode === 'director') {
      return { role: signSettings.role1, name: signSettings.signer1 };
    } else if (mode === 'vice') {
      return { role: signSettings.role2, name: signSettings.signer2 };
    } else {
      // Alternate signers based on index
      if (globalIdx % 2 === 0) {
        return { role: signSettings.role1, name: signSettings.signer1 };
      } else {
        return { role: signSettings.role2, name: signSettings.signer2 };
      }
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stylesheet injection for A4 landscape printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #thexanh-print-preview, #thexanh-print-preview * {
            visibility: visible;
          }
          #thexanh-print-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 297mm !important;
            height: 210mm !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}} />

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <span className="text-xs font-bold text-slate-650">
          Tổng số thẻ chuẩn bị in: <b>{items.length} thẻ</b> (Số trang: {pages.length} trang A4)
        </span>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-650 transition-colors"
        >
          <Printer className="h-4 w-4" /> Bắt đầu in A4 ngang
        </button>
      </div>

      <div id="thexanh-print-preview" className="overflow-x-auto bg-slate-600 p-8 rounded-3xl space-y-8 print:p-0 print:bg-transparent print:space-y-0">
        {pages.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-2xl max-w-lg mx-auto font-bold text-slate-400">
            Không có thẻ nào được chọn để in. Vui lòng chọn thẻ ở danh sách hoặc thêm thẻ mới.
          </div>
        ) : (
          pages.map((pageItems, pageIdx) => (
            <div
              key={pageIdx}
              className="bg-white border border-slate-350 shadow-2xl mx-auto flex flex-wrap w-[297mm] h-[210mm] relative overflow-hidden print:shadow-none print:border-0 print:m-0"
              style={{
                padding: '0.60cm 0.25cm',
                display: 'grid',
                gridTemplateColumns: '14.6cm 14.6cm',
                gridTemplateRows: '9.9cm 9.9cm',
                columnGap: '0',
                rowGap: '0',
                breakAfter: 'page',
                pageBreakAfter: 'always'
              }}
            >
              {/* Render 4 card cells */}
              {Array.from({ length: 4 }).map((_, cellIdx) => {
                const itemIdx = pageIdx * 4 + cellIdx;
                const card = pageItems[cellIdx];

                if (!card) {
                  // Blank placeholder to preserve grid alignment
                  return <div key={cellIdx} className="w-[14.6cm] h-[9.9cm]" />;
                }

                const signer = getSignerInfo(itemIdx);
                const currentExamDate = dateMode === 'manual' ? manualDate : (card.examDate || '');

                return (
                  <div
                    key={cellIdx}
                    className="relative overflow-hidden bg-white text-slate-900 border border-slate-900"
                    style={{
                      width: '14.6cm',
                      height: '9.9cm',
                      fontFamily: '"Times New Roman", Times, serif',
                      fontSize: '11.2pt',
                      lineHeight: '1.28'
                    }}
                  >
                    {/* Double border effect */}
                    <div className="absolute inset-[0.07cm] border-[0.45px] border-slate-900 pointer-events-none" />

                    {/* Clinic Branding Header */}
                    <div className="absolute left-[1.05cm] top-[0.18cm] w-[4.15cm] text-center text-[8.4pt] leading-[1.03] font-normal overflow-hidden">
                      <b>{templateSettings.tplCompanyLine1}</b>
                      <div className="text-[7.5pt]">{templateSettings.tplCompanyLine2}</div>
                      <div className="text-[7.5pt]">{templateSettings.tplCompanyLine3}</div>
                    </div>

                    {/* Card Serial Number */}
                    <div className="absolute left-[1.60cm] top-[1.28cm] w-[4.55cm] text-[11.2pt] whitespace-nowrap overflow-hidden">
                      {templateSettings.tplCertPrefix} <b>{card.code}</b>{templateSettings.tplCertSuffix}
                    </div>

                    {/* Nation Titles */}
                    <div className="absolute right-[0.25cm] top-[0.18cm] w-[6.75cm] text-center text-[8.45pt] font-bold leading-[1.05] overflow-hidden">
                      {templateSettings.tplNation}
                      <span className="block font-bold text-[8.25pt] mt-[0.04cm]">
                        {templateSettings.tplNationSub}
                      </span>
                      {/* Ornament line */}
                      <div className="flex justify-center items-center mt-[0.02cm]">
                        <div className="w-[2.65cm] border-b border-black h-[1px]" />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="absolute right-[0.25cm] top-[1.26cm] w-[6.65cm] h-[0.85cm] text-center text-[13.2pt] leading-[1.28] font-bold overflow-visible pt-[0.04cm] uppercase">
                      {templateSettings.tplTitle}
                    </div>

                    {/* Left Side: Photo Box */}
                    <div className="absolute left-[0.36cm] top-[2.18cm] w-[3.10cm] h-[4.45cm] border border-slate-900 flex flex-col items-center justify-center text-[8pt] text-slate-400 font-sans">
                      <span>Ảnh giáp lai</span>
                      <span>4 x 6 cm</span>
                    </div>

                    {/* Right Side: Information Lines */}
                    <div className="absolute left-[3.65cm] top-[2.10cm] w-[10.50cm] h-[6.40cm] text-[11.2pt] leading-[1.28] overflow-visible">
                      <div className="whitespace-normal break-words max-w-[10.50cm] mb-[0.08cm]">
                        {templateSettings.tplLabelName} <span className="uppercase font-bold">{card.name}</span>
                      </div>
                      <div className="whitespace-normal break-words max-w-[10.50cm] mb-[0.08cm] flex gap-8">
                        <span>{templateSettings.tplLabelBirth} <b>{card.birthYear}</b></span>
                        <span>{templateSettings.tplLabelGender} {card.gender}</span>
                      </div>
                      <div className="whitespace-normal break-words max-w-[10.50cm] mb-[0.08cm] leading-[1.2]">
                        {templateSettings.tplLabelAddress} <span>{card.address}</span>
                      </div>
                      <div className="whitespace-normal break-words max-w-[10.50cm] mb-[0.08cm] leading-[1.2] truncate">
                        {templateSettings.tplLabelUnit} <b>{card.unit}</b>
                      </div>
                      <div className="whitespace-normal break-words max-w-[10.50cm] mb-[0.08cm]">
                        {templateSettings.tplLabelExamDate} <span>{currentExamDate}</span>
                      </div>
                      <div className="whitespace-normal break-words max-w-[10.50cm] mb-[0.08cm]">
                        {templateSettings.tplLabelConclusion} <span className="font-bold">{card.conclusion || templateSettings.tplConclusion}</span>
                      </div>
                    </div>

                    {/* Signature Placement */}
                    <div className="absolute right-[0.50cm] top-[6.15cm] w-[3.30cm] text-center text-[10.15pt] leading-[1.05] font-bold z-10">
                      <div className="uppercase">{signer.role}</div>
                      {/* Height spacing for signature */}
                      <div className="h-[1.5cm]" />
                      <div className="text-[10.1pt] truncate font-bold uppercase">{signer.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
