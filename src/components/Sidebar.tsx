'use strict';
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  ShieldCheck,
  Hospital,
  ClipboardList,
  Package,
  Syringe,
  Car,
  FileBadge,
  FileText,
  MessageSquare,
  Settings,
  ChevronDown,
  DollarSign,
  Search
} from 'lucide-react';

interface UserSession {
  username: string;
  fullName: string;
  role: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user] = useState<UserSession>({
    username: 'admin',
    fullName: 'Quản trị viên Nhơn Tâm',
    role: 'admin',
  });

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Số ca BHYT', href: '/bhyt/so-ca', icon: ShieldCheck },
  ];


  const otherItems = [
    { name: 'Lịch tiêm vắc xin', href: '/tiem-chung', icon: Syringe },
    { name: 'Tra cứu nhanh', href: '/tra-cuu-nhanh', icon: Search },
    { name: 'CSKH Tiêm Chủng', href: '/cskh-tiem-chung', icon: ClipboardList },
    { name: 'Bảng giá Vắc xin', href: '/vaccine-prices', icon: DollarSign },
    { name: 'Tin nhắn nhắc', href: '/tin-nhan', icon: MessageSquare },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col h-screen border-r border-slate-800 shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/40">
          <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-md">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-wide text-white">NHƠN TÂM CLINIC</h1>
            <span className="text-[10px] text-teal-400 font-semibold uppercase tracking-wider">Management</span>
          </div>
        </div>

        {/* User Profile Area */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-sm text-white truncate max-w-[140px]">{user.fullName}</p>
              <p className="text-xs text-teal-400 font-semibold flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 inline-block animate-pulse"></span>
                Trực tuyến
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          
          {/* Main Menu */}
          <div>
            <p className="px-3 text-xs font-bold tracking-widest text-slate-500 uppercase mb-3">Chức năng chính</p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-teal-600/10 text-teal-400' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-teal-400'}`} />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Tools Menu */}
          <div>
            <p className="px-3 text-xs font-bold tracking-widest text-slate-500 uppercase mb-3">Tiện ích</p>
            <nav className="space-y-1">
              {otherItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-teal-600/10 text-teal-400' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-teal-400'}`} />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* System Status / Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">Server Load</span>
              <span className="text-xs font-bold text-teal-400">Stable</span>
            </div>
            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 w-1/4 rounded-full" />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center overflow-x-auto whitespace-nowrap h-16 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe scrollbar-none px-2 gap-1">
        {[...navItems, ...otherItems].map((item) => {
          const isActive = pathname === item.href;
          // Shorten names for mobile to avoid wrapping
          let mobileName = item.name;
          if (mobileName === 'Lịch tiêm vắc xin') mobileName = 'Lịch tiêm';
          if (mobileName === 'Tra cứu nhanh') mobileName = 'Tra cứu';
          if (mobileName === 'CSKH Tiêm Chủng') mobileName = 'CSKH';
          if (mobileName === 'Bảng giá Vắc xin') mobileName = 'Giá';
          if (mobileName === 'Tin nhắn nhắc') mobileName = 'Tin';
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[72px] flex-1 h-full space-y-1 transition-colors ${
                isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className={`text-[9px] font-bold ${isActive ? 'text-teal-700' : 'text-slate-500'}`}>
                {mobileName}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
