import React, { useState, useRef, useEffect } from 'react';
import { useDesignStore } from './state/useDesignStore';
import { Navbar } from './components/Navbar';
import { SidebarPalette } from './components/SidebarPalette';
import { CanvasViewport } from './components/CanvasViewport';
import { PropertyInspector } from './components/PropertyInspector';
import { SlideStrip } from './components/SlideStrip';
import { CodeEditorDrawer } from './components/CodeEditorDrawer';
import { PresenterModal } from './components/PresenterModal';
import { ExportModal } from './components/ExportModal';
import { TemplatesModal } from './components/TemplatesModal';
import { Toolbar } from './components/Toolbar';

export default function App() {
  const {
    project,
    setProject,
    activeSlide,
    selectedElements,
    undo,
    redo,
    canUndo,
    canRedo,
    addElement,
    updateElement,
    updateSlideSettings,
    deleteSelectedElements,
    duplicateSelectedElements,
    nudgeSelectedElements,
    alignSelectedElement,
    reorderSelectedElement,
    addSlide,
    duplicateSlide,
    deleteSlide,
    loadTemplate,
  } = useDesignStore();

  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);
  const [isPresenterOpen, setIsPresenterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  const artboardRef = useRef<HTMLDivElement>(null);

  const selectedElement = selectedElements.length > 0 ? selectedElements[0] : null;

  // Global Keyboard Shortcuts (Figma / Canva style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // 1. Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (project.selectedElementIds.length > 0) {
          e.preventDefault();
          deleteSelectedElements();
        }
      }

      // 2. Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // 3. Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
      }

      // 4. Duplicate: Ctrl+D / Cmd+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelectedElements();
      }

      // 5. Arrow Key Nudge
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        nudgeSelectedElements(-step, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nudgeSelectedElements(step, 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        nudgeSelectedElements(0, -step);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        nudgeSelectedElements(0, step);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    project.selectedElementIds,
    deleteSelectedElements,
    undo,
    redo,
    duplicateSelectedElements,
    nudgeSelectedElements,
  ]);

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <Navbar
        title={project.title}
        mode={project.mode}
        canUndo={canUndo}
        canRedo={canRedo}
        isCodeOpen={isCodeDrawerOpen}
        onTitleChange={title => setProject(prev => ({ ...prev, title }))}
        onModeChange={mode => setProject(prev => ({ ...prev, mode }))}
        onUndo={undo}
        onRedo={redo}
        onToggleCode={() => setIsCodeDrawerOpen(!isCodeDrawerOpen)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenPresenter={() => setIsPresenterOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Workspace Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Elements Palette */}
        <SidebarPalette mode={project.mode} onAddElement={addElement} />

        {/* Center Visual Canvas */}
        <main className="flex-1 relative overflow-hidden bg-slate-950">
          <CanvasViewport
            slide={activeSlide}
            scale={project.scale}
            panX={project.panX}
            panY={project.panY}
            showGrid={project.showGrid}
            selectedElementIds={project.selectedElementIds}
            artboardRef={artboardRef}
            onPanChange={(panX, panY) => setProject(prev => ({ ...prev, panX, panY }))}
            onScaleChange={scale => setProject(prev => ({ ...prev, scale }))}
            onSelectElement={(elementId, multi) => {
              setProject(prev => ({
                ...prev,
                selectedElementIds: elementId
                  ? multi
                    ? prev.selectedElementIds.includes(elementId)
                      ? prev.selectedElementIds.filter(id => id !== elementId)
                      : [...prev.selectedElementIds, elementId]
                    : [elementId]
                  : [],
              }));
            }}
            onUpdateElement={updateElement}
          />

          {/* Floating Canvas Controls Toolbar (Zoom, Grid, Quick Actions) */}
          <Toolbar
            scale={project.scale}
            showGrid={project.showGrid}
            hasSelectedElements={project.selectedElementIds.length > 0}
            onZoomIn={() =>
              setProject(prev => ({ ...prev, scale: Math.min(3.0, Number((prev.scale + 0.1).toFixed(2))) }))
            }
            onZoomOut={() =>
              setProject(prev => ({ ...prev, scale: Math.max(0.15, Number((prev.scale - 0.1).toFixed(2))) }))
            }
            onResetZoom={() => setProject(prev => ({ ...prev, scale: 0.6, panX: 40, panY: 30 }))}
            onToggleGrid={() => setProject(prev => ({ ...prev, showGrid: !prev.showGrid }))}
            onDeleteSelected={deleteSelectedElements}
            onDuplicateSelected={duplicateSelectedElements}
          />
        </main>

        {/* Right Property Inspector */}
        <PropertyInspector
          element={selectedElement}
          activeSlide={activeSlide}
          onUpdateElement={updateElement}
          onUpdateSlide={updateSlideSettings}
          onDelete={deleteSelectedElements}
          onDuplicate={duplicateSelectedElements}
          onReorder={reorderSelectedElement}
          onAlignElement={alignSelectedElement}
        />

        {/* Bi-Directional Code Drawer */}
        <CodeEditorDrawer
          isOpen={isCodeDrawerOpen}
          project={project}
          onClose={() => setIsCodeDrawerOpen(false)}
          onApplyCode={updates => {
            setProject(prev => ({ ...prev, ...updates }));
          }}
        />
      </div>

      {/* Bottom Slide Strip for Presentation Mode */}
      {project.mode === 'slide' && (
        <SlideStrip
          slides={project.slides}
          activeSlideId={project.activeSlideId}
          onSelectSlide={slideId =>
            setProject(prev => ({ ...prev, activeSlideId: slideId, selectedElementIds: [] }))
          }
          onAddSlide={addSlide}
          onDuplicateSlide={duplicateSlide}
          onDeleteSlide={deleteSlide}
        />
      )}

      {/* Modals */}
      {isPresenterOpen && (
        <PresenterModal
          slides={project.slides}
          initialSlideIndex={project.slides.findIndex(s => s.id === project.activeSlideId)}
          onClose={() => setIsPresenterOpen(false)}
        />
      )}

      {isExportOpen && (
        <ExportModal
          project={project}
          activeSlide={activeSlide}
          artboardRef={artboardRef}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {isTemplatesOpen && (
        <TemplatesModal
          onSelectTemplate={loadTemplate}
          onClose={() => setIsTemplatesOpen(false)}
        />
      )}
    </div>
  );
}
