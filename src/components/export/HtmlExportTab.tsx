import React from 'react';
import { Sparkles, Download, Archive } from 'lucide-react';
import { DesignProject } from '../../types';

interface HtmlExportTabProps {
  project: DesignProject;
  isExporting: boolean;
  onDownloadHtml: () => void;
  onDownloadZip: () => void;
}

export const HtmlExportTab: React.FC<HtmlExportTabProps> = ({
  project,
  isExporting,
  onDownloadHtml,
  onDownloadZip,
}) => {
  return (
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
          onClick={onDownloadHtml}
          disabled={isExporting}
          className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>Unduh 1 Berkas HTML (.html)</span>
        </button>

        <button
          onClick={onDownloadZip}
          disabled={isExporting}
          className="py-3 px-4 bg-slate-800 hover:bg-slate-700 hover:border-indigo-500/60 border border-slate-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
        >
          <Archive className="w-4 h-4 text-cyan-400" />
          <span>Unduh Paket Lengkap (.zip)</span>
        </button>
      </div>
    </div>
  );
};
