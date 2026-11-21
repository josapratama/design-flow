import React from 'react';
import { TEMPLATES, TemplateDefinition } from '../templates/template-library';
import { Layout, Smartphone, Presentation, Instagram, Sparkles, X } from 'lucide-react';

interface TemplatesModalProps {
  onSelectTemplate: (template: TemplateDefinition) => void;
  onClose: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ onSelectTemplate, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Pustaka Template Desain</h3>
              <p className="text-xs text-slate-400">Pilih template awal untuk mempercepat pembuatan karya Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template Cards Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
          {TEMPLATES.map(template => {
            return (
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
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{template.slides.length} Slide / Halaman</span>
                  <span className="text-indigo-400 font-semibold group-hover:underline">Gunakan →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
