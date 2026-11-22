import React from 'react';
import { Sparkles, Download, Loader2 } from 'lucide-react';
import { DesignProject } from '../../types';

interface PptxExportTabProps {
  project: DesignProject;
  isExporting: boolean;
  exportProgress: string;
  onExport: () => void;
}

export const PptxExportTab: React.FC<PptxExportTabProps> = ({
  project,
  isExporting,
  exportProgress,
  onExport,
}) => {
  return (
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
        onClick={onExport}
        disabled={isExporting}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
      >
        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        <span>{isExporting ? (exportProgress || 'Menyusun Berkas PPTX...') : 'Unduh PowerPoint (.pptx)'}</span>
      </button>
    </div>
  );
};
