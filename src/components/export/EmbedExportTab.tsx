import React from 'react';
import { Sparkles, Code2, Copy, Check } from 'lucide-react';

interface EmbedExportTabProps {
  copiedEmbed: boolean;
  onCopyEmbed: () => void;
}

export const EmbedExportTab: React.FC<EmbedExportTabProps> = ({
  copiedEmbed,
  onCopyEmbed,
}) => {
  const embedCode = `<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">\n  <iframe src="presentation.html" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>\n</div>`;

  return (
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
            onClick={onCopyEmbed}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedEmbed ? 'Tersalin ke Clipboard!' : 'Salin Kode Iframe'}</span>
          </button>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 select-text overflow-x-auto leading-relaxed">
          <code>{embedCode}</code>
        </div>
      </div>
    </div>
  );
};
