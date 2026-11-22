import React, { useState, useRef, useEffect } from 'react';
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
  BarChart2,
  MoreHorizontal,
  ChevronDown,
  Layers,
  Sliders,
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
  onOpenStats?: () => void;
  onResetProject?: () => void;
  onSaveProject: () => void;
  onLoadProject: (project: DesignProject) => void;
  // Optional toggles for mobile panels
  onToggleMobileLeft?: () => void;
  onToggleMobileRight?: () => void;
  isMobileLeftOpen?: boolean;
  isMobileRightOpen?: boolean;
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
  onOpenStats,
  onResetProject,
  onSaveProject,
  onLoadProject,
  onToggleMobileLeft,
  onToggleMobileRight,
  isMobileLeftOpen = false,
  isMobileRightOpen = false,
}) => {
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setIsFileMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json && Array.isArray(json.slides)) {
          onLoadProject(json);
          setIsFileMenuOpen(false);
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
    <header className="h-14 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-4 flex items-center justify-between select-none z-30 shrink-0 relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.designflow"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* LEFT SECTION: Brand, File Menu, Title, Undo/Redo */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/25 text-white font-black text-xs sm:text-sm tracking-wider">
            DF
          </div>
          <div className="hidden md:flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-xs font-bold text-slate-100 tracking-tight">DesignFlow</span>
              <span className="text-[9px] font-semibold px-1 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Project Dropdown / File Menu */}
        <div ref={fileMenuRef} className="relative shrink-0">
          <button
            onClick={() => setIsFileMenuOpen(prev => !prev)}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              isFileMenuOpen
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Menu Berkas & Proyek"
          >
            <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Berkas</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isFileMenuOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-800/80 mb-1">
                Kelola Dokumen
              </div>
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsFileMenuOpen(false);
                }}
                className="w-full px-2.5 py-1.5 text-left rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Buka Proyek (.json)</span>
              </button>
              <button
                onClick={() => {
                  onSaveProject();
                  setIsFileMenuOpen(false);
                }}
                className="w-full px-2.5 py-1.5 text-left rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                <div className="flex-1 flex items-center justify-between">
                  <span>Simpan Proyek</span>
                  <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+S</kbd>
                </div>
              </button>

              {onResetProject && (
                <button
                  onClick={() => {
                    setIsFileMenuOpen(false);
                    if (window.confirm('Reset proyek dan kembali ke template awal? Perubahan yang belum disimpan akan hilang.')) {
                      onResetProject();
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-left rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 transition-colors mt-0.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Template Awal</span>
                </button>
              )}

              {lastSaved && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 px-2.5 py-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Auto-save: {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Editable Title Input */}
        <div className="relative min-w-0 max-w-[140px] sm:max-w-[200px] md:max-w-[260px]">
          <input
            type="text"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            className="w-full text-xs font-medium text-slate-300 hover:text-white focus:text-white bg-transparent hover:bg-slate-800/40 focus:bg-slate-900 border border-transparent hover:border-slate-800 focus:border-indigo-500/80 rounded-lg px-2 py-1 outline-none truncate transition-all"
            title="Klik untuk mengubah nama dokumen"
          />
        </div>

        {/* Undo / Redo Buttons */}
        <div className="hidden sm:flex items-center gap-0.5 border-l border-slate-800/80 pl-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Urungkan (Ctrl+Z)"
            className="p-1.5 hover:bg-slate-800 disabled:opacity-25 disabled:hover:bg-transparent text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Ulangi (Ctrl+Y)"
            className="p-1.5 hover:bg-slate-800 disabled:opacity-25 disabled:hover:bg-transparent text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CENTER SECTION: Compact Segmented Mode Switcher */}
      <div className="hidden lg:flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 gap-0.5 shadow-inner">
        {[
          { id: 'slide', label: 'Presentasi', icon: Presentation },
          { id: 'uiux', label: 'UI/UX Wireframe', icon: Smartphone },
          { id: 'graphic', label: 'Grafis Bebas', icon: Palette },
        ].map(item => {
          const Icon = item.icon;
          const isActive = mode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onModeChange(item.id as DesignMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* RIGHT SECTION: Essential Actions & Overflow "..." Menu */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Mobile Left & Right Panel Toggles (if provided) */}
        {onToggleMobileLeft && (
          <button
            onClick={onToggleMobileLeft}
            className={`p-1.5 rounded-lg border text-xs lg:hidden transition-colors ${
              isMobileLeftOpen
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Panel Elemen"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        )}

        {onToggleMobileRight && (
          <button
            onClick={onToggleMobileRight}
            className={`p-1.5 rounded-lg border text-xs lg:hidden transition-colors ${
              isMobileRightOpen
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Panel Properti"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        )}

        {/* 1. Templates Button */}
        <button
          onClick={onOpenTemplates}
          className="px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800/80 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-800 transition-colors shadow-sm"
          title="Buka Pustaka Template"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Template</span>
        </button>

        {/* 2. Presenter Button (Slide Mode only) */}
        {mode === 'slide' && (
          <button
            onClick={onOpenPresenter}
            title="Mulai Slideshow Presentasi (F5)"
            className="px-2.5 sm:px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Presentasi</span>
            <kbd className="hidden md:inline text-[9px] px-1 py-0.2 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-500/30 font-mono">
              F5
            </kbd>
          </button>
        )}

        {/* 3. Export Button (Primary CTA) */}
        <button
          onClick={onOpenExport}
          title="Ekspor Desain (Ctrl+E)"
          className="px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor</span>
        </button>

        {/* 4. Overflow "..." (More Options) Dropdown */}
        <div ref={moreMenuRef} className="relative">
          <button
            onClick={() => setIsMoreMenuOpen(prev => !prev)}
            title="Opsi & Alat Tambahan"
            className={`p-1.5 rounded-xl border transition-colors ${
              isMoreMenuOpen || isCodeOpen
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMoreMenuOpen && (
            <div className="absolute top-full right-0 mt-1.5 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-800/80 mb-1">
                Alat & Ekstensi
              </div>

              {/* Code DSL Toggle */}
              <button
                onClick={() => {
                  onToggleCode();
                  setIsMoreMenuOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 text-left rounded-lg text-xs flex items-center justify-between transition-colors ${
                  isCodeOpen
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Editor Kode DSL</span>
                </div>
                {isCodeOpen && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </button>

              {/* Stats & Health */}
              {onOpenStats && (
                <button
                  onClick={() => {
                    onOpenStats();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 text-left rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Statistik & Durasi Dek</span>
                </button>
              )}

              {/* Find & Replace */}
              {onOpenFindReplace && (
                <button
                  onClick={() => {
                    onOpenFindReplace();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 text-left rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Replace className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cari & Ganti Teks</span>
                  </div>
                  <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+H</kbd>
                </button>
              )}

              {/* Keyboard Shortcuts */}
              {onOpenShortcuts && (
                <button
                  onClick={() => {
                    onOpenShortcuts();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 text-left rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between transition-colors border-t border-slate-800/80 mt-1 pt-1.5"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pintasan Keyboard</span>
                  </div>
                  <kbd className="text-[10px] text-slate-500 font-mono">?</kbd>
                </button>
              )}

              {/* Mode switch for smaller screens */}
              <div className="lg:hidden border-t border-slate-800/80 mt-1 pt-1.5">
                <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-500 uppercase">
                  Mode Kanvas
                </div>
                {[
                  { id: 'slide', label: 'Presentasi' },
                  { id: 'uiux', label: 'UI/UX Wireframe' },
                  { id: 'graphic', label: 'Grafis Bebas' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onModeChange(item.id as DesignMode);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`w-full px-2.5 py-1 text-left rounded-lg text-xs flex items-center justify-between ${
                      mode === item.id ? 'text-indigo-400 font-bold bg-slate-800' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    {mode === item.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
