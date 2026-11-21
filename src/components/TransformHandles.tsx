import React, { useState } from 'react';
import { DesignElement } from '../types';

interface TransformHandlesProps {
  element: DesignElement;
  scale: number;
  onUpdate: (updates: Partial<DesignElement>) => void;
}

export const TransformHandles: React.FC<TransformHandlesProps> = ({ element, scale, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);

  // Resize handler
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

      if (direction.includes('e')) newWidth = Math.max(20, initialWidth + deltaX);
      if (direction.includes('s')) newHeight = Math.max(20, initialHeight + deltaY);
      if (direction.includes('w')) {
        const potentialWidth = initialWidth - deltaX;
        if (potentialWidth > 20) {
          newWidth = potentialWidth;
          newX = initialX + deltaX;
        }
      }
      if (direction.includes('n')) {
        const potentialHeight = initialHeight - deltaY;
        if (potentialHeight > 20) {
          newHeight = potentialHeight;
          newY = initialY + deltaY;
        }
      }

      onUpdate({ width: Math.round(newWidth), height: Math.round(newHeight), x: Math.round(newX), y: Math.round(newY) });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Drag element position
  const handleDragPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = element.x;
    const initialY = element.y;

    setIsDragging(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;

      onUpdate({
        x: Math.round(initialX + deltaX),
        y: Math.round(initialY + deltaY),
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
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
      className="absolute inset-0 pointer-events-auto border-2 border-indigo-500 rounded-[2px]"
      style={{
        outline: '1px solid rgba(99, 102, 241, 0.4)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onPointerDown={handleDragPointerDown}
    >
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

      {/* Floating Coordinates Tag */}
      <div
        className="absolute -top-7 left-0 px-1.5 py-0.5 bg-indigo-600 text-[10px] font-mono text-white rounded shadow pointer-events-none whitespace-nowrap"
      >
        {element.width} × {element.height} px
      </div>
    </div>
  );
};
