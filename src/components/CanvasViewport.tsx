import React, { useRef, useState } from 'react';
import { DesignElement, Slide } from '../types';
import { ArtboardRenderer } from './ArtboardRenderer';

interface CanvasViewportProps {
  slide: Slide;
  scale: number;
  panX: number;
  panY: number;
  showGrid: boolean;
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
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  slide,
  scale,
  panX,
  panY,
  showGrid,
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);

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
    if (!isBackground) return;

    // Middle-click (1) or Alt/Space key -> Pan canvas
    if (e.button === 1 || e.altKey) {
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
        isPanning ? 'cursor-grabbing' : 'cursor-default'
      }`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onClick={e => {
        if (e.target === containerRef.current) {
          onSelectElement('', false);
        }
      }}
    >
      {/* Background Dot Grid */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, #64748b 1px, transparent 1px)`,
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
    </div>
  );
};
