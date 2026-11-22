import React, { useState } from 'react';
import { DesignElement, DesignMode, ElementType, Slide } from '../types';
import { SMART_BLOCKS } from '../templates/smart-blocks';
import {
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  Hexagon,
  MoveRight,
  Minus,
  MousePointerClick,
  TextCursorInput,
  LayoutTemplate,
  BarChart3,
  Smartphone,
  Upload,
  Sparkles,
  GitCommit,
  Users,
  Grid,
  CreditCard,
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ArrowUp,
  ArrowDown,
  UserCheck,
  ToggleLeft,
  Tag,
  Image as ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SidebarPaletteProps {
  mode: DesignMode;
  activeSlide: Slide;
  selectedElementIds: string[];
  onSelectElement: (elementId: string, multiSelect: boolean) => void;
  onToggleLock: (elementId: string) => void;
  onToggleHide: (elementId: string) => void;
  onDeleteElement: (elementId: string) => void;
  onReorderElement: (direction: 'front' | 'back' | 'up' | 'down') => void;
  onAddElement: (element: DesignElement) => void;
  onAddElements: (elements: DesignElement[]) => void;
}

export const SidebarPalette: React.FC<SidebarPaletteProps> = ({
  mode,
  activeSlide,
  selectedElementIds,
  onSelectElement,
  onToggleLock,
  onToggleHide,
  onDeleteElement,
  onReorderElement,
  onAddElement,
  onAddElements,
}) => {
  const [activeTab, setActiveTab] = useState<'elements' | 'ui' | 'shapes' | 'media' | 'blocks' | 'layers'>('elements');
  const [layerSearch, setLayerSearch] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleGenerateFromTopic = () => {
    if (!aiTopic.trim()) return;
    setIsAiGenerating(true);
    const topic = aiTopic.trim();

    const elements: DesignElement[] = [
      createBaseElement('text', 'Topik Tag', 240, 32, {
        x: 120,
        y: 120,
        content: 'IKHTISAR RISET & STRATEGI',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#818cf8',
      }),
      createBaseElement('heading', 'Judul Slide', 1200, 70, {
        x: 120,
        y: 160,
        content: topic,
        fontSize: 44,
        fontWeight: 'extrabold',
        color: '#ffffff',
      }),
      createBaseElement('text', 'Deskripsi Topik', 900, 50, {
        x: 120,
        y: 235,
        content: `Analisis mendalam dan tinjauan komprehensif mengenai implementasi ${topic.toLowerCase()} untuk keunggulan operasional.`,
        fontSize: 18,
        color: '#94a3b8',
      }),
      createBaseElement('card', 'Pilar 1', 380, 220, {
        x: 120,
        y: 320,
        content: 'Fokus Utama 01\n\nOptimasi arsitektur sistem dan peningkatan efisiensi alur kerja data secara terukur.',
        fill: '#1e293b',
        stroke: '#4f46e5',
        strokeWidth: 1.5,
        borderRadius: 16,
        shadow: 'lg',
      }),
      createBaseElement('card', 'Pilar 2', 380, 220, {
        x: 530,
        y: 320,
        content: 'Fokus Utama 02\n\nIntegrasi model kecerdasan buatan dengan parameter adaptif dan keandalan tinggi.',
        fill: '#1e293b',
        stroke: '#06b6d4',
        strokeWidth: 1.5,
        borderRadius: 16,
        shadow: 'lg',
      }),
      createBaseElement('card', 'Pilar 3', 380, 220, {
        x: 940,
        y: 320,
        content: 'Fokus Utama 03\n\nValidasi empiris hasil evaluasi komparatif terhadap metrik standar industri.',
        fill: '#1e293b',
        stroke: '#10b981',
        strokeWidth: 1.5,
        borderRadius: 16,
        shadow: 'lg',
      }),
      createBaseElement('metric-card', 'Metrik Utama', 240, 100, {
        x: 120,
        y: 570,
        content: '99.2%',
        subTitle: 'Reliability Index',
        fill: '#0f172a',
        color: '#38bdf8',
        borderRadius: 12,
      }),
      createBaseElement('button', 'Tombol Aksi', 220, 50, {
        x: 390,
        y: 595,
        content: 'Pelajari Selengkapnya →',
        fill: '#4f46e5',
        color: '#ffffff',
        borderRadius: 12,
        shadow: 'md',
      }),
    ];

    onAddElements(elements);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setIsAiGenerating(false);
    setAiTopic('');
  };

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        onAddElement(
          createBaseElement('image', file.name.replace(/\.[^/.]+$/, ''), 420, 280, {
            imageUrl: dataUrl,
            borderRadius: 16,
          })
        );
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const sampleStockPhotos = [
    {
      title: 'Kampus & Universitas',
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Teknologi & Server AI',
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Arsitektur Minimalis',
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Foto Profil Tim / User',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    },
  ];

  // Sorted layers descending by zIndex
  const sortedLayers = activeSlide.elements
    .slice()
    .sort((a, b) => b.zIndex - a.zIndex)
    .filter(el =>
      (el.name || el.type || el.content || '')
        .toLowerCase()
        .includes(layerSearch.toLowerCase())
    );

  const getElementIcon = (type: ElementType) => {
    switch (type) {
      case 'heading':
      case 'text':
      case 'quote':
        return <Type className="w-3.5 h-3.5 text-indigo-400" />;
      case 'rect':
      case 'card':
        return <Square className="w-3.5 h-3.5 text-blue-400" />;
      case 'circle':
        return <Circle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'triangle':
        return <Triangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'star':
        return <Star className="w-3.5 h-3.5 text-yellow-400" />;
      case 'arrow':
        return <MoveRight className="w-3.5 h-3.5 text-cyan-400" />;
      case 'hexagon':
        return <Hexagon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'button':
        return <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />;
      case 'input':
        return <TextCursorInput className="w-3.5 h-3.5 text-teal-400" />;
      case 'avatar':
        return <UserCheck className="w-3.5 h-3.5 text-indigo-400" />;
      case 'badge-shape':
        return <Tag className="w-3.5 h-3.5 text-pink-400" />;
      case 'toggle':
        return <ToggleLeft className="w-3.5 h-3.5 text-teal-400" />;
      case 'icon':
        return <Sparkles className="w-3.5 h-3.5 text-yellow-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-purple-400" />;
      case 'metric-card':
        return <BarChart3 className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Square className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <aside className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none z-10">
      {/* 6 Category Tabs */}
      <div className="grid grid-cols-6 border-b border-slate-800 bg-slate-950/60 p-1 gap-0.5">
        <button
          onClick={() => setActiveTab('elements')}
          title="Tipografi & Teks"
          className={`flex flex-col items-center justify-center py-2 rounded transition-colors ${activeTab === 'elements'
            ? 'bg-indigo-600 text-white shadow'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
        >
          <Type className="w-4 h-4" />
          <span className="text-[9px] mt-1 font-medium">Teks</span>
        </button>

        <button
          onClick={() => setActiveTab('ui')}
          title="UI Kit & Komponen Antarmuka"
          className={`flex flex-col items-center justify-center py-2 rounded transition-colors ${activeTab === 'ui'
            ? 'bg-indigo-600 text-white shadow'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
        >
          <MousePointerClick className="w-4 h-4" />
          <span className="text-[9px] mt-1 font-medium">UI Kit</span>
        </button>

        <button
          onClick={() => setActiveTab('shapes')}
          title="Bentuk & Garis Vektor"
          className={`flex flex-col items-center justify-center py-2 rounded transition-colors ${activeTab === 'shapes'
            ? 'bg-indigo-600 text-white shadow'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
        >
          <Square className="w-4 h-4" />
          <span className="text-[9px] mt-1 font-medium">Bentuk</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          title="Gambar & Unggah Foto"
          className={`flex flex-col items-center justify-center py-2 rounded transition-colors ${activeTab === 'media'
            ? 'bg-indigo-600 text-white shadow'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
        >
          <Upload className="w-4 h-4" />
          <span className="text-[9px] mt-1 font-medium">Media</span>
        </button>

        <button
          onClick={() => setActiveTab('blocks')}
          title="Blok Tata Letak AI Cepat"
          className={`flex flex-col items-center justify-center py-2 rounded transition-colors ${activeTab === 'blocks'
            ? 'bg-indigo-600 text-white shadow'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-[9px] mt-1 font-medium">Blok AI</span>
        </button>

        <button
          onClick={() => setActiveTab('layers')}
          title="Daftar Layer & Susunan Elemen"
          className={`flex flex-col items-center justify-center py-2 rounded transition-colors ${activeTab === 'layers'
            ? 'bg-indigo-600 text-white shadow'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[9px] mt-1 font-medium">Layer</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {/* TAB 1: TYPOGRAPHY */}
        {activeTab === 'elements' && (
          <div className="space-y-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Tipografi
            </span>
            <div className="space-y-2">
              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('heading', 'Judul Utama', 600, 70, {
                      content: 'Judul Presentasi Utama',
                      fontSize: 48,
                      fontWeight: 'bold',
                      color: '#ffffff',
                    })
                  )
                }
                className="w-full text-left p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 transition-all flex items-center gap-3 group"
              >
                <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-sm">Judul Utama (H1)</div>
                  <div className="text-[10px] text-slate-400">Teks tebal 48px</div>
                </div>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('heading', 'Sub-Judul', 500, 50, {
                      content: 'Sub-Judul / Topik Pembahasan',
                      fontSize: 32,
                      fontWeight: 'semibold',
                      color: '#94a3b8',
                    })
                  )
                }
                className="w-full text-left p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 transition-all flex items-center gap-3 group"
              >
                <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200 text-xs">Sub-Judul (H2)</div>
                  <div className="text-[10px] text-slate-400">Teks 32px slate</div>
                </div>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('text', 'Paragraf Teks', 500, 90, {
                      content:
                        'Deskripsi penjelasan naskah secara komprehensif dengan tata bahasa akademik yang lugas dan terstruktur.',
                      fontSize: 18,
                      color: '#cbd5e1',
                    })
                  )
                }
                className="w-full text-left p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 transition-all flex items-center gap-3 group"
              >
                <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-slate-200 text-xs">Paragraf Standar</div>
                  <div className="text-[10px] text-slate-400">Ukuran 18px paragraf naskah</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: UI KIT */}
        {activeTab === 'ui' && (
          <div className="space-y-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Komponen UI & Wireframe
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('button', 'Tombol Aksi', 160, 48, {
                      content: 'Mulai Sekarang',
                      fill: '#4f46e5',
                      color: '#ffffff',
                      borderRadius: 10,
                      shadow: 'md',
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <MousePointerClick className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Tombol Aksi</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('input', 'Kolom Input', 240, 48, {
                      placeholder: 'Masukkan kata kunci pencarian...',
                      fill: '#0f172a',
                      stroke: '#334155',
                      color: '#94a3b8',
                      borderRadius: 10,
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <TextCursorInput className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Input Teks</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('metric-card', 'Stat Card', 220, 110, {
                      content: '98.4%',
                      subTitle: 'Tingkat Akurasi Evaluasi',
                      fill: '#1e293b',
                      color: '#38bdf8',
                      borderRadius: 14,
                      shadow: 'lg',
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <BarChart3 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Kartu Metrik</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('navbar', 'App Navbar', 393, 56, {
                      content: 'DesignFlow Mobile',
                      fill: '#090d16',
                      color: '#ffffff',
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <Smartphone className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Nav Header</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('avatar', 'Avatar User', 64, 64, {
                      content: 'DF',
                      stroke: '#6366f1',
                      fill: '#1e1b4b',
                      color: '#c7d2fe',
                      shadow: 'md',
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <UserCheck className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Avatar Profil</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('badge-shape', 'Badge Pill', 140, 36, {
                      content: 'VERIFIED',
                      fill: 'rgba(99, 102, 241, 0.2)',
                      color: '#818cf8',
                      iconName: 'Shield',
                      borderRadius: 9999,
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <Tag className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Badge Pill</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('toggle', 'Switch Toggle', 52, 30, {
                      content: 'on',
                      fill: '#10b981',
                      shadow: 'sm',
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <ToggleLeft className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Switch Toggle</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('icon', 'Ikon Vektor', 64, 64, {
                      iconName: 'Sparkles',
                      color: '#f59e0b',
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <Sparkles className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Ikon Vektor</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('chart', 'Grafik Analisis', 360, 220, {
                      content: 'Pertumbuhan Kinerja',
                      subTitle: 'Evaluasi metrik kuartal Q1-Q4',
                      chartType: 'bar',
                      fill: '#6366f1',
                      color: '#38bdf8',
                      borderRadius: 16,
                      shadow: 'lg',
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <BarChart3 className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Grafik / Chart</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SHAPES */}
        {activeTab === 'shapes' && (
          <div className="space-y-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Bentuk Vektor Dasar
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('rect', 'Persegi Panjang', 240, 160, {
                      fill: '#1e293b',
                      borderRadius: 12,
                      shadow: 'sm',
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <Square className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Kotak / Card</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('circle', 'Lingkaran', 140, 140, {
                      fill: '#312e81',
                      borderRadius: 9999,
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <Circle className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Lingkaran</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('line', 'Garis Pembatas', 400, 4, {
                      fill: '#475569',
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <Minus className="w-6 h-6 text-slate-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Garis Dividers</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('triangle', 'Segitiga Vektor', 120, 120, {
                      fill: '#6366f1',
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <Triangle className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Segitiga</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('star', 'Bintang Vektor', 120, 120, {
                      fill: '#f59e0b',
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <Star className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Bintang</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('arrow', 'Panah Vektor', 160, 60, {
                      fill: '#06b6d4',
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <MoveRight className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Panah Arah</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('hexagon', 'Segi Enam (Hexagon)', 140, 130, {
                      fill: '#8b5cf6',
                    })
                  )
                }
                className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-lg flex flex-col items-center gap-2 group text-center"
              >
                <Hexagon className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-slate-200 font-medium">Segi Enam</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: MEDIA & STOCK PHOTOS */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Unggah Media & Foto
            </span>

            {/* File Upload Trigger */}
            <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-950/80 group">
              <Upload className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform mb-2" />
              <span className="text-xs font-semibold text-slate-200">Unggah Gambar Lokal</span>
              <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WebP, SVG</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Preset Stock Photos */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Foto Contoh Siap Pakai
              </span>
              <div className="grid grid-cols-2 gap-2">
                {sampleStockPhotos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      onAddElement(
                        createBaseElement('image', photo.title, 360, 240, {
                          imageUrl: photo.url,
                          borderRadius: 12,
                        })
                      )
                    }
                    className="group relative rounded-lg overflow-hidden border border-slate-800 hover:border-indigo-500 text-left transition-all aspect-video"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[9px] font-medium text-white truncate">
                        {photo.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SMART LAYOUT BLOCKS */}
        {activeTab === 'blocks' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold text-slate-100">AI Slide Drafter</span>
            </div>

            {/* Smart Topic Generator Box */}
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 space-y-2">
              <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider block">
                Susun Slide Berdasarkan Topik
              </span>
              <input
                type="text"
                placeholder="Misal: Seminar Proposal Sistem AI..."
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleGenerateFromTopic();
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-indigo-400 placeholder:text-slate-500"
              />
              <button
                onClick={handleGenerateFromTopic}
                disabled={!aiTopic.trim() || isAiGenerating}
                className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Susun Slide Cerdas ✨</span>
              </button>
            </div>

            <div className="pt-1 border-t border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Blok Layout Siap Pakai
              </span>
            </div>

            <div className="space-y-2.5">
              {SMART_BLOCKS.map(block => (
                <button
                  key={block.id}
                  onClick={() => {
                    const elements = block.generateElements(200, 200);
                    onAddElements(elements);
                    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900/80 transition-all group shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform shrink-0">
                      {block.icon === 'GitCommit' && <GitCommit className="w-4 h-4 text-emerald-400" />}
                      {block.icon === 'Users' && <Users className="w-4 h-4 text-cyan-400" />}
                      {block.icon === 'Grid' && <Grid className="w-4 h-4 text-amber-400" />}
                      {block.icon === 'CreditCard' && <CreditCard className="w-4 h-4 text-pink-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 text-xs group-hover:text-indigo-300 transition-colors">
                        {block.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                        {block.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: LAYERS PANEL (Daftar Urutan Layer) */}
        {activeTab === 'layers' && (
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
                      className={`group flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${isSelected
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
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
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
        )}
      </div>
    </aside>
  );
};
