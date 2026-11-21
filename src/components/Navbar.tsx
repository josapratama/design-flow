import React from 'react';
import { DesignMode } from '../types';
import {
  Undo2,
  Redo2,
  Play,
  Code,
  Download,
  Sparkles,
  Presentation,
  Smartphone,
  Palette,
} from 'lucide-react';

interface NavbarProps {
  title: string;
  mode: DesignMode;
  canUndo: boolean;
  canRedo: boolean;
  isCodeOpen: boolean;
  onTitleChange: (newTitle: string) => void;
  onModeChange: (newMode: DesignMode) => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleCode: () => void;
  onOpenTemplates: () => void;
  onOpenPresenter: () => void;
  onOpenExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  mode,
  canUndo,
  canRedo,
  isCodeOpen,
  onTitleChange,
  onModeChange,
  onUndo,
  onRedo,
  onToggleCode,
  onOpenTemplates,
  onOpenPresenter,
  onOpenExport,
}) => {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none z-20 shrink-0">
      {/* Brand & Project Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-black text-sm">
            DF
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-slate-100 tracking-tight">DesignFlow</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400">
                Studio
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              className="text-xs text-slate-400 hover:text-slate-200 focus:text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 outline-none w-52 truncate"
              title="Klik untuk mengubah nama dokumen"
            />
          </div>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center border-l border-slate-800 pl-3 gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Urungkan (Undo)"
            className="p-1.5 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 rounded-lg transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Ulangi (Redo)"
            className="p-1.5 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 rounded-lg transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 gap-1">
        <button
          onClick={() => onModeChange('slide')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            mode === 'slide'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Presentation className="w-3.5 h-3.5" />
          <span>PPT Presentasi</span>
        </button>

        <button
          onClick={() => onModeChange('uiux')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            mode === 'uiux'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>UI/UX Wireframe</span>
        </button>

        <button
          onClick={() => onModeChange('graphic')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            mode === 'graphic'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Grafis Bebas</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenTemplates}
          className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700/60 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Template</span>
        </button>

        {mode === 'slide' && (
          <button
            onClick={onOpenPresenter}
            className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Presentasikan</span>
          </button>
        )}

        <button
          onClick={onToggleCode}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
            isCodeOpen
              ? 'bg-indigo-600 text-white border-indigo-500'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/60'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Kode DSL</span>
        </button>

        <button
          onClick={onOpenExport}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor</span>
        </button>
      </div>
    </header>
  );
};
