import React, { useState } from 'react';
import { DesignElement, DesignMode, ElementType } from '../types';
import {
  Type,
  Square,
  Circle,
  Minus,
  MousePointerClick,
  TextCursorInput,
  LayoutTemplate,
  BarChart3,
  Smartphone,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SidebarPaletteProps {
  mode: DesignMode;
  onAddElement: (element: DesignElement) => void;
}

export const SidebarPalette: React.FC<SidebarPaletteProps> = ({ mode, onAddElement }) => {
  const [activeTab, setActiveTab] = useState<'elements' | 'ui' | 'shapes'>('elements');

  const createBaseElement = (
    type: ElementType,
    name: string,
    width: number,
    height: number,
    overrides: Partial<DesignElement> = {}
  ): DesignElement => ({
    id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type,
    name,
    x: 120,
    y: 120,
    width,
    height,
    zIndex: 10,
    ...overrides,
  });

  return (
    <aside className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none z-10">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 p-2 gap-1 bg-slate-950/40">
        <button
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'elements' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('elements')}
        >
          Tipografi
        </button>
        <button
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'ui' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('ui')}
        >
          UI Kit
        </button>
        <button
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'shapes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('shapes')}
        >
          Bentuk
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* TAB 1: TYPOGRAPHY */}
        {activeTab === 'elements' && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Teks & Judul
            </span>

            <button
              onClick={() =>
                onAddElement(
                  createBaseElement('heading', 'Judul Besar', 700, 90, {
                    content: 'Judul Utama Halaman',
                    fontSize: 48,
                    fontWeight: 'extrabold',
                    color: '#f8fafc',
                  })
                )
              }
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-3 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-base group-hover:scale-105">
                H1
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Judul Utama (H1)</div>
                <div className="text-[10px] text-slate-400">Teks tebal 48px</div>
              </div>
            </button>

            <button
              onClick={() =>
                onAddElement(
                  createBaseElement('heading', 'Sub Judul', 550, 60, {
                    content: 'Sub-Judul Bagian atau Topik',
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: '#94a3b8',
                  })
                )
              }
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-3 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm group-hover:scale-105">
                H2
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Sub-Judul (H2)</div>
                <div className="text-[10px] text-slate-400">Teks sedang 32px</div>
              </div>
            </button>

            <button
              onClick={() =>
                onAddElement(
                  createBaseElement('text', 'Paragraf', 480, 100, {
                    content: 'Tuliskan deskripsi naskah atau penjelasan detail di sini dengan bahasa baku dan lugas.',
                    fontSize: 16,
                    fontWeight: 'normal',
                    color: '#cbd5e1',
                  })
                )
              }
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-3 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-700/40 text-slate-300 flex items-center justify-center group-hover:scale-105">
                <Type className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-200">Paragraf Konten</div>
                <div className="text-[10px] text-slate-400">Teks tubuh reguler 16px</div>
              </div>
            </button>
          </div>
        )}

        {/* TAB 2: UI KIT (COMPONENTS) */}
        {activeTab === 'ui' && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Komponen UI Interaktif
            </span>

            <button
              onClick={() =>
                onAddElement(
                  createBaseElement('button', 'Tombol Utama', 180, 48, {
                    content: 'Mulai Sekarang',
                    fill: '#6366f1',
                    color: '#ffffff',
                    borderRadius: 12,
                    fontSize: 15,
                  })
                )
              }
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-3 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105">
                <MousePointerClick className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Tombol Aksi (Button)</div>
                <div className="text-[10px] text-slate-400">Tombol primer bergaya modern</div>
              </div>
            </button>

            <button
              onClick={() =>
                onAddElement(
                  createBaseElement('input', 'Kolom Input', 320, 48, {
                    placeholder: 'Masukkan nama pengguna atau email...',
                    borderRadius: 12,
                    stroke: '#334155',
                    strokeWidth: 1,
                  })
                )
              }
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-3 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105">
                <TextCursorInput className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Kolom Input (Input Field)</div>
                <div className="text-[10px] text-slate-400">Form field input teks</div>
              </div>
            </button>

            <button
              onClick={() =>
                onAddElement(
                  createBaseElement('metric-card', 'Kartu Statistik', 280, 160, {
                    subTitle: 'TOTAL PENGUNJUNG AKTIF',
                    content: '48.9K',
                    fill: '#1e293b',
                    stroke: '#334155',
                    borderRadius: 18,
                  })
                )
              }
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-3 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-105">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Kartu Metrik (Stats)</div>
                <div className="text-[10px] text-slate-400">KPI metrik dan tren angka</div>
              </div>
            </button>

            <button
              onClick={() =>
                onAddElement(
                  createBaseElement('navbar', 'Navigasi Web', 1200, 64, {
                    fill: '#0f172a',
                    zIndex: 20,
                  })
                )
              }
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-3 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105">
                <LayoutTemplate className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Header / Navbar</div>
                <div className="text-[10px] text-slate-400">Bilah navigasi aplikasi atas</div>
              </div>
            </button>

            <button
              onClick={() =>
                onAddElement(
                  createBaseElement('bottom-nav', 'Bottom Tab Bar', 393, 72, {
                    fill: '#0f172a',
                    zIndex: 20,
                  })
                )
              }
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-3 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Mobile Bottom Bar</div>
                <div className="text-[10px] text-slate-400">Navigasi bawah ponsel</div>
              </div>
            </button>
          </div>
        )}

        {/* TAB 3: SHAPES & CONTAINERS */}
        {activeTab === 'shapes' && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Bentuk Vektor & Wadah
            </span>

            <button
              onClick={() =>
                onAddElement(
                  createBaseElement('card', 'Kontainer Kartu', 340, 200, {
                    fill: '#1e293b',
                    stroke: '#334155',
                    strokeWidth: 1,
                    borderRadius: 16,
                  })
                )
              }
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-3 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-700/40 text-slate-300 flex items-center justify-center group-hover:scale-105">
                <Square className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Persegi / Kartu</div>
                <div className="text-[10px] text-slate-400">Kontainer dasar rounded</div>
              </div>
            </button>

            <button
              onClick={() =>
                onAddElement(
                  createBaseElement('circle', 'Bentuk Lingkaran', 120, 120, {
                    fill: '#6366f1',
                  })
                )
              }
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-3 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-700/40 text-slate-300 flex items-center justify-center group-hover:scale-105">
                <Circle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Lingkaran / Avatar</div>
                <div className="text-[10px] text-slate-400">Bentuk bulat atau badge</div>
              </div>
            </button>

            <button
              onClick={() =>
                onAddElement(
                  createBaseElement('line', 'Garis Pembatas', 400, 2, {
                    stroke: '#475569',
                    strokeWidth: 2,
                  })
                )
              }
              className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center gap-3 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-700/40 text-slate-300 flex items-center justify-center group-hover:scale-105">
                <Minus className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Garis Pemisah (Line)</div>
                <div className="text-[10px] text-slate-400">Garis horizontal divider</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
