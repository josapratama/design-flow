import React from 'react';

interface PresenterPenToolbarProps {
  isPenActive: boolean;
  penColor: string;
  setPenColor: (color: string) => void;
  penWidth: number;
  setPenWidth: (width: number) => void;
  undoPenStroke: () => void;
  clearPenCanvas: () => void;
}

export const PresenterPenToolbar: React.FC<PresenterPenToolbarProps> = ({
  isPenActive,
  penColor,
  setPenColor,
  penWidth,
  setPenWidth,
  undoPenStroke,
  clearPenCanvas,
}) => {
  if (!isPenActive) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-slate-700/80 shadow-2xl rounded-2xl px-4 py-2 flex items-center gap-3 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-200">
      <span className="text-[11px] font-semibold text-slate-300">Pena:</span>
      <div className="flex items-center gap-1.5 border-r border-slate-800 pr-3">
        {[
          { color: '#facc15', label: 'Kuning Stabilo' },
          { color: '#f43f5e', label: 'Merah Koreksi' },
          { color: '#38bdf8', label: 'Cyan Terang' },
          { color: '#34d399', label: 'Emerald' },
          { color: '#ffffff', label: 'Putih' },
        ].map(sw => (
          <button
            key={sw.color}
            type="button"
            onClick={() => setPenColor(sw.color)}
            title={sw.label}
            className={`w-5 h-5 rounded-full border transition-all ${
              penColor === sw.color
                ? 'scale-125 border-white ring-2 ring-white/40 shadow-sm'
                : 'border-slate-700 hover:scale-110'
            }`}
            style={{ backgroundColor: sw.color }}
          />
        ))}
      </div>

      <div className="flex items-center gap-1 border-r border-slate-800 pr-3">
        {[
          { width: 2, label: 'Tipis' },
          { width: 4, label: 'Sedang' },
          { width: 8, label: 'Stabilo' },
        ].map(sz => (
          <button
            key={sz.width}
            type="button"
            onClick={() => setPenWidth(sz.width)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              penWidth === sz.width ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            {sz.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={undoPenStroke}
          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium transition-colors"
          title="Undo Coretan (U)"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={clearPenCanvas}
          className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-medium transition-colors"
          title="Hapus Semua Coretan (C)"
        >
          Bersihkan
        </button>
      </div>
    </div>
  );
};
