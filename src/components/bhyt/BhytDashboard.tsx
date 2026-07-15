'use client';

import React from 'react';
import { Users, AlertTriangle, Calendar, ShieldCheck, HelpCircle, ArrowRight, Activity } from 'lucide-react';
import { formatVnDate, getDaysRemaining } from '@/lib/utils';

interface BhytDashboardProps {
  stats: {
    totalCustomers: number;
    expiredCount: number;
    due15Count: number;
    due30Count: number;
    activeCount: number;
    unknownCount: number;
    heroPriority: number;
  };
  upcoming: any[];
  onNavigateTab: (tab: string) => void;
}

export default function BhytDashboard({ stats, upcoming, onNavigateTab }: BhytDashboardProps) {
  const getProgressWidth = (value: number, total: number) => {
    if (!total) return '0%';
    return `${(value / total) * 100}%`;
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-teal-900/10">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">Quản lý khách BHYT tập trung</h2>
            <p className="text-teal-100 text-sm md:text-base max-w-xl">
              Theo dõi hạn thẻ, ưu tiên liên hệ khách hàng đến hạn gia hạn, và tối ưu hóa quy trình chăm sóc.
            </p>
          </div>
          <div className="bg-white/15 backdrop-blur-md border border-white/20 p-5 rounded-2xl shrink-0 md:min-w-[200px] text-center">
            <div className="text-3xl font-black text-white mb-1">{stats.heroPriority}</div>
            <div className="text-xs text-teal-100 font-semibold uppercase tracking-wider">Khách cần ưu tiên hôm nay</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            title: 'Tất cả khách',
            value: stats.totalCustomers,
            icon: Users,
            color: 'bg-blue-50 text-blue-600 border-blue-100',
            sub: 'Tổng số hồ sơ'
          },
          {
            title: 'Đã hết hạn',
            value: stats.expiredCount,
            icon: AlertTriangle,
            color: 'bg-red-50 text-red-600 border-red-100',
            sub: 'Cần liên hệ gấp'
          },
          {
            title: 'Hạn ≤ 15 ngày',
            value: stats.due15Count,
            icon: Calendar,
            color: 'bg-amber-50 text-amber-600 border-amber-100',
            sub: 'Ưu tiên cao'
          },
          {
            title: 'Hạn 16–30 ngày',
            value: stats.due30Count,
            icon: Calendar,
            color: 'bg-teal-50 text-teal-600 border-teal-100',
            sub: 'Nhắc nhở dần'
          },
          {
            title: 'Còn hiệu lực',
            value: stats.activeCount,
            icon: ShieldCheck,
            color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            sub: 'Thông tin thẻ an toàn'
          }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-xl border ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <span className="text-xs text-slate-400 font-semibold">{kpi.sub}</span>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black text-slate-800">{kpi.value}</span>
              <h4 className="text-xs font-bold text-slate-500 mt-1">{kpi.title}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Expirations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Bars */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm lg:col-span-1">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Phân bổ tình trạng thẻ</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Tự tính theo ngày hiện tại</p>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Đã hết hạn', count: stats.expiredCount, color: 'bg-red-500' },
              { label: 'Còn ≤ 15 ngày', count: stats.due15Count, color: 'bg-amber-500' },
              { label: 'Còn 16–30 ngày', count: stats.due30Count, color: 'bg-teal-500' },
              { label: 'Còn hiệu lực', count: stats.activeCount, color: 'bg-emerald-500' },
              { label: 'Chưa rõ hạn thẻ', count: stats.unknownCount, color: 'bg-slate-400' }
            ].map((row, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{row.label}</span>
                  <span>{row.count} ({stats.totalCustomers ? Math.round((row.count / stats.totalCustomers) * 100) : 0}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${row.color} rounded-full transition-all duration-500`}
                    style={{ width: getProgressWidth(row.count, stats.totalCustomers) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closest Expirations */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm lg:col-span-2 flex flex-col">
          <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide uppercase">Sắp đến hạn gần nhất</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Danh sách ưu tiên liên hệ</p>
            </div>
            <button
              onClick={() => onNavigateTab('renewals')}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              Xem danh sách <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          
          <div className="flex-1 divide-y divide-slate-100">
            {upcoming.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-semibold py-8 text-sm">
                Chưa có dữ liệu hạn thẻ
              </div>
            ) : (
              upcoming.map((cust) => {
                const days = getDaysRemaining(cust.expiry);
                const isExpired = days !== null && days < 0;
                
                return (
                  <div key={cust._id} className="py-3 flex justify-between items-center gap-4">
                    <div>
                      <strong className="text-sm font-extrabold text-slate-800 block">{cust.name}</strong>
                      <span className="text-xs font-bold text-slate-500 block">BHXH: {cust.bhxh}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold inline-block ${
                        isExpired 
                          ? 'bg-red-50 text-red-700' 
                          : days !== null && days <= 15
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-teal-50 text-teal-700'
                      }`}>
                        {isExpired ? `Quá hạn ${Math.abs(days)} ngày` : `Còn ${days} ngày`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold block mt-1">Hạn: {cust.expiry}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
