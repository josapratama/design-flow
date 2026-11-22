import React, { useState, useEffect, useRef } from 'react';
import { Slide } from '../types';
import { ElementRenderer } from './ElementRenderer';

interface DoodleStroke {
  color: string;
  points: Array<{ x: number; y: number }>;
}

interface LaserData {
  xRatio: number;
  yRatio: number;
  color?: string;
}

export const AudienceScreen: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blankMode, setBlankMode] = useState<'none' | 'black' | 'white'>('none');
  const [transitionEffect, setTransitionEffect] = useState<'fade' | 'slide' | 'zoom'>('fade');
  const [laserPos, setLaserPos] = useState<LaserData | null>(null);
  const [strokes, setStrokes] = useState<DoodleStroke[]>([]);
  const [showHint, setShowHint] = useState(true);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fade out top hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
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

  // Redraw doodle strokes on canvas whenever strokes or slide changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  }, [strokes, currentIndex]);

  // Listen to BroadcastChannel for synchronized presenter state
  useEffect(() => {
    // Initial restore from localStorage
    try {
      const saved = localStorage.getItem('designflow_audience_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.slides) setSlides(parsed.slides);
        if (typeof parsed.currentIndex === 'number') setCurrentIndex(parsed.currentIndex);
        if (parsed.blankMode) setBlankMode(parsed.blankMode);
        if (parsed.transitionEffect) setTransitionEffect(parsed.transitionEffect);
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
        if (data.transitionEffect) setTransitionEffect(data.transitionEffect);
        if (typeof data.currentIndex === 'number') {
          setCurrentIndex(prev => {
            if (prev !== data.currentIndex) {
              setStrokes([]);
            }
            return data.currentIndex;
          });
        }
        if (data.blankMode) setBlankMode(data.blankMode);
      } else if (data.type === 'SLIDE_CHANGE') {
        if (typeof data.index === 'number') {
          setCurrentIndex(data.index);
          setStrokes([]);
        }
      } else if (data.type === 'BLANK_MODE') {
        setBlankMode(data.mode);
      } else if (data.type === 'LASER_MOVE') {
        setLaserPos(data.pos);
      } else if (data.type === 'SYNC_STROKES') {
        setStrokes(data.strokes || []);
      }
    };

    // Ask presenter for current state
    channel.postMessage({ type: 'REQUEST_SYNC' });

    return () => {
      channel.close();
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

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
    <div
      onDoubleClick={handleToggleFullscreen}
      className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden select-none cursor-default"
      title="Klik ganda untuk beralih mode Layar Penuh"
    >
      {/* Subtle Hint */}
      {showHint && (
        <div className="absolute top-4 right-4 z-50 bg-slate-900/90 border border-slate-800 text-slate-300 text-xs px-3.5 py-1.5 rounded-full backdrop-blur-md animate-in fade-in transition-opacity shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Layar Audiens (Proyektor) • Dobel-klik / <kbd className="text-indigo-300 font-bold">F11</kbd> Layar Penuh</span>
        </div>
      )}

      {/* Blank Screen Overlay with Smooth Transition */}
      {blankMode === 'black' && (
        <div className="absolute inset-0 bg-black z-40 transition-opacity duration-300 animate-in fade-in" />
      )}
      {blankMode === 'white' && (
        <div className="absolute inset-0 bg-white z-40 transition-opacity duration-300 animate-in fade-in" />
      )}

      {/* Slide Canvas Container */}
      <div
        key={currentIndex}
        className={`relative shadow-2xl overflow-hidden shrink-0 ${
          transitionEffect === 'slide'
            ? 'animate-in slide-in-from-right-10 duration-300'
            : transitionEffect === 'zoom'
              ? 'animate-in zoom-in-95 duration-200'
              : 'animate-in fade-in duration-200'
        }`}
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
        {/* Slide Elements */}
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
              ]
                .filter(Boolean)
                .join(' ') || undefined,
              opacity: el.opacity !== undefined ? el.opacity : 1,
            }}
          >
            <ElementRenderer element={el} isSelected={false} />
          </div>
        ))}

        {/* Live Synchronized Doodle Canvas from Presenter */}
        <canvas
          ref={canvasRef}
          width={currentSlide.width}
          height={currentSlide.height}
          className="absolute inset-0 z-30 pointer-events-none"
        />

        {/* Glowing Virtual Laser Pointer accurately scaled inside slide */}
        {laserPos && (
          <div
            className="absolute pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${laserPos.xRatio * currentSlide.width}px`,
              top: `${laserPos.yRatio * currentSlide.height}px`,
            }}
          >
            <div className="relative flex items-center justify-center">
              <span
                className="absolute w-8 h-8 rounded-full animate-ping opacity-40"
                style={{ backgroundColor: laserPos.color || '#f43f5e' }}
              />
              <span
                className="w-4 h-4 rounded-full shadow-lg"
                style={{
                  backgroundColor: laserPos.color || '#f43f5e',
                  boxShadow: `0 0 18px 6px ${laserPos.color || '#f43f5e'}, 0 0 4px #fff`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
