import { Schema, Document, model, models } from 'mongoose';

export interface IDailyVisitReport extends Document {
  month: string;           // yyyy-mm (e.g., "2026-06")
  departments: string[];   // List of department names
  records: any;            // Nested records: { [deptName]: { [day]: number } }
  note?: string;
  title?: string;
  clinic?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyVisitReportSchema = new Schema<IDailyVisitReport>(
  {
    month: { type: String, required: true, unique: true, index: true },
    departments: { type: [String], default: [] },
    records: { type: Schema.Types.Mixed, default: {} },
    note: { type: String, default: '' },
    title: { type: String, default: 'Báo Cáo Số Ca Khám' },
    clinic: { type: String, default: 'Phòng Khám Đa Khoa Nhơn Tâm' },
  },
  {
    timestamps: true,
  }
);

export default models.DailyVisitReport || model<IDailyVisitReport>('DailyVisitReport', DailyVisitReportSchema);
