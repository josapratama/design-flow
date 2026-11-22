import React, { useState } from 'react';
import {
  MousePointerClick,
  TextCursorInput,
  BarChart3,
  Smartphone,
  Users,
  Tag,
  ToggleLeft,
  Sparkles,
  Table,
  Sliders,
  ChevronRight,
  AlertCircle,
  Search,
  QrCode,
} from 'lucide-react';
import { DesignElement } from '../../types';
import { createBaseElement } from './sidebarUtils';

interface SidebarUIKitTabProps {
  onAddElement: (element: DesignElement) => void;
}

export const SidebarUIKitTab: React.FC<SidebarUIKitTabProps> = ({ onAddElement }) => {
  const [uiCategory, setUiCategory] = useState<'all' | 'form' | 'data' | 'nav'>('all');
  const [uiSearch, setUiSearch] = useState('');

  const uiComponents = [
    {
      id: 'qr-code',
      category: 'nav',
      name: 'QR Code Interaktif',
      desc: 'Tautan URL, kontak, feedback',
      icon: QrCode,
      action: () =>
        onAddElement(
          createBaseElement('qr-code', 'QR Code Tautan', 180, 180, {
            content: 'https://designflow.app',
            subTitle: 'Pindai Tautan Presentasi',
            fill: '#ffffff',
            color: '#0f172a',
            borderRadius: 16,
            shadow: 'md',
          })
        ),
    },
    {
      id: 'button',
      category: 'form',
      name: 'Tombol Aksi',
      desc: 'Primary CTA, Secondary, Outline',
      icon: MousePointerClick,
      action: () =>
        onAddElement(
          createBaseElement('button', 'Tombol Aksi', 180, 48, {
            content: 'Jelajahi Solusi →',
            fill: '#4f46e5',
            color: '#ffffff',
            borderRadius: 12,
            shadow: 'md',
          })
        ),
    },
    {
      id: 'input',
      category: 'form',
      name: 'Input Teks',
      desc: 'Kotak input dengan placeholder',
      icon: TextCursorInput,
      action: () =>
        onAddElement(
          createBaseElement('input', 'Kolom Input', 320, 52, {
            content: 'Masukkan kata kunci pencarian...',
            fill: '#0f172a',
            stroke: '#334155',
            strokeWidth: 1.5,
            borderRadius: 12,
            color: '#94a3b8',
          })
        ),
    },
    {
      id: 'metric-card',
      category: 'data',
      name: 'Kartu Metrik',
      desc: 'Nilai angka KPI, badge status',
      icon: BarChart3,
      action: () =>
        onAddElement(
          createBaseElement('metric-card', 'Kartu Pertumbuhan', 260, 140, {
            content: 'Rp 2.45 Milyar',
            subTitle: '+28.4% MoM • Target Tercapai',
            fill: '#1e1b4b',
            stroke: '#6366f1',
            strokeWidth: 1.5,
            borderRadius: 16,
            color: '#ffffff',
            shadow: 'lg',
          })
        ),
    },
    {
      id: 'nav-header',
      category: 'nav',
      name: 'Nav Header',
      desc: 'Header navigasi wireframe',
      icon: Smartphone,
      action: () =>
        onAddElement(
          createBaseElement('navbar', 'Bilah Navigasi', 440, 56, {
            content: 'Dashboard Studio',
            fill: '#0f172a',
            stroke: '#1e293b',
            strokeWidth: 1,
            borderRadius: 12,
            color: '#f8fafc',
          })
        ),
    },
    {
      id: 'avatar',
      category: 'data',
      name: 'Avatar Profil',
      desc: 'Foto pengguna melingkar',
      icon: Users,
      action: () =>
        onAddElement(
          createBaseElement('avatar', 'Avatar Anggota', 72, 72, {
            content: 'JP',
            fill: '#4f46e5',
            color: '#ffffff',
            borderRadius: 9999,
            shadow: 'md',
          })
        ),
    },
    {
      id: 'badge',
      category: 'data',
      name: 'Badge Pill',
      desc: 'Status tag & kategori',
      icon: Tag,
      action: () =>
        onAddElement(
          createBaseElement('badge-shape', 'Badge Status', 130, 32, {
            content: '● TERVERIFIKASI',
            fill: '#064e3b',
            color: '#34d399',
            borderRadius: 9999,
          })
        ),
    },
    {
      id: 'toggle',
      category: 'form',
      name: 'Switch Toggle',
      desc: 'Saklar aktif/nonaktif UI',
      icon: ToggleLeft,
      action: () =>
        onAddElement(
          createBaseElement('toggle', 'Saklar Switch', 96, 44, {
            content: 'Aktif',
            fill: '#4f46e5',
            borderRadius: 9999,
          })
        ),
    },
    {
      id: 'icon',
      category: 'nav',
      name: 'Ikon Vektor',
      desc: 'Lucide icon visual',
      icon: Sparkles,
      action: () =>
        onAddElement(
          createBaseElement('icon', 'Ikon Fitur', 56, 56, {
            content: 'Sparkles',
            color: '#818cf8',
            fill: '#1e1b4b',
            borderRadius: 12,
          })
        ),
    },
    {
      id: 'table',
      category: 'data',
      name: 'Tabel Ringkas',
      desc: 'Data matriks 3 kolom',
      icon: Table,
      action: () =>
        onAddElement(
          createBaseElement('card', 'Tabel Matriks', 440, 180, {
            content: 'Modul\tStatus\tLatensi\nAPI Gateway\tOnline\t12ms\nDatabase\tOnline\t8ms\nAuth Service\tOptimal\t15ms',
            fill: '#0f172a',
            stroke: '#334155',
            borderRadius: 12,
          })
        ),
    },
    {
      id: 'progress',
      category: 'data',
      name: 'Progress Bar',
      desc: 'Bilah progres penyelesaian',
      icon: Sliders,
      action: () =>
        onAddElement(
          createBaseElement('rect', 'Progress Bar (75%)', 340, 18, {
            fill: '#312e81',
            borderRadius: 9999,
          })
        ),
    },
    {
      id: 'accordion',
      category: 'nav',
      name: 'Accordion FAQ',
      desc: 'Daftar pertanyaan lipat',
      icon: ChevronRight,
      action: () =>
        onAddElement(
          createBaseElement('card', 'Accordion FAQ', 380, 80, {
            content: 'Bagaimana cara integrasi API?\nKlik untuk melihat dokumentasi teknis lengkap.',
            fill: '#1e293b',
            borderRadius: 12,
            stroke: '#475569',
          })
        ),
    },
    {
      id: 'alert',
      category: 'data',
      name: 'Callout Alert',
      desc: 'Pemberitahuan peringatan UI',
      icon: AlertCircle,
      action: () =>
        onAddElement(
          createBaseElement('card', 'Alert Callout', 420, 90, {
            content: 'Perhatian: Pembaruan versi v2.4 akan diterapkan secara otomatis malam ini.',
            fill: '#451a03',
            stroke: '#f59e0b',
            strokeWidth: 1.5,
            borderRadius: 12,
            color: '#fef3c7',
          })
        ),
    },
  ];

  const filteredComponents = uiComponents.filter(c => {
    const matchesCat = uiCategory === 'all' || c.category === uiCategory;
    if (!matchesCat) return false;
    if (!uiSearch.trim()) return true;
    const q = uiSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Komponen UI & Wireframe
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari tombol, input, tabel..."
          value={uiSearch}
          onChange={e => setUiSearch(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-medium"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'form', label: 'Form & Input' },
          { id: 'data', label: 'Data & Kartu' },
          { id: 'nav', label: 'Navigasi' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setUiCategory(cat.id as any)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all shrink-0 ${
              uiCategory === cat.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Component Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-0.5">
        {filteredComponents.map(comp => (
          <button
            key={comp.id}
            onClick={comp.action}
            className="p-3 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center group"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <comp.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-200 text-[11px] truncate">{comp.name}</div>
              <div className="text-[9px] text-slate-500 truncate mt-0.5">{comp.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
