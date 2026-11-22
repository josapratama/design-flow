import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { DesignProject, Slide } from '../../types';

interface PdfExportTabProps {
  project: DesignProject;
  activeSlide: Slide;
  pdfScope: 'all' | 'active';
  isExporting: boolean;
  exportProgress: string;
  onPdfScopeChange: (scope: 'all' | 'active') => void;
  onExport: () => void;
}

export const PdfExportTab: React.FC<PdfExportTabProps> = ({
  project,
  activeSlide,
  pdfScope,
  isExporting,
  exportProgress,
  onPdfScopeChange,
  onExport,
}) => {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400 leading-relaxed">
        Pilih cakupan dokumen PDF yang ingin Anda cetak:
      </p>

      {/* PDF Scope Selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onPdfScopeChange('all')}
          className={`p-3 rounded-xl border text-left transition-all ${
            pdfScope === 'all'
              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="font-bold text-xs">Seluruh Slide Deck</div>
          <div className="text-[10px] text-slate-500">Total {project.slides.length} halaman terpadu</div>
        </button>

        <button
          type="button"
          onClick={() => onPdfScopeChange('active')}
          className={`p-3 rounded-xl border text-left transition-all ${
            pdfScope === 'active'
              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="font-bold text-xs truncate">Slide Aktif Saja</div>
          <div className="text-[10px] text-slate-500 truncate">Hanya: {activeSlide.title}</div>
        </button>
      </div>

      <button
        onClick={onExport}
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
  );
};
