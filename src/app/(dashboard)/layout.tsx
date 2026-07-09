'use strict';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { Activity } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 md:h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 md:h-5 md:w-5 text-teal-600 animate-pulse" />
            <h2 className="font-bold text-slate-800 text-sm md:text-base">Hệ Thống Quản Trị</h2>
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            Thời gian hệ thống: {new Date().toLocaleDateString('vi-VN')}
          </div>
        </header>

        {/* Dynamic Content Views */}
        <main className="flex-1 overflow-auto p-3 md:p-8 pb-20 md:pb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-teal-50/10 pointer-events-none" />
          <div className="relative z-10 h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
