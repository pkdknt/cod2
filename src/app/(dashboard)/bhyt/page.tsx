'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ClipboardList, Download, LayoutDashboard, Settings, Users } from 'lucide-react';
import Tabs from '@/components/ui/Tabs';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Field, Textarea, Input } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import OverviewTab from '@/components/bhyt/OverviewTab';
import CustomersTab from '@/components/bhyt/CustomersTab';
import RenewalQueueTab from '@/components/bhyt/RenewalQueueTab';
import ImportBhytModal from '@/components/bhyt/ImportBhytModal';
import { useBhytList } from '@/hooks/useBhytList';
import { DEFAULT_SMS_TEMPLATE } from '@/lib/sms';
import type { BhytCustomerRecord, ExpiryBucket } from '@/lib/types';

interface BhytStats {
  total: number;
  counts: Record<ExpiryBucket, number>;
  renewed: number;
  missingPhone: number;
}

const TEMPLATE_KEY = 'bhyt_sms_template';
const THRESHOLD_KEY = 'bhyt_sms_threshold';

export default function BhytPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<Partial<BhytCustomerRecord> | null>(null);
  const [stats, setStats] = useState<BhytStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [template, setTemplate] = useState(DEFAULT_SMS_TEMPLATE);
  const [threshold, setThreshold] = useState(30);

  const list = useBhytList();

  useEffect(() => {
    try {
      const t = window.localStorage.getItem(TEMPLATE_KEY);
      if (t) setTemplate(t);
      const d = window.localStorage.getItem(THRESHOLD_KEY);
      if (d && !Number.isNaN(Number(d))) setThreshold(Number(d));
    } catch {
      /* storage unavailable — keep defaults */
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch('/api/bhyt/stats');
      const result = await res.json();
      if (res.ok) setStats(result);
    } catch (e) {
      console.error(e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSave = async (data: Partial<BhytCustomerRecord>) => {
    const res = await fetch('/api/bhyt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      toast(result.message || 'Lỗi lưu dữ liệu', 'error');
      throw new Error(result.message || 'Lỗi lưu dữ liệu');
    }
    toast(result.message || 'Đã lưu.', 'success');
    list.refresh();
    fetchStats();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/bhyt?id=${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!res.ok) {
      toast(result.message || 'Lỗi xóa', 'error');
      return;
    }
    toast(result.message || 'Đã xóa.', 'success');
    list.refresh();
    fetchStats();
  };

  const handleDeleteSelected = async (ids: string[]) => {
    const res = await fetch(`/api/bhyt?ids=${ids.join(',')}`, { method: 'DELETE' });
    const result = await res.json();
    if (!res.ok) {
      toast(result.message || 'Lỗi xóa', 'error');
      return;
    }
    toast(result.message || 'Đã xóa.', 'success');
    list.setSelectedIds([]);
    list.refresh();
    fetchStats();
  };

  const saveSettings = () => {
    try {
      window.localStorage.setItem(TEMPLATE_KEY, template);
      window.localStorage.setItem(THRESHOLD_KEY, String(threshold));
      toast('Đã lưu cài đặt tin nhắn.', 'success');
    } catch {
      toast('Không thể lưu cài đặt.', 'error');
    }
  };

  const openImport = () => setShowImport(true);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-ink md:text-2xl">
            <ClipboardList className="h-5 w-5 text-primary md:h-6 md:w-6" /> QUẢN LÝ BHYT & NHẮC GIA HẠN
          </h1>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-muted md:text-xs">
            Theo dõi hạn thẻ, chăm sóc khách hàng và gửi tin nhắn nhắc gia hạn.
          </p>
        </div>
        <Button variant="primary" icon={<Download className="h-4 w-4" />} onClick={openImport}>
          Nhập Excel
        </Button>
      </div>

      <Tabs
        className="max-w-[560px]"
        active={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'overview', label: 'Tổng quan', icon: <LayoutDashboard className="h-4 w-4" /> },
          { key: 'customers', label: 'Khách hàng', icon: <Users className="h-4 w-4" /> },
          { key: 'queue', label: 'Nhắc gia hạn', icon: <ClipboardList className="h-4 w-4" /> },
          { key: 'settings', label: 'Cài đặt', icon: <Settings className="h-4 w-4" /> },
        ]}
      />

      {activeTab === 'overview' && <OverviewTab stats={stats} loading={statsLoading} onRefresh={fetchStats} />}

      {activeTab === 'customers' && (
        <CustomersTab
          list={list}
          editing={editing}
          onEditingChange={setEditing}
          onSave={handleSave}
          onDelete={handleDelete}
          onDeleteSelected={handleDeleteSelected}
          onImport={openImport}
        />
      )}

      {activeTab === 'queue' && (
        <RenewalQueueTab
          template={template}
          thresholdDays={threshold}
          onEdit={(item) => {
            setEditing(item);
            setActiveTab('customers');
          }}
          onMarked={() => {
            list.refresh();
            fetchStats();
          }}
        />
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader title="Cài đặt tin nhắn nhắc" subtitle="Mẫu tin nhắn xuất ra file FPT SMS" />
          <div className="space-y-4">
            <Field label="Mẫu tin nhắn (Template)">
              <Textarea value={template} onChange={(e) => setTemplate(e.target.value)} rows={4} />
            </Field>
            <Field
              label="Ngưỡng tự điền template (số ngày còn lại ≤)"
              hint="Các hồ sơ còn nhiều hơn số ngày này sẽ để trống cột Template."
            >
              <Input
                type="number"
                min={0}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value) || 0)}
                className="max-w-[180px]"
              />
            </Field>
            <div className="rounded-xl border border-teal-100 bg-primary-soft p-3 text-[11px] font-semibold leading-relaxed text-primary-strong">
              Chỗ trống hỗ trợ: <code>[Ho_Ten]</code>, <code>[Ngay_Het_Han]</code>, <code>[So_Ngay_Con_Lai]</code> —
              FPT sẽ thay thế tại thời điểm gửi.
            </div>
            <Button variant="primary" onClick={saveSettings}>
              Lưu cài đặt
            </Button>
          </div>
        </Card>
      )}

      <ImportBhytModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImported={() => {
          list.refresh();
          fetchStats();
        }}
      />
    </div>
  );
}
