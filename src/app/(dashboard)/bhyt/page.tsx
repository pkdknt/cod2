'use strict';
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
  Trash,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { getDaysRemaining } from '@/lib/utils';
import { BhytService, BhytCustomerData } from '@/services/BhytService';
import BhytStats from '@/components/bhyt/BhytStats';
import BhytFilterBar from '@/components/bhyt/BhytFilterBar';
import BhytEntryForm from '@/components/bhyt/BhytEntryForm';

// Dynamic import for client-side SheetJS to prevent next build SSR warning
let XLSX: any = null;
if (typeof window !== 'undefined') {
  import('xlsx-js-style').then((module) => {
    XLSX = module.default || module;
  });
}

export default function BhytPage() {
  // Filters & State
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [callFilter, setCallFilter] = useState('');
  const [renewFilter, setRenewFilter] = useState('');
  const [sortBy, setSortBy] = useState('days');
  const [pageSize, setPageSize] = useState(100);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortKey === key && sortDirection === 'asc') {
      direction = 'desc';
    }
    setSortKey(key);
    setSortDirection(direction);
  };

  const renderSortIcon = (key: string) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="inline-block ml-1 h-3 w-3 opacity-40 text-slate-400 group-hover:opacity-100 transition-opacity" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="inline-block ml-1 h-3 w-3 text-teal-600 font-bold" />;
    }
    return <ArrowDown className="inline-block ml-1 h-3 w-3 text-teal-600 font-bold" />;
  };

  const [customers, setCustomers] = useState<BhytCustomerData[]>([]);
  const sortedCustomers = useMemo(() => {
    if (!sortKey) return customers;
    
    return [...customers].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortKey === 'name') {
        aVal = a.name || '';
        bVal = b.name || '';
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal, 'vi', { sensitivity: 'accent' }) 
          : bVal.localeCompare(aVal, 'vi', { sensitivity: 'accent' });
      } else if (sortKey === 'bhxh') {
        aVal = a.bhxh || '';
        bVal = b.bhxh || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortKey === 'cccd') {
        aVal = a.cccd || '';
        bVal = b.cccd || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortKey === 'dob') {
        aVal = a.dob || '';
        bVal = b.dob || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortKey === 'gender') {
        aVal = a.gender || '';
        bVal = b.gender || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortKey === 'birthPlace') {
        aVal = a.birthPlace || '';
        bVal = b.birthPlace || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortKey === 'kcb') {
        aVal = a.kcb || '';
        bVal = b.kcb || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortKey === 'phone') {
        aVal = a.phone || '';
        bVal = b.phone || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortKey === 'expiry') {
        aVal = a.expiry || '';
        bVal = b.expiry || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortKey === 'daysRemaining') {
        const aRem = getDaysRemaining(a.expiry) ?? 9999;
        const bRem = getDaysRemaining(b.expiry) ?? 9999;
        return sortDirection === 'asc' ? aRem - bRem : bRem - aRem;
      } else if (sortKey === 'amount') {
        aVal = parseFloat(String(a.amount || '0').replace(/[^0-9.-]+/g, '')) || 0;
        bVal = parseFloat(String(b.amount || '0').replace(/[^0-9.-]+/g, '')) || 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      } else if (sortKey === 'months') {
        aVal = parseInt(a.months || '0', 10) || 0;
        bVal = parseInt(b.months || '0', 10) || 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      } else if (sortKey === 'renewType') {
        aVal = a.renewType || '';
        bVal = b.renewType || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortKey === 'contactStatus') {
        aVal = a.contactStatus || '';
        bVal = b.contactStatus || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });
  }, [customers, sortKey, sortDirection]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    expiredCount: 0,
    count30: 0,
    count60: 0,
    count90: 0,
    needCallCount: 0,
    missingCount: 0,
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  // Manual Form Fields
  const initialFormState: BhytCustomerData = {
    name: '',
    bhxh: '',
    cccd: '',
    dob: '',
    gender: '',
    birthPlace: '',
    kcb: '',
    receiptDate: '',
    receiptNo: '',
    amount: '',
    support: '',
    months: '',
    staffCode: '',
    phone: '',
    expiry: '',
    needCall: 'Có',
    renewType: '',
    callDate: '',
    relation: '',
    note: '',
    contactStatus: 'Chưa liên hệ',
  };

  const [manualForm, setManualForm] = useState<BhytCustomerData>(initialFormState);

  // Excel Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [sheetsList, setSheetsList] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Auto-save debounce store
  const saveTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await BhytService.getAll({
        q,
        statusFilter,
        callFilter,
        renewFilter,
        sortBy,
        page,
        pageSize
      });
      
      setCustomers(data.items || []);
      setFilteredCount(data.pagination?.totalFiltered || 0);
      setTotalCount(data.pagination?.totalCustomers || 0);
      if (data.stats) setStats(data.stats);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Không thể kết nối đến cơ sở dữ liệu MongoDB Atlas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [q, statusFilter, callFilter, renewFilter, sortBy, page, pageSize]);

  // Debounced auto-save cell edit helper
  const handleCellEdit = (customerId: string, field: string, value: string) => {
    // Optimistic UI update
    setCustomers((prev) =>
      prev.map((c) => (c._id === customerId ? { ...c, [field]: value } : c))
    );

    // Clear existing timer if any for this customer+field combo
    const timerKey = `${customerId}-${field}`;
    if (saveTimeoutRef.current[timerKey]) {
      clearTimeout(saveTimeoutRef.current[timerKey]);
    }

    // Set new timer (autosave after 2 seconds of inactivity)
    saveTimeoutRef.current[timerKey] = setTimeout(async () => {
      try {
        await BhytService.update(customerId, { [field]: value });
        // Refresh counts if expiry date is changed
        if (field === 'expiry') {
          fetchCustomers();
        }
      } catch (err: any) {
        console.error('Autosave error:', err);
      }
    }, 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await BhytService.update(editingId, manualForm);
        alert('Cập nhật thông tin khách hàng BHYT thành công');
      } else {
        await BhytService.create(manualForm);
        alert('Ghi nhận khách hàng BHYT mới thành công');
      }
      handleFormReset();
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu thông tin');
    }
  };

  const handleFormReset = () => {
    setManualForm(initialFormState);
    setEditingId(null);
  };

  const handleLoadToEdit = (customer: BhytCustomerData) => {
    setManualForm(customer);
    setEditingId(customer._id || null);
    setShowManualForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportStatus('Đang đọc file...');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        if (!XLSX) return;
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        setSheetsList(workbook.SheetNames);
        setSelectedSheet(workbook.SheetNames[0] || '');
        setImportStatus('Đọc file thành công. Hãy chọn sheet để nhập.');
      } catch (err: any) {
        setImportStatus('Lỗi đọc file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const triggerImport = async () => {
    if (!importFile || !selectedSheet) {
      alert('Vui lòng chọn file và sheet');
      return;
    }
    setIsImporting(true);
    setImportStatus('Đang phân tích và tải lên database...');
    try {
      if (!XLSX) throw new Error('Thư viện Excel chưa được tải');
      
      const fileData = await importFile.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' });
      const sheet = workbook.Sheets[selectedSheet];
      const json = XLSX.utils.sheet_to_json(sheet) as any[];

      // Map columns intelligently based on aliases from the template
      const mappedItems = json.map((row: any) => {
        const findVal = (keys: string[]) => {
          const matchKey = Object.keys(row).find((k) =>
            keys.includes(k.trim().toLowerCase())
          );
          return matchKey ? String(row[matchKey]).trim() : '';
        };

        return {
          name: findVal(['họ tên', 'ho ten', 'tên', 'ten', 'name', 'ho_ten']),
          bhxh: findVal(['mã số bhxh', 'bhxh', 'ma bhxh', 'số thẻ bhyt', 'so the bhyt', 'ma_so_bhxh']),
          cccd: findVal(['cccd', 'cmt', 'số cmt', 'so_cccd']),
          dob: findVal(['ngày sinh', 'ngay sinh', 'birth', 'dob', 'sinh', 'ngay_sinh']),
          gender: findVal(['giới tính', 'gioi tinh', 'gender', 'sex', 'gioi_tinh']),
          birthPlace: findVal(['nơi đăng ký giấy khai sinh', 'khai sinh', 'noi_sinh', 'birthplace']),
          kcb: findVal(['kcb', 'nơi đăng ký kcb', 'kcb ban đầu', 'noi_kcb']),
          receiptDate: findVal(['ngày biên lai', 'ngay_bien_lai']),
          receiptNo: findVal(['số biên lai', 'so_bien_lai']),
          amount: findVal(['số tiền đóng', 'so_tien_dong', 'so_tien']),
          support: findVal(['hỗ trợ thêm', 'ho_tro']),
          months: findVal(['số tháng', 'so_thang']),
          staffCode: findVal(['mã nv thu', 'ma_nv']),
          phone: findVal(['điện thoại', 'dien thoai', 'sđt', 'phone', 'dien_thoai']),
          expiry: findVal(['hạn thẻ đến ngày', 'han the', 'han_the', 'expiry']),
          needCall: findVal(['cần gọi', 'can_goi']) || 'Có',
          renewType: findVal(['gia hạn', 'gia_han', 'trạng thái gia hạn']),
          callDate: findVal(['ngày gọi', 'ngay_goi']),
          relation: findVal(['người quen', 'quan_he']),
          note: findVal(['ghi chú', 'ghi_chu', 'note']),
          contactStatus: findVal(['trạng thái liên hệ', 'lien_he']) || 'Chưa liên hệ',
        };
      });

      // Filter rows with missing name/bhxh
      const validItems = mappedItems.filter((item) => item.name && item.bhxh);
      if (validItems.length === 0) {
        throw new Error('Không tìm thấy dòng dữ liệu hợp lệ nào chứa đầy đủ Họ tên và Mã BHXH');
      }

      setImportStatus(`Đang upload ${validItems.length} dòng dữ liệu...`);

      const result = await BhytService.importExcel(validItems);
      alert(result.message);
      setShowImportModal(false);
      setImportFile(null);
      setSheetsList([]);
      fetchCustomers();
    } catch (err: any) {
      setImportStatus('Lỗi import: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  // Export to Excel function using client-side SheetJS
  const exportToExcel = () => {
    if (!XLSX) {
      alert('Thư viện Excel đang tải, vui lòng thử lại sau');
      return;
    }
    if (customers.length === 0) {
      alert('Danh sách rỗng, không thể xuất file');
      return;
    }

    const headers = [
      'STT',
      'Họ và tên',
      'Mã BHXH',
      'CCCD',
      'Ngày sinh',
      'Giới tính',
      'Nơi khai sinh',
      'Nơi KCB ban đầu',
      'Ngày biên lai',
      'Số biên lai',
      'Số tiền',
      'Hỗ trợ',
      'Số tháng',
      'Mã NV',
      'Điện thoại',
      'Hạn thẻ',
      'Cần gọi',
      'Gia hạn',
      'Ngày gọi',
      'Người quen',
      'Ghi chú',
      'Trạng thái liên hệ'
    ];

    const rows = customers.map((c, index) => [
      index + 1,
      c.name,
      c.bhxh,
      c.cccd || '',
      c.dob || '',
      c.gender || '',
      c.birthPlace || '',
      c.kcb || '',
      c.receiptDate || '',
      c.receiptNo || '',
      c.amount || '',
      c.support || '',
      c.months || '',
      c.staffCode || '',
      c.phone || '',
      c.expiry || '',
      c.needCall || '',
      c.renewType || '',
      c.callDate || '',
      c.relation || '',
      c.note || '',
      c.contactStatus || ''
    ]);

    const aoa = [
      ['DANH SÁCH KHÁCH HÀNG BẢO HIỂM Y TẾ'],
      [],
      headers,
      ...rows
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    // Merge A1 to V1
    worksheet['!merges'] = [
      { s: { c: 0, r: 0 }, e: { c: 21, r: 0 } }
    ];

    // Set row heights
    worksheet['!rows'] = [
      { hpt: 30 },
      { hpt: 15 },
      { hpt: 22 }
    ];

    // Style all cells in the sheet with borders, fonts, alignments, and fills
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
        
        if (!worksheet[cell_ref]) {
          worksheet[cell_ref] = { t: 'z', v: '' };
        }

        if (R === 0) {
          worksheet[cell_ref].s = {
            font: {
              name: 'Arial',
              sz: 14,
              bold: true,
              color: { rgb: '0F766E' }
            },
            alignment: {
              horizontal: 'center',
              vertical: 'center'
            }
          };
          continue;
        }

        if (R === 1) {
          continue;
        }

        if (R === 2) {
          worksheet[cell_ref].s = {
            border: {
              top: { style: 'thin', color: { rgb: 'A0A0A0' } },
              bottom: { style: 'thin', color: { rgb: 'A0A0A0' } },
              left: { style: 'thin', color: { rgb: 'A0A0A0' } },
              right: { style: 'thin', color: { rgb: 'A0A0A0' } }
            },
            font: {
              name: 'Arial',
              sz: 10,
              bold: true
            },
            alignment: {
              horizontal: 'center',
              vertical: 'center'
            },
            fill: {
              fgColor: { rgb: 'F2F2F2' }
            }
          };
          continue;
        }

        // Alignments for columns: center for STT (0), BHXH (2), CCCD (3), dob (4), gender (5), dates (8, 14, 15, 18), phone (14), needCall (16), renewType (17), contactStatus (21)
        let align = 'left';
        if (C === 0 || C === 2 || C === 3 || C === 4 || C === 5 || C === 8 || C === 12 || C === 14 || C === 15 || C === 16 || C === 17 || C === 18 || C === 21) {
          align = 'center';
        } else if (C === 10 || C === 11) {
          align = 'right';
        }

        worksheet[cell_ref].s = {
          border: {
            top: { style: 'thin', color: { rgb: 'A0A0A0' } },
            bottom: { style: 'thin', color: { rgb: 'A0A0A0' } },
            left: { style: 'thin', color: { rgb: 'A0A0A0' } },
            right: { style: 'thin', color: { rgb: 'A0A0A0' } }
          },
          font: {
            name: 'Arial',
            sz: 10
          },
          alignment: {
            horizontal: align,
            vertical: 'center'
          }
        };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DS BHYT');
    
    // Save file
    XLSX.writeFile(workbook, `BaoCao_BHYT_NhonTam_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(customers.map((c) => c._id as string).filter(Boolean));
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

  const updateSelectedField = async (field: string, val: string) => {
    try {
      await BhytService.bulkUpdate(selectedIds, field, val);
      alert('Cập nhật hàng loạt thành công!');
      setSelectedIds([]);
      fetchCustomers();
    } catch (e: any) {
      alert('Lỗi cập nhật: ' + e.message);
    }
  };

  const deleteSelected = async () => {
    if (confirm(`Bạn có chắc muốn xóa ${selectedIds.length} khách hàng đã chọn?`)) {
      try {
        const res = await BhytService.bulkDelete(selectedIds);
        alert(res.message);
        setSelectedIds([]);
        fetchCustomers();
      } catch (e: any) {
        alert('Lỗi xóa: ' + e.message);
      }
    }
  };

  const resetAllData = async () => {
    if (confirm('CẢNH BÁO: Hành động này sẽ XÓA TOÀN BỘ khách hàng BHYT trong database! Bạn có chắc chắn muốn tiếp tục?')) {
      try {
        const res = await fetch('/api/bhyt/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clearAll' })
        });
        const result = await res.json();
        alert(result.message);
        fetchCustomers();
      } catch (e: any) {
        alert('Lỗi xóa toàn bộ: ' + e.message);
      }
    }
  };

  const skip = (page - 1) * pageSize;

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            🚑 QUẢN LÝ KHÁCH HÀNG BHYT
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Tra cứu, kiểm tra thời hạn thẻ BHYT và cập nhật tình trạng chăm sóc khách hàng.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-700 transition-all hover:bg-teal-100"
          >
            <Upload className="h-4 w-4" /> Nhập Excel BHYT
          </button>
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-900/10 transition-all hover:bg-teal-500"
          >
            <Plus className="h-4 w-4" /> Thêm khách hàng
          </button>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-55"
          >
            <Download className="h-4 w-4" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Stats Board */}
      <BhytStats stats={stats} />

      {/* Manual Entry Form Collapsible */}
      {showManualForm && (
        <BhytEntryForm
          formState={manualForm}
          setFormState={setManualForm}
          onSubmit={handleFormSubmit}
          onReset={handleFormReset}
          editingId={editingId}
          autoSaveStatus={autoSaveStatus}
        />
      )}

      {/* Query Filters Dashboard Card */}
      <BhytFilterBar
        q={q}
        setQ={setQ}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        callFilter={callFilter}
        setCallFilter={setCallFilter}
        renewFilter={renewFilter}
        setRenewFilter={setRenewFilter}
        selectedIds={selectedIds}
        onBulkUpdate={updateSelectedField}
        onBulkDelete={deleteSelected}
      />

      {/* Main Spreadsheet Grid Container */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">DANH SÁCH BHYT</h3>
            <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full">
              Hiển thị {customers.length} / {filteredCount} dòng lọc (tổng {totalCount} khách)
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-bold">
            💡 Kích đúp hoặc click ô để sửa trực tiếp. Dữ liệu lưu sau 2 giây. Click "Sửa" ở dòng để chỉnh chi tiết.
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[64vh] relative scrollbar-thin scrollbar-thumb-slate-200">
          <table className="table-fixed w-max min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-teal-50/50 border-b border-slate-200 text-teal-800 text-[10px] font-bold uppercase tracking-wider h-11">
                <th className="w-12 text-center sticky left-0 z-30 bg-teal-50 border-r border-slate-200">
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length > 0 && selectedIds.length === customers.length} />
                </th>
                <th className="w-14 text-center border-r border-slate-200">STT</th>
                <th className="w-20 text-center border-r border-slate-200">Chi tiết</th>
                <th className="w-48 text-left sticky left-12 z-30 bg-teal-50 border-r border-slate-200 pl-4 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('name')}>
                  <div className="flex items-center gap-1">HỌ TÊN {renderSortIcon('name')}</div>
                </th>
                <th className="w-36 text-center border-r border-slate-200 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('bhxh')}>
                  <div className="flex items-center justify-center gap-1">Mã số BHXH {renderSortIcon('bhxh')}</div>
                </th>
                <th className="w-32 text-center border-r border-slate-200 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('cccd')}>
                  <div className="flex items-center justify-center gap-1">CCCD {renderSortIcon('cccd')}</div>
                </th>
                <th className="w-28 text-center border-r border-slate-200 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('dob')}>
                  <div className="flex items-center justify-center gap-1">Ngày sinh {renderSortIcon('dob')}</div>
                </th>
                <th className="w-24 text-center border-r border-slate-200 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('gender')}>
                  <div className="flex items-center justify-center gap-1">Giới tính {renderSortIcon('gender')}</div>
                </th>
                <th className="w-40 text-center border-r border-slate-200 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('birthPlace')}>
                  <div className="flex items-center justify-center gap-1">Nơi khai sinh {renderSortIcon('birthPlace')}</div>
                </th>
                <th className="w-56 text-center border-r border-slate-200 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('kcb')}>
                  <div className="flex items-center justify-center gap-1">KCB ban đầu {renderSortIcon('kcb')}</div>
                </th>
                <th className="w-28 text-center border-r border-slate-200 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('callDate')}>
                  <div className="flex items-center justify-center gap-1">Ngày gọi {renderSortIcon('callDate')}</div>
                </th>
                <th className="w-28 text-center border-r border-slate-200 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('amount')}>
                  <div className="flex items-center justify-center gap-1">Số tiền đóng {renderSortIcon('amount')}</div>
                </th>
                <th className="w-24 text-center border-r border-slate-200 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('months')}>
                  <div className="flex items-center justify-center gap-1">Số tháng {renderSortIcon('months')}</div>
                </th>
                <th className="w-28 text-center border-r border-slate-200 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('phone')}>
                  <div className="flex items-center justify-center gap-1">Điện thoại {renderSortIcon('phone')}</div>
                </th>
                <th className="w-36 text-center border-r border-slate-200 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('expiry')}>
                  <div className="flex items-center justify-center gap-1">Hạn thẻ đến ngày {renderSortIcon('expiry')}</div>
                </th>
                <th className="w-24 text-center border-r border-slate-200 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('daysRemaining')}>
                  <div className="flex items-center justify-center gap-1">Hạn còn lại {renderSortIcon('daysRemaining')}</div>
                </th>
                <th className="w-24 text-center border-r border-slate-200">Cần gọi</th>
                <th className="w-32 text-center border-r border-slate-200 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('renewType')}>
                  <div className="flex items-center justify-center gap-1">Gia hạn {renderSortIcon('renewType')}</div>
                </th>
                <th className="w-40 text-center border-r border-slate-200 cursor-pointer select-none group hover:bg-teal-100/50 transition-colors" onClick={() => requestSort('contactStatus')}>
                  <div className="flex items-center justify-center gap-1">Trạng thái liên hệ {renderSortIcon('contactStatus')}</div>
                </th>
                <th className="w-44 text-center border-r border-slate-200">Ghi chú</th>
                <th className="w-20 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={21} className="text-center py-20">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent align-[-0.125em]" />
                    <p className="mt-2 text-xs font-bold text-slate-400">Đang truy vấn database...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={21} className="text-center py-16 text-red-650 font-bold px-4">
                    <p className="text-sm text-red-600">⚠️ {error}</p>
                    <p className="mt-3 text-xs text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                      Lưu ý: Lỗi kết nối (ví dụ ECONNREFUSED) thường xảy ra khi DNS hoặc tường lửa mạng chặn địa chỉ MongoDB Atlas.<br />
                      Để khắc phục nhanh, hãy <b>cấu hình DNS của máy tính thành 8.8.8.8</b> (Google DNS) hoặc đổi sang kết nối mạng/3G khác.
                    </p>
                  </td>
                </tr>
              ) : sortedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={21} className="text-center py-20 text-slate-400 font-bold">
                    Không tìm thấy dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                sortedCustomers.map((c, index) => {
                  const daysRemaining = getDaysRemaining(c.expiry);
                  let rowColor = '';
                  let badgeColor = '';
                  let badgeText = '';

                  if (daysRemaining === null) {
                    rowColor = 'bg-slate-50';
                    badgeColor = 'bg-slate-100 text-slate-600';
                    badgeText = 'Thiếu hạn';
                  } else if (daysRemaining < 0) {
                    rowColor = 'bg-red-50/40';
                    badgeColor = 'bg-red-100 text-red-700';
                    badgeText = `Hết hạn (${daysRemaining})`;
                  } else if (daysRemaining <= 30) {
                    rowColor = 'bg-orange-50/40';
                    badgeColor = 'bg-orange-100 text-orange-700';
                    badgeText = `Còn ${daysRemaining} ngày`;
                  } else if (daysRemaining <= 60) {
                    rowColor = 'bg-amber-50/40';
                    badgeColor = 'bg-amber-100 text-amber-700';
                    badgeText = `Còn ${daysRemaining} ngày`;
                  } else if (daysRemaining <= 90) {
                    rowColor = 'bg-emerald-50/40';
                    badgeColor = 'bg-emerald-100 text-emerald-700';
                    badgeText = `Còn ${daysRemaining} ngày`;
                  } else {
                    rowColor = 'bg-white';
                    badgeColor = 'bg-teal-100 text-teal-700';
                    badgeText = 'An toàn';
                  }

                  return (
                    <tr
                      key={c._id}
                      className={`border-b border-slate-100 h-9 hover:bg-slate-100/50 transition-colors ${rowColor}`}
                    >
                      <td className="sticky left-0 bg-inherit border-r border-slate-100 z-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(c._id as string)}
                          onChange={(e) => handleSelectRow(c._id as string, e.target.checked)}
                        />
                      </td>
                      <td className="text-center text-slate-400 font-bold border-r border-slate-100">
                        {skip + index + 1}
                      </td>
                      <td className="text-center border-r border-slate-100">
                        <button
                          onClick={() => handleLoadToEdit(c)}
                          className="text-teal-650 hover:text-teal-800 font-bold hover:underline"
                        >
                          Sửa
                        </button>
                      </td>
                      <td className="sticky left-12 bg-inherit border-r border-slate-100 z-10 font-bold text-slate-800 pl-4">
                        <input
                          value={c.name}
                          onChange={(e) => handleCellEdit(c._id!, 'name', e.target.value)}
                          className="w-full bg-transparent border-0 outline-none focus:bg-white focus:ring-1 focus:ring-teal-500 rounded"
                        />
                      </td>
                      <td className="border-r border-slate-100 text-center">
                        <input
                          value={c.bhxh}
                          onChange={(e) => handleCellEdit(c._id!, 'bhxh', e.target.value)}
                          className="w-full bg-transparent border-0 outline-none text-center focus:bg-white focus:ring-1 focus:ring-teal-500 rounded"
                        />
                      </td>
                      <td className="border-r border-slate-100 text-center">
                        <input
                          value={c.cccd || ''}
                          onChange={(e) => handleCellEdit(c._id!, 'cccd', e.target.value)}
                          className="w-full bg-transparent border-0 outline-none text-center focus:bg-white focus:ring-1 focus:ring-teal-500 rounded"
                        />
                      </td>
                      <td className="border-r border-slate-100 text-center">
                        <input
                          value={c.dob || ''}
                          onChange={(e) => handleCellEdit(c._id!, 'dob', e.target.value)}
                          placeholder="dd/mm/yyyy"
                          className="w-full bg-transparent border-0 outline-none text-center focus:bg-white focus:ring-1 focus:ring-teal-500 rounded"
                        />
                      </td>
                      <td className="border-r border-slate-100 text-center">
                        <select
                          value={c.gender || ''}
                          onChange={(e) => handleCellEdit(c._id!, 'gender', e.target.value)}
                          className="w-full bg-transparent border-0 outline-none text-center focus:bg-white rounded"
                        >
                          <option value=""></option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                      </td>
                      <td className="border-r border-slate-100 px-2 truncate max-w-xs">
                        <input
                          value={c.birthPlace || ''}
                          onChange={(e) => handleCellEdit(c._id!, 'birthPlace', e.target.value)}
                          className="w-full bg-transparent border-0 outline-none focus:bg-white focus:ring-1 focus:ring-teal-500 rounded"
                        />
                      </td>
                      <td className="border-r border-slate-100 px-2 truncate max-w-xs">
                        <input
                          value={c.kcb || ''}
                          onChange={(e) => handleCellEdit(c._id!, 'kcb', e.target.value)}
                          className="w-full bg-transparent border-0 outline-none focus:bg-white focus:ring-1 focus:ring-teal-500 rounded"
                        />
                      </td>
                      <td className="border-r border-slate-100 text-center">
                        <input
                          value={c.callDate || ''}
                          onChange={(e) => handleCellEdit(c._id!, 'callDate', e.target.value)}
                          className="w-full bg-transparent border-0 outline-none text-center focus:bg-white focus:ring-1 focus:ring-teal-500 rounded"
                        />
                      </td>
                      <td className="border-r border-slate-100 text-center">
                        <input
                          value={c.amount || ''}
                          onChange={(e) => handleCellEdit(c._id!, 'amount', e.target.value)}
                          className="w-full bg-transparent border-0 outline-none text-center focus:bg-white focus:ring-1 focus:ring-teal-500 rounded"
                        />
                      </td>
                      <td className="border-r border-slate-100 text-center">
                        <input
                          value={c.months || ''}
                          onChange={(e) => handleCellEdit(c._id!, 'months', e.target.value)}
                          className="w-full bg-transparent border-0 outline-none text-center focus:bg-white focus:ring-1 focus:ring-teal-500 rounded"
                        />
                      </td>
                      <td className="border-r border-slate-100 text-center">
                        <input
                          value={c.phone || ''}
                          onChange={(e) => handleCellEdit(c._id!, 'phone', e.target.value)}
                          className="w-full bg-transparent border-0 outline-none text-center focus:bg-white focus:ring-1 focus:ring-teal-500 rounded"
                        />
                      </td>
                      <td className="border-r border-slate-100 text-center">
                        <input
                          value={c.expiry || ''}
                          onChange={(e) => handleCellEdit(c._id!, 'expiry', e.target.value)}
                          placeholder="dd/mm/yyyy"
                          className="w-full bg-transparent border-0 outline-none text-center focus:bg-white focus:ring-1 focus:ring-teal-500 rounded"
                        />
                      </td>
                      <td className="border-r border-slate-100 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${badgeColor}`}>
                          {badgeText}
                        </span>
                      </td>
                      <td className="border-r border-slate-100 text-center">
                        <select
                          value={c.needCall || 'Không'}
                          onChange={(e) => handleCellEdit(c._id!, 'needCall', e.target.value)}
                          className="w-full bg-transparent border-0 outline-none text-center focus:bg-white rounded"
                        >
                          <option value="Có">Có</option>
                          <option value="Không">Không</option>
                        </select>
                      </td>
                      <td className="border-r border-slate-100 text-center">
                        <select
                          value={c.renewType || ''}
                          onChange={(e) => handleCellEdit(c._id!, 'renewType', e.target.value)}
                          className="w-full bg-transparent border-0 outline-none text-center focus:bg-white rounded text-teal-800 font-bold"
                        >
                          <option value=""></option>
                          <option value="Chưa gia hạn">Chưa gia hạn</option>
                          <option value="Đang chờ">Đang chờ</option>
                          <option value="Đã gia hạn">Đã gia hạn</option>
                          <option value="Tăng mới">Tăng mới</option>
                        </select>
                      </td>
                      <td className="border-r border-slate-100 text-center">
                        <select
                          value={c.contactStatus || 'Chưa liên hệ'}
                          onChange={(e) => handleCellEdit(c._id!, 'contactStatus', e.target.value)}
                          className="w-full bg-transparent border-0 outline-none text-center focus:bg-white rounded"
                        >
                          <option value="Chưa liên hệ">Chưa liên hệ</option>
                          <option value="Đang liên hệ">Đang liên hệ</option>
                          <option value="Đã liên hệ">Đã liên hệ</option>
                          <option value="Sai số / Không liên lạc được">Sai số / Không liên lạc được</option>
                        </select>
                      </td>
                      <td className="border-r border-slate-100 px-2">
                        <input
                          value={c.note || ''}
                          onChange={(e) => handleCellEdit(c._id!, 'note', e.target.value)}
                          className="w-full bg-transparent border-0 outline-none focus:bg-white focus:ring-1 focus:ring-teal-500 rounded"
                        />
                      </td>
                      <td className="text-center">
                        <button
                          onClick={async () => {
                            if (confirm(`Xóa khách hàng ${c.name}?`)) {
                              await BhytService.delete(c._id!);
                              fetchCustomers();
                            }
                          }}
                          className="text-red-650 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Database Clear Button (Footer) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Mẹo: Để chỉnh sửa hàng loạt trạng thái, hãy tích chọn các ô đầu dòng rồi dùng Bảng tác vụ nhanh.
          </div>
          <button
            onClick={resetAllData}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
          >
            Reset toàn bộ dữ liệu BHYT
          </button>
        </div>
      </div>

      {/* SheetJS Excel Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider">
                Nhập danh sách từ Excel
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setSheetsList([]);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Chọn file Excel (.xlsx / .xls)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/50 cursor-pointer relative">
                  <FileSpreadsheet className="h-8 w-8 text-teal-600 mb-2 animate-bounce" />
                  <span className="text-xs font-bold text-slate-600">
                    {importFile ? importFile.name : 'Kéo thả hoặc click chọn file'}
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleExcelUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {sheetsList.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Chọn Sheet dữ liệu</label>
                  <select
                    value={selectedSheet}
                    onChange={(e) => setSelectedSheet(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                  >
                    {sheetsList.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {importStatus && (
                <div className="rounded-xl bg-teal-50/50 border border-teal-100 p-3 text-[11px] font-semibold text-teal-700 leading-relaxed">
                  {importStatus}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setSheetsList([]);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-55"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isImporting || !importFile || sheetsList.length === 0}
                onClick={triggerImport}
                className="rounded-xl bg-teal-650 px-5 py-2 text-xs font-bold text-white hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? 'Đang nhập...' : 'Bắt đầu Nhập'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
