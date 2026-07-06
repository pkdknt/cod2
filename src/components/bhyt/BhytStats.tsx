'use strict';

import React from 'react';

interface BhytStatsProps {
  stats: {
    totalCustomers: number;
    expiredCount: number;
    count30: number;
    count60: number;
    count90: number;
    needCallCount: number;
    missingCount: number;
  };
}

export default function BhytStats({ stats }: BhytStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm text-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng khách hàng</span>
        <b className="block text-2xl font-black mt-1">{stats.totalCustomers}</b>
      </div>
      <div className="bg-red-50 border border-red-100 text-red-800 rounded-2xl p-4 shadow-sm text-center">
        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Đã hết hạn</span>
        <b className="block text-2xl font-black mt-1">{stats.expiredCount}</b>
      </div>
      <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl p-4 shadow-sm text-center">
        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Hạn 30 ngày</span>
        <b className="block text-2xl font-black mt-1">{stats.count30}</b>
      </div>
      <div className="bg-sky-50 border border-sky-100 text-sky-850 rounded-2xl p-4 shadow-sm text-center">
        <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Hạn 60 ngày</span>
        <b className="block text-2xl font-black mt-1">{stats.count60}</b>
      </div>
      <div className="bg-teal-50 border border-teal-100 text-teal-800 rounded-2xl p-4 shadow-sm text-center">
        <span className="text-[10px] font-bold text-teal-600/70 uppercase tracking-wider">Hạn 90 ngày</span>
        <b className="block text-2xl font-black mt-1">{stats.count90}</b>
      </div>
      <div className="bg-purple-50 border border-purple-100 text-purple-800 rounded-2xl p-4 shadow-sm text-center">
        <span className="text-[10px] font-bold text-purple-600/70 uppercase tracking-wider">Cần liên hệ</span>
        <b className="block text-2xl font-black mt-1">{stats.needCallCount}</b>
      </div>
    </div>
  );
}
