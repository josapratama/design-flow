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
import { useDialog } from './dialogs/DialogProvider';
import { useTranslation } from '../i18n/PolyglotContext';
import { PptxExportTab } from './export/PptxExportTab';
import { ImageExportTab } from './export/ImageExportTab';
import { PdfExportTab } from './export/PdfExportTab';
import { CodeExportTab } from './export/CodeExportTab';
import { NotesExportTab } from './export/NotesExportTab';
import { HtmlExportTab } from './export/HtmlExportTab';
import { EmbedExportTab } from './export/EmbedExportTab';

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
  const { alert: dialogAlert } = useDialog();
  const { t } = useTranslation();
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
      dialogAlert({
        title: 'Pop-up Diblokir',
        message: 'Izinkan pop-up peramban untuk mencetak handout presentasi.',
        variant: 'warning',
      });
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
      dialogAlert({
        title: 'Gagal Membuat ZIP',
        message: 'Gagal membuat paket ZIP: ' + (err?.message || 'Kesalahan tidak diketahui'),
        variant: 'danger',
      });
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
      dialogAlert({
        title: 'Gagal Ekspor PowerPoint',
        message: 'Gagal mengekspor ke PowerPoint: ' + (err?.message || 'Kesalahan tidak diketahui'),
        variant: 'danger',
      });
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
      dialogAlert({
        title: 'Gagal Ekspor Gambar',
        message: 'Gagal mengekspor gambar: ' + (err?.message || 'Kesalahan tidak diketahui'),
        variant: 'danger',
      });
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
        dialogAlert({
          title: 'Fitur Tidak Didukung',
          message: 'Browser Anda tidak mendukung penulisan gambar langsung ke clipboard.',
          variant: 'warning',
        });
      }
    } catch (err: any) {
      dialogAlert({
        title: 'Gagal Menyalin Gambar',
        message: 'Gagal menyalin gambar: ' + (err?.message || 'Kesalahan tidak diketahui'),
        variant: 'danger',
      });
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
      dialogAlert({
        title: 'Gagal Menyalin SVG',
        message: 'Gagal menyalin kode SVG: ' + (err?.message || 'Kesalahan tidak diketahui'),
        variant: 'danger',
      });
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
      dialogAlert({
        title: 'Gagal Ekspor PDF',
        message: 'Gagal mengekspor PDF: ' + (err?.message || 'Kesalahan tidak diketahui'),
        variant: 'danger',
      });
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 md:p-8 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-5rem)] my-auto animate-in zoom-in-95 duration-150">
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
        <div className="flex border-b border-slate-800 bg-slate-950/20 px-3 sm:px-5 gap-1 sm:gap-2 pt-2 overflow-x-auto scrollbar-none shrink-0">
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
        <div className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto">
          {activeTab === 'pptx' && (
            <PptxExportTab
              project={project}
              isExporting={isExporting}
              exportProgress={exportProgress}
              onExport={handleExportPPTX}
            />
          )}

          {activeTab === 'image' && (
            <ImageExportTab
              activeSlide={activeSlide}
              imageScale={imageScale}
              isExporting={isExporting}
              copiedImage={copiedImage}
              copiedSvg={copiedSvg}
              onScaleChange={setImageScale}
              onExportImage={handleExportImage}
              onCopyImage={handleCopyImageToClipboard}
              onCopySvg={handleCopySvgCode}
            />
          )}

          {activeTab === 'pdf' && (
            <PdfExportTab
              project={project}
              activeSlide={activeSlide}
              pdfScope={pdfScope}
              isExporting={isExporting}
              exportProgress={exportProgress}
              onPdfScopeChange={setPdfScope}
              onExport={handleExportPDF}
            />
          )}

          {activeTab === 'code' && (
            <CodeExportTab
              project={project}
              activeSlide={activeSlide}
              codeScope={codeScope}
              tailwindCode={tailwindCode}
              copiedCode={copiedCode}
              onCodeScopeChange={setCodeScope}
              onDownloadCode={handleDownloadCodeFile}
              onCopyCode={handleCopyCode}
            />
          )}

          {activeTab === 'notes' && (
            <NotesExportTab
              project={project}
              copiedOutline={copiedOutline}
              onDownloadSpeakerNotes={handleDownloadSpeakerNotes}
              onCopyOutline={handleCopyOutline}
              onPrintHandout={handlePrintHandout}
              onDownloadDSL={handleDownloadDSL}
              onDownloadJSON={handleDownloadJSON}
              generateOutlineMarkdown={generateOutlineMarkdown}
            />
          )}

          {activeTab === 'html' && (
            <HtmlExportTab
              project={project}
              isExporting={isExporting}
              onDownloadHtml={handleDownloadStandaloneHTML}
              onDownloadZip={handleDownloadWebBundleZip}
            />
          )}

          {activeTab === 'embed' && (
            <EmbedExportTab
              copiedEmbed={copiedEmbed}
              onCopyEmbed={() => {
                const iframeSnippet = `<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">\n  <iframe src="presentation.html" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>\n</div>`;
                navigator.clipboard.writeText(iframeSnippet);
                setCopiedEmbed(true);
                setTimeout(() => setCopiedEmbed(false), 2000);
                confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
              }}
            />
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
