import React, { useState } from 'react';
import { Slide, PRESET_SIZES } from '../../types';
import {
  Monitor,
  Palette,
  SunMoon,
  Image as ImageIcon,
  Upload,
  Sparkles,
  StickyNote,
} from 'lucide-react';
import { extractPaletteFromImage, ExtractedPalette } from '../../utils/paletteExtractor';

interface SlideCanvasInspectorProps {
  activeSlide: Slide;
  onUpdateSlide: (slideId: string, updates: Partial<Slide>) => void;
  onApplySlideTheme?: (theme: { background: string; primaryAccent: string; cardFill: string; textColor: string }) => void;
  onInvertSlideTheme?: () => void;
  onReplaceColorInProject?: (fromColor: string, toColor: string) => number;
  showToast: (msg: string) => void;
}

export const SlideCanvasInspector: React.FC<SlideCanvasInspectorProps> = ({
  activeSlide,
  onUpdateSlide,
  onApplySlideTheme,
  onInvertSlideTheme,
  onReplaceColorInProject,
  showToast,
}) => {
  const [globalColorFrom, setGlobalColorFrom] = useState('');
  const [globalColorTo, setGlobalColorTo] = useState('#6366f1');
  const [extractedPalette, setExtractedPalette] = useState<ExtractedPalette | null>(null);
  const [isExtractingPalette, setIsExtractingPalette] = useState(false);

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
                className={`h-7 w-7 rounded-full border border-white/10 hover:scale-110 transition-transform shadow-md relative ${
                  activeSlide.background === swatch.color ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900 scale-105' : ''
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
                  className={`h-8 rounded-lg border border-slate-700/80 hover:border-indigo-500/80 hover:scale-[1.02] transition-all text-[9px] font-semibold text-white/95 flex items-center justify-center shadow-sm truncate px-1 ${
                    activeSlide.background === grad.bg ? 'ring-2 ring-indigo-500 border-indigo-400' : ''
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

          {/* Wallpaper & Gambar Latar Slide */}
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
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                        (activeSlide.wallpaperOverlay ?? 0) === preset.val
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

        {/* Efek Transisi Slide Saat Presentasi */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Transisi Slide Saat Presentasi</span>
          </span>
          <div className="flex items-center gap-2">
            <select
              value={activeSlide.transition || 'fade'}
              onChange={e => onUpdateSlide(activeSlide.id, { transition: e.target.value as any })}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-xs"
            >
              <option value="fade">Fade Lembut (Elegan & Bersih)</option>
              <option value="slide">Slide Horizontal (Geser Kanan)</option>
              <option value="slide-vertical">Slide Vertikal (Meluncur Naik)</option>
              <option value="zoom">Zoom Membesar (Dinamis)</option>
              <option value="flip-cube">Flip 3D (Modern)</option>
              <option value="blur-fade">Blur Focus (Sinematik)</option>
              <option value="none">Tanpa Efek (Instan)</option>
            </select>
            <button
              type="button"
              onClick={() => {
                const artboard = document.getElementById(`artboard-${activeSlide.id}`);
                if (artboard) {
                  const trans = activeSlide.transition || 'fade';
                  const cls = trans === 'slide-vertical' ? 'df-trans-slide-vertical' : trans === 'flip-cube' ? 'df-trans-flip-cube' : trans === 'blur-fade' ? 'df-trans-blur-fade' : trans === 'zoom' ? 'animate-in zoom-in-90 duration-300' : 'animate-in fade-in duration-300';
                  artboard.classList.remove('animate-in', 'fade-in', 'zoom-in-90', 'df-trans-slide-vertical', 'df-trans-flip-cube', 'df-trans-blur-fade');
                  void artboard.offsetWidth;
                  artboard.classList.add(...cls.split(' '));
                  setTimeout(() => artboard.classList.remove(...cls.split(' ')), 600);
                }
              }}
              title="Pratinjau Efek Transisi Langsung di Kanvas"
              className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-lg text-xs font-semibold shrink-0 transition-colors"
            >
              ▶ Tes
            </button>
          </div>
        </div>

        {/* Ganti Warna Global Serentak di Seluruh Slide */}
        {onReplaceColorInProject && documentColors.length > 0 && (
          <details className="group border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
            <summary className="px-2.5 py-2 cursor-pointer flex items-center justify-between text-[10px] font-medium text-slate-400 hover:text-slate-200 select-none">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ganti Warna Serentak Seluruh Proyek</span>
              </span>
              <span className="text-slate-500 text-[10px] group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="p-2.5 pt-1 border-t border-slate-800/60 space-y-2">
              <div>
                <span className="text-[9px] text-slate-500 block mb-1">Pilih Warna Asal:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {documentColors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setGlobalColorFrom(c)}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        (globalColorFrom || documentColors[0]) === c
                          ? 'border-cyan-400 scale-125 ring-1 ring-cyan-400/50'
                          : 'border-slate-700/80 hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1">
                  <span className="text-[9px] text-slate-500 block mb-1">Ganti Menjadi:</span>
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                    <input
                      type="color"
                      value={globalColorTo}
                      onChange={e => setGlobalColorTo(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={globalColorTo}
                      onChange={e => setGlobalColorTo(e.target.value)}
                      className="w-full bg-transparent text-[10px] font-mono text-slate-200 outline-none uppercase"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const from = globalColorFrom || documentColors[0];
                    if (!from || !globalColorTo) return;
                    const count = onReplaceColorInProject(from, globalColorTo);
                    showToast(`Warna diperbarui pada ${count} elemen!`);
                  }}
                  className="self-end px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-sm transition-colors"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </details>
        )}
      </div>
    </aside>
  );
};
