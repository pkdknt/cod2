'use strict';
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  DollarSign, 
  Save, 
  X, 
  Activity, 
  ChevronDown, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Upload,
  Download,
  Database
} from 'lucide-react';
import { DATA, matchSearch } from '@/lib/vaccineData';

// Helpers to format inputs with thousands separator dots
const formatNumberWithDots = (val: string | number) => {
  if (val === undefined || val === null) return '';
  const clean = val.toString().replace(/[^0-9]/g, '');
  if (!clean) return '';
  return new Intl.NumberFormat('vi-VN').format(Number(clean));
};

const parseNumberFromDots = (val: string) => {
  return val.replace(/[^0-9]/g, '');
};

export default function VaccinePricesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [qSearch, setQSearch] = useState('');
  
  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Sort states
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Form states
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Mũi');
  const [price, setPrice] = useState('');
  const [checkupPrice, setCheckupPrice] = useState('0');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      return <ArrowUpDown className="inline-block ml-1 h-3.5 w-3.5 opacity-40 text-slate-400 group-hover:opacity-100 transition-opacity" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="inline-block ml-1 h-3.5 w-3.5 text-teal-600 font-bold" />;
    }
    return <ArrowDown className="inline-block ml-1 h-3.5 w-3.5 text-teal-600 font-bold" />;
  };

  const sortedItems = useMemo(() => {
    if (!sortKey) return items;
    
    return [...items].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortKey === 'stt') {
        const aIndex = items.indexOf(a);
        const bIndex = items.indexOf(b);
        return sortDirection === 'asc' ? aIndex - bIndex : bIndex - aIndex;
      } else if (sortKey === 'name') {
        aVal = a.name || '';
        bVal = b.name || '';
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal, 'vi', { sensitivity: 'accent' }) 
          : bVal.localeCompare(aVal, 'vi', { sensitivity: 'accent' });
      } else if (sortKey === 'unit') {
        aVal = a.unit || '';
        bVal = b.unit || '';
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal, 'vi', { sensitivity: 'accent' }) 
          : bVal.localeCompare(aVal, 'vi', { sensitivity: 'accent' });
      } else if (sortKey === 'price') {
        aVal = a.price || 0;
        bVal = b.price || 0;
      } else if (sortKey === 'checkupPrice') {
        aVal = a.checkupPrice || 0;
        bVal = b.checkupPrice || 0;
      } else if (sortKey === 'total') {
        aVal = (a.price || 0) + (a.checkupPrice || 0);
        bVal = (b.price || 0) + (b.checkupPrice || 0);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [items, sortKey, sortDirection]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const filteredVaccines = DATA.vaccines.filter((v: string) => matchSearch(v, name));

  const fetchItems = async () => {
    try {
      const qParams = new URLSearchParams({ q: qSearch });
      const res = await fetch(`/api/vaccine-prices?${qParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const result = await res.json();
      setItems(result.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [qSearch]);

  const handleResetForm = () => {
    setActiveEditId(null);
    setName('');
    setUnit('Mũi');
    setPrice('');
    setCheckupPrice('0');
  };

  const handleEdit = (item: any) => {
    setActiveEditId(item._id);
    setName(item.name);
    setUnit(item.unit);
    setPrice(item.price.toString());
    setCheckupPrice((item.checkupPrice ?? 0).toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa vắc xin này khỏi bảng giá?')) {
      try {
        const res = await fetch(`/api/vaccine-prices?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Xóa thất bại');
        fetchItems();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unit.trim() || !price) {
      alert('Vui lòng điền đầy đủ Tên vắc xin, Đơn vị tính và Giá');
      return;
    }

    try {
      const res = await fetch('/api/vaccine-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeEditId,
          name,
          unit,
          price: Number(price.replace(/[^0-9]/g, '')),
          checkupPrice: Number(checkupPrice.replace(/[^0-9]/g, ''))
        })
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message);
      }

      alert(activeEditId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
      handleResetForm();
      fetchItems();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(items.map((item) => item._id));
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

  // Seed default vaccines
  const handleSeedDefaults = async () => {
    if (confirm('Bạn có chắc muốn khởi tạo hoặc đồng bộ 36 vắc xin mặc định? Các vắc xin đã trùng tên sẽ được cập nhật giá trị chuẩn, vắc xin chưa có sẽ được thêm mới.')) {
      try {
        const res = await fetch('/api/vaccine-prices/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'seed' })
        });
        const result = await res.json();
        if (res.ok) {
          alert(result.message || 'Khởi tạo thành công!');
          fetchItems();
        } else {
          alert('Lỗi: ' + result.message);
        }
      } catch (e: any) {
        alert('Lỗi kết nối: ' + e.message);
      }
    }
  };

  // Clear all vaccine prices
  const handleClearAll = async () => {
    if (confirm('CẢNH BÁO: Hành động này sẽ XÓA TOÀN BỘ bảng giá vắc xin trong cơ sở dữ liệu! Bạn có chắc chắn muốn tiếp tục?')) {
      try {
        const res = await fetch('/api/vaccine-prices/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clearAll' })
        });
        const result = await res.json();
        if (res.ok) {
          alert(result.message || 'Đã xóa toàn bộ dữ liệu thành công!');
          setSelectedIds([]);
          fetchItems();
        } else {
          alert('Lỗi: ' + result.message);
        }
      } catch (e: any) {
        alert('Lỗi kết nối: ' + e.message);
      }
    }
  };

  // Delete selected vaccine prices
  const handleDeleteSelected = async () => {
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} vắc xin đã chọn khỏi bảng giá?`)) {
      try {
        const res = await fetch('/api/vaccine-prices/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'deleteSelected', ids: selectedIds })
        });
        const result = await res.json();
        if (res.ok) {
          alert(result.message || 'Đã xóa thành công!');
          setSelectedIds([]);
          fetchItems();
        } else {
          alert('Lỗi: ' + result.message);
        }
      } catch (e: any) {
        alert('Lỗi kết nối: ' + e.message);
      }
    }
  };

  // Export vaccine prices to styled Excel file
  const exportToExcel = async () => {
    if (items.length === 0) {
      alert('Bảng giá trống, không thể xuất file Excel.');
      return;
    }

    try {
      const { default: XLSX } = await import('xlsx-js-style');

      const headers = [
        { v: 'STT', t: 's' },
        { v: 'Tên Vắc Xin', t: 's' },
        { v: 'Đơn vị tính (ĐVT)', t: 's' },
        { v: 'Đơn giá (VNĐ)', t: 's' },
        { v: 'Tiền khám (VNĐ)', t: 's' },
        { v: 'Tổng cộng (VNĐ)', t: 's' }
      ];

      const headerStyle = {
        fill: { fgColor: { rgb: '0D9488' } }, // Teal-600
        font: { name: 'Arial', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
          top: { style: 'thin', color: { rgb: 'CBD5E1' } },
          bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
          left: { style: 'thin', color: { rgb: 'CBD5E1' } },
          right: { style: 'thin', color: { rgb: 'CBD5E1' } }
        }
      };

      const cellStyle = {
        font: { name: 'Arial', sz: 10 },
        border: {
          top: { style: 'thin', color: { rgb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
          left: { style: 'thin', color: { rgb: 'E2E8F0' } },
          right: { style: 'thin', color: { rgb: 'E2E8F0' } }
        }
      };

      const centerStyle = {
        ...cellStyle,
        alignment: { horizontal: 'center' }
      };

      const numberCellStyle = {
        ...cellStyle,
        alignment: { horizontal: 'right' }
      };

      const rows = items.map((item, index) => {
        const checkup = item.checkupPrice || 0;
        const total = item.price + checkup;
        return [
          { v: index + 1, t: 'n', s: centerStyle },
          { v: item.name, t: 's', s: cellStyle },
          { v: item.unit, t: 's', s: centerStyle },
          { v: item.price, t: 'n', z: '#,##0', s: numberCellStyle },
          { v: checkup, t: 'n', z: '#,##0', s: numberCellStyle },
          { v: total, t: 'n', z: '#,##0', s: numberCellStyle }
        ];
      });

      const wsData = [
        [{ v: 'DANH SÁCH BẢNG GIÁ VẮC XIN - PHÒNG KHÁM ĐA KHOA NHƠN TÂM', t: 's', s: { font: { name: 'Arial', sz: 14, bold: true, color: { rgb: '0F172A' } } } }],
        [],
        headers.map(h => ({ ...h, s: headerStyle })),
        ...rows
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Widths
      ws['!cols'] = [
        { wch: 6 },
        { wch: 45 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 }
      ];

      // Merges
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bang Gia Vac xin');
      XLSX.writeFile(wb, `BangGiaVacxin_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (e: any) {
      alert('Không thể xuất Excel: ' + e.message);
    }
  };

  // Import vaccine prices from Excel
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { default: XLSX } = await import('xlsx-js-style');
      const ab = await file.arrayBuffer();
      const book = XLSX.read(ab, { type: 'array' });
      const sheet = book.Sheets[book.SheetNames[0]];
      const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];

      if (matrix.length < 3) {
        alert('File Excel không đúng cấu trúc hoặc không chứa dữ liệu.');
        return;
      }

      // Detect header row index
      let headerRowIdx = matrix.findIndex(row => 
        row.some(c => /tên vắc xin|ten vac xin|tên thuốc/i.test(String(c || '')))
      );
      if (headerRowIdx < 0) headerRowIdx = 2; // Default to row 2

      const headers = matrix[headerRowIdx].map(h => String(h || '').trim().toLowerCase());
      const nameIdx = headers.findIndex(h => /tên vắc xin|ten vac xin|tên thuốc|tên|ten/i.test(h));
      const unitIdx = headers.findIndex(h => /đơn vị|đvt|dvt/i.test(h));
      const priceIdx = headers.findIndex(h => /đơn giá|giá|gia|price/i.test(h));
      const checkupIdx = headers.findIndex(h => /tiền khám|tien kham|kham/i.test(h));

      if (nameIdx < 0 || priceIdx < 0) {
        alert('Không tìm thấy cột Tên vắc xin hoặc Đơn giá trong file Excel.');
        return;
      }

      const importedItems: any[] = [];
      for (let i = headerRowIdx + 1; i < matrix.length; i++) {
        const row = matrix[i];
        if (!row || row.length === 0) continue;
        
        const nameVal = String(row[nameIdx] || '').trim();
        if (!nameVal || nameVal.startsWith('DANH SÁCH') || nameVal === 'Tổng cộng' || nameVal === 'Tổng') continue;

        const unitVal = unitIdx >= 0 ? String(row[unitIdx] || '').trim() || 'Mũi' : 'Mũi';
        
        const priceStr = priceIdx >= 0 ? String(row[priceIdx] || '').replace(/[^0-9]/g, '') : '0';
        const priceVal = Number(priceStr) || 0;

        const checkupStr = checkupIdx >= 0 ? String(row[checkupIdx] || '').replace(/[^0-9]/g, '') : '0';
        const checkupVal = Number(checkupStr) || 0;

        importedItems.push({ 
          name: nameVal, 
          unit: unitVal, 
          price: priceVal, 
          checkupPrice: checkupVal 
        });
      }

      if (importedItems.length === 0) {
        alert('Không có dữ liệu vắc xin hợp lệ nào để nhập.');
        return;
      }

      if (confirm(`Tìm thấy ${importedItems.length} vắc xin từ file Excel. Bạn có chắc muốn nhập và cập nhật vào bảng giá?`)) {
        const res = await fetch('/api/vaccine-prices/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'import', items: importedItems })
        });
        const result = await res.json();
        if (res.ok) {
          alert(result.message || 'Nhập dữ liệu thành công!');
          fetchItems();
        } else {
          alert('Lỗi nhập dữ liệu: ' + result.message);
        }
      }
    } catch (err: any) {
      alert('Lỗi đọc file Excel: ' + err.message);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Format number to currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  return (
    <div className="space-y-6">
      {/* Title Header with Buttons */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-teal-600" /> BẢNG GIÁ VẮC XIN
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Quản lý danh sách giá các loại vắc xin tiêm ngừa phòng bệnh tại Phòng khám Đa khoa Nhơn Tâm
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSeedDefaults}
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold text-teal-700 hover:bg-teal-100 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Database className="h-3.5 w-3.5" /> Khởi tạo mặc định
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" /> Nhập Excel
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleExcelImport}
            accept=".xlsx,.xls"
            className="hidden"
          />

          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Xuất Excel
          </button>

          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Xóa tất cả
          </button>
        </div>
      </div>

      {/* Selected Items Batch Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-teal-50 border border-teal-200/60 px-5 py-3 rounded-2xl shadow-sm animate-fade-in">
          <span className="text-xs font-bold text-teal-800">
            Đã chọn <strong className="text-teal-900">{selectedIds.length}</strong> vắc xin trong danh sách
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 text-xs font-bold text-slate-650 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Bỏ chọn
            </button>
            <button
              onClick={handleDeleteSelected}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-500 transition-colors shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" /> Xóa các mục đã chọn
            </button>
          </div>
        </div>
      )}

      {/* Empty Database Alert Banner */}
      {items.length === 0 && (
        <div className="bg-teal-50/40 border border-teal-100 rounded-3xl p-8 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto">
            <Activity className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-extrabold text-slate-800 text-sm">Bảng giá vắc xin đang trống</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Hệ thống hiện tại chưa có dữ liệu bảng giá vắc xin nào. Vui lòng bấm vào nút dưới đây để nạp đầy đủ danh sách 36 loại vắc xin mặc định kèm đơn giá y tế và tiền khám mẫu.
            </p>
          </div>
          <button
            onClick={handleSeedDefaults}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-900/10 hover:bg-teal-500 active:scale-95 transition-all cursor-pointer"
          >
            <Database className="h-4 w-4" /> Khởi tạo 36 vắc xin mặc định
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm h-fit">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">
            {activeEditId ? 'Cập nhật giá vắc xin' : 'Thêm vắc xin mới'}
          </h3>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div ref={dropdownRef} className="relative">
              <label className="block text-xs font-bold text-slate-500 mb-1">Tên vắc xin *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Gõ hoặc chọn vắc xin..."
                  value={name}
                  onFocus={() => setShowDropdown(true)}
                  onClick={() => setShowDropdown(true)}
                  onChange={(e) => {
                    setName(e.target.value);
                    setShowDropdown(true);
                  }}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                />
                <ChevronDown 
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShowDropdown(prev => !prev)}
                  className="absolute right-3 top-3 h-4 w-4 text-slate-400 cursor-pointer hover:text-teal-600 transition-colors" 
                />
              </div>
              
              {showDropdown && (
                <div 
                  className="absolute left-0 right-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl mt-1.5 max-h-[200px] overflow-y-auto"
                >
                  {filteredVaccines.length === 0 ? (
                    <div className="p-3 text-xs text-slate-400 font-bold">Thêm vắc xin tùy chỉnh...</div>
                  ) : (
                    filteredVaccines.map((v: string) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          setName(v);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                      >
                        {v}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">ĐVT *</label>
                <select
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500 bg-white"
                >
                  <option value="Mũi">Mũi</option>
                  <option value="Liều">Liều</option>
                  <option value="Ống">Ống</option>
                  <option value="Lọ">Lọ</option>
                  <option value="Viên">Viên</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Đơn giá (VNĐ) *</label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="VD: 1.290.000"
                  value={formatNumberWithDots(price)}
                  onChange={(e) => setPrice(parseNumberFromDots(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tiền khám (VNĐ) *</label>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  placeholder="VD: 50.000"
                  value={formatNumberWithDots(checkupPrice)}
                  onChange={(e) => setCheckupPrice(parseNumberFromDots(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-55 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-[2] rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-900/10 hover:bg-teal-500 transition-colors flex justify-center items-center gap-1.5"
              >
                <Save className="h-4 w-4" /> {activeEditId ? 'Cập Nhật' : 'Lưu Vắc Xin'}
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tên vắc xin..."
                value={qSearch}
                onChange={(e) => setQSearch(e.target.value)}
                className="w-full pl-9 rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-500">
                Tổng cộng <strong className="text-teal-700">{items.length}</strong> vắc xin trong hệ thống
              </span>
            </div>
            
            <div className="overflow-x-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-200">
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold h-10 border-b border-slate-200 uppercase text-[10px] sticky top-0 shadow-sm z-10">
                    <th className="w-12 text-center border border-slate-200">
                      <input
                        type="checkbox"
                        checked={items.length > 0 && selectedIds.length === items.length}
                        onChange={handleSelectAll}
                        className="rounded accent-teal-650 cursor-pointer"
                      />
                    </th>
                    <th className="w-16 text-center cursor-pointer select-none group hover:bg-slate-50 hover:text-slate-700 transition-colors border border-slate-200" onClick={() => requestSort('stt')}>
                      <div className="flex items-center justify-center gap-1">
                        STT {renderSortIcon('stt')}
                      </div>
                    </th>
                    <th className="pl-4 cursor-pointer select-none group hover:bg-slate-50 hover:text-slate-700 transition-colors border border-slate-200" onClick={() => requestSort('name')}>
                      <div className="flex items-center gap-1">
                        Tên Vắc Xin {renderSortIcon('name')}
                      </div>
                    </th>
                    <th className="w-16 text-center cursor-pointer select-none group hover:bg-slate-50 hover:text-slate-700 transition-colors border border-slate-200" onClick={() => requestSort('unit')}>
                      <div className="flex items-center justify-center gap-1">
                        ĐVT {renderSortIcon('unit')}
                      </div>
                    </th>
                    <th className="w-28 text-right cursor-pointer select-none group hover:bg-slate-50 hover:text-slate-700 transition-colors border border-slate-200" onClick={() => requestSort('price')}>
                      <div className="flex items-center justify-end gap-1">
                        Đơn giá {renderSortIcon('price')}
                      </div>
                    </th>
                    <th className="w-28 text-right cursor-pointer select-none group hover:bg-slate-50 hover:text-slate-700 transition-colors border border-slate-200" onClick={() => requestSort('checkupPrice')}>
                      <div className="flex items-center justify-end gap-1">
                        Tiền khám {renderSortIcon('checkupPrice')}
                      </div>
                    </th>
                    <th className="w-32 text-right pr-6 cursor-pointer select-none group hover:bg-slate-50 hover:text-slate-700 transition-colors border border-slate-200" onClick={() => requestSort('total')}>
                      <div className="flex items-center justify-end gap-1">
                        Tổng tiền {renderSortIcon('total')}
                      </div>
                    </th>
                    <th className="w-20 text-center select-none border border-slate-200">Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-20 text-slate-400 font-bold bg-white border border-slate-200">
                        <Activity className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        Chưa có dữ liệu giá vắc xin.
                      </td>
                    </tr>
                  ) : (
                    sortedItems.map((item, index) => {
                      const checkup = item.checkupPrice || 0;
                      const total = item.price + checkup;
                      return (
                        <tr key={item._id} className="border-b border-slate-100 h-12 hover:bg-teal-50/30 transition-colors bg-white">
                          <td className="text-center border border-slate-200">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item._id)}
                              onChange={(e) => handleSelectRow(item._id, e.target.checked)}
                              className="rounded accent-teal-650 cursor-pointer"
                            />
                          </td>
                          <td className="text-center text-slate-400 font-bold border border-slate-200">{index + 1}</td>
                          <td className="pl-4 font-bold text-slate-800 text-[13px] border border-slate-200">{item.name}</td>
                          <td className="text-center font-semibold text-slate-600 bg-slate-50 border border-slate-200">{item.unit}</td>
                          <td className="text-right font-bold text-slate-700 text-[13px] border border-slate-200">{formatCurrency(item.price)}</td>
                          <td className="text-right font-bold text-slate-500 text-[13px] border border-slate-200">{formatCurrency(checkup)}</td>
                          <td className="text-right pr-6 font-bold text-teal-700 text-[13px] border border-slate-200">{formatCurrency(total)}</td>
                          <td className="text-center space-x-2 border border-slate-200">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                              title="Sửa"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
