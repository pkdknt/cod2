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
    { name: 'Nhơn Tâm BHYT 2026', href: '/bhyt', icon: FileBadge },
    { name: 'Số ca BHYT', href: '/bhyt/so-ca', icon: ShieldCheck },
  ];

  const otherItems = [
    { name: 'CSKH Tiêm Chủng', href: '/cskh-tiem-chung', icon: ClipboardList },
    { name: 'Chuyển viện', href: '/chuyen-vien', icon: Hospital },
    { name: 'Bảng giá Vắc xin', href: '/vaccine-prices', icon: DollarSign },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-zinc-950 text-zinc-100 flex-col h-screen border-r border-zinc-900 shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-900/80 bg-transparent">
          <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
            <Activity className="h-4.5 w-4.5" />
          </div>
          <div>
            <h1 className="font-semibold text-xs tracking-wider text-white">NHƠN TÂM CLINIC</h1>
            <span className="text-[9px] text-teal-500 font-bold uppercase tracking-widest block -mt-0.5">Management</span>
          </div>
        </div>

        {/* User Profile Area */}
        <div className="px-6 py-4 border-b border-zinc-900/60 bg-transparent">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-zinc-200 text-xs font-semibold">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-xs text-zinc-200 truncate max-w-[140px]">{user.fullName}</p>
              <p className="text-[10px] text-teal-500 font-semibold flex items-center gap-1 mt-0.5">
                <span className="h-1 w-1 rounded-full bg-teal-500 inline-block"></span>
                Trực tuyến
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-5 px-4 space-y-6 scrollbar-none">
          
          {/* Main Menu */}
          <div>
            <p className="px-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2">Chức năng chính</p>
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-all duration-150 active:scale-[0.98] ${
                      isActive 
                        ? 'bg-zinc-900 text-teal-400 border border-zinc-850' 
                        : 'text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 transition-colors ${isActive ? 'text-teal-400' : 'text-zinc-500 group-hover:text-teal-400'}`} />
                    <span className="text-xs">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Tools Menu */}
          <div>
            <p className="px-3 text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2">Tiện ích</p>
            <nav className="space-y-0.5">
              {otherItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-all duration-150 active:scale-[0.98] ${
                      isActive 
                        ? 'bg-zinc-900 text-teal-400 border border-zinc-850' 
                        : 'text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 transition-colors ${isActive ? 'text-teal-400' : 'text-zinc-500 group-hover:text-teal-400'}`} />
                    <span className="text-xs">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* System Status / Footer */}
        <div className="p-4 border-t border-zinc-900 bg-transparent">
          <div className="bg-zinc-900/20 rounded-xl p-3 border border-zinc-900/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-zinc-500">Server Load</span>
              <span className="text-[10px] font-medium text-teal-500">Stable</span>
            </div>
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500/80 w-1/4 rounded-full" />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center overflow-x-auto whitespace-nowrap h-16 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] pb-safe scrollbar-none px-2 gap-1">
        {[...navItems, ...otherItems].map((item) => {
          const isActive = pathname === item.href;
          let mobileName = item.name;
          if (mobileName === 'CSKH Tiêm Chủng') mobileName = 'CSKH';
          if (mobileName === 'Bảng giá Vắc xin') mobileName = 'Giá';
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[72px] flex-1 h-full space-y-1 transition-all duration-150 active:scale-[0.96] ${
                isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon className={`h-4.5 w-4.5 ${isActive ? 'stroke-[2.2px]' : 'stroke-2'}`} />
              <span className={`text-[9px] font-medium ${isActive ? 'text-teal-700' : 'text-slate-500'}`}>
                {mobileName}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
