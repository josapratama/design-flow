import React, { useState, useRef } from 'react';
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
    deleteSelectedElements,
    duplicateSelectedElements,
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
        </main>

        {/* Right Property Inspector */}
        <PropertyInspector
          element={selectedElement}
          onUpdate={updateElement}
          onDelete={deleteSelectedElements}
          onDuplicate={duplicateSelectedElements}
          onReorder={reorderSelectedElement}
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
