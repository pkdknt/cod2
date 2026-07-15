'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Download,
  Upload,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Ambulance,
  Hospital,
  BarChart2,
  Settings,
  Calendar
} from 'lucide-react';
import { PatientTransferService, PatientTransferData } from '@/services/PatientTransferService';
import TransferImportModal from '@/components/chuyen-vien/TransferImportModal';
import TransferReport from '@/components/chuyen-vien/TransferReport';
import TransferSettings from '@/components/chuyen-vien/TransferSettings';

// Dynamically import SheetJS for Excel Export
let XLSX: any = null;
if (typeof window !== 'undefined') {
  import('xlsx-js-style').then((module) => {
    XLSX = module.default || module;
  });
}

const SAMPLE_RECORDS: PatientTransferData[] = [
  {
    date: '2026-01-02',
    admissionNo: '2026-097107',
    patientCode: '0201260039',
    cccd: '089062003275',
    birthDate: '14/06/1962',
    name: 'NGUYỄN VĂN TẢI',
    gender: 'Nam',
    age: 64,
    address: 'ẤP ĐÁ BẠC, XÃ ĐÁ BẠC, TỈNH CÀ MAU',
    phone: '0354049916',
    bhyt: 'Có',
    bhytNo: 'AK2969621697605',
    bhytExpiry: '2028-12-31',
    destinationHospital: 'Bệnh viện Chợ Rẫy',
    diagnosis: 'Đột quỵ, không xác định do xuất huyết hay nhồi máu ( Tai biến mạch máu não ) ( I64 )',
    treatment: 'Khám Nội tổng hợp, Xe cấp cứu vận chuyển bệnh nhân',
    clinic: 'Phòng khám BHYT 04',
    doctor: 'Bs. Phạm Văn Thức',
    callDate: '',
    callResult: 'Chưa gọi',
    status: 'Mới',
    vip: 'Không',
    note: ''
  },
  {
    date: '2026-01-02',
    admissionNo: '2026-097006',
    patientCode: '0201260024',
    cccd: '079095019345',
    birthDate: '12/04/1995',
    name: 'TRƯƠNG THANH TÚ',
    gender: 'Nam',
    age: 31,
    address: '1/10 ẤP 13, XÃ HIỆP PHƯỚC, TP.HCM',
    phone: '0932127323',
    bhyt: 'Có',
    bhytNo: 'GD4797936303921',
    bhytExpiry: '2026-11-30',
    destinationHospital: 'Bệnh viện Nhân Dân 115',
    diagnosis: 'Các viêm khớp khác ( M13 ) - td viêm khớp nhiễm trùng',
    treatment: 'Khám Nội tổng hợp, Siêu âm khớp gối',
    clinic: 'Phòng khám BHYT 02',
    doctor: 'Bs.CK1 Nguyễn Thị Hiền',
    callDate: '',
    callResult: 'Chưa gọi',
    status: 'Mới',
    vip: 'Không',
    note: ''
  }
];

export default function PatientTransferPage() {
  const [activeTab, setActiveTab] = useState('list');
  const [q, setQ] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [callFilter, setCallFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const [records, setRecords] = useState<PatientTransferData[]>([]);
  const [allReportRecords, setAllReportRecords] = useState<PatientTransferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const saveTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const [appSettings, setAppSettings] = useState({
    appTitle: 'CSKH CHUYỂN VIỆN - Nhơn Tâm',
    clinicName: 'PHÒNG KHÁM ĐA KHOA NHƠN TÂM',
    owner: 'Tổ CSKH Chuyển Tuyến'
  });

  // Load Settings on Mount
  useEffect(() => {
    const saved = localStorage.getItem('nhontam_transfer_settings');
    if (saved) {
      try {
        setAppSettings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await PatientTransferService.getAll({
        q,
        fromDate,
        toDate,
        statusFilter,
        callFilter,
        sortBy,
        sortDir,
        page,
        pageSize
      });
      setRecords(data.items || []);
      setFilteredCount(data.pagination?.totalFiltered || 0);
      setTotalCount(data.pagination?.totalItems || 0);

      // Load all records for tab report without pagination
      if (activeTab === 'report') {
        const fullData = await PatientTransferService.getAll({
          pageSize: 2000
        });
        setAllReportRecords(fullData.items || []);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Lỗi kết nối cơ sở dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [activeTab, q, fromDate, toDate, statusFilter, callFilter, sortBy, sortDir, page, pageSize]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const renderSortIcon = (key: string) => {
    if (sortBy !== key) {
      return <ArrowUpDown className="inline-block ml-1 h-3 w-3 opacity-40 text-slate-400" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="inline-block ml-1 h-3 w-3 text-blue-600 font-bold" />
    ) : (
      <ArrowDown className="inline-block ml-1 h-3 w-3 text-blue-600 font-bold" />
    );
  };

  const handleCellEdit = (id: string, field: string, value: string) => {
    setRecords((prev) => prev.map((r) => (r._id === id ? { ...r, [field]: value } : r)));
    
    const timerKey = `${id}-${field}`;
    if (saveTimeoutRef.current[timerKey]) {
      clearTimeout(saveTimeoutRef.current[timerKey]);
    }

    saveTimeoutRef.current[timerKey] = setTimeout(async () => {
      try {
        await PatientTransferService.update(id, { [field]: value });
      } catch (err: any) {
        console.error('Autosave error:', err);
      }
    }, 1500);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(records.map((r) => r._id as string).filter(Boolean));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const deleteSelected = async () => {
    if (confirm(`Bạn có chắc muốn xóa ${selectedIds.length} hồ sơ đã chọn?`)) {
      try {
        const res = await PatientTransferService.bulkDelete(selectedIds);
        alert(res.message);
        setSelectedIds([]);
        fetchRecords();
      } catch (e: any) {
        alert('Lỗi xóa: ' + e.message);
      }
    }
  };

  const deleteFiltered = async () => {
    const ids = records.map((r) => r._id as string).filter(Boolean);
    if (ids.length === 0) {
      alert('Không có dòng nào để xóa.');
      return;
    }
    if (confirm(`CẢNH BÁO: Bạn sắp xóa toàn bộ ${ids.length} dòng đang được lọc hiển thị. Tiếp tục?`)) {
      try {
        const res = await PatientTransferService.bulkDelete(ids);
        alert(res.message);
        fetchRecords();
      } catch (e: any) {
        alert('Lỗi xóa: ' + e.message);
      }
    }
  };

  const updateSelectedCallStatus = async (status: string) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await PatientTransferService.bulkUpdateCall(selectedIds, status);
      alert(res.message);
      setSelectedIds([]);
      fetchRecords();
    } catch (e: any) {
      alert('Lỗi cập nhật: ' + e.message);
    }
  };

  const deleteRecord = async (id: string) => {
    if (confirm('Xóa hồ sơ chuyển viện này?')) {
      try {
        await PatientTransferService.delete(id);
        fetchRecords();
      } catch (e: any) {
        alert('Lỗi xóa: ' + e.message);
      }
    }
  };

  const addNewRow = async () => {
    try {
      const res = await PatientTransferService.create({ name: 'Bệnh nhân mới', date: new Date().toISOString().slice(0, 10), status: 'Mới', callResult: 'Chưa gọi' });
      if (res.success) {
        fetchRecords();
      }
    } catch (e: any) {
      alert('Lỗi tạo mới: ' + e.message);
    }
  };

  const addSampleRows = async () => {
    try {
      for (const item of SAMPLE_RECORDS) {
        await PatientTransferService.create(item);
      }
      alert('Đã thêm 2 dòng dữ liệu mẫu thành công.');
      fetchRecords();
    } catch (e: any) {
      alert('Lỗi tạo mẫu: ' + e.message);
    }
  };

  const handleClearFilters = () => {
    setQ('');
    setFromDate('');
    setToDate('');
    setStatusFilter('');
    setCallFilter('');
  };

  const exportToExcel = () => {
    if (!XLSX) {
      alert('Thư viện Excel đang tải, vui lòng thử lại sau');
      return;
    }
    if (records.length === 0) {
      alert('Danh sách rỗng');
      return;
    }

    const headers = [
      'STT', 'Ngày chuyển', 'Họ Tên', 'SĐT', 'Mã BN', 'Nơi chuyển đến', 'Chẩn đoán', 'Hướng điều trị', 'Trạng thái', 'KQ Gọi', 'Ngày Gọi', 'Ghi chú'
    ];

    const rows = records.map((r, i) => [
      i + 1, r.date || '', r.name || '', r.phone || '', r.patientCode || '', r.destinationHospital || '', r.diagnosis || '', r.treatment || '', r.status || '', r.callResult || '', r.callDate || '', r.note || ''
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([['DANH SÁCH BỆNH NHÂN CHUYỂN VIỆN'], [], headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Chuyen Vien');
    XLSX.writeFile(workbook, `DS_ChuyenVien_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleSaveSettings = (settings: any) => {
    setAppSettings(settings);
    localStorage.setItem('nhontam_transfer_settings', JSON.stringify(settings));
    alert('Đã lưu cài đặt phân hệ Chuyển Viện.');
  };

  const handleResetAllData = async () => {
    if (confirm('CẢNH BÁO: Hành động này xóa sạch toàn bộ bệnh nhân chuyển tuyến trong database! Bạn chắc chắn tiếp tục?')) {
      try {
        const ids = records.map(r => r._id as string).filter(Boolean);
        if (ids.length > 0) {
          await PatientTransferService.bulkDelete(ids);
        }
        alert('Đã reset toàn bộ dữ liệu CSKH Chuyển Viện.');
        fetchRecords();
      } catch (e: any) {
        alert('Lỗi: ' + e.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Brand & Page Head */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Ambulance className="h-7 w-7 text-blue-600" />
            {appSettings.appTitle}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {appSettings.clinicName} · Phụ trách: {appSettings.owner}
          </p>
        </div>
        
        {activeTab === 'list' && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowImportModal(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all">
              <Upload className="h-4 w-4" /> Nhập Excel
            </button>
            <button onClick={addNewRow} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-all">
              <Plus className="h-4 w-4" /> Thêm bệnh nhân
            </button>
            <button onClick={exportToExcel} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all">
              <Download className="h-4 w-4" /> Xuất Excel
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'list', label: 'Nhập & Danh sách', icon: Hospital },
          { id: 'report', label: 'Báo cáo thống kê', icon: BarChart2 },
          { id: 'settings', label: 'Cài đặt', icon: Settings }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-xs transition-colors shrink-0 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'list' && (
        <>
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-center">
            <div className="relative col-span-1 md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, mã BN, SĐT, Nơi chuyển..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full pl-9 pr-2 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                placeholder="Từ ngày"
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full pl-9 pr-2 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                placeholder="Đến ngày"
              />
            </div>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 bg-white font-semibold text-slate-700">
              <option value="">Trạng thái</option>
              <option value="Mới">Mới</option>
              <option value="Đang theo dõi">Đang theo dõi</option>
              <option value="Hoàn tất">Hoàn tất</option>
            </select>

            <select value={callFilter} onChange={(e) => setCallFilter(e.target.value)} className="text-xs rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 bg-white font-semibold text-slate-700">
              <option value="">KQ Gọi</option>
              <option value="Chưa gọi">Chưa gọi</option>
              <option value="Đã gọi">Đã gọi</option>
              <option value="Không nghe máy">Không nghe máy</option>
            </select>
          </div>

          {/* Quick task action bar */}
          <div className="flex justify-between items-center bg-slate-100 p-3.5 rounded-2xl border border-slate-200 gap-3 flex-wrap">
            <div className="flex gap-2">
              <button onClick={addSampleRows} className="bg-white border border-slate-200 hover:bg-slate-50 font-bold px-3 py-1.5 rounded-lg text-xs text-slate-700">
                Thêm dòng mẫu
              </button>
              <button onClick={handleClearFilters} className="bg-white border border-slate-200 hover:bg-slate-50 font-bold px-3 py-1.5 rounded-lg text-xs text-slate-700">
                Xóa lọc
              </button>
              <button onClick={deleteFiltered} className="bg-red-50 border border-red-200 hover:bg-red-100 font-bold px-3 py-1.5 rounded-lg text-xs text-red-700">
                Xóa các dòng đang lọc
              </button>
            </div>
            
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-blue-600">Đã chọn {selectedIds.length} dòng:</span>
                <button onClick={() => updateSelectedCallStatus('Đã gọi')} className="px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Đã gọi</button>
                <button onClick={() => updateSelectedCallStatus('Không nghe máy')} className="px-3 py-1.5 text-xs font-bold bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100">Không nghe máy</button>
                <button onClick={deleteSelected} className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center gap-1"><Trash2 className="h-3 w-3"/> Xóa</button>
              </div>
            )}
          </div>

          {/* Data spreadsheet grid */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-sm tracking-wide flex items-center gap-2">
                <Hospital className="h-4 w-4 text-blue-500" /> DANH SÁCH CHUYỂN VIỆN
              </h3>
              <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full">
                {records.length} / {filteredCount}
              </span>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[60vh] relative scrollbar-thin">
              <table className="table-fixed w-max min-w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-blue-50/50 border-b border-slate-200 text-blue-800 text-[10px] font-bold uppercase tracking-wider h-11">
                    <th className="w-12 text-center sticky left-0 z-30 bg-blue-50 border-r border-slate-200">
                      <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length > 0 && selectedIds.length === records.length} />
                    </th>
                    <th className="w-14 text-center border-r border-slate-200">STT</th>
                    <th className="w-28 text-center border-r border-slate-200 cursor-pointer hover:bg-blue-100/50" onClick={() => handleSort('date')}>Ngày CV {renderSortIcon('date')}</th>
                    <th className="w-48 text-left border-r border-slate-200 pl-4 cursor-pointer hover:bg-blue-100/50" onClick={() => handleSort('name')}>Họ và tên {renderSortIcon('name')}</th>
                    <th className="w-28 text-center border-r border-slate-200 cursor-pointer hover:bg-blue-100/50" onClick={() => handleSort('phone')}>Điện thoại {renderSortIcon('phone')}</th>
                    <th className="w-32 text-center border-r border-slate-200 cursor-pointer hover:bg-blue-100/50" onClick={() => handleSort('patientCode')}>Mã BN {renderSortIcon('patientCode')}</th>
                    <th className="w-48 text-left border-r border-slate-200 pl-4 cursor-pointer hover:bg-blue-100/50" onClick={() => handleSort('destinationHospital')}>Nơi chuyển đến {renderSortIcon('destinationHospital')}</th>
                    <th className="w-48 text-left border-r border-slate-200 pl-4">Chẩn đoán</th>
                    <th className="w-32 text-center border-r border-slate-200">Trạng thái</th>
                    <th className="w-32 text-center border-r border-slate-200 cursor-pointer hover:bg-blue-100/50" onClick={() => handleSort('callResult')}>KQ Gọi {renderSortIcon('callResult')}</th>
                    <th className="w-48 text-left border-r border-slate-200 pl-4">Ghi chú</th>
                    <th className="w-16 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={12} className="text-center py-20 text-slate-500 font-bold">Đang tải dữ liệu...</td></tr>
                  ) : records.length === 0 ? (
                    <tr><td colSpan={12} className="text-center py-20 text-slate-400 font-bold">Không có dữ liệu</td></tr>
                  ) : (
                    records.map((r, index) => (
                      <tr key={r._id} className="border-b border-slate-100 h-9 hover:bg-blue-50/30 transition-colors">
                        <td className="sticky left-0 bg-white border-r border-slate-100 z-10 text-center">
                          <input type="checkbox" checked={selectedIds.includes(r._id as string)} onChange={(e) => handleSelectRow(r._id as string, e.target.checked)} />
                        </td>
                        <td className="text-center text-slate-500 font-medium border-r border-slate-100">{index + 1 + (page - 1) * pageSize}</td>
                        <td className="border-r border-slate-100 p-0">
                          <input type="date" value={r.date || ''} onChange={(e) => handleCellEdit(r._id as string, 'date', e.target.value)} className="w-full h-full text-center bg-transparent border-0 outline-none focus:bg-blue-50" />
                        </td>
                        <td className="border-r border-slate-100 p-0 font-bold text-slate-800">
                          <input type="text" value={r.name || ''} onChange={(e) => handleCellEdit(r._id as string, 'name', e.target.value)} className="w-full h-full px-4 bg-transparent border-0 outline-none focus:bg-blue-50" />
                        </td>
                        <td className="border-r border-slate-100 p-0 text-blue-600 font-bold text-center">
                          <input type="text" value={r.phone || ''} onChange={(e) => handleCellEdit(r._id as string, 'phone', e.target.value)} className="w-full h-full text-center bg-transparent border-0 outline-none focus:bg-blue-50" />
                        </td>
                        <td className="border-r border-slate-100 p-0 text-center">
                          <input type="text" value={r.patientCode || ''} onChange={(e) => handleCellEdit(r._id as string, 'patientCode', e.target.value)} className="w-full h-full text-center bg-transparent border-0 outline-none focus:bg-blue-50" />
                        </td>
                        <td className="border-r border-slate-100 p-0 text-slate-700">
                          <input type="text" value={r.destinationHospital || ''} onChange={(e) => handleCellEdit(r._id as string, 'destinationHospital', e.target.value)} className="w-full h-full px-4 bg-transparent border-0 outline-none focus:bg-blue-50" />
                        </td>
                        <td className="border-r border-slate-100 p-0 text-slate-600">
                          <input type="text" value={r.diagnosis || ''} onChange={(e) => handleCellEdit(r._id as string, 'diagnosis', e.target.value)} className="w-full h-full px-4 bg-transparent border-0 outline-none focus:bg-blue-50" />
                        </td>
                        <td className="border-r border-slate-100 p-0 text-center font-bold">
                          <select value={r.status || 'Mới'} onChange={(e) => handleCellEdit(r._id as string, 'status', e.target.value)} className="w-full h-full bg-transparent border-0 outline-none text-center focus:bg-blue-50">
                            <option value="Mới">Mới</option>
                            <option value="Đang theo dõi">Đang theo dõi</option>
                            <option value="Hoàn tất">Hoàn tất</option>
                          </select>
                        </td>
                        <td className="border-r border-slate-100 p-0 text-center font-bold">
                          <select value={r.callResult || 'Chưa gọi'} onChange={(e) => handleCellEdit(r._id as string, 'callResult', e.target.value)} className={`w-full h-full bg-transparent border-0 outline-none text-center focus:bg-blue-50 ${r.callResult === 'Đã gọi' || r.callResult === 'Đã nhập viện' ? 'text-green-600' : r.callResult === 'Không nghe máy' ? 'text-orange-500' : 'text-slate-500'}`}>
                            <option value="Chưa gọi">Chưa gọi</option>
                            <option value="Đã gọi">Đã gọi</option>
                            <option value="Không nghe máy">Không nghe máy</option>
                            <option value="Sai số">Sai số</option>
                            <option value="Đã tư vấn">Đã tư vấn</option>
                            <option value="Đã nhập viện">Đã nhập viện</option>
                            <option value="Không nhập viện">Không nhập viện</option>
                            <option value="Hẹn gọi lại">Hẹn gọi lại</option>
                          </select>
                        </td>
                        <td className="border-r border-slate-100 p-0 text-slate-500">
                          <input type="text" value={r.note || ''} onChange={(e) => handleCellEdit(r._id as string, 'note', e.target.value)} className="w-full h-full px-4 bg-transparent border-0 outline-none focus:bg-blue-50" />
                        </td>
                        <td className="text-center p-0">
                          <button onClick={() => deleteRecord(r._id as string)} className="w-full h-full flex items-center justify-center text-red-400 hover:text-red-650 hover:bg-red-50 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'report' && (
        <TransferReport records={allReportRecords} />
      )}

      {activeTab === 'settings' && (
        <TransferSettings
          initialSettings={appSettings}
          onSave={handleSaveSettings}
          onResetData={handleResetAllData}
        />
      )}

      {showImportModal && <TransferImportModal onClose={() => setShowImportModal(false)} onImportSuccess={fetchRecords} />}
    </div>
  );
}
