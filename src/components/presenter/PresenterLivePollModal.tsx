import React from 'react';
import { BarChart3, Plus, RotateCcw, Trophy, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface LivePollOption {
  id: string;
  label: string;
  text: string;
  votes: number;
  color: string;
}

export interface LivePollState {
  isOpen: boolean;
  question: string;
  options: LivePollOption[];
  winnerId: string | null;
}

export const DEFAULT_POLL_STATE: LivePollState = {
  isOpen: false,
  question: 'Bagaimana pendapat Anda mengenai solusi arsitektur yang dipaparkan?',
  winnerId: null,
  options: [
    { id: 'A', label: 'A', text: 'Sangat Inovatif & Siap Implementasi', votes: 0, color: '#6366f1' },
    { id: 'B', label: 'B', text: 'Menarik, Perlu Uji Skala Lebih Lanjut', votes: 0, color: '#06b6d4' },
    { id: 'C', label: 'C', text: 'Fokus pada Optimasi Efisiensi Biaya', votes: 0, color: '#10b981' },
    { id: 'D', label: 'D', text: 'Ada Pertanyaan / Diskusi Tambahan', votes: 0, color: '#f59e0b' },
  ],
};

interface PresenterLivePollModalProps {
  poll: LivePollState;
  onUpdatePoll: (next: LivePollState) => void;
  onClose: () => void;
  onTriggerConfetti?: () => void;
}

export const PresenterLivePollModal: React.FC<PresenterLivePollModalProps> = ({
  poll,
  onUpdatePoll,
  onClose,
  onTriggerConfetti,
}) => {
  if (!poll.isOpen) return null;

  const totalVotes = poll.options.reduce((acc, o) => acc + o.votes, 0);

  const handleVote = (id: string, delta = 1) => {
    const nextOptions = poll.options.map(o =>
      o.id === id ? { ...o, votes: Math.max(0, o.votes + delta) } : o
    );
    onUpdatePoll({ ...poll, options: nextOptions, winnerId: null });
  };

  const handleOptionTextChange = (id: string, text: string) => {
    const nextOptions = poll.options.map(o => (o.id === id ? { ...o, text } : o));
    onUpdatePoll({ ...poll, options: nextOptions });
  };

  const handleResetVotes = () => {
    onUpdatePoll({
      ...poll,
      winnerId: null,
      options: poll.options.map(o => ({ ...o, votes: 0 })),
    });
  };

  const handleAnnounceWinner = () => {
    if (totalVotes === 0) return;
    const sorted = [...poll.options].sort((a, b) => b.votes - a.votes);
    const top = sorted[0];
    onUpdatePoll({ ...poll, winnerId: top.id });
    confetti({ particleCount: 95, spread: 80, origin: { y: 0.6 } });
    onTriggerConfetti?.();
  };

  const applyPreset = (q: string, opts: string[]) => {
    onUpdatePoll({
      ...poll,
      question: q,
      winnerId: null,
      options: poll.options.map((o, idx) => ({
        ...o,
        text: opts[idx] || o.text,
        votes: 0,
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-5rem)] bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Live Interactive Poll & Voting Audiens</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE SYNC
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tersinkronisasi otomatis ke Layar Proyektor / Audiens secara real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Sembunyikan Panel Poll"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Template Cepat:
            </span>
            <button
              type="button"
              onClick={() =>
                applyPreset('Seberapa jelas pemaparan materi pada bagian ini?', [
                  'Sangat Jelas & Mudah Dipahami',
                  'Cukup Jelas, Butuh Contoh Kasus',
                  'Perlu Pendalaman Teknis',
                  'Ingin Bertanya Langsung',
                ])
              }
              className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Pemahaman Materi
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset('Manakah prioritas fitur tahap pengembangan berikutnya?', [
                  'Integrasi AI & Automasi Cerdas',
                  'Optimasi Performa & Keamanan',
                  'Aplikasi Mobile Native (iOS/Android)',
                  'Analitik & Ekspor Laporan',
                ])
              }
              className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Prioritas Roadmap
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset('Apakah Anda setuju dengan hipotesis & kesimpulan riset ini?', [
                  'Sangat Setuju (Data Kuat)',
                  'Setuju dengan Catatan Minor',
                  'Netral / Butuh Eksperimen Tambahan',
                  'Kurang Setuju',
                ])
              }
              className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Sidang & Riset
            </button>
          </div>

          {/* Question Input */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Pertanyaan Polling
            </label>
            <input
              type="text"
              value={poll.question}
              onChange={e => onUpdatePoll({ ...poll, question: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm font-bold text-white outline-none"
              placeholder="Ketik pertanyaan untuk audiens..."
            />
          </div>

          {/* Options List with Animated Bars */}
          <div className="space-y-2.5">
            {poll.options.map(opt => {
              const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              const isWinner = poll.winnerId === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`p-3 rounded-xl border transition-all relative overflow-hidden ${
                    isWinner
                      ? 'bg-indigo-950/60 border-amber-400 ring-2 ring-amber-400/30'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Background Progress Fill */}
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-500 pointer-events-none opacity-20"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: opt.color,
                    }}
                  />

                  <div className="relative z-10 flex items-center gap-3">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-extrabold text-xs text-white shrink-0 shadow"
                      style={{ backgroundColor: opt.color }}
                    >
                      {opt.label}
                    </span>

                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={opt.text}
                        onChange={e => handleOptionTextChange(opt.id, e.target.value)}
                        className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-100 outline-none focus:underline truncate"
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: opt.color }}
                          />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-300 w-20 text-right">
                          {opt.votes} ({pct}%)
                        </span>
                      </div>
                    </div>

                    {isWinner && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <Trophy className="w-3 h-3" />
                        Terbanyak
                      </span>
                    )}

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleVote(opt.id, -1)}
                        disabled={opt.votes === 0}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 font-mono text-xs flex items-center justify-center"
                        title="Kurangi 1 suara"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVote(opt.id, 1)}
                        className="px-2.5 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 shadow"
                        title="Tambah 1 suara"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Suara</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-slate-400">
            Total Suara Masuk:{' '}
            <strong className="text-white font-mono text-sm">{totalVotes}</strong> responden
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetVotes}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleAnnounceWinner}
              disabled={totalVotes === 0}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Umumkan Hasil 🎉</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
