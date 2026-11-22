import React from 'react';
import { DesignElement, Slide } from '../../types';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  ArrowLeftRight,
  ArrowUpDown,
  Lock,
  Unlock,
  RotateCw,
  BringToFront,
  SendToBack,
  ArrowUp,
  ArrowDown,
  Link,
  Sparkles,
} from 'lucide-react';

interface ElementLayoutTabProps {
  element: DesignElement;
  slides: Slide[];
  selectedCount: number;
  isRatioLocked: boolean;
  setIsRatioLocked: (locked: boolean) => void;
  onUpdateElement: (elementId: string, updates: Partial<DesignElement>) => void;
  handleChange: (field: keyof DesignElement, val: any) => void;
  onAlignElement: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistributeElements?: (direction: 'horizontal' | 'vertical') => void;
  onTidyUpElements?: () => void;
  onBatchUpdateElements?: (updater: (el: DesignElement) => Partial<DesignElement>) => void;
  onReorder: (direction: 'front' | 'back' | 'up' | 'down') => void;
  showToast: (msg: string) => void;
}

export const ElementLayoutTab: React.FC<ElementLayoutTabProps> = ({
  element,
  slides,
  selectedCount,
  isRatioLocked,
  setIsRatioLocked,
  onUpdateElement,
  handleChange,
  onAlignElement,
  onDistributeElements,
  onTidyUpElements,
  onBatchUpdateElements,
  onReorder,
  showToast,
}) => {
  return (
    <div className="space-y-4">
      {/* Bilah Perataan Cepat (Smart Alignment Tools) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Perataan (Align)
          </span>
          <button
            type="button"
            onClick={() => {
              onAlignElement('center');
              onAlignElement('middle');
            }}
            title="Pusatkan Elemen Tepat di Tengah Kanvas (Horizontal & Vertikal)"
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline"
          >
            <span>Pusatkan H+V</span>
          </button>
        </div>
        <div className="grid grid-cols-6 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onAlignElement('left')}
            title="Rata Kiri"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded flex justify-center"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onAlignElement('center')}
            title="Rata Tengah Horizontal"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded flex justify-center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onAlignElement('right')}
            title="Rata Kanan"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded flex justify-center"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onAlignElement('top')}
            title="Rata Atas"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded flex justify-center"
          >
            <AlignStartVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onAlignElement('middle')}
            title="Rata Tengah Vertikal"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded flex justify-center"
          >
            <AlignCenterVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onAlignElement('bottom')}
            title="Rata Bawah"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded flex justify-center"
          >
            <AlignEndVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Smart Tidy Up / Distribusi Spasi Merata */}
      {selectedCount >= 2 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Penataan Cepat
            </span>
            {onTidyUpElements && (
              <button
                type="button"
                onClick={onTidyUpElements}
                className="px-2 py-0.5 rounded bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Rapikan Grid (Auto)</span>
              </button>
            )}
          </div>
          {selectedCount >= 3 && onDistributeElements && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onDistributeElements('horizontal')}
                className="p-2 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-lg flex items-center justify-center gap-1.5 text-slate-300 hover:text-white text-xs"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rata Horizontal</span>
              </button>
              <button
                onClick={() => onDistributeElements('vertical')}
                className="p-2 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-lg flex items-center justify-center gap-1.5 text-slate-300 hover:text-white text-xs"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                <span>Rata Vertikal</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transformasi Teks Massal saat 2+ elemen terpilih */}
      {selectedCount > 1 && onBatchUpdateElements && (
        <div className="space-y-2 p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Format Teks Massal</span>
            </span>
            <span className="text-[9px] font-mono text-indigo-400">
              {selectedCount} item
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Ubah kapitalisasi semua teks yang terpilih sekaligus:
          </p>
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => {
                onBatchUpdateElements(el => {
                  if (el.content) return { content: el.content.toUpperCase() };
                  return {};
                });
              }}
              className="py-1 px-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-slate-200 rounded text-[10px] font-mono font-bold text-center transition-colors"
              title="Ubah semua elemen teks terpilih ke UPPERCASE"
            >
              UPPERCASE
            </button>
            <button
              type="button"
              onClick={() => {
                onBatchUpdateElements(el => {
                  if (el.content) return { content: el.content.toLowerCase() };
                  return {};
                });
              }}
              className="py-1 px-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-slate-200 rounded text-[10px] font-mono lowercase text-center transition-colors"
              title="Ubah semua elemen teks terpilih ke lowercase"
            >
              lowercase
            </button>
            <button
              type="button"
              onClick={() => {
                onBatchUpdateElements(el => {
                  if (el.content) {
                    return {
                      content: el.content.replace(/\b\w+/g, t => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase()),
                    };
                  }
                  return {};
                });
              }}
              className="py-1 px-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-slate-200 rounded text-[10px] font-mono text-center transition-colors"
              title="Ubah semua elemen teks terpilih ke Title Case"
            >
              Title Case
            </button>
          </div>
        </div>
      )}

      {/* Posisi, Dimensi & Rotasi */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Ukuran, Posisi & Rotasi
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
          <div className="col-span-2 grid grid-cols-5 gap-1.5 items-end">
            <div className="col-span-2">
              <label className="text-[10px] text-slate-500 block mb-1">Lebar (W)</label>
              <input
                type="number"
                value={element.width}
                onChange={e => {
                  const newW = Math.max(10, Number(e.target.value));
                  if (isRatioLocked && element.height > 0) {
                    const ratio = element.width / element.height;
                    onUpdateElement(element.id, { width: newW, height: Math.max(10, Math.round(newW / ratio)) });
                  } else {
                    handleChange('width', newW);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>

            <div className="col-span-1 flex justify-center pb-1">
              <button
                type="button"
                onClick={() => setIsRatioLocked(!isRatioLocked)}
                title={isRatioLocked ? 'Kunci Rasio Aktif (Klik untuk Buka)' : 'Kunci Rasio Aspek W:H'}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isRatioLocked
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {isRatioLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="col-span-2">
              <label className="text-[10px] text-slate-500 block mb-1">Tinggi (H)</label>
              <input
                type="number"
                value={element.height}
                onChange={e => {
                  const newH = Math.max(10, Number(e.target.value));
                  if (isRatioLocked && element.width > 0) {
                    const ratio = element.width / element.height;
                    onUpdateElement(element.id, { height: newH, width: Math.max(10, Math.round(newH * ratio)) });
                  } else {
                    handleChange('height', newH);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Kontrol Rotasi Derajat */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-slate-500 flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-indigo-400" />
              <span>Rotasi Putar (Derajat)</span>
            </label>
            <span className="font-mono text-indigo-400 text-[11px]">
              {element.rotation || 0}°
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              value={element.rotation || 0}
              onChange={e => handleChange('rotation', Number(e.target.value))}
              className="flex-1 accent-indigo-500 cursor-pointer"
            />
            <div className="flex gap-1">
              {[0, 90, 180, 270].map(deg => (
                <button
                  key={deg}
                  onClick={() => handleChange('rotation', deg)}
                  className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-[9px] text-slate-400 hover:text-white"
                >
                  {deg}°
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Flip Cermin Horisontal & Vertikal */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Cermin (Flip)</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleChange('flipX', !element.flipX)}
              title="Cermin Horisontal"
              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 font-medium transition-colors ${
                element.flipX
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Horisontal</span>
            </button>
            <button
              onClick={() => handleChange('flipY', !element.flipY)}
              title="Cermin Vertikal"
              className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1 font-medium transition-colors ${
                element.flipY
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Vertikal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Susunan Layer */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
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

      {/* Aksi Klik & Tautan Antar-Slide (Prototyping) */}
      <details className="group border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
        <summary className="px-2.5 py-2 cursor-pointer flex items-center justify-between text-[10px] font-medium text-slate-400 hover:text-slate-200 select-none">
          <span className="flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tautan Aksi Klik (Prototyping)</span>
          </span>
          <div className="flex items-center gap-1.5">
            {element.linkToSlideId && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Slide Link
              </span>
            )}
            <span className="text-slate-500 text-[10px] group-open:rotate-180 transition-transform">▼</span>
          </div>
        </summary>
        <div className="p-2.5 pt-1 border-t border-slate-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Target Slide:</span>
            {element.linkToSlideId && (
              <button
                type="button"
                onClick={() => handleChange('linkToSlideId', undefined)}
                className="text-[9px] text-rose-400 hover:underline"
              >
                Hapus Tautan
              </button>
            )}
          </div>
          <select
            value={element.linkToSlideId || ''}
            onChange={e => handleChange('linkToSlideId', e.target.value || undefined)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 text-xs"
          >
            <option value="">Tidak Ada Aksi (Statis)</option>
            {slides.map((s, idx) => (
              <option key={s.id} value={s.id}>
                Lompat ke Slide {idx + 1}: {s.title}
              </option>
            ))}
          </select>
          <span className="text-[9px] text-slate-500 block leading-tight">
            Saat diklik pada Mode Presentasi atau Layar Audiens, otomatis berpindah ke slide target.
          </span>
        </div>
      </details>

      {/* Animasi Masuk & Gerakan Elemen (Collapsible) */}
      <details className="group border border-slate-800/80 rounded-xl bg-slate-950/40 overflow-hidden">
        <summary className="px-2.5 py-2 cursor-pointer flex items-center justify-between text-[10px] font-medium text-slate-400 hover:text-slate-200 select-none">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Animasi & Efek Masuk Elemen</span>
          </span>
          <div className="flex items-center gap-1.5">
            {element.animation && element.animation !== 'none' && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                {element.animation}
              </span>
            )}
            <span className="text-slate-500 text-[10px] group-open:rotate-180 transition-transform">▼</span>
          </div>
        </summary>
        <div className="p-2.5 pt-1 border-t border-slate-800/60 space-y-2.5">
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Pilihan Efek Animasi</label>
            <select
              value={element.animation || 'none'}
              onChange={e => handleChange('animation', e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
            >
              <option value="none">Tanpa Animasi (Statis)</option>
              <option value="fade-in">Fade In (Muncul Lembut)</option>
              <option value="slide-up">Slide Up (Meluncur dari Bawah)</option>
              <option value="slide-down">Slide Down (Meluncur dari Atas)</option>
              <option value="slide-left">Slide Left (Meluncur dari Kanan)</option>
              <option value="slide-right">Slide Right (Meluncur dari Kiri)</option>
              <option value="zoom-in">Zoom In (Membesar Tajam)</option>
              <option value="bounce-in">Bounce In (Pantulan Dinamis)</option>
              <option value="flip-in">Flip 3D (Putaran Sumbu)</option>
              <option value="pulse-glow">Pulse Glow (Denyut Pendaran)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500 block mb-1">Durasi</span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { val: 0.3, label: '0.3s' },
                  { val: 0.6, label: '0.6s' },
                  { val: 1.0, label: '1.0s' },
                ].map(d => (
                  <button
                    key={d.val}
                    type="button"
                    onClick={() => handleChange('animationDuration', d.val)}
                    className={`py-1 rounded text-[10px] font-mono border transition-all ${
                      (element.animationDuration || 0.6) === d.val
                        ? 'bg-slate-700 border-slate-500 text-white font-semibold'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block mb-1">Jeda (Delay)</span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { val: 0, label: '0s' },
                  { val: 0.2, label: '0.2s' },
                  { val: 0.5, label: '0.5s' },
                ].map(dl => (
                  <button
                    key={dl.val}
                    type="button"
                    onClick={() => handleChange('animationDelay', dl.val)}
                    className={`py-1 rounded text-[10px] font-mono border transition-all ${
                      (element.animationDelay || 0) === dl.val
                        ? 'bg-slate-700 border-slate-500 text-white font-semibold'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {dl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {element.animation && element.animation !== 'none' && (
            <button
              type="button"
              onClick={() => {
                const current = element.animation;
                handleChange('animation', 'none');
                setTimeout(() => handleChange('animation', current), 50);
                showToast('Memutar ulang animasi!');
              }}
              className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <span>▶ Putar Ulang Animasi</span>
            </button>
          )}
        </div>
      </details>
    </div>
  );
};
