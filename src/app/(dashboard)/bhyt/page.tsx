'use client';

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Clock, Upload, Settings, Plus } from 'lucide-react';
import { BhytService, BhytCustomerData } from '@/services/BhytService';
import BhytDashboard from '@/components/bhyt/BhytDashboard';
import BhytCustomerTable from '@/components/bhyt/BhytCustomerTable';
import BhytCustomerModal from '@/components/bhyt/BhytCustomerModal';
import BhytRenewalList from '@/components/bhyt/BhytRenewalList';
import BhytImportExport from '@/components/bhyt/BhytImportExport';
import BhytSettings from '@/components/bhyt/BhytSettings';
import { getDaysRemaining } from '@/lib/utils';

export default function BhytPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<BhytCustomerData[]>([]);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Global search & filters
  const [q, setQ] = useState('');
  
  // Tab-specific filters (Customer tab)
  const [expiryFilter, setExpiryFilter] = useState('');
  const [workflowFilter, setWorkflowFilter] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  
  // Tab-specific filters (Renewal tab)
  const [renewalScope, setRenewalScope] = useState('priority');
  const [renewalWorkflow, setRenewalWorkflow] = useState('');
  const [renewalPhone, setRenewalPhone] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('days');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 100;

  // Stats & Dashboard
  const [stats, setStats] = useState({
    totalCustomers: 0,
    expiredCount: 0,
    due15Count: 0,
    due30Count: 0,
    activeCount: 0,
    unknownCount: 0,
    heroPriority: 0
  });
  const [upcoming, setUpcoming] = useState<BhytCustomerData[]>([]);

  // Modal editor
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<BhytCustomerData | null>(null);

  // System Settings
  const [appSettings, setAppSettings] = useState({
    clinicName: 'PHÒNG KHÁM ĐA KHOA NHƠN TÂM',
    clinicAddress: '469 Nguyễn Văn Tạo, X. Hiệp Phước, TP.HCM',
    clinicHotline: '0987 519 115 – 0817 617 341',
    messageTemplate: 'The BHYT cua QK [Ho_Ten] het han ngay [Ngay_Het_Han]. QK den Phong 3 cua PK trong gio HC de duoc gia han. LH 0987519115.'
  });

  // Load Settings from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nhontam_bhyt_settings');
    if (saved) {
      try {
        setAppSettings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const loadStats = async () => {
    try {
      const res = await BhytService.getStats();
      if (res.success) {
        setStats(res.stats);
        setUpcoming(res.upcoming || []);
      }
    } catch (e) {
      console.error('Lỗi load stats BHYT:', e);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const filters: any = {
        q,
        sortBy,
        sortDir,
        page,
        pageSize
      };

      if (activeTab === 'customers') {
        filters.statusFilter = expiryFilter;
        filters.workflowFilter = workflowFilter;
        filters.phoneFilter = phoneFilter;
      } else if (activeTab === 'renewals') {
        filters.statusFilter = renewalScope;
        filters.workflowFilter = renewalWorkflow;
        filters.phoneFilter = renewalPhone;
      }

      const res = await BhytService.getAll(filters);
      setCustomers(res.items || []);
      setTotalFiltered(res.pagination?.totalFiltered || 0);
      setTotalCount(res.pagination?.totalCustomers || 0);
    } catch (e) {
      console.error('Lỗi load danh sách BHYT:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    } else {
      loadCustomers();
    }
  }, [
    activeTab,
    q,
    expiryFilter,
    workflowFilter,
    phoneFilter,
    renewalScope,
    renewalWorkflow,
    renewalPhone,
    sortBy,
    sortDir,
    page
  ]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setQ('');
    setPage(1);
    setSortBy('days');
    setSortDir('asc');
  };

  // Sorting handler
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  // Clear filters
  const handleClearFilters = () => {
    setQ('');
    setExpiryFilter('');
    setWorkflowFilter('');
    setPhoneFilter('');
    setPage(1);
  };

  // Message template text compiler
  const compileMessage = (cust: BhytCustomerData) => {
    const days = getDaysRemaining(cust.expiry);
    const dayText = days === null ? 'chưa xác định' : days < 0 ? `đã quá hạn ${Math.abs(days)} ngày` : days === 0 ? 'hết hạn hôm nay' : `còn ${days} ngày`;
    return appSettings.messageTemplate
      .replaceAll('[Ho_Ten]', cust.name || '')
      .replaceAll('[Ngay_Het_Han]', cust.expiry || '')
      .replaceAll('{ten}', cust.name || '')
      .replaceAll('{han_the}', cust.expiry || '')
      .replaceAll('{so_ngay}', dayText)
      .replaceAll('{hotline}', appSettings.clinicHotline)
      .replaceAll('{dia_chi}', appSettings.clinicAddress);
  };

  // Actions
  const handleSendMessage = async (cust: BhytCustomerData) => {
    const compiled = compileMessage(cust);
    try {
      await navigator.clipboard.writeText(compiled);
      alert('Đã sao chép nội dung tin nhắn:\n\n' + compiled);
      
      // Auto workflow update
      if (cust.workflowStatus === 'Chưa liên hệ') {
        await BhytService.update(cust._id!, {
          workflowStatus: 'Đã gửi tin',
          callDate: new Date().toLocaleDateString('vi-VN')
        });
        loadCustomers();
      }
    } catch (e) {
      alert('Không thể tự động sao chép: ' + compiled);
    }
  };

  const handleCall = async (cust: BhytCustomerData) => {
    if (!cust.phone) {
      alert('Khách hàng chưa có số điện thoại.');
      return;
    }
    
    // Auto update workflow
    await BhytService.update(cust._id!, {
      workflowStatus: 'Đã gọi',
      callDate: new Date().toLocaleDateString('vi-VN')
    });
    
    window.location.href = `tel:${cust.phone}`;
    loadCustomers();
  };

  const handleEdit = (cust: BhytCustomerData) => {
    setEditingCustomer(cust);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Xóa khách hàng BHYT này khỏi cơ sở dữ liệu?')) {
      try {
        await BhytService.delete(id);
        loadCustomers();
      } catch (e: any) {
        alert('Lỗi xóa khách hàng: ' + e.message);
      }
    }
  };

  const handleSave = async (data: BhytCustomerData) => {
    try {
      if (data._id) {
        await BhytService.update(data._id, data);
      } else {
        await BhytService.create(data);
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
      loadCustomers();
    } catch (e: any) {
      alert('Lỗi lưu thông tin: ' + e.message);
    }
  };

  const handleCopyPriorityPhones = async () => {
    const phones = customers
      .map((c) => c.phone?.replace(/[^\d]/g, ''))
      .filter(Boolean);
    const unique = Array.from(new Set(phones));
    
    if (unique.length === 0) {
      alert('Không có số điện thoại nào trong danh sách.');
      return;
    }

    const text = unique.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      alert(`Đã sao chép ${unique.length} số điện thoại vào bộ nhớ tạm.`);
    } catch (e) {
      alert('Lỗi sao chép: ' + text);
    }
  };

  // Excel / Backup Import
  const handleImportExcel = async (items: any[], mode: 'replace' | 'append') => {
    try {
      if (mode === 'replace') {
        if (!confirm('Hành động này sẽ ghi đè và thay thế hoàn toàn danh sách hiện tại. Tiếp tục?')) {
          return;
        }
        // Endpoint supports replacement by doing clear + import
        const resClear = await fetch('/api/bhyt/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clearAll' })
        });
        await resClear.json();
      }
      const res = await BhytService.importExcel(items);
      alert(res.message);
      loadCustomers();
    } catch (e: any) {
      alert('Lỗi import dữ liệu: ' + e.message);
    }
  };

  const handleExportExcel = () => {
    // Relying on xlsx-js-style library (dynamic import triggered in Service/Page)
    import('xlsx-js-style').then(({ default: XLSX }) => {
      const headers = [
        'Họ và tên', 'Mã BHXH', 'CCCD', 'Ngày sinh', 'Giới tính', 'Nơi khai sinh', 'Nơi KCB ban đầu', 'Điện thoại', 'Hạn thẻ', 'Ghi chú', 'Trạng thái xử lý'
      ];
      const rows = customers.map((c) => [
        c.name, c.bhxh, c.cccd || '', c.dob || '', c.gender || '', c.birthPlace || '', c.kcb || '', c.phone || '', c.expiry || '', c.note || '', c.workflowStatus || 'Chưa liên hệ'
      ]);
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sach BHYT');
      XLSX.writeFile(workbook, `Danh_sach_BHYT_${new Date().toISOString().slice(0, 10)}.xlsx`);
    });
  };

  const handleExportCsv = () => {
    const csvContent = '\uFEFF' + [
      ['Ho va ten', 'Ma BHXH', 'CCCD', 'Ngay sinh', 'Gioi tinh', 'Noi khai sinh', 'Noi KCB ban dau', 'Dien thoai', 'Han the', 'Ghi chu', 'Trang thai xu ly'].join(','),
      ...customers.map(c => [
        `"${c.name}"`, `"${c.bhxh}"`, `"${c.cccd || ''}"`, `"${c.dob || ''}"`, `"${c.gender || ''}"`, `"${c.birthPlace || ''}"`, `"${c.kcb || ''}"`, `"${c.phone || ''}"`, `"${c.expiry || ''}"`, `"${c.note || ''}"`, `"${c.workflowStatus || 'Chưa liên hệ'}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DS_BHYT_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
  };

  const handleBackupJson = () => {
    const jsonStr = JSON.stringify(customers, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SaoLuu_BHYT_${new Date().toISOString().slice(0, 10)}.json`);
    link.click();
  };

  const handleResetData = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa sạch toàn bộ hồ sơ khách hàng BHYT trong database?')) {
      try {
        await fetch('/api/bhyt/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clearAll' })
        });
        alert('Đã reset toàn bộ cơ sở dữ liệu khách hàng BHYT thành công.');
        loadCustomers();
      } catch (e: any) {
        alert('Lỗi reset dữ liệu BHYT: ' + e.message);
      }
    }
  };

  const handleSaveSettings = (settings: any) => {
    setAppSettings(settings);
    localStorage.setItem('nhontam_bhyt_settings', JSON.stringify(settings));
    alert('Đã lưu thông tin đơn vị và mẫu tin nhắn nhắc gia hạn.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            🛡️ NHƠN TÂM BHYT CRM
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Ứng dụng chăm sóc và nhắc gia hạn thẻ BHYT của Phòng khám Đa khoa Nhơn Tâm
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-900/10 hover:bg-teal-500 transition-colors"
          >
            <Plus className="h-4 w-4" /> Thêm khách mới
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
          { id: 'customers', label: 'Khách hàng', icon: Users },
          { id: 'renewals', label: 'Nhắc gia hạn', icon: Clock },
          { id: 'import', label: 'Nhập / Xuất dữ liệu', icon: Upload },
          { id: 'settings', label: 'Cài đặt', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-colors shrink-0 ${
              activeTab === tab.id
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Tab Views */}
      <div className="relative">
        {activeTab === 'dashboard' && (
          <BhytDashboard
            stats={stats}
            upcoming={upcoming}
            onNavigateTab={handleTabChange}
          />
        )}

        {activeTab === 'customers' && (
          <BhytCustomerTable
            customers={customers}
            loading={loading}
            q={q}
            onSearchChange={setQ}
            expiryFilter={expiryFilter}
            onExpiryFilterChange={setExpiryFilter}
            workflowFilter={workflowFilter}
            onWorkflowFilterChange={setWorkflowFilter}
            phoneFilter={phoneFilter}
            onPhoneFilterChange={setPhoneFilter}
            onClearFilters={handleClearFilters}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            page={page}
            pageSize={pageSize}
            totalFiltered={totalFiltered}
            onPageChange={setPage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSendMessage={handleSendMessage}
            onCall={handleCall}
          />
        )}

        {activeTab === 'renewals' && (
          <BhytRenewalList
            customers={customers}
            loading={loading}
            q={q}
            onSearchChange={setQ}
            renewalScope={renewalScope}
            onScopeChange={setRenewalScope}
            workflowFilter={renewalWorkflow}
            onWorkflowFilterChange={setRenewalWorkflow}
            phoneFilter={renewalPhone}
            onPhoneFilterChange={setRenewalPhone}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            onCopyPhones={handleCopyPriorityPhones}
            onEdit={handleEdit}
            onSendMessage={handleSendMessage}
            onCall={handleCall}
          />
        )}

        {activeTab === 'import' && (
          <BhytImportExport
            onImportExcel={handleImportExcel}
            onExportExcel={handleExportExcel}
            onExportCsv={handleExportCsv}
            onBackupJson={handleBackupJson}
            onResetData={handleResetData}
            totalCustomers={totalCount}
          />
        )}

        {activeTab === 'settings' && (
          <BhytSettings
            initialSettings={appSettings}
            onSave={handleSaveSettings}
          />
        )}
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <BhytCustomerModal
          customer={editingCustomer}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCustomer(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
