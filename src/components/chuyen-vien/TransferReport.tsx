'use client';

import React, { useMemo } from 'react';
import { Hospital, User, PhoneCall, CheckCircle } from 'lucide-react';
import { PatientTransferData } from '@/services/PatientTransferService';

interface TransferReportProps {
  records: PatientTransferData[];
}

export default function TransferReport({ records }: TransferReportProps) {
  const stats = useMemo(() => {
    const total = records.length;
    const hasBhyt = records.filter(r => r.bhyt === 'Có').length;
    const noBhyt = total - hasBhyt;
    
    // Calls made
    const called = records.filter(r => r.callResult && r.callResult !== 'Chưa gọi').length;
    const notCalled = total - called;
    
    // VIPs
    const vips = records.filter(r => r.vip === 'Có').length;

    // Group by hospital
    const hospitalMap: Record<string, { total: number; inpatient: number; outpatient: number }> = {};
    // Group by doctor
    const doctorMap: Record<string, { total: number; inpatient: number; outpatient: number }> = {};
    // Group by call result
    const callResultMap: Record<string, number> = {};
    // Need call back queue
    const needCallQueue: PatientTransferData[] = [];

    records.forEach(r => {
      const hosp = r.destinationHospital?.trim() || 'Chưa xác định';
      const doc = r.doctor?.trim() || 'Chưa xác định';
      const callRes = r.callResult || 'Chưa gọi';

      // Hospital grouping
      if (!hospitalMap[hosp]) hospitalMap[hosp] = { total: 0, inpatient: 0, outpatient: 0 };
      hospitalMap[hosp].total++;
      if (callRes === 'Đã nhập viện') hospitalMap[hosp].inpatient++;
      else if (callRes === 'Không nhập viện') hospitalMap[hosp].outpatient++;

      // Doctor grouping
      if (!doctorMap[doc]) doctorMap[doc] = { total: 0, inpatient: 0, outpatient: 0 };
      doctorMap[doc].total++;
      if (callRes === 'Đã nhập viện') doctorMap[doc].inpatient++;
      else if (callRes === 'Không nhập viện') doctorMap[doc].outpatient++;

      // Call result grouping
      callResultMap[callRes] = (callResultMap[callRes] || 0) + 1;

      // Need call queue
      const isHoanTat = r.status === 'Hoàn tất';
      const needFollowUp = ['Chưa gọi', 'Không nghe máy', 'Hẹn gọi lại'].includes(callRes);
      if (!isHoanTat && needFollowUp) {
        needCallQueue.push(r);
      }
    });

    const hospitalReport = Object.entries(hospitalMap).map(([name, data]) => ({
      name,
      ...data,
      pct: data.total ? Math.round((data.inpatient / data.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);

    const doctorReport = Object.entries(doctorMap).map(([name, data]) => ({
      name,
      ...data,
      pct: data.total ? Math.round((data.inpatient / data.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);

    return {
      total,
      hasBhyt,
      noBhyt,
      called,
      notCalled,
      vips,
      hospitalReport,
      doctorReport,
      callResultMap,
      needCallQueue: needCallQueue.slice(0, 10) // Show top 10 need calls
    };
  }, [records]);

  return (
    <div className="space-y-6">
      {/* KPIs Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Tổng chuyển tuyến', val: stats.total, color: 'from-teal-650 to-teal-500' },
          { label: 'Có BHYT', val: stats.hasBhyt, color: 'from-blue-600 to-blue-500' },
          { label: 'Không BHYT', val: stats.noBhyt, color: 'from-slate-600 to-slate-500' },
          { label: 'Đã liên hệ CSKH', val: stats.called, color: 'from-emerald-600 to-emerald-500' },
          { label: 'Chưa liên hệ', val: stats.notCalled, color: 'from-amber-600 to-amber-500' },
          { label: 'Bệnh nhân VIP', val: stats.vips, color: 'from-purple-600 to-purple-500' }
        ].map((card, i) => (
          <div key={i} className={`rounded-2xl p-4 text-white bg-gradient-to-br ${card.color} shadow-sm`}>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-85 block">{card.label}</span>
            <span className="text-2xl font-black mt-1 block">{card.val}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hospital Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <Hospital className="h-4 w-4 text-teal-600" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Báo cáo theo bệnh viện chuyển đến</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-extrabold h-9">
                  <th className="py-2">Bệnh viện</th>
                  <th className="py-2 text-center">Tổng số</th>
                  <th className="py-2 text-center">Nhập viện</th>
                  <th className="py-2 text-center">Tỷ lệ nhập viện</th>
                </tr>
              </thead>
              <tbody>
                {stats.hospitalReport.map((hosp, idx) => (
                  <tr key={idx} className="border-b border-slate-100 h-9">
                    <td className="py-2 font-bold text-slate-800">{hosp.name}</td>
                    <td className="py-2 text-center font-bold text-slate-700">{hosp.total}</td>
                    <td className="py-2 text-center font-semibold text-emerald-600">{hosp.inpatient}</td>
                    <td className="py-2 text-center font-bold text-teal-600">{hosp.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Doctor Breakdown */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-teal-600" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Báo cáo theo bác sĩ</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-extrabold h-9">
                  <th className="py-2">Bác sĩ</th>
                  <th className="py-2 text-center">Tổng ca chuyển</th>
                  <th className="py-2 text-center">Nhập viện</th>
                  <th className="py-2 text-center">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                {stats.doctorReport.map((doc, idx) => (
                  <tr key={idx} className="border-b border-slate-100 h-9">
                    <td className="py-2 font-bold text-slate-800">{doc.name}</td>
                    <td className="py-2 text-center font-bold text-slate-700">{doc.total}</td>
                    <td className="py-2 text-center font-semibold text-emerald-600">{doc.inpatient}</td>
                    <td className="py-2 text-center font-bold text-teal-600">{doc.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call Outcomes */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-teal-600" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Báo cáo theo kết quả gọi</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.callResultMap).map(([outcome, count], idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-700 py-1 border-b border-slate-50">
                <span>{outcome}</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600">{count} ca</span>
              </div>
            ))}
          </div>
        </div>

        {/* Need Call Queue */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-teal-600" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Danh sách cần gọi / gọi lại (Gần nhất)</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.needCallQueue.length === 0 ? (
              <div className="text-center py-8 text-slate-450 font-bold">Không có cuộc gọi nhỡ cần xử lý</div>
            ) : (
              stats.needCallQueue.map((item, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-center gap-4">
                  <div>
                    <strong className="text-xs font-bold text-slate-800 block">{item.name}</strong>
                    <span className="text-[10px] text-slate-450 font-semibold block mt-0.5">SĐT: {item.phone || 'Chưa có'} · {item.destinationHospital || 'Chưa có BV'}</span>
                  </div>
                  <span className="bg-red-50 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-lg">
                    {item.callResult}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
