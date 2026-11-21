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
  onContextMenuElement?: (e: React.MouseEvent, element: DesignElement) => void;
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
      onContextMenuElement,
    },
    ref
  ) => {
    const [editingElementId, setEditingElementId] = useState<string | null>(null);
    const [guideLines, setGuideLines] = useState<{ x?: number; y?: number } | null>(null);

    return (
      <div
        ref={ref}
        id={`artboard-${slide.id}`}
        className="relative shadow-2xl transition-shadow duration-300 rounded-sm select-none"
        style={{
          width: `${slide.width}px`,
          height: `${slide.height}px`,
          background: slide.background || '#0f172a',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        }}
        onClick={e => {
          if (e.target === e.currentTarget) {
            onSelectElement('', false);
            setEditingElementId(null);
          }
        }}
      >
        {/* Smart Magnetic Guide Lines (Center X and Center Y) */}
        {guideLines?.x !== undefined && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-40 border-l-2 border-dashed border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
            data-export-ignore="true"
            style={{ left: `${guideLines.x}px` }}
          />
        )}
        {guideLines?.y !== undefined && (
          <div
            className="absolute left-0 right-0 pointer-events-none z-40 border-t-2 border-dashed border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
            data-export-ignore="true"
            style={{ top: `${guideLines.y}px` }}
          />
        )}

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
                  transform: [
                    element.rotation ? `rotate(${element.rotation}deg)` : '',
                    element.flipX ? 'scaleX(-1)' : '',
                    element.flipY ? 'scaleY(-1)' : '',
                  ].filter(Boolean).join(' ') || undefined,
                  opacity: element.opacity !== undefined ? element.opacity : 1,
                  pointerEvents: element.locked ? 'none' : 'auto',
                }}
                onClick={e => {
                  e.stopPropagation();
                  onSelectElement(element.id, e.shiftKey || e.metaKey || e.ctrlKey);
                }}
                onContextMenu={e => {
                  if (onContextMenuElement) {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelectElement(element.id, false);
                    onContextMenuElement(e, element);
                  }
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
                    artboardWidth={slide.width}
                    artboardHeight={slide.height}
                    selectedElements={selectedElements}
                    onUpdateLive={updates => onUpdateElementLive(element.id, updates)}
                    onMoveSelectedLive={onMoveSelectedLive}
                    onCommitHistory={onCommitHistory}
                    onGuideLinesChange={setGuideLines}
                  />
                )}
              </div>
            );
          })}

        {/* Collective Multi-Selection Bounding Box & Dimensions Pill */}
        {selectedElements.length >= 2 && (() => {
          const minX = Math.min(...selectedElements.map(e => e.x));
          const maxX = Math.max(...selectedElements.map(e => e.x + e.width));
          const minY = Math.min(...selectedElements.map(e => e.y));
          const maxY = Math.max(...selectedElements.map(e => e.y + e.height));
          const width = maxX - minX;
          const height = maxY - minY;

          return (
            <div
              className="absolute pointer-events-none z-30 border border-indigo-500/70 border-dashed rounded"
              data-export-ignore="true"
              style={{
                left: `${minX}px`,
                top: `${minY}px`,
                width: `${width}px`,
                height: `${height}px`,
              }}
            >
              <div
                className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-[10px] font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>{selectedElements.length} elemen dipilih</span>
                <span className="opacity-70">({Math.round(width)} × {Math.round(height)}px)</span>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }
);
