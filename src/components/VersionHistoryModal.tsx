import React, { useState, useEffect } from 'react';
import {
  History,
  X,
  Plus,
  RotateCcw,
  Download,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import { DesignProject, Slide } from '../types';
import { useDialog } from './dialogs/DialogProvider';
import confetti from 'canvas-confetti';

interface VersionHistoryModalProps {
  project: DesignProject;
  onRestoreVersion: (slides: Slide[]) => void;
  onClose: () => void;
}

export interface ProjectCheckpoint {
  id: string;
  name: string;
  timestamp: string;
  slideCount: number;
  slides: Slide[];
}

const STORAGE_KEY = 'designflow_project_checkpoints';

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  project,
  onRestoreVersion,
  onClose,
}) => {
  const { confirm, alert } = useDialog();
  const [checkpoints, setCheckpoints] = useState<ProjectCheckpoint[]>([]);
  const [newCheckpointName, setNewCheckpointName] = useState('');
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string | null>(null);

  // Load saved checkpoints from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCheckpoints(parsed);
          if (parsed.length > 0) setSelectedCheckpointId(parsed[0].id);
        }
      }
    } catch {}
  }, []);

  const saveCheckpointsToStorage = (updated: ProjectCheckpoint[]) => {
    setCheckpoints(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleCreateCheckpoint = () => {
    const name = newCheckpointName.trim() || `Versi #${checkpoints.length + 1} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
    const newCheckpoint: ProjectCheckpoint = {
      id: `cp_${Date.now()}`,
      name,
      timestamp: new Date().toLocaleString(),
      slideCount: project.slides.length,
      slides: JSON.parse(JSON.stringify(project.slides)),
    };

    const updated = [newCheckpoint, ...checkpoints];
    saveCheckpointsToStorage(updated);
    setSelectedCheckpointId(newCheckpoint.id);
    setNewCheckpointName('');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleRestore = async (cp: ProjectCheckpoint) => {
    const isConfirmed = await confirm({
      title: 'Pulihkan Versi Proyek',
      message: `Pulihkan proyek ke versi "${cp.name}"? Seluruh slide yang aktif saat ini akan digantikan dengan cadangan dari ${cp.timestamp}.`,
      confirmText: 'Pulihkan Versi',
      cancelText: 'Batal',
      variant: 'danger',
    });

    if (isConfirmed) {
      onRestoreVersion(cp.slides);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      onClose();
    }
  };

  const handleDelete = async (cpId: string) => {
    const isConfirmed = await confirm({
      title: 'Hapus Checkpoint',
      message: 'Apakah Anda yakin ingin menghapus arsip versi ini?',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      variant: 'danger',
    });

    if (isConfirmed) {
      const updated = checkpoints.filter(c => c.id !== cpId);
      saveCheckpointsToStorage(updated);
      if (selectedCheckpointId === cpId) {
        setSelectedCheckpointId(updated[0]?.id || null);
      }
    }
  };

  const handleDownloadCheckpointJSON = (cp: ProjectCheckpoint) => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ ...project, slides: cp.slides }, null, 2)
    )}`;
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${project.title || 'designflow-project'}-${cp.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const selectedCheckpoint = checkpoints.find(c => c.id === selectedCheckpointId);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-5rem)] my-auto flex flex-col rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                Riwayat Versi Proyek & Checkpoints
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simpan dan pulihkan revisi proyek secara mandiri tanpa takut kehilangan progress
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create New Checkpoint Bar */}
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Nama versi baru (cth: 'Draft Revisi Bab 3', 'Siap Gladi Resik')..."
            value={newCheckpointName}
            onChange={e => setNewCheckpointName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreateCheckpoint();
            }}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-medium"
          />
          <button
            onClick={handleCreateCheckpoint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Simpan Versi Saat Ini</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Checkpoint List (Sidebar) */}
          <div className="w-full sm:w-80 border-r border-slate-800 overflow-y-auto p-3 space-y-2 shrink-0 bg-slate-950/20">
            {checkpoints.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-500 text-xs">
                <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="font-medium text-slate-400">Belum ada versi yang disimpan</p>
                <p className="text-[11px] mt-1 text-slate-600">
                  Tulis nama versi di atas dan klik Simpan untuk membuat checkpoint cadangan.
                </p>
              </div>
            ) : (
              checkpoints.map(cp => {
                const isSelected = selectedCheckpointId === cp.id;
                return (
                  <div
                    key={cp.id}
                    onClick={() => setSelectedCheckpointId(cp.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs truncate">{cp.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                        {cp.slideCount} slide
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{cp.timestamp}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Version Detail & Preview Pane */}
          <div className="hidden sm:flex flex-1 flex-col p-5 overflow-y-auto bg-slate-900/60">
            {selectedCheckpoint ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-base">{selectedCheckpoint.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dibuat pada {selectedCheckpoint.timestamp} • Terdiri dari {selectedCheckpoint.slideCount} slide
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadCheckpointJSON(selectedCheckpoint)}
                      title="Unduh Berkas JSON Versi Ini"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Unduh .json</span>
                    </button>
                    <button
                      onClick={() => handleDelete(selectedCheckpoint.id)}
                      title="Hapus Checkpoint Ini"
                      className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-xl transition-colors border border-slate-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRestore(selectedCheckpoint)}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Pulihkan Versi Ini</span>
                    </button>
                  </div>
                </div>

                {/* Slides Overview Grid */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Daftar Slide dalam Versi Ini:
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {selectedCheckpoint.slides.map((slide, idx) => (
                      <div
                        key={slide.id}
                        className="p-3 bg-slate-950 border border-slate-800/90 rounded-xl flex flex-col justify-between gap-2 shadow-inner"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300">
                            #{idx + 1}
                          </span>
                          <span className="text-[9px] text-slate-500">
                            {slide.elements.length} elemen
                          </span>
                        </div>
                        <span className="font-semibold text-xs text-slate-200 truncate">
                          {slide.title || `Slide ${idx + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Pilih versi di sebelah kiri untuk melihat rincian cadangan
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
