import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Slide } from '../types';
import { ElementRenderer } from './ElementRenderer';
import { getSlideBackground } from '../utils/slideStyle';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
  CircleDot,
  Volume2,
  VolumeX,
  FileEdit,
  RotateCcw,
  Pen,
  Eraser,
  EyeOff,
  ExternalLink,
  FileDown,
  Undo2,
  HelpCircle,
  PartyPopper,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  Smile,
  Check,
  Clock,
  Sparkles,
  Lightbulb,
  Tv,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/audioEffects';

interface PresenterModalProps {
  slides: Slide[];
  projectTitle?: string;
  initialSlideIndex?: number;
  onUpdateSlideNotes?: (slideId: string, notes: string) => void;
  onClose: () => void;
}

export const PresenterModal: React.FC<PresenterModalProps> = ({
  slides,
  projectTitle,
  initialSlideIndex = 0,
  onUpdateSlideNotes,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [blankMode, setBlankMode] = useState<'none' | 'black' | 'white'>('none');
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [isSpotlightActive, setIsSpotlightActive] = useState(false);
  const [isPodiumMode, setIsPodiumMode] = useState(false);
  const [laserColor, setLaserColor] = useState('#f43f5e');
  const [isPenActive, setIsPenActive] = useState(false);
  const [penColor, setPenColor] = useState('#f43f5e');
  const [penWidth, setPenWidth] = useState<number>(4);
  const [showSlideNavigator, setShowSlideNavigator] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [isSoundMuted, setIsSoundMuted] = useState(!soundEffects.isSoundEnabled());
  const [laserPos, setLaserPos] = useState({ x: -100, y: -100 });
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(5);
  const [autoPlayRemaining, setAutoPlayRemaining] = useState(5);
  const [transitionEffect, setTransitionEffect] = useState<'fade' | 'slide' | 'zoom'>('fade');
  const [notesFontSize, setNotesFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [jumpBuffer, setJumpBuffer] = useState<string>('');
  const jumpTimerRef = useRef<any>(null);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);
  const [soundToast, setSoundToast] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Array<{ id: number; emoji: string; left: number }>>([]);
  const [showPresenterOptions, setShowPresenterOptions] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [isControlsIdle, setIsControlsIdle] = useState(false);
  const [isTeleprompterRunning, setIsTeleprompterRunning] = useState(false);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState<number>(1);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
  const podiumTextareaRef = useRef<HTMLTextAreaElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const idleTimerRef = useRef<any>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const reactionMenuRef = useRef<HTMLDivElement>(null);

  const resetIdleTimer = useCallback(() => {
    setIsControlsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isPodiumMode) return;
    idleTimerRef.current = setTimeout(() => {
      if (!showPresenterOptions && !showReactionMenu && !showSlideNavigator && !showHelpOverlay) {
        setIsControlsIdle(true);
      }
    }, 3000);
  }, [isPodiumMode, showPresenterOptions, showReactionMenu, showSlideNavigator, showHelpOverlay]);

  useEffect(() => {
    const handleActivity = () => resetIdleTimer();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [resetIdleTimer]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target as Node)) {
        setShowPresenterOptions(false);
      }
      if (reactionMenuRef.current && !reactionMenuRef.current.contains(e.target as Node)) {
        setShowReactionMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerFloatingReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    const left = Math.floor(Math.random() * 70) + 15;
    setReactions(prev => [...prev.slice(-15), { id, emoji, left }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2200);
  };
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });
  const [slideAreaBounds, setSlideAreaBounds] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const slideAreaRef = useRef<HTMLDivElement>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  // ResizeObserver to measure exact slide viewport space and prevent slide clipping
  useEffect(() => {
    const el = slideAreaRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSlideAreaBounds({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showNotes, isFullscreen, isPodiumMode]);
  const penCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPenPosRef = useRef<{ x: number; y: number } | null>(null);

  // Doodle stroke history for Undo
  interface DoodleStroke {
    color: string;
    width: number;
    points: Array<{ x: number; y: number }>;
  }
  const strokesRef = useRef<DoodleStroke[]>([]);
  const currentStrokeRef = useRef<DoodleStroke | null>(null);

  // Broadcast channel for dual-screen audience window
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel('designflow_presentation');

    channelRef.current.onmessage = event => {
      if (event.data?.type === 'REQUEST_SYNC') {
        channelRef.current?.postMessage({
          type: 'SYNC_PROJECT',
          slides,
          currentIndex,
          blankMode,
          transitionEffect,
        });
      } else if (event.data?.type === 'SLIDE_CHANGE' && typeof event.data.index === 'number') {
        setCurrentIndex(event.data.index);
        soundEffects.playSlideTransition();
      } else if (event.data?.type === 'BLANK_MODE' && event.data.mode) {
        setBlankMode(event.data.mode);
      } else if (event.data?.type === 'REACTION' && event.data.emoji) {
        triggerFloatingReaction(event.data.emoji);
      }
    };

    try {
      localStorage.setItem(
        'designflow_audience_state',
        JSON.stringify({ slides, currentIndex, blankMode, transitionEffect })
      );
    } catch { }

    channelRef.current.postMessage({
      type: 'SYNC_PROJECT',
      slides,
      currentIndex,
      blankMode,
      transitionEffect,
    });

    return () => {
      channelRef.current?.close();
    };
  }, [slides, currentIndex, blankMode, transitionEffect]);

  useEffect(() => {
    if (!isLaserActive && !isSpotlightActive) {
      channelRef.current?.postMessage({
        type: 'LASER_MOVE',
        pos: null,
      });
    }
  }, [isLaserActive, isSpotlightActive]);

  const openAudienceWindow = () => {
    window.open(
      '/?mode=audience',
      'DesignFlowAudienceScreen',
      'width=1280,height=720,menubar=no,toolbar=no'
    );
  };

  const downloadSpeakerNotes = () => {
    const title = projectTitle || 'Presentasi';
    const lines = [
      `# Naskah Pembicara: ${title}`,
      `Total Slide: ${slides.length} | Dibuat dengan DesignFlow Studio`,
      '',
      '============================================================',
      '',
    ];

    slides.forEach((s, idx) => {
      lines.push(`## Slide ${idx + 1}: ${s.title}`);
      lines.push(
        s.notes && s.notes.trim()
          ? s.notes.trim()
          : '*(Tidak ada catatan khusus untuk slide ini)*'
      );
      lines.push('');
      lines.push('------------------------------------------------------------');
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_naskah_pembicara.md`;
    link.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 40, spread: 45, origin: { y: 0.6 } });
  };

  const redrawCanvasStrokes = () => {
    const canvas = penCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokesRef.current.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width || 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  };

  const broadcastStrokes = (strokes: DoodleStroke[]) => {
    channelRef.current?.postMessage({
      type: 'SYNC_STROKES',
      strokes,
    });
  };

  const undoPenStroke = () => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current.pop();
    redrawCanvasStrokes();
    broadcastStrokes(strokesRef.current);
  };

  const clearPenCanvas = () => {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    const canvas = penCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    broadcastStrokes([]);
  };

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = penCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePenPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPenActive) return;
    isDrawingRef.current = true;
    const coords = getCanvasCoords(e);
    lastPenPosRef.current = coords;
    currentStrokeRef.current = {
      color: penColor,
      width: penWidth,
      points: [coords],
    };
  };

  const handlePenPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPenActive || !isDrawingRef.current || !lastPenPosRef.current) return;
    const canvas = penCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    currentStrokeRef.current?.points.push(coords);

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPenPosRef.current.x, lastPenPosRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastPenPosRef.current = coords;
  };

  const handlePenPointerUp = () => {
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
      strokesRef.current.push(currentStrokeRef.current);
      broadcastStrokes(strokesRef.current);
    }
    currentStrokeRef.current = null;
    isDrawingRef.current = false;
    lastPenPosRef.current = null;
  };

  // Reset auto-play countdown whenever slide or auto-play interval changes
  useEffect(() => {
    setAutoPlayRemaining(autoPlayInterval);
  }, [currentIndex, autoPlayInterval, isAutoPlay]);

  // Auto-play interval with countdown
  useEffect(() => {
    let timer: any;
    if (isAutoPlay) {
      timer = setInterval(() => {
        setAutoPlayRemaining(prev => {
          if (prev <= 1) {
            goToNext();
            return autoPlayInterval;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlay, autoPlayInterval, slides.length, currentIndex]);

  // Timer interval & Target Minutes Alert
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed(sec => {
          const nextSec = sec + 1;
          if (targetMinutes > 0 && nextSec === targetMinutes * 60) {
            soundEffects.playTimerAlert();
          }
          return nextSec;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, targetMinutes]);

  // Teleprompter Auto-Scroll Effect for Speaker Notes
  useEffect(() => {
    let interval: any;
    if (isTeleprompterRunning) {
      interval = setInterval(() => {
        if (isPodiumMode && podiumTextareaRef.current) {
          podiumTextareaRef.current.scrollTop += teleprompterSpeed;
        } else if (notesTextareaRef.current) {
          notesTextareaRef.current.scrollTop += teleprompterSpeed;
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isTeleprompterRunning, teleprompterSpeed, isPodiumMode]);

  // Touch Swipe Handlers for Tablet / Mobile Presentation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isPenActive) return;
    if (e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isPenActive || touchStartXRef.current === null || touchStartYRef.current === null) return;
    if (e.changedTouches.length > 0) {
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
      touchStartXRef.current = null;
      touchStartYRef.current = null;
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
        if (deltaX < 0) {
          goToNext();
        } else {
          goToPrev();
        }
      }
    }
  };

  // Window resize listener for responsive scaling
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in notes textarea
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return;
      }

      if (blankMode !== 'none') {
        setBlankMode('none');
        return;
      }

      // Quick Slide Jumping by Numbers (e.g. "3" + Enter)
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        setJumpBuffer(prev => {
          const next = (prev + e.key).slice(0, 3);
          clearTimeout(jumpTimerRef.current);
          jumpTimerRef.current = setTimeout(() => {
            setJumpBuffer('');
          }, 2500);
          return next;
        });
        return;
      }

      if (e.key === 'Enter' && jumpBuffer) {
        e.preventDefault();
        const target = parseInt(jumpBuffer, 10);
        if (target >= 1 && target <= slides.length) {
          clearPenCanvas();
          setCurrentIndex(target - 1);
          soundEffects.playSlideTransition();
        }
        setJumpBuffer('');
        clearTimeout(jumpTimerRef.current);
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrev();
      } else if (e.key === 'Home') {
        clearPenCanvas();
        setCurrentIndex(0);
        soundEffects.playSlideTransition();
      } else if (e.key === 'End') {
        clearPenCanvas();
        setCurrentIndex(slides.length - 1);
        soundEffects.playSlideTransition();
      } else if (e.key.toLowerCase() === 'b' || e.key === '.') {
        setBlankMode(prev => (prev === 'black' ? 'none' : 'black'));
      } else if (e.key.toLowerCase() === 'w' || e.key === ',') {
        setBlankMode(prev => (prev === 'white' ? 'none' : 'white'));
      } else if (e.key === 'Escape') {
        if (showHelpOverlay) {
          setShowHelpOverlay(false);
          return;
        }
        if (showPresenterOptions) {
          setShowPresenterOptions(false);
          return;
        }
        if (showSlideNavigator) {
          setShowSlideNavigator(false);
          return;
        }
        if (showReactionMenu) {
          setShowReactionMenu(false);
          return;
        }
        if (isSpotlightActive) {
          setIsSpotlightActive(false);
          channelRef.current?.postMessage({ type: 'LASER_MOVE', pos: null });
          return;
        }
        if (isLaserActive) {
          setIsLaserActive(false);
          channelRef.current?.postMessage({ type: 'LASER_MOVE', pos: null });
          return;
        }
        if (isPodiumMode) {
          setIsPodiumMode(false);
          return;
        }
        onClose();
      } else if (e.key === '?' || e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setShowHelpOverlay(prev => !prev);
      } else if (e.key.toLowerCase() === 's') {
        setIsSpotlightActive(prev => {
          const next = !prev;
          if (next) {
            setIsLaserActive(false);
            setIsPenActive(false);
          }
          return next;
        });
      } else if (e.key.toLowerCase() === 'l') {
        setIsLaserActive(prev => {
          if (!prev) setIsPenActive(false);
          return !prev;
        });
      } else if (e.key.toLowerCase() === 'p') {
        setIsPenActive(prev => {
          if (!prev) setIsLaserActive(false);
          return !prev;
        });
      } else if (e.key.toLowerCase() === 'c') {
        clearPenCanvas();
      } else if (e.key.toLowerCase() === 'u' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z')) {
        undoPenStroke();
      } else if (e.key.toLowerCase() === 'n') {
        setShowNotes(prev => !prev);
      } else if (e.key.toLowerCase() === 'g') {
        setShowSlideNavigator(prev => !prev);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'm') {
        toggleSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentIndex,
    slides.length,
    blankMode,
    jumpBuffer,
    showHelpOverlay,
    showPresenterOptions,
    showSlideNavigator,
    showReactionMenu,
    isSpotlightActive,
    isLaserActive,
    isPodiumMode,
  ]);

  const toggleSound = () => {
    const nextState = !isSoundMuted;
    setIsSoundMuted(nextState);
    soundEffects.setSoundEnabled(!nextState);
    setSoundToast(nextState ? 'Suara Slide: Dibisukan' : 'Suara Slide: Aktif');
    setTimeout(() => setSoundToast(null), 1800);
  };

  const triggerCelebration = () => {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    channelRef.current?.postMessage({ type: 'CONFETTI' });
  };

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      clearPenCanvas();
      setCurrentIndex(i => i + 1);
      soundEffects.playSlideTransition();
      if (currentIndex + 1 === slides.length - 1) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        channelRef.current?.postMessage({ type: 'CONFETTI' });
      }
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      clearPenCanvas();
      setCurrentIndex(i => i - 1);
      soundEffects.playSlideTransition();
    }
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length && index !== currentIndex) {
      clearPenCanvas();
      setCurrentIndex(index);
      soundEffects.playSlideTransition();
      if (index === slides.length - 1) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        channelRef.current?.postMessage({ type: 'CONFETTI' });
      }
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if ((isLaserActive || isSpotlightActive) && slideAreaRef.current) {
      const areaRect = slideAreaRef.current.getBoundingClientRect();
      const x = e.clientX - areaRect.left;
      const y = e.clientY - areaRect.top;
      setLaserPos({ x, y });

      // Calculate precision coordinate ratio relative to the actual rendered slide box
      let xRatio = Math.max(0, Math.min(1, x / areaRect.width));
      let yRatio = Math.max(0, Math.min(1, y / areaRect.height));

      if (slideContainerRef.current) {
        const slideRect = slideContainerRef.current.getBoundingClientRect();
        const slideX = e.clientX - slideRect.left;
        const slideY = e.clientY - slideRect.top;
        xRatio = Math.max(0, Math.min(1, slideX / slideRect.width));
        yRatio = Math.max(0, Math.min(1, slideY / slideRect.height));
      }

      channelRef.current?.postMessage({
        type: 'LASER_MOVE',
        pos: {
          xRatio,
          yRatio,
          color: laserColor,
          mode: isSpotlightActive ? 'spotlight' : 'laser',
        },
      });
    }
  };

  const handleMouseLeave = () => {
    if (isLaserActive || isSpotlightActive) {
      channelRef.current?.postMessage({
        type: 'LASER_MOVE',
        pos: null,
      });
    }
  };

  const currentSlide = slides[currentIndex];
  // Calculate exact scale based on measured container bounds to prevent any clipping
  const availableWidth = slideAreaBounds.width > 0
    ? Math.max(100, slideAreaBounds.width - 48)
    : Math.max(100, windowDimensions.width * (showNotes ? 0.68 : 0.94) - 48);
  const availableHeight = slideAreaBounds.height > 0
    ? Math.max(100, slideAreaBounds.height - 48)
    : Math.max(100, windowDimensions.height * 0.84 - 48);
  const scale = Math.max(0.05, Math.min(availableWidth / currentSlide.width, availableHeight / currentSlide.height));

  const wordCount = (currentSlide.notes || '').trim().split(/\s+/).filter(Boolean).length;
  const estimatedSpeechMinutes = Math.floor(wordCount / 130);
  const estimatedSpeechSeconds = Math.round(((wordCount % 130) / 130) * 60);
  const speechEstimateBadge = wordCount === 0
    ? null
    : estimatedSpeechMinutes > 0
      ? `~${estimatedSpeechMinutes}m ${estimatedSpeechSeconds}d bicara`
      : `~${estimatedSpeechSeconds} detik bicara`;

  const effectiveTransition = (currentSlide.transition && currentSlide.transition !== 'none')
    ? currentSlide.transition
    : (currentSlide.transition === 'none' ? 'none' : transitionEffect);

  const transitionClass = effectiveTransition === 'none'
    ? ''
    : effectiveTransition === 'slide'
      ? 'animate-in slide-in-from-right-10 duration-300'
      : effectiveTransition === 'zoom'
        ? 'animate-in zoom-in-95 duration-200'
        : 'animate-in fade-in duration-200';

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950 flex flex-col select-none text-slate-100 ${isControlsIdle && !isLaserActive && !isPenActive ? 'cursor-none' : ''
      }`}>
      {/* Presenter Top Bar - Clean, Minimalist & Responsive */}
      <header className={`h-14 border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between bg-slate-900/95 backdrop-blur-xl shrink-0 z-30 transition-opacity duration-300 ${isControlsIdle && !isLaserActive && !isPenActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
        {/* Left Section: Live Status & Clean Timer */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              {currentIndex + 1} / {slides.length}
            </span>
          </div>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[120px] sm:max-w-xs md:max-w-md hidden sm:inline">
            {currentSlide.title}
          </span>

          {/* Minimalist Stopwatch Capsule */}
          {(() => {
            const isTimeOver = targetMinutes > 0 && secondsElapsed >= targetMinutes * 60;
            const isTimeWarning =
              targetMinutes > 0 && !isTimeOver && secondsElapsed >= targetMinutes * 60 * 0.8;

            return (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono border transition-all ${isTimeOver
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse font-bold'
                  : isTimeWarning
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
              >
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  title={isTimerRunning ? 'Jeda Timer' : 'Lanjutkan Timer'}
                  className="text-slate-400 hover:text-white"
                >
                  {isTimerRunning ? (
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </button>
                <span className="font-semibold">{formatTimer(secondsElapsed)}</span>
                {targetMinutes > 0 && (
                  <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">/ {targetMinutes}m</span>
                )}
                <button
                  onClick={() => setSecondsElapsed(0)}
                  title="Reset Stopwatch (00:00)"
                  className="text-slate-500 hover:text-slate-300 ml-0.5"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            );
          })()}

          {/* Auto-Play Live Countdown Badge */}
          {isAutoPlay && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono border bg-indigo-500/15 border-indigo-500/40 text-indigo-300"
              title={`Auto-play aktif: berganti setiap ${autoPlayInterval} detik (tersisa ${autoPlayRemaining} detik)`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              <span>Auto ({autoPlayRemaining}s)</span>
            </div>
          )}
        </div>

        {/* Right Section: Essential Presenter Tools & Options Popover */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Laser Pointer Mode */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLaserActive(!isLaserActive);
                if (!isLaserActive) setIsPenActive(false);
              }}
              title="Laser Pointer (Tekan 'L')"
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${isLaserActive
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/20'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Laser</span>
            </button>
            {isLaserActive && (
              <div className="absolute top-full mt-1.5 left-0 bg-slate-900 border border-slate-800 rounded-xl p-1.5 shadow-xl flex items-center gap-1.5 z-40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                {[
                  { color: '#f43f5e', name: 'Merah' },
                  { color: '#38bdf8', name: 'Cyan' },
                  { color: '#10b981', name: 'Hijau' },
                ].map(c => (
                  <button
                    key={c.color}
                    onClick={() => setLaserColor(c.color)}
                    title={`Laser ${c.name}`}
                    className={`w-3.5 h-3.5 rounded-full border transition-transform ${laserColor === c.color ? 'scale-125 border-white ring-1 ring-white/50' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pen / Doodle Annotation Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsPenActive(!isPenActive);
                if (!isPenActive) setIsLaserActive(false);
              }}
              title="Anotasi Pena Coretan (Tekan 'P')"
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${isPenActive
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              <Pen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pena</span>
            </button>
            {isPenActive && (
              <div className="absolute top-full mt-1.5 left-0 bg-slate-900 border border-slate-800 rounded-xl p-1.5 shadow-xl flex items-center gap-1.5 z-40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                {[
                  { color: '#f43f5e', name: 'Merah' },
                  { color: '#38bdf8', name: 'Cyan' },
                  { color: '#facc15', name: 'Kuning' },
                ].map(c => (
                  <button
                    key={c.color}
                    onClick={() => setPenColor(c.color)}
                    title={`Warna ${c.name}`}
                    className={`w-3.5 h-3.5 rounded-full border transition-transform ${penColor === c.color ? 'scale-125 border-white ring-1 ring-white/50' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: c.color }}
                  />
                ))}
                <div className="h-3 w-[1px] bg-slate-800 mx-0.5" />
                <button
                  onClick={undoPenStroke}
                  title="Batalkan Coretan Terakhir (U)"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded transition-colors"
                >
                  <Undo2 className="w-3 h-3" />
                </button>
                <button
                  onClick={clearPenCanvas}
                  title="Hapus Semua Coretan (C)"
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors"
                >
                  <Eraser className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Virtual Spotlight Mode (Stage Light focus) */}
          <button
            onClick={() => {
              setIsSpotlightActive(!isSpotlightActive);
              if (!isSpotlightActive) {
                setIsLaserActive(false);
                setIsPenActive(false);
              }
            }}
            title="Sorot Panggung / Virtual Spotlight Focus (Tekan 'S')"
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${isSpotlightActive
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Spotlight</span>
          </button>

          {/* Audience Window (Dual Screen) */}
          <button
            onClick={openAudienceWindow}
            title="Buka Jendela Layar Audiens untuk Proyektor / Monitor Kedua"
            className="px-2.5 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-800"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Layar Audiens</span>
          </button>

          {/* Toggle Speaker Notes */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            title="Tampilkan / Sembunyikan Catatan Pembicara (N)"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${showNotes
              ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
          >
            <span className="hidden sm:inline">{showNotes ? 'Sembunyikan Catatan' : 'Lihat Catatan'}</span>
            <span className="sm:hidden">Notes</span>
          </button>

          {/* Stage Teleprompter / Podium Mode Toggle */}
          <button
            onClick={() => setIsPodiumMode(!isPodiumMode)}
            title="Mode Teleprompter & Podium Panggung (Teks Catatan Besar)"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${isPodiumMode
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
          >
            <Tv className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Podium</span>
          </button>

          {/* Presenter Settings & Secondary Tools Popover */}
          <div ref={optionsMenuRef} className="relative">
            <button
              onClick={() => setShowPresenterOptions(!showPresenterOptions)}
              title="Pengaturan & Opsi Presentasi"
              className={`p-1.5 rounded-xl border transition-colors ${showPresenterOptions || isAutoPlay || blankMode !== 'none' || !isSoundMuted
                ? 'bg-slate-800 text-indigo-300 border-slate-700'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {showPresenterOptions && (
              <div className="absolute top-full right-0 mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl space-y-2">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800/80">
                  Opsi Slideshow
                </div>

                {/* Target Duration Selector */}
                <div className="space-y-1 px-2">
                  <label className="text-[10px] text-slate-400 font-semibold block">Target Batas Waktu</label>
                  <select
                    value={targetMinutes}
                    onChange={e => setTargetMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value={0}>Stopwatch Bebas</option>
                    <option value={3}>Target 3m (Elevator Pitch)</option>
                    <option value={5}>Target 5m (Lightning Talk)</option>
                    <option value={10}>Target 10m</option>
                    <option value={15}>Target 15m (Seminar/Sidang)</option>
                    <option value={20}>Target 20m (Keynote)</option>
                  </select>
                </div>

                {/* Transition Effect Selector */}
                <div className="space-y-1 px-2">
                  <label className="text-[10px] text-slate-400 font-semibold block">Efek Transisi Slide</label>
                  <select
                    value={transitionEffect}
                    onChange={e => setTransitionEffect(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    <option value="fade">Fade (Halus & Elegan)</option>
                    <option value="slide">Slide (Geser Dinamis)</option>
                    <option value="zoom">Zoom (Memperbesar)</option>
                  </select>
                </div>

                {/* Auto Play Setting */}
                <div className="px-2 py-1 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Putar Otomatis</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsAutoPlay(!isAutoPlay)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${isAutoPlay ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                      {isAutoPlay ? 'ON' : 'OFF'}
                    </button>
                    {isAutoPlay && (
                      <select
                        value={autoPlayInterval}
                        onChange={e => setAutoPlayInterval(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-200 outline-none font-mono"
                      >
                        <option value={3}>3d</option>
                        <option value={5}>5d</option>
                        <option value={10}>10d</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Sound FX Toggle */}
                <div className="px-2 py-1 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Efek Suara Geser (M)</span>
                  <button
                    onClick={toggleSound}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${!isSoundMuted ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                  >
                    {!isSoundMuted ? 'Aktif' : 'Mati'}
                  </button>
                </div>

                {/* Blank Screen Options */}
                <div className="px-2 py-1 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-300">Layar Kosong Fokus</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setBlankMode(prev => (prev === 'black' ? 'none' : 'black'))}
                      title="Layar Hitam (B)"
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${blankMode === 'black' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                      Hitam (B)
                    </button>
                    <button
                      onClick={() => setBlankMode(prev => (prev === 'white' ? 'none' : 'white'))}
                      title="Layar Putih (W)"
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${blankMode === 'white' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                      Putih (W)
                    </button>
                  </div>
                </div>

                {/* Shortcuts Helper */}
                <div className="px-2 pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setShowHelpOverlay(true);
                      setShowPresenterOptions(false);
                    }}
                    className="w-full py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 justify-center transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Panduan Pintasan Tombol (?)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title="Layar Penuh (F)"
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            title="Keluar Mode Presentasi (Esc)"
            className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Slide Display + Notes Area */}
      {isPodiumMode ? (
        <div className="flex-1 flex flex-col bg-slate-950 text-white overflow-hidden p-4 sm:p-6 animate-in fade-in duration-150">
          {/* Podium Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-indigo-400" />
                <span>PODIUM & TELEPROMPTER</span>
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate max-w-md">
                Slide {currentIndex + 1} / {slides.length}: {currentSlide.title}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Giant Timer */}
              <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-2xl shadow-inner">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span className="font-mono text-xl font-bold tracking-wider text-slate-100">
                  {formatTimer(secondsElapsed)}
                </span>
                {targetMinutes > 0 && (
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded-lg border font-bold ${secondsElapsed > targetMinutes * 60
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                  >
                    Target {targetMinutes}m
                  </span>
                )}
              </div>

              {/* Close Podium Button */}
              <button
                onClick={() => setIsPodiumMode(false)}
                title="Kembali ke Tampilan Standar (Esc)"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>Keluar Podium</span>
                <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-400">Esc</kbd>
              </button>
            </div>
          </div>

          {/* Podium Content Split: Giant Teleprompter Notes (Left) + Slide Monitors (Right) */}
          <div className="flex-1 flex flex-col lg:flex-row gap-6 py-4 overflow-hidden min-h-0">
            {/* Left: Giant Teleprompter Notes */}
            <div className="flex-1 flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-md overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 shrink-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Naskah & Panduan Berbicara
                  </span>
                  {speechEstimateBadge && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {speechEstimateBadge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Teleprompter Auto-Scroll Button */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsTeleprompterRunning(!isTeleprompterRunning)}
                      title={isTeleprompterRunning ? 'Jeda Gulir Otomatis Teleprompter' : 'Mulai Gulir Otomatis Teleprompter'}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${isTeleprompterRunning
                        ? 'bg-emerald-600 text-white animate-pulse'
                        : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                    >
                      {isTeleprompterRunning ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{isTeleprompterRunning ? 'Jeda' : 'Auto-Scroll'}</span>
                    </button>
                    {isTeleprompterRunning && (
                      <button
                        onClick={() => setTeleprompterSpeed(s => (s === 1 ? 2 : s === 2 ? 3 : 1))}
                        title="Ubah Kecepatan Gulir Teleprompter"
                        className="px-1.5 py-1 rounded text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-indigo-300 hover:bg-slate-800"
                      >
                        {teleprompterSpeed}x
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                    <button
                      onClick={() => {
                        if (notesFontSize === 'xl') setNotesFontSize('lg');
                        else if (notesFontSize === 'lg') setNotesFontSize('base');
                        else if (notesFontSize === 'base') setNotesFontSize('sm');
                      }}
                      title="Perkecil Ukuran Font Catatan (A-)"
                      className="text-xs text-slate-400 hover:text-white px-1 font-semibold"
                    >
                      A-
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono uppercase px-1">{notesFontSize}</span>
                    <button
                      onClick={() => {
                        if (notesFontSize === 'sm') setNotesFontSize('base');
                        else if (notesFontSize === 'base') setNotesFontSize('lg');
                        else if (notesFontSize === 'lg') setNotesFontSize('xl');
                      }}
                      title="Perbesar Ukuran Font Catatan (A+)"
                      className="text-xs text-slate-400 hover:text-white px-1 font-bold"
                    >
                      A+
                    </button>
                  </div>
                  <button
                    onClick={downloadSpeakerNotes}
                    title="Unduh Naskah (.md)"
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 rounded-lg border border-slate-800"
                  >
                    <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                  </button>
                </div>
              </div>

              {/* Editable Large Typography Textarea */}
              <div className="flex-1 mt-3 overflow-y-auto">
                <textarea
                  ref={podiumTextareaRef}
                  value={currentSlide.notes || ''}
                  onChange={e => onUpdateSlideNotes?.(currentSlide.id, e.target.value)}
                  placeholder="Ketik poin penting, panduan berbicara, atau naskah presentasi untuk slide ini..."
                  className={`w-full h-full bg-transparent border-none focus:outline-none text-slate-100 placeholder-slate-600 leading-relaxed resize-none font-sans ${notesFontSize === 'sm'
                    ? 'text-base'
                    : notesFontSize === 'base'
                      ? 'text-xl'
                      : notesFontSize === 'lg'
                        ? 'text-2xl font-medium'
                        : 'text-3xl font-semibold'
                    }`}
                />
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <span>Tip: Anda dapat mengedit teks ini langsung saat presentasi.</span>
                <span className="font-mono">
                  {currentSlide.notes ? `${currentSlide.notes.trim().split(/\s+/).filter(Boolean).length} kata` : '0 kata'}
                </span>
              </div>
            </div>

            {/* Right: Stage Slide Monitors */}
            <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0 overflow-y-auto">
              {/* Current Live Slide Monitor */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Layar Audiens (Aktif)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">16:9 FHD</span>
                </div>
                {/* Scaled Mini Preview */}
                <div className="w-full aspect-video bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden relative shadow-inner flex items-center justify-center">
                  <div
                    style={{
                      width: `${currentSlide.width}px`,
                      height: `${currentSlide.height}px`,
                      background: getSlideBackground(currentSlide),
                      transform: `scale(${Math.min(320 / currentSlide.width, 180 / currentSlide.height)})`,
                      transformOrigin: 'center center',
                    }}
                    className="relative pointer-events-none select-none"
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
                        }}
                      >
                        <ElementRenderer element={el} isSelected={false} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next Slide Preview */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Slide Berikutnya ({currentIndex < slides.length - 1 ? `${currentIndex + 2}/${slides.length}` : 'Selesai'})</span>
                  </span>
                </div>
                {currentIndex < slides.length - 1 ? (
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-slate-200 truncate">
                      {slides[currentIndex + 1].title}
                    </div>
                    {slides[currentIndex + 1].notes && (
                      <p className="text-xs text-slate-400 line-clamp-3 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/60 italic font-mono">
                        "{slides[currentIndex + 1].notes}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500 font-mono">
                    🏁 Ini adalah slide terakhir
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Podium Bottom Controls */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-25 border border-slate-800 rounded-xl text-sm font-bold text-slate-200 hover:text-white flex items-center gap-2 transition-all shadow"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Slide Sebelumnya</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBlankMode(prev => (prev === 'black' ? 'none' : 'black'))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${blankMode === 'black' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
              >
                Layar Hitam (B)
              </button>
              <button
                onClick={triggerCelebration}
                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 rounded-xl"
                title="Confetti"
              >
                <PartyPopper className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={goToNext}
              disabled={currentIndex === slides.length - 1}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-25 border border-indigo-500 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
            >
              <span>Slide Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Slide Canvas Area */}
          <div
            ref={slideAreaRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`flex-1 flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden ${isLaserActive ? 'cursor-none' : 'cursor-default'
              }`}
          >
            {/* Virtual Spotlight Mode (Stage Light focus) */}
            {isSpotlightActive && (
              <div
                className="absolute inset-0 pointer-events-none z-45 transition-opacity duration-75"
                style={{
                  background: `radial-gradient(circle 140px at ${laserPos.x}px ${laserPos.y}px, transparent 0%, rgba(0,0,0,0.80) 100%)`,
                }}
              />
            )}

            {/* Blank Screen Overlay (Black or White) for Audience Focus */}
            {blankMode === 'black' && (
              <div
                onClick={() => setBlankMode('none')}
                className="absolute inset-0 bg-black z-40 flex flex-col items-center justify-center cursor-pointer select-none animate-in fade-in duration-150"
              >
                <div className="text-slate-500 text-xs font-mono px-3.5 py-1.5 rounded-full border border-slate-800/80 bg-slate-950/80 shadow-lg">
                  Mode Layar Hitam (Fokus Audiens) • Tekan <kbd className="text-slate-300 font-bold">B</kbd> atau klik untuk lanjut
                </div>
              </div>
            )}

            {blankMode === 'white' && (
              <div
                onClick={() => setBlankMode('none')}
                className="absolute inset-0 bg-white z-40 flex flex-col items-center justify-center cursor-pointer select-none animate-in fade-in duration-150"
              >
                <div className="text-slate-700 text-xs font-mono px-3.5 py-1.5 rounded-full border border-slate-300 bg-white/90 shadow-lg">
                  Mode Layar Putih (Diskusi / Proyektor) • Tekan <kbd className="text-slate-900 font-bold">W</kbd> atau klik untuk lanjut
                </div>
              </div>
            )}

            {/* Sized container that occupies exactly the scaled width & height in flexbox, preventing edge clipping */}
            <div
              style={{
                width: `${Math.round(currentSlide.width * scale)}px`,
                height: `${Math.round(currentSlide.height * scale)}px`,
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <div
                key={currentIndex}
                ref={slideContainerRef}
                className={`absolute top-0 left-0 shadow-2xl rounded-sm overflow-hidden ${transitionClass}`}
                style={{
                  width: `${currentSlide.width}px`,
                  height: `${currentSlide.height}px`,
                  background: getSlideBackground(currentSlide),
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                {currentSlide.elements
                  .slice()
                  .sort((a, b) => a.zIndex - b.zIndex)
                  .map(el => (
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

                {/* Live Doodle / Pen Annotation Canvas */}
                <canvas
                  ref={penCanvasRef}
                  width={currentSlide.width}
                  height={currentSlide.height}
                  className={`absolute inset-0 z-30 transition-opacity ${isPenActive ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
                    }`}
                  onPointerDown={handlePenPointerDown}
                  onPointerMove={handlePenPointerMove}
                  onPointerUp={handlePenPointerUp}
                  onPointerLeave={handlePenPointerUp}
                />
              </div>
            </div>

            {/* Glowing Virtual Laser Pointer with Pulse Ring */}
            {isLaserActive && (
              <div
                className="absolute pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${laserPos.x}px`,
                  top: `${laserPos.y}px`,
                }}
              >
                <div className="relative flex items-center justify-center">
                  <span
                    className="absolute w-8 h-8 rounded-full animate-ping opacity-35"
                    style={{ backgroundColor: laserColor }}
                  />
                  <span
                    className="w-4 h-4 rounded-full shadow-lg"
                    style={{
                      backgroundColor: laserColor,
                      boxShadow: `0 0 18px 6px ${laserColor}, 0 0 6px #fff`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Quick Slide Number Jump HUD Overlay */}
            {jumpBuffer && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-slate-900/95 border-2 border-indigo-500 text-white rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in zoom-in-95 duration-100">
                <span className="text-xs text-indigo-300 font-medium">Lompat ke Slide:</span>
                <span className="font-mono font-extrabold text-xl tracking-wider text-white bg-indigo-600/40 px-3 py-0.5 rounded-lg border border-indigo-500/50">
                  {jumpBuffer}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">(Tekan Enter)</span>
              </div>
            )}

            {/* Quick Slide Navigator Drawer */}
            {showSlideNavigator && (() => {
              const filteredNavSlides = slides
                .map((s, idx) => ({ slide: s, originalIndex: idx }))
                .filter(({ slide: s, originalIndex: idx }) => {
                  if (!navSearch.trim()) return true;
                  const q = navSearch.toLowerCase().trim();
                  return (
                    s.title.toLowerCase().includes(q) ||
                    (s.notes && s.notes.toLowerCase().includes(q)) ||
                    `slide ${idx + 1}`.includes(q)
                  );
                });

              return (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-50 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex flex-col gap-2.5 animate-in slide-in-from-bottom-4 duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs px-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Lompat Cepat ke Slide</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">
                        ({filteredNavSlides.length} dari {slides.length} slide)
                      </span>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={navSearch}
                        onChange={e => setNavSearch(e.target.value)}
                        placeholder="Cari judul atau catatan..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 font-medium"
                      />
                      {navSearch && (
                        <button
                          type="button"
                          onClick={() => setNavSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {filteredNavSlides.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      Tidak ada slide yang cocok dengan kata kunci "{navSearch}".
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {filteredNavSlides.map(({ slide: s, originalIndex: idx }) => {
                        const isCur = idx === currentIndex;
                        return (
                          <button
                            key={s.id}
                            onClick={() => {
                              goToSlide(idx);
                              setShowSlideNavigator(false);
                            }}
                            className={`flex flex-col items-start p-2 rounded-xl border text-left shrink-0 transition-all w-36 ${isCur
                              ? 'bg-indigo-600/25 border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                              : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                              }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span
                                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${isCur ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                                  }`}
                              >
                                {idx + 1}
                              </span>
                              {s.notes && s.notes.trim() && (
                                <span className="text-[9px] text-amber-400 font-mono">📝 Notes</span>
                              )}
                            </div>
                            <span className="text-xs font-semibold truncate w-full">
                              {s.title}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {s.elements.length} elemen
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Floating Navigation Controls Capsule - Clean & Uncluttered */}
            <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-2xl backdrop-blur-xl z-30 transition-opacity duration-300 ${isControlsIdle && !isLaserActive && !isPenActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}>
              <button
                onClick={goToPrev}
                disabled={currentIndex === 0}
                title="Slide Sebelumnya (← / Panah Kiri)"
                className="p-1.5 hover:bg-slate-800 disabled:opacity-25 rounded-xl text-slate-300 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSlideNavigator(prev => !prev)}
                title="Buka Kisi Miniatur Slide untuk Melompat Cepat"
                className={`text-xs font-mono font-medium px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1.5 ${showSlideNavigator
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentIndex + 1} / {slides.length}</span>
              </button>
              <button
                onClick={goToNext}
                disabled={currentIndex === slides.length - 1}
                title="Slide Selanjutnya (Spasi / Panah Kanan)"
                className="p-1.5 hover:bg-slate-800 disabled:opacity-25 rounded-xl text-slate-300 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />

              {/* Confetti Celebration Button */}
              <button
                onClick={triggerCelebration}
                title="Tembakkan Selebrasi Confetti"
                className="p-1.5 hover:bg-slate-800 rounded-xl text-amber-400 hover:text-amber-300 transition-colors"
              >
                <PartyPopper className="w-4 h-4" />
              </button>

              {/* Audience Reaction Button with Popover */}
              <div ref={reactionMenuRef} className="relative">
                <button
                  onClick={() => setShowReactionMenu(!showReactionMenu)}
                  title="Kirim Reaksi Emotikon Audiens"
                  className={`p-1.5 rounded-xl transition-colors ${showReactionMenu ? 'bg-slate-800 text-indigo-300' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                  <Smile className="w-4 h-4" />
                </button>

                {showReactionMenu && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-40 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
                    {['👏', '❤️', '🔥', '💡', '🚀'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          triggerFloatingReaction(emoji);
                          channelRef.current?.postMessage({ type: 'REACTION', emoji });
                          setShowReactionMenu(false);
                        }}
                        title={`Reaksi ${emoji}`}
                        className="w-7 h-7 flex items-center justify-center text-sm hover:scale-125 transition-transform rounded-xl hover:bg-slate-800"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Keyboard Shortcuts Helper Modal Button */}
              <button
                onClick={() => setShowHelpOverlay(true)}
                title="Buka Panduan Pintasan Tombol (? / H)"
                className="p-1.5 hover:bg-slate-800 rounded-xl text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Presenter Speaker Notes Sidebar (Live Editable & Responsive Drawer on mobile) */}
          {showNotes && (
            <aside className="w-72 sm:w-80 border-l border-slate-800/80 bg-slate-900/95 backdrop-blur-xl p-4 sm:p-5 flex flex-col justify-between shrink-0 fixed lg:static right-0 top-14 bottom-0 z-30 shadow-2xl lg:shadow-none animate-in slide-in-from-right duration-150">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        Catatan Pembicara
                      </span>
                      {speechEstimateBadge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {speechEstimateBadge}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-200 mt-1">{currentSlide.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsPodiumMode(true)}
                      title="Buka Mode Teleprompter & Podium (Layar Naskah Panggung)"
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 rounded-lg text-xs flex items-center gap-1 border border-slate-800 hover:border-indigo-500/40 transition-colors"
                    >
                      <Tv className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[10px] font-mono">Podium</span>
                    </button>
                    <button
                      onClick={downloadSpeakerNotes}
                      title="Unduh seluruh naskah pembicara sebagai file Markdown (.md)"
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 rounded-lg text-xs flex items-center gap-1 border border-slate-800 hover:border-indigo-500/40 transition-colors"
                    >
                      <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[10px] font-mono">Unduh .md</span>
                    </button>
                    <button
                      onClick={() => setShowNotes(false)}
                      title="Tutup Catatan"
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg lg:hidden"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Live Editable Textarea */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIsTeleprompterRunning(!isTeleprompterRunning)}
                        title={isTeleprompterRunning ? 'Jeda Gulir Otomatis Teleprompter' : 'Mulai Gulir Otomatis Teleprompter'}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors ${isTeleprompterRunning
                          ? 'bg-emerald-600 text-white animate-pulse'
                          : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                      >
                        {isTeleprompterRunning ? <Pause className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-emerald-400" />}
                        <span>{isTeleprompterRunning ? 'Jeda' : 'Auto-Scroll'}</span>
                      </button>
                      {isTeleprompterRunning && (
                        <button
                          onClick={() => setTeleprompterSpeed(s => (s === 1 ? 2 : s === 2 ? 3 : 1))}
                          title="Ubah Kecepatan Gulir Teleprompter"
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-950 border border-slate-800 text-indigo-300 hover:bg-slate-800"
                        >
                          {teleprompterSpeed}x
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5">
                      <button
                        onClick={() => {
                          if (notesFontSize === 'xl') setNotesFontSize('lg');
                          else if (notesFontSize === 'lg') setNotesFontSize('base');
                          else if (notesFontSize === 'base') setNotesFontSize('sm');
                        }}
                        title="Perkecil Ukuran Font Catatan (A-)"
                        className="text-[10px] text-slate-400 hover:text-white px-0.5"
                      >
                        A-
                      </button>
                      <span className="text-[9px] text-slate-500 font-mono uppercase">{notesFontSize}</span>
                      <button
                        onClick={() => {
                          if (notesFontSize === 'sm') setNotesFontSize('base');
                          else if (notesFontSize === 'base') setNotesFontSize('lg');
                          else if (notesFontSize === 'lg') setNotesFontSize('xl');
                        }}
                        title="Perbesar Ukuran Font Catatan (A+)"
                        className="text-[10px] text-slate-400 hover:text-white px-0.5 font-bold"
                      >
                        A+
                      </button>
                    </div>
                  </div>
                  <textarea
                    ref={notesTextareaRef}
                    value={currentSlide.notes || ''}
                    onChange={e => onUpdateSlideNotes?.(currentSlide.id, e.target.value)}
                    placeholder="Ketik poin penting, panduan berbicara, atau naskah presentasi untuk slide ini..."
                    className={`w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 outline-none leading-relaxed min-h-[170px] resize-none font-sans ${notesFontSize === 'sm'
                      ? 'text-xs'
                      : notesFontSize === 'base'
                        ? 'text-sm'
                        : notesFontSize === 'lg'
                          ? 'text-base'
                          : 'text-lg font-medium'
                      }`}
                  />
                </div>
              </div>

              {/* Next Slide Preview thumbnail (Interactive Mini Canvas Preview) */}
              {currentIndex < slides.length - 1 && (() => {
                const nextSlide = slides[currentIndex + 1];
                const miniScale = Math.min(270 / nextSlide.width, 140 / nextSlide.height);
                return (
                  <div className="pt-3 border-t border-slate-800 space-y-1.5 shrink-0">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-500 uppercase tracking-wider">
                        Slide Selanjutnya ({currentIndex + 2}/{slides.length})
                      </span>
                      <span className="text-indigo-400 font-mono text-[9px]">Klik untuk Maju →</span>
                    </div>
                    <button
                      onClick={goToNext}
                      title="Klik untuk berpindah ke slide berikutnya"
                      className="w-full text-left group bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/70 rounded-xl p-2 transition-all shadow hover:shadow-indigo-500/10"
                    >
                      {/* Visual scaled miniature */}
                      <div className="w-full h-24 bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden relative mb-2 flex items-center justify-center">
                        <div
                          style={{
                            width: `${nextSlide.width}px`,
                            height: `${nextSlide.height}px`,
                            background: getSlideBackground(nextSlide),
                            transform: `scale(${miniScale})`,
                            transformOrigin: 'center center',
                          }}
                          className="relative pointer-events-none select-none"
                        >
                          {nextSlide.elements.map(el => (
                            <div
                              key={el.id}
                              className="absolute"
                              style={{
                                left: `${el.x}px`,
                                top: `${el.y}px`,
                                width: `${el.width}px`,
                                height: `${el.height}px`,
                                zIndex: el.zIndex,
                              }}
                            >
                              <ElementRenderer element={el} isSelected={false} />
                            </div>
                          ))}
                        </div>
                        <div className="absolute inset-0 bg-transparent group-hover:bg-indigo-500/5 transition-colors" />
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
                        <span className="truncate pr-1">{nextSlide.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      {nextSlide.notes && nextSlide.notes.trim() && (
                        <p className="text-[10px] text-slate-400 font-mono italic truncate mt-0.5 line-clamp-1 text-slate-500">
                          "{nextSlide.notes.trim()}"
                        </p>
                      )}
                    </button>
                  </div>
                );
              })()}
            </aside>
          )}
        </div>
      )}

      {/* Sound Toast Notification */}
      {soundToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/95 border border-indigo-500/60 text-white rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          <span className="text-xs font-semibold">{soundToast}</span>
        </div>
      )}

      {/* In-Show Presenter Shortcut HUD Modal (? / H) */}
      {showHelpOverlay && (
        <div
          onClick={() => setShowHelpOverlay(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl text-slate-200 animate-in zoom-in-95 duration-150 space-y-4"
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
                onClick={() => setShowHelpOverlay(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
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
      )}
      {/* Floating Audience Reactions Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.map(r => (
          <div
            key={r.id}
            className="absolute bottom-20 text-4xl select-none"
            style={{
              left: `${r.left}%`,
              animation: 'floatUpAndFade 2.2s ease-out forwards',
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatUpAndFade {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          20% { transform: translateY(-30px) scale(1.2); opacity: 1; }
          80% { transform: translateY(-160px) scale(1); opacity: 0.9; }
          100% { transform: translateY(-240px) scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
