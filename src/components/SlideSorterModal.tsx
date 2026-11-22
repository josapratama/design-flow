import React, { useState, useEffect } from 'react';
import { Slide } from '../types';
import { ElementRenderer } from './ElementRenderer';
import { getSlideBackground } from '../utils/slideStyle';
import {
  LayoutGrid,
  X,
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Search,
  Sparkles,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SlideSorterModalProps {
  isOpen: boolean;
  slides: Slide[];
  activeSlideId: string;
  onClose: () => void;
  onSelectSlide: (slideId: string) => void;
  onAddSlide: () => void;
  onDuplicateSlide: (slideId: string) => void;
  onDeleteSlide: (slideId: string) => void;
  onReorderSlide: (slideId: string, direction: 'left' | 'right' | 'start' | 'end') => void;
  onMoveSlideToIndex?: (slideId: string, targetIndex: number) => void;
  onUpdateSlideTitle: (slideId: string, title: string) => void;
}

export const SlideSorterModal: React.FC<SlideSorterModalProps> = ({
  isOpen,
  slides,
  activeSlideId,
  onClose,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onReorderSlide,
  onMoveSlideToIndex,
  onUpdateSlideTitle,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [draggedSlideId, setDraggedSlideId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [density, setDensity] = useState<'large' | 'normal' | 'compact'>('normal');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (editingId) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Ctrl+D / Cmd+D: duplikasi slide aktif
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onDuplicateSlide(activeSlideId);
        return;
      }

      // Del / Backspace: hapus slide aktif
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (slides.length > 1) {
          e.preventDefault();
          onDeleteSlide(activeSlideId);
        }
        return;
      }

      // Navigasi panah
      if (e.key === 'ArrowLeft') {
        const curIdx = slides.findIndex(s => s.id === activeSlideId);
        if (curIdx > 0) {
          e.preventDefault();
          onSelectSlide(slides[curIdx - 1].id);
        }
      } else if (e.key === 'ArrowRight') {
        const curIdx = slides.findIndex(s => s.id === activeSlideId);
        if (curIdx < slides.length - 1) {
          e.preventDefault();
          onSelectSlide(slides[curIdx + 1].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, editingId, activeSlideId, slides, onDuplicateSlide, onDeleteSlide, onSelectSlide]);

  if (!isOpen) return null;

  const filteredSlides = slides.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col select-none animate-in fade-in-50 duration-150 text-slate-100">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/90 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">Pengatur Kisi Slide (Slide Sorter)</h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] font-semibold border border-indigo-500/30">
                {slides.length} Slide
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Drag & drop kartu untuk mengatur urutan • <kbd className="px-1 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">Ctrl+D</kbd> duplikasi • <kbd className="px-1 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">Del</kbd> hapus
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul slide..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 w-44 transition-all"
            />
          </div>

          {/* Density Grid Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 gap-0.5">
            {[
              { id: 'large', label: 'Besar', title: '3 Kolom (Tampilan Detail)' },
              { id: 'normal', label: 'Standar', title: '4 Kolom (Tampilan Default)' },
              { id: 'compact', label: 'Ringkas', title: '6 Kolom (Tampilan Kompak/Overview)' },
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDensity(d.id as any)}
                title={d.title}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  density === d.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Add Slide Button */}
          <button
            onClick={() => {
              onAddSlide();
              confetti({ particleCount: 35, spread: 50, origin: { y: 0.2 } });
            }}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Slide Baru</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Grid Canvas Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div
          className={`max-w-7xl mx-auto grid ${
            density === 'large'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : density === 'compact'
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          }`}
        >
          {filteredSlides.map((slide, index) => {
            const isActive = slide.id === activeSlideId;
            const originalIndex = slides.findIndex(s => s.id === slide.id);
            const scale =
              (density === 'large' ? 340 : density === 'compact' ? 170 : 260) /
              (slide.width || 1920);

            return (
              <div
                key={slide.id}
                draggable={!editingId}
                onDragStart={e => {
                  e.dataTransfer.setData('text/plain', slide.id);
                  setDraggedSlideId(slide.id);
                }}
                onDragEnd={() => {
                  setDraggedSlideId(null);
                  setDragOverIndex(null);
                }}
                onDragOver={e => {
                  e.preventDefault();
                  if (dragOverIndex !== originalIndex) {
                    setDragOverIndex(originalIndex);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverIndex === originalIndex) {
                    setDragOverIndex(null);
                  }
                }}
                onDrop={e => {
                  e.preventDefault();
                  const sourceId = e.dataTransfer.getData('text/plain') || draggedSlideId;
                  if (sourceId && onMoveSlideToIndex && sourceId !== slide.id) {
                    onMoveSlideToIndex(sourceId, originalIndex);
                  }
                  setDraggedSlideId(null);
                  setDragOverIndex(null);
                }}
                onClick={() => {
                  onSelectSlide(slide.id);
                  onClose();
                }}
                className={`group relative rounded-2xl border-2 transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between p-3.5 bg-slate-900/90 hover:bg-slate-900 shadow-lg ${
                  dragOverIndex === originalIndex && draggedSlideId !== slide.id
                    ? 'border-indigo-400 ring-4 ring-indigo-500/50 scale-[1.02] bg-indigo-950/40 shadow-indigo-500/20'
                    : isActive
                    ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-indigo-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header: Slide Number & Editable Title */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-400'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {originalIndex + 1}
                    </span>
                    {editingId === slide.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={tempTitle}
                        onChange={e => setTempTitle(e.target.value)}
                        onBlur={() => {
                          if (tempTitle.trim()) {
                            onUpdateSlideTitle(slide.id, tempTitle.trim());
                          }
                          setEditingId(null);
                        }}
                        onKeyDown={e => {
                          e.stopPropagation();
                          if (e.key === 'Enter') {
                            if (tempTitle.trim()) {
                              onUpdateSlideTitle(slide.id, tempTitle.trim());
                            }
                            setEditingId(null);
                          } else if (e.key === 'Escape') {
                            setEditingId(null);
                          }
                        }}
                        onClick={e => e.stopPropagation()}
                        className="text-xs font-semibold bg-slate-950 border border-indigo-500 rounded px-1.5 py-0.5 text-white outline-none w-36"
                      />
                    ) : (
                      <span
                        onDoubleClick={e => {
                          e.stopPropagation();
                          setEditingId(slide.id);
                          setTempTitle(slide.title);
                        }}
                        title="Klik ganda untuk mengubah judul slide"
                        className="text-xs font-semibold text-slate-200 truncate max-w-[150px] hover:text-indigo-300 transition-colors"
                      >
                        {slide.title}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-400">
                    {slide.transition && slide.transition !== 'fade' && (
                      <span
                        title={`Transisi: ${slide.transition}`}
                        className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[9px] uppercase font-semibold"
                      >
                        {slide.transition}
                      </span>
                    )}
                    {slide.notes && slide.notes.trim() ? (
                      <span
                        title={`Catatan Pembicara: "${slide.notes.slice(0, 80)}${slide.notes.length > 80 ? '...' : ''}"`}
                        className="text-amber-400 p-0.5 hover:scale-110 transition-transform"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </span>
                    ) : null}
                    <span className="text-[10px] font-mono text-slate-500 flex items-center gap-0.5">
                      <Layers className="w-3 h-3" />
                      <span>{slide.elements.length}</span>
                    </span>
                  </div>
                </div>

                {/* Scaled Visual Thumbnail Preview */}
                <div
                  className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800/80 mb-3 bg-slate-950 pointer-events-none"
                  style={{
                    background: getSlideBackground(slide),
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: `${slide.width}px`,
                      height: `${slide.height}px`,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    {slide.elements.map(el => {
                      if (el.hidden) return null;
                      return (
                        <div
                          key={el.id}
                        style={{
                          position: 'absolute',
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          zIndex: el.zIndex,
                          transform: [
                            el.rotation ? `rotate(${el.rotation}deg)` : '',
                            el.flipX ? 'scaleX(-1)' : '',
                            el.flipY ? 'scaleY(-1)' : '',
                          ]
                            .filter(Boolean)
                            .join(' ') || undefined,
                          opacity: el.opacity !== undefined ? el.opacity : 1,
                        }}
                      >
                        <ElementRenderer element={el} isSelected={false} />
                      </div>
                    );
                  })}
                  </div>
                </div>

                {/* Footer Actions: Reorder, Duplicate, Delete */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-0.5">
                    {originalIndex > 1 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onReorderSlide(slide.id, 'start');
                        }}
                        title="Pindah ke Posisi Pertama"
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                      >
                        <ChevronsLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {originalIndex > 0 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onReorderSlide(slide.id, 'left');
                        }}
                        title="Geser ke Kiri (Sebelumnya)"
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {originalIndex < slides.length - 1 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onReorderSlide(slide.id, 'right');
                        }}
                        title="Geser ke Kanan (Selanjutnya)"
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {originalIndex < slides.length - 2 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onReorderSlide(slide.id, 'end');
                        }}
                        title="Pindah ke Posisi Terakhir"
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                      >
                        <ChevronsRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDuplicateSlide(slide.id);
                        confetti({ particleCount: 30, spread: 45, origin: { y: 0.5 } });
                      }}
                      title="Duplikat Slide"
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 rounded-lg transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {slides.length > 1 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm(`Hapus slide "${slide.title}"?`)) {
                            onDeleteSlide(slide.id);
                          }
                        }}
                        title="Hapus Slide"
                        className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Slide Tile Card at the end */}
          <button
            onClick={() => {
              onAddSlide();
              confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
            }}
            className="rounded-2xl border-2 border-dashed border-slate-800 hover:border-indigo-500 bg-slate-900/40 hover:bg-indigo-950/20 min-h-[220px] flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-indigo-300 transition-all group"
          >
            <div className="p-3 rounded-2xl bg-slate-800/80 group-hover:bg-indigo-600 group-hover:text-white text-slate-400 transition-all group-hover:scale-110 shadow-lg">
              <Plus className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-slate-300 group-hover:text-white">Tambah Slide Baru</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Buat artboard baru untuk materi Anda</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
