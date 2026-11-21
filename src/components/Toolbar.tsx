import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Trash2,
  Copy,
} from 'lucide-react';

interface ToolbarProps {
  scale: number;
  showGrid: boolean;
  hasSelectedElements: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleGrid: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  scale,
  showGrid,
  hasSelectedElements,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleGrid,
  onDeleteSelected,
  onDuplicateSelected,
}) => {
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

      <span
        onClick={onResetZoom}
        title="Klik untuk reset zoom 100%"
        className="text-xs font-mono font-semibold text-slate-300 px-2 py-0.5 hover:bg-slate-800 rounded cursor-pointer"
      >
        {Math.round(scale * 100)}%
      </span>

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
        title="Sesuaikan dengan Layar (Fit Screen)"
        className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
      >
        <Maximize className="w-4 h-4" />
      </button>

      {/* Grid toggle */}
      <button
        onClick={onToggleGrid}
        title="Tampilkan / Sembunyikan Grid"
        className={`p-1.5 rounded-xl transition-colors ${
          showGrid ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-slate-800 text-slate-400'
        }`}
      >
        <Grid className="w-4 h-4" />
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
