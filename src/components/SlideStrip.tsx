import React from 'react';
import { Slide } from '../types';
import {
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface SlideStripProps {
  slides: Slide[];
  activeSlideId: string;
  onSelectSlide: (slideId: string) => void;
  onAddSlide: () => void;
  onDuplicateSlide: (slideId: string) => void;
  onDeleteSlide: (slideId: string) => void;
  onReorderSlide: (slideId: string, direction: 'left' | 'right' | 'start' | 'end') => void;
  onUpdateSlideTitle?: (slideId: string, newTitle: string) => void;
}

export const SlideStrip: React.FC<SlideStripProps> = ({
  slides,
  activeSlideId,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onReorderSlide,
  onUpdateSlideTitle,
}) => {
  const [editingSlideId, setEditingSlideId] = React.useState<string | null>(null);
  const [tempTitle, setTempTitle] = React.useState('');
  return (
    <div className="h-32 bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center gap-3 overflow-x-auto select-none shrink-0 z-10">
      {slides.map((slide, index) => {
        const isActive = slide.id === activeSlideId;
        const scaleFactor = 130 / (slide.width || 1920);

        return (
          <div
            key={slide.id}
            onClick={() => onSelectSlide(slide.id)}
            className={`group relative h-26 w-38 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between p-2 shrink-0 overflow-hidden ${isActive
              ? 'border-indigo-500 bg-slate-800/90 shadow-xl shadow-indigo-500/20 ring-1 ring-indigo-400/50'
              : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
              }`}
          >
            {/* Header: Slide Number & Title */}
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-200 pointer-events-none">
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
                  className="text-[10px] font-semibold bg-slate-800 border border-indigo-500 rounded px-1 py-0.5 text-white outline-none w-24"
                />
              ) : (
                <span
                  onDoubleClick={e => {
                    e.stopPropagation();
                    setEditingSlideId(slide.id);
                    setTempTitle(slide.title);
                  }}
                  title="Klik ganda untuk mengubah judul slide"
                  className="text-[10px] font-semibold text-slate-300 truncate max-w-[90px] cursor-text hover:text-white hover:underline decoration-dotted"
                >
                  {slide.title}
                </span>
              )}
            </div>

            {/* Scaled Mini Visual Canvas Thumbnail */}
            <div
              className="relative w-full h-14 rounded-md overflow-hidden border border-slate-700/60 my-0.5 pointer-events-none shrink-0"
              style={{
                background: slide.wallpaper
                  ? `url('${slide.wallpaper}') center / cover no-repeat`
                  : slide.background || '#0f172a',
              }}
            >
              <div
                className="absolute origin-top-left pointer-events-none"
                style={{
                  width: `${slide.width}px`,
                  height: `${slide.height}px`,
                  transform: `scale(${scaleFactor})`,
                }}
              >
                {slide.elements.map(el => (
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
                ))}
              </div>
            </div>

            {/* Micro Element Count */}
            <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono z-10 pointer-events-none">
              <span>{slide.presetName || '16:9'}</span>
              <span>{slide.elements.length} el</span>
            </div>

            {/* Hover Action Buttons */}
            <div className="absolute inset-0 bg-slate-950/90 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-0.5 transition-opacity z-20">
              {/* Move to Start */}
              {index > 1 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onReorderSlide(slide.id, 'start');
                  }}
                  title="Pindah ke Posisi Pertama (Slide 1)"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Move Left */}
              {index > 0 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onReorderSlide(slide.id, 'left');
                  }}
                  title="Geser Slide ke Kiri"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Duplicate */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDuplicateSlide(slide.id);
                }}
                title="Duplikat Slide"
                className="p-1 hover:bg-slate-800 text-slate-300 rounded"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              {/* Delete */}
              {slides.length > 1 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (slide.elements.length > 2) {
                      const confirmed = window.confirm(
                        `Hapus slide "${slide.title}" beserta ${slide.elements.length} elemen di dalamnya?`
                      );
                      if (!confirmed) return;
                    }
                    onDeleteSlide(slide.id);
                  }}
                  title="Hapus Slide"
                  className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Move Right */}
              {index < slides.length - 1 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onReorderSlide(slide.id, 'right');
                  }}
                  title="Geser Slide ke Kanan"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Move to End */}
              {index < slides.length - 2 && (
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
          </div>
        );
      })}

      {/* Add New Slide Button */}
      <button
        onClick={onAddSlide}
        title="Tambah Slide Baru"
        className="h-26 w-24 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-800/40 text-slate-400 hover:text-indigo-400 flex flex-col items-center justify-center gap-1.5 transition-all shrink-0"
      >
        <Plus className="w-5 h-5" />
        <span className="text-[10px] font-bold">Slide Baru</span>
      </button>
    </div>
  );
};
