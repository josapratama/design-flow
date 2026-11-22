import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Magnet,
  Ruler,
  Trash2,
  Copy,
  RotateCcw,
  RotateCw,
  Shield,
  PanelLeftClose,
  Focus,
} from 'lucide-react';

interface ToolbarProps {
  scale: number;
  showGrid: boolean;
  snapToGrid?: boolean;
  showRulers?: boolean;
  showSafeMargin?: boolean;
  isZenMode?: boolean;
  hasSelectedElements: boolean;
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
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
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
  onDeleteSelected,
  onDuplicateSelected,
}) => {
  const [showZoomMenu, setShowZoomMenu] = React.useState(false);
  const zoomLevels = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="absolute bottom-6 left-6 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800/80 p-1.5 rounded-2xl shadow-2xl backdrop-blur-md select-none z-20">
      {/* Zoom Controls */}
      <button
        onClick={onZoomOut}
        title="Perkecil Kanvas"
        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div className="relative">
        <button
          onClick={() => setShowZoomMenu(!showZoomMenu)}
          title="Pilih level zoom"
          className="text-xs font-mono font-semibold text-slate-300 px-2 py-0.5 hover:bg-slate-800 rounded transition-colors"
        >
          {Math.round(scale * 100)}%
        </button>

        {showZoomMenu && (
          <div className="absolute bottom-full mb-2 left-0 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-30 flex flex-col gap-0.5 min-w-[120px] animate-in fade-in zoom-in-95 duration-100">
            {zoomLevels.map(lvl => (
              <button
                key={lvl}
                onClick={() => {
                  onSetScale?.(lvl);
                  setShowZoomMenu(false);
                }}
                className={`px-2 py-1 text-left rounded text-xs font-mono transition-colors ${
                  Math.round(scale * 100) === Math.round(lvl * 100)
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {Math.round(lvl * 100)}%
              </button>
            ))}
            <div className="h-[1px] bg-slate-800 my-1" />
            <button
              onClick={() => {
                onResetZoom();
                setShowZoomMenu(false);
              }}
              className="px-2 py-1 text-left rounded text-xs text-slate-300 hover:bg-slate-800"
            >
              Fit Screen (Ctrl+0)
            </button>
            {hasSelectedElements && onZoomToSelection && (
              <button
                onClick={() => {
                  onZoomToSelection();
                  setShowZoomMenu(false);
                }}
                className="px-2 py-1 text-left rounded text-xs text-indigo-300 hover:bg-slate-800 font-medium"
              >
                Pilihan (Shift+2)
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
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-800 mx-1" />

      {/* Fit to screen */}
      <button
        onClick={onResetZoom}
        title="Sesuaikan dengan Layar (Fit Screen - Ctrl+0)"
        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
      >
        <Maximize className="w-4 h-4" />
      </button>

      {/* Zoom to selection button when elements selected */}
      {hasSelectedElements && onZoomToSelection && (
        <button
          onClick={onZoomToSelection}
          title="Zoom ke Elemen Terpilih (Shift+2)"
          className="p-1.5 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 rounded-xl transition-colors"
        >
          <Focus className="w-4 h-4" />
        </button>
      )}

      {/* Grid toggle */}
      <button
        onClick={onToggleGrid}
        title="Tampilkan / Sembunyikan Titik Grid"
        className={`p-1.5 rounded-xl transition-colors ${
          showGrid ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
        }`}
      >
        <Grid className="w-4 h-4" />
      </button>

      {/* Snap to Grid toggle */}
      {onToggleSnapToGrid && (
        <button
          onClick={onToggleSnapToGrid}
          title={`Snap ke Grid: ${snapToGrid ? 'Aktif' : 'Nonaktif'}`}
          className={`p-1.5 rounded-xl transition-colors ${
            snapToGrid ? 'bg-indigo-600/20 text-indigo-400 font-bold' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Magnet className="w-4 h-4" />
        </button>
      )}

      {/* Rulers toggle */}
      {onToggleRulers && (
        <button
          onClick={onToggleRulers}
          title="Tampilkan / Sembunyikan Penggaris Piksel (Shift+R)"
          className={`p-1.5 rounded-xl transition-colors ${
            showRulers ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Ruler className="w-4 h-4" />
        </button>
      )}

      {/* Safe Margins toggle */}
      {onToggleSafeMargin && (
        <button
          onClick={onToggleSafeMargin}
          title="Batas Area Aman / Safe Margin (Shift+M)"
          className={`p-1.5 rounded-xl transition-colors ${
            showSafeMargin ? 'bg-emerald-600/20 text-emerald-400' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <Shield className="w-4 h-4" />
        </button>
      )}

      {/* Zen / Focus Canvas Mode Toggle */}
      {onToggleZenMode && (
        <button
          onClick={onToggleZenMode}
          title={`Mode Fokus Kanvas (Shift+F): ${isZenMode ? 'Aktif' : 'Nonaktif'}`}
          className={`p-1.5 rounded-xl transition-colors ${
            isZenMode ? 'bg-purple-600/30 text-purple-300 font-bold' : 'hover:bg-slate-800 text-slate-400'
          }`}
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      )}

      {/* Undo & Redo History Controls */}
      <div className="h-4 w-[1px] bg-slate-800 mx-1" />

      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Urungkan Tindakan (Ctrl+Z)"
        className="p-1.5 hover:bg-slate-800 disabled:opacity-25 disabled:hover:bg-transparent text-slate-400 hover:text-white rounded-xl transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Ulangi Tindakan (Ctrl+Y)"
        className="p-1.5 hover:bg-slate-800 disabled:opacity-25 disabled:hover:bg-transparent text-slate-400 hover:text-white rounded-xl transition-colors"
      >
        <RotateCw className="w-4 h-4" />
      </button>

      {/* Contextual actions for selected element */}
      {hasSelectedElements && (
        <>
          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          <button
            onClick={onDuplicateSelected}
            title="Duplikat Elemen Terpilih"
            className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={onDeleteSelected}
            title="Hapus Elemen Terpilih"
            className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};
