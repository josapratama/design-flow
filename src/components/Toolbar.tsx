import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Magnet,
  Ruler,
  Trash2,
  Copy,
  Shield,
  PanelLeftClose,
  Focus,
  LayoutGrid,
  Boxes,
  SlidersHorizontal,
  Check,
} from 'lucide-react';

interface ToolbarProps {
  scale: number;
  showGrid: boolean;
  snapToGrid?: boolean;
  showRulers?: boolean;
  showSafeMargin?: boolean;
  isZenMode?: boolean;
  hasSelectedElements: boolean;
  selectedCount?: number;
  isGrouped?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onZoomToSelection?: () => void;
  onSetScale?: (scale: number) => void;
  onToggleGrid: () => void;
  onToggleSnapToGrid?: () => void;
  onToggleRulers?: () => void;
  onToggleSafeMargin?: () => void;
  onToggleZenMode?: () => void;
  onOpenSlideSorter?: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  scale,
  showGrid,
  snapToGrid = false,
  showRulers = true,
  showSafeMargin = false,
  isZenMode = false,
  hasSelectedElements,
  selectedCount = 0,
  isGrouped = false,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onZoomToSelection,
  onSetScale,
  onToggleGrid,
  onToggleSnapToGrid,
  onToggleRulers,
  onToggleSafeMargin,
  onToggleZenMode,
  onOpenSlideSorter,
  onGroup,
  onUngroup,
  onDeleteSelected,
  onDuplicateSelected,
}) => {
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const zoomLevels = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const zoomMenuRef = useRef<HTMLDivElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (zoomMenuRef.current && !zoomMenuRef.current.contains(e.target as Node)) {
        setShowZoomMenu(false);
      }
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
        setShowViewMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="absolute bottom-5 left-5 flex items-center gap-1 bg-slate-900/90 border border-slate-800/90 p-1.5 rounded-2xl shadow-2xl backdrop-blur-xl select-none z-20 max-w-[calc(100vw-2.5rem)] transition-all">
      {/* 1. Zoom Controls Group */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onZoomOut}
          title="Perkecil Kanvas"
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <div ref={zoomMenuRef} className="relative">
          <button
            onClick={() => {
              setShowZoomMenu(!showZoomMenu);
              setShowViewMenu(false);
            }}
            title="Pilih level perbesaran kanvas"
            className="text-xs font-mono font-medium text-slate-300 px-2 py-1 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {Math.round(scale * 100)}%
          </button>

          {showZoomMenu && (
            <div className="absolute bottom-full mb-2 left-0 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-30 flex flex-col gap-0.5 min-w-[130px] animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Tingkat Zoom
              </div>
              {zoomLevels.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => {
                    onSetScale?.(lvl);
                    setShowZoomMenu(false);
                  }}
                  className={`px-2 py-1 text-left rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                    Math.round(scale * 100) === Math.round(lvl * 100)
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{Math.round(lvl * 100)}%</span>
                  {Math.round(scale * 100) === Math.round(lvl * 100) && <Check className="w-3 h-3" />}
                </button>
              ))}
              <div className="h-[1px] bg-slate-800 my-1" />
              <button
                onClick={() => {
                  onResetZoom();
                  setShowZoomMenu(false);
                }}
                className="px-2 py-1 text-left rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between"
              >
                <span>Sesuaikan Layar</span>
                <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+0</kbd>
              </button>
              {hasSelectedElements && onZoomToSelection && (
                <button
                  onClick={() => {
                    onZoomToSelection();
                    setShowZoomMenu(false);
                  }}
                  className="px-2 py-1 text-left rounded-lg text-xs text-indigo-300 hover:bg-slate-800 font-medium"
                >
                  Fokus Pilihan (Shift+2)
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onZoomIn}
          title="Perbesar Kanvas"
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onResetZoom}
          title="Sesuaikan Layar (Ctrl+0)"
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="h-4 w-[1px] bg-slate-800 mx-1" />

      {/* 2. Consolidated View Options Popover (All auxiliary display controls into 1 neat menu) */}
      <div ref={viewMenuRef} className="relative">
        <button
          onClick={() => {
            setShowViewMenu(!showViewMenu);
            setShowZoomMenu(false);
          }}
          title="Pengaturan Tampilan & Kisi Kanvas"
          className={`px-2 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
            showViewMenu || showGrid || showSafeMargin || snapToGrid || isZenMode
              ? 'bg-slate-800 text-indigo-300'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Tampilan</span>
          {(showGrid || snapToGrid || showSafeMargin) && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          )}
        </button>

        {showViewMenu && (
          <div className="absolute bottom-full mb-2 left-0 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-30 flex flex-col gap-1 w-56 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
            <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800/80 mb-1">
              Panduan Visual Kanvas
            </div>

            {/* Grid Toggle */}
            <button
              onClick={onToggleGrid}
              className={`w-full px-2.5 py-1.5 text-left rounded-xl text-xs flex items-center justify-between transition-colors ${
                showGrid ? 'bg-indigo-600/15 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid className="w-3.5 h-3.5" />
                <span>Titik Kisi Grid</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${showGrid ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
                {showGrid ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Snap To Grid Toggle */}
            {onToggleSnapToGrid && (
              <button
                onClick={onToggleSnapToGrid}
                className={`w-full px-2.5 py-1.5 text-left rounded-xl text-xs flex items-center justify-between transition-colors ${
                  snapToGrid ? 'bg-indigo-600/15 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Magnet className="w-3.5 h-3.5" />
                  <span>Magnet Snap to Grid</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${snapToGrid ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
                  {snapToGrid ? 'ON' : 'OFF'}
                </span>
              </button>
            )}

            {/* Rulers Toggle */}
            {onToggleRulers && (
              <button
                onClick={onToggleRulers}
                className={`w-full px-2.5 py-1.5 text-left rounded-xl text-xs flex items-center justify-between transition-colors ${
                  showRulers ? 'bg-indigo-600/15 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Penggaris Piksel</span>
                </div>
                <kbd className="text-[10px] text-slate-500 font-mono">Shift+R</kbd>
              </button>
            )}

            {/* Safe Margin Toggle */}
            {onToggleSafeMargin && (
              <button
                onClick={onToggleSafeMargin}
                className={`w-full px-2.5 py-1.5 text-left rounded-xl text-xs flex items-center justify-between transition-colors ${
                  showSafeMargin ? 'bg-emerald-600/15 text-emerald-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Batas Aman / Margin</span>
                </div>
                <kbd className="text-[10px] text-slate-500 font-mono">Shift+M</kbd>
              </button>
            )}

            {/* Focus / Zen Mode */}
            {onToggleZenMode && (
              <button
                onClick={() => {
                  onToggleZenMode();
                  setShowViewMenu(false);
                }}
                className={`w-full px-2.5 py-1.5 text-left rounded-xl text-xs flex items-center justify-between transition-colors border-t border-slate-800/80 mt-1 pt-1.5 ${
                  isZenMode ? 'bg-purple-600/20 text-purple-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <PanelLeftClose className="w-3.5 h-3.5 text-purple-400" />
                  <span>Mode Fokus Kanvas</span>
                </div>
                <kbd className="text-[10px] text-slate-500 font-mono">Shift+F</kbd>
              </button>
            )}

            {/* Slide Sorter Light Table */}
            {onOpenSlideSorter && (
              <button
                onClick={() => {
                  onOpenSlideSorter();
                  setShowViewMenu(false);
                }}
                className="w-full px-2.5 py-1.5 text-left rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Pengatur Kisi Slide</span>
                </div>
                <kbd className="text-[10px] text-slate-500 font-mono">Alt+S</kbd>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Contextual Actions for Selected Elements (Only appears when items are selected) */}
      {hasSelectedElements && (
        <>
          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Group / Ungroup */}
          {selectedCount > 1 && onGroup && (
            <button
              onClick={onGroup}
              title="Kelompokkan Elemen Terpilih (Ctrl+G)"
              className="p-1.5 hover:bg-emerald-600/20 text-emerald-400 rounded-xl transition-colors"
            >
              <Boxes className="w-3.5 h-3.5" />
            </button>
          )}

          {isGrouped && onUngroup && (
            <button
              onClick={onUngroup}
              title="Pisahkan Elemen dari Grup (Ctrl+Shift+G)"
              className="p-1.5 hover:bg-amber-500/20 text-amber-400 rounded-xl transition-colors"
            >
              <Boxes className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Duplicate */}
          <button
            onClick={onDuplicateSelected}
            title="Duplikat Elemen Terpilih (Ctrl+D)"
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={onDeleteSelected}
            title="Hapus Elemen Terpilih (Delete)"
            className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
};
