import React from 'react';
import { HelpCircle, X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  items: ShortcutItem[];
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const categories: ShortcutCategory[] = [
    {
      title: 'Kanvas & Navigasi',
      items: [
        { keys: ['Spasi', 'Drag'], description: 'Alat Tangan (Pan Kanvas bebas)' },
        { keys: ['Ctrl', 'Wheel'], description: 'Perbesar / Perkecil Kanvas (Zoom)' },
        { keys: ['Ctrl', '0'], description: 'Sesuaikan Kanvas ke Layar (Fit Screen)' },
        { keys: ['Shift', '2'], description: 'Zoom ke Elemen Terpilih (Zoom to Selection)' },
        { keys: ['Shift', 'R'], description: 'Nyalakan / Matikan Penggaris Piksel (Rulers)' },
        { keys: ['Shift', 'M'], description: 'Nyalakan / Matikan Batas Area Aman (Safe Margin)' },
        { keys: ['Shift', 'F'], description: 'Mode Fokus Kanvas / Sembunyikan Panel (Zen Mode)' },
        { keys: ['Alt', 'S'], description: 'Buka Pengatur Kisi Slide (Slide Sorter / Light Table: 3/4/6 Kolom)' },
        { keys: ['Alt', 'C'], description: 'Buka / Tutup Editor Kode DSL (Declarative Design DSL)' },
        { keys: ['Format DSL'], description: 'Format dan rapikan kode DSL otomatis dengan 1 klik' },
        { keys: ['Ctrl', 'Enter'], description: 'Terapkan Perubahan Kode DSL ke Kanvas Visual' },
        { keys: ['Tab', 'Shift+Tab'], description: 'Indent / Outdent 2 spasi di Editor Kode DSL' },
        { keys: ['Ctrl', 'F'], description: 'Cari & Ganti Teks / Warna Token di Editor DSL (Find & Replace)' },
        { keys: ['Ctrl', 'K'], description: 'Buka Spotlight Command Palette Cepat' },
        { keys: ['Ctrl', 'H'], description: 'Buka Dialog Cari & Ganti Teks (Find & Replace)' },
        { keys: ['Ctrl', 'E'], description: 'Buka Modal Ekspor Desain (PNG/WebP/PDF/React)' },
        { keys: ['Ctrl', 'Shift', 'C'], description: 'Salin Gambar Artboard Aktif ke Clipboard (PNG 2x)' },
        { keys: ['Ctrl', 'Shift', '↑ / ↓'], description: 'Pindah urutan posisi slide aktif naik / turun' },
        { keys: ['Statistik Dek'], description: 'Analisis durasi bicara & kesiapan naskah pembicara' },
        { keys: ['←', '→'], description: 'Pindah slide saat kanvas kosong (Idle Slide Navigation)' },
        { keys: ['Drag Kartu Slide'], description: 'Geser & susun ulang urutan slide langsung di Slide Strip atau Sorter' },
        { keys: ['Double-Click Judul'], description: 'Ubah nama slide langsung di thumbnail slide strip' },
      ],
    },
    {
      title: 'Manipulasi & Edit Elemen',
      items: [
        { keys: ['Double-Click Teks'], description: 'Edit teks langsung pada kanvas (WYSIWYG)' },
        { keys: ['Ctrl', 'C'], description: 'Salin elemen ke clipboard antar-slide' },
        { keys: ['Ctrl', 'V'], description: 'Tempel elemen dari clipboard' },
        { keys: ['Ctrl', 'Alt', 'C'], description: 'Salin gaya visual elemen (Format Painter)' },
        { keys: ['Ctrl', 'Alt', 'V'], description: 'Tempel gaya visual ke elemen terpilih' },
        { keys: ['Ctrl', 'D'], description: 'Duplikat elemen terpilih instan' },
        { keys: ['Ctrl', 'Shift', 'D'], description: 'Duplikat slide aktif instan' },
        { keys: ['Alt', 'Drag'], description: 'Duplikat elemen instan saat digeser di kanvas' },
        { keys: ['Smart Guides'], description: 'Garis magnetik presisi dengan badge piksel posisi real-time' },
        { keys: ['Delete'], description: 'Hapus elemen yang dipilih' },
        { keys: ['Shift', 'Drag'], description: 'Kunci rasio aspek proporsional saat resize' },
        { keys: ['Shift', 'Putar'], description: 'Snap rotasi presisi per 15 derajat' },
      ],
    },
    {
      title: 'Seleksi, Perataan & Kelompok',
      items: [
        { keys: ['Ctrl', 'A'], description: 'Pilih semua elemen pada slide aktif' },
        { keys: ['Escape'], description: 'Batalkan seluruh seleksi (Deselect All)' },
        { keys: ['Ctrl', 'G'], description: 'Kelompokkan elemen terpilih (Group)' },
        { keys: ['Ctrl', 'Shift', 'G'], description: 'Pisahkan kelompok elemen (Ungroup)' },
        { keys: ['Panah'], description: 'Geser posisi elemen 1 piksel' },
        { keys: ['Shift', 'Panah'], description: 'Geser posisi elemen 10 piksel' },
        { keys: ['Marquee Drag'], description: 'Pilih banyak elemen sekaligus di background' },
      ],
    },
    {
      title: 'Riwayat & Mode Presentasi',
      items: [
        { keys: ['F5'], description: 'Mulai Mode Slideshow Presentasi Interaktif' },
        { keys: ['0-9', 'Enter'], description: 'Lompat langsung ke nomor slide tertentu saat Q&A (misal: 4 + Enter)' },
        { keys: ['Home', 'End'], description: 'Lompat langsung ke slide pertama atau terakhir' },
        { keys: ['B'], description: 'Layar Kosong Hitam (Black Screen) untuk fokus audiens' },
        { keys: ['W'], description: 'Layar Kosong Putih (White Screen) untuk diskusi' },
        { keys: ['Ctrl', 'Z'], description: 'Urungkan tindakan terakhir (Undo)' },
        { keys: ['Ctrl', 'Y'], description: 'Ulangi tindakan (Redo)' },
        { keys: ['L'], description: 'Nyalakan / Matikan Laser Pointer saat presentasi' },
        { keys: ['P'], description: 'Nyalakan / Matikan Alat Pena Coretan (Doodle Annotation)' },
        { keys: ['Kuas (2/4/8px)'], description: 'Pilih ketebalan garis kuas pena coretan saat presentasi' },
        { keys: ['U'], description: 'Batalkan coretan pena terakhir (Undo Stroke)' },
        { keys: ['C'], description: 'Hapus seluruh coretan pena pada slide' },
        { keys: ['G'], description: 'Buka laci kisi miniatur slide & pencarian cepat di mode presentasi' },
        { keys: ['Laci Slide'], description: 'Buka laci miniatur slide pada kontrol untuk lompat langsung 1-klik' },
        { keys: ['N'], description: 'Tampilkan / Sembunyikan Catatan Pembicara' },
        { keys: ['Auto-Scroll'], description: 'Gulir otomatis teks catatan pembicara (Teleprompter) dengan kecepatan 1-3x' },
        { keys: ['M'], description: 'Aktifkan / Matikan Efek Suara Slide' },
        { keys: ['F'], description: 'Mode Layar Penuh (Fullscreen)' },
        { keys: ['→', 'Spasi'], description: 'Pindah ke slide berikutnya' },
        { keys: ['←'], description: 'Kembali ke slide sebelumnya' },
        { keys: ['Swipe ◄/►'], description: 'Usap layar sentuh (Tablet / HP) ke kiri/kanan untuk ganti slide' },
        { keys: ['PgUp', 'PgDn'], description: 'Dukungan Remote Clicker Nirkabel di Layar Utama & Audiens' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Daftar Pintasan Keyboard (Shortcuts)</h3>
              <p className="text-[11px] text-slate-400">Tingkatkan efisiensi kerja desain Anda seperti di Figma & Canva</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Categories Grid */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block border-b border-slate-800 pb-1">
                {cat.title}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {cat.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-2"
                  >
                    <span className="text-slate-300 text-[11px] truncate">{item.description}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[10px] font-semibold shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tips: Anda juga dapat menekan tombol <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-[10px]">?</kbd> kapan saja untuk membuka panduan ini.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
