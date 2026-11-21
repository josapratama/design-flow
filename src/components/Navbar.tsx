import React, { useRef } from 'react';
import { DesignMode, DesignProject } from '../types';
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
  Save,
  FolderOpen,
  HelpCircle,
  CheckCircle2,
  RotateCcw,
  Replace,
} from 'lucide-react';

interface NavbarProps {
  title: string;
  mode: DesignMode;
  canUndo: boolean;
  canRedo: boolean;
  isCodeOpen: boolean;
  lastSaved?: Date | null;
  onTitleChange: (newTitle: string) => void;
  onModeChange: (newMode: DesignMode) => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleCode: () => void;
  onOpenTemplates: () => void;
  onOpenPresenter: () => void;
  onOpenExport: () => void;
  onOpenShortcuts?: () => void;
  onOpenFindReplace?: () => void;
  onResetProject?: () => void;
  onSaveProject: () => void;
  onLoadProject: (project: DesignProject) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  mode,
  canUndo,
  canRedo,
  isCodeOpen,
  lastSaved,
  onTitleChange,
  onModeChange,
  onUndo,
  onRedo,
  onToggleCode,
  onOpenTemplates,
  onOpenPresenter,
  onOpenExport,
  onOpenShortcuts,
  onOpenFindReplace,
  onResetProject,
  onSaveProject,
  onLoadProject,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json && Array.isArray(json.slides)) {
          onLoadProject(json);
        } else {
          alert('Format berkas tidak valid. Harap pilih berkas .designflow.json yang benar.');
        }
      } catch (err: any) {
        alert('Gagal memuat berkas proyek: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between select-none z-20 shrink-0">
      {/* Brand & Project Title */}
      <div className="flex items-center gap-3">
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
              className="text-xs text-slate-400 hover:text-slate-200 focus:text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 outline-none w-44 truncate"
              title="Klik untuk mengubah nama dokumen"
            />
          </div>
        </div>

        {/* Save / Open Project File */}
        <div className="flex items-center border-l border-slate-800 pl-2.5 gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Buka File Proyek (.json)"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[11px]"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Buka</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.designflow"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={onSaveProject}
            title="Simpan File Proyek (.designflow.json)"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[11px]"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Simpan</span>
          </button>

          {onResetProject && (
            <button
              onClick={() => {
                if (window.confirm('Reset proyek dan kembali ke template awal? Perubahan yang belum disimpan ke file akan hilang.')) {
                  onResetProject();
                }
              }}
              title="Reset Proyek ke Template Awal"
              className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Auto-Save Status */}
          {lastSaved && (
            <div
              title={`Tersimpan otomatis di browser (${lastSaved.toLocaleTimeString()})`}
              className="hidden xl:flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] text-emerald-400 font-medium"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-slate-400 font-mono text-[9px]">Otomatis</span>
            </div>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center border-l border-slate-800 pl-2.5 gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Urungkan (Ctrl+Z)"
            className="p-1.5 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 rounded-lg transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Ulangi (Ctrl+Y)"
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
            title="Mulai Slideshow Presentasi (F5)"
            className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Presentasikan</span>
            <kbd className="hidden md:inline text-[9px] px-1 py-0.2 bg-emerald-950/60 text-emerald-300 rounded border border-emerald-500/30 font-mono">
              F5
            </kbd>
          </button>
        )}

        <button
          onClick={onToggleCode}
          title="Buka Editor Kode DSL Interaktif"
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
          title="Ekspor Desain (Ctrl+E)"
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor</span>
        </button>

        {onOpenFindReplace && (
          <button
            onClick={onOpenFindReplace}
            title="Cari & Ganti Teks (Ctrl+H)"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors border border-slate-700/60 ml-0.5"
          >
            <Replace className="w-4 h-4 text-slate-300" />
          </button>
        )}

        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            title="Panduan Pintasan Keyboard (?)"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors border border-slate-700/60 ml-0.5"
          >
            <HelpCircle className="w-4 h-4 text-slate-300" />
          </button>
        )}
      </div>
    </header>
  );
};
