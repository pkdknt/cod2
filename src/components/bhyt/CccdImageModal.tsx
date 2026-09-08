'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Upload,
  Trash2,
  Download,
  Image as ImageIcon,
  Move,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

export interface CccdImageModalProps {
  images: string[];          // Array of base64/URL strings
  customerName: string;
  bhxh?: string;
  cccd?: string;
  onClose: () => void;
  onAddImages?: (files: File[]) => void;     // callback to upload more images
  onDeleteImage?: (index: number) => void;   // callback to delete image at index
}

export default function CccdImageModal({
  images,
  customerName,
  bhxh,
  cccd,
  onClose,
  onAddImages,
  onDeleteImage,
}: CccdImageModalProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  // When active index is out of bounds after deletion, clamp it
  useEffect(() => {
    if (images.length === 0) return;
    if (activeIndex >= images.length) {
      setActiveIndex(images.length - 1);
    }
  }, [images.length, activeIndex]);

  // Reset view when switching images
  const selectImage = (idx: number) => {
    setActiveIndex(idx);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(5, Number((prev + 0.25).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(0.5, Number((prev - 0.25).toFixed(2)));
      if (next <= 1) setPosition({ x: 0, y: 0 });
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
    if (scale === 1) setScale(2);
    else handleReset();
  }, [scale, handleReset]);

  // Navigation
  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    selectImage((activeIndex - 1 + images.length) % images.length);
  }, [activeIndex, images.length]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    selectImage((activeIndex + 1) % images.length);
  }, [activeIndex, images.length]);

  // Mouse wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 0.15 : -0.15;
      setScale((prev) => {
        const next = Math.min(5, Math.max(0.5, Number((prev + factor).toFixed(2))));
        if (next <= 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === '+' || e.key === '=') handleZoomIn();
      else if (e.key === '-') handleZoomOut();
      else if (e.key === '0') handleReset();
      else if (e.key === 'r' || e.key === 'R') handleRotate();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, handleZoomIn, handleZoomOut, handleReset, handleRotate, handlePrev, handleNext]);

  // Drag & Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  // Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: t.clientX - position.x, y: t.clientY - position.y });
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const t = e.touches[0];
    setPosition({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
  };
  const handleTouchEnd = () => setIsDragging(false);

  // Add images
  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    onAddImages?.(files);
    e.target.value = '';
  };

  // Download current image
  const currentImage = images[activeIndex] ?? '';
  const downloadName = `CCCD_${customerName.replace(/\s+/g, '_')}_${bhxh || 'file'}_${activeIndex + 1}.jpg`;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-teal-600 shrink-0" />
              <span>Ảnh thẻ CCCD — {customerName}</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[11px] font-bold">
                {images.length} ảnh
              </span>
            </h3>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
              {bhxh && (
                <span>Mã BHXH: <span className="font-mono text-slate-700 font-bold">{bhxh}</span></span>
              )}
              {cccd && (
                <span>· CCCD: <span className="font-mono text-slate-700 font-bold">{cccd}</span></span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-200/70 text-slate-600 transition-colors"
            title="Đóng (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main body: sidebar + viewer */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          
          {/* Left Sidebar: Thumbnails */}
          <div className="w-[110px] shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 p-2 gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative group">
                <button
                  onClick={() => selectImage(idx)}
                  className={`w-full aspect-[3/2] rounded-lg overflow-hidden border-2 transition-all shadow-sm ${
                    idx === activeIndex
                      ? 'border-teal-400 ring-2 ring-teal-400/40 scale-[1.03]'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                  title={`Xem ảnh ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`Ảnh CCCD ${idx + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </button>
                
                {/* Number badge */}
                <span className="absolute top-1 left-1 text-[9px] font-bold px-1 rounded bg-black/60 text-white leading-tight pointer-events-none">
                  {idx + 1}
                </span>

                {/* Delete button */}
                {onDeleteImage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteIndex(idx);
                    }}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                    title="Xóa ảnh này"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            ))}

            {/* Add more images */}
            {onAddImages && (
              <label
                className="w-full aspect-[3/2] rounded-lg border-2 border-dashed border-slate-600 hover:border-teal-500 bg-slate-800/50 hover:bg-teal-950/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all"
                title="Thêm ảnh CCCD"
              >
                <Plus className="h-4 w-4 text-slate-400 group-hover:text-teal-400" />
                <span className="text-[9px] text-slate-400 font-bold text-center leading-tight">Thêm<br/>ảnh</span>
                <input
                  ref={addInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddFiles}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Right: Control bar + Viewer */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Control Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-white shrink-0 z-10">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      title="Ảnh trước (←)"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-[11px] font-bold text-slate-300 font-mono min-w-[42px] text-center">
                      {activeIndex + 1} / {images.length}
                    </span>
                    <button
                      onClick={handleNext}
                      className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      title="Ảnh sau (→)"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="h-4 w-[1px] bg-slate-700 mx-0.5" />
                  </>
                )}

                {/* Zoom */}
                <button
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                  className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors text-slate-200"
                  title="Thu nhỏ (-)"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-teal-500/40 bg-teal-950/60 text-teal-400 hover:bg-teal-900/60 transition-colors flex items-center gap-1"
                  title="Đặt lại zoom 100% (Phím 0)"
                >
                  <Maximize2 className="h-3 w-3" />
                  <span>{Math.round(scale * 100)}%</span>
                </button>

                <button
                  onClick={handleZoomIn}
                  disabled={scale >= 5}
                  className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors text-slate-200"
                  title="Phóng to (+)"
                >
                  <ZoomIn className="h-4 w-4" />
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
                <span>Cuộn chuột / +- để zoom · Kéo để di chuyển · ← → chuyển ảnh</span>
              </div>
            </div>

            {/* Image Viewer */}
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
              className={`flex-1 relative bg-slate-950/95 overflow-hidden flex items-center justify-center min-h-[300px] sm:min-h-[380px] ${
                isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-zoom-in'
              }`}
            >
              {images.length === 0 ? (
                <div className="flex flex-col items-center gap-3 text-slate-500">
                  <ImageIcon className="h-12 w-12 opacity-30" />
                  <span className="text-sm font-semibold">Chưa có ảnh CCCD</span>
                </div>
              ) : (
                <div
                  className="transition-transform duration-75 ease-out flex items-center justify-center"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                >
                  <img
                    src={currentImage}
                    alt={`Ảnh thẻ CCCD ${customerName} (${activeIndex + 1}/${images.length})`}
                    draggable={false}
                    className="max-h-[55vh] max-w-full object-contain rounded-xl shadow-2xl border border-white/10 select-none pointer-events-none"
                  />
                </div>
              )}

              {/* Arrow overlays for navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all opacity-60 hover:opacity-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all opacity-60 hover:opacity-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs font-bold shrink-0">
          <div className="flex items-center gap-2">
            {onAddImages && (
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer transition-colors shadow-2xs">
                <Upload className="h-3.5 w-3.5 text-teal-600" />
                <span>Thêm ảnh mới</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddFiles}
                  className="hidden"
                />
              </label>
            )}

            {onDeleteImage && images.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmDeleteIndex(activeIndex)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors shadow-2xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa ảnh này</span>
              </button>
            )}
          </div>

          {images.length > 0 && (
            <a
              href={currentImage}
              download={downloadName}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Tải về ({activeIndex + 1}/{images.length})</span>
            </a>
          )}
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      {confirmDeleteIndex !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 max-w-sm w-full mx-4">
            <h4 className="font-extrabold text-slate-800 text-base mb-2">Xóa ảnh?</h4>
            <p className="text-slate-500 text-sm mb-5">
              Bạn có chắc muốn xóa <span className="font-bold text-slate-700">ảnh số {confirmDeleteIndex + 1}</span> của khách hàng <span className="font-bold text-slate-700">{customerName}</span>? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteIndex(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (confirmDeleteIndex !== null) {
                    onDeleteImage?.(confirmDeleteIndex);
                    setConfirmDeleteIndex(null);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors"
              >
                Xóa ảnh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
