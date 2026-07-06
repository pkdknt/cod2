'use strict';
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Hospital,
  ClipboardList,
  Package,
  Activity,
  ArrowRight,
  TrendingUp,
  UserCheck,
  CalendarDays
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalBHYT: 1770,
    expiredBHYT: 150,
    transfers: 350,
    activeSchedules: 432
  });

  useEffect(() => {
    // Proactively fetch real BHYT stats from API
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/bhyt?pageSize=1');
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setStats(prev => ({
              ...prev,
              totalBHYT: data.stats.totalCustomers,
              expiredBHYT: data.stats.expiredCount
            }));
          }
        }
        
        // Fetch real CSKH vaccine count
        const resTiem = await fetch('/api/cskh-tiem-chung');
        if (resTiem.ok) {
          const dataTiem = await resTiem.json();
          if (dataTiem.items) {
            setStats(prev => ({
              ...prev,
              activeSchedules: dataTiem.items.length
            }));
          }
        }
      } catch (e) {
        console.error('Failed to fetch real-time stats for dashboard:', e);
      }
    };
    fetchStats();
  }, []);

  const metricCards = [
    {
      title: 'Khách hàng BHYT',
      value: stats.totalBHYT.toLocaleString(),
      desc: 'Tổng số hồ sơ trong hệ thống',
      icon: ShieldCheck,
      color: 'from-teal-500 to-teal-700',
      shadow: 'shadow-teal-500/20',
      href: '/bhyt'
    },
    {
      title: 'BHYT Đã hết hạn',
      value: stats.expiredBHYT.toLocaleString(),
      desc: 'Cần gọi điện tư vấn gia hạn',
      icon: TrendingUp,
      color: 'from-red-500 to-red-700',
      shadow: 'shadow-red-500/20',
      href: '/bhyt?statusFilter=expired'
    },
    {
      title: 'CSKH Chuyển viện',
      value: stats.transfers.toLocaleString(),
      desc: 'Bệnh nhân chuyển đi điều trị',
      icon: Hospital,
      color: 'from-blue-500 to-blue-700',
      shadow: 'shadow-blue-500/20',
      href: '/chuyen-vien'
    },
    {
      title: 'Lịch tiêm nhắc hẹn',
      value: stats.activeSchedules.toLocaleString(),
      desc: 'Kế hoạch vắc xin trong tuần',
      icon: CalendarDays,
      color: 'from-purple-500 to-purple-700',
      shadow: 'shadow-purple-500/20',
      href: '/cskh-tiem-chung'
    }
  ];

  const modules = [
    { name: 'Quản lý BHYT', href: '/bhyt', desc: 'Tra cứu, lọc hạn thẻ BHYT, nhắc gia hạn và import danh sách Excel.', icon: ShieldCheck, color: 'text-teal-600 bg-teal-50 border-teal-100' },
    { name: 'CSKH Chuyển viện', href: '/chuyen-vien', desc: 'Theo dõi tình trạng bệnh nhân chuyển tuyến, lưu trữ lịch sử liên hệ.', icon: Hospital, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { name: 'Báo cáo Số ca khám', href: '/bao-cao-ca-kham', desc: 'Bảng thống kê ca khám hàng ngày theo từng khoa phòng chuyên môn.', icon: ClipboardList, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { name: 'Kho Vật tư Y tế', href: '/kho/vtyt', desc: 'Quản lý xuất-nhập-tồn kho dược phẩm, vật tư y tế, hóa chất xét nghiệm.', icon: Package, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 to-slate-900 p-8 shadow-xl text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(20,184,166,0.25),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
            Phòng Khám Nhơn Tâm
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Chào mừng quay trở lại hệ thống quản lý!
          </h1>
          <p className="text-sm text-teal-100/80 leading-relaxed font-medium">
            Hệ thống Next.js thế hệ mới được tối ưu hóa cơ sở dữ liệu MongoDB tập trung,
            tự động đồng bộ và phục vụ công tác chăm sóc sức khỏe cộng đồng.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`block bg-white rounded-3xl border border-slate-200/80 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg ${card.shadow}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-slate-800 tracking-tight">{card.value}</span>
                <p className="mt-1 text-xs font-medium text-slate-500">{card.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Shortcuts and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-teal-600" />
              Truy cập nhanh Phân hệ
            </h3>
            <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
              Khởi chạy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.name}
                  href={mod.href}
                  className="group flex flex-col p-5 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-white hover:border-teal-400 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${mod.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-800 text-sm group-hover:text-teal-600 transition-colors">
                      {mod.name}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500 font-medium leading-relaxed flex-1">
                    {mod.desc}
                  </p>
                  <div className="mt-4 flex items-center text-xs font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    Mở phân hệ <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 text-lg border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-teal-600" />
              Lưu ý vận hành
            </h3>
            <div className="space-y-4 text-xs font-medium text-slate-600 leading-relaxed">
              <p>
                📌 <b>Cơ sở dữ liệu tập trung:</b> Hệ thống sử dụng cơ sở dữ liệu MongoDB Atlas dùng chung cho toàn phòng khám. Mọi thao tác cập nhật dữ liệu của bạn sẽ hiển thị ngay lập tức với các phòng ban liên quan.
              </p>
              <p>
                📁 <b>Đồng bộ danh sách:</b> Các tính năng import Excel cũ từ offline sẽ tự động chuẩn hóa dữ liệu, xóa dấu cách thừa, và tạo liên kết tự động.
              </p>
              <p>
                🔐 <b>Bảo mật thông tin:</b> Hãy đảm bảo đăng xuất khỏi tài khoản làm việc của mình khi kết thúc ca trực hoặc bàn giao máy tính.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-150 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phiên bản: 1.0.0 Next.js</span>
          </div>
        </div>
      </div>
    </div>
  );
}
