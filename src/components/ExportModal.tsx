import React, { useState } from 'react';
import { DesignProject, Slide } from '../types';
import { exportToPowerPoint } from '../engine/pptx-exporter';
import { exportArtboardToImage, copyArtboardToClipboard } from '../engine/canvas-exporter';
import { exportToReactTailwind, exportProjectToReactDeck } from '../engine/tailwind-exporter';
import { generateDesignDSL } from '../engine/dsl-generator';
import { generateStandaloneHtmlPresentation } from '../engine/html-exporter';
import { Download, FileText, Image, Code2, Check, Loader2, Sparkles, X, BookOpen, FileCode, HardDrive, Globe, Copy, Printer, Archive } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPng, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { ElementRenderer } from './ElementRenderer';
import { getSlideBackground } from '../utils/slideStyle';

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
  const [activeTab, setActiveTab] = useState<'pptx' | 'image' | 'pdf' | 'code' | 'notes' | 'html' | 'embed'>('pptx');
  const [isExporting, setIsExporting] = useState(false);
  const [imageScale, setImageScale] = useState<number>(2);
  const [pdfScope, setPdfScope] = useState<'all' | 'active'>('all');
  const [codeScope, setCodeScope] = useState<'active' | 'deck'>('active');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedOutline, setCopiedOutline] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');

  const tailwindCode = codeScope === 'deck'
    ? exportProjectToReactDeck(project)
    : exportToReactTailwind(activeSlide);

  const generateOutlineMarkdown = () => {
    const title = project.title || 'Presentasi';
    const totalWords = project.slides.reduce((acc, s) => {
      const w = (s.notes || '').trim().split(/\s+/).filter(Boolean).length;
      return acc + w;
    }, 0);
    const totalSeconds = Math.ceil((totalWords / 130) * 60) + project.slides.length * 15;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const durationStr = minutes > 0 ? `${minutes}m ${seconds}d` : `${seconds}d`;

    const lines = [
      `# Panduan & Outline Pembicara: ${title}`,
      `> Lembar Contekan Presentasi (Speaker Handout Cheat Sheet)`,
      '',
      `- **Jumlah Slide**: ${project.slides.length} slide`,
      `- **Estimasi Waktu Total**: ~${durationStr} (kecepatan santai ~130 kata/menit)`,
      `- **Rasio Kanvas**: ${project.slides[0]?.presetName || '16:9'}`,
      '',
      '============================================================',
      '',
    ];

    project.slides.forEach((s, idx) => {
      const slideWords = (s.notes || '').trim().split(/\s+/).filter(Boolean).length;
      const slideSec = Math.ceil((slideWords / 130) * 60) + 15;

      lines.push(`## Slide ${idx + 1}: ${s.title || `Slide ${idx + 1}`} (~${slideSec} detik)`);
      if (s.transition && s.transition !== 'none') {
        lines.push(`*Efek Transisi: ${s.transition}*`);
      }
      lines.push('');

      // Extract key textual content from elements on this slide
      const keyPoints = s.elements
        .filter(el => !el.hidden && (el.content || el.subTitle || el.badgeText))
        .map(el => {
          const parts: string[] = [];
          if (el.content) parts.push(el.content.trim());
          if (el.subTitle) parts.push(`(${el.subTitle.trim()})`);
          if (el.badgeText) parts.push(`[${el.badgeText.trim()}]`);
          return parts.join(' ');
        })
        .filter(Boolean);

      if (keyPoints.length > 0) {
        lines.push('### Poin Konten Layar:');
        keyPoints.forEach(pt => lines.push(`- ${pt}`));
        lines.push('');
      }

      lines.push('### Catatan Pembicara:');
      if (s.notes && s.notes.trim()) {
        lines.push(s.notes.trim());
      } else {
        lines.push('*(Tidak ada catatan pembicara khusus)*');
      }

      lines.push('');
      lines.push('------------------------------------------------------------');
      lines.push('');
    });

    return lines.join('\n');
  };

  const handleCopyOutline = () => {
    navigator.clipboard.writeText(generateOutlineMarkdown());
    setCopiedOutline(true);
    setTimeout(() => setCopiedOutline(false), 2000);
  };

  const handlePrintHandout = () => {
    const title = project.title || 'Naskah Presentasi';
    const totalWords = project.slides.reduce((acc, s) => acc + (s.notes || '').trim().split(/\s+/).filter(Boolean).length, 0);
    const estSec = Math.round((totalWords / 130) * 60);
    const estMin = Math.floor(estSec / 60);

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title} - Handout Naskah Presenter</title>
          <style>
            @media print {
              @page { margin: 1.5cm; }
              body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; line-height: 1.5; font-size: 13px; }
              .page-break { page-break-after: always; }
              .no-print { display: none; }
            }
            body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 24px; line-height: 1.6; }
            .header-banner { border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; background: #e0e7ff; color: #3730a3; font-weight: 600; font-size: 11px; }
            .slide-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin-bottom: 20px; background: #f8fafc; }
            .slide-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px; }
            .slide-title { font-size: 15px; font-weight: bold; color: #0f172a; }
            .slide-notes { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 13px; color: #334155; white-space: pre-wrap; min-height: 50px; }
            .notes-empty { color: #94a3b8; font-style: italic; }
            .handwritten-area { border: 1px dashed #cbd5e1; border-radius: 6px; padding: 10px; margin-top: 10px; color: #94a3b8; font-size: 11px; height: 35px; }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <h1 style="margin: 0 0 4px 0; font-size: 22px; color: #1e1b4b;">${title}</h1>
            <div style="font-size: 12px; color: #64748b;">
              Handout Pembicara & Naskah Sidang • ${project.slides.length} Slide • Total ~${totalWords} Kata (~${estMin}m ${estSec % 60}d estimasi bicara)
            </div>
          </div>
          ${project.slides.map((s, idx) => `
            <div class="slide-card">
              <div class="slide-header">
                <span class="slide-title">Slide ${idx + 1}: ${s.title}</span>
                <span class="badge">${(s.notes || '').trim().split(/\s+/).filter(Boolean).length} kata</span>
              </div>
              <div class="slide-notes ${!s.notes?.trim() ? 'notes-empty' : ''}">
                ${s.notes?.trim() ? s.notes.trim() : 'Tidak ada catatan pembicara untuk slide ini.'}
              </div>
              <div class="handwritten-area">Catatan Tambahan Saat Presentasi / Tanya Jawab:</div>
            </div>
          `).join('')}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=900,height=800');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
    } else {
      alert('Izinkan pop-up peramban untuk mencetak handout presentasi.');
    }
  };

  const handleDownloadSpeakerNotes = () => {
    const title = project.title || 'Presentasi';
    const content = generateOutlineMarkdown();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_panduan_outline_pembicara.md`;
    link.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
  };

  const handleDownloadDSL = () => {
    const dslText = generateDesignDSL(project);
    const blob = new Blob([dslText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.dflow`;
    link.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.designflow.json`;
    link.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
  };

  const handleDownloadStandaloneHTML = () => {
    const htmlString = generateStandaloneHtmlPresentation(project);
    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const title = project.title || 'Presentasi';
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_slideshow.html`;
    link.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const handleDownloadWebBundleZip = async () => {
    setIsExporting(true);
    setExportProgress('Menyusun arsip bundel web (.zip)...');
    try {
      const zip = new JSZip();
      const title = project.title || 'Presentasi';
      const cleanName = title.toLowerCase().replace(/[^a-z0-9]/g, '_');

      // 1. Standalone HTML presentation
      const htmlContent = generateStandaloneHtmlPresentation(project);
      zip.file('index.html', htmlContent);

      // 2. Project JSON Backup
      zip.file(`${cleanName}.designflow.json`, JSON.stringify(project, null, 2));

      // 3. DSL source
      zip.file(`${cleanName}.dflow`, generateDesignDSL(project));

      // 4. Speaker Handout
      zip.file('speaker_handout.md', generateOutlineMarkdown());

      // 5. Documentation
      zip.file(
        'README.md',
        `# ${title} - Paket Presentasi DesignFlow Studio\n\n` +
          `Paket ini siap dibuka secara offline tanpa instalasi software apa pun.\n\n` +
          `## Berkas yang Disertakan:\n` +
          `- **index.html**: Buka file ini di browser (Chrome, Edge, Safari, Firefox) untuk memulai slideshow mandiri offline.\n` +
          `- **${cleanName}.designflow.json**: Berkas sumber proyek untuk diimpor kembali ke DesignFlow Studio.\n` +
          `- **${cleanName}.dflow**: Format kode sumber DesignFlow DSL.\n` +
          `- **speaker_handout.md**: Panduan narasi dan catatan naskah pembicara per slide.\n\n` +
          `Dibuat dengan DesignFlow Studio.`
      );

      setExportProgress('Mengompresi paket zip...');
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cleanName}_presentation_bundle.zip`;
      link.click();
      URL.revokeObjectURL(url);

      confetti({ particleCount: 75, spread: 65, origin: { y: 0.7 } });
    } catch (err: any) {
      alert('Gagal membuat paket ZIP: ' + err.message);
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

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

  const handleCopyImageToClipboard = async () => {
    if (!artboardRef.current) return;
    setIsExporting(true);
    setExportProgress(`Menyalin kanvas ke clipboard (${imageScale}x)...`);
    try {
      const success = await copyArtboardToClipboard(artboardRef.current, imageScale);
      if (success) {
        setCopiedImage(true);
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
        setTimeout(() => setCopiedImage(false), 2500);
      } else {
        alert('Browser Anda tidak mendukung penulisan gambar ke clipboard.');
      }
    } catch (err: any) {
      alert('Gagal menyalin gambar: ' + err.message);
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  const handleCopySvgCode = async () => {
    if (!artboardRef.current) return;
    setIsExporting(true);
    setExportProgress('Mengonversi kanvas menjadi markup vektor SVG...');
    try {
      const dataUrl = await toSvg(artboardRef.current, {
        quality: 1,
        filter: (node: HTMLElement) => {
          if (node.classList && (node.classList.contains('transform-handles') || node.classList.contains('export-ignore'))) {
            return false;
          }
          if (node.getAttribute && node.getAttribute('data-export-ignore') === 'true') {
            return false;
          }
          return true;
        },
      });

      let svgContent = '';
      if (dataUrl.includes('base64,')) {
        svgContent = atob(dataUrl.split('base64,')[1]);
      } else {
        svgContent = decodeURIComponent(dataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''));
      }

      await navigator.clipboard.writeText(svgContent);
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2500);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      alert('Gagal menyalin kode SVG: ' + err.message);
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  // Multi-Slide or Active-Slide PDF Exporter (renders slides offscreen)
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const targetSlides = pdfScope === 'active' ? [activeSlide] : project.slides;
      const firstSlide = targetSlides[0];
      const orientation = firstSlide.width > firstSlide.height ? 'landscape' : 'portrait';

      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [firstSlide.width, firstSlide.height],
      });

      for (let i = 0; i < targetSlides.length; i++) {
        const curSlide = targetSlides[i];
        setExportProgress(`Merender Slide ${i + 1} dari ${targetSlides.length} ke PDF...`);
        const origIdx = project.slides.findIndex(s => s.id === curSlide.id);
        const targetElement = document.getElementById(`export-slide-offscreen-${origIdx}`);
        if (targetElement) {
          const imgData = await toPng(targetElement, { quality: 0.95, pixelRatio: 1.5 });
          if (i > 0) {
            pdf.addPage([curSlide.width, curSlide.height], curSlide.width > curSlide.height ? 'landscape' : 'portrait');
          }
          pdf.addImage(imgData, 'PNG', 0, 0, curSlide.width, curSlide.height);
        }
      }

      const fileBase = pdfScope === 'active' ? activeSlide.title : project.title;
      const fileName = `${fileBase.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      alert('Gagal mengekspor PDF: ' + err.message);
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

  const handleDownloadCodeFile = () => {
    const blob = new Blob([tailwindCode], { type: 'text/typescript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = codeScope === 'deck'
      ? `${(project.title || 'presentasi').toLowerCase().replace(/[^a-z0-9]/g, '_')}_deck.tsx`
      : `${activeSlide.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_slide.tsx`;
    link.download = baseName;
    link.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
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
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'pptx'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span>PowerPoint (.pptx)</span>
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'image'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
              }`}
          >
            <Image className="w-4 h-4" />
            <span>Gambar (PNG / SVG)</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'pdf'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span>Dokumen PDF ({project.slides.length} Halaman)</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'code'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
              }`}
          >
            <Code2 className="w-4 h-4" />
            <span>React & Tailwind</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'notes'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
              }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Naskah & Cadangan</span>
          </button>

          <button
            onClick={() => setActiveTab('html')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'html'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
              }`}
          >
            <Globe className="w-4 h-4" />
            <span>HTML Slideshow</span>
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'embed'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
              }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Embed & Iframe</span>
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
                      className={`p-2 rounded-xl border text-left transition-colors ${imageScale === opt.scale
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
                  onClick={handleCopyImageToClipboard}
                  disabled={isExporting}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
                >
                  {copiedImage ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedImage ? 'Gambar Tersalin!' : 'Salin ke Clipboard'}</span>
                </button>
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
                    onClick={() => handleExportImage('svg')}
                    disabled={isExporting}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 active:scale-95 shadow-sm"
                    title="Unduh berkas .svg ke perangkat Anda"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Unduh .SVG</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySvgCode}
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
          )}

          {/* TAB 3: PDF */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Pilih cakupan dokumen PDF yang ingin Anda cetak:
              </p>

              {/* PDF Scope Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPdfScope('all')}
                  className={`p-3 rounded-xl border text-left transition-all ${pdfScope === 'all'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                  <div className="font-bold text-xs">Seluruh Slide Deck</div>
                  <div className="text-[10px] text-slate-500">Total {project.slides.length} halaman terpadu</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPdfScope('active')}
                  className={`p-3 rounded-xl border text-left transition-all ${pdfScope === 'active'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                  <div className="font-bold text-xs truncate">Slide Aktif Saja</div>
                  <div className="text-[10px] text-slate-500 truncate">Hanya: {activeSlide.title}</div>
                </button>
              </div>

              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>
                  {isExporting
                    ? (exportProgress || 'Menyusun Dokumen PDF...')
                    : pdfScope === 'active'
                      ? 'Unduh PDF (1 Halaman Slide Ini)'
                      : `Unduh Dokumen PDF (${project.slides.length} Halaman)`}
                </span>
              </button>
            </div>
          )}

          {/* TAB 4: REACT + TAILWIND CODE */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              {/* Code Scope Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCodeScope('active')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${codeScope === 'active'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                  <div className="font-bold text-xs truncate">Slide Aktif Saja</div>
                  <div className="text-[10px] text-slate-500 truncate">Komponen: {activeSlide.title}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCodeScope('deck')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${codeScope === 'deck'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                  <div className="font-bold text-xs">Seluruh Deck Interaktif ({project.slides.length} Slide)</div>
                  <div className="text-[10px] text-slate-500">Navigasi keyboard, state & progress bar</div>
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">
                  Kode komponen React 19 + Tailwind CSS siap pakai:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadCodeFile}
                    title="Unduh file komponen .tsx langsung ke komputer"
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{codeScope === 'deck' ? 'Unduh Deck .tsx' : 'Unduh Slide .tsx'}</span>
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Kode'}</span>
                  </button>
                </div>
              </div>

              {/* Code Box with Gutter Line Numbers */}
              <div className="max-h-60 overflow-y-auto bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono flex">
                <div className="w-10 py-3 pr-2 text-right bg-slate-950/90 text-slate-600 select-none border-r border-slate-800/80 shrink-0 leading-5 pointer-events-none">
                  {tailwindCode.split('\n').map((_, idx) => (
                    <div key={idx} className="text-[10px]">{idx + 1}</div>
                  ))}
                </div>
                <pre className="p-3 pl-3 text-emerald-400 overflow-x-auto flex-1 leading-5 select-text font-mono">
                  {tailwindCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 5: NOTES & BACKUP */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-0.5">Naskah Pembicara & Cadangan Proyek Lengkap</strong>
                  Unduh seluruh catatan narasi presentasi dalam format Markdown atau simpan cadangan kode proyek yang dapat dimuat kembali sewaktu-waktu.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Speaker Notes (.md) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1">
                      <BookOpen className="w-4 h-4" />
                      <span>Contekan & Outline Pembicara (.md)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Kompilasi judul slide, poin teks layar, durasi pacing bicara, dan catatan narasi lengkap untuk panduan presentasi offline.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadSpeakerNotes}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh .md</span>
                    </button>
                    <button
                      onClick={handleCopyOutline}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                      title="Salin Markdown Outline ke Clipboard"
                    >
                      {copiedOutline ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedOutline ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handlePrintHandout}
                    className="w-full py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    title="Cetak atau simpan handout naskah presentasi sebagai PDF siap cetak"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Lembar Naskah (Print)</span>
                  </button>
                </div>

                {/* Declarative DSL (.dflow) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
                      <FileCode className="w-4 h-4" />
                      <span>Kode DSL (.dflow)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Sintaks teks deklaratif ringkas yang dapat disinkronkan kembali lewat Code Drawer (<kbd className="font-mono text-[10px]">Alt+C</kbd>).
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadDSL}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-600/30"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh .dflow</span>
                  </button>
                </div>

                {/* Full JSON Project (.json) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                      <HardDrive className="w-4 h-4" />
                      <span>Cadangan JSON (.json)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Arsip data mentah proyek 100% lengkap untuk dicadangkan ke Google Drive atau perangkat offline.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadJSON}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh .json</span>
                  </button>
                </div>
              </div>

              {/* Live Markdown Outline Preview Box */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Pratinjau Outline Dokumen ({project.slides.length} Slide):</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyOutline}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    {copiedOutline ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedOutline ? 'Tersalin ke Clipboard' : 'Salin Semua Teks'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
                  {generateOutlineMarkdown()}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 6: STANDALONE OFFLINE HTML SLIDESHOW */}
          {activeTab === 'html' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-0.5">Slideshow HTML Mandiri & Offline (.html)</strong>
                  Menghasilkan 1 berkas presentasi HTML utuh berukuran ringan tanpa dependensi eksternal. Dapat dibuka langsung di semua web browser (Chrome, Edge, Safari, Firefox) di laptop, tablet, atau proyektor offline tanpa perlu menginstal aplikasi apa pun.
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p>• Navigasi Presenter Bawaan: Spasi / Panah untuk pindah slide</p>
                <p>• Fitur Layar Penuh: Tekan <strong>F</strong> untuk Fullscreen, <strong>B</strong> untuk Blank Hitam, <strong>N</strong> untuk Catatan</p>
                <p>• Skala Responsif Otomatis: Menyesuaikan resolusi layar apa pun secara proporsional</p>
                <p>• Total slide disertakan: {project.slides.length} slide</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownloadStandaloneHTML}
                  disabled={isExporting}
                  className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh 1 Berkas HTML (.html)</span>
                </button>

                <button
                  onClick={handleDownloadWebBundleZip}
                  disabled={isExporting}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 hover:border-indigo-500/60 border border-slate-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                >
                  <Archive className="w-4 h-4 text-cyan-400" />
                  <span>Unduh Paket Lengkap (.zip)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: EMBED & WEB WIDGET */}
          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-0.5">Kode Semat Iframe Responsif (Embed Widget)</strong>
                  Salin potongan kode HTML Iframe berikut untuk menyematkan presentasi atau wireframe Anda langsung ke dalam Notion, Medium, WordPress, Webflow, atau situs dokumentasi tim.
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Kode Semat Iframe Responsif (Rasio 16:9):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const iframeSnippet = `<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">\n  <iframe src="presentation.html" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>\n</div>`;
                      navigator.clipboard.writeText(iframeSnippet);
                      setCopiedEmbed(true);
                      setTimeout(() => setCopiedEmbed(false), 2000);
                      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmbed ? 'Tersalin ke Clipboard!' : 'Salin Kode Iframe'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 select-text overflow-x-auto leading-relaxed">
                  <code>{`<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">\n  <iframe src="presentation.html" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>\n</div>`}</code>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tip: Ganti <code>presentation.html</code> dengan URL tempat berkas HTML diunggah, atau unduh berkas HTML dari tab <strong>HTML Slideshow</strong> dan letakkan di hosting web Anda.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Offscreen Containers for PDF Generation of all slides (Offscreen without opacity-0 to ensure crisp non-blank render) */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
        {project.slides.map((s, idx) => (
          <div
            key={s.id}
            id={`export-slide-offscreen-${idx}`}
            style={{
              width: `${s.width}px`,
              height: `${s.height}px`,
              background: getSlideBackground(s),
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {s.elements.map(el => {
              if (el.hidden) return null;
              return (
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
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
