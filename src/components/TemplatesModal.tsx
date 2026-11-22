import React, { useState } from 'react';
import { TEMPLATES, TemplateDefinition } from '../templates/template-library';
import { Layout, Smartphone, Presentation, Instagram, Sparkles, X, Search } from 'lucide-react';

interface TemplatesModalProps {
  onSelectTemplate: (template: TemplateDefinition) => void;
  onClose: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ onSelectTemplate, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'slide' | 'uiux' | 'graphic'>('all');

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
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
                className="group p-5 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500 rounded-2xl flex flex-col justify-between transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10"
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

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{template.slides.length} Slide / Halaman</span>
                  <span className="text-indigo-400 font-semibold group-hover:underline">Gunakan →</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
