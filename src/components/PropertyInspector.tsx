import React, { useState } from 'react';
import { DesignElement, PRESET_SIZES, Slide } from '../types';
import {
  Trash2,
  Copy,
  Plus,
  BringToFront,
  SendToBack,
  ArrowUp,
  ArrowDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Palette,
  Monitor,
  StickyNote,
  Smile,
  RotateCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowLeftRight,
  ArrowUpDown,
  Pipette,
  Image as ImageIcon,
  Sparkles,
  Upload,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { POPULAR_FONTS } from '../utils/fontLoader';

interface PropertyInspectorProps {
  element: DesignElement | null;
  activeSlide: Slide;
  selectedCount?: number;
  onUpdateElement: (elementId: string, updates: Partial<DesignElement>) => void;
  onUpdateSlide: (slideId: string, updates: Partial<Slide>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onReorder: (direction: 'front' | 'back' | 'up' | 'down') => void;
  onAlignElement: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistributeElements?: (direction: 'horizontal' | 'vertical') => void;
  onApplySlideTheme?: (theme: { background: string; primaryAccent: string; cardFill: string; textColor: string }) => void;
  onToggleLock?: (elementId: string) => void;
  onToggleHide?: (elementId: string) => void;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  element,
  activeSlide,
  selectedCount = 0,
  onUpdateElement,
  onUpdateSlide,
  onDelete,
  onDuplicate,
  onReorder,
  onAlignElement,
  onDistributeElements,
  onApplySlideTheme,
  onToggleLock,
  onToggleHide,
}) => {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconFilter, setIconFilter] = useState('');

  const popularIconNames = [
    'Star', 'Heart', 'Shield', 'Check', 'User', 'Search', 'Settings', 'Home',
    'ArrowRight', 'Zap', 'Download', 'Compass', 'Laptop', 'Mail', 'Phone',
    'Calendar', 'Clock', 'Lock', 'Sparkles', 'Folder', 'FileText', 'BarChart3',
    'Smartphone', 'CreditCard', 'Camera', 'Bell', 'Tag', 'Bookmark', 'Globe', 'HelpCircle'
  ];

  // 1. IF NO ELEMENT IS SELECTED: SHOW CANVAS & SLIDE SETTINGS
  if (!element) {
    const bgSwatches = [
      { name: 'Dark Slate', color: '#090d16' },
      { name: 'Navy Indigo', color: '#0f172a' },
      { name: 'Cyberpunk', color: '#0e0b1f' },
      { name: 'Deep Emerald', color: '#041d15' },
      { name: 'Warm Crimson', color: '#1a0d15' },
      { name: 'Pure Black', color: '#000000' },
      { name: 'Minimal White', color: '#ffffff' },
      { name: 'Soft Gray', color: '#f8fafc' },
    ];

    const gradientSwatches = [
      { name: 'Midnight Violet', bg: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)' },
      { name: 'Deep Ocean', bg: 'linear-gradient(135deg, #020617 0%, #0c4a6e 100%)' },
      { name: 'Cyberpunk Glow', bg: 'linear-gradient(135deg, #0e0b1f 0%, #3b0764 100%)' },
      { name: 'Sunset Crimson', bg: 'linear-gradient(135deg, #180512 0%, #4c0519 100%)' },
      { name: 'Aurora Emerald', bg: 'linear-gradient(135deg, #021a12 0%, #064e3b 100%)' },
      { name: 'Slate Modern', bg: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' },
    ];

    return (
      <aside className="w-72 h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 select-none z-10">
        <div className="p-3 border-b border-slate-800 flex items-center gap-2 bg-slate-950/40">
          <Monitor className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-100">Pengaturan Slide / Kanvas</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-300">
          {/* Judul Slide */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">Nama / Judul Slide</label>
            <input
              type="text"
              value={activeSlide.title}
              onChange={e => onUpdateSlide(activeSlide.id, { title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-xs font-medium"
            />
          </div>

          {/* Preset Ukuran Artboard */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">Ukuran Preset Artboard</label>
            <select
              value={activeSlide.presetName}
              onChange={e => {
                const preset = PRESET_SIZES.find(p => p.name === e.target.value);
                if (preset) {
                  onUpdateSlide(activeSlide.id, {
                    presetName: preset.name,
                    width: preset.width,
                    height: preset.height,
                  });
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-xs"
            >
              {PRESET_SIZES.map(p => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.width}×{p.height})
                </option>
              ))}
            </select>
          </div>

          {/* Dimensi Custom */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Lebar (W)</label>
              <input
                type="number"
                value={activeSlide.width}
                onChange={e => onUpdateSlide(activeSlide.id, { width: Math.max(100, Number(e.target.value)) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Tinggi (H)</label>
              <input
                type="number"
                value={activeSlide.height}
                onChange={e => onUpdateSlide(activeSlide.id, { height: Math.max(100, Number(e.target.value)) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
          </div>

          {/* Warna Latar Belakang */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Warna Latar (Background)</span>
            </span>

            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
              <input
                type="color"
                value={activeSlide.background.startsWith('#') ? activeSlide.background : '#090d16'}
                onChange={e => onUpdateSlide(activeSlide.id, { background: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono text-slate-300 flex-1 truncate">
                {activeSlide.background}
              </span>
            </div>

            {/* Quick Palette Swatches */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {bgSwatches.map(swatch => (
                <button
                  key={swatch.color}
                  onClick={() => onUpdateSlide(activeSlide.id, { background: swatch.color })}
                  title={swatch.name}
                  className="h-7 rounded-md border border-slate-700 hover:scale-105 transition-transform"
                  style={{ backgroundColor: swatch.color }}
                />
              ))}
            </div>

            {/* Modern Linear Gradients */}
            <div className="space-y-1 pt-1.5">
              <span className="text-[10px] text-slate-500 font-semibold">Gradasi Modern</span>
              <div className="grid grid-cols-3 gap-1.5">
                {gradientSwatches.map(grad => (
                  <button
                    key={grad.name}
                    onClick={() => onUpdateSlide(activeSlide.id, { background: grad.bg })}
                    title={grad.name}
                    className="h-7 rounded-md border border-slate-700 hover:scale-105 transition-transform text-[8px] font-medium text-white/90 flex items-center justify-center shadow-sm"
                    style={{ background: grad.bg }}
                  >
                    {grad.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Tema Palet Harmonis Slide (1-Klik) */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Tema Palet Harmonis (1-Klik)
                </span>
                <span className="text-[9px] text-indigo-400 font-mono font-medium">Auto-Theming</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  {
                    name: 'Midnight',
                    background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
                    primaryAccent: '#6366f1',
                    cardFill: 'rgba(30, 27, 75, 0.7)',
                    textColor: '#cbd5e1',
                    dot: '#6366f1',
                  },
                  {
                    name: 'Cyberpunk',
                    background: 'linear-gradient(135deg, #0e0b1f 0%, #3b0764 100%)',
                    primaryAccent: '#d946ef',
                    cardFill: 'rgba(59, 7, 100, 0.7)',
                    textColor: '#e2e8f0',
                    dot: '#d946ef',
                  },
                  {
                    name: 'Deep Emerald',
                    background: 'linear-gradient(135deg, #021a12 0%, #064e3b 100%)',
                    primaryAccent: '#10b981',
                    cardFill: 'rgba(6, 78, 59, 0.7)',
                    textColor: '#a7f3d0',
                    dot: '#10b981',
                  },
                  {
                    name: 'Sunset Warm',
                    background: 'linear-gradient(135deg, #180512 0%, #4c0519 100%)',
                    primaryAccent: '#f43f5e',
                    cardFill: 'rgba(76, 5, 25, 0.7)',
                    textColor: '#fecdd3',
                    dot: '#f43f5e',
                  },
                ].map(theme => (
                  <button
                    key={theme.name}
                    onClick={() => {
                      if (onApplySlideTheme) {
                        onApplySlideTheme(theme);
                      } else {
                        onUpdateSlide(activeSlide.id, { background: theme.background });
                      }
                    }}
                    title={`Terapkan tema ${theme.name} ke background dan seluruh elemen`}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:scale-[1.02] flex items-center gap-2 group transition-all text-left shadow-sm"
                  >
                    <span className="w-3 h-3 rounded-full shrink-0 shadow" style={{ backgroundColor: theme.dot }} />
                    <div className="truncate">
                      <div className="text-[10px] font-bold text-slate-200 group-hover:text-white truncate">
                        {theme.name}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate">Seleraskan Elemen</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Wallpaper & Gambar Latar Slide (Unsplash HD Presets & Custom Upload) */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Gambar Latar / Wallpaper HD</span>
                </span>
                {activeSlide.wallpaper && (
                  <button
                    onClick={() => onUpdateSlide(activeSlide.id, { wallpaper: undefined })}
                    className="text-[9px] text-rose-400 hover:underline"
                  >
                    Hapus Wallpaper
                  </button>
                )}
              </div>

              {/* 4 Wallpaper Preset Thumbnails */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  {
                    name: 'Mesh Glow',
                    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80',
                  },
                  {
                    name: 'Cyber Wave',
                    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1920&q=80',
                  },
                  {
                    name: 'Deep Tech Glow',
                    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1920&q=80',
                  },
                  {
                    name: 'Minimal Arch',
                    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1920&q=80',
                  },
                ].map(wp => (
                  <button
                    key={wp.name}
                    onClick={() => onUpdateSlide(activeSlide.id, { wallpaper: wp.url })}
                    className={`group relative h-12 rounded-lg overflow-hidden border transition-all text-left ${
                      activeSlide.wallpaper === wp.url
                        ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={wp.url}
                      alt={wp.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent flex items-end p-1.5">
                      <span className="text-[9px] font-semibold text-white/90 truncate">
                        {wp.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Image URL input and File Upload */}
              <div className="pt-1 flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Tempel URL gambar latar lalu Enter..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = e.currentTarget.value.trim();
                      if (val) {
                        onUpdateSlide(activeSlide.id, { wallpaper: val });
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-[11px] font-mono placeholder:text-slate-600"
                />
                <label className="w-full py-1.5 px-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 hover:text-white text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Unggah Wallpaper dari Perangkat</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => {
                        const base64 = ev.target?.result as string;
                        if (base64) {
                          onUpdateSlide(activeSlide.id, { wallpaper: base64 });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Catatan Pembicara (Speaker Notes) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5 text-amber-400" />
              <span>Catatan Pembicara (Notes)</span>
            </span>
            <textarea
              rows={4}
              value={activeSlide.notes || ''}
              onChange={e => onUpdateSlide(activeSlide.id, { notes: e.target.value })}
              placeholder="Catatan teks yang akan muncul pada Mode Presentasi / Slideshow..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-indigo-500 text-xs leading-relaxed"
            />
          </div>
        </div>
      </aside>
    );
  }

  // 2. IF AN ELEMENT IS SELECTED: SHOW ELEMENT PROPERTIES
  const handleChange = (field: keyof DesignElement, val: any) => {
    onUpdateElement(element.id, { [field]: val });
  };

  const handleEyeDropper = async (field: 'fill' | 'color' | 'stroke') => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const res = await eyeDropper.open();
        if (res?.sRGBHex) {
          handleChange(field, res.sRGBHex);
        }
      } catch (err) {
        // User cancelled sampling
      }
    } else {
      alert('Fitur Pipet Eyedropper didukung di browser modern (Chrome, Edge, Opera, Brave).');
    }
  };

  const handleAutoContrast = () => {
    const bg = element.fill || activeSlide.background || '#0f172a';
    let hex = bg.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 15;
    const g = parseInt(hex.substring(2, 4), 16) || 23;
    const b = parseInt(hex.substring(4, 6), 16) || 42;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    const contrastColor = yiq >= 128 ? '#0f172a' : '#ffffff';
    handleChange('color', contrastColor);
  };

  const filteredIcons = popularIconNames.filter(name =>
    name.toLowerCase().includes(iconFilter.toLowerCase())
  );

  return (
    <aside className="w-72 h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 select-none z-10">
      {/* Header with Title and Quick Action Buttons */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2 truncate">
          <span className="text-xs font-bold text-slate-200 truncate capitalize">
            {element.name || element.type}
          </span>
          {selectedCount > 1 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              +{selectedCount - 1} lainnya
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Lock / Unlock */}
          {onToggleLock && (
            <button
              onClick={() => onToggleLock(element.id)}
              title={element.locked ? 'Buka Kunci' : 'Kunci Elemen'}
              className={`p-1.5 rounded-lg transition-colors ${element.locked ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-slate-800 text-slate-400'
                }`}
            >
              {element.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Hide / Show */}
          {onToggleHide && (
            <button
              onClick={() => onToggleHide(element.id)}
              title={element.hidden ? 'Tampilkan' : 'Sembunyikan'}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              {element.hidden ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          )}

          <button
            onClick={onDuplicate}
            title="Duplikat Elemen (Ctrl+D)"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="Hapus Elemen (Delete)"
            className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-300">
        {/* Bilah Perataan Cepat (Smart Alignment Tools) */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Perataan ke Kanvas (Align)
          </span>
          <div className="grid grid-cols-6 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onAlignElement('left')}
              title="Rata Kiri"
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded flex justify-center"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onAlignElement('center')}
              title="Rata Tengah Horizontal"
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded flex justify-center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onAlignElement('right')}
              title="Rata Kanan"
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded flex justify-center"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onAlignElement('top')}
              title="Rata Atas"
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded flex justify-center"
            >
              <AlignStartVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onAlignElement('middle')}
              title="Rata Tengah Vertikal"
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded flex justify-center"
            >
              <AlignCenterVertical className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onAlignElement('bottom')}
              title="Rata Bawah"
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded flex justify-center"
            >
              <AlignEndVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Distribusi Jarak (Smart Spacing) saat 3+ elemen terpilih */}
        {selectedCount >= 3 && onDistributeElements && (
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Distribusi Spasi Merata
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onDistributeElements('horizontal')}
                className="p-2 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-lg flex items-center justify-center gap-1.5 text-slate-300 hover:text-white"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rata Horizontal</span>
              </button>
              <button
                onClick={() => onDistributeElements('vertical')}
                className="p-2 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-lg flex items-center justify-center gap-1.5 text-slate-300 hover:text-white"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rata Vertikal</span>
              </button>
            </div>
          </div>
        )}

        {/* Posisi, Dimensi & Rotasi */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Ukuran, Posisi & Rotasi
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">X (Posisi)</label>
              <input
                type="number"
                value={element.x}
                onChange={e => handleChange('x', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Y (Posisi)</label>
              <input
                type="number"
                value={element.y}
                onChange={e => handleChange('y', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Lebar (W)</label>
              <input
                type="number"
                value={element.width}
                onChange={e => handleChange('width', Math.max(10, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Tinggi (H)</label>
              <input
                type="number"
                value={element.height}
                onChange={e => handleChange('height', Math.max(10, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
          </div>

          {/* Kontrol Rotasi Derajat */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-slate-500 flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-indigo-400" />
                <span>Rotasi Putar (Derajat)</span>
              </label>
              <span className="font-mono text-indigo-400 text-[11px]">
                {element.rotation || 0}°
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={element.rotation || 0}
                onChange={e => handleChange('rotation', Number(e.target.value))}
                className="flex-1 accent-indigo-500 cursor-pointer"
              />
              <div className="flex gap-1">
                {[0, 90, 180, 270].map(deg => (
                  <button
                    key={deg}
                    onClick={() => handleChange('rotation', deg)}
                    className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[9px] text-slate-400 hover:text-white"
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Flip Cermin Horisontal & Vertikal */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Cermin (Flip)</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleChange('flipX', !element.flipX)}
                title="Cermin Horisontal"
                className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 font-medium transition-colors ${element.flipX
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Horisontal</span>
              </button>
              <button
                onClick={() => handleChange('flipY', !element.flipY)}
                title="Cermin Vertikal"
                className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 font-medium transition-colors ${element.flipY
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Vertikal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pengaturan Elemen Chart */}
        {element.type === 'chart' && (
          <div className="space-y-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Pengaturan Grafik / Chart
            </span>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              {(['bar', 'line', 'donut'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => handleChange('chartType', mode)}
                  className={`py-1 text-xs font-semibold rounded capitalize transition-colors ${(element.chartType || 'bar') === mode
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {mode === 'bar' ? 'Batang' : mode === 'line' ? 'Garis' : 'Donat'}
                </button>
              ))}
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Sub-Judul / Label</label>
              <input
                type="text"
                value={element.subTitle || ''}
                onChange={e => handleChange('subTitle', e.target.value)}
                placeholder="Contoh: Metrik Pertumbuhan Q1-Q4"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-xs"
              />
            </div>

            {/* Chart Data Editor */}
            <div className="space-y-2 pt-2 border-t border-slate-900">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Titik Data ({element.chartData?.length || 4})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleChange('chartData', [
                        { label: 'Q1', value: 35 },
                        { label: 'Q2', value: 65 },
                        { label: 'Q3', value: 45 },
                        { label: 'Q4', value: 90 },
                      ]);
                    }}
                    className="text-[9px] text-indigo-400 hover:underline"
                    title="Reset ke Q1-Q4"
                  >
                    Preset Q1-Q4
                  </button>
                  <button
                    onClick={() => {
                      handleChange('chartData', [
                        { label: 'Jan', value: 24 },
                        { label: 'Feb', value: 38 },
                        { label: 'Mar', value: 52 },
                        { label: 'Apr', value: 61 },
                        { label: 'Mei', value: 78 },
                        { label: 'Jun', value: 95 },
                      ]);
                    }}
                    className="text-[9px] text-indigo-400 hover:underline"
                    title="Preset Semester"
                  >
                    Preset 6 Bulan
                  </button>
                </div>
              </div>

              {/* Data Items List */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {(element.chartData || [
                  { label: 'Q1', value: 35 },
                  { label: 'Q2', value: 65 },
                  { label: 'Q3', value: 45 },
                  { label: 'Q4', value: 90 },
                ]).map((item, idx, arr) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                    <input
                      type="text"
                      value={item.label}
                      onChange={e => {
                        const nextData = [...arr];
                        nextData[idx] = { ...item, label: e.target.value };
                        handleChange('chartData', nextData);
                      }}
                      placeholder="Label"
                      className="w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-200 font-mono outline-none focus:border-indigo-500"
                    />
                    <input
                      type="number"
                      value={item.value}
                      onChange={e => {
                        const val = Number(e.target.value) || 0;
                        const nextData = [...arr];
                        nextData[idx] = { ...item, value: val };
                        handleChange('chartData', nextData);
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-indigo-300 font-mono text-right outline-none focus:border-indigo-500"
                    />
                    {arr.length > 1 && (
                      <button
                        onClick={() => {
                          const nextData = arr.filter((_, i) => i !== idx);
                          handleChange('chartData', nextData);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        title="Hapus baris"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const current = element.chartData || [
                    { label: 'Q1', value: 35 },
                    { label: 'Q2', value: 65 },
                    { label: 'Q3', value: 45 },
                    { label: 'Q4', value: 90 },
                  ];
                  handleChange('chartData', [
                    ...current,
                    { label: `Item ${current.length + 1}`, value: Math.round(Math.random() * 60 + 20) },
                  ]);
                }}
                className="w-full py-1.5 px-2 rounded-lg border border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-900/50 hover:bg-indigo-950/20 text-slate-400 hover:text-indigo-300 text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Titik Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Visual Icon Picker */}
        {['button', 'input', 'metric-card', 'navbar', 'icon', 'badge-shape'].includes(element.type) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-indigo-400" />
                <span>Pilihan Ikon</span>
              </span>
              {element.iconName && (
                <button
                  onClick={() => handleChange('iconName', undefined)}
                  className="text-[10px] text-rose-400 hover:underline"
                >
                  Hapus Ikon
                </button>
              )}
            </div>

            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-full p-2 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-lg flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                {element.iconName && (LucideIcons as any)[element.iconName] ? (
                  React.createElement((LucideIcons as any)[element.iconName], {
                    className: 'w-4 h-4 text-indigo-400',
                  })
                ) : (
                  <Smile className="w-4 h-4 text-slate-500" />
                )}
                <span className="font-medium text-slate-300">
                  {element.iconName || 'Pilih Ikon Lucide...'}
                </span>
              </div>
              <span className="text-[10px] text-indigo-400 font-semibold">
                {showIconPicker ? 'Tutup' : 'Ubah'}
              </span>
            </button>

            {/* Pop-up Grid */}
            {showIconPicker && (
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 animate-in fade-in-50 duration-100">
                <input
                  type="text"
                  placeholder="Cari ikon (misal: star, user)..."
                  value={iconFilter}
                  onChange={e => setIconFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 outline-none"
                />
                <div className="grid grid-cols-6 gap-1 max-h-36 overflow-y-auto pt-1">
                  {filteredIcons.map(name => {
                    const IconComp = (LucideIcons as any)[name];
                    if (!IconComp) return null;
                    const isPicked = element.iconName === name;

                    return (
                      <button
                        key={name}
                        onClick={() => {
                          handleChange('iconName', name);
                          setShowIconPicker(false);
                        }}
                        title={name}
                        className={`p-1.5 rounded flex items-center justify-center transition-colors ${isPicked
                          ? 'bg-indigo-600 text-white'
                          : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* URL Gambar (Jika tipe image) */}
        {element.type === 'image' && (
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Sumber Gambar
            </span>
            <input
              type="text"
              value={element.imageUrl || ''}
              onChange={e => handleChange('imageUrl', e.target.value)}
              placeholder="https://... atau data:image/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-indigo-500 text-xs font-mono truncate"
            />
          </div>
        )}

        {/* Konten Teks */}
        {(element.content !== undefined ||
          ['heading', 'text', 'button', 'card'].includes(element.type)) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Konten Teks
                </span>
                <span className="text-[10px] font-mono text-indigo-400 font-medium">
                  {(element.content || '').trim().split(/\s+/).filter(Boolean).length} kata • {(element.content || '').length} karakter
                </span>
              </div>
              <textarea
                rows={3}
                value={element.content || ''}
                onChange={e => handleChange('content', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-indigo-500 text-xs"
                placeholder="Ketik teks konten..."
              />
            </div>
          )}

        {/* Tipografi */}
        {(element.fontSize !== undefined ||
          ['heading', 'text', 'button', 'card'].includes(element.type)) && (
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
                        className={`py-1 rounded text-center text-[10px] font-mono border transition-all ${(element.fontSize || 16) === sz
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-500">Google & Web Font Family</label>
                    <span className="text-[9px] text-indigo-400 font-medium">Live CDN</span>
                  </div>
                  <select
                    value={element.fontFamily || 'sans'}
                    onChange={e => handleChange('fontFamily', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-xs font-medium cursor-pointer"
                  >
                    <optgroup label="Sistem Dasar">
                      <option value="sans">Sans (Inter / Default)</option>
                      <option value="serif">Serif (Klasik)</option>
                      <option value="mono">Monospace (Kode)</option>
                    </optgroup>
                    <optgroup label="Google Fonts — Sans Serif">
                      {POPULAR_FONTS.filter(f => f.category === 'Sans Serif').map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Google Fonts — Serif">
                      {POPULAR_FONTS.filter(f => f.category === 'Serif').map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Google Fonts — Monospace">
                      {POPULAR_FONTS.filter(f => f.category === 'Monospace').map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Google Fonts — Display & Headline">
                      {POPULAR_FONTS.filter(f => f.category === 'Display').map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
          )}

        {/* Warna & Gaya Visual */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Warna & Tampilan Visual
            </span>
            <button
              type="button"
              onClick={() => {
                onUpdateElement(element.id, {
                  fill: 'rgba(255, 255, 255, 0.08)',
                  stroke: 'rgba(255, 255, 255, 0.2)',
                  strokeWidth: 1.5,
                  borderRadius: 16,
                  shadow: 'xl',
                  color: '#ffffff',
                });
              }}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline"
              title="Terapkan gaya semi-transparan dengan border akrilik modern"
            >
              <Sparkles className="w-3 h-3" />
              <span>Efek Kaca (Glass)</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-slate-500">Warna Isi (Fill)</label>
                <button
                  type="button"
                  onClick={() => handleEyeDropper('fill')}
                  title="Ambil warna dari layar (Pipet Eyedropper)"
                  className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded"
                >
                  <Pipette className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                <input
                  type="color"
                  value={element.fill || '#1e293b'}
                  onChange={e => handleChange('fill', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[11px] font-mono text-slate-300">
                  {element.fill || '#1e293b'}
                </span>
              </div>
              {/* Quick Swatches for Fill */}
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {['#6366f1', '#38bdf8', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ffffff', '#1e293b'].map(sw => (
                  <button
                    key={sw}
                    type="button"
                    onClick={() => handleChange('fill', sw)}
                    title={`Pilih warna ${sw}`}
                    className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                      element.fill === sw ? 'scale-125 border-white ring-1 ring-white/50' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: sw }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-slate-500">Warna Teks</label>
                <button
                  type="button"
                  onClick={() => handleEyeDropper('color')}
                  title="Ambil warna dari layar (Pipet Eyedropper)"
                  className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded"
                >
                  <Pipette className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                <input
                  type="color"
                  value={element.color || '#ffffff'}
                  onChange={e => handleChange('color', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[11px] font-mono text-slate-300">
                  {element.color || '#ffffff'}
                </span>
              </div>
              {/* Quick Swatches for Text Color */}
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {['#ffffff', '#94a3b8', '#6366f1', '#38bdf8', '#34d399', '#f87171', '#fbbf24', '#0f172a'].map(sw => (
                  <button
                    key={sw}
                    type="button"
                    onClick={() => handleChange('color', sw)}
                    title={`Pilih warna teks ${sw}`}
                    className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                      element.color === sw ? 'scale-125 border-white ring-1 ring-white/50' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: sw }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Opasitas Slider */}
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

          {/* Sudut Lengkung (Border Radius) */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 block">Sudut Lengkung (Border Radius)</label>
            <div className="flex items-center gap-1">
              {[0, 6, 12, 20, 9999].map(r => (
                <button
                  key={r}
                  onClick={() => handleChange('borderRadius', r)}
                  className={`flex-1 py-1 rounded text-[10px] font-mono border transition-colors ${(element.borderRadius || 0) === r
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                  {r === 9999 ? 'Pill' : `${r}px`}
                </button>
              ))}
            </div>
          </div>

          {/* Efek Bayangan (Shadow) */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 block">Efek Bayangan (Shadow)</label>
            <div className="grid grid-cols-4 gap-1">
              <div className="grid grid-cols-6 gap-1">
                {['none', 'sm', 'md', 'lg', 'xl', '2xl'].map(s => (
                  <button
                    key={s}
                    onClick={() => handleChange('shadow', s)}
                    className={`py-1 rounded text-[10px] uppercase font-semibold border transition-colors ${(element.shadow || 'none') === s
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Neon Glow Presets */}
              <div className="pt-2 space-y-1">
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Efek Pendaran Neon (Glow)
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'glow-indigo', name: 'Indigo', color: 'bg-indigo-500', border: 'border-indigo-500/60' },
                    { id: 'glow-cyan', name: 'Cyan', color: 'bg-cyan-400', border: 'border-cyan-500/60' },
                    { id: 'glow-emerald', name: 'Emerald', color: 'bg-emerald-400', border: 'border-emerald-500/60' },
                    { id: 'glow-rose', name: 'Rose', color: 'bg-rose-500', border: 'border-rose-500/60' },
                  ].map(glow => {
                    const isSelected = element.shadow === glow.id;
                    return (
                      <button
                        key={glow.id}
                        onClick={() => handleChange('shadow', isSelected ? 'none' : glow.id)}
                        className={`flex items-center justify-center gap-1.5 py-1 px-1.5 rounded-lg border text-[10px] font-medium transition-all ${isSelected
                          ? `${glow.border} bg-slate-800 text-white shadow-sm ring-1 ring-white/20`
                          : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${glow.color} shadow-sm shrink-0`} />
                        <span className="truncate">{glow.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Susunan Layer */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Urutan Layer (Z-Index)
            </span>
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => onReorder('front')}
                title="Paling Depan"
                className="p-2 bg-slate-800/80 hover:bg-slate-800 rounded-lg flex justify-center text-slate-300 transition-colors"
              >
                <BringToFront className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReorder('up')}
                title="Maju Satu Tingkat"
                className="p-2 bg-slate-800/80 hover:bg-slate-800 rounded-lg flex justify-center text-slate-300 transition-colors"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReorder('down')}
                title="Mundur Satu Tingkat"
                className="p-2 bg-slate-800/80 hover:bg-slate-800 rounded-lg flex justify-center text-slate-300 transition-colors"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReorder('back')}
                title="Paling Belakang"
                className="p-2 bg-slate-800/80 hover:bg-slate-800 rounded-lg flex justify-center text-slate-300 transition-colors"
              >
                <SendToBack className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
