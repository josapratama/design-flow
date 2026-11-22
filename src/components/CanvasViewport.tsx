import React, { useRef, useState, useEffect } from 'react';
import { DesignElement, Slide } from '../types';
import { ArtboardRenderer } from './ArtboardRenderer';

interface CanvasViewportProps {
  slide: Slide;
  scale: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  showRulers?: boolean;
  showSafeMargin?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  selectedElementIds: string[];
  selectedElements: DesignElement[];
  artboardRef: React.RefObject<HTMLDivElement | null>;
  onPanChange: (panX: number, panY: number) => void;
  onScaleChange: (scale: number) => void;
  onSelectElement: (elementId: string, multiSelect: boolean) => void;
  onSelectMultipleElements: (elementIds: string[]) => void;
  onUpdateElement: (elementId: string, updates: Partial<DesignElement>) => void;
  onUpdateElementLive: (elementId: string, updates: Partial<DesignElement>) => void;
  onMoveSelectedLive: (deltaX: number, deltaY: number, basePositions: Map<string, { x: number; y: number }>) => void;
  onCommitHistory: () => void;
  onDuplicateSelected?: () => void;
  onContextMenuElement?: (e: React.MouseEvent, element: DesignElement) => void;
  onContextMenuCanvas?: (e: React.MouseEvent) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  slide,
  scale,
  panX,
  panY,
  showGrid,
  showRulers = true,
  showSafeMargin = false,
  snapToGrid = true,
  gridSize = 20,
  selectedElementIds,
  selectedElements,
  artboardRef,
  onPanChange,
  onScaleChange,
  onSelectElement,
  onSelectMultipleElements,
  onUpdateElement,
  onUpdateElementLive,
  onMoveSelectedLive,
  onCommitHistory,
  onDuplicateSelected,
  onContextMenuElement,
  onContextMenuCanvas,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [userGuides, setUserGuides] = useState<{ id: string; type: 'x' | 'y'; pos: number }[]>([]);

  // Spacebar Hand Tool Listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.code === 'Space' && !e.repeat) {
        setIsSpaceDown(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceDown(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Marquee Selection Box State (Viewport Screen Coordinates)
  const [marquee, setMarquee] = useState<{
    containerStartX: number;
    containerStartY: number;
    containerCurrentX: number;
    containerCurrentY: number;
  } | null>(null);

  // Native Non-Passive Wheel & Touch Event Listeners (Prevents passive event error & enables touch pinch-to-zoom)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        const newScale = Math.min(3.0, Math.max(0.15, scale * zoomFactor));
        onScaleChange(Number(newScale.toFixed(2)));
      } else {
        onPanChange(panX - e.deltaX, panY - e.deltaY);
      }
    };

    let initialTouchDist = 0;
    let initialTouchScale = scale;
    let initialTouchMidX = 0;
    let initialTouchMidY = 0;
    let initialTouchPanX = panX;
    let initialTouchPanY = panY;

    const onTouchStartHandler = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialTouchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        initialTouchScale = scale;
        initialTouchMidX = (t1.clientX + t2.clientX) / 2;
        initialTouchMidY = (t1.clientY + t2.clientY) / 2;
        initialTouchPanX = panX;
        initialTouchPanY = panY;
      }
    };

    const onTouchMoveHandler = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const curDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        if (initialTouchDist > 0) {
          const ratio = curDist / initialTouchDist;
          const newScale = Math.min(3.0, Math.max(0.15, Number((initialTouchScale * ratio).toFixed(2))));
          onScaleChange(newScale);

          const curMidX = (t1.clientX + t2.clientX) / 2;
          const curMidY = (t1.clientY + t2.clientY) / 2;
          onPanChange(
            initialTouchPanX + (curMidX - initialTouchMidX),
            initialTouchPanY + (curMidY - initialTouchMidY)
          );
        }
      }
    };

    const onTouchEndHandler = () => {
      initialTouchDist = 0;
    };

    container.addEventListener('wheel', onWheelHandler, { passive: false });
    container.addEventListener('touchstart', onTouchStartHandler, { passive: false });
    container.addEventListener('touchmove', onTouchMoveHandler, { passive: false });
    container.addEventListener('touchend', onTouchEndHandler);

    return () => {
      container.removeEventListener('wheel', onWheelHandler);
      container.removeEventListener('touchstart', onTouchStartHandler);
      container.removeEventListener('touchmove', onTouchMoveHandler);
      container.removeEventListener('touchend', onTouchEndHandler);
    };
  }, [scale, panX, panY, onScaleChange, onPanChange]);

  // Pointer Down on background (Panning via Middle Click, Spacebar, or Marquee via Left Click)
  const handlePointerDown = (e: React.PointerEvent) => {
    const targetEl = e.target as HTMLElement;
    const isInsideElement = targetEl.closest('[data-element-id]') !== null;
    const isTransformHandle = targetEl.closest('.transform-handles') !== null;
    const isGuideline = targetEl.closest('[data-guideline]') !== null;
    const isBackground = !isInsideElement && !isTransformHandle && !isGuideline;
    if (!isBackground && !isSpaceDown) return;

    // Hand tool (Spacebar held) or Middle-click (1) or Alt key -> Pan canvas
    if (isSpaceDown || e.button === 1 || e.altKey) {
      e.preventDefault();
      setIsPanning(true);

      const startX = e.clientX;
      const startY = e.clientY;
      const initialPanX = panX;
      const initialPanY = panY;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        onPanChange(
          initialPanX + (moveEvent.clientX - startX),
          initialPanY + (moveEvent.clientY - startY)
        );
      };

      const handlePointerUp = () => {
        setIsPanning(false);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return;
    }

    // Left-click (0) on background -> Marquee Selection Box
    if (e.button === 0) {
      if (!containerRef.current || !artboardRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const startClientX = e.clientX;
      const startClientY = e.clientY;
      const startContainerX = e.clientX - containerRect.left;
      const startContainerY = e.clientY - containerRect.top;

      let isDragging = false;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const dist = Math.hypot(moveEvent.clientX - startClientX, moveEvent.clientY - startClientY);
        if (!isDragging && dist > 3) {
          isDragging = true;
        }

        const curContainerX = moveEvent.clientX - containerRect.left;
        const curContainerY = moveEvent.clientY - containerRect.top;

        setMarquee({
          containerStartX: startContainerX,
          containerStartY: startContainerY,
          containerCurrentX: curContainerX,
          containerCurrentY: curContainerY,
        });

        // Find intersecting elements in artboard coordinate space
        if (artboardRef.current) {
          const artboardRect = artboardRef.current.getBoundingClientRect();
          const minClientX = Math.min(startClientX, moveEvent.clientX);
          const maxClientX = Math.max(startClientX, moveEvent.clientX);
          const minClientY = Math.min(startClientY, moveEvent.clientY);
          const maxClientY = Math.max(startClientY, moveEvent.clientY);

          const minArtboardX = (minClientX - artboardRect.left) / scale;
          const maxArtboardX = (maxClientX - artboardRect.left) / scale;
          const minArtboardY = (minClientY - artboardRect.top) / scale;
          const maxArtboardY = (maxClientY - artboardRect.top) / scale;

          const intersectingIds = slide.elements
            .filter(el => {
              if (el.locked || el.hidden) return false;
              return (
                el.x + el.width >= minArtboardX &&
                el.x <= maxArtboardX &&
                el.y + el.height >= minArtboardY &&
                el.y <= maxArtboardY
              );
            })
            .map(el => el.id);

          onSelectMultipleElements(intersectingIds);
        }
      };

      const handlePointerUp = () => {
        setMarquee(null);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        if (!isDragging) {
          onSelectElement('', false);
        }
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none bg-slate-950 ${isPanning
        ? 'cursor-grabbing'
        : isSpaceDown
          ? 'cursor-grab'
          : 'cursor-default'
        }`}
      onPointerDown={handlePointerDown}
      onClick={e => {
        if (e.target === containerRef.current) {
          onSelectElement('', false);
        }
      }}
      onContextMenu={e => {
        if (e.target === containerRef.current || e.target === artboardRef.current) {
          e.preventDefault();
          onContextMenuCanvas?.(e);
        }
      }}
    >
      {/* Background Dot Grid */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle, #64748b 1.2px, transparent 1.2px)`,
            backgroundSize: `${24 * scale}px ${24 * scale}px`,
            backgroundPosition: `${panX}px ${panY}px`,
          }}
        />
      )}

      {/* Scaled and Panned Workspace Canvas */}
      <div
        className="absolute transition-transform duration-75 origin-top-left"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
          width: `${slide.width}px`,
          height: `${slide.height}px`,
        }}
      >
        <ArtboardRenderer
          ref={artboardRef}
          slide={slide}
          scale={scale}
          snapToGrid={snapToGrid}
          gridSize={gridSize}
          selectedElementIds={selectedElementIds}
          selectedElements={selectedElements}
          onSelectElement={onSelectElement}
          onUpdateElement={onUpdateElement}
          onUpdateElementLive={onUpdateElementLive}
          onMoveSelectedLive={onMoveSelectedLive}
          onCommitHistory={onCommitHistory}
          onDuplicateSelected={onDuplicateSelected}
          onContextMenuElement={onContextMenuElement}
        />

        {/* User Custom Guidelines (Figma Style) */}
        {userGuides.map(g => (
          <div
            key={g.id}
            onDoubleClick={e => {
              e.stopPropagation();
              setUserGuides(prev => prev.filter(item => item.id !== g.id));
            }}
            title={`${g.type.toUpperCase()}: ${g.pos}px (Klik 2x untuk hapus)`}
            className={`absolute pointer-events-auto z-40 group cursor-pointer ${g.type === 'x'
              ? 'top-0 bottom-0 border-l border-dashed border-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
              : 'left-0 right-0 border-t border-dashed border-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
              }`}
            data-export-ignore="true"
            style={g.type === 'x' ? { left: `${g.pos}px` } : { top: `${g.pos}px` }}
          >
            <div
              className={`absolute px-1.5 py-0.5 rounded bg-sky-500 text-slate-950 font-mono text-[9px] font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity select-none ${g.type === 'x' ? 'top-2 -translate-x-1/2' : 'left-2 -translate-y-1/2'
                }`}
            >
              {g.type.toUpperCase()}: {g.pos}px ✕
            </div>
          </div>
        ))}

        {/* Safe Margin (8% inset) */}
        {showSafeMargin && (
          <div
            className="absolute pointer-events-none border border-dashed border-emerald-500/60 rounded z-30 select-none shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]"
            data-export-ignore="true"
            style={{
              left: `${slide.width * 0.08}px`,
              top: `${slide.height * 0.08}px`,
              width: `${slide.width * 0.84}px`,
              height: `${slide.height * 0.84}px`,
            }}
          >
            <span className="absolute top-2 right-2 text-[10px] font-mono text-emerald-400 font-semibold bg-slate-950/85 px-2 py-0.5 rounded border border-emerald-500/30">
              Safe Margin (84%)
            </span>
          </div>
        )}

      </div>

      {/* Marquee Selection Rectangle Overlay (Crisp Viewport-Level Canvas Box) */}
      {marquee && (
        <div
          className="absolute border border-indigo-400 bg-indigo-500/20 pointer-events-none z-50 rounded-sm shadow-sm"
          data-export-ignore="true"
          style={{
            left: `${Math.min(marquee.containerStartX, marquee.containerCurrentX)}px`,
            top: `${Math.min(marquee.containerStartY, marquee.containerCurrentY)}px`,
            width: `${Math.abs(marquee.containerCurrentX - marquee.containerStartX)}px`,
            height: `${Math.abs(marquee.containerCurrentY - marquee.containerStartY)}px`,
          }}
        />
      )}

      {/* Interactive Pixel Rulers (Top & Left) */}
      {showRulers && (() => {
        const tickStep = scale < 0.35 ? 200 : scale < 0.85 ? 100 : 50;
        const hTicks: { val: number; x: number }[] = [];
        for (let val = 0; val <= slide.width; val += tickStep) {
          hTicks.push({ val, x: panX + val * scale });
        }
        const vTicks: { val: number; y: number }[] = [];
        for (let val = 0; val <= slide.height; val += tickStep) {
          vTicks.push({ val, y: panY + val * scale });
        }

        return (
          <>
            {/* Top-Left Corner Block */}
            <div
              className="absolute top-0 left-0 w-5 h-5 bg-slate-950 border-r border-b border-slate-800 z-30 flex items-center justify-center text-[8px] font-mono font-bold text-slate-500 pointer-events-none select-none"
              data-export-ignore="true"
            >
              px
            </div>

            {/* Top Horizontal Ruler */}
            <div
              onClick={e => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                const clickArtboardX = Math.round((e.clientX - rect.left - panX) / scale);
                if (clickArtboardX >= 0 && clickArtboardX <= slide.width) {
                  setUserGuides(prev => [...prev, { id: `guide_${Date.now()}`, type: 'x', pos: clickArtboardX }]);
                }
              }}
              title="Klik penggaris untuk menambah Garis Pandu Vertikal"
              className="absolute top-0 left-5 right-0 h-5 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800/80 z-20 pointer-events-auto cursor-crosshair overflow-hidden select-none hover:bg-slate-900/90 transition-colors"
              data-export-ignore="true"
            >
              <svg className="w-full h-full pointer-events-none">
                {/* Active Artboard Span Indicator */}
                <line
                  x1={panX}
                  y1={19}
                  x2={panX + slide.width * scale}
                  y2={19}
                  stroke="#6366f1"
                  strokeWidth={2}
                />
                {hTicks.map(({ val, x }) => (
                  <g key={val} transform={`translate(${x}, 0)`}>
                    <line x1={0} y1={12} x2={0} y2={20} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                    <text x={2} y={10} fill="#64748b" fontSize={8} fontFamily="monospace">
                      {val}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Left Vertical Ruler */}
            <div
              onClick={e => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                const clickArtboardY = Math.round((e.clientY - rect.top - panY) / scale);
                if (clickArtboardY >= 0 && clickArtboardY <= slide.height) {
                  setUserGuides(prev => [...prev, { id: `guide_${Date.now()}`, type: 'y', pos: clickArtboardY }]);
                }
              }}
              title="Klik penggaris untuk menambah Garis Pandu Horisontal"
              className="absolute top-5 left-0 bottom-0 w-5 bg-slate-950/90 backdrop-blur-sm border-r border-slate-800/80 z-20 pointer-events-auto cursor-crosshair overflow-hidden select-none hover:bg-slate-900/90 transition-colors"
              data-export-ignore="true"
            >
              <svg className="w-full h-full pointer-events-none">
                {/* Active Artboard Span Indicator */}
                <line
                  x1={19}
                  y1={panY}
                  x2={19}
                  y2={panY + slide.height * scale}
                  stroke="#6366f1"
                  strokeWidth={2}
                />
                {vTicks.map(({ val, y }) => (
                  <g key={val} transform={`translate(0, ${y})`}>
                    <line x1={12} y1={0} x2={20} y2={0} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                    <text x={2} y={-2} fill="#64748b" fontSize={7} fontFamily="monospace" transform="rotate(-90 2,-2)">
                      {val}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </>
        );
      })()}
    </div>
  );
};
