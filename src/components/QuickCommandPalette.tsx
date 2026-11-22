import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Type,
  MousePointerClick,
  TextCursorInput,
  BarChart3,
  Smartphone,
  Square,
  Circle,
  Triangle,
  Star,
  Hexagon,
  Copy,
  MoveRight,
  Minus,
  Upload,
  GitCommit,
  Users,
  Grid,
  CreditCard,
  Sparkles,
  UserCheck,
  Tag,
  X,
  Play,
  Download,
  LayoutTemplate,
  Table as TableIcon,
  SunMoon,
  ClipboardCopy,
  TrendingUp,
  Split,
  LayoutGrid,
} from 'lucide-react';
import { DesignElement, ElementType } from '../types';
import { SMART_BLOCKS } from '../templates/smart-blocks';

interface QuickCommandPaletteProps {
  isOpen: boolean;
  slideWidth: number;
  slideHeight: number;
  onClose: () => void;
  onAddElement: (element: DesignElement) => void;
  onAddElements: (elements: DesignElement[]) => void;
  onOpenPresenter?: () => void;
  onOpenExport?: () => void;
  onOpenTemplates?: () => void;
  onOpenFindReplace?: () => void;
  onDuplicateActiveSlide?: () => void;
  onCopyArtboardImage?: () => void;
  onInvertSlideTheme?: () => void;
  onOpenSlideSorter?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
}

export const QuickCommandPalette: React.FC<QuickCommandPaletteProps> = ({
  isOpen,
  slideWidth,
  slideHeight,
  onClose,
  onAddElement,
  onAddElements,
  onOpenPresenter,
  onOpenExport,
  onOpenTemplates,
  onOpenFindReplace,
  onDuplicateActiveSlide,
  onCopyArtboardImage,
  onInvertSlideTheme,
  onOpenSlideSorter,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const centerX = Math.round(slideWidth / 2);
  const centerY = Math.round(slideHeight / 2);

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
    x: Math.max(20, centerX - Math.round(width / 2)),
    y: Math.max(20, centerY - Math.round(height / 2)),
    width,
    height,
    zIndex: 10,
    ...overrides,
  });

  const commands: CommandItem[] = [
    // Aksi Studio
    ...(onOpenPresenter
      ? [
          {
            id: 'action-presenter',
            title: 'Mulai Presentasi Slideshow (F5)',
            subtitle: 'Buka mode layar penuh dengan laser pointer & catatan presenter',
            category: 'Aksi Studio',
            icon: <Play className="w-4 h-4 text-emerald-400" />,
            action: () => onOpenPresenter(),
          },
        ]
      : []),
    ...(onOpenExport
      ? [
          {
            id: 'action-export',
            title: 'Buka Dialog Ekspor (Ctrl+E)',
            subtitle: 'Simpan ke PNG HD, WebP, PDF atau Kode React Tailwind',
            category: 'Aksi Studio',
            icon: <Download className="w-4 h-4 text-cyan-400" />,
            action: () => onOpenExport(),
          },
        ]
      : []),
    ...(onOpenTemplates
      ? [
          {
            id: 'action-templates',
            title: 'Buka Galeri Template Desain',
            subtitle: 'Pilih template siap pakai (Pitch deck, Portofolio, UI Wireframe)',
            category: 'Aksi Studio',
            icon: <LayoutTemplate className="w-4 h-4 text-indigo-400" />,
            action: () => onOpenTemplates(),
          },
        ]
      : []),
    ...(onOpenFindReplace
      ? [
          {
            id: 'action-find-replace',
            title: 'Cari & Ganti Teks (Ctrl+H)',
            subtitle: 'Temukan dan ganti kata di slide aktif atau seluruh presentasi',
            category: 'Aksi Studio',
            icon: <Search className="w-4 h-4 text-amber-400" />,
            action: () => onOpenFindReplace(),
          },
        ]
      : []),
    ...(onDuplicateActiveSlide
      ? [
          {
            id: 'action-dup-slide',
            title: 'Duplikat Slide Aktif (Ctrl+Shift+D)',
            subtitle: 'Gandakan slide saat ini beserta seluruh elemen dan posisinya',
            category: 'Aksi Studio',
            icon: <Copy className="w-4 h-4 text-purple-400" />,
            action: () => onDuplicateActiveSlide(),
          },
        ]
      : []),
    ...(onCopyArtboardImage
      ? [
          {
            id: 'action-copy-artboard',
            title: 'Salin Gambar Slide ke Clipboard (Ctrl+Shift+C)',
            subtitle: 'Render slide saat ini sebagai PNG dan salin langsung ke clipboard',
            category: 'Aksi Studio',
            icon: <ClipboardCopy className="w-4 h-4 text-emerald-400" />,
            action: () => onCopyArtboardImage(),
          },
        ]
      : []),
    ...(onInvertSlideTheme
      ? [
          {
            id: 'action-invert-theme',
            title: 'Invert Tema Slide (Gelap ⇄ Terang)',
            subtitle: 'Tukar palet warna latar & teks slide antara mode gelap dan terang',
            category: 'Aksi Studio',
            icon: <SunMoon className="w-4 h-4 text-amber-400" />,
            action: () => onInvertSlideTheme(),
          },
        ]
      : []),
    ...(onOpenSlideSorter
      ? [
          {
            id: 'action-slide-sorter',
            title: 'Buka Pengatur Kisi Slide / Light Table (Alt+S)',
            subtitle: 'Tinjauan makro seluruh slide untuk menata urutan dan alur cerita',
            category: 'Aksi Studio',
            icon: <LayoutGrid className="w-4 h-4 text-indigo-400" />,
            action: () => onOpenSlideSorter(),
          },
        ]
      : []),
    // Tipografi
    {
      id: 'h1',
      title: 'Judul Utama (H1)',
      subtitle: 'Teks tebal 48px untuk judul slide',
      category: 'Tipografi',
      icon: <Type className="w-4 h-4 text-indigo-400" />,
      action: () =>
        onAddElement(
          createBaseElement('heading', 'Judul Utama', 600, 70, {
            content: 'Judul Presentasi Utama',
            fontSize: 48,
            fontWeight: 'bold',
            color: '#ffffff',
          })
        ),
    },
    {
      id: 'h2',
      title: 'Sub-Judul (H2)',
      subtitle: 'Teks 32px untuk poin pembahasan',
      category: 'Tipografi',
      icon: <Type className="w-4 h-4 text-indigo-400" />,
      action: () =>
        onAddElement(
          createBaseElement('heading', 'Sub-Judul', 500, 50, {
            content: 'Sub-Judul / Topik Bahasan',
            fontSize: 32,
            fontWeight: 'semibold',
            color: '#94a3b8',
          })
        ),
    },
    {
      id: 'p',
      title: 'Paragraf Standar',
      subtitle: 'Teks naskah 18px isi konten',
      category: 'Tipografi',
      icon: <Type className="w-4 h-4 text-indigo-400" />,
      action: () =>
        onAddElement(
          createBaseElement('text', 'Paragraf Teks', 500, 90, {
            content: 'Deskripsi konten yang jelas dan informatif untuk audiens.',
            fontSize: 18,
            color: '#cbd5e1',
          })
        ),
    },
    // UI Kit
    {
      id: 'btn',
      title: 'Tombol Aksi (Button)',
      subtitle: 'Tombol interaktif dengan sudut lengkung dan bayangan',
      category: 'UI Kit',
      icon: <MousePointerClick className="w-4 h-4 text-amber-400" />,
      action: () =>
        onAddElement(
          createBaseElement('button', 'Tombol Aksi', 180, 48, {
            content: 'Mulai Sekarang',
            fill: '#4f46e5',
            color: '#ffffff',
            borderRadius: 10,
            shadow: 'md',
          })
        ),
    },
    {
      id: 'input',
      title: 'Kolom Input (Text Field)',
      subtitle: 'Komponen input placeholder form wireframe',
      category: 'UI Kit',
      icon: <TextCursorInput className="w-4 h-4 text-teal-400" />,
      action: () =>
        onAddElement(
          createBaseElement('input', 'Kolom Input', 260, 48, {
            placeholder: 'Masukkan teks di sini...',
            fill: '#0f172a',
            stroke: '#334155',
            color: '#94a3b8',
            borderRadius: 10,
          })
        ),
    },
    {
      id: 'metric',
      title: 'Kartu Metrik & Statistik',
      subtitle: 'Stat display dengan angka besar dan label',
      category: 'UI Kit',
      icon: <BarChart3 className="w-4 h-4 text-cyan-400" />,
      action: () =>
        onAddElement(
          createBaseElement('metric-card', 'Stat Card', 220, 110, {
            content: '98.4%',
            subTitle: 'Tingkat Akurasi Model',
            fill: '#1e293b',
            color: '#38bdf8',
            borderRadius: 14,
            shadow: 'lg',
          })
        ),
    },
    {
      id: 'chart',
      title: 'Grafik Analisis (Chart)',
      subtitle: 'Visualisasi data batang, garis, atau donat interaktif',
      category: 'UI Kit',
      icon: <BarChart3 className="w-4 h-4 text-indigo-400" />,
      action: () =>
        onAddElement(
          createBaseElement('chart', 'Grafik Analisis', 360, 220, {
            content: 'Kinerja Kuartalan',
            subTitle: 'Metrik evaluasi Q1-Q4',
            chartType: 'bar',
            fill: '#6366f1',
            color: '#38bdf8',
            borderRadius: 16,
            shadow: 'lg',
          })
        ),
    },
    {
      id: 'table',
      title: 'Tabel Data & Matriks',
      subtitle: 'Tabel komparasi terstruktur dengan header dan zebra striping',
      category: 'UI Kit',
      icon: <TableIcon className="w-4 h-4 text-emerald-400" />,
      action: () =>
        onAddElement(
          createBaseElement('table', 'Tabel Data', 520, 240, {
            content:
              'Fitur | Standar | Enterprise\nKapasitas | 10 GB | Unlimited\nIntegrasi API | Terbatas | Full Access\nDukungan 24/7 | Email | Dedicated SLA',
            fill: '#0f172a',
            stroke: '#334155',
            color: '#e2e8f0',
            borderRadius: 12,
            shadow: 'md',
          })
        ),
    },
    // Bentuk
    {
      id: 'rect',
      title: 'Kotak / Kartu Dasar',
      subtitle: 'Wadah background rounded rect',
      category: 'Bentuk',
      icon: <Square className="w-4 h-4 text-blue-400" />,
      action: () =>
        onAddElement(
          createBaseElement('rect', 'Persegi Panjang', 280, 180, {
            fill: '#1e293b',
            borderRadius: 12,
            shadow: 'sm',
          })
        ),
    },
    {
      id: 'circle',
      title: 'Lingkaran Vektor',
      subtitle: 'Shape lingkaran bulat sempurna',
      category: 'Bentuk',
      icon: <Circle className="w-4 h-4 text-pink-400" />,
      action: () =>
        onAddElement(
          createBaseElement('circle', 'Lingkaran', 160, 160, {
            fill: '#312e81',
            borderRadius: 9999,
          })
        ),
    },
    {
      id: 'triangle',
      title: 'Segitiga Vektor',
      subtitle: 'Bentuk segitiga geometris poligon',
      category: 'Bentuk',
      icon: <Triangle className="w-4 h-4 text-indigo-400" />,
      action: () =>
        onAddElement(
          createBaseElement('triangle', 'Segitiga', 140, 140, {
            fill: '#6366f1',
          })
        ),
    },
    {
      id: 'star',
      title: 'Bintang Vektor',
      subtitle: 'Bentuk bintang 5-sudut untuk rating/penghargaan',
      category: 'Bentuk',
      icon: <Star className="w-4 h-4 text-amber-400" />,
      action: () =>
        onAddElement(
          createBaseElement('star', 'Bintang', 140, 140, {
            fill: '#f59e0b',
          })
        ),
    },
    {
      id: 'arrow',
      title: 'Panah Arah Vektor',
      subtitle: 'Bentuk panah penunjuk alur diagram',
      category: 'Bentuk',
      icon: <MoveRight className="w-4 h-4 text-cyan-400" />,
      action: () =>
        onAddElement(
          createBaseElement('arrow', 'Panah', 160, 60, {
            fill: '#06b6d4',
          })
        ),
    },
    {
      id: 'hexagon',
      title: 'Segi Enam / Hexagon Vektor',
      subtitle: 'Bentuk sarang lebah geometris poligon 6-sisi',
      category: 'Bentuk',
      icon: <Hexagon className="w-4 h-4 text-emerald-400" />,
      action: () =>
        onAddElement(
          createBaseElement('hexagon', 'Segi Enam', 160, 160, {
            fill: '#10b981',
          })
        ),
    },
    {
      id: 'avatar',
      title: 'Avatar Profil Pengguna',
      subtitle: 'Foto profil bulat dengan status badge',
      category: 'UI Kit',
      icon: <UserCheck className="w-4 h-4 text-indigo-400" />,
      action: () =>
        onAddElement(
          createBaseElement('avatar', 'Avatar', 64, 64, {
            content: 'DF',
            fill: '#1e1b4b',
            stroke: '#6366f1',
            color: '#c7d2fe',
            shadow: 'md',
          })
        ),
    },
    {
      id: 'badge',
      title: 'Badge Pill Status',
      subtitle: 'Label pill dengan teks status atau verifikasi',
      category: 'UI Kit',
      icon: <Tag className="w-4 h-4 text-pink-400" />,
      action: () =>
        onAddElement(
          createBaseElement('badge-shape', 'Badge Pill', 130, 36, {
            content: 'NEW FEATURE',
            fill: 'rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            borderRadius: 9999,
          })
        ),
    },
    {
      id: 'line',
      title: 'Garis Pembatas (Divider)',
      subtitle: 'Garis tipis pemisah antar seksi',
      category: 'Bentuk',
      icon: <Minus className="w-4 h-4 text-slate-400" />,
      action: () =>
        onAddElement(
          createBaseElement('line', 'Garis Pembatas', 400, 4, {
            fill: '#475569',
          })
        ),
    },
    // Smart Blocks
    {
      id: 'block-timeline',
      title: 'Blok: Timeline 4 Tahap',
      subtitle: 'Rangkaian 4 fase alur penelitian berurutan',
      category: 'Blok AI',
      icon: <GitCommit className="w-4 h-4 text-emerald-400" />,
      action: () => {
        const block = SMART_BLOCKS.find(b => b.id === 'timeline-4-steps');
        if (block) onAddElements(block.generateElements(120, 360));
      },
    },
    {
      id: 'block-team',
      title: 'Blok: Profil Tim (3 Kolom)',
      subtitle: 'Tiga kartu tim dengan avatar dan jabatan',
      category: 'Blok AI',
      icon: <Users className="w-4 h-4 text-cyan-400" />,
      action: () => {
        const block = SMART_BLOCKS.find(b => b.id === 'team-3-cards');
        if (block) onAddElements(block.generateElements(160, 320));
      },
    },
    {
      id: 'block-swot',
      title: 'Blok: Matriks SWOT (4 Kuadran)',
      subtitle: 'Analisis Strengths, Weaknesses, Opportunities, Threats',
      category: 'Blok AI',
      icon: <Grid className="w-4 h-4 text-amber-400" />,
      action: () => {
        const block = SMART_BLOCKS.find(b => b.id === 'swot-matrix' || b.id === 'swot-analysis');
        if (block) onAddElements(block.generateElements(240, 260));
      },
    },
    {
      id: 'block-pricing',
      title: 'Blok: Paket Harga (3 Tier)',
      subtitle: 'Komparasi harga Starter, Pro, dan Enterprise',
      category: 'Blok AI',
      icon: <CreditCard className="w-4 h-4 text-pink-400" />,
      action: () => {
        const block = SMART_BLOCKS.find(b => b.id === 'pricing-3-tiers');
        if (block) onAddElements(block.generateElements(180, 280));
      },
    },
    {
      id: 'block-kpi',
      title: 'Blok: Dashboard 4 KPI & Metrik',
      subtitle: 'Empat kartu metrik statistik dan pertumbuhan persentase',
      category: 'Blok AI',
      icon: <TrendingUp className="w-4 h-4 text-sky-400" />,
      action: () => {
        const block = SMART_BLOCKS.find(b => b.id === 'kpi-dashboard-4-metrics');
        if (block) onAddElements(block.generateElements(80, 320));
      },
    },
    {
      id: 'block-problem-solution',
      title: 'Blok: Komparasi Masalah vs Solusi',
      subtitle: 'Dua kartu berdampingan untuk pitch deck masalah dan solusi',
      category: 'Blok AI',
      icon: <Split className="w-4 h-4 text-rose-400" />,
      action: () => {
        const block = SMART_BLOCKS.find(b => b.id === 'problem-solution-comparison');
        if (block) onAddElements(block.generateElements(120, 240));
      },
    },
  ];

  const filtered = commands.filter(
    c =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 select-none"
      onClick={onClose}
    >
      <div
        className="w-[520px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Input */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/60">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ketik nama komponen (misal: tombol, judul, tim, swot)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 border border-slate-700 rounded font-mono">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Tidak ada komponen yang cocok dengan "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-slate-800/60 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-white/20' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-xs truncate">{item.title}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-indigo-100' : 'text-slate-400'
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isSelected
                        ? 'border-white/30 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-500'
                    }`}
                  >
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="p-2.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-500 px-4">
          <span>Gunakan <kbd className="text-slate-400 font-mono">↑</kbd> <kbd className="text-slate-400 font-mono">↓</kbd> untuk memilih</span>
          <span>Tekan <kbd className="text-slate-400 font-mono">Enter ↵</kbd> untuk menyisipkan ke kanvas</span>
        </div>
      </div>
    </div>
  );
};
