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
      color: 'text-teal-600 bg-teal-50/50 border-teal-100/50',
      href: '/bhyt'
    },
    {
      title: 'BHYT Đã hết hạn',
      value: stats.expiredBHYT.toLocaleString(),
      desc: 'Cần gọi điện tư vấn gia hạn',
      icon: TrendingUp,
      color: 'text-red-500 bg-red-50/50 border-red-100/50',
      href: '/bhyt?statusFilter=expired'
    },
    {
      title: 'CSKH Chuyển viện',
      value: stats.transfers.toLocaleString(),
      desc: 'Bệnh nhân chuyển đi điều trị',
      icon: Hospital,
      color: 'text-sky-600 bg-sky-50/50 border-sky-100/50',
      href: '/chuyen-vien'
    },
    {
      title: 'Lịch tiêm nhắc hẹn',
      value: stats.activeSchedules.toLocaleString(),
      desc: 'Kế hoạch vắc xin trong tuần',
      icon: CalendarDays,
      color: 'text-violet-600 bg-violet-50/50 border-violet-100/50',
      href: '/cskh-tiem-chung'
    }
  ];

  const modules = [
    { name: 'Quản lý BHYT', href: '/bhyt', desc: 'Tra cứu, lọc hạn thẻ BHYT, nhắc gia hạn và import danh sách Excel.', icon: ShieldCheck, color: 'text-teal-600 bg-teal-50/50 border-teal-100/50' },
    { name: 'CSKH Chuyển viện', href: '/chuyen-vien', desc: 'Theo dõi tình trạng bệnh nhân chuyển tuyến, lưu trữ lịch sử liên hệ.', icon: Hospital, color: 'text-sky-600 bg-sky-50/50 border-sky-100/50' },
    { name: 'Báo cáo Số ca khám', href: '/bao-cao-ca-kham', desc: 'Bảng thống kê ca khám hàng ngày theo từng khoa phòng chuyên môn.', icon: ClipboardList, color: 'text-amber-600 bg-amber-50/50 border-amber-100/50' },
    { name: 'Kho Vật tư Y tế', href: '/kho/vtyt', desc: 'Quản lý xuất-nhập-tồn kho dược phẩm, vật tư y tế, hóa chất xét nghiệm.', icon: Package, color: 'text-emerald-600 bg-emerald-50/50 border-emerald-100/50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="space-y-2.5 pb-2 border-b border-slate-200/50">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-600"></span>
          <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">
            Phòng Khám Đa Khoa Nhơn Tâm
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          Chào mừng quay trở lại hệ thống quản trị
        </h1>
        <p className="text-xs md:text-sm text-slate-500 max-w-3xl leading-relaxed font-medium">
          Hệ thống thế hệ mới được tối ưu hóa cơ sở dữ liệu MongoDB tập trung,
          tự động đồng bộ và phục vụ công tác chăm sóc sức khỏe cộng đồng.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="block bg-white rounded-2xl border border-slate-200/60 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-200 hover:-translate-y-[2px] hover:border-slate-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${card.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4 space-y-0.5">
                <span className="text-2xl font-bold text-slate-800 tracking-tight">{card.value}</span>
                <p className="text-[11px] font-medium text-slate-500">{card.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Shortcuts and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-teal-600" />
              Truy cập nhanh Phân hệ
            </h3>
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
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
                  className="group flex flex-col p-4 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-white hover:border-teal-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all duration-200 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg border ${mod.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-slate-800 text-sm group-hover:text-teal-600 transition-colors">
                      {mod.name}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs text-slate-500 font-medium leading-relaxed flex-1">
                    {mod.desc}
                  </p>
                  <div className="mt-3.5 flex items-center text-[10px] font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity gap-0.5">
                    Mở phân hệ <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <UserCheck className="h-4.5 w-4.5 text-teal-600" />
              Lưu ý vận hành
            </h3>
            <div className="space-y-3.5 text-xs font-medium text-slate-600 leading-relaxed">
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
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Phiên bản: 1.0.0 Next.js</span>
          </div>
        </div>
      </div>
    </div>
  );
}
