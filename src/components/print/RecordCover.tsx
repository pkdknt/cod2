import React from 'react';
import { COVER_LABELS, type CoverHeader, type CoverRecord } from '@/lib/recordCover';

interface RecordCoverProps {
  record: CoverRecord;
  header: CoverHeader;
  logoSrc?: string;
}

/** One A3 medical-record cover (190 x 267mm block on the right half of the sheet). */
export default function RecordCover({ record, header, logoSrc }: RecordCoverProps) {
  return (
    <div className="cv-sheet">
      <div className="cv-top">{record.soLuuTru || header.soLuuTru || ''}</div>
      <div className="cv-cover">
        <div className="cv-inner">
          <div className="cv-clinic">{header.dongPK1}</div>
          <div className="cv-addr">{header.dongPK2}</div>
          <div className="cv-addr">{header.dongPK3}</div>
          {logoSrc ? <img className="cv-logo" src={logoSrc} alt="Logo" /> : null}
          <div className="cv-title">{header.tenBenhAn}</div>
          <div className="cv-code">
            <div><b>Mã số vào viện:</b> <span className="cv-value">{record.maVaoVien || ''}</span></div>
            <div><b>Mã bệnh nhân:</b> <span className="cv-value">{record.maBenhNhan || ''}</span></div>
          </div>
          <div className="cv-info">
            {COVER_LABELS.map(({ key, label }) => (
              <div key={String(key)}>
                <b>{label}</b> <span className="cv-value">{record[key] || ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
