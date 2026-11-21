import React from 'react';
import { DesignElement } from '../types';
import {
  Trash2,
  Copy,
  BringToFront,
  SendToBack,
  ArrowUp,
  ArrowDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface PropertyInspectorProps {
  element: DesignElement | null;
  onUpdate: (elementId: string, updates: Partial<DesignElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onReorder: (direction: 'front' | 'back' | 'up' | 'down') => void;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
  onReorder,
}) => {
  if (!element) {
    return (
      <aside className="w-72 h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-center text-slate-500 select-none shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
          ⚙️
        </div>
        <p className="text-xs font-medium text-slate-400">Tidak ada elemen yang dipilih</p>
        <p className="text-[11px] text-slate-500 mt-1">
          Klik elemen di kanvas atau pilih dari palette di sebelah kiri.
        </p>
      </aside>
    );
  }

  const handleChange = (field: keyof DesignElement, val: any) => {
    onUpdate(element.id, { [field]: val });
  };

  return (
    <aside className="w-72 h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 select-none z-10">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <span className="text-xs font-bold text-slate-200 truncate capitalize">
          {element.name || element.type}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicate}
            title="Duplikat Elemen"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="Hapus Elemen"
            className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-300">
        {/* Posisi & Dimensi */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Ukuran & Posisi
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">X (Posisi)</label>
              <input
                type="number"
                value={element.x}
                onChange={e => handleChange('x', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Y (Posisi)</label>
              <input
                type="number"
                value={element.y}
                onChange={e => handleChange('y', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Lebar (W)</label>
              <input
                type="number"
                value={element.width}
                onChange={e => handleChange('width', Math.max(10, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Tinggi (H)</label>
              <input
                type="number"
                value={element.height}
                onChange={e => handleChange('height', Math.max(10, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Konten Teks */}
        {(element.content !== undefined ||
          ['heading', 'text', 'button', 'card'].includes(element.type)) && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Konten Teks
            </span>
            <textarea
              rows={3}
              value={element.content || ''}
              onChange={e => handleChange('content', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-indigo-500 text-xs"
              placeholder="Ketik teks konten..."
            />
          </div>
        )}

        {/* Tipografi */}
        {(element.fontSize !== undefined ||
          ['heading', 'text', 'button'].includes(element.type)) && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Tipografi
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Ukuran Font</label>
                <input
                  type="number"
                  value={element.fontSize || 16}
                  onChange={e => handleChange('fontSize', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Ketebalan</label>
                <select
                  value={element.fontWeight || 'normal'}
                  onChange={e => handleChange('fontWeight', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-xs"
                >
                  <option value="normal">Reguler (400)</option>
                  <option value="medium">Medium (500)</option>
                  <option value="semibold">Semibold (600)</option>
                  <option value="bold">Tebal (700)</option>
                  <option value="extrabold">Ekstra Tebal (800)</option>
                </select>
              </div>
            </div>

            {/* Alignment */}
            <div className="flex border border-slate-800 rounded-lg p-1 gap-1 bg-slate-950">
              <button
                onClick={() => handleChange('textAlign', 'left')}
                className={`flex-1 py-1 rounded flex justify-center ${
                  element.textAlign === 'left' || !element.textAlign
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleChange('textAlign', 'center')}
                className={`flex-1 py-1 rounded flex justify-center ${
                  element.textAlign === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleChange('textAlign', 'right')}
                className={`flex-1 py-1 rounded flex justify-center ${
                  element.textAlign === 'right' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Warna & Gaya Visual */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Warna & Tampilan
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Warna Isi (Fill)</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                <input
                  type="color"
                  value={element.fill || '#1e293b'}
                  onChange={e => handleChange('fill', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[11px] font-mono text-slate-300">
                  {element.fill || '#1e293b'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Warna Teks</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                <input
                  type="color"
                  value={element.color || '#ffffff'}
                  onChange={e => handleChange('color', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[11px] font-mono text-slate-300">
                  {element.color || '#ffffff'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Sudut (Radius)</label>
              <input
                type="number"
                value={element.borderRadius || 0}
                onChange={e => handleChange('borderRadius', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Transparansi (Opacity)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={element.opacity !== undefined ? element.opacity : 1}
                onChange={e => handleChange('opacity', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Susunan Layer */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Urutan Layer (Z-Index)
          </span>
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => onReorder('front')}
              title="Paling Depan"
              className="p-2 bg-slate-800/80 hover:bg-slate-800 rounded-lg flex justify-center text-slate-300 transition-colors"
            >
              <BringToFront className="w-4 h-4" />
            </button>
            <button
              onClick={() => onReorder('up')}
              title="Maju Satu Tingkat"
              className="p-2 bg-slate-800/80 hover:bg-slate-800 rounded-lg flex justify-center text-slate-300 transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onReorder('down')}
              title="Mundur Satu Tingkat"
              className="p-2 bg-slate-800/80 hover:bg-slate-800 rounded-lg flex justify-center text-slate-300 transition-colors"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => onReorder('back')}
              title="Paling Belakang"
              className="p-2 bg-slate-800/80 hover:bg-slate-800 rounded-lg flex justify-center text-slate-300 transition-colors"
            >
              <SendToBack className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
