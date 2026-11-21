import React, { useState } from 'react';
import { DesignProject, Slide } from '../types';
import { exportToPowerPoint } from '../engine/pptx-exporter';
import { exportArtboardToImage } from '../engine/canvas-exporter';
import { exportToReactTailwind } from '../engine/tailwind-exporter';
import { Download, FileText, Image, Code2, Check, Loader2, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { ElementRenderer } from './ElementRenderer';

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
  const [imageScale, setImageScale] = useState<number>(2);
  const [copiedCode, setCopiedCode] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');

  const tailwindCode = exportToReactTailwind(activeSlide);

  const handleExportPPTX = async () => {
    setIsExporting(true);
    setExportProgress('Menyusun struktur slide dan shape...');
    try {
      await exportToPowerPoint(project);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      alert('Gagal mengekspor ke PowerPoint: ' + err.message);
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  const handleExportImage = async (format: 'png' | 'jpeg' | 'svg' | 'webp') => {
    if (!artboardRef.current) return;
    setIsExporting(true);
    setExportProgress(`Mengambil tangkapan kanvas (${format.toUpperCase()} ${imageScale}x)...`);
    try {
      await exportArtboardToImage(artboardRef.current, format, activeSlide.title.toLowerCase().replace(/\s+/g, '_'), imageScale);
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    } catch (err: any) {
      alert('Gagal mengekspor gambar: ' + err.message);
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  // Multi-Slide PDF Exporter (renders every slide offscreen)
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const firstSlide = project.slides[0];
      const orientation = firstSlide.width > firstSlide.height ? 'landscape' : 'portrait';

      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [firstSlide.width, firstSlide.height],
      });

      for (let i = 0; i < project.slides.length; i++) {
        setExportProgress(`Merender Slide ${i + 1} dari ${project.slides.length} ke PDF...`);
        const targetElement = document.getElementById(`export-slide-offscreen-${i}`);
        if (targetElement) {
          const imgData = await toPng(targetElement, { quality: 0.95, pixelRatio: 1.5 });
          if (i > 0) {
            const slide = project.slides[i];
            pdf.addPage([slide.width, slide.height], slide.width > slide.height ? 'landscape' : 'portrait');
          }
          pdf.addImage(imgData, 'PNG', 0, 0, project.slides[i].width, project.slides[i].height);
        }
      }

      const fileName = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      alert('Gagal mengekspor PDF multi-halaman: ' + err.message);
    } finally {
      setIsExporting(false);
      setExportProgress('');
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
            <span>Dokumen PDF ({project.slides.length} Halaman)</span>
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
                  Semua slide ({project.slides.length} slide) diekspor sebagai bentuk shape, teks, gambar, dan kotak asli yang dapat diedit kembali di MS PowerPoint, Google Slides, maupun Keynote.
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
                <span>{isExporting ? (exportProgress || 'Menyusun Berkas PPTX...') : 'Unduh PowerPoint (.pptx)'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: IMAGE */}
          {activeTab === 'image' && (
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
                      onClick={() => setImageScale(opt.scale)}
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

              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleExportImage('png')}
                  disabled={isExporting}
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex flex-col items-center gap-1.5 transition-all hover:border-indigo-500"
                >
                  <span className="font-bold text-sm text-slate-100">PNG</span>
                  <span className="text-[9px] text-slate-400">Transparan / Tajam</span>
                </button>

                <button
                  onClick={() => handleExportImage('jpeg')}
                  disabled={isExporting}
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex flex-col items-center gap-1.5 transition-all hover:border-indigo-500"
                >
                  <span className="font-bold text-sm text-slate-100">JPEG</span>
                  <span className="text-[9px] text-slate-400">Kompresi Ringan</span>
                </button>

                <button
                  onClick={() => handleExportImage('webp')}
                  disabled={isExporting}
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex flex-col items-center gap-1.5 transition-all hover:border-indigo-500 group"
                >
                  <span className="font-bold text-sm text-indigo-400 group-hover:text-white">WebP</span>
                  <span className="text-[9px] text-slate-400">Super Cepat Web</span>
                </button>

                <button
                  onClick={() => handleExportImage('svg')}
                  disabled={isExporting}
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex flex-col items-center gap-1.5 transition-all hover:border-indigo-500"
                >
                  <span className="font-bold text-sm text-slate-100">SVG</span>
                  <span className="text-[9px] text-slate-400">Vektor Murni</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PDF */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Cetak seluruh slide (total <strong>{project.slides.length} slide / halaman</strong>) menjadi dokumen PDF terpadu yang siap dibagikan untuk naskah skripsi atau presentasi offline.
              </p>

              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isExporting ? (exportProgress || 'Menyusun Dokumen PDF...') : `Unduh Dokumen PDF (${project.slides.length} Halaman)`}</span>
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

      {/* Hidden Offscreen Containers for PDF Generation of all slides */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-0">
        {project.slides.map((s, idx) => (
          <div
            key={s.id}
            id={`export-slide-offscreen-${idx}`}
            style={{
              width: `${s.width}px`,
              height: `${s.height}px`,
              background: s.background || '#0f172a',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {s.elements.map(el => (
              <div
                key={el.id}
                style={{
                  position: 'absolute',
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                  zIndex: el.zIndex,
                  transform: [
                    el.rotation ? `rotate(${el.rotation}deg)` : '',
                    el.flipX ? 'scaleX(-1)' : '',
                    el.flipY ? 'scaleY(-1)' : '',
                  ].filter(Boolean).join(' ') || undefined,
                  opacity: el.opacity !== undefined ? el.opacity : 1,
                }}
              >
                <ElementRenderer element={el} isSelected={false} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
