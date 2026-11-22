import React from 'react';
import { Pipette } from 'lucide-react';
import { DesignElement } from '../../../types';

interface BorderShadowSectionProps {
  element: DesignElement;
  handleChange: (field: keyof DesignElement, val: any) => void;
  handleEyeDropper: (field: 'fill' | 'color' | 'stroke') => void;
}

export const BorderShadowSection: React.FC<BorderShadowSectionProps> = ({
  element,
  handleChange,
  handleEyeDropper,
}) => {
  const isPureText = ['heading', 'text', 'quote'].includes(element.type);

  const borderControls = (
    <div className="space-y-3">
      {/* Sudut Lengkung (Border Radius) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Sudut Lengkung (Radius)</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={9999}
              value={element.borderRadius !== undefined ? element.borderRadius : 0}
              onChange={e => handleChange('borderRadius', Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-12 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 text-right font-mono text-[10px] outline-none focus:border-indigo-500"
            />
            <span className="font-mono text-slate-500">px</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[0, 6, 12, 20, 9999].map(r => (
            <button
              key={r}
              onClick={() => handleChange('borderRadius', r)}
              className={`flex-1 py-1 rounded-md text-[10px] font-mono border transition-all ${
                (element.borderRadius || 0) === r
                  ? 'bg-slate-700 border-slate-500 text-white font-semibold shadow-sm'
                  : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {r === 9999 ? 'Pill' : `${r}px`}
            </button>
          ))}
        </div>
      </div>

      {/* Garis Tepi (Border / Stroke) */}
      <div className="space-y-2 pt-2 border-t border-slate-800/70">
        <div className="flex items-center justify-between">
          <label className="text-[10px] text-slate-400 font-medium">Garis Tepi (Border)</label>
          {element.stroke && (
            <button
              type="button"
              onClick={() => {
                handleChange('stroke', undefined);
                handleChange('strokeWidth', 0);
              }}
              className="text-[9px] text-rose-400 hover:underline"
            >
              Hapus Border
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500">Warna Garis</span>
              <button
                type="button"
                onClick={() => handleEyeDropper('stroke')}
                title="Ambil warna dari layar"
                className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded transition-colors"
              >
                <Pipette className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 focus-within:border-indigo-500 rounded-lg px-2 py-1">
              <input
                type="color"
                value={element.stroke && element.stroke.startsWith('#') ? element.stroke : '#6366f1'}
                onChange={e => {
                  handleChange('stroke', e.target.value);
                  if (!element.strokeWidth) handleChange('strokeWidth', 2);
                }}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={element.stroke || ''}
                placeholder="#6366F1"
                maxLength={25}
                onChange={e => {
                  const val = e.target.value;
                  handleChange('stroke', val ? val : undefined);
                  if (val && !element.strokeWidth) handleChange('strokeWidth', 2);
                }}
                className="w-full bg-transparent text-[11px] font-mono text-slate-200 outline-none uppercase placeholder:normal-case placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block mb-1">Gaya Garis</span>
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              {[
                { id: 'solid', label: 'Solid' },
                { id: 'dashed', label: 'Putus' },
                { id: 'dotted', label: 'Titik' },
              ].map(dash => (
                <button
                  key={dash.id}
                  type="button"
                  onClick={() => {
                    handleChange('strokeDash', dash.id as any);
                    if (!element.stroke) handleChange('stroke', '#6366f1');
                    if (!element.strokeWidth) handleChange('strokeWidth', 2);
                  }}
                  className={`flex-1 py-1 rounded text-[10px] transition-all ${
                    (element.strokeDash || 'solid') === dash.id && element.stroke
                      ? 'bg-slate-700 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {dash.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ketebalan Garis */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Ketebalan</span>
            <span className="font-mono text-slate-300 font-medium">
              {element.stroke ? `${element.strokeWidth || 1}px` : '0px'}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {[0, 1, 2, 3, 4].map(w => (
              <button
                key={w}
                type="button"
                onClick={() => {
                  if (w === 0) {
                    handleChange('stroke', undefined);
                    handleChange('strokeWidth', 0);
                  } else {
                    if (!element.stroke) handleChange('stroke', '#6366f1');
                    handleChange('strokeWidth', w);
                  }
                }}
                className={`py-1 rounded-md text-center text-[10px] font-mono border transition-all ${
                  (w === 0 && !element.stroke) || (element.stroke && (element.strokeWidth || 1) === w)
                    ? 'bg-slate-700 border-slate-500 text-white font-semibold shadow-sm'
                    : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {w === 0 ? '0px' : `${w}px`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Efek Bayangan (Shadow) */}
      <div className="space-y-2 pt-2 border-t border-slate-800/70">
        <label className="text-[10px] text-slate-400 font-medium block">Efek Bayangan (Shadow)</label>
        <div className="grid grid-cols-6 gap-1">
          {['none', 'sm', 'md', 'lg', 'xl', '2xl'].map(s => (
            <button
              key={s}
              onClick={() => handleChange('shadow', s)}
              className={`py-1 rounded-md text-[10px] uppercase font-medium border transition-all ${
                (element.shadow || 'none') === s
                  ? 'bg-slate-700 border-slate-500 text-white shadow-sm font-semibold'
                  : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Neon Glow Presets */}
        <div className="pt-1 flex items-center justify-between">
          <span className="text-[9px] text-slate-500 font-medium">Pendaran (Glow):</span>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'glow-indigo', name: 'Indigo', color: 'bg-indigo-500' },
              { id: 'glow-cyan', name: 'Cyan', color: 'bg-cyan-400' },
              { id: 'glow-emerald', name: 'Emerald', color: 'bg-emerald-400' },
              { id: 'glow-rose', name: 'Rose', color: 'bg-rose-500' },
            ].map(glow => {
              const isSelected = element.shadow === glow.id;
              return (
                <button
                  key={glow.id}
                  type="button"
                  onClick={() => handleChange('shadow', isSelected ? 'none' : glow.id)}
                  title={`Efek glow ${glow.name}`}
                  className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[9px] ${
                    isSelected
                      ? 'bg-slate-800 border-slate-600 text-white ring-1 ring-white/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${glow.color} shrink-0`} />
                  <span>{glow.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  if (isPureText) {
    return (
      <details className="group border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
        <summary className="px-2.5 py-1.5 cursor-pointer flex items-center justify-between text-[10px] font-medium text-slate-400 hover:text-slate-200 select-none">
          <span>Border & Bayangan (Opsional)</span>
          <span className="text-slate-500 text-[10px] group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="p-2.5 pt-1 border-t border-slate-800/60">{borderControls}</div>
      </details>
    );
  }

  return borderControls;
};
