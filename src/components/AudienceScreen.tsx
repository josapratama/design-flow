import React, { useState, useEffect } from 'react';
import { Slide } from '../types';
import { ElementRenderer } from './ElementRenderer';

export const AudienceScreen: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blankMode, setBlankMode] = useState<'none' | 'black' | 'white'>('none');
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  // Fade out top hint after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen to BroadcastChannel
  useEffect(() => {
    // Initial restore from localStorage
    try {
      const saved = localStorage.getItem('designflow_audience_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.slides) setSlides(parsed.slides);
        if (typeof parsed.currentIndex === 'number') setCurrentIndex(parsed.currentIndex);
        if (parsed.blankMode) setBlankMode(parsed.blankMode);
      }
    } catch (e) {
      console.warn('Gagal membaca saved audience state:', e);
    }

    const channel = new BroadcastChannel('designflow_presentation');

    channel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'SYNC_PROJECT') {
        if (data.slides) setSlides(data.slides);
        if (typeof data.currentIndex === 'number') setCurrentIndex(data.currentIndex);
        if (data.blankMode) setBlankMode(data.blankMode);
      } else if (data.type === 'SLIDE_CHANGE') {
        if (typeof data.index === 'number') setCurrentIndex(data.index);
      } else if (data.type === 'BLANK_MODE') {
        setBlankMode(data.mode);
      } else if (data.type === 'LASER_MOVE') {
        setLaserPos(data.pos);
      }
    };

    // Ask presenter for current state
    channel.postMessage({ type: 'REQUEST_SYNC' });

    return () => {
      channel.close();
    };
  }, []);

  const currentSlide = slides[currentIndex];

  if (!currentSlide) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-400 select-none font-sans">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center animate-pulse mb-4">
          <span className="w-3 h-3 rounded-full bg-indigo-500 animate-ping" />
        </div>
        <h2 className="text-base font-bold text-slate-100 mb-1">Menunggu Sinyal Presentasi...</h2>
        <p className="text-xs text-slate-500">
          Jendela ini akan otomatis menampilkan slide saat Anda memulai presentasi di jendela utama.
        </p>
      </div>
    );
  }

  const scale = Math.min(
    windowDimensions.width / currentSlide.width,
    windowDimensions.height / currentSlide.height
  );

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden select-none">
      {/* Subtle Hint */}
      {showHint && (
        <div className="absolute top-4 right-4 z-50 bg-slate-900/80 border border-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-full backdrop-blur-md animate-in fade-in transition-opacity">
          Layar Tampilan Audiens • Tekan <kbd className="text-indigo-300 font-bold">F11</kbd> untuk Layar Penuh
        </div>
      )}

      {/* Blank Screen Overlay */}
      {blankMode === 'black' && <div className="absolute inset-0 bg-black z-40 animate-in fade-in duration-150" />}
      {blankMode === 'white' && <div className="absolute inset-0 bg-white z-40 animate-in fade-in duration-150" />}

      {/* Slide Canvas */}
      <div
        className="relative shadow-2xl overflow-hidden shrink-0"
        style={{
          width: `${currentSlide.width}px`,
          height: `${currentSlide.height}px`,
          background: currentSlide.wallpaper
            ? `url('${currentSlide.wallpaper}') center / cover no-repeat`
            : currentSlide.background || '#0f172a',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {currentSlide.elements.map(el => (
          <div
            key={el.id}
            className="absolute"
            style={{
              left: `${el.x}px`,
              top: `${el.y}px`,
              width: `${el.width}px`,
              height: `${el.height}px`,
              zIndex: el.zIndex,
              transform: [
                el.rotation ? `rotate(${el.rotation}deg)` : '',
                el.flipX ? 'scaleX(-1)' : '',
                el.flipY ? 'scaleY(-1)' : '',
              ].filter(Boolean).join(' ') || undefined,
              opacity: el.opacity !== undefined ? el.opacity : 1,
            }}
          >
            <ElementRenderer element={el} isSelected={false} />
          </div>
        ))}
      </div>

      {/* Glowing Virtual Laser Pointer */}
      {laserPos && (
        <div
          className="absolute pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${laserPos.x}px`,
            top: `${laserPos.y}px`,
          }}
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-8 h-8 rounded-full bg-rose-500/30 animate-ping" />
            <span className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_18px_6px_rgba(244,63,94,0.9),0_0_6px_#fff]" />
          </div>
        </div>
      )}
    </div>
  );
};
