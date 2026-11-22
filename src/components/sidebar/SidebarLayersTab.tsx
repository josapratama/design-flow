import React, { useState } from 'react';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Type,
  Square,
  Image as ImageIcon,
  MousePointerClick,
  TextCursorInput,
  BarChart3,
  ToggleLeft,
  Tag,
  Circle,
  Sparkles,
} from 'lucide-react';
import { Slide, ElementType } from '../../types';

interface SidebarLayersTabProps {
  activeSlide: Slide;
  selectedElementIds: string[];
  onSelectElement: (elementId: string, multiSelect: boolean) => void;
  onToggleLock: (elementId: string) => void;
  onToggleHide: (elementId: string) => void;
  onDeleteElement: (elementId: string) => void;
  onReorderElement: (direction: 'front' | 'back' | 'up' | 'down', elementId?: string) => void;
}

export const SidebarLayersTab: React.FC<SidebarLayersTabProps> = ({
  activeSlide,
  selectedElementIds,
  onSelectElement,
  onToggleLock,
  onToggleHide,
  onDeleteElement,
  onReorderElement,
}) => {
  const [layerSearch, setLayerSearch] = useState('');

  const getElementIcon = (type: ElementType) => {
    switch (type) {
      case 'text':
      case 'heading':
        return <Type className="w-3.5 h-3.5 text-indigo-400 shrink-0" />;
      case 'button':
        return <MousePointerClick className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'input':
        return <TextCursorInput className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'metric-card':
      case 'chart':
        return <BarChart3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'toggle':
        return <ToggleLeft className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      case 'badge-shape':
        return <Tag className="w-3.5 h-3.5 text-pink-400 shrink-0" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      case 'circle':
        return <Circle className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      case 'rect':
      case 'card':
        return <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  const sortedLayers = [...activeSlide.elements]
    .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
    .filter(el => {
      if (!layerSearch.trim()) return true;
      const q = layerSearch.toLowerCase();
      return (
        el.name?.toLowerCase().includes(q) ||
        el.content?.toLowerCase().includes(q) ||
        el.type.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Urutan Layer ({activeSlide.elements.length})</span>
        </span>
      </div>

      {/* Filter Search */}
      <input
        type="text"
        placeholder="Cari layer..."
        value={layerSearch}
        onChange={e => setLayerSearch(e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500"
      />

      {/* Layer Item List */}
      <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto">
        {sortedLayers.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-[11px]">
            Tidak ada elemen pada slide ini
          </div>
        ) : (
          sortedLayers.map(el => {
            const isSelected = selectedElementIds.includes(el.id);

            return (
              <div
                key={el.id}
                onClick={() => onSelectElement(el.id, false)}
                className={`group flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {getElementIcon(el.type)}
                  <span className="text-[11px] font-medium truncate">
                    {el.name || el.content || el.type}
                  </span>
                </div>

                {/* Layer Actions */}
                <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                  {/* Move Up in Stack */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onSelectElement(el.id, false);
                      onReorderElement('up', el.id);
                    }}
                    title="Naikkan Layer (Ke Depan)"
                    className="p-1 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                  >
                    <ArrowUp className="w-3 h-3 text-slate-400 hover:text-indigo-300" />
                  </button>

                  {/* Move Down in Stack */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onSelectElement(el.id, false);
                      onReorderElement('down', el.id);
                    }}
                    title="Turunkan Layer (Ke Belakang)"
                    className="p-1 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                  >
                    <ArrowDown className="w-3 h-3 text-slate-400 hover:text-indigo-300" />
                  </button>

                  {/* Hide / Show */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onToggleHide(el.id);
                    }}
                    title={el.hidden ? 'Tampilkan' : 'Sembunyikan'}
                    className="p-1 hover:text-white rounded"
                  >
                    {el.hidden ? (
                      <EyeOff className="w-3 h-3 text-slate-500" />
                    ) : (
                      <Eye className="w-3 h-3 text-emerald-400" />
                    )}
                  </button>

                  {/* Lock / Unlock */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onToggleLock(el.id);
                    }}
                    title={el.locked ? 'Buka Kunci' : 'Kunci Elemen'}
                    className="p-1 hover:text-white rounded"
                  >
                    {el.locked ? (
                      <Lock className="w-3 h-3 text-amber-400" />
                    ) : (
                      <Unlock className="w-3 h-3 text-slate-500" />
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteElement(el.id);
                    }}
                    title="Hapus Elemen"
                    className="p-1 hover:text-rose-400 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
