import React from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Printer,
  FileCode,
  HardDrive,
  BookOpen,
  FileText,
} from 'lucide-react';
import { DesignProject } from '../../types';

interface NotesExportTabProps {
  project: DesignProject;
  copiedOutline: boolean;
  onDownloadSpeakerNotes: () => void;
  onCopyOutline: () => void;
  onPrintHandout: () => void;
  onDownloadDSL: () => void;
  onDownloadJSON: () => void;
  generateOutlineMarkdown: () => string;
}

export const NotesExportTab: React.FC<NotesExportTabProps> = ({
  project,
  copiedOutline,
  onDownloadSpeakerNotes,
  onCopyOutline,
  onPrintHandout,
  onDownloadDSL,
  onDownloadJSON,
  generateOutlineMarkdown,
}) => {
  return (
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
              onClick={onDownloadSpeakerNotes}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh .md</span>
            </button>
            <button
              onClick={onCopyOutline}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
              title="Salin Markdown Outline ke Clipboard"
            >
              {copiedOutline ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedOutline ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onPrintHandout}
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
            onClick={onDownloadDSL}
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
            onClick={onDownloadJSON}
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
            onClick={onCopyOutline}
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
  );
};
