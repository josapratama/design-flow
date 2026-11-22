import React from 'react';
import { Smile, Sparkles, Upload, QrCode } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { DesignElement } from '../../../types';

interface SpecialComponentsSectionProps {
  element: DesignElement;
  handleChange: (field: keyof DesignElement, val: any) => void;
  showIconPicker: boolean;
  setShowIconPicker: (show: boolean) => void;
  iconFilter: string;
  setIconFilter: (filter: string) => void;
  filteredIcons: string[];
}

export const SpecialComponentsSection: React.FC<SpecialComponentsSectionProps> = ({
  element,
  handleChange,
  showIconPicker,
  setShowIconPicker,
  iconFilter,
  setIconFilter,
  filteredIcons,
}) => {
  return (
    <>
      {/* Pengaturan Khusus QR Code Interaktif */}
      {element.type === 'qr-code' && (
        <div className="space-y-2.5 p-3 bg-slate-950/70 border border-indigo-500/30 rounded-xl">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <QrCode className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Pengaturan QR Code Tautan
            </span>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Tautan Web / URL Tujuan</label>
            <input
              type="url"
              value={element.content || ''}
              onChange={e => handleChange('content', e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 font-mono outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Label / Keterangan di Bawah</label>
            <input
              type="text"
              value={element.subTitle || ''}
              onChange={e => handleChange('subTitle', e.target.value)}
              placeholder="Pindai untuk Unduh Materi"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Pengaturan Khusus Progress Bar */}
      {element.type === 'progress-bar' && (
        <div className="space-y-2.5 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider block">
            Pengaturan Progress Bar
          </span>
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Nilai Capaian</span>
              <span className="font-mono font-bold text-teal-400">{element.content || '75'}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={parseInt(element.content || '75', 10) || 75}
              onChange={e => handleChange('content', e.target.value)}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Judul Indikator</label>
            <input
              type="text"
              value={element.subTitle || ''}
              onChange={e => handleChange('subTitle', e.target.value)}
              placeholder="Contoh: Realisasi Target Evaluasi"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-teal-500"
            />
          </div>
        </div>
      )}

      {/* Pengaturan Khusus Rating Bintang */}
      {element.type === 'rating' && (
        <div className="space-y-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
            Pengaturan Rating Bintang
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Nilai Skor</label>
              <input
                type="text"
                value={element.content || '4.9'}
                onChange={e => handleChange('content', e.target.value)}
                placeholder="4.9"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-amber-400 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Label Ulasan</label>
              <input
                type="text"
                value={element.subTitle || '(2.8k Ulasan)'}
                onChange={e => handleChange('subTitle', e.target.value)}
                placeholder="(2.8k Ulasan)"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Pengaturan Khusus Alert Banner */}
      {element.type === 'alert-box' && (
        <div className="space-y-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block">
            Pengaturan Alert Banner
          </span>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Tipe / Varian</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'primary', label: 'Info' },
                { id: 'success', label: 'Sukses' },
                { id: 'warning', label: 'Peringatan' },
                { id: 'danger', label: 'Bahaya' },
              ].map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleChange('variant', v.id)}
                  className={`py-1 rounded text-[10px] font-medium border transition-all ${
                    (element.variant || 'warning') === v.id
                      ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pengaturan Khusus Gambar Media */}
      {element.type === 'image' && (
        <div className="space-y-2.5 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider block">
            Pengaturan Media Gambar
          </span>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">URL Gambar</label>
            <input
              type="url"
              value={element.imageUrl || ''}
              onChange={e => handleChange('imageUrl', e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-purple-500 font-mono"
            />
          </div>
        </div>
      )}

      {/* Pengaturan Ikon Lucide Vector */}
      {element.type === 'icon' && (
        <div className="space-y-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
              Pilih Ikon Vektor ({element.content || 'Sparkles'})
            </span>
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="text-[10px] text-indigo-400 hover:underline font-semibold"
            >
              {showIconPicker ? 'Tutup Pustaka' : 'Ganti Ikon'}
            </button>
          </div>

          {showIconPicker && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                placeholder="Cari ikon (heart, star, user)..."
                value={iconFilter}
                onChange={e => setIconFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500"
              />
              <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto p-1 bg-slate-950 rounded border border-slate-800/80">
                {filteredIcons.map(name => {
                  const Icon = (LucideIcons as any)[name];
                  if (!Icon) return null;
                  const isSelected = element.content === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        handleChange('content', name);
                        setShowIconPicker(false);
                      }}
                      title={name}
                      className={`p-1.5 rounded flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
