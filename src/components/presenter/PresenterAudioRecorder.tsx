import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Download, Volume2, Sparkles, X, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PresenterAudioRecorderProps {
  currentSlideIndex: number;
  totalSlides: number;
  onClose: () => void;
}

interface SlideTimestamp {
  slideIndex: number;
  timeOffsetSeconds: number;
}

export const PresenterAudioRecorder: React.FC<PresenterAudioRecorderProps> = ({
  currentSlideIndex,
  totalSlides,
  onClose,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideTimestamps, setSlideTimestamps] = useState<SlideTimestamp[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Track slide index change during active recording
  useEffect(() => {
    if (isRecording) {
      setSlideTimestamps(prev => [
        ...prev,
        { slideIndex: currentSlideIndex + 1, timeOffsetSeconds: recordSeconds },
      ]);
    }
  }, [currentSlideIndex, isRecording]);

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = window.setInterval(() => {
        setRecordSeconds(s => s + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordSeconds(0);
      setSlideTimestamps([{ slideIndex: currentSlideIndex + 1, timeOffsetSeconds: 0 }]);
    } catch (err) {
      alert('Gagal mengakses mikrofon. Pastikan Anda telah memberikan izin mikrofon di browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDownloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `narasi-presentasi-${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const togglePlayback = () => {
    if (!audioElementRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      audio.onended = () => setIsPlaying(false);
    }

    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-16 right-6 z-50 w-80 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl p-4 backdrop-blur-xl animate-in slide-in-from-top-3 duration-150 text-slate-200 select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isRecording ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-indigo-500/20 text-indigo-400'}`}>
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Perekam Narasi Presentasi</h4>
            <p className="text-[10px] text-slate-400">Audio sinkron pergantian slide</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Recording Display & Timer */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isRecording && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />}
          <span className="font-mono text-2xl font-bold tracking-wider text-white">
            {formatTime(recordSeconds)}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          {isRecording
            ? `Sedang merekam pada Slide ${currentSlideIndex + 1} dari ${totalSlides}...`
            : audioUrl
            ? 'Rekaman selesai & siap diputar'
            : 'Tekan tombol rekam untuk mulai latihan bicara'}
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            <Mic className="w-4 h-4" />
            <span>Mulai Rekam Suara</span>
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 shadow-lg transition-all active:scale-95"
          >
            <Square className="w-4 h-4 text-rose-400" />
            <span>Selesai & Simpan</span>
          </button>
        )}

        {audioUrl && !isRecording && (
          <>
            <button
              onClick={togglePlayback}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Jeda' : 'Putar Audio'}</span>
            </button>
            <button
              onClick={handleDownloadAudio}
              title="Unduh Berkas Audio WebM"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700"
            >
              <Download className="w-4 h-4 text-indigo-400" />
            </button>
            <button
              onClick={() => {
                setAudioUrl(null);
                setRecordSeconds(0);
                setSlideTimestamps([]);
              }}
              title="Rekam Ulang"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
            </button>
          </>
        )}
      </div>

      {/* Slide Timestamp Markers */}
      {slideTimestamps.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Riwayat Pergantian Slide:
          </span>
          <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
            {slideTimestamps.map((st, i) => (
              <div key={i} className="flex items-center justify-between text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded">
                <span>Slide #{st.slideIndex}</span>
                <span className="text-indigo-400">{formatTime(st.timeOffsetSeconds)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
