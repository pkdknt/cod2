'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  MessageSquare,
  Copy,
  Settings2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  ChevronDown
} from 'lucide-react';

export default function TinNhanPage() {
  const [activeTab, setActiveTab] = useState<'BHYT' | 'TIEM_CHUNG'>('BHYT');

  // Excel State
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  
  // Mapping State
  const [mapKeys, setMapKeys] = useState<{ phone: string; name: string; date: string; extra: string }>({
    phone: '', name: '', date: '', extra: ''
  });

  // Template State
  const defaultBhytTemplate = `Phòng khám đa khoa Nhơn Tâm thông báo:\nChào {name}, thẻ BHYT của bạn sẽ hết hạn vào ngày {date}. Vui lòng liên hệ quầy tiếp nhận để được hướng dẫn gia hạn. Xin cảm ơn!`;
  const defaultTiemChungTemplate = `Phòng khám đa khoa Nhơn Tâm thông báo:\nChào {name}, bé có lịch hẹn tiêm ngừa {extra} vào ngày {date}. Gia đình vui lòng sắp xếp thời gian đưa bé đến đúng lịch. Xin cảm ơn!`;

  const [template, setTemplate] = useState(defaultBhytTemplate);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Swap template on tab change
    if (activeTab === 'BHYT') {
      setTemplate(defaultBhytTemplate);
    } else {
      setTemplate(defaultTiemChungTemplate);
    }
  }, [activeTab]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert to array of arrays to get headers
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (rawData.length > 0) {
          const rawHeaders = (rawData[0] as string[]).map(h => String(h || '').trim());
          setHeaders(rawHeaders.filter(h => h));
          
          const jsonData = XLSX.utils.sheet_to_json(ws);
          setData(jsonData);
          
          // Auto guess mapping
          const hStr = rawHeaders.join('|').toLowerCase();
          const guessPhone = rawHeaders.find(h => h.toLowerCase().includes('điện thoại') || h.toLowerCase().includes('phone'));
          const guessName = rawHeaders.find(h => h.toLowerCase().includes('họ tên') || h.toLowerCase().includes('name'));
          const guessDate = rawHeaders.find(h => h.toLowerCase().includes('ngày') || h.toLowerCase().includes('date'));
          const guessExtra = rawHeaders.find(h => h.toLowerCase().includes('vắc xin') || h.toLowerCase().includes('vaccine'));

          setMapKeys({
            phone: guessPhone || '',
            name: guessName || '',
            date: guessDate || '',
            extra: guessExtra || ''
          });
        }
      } catch (err) {
        alert('Lỗi đọc file Excel!');
      }
    };
    reader.readAsBinaryString(file);
  };

  const getPhoneStr = (p: any) => {
    let s = String(p || '').trim().replace(/[^0-9]/g, '');
    if (s.startsWith('84')) s = '0' + s.slice(2);
    if (!s.startsWith('0')) s = '0' + s;
    return s;
  };

  const generateMessage = (row: any) => {
    let msg = template;
    msg = msg.replace(/{name}/g, row[mapKeys.name] || '[Tên]');
    msg = msg.replace(/{date}/g, row[mapKeys.date] || '[Ngày]');
    msg = msg.replace(/{phone}/g, row[mapKeys.phone] || '[SĐT]');
    msg = msg.replace(/{extra}/g, row[mapKeys.extra] || '[Thông tin thêm]');
    return msg;
  };

  const handleCopyZaloLink = (phone: string, msg: string) => {
    const validPhone = getPhoneStr(phone);
    if (!validPhone || validPhone.length < 10) {
      alert('Số điện thoại không hợp lệ!');
      return;
    }
    const url = `https://zalo.me/${validPhone}`;
    navigator.clipboard.writeText(msg).then(() => {
      window.open(url, '_blank');
    });
  };

  const handleCopyAll = () => {
    const texts = data.map(row => {
      const p = getPhoneStr(row[mapKeys.phone]);
      const m = generateMessage(row);
      return `${p}\t${m}`;
    }).join('\n');
    navigator.clipboard.writeText(texts).then(() => {
      alert('Đã copy tất cả tin nhắn (SĐT + Nội dung) vào bộ nhớ tạm.');
    });
  };

  const resetAll = () => {
    if (!confirm('Xóa dữ liệu hiện tại?')) return;
    setData([]);
    setHeaders([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-teal-600" /> QUẢN LÝ TIN NHẮN NHẮC BỆNH NHÂN
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Hỗ trợ sinh tự động nội dung tin nhắn hàng loạt từ file Excel và liên kết Zalo.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto whitespace-nowrap bg-white p-2 rounded-2xl shadow-sm gap-1.5">
        <button
          onClick={() => setActiveTab('BHYT')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'BHYT'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          Nhắc Gia Hạn BHYT
        </button>
        <button
          onClick={() => setActiveTab('TIEM_CHUNG')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'TIEM_CHUNG'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
          }`}
        >
          Nhắc Lịch Tiêm Vắc Xin
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Col: Config */}
        <div className="lg:col-span-1 space-y-4">
          {/* File Upload Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-slate-400" /> DỮ LIỆU EXCEL
            </h3>
            
            {!fileName ? (
              <div 
                className="border-2 border-dashed border-teal-200 rounded-2xl p-6 text-center hover:bg-teal-50/50 cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-teal-800 mb-1">Click để tải file Excel</p>
                <p className="text-[10px] font-medium text-slate-500">Hỗ trợ .xlsx, .xls</p>
              </div>
            ) : (
              <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-bold text-teal-900 truncate">{fileName}</p>
                  <p className="text-[10px] text-teal-600 font-semibold">{data.length} dòng dữ liệu</p>
                </div>
                <button onClick={resetAll} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx, .xls" className="hidden" />

            {/* Mapping Config */}
            {headers.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Khớp cột dữ liệu</p>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Cột Số điện thoại 📱</label>
                  <select
                    value={mapKeys.phone}
                    onChange={e => setMapKeys(p => ({...p, phone: e.target.value}))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-semibold bg-slate-50"
                  >
                    <option value="">-- Chọn cột --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Cột Họ Tên 👤</label>
                  <select
                    value={mapKeys.name}
                    onChange={e => setMapKeys(p => ({...p, name: e.target.value}))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-semibold bg-slate-50"
                  >
                    <option value="">-- Chọn cột --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Cột Ngày (Hết hạn/Hẹn) 📅</label>
                  <select
                    value={mapKeys.date}
                    onChange={e => setMapKeys(p => ({...p, date: e.target.value}))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-semibold bg-slate-50"
                  >
                    <option value="">-- Chọn cột --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                {activeTab === 'TIEM_CHUNG' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Cột Tên Vắc xin 💉</label>
                    <select
                      value={mapKeys.extra}
                      onChange={e => setMapKeys(p => ({...p, extra: e.target.value}))}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 font-semibold bg-slate-50"
                    >
                      <option value="">-- Chọn cột --</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Template Editor */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-slate-400" /> MẪU TIN NHẮN
            </h3>
            
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-[11px] font-medium text-blue-800 space-y-1">
              <p>Hỗ trợ các biến tự động:</p>
              <ul className="list-disc pl-4 space-y-0.5 font-bold">
                <li>{'{name}'} : Chèn Họ tên</li>
                <li>{'{date}'} : Chèn Ngày</li>
                <li>{'{phone}'} : Chèn Số điện thoại</li>
                {activeTab === 'TIEM_CHUNG' && <li>{'{extra}'} : Chèn Tên Vắc xin</li>}
              </ul>
            </div>

            <textarea
              className="w-full h-40 p-3 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50 leading-relaxed resize-none"
              value={template}
              onChange={e => setTemplate(e.target.value)}
            />
          </div>
        </div>

        {/* Right Col: Data Table */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col h-[calc(100vh-140px)]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Kết quả sinh tin nhắn: {data.length}
              </span>
            </div>
            {data.length > 0 && (
              <button
                onClick={handleCopyAll}
                className="inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors shadow-sm"
              >
                <Copy className="h-4 w-4" /> Copy Tất Cả
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto bg-slate-50/50 p-4">
            {data.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <MessageSquare className="h-12 w-12 opacity-20" />
                <p className="font-bold text-sm">Chưa có dữ liệu. Vui lòng tải file Excel lên.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.map((row, idx) => {
                  const phone = row[mapKeys.phone] || '';
                  const generatedMsg = generateMessage(row);
                  
                  return (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 hover:shadow-md transition-shadow relative group">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-slate-800">{row[mapKeys.name] || 'Không có tên'}</p>
                          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                            <Smartphone className="h-3 w-3" /> {getPhoneStr(phone) || 'Trống'}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          #{idx + 1}
                        </span>
                      </div>
                      
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-medium text-slate-700 whitespace-pre-wrap leading-relaxed min-h-[80px]">
                        {generatedMsg}
                      </div>
                      
                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => navigator.clipboard.writeText(generatedMsg).then(() => alert('Đã copy nội dung!'))}
                          className="flex-1 flex justify-center items-center gap-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 py-2 rounded-xl text-xs font-bold transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </button>
                        <button
                          onClick={() => handleCopyZaloLink(phone, generatedMsg)}
                          disabled={!getPhoneStr(phone)}
                          className="flex-1 flex justify-center items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path d="M21.734 11.233c-0.207-4.494-3.666-8.388-8.232-9.102-5.466-0.852-10.457 2.457-11.41 7.82-0.655 3.684 0.902 7.371 3.96 9.421 0.449 0.3 0.638 0.85 0.485 1.365l-0.785 2.628c-0.342 1.144 0.846 2.148 1.942 1.642l2.646-1.22c0.413-0.19 0.887-0.196 1.306-0.015 1.579 0.686 3.327 1.054 5.127 1.054 6.075 0 11.002-4.927 11.002-11.002 0-0.871-0.1-1.737-0.297-2.574l0.141-0.032-5.885 0.015z" />
                          </svg>
                          Gửi Zalo
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
