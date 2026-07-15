'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Download,
  Upload,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  PhoneCall,
  Ambulance,
  Hospital
} from 'lucide-react';
import { PatientTransferService, PatientTransferData } from '@/services/PatientTransferService';
import TransferImportModal from '@/components/chuyen-vien/TransferImportModal';

// Dynamically import SheetJS for Excel Export
let XLSX: any = null;
if (typeof window !== 'undefined') {
  import('xlsx-js-style').then((module) => {
    XLSX = module.default || module;
  });
}

export default function PatientTransferPage() {
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [callFilter, setCallFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const [records, setRecords] = useState<PatientTransferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const saveTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await PatientTransferService.getAll({
        q,
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
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Lỗi kết nối cơ sở dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [q, statusFilter, callFilter, sortBy, sortDir, page, pageSize]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Ambulance className="h-7 w-7 text-blue-600" />
            CSKH CHUYỂN VIỆN
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Quản lý và chăm sóc bệnh nhân chuyển viện, theo dõi tình trạng tiếp nhận.
          </p>
        </div>
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
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã BN, SĐT, Nơi chuyển..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500">
            <option value="">Tất cả Trạng thái</option>
            <option value="Mới">Mới</option>
            <option value="Đang theo dõi">Đang theo dõi</option>
            <option value="Hoàn tất">Hoàn tất</option>
          </select>
          <select value={callFilter} onChange={(e) => setCallFilter(e.target.value)} className="text-sm rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500">
            <option value="">Kết quả Gọi</option>
            <option value="Chưa gọi">Chưa gọi</option>
            <option value="Đã gọi">Đã gọi</option>
            <option value="Không nghe máy">Không nghe máy</option>
          </select>
        </div>
        
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <span className="text-sm font-bold text-blue-600">Đã chọn {selectedIds.length} dòng:</span>
            <button onClick={() => updateSelectedCallStatus('Đã gọi')} className="px-3 py-1.5 text-xs font-bold bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Đánh dấu Đã gọi</button>
            <button onClick={() => updateSelectedCallStatus('Không nghe máy')} className="px-3 py-1.5 text-xs font-bold bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100">Đánh dấu Không nghe máy</button>
            <button onClick={deleteSelected} className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center gap-1"><Trash2 className="h-3 w-3"/> Xóa chọn</button>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wide flex items-center gap-2">
            <Hospital className="h-4 w-4 text-blue-500" /> DANH SÁCH CHUYỂN VIỆN
          </h3>
          <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full">
            {records.length} / {filteredCount}
          </span>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[64vh] relative scrollbar-thin scrollbar-thumb-slate-200">
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
                      <input type="date" value={r.date || ''} onChange={(e) => handleCellEdit(r._id as string, 'date', e.target.value)} className="w-full h-full text-center bg-transparent outline-none focus:bg-blue-50" />
                    </td>
                    <td className="border-r border-slate-100 p-0">
                      <input type="text" value={r.name || ''} onChange={(e) => handleCellEdit(r._id as string, 'name', e.target.value)} className="w-full h-full px-4 bg-transparent outline-none focus:bg-blue-50 font-bold text-slate-700" />
                    </td>
                    <td className="border-r border-slate-100 p-0">
                      <input type="text" value={r.phone || ''} onChange={(e) => handleCellEdit(r._id as string, 'phone', e.target.value)} className="w-full h-full text-center bg-transparent outline-none focus:bg-blue-50 text-blue-600 font-semibold" />
                    </td>
                    <td className="border-r border-slate-100 p-0">
                      <input type="text" value={r.patientCode || ''} onChange={(e) => handleCellEdit(r._id as string, 'patientCode', e.target.value)} className="w-full h-full text-center bg-transparent outline-none focus:bg-blue-50 font-medium text-slate-600" />
                    </td>
                    <td className="border-r border-slate-100 p-0">
                      <input type="text" value={r.destinationHospital || ''} onChange={(e) => handleCellEdit(r._id as string, 'destinationHospital', e.target.value)} className="w-full h-full px-4 bg-transparent outline-none focus:bg-blue-50 text-slate-700" />
                    </td>
                    <td className="border-r border-slate-100 p-0">
                      <input type="text" value={r.diagnosis || ''} onChange={(e) => handleCellEdit(r._id as string, 'diagnosis', e.target.value)} className="w-full h-full px-4 bg-transparent outline-none focus:bg-blue-50 text-slate-600" />
                    </td>
                    <td className="border-r border-slate-100 p-0">
                      <select value={r.status || 'Mới'} onChange={(e) => handleCellEdit(r._id as string, 'status', e.target.value)} className="w-full h-full text-center bg-transparent outline-none focus:bg-blue-50 font-semibold">
                        <option value="Mới">Mới</option>
                        <option value="Đang theo dõi">Đang theo dõi</option>
                        <option value="Hoàn tất">Hoàn tất</option>
                      </select>
                    </td>
                    <td className="border-r border-slate-100 p-0">
                      <select value={r.callResult || 'Chưa gọi'} onChange={(e) => handleCellEdit(r._id as string, 'callResult', e.target.value)} className={`w-full h-full text-center bg-transparent outline-none focus:bg-blue-50 font-bold ${r.callResult === 'Đã gọi' ? 'text-green-600' : r.callResult === 'Không nghe máy' ? 'text-orange-500' : 'text-slate-400'}`}>
                        <option value="Chưa gọi">Chưa gọi</option>
                        <option value="Đã gọi">Đã gọi</option>
                        <option value="Không nghe máy">Không nghe máy</option>
                        <option value="Sai số">Sai số</option>
                      </select>
                    </td>
                    <td className="border-r border-slate-100 p-0">
                      <input type="text" value={r.note || ''} onChange={(e) => handleCellEdit(r._id as string, 'note', e.target.value)} className="w-full h-full px-4 bg-transparent outline-none focus:bg-blue-50 text-slate-600 text-[11px]" />
                    </td>
                    <td className="text-center p-0">
                      <button onClick={() => deleteRecord(r._id as string)} className="w-full h-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
      
      {showImportModal && <TransferImportModal onClose={() => setShowImportModal(false)} onImportSuccess={fetchRecords} />}
    </div>
  );
}
