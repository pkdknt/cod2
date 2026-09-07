import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Check, Loader2 } from 'lucide-react';
import { BhytSoCaData, BhytSoCaService } from '@/services/BhytSoCaService';

interface BhytSoCaListProps {
  items: BhytSoCaData[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  monthFilter: string;
  onMonthFilterChange: (val: string) => void;
  typeFilter: string;
  onTypeFilterChange: (val: string) => void;
  onEdit: (item: BhytSoCaData) => void;
  onDelete: (id: string) => void;
  monthsList: string[];
  onItemUpdate?: (item: Partial<BhytSoCaData> & { _id: string }) => void;
}

export default function BhytSoCaList({
  items,
  loading,
  searchTerm,
  onSearchChange,
  monthFilter,
  onMonthFilterChange,
  typeFilter,
  onTypeFilterChange,
  onEdit,
  onDelete,
  monthsList,
  onItemUpdate
}: BhytSoCaListProps) {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Inline Note Edit State
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [noteSaveStatus, setNoteSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const saveNoteImmediately = useCallback(
    async (item: BhytSoCaData, value: string) => {
      const id = item._id!;
      if (noteTimers.current[id]) clearTimeout(noteTimers.current[id]);
      setNoteSaveStatus(prev => ({ ...prev, [id]: 'saving' }));
      try {
        await BhytSoCaService.update(id, { note: value });
        setNoteSaveStatus(prev => ({ ...prev, [id]: 'saved' }));
        onItemUpdate?.({ _id: id, note: value });
        setTimeout(() => {
          setNoteSaveStatus(prev => ({ ...prev, [id]: 'idle' }));
        }, 2000);
      } catch {
        setNoteSaveStatus(prev => ({ ...prev, [id]: 'idle' }));
      }
    },
    [onItemUpdate]
  );

  const handleNoteChange = useCallback(
    (item: BhytSoCaData, value: string) => {
      const id = item._id!;
      setNoteDrafts(prev => ({ ...prev, [id]: value }));
      setNoteSaveStatus(prev => ({ ...prev, [id]: 'idle' }));

      if (noteTimers.current[id]) clearTimeout(noteTimers.current[id]);
      noteTimers.current[id] = setTimeout(() => {
        saveNoteImmediately(item, value);
      }, 1500);
    },
    [saveNoteImmediately]
  );

  const handleNoteBlur = useCallback(
    (item: BhytSoCaData) => {
      const id = item._id!;
      const currentDraft = noteDrafts[id];
      if (currentDraft !== undefined && currentDraft !== (item.note ?? '')) {
        saveNoteImmediately(item, currentDraft);
      }
    },
    [noteDrafts, saveNoteImmediately]
  );

  const handleEditClick = (item: BhytSoCaData) => {
    const id = item._id!;
    const draftNote = noteDrafts[id] !== undefined ? noteDrafts[id] : (item.note ?? '');

    if (draftNote !== (item.note ?? '')) {
      saveNoteImmediately(item, draftNote);
    }

    onEdit({
      ...item,
      note: draftNote
    });
  };

  useEffect(() => {
    setNoteDrafts(prev => {
      const next = { ...prev };
      items.forEach(i => {
        next[i._id!] = i.note ?? '';
      });
      return next;
    });
  }, [items]);

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

  const sortedItems = useMemo(() => {
    if (!sortKey) return items;
    
    return [...items].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortKey === 'date') {
        aVal = a.date || '';
        bVal = b.date || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortKey === 'type') {
        aVal = a.type || '';
        bVal = b.type || '';
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (sortKey === 'qty') {
        aVal = a.qty || 0;
        bVal = b.qty || 0;
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      } else if (sortKey === 'note') {
        aVal = a.note || '';
        bVal = b.note || '';
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal, 'vi', { sensitivity: 'accent' }) 
          : bVal.localeCompare(aVal, 'vi', { sensitivity: 'accent' });
      }
      return 0;
    });
  }, [items, sortKey, sortDirection]);

  const formatVnDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const monthLabel = (k: string) => {
    if (!k) return '';
    const [y, m] = k.split('-');
    return `${m}/${y}`;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input
            id="search"
            placeholder="Tìm theo ghi chú..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-teal-500 bg-white"
          />
        </div>
        <select
          value={monthFilter}
          onChange={(e) => onMonthFilterChange(e.target.value)}
          className="rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none w-full"
        >
          <option value="">Tất cả tháng</option>
          {monthsList.map((m) => (
            <option key={m} value={m}>{monthLabel(m)}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="rounded-xl border border-slate-200 p-2.5 text-xs font-semibold bg-white focus:border-teal-500 outline-none w-full"
        >
          <option value="">Tất cả loại ca</option>
          <option value="Mua mới">Mua mới</option>
          <option value="Gia hạn">Gia hạn</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-teal-50/50 text-teal-800 font-bold h-11 border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <th className="w-16 text-center pl-4">STT</th>
                <th className="w-36 text-center cursor-pointer select-none group hover:bg-slate-50 hover:text-slate-705 transition-colors border border-slate-200" onClick={() => requestSort('date')}>
                  <div className="flex items-center justify-center gap-1">Ngày {renderSortIcon('date')}</div>
                </th>
                <th className="w-36 text-center cursor-pointer select-none group hover:bg-slate-50 hover:text-slate-705 transition-colors border border-slate-200" onClick={() => requestSort('type')}>
                  <div className="flex items-center justify-center gap-1">Loại ca {renderSortIcon('type')}</div>
                </th>
                <th className="w-24 text-center cursor-pointer select-none group hover:bg-slate-50 hover:text-slate-705 transition-colors border border-slate-200" onClick={() => requestSort('qty')}>
                  <div className="flex items-center justify-center gap-1">Số ca {renderSortIcon('qty')}</div>
                </th>
                <th className="pl-4 cursor-pointer select-none group hover:bg-slate-50 hover:text-slate-705 transition-colors border border-slate-200 min-w-[200px]" onClick={() => requestSort('note')}>
                  <div className="flex items-center gap-1">Ghi chú {renderSortIcon('note')}</div>
                </th>
                <th className="w-32 text-center">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-450 font-bold">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 font-bold">
                    Chưa có dữ liệu nào phù hợp.
                  </td>
                </tr>
              ) : (
                sortedItems.map((item, idx) => {
                  const saveStatus = noteSaveStatus[item._id!] ?? 'idle';
                  const noteDraft = noteDrafts[item._id!] ?? item.note ?? '';
                  return (
                  <tr key={item._id} className="border-b border-slate-100 h-10 hover:bg-slate-55 transition-colors align-top">
                    <td className="text-center pl-4 py-2 font-bold text-slate-400">{idx + 1}</td>
                    <td className="text-center py-2 text-slate-700">{formatVnDate(item.date)}</td>
                    <td className="text-center py-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        item.type === 'Mua mới'
                          ? 'bg-teal-100 text-teal-850'
                          : 'bg-blue-100 text-blue-850'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="text-center py-2 font-bold text-slate-800">{item.qty}</td>
                    <td className="px-2 py-1 min-w-[200px]">
                      <div className="relative group">
                        <input
                          type="text"
                          value={noteDraft}
                          placeholder="Thêm ghi chú..."
                          onChange={(e) => handleNoteChange(item, e.target.value)}
                          onBlur={() => handleNoteBlur(item)}
                          className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-slate-700 placeholder-slate-300 transition-all
                            focus:outline-none focus:border-teal-300 focus:bg-white focus:shadow-sm
                            hover:border-slate-200 hover:bg-slate-50"
                        />
                        {saveStatus === 'saving' && (
                          <Loader2 className="absolute right-2 top-1.5 h-3 w-3 text-slate-400 animate-spin" />
                        )}
                        {saveStatus === 'saved' && (
                          <Check className="absolute right-2 top-1.5 h-3 w-3 text-teal-500" />
                        )}
                      </div>
                    </td>
                    <td className="text-center py-2 space-x-2.5">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-teal-600 hover:text-teal-800 font-bold"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => onDelete(item._id!)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        Xóa
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
  );
}
