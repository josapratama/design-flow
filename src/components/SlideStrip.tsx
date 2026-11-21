import React from 'react';
import { Slide } from '../types';
import { Plus, Copy, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideStripProps {
  slides: Slide[];
  activeSlideId: string;
  onSelectSlide: (slideId: string) => void;
  onAddSlide: () => void;
  onDuplicateSlide: (slideId: string) => void;
  onDeleteSlide: (slideId: string) => void;
  onReorderSlide: (slideId: string, direction: 'left' | 'right') => void;
}

export const SlideStrip: React.FC<SlideStripProps> = ({
  slides,
  activeSlideId,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onReorderSlide,
}) => {
  return (
    <div className="h-28 bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center gap-3 overflow-x-auto select-none shrink-0 z-10">
      {slides.map((slide, index) => {
        const isActive = slide.id === activeSlideId;

        return (
          <div
            key={slide.id}
            onClick={() => onSelectSlide(slide.id)}
            className={`group relative h-22 w-36 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between p-2 shrink-0 overflow-hidden ${
              isActive
                ? 'border-indigo-500 bg-slate-800 shadow-lg shadow-indigo-500/20'
                : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
            }`}
            style={{ backgroundColor: slide.background || '#0f172a' }}
          >
            {/* Header: Slide Number & Title */}
            <div className="flex items-center justify-between pointer-events-none z-10">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-200">
                {index + 1}
              </span>
              <span className="text-[10px] font-semibold text-slate-300 truncate max-w-[85px]">
                {slide.title}
              </span>
            </div>

            {/* Micro Element Indicator Dots */}
            <div className="flex items-center gap-1 opacity-50 z-10 pointer-events-none">
              {slide.elements.slice(0, 5).map(el => (
                <div
                  key={el.id}
                  className="w-1.5 h-1.5 rounded-full bg-slate-400"
                />
              ))}
            </div>

            {/* Hover Action Buttons */}
            <div className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity z-20">
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
            </div>
          </div>
        );
      })}

      {/* Add New Slide Button */}
      <button
        onClick={onAddSlide}
        className="h-22 w-28 rounded-lg border-2 border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-slate-500 hover:text-indigo-400 flex flex-col items-center justify-center gap-1 shrink-0 transition-all cursor-pointer"
      >
        <Plus className="w-5 h-5" />
        <span className="text-[11px] font-medium">+ Slide</span>
      </button>
    </div>
  );
};
