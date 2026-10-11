import React from 'react';

export interface HealthCardData {
  code: string;
  name: string;
  birth: string;
  gender: string;
  address: string;
  unit: string;
  examDate: string;
}

export interface HealthCardTemplate {
  companyLine1: string;
  companyLine2: string;
  companyLine3: string;
  certPrefix: string;
  certSuffix: string;
  nation: string;
  nationSub: string;
  title: string;
  labelName: string;
  labelBirth: string;
  labelGender: string;
  labelAddress: string;
  labelUnit: string;
  labelExamDate: string;
  labelConclusion: string;
  conclusion: string;
}

export interface Signer {
  role: string;
  name: string;
}

interface HealthCardProps {
  data: HealthCardData;
  template: HealthCardTemplate;
  signer: Signer;
  logoSrc?: string;
}

/** One green health certificate card (14.6 × 9.9cm). */
export default function HealthCard({ data, template, signer, logoSrc }: HealthCardProps) {
  return (
    <div className="hc-card">
      <div className="hc-inner">
        <div className="hc-head">
          <div className="hc-brand">
            {logoSrc ? (
              <img className="hc-logo" src={logoSrc} alt="Logo phòng khám" />
            ) : (
              <div className="hc-logo" />
            )}
            <div className="hc-company">
              <b>{template.companyLine1}</b>
              <br />
              {template.companyLine2}
              <br />
              {template.companyLine3}
            </div>
            <div className="hc-cert-no">
              {template.certPrefix} <b>{data.code || template.certSuffix.replace('/', '')}</b>
              {template.certSuffix}
            </div>
          </div>

          <div className="hc-right-head">
            <div className="hc-nation">
              {template.nation}
              <span className="sub">{template.nationSub}</span>
            </div>
            <div className="hc-ornament">★★★</div>
            <div className="hc-title">{template.title}</div>
          </div>
        </div>

        <div className="hc-body">
          <div className="hc-photo" />
          <div className="hc-fields">
            <span className="line">
              <b>{template.labelName}</b> {data.name}
            </span>
            <span className="line">
              <b>{template.labelBirth}</b> {data.birth}
            </span>
            <span className="line">
              <b>{template.labelGender}</b> {data.gender}
            </span>
            <span className="line">
              <b>{template.labelAddress}</b> {data.address}
            </span>
            <span className="line">
              <b>{template.labelUnit}</b> {data.unit}
            </span>
            <span className="line">
              <b>{template.labelExamDate}</b> {data.examDate}
            </span>
            <span className="line">
              <b>{template.labelConclusion}</b> {template.conclusion}
            </span>
          </div>
        </div>
      </div>

      <div className="hc-foot">
        <div className="hc-sign">
          <div className="hc-signature">{signer.role}</div>
          <div />
          <div className="hc-doctor">{signer.name}</div>
        </div>
      </div>
    </div>
  );
}
