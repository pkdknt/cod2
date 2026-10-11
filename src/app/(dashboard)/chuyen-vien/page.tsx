'use client';

import React, { useState } from 'react';
import { BarChart3, Send, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import { useToast } from '@/components/ui/Toast';
import ReferralListTab from '@/components/chuyen-vien/ReferralListTab';
import ReferralReportTab from '@/components/chuyen-vien/ReferralReportTab';
import ImportReferralModal from '@/components/chuyen-vien/ImportReferralModal';
import { useReferralList } from '@/hooks/useReferralList';
import type { ReferralInput } from '@/lib/referral';

export default function ChuyenVienPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState('list');
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<ReferralInput | null>(null);

  const list = useReferralList();

  const handleSave = async (data: ReferralInput) => {
    const res = await fetch('/api/cskh-chuyen-vien', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      toast(result.message || 'Lỗi lưu hồ sơ', 'error');
      throw new Error(result.message || 'Lỗi lưu hồ sơ');
    }
    toast(result.message || 'Đã lưu.', 'success');
    list.refresh();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/cskh-chuyen-vien?id=${id}`, { method: 'DELETE' });
    const result = await res.json();
    toast(result.message || 'Đã xóa.', res.ok ? 'success' : 'error');
    if (res.ok) list.refresh();
  };

  const handleDeleteSelected = async (ids: string[]) => {
    const res = await fetch(`/api/cskh-chuyen-vien?ids=${ids.join(',')}`, { method: 'DELETE' });
    const result = await res.json();
    toast(result.message || 'Đã xóa.', res.ok ? 'success' : 'error');
    if (res.ok) {
      list.setSelectedIds([]);
      list.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-ink md:text-2xl">
            <Send className="h-5 w-5 text-primary md:h-6 md:w-6" /> CSKH CHUYỂN VIỆN
          </h1>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-muted md:text-xs">
            Theo dõi bệnh nhân chuyển tuyến, ghi nhận kết quả gọi CSKH và xuất báo cáo.
          </p>
        </div>
        <Button variant="primary" icon={<Upload className="h-4 w-4" />} onClick={() => setShowImport(true)}>
          Nhập Excel
        </Button>
      </div>

      <Tabs
        className="max-w-[360px]"
        active={tab}
        onChange={setTab}
        items={[
          { key: 'list', label: 'Danh sách', icon: <Send className="h-4 w-4" /> },
          { key: 'report', label: 'Báo cáo', icon: <BarChart3 className="h-4 w-4" /> },
        ]}
      />

      {tab === 'list' && (
        <ReferralListTab
          list={list}
          editing={editing}
          onEditingChange={setEditing}
          onSave={handleSave}
          onDelete={handleDelete}
          onDeleteSelected={handleDeleteSelected}
          onImport={() => setShowImport(true)}
        />
      )}

      {tab === 'report' && <ReferralReportTab />}

      <ImportReferralModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImported={list.refresh}
      />
    </div>
  );
}
