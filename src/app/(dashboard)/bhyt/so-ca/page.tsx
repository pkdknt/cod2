'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Plus, RefreshCw } from 'lucide-react';
import { BhytSoCaService, BhytSoCaData } from '@/services/BhytSoCaService';
import BhytSoCaList from '@/components/bhyt-so-ca/BhytSoCaList';
import BhytSoCaEditor from '@/components/bhyt-so-ca/BhytSoCaEditor';
import BhytSoCaStats from '@/components/bhyt-so-ca/BhytSoCaStats';
import BhytSoCaImportModal from '@/components/bhyt-so-ca/BhytSoCaImportModal';

export default function BhytSoCaPage() {
  const [activeTab, setActiveTab] = useState('list');

  // DB items state
  const [items, setItems] = useState<BhytSoCaData[]>([]);
  const [allItemsForStats, setAllItemsForStats] = useState<BhytSoCaData[]>([]);
  const [monthsList, setMonthsList] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(100);
  const [loading, setLoading] = useState(false);

  // Active form data
  const [currentId, setCurrentId] = useState<string | null>(null);

  const initialFormState = (): BhytSoCaData => {
    return {
      date: new Date().toISOString().slice(0, 10),
      type: 'Mua mới',
      qty: 1,
      note: ''
    };
  };

  const [formState, setFormState] = useState<BhytSoCaData>(initialFormState());
  const [showImportModal, setShowImportModal] = useState(false);

  // Load items from API
  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await BhytSoCaService.getAll({
        q: searchTerm,
        monthFilter,
        typeFilter,
        page,
        pageSize
      });
      setItems(data.items || []);
      setTotalItems(data.pagination?.totalFiltered || 0);

      if (data.stats?.allRecords) {
        setAllItemsForStats(data.stats.allRecords);
        // Extract unique months YYYY-MM
        const months = Array.from(
          new Set(
            data.stats.allRecords.map((r: any) => r.date.slice(0, 7)).filter(Boolean)
          )
        ).sort() as string[];
        setMonthsList(months.reverse());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchTerm, monthFilter, typeFilter, page]);

  // Handle manual saving
  const handleSaveEntry = async () => {
    if (!formState.date || !formState.qty) {
      alert('Vui lòng điền đầy đủ Ngày và Số lượng ca.');
      return;
    }

    try {
      if (currentId) {
        await BhytSoCaService.update(currentId, formState);
        alert('Cập nhật ca BHYT thành công!');
      } else {
        await BhytSoCaService.create(formState);
        alert('Lưu ca BHYT mới thành công!');
      }
      handleResetForm();
      fetchItems();
      setActiveTab('list');
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu dữ liệu');
    }
  };

  const handleResetForm = () => {
    setFormState(initialFormState());
    setCurrentId(null);
  };

  const handleEditRecord = (item: BhytSoCaData) => {
    setFormState(item);
    setCurrentId(item._id || null);
    setActiveTab('editor');
  };

  const handleDeleteRecord = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa ca BHYT này?')) {
      try {
        await BhytSoCaService.delete(id);
        alert('Đã xóa ca thành công');
        fetchItems();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleResetAll = async () => {
    if (confirm('CẢNH BÁO: Bạn có muốn XÓA TOÀN BỘ số ca BHYT đã lưu trong database không?')) {
      try {
        const res = await BhytSoCaService.bulkAction('clearAll');
        alert(res.message);
        fetchItems();
      } catch (err: any) {
        alert('Lỗi reset: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            📊 SỐ CA BHYT MUA & GIA HẠN
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Ghi nhận số lượng hồ sơ BHYT mua mới và gia hạn hàng ngày, phục vụ công tác đối chiếu so sánh kết quả.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-700 transition-all hover:bg-teal-100"
          >
            <Upload className="h-4 w-4" /> Nhập Excel Số ca
          </button>
          <button
            onClick={() => {
              handleResetForm();
              setActiveTab('editor');
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-teal-650 transition-colors"
          >
            <Plus className="h-4 w-4" /> Nhập ca mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-2xl shadow-sm gap-1.5">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'list'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Nhật ký dữ liệu ({totalItems})
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'editor'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          {currentId ? 'Chỉnh sửa ca' : 'Nhập ca nhanh'}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'stats'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Báo cáo thống kê & So sánh
        </button>
      </div>

      {/* TAB 1: LIST */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <BhytSoCaList
              items={items}
              loading={loading}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              monthFilter={monthFilter}
              onMonthFilterChange={setMonthFilter}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              onEdit={handleEditRecord}
              onDelete={handleDeleteRecord}
              monthsList={monthsList}
            />
          </div>
          <div className="lg:col-span-1">
            <BhytSoCaEditor
              formState={formState}
              onChange={setFormState}
              onSubmit={handleSaveEntry}
              onReset={handleResetForm}
              isEdit={!!currentId}
            />
          </div>
        </div>
      )}

      {/* TAB 2: EDITOR */}
      {activeTab === 'editor' && (
        <div className="max-w-xl mx-auto">
          <BhytSoCaEditor
            formState={formState}
            onChange={setFormState}
            onSubmit={handleSaveEntry}
            onReset={handleResetForm}
            isEdit={!!currentId}
          />
        </div>
      )}

      {/* TAB 3: STATS & COMPARE */}
      {activeTab === 'stats' && (
        <BhytSoCaStats
          items={allItemsForStats}
          monthsList={monthsList}
        />
      )}

      {/* Database Clear Button (Footer) */}
      {activeTab === 'list' && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex justify-between items-center flex-wrap gap-2 shadow-inner">
          <span className="text-xs text-slate-500 font-semibold">
            Mẹo: Dữ liệu thống kê số ca BHYT giúp theo dõi kết quả kinh doanh định kỳ của phòng khám.
          </span>
          <button
            onClick={handleResetAll}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
          >
            Reset toàn bộ số ca BHYT
          </button>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <BhytSoCaImportModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={fetchItems}
        />
      )}
    </div>
  );
}
