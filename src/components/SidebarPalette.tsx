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
  Table,
  TrendingUp,
  Split,
  Quote,
  Search,
  Link,
  Plus,
  ExternalLink,
  X,
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
  onReorderElement: (direction: 'front' | 'back' | 'up' | 'down', elementId?: string) => void;
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
  const [uiSearch, setUiSearch] = useState('');
  const [layerSearch, setLayerSearch] = useState('');
  const [mediaCategory, setMediaCategory] = useState<'all' | 'tech' | 'business' | 'arch' | 'nature' | 'people' | 'abstract'>('all');
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [directImageUrl, setDirectImageUrl] = useState('');
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
    // Tech & AI
    {
      title: 'Server Cloud & AI',
      category: 'tech',
      tags: ['server', 'ai', 'cloud', 'datacenter', 'infra'],
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Kode & Pengembangan',
      category: 'tech',
      tags: ['code', 'programming', 'developer', 'react', 'javascript'],
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Hardware & Chipset',
      category: 'tech',
      tags: ['hardware', 'chip', 'processor', 'cpu', 'electronic'],
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Siber & Jaringan',
      category: 'tech',
      tags: ['security', 'network', 'cyber', 'security', 'matrix'],
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Neon Cyberpunk Kota',
      category: 'tech',
      tags: ['cyberpunk', 'neon', 'futuristic', 'night', 'lights'],
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    },

    // Business & Meeting
    {
      title: 'Pertemuan Eksekutif',
      category: 'business',
      tags: ['meeting', 'executive', 'boardroom', 'office'],
      url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Diskusi Tim Kreatif',
      category: 'business',
      tags: ['discussion', 'brainstorming', 'creatives', 'team'],
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Ruang Kerja Modern',
      category: 'business',
      tags: ['workspace', 'desk', 'laptop', 'office', 'minimalist'],
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Analitik & Finansial',
      category: 'business',
      tags: ['analytics', 'chart', 'finance', 'growth', 'stocks'],
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Kopi & Workspace Kreatif',
      category: 'business',
      tags: ['coffee', 'freelance', 'notes', 'work', 'morning'],
      url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    },

    // Architecture & Space
    {
      title: 'Gedung Pencakar Langit',
      category: 'arch',
      tags: ['skyscraper', 'architecture', 'glass', 'city', 'building'],
      url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Struktur Minimalis',
      category: 'arch',
      tags: ['minimalist', 'concrete', 'lines', 'modern', 'interior'],
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Interior Galeri Seni',
      category: 'arch',
      tags: ['gallery', 'art', 'museum', 'exhibition', 'sculpture'],
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Kampus Universitas',
      category: 'arch',
      tags: ['campus', 'university', 'college', 'study', 'education'],
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
    },

    // Nature & Landscape
    {
      title: 'Pemandangan Pegunungan',
      category: 'nature',
      tags: ['mountain', 'peaks', 'nature', 'alps', 'snow'],
      url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Samudra & Horizon',
      category: 'nature',
      tags: ['ocean', 'sea', 'water', 'beach', 'blue'],
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Gradasi Kabut Senja',
      category: 'nature',
      tags: ['fog', 'mist', 'sunset', 'forest', 'calm'],
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Pendar Aurora Kutub',
      category: 'nature',
      tags: ['aurora', 'northern lights', 'night', 'green', 'stars'],
      url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&auto=format&fit=crop&q=80',
    },

    // People & Team
    {
      title: 'Foto Profil Profesional',
      category: 'people',
      tags: ['portrait', 'face', 'person', 'woman', 'professional'],
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Pengembang Software',
      category: 'people',
      tags: ['man', 'developer', 'glasses', 'portrait', 'smile'],
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Desainer & Kreator',
      category: 'people',
      tags: ['designer', 'creative', 'woman', 'portrait', 'studio'],
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Kepemimpinan & Presentasi',
      category: 'people',
      tags: ['leader', 'speaker', 'presentation', 'conference'],
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    },

    // Abstract & Shapes
    {
      title: 'Gradasi Geometris 3D',
      category: 'abstract',
      tags: ['gradient', '3d', 'shapes', 'purple', 'abstract', 'futuristic'],
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Tekstur Kertas Minimalis',
      category: 'abstract',
      tags: ['paper', 'texture', 'clean', 'white', 'simple', 'minimal'],
      url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: 'Cairan Warna Organik',
      category: 'abstract',
      tags: ['liquid', 'colors', 'paint', 'fluid', 'marble'],
      url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80',
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
      {/* 6 Category Tabs - Sleek Calming Segmented Navigation */}
      <div className="grid grid-cols-6 border-b border-slate-800/80 bg-slate-950/90 p-1.5 gap-1">
        {[
          { id: 'elements', label: 'Teks', icon: Type, title: 'Tipografi & Teks' },
          { id: 'ui', label: 'UI Kit', icon: MousePointerClick, title: 'Komponen Antarmuka & Wireframe' },
          { id: 'shapes', label: 'Bentuk', icon: Square, title: 'Bentuk & Garis Vektor' },
          { id: 'media', label: 'Media', icon: Upload, title: 'Gambar & Unggah Foto' },
          { id: 'blocks', label: 'Blok AI', icon: Sparkles, title: 'Blok Tata Letak AI Cepat' },
          { id: 'layers', label: 'Layer', icon: Layers, title: 'Daftar Layer & Susunan Elemen' },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              title={tab.title}
              className={`flex flex-col items-center justify-center py-1.5 rounded-lg border transition-all ${isActive
                ? 'bg-slate-800 border-slate-700/80 text-white shadow-sm font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[9px] mt-0.5 font-medium">{tab.label}</span>
            </button>
          );
        })}
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

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('quote', 'Kutipan Inspiratif', 520, 110, {
                      content: 'Inovasi membedakan antara seorang pemimpin dan pengikut.',
                      subTitle: 'Steve Jobs — Pendiri Apple',
                      fontSize: 22,
                      color: '#e2e8f0',
                    })
                  )
                }
                className="w-full text-left p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 transition-all flex items-center gap-3 group"
              >
                <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                  <Quote className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-200 text-xs">Kutipan / Blockquote</div>
                  <div className="text-[10px] text-slate-400">Garis aksen, italic & tokoh</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: UI KIT */}
        {activeTab === 'ui' && (
          <div className="space-y-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Komponen UI & Wireframe
            </span>
            {/* Search Input for UI Kit */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={uiSearch}
                onChange={e => setUiSearch(e.target.value)}
                placeholder="Cari tombol, input, tabel..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {uiSearch && (
                <button
                  onClick={() => setUiSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(!uiSearch || 'tombol aksi button cta mulai'.includes(uiSearch.toLowerCase())) && (
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
                  className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/40 transition-colors shrink-0">
                    <MousePointerClick className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Tombol</span>
                </button>
              )}

              {(!uiSearch || 'kolom input teks form search text cari'.includes(uiSearch.toLowerCase())) && (
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
                  className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-teal-400 group-hover:border-teal-500/40 transition-colors shrink-0">
                    <TextCursorInput className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Input Teks</span>
                </button>
              )}

              {(!uiSearch || 'kartu metrik stat card angka kpi akurasi'.includes(uiSearch.toLowerCase())) && (
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
                  className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors shrink-0">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Metrik</span>
                </button>
              )}

              {(!uiSearch || 'nav header navbar mobile navigation aplikasi'.includes(uiSearch.toLowerCase())) && (
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
                  className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-purple-400 group-hover:border-purple-500/40 transition-colors shrink-0">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Navbar</span>
                </button>
              )}

              {(!uiSearch || 'avatar profil user usercheck akun pengguna'.includes(uiSearch.toLowerCase())) && (
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
                  className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/40 transition-colors shrink-0">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Avatar</span>
                </button>
              )}

              {(!uiSearch || 'badge pill tag label verified status'.includes(uiSearch.toLowerCase())) && (
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
                  className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-pink-400 group-hover:border-pink-500/40 transition-colors shrink-0">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Badge Pill</span>
                </button>
              )}

              {(!uiSearch || 'switch toggle saklar on off cek'.includes(uiSearch.toLowerCase())) && (
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
                  className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition-colors shrink-0">
                    <ToggleLeft className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Toggle</span>
                </button>
              )}

              {(!uiSearch || 'ikon vektor sparkles icon simbol'.includes(uiSearch.toLowerCase())) && (
                <button
                  onClick={() =>
                    onAddElement(
                      createBaseElement('icon', 'Ikon Vektor', 64, 64, {
                        iconName: 'Sparkles',
                        color: '#f59e0b',
                      })
                    )
                  }
                  className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/40 transition-colors shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Ikon</span>
                </button>
              )}

              {(!uiSearch || 'grafik chart diagram bar analisis performa tren'.includes(uiSearch.toLowerCase())) && (
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
                  className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/40 transition-colors shrink-0">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Grafik</span>
                </button>
              )}

              {(!uiSearch || 'tabel table data matriks grid baris kolom'.includes(uiSearch.toLowerCase())) && (
                <button
                  onClick={() =>
                    onAddElement(
                      createBaseElement('table', 'Tabel Data', 480, 220, {
                        content: 'Indikator | Target | Realisasi | Status\nAkurasi Model | 95.0% | 99.4% | Tercapai\nLatensi Inferensi | < 20ms | 11.8ms | Optimal\nThroughput | 2.0x | 3.4x | Melampaui',
                        fill: '#0f172a',
                        stroke: '#334155',
                        strokeWidth: 1,
                        borderRadius: 12,
                        shadow: 'md',
                      })
                    )
                  }
                  className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors shrink-0">
                    <Table className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Tabel Data</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SHAPES */}
        {activeTab === 'shapes' && (
          <div className="space-y-3">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Bentuk Vektor Dasar
            </span>
            <div className="grid grid-cols-2 gap-1.5">
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
                className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors shrink-0">
                  <Square className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Kotak / Card</span>
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
                className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-pink-400 transition-colors shrink-0">
                  <Circle className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Lingkaran</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('line', 'Garis Pembatas', 400, 4, {
                      fill: '#475569',
                    })
                  )
                }
                className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-slate-200 transition-colors shrink-0">
                  <Minus className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Garis</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('triangle', 'Segitiga Vektor', 120, 120, {
                      fill: '#6366f1',
                    })
                  )
                }
                className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors shrink-0">
                  <Triangle className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Segitiga</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('star', 'Bintang Vektor', 120, 120, {
                      fill: '#f59e0b',
                    })
                  )
                }
                className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-400 transition-colors shrink-0">
                  <Star className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Bintang</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('arrow', 'Panah Vektor', 160, 60, {
                      fill: '#06b6d4',
                    })
                  )
                }
                className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0">
                  <MoveRight className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Panah Arah</span>
              </button>

              <button
                onClick={() =>
                  onAddElement(
                    createBaseElement('hexagon', 'Segi Enam (Hexagon)', 140, 130, {
                      fill: '#8b5cf6',
                    })
                  )
                }
                className="p-2 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center gap-2 transition-all text-left group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-purple-400 transition-colors shrink-0">
                  <Hexagon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">Hexagon</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: MEDIA & STOCK PHOTOS */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Unggah Media & Foto
              </span>

              {/* File Upload Trigger */}
              <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-950/80 group">
                <Upload className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform mb-1.5" />
                <span className="text-xs font-semibold text-slate-200">Unggah Gambar Lokal</span>
                <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP, SVG</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Direct Image URL Inserter */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
                <Link className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sisipkan dari URL Web</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo..."
                  value={directImageUrl}
                  onChange={e => setDirectImageUrl(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && directImageUrl.trim()) {
                      onAddElement(
                        createBaseElement('image', 'Gambar Web', 400, 260, {
                          imageUrl: directImageUrl.trim(),
                          borderRadius: 12,
                          shadow: 'md',
                        })
                      );
                      setDirectImageUrl('');
                    }
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  disabled={!directImageUrl.trim()}
                  onClick={() => {
                    if (!directImageUrl.trim()) return;
                    onAddElement(
                      createBaseElement('image', 'Gambar Web', 400, 260, {
                        imageUrl: directImageUrl.trim(),
                        borderRadius: 12,
                        shadow: 'md',
                      })
                    );
                    setDirectImageUrl('');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-semibold shrink-0 transition-colors"
                >
                  Sisipkan
                </button>
              </div>
            </div>

            {/* Preset Stock Photos with Live Search & Category Chips */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Foto Stok Bebas Royalti
                </span>
                <span className="text-[9px] text-indigo-400 font-mono">Unsplash HD</span>
              </div>

              {/* Stock Photo Live Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari foto (kopi, tech, neon)..."
                  value={stockSearchQuery}
                  onChange={e => setStockSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-medium"
                />
                {stockSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setStockSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'tech', label: 'Teknologi' },
                  { id: 'business', label: 'Bisnis' },
                  { id: 'arch', label: 'Arsitektur' },
                  { id: 'nature', label: 'Alam' },
                  { id: 'people', label: 'Tim' },
                  { id: 'abstract', label: 'Abstrak' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setMediaCategory(cat.id as any)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 transition-all ${
                      mediaCategory === cat.id
                        ? 'bg-indigo-600 text-white font-semibold shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Quick Dynamic Search Button if Query Present */}
              {stockSearchQuery.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    const query = encodeURIComponent(stockSearchQuery.trim());
                    onAddElement(
                      createBaseElement('image', `Unsplash: ${stockSearchQuery.trim()}`, 400, 260, {
                        imageUrl: `https://images.unsplash.com/featured/800x600/?${query}&auto=format&fit=crop&q=80`,
                        borderRadius: 12,
                        shadow: 'md',
                      })
                    );
                  }}
                  className="w-full py-1.5 px-2 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-700/60 rounded-lg text-indigo-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Sisipkan Foto Unsplash "{stockSearchQuery}"</span>
                </button>
              )}

              {/* Photo Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {sampleStockPhotos
                  .filter(p => {
                    const matchesCategory = mediaCategory === 'all' || p.category === mediaCategory;
                    if (!matchesCategory) return false;
                    if (!stockSearchQuery.trim()) return true;
                    const q = stockSearchQuery.toLowerCase();
                    return (
                      p.title.toLowerCase().includes(q) ||
                      p.category.toLowerCase().includes(q) ||
                      (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
                    );
                  })
                  .map((photo, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        onAddElement(
                          createBaseElement('image', photo.title, 360, 240, {
                            imageUrl: photo.url,
                            borderRadius: 12,
                            shadow: 'md',
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
                      {block.icon === 'TrendingUp' && <TrendingUp className="w-4 h-4 text-sky-400" />}
                      {block.icon === 'Split' && <Split className="w-4 h-4 text-rose-400" />}
                      {block.icon === 'Quote' && <Quote className="w-4 h-4 text-purple-400" />}
                      {!['GitCommit', 'Users', 'Grid', 'CreditCard', 'TrendingUp', 'Split', 'Quote'].includes(block.icon) && (
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                      )}
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
        )}
      </div>
    </aside>
  );
};
