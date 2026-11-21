import React, { useRef, useState } from 'react';
import { DesignElement, Slide } from '../types';
import { ArtboardRenderer } from './ArtboardRenderer';

interface CanvasViewportProps {
  slide: Slide;
  scale: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  showRulers?: boolean;
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
  onContextMenuElement,
  onContextMenuCanvas,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpaceDown, setIsSpaceDown] = useState(false);

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

  // Marquee Selection Box State
  const [marquee, setMarquee] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Wheel to Zoom & Pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newScale = Math.min(3.0, Math.max(0.15, scale * zoomFactor));
      onScaleChange(Number(newScale.toFixed(2)));
    } else {
      onPanChange(panX - e.deltaX, panY - e.deltaY);
    }
  };

  // Pointer Down on background (Panning via Middle Click, Spacebar, or Marquee via Left Click)
  const handlePointerDown = (e: React.PointerEvent) => {
    const isBackground = e.target === containerRef.current || e.target === artboardRef.current;
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
        if (!artboardRef.current) return;
        const rect = artboardRef.current.getBoundingClientRect();
        const startArtboardX = (e.clientX - rect.left) / scale;
        const startArtboardY = (e.clientY - rect.top) / scale;

        setMarquee({
          startX: startArtboardX,
          startY: startArtboardY,
          currentX: startArtboardX,
          currentY: startArtboardY,
        });

        const handlePointerMove = (moveEvent: PointerEvent) => {
          const curArtboardX = (moveEvent.clientX - rect.left) / scale;
          const curArtboardY = (moveEvent.clientY - rect.top) / scale;

          setMarquee(prev => prev ? { ...prev, currentX: curArtboardX, currentY: curArtboardY } : null);

          // Find intersecting elements
          const minX = Math.min(startArtboardX, curArtboardX);
          const maxX = Math.max(startArtboardX, curArtboardX);
          const minY = Math.min(startArtboardY, curArtboardY);
          const maxY = Math.max(startArtboardY, curArtboardY);

          const intersectingIds = slide.elements
            .filter(el => {
              if (el.locked || el.hidden) return false;
              return (
                el.x + el.width >= minX &&
                el.x <= maxX &&
                el.y + el.height >= minY &&
                el.y <= maxY
              );
            })
            .map(el => el.id);

          onSelectMultipleElements(intersectingIds);
        };

        const handlePointerUp = () => {
          setMarquee(null);
          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerup', handlePointerUp);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
      }
    };

    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden select-none bg-slate-950 ${
          isPanning
            ? 'cursor-grabbing'
            : isSpaceDown
            ? 'cursor-grab'
            : 'cursor-default'
        }`}
      onWheel={handleWheel}
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
          onContextMenuElement={onContextMenuElement}
        />

        {/* Marquee Selection Rectangle Overlay */}
        {marquee && (
          <div
            className="absolute border border-indigo-400 bg-indigo-500/20 pointer-events-none z-50 rounded-sm"
            data-export-ignore="true"
            style={{
              left: `${Math.min(marquee.startX, marquee.currentX)}px`,
              top: `${Math.min(marquee.startY, marquee.currentY)}px`,
              width: `${Math.abs(marquee.currentX - marquee.startX)}px`,
              height: `${Math.abs(marquee.currentY - marquee.startY)}px`,
            }}
          />
        )}
      </div>

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
              className="absolute top-0 left-5 right-0 h-5 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800/80 z-20 pointer-events-none overflow-hidden select-none"
              data-export-ignore="true"
            >
              <svg className="w-full h-full">
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
              className="absolute top-5 left-0 bottom-0 w-5 bg-slate-950/90 backdrop-blur-sm border-r border-slate-800/80 z-20 pointer-events-none overflow-hidden select-none"
              data-export-ignore="true"
            >
              <svg className="w-full h-full">
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
