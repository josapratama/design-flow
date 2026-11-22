import React from 'react';
import { HelpCircle, X } from 'lucide-react';

interface PresenterShortcutsHudProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresenterShortcutsHud: React.FC<PresenterShortcutsHudProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8 animate-in fade-in duration-150"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 shadow-2xl text-slate-200 animate-in zoom-in-95 duration-150 space-y-4 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-5rem)] my-auto overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Panduan Tombol Pintas Presentasi</h3>
              <p className="text-[11px] text-slate-400">Pintasan keyboard cepat saat mode slideshow aktif</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Navigasi Slide</span>
            <div className="flex justify-between items-center text-slate-300">
              <span>Slide Berikutnya</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">Spasi / →</kbd>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Slide Sebelumnya</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">← / Backspace</kbd>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Slide Awal / Akhir</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">Home / End</kbd>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Lompat ke Slide X</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">0-9 + Enter</kbd>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Laci Kisi & Cari Slide</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">G</kbd>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Layar & Interaksi</span>
            <div className="flex justify-between items-center text-slate-300">
              <span>Laser Pointer</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">L</kbd>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Spotlight Sorot Panggung</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">S</kbd>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Pena Coretan Doodle</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">P</kbd>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Undo Coretan</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">U / Ctrl+Z</kbd>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Hapus Semua Coretan</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">C</kbd>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Fokus Audiens</span>
            <div className="flex justify-between items-center text-slate-300">
              <span>Layar Hitam (Black)</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-rose-300">B / .</kbd>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Layar Putih (White)</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-rose-300">W / ,</kbd>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Layar Penuh (Toggle)</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-rose-300">F / F11</kbd>
            </div>
          </div>

          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Presenter & Audio</span>
            <div className="flex justify-between items-center text-slate-300">
              <span>Panel Catatan Naskah</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">N</kbd>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Mute / Unmute Suara</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">M</kbd>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Tutup Panduan / Keluar</span>
              <kbd className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">Esc</kbd>
            </div>
          </div>
        </div>

        <div className="text-center pt-1 text-[11px] text-slate-500 font-mono">
          Tekan <kbd className="text-indigo-400">Esc</kbd> atau klik di luar untuk menutup
        </div>
      </div>
    </div>
  );
};
