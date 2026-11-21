import React, { forwardRef } from 'react';
import { DesignElement, Slide } from '../types';
import { ElementRenderer } from './ElementRenderer';
import { TransformHandles } from './TransformHandles';

interface ArtboardRendererProps {
  slide: Slide;
  scale: number;
  selectedElementIds: string[];
  onSelectElement: (elementId: string, multiSelect: boolean) => void;
  onUpdateElement: (elementId: string, updates: Partial<DesignElement>) => void;
}

export const ArtboardRenderer = forwardRef<HTMLDivElement, ArtboardRendererProps>(
  ({ slide, scale, selectedElementIds, onSelectElement, onUpdateElement }, ref) => {
    return (
      <div
        ref={ref}
        id={`artboard-${slide.id}`}
        className="relative shadow-2xl transition-shadow duration-300 rounded-sm select-none"
        style={{
          width: `${slide.width}px`,
          height: `${slide.height}px`,
          backgroundColor: slide.background || '#0f172a',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
        onClick={e => {
          // Click background to deselect if not clicking an element
          if (e.target === e.currentTarget) {
            onSelectElement('', false);
          }
        }}
      >
        {/* Render elements sorted by zIndex */}
        {slide.elements
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map(element => {
            const isSelected = selectedElementIds.includes(element.id);

            return (
              <div
                key={element.id}
                className="absolute"
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  zIndex: element.zIndex,
                  transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
                  opacity: element.opacity !== undefined ? element.opacity : 1,
                  pointerEvents: element.locked ? 'none' : 'auto',
                }}
                onClick={e => {
                  e.stopPropagation();
                  onSelectElement(element.id, e.shiftKey || e.metaKey || e.ctrlKey);
                }}
              >
                <ElementRenderer element={element} isSelected={isSelected} />

                {/* Show resize and drag handles if selected */}
                {isSelected && (
                  <TransformHandles
                    element={element}
                    scale={scale}
                    onUpdate={updates => onUpdateElement(element.id, updates)}
                  />
                )}
              </div>
            );
          })}
      </div>
    );
  }
);
