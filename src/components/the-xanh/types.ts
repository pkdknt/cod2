export interface ExcelRow {
  [key: string]: any;
}

export interface MapKeys {
  colCode: string;
  colName: string;
  colBirth: string;
  colGender: string;
  colAddress: string;
  colUnit: string;
  colDate: string;
}

export interface TemplateSettings {
  tplCompanyLine1: string;
  tplCompanyLine2: string;
  tplCompanyLine3: string;
  tplCertPrefix: string;
  tplCertSuffix: string;
  tplNation: string;
  tplNationSub: string;
  tplTitle: string;
  tplLabelName: string;
  tplLabelBirth: string;
  tplLabelGender: string;
  tplLabelAddress: string;
  tplLabelUnit: string;
  tplLabelExamDate: string;
  tplLabelConclusion: string;
  tplConclusion: string;
  tplDefaultCode: string;
  tplDefaultName: string;
  tplDefaultBirth: string;
  tplDefaultGender: string;
  tplDefaultAddress: string;
  tplDefaultUnit: string;
}

export interface SignerConfig {
  signMode: 'alternate' | 'director' | 'vice';
  role1: string;
  signer1: string;
  role2: string;
  signer2: string;
}

export interface DateConfig {
  dateMode: 'manual' | 'column';
  manualDate: string;
}
