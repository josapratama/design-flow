import React, { useState, useEffect, useMemo } from 'react';
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
  SunMoon,
  ArrowLeftRight,
  ArrowUpDown,
  Pipette,
  Image as ImageIcon,
  Sparkles,
  Upload,
  Boxes,
  Paintbrush,
  Check,
  Code,
  CopyCheck,
  Bold,
  Italic,
  Underline,
  Strikethrough,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import confetti from 'canvas-confetti';
import { POPULAR_FONTS, getFontFamilyStyle } from '../utils/fontLoader';
import { evaluateContrast } from '../utils/colorContrast';
import { extractPaletteFromImage, ExtractedPalette } from '../utils/paletteExtractor';
import { renderElementJSX } from '../engine/tailwind-exporter';
import {
  copyElementStyle,
  pasteElementStyle,
  hasCopiedStyle,
  subscribeStyleClipboard,
} from '../utils/styleClipboard';
import { generateColorHarmonies } from '../utils/colorHarmonies';

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
  onBatchUpdateElements?: (updater: (el: DesignElement) => Partial<DesignElement>) => void;
  onApplySlideTheme?: (theme: { background: string; primaryAccent: string; cardFill: string; textColor: string }) => void;
  onInvertSlideTheme?: () => void;
  onToggleLock?: (elementId: string) => void;
  onToggleHide?: (elementId: string) => void;
  onGroup?: () => void;
  onUngroup?: () => void;
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
  onBatchUpdateElements,
  onApplySlideTheme,
  onInvertSlideTheme,
  onToggleLock,
  onToggleHide,
  onGroup,
  onUngroup,
}) => {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconFilter, setIconFilter] = useState('');
  const [fontFilterCategory, setFontFilterCategory] = useState<'all' | 'Sans Serif' | 'Serif' | 'Monospace' | 'Display'>('all');
  const [extractedPalette, setExtractedPalette] = useState<ExtractedPalette | null>(null);
  const [isExtractingPalette, setIsExtractingPalette] = useState(false);
  const [isRatioLocked, setIsRatioLocked] = useState(false);

  // Auto-extracted document colors used across active slide
  const documentColors = React.useMemo(() => {
    const set = new Set<string>();
    if (activeSlide.background && activeSlide.background.startsWith('#')) {
      set.add(activeSlide.background.toLowerCase());
    }
    activeSlide.elements.forEach(el => {
      if (el.fill && el.fill.startsWith('#')) set.add(el.fill.toLowerCase());
      if (el.color && el.color.startsWith('#')) set.add(el.color.toLowerCase());
      if (el.stroke && el.stroke.startsWith('#')) set.add(el.stroke.toLowerCase());
    });
    return Array.from(set).slice(0, 10);
  }, [activeSlide]);

  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('designflow_recent_colors');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const recordRecentColor = (color: string) => {
    if (!color || !color.startsWith('#')) return;
    setRecentColors(prev => {
      const next = [color.toLowerCase(), ...prev.filter(c => c.toLowerCase() !== color.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem('designflow_recent_colors', JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  const popularIconNames = [
    // Common & Core UI
    'Star', 'Heart', 'Shield', 'ShieldCheck', 'Check', 'CheckCircle', 'CheckCircle2', 'User', 'Users', 'UserCheck', 'Search', 'Settings', 'Home',
    'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ChevronRight', 'ChevronLeft', 'ChevronUp', 'ChevronDown', 'Zap', 'Download', 'Upload',
    'Compass', 'Laptop', 'Monitor', 'Smartphone', 'Tablet', 'Mail', 'Phone', 'PhoneCall', 'MessageSquare', 'MessageCircle', 'Send', 'Share2',
    'Calendar', 'Clock', 'Lock', 'Unlock', 'Sparkles', 'Folder', 'FolderOpen', 'FileText', 'File', 'BarChart', 'BarChart2', 'BarChart3', 'PieChart', 'LineChart',
    'CreditCard', 'Wallet', 'DollarSign', 'Camera', 'Video', 'Bell', 'Tag', 'Bookmark', 'Globe', 'HelpCircle', 'Info', 'AlertCircle', 'AlertTriangle',
    // Media & Creative
    'Image', 'Music', 'Headphones', 'Volume2', 'VolumeX', 'Play', 'Pause', 'Film', 'Radio', 'Tv', 'Sliders', 'SlidersHorizontal', 'Eye', 'EyeOff',
    'Smile', 'Frown', 'Award', 'Gift', 'Flame', 'Sun', 'Moon', 'Cloud', 'CloudRain', 'Wind', 'Coffee', 'Utensils',
    // Technology & Coding
    'Code', 'Terminal', 'Cpu', 'Database', 'Server', 'HardDrive', 'Wifi', 'Bluetooth', 'Key', 'Layers', 'Boxes', 'Box', 'Activity', 'TrendingUp', 'TrendingDown',
    // Business & Productivity
    'Briefcase', 'Building', 'ShoppingBag', 'ShoppingCart', 'Receipt', 'Target', 'Flag', 'MapPin', 'Map', 'Navigation', 'Rocket', 'Plane', 'Car',
    'Paperclip', 'Archive', 'Printer', 'Trash2', 'Copy', 'Edit', 'Edit2', 'Pen', 'Crop', 'Maximize2', 'Minimize2', 'Plus', 'Minus', 'X', 'RefreshCw'
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
      { name: 'Midnight Aurora', bg: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #064e3b 100%)' },
      { name: 'Cosmic Violet', bg: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #831843 100%)' },
      { name: 'Sunset Glow', bg: 'linear-gradient(135deg, #1e1b4b 0%, #be123c 50%, #ea580c 100%)' },
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
            <div className="flex items-center flex-wrap gap-2 pt-1">
              {bgSwatches.map(swatch => (
                <button
                  key={swatch.color}
                  onClick={() => onUpdateSlide(activeSlide.id, { background: swatch.color })}
                  title={swatch.name}
                  className={`h-7 w-7 rounded-full border border-white/10 hover:scale-110 transition-transform shadow-md relative ${activeSlide.background === swatch.color ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900 scale-105' : ''
                    }`}
                  style={{ backgroundColor: swatch.color }}
                />
              ))}
            </div>

            {/* Modern Linear Gradients */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Gradasi Modern</span>
              <div className="grid grid-cols-3 gap-1.5">
                {gradientSwatches.map(grad => (
                  <button
                    key={grad.name}
                    onClick={() => onUpdateSlide(activeSlide.id, { background: grad.bg })}
                    title={grad.name}
                    className={`h-8 rounded-lg border border-slate-700/80 hover:border-indigo-500/80 hover:scale-[1.02] transition-all text-[9px] font-semibold text-white/95 flex items-center justify-center shadow-sm truncate px-1 ${activeSlide.background === grad.bg ? 'ring-2 ring-indigo-500 border-indigo-400' : ''
                      }`}
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
              {onInvertSlideTheme && (
                <button
                  onClick={onInvertSlideTheme}
                  title="Balik warna latar belakang dan teks secara otomatis (Gelap ⇄ Terang)"
                  className="w-full mt-2 py-1.5 px-3 rounded-lg border border-slate-700 hover:border-indigo-500/60 bg-slate-900/60 hover:bg-indigo-950/20 text-slate-300 hover:text-white text-xs flex items-center justify-center gap-2 transition-colors active:scale-98"
                >
                  <SunMoon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Invert Tema Slide (Gelap ⇄ Terang)</span>
                </button>
              )}
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
                    className={`group relative h-12 rounded-lg overflow-hidden border transition-all text-left ${activeSlide.wallpaper === wp.url
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

              {/* Wallpaper Dimmer / Dark Overlay Tint */}
              {activeSlide.wallpaper && (
                <div className="space-y-1.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800 mt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <SunMoon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Dimmer Gelap Foto</span>
                    </span>
                    <span className="font-mono text-indigo-400 font-bold">
                      {Math.round((activeSlide.wallpaperOverlay ?? 0) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.9}
                    step={0.05}
                    value={activeSlide.wallpaperOverlay ?? 0}
                    onChange={e => onUpdateSlide(activeSlide.id, { wallpaperOverlay: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center justify-between gap-1 pt-0.5">
                    {[
                      { label: '0%', val: 0, title: 'Original Jernih' },
                      { label: '30%', val: 0.3, title: 'Dim Sedang' },
                      { label: '50%', val: 0.5, title: 'Kontras Teks Bagus' },
                      { label: '75%', val: 0.75, title: 'Gelap Fokus Teks' },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => onUpdateSlide(activeSlide.id, { wallpaperOverlay: preset.val })}
                        title={preset.title}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${(activeSlide.wallpaperOverlay ?? 0) === preset.val
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Smart Palette Extractor from Wallpaper Photo */}
              {activeSlide.wallpaper && (
                <div className="space-y-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Ekstraksi Warna Foto</span>
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsExtractingPalette(true);
                        try {
                          const pal = await extractPaletteFromImage(activeSlide.wallpaper!);
                          setExtractedPalette(pal);
                        } finally {
                          setIsExtractingPalette(false);
                        }
                      }}
                      disabled={isExtractingPalette}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-[10px] font-semibold transition-colors flex items-center gap-1 shadow-sm active:scale-95"
                    >
                      <Palette className="w-3 h-3" />
                      <span>{isExtractingPalette ? 'Menganalisis...' : 'Ekstrak Palet'}</span>
                    </button>
                  </div>

                  {extractedPalette && (
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <span className="text-[9px] text-slate-400 block font-medium">
                        Warna dominan foto (klik swatch untuk terapkan ke warna latar slide):
                      </span>
                      <div className="flex items-center gap-1.5">
                        {extractedPalette.swatches.map((color, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              onUpdateSlide(activeSlide.id, { background: color });
                            }}
                            title={`Warna: ${color} (Klik untuk terapkan ke warna latar)`}
                            className="w-7 h-7 rounded-lg border border-slate-700 cursor-pointer shadow-sm hover:scale-110 hover:ring-2 hover:ring-indigo-400 transition-all shrink-0"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      {onApplySlideTheme && (
                        <button
                          type="button"
                          onClick={() => {
                            onApplySlideTheme({
                              background: extractedPalette.dominantDark,
                              primaryAccent: extractedPalette.primaryAccent,
                              cardFill: extractedPalette.swatches[1] || '#1e293b',
                              textColor: extractedPalette.lightTone,
                            });
                          }}
                          className="w-full py-1.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-indigo-300 hover:text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>Terapkan Palet Foto ke Elemen Slide</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Wallpaper Dimmer / Dark Overlay Tint */}
              {activeSlide.wallpaper && (
                <div className="space-y-1.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800 mt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <SunMoon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Dimmer Gelap Foto</span>
                    </span>
                    <span className="font-mono text-indigo-400 font-bold">
                      {Math.round((activeSlide.wallpaperOverlay ?? 0) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={0.9}
                    step={0.05}
                    value={activeSlide.wallpaperOverlay ?? 0}
                    onChange={e => onUpdateSlide(activeSlide.id, { wallpaperOverlay: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center justify-between gap-1 pt-0.5">
                    {[
                      { label: '0%', val: 0, title: 'Original Jernih' },
                      { label: '30%', val: 0.3, title: 'Dim Sedang' },
                      { label: '50%', val: 0.5, title: 'Kontras Teks Bagus' },
                      { label: '75%', val: 0.75, title: 'Gelap Fokus Teks' },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => onUpdateSlide(activeSlide.id, { wallpaperOverlay: preset.val })}
                        title={preset.title}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${(activeSlide.wallpaperOverlay ?? 0) === preset.val
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Catatan Pembicara (Speaker Notes) with Pacing Estimator */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            {(() => {
              const notesText = (activeSlide.notes || '').trim();
              const words = notesText ? notesText.split(/\s+/).filter(Boolean).length : 0;
              const totalSec = Math.ceil((words / 130) * 60);
              const durationStr = totalSec < 60 ? `${totalSec}d` : `${Math.floor(totalSec / 60)}m ${totalSec % 60}d`;

              return (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1.5">
                    <StickyNote className="w-3.5 h-3.5 text-amber-400" />
                    <span>Catatan Pembicara</span>
                  </span>
                  {words > 0 && (
                    <span
                      title="Estimasi durasi bicara (~130 kata/menit)"
                      className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20"
                    >
                      {words} kata • ~{durationStr}
                    </span>
                  )}
                </div>
              );
            })()}
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
    if ((field === 'fill' || field === 'color' || field === 'stroke') && typeof val === 'string' && val.startsWith('#')) {
      recordRecentColor(val);
    }
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

  const [copiedStyleActive, setCopiedStyleActive] = useState<boolean>(() => hasCopiedStyle());
  const [inspectorToast, setInspectorToast] = useState<string | null>(null);

  useEffect(() => {
    return subscribeStyleClipboard(() => {
      setCopiedStyleActive(hasCopiedStyle());
    });
  }, []);

  const showToast = (msg: string) => {
    setInspectorToast(msg);
    setTimeout(() => setInspectorToast(null), 2000);
  };

  const handleCopyStyle = () => {
    if (!element) return;
    copyElementStyle(element);
    showToast('Gaya Disalin! (Pilih elemen lain untuk Tempel)');
  };

  const handlePasteStyle = () => {
    if (!element) return;
    const applied = pasteElementStyle(element.id, onUpdateElement);
    if (applied) {
      showToast('Gaya Diterapkan!');
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
    }
  };

  const activeColorForHarmonies = useMemo(() => {
    if (element?.fill && element.fill.startsWith('#') && element.fill !== 'transparent') {
      return element.fill;
    }
    if (element?.color && element.color.startsWith('#')) {
      return element.color;
    }
    return '#6366f1';
  }, [element?.fill, element?.color]);

  const colorHarmonies = useMemo(() => {
    return generateColorHarmonies(activeColorForHarmonies);
  }, [activeColorForHarmonies]);

  const handleCopyJSX = () => {
    if (!element) return;
    try {
      const snippet = renderElementJSX(element);
      navigator.clipboard.writeText(snippet);
      showToast('Kode JSX Disalin!');
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } catch {
      showToast('Gagal menyalin JSX.');
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopyStyle();
      } else if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePasteStyle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [element]);

  return (
    <aside className="w-72 h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 select-none z-10 relative">
      {/* Toast Feedback */}
      {inspectorToast && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 bg-slate-950 border border-indigo-500/60 text-white rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100 whitespace-nowrap">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-medium">{inspectorToast}</span>
        </div>
      )}
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

          {/* Group Multiple Elements */}
          {selectedCount > 1 && onGroup && (
            <button
              onClick={onGroup}
              title="Kelompokkan Elemen Terpilih (Ctrl+G)"
              className="p-1.5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 rounded-lg transition-colors"
            >
              <Boxes className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Ungroup If Grouped */}
          {element.groupId && onUngroup && (
            <button
              onClick={onUngroup}
              title="Pisahkan Elemen dari Grup (Ctrl+Shift+G)"
              className="p-1.5 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 rounded-lg transition-colors"
            >
              <Boxes className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Format Painter: Salin Gaya */}
          <button
            onClick={handleCopyStyle}
            title="Salin Gaya Visual Elemen (Ctrl+Alt+C)"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors"
          >
            <Paintbrush className="w-3.5 h-3.5" />
          </button>

          {/* Format Painter: Tempel Gaya */}
          {copiedStyleActive && (
            <button
              onClick={handlePasteStyle}
              title="Tempelkan Gaya Visual yang Disalin (Ctrl+Alt+V)"
              className="p-1.5 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 rounded-lg transition-colors animate-pulse"
            >
              <CopyCheck className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Salin Kode JSX */}
          <button
            onClick={handleCopyJSX}
            title="Salin Kode Komponen React 19 + Tailwind JSX"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

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

        {/* Transformasi Teks Massal saat 2+ elemen terpilih */}
        {selectedCount > 1 && onBatchUpdateElements && (
          <div className="space-y-2 p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Format Teks Massal</span>
              </span>
              <span className="text-[9px] font-mono text-indigo-400">
                {selectedCount} item
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Ubah kapitalisasi semua teks yang terpilih sekaligus:
            </p>
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  onBatchUpdateElements(el => {
                    if (el.content) return { content: el.content.toUpperCase() };
                    return {};
                  });
                }}
                className="py-1 px-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-slate-200 rounded text-[10px] font-mono font-bold text-center transition-colors"
                title="Ubah semua elemen teks terpilih ke UPPERCASE"
              >
                UPPERCASE
              </button>
              <button
                type="button"
                onClick={() => {
                  onBatchUpdateElements(el => {
                    if (el.content) return { content: el.content.toLowerCase() };
                    return {};
                  });
                }}
                className="py-1 px-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-slate-200 rounded text-[10px] font-mono lowercase text-center transition-colors"
                title="Ubah semua elemen teks terpilih ke lowercase"
              >
                lowercase
              </button>
              <button
                type="button"
                onClick={() => {
                  onBatchUpdateElements(el => {
                    if (el.content) {
                      return {
                        content: el.content.replace(/\b\w+/g, t => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase()),
                      };
                    }
                    return {};
                  });
                }}
                className="py-1 px-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-slate-200 rounded text-[10px] font-mono text-center transition-colors"
                title="Ubah semua elemen teks terpilih ke Title Case"
              >
                Title Case
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
            <div className="col-span-2 grid grid-cols-5 gap-1.5 items-end">
              <div className="col-span-2">
                <label className="text-[10px] text-slate-500 block mb-1">Lebar (W)</label>
                <input
                  type="number"
                  value={element.width}
                  onChange={e => {
                    const newW = Math.max(10, Number(e.target.value));
                    if (isRatioLocked && element.height > 0) {
                      const ratio = element.width / element.height;
                      onUpdateElement(element.id, { width: newW, height: Math.max(10, Math.round(newW / ratio)) });
                    } else {
                      handleChange('width', newW);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div className="col-span-1 flex justify-center pb-1">
                <button
                  type="button"
                  onClick={() => setIsRatioLocked(!isRatioLocked)}
                  title={isRatioLocked ? 'Kunci Rasio Aktif (Klik untuk Buka)' : 'Kunci Rasio Aspek W:H'}
                  className={`p-1.5 rounded-lg border transition-colors ${isRatioLocked
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                >
                  {isRatioLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="col-span-2">
                <label className="text-[10px] text-slate-500 block mb-1">Tinggi (H)</label>
                <input
                  type="number"
                  value={element.height}
                  onChange={e => {
                    const newH = Math.max(10, Number(e.target.value));
                    if (isRatioLocked && element.width > 0) {
                      const ratio = element.width / element.height;
                      onUpdateElement(element.id, { height: newH, width: Math.max(10, Math.round(newH * ratio)) });
                    } else {
                      handleChange('height', newH);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
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

        {/* Table Content Editor */}
        {element.type === 'table' && (
          <div className="space-y-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Editor Isi Tabel Data
              </span>
              {(() => {
                const parsedRows = (element.content || '')
                  .split('\n')
                  .filter(r => r.trim().length > 0);
                const rowCount = parsedRows.length;
                const colCount = parsedRows[0] ? parsedRows[0].split('|').length : 0;
                return (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                    {colCount} Kolom × {rowCount} Baris
                  </span>
                );
              })()}
            </div>
            <div className="text-[11px] text-slate-400">
              Gunakan pemisah pipa (<kbd className="text-indigo-300">|</kbd>) untuk memisahkan kolom dan baris baru untuk tiap record.
            </div>
            <textarea
              value={element.content || ''}
              onChange={e => handleChange('content', e.target.value)}
              placeholder="Kolom 1 | Kolom 2 | Kolom 3&#10;Data A | Data B | Data C"
              rows={5}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500 leading-relaxed resize-y"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() =>
                  handleChange(
                    'content',
                    'Fitur | Basic | Pro Studio | Enterprise\nEkspor PPTX | - | Ya | Ya\nWeb Fonts Bebas | - | Ya | Ya\nSmart Snapping | Ya | Ya | Ya\nCustom Branding | - | - | Ya'
                  )
                }
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-indigo-300 rounded border border-slate-800 transition-colors"
              >
                Template: Harga
              </button>
              <button
                onClick={() =>
                  handleChange(
                    'content',
                    'Indikator | Target | Realisasi | Status\nAkurasi Model | 95.0% | 99.4% | Tercapai\nLatensi Edge | < 20ms | 11.8ms | Optimal\nThroughput | 2.0x | 3.4x | Melampaui'
                  )
                }
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-emerald-300 rounded border border-slate-800 transition-colors"
              >
                Template: Evaluasi KPI
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
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold">Koleksi Ikon Lucide</span>
                  <span className="font-mono text-indigo-400 font-bold">{filteredIcons.length} ikon</span>
                </div>
                <input
                  type="text"
                  placeholder="Cari 100+ ikon (wifi, cloud, heart, star)..."
                  value={iconFilter}
                  onChange={e => setIconFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
                <div className="grid grid-cols-6 gap-1 max-h-44 overflow-y-auto pt-1">
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
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Sumber Gambar
              </span>
              <label className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer flex items-center gap-1 hover:underline">
                <Upload className="w-3 h-3" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => {
                      if (ev.target?.result) {
                        handleChange('imageUrl', ev.target.result as string);
                        showToast('Gambar berhasil dimuat!');
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
            <input
              type="text"
              value={element.imageUrl || ''}
              onChange={e => handleChange('imageUrl', e.target.value)}
              placeholder="https://... atau data:image/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none focus:border-indigo-500 text-xs font-mono truncate"
            />
            {/* Quick Unsplash category presets */}
            <div className="space-y-1 pt-1">
              <span className="text-[9px] text-slate-500 block">Preset Gambar Tema Cepat:</span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: 'Teknologi', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80' },
                  { label: 'Kantor', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80' },
                  { label: 'Alam', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80' },
                  { label: 'Abstrak', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80' },
                ].map(cat => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => handleChange('imageUrl', cat.url)}
                    className="py-1 px-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded text-[9px] text-slate-300 hover:text-white transition-colors"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Konten Teks */}
        {(element.content !== undefined ||
          ['heading', 'text', 'quote', 'button', 'card'].includes(element.type)) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {element.type === 'quote' ? 'Isi Kutipan / Petikan' : 'Konten Teks'}
                </span>
                <div className="flex items-center gap-1.5">
                  {/* Case Transformer */}
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5" title="Ubah Format Huruf (Kapitalisasi)">
                    <button
                      type="button"
                      onClick={() => handleChange('content', (element.content || '').toUpperCase())}
                      title="Ubah ke UPPERCASE (SEMUA BESAR)"
                      className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      TT
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('content', (element.content || '').toLowerCase())}
                      title="Ubah ke lowercase (semua kecil)"
                      className="px-1.5 py-0.5 text-[9px] font-mono lowercase text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      tt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('content', (element.content || '').replace(/\b\w+/g, t => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase()))}
                      title="Ubah ke Title Case (Kapital Setiap Kata)"
                      className="px-1.5 py-0.5 text-[9px] font-mono text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      Tt
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 font-medium">
                    {(element.content || '').trim().split(/\s+/).filter(Boolean).length} kata • {(element.content || '').length} kar
                  </span>
                </div>
              </div>
              <textarea
                rows={3}
                value={element.content || ''}
                onChange={e => handleChange('content', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-indigo-500 text-xs"
                placeholder={element.type === 'quote' ? 'Ketik kalimat kutipan di sini...' : 'Ketik teks konten...'}
              />
            </div>
          )}

        {/* Pengaturan Khusus Quote: Tokoh / Sumber Kutipan */}
        {element.type === 'quote' && (
          <div className="space-y-1.5 p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Tokoh / Sumber Kutipan (Author)
            </label>
            <input
              type="text"
              value={element.subTitle || ''}
              onChange={e => handleChange('subTitle', e.target.value)}
              placeholder="Contoh: Albert Einstein, Fisikawan Teoritis"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-xs"
            />
          </div>
        )}

        {/* Tipografi */}
        {(element.fontSize !== undefined ||
          ['heading', 'text', 'quote', 'button', 'card'].includes(element.type)) && (
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
                <div className="col-span-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-slate-500">Google & Web Font Family</label>
                    <span className="text-[9px] text-indigo-400 font-medium">Live CDN</span>
                  </div>

                  {/* Font Category Filter Pills */}
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
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${fontFilterCategory === cat.id
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

                  {/* Live Font Visual Preview Badge */}
                  <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">Pratinjau Tipografi</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono">
                        {POPULAR_FONTS.find(f => f.id === element.fontFamily || f.name.toLowerCase() === element.fontFamily?.toLowerCase())?.name || (element.fontFamily === 'serif' ? 'Serif (Klasik)' : element.fontFamily === 'mono' ? 'Monospace (Kode)' : 'Inter (Sans)')}
                      </span>
                    </div>
                    <div
                      className="text-xs text-slate-200 py-1 px-2 bg-slate-900/60 rounded border border-slate-800/60 overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{ fontFamily: getFontFamilyStyle(element.fontFamily) }}
                    >
                      Ag The quick brown fox jumps 123
                    </div>
                  </div>

                  {/* Text Alignment, Kerning & Line Height */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    {/* Perataan & Gaya Teks (Alignment, Bold, Italic, Underline, Strikethrough) */}
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-500">Gaya & Rata</label>
                      <div className="flex items-center gap-1.5">
                        {/* Text Styles (B, I, U, S) */}
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

                        {/* Alignment */}
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
                                className={`p-1.5 rounded transition-colors ${isActive
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

                    {/* Letter Spacing / Kerning */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Jarak Huruf (Kerning)</span>
                        <span className="font-mono text-indigo-400 font-semibold">
                          {element.letterSpacing !== undefined ? `${element.letterSpacing}px` : '0px'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="-2"
                          max="8"
                          step="0.5"
                          value={element.letterSpacing !== undefined ? element.letterSpacing : 0}
                          onChange={e => handleChange('letterSpacing', parseFloat(e.target.value))}
                          className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div className="grid grid-cols-5 gap-1 pt-0.5">
                        {[-1, 0, 1, 2, 4].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleChange('letterSpacing', val)}
                            className={`py-0.5 rounded text-center text-[9px] font-mono border transition-all ${(element.letterSpacing || 0) === val
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold'
                              : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-white'
                              }`}
                          >
                            {val > 0 ? `+${val}` : `${val}`}px
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Line Height / Spasi Antar Baris */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Tinggi Baris (Line Height)</span>
                        <span className="font-mono text-indigo-400 font-semibold">
                          {element.lineHeight !== undefined ? `${element.lineHeight}` : '1.35'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[1.1, 1.25, 1.5, 1.8].map(lh => (
                          <button
                            key={lh}
                            type="button"
                            onClick={() => handleChange('lineHeight', lh)}
                            className={`py-1 rounded text-center text-[10px] font-mono border transition-all ${(element.lineHeight || (element.type === 'heading' ? 1.2 : 1.35)) === lh
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold'
                              : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-white'
                              }`}
                          >
                            {lh}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
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
              {/* Document Colors Palette */}
              {documentColors.length > 0 && (
                <div className="pt-1.5">
                  <span className="text-[9px] text-slate-500 font-medium block mb-1">Warna di Slide Ini:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {documentColors.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleChange('fill', c)}
                        title={`Pilih warna slide ${c}`}
                        className={`w-3.5 h-3.5 rounded-full border transition-transform ${element.fill?.toLowerCase() === c
                          ? 'scale-125 border-white ring-1 ring-white/50'
                          : 'border-slate-700 hover:scale-110'
                          }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {/* Quick Swatches for Fill */}
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {['#6366f1', '#38bdf8', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ffffff', '#1e293b'].map(sw => (
                  <button
                    key={sw}
                    type="button"
                    onClick={() => handleChange('fill', sw)}
                    title={`Pilih warna ${sw}`}
                    className={`w-3.5 h-3.5 rounded-full border transition-transform ${element.fill === sw ? 'scale-125 border-white ring-1 ring-white/50' : 'border-transparent hover:scale-110'
                      }`}
                    style={{ backgroundColor: sw }}
                  />
                ))}
              </div>
              {/* Recent Colors for Fill */}
              {recentColors.length > 0 && (
                <div className="pt-1.5">
                  <span className="text-[9px] text-slate-500 font-medium block mb-1">Riwayat Terakhir:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {recentColors.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleChange('fill', c)}
                        title={`Gunakan riwayat ${c}`}
                        className="w-3.5 h-3.5 rounded-full border border-slate-700 hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(() => {
              const effectiveBg = (element.fill && element.fill !== 'transparent' && !element.fill.startsWith('rgba'))
                ? element.fill
                : (activeSlide.background || '#0f172a');
              const contrast = evaluateContrast(element.color || '#ffffff', effectiveBg);

              return (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-slate-500">Warna Teks</label>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded border font-mono font-bold ${contrast.level === 'AAA' || contrast.level === 'AA'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : contrast.level === 'AA Large'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        title={`Kontras WCAG: ${contrast.ratio}:1 (${contrast.label})`}
                      >
                        {contrast.ratio}:1 {contrast.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!contrast.isGood && (
                        <button
                          type="button"
                          onClick={() => handleChange('color', contrast.recommendedColor)}
                          className="text-[9px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                          title={`Ubah ke ${contrast.recommendedColor} agar teks mudah dibaca`}
                        >
                          Auto-Fix
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleEyeDropper('color')}
                        title="Ambil warna dari layar (Pipet Eyedropper)"
                        className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded"
                      >
                        <Pipette className="w-3 h-3" />
                      </button>
                    </div>
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
                  {/* Document Colors Palette for Text */}
                  {documentColors.length > 0 && (
                    <div className="pt-1.5">
                      <span className="text-[9px] text-slate-500 font-medium block mb-1">Warna di Slide Ini:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {documentColors.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleChange('color', c)}
                            title={`Pilih warna teks slide ${c}`}
                            className={`w-3.5 h-3.5 rounded-full border transition-transform ${element.color?.toLowerCase() === c
                              ? 'scale-125 border-white ring-1 ring-white/50'
                              : 'border-slate-700 hover:scale-110'
                              }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Quick Swatches for Text Color */}
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {['#ffffff', '#94a3b8', '#6366f1', '#38bdf8', '#34d399', '#f87171', '#fbbf24', '#0f172a'].map(sw => (
                      <button
                        key={sw}
                        type="button"
                        onClick={() => handleChange('color', sw)}
                        title={`Pilih warna teks ${sw}`}
                        className={`w-3.5 h-3.5 rounded-full border transition-transform ${element.color === sw ? 'scale-125 border-white ring-1 ring-white/50' : 'border-transparent hover:scale-110'
                          }`}
                        style={{ backgroundColor: sw }}
                      />
                    ))}
                  </div>
                  {/* Recent Colors for Text */}
                  {recentColors.length > 0 && (
                    <div className="pt-1.5">
                      <span className="text-[9px] text-slate-500 font-medium block mb-1">Riwayat Terakhir:</span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {recentColors.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleChange('color', c)}
                            title={`Gunakan riwayat ${c}`}
                            className="w-3.5 h-3.5 rounded-full border border-slate-700 hover:scale-110 transition-transform"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Palet Harmonisasi Warna */}
          {colorHarmonies.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Harmoni Warna Teoretis
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  Basis: {activeColorForHarmonies}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {colorHarmonies.map((grp) => (
                  <div key={grp.type} className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[9px] text-slate-400 truncate mb-1" title={grp.name}>
                      {grp.name.split(' ')[0]}
                    </div>
                    <div className="flex items-center gap-1">
                      {grp.colors.map((c, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (element.type === 'text') {
                              handleChange('color', c);
                            } else {
                              handleChange('fill', c);
                            }
                            showToast(`Warna diterapkan: ${c}`);
                          }}
                          title={`Gunakan warna ${c}`}
                          className="flex-1 h-5 rounded-md border border-slate-700/60 hover:scale-105 transition-transform shadow-sm"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Garis Tepi (Border / Stroke) */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Garis Tepi (Border / Stroke)
              </label>
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
                    title="Ambil warna dari layar (Pipet Eyedropper)"
                    className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded"
                  >
                    <Pipette className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                  <input
                    type="color"
                    value={element.stroke && element.stroke.startsWith('#') ? element.stroke : '#6366f1'}
                    onChange={e => {
                      handleChange('stroke', e.target.value);
                      if (!element.strokeWidth) handleChange('strokeWidth', 2);
                    }}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-[11px] font-mono text-slate-300 truncate">
                    {element.stroke || 'Tanpa Border'}
                  </span>
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
                      className={`flex-1 py-1 rounded text-[10px] transition-colors ${(element.strokeDash || 'solid') === dash.id && element.stroke
                        ? 'bg-indigo-600 text-white font-semibold'
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
                <span className="text-slate-500">Ketebalan Garis</span>
                <span className="font-mono text-indigo-400 font-semibold">
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
                    className={`py-1 rounded text-center text-[10px] font-mono border transition-all ${(w === 0 && !element.stroke) || (element.stroke && (element.strokeWidth || 1) === w)
                      ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                  >
                    {w === 0 ? '0px' : `${w}px`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Efek Bayangan (Shadow) */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 block">Efek Bayangan (Shadow)</label>
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
            <div className="pt-1 space-y-1">
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
