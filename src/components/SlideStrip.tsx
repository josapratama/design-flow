import React, { useState } from 'react';
import { Slide } from '../types';
import { getSlideBackground } from '../utils/slideStyle';
import {
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SlideStripProps {
  slides: Slide[];
  activeSlideId: string;
  onSelectSlide: (slideId: string) => void;
  onAddSlide: () => void;
  onDuplicateSlide: (slideId: string) => void;
  onDeleteSlide: (slideId: string) => void;
  onReorderSlide: (slideId: string, direction: 'left' | 'right' | 'start' | 'end') => void;
  onMoveSlideToIndex?: (slideId: string, targetIndex: number) => void;
  onUpdateSlideTitle?: (slideId: string, newTitle: string) => void;
  onOpenSlideSorter?: () => void;
}

export const SlideStrip: React.FC<SlideStripProps> = ({
  slides,
  activeSlideId,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onReorderSlide,
  onMoveSlideToIndex,
  onUpdateSlideTitle,
  onOpenSlideSorter,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [draggedSlideId, setDraggedSlideId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const activeIndex = slides.findIndex(s => s.id === activeSlideId);
  const activeSlide = slides[activeIndex] || slides[0];

  // If collapsed, show a sleek mini status bar
  if (isCollapsed) {
    return (
      <div className="h-9 bg-slate-950/90 border-t border-slate-800/80 px-3 sm:px-4 flex items-center justify-between select-none shrink-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(false)}
            title="Tampilkan Bilah Slide Lengkap"
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg flex items-center gap-1 text-xs transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-slate-300 hidden sm:inline">Slide</span>
          </button>
          <span className="text-[11px] font-mono text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
            {activeIndex + 1} / {slides.length}
          </span>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[180px] sm:max-w-xs">
            {activeSlide?.title}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (activeIndex > 0) onSelectSlide(slides[activeIndex - 1].id);
            }}
            disabled={activeIndex === 0}
            title="Slide Sebelumnya"
            className="p-1 hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-white rounded-lg"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (activeIndex < slides.length - 1) onSelectSlide(slides[activeIndex + 1].id);
            }}
            disabled={activeIndex === slides.length - 1}
            title="Slide Selanjutnya"
            className="p-1 hover:bg-slate-800 disabled:opacity-30 text-slate-400 hover:text-white rounded-lg"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="h-3 w-[1px] bg-slate-800 mx-1" />
          <button
            onClick={onAddSlide}
            title="Tambah Slide Baru"
            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1"
          >
            <Plus className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">Tambah</span>
          </button>
          {onOpenSlideSorter && (
            <button
              onClick={onOpenSlideSorter}
              title="Buka Kisi Slide"
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-28 bg-slate-950/90 border-t border-slate-800/80 px-3 sm:px-4 py-2 flex items-center gap-2.5 overflow-x-auto select-none shrink-0 z-10 backdrop-blur-md relative group/strip transition-all">
      {/* Collapse button floating pill */}
      <button
        onClick={() => setIsCollapsed(true)}
        title="Kecilkan Bilah Slide (Lebihkan Area Kanvas)"
        className="absolute top-1.5 right-2 z-20 p-1 rounded-md bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {slides.map((slide, index) => {
        const isActive = slide.id === activeSlideId;
        const scaleFactor = 120 / (slide.width || 1920);

        return (
          <div
            key={slide.id}
            draggable={!editingSlideId}
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
              if (dragOverIndex !== index) {
                setDragOverIndex(index);
              }
            }}
            onDragLeave={() => {
              if (dragOverIndex === index) {
                setDragOverIndex(null);
              }
            }}
            onDrop={e => {
              e.preventDefault();
              const sourceId = e.dataTransfer.getData('text/plain') || draggedSlideId;
              if (sourceId && onMoveSlideToIndex && sourceId !== slide.id) {
                onMoveSlideToIndex(sourceId, index);
              }
              setDraggedSlideId(null);
              setDragOverIndex(null);
            }}
            onClick={() => onSelectSlide(slide.id)}
            className={`group relative h-24 w-36 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between p-1.5 shrink-0 overflow-hidden ${
              dragOverIndex === index && draggedSlideId !== slide.id
                ? 'border-indigo-400 ring-2 ring-indigo-500/50 scale-105 bg-indigo-950/40'
                : isActive
                ? 'border-indigo-500 bg-slate-900 shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500/50'
                : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            {/* Slide Header: Index + Editable Title */}
            <div className="flex items-center justify-between z-10 w-full gap-1">
              <div className="flex items-center gap-1 min-w-0">
                <span className={`text-[9px] font-bold px-1 py-0.2 rounded font-mono ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  {index + 1}
                </span>
                {editingSlideId === slide.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={tempTitle}
                    onChange={e => setTempTitle(e.target.value)}
                    onBlur={() => {
                      if (tempTitle.trim() && onUpdateSlideTitle) {
                        onUpdateSlideTitle(slide.id, tempTitle.trim());
                      }
                      setEditingSlideId(null);
                    }}
                    onKeyDown={e => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        if (tempTitle.trim() && onUpdateSlideTitle) {
                          onUpdateSlideTitle(slide.id, tempTitle.trim());
                        }
                        setEditingSlideId(null);
                      } else if (e.key === 'Escape') {
                        setEditingSlideId(null);
                      }
                    }}
                    onClick={e => e.stopPropagation()}
                    className="text-[10px] font-semibold bg-slate-800 border border-indigo-500 rounded px-1 text-white outline-none w-20"
                  />
                ) : (
                  <span
                    onDoubleClick={e => {
                      e.stopPropagation();
                      setEditingSlideId(slide.id);
                      setTempTitle(slide.title);
                    }}
                    title="Klik ganda untuk mengubah judul"
                    className="text-[10px] font-medium text-slate-300 truncate max-w-[65px] hover:text-white"
                  >
                    {slide.title}
                  </span>
                )}
              </div>

              {slide.notes && slide.notes.trim() ? (
                <span title="Terdapat Catatan Pembicara" className="text-amber-400 p-0.5 shrink-0">
                  <FileText className="w-2.5 h-2.5" />
                </span>
              ) : null}
            </div>

            {/* Scaled Mini Visual Canvas Thumbnail */}
            <div
              className="relative w-full h-12 rounded-md overflow-hidden border border-slate-800/80 my-0.5 pointer-events-none shrink-0"
              style={{ background: getSlideBackground(slide) }}
            >
              <div
                className="absolute origin-top-left pointer-events-none"
                style={{
                  width: `${slide.width}px`,
                  height: `${slide.height}px`,
                  transform: `scale(${scaleFactor})`,
                }}
              >
                {slide.elements.map(el => {
                  if (el.hidden) return null;
                  return (
                    <div
                      key={el.id}
                      className="absolute"
                      style={{
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width}px`,
                        height: `${el.height}px`,
                        backgroundColor:
                          el.fill ||
                          (el.type === 'heading'
                            ? '#ffffff'
                            : el.type === 'text'
                            ? '#94a3b8'
                            : el.type === 'button'
                            ? '#6366f1'
                            : el.type === 'image'
                            ? '#8b5cf6'
                            : '#334155'),
                        borderRadius: `${el.borderRadius || 2}px`,
                        opacity: el.opacity !== undefined ? el.opacity : 0.8,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Micro Details */}
            <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono z-10 pointer-events-none">
              <span>{slide.presetName || '16:9'}</span>
              <span>{slide.elements.length} el</span>
            </div>

            {/* Contextual Action Overlay on Hover */}
            <div className="absolute top-5 right-1 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-950/95 border border-slate-800 shadow-xl backdrop-blur-md transition-all z-20">
              {index > 0 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onReorderSlide(slide.id, 'left');
                  }}
                  title="Geser ke Kiri"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDuplicateSlide(slide.id);
                }}
                title="Duplikat Slide"
                className="p-1 hover:bg-slate-800 text-slate-300 rounded"
              >
                <Copy className="w-3 h-3" />
              </button>
              {slides.length > 1 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteSlide(slide.id);
                  }}
                  title="Hapus Slide"
                  className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
              {index < slides.length - 1 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onReorderSlide(slide.id, 'right');
                  }}
                  title="Geser ke Kanan"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Add New Slide Button */}
      <button
        onClick={onAddSlide}
        title="Tambah Slide Baru (+)"
        className="h-24 w-20 rounded-xl border-2 border-dashed border-slate-800 hover:border-indigo-500/80 hover:bg-slate-900/60 text-slate-400 hover:text-indigo-300 flex flex-col items-center justify-center gap-1 transition-all shrink-0"
      >
        <Plus className="w-4 h-4 text-indigo-400" />
        <span className="text-[10px] font-semibold">Slide</span>
      </button>

      {/* Slide Sorter Grid Button */}
      {onOpenSlideSorter && (
        <button
          onClick={onOpenSlideSorter}
          title="Buka Kisi Slide (Alt+S)"
          className="h-24 w-20 rounded-xl border border-slate-800/80 hover:border-indigo-500/80 bg-slate-900/40 hover:bg-slate-900 text-slate-400 hover:text-indigo-300 flex flex-col items-center justify-center gap-1 transition-all shrink-0"
        >
          <LayoutGrid className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-semibold">Kisi</span>
        </button>
      )}
    </div>
  );
};
