'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Download,
  Upload,
  CalendarDays,
  FileSpreadsheet,
  Settings,
  RefreshCw,
  FileText,
  User,
  Building2,
  TrendingUp,
  BarChart4,
  Briefcase,
  Printer,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts';

let XLSX: any = null;
if (typeof window !== 'undefined') {
  import('xlsx').then((module) => {
    XLSX = module;
  });
}

interface WarehouseItem {
  _id?: string;
  name: string;
  unit: string;
  group?: string;
}

interface WarehouseTransaction {
  _id?: string;
  date: string;
  type: 'Tồn đầu' | 'Nhập' | 'Xuất';
  itemName: string;
  unit: string;
  quantity: number;
  price: number;
  department?: string;
  employee?: string;
  note?: string;
}

interface WarehousePageProps {
  type: 'vtyt' | 'ho-ly' | 'vpp';
}

export default function WarehousePage({ type }: WarehousePageProps) {
  const warehouseLabel =
    type === 'vtyt' ? 'Vật Tư Y Tế' : type === 'ho-ly' ? 'Hộ Lý' : 'Văn Phòng Phẩm';
  const warehouseColor =
    type === 'vtyt' ? 'emerald' : type === 'ho-ly' ? 'indigo' : 'cyan';

  // State Tabs
  const [activeTab, setActiveTab] = useState('inputSec');
  
  // Database Data States
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [transactions, setTransactions] = useState<WarehouseTransaction[]>([]);
  const [employees, setEmployees] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Form input states (Transaction)
  const [formTx, setFormTx] = useState<WarehouseTransaction>({
    date: new Date().toISOString().slice(0, 10),
    type: 'Xuất',
    itemName: '',
    unit: '',
    quantity: 0,
    price: 0,
    department: '',
    employee: '',
    note: ''
  });

  // Settings / Meta edits
  const [appTitle, setAppTitle] = useState(`${warehouseLabel.toUpperCase()} NHƠN TÂM`);
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newDeptName, setNewDeptName] = useState('');

  // Search & Filters for Transactions Tab
  const [qTx, setQTx] = useState('');
  const [filterTypeTx, setFilterTypeTx] = useState('');
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);

  // Report monthly filter
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7)); // yyyy-mm

  // Excel Import
  const [importFile, setImportFile] = useState<File | null>(null);
  const [sheetsList, setSheetsList] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Load configuration and data
  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch metadata
      const metaRes = await fetch(`/api/kho/metadata?type=${type}`);
      const metaData = await metaRes.json();
      if (metaData.success && metaData.metadata) {
        setEmployees(metaData.metadata.employees || []);
        setDepartments(metaData.metadata.departments || []);
      }

      // 2. Fetch items
      const itemsRes = await fetch(`/api/kho/items?type=${type}`);
      const itemsData = await itemsRes.json();
      if (itemsData.success) {
        setItems(itemsData.items || []);
      }

      // 3. Fetch transactions
      const txRes = await fetch(`/api/kho/transactions?type=${type}`);
      const txData = await txRes.json();
      if (txData.success) {
        setTransactions(txData.transactions || []);
      }
    } catch (e) {
      console.error(e);
      alert('Không thể kết nối đến MongoDB Atlas. Vui lòng kiểm tra lại cấu hình DNS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [type]);

  // Synchronize ĐVT when selecting product name
  const handleItemNameChange = (name: string) => {
    const matched = items.find(it => it.name === name);
    setFormTx(prev => ({
      ...prev,
      itemName: name,
      unit: matched ? matched.unit : prev.unit
    }));
  };

  // Save Transaction
  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTx.itemName || !formTx.unit || formTx.quantity <= 0) {
      alert('Vui lòng nhập đầy đủ thông tin mặt hàng, ĐVT và Số lượng > 0');
      return;
    }

    try {
      const response = await fetch('/api/kho/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type, // warehouseType
          date: formTx.date,
          transactionType: formTx.type, // transaction log type ('Nhập' | 'Xuất' | 'Tồn đầu')
          itemName: formTx.itemName,
          unit: formTx.unit,
          quantity: formTx.quantity,
          price: formTx.price,
          department: formTx.department,
          employee: formTx.employee,
          note: formTx.note
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      alert('Đã lưu giao dịch kho thành công!');
      // Reset form
      setFormTx({
        date: new Date().toISOString().slice(0, 10),
        type: 'Xuất',
        itemName: '',
        unit: '',
        quantity: 0,
        price: 0,
        department: '',
        employee: '',
        note: ''
      });
      loadAllData();
    } catch (err: any) {
      alert('Lỗi lưu giao dịch: ' + err.message);
    }
  };

  // Delete Transaction
  const handleDeleteTx = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa dòng nhật ký kho này?')) {
      try {
        const response = await fetch(`/api/kho/transactions?id=${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        alert(result.message);
        loadAllData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Bulk Delete Transactions
  const handleBulkDeleteTx = async () => {
    if (selectedTxIds.length === 0) return;
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedTxIds.length} giao dịch đã chọn?`)) {
      try {
        const response = await fetch('/api/kho/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete-bulk',
            ids: selectedTxIds
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        alert(result.message);
        setSelectedTxIds([]);
        loadAllData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Add Item to Catalog
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemUnit.trim()) return;
    try {
      const response = await fetch('/api/kho/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          name: newItemName,
          unit: newItemUnit
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      alert('Thêm mặt hàng mới thành công!');
      setNewItemName('');
      setNewItemUnit('');
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete Item from Catalog
  const handleDeleteItem = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa mặt hàng này khỏi danh mục?')) {
      try {
        const response = await fetch(`/api/kho/items?id=${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        alert(result.message);
        loadAllData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Add Employee Metadata
  const handleAddEmployee = async () => {
    if (!newEmpName.trim()) return;
    const updated = [...employees, newEmpName.trim()];
    await saveMetadata(updated, departments);
    setNewEmpName('');
  };

  const handleDeleteEmployee = async (name: string) => {
    if (confirm(`Xóa nhân viên "${name}" khỏi danh mục?`)) {
      const updated = employees.filter(e => e !== name);
      await saveMetadata(updated, departments);
    }
  };

  // Add Department Metadata
  const handleAddDept = async () => {
    if (!newDeptName.trim()) return;
    const updated = [...departments, newDeptName.trim()];
    await saveMetadata(employees, updated);
    setNewDeptName('');
  };

  const handleDeleteDept = async (name: string) => {
    if (confirm(`Xóa khoa phòng "${name}" khỏi danh mục?`)) {
      const updated = departments.filter(d => d !== name);
      await saveMetadata(employees, updated);
    }
  };

  const saveMetadata = async (emps: string[], depts: string[]) => {
    try {
      const response = await fetch('/api/kho/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          employees: emps,
          departments: depts
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setEmployees(emps);
      setDepartments(depts);
    } catch (err: any) {
      alert('Lỗi lưu cấu hình: ' + err.message);
    }
  };

  // Purge Warehouse Transaction Logs
  const handleResetWarehouse = async () => {
    if (confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa SẠCH toàn bộ nhật ký giao dịch của kho ${warehouseLabel} không? Dữ liệu danh mục vẫn được giữ lại.`)) {
      try {
        const response = await fetch('/api/kho/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'clear-all',
            type
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        alert(result.message);
        loadAllData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Days in month calculation
  const getDaysInMonth = () => {
    if (!reportMonth) return 30;
    const [year, month] = reportMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = getDaysInMonth();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Compute Inventory Sheet dataset
  const generateReportRows = () => {
    // Unique list of product names used in transactions
    const txItems = Array.from(new Set(transactions.map(t => t.itemName).filter(Boolean)));
    // Combine with current items catalog to ensure all items are listed
    const allItemNames = Array.from(new Set([...items.map(it => it.name), ...txItems]));

    const [y, m] = reportMonth.split('-').map(Number);

    return allItemNames.map(name => {
      const unit = items.find(it => it.name === name)?.unit || transactions.find(t => t.itemName === name)?.unit || 'Cái';
      
      // All transactions for this item before the selected month (determines beginning inventory)
      const prevTxs = transactions.filter(t => {
        if (t.itemName !== name) return false;
        const tDate = new Date(t.date);
        const tYear = tDate.getFullYear();
        const tMonth = tDate.getMonth() + 1;
        return tYear < y || (tYear === y && tMonth < m);
      });

      // Calculate Ton dau (Beginning balance) = Ton dau_prev + Nhap_prev - Xuat_prev
      const tdPrev = prevTxs.filter(t => t.type === 'Tồn đầu').reduce((sum, t) => sum + t.quantity, 0);
      const nhPrev = prevTxs.filter(t => t.type === 'Nhập').reduce((sum, t) => sum + t.quantity, 0);
      const xuPrev = prevTxs.filter(t => t.type === 'Xuất').reduce((sum, t) => sum + t.quantity, 0);
      const tonDau = tdPrev + nhPrev - xuPrev;

      // Current month transactions
      const currTxs = transactions.filter(t => {
        if (t.itemName !== name) return false;
        const tDate = new Date(t.date);
        return tDate.getFullYear() === y && (tDate.getMonth() + 1) === m;
      });

      const imports = currTxs.filter(t => t.type === 'Nhập');
      const exports = currTxs.filter(t => t.type === 'Xuất');
      const tonDauTx = currTxs.filter(t => t.type === 'Tồn đầu');

      // Tồn đầu record in current month overrides calculation if exists
      const currentTonDau = tonDauTx.length > 0 ? tonDauTx.reduce((sum, t) => sum + t.quantity, 0) : tonDau;

      const sumImport = imports.reduce((sum, t) => sum + t.quantity, 0);
      const sumExport = exports.reduce((sum, t) => sum + t.quantity, 0);
      
      const lastImportTx = imports.at(-1);
      const lastExportTx = exports.at(-1);

      const importDate = lastImportTx ? lastImportTx.date : '';
      const importPrice = lastImportTx ? lastImportTx.price : 0;
      const exportPrice = lastExportTx ? lastExportTx.price : importPrice;

      const ttImport = (currentTonDau + sumImport) * importPrice;
      const ttExport = sumExport * exportPrice;
      const tienTon = ttImport - ttExport;
      const tonCuoi = currentTonDau + sumImport - sumExport;

      // Daily exports array mapping
      const dailyExports = daysArray.map(day => {
        return currTxs
          .filter(t => t.type === 'Xuất' && new Date(t.date).getDate() === day)
          .reduce((sum, t) => sum + t.quantity, 0);
      });

      return {
        name,
        unit,
        tonDau: currentTonDau,
        importDate,
        sumImport,
        importPrice,
        ttImport,
        sumExport,
        exportPrice,
        ttExport,
        tienTon,
        tonCuoi,
        dailyExports
      };
    });
  };

  const reportRows = generateReportRows();

  // Excel-style columns sum helper
  const getDailyColExportTotal = (day: number) => {
    return reportRows.reduce((sum, row) => sum + (row.dailyExports[day - 1] || 0), 0);
  };

  const getColTotalSum = (field: 'tonDau' | 'sumImport' | 'ttImport' | 'sumExport' | 'ttExport' | 'tienTon' | 'tonCuoi') => {
    return reportRows.reduce((sum, row) => sum + (row[field] || 0), 0);
  };

  // Excel Import
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setImportFile(file);
    setImportStatus('Đang đọc file Excel...');

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
    setImportStatus('Đang import giao dịch...');
    try {
      if (!XLSX) throw new Error('Thư viện Excel chưa được tải');
      
      const fileData = await importFile.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' });
      const sheet = workbook.Sheets[selectedSheet];
      const json = XLSX.utils.sheet_to_json(sheet) as any[];

      const mappedItems = json.map((row: any) => {
        const findVal = (keys: string[]) => {
          const matchKey = Object.keys(row).find((k) =>
            keys.includes(k.trim().toLowerCase())
          );
          return matchKey ? String(row[matchKey]).trim() : '';
        };

        const q = parseFloat(findVal(['số lượng', 'sl', 'soluong', 'quantity']));
        const p = parseFloat(findVal(['đơn giá', 'dg', 'dongia', 'price']));

        return {
          date: findVal(['ngày', 'ngay', 'date']) || new Date().toISOString().slice(0, 10),
          type: findVal(['loại', 'kiểu', 'loai', 'type']) || 'Xuất',
          itemName: findVal(['tên hàng', 'tên', 'ten_hang', 'itemname', 'name']),
          unit: findVal(['đvt', 'đơn vị tính', 'unit']) || 'Cái',
          quantity: isNaN(q) ? 0 : q,
          price: isNaN(p) ? 0 : p,
          department: findVal(['khoa phòng', 'khoaphong', 'department']),
          employee: findVal(['nhân viên', 'nhanvien', 'employee']),
          note: findVal(['ghi chú', 'ghi_chu', 'note'])
        };
      });

      const validItems = mappedItems.filter((item) => item.itemName);
      if (validItems.length === 0) {
        throw new Error('Không tìm thấy cột Tên hàng hợp lệ');
      }

      const res = await fetch('/api/kho/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import',
          type,
          items: validItems
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Lỗi server khi import');

      alert(result.message);
      setShowImportModal(false);
      setImportFile(null);
      setSheetsList([]);
      loadAllData();
    } catch (err: any) {
      setImportStatus('Lỗi import: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const exportToExcel = () => {
    if (!XLSX) {
      alert('Thư viện Excel đang tải, vui lòng thử lại sau');
      return;
    }
    if (reportRows.length === 0) {
      alert('Danh sách rỗng, không thể xuất file');
      return;
    }

    const exportHeaders = [
      'STT',
      'Tên hàng',
      'ĐVT',
      ...daysArray.map(d => `Ngày ${d}`),
      'Tồn đầu',
      'Ngày nhập',
      'SL nhập',
      'ĐG nhập',
      'TT nhập',
      'SL xuất',
      'ĐG xuất',
      'TT xuất',
      'Tiền tồn',
      'Tồn cuối'
    ];

    const dataRows = reportRows.map((row, index) => [
      index + 1,
      row.name,
      row.unit,
      ...row.dailyExports,
      row.tonDau,
      row.importDate,
      row.sumImport,
      row.importPrice,
      row.ttImport,
      row.sumExport,
      row.exportPrice,
      row.ttExport,
      row.tienTon,
      row.tonCuoi
    ]);

    // Summary totals row
    const dailyColSums = daysArray.map(d => getDailyColExportTotal(d));
    dataRows.push([
      '',
      'TỔNG CỘNG',
      '',
      ...dailyColSums,
      getColTotalSum('tonDau'),
      '',
      getColTotalSum('sumImport'),
      '',
      getColTotalSum('ttImport'),
      getColTotalSum('sumExport'),
      '',
      getColTotalSum('ttExport'),
      getColTotalSum('tienTon'),
      getColTotalSum('tonCuoi')
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([exportHeaders, ...dataRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kho_NhapXuatTon');
    XLSX.writeFile(workbook, `BaoCao_Kho_${type.toUpperCase()}_NhonTam_${reportMonth}.xlsx`);
  };

  const handleSelectAllTx = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTxIds(filteredTransactions.map((c) => c._id as string).filter(Boolean));
    } else {
      setSelectedTxIds([]);
    }
  };

  const handleSelectRowTx = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedTxIds((prev) => [...prev, id]);
    } else {
      setSelectedTxIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Filtered Transactions in Log Tab
  const filteredTransactions = transactions.filter(t => {
    if (qTx) {
      const match = t.itemName.toLowerCase().includes(qTx.toLowerCase()) ||
                    (t.department || '').toLowerCase().includes(qTx.toLowerCase()) ||
                    (t.employee || '').toLowerCase().includes(qTx.toLowerCase());
      if (!match) return false;
    }
    if (filterTypeTx && t.type !== filterTypeTx) return false;
    if (filterFromDate && t.date < filterFromDate) return false;
    if (filterToDate && t.date > filterToDate) return false;
    return true;
  });

  // Recharts Chart builders
  const getConsumptionData = () => {
    return reportRows
      .map(row => ({
        name: row.name,
        'Lượng tiêu thụ': row.sumExport
      }))
      .filter(row => row['Lượng tiêu thụ'] > 0)
      .sort((a,b) => b['Lượng tiêu thụ'] - a['Lượng tiêu thụ'])
      .slice(0, 10);
  };

  const getDailyTrendData = () => {
    return daysArray.map(day => {
      const total = reportRows.reduce((sum, row) => sum + (row.dailyExports[day - 1] || 0), 0);
      return {
        name: `Ngày ${day}`,
        'Tổng xuất': total
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            📦 KHO: {warehouseLabel.toUpperCase()}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            PHÒNG KHÁM ĐA KHOA NHƠN TÂM • Quản lý xuất nhập tồn {warehouseLabel.toLowerCase()}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className={`inline-flex items-center gap-1.5 rounded-xl border border-${warehouseColor}-200 bg-${warehouseColor}-50 px-4 py-2.5 text-xs font-bold text-${warehouseColor}-700 transition-all hover:bg-${warehouseColor}-100`}
          >
            <Upload className="h-4 w-4" /> Nhập Excel Nhật Ký
          </button>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50"
          >
            <Download className="h-4 w-4" /> Xuất Excel báo cáo
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" /> In Báo Cáo A4
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap bg-white p-2 rounded-2xl shadow-sm gap-1.5">
        <button
          onClick={() => setActiveTab('inputSec')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inputSec'
              ? `bg-emerald-700 text-white shadow-md`
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          Lập phiếu & Danh mục
        </button>
        <button
          onClick={() => setActiveTab('reportSec')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reportSec'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          Báo cáo nhập xuất tồn
        </button>
        <button
          onClick={() => setActiveTab('logSec')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'logSec'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          Nhật ký giao dịch
        </button>
        <button
          onClick={() => setActiveTab('analyticsSec')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analyticsSec'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          Biểu đồ phân tích
        </button>
        <button
          onClick={() => setActiveTab('configSec')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'configSec'
              ? 'bg-emerald-700 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          Cấu hình kho
        </button>
      </div>

      {/* TAB 1: LẬP PHIẾU & DANH MỤC */}
      {activeTab === 'inputSec' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form write transaction */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
              Lập phiếu Nhập / Xuất / Tồn đầu kho
            </h3>
            <form onSubmit={handleSaveTx} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Ngày giao dịch</label>
                <input
                  type="date"
                  required
                  value={formTx.date}
                  onChange={(e) => setFormTx({ ...formTx, date: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Loại chứng từ</label>
                <select
                  value={formTx.type}
                  onChange={(e) => setFormTx({ ...formTx, type: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                >
                  <option value="Xuất">Phiếu Xuất</option>
                  <option value="Nhập">Phiếu Nhập</option>
                  <option value="Tồn đầu">Ghi nhận Tồn đầu</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tên mặt hàng *</label>
                <select
                  required
                  value={formTx.itemName}
                  onChange={(e) => handleItemNameChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                >
                  <option value="">-- Chọn mặt hàng --</option>
                  {items.map(it => (
                    <option key={it._id} value={it.name}>
                      {it.name} ({it.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Đơn vị tính (ĐVT)</label>
                <input
                  type="text"
                  required
                  value={formTx.unit}
                  onChange={(e) => setFormTx({ ...formTx, unit: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500 bg-slate-50"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Số lượng</label>
                <input
                  type="number"
                  required
                  min="0.1"
                  step="any"
                  value={formTx.quantity || ''}
                  onChange={(e) => setFormTx({ ...formTx, quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Đơn giá (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  value={formTx.price || ''}
                  onChange={(e) => setFormTx({ ...formTx, price: parseInt(e.target.value, 10) || 0 })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Khoa / Phòng sử dụng</label>
                <select
                  value={formTx.department || ''}
                  onChange={(e) => setFormTx({ ...formTx, department: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                >
                  <option value=""></option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nhân viên nhận / giao</label>
                <select
                  value={formTx.employee || ''}
                  onChange={(e) => setFormTx({ ...formTx, employee: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                >
                  <option value=""></option>
                  {employees.map(emp => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">Ghi chú giao dịch</label>
                <textarea
                  value={formTx.note || ''}
                  onChange={(e) => setFormTx({ ...formTx, note: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500 min-h-[50px] resize-y"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-500 shadow-md shadow-teal-900/10"
                >
                  Ghi phiếu kho
                </button>
              </div>
            </form>
          </div>

          {/* Catalog / Item Management sidepanel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                Thêm mặt hàng mới
              </h3>
              <form onSubmit={handleAddItem} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tên mặt hàng</label>
                  <input
                    type="text"
                    required
                    placeholder="Tên vắc xin, vật tư..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Đơn vị tính (ĐVT)</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Cái, Lọ, Chai, Hộp..."
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 text-white py-2 text-xs font-bold hover:bg-slate-800"
                >
                  Thêm vào danh mục
                </button>
              </form>
            </div>

            <div>
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                Danh mục hiện tại ({items.length})
              </h3>
              <div className="max-h-[220px] overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
                {items.map(it => (
                  <div key={it._id} className="flex items-center justify-between text-xs border border-slate-100 p-2 rounded-xl">
                    <span className="font-bold text-slate-700">{it.name} <span className="text-[10px] font-semibold text-slate-400">({it.unit})</span></span>
                    <button
                      onClick={() => handleDeleteItem(it._id!)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BÁO CÁO NHẬP XUẤT TỒN */}
      {activeTab === 'reportSec' && (
        <div className="space-y-4">
          {/* Month selector */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Tháng báo cáo:</label>
              <input
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="rounded-xl border border-slate-200 p-1.5 text-xs font-bold outline-none focus:border-teal-500"
              />
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
              Khởi tạo tự động số liệu dựa trên các giao dịch ghi nhận
            </span>
          </div>

          {/* Spreadsheet report table */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">
                  BÁO CÁO XUẤT NHẬP TỒN THÁNG {reportMonth}
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[64vh] relative scrollbar-thin scrollbar-thumb-slate-200">
              <table className="table-fixed w-max min-w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-250 text-slate-700 font-bold h-10 text-[10px] uppercase">
                    <th className="w-10 text-center sticky left-0 z-30 bg-slate-50 border-r border-slate-250">STT</th>
                    <th className="w-44 text-left sticky left-10 z-30 bg-slate-50 border-r border-slate-250 pl-3">Tên hàng</th>
                    <th className="w-16 text-center sticky left-[216px] z-30 bg-slate-50 border-r border-slate-250">ĐVT</th>
                    {daysArray.map((day) => (
                      <th key={day} className="w-12 text-center border-r border-slate-200 bg-slate-50 text-slate-500 font-semibold">{day}</th>
                    ))}
                    <th className="w-20 text-center border-r border-slate-200 bg-blue-50 text-blue-800">Tồn đầu</th>
                    <th className="w-24 text-center border-r border-slate-200">Ngày nhập</th>
                    <th className="w-20 text-center border-r border-slate-200 bg-emerald-50 text-emerald-800">SL nhập</th>
                    <th className="w-20 text-center border-r border-slate-200">ĐG nhập</th>
                    <th className="w-24 text-center border-r border-slate-200">TT nhập</th>
                    <th className="w-20 text-center border-r border-slate-200 bg-amber-50 text-amber-800">SL xuất</th>
                    <th className="w-20 text-center border-r border-slate-200">ĐG xuất</th>
                    <th className="w-24 text-center border-r border-slate-200">TT xuất</th>
                    <th className="w-24 text-center border-r border-slate-200 bg-purple-50 text-purple-800">Tiền tồn</th>
                    <th className="w-20 text-center bg-teal-50 text-teal-850 font-black">Tồn cuối</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.length === 0 ? (
                    <tr>
                      <td colSpan={daysInMonth + 14} className="text-center py-20 text-slate-400 font-bold">
                        Chưa có giao dịch kho nào trong tháng này để kết xuất báo cáo
                      </td>
                    </tr>
                  ) : (
                    <>
                      {reportRows.map((row, idx) => (
                        <tr key={row.name} className="border-b border-slate-100 h-8 hover:bg-slate-50 transition-colors">
                          <td className="sticky left-0 bg-white border-r border-slate-100 z-10 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="sticky left-10 bg-white border-r border-slate-100 z-10 font-bold text-slate-800 pl-3 truncate">{row.name}</td>
                          <td className="sticky left-[216px] bg-white border-r border-slate-100 z-10 text-center text-slate-500 font-semibold">{row.unit}</td>
                          {daysArray.map((day) => (
                            <td key={day} className="border-r border-slate-100 text-center text-slate-650">
                              {row.dailyExports[day - 1] === 0 ? '' : row.dailyExports[day - 1]}
                            </td>
                          ))}
                          <td className="border-r border-slate-100 text-center font-bold text-blue-600 bg-blue-50/10">{row.tonDau}</td>
                          <td className="border-r border-slate-100 text-center text-[10px] text-slate-400">{row.importDate}</td>
                          <td className="border-r border-slate-100 text-center font-bold text-emerald-600 bg-emerald-50/10">{row.sumImport}</td>
                          <td className="border-r border-slate-100 text-right pr-2 font-mono text-[11px] text-slate-500">{row.importPrice.toLocaleString()}</td>
                          <td className="border-r border-slate-100 text-right pr-2 font-mono text-[11px] text-slate-600">{row.ttImport.toLocaleString()}</td>
                          <td className="border-r border-slate-100 text-center font-bold text-amber-600 bg-amber-50/10">{row.sumExport}</td>
                          <td className="border-r border-slate-100 text-right pr-2 font-mono text-[11px] text-slate-500">{row.exportPrice.toLocaleString()}</td>
                          <td className="border-r border-slate-100 text-right pr-2 font-mono text-[11px] text-slate-600">{row.ttExport.toLocaleString()}</td>
                          <td className="border-r border-slate-100 text-right pr-2 font-mono text-[11px] text-purple-600 bg-purple-50/10">{row.tienTon.toLocaleString()}</td>
                          <td className="text-center font-black text-teal-850 bg-teal-50/20">{row.tonCuoi}</td>
                        </tr>
                      ))}

                      {/* Total row */}
                      <tr className="border-t-2 border-slate-350 bg-slate-900 text-white font-extrabold h-9">
                        <td className="sticky left-0 bg-slate-900 border-r border-slate-100 z-10"></td>
                        <td className="sticky left-10 bg-slate-900 border-r border-slate-100 z-10 pl-3">TỔNG CỘNG</td>
                        <td className="sticky left-[216px] bg-slate-900 border-r border-slate-100 z-10"></td>
                        {daysArray.map((day) => (
                          <td key={day} className="border-r border-slate-800 text-center">
                            {getDailyColExportTotal(day) || ''}
                          </td>
                        ))}
                        <td className="border-r border-slate-800 text-center">{getColTotalSum('tonDau')}</td>
                        <td className="border-r border-slate-800"></td>
                        <td className="border-r border-slate-800 text-center">{getColTotalSum('sumImport')}</td>
                        <td className="border-r border-slate-800"></td>
                        <td className="border-r border-slate-800 text-right pr-2 font-mono text-[11px]">{getColTotalSum('ttImport').toLocaleString()}</td>
                        <td className="border-r border-slate-800 text-center">{getColTotalSum('sumExport')}</td>
                        <td className="border-r border-slate-800"></td>
                        <td className="border-r border-slate-800 text-right pr-2 font-mono text-[11px]">{getColTotalSum('ttExport').toLocaleString()}</td>
                        <td className="border-r border-slate-800 text-right pr-2 font-mono text-[11px]">{getColTotalSum('tienTon').toLocaleString()}</td>
                        <td className="text-center font-black bg-teal-800">{getColTotalSum('tonCuoi')}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Print style footer */}
            <div className="print-only p-8 text-xs text-slate-800 border-t border-slate-200 mt-6 flex justify-end">
              <div className="text-center space-y-12">
                <span>
                  Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                </span>
                <p className="font-bold">NGƯỜI LẬP PHIẾU BÁO CÁO</p>
                <div className="pt-8 text-slate-400"><i>(Ký và ghi rõ họ tên)</i></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NHẬT KÝ GIAO DỊCH */}
      {activeTab === 'logSec' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Mặt hàng, Nhân viên, Khoa..."
                    value={qTx}
                    onChange={(e) => setQTx(e.target.value)}
                    className="w-full pl-9 rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Loại chứng từ</label>
                <select
                  value={filterTypeTx}
                  onChange={(e) => setFilterTypeTx(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                >
                  <option value="">Tất cả</option>
                  <option value="Xuất">Phiếu Xuất</option>
                  <option value="Nhập">Phiếu Nhập</option>
                  <option value="Tồn đầu">Tồn đầu</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Từ ngày</label>
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {selectedTxIds.length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                <span className="text-xs font-bold text-red-800">
                  Đã chọn {selectedTxIds.length} dòng nhật ký kho
                </span>
                <button
                  onClick={handleBulkDeleteTx}
                  className="bg-red-650 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow"
                >
                  Xóa các dòng chọn
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-450">
                Nhật ký gồm {filteredTransactions.length} bản ghi
              </span>
            </div>

            <div className="overflow-x-auto max-h-[50vh] scrollbar-thin scrollbar-thumb-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 h-10 font-bold uppercase text-[10px]">
                    <th className="w-12 text-center">
                      <input
                        type="checkbox"
                        onChange={handleSelectAllTx}
                        checked={selectedTxIds.length > 0 && selectedTxIds.length === filteredTransactions.length}
                      />
                    </th>
                    <th className="w-12 text-center">STT</th>
                    <th className="w-28 text-center">Ngày</th>
                    <th className="w-28 text-center">Loại</th>
                    <th className="text-left pl-4">Tên hàng</th>
                    <th className="w-16 text-center">ĐVT</th>
                    <th className="w-24 text-center">Số lượng</th>
                    <th className="w-28 text-right pr-4">Đơn giá</th>
                    <th className="w-32 text-center">Khoa phòng</th>
                    <th className="w-32 text-center">Nhân viên</th>
                    <th className="text-left pl-4">Ghi chú</th>
                    <th className="w-20 text-center">Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx, index) => {
                    let typeBadge = '';
                    if (tx.type === 'Nhập') typeBadge = 'bg-emerald-100 text-emerald-800';
                    else if (tx.type === 'Xuất') typeBadge = 'bg-amber-100 text-amber-800';
                    else typeBadge = 'bg-blue-100 text-blue-800';

                    return (
                      <tr key={tx._id} className="border-b border-slate-100 h-9 hover:bg-slate-50">
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={selectedTxIds.includes(tx._id as string)}
                            onChange={(e) => handleSelectRowTx(tx._id as string, e.target.checked)}
                          />
                        </td>
                        <td className="text-center text-slate-400 font-bold">{index + 1}</td>
                        <td className="text-center text-slate-600">{tx.date}</td>
                        <td className="text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${typeBadge}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="pl-4 font-bold text-slate-800">{tx.itemName}</td>
                        <td className="text-center text-slate-500 font-medium">{tx.unit}</td>
                        <td className="text-center font-bold text-slate-700">{tx.quantity}</td>
                        <td className="text-right pr-4 font-mono">{tx.price.toLocaleString()}</td>
                        <td className="text-center font-semibold text-slate-600">{tx.department || ''}</td>
                        <td className="text-center text-slate-550">{tx.employee || ''}</td>
                        <td className="pl-4 text-slate-450 truncate max-w-xs">{tx.note || ''}</td>
                        <td className="text-center">
                          <button
                            onClick={() => handleDeleteTx(tx._id!)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BIỂU ĐỒ PHÂN TÍCH */}
      {activeTab === 'analyticsSec' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide border-b border-slate-100 pb-2">
              Xu hướng xuất kho trong tháng {reportMonth}
            </h3>
            <div className="h-80 w-full text-xs font-semibold">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getDailyTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="Tổng xuất" stroke="#059669" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide border-b border-slate-100 pb-2">
              Top 10 mặt hàng tiêu thụ nhiều nhất
            </h3>
            <div className="h-80 w-full text-xs font-semibold">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getConsumptionData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="Lượng tiêu thụ" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CẤU HÌNH KHO */}
      {activeTab === 'configSec' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
            Quản lý Khoa Phòng & Nhân Viên
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee manager list */}
            <div className="border border-slate-150 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-xs text-slate-500 uppercase">Danh sách nhân viên</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập tên nhân viên..."
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={handleAddEmployee}
                  className="rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-bold hover:bg-slate-85"
                >
                  Thêm
                </button>
              </div>
              <div className="max-h-[220px] overflow-y-auto space-y-2">
                {employees.map((emp) => (
                  <div key={emp} className="flex items-center justify-between text-xs border border-slate-100 p-2 rounded-xl">
                    <span className="font-semibold text-slate-700">{emp}</span>
                    <button
                      onClick={() => handleDeleteEmployee(emp)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Department manager list */}
            <div className="border border-slate-150 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-xs text-slate-500 uppercase">Danh sách khoa phòng sử dụng</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập tên khoa phòng..."
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 p-2 text-xs font-semibold outline-none focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={handleAddDept}
                  className="rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-bold hover:bg-slate-85"
                >
                  Thêm
                </button>
              </div>
              <div className="max-h-[220px] overflow-y-auto space-y-2">
                {departments.map((dept) => (
                  <div key={dept} className="flex items-center justify-between text-xs border border-slate-100 p-2 rounded-xl">
                    <span className="font-semibold text-slate-700">{dept}</span>
                    <button
                      onClick={() => handleDeleteDept(dept)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-150 pt-4 flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-400">
              💡 Lưu ý: Tránh thay đổi cấu hình kho khi đang lập phiếu giao dịch dở dang để bảo toàn dữ liệu.
            </span>
            <button
              onClick={handleResetWarehouse}
              className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            >
              Reset dữ liệu phân hệ kho này
            </button>
          </div>
        </div>
      )}

      {/* SheetJS Excel Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider">
                Nhập nhật ký từ Excel
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setSheetsList([]);
                }}
                className="text-slate-400 hover:text-slate-650 text-lg font-bold"
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
                  <label className="block text-xs font-bold text-slate-500 mb-1">Chọn Sheet chứa dữ liệu</label>
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
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isImporting || !importFile || sheetsList.length === 0}
                onClick={triggerImport}
                className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
