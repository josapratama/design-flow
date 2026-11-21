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
  artboardRef: React.RefObject<HTMLDivElement | null>;
  onPanChange: (panX: number, panY: number) => void;
  onScaleChange: (scale: number) => void;
  onSelectElement: (elementId: string, multiSelect: boolean) => void;
  onUpdateElement: (elementId: string, updates: Partial<DesignElement>) => void;
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
  artboardRef,
  onPanChange,
  onScaleChange,
  onSelectElement,
  onUpdateElement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);

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

  // Middle click or Spacebar drag
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || e.target === containerRef.current) {
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

      {/* Transform Container */}
      <div
        className="absolute transition-transform duration-75 origin-top-left"
        style={{
          transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
        }}
      >
        <ArtboardRenderer
          ref={artboardRef}
          slide={slide}
          scale={scale}
          snapToGrid={snapToGrid}
          gridSize={gridSize}
          selectedElementIds={selectedElementIds}
          onSelectElement={onSelectElement}
          onUpdateElement={onUpdateElement}
        />
      </div>
    </div>
  );
};
