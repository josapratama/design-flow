import React, { forwardRef, useState } from 'react';
import { DesignElement, Slide } from '../types';
import { ElementRenderer } from './ElementRenderer';
import { TransformHandles } from './TransformHandles';

interface ArtboardRendererProps {
  slide: Slide;
  scale: number;
  snapToGrid?: boolean;
  gridSize?: number;
  selectedElementIds: string[];
  selectedElements: DesignElement[];
  onSelectElement: (elementId: string, multiSelect: boolean) => void;
  onUpdateElement: (elementId: string, updates: Partial<DesignElement>) => void;
  onUpdateElementLive: (elementId: string, updates: Partial<DesignElement>) => void;
  onMoveSelectedLive: (deltaX: number, deltaY: number, basePositions: Map<string, { x: number; y: number }>) => void;
  onCommitHistory: () => void;
}

export const ArtboardRenderer = forwardRef<HTMLDivElement, ArtboardRendererProps>(
  (
    {
      slide,
      scale,
      snapToGrid = true,
      gridSize = 20,
      selectedElementIds,
      selectedElements,
      onSelectElement,
      onUpdateElement,
      onUpdateElementLive,
      onMoveSelectedLive,
      onCommitHistory,
    },
    ref
  ) => {
    const [editingElementId, setEditingElementId] = useState<string | null>(null);

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
          if (e.target === e.currentTarget) {
            onSelectElement('', false);
            setEditingElementId(null);
          }
        }}
      >
        {/* Render elements sorted by zIndex */}
        {slide.elements
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map(element => {
            const isSelected = selectedElementIds.includes(element.id);
            const isEditing = editingElementId === element.id;
            const isTextual = ['heading', 'text', 'quote', 'button'].includes(element.type);

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
                onDoubleClick={e => {
                  e.stopPropagation();
                  if (isTextual && !element.locked) {
                    setEditingElementId(element.id);
                  }
                }}
              >
                {/* Inline WYSIWYG Text Editor on Double-Click */}
                {isEditing ? (
                  <textarea
                    autoFocus
                    defaultValue={element.content || ''}
                    onBlur={e => {
                      onUpdateElement(element.id, { content: e.target.value });
                      setEditingElementId(null);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Escape') {
                        setEditingElementId(null);
                      }
                      if (e.key === 'Enter' && !e.shiftKey && element.type !== 'text') {
                        e.preventDefault();
                        onUpdateElement(element.id, { content: e.currentTarget.value });
                        setEditingElementId(null);
                      }
                    }}
                    className="w-full h-full bg-slate-900/90 border-2 border-indigo-400 rounded p-1 outline-none resize-none shadow-2xl font-inherit"
                    style={{
                      color: element.color || '#ffffff',
                      fontSize: `${element.fontSize || 24}px`,
                      fontWeight:
                        element.fontWeight === 'extrabold'
                          ? 800
                          : element.fontWeight === 'bold'
                          ? 700
                          : element.fontWeight === 'semibold'
                          ? 600
                          : 400,
                      textAlign: element.textAlign || 'left',
                      lineHeight: 1.25,
                    }}
                  />
                ) : (
                  <ElementRenderer element={element} isSelected={isSelected} />
                )}

                {/* Show resize, drag and rotate handles if selected and not actively typing */}
                {isSelected && !isEditing && (
                  <TransformHandles
                    element={element}
                    scale={scale}
                    snapToGrid={snapToGrid}
                    gridSize={gridSize}
                    selectedElements={selectedElements}
                    onUpdateLive={updates => onUpdateElementLive(element.id, updates)}
                    onMoveSelectedLive={onMoveSelectedLive}
                    onCommitHistory={onCommitHistory}
                  />
                )}
              </div>
            );
          })}
      </div>
    );
  }
);
