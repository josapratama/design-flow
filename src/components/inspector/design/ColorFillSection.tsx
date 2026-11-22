import React from 'react';
import { Pipette, Sparkles } from 'lucide-react';
import { DesignElement, Slide } from '../../../types';
import { evaluateContrast } from '../../../utils/colorContrast';

interface ColorFillSectionProps {
  element: DesignElement;
  activeSlide: Slide;
  handleChange: (field: keyof DesignElement, val: any) => void;
  handleEyeDropper: (field: 'fill' | 'color' | 'stroke') => void;
  documentColors: string[];
  colorHarmonies: any;
  showToast: (msg: string) => void;
}

export const ColorFillSection: React.FC<ColorFillSectionProps> = ({
  element,
  activeSlide,
  handleChange,
  handleEyeDropper,
  documentColors,
  colorHarmonies,
  showToast,
}) => {
  const effectiveBg =
    element.fill && element.fill !== 'transparent' && !element.fill.startsWith('rgba')
      ? element.fill
      : activeSlide.background || '#0f172a';
  const contrast = evaluateContrast(element.color || '#ffffff', effectiveBg);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Warna & Tampilan Visual
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Fill Color */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] text-slate-500 font-medium">Warna Isi (Fill)</label>
            <button
              type="button"
              onClick={() => handleEyeDropper('fill')}
              title="Ambil warna dari layar (Pipet Eyedropper)"
              className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded transition-colors"
            >
              <Pipette className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
            <input
              type="color"
              value={element.fill && element.fill.startsWith('#') ? element.fill : '#1e293b'}
              onChange={e => handleChange('fill', e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
            />
            <span className="text-[11px] font-mono text-slate-300 truncate">
              {element.fill || 'transparent'}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {['#4f46e5', '#0284c7', '#059669', '#e11d48', '#d97706', '#1e293b', 'transparent'].map(sw => (
              <button
                key={sw}
                type="button"
                onClick={() => handleChange('fill', sw)}
                title={sw === 'transparent' ? 'Transparan (Tanpa Isi)' : `Pilih warna ${sw}`}
                className={`w-4 h-4 rounded-md border transition-all ${
                  element.fill === sw
                    ? 'border-indigo-400 scale-110 shadow-sm ring-1 ring-indigo-400/40'
                    : 'border-slate-700/80 hover:border-slate-500 hover:scale-105'
                }`}
                style={{
                  backgroundColor: sw === 'transparent' ? 'transparent' : sw,
                  backgroundImage:
                    sw === 'transparent'
                      ? 'linear-gradient(45deg, #334155 25%, transparent 25%), linear-gradient(-45deg, #334155 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #334155 75%), linear-gradient(-45deg, transparent 75%, #334155 75%)'
                      : undefined,
                  backgroundSize: '6px 6px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Text Color */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <label className="text-[10px] text-slate-500 font-medium">Warna Teks</label>
              <span
                className={`text-[8px] px-1 py-0.2 rounded border font-mono ${
                  contrast.level === 'AAA' || contrast.level === 'AA'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
                title={`Kontras WCAG: ${contrast.ratio}:1 (${contrast.label})`}
              >
                {contrast.level}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleEyeDropper('color')}
              title="Ambil warna dari layar (Pipet Eyedropper)"
              className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded transition-colors"
            >
              <Pipette className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
            <input
              type="color"
              value={element.color || '#ffffff'}
              onChange={e => handleChange('color', e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
            />
            <span className="text-[11px] font-mono text-slate-300 truncate">
              {element.color || '#ffffff'}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {['#ffffff', '#f8fafc', '#cbd5e1', '#94a3b8', '#6366f1', '#38bdf8', '#34d399'].map(sw => (
              <button
                key={sw}
                type="button"
                onClick={() => handleChange('color', sw)}
                title={`Pilih warna teks ${sw}`}
                className={`w-4 h-4 rounded-md border transition-all ${
                  element.color === sw
                    ? 'border-indigo-400 scale-110 shadow-sm ring-1 ring-indigo-400/40'
                    : 'border-slate-700/80 hover:border-slate-500 hover:scale-105'
                }`}
                style={{ backgroundColor: sw }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Preset Gradien Modern */}
      <details className="group border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
        <summary className="px-2.5 py-1.5 cursor-pointer flex items-center justify-between text-[10px] font-medium text-slate-400 hover:text-slate-200 select-none">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Preset Gradien Elemen</span>
          </span>
          <span className="text-slate-500 text-[10px] group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="p-2 pt-1 border-t border-slate-800/60 grid grid-cols-4 gap-1.5">
          {[
            { name: 'Midnight Violet', bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' },
            { name: 'Electric Indigo', bg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
            { name: 'Cyber Cyan', bg: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' },
            { name: 'Aurora Emerald', bg: 'linear-gradient(135deg, #047857 0%, #10b981 100%)' },
            { name: 'Sunset Crimson', bg: 'linear-gradient(135deg, #be123c 0%, #f97316 100%)' },
            { name: 'Cosmic Magenta', bg: 'linear-gradient(135deg, #831843 0%, #db2777 100%)' },
            { name: 'Deep Slate', bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
            { name: 'Dark Glass', bg: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)' },
          ].map(g => (
            <button
              key={g.name}
              type="button"
              onClick={() => handleChange('fill', g.bg)}
              title={g.name}
              className={`h-5 rounded border transition-all ${
                element.fill === g.bg
                  ? 'border-indigo-400 scale-105 ring-1 ring-indigo-400/50'
                  : 'border-slate-800 hover:border-slate-600 hover:scale-105'
              }`}
              style={{ background: g.bg }}
            />
          ))}
        </div>
      </details>

      {/* Opacity Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Opasitas (Transparansi)</span>
          <span className="font-mono text-indigo-400">
            {Math.round((element.opacity !== undefined ? element.opacity : 1) * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={element.opacity !== undefined ? element.opacity : 1}
          onChange={e => handleChange('opacity', Number(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer"
        />
      </div>
    </div>
  );
};
