'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Upload,
  Trash2,
  Download,
  Image as ImageIcon,
  Move,
  Maximize2
} from 'lucide-react';

export interface CccdImageModalProps {
  url: string;
  customerName: string;
  bhxh?: string;
  cccd?: string;
  onClose: () => void;
  onUploadNew?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete?: () => void;
}

export default function CccdImageModal({
  url,
  customerName,
  bhxh,
  cccd,
  onClose,
  onUploadNew,
  onDelete
}: CccdImageModalProps) {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(5, Number((prev + 0.25).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(0.5, Number((prev - 0.25).toFixed(2)));
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (scale === 1) {
      setScale(2);
    } else {
      handleReset();
    }
  }, [scale, handleReset]);

  // Mouse wheel zoom handling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
      setScale((prevScale) => {
        const nextScale = Math.min(5, Math.max(0.5, Number((prevScale + zoomFactor).toFixed(2))));
        if (nextScale <= 1) {
          setPosition({ x: 0, y: 0 });
        }
        return nextScale;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleReset();
      } else if (e.key === 'r' || e.key === 'R') {
        handleRotate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, handleZoomIn, handleZoomOut, handleReset, handleRotate]);

  // Drag & Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only main click
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers for Mobile / Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-teal-600 shrink-0" />
              <span>Ảnh thẻ CCCD — {customerName}</span>
            </h3>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
              {bhxh && (
                <span>
                  Mã BHXH: <span className="font-mono text-slate-700 font-bold">{bhxh}</span>
                </span>
              )}
              {cccd && (
                <span>
                  · CCCD: <span className="font-mono text-slate-700 font-bold">{cccd}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-200/70 text-slate-600 transition-colors"
              title="Đóng cửa sổ (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Floating Zoom & Control Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-white shrink-0 z-10">
          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors text-slate-200"
              title="Thu nhỏ (-)"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <button
              onClick={handleZoomIn}
              disabled={scale >= 5}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors text-slate-200"
              title="Phóng to (+)"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            <button
              onClick={handleReset}
              className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-teal-500/40 bg-teal-950/60 text-teal-400 hover:bg-teal-900/60 transition-colors flex items-center gap-1"
              title="Đặt lại zoom 100% & vị trí (Phím 0)"
            >
              <Maximize2 className="h-3 w-3" />
              <span>{Math.round(scale * 100)}%</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-700 mx-0.5" />

            <button
              onClick={handleRotate}
              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 text-xs font-bold"
              title="Xoay ảnh 90° (Phím R)"
            >
              <RotateCw className="h-4 w-4" />
              {rotation > 0 && <span className="text-[10px] text-slate-300 font-mono">{rotation}°</span>}
            </button>
          </div>

          {/* Hint */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
            <Move className="h-3.5 w-3.5 text-teal-400 shrink-0" />
            <span>Cuộn chuột / Phím + - để zoom · Kéo rê ảnh để di chuyển · Nhấp đúp để phóng to</span>
          </div>
        </div>

        {/* Image Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
          className={`flex-1 relative bg-slate-950/95 overflow-hidden flex items-center justify-center min-h-[340px] sm:min-h-[420px] ${
            isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-zoom-in'
          }`}
        >
          <div
            className="transition-transform duration-75 ease-out flex items-center justify-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          >
            <img
              src={url}
              alt={`Ảnh thẻ CCCD ${customerName}`}
              draggable={false}
              className="max-h-[60vh] max-w-[85vw] sm:max-w-full object-contain rounded-xl shadow-2xl border border-white/10 select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs font-bold shrink-0">
          <div className="flex items-center gap-2">
            {onUploadNew && (
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors shadow-2xs">
                <Upload className="h-3.5 w-3.5 text-teal-600" />
                <span>Tải ảnh mới</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onUploadNew}
                  className="hidden"
                />
              </label>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors shadow-2xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa ảnh</span>
              </button>
            )}
          </div>

          <a
            href={url}
            download={`CCCD_${customerName.replace(/\s+/g, '_')}_${bhxh || 'file'}.jpg`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Tải về máy</span>
          </a>
        </div>
      </div>
    </div>
  );
}
