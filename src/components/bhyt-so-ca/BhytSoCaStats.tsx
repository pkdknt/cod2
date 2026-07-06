'use client';

import React, { useState } from 'react';
import { BhytSoCaData } from '@/services/BhytSoCaService';

interface BhytSoCaStatsProps {
  items: BhytSoCaData[];
  monthsList: string[];
}

export default function BhytSoCaStats({ items, monthsList }: BhytSoCaStatsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'compare'>('stats');

  // Comparison states
  const [m1, setM1] = useState('');
  const [m2, setM2] = useState('');
  const [y1, setY1] = useState('');
  const [y2, setY2] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const curMonth = todayStr.slice(0, 7);
  const curYear = todayStr.slice(0, 4);

  // Group totals helpers
  const getSum = (list: BhytSoCaData[], type?: 'Mua mới' | 'Gia hạn') => {
    return list
      .filter(r => !type || r.type === type)
      .reduce((acc, curr) => acc + (curr.qty || 0), 0);
  };

  const getGrouped = (keyFn: (r: BhytSoCaData) => string) => {
    const groups: Record<string, { total: number; buy: number; renew: number }> = {};
    items.forEach(r => {
      const k = keyFn(r);
      if (!k) return;
      if (!groups[k]) groups[k] = { total: 0, buy: 0, renew: 0 };
      groups[k].total += r.qty;
      if (r.type === 'Mua mới') groups[k].buy += r.qty;
      if (r.type === 'Gia hạn') groups[k].renew += r.qty;
    });
    return groups;
  };

  const days = getGrouped(r => r.date);
  const months = getGrouped(r => r.date.slice(0, 7));
  const years = getGrouped(r => r.date.slice(0, 4));

  const formatVnDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const monthLabel = (k: string) => {
    if (!k) return '';
    const [y, m] = k.split('-');
    return `${m}/${y}`;
  };

  // Metric Cards
  const todayList = items.filter(r => r.date === todayStr);
  const monthList = items.filter(r => r.date.startsWith(curMonth));
  const yearList = items.filter(r => r.date.startsWith(curYear));

  const metricCards = [
    { label: 'Hôm nay BHYT', total: getSum(todayList), detail: `Mua ${getSum(todayList, 'Mua mới')} • Hạn ${getSum(todayList, 'Gia hạn')}` },
    { label: 'Tháng này BHYT', total: getSum(monthList), detail: `Mua ${getSum(monthList, 'Mua mới')} • Hạn ${getSum(monthList, 'Gia hạn')}` },
    { label: 'Năm nay BHYT', total: getSum(yearList), detail: `Mua ${getSum(yearList, 'Mua mới')} • Hạn ${getSum(yearList, 'Gia hạn')}` },
    { label: 'Tổng ghi nhận', total: getSum(items), detail: `${items.length} ca giao dịch` },
  ];

  // Compare results helpers
  const compareText = (labelA: string, valA: number, labelB: string, valB: number) => {
    const diff = valB - valA;
    const pct = valA ? (diff / valA) * 100 : (valB ? 100 : 0);
    const sign = diff > 0 ? '+' : '';
    return (
      <div className="text-xs leading-relaxed space-y-1">
        <p>• <b>{labelA}:</b> <span className="font-bold text-slate-700">{valA} ca</span></p>
        <p>• <b>{labelB}:</b> <span className="font-bold text-slate-700">{valB} ca</span></p>
        <p>• <b>Chênh lệch:</b> <span className={`font-black ${diff >= 0 ? 'text-teal-700' : 'text-red-700'}`}>{sign}{diff} ca ({sign}{pct.toFixed(1)}%)</span></p>
      </div>
    );
  };

  const yearsList = Object.keys(years).sort().reverse();
  const activeY1 = y1 || yearsList[1] || curYear;
  const activeY2 = y2 || yearsList[0] || curYear;

  const activeM1 = m1 || monthsList[1] || curMonth;
  const activeM2 = m2 || monthsList[0] || curMonth;

  const sumM1 = getSum(items.filter(r => r.date.startsWith(activeM1)));
  const sumM2 = getSum(items.filter(r => r.date.startsWith(activeM2)));

  const sumY1 = getSum(items.filter(r => r.date.startsWith(activeY1)));
  const sumY2 = getSum(items.filter(r => r.date.startsWith(activeY2)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
            <p className="text-2xl font-black text-slate-800 tracking-tight mt-1">{card.total}</p>
            <p className="text-[11px] text-slate-500 mt-1 font-semibold">{card.detail}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex border-b border-slate-100 pb-3 gap-2">
          <button
            onClick={() => setActiveSubTab('stats')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'stats'
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            📊 Thống kê tổng hợp
          </button>
          <button
            onClick={() => setActiveSubTab('compare')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'compare'
                ? 'bg-teal-50 text-teal-800'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            ⚖️ So sánh chu kỳ
          </button>
        </div>

        {/* Tab content: Stats */}
        {activeSubTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 animate-fade-in">
            {/* Days list */}
            <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase mb-3 text-teal-900">Theo ngày (Gần nhất)</h4>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {Object.entries(days).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 10).map(([k, v]) => (
                  <div key={k} className="text-xs bg-white border border-slate-100 rounded-xl p-2 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-700">{formatVnDate(k)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Mua {v.buy} • Hạn {v.renew}</p>
                    </div>
                    <span className="font-black text-teal-850 text-sm">{v.total} ca</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Months list */}
            <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase mb-3 text-teal-900">Theo tháng</h4>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {Object.entries(months).sort((a, b) => b[0].localeCompare(a[0])).map(([k, v]) => (
                  <div key={k} className="text-xs bg-white border border-slate-100 rounded-xl p-2 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-700">Tháng {monthLabel(k)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Mua {v.buy} • Hạn {v.renew}</p>
                    </div>
                    <span className="font-black text-teal-850 text-sm">{v.total} ca</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Years list */}
            <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase mb-3 text-teal-900">Theo năm</h4>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {Object.entries(years).sort((a, b) => b[0].localeCompare(a[0])).map(([k, v]) => (
                  <div key={k} className="text-xs bg-white border border-slate-100 rounded-xl p-2 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-700">Năm {k}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Mua {v.buy} • Hạn {v.renew}</p>
                    </div>
                    <span className="font-black text-teal-850 text-sm">{v.total} ca</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab content: Compare */}
        {activeSubTab === 'compare' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-fade-in">
            {/* Compare month */}
            <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase mb-3 text-teal-900">So sánh tháng</h4>
              <div className="flex gap-2 mb-4">
                <select
                  value={activeM1}
                  onChange={(e) => setM1(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
                >
                  {monthsList.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
                </select>
                <select
                  value={activeM2}
                  onChange={(e) => setM2(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
                >
                  {monthsList.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
                </select>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-inner">
                {compareText(`Tháng ${monthLabel(activeM1)}`, sumM1, `Tháng ${monthLabel(activeM2)}`, sumM2)}
              </div>
            </div>

            {/* Compare year */}
            <div className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase mb-3 text-teal-900">So sánh năm</h4>
              <div className="flex gap-2 mb-4">
                <select
                  value={activeY1}
                  onChange={(e) => setY1(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
                >
                  {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select
                  value={activeY2}
                  onChange={(e) => setY2(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 p-2 text-xs font-semibold bg-white outline-none"
                >
                  {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-inner">
                {compareText(`Năm ${activeY1}`, sumY1, `Năm ${activeY2}`, sumY2)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
