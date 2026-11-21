import React, { useState } from 'react';
import { DesignElement } from '../types';

interface TransformHandlesProps {
  element: DesignElement;
  scale: number;
  snapToGrid?: boolean;
  gridSize?: number;
  artboardWidth?: number;
  artboardHeight?: number;
  selectedElements: DesignElement[];
  onUpdateLive: (updates: Partial<DesignElement>) => void;
  onMoveSelectedLive: (deltaX: number, deltaY: number, basePositions: Map<string, { x: number; y: number }>) => void;
  onCommitHistory: () => void;
  onGuideLinesChange?: (guides: { x?: number; y?: number } | null) => void;
}

export const TransformHandles: React.FC<TransformHandlesProps> = ({
  element,
  scale,
  snapToGrid = true,
  gridSize = 20,
  artboardWidth,
  artboardHeight,
  selectedElements,
  onUpdateLive,
  onMoveSelectedLive,
  onCommitHistory,
  onGuideLinesChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const applySnap = (val: number): number => {
    if (!snapToGrid) return Math.round(val);
    return Math.round(val / gridSize) * gridSize;
  };

  // 1. Resize handler
  const handleResizePointerDown = (
    e: React.PointerEvent,
    direction: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialWidth = element.width;
    const initialHeight = element.height;
    const initialX = element.x;
    const initialY = element.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;

      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newX = initialX;
      let newY = initialY;

      if (direction.includes('e')) newWidth = Math.max(20, applySnap(initialWidth + deltaX));
      if (direction.includes('s')) newHeight = Math.max(20, applySnap(initialHeight + deltaY));
      if (direction.includes('w')) {
        const potentialWidth = initialWidth - deltaX;
        if (potentialWidth > 20) {
          newWidth = applySnap(potentialWidth);
          newX = applySnap(initialX + deltaX);
        }
      }
      if (direction.includes('n')) {
        const potentialHeight = initialHeight - deltaY;
        if (potentialHeight > 20) {
          newHeight = applySnap(potentialHeight);
          newY = applySnap(initialY + deltaY);
        }
      }

      onUpdateLive({ width: newWidth, height: newHeight, x: newX, y: newY });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      onCommitHistory();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // 2. Drag element position (moves ALL selected elements together + Magnetic Center Guides)
  const handleDragPointerDown = (e: React.PointerEvent) => {
    if (isRotating) return;
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;

    // Snapshot current positions of all selected elements
    const basePositions = new Map<string, { x: number; y: number }>();
    selectedElements.forEach(el => {
      basePositions.set(el.id, { x: el.x, y: el.y });
    });

    setIsDragging(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;

      let finalDeltaX = applySnap(deltaX);
      let finalDeltaY = applySnap(deltaY);

      const guides: { x?: number; y?: number } = {};

      // Magnetic Snapping to Artboard Center X
      if (artboardWidth) {
        const potentialCenterX = element.x + finalDeltaX + element.width / 2;
        const artboardMidX = Math.round(artboardWidth / 2);
        if (Math.abs(potentialCenterX - artboardMidX) <= 12) {
          finalDeltaX = Math.round(artboardMidX - element.width / 2 - element.x);
          guides.x = artboardMidX;
        }
      }

      // Magnetic Snapping to Artboard Center Y
      if (artboardHeight) {
        const potentialCenterY = element.y + finalDeltaY + element.height / 2;
        const artboardMidY = Math.round(artboardHeight / 2);
        if (Math.abs(potentialCenterY - artboardMidY) <= 12) {
          finalDeltaY = Math.round(artboardMidY - element.height / 2 - element.y);
          guides.y = artboardMidY;
        }
      }

      onGuideLinesChange?.(Object.keys(guides).length > 0 ? guides : null);
      onMoveSelectedLive(finalDeltaX, finalDeltaY, basePositions);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      onGuideLinesChange?.(null);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      onCommitHistory();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // 3. Rotation handle
  const handleRotatePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);

    const target = e.currentTarget.parentElement as HTMLElement;
    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const mouseX = moveEvent.clientX;
      const mouseY = moveEvent.clientY;

      const rad = Math.atan2(mouseY - centerY, mouseX - centerX);
      let deg = Math.round((rad * 180) / Math.PI + 90);
      if (deg < 0) deg += 360;

      // Snap to 15 degrees if Shift is held
      if (moveEvent.shiftKey) {
        deg = Math.round(deg / 15) * 15;
      }

      onUpdateLive({ rotation: deg % 360 });
    };

    const handlePointerUp = () => {
      setIsRotating(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      onCommitHistory();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleSize = 9 / scale;
  const offset = -handleSize / 2;

  const handleStyle = (cursor: string) => ({
    width: `${handleSize}px`,
    height: `${handleSize}px`,
    cursor,
  });

  return (
    <div
      className="transform-handles absolute inset-0 pointer-events-auto border-2 border-indigo-500 rounded-[2px]"
      data-export-ignore="true"
      style={{
        outline: '1px solid rgba(99, 102, 241, 0.4)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onPointerDown={handleDragPointerDown}
    >
      {/* Rotation Stalk and Handle */}
      <div
        className="absolute left-1/2 -top-6 -translate-x-1/2 flex flex-col items-center pointer-events-auto"
        data-export-ignore="true"
      >
        <div
          className="w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full shadow-md cursor-crosshair hover:scale-125 transition-transform"
          title="Putar Elemen (Tahan Shift untuk 15°)"
          onPointerDown={handleRotatePointerDown}
        />
        <div className="w-[1.5px] h-2.5 bg-indigo-500 pointer-events-none" />
      </div>

      {/* 8 Resize Handles */}
      <div
        className="absolute bg-white border-2 border-indigo-600 rounded-sm shadow-md"
        style={{ ...handleStyle('nwse-resize'), top: `${offset}px`, left: `${offset}px` }}
        onPointerDown={e => handleResizePointerDown(e, 'nw')}
      />
      <div
        className="absolute bg-white border-2 border-indigo-600 rounded-sm shadow-md"
        style={{ ...handleStyle('ns-resize'), top: `${offset}px`, left: '50%', transform: 'translateX(-50%)' }}
        onPointerDown={e => handleResizePointerDown(e, 'n')}
      />
      <div
        className="absolute bg-white border-2 border-indigo-600 rounded-sm shadow-md"
        style={{ ...handleStyle('nesw-resize'), top: `${offset}px`, right: `${offset}px` }}
        onPointerDown={e => handleResizePointerDown(e, 'ne')}
      />
      <div
        className="absolute bg-white border-2 border-indigo-600 rounded-sm shadow-md"
        style={{ ...handleStyle('ew-resize'), top: '50%', right: `${offset}px`, transform: 'translateY(-50%)' }}
        onPointerDown={e => handleResizePointerDown(e, 'e')}
      />
      <div
        className="absolute bg-white border-2 border-indigo-600 rounded-sm shadow-md"
        style={{ ...handleStyle('nwse-resize'), bottom: `${offset}px`, right: `${offset}px` }}
        onPointerDown={e => handleResizePointerDown(e, 'se')}
      />
      <div
        className="absolute bg-white border-2 border-indigo-600 rounded-sm shadow-md"
        style={{ ...handleStyle('ns-resize'), bottom: `${offset}px`, left: '50%', transform: 'translateX(-50%)' }}
        onPointerDown={e => handleResizePointerDown(e, 's')}
      />
      <div
        className="absolute bg-white border-2 border-indigo-600 rounded-sm shadow-md"
        style={{ ...handleStyle('nesw-resize'), bottom: `${offset}px`, left: `${offset}px` }}
        onPointerDown={e => handleResizePointerDown(e, 'sw')}
      />
      <div
        className="absolute bg-white border-2 border-indigo-600 rounded-sm shadow-md"
        style={{ ...handleStyle('ew-resize'), top: '50%', left: `${offset}px`, transform: 'translateY(-50%)' }}
        onPointerDown={e => handleResizePointerDown(e, 'w')}
      />

      {/* Floating Coordinates & Rotation Tag */}
      <div
        className="absolute -top-7 left-0 px-1.5 py-0.5 bg-indigo-600 text-[10px] font-mono text-white rounded shadow pointer-events-none whitespace-nowrap"
      >
        {element.width} × {element.height} px {element.rotation ? `(${element.rotation}°)` : ''}
      </div>
    </div>
  );
};
