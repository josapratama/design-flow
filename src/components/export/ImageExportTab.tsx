import React from 'react';
import { Sparkles, Download, Copy, Check } from 'lucide-react';
import { Slide } from '../../types';

interface ImageExportTabProps {
  activeSlide: Slide;
  imageScale: number;
  isExporting: boolean;
  copiedImage: boolean;
  copiedSvg: boolean;
  onScaleChange: (scale: number) => void;
  onExportImage: (format: 'png' | 'jpeg' | 'webp' | 'svg') => void;
  onCopyImage: () => void;
  onCopySvg: () => void;
}

export const ImageExportTab: React.FC<ImageExportTabProps> = ({
  activeSlide,
  imageScale,
  isExporting,
  copiedImage,
  copiedSvg,
  onScaleChange,
  onExportImage,
  onCopyImage,
  onCopySvg,
}) => {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Ekspor artboard aktif ({activeSlide.title}) menjadi berkas gambar berkualitas tinggi.
      </p>

      {/* Resolution Options */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
          Pilihan Skala Resolusi
        </span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { scale: 1, label: '1x Web', desc: 'Ringan (72 DPI)' },
            { scale: 2, label: '2x Retina', desc: 'Tajam HD (144 DPI)' },
            { scale: 3, label: '3x Ultra', desc: 'Cetak Poster (300 DPI)' },
          ].map(opt => (
            <button
              key={opt.scale}
              onClick={() => onScaleChange(opt.scale)}
              className={`p-2 rounded-xl border text-left transition-colors ${
                imageScale === opt.scale
                  ? 'bg-indigo-600/20 border-indigo-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="font-bold text-xs">{opt.label}</div>
              <div className="text-[10px] text-slate-500">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Copy Artboard to OS Clipboard */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Copy className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-white block">Salin Gambar Slide Langsung</span>
            <span className="text-[10px] text-slate-400">Salin PNG ke clipboard untuk ditempel langsung (Ctrl+Shift+C)</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onCopyImage}
          disabled={isExporting}
          className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
        >
          {copiedImage ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedImage ? 'Gambar Tersalin!' : 'Salin ke Clipboard'}</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onExportImage('png')}
          disabled={isExporting}
          className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex flex-col items-center gap-1.5 transition-all hover:border-indigo-500"
        >
          <span className="font-bold text-sm text-slate-100">PNG</span>
          <span className="text-[9px] text-slate-400">Transparan / Tajam</span>
        </button>

        <button
          onClick={() => onExportImage('jpeg')}
          disabled={isExporting}
          className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex flex-col items-center gap-1.5 transition-all hover:border-indigo-500"
        >
          <span className="font-bold text-sm text-slate-100">JPEG</span>
          <span className="text-[9px] text-slate-400">Kompresi Ringan</span>
        </button>

        <button
          onClick={() => onExportImage('webp')}
          disabled={isExporting}
          className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex flex-col items-center gap-1.5 transition-all hover:border-indigo-500 group"
        >
          <span className="font-bold text-sm text-indigo-400 group-hover:text-white">WebP</span>
          <span className="text-[9px] text-slate-400">Super Cepat Web</span>
        </button>

        <button
          onClick={() => onExportImage('svg')}
          disabled={isExporting}
          className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex flex-col items-center gap-1.5 transition-all hover:border-indigo-500 relative group"
        >
          <span className="absolute -top-1.5 right-1 px-1.5 py-0.5 bg-indigo-500 text-[8px] font-bold text-white rounded-full">
            Vector
          </span>
          <span className="font-bold text-sm text-indigo-300 group-hover:text-white">SVG</span>
          <span className="text-[9px] text-slate-400">Vektor Scalable</span>
        </button>
      </div>

      {/* 1-Click SVG Vector Clipboard & Download Box */}
      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between gap-3 mt-1">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-white block">Berkas & Kode Vektor SVG Murni</span>
            <span className="text-[10px] text-slate-400">Siap diimpor ke Figma, Illustrator, Inkscape, atau web</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onExportImage('svg')}
            disabled={isExporting}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 active:scale-95 shadow-sm"
            title="Unduh berkas .svg ke perangkat Anda"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Unduh .SVG</span>
          </button>
          <button
            type="button"
            onClick={onCopySvg}
            disabled={isExporting}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
            title="Salin markup SVG ke clipboard"
          >
            {copiedSvg ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSvg ? 'Tersalin!' : 'Salin Kode'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
