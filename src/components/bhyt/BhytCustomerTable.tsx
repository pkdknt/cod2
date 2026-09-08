'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit3, MessageSquare, PhoneCall, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Check, Loader2, Upload, Eye, X, Download, Image as ImageIcon } from 'lucide-react';
import { BhytCustomerData, BhytService } from '@/services/BhytService';
import { getDaysRemaining, formatVnDate, parseVnDate, compressImageFile } from '@/lib/utils';
import CccdImageModal from './CccdImageModal';

interface BhytCustomerTableProps {
  customers: BhytCustomerData[];
  loading: boolean;
  q: string;
  onSearchChange: (val: string) => void;
  expiryFilter: string;
  onExpiryFilterChange: (val: string) => void;
  workflowFilter: string;
  onWorkflowFilterChange: (val: string) => void;
  phoneFilter: string;
  onPhoneFilterChange: (val: string) => void;
  onClearFilters: () => void;
  onExportExcel?: () => void;
  isExporting?: boolean;
  
  // Sorting
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  
  // Pagination
  page: number;
  pageSize: number;
  totalFiltered: number;
  onPageChange: (val: number) => void;

  // Actions
  onEdit: (customer: BhytCustomerData) => void;
  onDelete: (id: string) => void;
  onSendMessage: (customer: BhytCustomerData) => void;
  onCall: (customer: BhytCustomerData) => void;
  onCustomerUpdate?: (customer: Partial<BhytCustomerData> & { _id: string }) => void;
}

export default function BhytCustomerTable({
  customers,
  loading,
  q,
  onSearchChange,
  expiryFilter,
  onExpiryFilterChange,
  workflowFilter,
  onWorkflowFilterChange,
  phoneFilter,
  onPhoneFilterChange,
  onClearFilters,
  onExportExcel,
  isExporting = false,
  sortBy,
  sortDir,
  onSort,
  page,
  pageSize,
  totalFiltered,
  onPageChange,
  onEdit,
  onDelete,
  onSendMessage,
  onCall,
  onCustomerUpdate
}: BhytCustomerTableProps) {
  const pages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  // ── Inline Note Edit State ───────────────────────────────────────────────
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [noteSaveStatus, setNoteSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // ── Inline CallDate Edit State ──────────────────────────────────
  const [callDateDrafts, setCallDateDrafts] = useState<Record<string, string>>({});
  const [callDateSaveStatus, setCallDateSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});
  const callDateTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // ── CCCD Image State & Lightbox ────────────────────────────────
  const [uploadingCccdId, setUploadingCccdId] = useState<string | null>(null);
  const [previewCccd, setPreviewCccd] = useState<{ cust: BhytCustomerData } | null>(null);

  /** Helper: get all images for a customer (merge legacy cccdImage into cccdImages array) */
  const getCccdImages = (cust: BhytCustomerData): string[] => {
    const images = cust.cccdImages ? [...cust.cccdImages] : [];
    // Backward compat: include legacy single cccdImage if not already in array
    if (cust.cccdImage && !images.includes(cust.cccdImage)) {
      images.unshift(cust.cccdImage);
    }
    return images.filter(Boolean);
  };

  /** Upload one or more new images — appends to existing cccdImages */
  const handleCccdAddImages = async (cust: BhytCustomerData, files: File[]) => {
    if (!files.length || !cust._id) return;
    setUploadingCccdId(cust._id);
    try {
      const newBase64s = await Promise.all(files.map(f => compressImageFile(f)));
      const existing = getCccdImages(cust);
      const merged = [...existing, ...newBase64s].slice(0, 10); // max 10 images
      await BhytService.update(cust._id, { cccdImages: merged });
      onCustomerUpdate?.({ _id: cust._id, cccdImages: merged });
    } catch (err: any) {
      alert('Lỗi tải ảnh CCCD: ' + (err?.message || 'Không thể xử lý ảnh'));
    } finally {
      setUploadingCccdId(null);
    }
  };

  /** Delete image at a specific index from cccdImages */
  const handleCccdDeleteImage = async (cust: BhytCustomerData, index: number) => {
    if (!cust._id) return;
    setUploadingCccdId(cust._id);
    try {
      const existing = getCccdImages(cust);
      const updated = existing.filter((_, i) => i !== index);
      await BhytService.update(cust._id, { cccdImages: updated, cccdImage: updated[0] ?? '' });
      onCustomerUpdate?.({ _id: cust._id, cccdImages: updated, cccdImage: updated[0] ?? '' });
      // Close lightbox if no images remain
      if (updated.length === 0 && previewCccd?.cust._id === cust._id) {
        setPreviewCccd(null);
      }
    } catch (err: any) {
      alert('Lỗi xóa ảnh CCCD: ' + (err?.message || 'Thao tác thất bại'));
    } finally {
      setUploadingCccdId(null);
    }
  };

  // Convert dd/MM/yyyy → yyyy-MM-dd (for HTML date input value)
  const toInputDate = (vnDate: string | undefined): string => {
    if (!vnDate) return '';
    const parts = vnDate.split('/');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
  };

  // Convert yyyy-MM-dd → dd/MM/yyyy (for storing)
  const toVnDate = (isoDate: string): string => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  const saveCallDateImmediately = useCallback(
    async (cust: BhytCustomerData, isoValue: string) => {
      const id = cust._id!;
      if (callDateTimers.current[id]) clearTimeout(callDateTimers.current[id]);
      setCallDateSaveStatus(prev => ({ ...prev, [id]: 'saving' }));
      const vnDate = toVnDate(isoValue);
      try {
        await BhytService.update(id, { callDate: vnDate });
        setCallDateSaveStatus(prev => ({ ...prev, [id]: 'saved' }));
        onCustomerUpdate?.({ _id: id, callDate: vnDate });
        setTimeout(() => {
          setCallDateSaveStatus(prev => ({ ...prev, [id]: 'idle' }));
        }, 2000);
      } catch {
        setCallDateSaveStatus(prev => ({ ...prev, [id]: 'idle' }));
      }
    },
    [onCustomerUpdate]
  );

  const handleCallDateChange = useCallback(
    (cust: BhytCustomerData, isoValue: string) => {
      const id = cust._id!;
      setCallDateDrafts(prev => ({ ...prev, [id]: isoValue }));
      setCallDateSaveStatus(prev => ({ ...prev, [id]: 'idle' }));

      if (callDateTimers.current[id]) clearTimeout(callDateTimers.current[id]);
      callDateTimers.current[id] = setTimeout(() => {
        saveCallDateImmediately(cust, isoValue);
      }, 800);
    },
    [saveCallDateImmediately]
  );

  // Auto-resize textarea helper
  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  const saveNoteImmediately = useCallback(
    async (cust: BhytCustomerData, value: string) => {
      const id = cust._id!;
      if (noteTimers.current[id]) clearTimeout(noteTimers.current[id]);
      setNoteSaveStatus(prev => ({ ...prev, [id]: 'saving' }));
      try {
        await BhytService.update(id, { note: value });
        setNoteSaveStatus(prev => ({ ...prev, [id]: 'saved' }));
        onCustomerUpdate?.({ _id: id, note: value });
        setTimeout(() => {
          setNoteSaveStatus(prev => ({ ...prev, [id]: 'idle' }));
        }, 2000);
      } catch {
        setNoteSaveStatus(prev => ({ ...prev, [id]: 'idle' }));
      }
    },
    [onCustomerUpdate]
  );

  const handleNoteChange = useCallback(
    (cust: BhytCustomerData, value: string, textareaEl: HTMLTextAreaElement) => {
      const id = cust._id!;
      setNoteDrafts(prev => ({ ...prev, [id]: value }));
      setNoteSaveStatus(prev => ({ ...prev, [id]: 'idle' }));
      autoResize(textareaEl);

      if (noteTimers.current[id]) clearTimeout(noteTimers.current[id]);
      noteTimers.current[id] = setTimeout(() => {
        saveNoteImmediately(cust, value);
      }, 1500);
    },
    [saveNoteImmediately]
  );

  const handleNoteBlur = useCallback(
    (cust: BhytCustomerData) => {
      const id = cust._id!;
      const currentDraft = noteDrafts[id];
      if (currentDraft !== undefined && currentDraft !== (cust.note ?? '')) {
        saveNoteImmediately(cust, currentDraft);
      }
    },
    [noteDrafts, saveNoteImmediately]
  );

  const handleCallDateBlur = useCallback(
    (cust: BhytCustomerData) => {
      const id = cust._id!;
      const currentDraft = callDateDrafts[id];
      if (currentDraft !== undefined && currentDraft !== toInputDate(cust.callDate)) {
        saveCallDateImmediately(cust, currentDraft);
      }
    },
    [callDateDrafts, saveCallDateImmediately]
  );

  const handleEditClick = (cust: BhytCustomerData) => {
    const id = cust._id!;
    const draftNote = noteDrafts[id] !== undefined ? noteDrafts[id] : (cust.note ?? '');
    const draftCallDateInput = callDateDrafts[id] !== undefined ? callDateDrafts[id] : toInputDate(cust.callDate);
    const draftCallDateVn = toVnDate(draftCallDateInput);

    if (draftNote !== (cust.note ?? '')) {
      saveNoteImmediately(cust, draftNote);
    }
    if (draftCallDateInput !== toInputDate(cust.callDate)) {
      saveCallDateImmediately(cust, draftCallDateInput);
    }

    onEdit({
      ...cust,
      note: draftNote,
      callDate: draftCallDateVn || cust.callDate
    });
  };

  // Synchronise drafts from props whenever customers list updates
  useEffect(() => {
    setNoteDrafts(prev => {
      const next = { ...prev };
      customers.forEach(c => {
        next[c._id!] = c.note ?? '';
      });
      return next;
    });
    setCallDateDrafts(prev => {
      const next = { ...prev };
      customers.forEach(c => {
        next[c._id!] = toInputDate(c.callDate);
      });
      return next;
    });
  }, [customers]);

  const renderSortIcon = (key: string) => {
    if (sortBy !== key) {
      return <ArrowUpDown className="inline-block ml-1.5 h-3.5 w-3.5 opacity-40 text-slate-400" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="inline-block ml-1.5 h-3.5 w-3.5 text-teal-600 font-bold" />
    ) : (
      <ArrowDown className="inline-block ml-1.5 h-3.5 w-3.5 text-teal-600 font-bold" />
    );
  };

  const getBadgeClass = (expiryStr: string | undefined) => {
    const days = getDaysRemaining(expiryStr);
    if (days === null) return 'bg-slate-100 text-slate-700';
    if (days < 0) return 'bg-red-50 text-red-700 border border-red-100';
    if (days <= 15) return 'bg-amber-50 text-amber-700 border border-amber-100';
    if (days <= 30) return 'bg-blue-50 text-blue-700 border border-blue-100';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  };

  const getBadgeLabel = (expiryStr: string | undefined) => {
    const days = getDaysRemaining(expiryStr);
    if (days === null) return 'Chưa có hạn';
    if (days < 0) return 'Đã hết hạn';
    if (days <= 15) return 'Còn ≤ 15 ngày';
    if (days <= 30) return 'Còn 16–30 ngày';
    return 'Còn hiệu lực';
  };

  const getDaysRemainingText = (expiryStr: string | undefined) => {
    const days = getDaysRemaining(expiryStr);
    if (days === null) return 'Chưa xác định';
    if (days < 0) return `${days}`;
    if (days === 0) return 'Hết hạn hôm nay';
    return `Còn ${days} ngày`;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã BHXH, CCCD..."
            value={q}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
          />
        </div>

        <select
          value={expiryFilter}
          onChange={(e) => onExpiryFilterChange(e.target.value)}
          className="text-sm rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-500 bg-white font-semibold text-slate-700"
        >
          <option value="">Tất cả hạn thẻ</option>
          <option value="expired">Đã hết hạn</option>
          <option value="due15">Còn ≤ 15 ngày</option>
          <option value="due30">Còn 16–30 ngày</option>
          <option value="active">Còn hiệu lực</option>
          <option value="unknown">Chưa có hạn thẻ</option>
        </select>

        <select
          value={workflowFilter}
          onChange={(e) => onWorkflowFilterChange(e.target.value)}
          className="text-sm rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-500 bg-white font-semibold text-slate-700"
        >
          <option value="">Tất cả xử lý</option>
          <option value="Chưa liên hệ">Chưa liên hệ</option>
          <option value="Đã gửi tin">Đã gửi tin</option>
          <option value="Đã gọi">Đã gọi</option>
          <option value="Hẹn liên hệ lại">Hẹn liên hệ lại</option>
          <option value="Đã gia hạn">Đã gia hạn</option>
          <option value="Không liên lạc được">Không liên lạc được</option>
          <option value="Không có nhu cầu">Không có nhu cầu</option>
        </select>

        <select
          value={phoneFilter}
          onChange={(e) => onPhoneFilterChange(e.target.value)}
          className="text-sm rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-teal-500 bg-white font-semibold text-slate-700"
        >
          <option value="">Tất cả số điện thoại</option>
          <option value="has">Có số điện thoại</option>
          <option value="missing">Thiếu số điện thoại</option>
        </select>

        <button
          onClick={onClearFilters}
          className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
        >
          Xóa bộ lọc
        </button>

        {onExportExcel && (
          <button
            onClick={onExportExcel}
            disabled={isExporting}
            className="w-full py-2.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-xs font-bold text-teal-800 transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-60"
            title="Xuất toàn bộ danh sách hiện tại ra file Excel (.xlsx) kèm ảnh CCCD"
          >
            {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" /> : <Download className="h-3.5 w-3.5 text-teal-600" />}
            <span>{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative max-h-[calc(100vh-220px)] scrollbar-thin">
          <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b-2 border-slate-200 text-slate-600 font-extrabold h-11">
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('name')}>
                  Khách hàng {renderSortIcon('name')}
                </th>
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('bhxh')}>
                  Mã BHXH {renderSortIcon('bhxh')}
                </th>
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('phone')}>
                  Điện thoại {renderSortIcon('phone')}
                </th>
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('kcb')}>
                  Nơi KCB ban đầu {renderSortIcon('kcb')}
                </th>
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('expiry')}>
                  Hạn thẻ {renderSortIcon('expiry')}
                </th>
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('days')}>
                  Còn lại {renderSortIcon('days')}
                </th>
                <th className="px-4 text-left cursor-pointer hover:bg-slate-100" onClick={() => onSort('workflow')}>
                  Xử lý {renderSortIcon('workflow')}
                </th>
                <th className="px-4 text-left whitespace-nowrap">Ngày liên hệ</th>
                <th className="px-4 text-left min-w-[180px]">Ghi chú</th>
                <th className="px-3 text-center whitespace-nowrap">Ảnh CCCD</th>
                <th className="px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center py-20 text-slate-500 font-bold text-sm">
                    Đang tải dữ liệu khách hàng...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-20 text-slate-400 font-bold text-sm">
                    Không tìm thấy khách hàng phù hợp
                  </td>
                </tr>
              ) : (
                customers.map((cust) => {
                  const saveStatus = noteSaveStatus[cust._id!] ?? 'idle';
                  const noteDraft = noteDrafts[cust._id!] ?? cust.note ?? '';
                  const callDateStatus = callDateSaveStatus[cust._id!] ?? 'idle';
                  const callDateInput = callDateDrafts[cust._id!] ?? toInputDate(cust.callDate);
                  const cccdImgs = getCccdImages(cust);
                  const cccdCount = cccdImgs.length;
                  return (
                  <tr key={cust._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors align-top">
                    <td className="px-4 py-2.5 font-bold text-slate-800">
                      <div>{cust.name}</div>
                      {cust.dob && (
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {cust.gender || ''} {cust.dob ? `· ${cust.dob}` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono font-medium text-slate-600">{cust.bhxh}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-700">
                      {cust.phone ? (
                        <a href={`tel:${cust.phone}`} className="text-teal-600 hover:underline">
                          {cust.phone}
                        </a>
                      ) : (
                        <span className="text-slate-300 font-medium">Chưa có</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 max-w-[240px] truncate" title={cust.kcb}>
                      {cust.kcb || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-700">{cust.expiry || '—'}</div>
                      <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-bold mt-1 ${getBadgeClass(cust.expiry)}`}>
                        {getBadgeLabel(cust.expiry)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700">{getDaysRemainingText(cust.expiry)}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {cust.workflowStatus || 'Chưa liên hệ'}
                      </span>
                    </td>

                    {/* ── Ngày liên hệ inline ─────────────────────────── */}
                    <td className="px-2 py-1.5">
                      <div className="relative">
                        <input
                          type="date"
                          value={callDateInput}
                          onChange={(e) => handleCallDateChange(cust, e.target.value)}
                          onBlur={() => handleCallDateBlur(cust)}
                          className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-slate-600 transition-all
                            focus:outline-none focus:border-teal-300 focus:bg-white focus:shadow-sm
                            hover:border-slate-200 hover:bg-slate-50 cursor-pointer"
                        />
                        {callDateStatus === 'saving' && (
                          <Loader2 className="absolute right-2 top-1.5 h-3 w-3 text-slate-400 animate-spin pointer-events-none" />
                        )}
                        {callDateStatus === 'saved' && (
                          <Check className="absolute right-2 top-1.5 h-3 w-3 text-teal-500 pointer-events-none" />
                        )}
                      </div>
                    </td>

                    {/* ── Ghi chú inline ─────────────────────────────────── */}
                    <td className="px-2 py-1.5 min-w-[180px]">
                      <div className="relative group">
                        <textarea
                          rows={1}
                          value={noteDraft}
                          placeholder="Thêm ghi chú..."
                          spellCheck={false}
                          onChange={(e) => handleNoteChange(cust, e.target.value, e.currentTarget)}
                          onFocus={(e) => autoResize(e.currentTarget)}
                          onBlur={() => handleNoteBlur(cust)}
                          className="w-full resize-none overflow-hidden rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-slate-700 placeholder-slate-300 leading-relaxed transition-all focus:outline-none focus:border-teal-300 focus:bg-white focus:shadow-sm hover:border-slate-200 hover:bg-slate-50"
                          style={{ minHeight: '28px' }}
                        />
                        {saveStatus === 'saving' && (
                          <Loader2 className="absolute right-2 top-1.5 h-3 w-3 text-slate-400 animate-spin" />
                        )}
                        {saveStatus === 'saved' && (
                          <Check className="absolute right-2 top-1.5 h-3 w-3 text-teal-500" />
                        )}
                      </div>
                    </td>

                    {/* ── Ảnh CCCD ───────────────────────────────────── */}
                    <td className="px-3 py-2 text-center align-middle">
                      {uploadingCccdId === cust._id ? (
                        <div className="flex items-center justify-center gap-1 text-slate-400 font-medium text-[10px]">
                          <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                        </div>
                      ) : cccdCount > 0 ? (
                        <div className="relative group inline-block">
                          <div
                            onClick={() => setPreviewCccd({ cust })}
                            className="w-12 h-8 rounded-lg border border-slate-200 shadow-2xs overflow-hidden bg-slate-100 cursor-pointer relative hover:ring-2 hover:ring-teal-400 hover:scale-105 transition-all"
                            title={`Xem ${cccdCount} ảnh CCCD`}
                          >
                            <img
                              src={cccdImgs[0]}
                              alt={`CCCD ${cust.name}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="h-3 w-3 text-white drop-shadow" />
                            </div>
                          </div>
                          {cccdCount > 1 && (
                            <span className="absolute -top-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-600 text-white shadow pointer-events-none">
                              {cccdCount}
                            </span>
                          )}
                          {/* Hover: add more button */}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <label
                              className="p-1 bg-white rounded-full border border-slate-200 text-slate-600 hover:text-teal-600 hover:border-teal-300 shadow-sm cursor-pointer"
                              title="Thêm ảnh CCCD"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Upload className="h-2.5 w-2.5" />
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(e.target.files ?? []);
                                  handleCccdAddImages(cust, files);
                                  e.target.value = '';
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-dashed border-teal-300 bg-teal-50/60 hover:bg-teal-100/70 text-teal-700 font-bold text-[11px] cursor-pointer transition-colors shadow-2xs">
                          <Upload className="h-3 w-3 shrink-0" />
                          <span>Tải ảnh</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files ?? []);
                              handleCccdAddImages(cust, files);
                              e.target.value = '';
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </td>

                    <td className="px-4 py-2.5 text-center">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(cust)}
                          title="Sửa thông tin"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 text-slate-600 transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onSendMessage(cust)}
                          title="Sao chép tin nhắn"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-600 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onCall(cust)}
                          title="Gọi điện thoại"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-600 transition-colors"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(cust._id!)}
                          title="Xóa khách hàng"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-bold">
          <span>
            {totalFiltered > 0
              ? `Hiển thị ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalFiltered)} / ${totalFiltered} khách`
              : '0 khách'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3">Trang {page} / {pages}</span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= pages}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CCCD Image Preview Lightbox Modal */}
      {previewCccd && (
        <CccdImageModal
          images={getCccdImages(previewCccd.cust)}
          customerName={previewCccd.cust.name}
          bhxh={previewCccd.cust.bhxh}
          cccd={previewCccd.cust.cccd}
          onClose={() => setPreviewCccd(null)}
          onAddImages={(files) => handleCccdAddImages(previewCccd.cust, files)}
          onDeleteImage={(idx) => handleCccdDeleteImage(previewCccd.cust, idx)}
        />
      )}
    </div>
  );
}
