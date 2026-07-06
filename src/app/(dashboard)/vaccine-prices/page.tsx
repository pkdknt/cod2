'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, DollarSign, Save, X, Activity, ChevronDown } from 'lucide-react';
import { DATA, norm, matchSearch } from '@/lib/vaccineData';

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
  
  // Form states
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Mũi');
  const [price, setPrice] = useState('');
  const [checkupPrice, setCheckupPrice] = useState('0');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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

  // Format number to currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-teal-600" /> BẢNG GIÁ VẮC XIN
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Quản lý danh sách giá các loại vắc xin tiêm chủng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit">
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
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500"
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
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
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
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
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

          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-500">
                Tổng cộng <strong className="text-teal-700">{items.length}</strong> vắc xin trong hệ thống
              </span>
            </div>
            
            <div className="overflow-x-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-white text-slate-500 font-bold h-10 border-b border-slate-200 uppercase text-[10px] sticky top-0 shadow-sm z-10">
                    <th className="pl-6 w-12 text-center">STT</th>
                    <th className="pl-4">Tên Vắc Xin</th>
                    <th className="w-16 text-center">ĐVT</th>
                    <th className="w-28 text-right">Đơn giá</th>
                    <th className="w-28 text-right">Tiền khám</th>
                    <th className="w-32 text-right pr-6">Tổng tiền</th>
                    <th className="w-20 text-center">Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-20 text-slate-400 font-bold bg-white">
                        <Activity className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        Chưa có dữ liệu giá vắc xin.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => {
                      const checkup = item.checkupPrice || 0;
                      const total = item.price + checkup;
                      return (
                        <tr key={item._id} className="border-b border-slate-100 h-12 hover:bg-teal-50/30 transition-colors bg-white">
                          <td className="pl-6 text-center text-slate-400 font-bold">{index + 1}</td>
                          <td className="pl-4 font-bold text-slate-800 text-[13px]">{item.name}</td>
                          <td className="text-center font-semibold text-slate-600 bg-slate-50">{item.unit}</td>
                          <td className="text-right font-bold text-slate-700 text-[13px]">{formatCurrency(item.price)}</td>
                          <td className="text-right font-bold text-slate-500 text-[13px]">{formatCurrency(checkup)}</td>
                          <td className="text-right pr-6 font-bold text-teal-700 text-[13px]">{formatCurrency(total)}</td>
                          <td className="text-center space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                              title="Sửa"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
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
