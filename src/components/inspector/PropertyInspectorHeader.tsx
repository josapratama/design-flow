import React from 'react';
import { DesignElement } from '../../types';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Boxes,
  Paintbrush,
  CopyCheck,
  Code,
  Copy,
  Trash2,
} from 'lucide-react';

interface PropertyInspectorHeaderProps {
  element: DesignElement;
  selectedCount: number;
  copiedStyleActive: boolean;
  onToggleLock?: (elementId: string) => void;
  onToggleHide?: (elementId: string) => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onCopyStyle: () => void;
  onPasteStyle: () => void;
  onCopyJSX: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const PropertyInspectorHeader: React.FC<PropertyInspectorHeaderProps> = ({
  element,
  selectedCount,
  copiedStyleActive,
  onToggleLock,
  onToggleHide,
  onGroup,
  onUngroup,
  onCopyStyle,
  onPasteStyle,
  onCopyJSX,
  onDuplicate,
  onDelete,
}) => {
  return (
    <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
      <div className="flex items-center gap-2 truncate">
        <span className="text-xs font-bold text-slate-200 truncate capitalize">
          {element.name || element.type}
        </span>
        {selectedCount > 1 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
            +{selectedCount - 1} lainnya
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* Lock / Unlock */}
        {onToggleLock && (
          <button
            onClick={() => onToggleLock(element.id)}
            title={element.locked ? 'Buka Kunci' : 'Kunci Elemen'}
            className={`p-1.5 rounded-lg transition-colors ${
              element.locked ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            {element.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Hide / Show */}
        {onToggleHide && (
          <button
            onClick={() => onToggleHide(element.id)}
            title={element.hidden ? 'Tampilkan' : 'Sembunyikan'}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            {element.hidden ? (
              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>
        )}

        {/* Group Multiple Elements */}
        {selectedCount > 1 && onGroup && (
          <button
            onClick={onGroup}
            title="Kelompokkan Elemen Terpilih (Ctrl+G)"
            className="p-1.5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 rounded-lg transition-colors"
          >
            <Boxes className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Ungroup If Grouped */}
        {element.groupId && onUngroup && (
          <button
            onClick={onUngroup}
            title="Pisahkan Elemen dari Grup (Ctrl+Shift+G)"
            className="p-1.5 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 rounded-lg transition-colors"
          >
            <Boxes className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Format Painter: Salin Gaya */}
        <button
          onClick={onCopyStyle}
          title="Salin Gaya Visual Elemen (Ctrl+Alt+C)"
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors"
        >
          <Paintbrush className="w-3.5 h-3.5" />
        </button>

        {/* Format Painter: Tempel Gaya */}
        {copiedStyleActive && (
          <button
            onClick={onPasteStyle}
            title="Tempelkan Gaya Visual yang Disalin (Ctrl+Alt+V)"
            className="p-1.5 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 rounded-lg transition-colors animate-pulse"
          >
            <CopyCheck className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Salin Kode JSX */}
        <button
          onClick={onCopyJSX}
          title="Salin Kode Komponen React 19 + Tailwind JSX"
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onDuplicate}
          title="Duplikat Elemen (Ctrl+D)"
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          title="Hapus Elemen (Delete)"
          className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
