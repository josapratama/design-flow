import React from 'react';
import { DesignProject } from '../types';
import {
  BarChart2,
  Clock,
  FileText,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DeckStatsModalProps {
  isOpen: boolean;
  project: DesignProject;
  onClose: () => void;
  onSelectSlide: (slideId: string) => void;
}

export const DeckStatsModal: React.FC<DeckStatsModalProps> = ({
  isOpen,
  project,
  onClose,
  onSelectSlide,
}) => {
  if (!isOpen) return null;

  const totalSlides = project.slides.length;

  let totalElements = 0;
  let textElementCount = 0;
  let imageElementCount = 0;
  let chartTableCount = 0;
  let totalNotesWords = 0;
  const slidesWithoutNotes: Array<{ id: string; index: number; title: string }> = [];

  project.slides.forEach((slide, index) => {
    totalElements += slide.elements.length;

    slide.elements.forEach(el => {
      if (el.type === 'heading' || el.type === 'text' || el.type === 'quote') {
        textElementCount++;
      } else if (el.type === 'image' || el.type === 'avatar') {
        imageElementCount++;
      } else if (el.type === 'chart' || el.type === 'table') {
        chartTableCount++;
      }
    });

    const notes = slide.notes?.trim() || '';
    if (notes) {
      const words = notes.split(/\s+/).filter(Boolean).length;
      totalNotesWords += words;
    } else {
      slidesWithoutNotes.push({ id: slide.id, index: index + 1, title: slide.title });
    }
  });

  // Presentation Pacing Calculation:
  // Standard presentation pace: ~130 words per minute + 15 seconds per slide transition
  const speakingMinutes = totalNotesWords / 130;
  const slidePacingMinutes = (totalSlides * 15) / 60;
  const totalEstimatedMinutes = Math.max(1, Math.round(speakingMinutes + slidePacingMinutes));

  const notesCoveragePercent =
    totalSlides > 0 ? Math.round(((totalSlides - slidesWithoutNotes.length) / totalSlides) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 md:p-8 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-5rem)] my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Statistik & Kesiapan Presentasi</h3>
              <p className="text-xs text-slate-400">
                Analisis pacing bicara, kepadatan elemen, dan kesiapan naskah pembicara
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 flex-1 min-h-0 overflow-y-auto">
          {/* Top 3 High-Impact KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total Slide</span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{totalSlides}</div>
              <span className="text-[10px] text-slate-500 mt-1">
                Rata-rata {totalSlides > 0 ? (totalElements / totalSlides).toFixed(1) : 0} elemen/slide
              </span>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Estimasi Durasi</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-300 font-mono">
                ~{totalEstimatedMinutes} Menit
              </div>
              <span className="text-[10px] text-slate-500 mt-1">
                Kecepatan ~130 kata/menit
              </span>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Naskah Pembicara</span>
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono">
                {totalNotesWords} Kata
              </div>
              <span className="text-[10px] text-slate-500 mt-1">
                Kesiapan naskah {notesCoveragePercent}%
              </span>
            </div>
          </div>

          {/* Breakdown Element Details */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Distribusi Konten & Visual
              </span>
              <span className="text-xs font-mono text-indigo-400 font-semibold">
                {totalElements} Elemen Grafis
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Teks & Tipografi</span>
                <span className="text-sm font-bold text-slate-100 font-mono">{textElementCount}</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Foto & Ilustrasi</span>
                <span className="text-sm font-bold text-slate-100 font-mono">{imageElementCount}</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5">Grafik & Tabel</span>
                <span className="text-sm font-bold text-slate-100 font-mono">{chartTableCount}</span>
              </div>
            </div>
          </div>

          {/* Speaker Notes Readiness Checklist */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Kesiapan Naskah Pembicara
                </span>
                {slidesWithoutNotes.length === 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Lengkap 100%
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {slidesWithoutNotes.length} Slide Belum Ada Catatan
                  </span>
                )}
              </div>
            </div>

            {slidesWithoutNotes.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-center space-y-1">
                <p className="text-xs font-semibold text-emerald-300">
                  🎉 Luar biasa! Seluruh slide Anda telah dilengkapi naskah pembicara.
                </p>
                <p className="text-[11px] text-slate-400">
                  Anda siap melakukan gladi resik presentasi di Mode Slideshow (F5).
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {slidesWithoutNotes.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 shrink-0 font-bold">
                        #{item.index}
                      </span>
                      <span className="text-slate-200 truncate font-medium">{item.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSlide(item.id);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <span>Buka Slide</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Pacing estimasi didasarkan pada standar presentasi TED & Sidang Akademik.
          </span>
          <button
            onClick={() => {
              confetti({ particleCount: 40, spread: 55, origin: { y: 0.7 } });
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-md shadow-indigo-600/30"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
