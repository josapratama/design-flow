import React, { useState } from 'react';
import { TEMPLATES, TemplateDefinition } from '../templates/template-library';
import { Layout, Smartphone, Presentation, Instagram, Sparkles, X, Search, Plus, RefreshCw, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { ElementRenderer } from './ElementRenderer';
import { getSlideBackground } from '../utils/slideStyle';

interface TemplatesModalProps {
  onSelectTemplate: (template: TemplateDefinition) => void;
  onAppendTemplate?: (template: TemplateDefinition) => void;
  currentSlideCount?: number;
  onClose: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  onSelectTemplate,
  onAppendTemplate,
  currentSlideCount = 1,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'slide' | 'uiux' | 'graphic'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  const handleReplace = (template: TemplateDefinition) => {
    if (currentSlideCount > 1) {
      const confirmReplace = window.confirm(
        `Perhatian: Membuka template "${template.name}" akan menggantikan seluruh ${currentSlideCount} slide proyek saat ini. Lanjutkan?\n\n(Tip: Pilih "+ Tambah Slide" jika ingin menggabungkan tanpa menghapus pekerjaan lama).`
      );
      if (!confirmReplace) return;
    }
    onSelectTemplate(template);
    onClose();
  };

  const handleAppend = (template: TemplateDefinition) => {
    if (onAppendTemplate) {
      onAppendTemplate(template);
    } else {
      onSelectTemplate(template);
    }
    onClose();
  };

  const filteredTemplates = TEMPLATES.filter(tpl => {
    const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
    const matchesQuery =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Pustaka Template Desain</h3>
              <p className="text-xs text-slate-400">Pilih template awal untuk mempercepat pembuatan karya presentasi & UI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1">
            {[
              { id: 'all', label: 'Semua Template' },
              { id: 'slide', label: 'Presentasi Slide' },
              { id: 'uiux', label: 'UI / UX Wireframe' },
              { id: 'graphic', label: 'Grafis & Cetak' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari template (skripsi, resume)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-medium"
            />
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-3 py-12 text-center text-slate-500 text-xs">
              Tidak ada template yang cocok dengan pencarian "{searchQuery}".
            </div>
          ) : (
            filteredTemplates.map(template => (
              <div
                key={template.id}
                className="group p-5 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/80 rounded-2xl flex flex-col justify-between transition-all shadow-lg hover:shadow-indigo-500/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {template.category === 'slide' ? (
                        <Presentation className="w-5 h-5" />
                      ) : template.category === 'uiux' ? (
                        <Smartphone className="w-5 h-5" />
                      ) : (
                        <Instagram className="w-5 h-5" />
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300">
                      {template.badge}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 mb-1 group-hover:text-indigo-300 transition-colors">
                    {template.name}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {template.description}
                  </p>

                  {/* Theme Palette Swatches */}
                  <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-800/50">
                    <span className="text-[10px] text-slate-500 font-medium mr-1">Palet:</span>
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm shrink-0"
                      style={{ backgroundColor: template.slides[0]?.background || '#090d16' }}
                      title={`Latar Belakang: ${template.slides[0]?.background}`}
                    />
                    {Array.from(
                      new Set(
                        template.slides[0]?.elements
                          .map(e => e.fill || e.color)
                          .filter(c => c && c.startsWith('#') && c !== template.slides[0]?.background)
                      )
                    )
                      .slice(0, 3)
                      .map((color, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm shrink-0"
                          style={{ backgroundColor: color }}
                          title={`Aksen Warna: ${color}`}
                        />
                      ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium shrink-0">
                      {template.slides.length} Slide
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewTemplate(template);
                        setPreviewSlideIdx(0);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 border border-slate-700 transition-colors"
                      title="Pratinjau visual seluruh slide template ini"
                    >
                      <Eye className="w-3 h-3 text-indigo-400" />
                      <span>Pratinjau</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {onAppendTemplate && (
                      <button
                        type="button"
                        onClick={() => handleAppend(template)}
                        title="Tambahkan slide template ini ke akhir proyek tanpa menghapus slide lama"
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 hover:border-indigo-500 text-[11px] font-semibold flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                        Tambah
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleReplace(template)}
                      title="Buka template ini sebagai proyek baru"
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all shadow-sm"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Ganti
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Slide Carousel Preview Lightbox */}
        {previewTemplate && (() => {
          const activePreviewSlide = previewTemplate.slides[previewSlideIdx] || previewTemplate.slides[0];
          const slideW = activePreviewSlide.width || 1920;
          const slideH = activePreviewSlide.height || 1080;
          // Scale to fit within preview viewport
          const pScale = Math.min(680 / slideW, 360 / slideH);

          return (
            <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
              <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Preview Header */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {previewTemplate.badge}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">{previewTemplate.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">
                      (Slide {previewSlideIdx + 1} dari {previewTemplate.slides.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Visual Slide Artboard View */}
                <div className="flex-1 bg-slate-950/80 flex items-center justify-center p-6 relative overflow-hidden min-h-[380px]">
                  {/* Prev Slide Arrow */}
                  {previewTemplate.slides.length > 1 && (
                    <button
                      type="button"
                      disabled={previewSlideIdx === 0}
                      onClick={() => setPreviewSlideIdx(prev => Math.max(0, prev - 1))}
                      className="absolute left-4 z-20 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 disabled:opacity-20 text-slate-300 hover:text-white border border-slate-700 shadow-xl transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  {/* Rendered Slide Frame */}
                  <div
                    className="rounded-lg shadow-2xl border border-slate-800/80 overflow-hidden relative transition-all"
                    style={{
                      width: `${slideW * pScale}px`,
                      height: `${slideH * pScale}px`,
                    }}
                  >
                    <div
                      style={{
                        width: `${slideW}px`,
                        height: `${slideH}px`,
                        background: getSlideBackground(activePreviewSlide),
                        transform: `scale(${pScale})`,
                        transformOrigin: 'top left',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                      }}
                    >
                      {activePreviewSlide.elements.map(el => (
                        <div
                          key={el.id}
                          className="absolute"
                          style={{
                            left: `${el.x}px`,
                            top: `${el.y}px`,
                            width: `${el.width}px`,
                            height: `${el.height}px`,
                            zIndex: el.zIndex,
                            opacity: el.opacity ?? 1,
                            visibility: el.hidden ? 'hidden' : 'visible',
                          }}
                        >
                          <ElementRenderer
                            element={el}
                            isSelected={false}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Slide Arrow */}
                  {previewTemplate.slides.length > 1 && (
                    <button
                      type="button"
                      disabled={previewSlideIdx === previewTemplate.slides.length - 1}
                      onClick={() => setPreviewSlideIdx(prev => Math.min(previewTemplate.slides.length - 1, prev + 1))}
                      className="absolute right-4 z-20 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 disabled:opacity-20 text-slate-300 hover:text-white border border-slate-700 shadow-xl transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Bottom Thumbnail Strip & Actions */}
                <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
                  {/* Thumbnails Navigation */}
                  <div className="flex items-center gap-2 overflow-x-auto max-w-[450px] py-1">
                    {previewTemplate.slides.map((s, idx) => (
                      <button
                        key={s.id || idx}
                        onClick={() => setPreviewSlideIdx(idx)}
                        className={`h-11 px-2 rounded-lg border text-left flex items-center gap-1.5 transition-all shrink-0 ${
                          previewSlideIdx === idx
                            ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold ring-2 ring-indigo-500/20'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="text-[10px] font-mono">#{idx + 1}</span>
                        <span className="text-[11px] truncate max-w-[90px]">{s.title || `Slide ${idx + 1}`}</span>
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(null)}
                      className="px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium transition-colors"
                    >
                      Tutup
                    </button>
                    {onAppendTemplate && (
                      <button
                        type="button"
                        onClick={() => {
                          handleAppend(previewTemplate);
                          setPreviewTemplate(null);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 hover:border-indigo-500 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah ke Proyek</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        handleReplace(previewTemplate);
                        setPreviewTemplate(null);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Ganti Seluruh Proyek</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
