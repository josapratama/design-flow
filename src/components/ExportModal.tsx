import React, { useState } from 'react';
import { DesignProject, Slide } from '../types';
import { exportToPowerPoint } from '../engine/pptx-exporter';
import { exportArtboardToImage, exportProjectToPDF } from '../engine/canvas-exporter';
import { exportToReactTailwind } from '../engine/tailwind-exporter';
import { Download, FileText, Image, Code2, Check, Loader2, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  project: DesignProject;
  activeSlide: Slide;
  artboardRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  activeSlide,
  artboardRef,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pptx' | 'image' | 'pdf' | 'code'>('pptx');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const tailwindCode = exportToReactTailwind(activeSlide);

  const handleExportPPTX = async () => {
    setIsExporting(true);
    try {
      await exportToPowerPoint(project);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      alert('Gagal mengekspor ke PowerPoint: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = async (format: 'png' | 'jpeg' | 'svg') => {
    if (!artboardRef.current) return;
    setIsExporting(true);
    try {
      await exportArtboardToImage(artboardRef.current, format, activeSlide.title.toLowerCase().replace(/\s+/g, '_'));
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    } catch (err: any) {
      alert('Gagal mengekspor gambar: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!artboardRef.current) return;
    setIsExporting(true);
    try {
      const map = new Map<string, HTMLElement>();
      map.set(activeSlide.id, artboardRef.current);
      await exportProjectToPDF(project, map);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      alert('Gagal mengekspor PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(tailwindCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Ekspor Proyek Desain</h3>
              <p className="text-xs text-slate-400">Pilih format ekspor sesuai kebutuhan Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/20 px-5 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('pptx')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'pptx'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>PowerPoint (.pptx)</span>
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'image'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Gambar (PNG / SVG)</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'pdf'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Dokumen PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'code'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>React & Tailwind</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* TAB 1: PPTX */}
          {activeTab === 'pptx' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-0.5">Format Asli PowerPoint Microsoft (.pptx)</strong>
                  Semua slide ({project.slides.length} slide) diekspor sebagai bentuk shape, teks, dan kotak asli yang dapat diedit kembali di MS PowerPoint, Google Slides, maupun Keynote.
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p>• Resolusi: 16:9 Widescreen (1920x1080)</p>
                <p>• Catatan Pembicara: Ikut disertakan di setiap slide</p>
                <p>• Jumlah slide: {project.slides.length} slide terdaftar</p>
              </div>

              <button
                onClick={handleExportPPTX}
                disabled={isExporting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isExporting ? 'Sedang Menyusun Berkas PPTX...' : 'Unduh PowerPoint (.pptx)'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: IMAGE */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Ekspor artboard aktif ({activeSlide.title}) menjadi berkas gambar resolusi tinggi (2x Retina scale).
              </p>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleExportImage('png')}
                  disabled={isExporting}
                  className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex flex-col items-center gap-2 transition-all hover:border-indigo-500"
                >
                  <span className="font-bold text-sm text-slate-100">PNG</span>
                  <span className="text-[10px] text-slate-400">Transparan / Tajam</span>
                </button>

                <button
                  onClick={() => handleExportImage('jpeg')}
                  disabled={isExporting}
                  className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex flex-col items-center gap-2 transition-all hover:border-indigo-500"
                >
                  <span className="font-bold text-sm text-slate-100">JPEG</span>
                  <span className="text-[10px] text-slate-400">Kompresi Ringan</span>
                </button>

                <button
                  onClick={() => handleExportImage('svg')}
                  disabled={isExporting}
                  className="p-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex flex-col items-center gap-2 transition-all hover:border-indigo-500"
                >
                  <span className="font-bold text-sm text-slate-100">SVG</span>
                  <span className="text-[10px] text-slate-400">Skalabilitas Vektor</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PDF */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Cetak seluruh slide menjadi dokumen PDF terpadu yang siap dibagikan untuk naskah skripsi atau presentasi offline.
              </p>

              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isExporting ? 'Menyusun Dokumen PDF...' : 'Unduh Dokumen PDF'}</span>
              </button>
            </div>
          )}

          {/* TAB 4: REACT + TAILWIND CODE */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Kode komponen React 19 + Tailwind CSS siap salin:
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Kode'}</span>
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400">
                <pre>{tailwindCode}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
