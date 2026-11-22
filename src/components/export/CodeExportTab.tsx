import React from 'react';
import { Download, Code2, Check } from 'lucide-react';
import { DesignProject, Slide } from '../../types';

interface CodeExportTabProps {
  project: DesignProject;
  activeSlide: Slide;
  codeScope: 'active' | 'deck';
  tailwindCode: string;
  copiedCode: boolean;
  onCodeScopeChange: (scope: 'active' | 'deck') => void;
  onDownloadCode: () => void;
  onCopyCode: () => void;
}

export const CodeExportTab: React.FC<CodeExportTabProps> = ({
  project,
  activeSlide,
  codeScope,
  tailwindCode,
  copiedCode,
  onCodeScopeChange,
  onDownloadCode,
  onCopyCode,
}) => {
  return (
    <div className="space-y-3">
      {/* Code Scope Selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onCodeScopeChange('active')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            codeScope === 'active'
              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <div className="font-bold text-xs truncate">Slide Aktif Saja</div>
          <div className="text-[10px] text-slate-500 truncate">Komponen: {activeSlide.title}</div>
        </button>

        <button
          type="button"
          onClick={() => onCodeScopeChange('deck')}
          className={`p-2.5 rounded-xl border text-left transition-all ${
            codeScope === 'deck'
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
            onClick={onDownloadCode}
            title="Unduh file komponen .tsx langsung ke komputer"
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{codeScope === 'deck' ? 'Unduh Deck .tsx' : 'Unduh Slide .tsx'}</span>
          </button>
          <button
            onClick={onCopyCode}
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
  );
};
