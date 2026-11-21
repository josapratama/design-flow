import React, { useState } from 'react';
import { DesignElement, PRESET_SIZES, Slide } from '../types';
import {
  Trash2,
  Copy,
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
  X,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface PropertyInspectorProps {
  element: DesignElement | null;
  activeSlide: Slide;
  onUpdateElement: (elementId: string, updates: Partial<DesignElement>) => void;
  onUpdateSlide: (slideId: string, updates: Partial<Slide>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onReorder: (direction: 'front' | 'back' | 'up' | 'down') => void;
  onAlignElement: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  element,
  activeSlide,
  onUpdateElement,
  onUpdateSlide,
  onDelete,
  onDuplicate,
  onReorder,
  onAlignElement,
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

  const filteredIcons = popularIconNames.filter(name =>
    name.toLowerCase().includes(iconFilter.toLowerCase())
  );

  return (
    <aside className="w-72 h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 select-none z-10">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <span className="text-xs font-bold text-slate-200 truncate capitalize">
          {element.name || element.type}
        </span>
        <div className="flex items-center gap-1">
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

        {/* Posisi & Dimensi */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Ukuran & Posisi
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
        </div>

        {/* Visual Icon Picker */}
        {['button', 'input', 'metric-card', 'navbar'].includes(element.type) && (
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
                        className={`p-1.5 rounded flex items-center justify-center transition-colors ${
                          isPicked
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
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Konten Teks
            </span>
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
          ['heading', 'text', 'button'].includes(element.type)) && (
          <div className="space-y-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Tipografi
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Ukuran Font</label>
                <input
                  type="number"
                  value={element.fontSize || 16}
                  onChange={e => handleChange('fontSize', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Ketebalan</label>
                <select
                  value={element.fontWeight || 'normal'}
                  onChange={e => handleChange('fontWeight', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-xs"
                >
                  <option value="normal">Reguler (400)</option>
                  <option value="medium">Medium (500)</option>
                  <option value="semibold">Semibold (600)</option>
                  <option value="bold">Tebal (700)</option>
                  <option value="extrabold">Ekstra Tebal (800)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Warna & Gaya Visual */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Warna & Tampilan
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Warna Isi (Fill)</label>
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
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Warna Teks</label>
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Sudut (Radius)</label>
              <input
                type="number"
                value={element.borderRadius || 0}
                onChange={e => handleChange('borderRadius', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Transparansi (Opacity)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={element.opacity !== undefined ? element.opacity : 1}
                onChange={e => handleChange('opacity', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
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
    </aside>
  );
};
