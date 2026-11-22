import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Slide } from '../types';
import { ElementRenderer } from './ElementRenderer';
import { getSlideBackground } from '../utils/slideStyle';
import confetti from 'canvas-confetti';
import { soundEffects } from '../utils/audioEffects';
import { PresenterPodiumMode } from './presenter/PresenterPodiumMode';
import { PresenterNotesDrawer } from './presenter/PresenterNotesDrawer';
import { PresenterShortcutsHud } from './presenter/PresenterShortcutsHud';
import { PresenterAudioRecorder } from './presenter/PresenterAudioRecorder';
import { PresenterTopBar } from './presenter/PresenterTopBar';
import { PresenterPenToolbar } from './presenter/PresenterPenToolbar';
import { PresenterSlideNavigator } from './presenter/PresenterSlideNavigator';
import { PresenterFloatingHud } from './presenter/PresenterFloatingHud';
import {
  PresenterLivePollModal,
  LivePollState,
  DEFAULT_POLL_STATE,
} from './presenter/PresenterLivePollModal';

interface PresenterModalProps {
  slides: Slide[];
  projectTitle?: string;
  initialSlideIndex?: number;
  onUpdateSlideNotes?: (slideId: string, notes: string) => void;
  onClose: () => void;
}

interface DoodleStroke {
  color: string;
  width: number;
  points: Array<{ x: number; y: number }>;
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
  const [transitionEffect, setTransitionEffect] = useState<
    'fade' | 'slide' | 'slide-vertical' | 'zoom' | 'flip-cube' | 'blur-fade'
  >('fade');
  const [notesFontSize, setNotesFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [jumpBuffer, setJumpBuffer] = useState<string>('');
  const jumpTimerRef = useRef<any>(null);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);
  const [soundToast, setSoundToast] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Array<{ id: number; emoji: string; left: number }>>([]);
  const [showPresenterOptions, setShowPresenterOptions] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [livePoll, setLivePoll] = useState<LivePollState>(DEFAULT_POLL_STATE);
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
  const slideAreaRef = useRef<HTMLDivElement>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const penCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPenPosRef = useRef<{ x: number; y: number } | null>(null);
  const strokesRef = useRef<DoodleStroke[]>([]);
  const currentStrokeRef = useRef<DoodleStroke | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });
  const [slideAreaBounds, setSlideAreaBounds] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const resetIdleTimer = useCallback(() => {
    setIsControlsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isPodiumMode) return;
    idleTimerRef.current = setTimeout(() => {
      if (
        !showPresenterOptions &&
        !showReactionMenu &&
        !showSlideNavigator &&
        !showHelpOverlay &&
        !livePoll.isOpen
      ) {
        setIsControlsIdle(true);
      }
    }, 3000);
  }, [
    isPodiumMode,
    showPresenterOptions,
    showReactionMenu,
    showSlideNavigator,
    showHelpOverlay,
    livePoll.isOpen,
  ]);

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

  const handleUpdatePoll = (nextPoll: LivePollState) => {
    setLivePoll(nextPoll);
    channelRef.current?.postMessage({
      type: 'SYNC_POLL',
      poll: nextPoll,
    });
  };

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
        channelRef.current?.postMessage({
          type: 'SYNC_POLL',
          poll: livePoll,
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
    } catch {}

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
  }, [slides, currentIndex, blankMode, transitionEffect, livePoll]);

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
        s.notes && s.notes.trim() ? s.notes.trim() : '*(Tidak ada catatan khusus untuk slide ini)*'
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

  useEffect(() => {
    setAutoPlayRemaining(autoPlayInterval);
  }, [currentIndex, autoPlayInterval, isAutoPlay]);

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

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed(sec => {
          const nextSec = sec + 1;
          if (targetMinutes > 0) {
            const warningSec = Math.round(targetMinutes * 60 * 0.8);
            const limitSec = targetMinutes * 60;
            if (nextSec === warningSec) {
              setSoundToast(
                `⏱️ Waktu Presentasi Tersisa 20% (~${Math.round((limitSec - nextSec) / 60)} menit)`
              );
              setTimeout(() => setSoundToast(null), 3000);
            } else if (nextSec === limitSec) {
              soundEffects.playTimerAlert();
              setSoundToast('⚠️ Batas Target Waktu Presentasi Tercapai!');
              setTimeout(() => setSoundToast(null), 3500);
            }
          }
          return nextSec;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, targetMinutes]);

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
        if (deltaX < 0) goToNext();
        else goToPrev();
      }
    }
  };

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused =
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement ||
        (e.target as HTMLElement)?.isContentEditable;
      if (isInputFocused) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement)?.blur?.();
        }
        return;
      }

      if (blankMode !== 'none') {
        setBlankMode('none');
        return;
      }

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
      } else if (e.key.toLowerCase() === 'v') {
        handleUpdatePoll({ ...livePoll, isOpen: !livePoll.isOpen });
      } else if (e.key === 'Escape') {
        if (livePoll.isOpen) {
          handleUpdatePoll({ ...livePoll, isOpen: false });
          return;
        }
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
    livePoll,
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
      channelRef.current?.postMessage({ type: 'SLIDE_CHANGE', index });
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
  const availableWidth = Math.max(
    100,
    (slideAreaBounds.width > 0
      ? slideAreaBounds.width
      : windowDimensions.width - (showNotes && windowDimensions.width >= 640 ? 340 : 0)) - 64
  );
  const availableHeight = Math.max(
    100,
    (slideAreaBounds.height > 0 ? slideAreaBounds.height : windowDimensions.height - 120) - 110
  );
  const scale = Math.max(
    0.05,
    Math.min(availableWidth / currentSlide.width, availableHeight / currentSlide.height)
  );

  const wordCount = (currentSlide.notes || '').trim().split(/\s+/).filter(Boolean).length;
  const estimatedSpeechMinutes = Math.floor(wordCount / 130);
  const estimatedSpeechSeconds = Math.round(((wordCount % 130) / 130) * 60);
  const speechEstimateBadge =
    wordCount === 0
      ? null
      : estimatedSpeechMinutes > 0
      ? `~${estimatedSpeechMinutes}m ${estimatedSpeechSeconds}d bicara`
      : `~${estimatedSpeechSeconds} detik bicara`;

  const effectiveTransition =
    currentSlide.transition && currentSlide.transition !== 'none'
      ? currentSlide.transition
      : currentSlide.transition === 'none'
      ? 'none'
      : transitionEffect;

  const transitionClass =
    effectiveTransition === 'none'
      ? ''
      : effectiveTransition === 'slide'
      ? 'animate-in slide-in-from-right-10 duration-300'
      : effectiveTransition === 'slide-vertical'
      ? 'df-trans-slide-vertical'
      : effectiveTransition === 'zoom'
      ? 'animate-in zoom-in-95 duration-200'
      : effectiveTransition === 'flip-cube'
      ? 'df-trans-flip-cube'
      : effectiveTransition === 'blur-fade'
      ? 'df-trans-blur-fade'
      : 'animate-in fade-in duration-200';

  const isHudHidden = isControlsIdle && !isLaserActive && !isPenActive && !livePoll.isOpen;

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950 flex flex-col select-none text-slate-100 ${
        isHudHidden ? 'cursor-none' : ''
      }`}
    >
      {/* Top Bar */}
      <PresenterTopBar
        isHidden={isHudHidden}
        currentIndex={currentIndex}
        totalSlides={slides.length}
        slideTitle={currentSlide.title}
        secondsElapsed={secondsElapsed}
        setSecondsElapsed={setSecondsElapsed}
        targetMinutes={targetMinutes}
        setTargetMinutes={setTargetMinutes}
        isTimerRunning={isTimerRunning}
        setIsTimerRunning={setIsTimerRunning}
        formatTimer={formatTimer}
        isAutoPlay={isAutoPlay}
        setIsAutoPlay={setIsAutoPlay}
        autoPlayInterval={autoPlayInterval}
        setAutoPlayInterval={setAutoPlayInterval}
        autoPlayRemaining={autoPlayRemaining}
        isLaserActive={isLaserActive}
        setIsLaserActive={setIsLaserActive}
        laserColor={laserColor}
        setLaserColor={setLaserColor}
        isPenActive={isPenActive}
        setIsPenActive={setIsPenActive}
        penColor={penColor}
        setPenColor={setPenColor}
        undoPenStroke={undoPenStroke}
        clearPenCanvas={clearPenCanvas}
        isSpotlightActive={isSpotlightActive}
        setIsSpotlightActive={setIsSpotlightActive}
        openAudienceWindow={openAudienceWindow}
        showNotes={showNotes}
        setShowNotes={setShowNotes}
        isPodiumMode={isPodiumMode}
        setIsPodiumMode={setIsPodiumMode}
        showAudioRecorder={showAudioRecorder}
        setShowAudioRecorder={setShowAudioRecorder}
        isPollOpen={livePoll.isOpen}
        onTogglePoll={() => handleUpdatePoll({ ...livePoll, isOpen: !livePoll.isOpen })}
        showPresenterOptions={showPresenterOptions}
        setShowPresenterOptions={setShowPresenterOptions}
        optionsMenuRef={optionsMenuRef}
        transitionEffect={transitionEffect}
        setTransitionEffect={setTransitionEffect}
        isSoundMuted={isSoundMuted}
        toggleSound={toggleSound}
        blankMode={blankMode}
        setBlankMode={setBlankMode}
        setShowHelpOverlay={setShowHelpOverlay}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        onClose={onClose}
      />

      {/* Floating Audio Narration Recorder */}
      {showAudioRecorder && (
        <PresenterAudioRecorder
          currentSlideIndex={currentIndex}
          totalSlides={slides.length}
          onClose={() => setShowAudioRecorder(false)}
        />
      )}

      {/* Live Interactive Poll Modal */}
      <PresenterLivePollModal
        poll={livePoll}
        onUpdatePoll={handleUpdatePoll}
        onClose={() => handleUpdatePoll({ ...livePoll, isOpen: false })}
        onTriggerConfetti={() => channelRef.current?.postMessage({ type: 'CONFETTI' })}
      />

      {/* Main Slide Display + Notes Area */}
      {isPodiumMode ? (
        <PresenterPodiumMode
          currentIndex={currentIndex}
          slides={slides}
          currentSlide={currentSlide}
          secondsElapsed={secondsElapsed}
          targetMinutes={targetMinutes}
          formatTimer={formatTimer}
          setIsPodiumMode={setIsPodiumMode}
          speechEstimateBadge={speechEstimateBadge}
          isTeleprompterRunning={isTeleprompterRunning}
          setIsTeleprompterRunning={setIsTeleprompterRunning}
          teleprompterSpeed={teleprompterSpeed}
          setTeleprompterSpeed={setTeleprompterSpeed}
          notesFontSize={notesFontSize}
          setNotesFontSize={setNotesFontSize}
          downloadSpeakerNotes={downloadSpeakerNotes}
          podiumTextareaRef={podiumTextareaRef}
          onUpdateSlideNotes={onUpdateSlideNotes}
          onGoToSlide={goToSlide}
          goToPrev={goToPrev}
          goToNext={goToNext}
          blankMode={blankMode}
          setBlankMode={setBlankMode}
          triggerCelebration={triggerCelebration}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Slide Canvas Area */}
          <div
            ref={slideAreaRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`flex-1 min-w-0 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 relative overflow-hidden ${
              isLaserActive ? 'cursor-none' : 'cursor-default'
            }`}
          >
            {/* Virtual Spotlight Mode */}
            {isSpotlightActive && (
              <div
                className="absolute inset-0 pointer-events-none z-45 transition-opacity duration-75"
                style={{
                  background: `radial-gradient(circle 140px at ${laserPos.x}px ${laserPos.y}px, transparent 0%, rgba(0,0,0,0.80) 100%)`,
                }}
              />
            )}

            {/* Blank Screen Overlays */}
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

            {/* Scaled Slide Container */}
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
                  .filter(el => !el.hidden)
                  .sort((a, b) => a.zIndex - b.zIndex)
                  .map(el => (
                    <div
                      key={el.id}
                      className={`absolute ${
                        el.linkToSlideId && !isPenActive
                          ? 'cursor-pointer hover:ring-2 hover:ring-indigo-400/80 transition-all rounded-sm'
                          : ''
                      }`}
                      onClick={() => {
                        if (!isPenActive && el.linkToSlideId) {
                          const targetIdx = slides.findIndex(s => s.id === el.linkToSlideId);
                          if (targetIdx !== -1 && targetIdx !== currentIndex) {
                            goToSlide(targetIdx);
                          }
                        }
                      }}
                      style={{
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width}px`,
                        height: `${el.height}px`,
                        zIndex: el.zIndex,
                        transform:
                          [
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

                {/* Live Doodle / Pen Annotation Canvas */}
                <canvas
                  ref={penCanvasRef}
                  width={currentSlide.width}
                  height={currentSlide.height}
                  className={`absolute inset-0 z-30 transition-opacity ${
                    isPenActive ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
                  }`}
                  onPointerDown={handlePenPointerDown}
                  onPointerMove={handlePenPointerMove}
                  onPointerUp={handlePenPointerUp}
                  onPointerLeave={handlePenPointerUp}
                />
              </div>
            </div>

            {/* Floating Pen Palette Toolbar */}
            <PresenterPenToolbar
              isPenActive={isPenActive}
              penColor={penColor}
              setPenColor={setPenColor}
              penWidth={penWidth}
              setPenWidth={setPenWidth}
              undoPenStroke={undoPenStroke}
              clearPenCanvas={clearPenCanvas}
            />

            {/* Glowing Virtual Laser Pointer */}
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
            <PresenterSlideNavigator
              showSlideNavigator={showSlideNavigator}
              setShowSlideNavigator={setShowSlideNavigator}
              slides={slides}
              currentIndex={currentIndex}
              navSearch={navSearch}
              setNavSearch={setNavSearch}
              goToSlide={goToSlide}
            />

            {/* Floating Navigation Controls Capsule */}
            <PresenterFloatingHud
              isHidden={isHudHidden}
              currentIndex={currentIndex}
              totalSlides={slides.length}
              goToPrev={goToPrev}
              goToNext={goToNext}
              showSlideNavigator={showSlideNavigator}
              setShowSlideNavigator={setShowSlideNavigator}
              triggerCelebration={triggerCelebration}
              showReactionMenu={showReactionMenu}
              setShowReactionMenu={setShowReactionMenu}
              reactionMenuRef={reactionMenuRef}
              onSendReaction={emoji => {
                triggerFloatingReaction(emoji);
                channelRef.current?.postMessage({ type: 'REACTION', emoji });
                setShowReactionMenu(false);
              }}
              setShowHelpOverlay={setShowHelpOverlay}
              isPollOpen={livePoll.isOpen}
              onTogglePoll={() => handleUpdatePoll({ ...livePoll, isOpen: !livePoll.isOpen })}
            />
          </div>

          {/* Presenter Speaker Notes Sidebar */}
          <PresenterNotesDrawer
            showNotes={showNotes}
            setShowNotes={setShowNotes}
            currentSlide={currentSlide}
            currentIndex={currentIndex}
            slides={slides}
            speechEstimateBadge={speechEstimateBadge}
            setIsPodiumMode={setIsPodiumMode}
            downloadSpeakerNotes={downloadSpeakerNotes}
            isTeleprompterRunning={isTeleprompterRunning}
            setIsTeleprompterRunning={setIsTeleprompterRunning}
            teleprompterSpeed={teleprompterSpeed}
            setTeleprompterSpeed={setTeleprompterSpeed}
            notesFontSize={notesFontSize}
            setNotesFontSize={setNotesFontSize}
            notesTextareaRef={notesTextareaRef}
            onUpdateSlideNotes={onUpdateSlideNotes}
            goToNext={goToNext}
          />
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
      <PresenterShortcutsHud isOpen={showHelpOverlay} onClose={() => setShowHelpOverlay(false)} />

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
