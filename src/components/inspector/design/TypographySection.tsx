import React from 'react';
import { Sparkles, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { DesignElement } from '../../../types';
import { POPULAR_FONTS, getFontFamilyStyle } from '../../../utils/fontLoader';

interface TypographySectionProps {
  element: DesignElement;
  handleChange: (field: keyof DesignElement, val: any) => void;
  handleAutoContrast: () => void;
  fontFilterCategory: 'all' | 'Sans Serif' | 'Serif' | 'Monospace' | 'Display';
  setFontFilterCategory: (cat: 'all' | 'Sans Serif' | 'Serif' | 'Monospace' | 'Display') => void;
}

export const TypographySection: React.FC<TypographySectionProps> = ({
  element,
  handleChange,
  handleAutoContrast,
  fontFilterCategory,
  setFontFilterCategory,
}) => {
  const isTextual =
    element.fontSize !== undefined ||
    ['heading', 'text', 'quote', 'button', 'card'].includes(element.type);

  if (!isTextual) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Tipografi
        </span>
        <button
          type="button"
          onClick={handleAutoContrast}
          title="Otomatis sesuaikan kontras warna teks terhadap latar belakang (WCAG AAA)"
          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline"
        >
          <Sparkles className="w-3 h-3" />
          <span>Kontras Otomatis</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-slate-500 block mb-1">Ukuran Font</label>
          <input
            type="number"
            value={element.fontSize || 16}
            onChange={e => handleChange('fontSize', Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-500 block mb-1">Ketebalan</label>
          <select
            value={element.fontWeight || 'normal'}
            onChange={e => handleChange('fontWeight', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-xs"
          >
            <option value="normal">Reguler</option>
            <option value="medium">Medium</option>
            <option value="semibold">Semibold</option>
            <option value="bold">Tebal</option>
            <option value="extrabold">Ekstra</option>
          </select>
        </div>

        {/* Quick Font Size Hierarchy Pills */}
        <div className="col-span-2 space-y-1 pt-0.5">
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Hierarki Cepat</span>
            <span className="font-mono text-indigo-400 font-semibold">{element.fontSize || 16}px</span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {[14, 18, 24, 36, 48, 64].map(sz => (
              <button
                key={sz}
                type="button"
                onClick={() => handleChange('fontSize', sz)}
                className={`py-1 rounded text-center text-[10px] font-mono border transition-all ${
                  (element.fontSize || 16) === sz
                    ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family Picker */}
        <div className="col-span-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-slate-500">Google & Web Font Family</label>
            <span className="text-[9px] text-indigo-400 font-medium">Live CDN</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'Sans Serif', label: 'Sans' },
              { id: 'Serif', label: 'Serif' },
              { id: 'Monospace', label: 'Mono' },
              { id: 'Display', label: 'Display' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFontFilterCategory(cat.id as any)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  fontFilterCategory === cat.id
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <select
            value={element.fontFamily || 'sans'}
            onChange={e => handleChange('fontFamily', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-xs font-medium cursor-pointer"
          >
            {(fontFilterCategory === 'all' || fontFilterCategory === 'Sans Serif') && (
              <optgroup label="Sistem Dasar">
                <option value="sans">Sans (Inter / Default)</option>
                {fontFilterCategory === 'all' && <option value="serif">Serif (Klasik)</option>}
                {fontFilterCategory === 'all' && <option value="mono">Monospace (Kode)</option>}
              </optgroup>
            )}
            {(fontFilterCategory === 'all' || fontFilterCategory === 'Sans Serif') && (
              <optgroup label="Google Fonts — Sans Serif">
                {POPULAR_FONTS.filter(f => f.category === 'Sans Serif').map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
            )}
            {(fontFilterCategory === 'all' || fontFilterCategory === 'Serif') && (
              <optgroup label="Google Fonts — Serif">
                {POPULAR_FONTS.filter(f => f.category === 'Serif').map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
            )}
            {(fontFilterCategory === 'all' || fontFilterCategory === 'Monospace') && (
              <optgroup label="Google Fonts — Monospace">
                {POPULAR_FONTS.filter(f => f.category === 'Monospace').map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
            )}
            {(fontFilterCategory === 'all' || fontFilterCategory === 'Display') && (
              <optgroup label="Google Fonts — Display & Headline">
                {POPULAR_FONTS.filter(f => f.category === 'Display').map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          {/* Live Preview Badge */}
          <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-medium">Pratinjau Tipografi</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono">
                {POPULAR_FONTS.find(
                  f => f.id === element.fontFamily || f.name.toLowerCase() === element.fontFamily?.toLowerCase()
                )?.name || (element.fontFamily === 'serif' ? 'Serif (Klasik)' : element.fontFamily === 'mono' ? 'Monospace (Kode)' : 'Inter (Sans)')}
              </span>
            </div>
            <div
              className="text-xs text-slate-200 py-1 px-2 bg-slate-900/60 rounded border border-slate-800/60 overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ fontFamily: getFontFamilyStyle(element.fontFamily) }}
            >
              Ag The quick brown fox jumps 123
            </div>
          </div>

          {/* Styles & Alignment */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-slate-500">Gaya & Rata</label>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => handleChange('fontWeight', element.fontWeight === 'bold' ? 'normal' : 'bold')}
                    title="Tebal (Bold)"
                    className={`p-1.5 rounded transition-colors ${
                      element.fontWeight === 'bold' || element.fontWeight === 'extrabold'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('fontStyle', element.fontStyle === 'italic' ? 'normal' : 'italic')}
                    title="Miring (Italic)"
                    className={`p-1.5 rounded transition-colors ${
                      element.fontStyle === 'italic'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('textDecoration', element.textDecoration === 'underline' ? 'none' : 'underline')}
                    title="Garis Bawah (Underline)"
                    className={`p-1.5 rounded transition-colors ${
                      element.textDecoration === 'underline'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('textDecoration', element.textDecoration === 'line-through' ? 'none' : 'line-through')}
                    title="Coret (Strikethrough)"
                    className={`p-1.5 rounded transition-colors ${
                      element.textDecoration === 'line-through'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                  {[
                    { id: 'left', label: 'Kiri', icon: AlignLeft },
                    { id: 'center', label: 'Tengah', icon: AlignCenter },
                    { id: 'right', label: 'Kanan', icon: AlignRight },
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = (element.textAlign || 'left') === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleChange('textAlign', item.id)}
                        title={`Rata ${item.label}`}
                        className={`p-1.5 rounded transition-colors ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
