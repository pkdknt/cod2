'use client';

import React, { useState } from 'react';
import { CalendarDays, ClipboardList, Clock, Printer, Upload } from 'lucide-react';
import PlannerTab from '@/components/cskh-tiem-chung/PlannerTab';
import SavedCustomersTab from '@/components/cskh-tiem-chung/SavedCustomersTab';
import RemindersTab from '@/components/cskh-tiem-chung/RemindersTab';
import ImportExcelModal from '@/components/cskh-tiem-chung/ImportExcelModal';
import { usePlanner } from '@/hooks/usePlanner';
import { useSavedSchedules } from '@/hooks/useSavedSchedules';
import type { PatientRecord } from '@/lib/types';

export default function CskhTiemChungPage() {
  const [activeTab, setActiveTab] = useState('plannerSec');
  const [showImportModal, setShowImportModal] = useState(false);

  const list = useSavedSchedules();
  const planner = usePlanner({
    onSaved: () => {
      list.refresh();
      setActiveTab('savedSec');
    },
    onEditStart: () => setActiveTab('plannerSec'),
  });

  const handleDeleteSchedule = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa lịch tiêm của bệnh nhân này?')) {
      try {
        const res = await fetch(`/api/cskh-tiem-chung?id=${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        alert(result.message);
        list.refresh();
      } catch (err) {
        alert((err as Error).message);
      }
    }
  };

  const handleDeleteSelected = async (ids: string[]) => {
    if (confirm(`Bạn có chắc muốn xóa ${ids.length} hồ sơ đã chọn?`)) {
      try {
        const res = await fetch(`/api/cskh-tiem-chung?ids=${ids.join(',')}`, { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        alert(result.message);
        list.setSelectedIds([]);
        list.refresh();
      } catch (err) {
        alert((err as Error).message);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (confirm('Bạn có CỰC KỲ CHẮC CHẮN muốn xóa TOÀN BỘ danh sách lịch tiêm chủng hiện tại không? Thao tác này không thể hoàn tác!')) {
      try {
        const res = await fetch('/api/cskh-tiem-chung?all=true', { method: 'DELETE' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        alert(result.message);
        list.setSelectedIds([]);
        list.refresh();
      } catch (err) {
        alert((err as Error).message);
      }
    }
  };

  const handleEdit = (item: PatientRecord) => planner.loadFromRecord(item);

  return (
    <div className="flex flex-col h-auto md:h-full gap-3 min-h-0">
      {/* Title Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardList className="h-5 w-5 md:h-6 md:w-6 text-teal-600" /> QUẢN LÝ CSKH TIÊM CHỦNG
          </h1>
          <p className="text-[11px] md:text-xs text-slate-500 font-semibold mt-0.5">
            Lập kế hoạch, theo dõi tiến độ và xuất danh sách nhắc hẹn vắc xin CSKH.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-250 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 hover:bg-teal-100 transition-colors"
          >
            <Upload className="h-4 w-4" /> Nhập Excel Khách Hàng
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-55"
          >
            <Printer className="h-4 w-4" /> In Phiếu Tiêm Chủng
          </button>
          <button
            onClick={planner.save}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-teal-500"
          >
            Lưu Lịch Tiêm
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-[500px] gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('plannerSec')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'plannerSec' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Lập lịch tiêm
        </button>
        <button
          onClick={() => setActiveTab('savedSec')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'savedSec' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <Clock className="h-4 w-4" />
          DS Khách hàng
        </button>
        <button
          onClick={() => setActiveTab('remindersSec')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'remindersSec' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          Nhắc lịch hẹn
        </button>
      </div>

      {/* TAB 1: LẬP LỊCH TIÊM */}
      {activeTab === 'plannerSec' && <PlannerTab planner={planner} />}

      {/* TAB 2: DANH SÁCH LỊCH TIÊM ĐÃ LƯU */}
      {activeTab === 'savedSec' && (
        <SavedCustomersTab
          list={list}
          onEdit={handleEdit}
          onDelete={handleDeleteSchedule}
          onDeleteSelected={handleDeleteSelected}
          onDeleteAll={handleDeleteAll}
        />
      )}

      {/* TAB 3: DANH SÁCH NHẮC HẸN */}
      {activeTab === 'remindersSec' && (
        <RemindersTab onEdit={handleEdit} onDelete={handleDeleteSchedule} />
      )}

      <ImportExcelModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImported={list.refresh}
      />
    </div>
  );
}
