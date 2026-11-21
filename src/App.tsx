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
import { QuickCommandPalette } from './components/QuickCommandPalette';
import { ContextMenu } from './components/ContextMenu';
import { ShortcutsModal } from './components/ShortcutsModal';
import { DesignElement } from './types';
import { preloadCoreFonts } from './utils/fontLoader';

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
    addElements,
    updateElement,
    updateElementLive,
    moveSelectedElementsLive,
    commitHistory,
    updateSlideSettings,
    deleteSelectedElements,
    deleteElementById,
    toggleLockElement,
    toggleHideElement,
    duplicateSelectedElements,
    copySelectedElements,
    pasteElements,
    groupSelectedElements,
    ungroupSelectedElements,
    nudgeSelectedElements,
    alignSelectedElement,
    distributeSelectedElements,
    selectAllElements,
    deselectAllElements,
    reorderSelectedElement,
    addSlide,
    duplicateSlide,
    deleteSlide,
    reorderSlide,
    loadTemplate,
    saveProjectToFile,
    loadProjectData,
  } = useDesignStore();

  const [isCodeDrawerOpen, setIsCodeDrawerOpen] = useState(false);
  const [isPresenterOpen, setIsPresenterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Floating Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    element: DesignElement | null;
  } | null>(null);

  const artboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    preloadCoreFonts();
  }, []);

  const selectedElement = selectedElements.length > 0 ? selectedElements[0] : null;

  // Group-aware element selection helper
  const handleSelectElementWithGroup = React.useCallback(
    (elementId: string, multi: boolean) => {
      if (!elementId) {
        setProject(prev => ({ ...prev, selectedElementIds: [] }));
        return;
      }
      const targetEl = activeSlide.elements.find(el => el.id === elementId);
      const groupMemberIds = targetEl?.groupId
        ? activeSlide.elements.filter(el => el.groupId === targetEl.groupId).map(el => el.id)
        : [elementId];

      setProject(prev => {
        if (multi) {
          const alreadySelected = groupMemberIds.every(id => prev.selectedElementIds.includes(id));
          const newIds = alreadySelected
            ? prev.selectedElementIds.filter(id => !groupMemberIds.includes(id))
            : [...new Set([...prev.selectedElementIds, ...groupMemberIds])];
          return { ...prev, selectedElementIds: newIds };
        } else {
          return { ...prev, selectedElementIds: groupMemberIds };
        }
      });
    },
    [activeSlide]
  );

  // Zoom To Fit calculation
  const handleZoomToFit = React.useCallback(() => {
    const mainEl = document.querySelector('main');
    if (!mainEl || !activeSlide) return;
    const padding = 120;
    const availW = mainEl.clientWidth - padding;
    const availH = mainEl.clientHeight - padding;
    const fitScale = Math.min(availW / activeSlide.width, availH / activeSlide.height, 1.2);
    const roundedScale = Math.max(0.15, Number(fitScale.toFixed(2)));
    const panX = Math.round((mainEl.clientWidth - activeSlide.width * roundedScale) / 2);
    const panY = Math.round((mainEl.clientHeight - activeSlide.height * roundedScale) / 2);
    setProject(prev => ({ ...prev, scale: roundedScale, panX, panY }));
  }, [activeSlide, setProject]);

  // Global Keyboard Shortcuts (Figma / Canva style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // 0. Quick Command Bar: Ctrl+K / Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      // 0.1 Zoom to Fit: Ctrl+0 / Cmd+0
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleZoomToFit();
        return;
      }

      // 0.2 Select All: Ctrl+A / Cmd+A
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        selectAllElements();
        return;
      }

      // 0.3 Deselect All: Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        deselectAllElements();
        return;
      }

      // 0.4 Toggle Rulers: Shift+R
      if (e.shiftKey && e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setProject(prev => ({ ...prev, showRulers: prev.showRulers === false ? true : false }));
        return;
      }

      // 0.5 Shortcuts Help Modal: ? or Ctrl+/
      if (e.key === '?' || ((e.ctrlKey || e.metaKey) && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
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

      // 5. Copy: Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (project.selectedElementIds.length > 0) {
          copySelectedElements();
        }
      }

      // 6. Paste: Ctrl+V / Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteElements();
      }

      // 6.1 Group: Ctrl+G (without Shift)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g' && !e.shiftKey) {
        e.preventDefault();
        groupSelectedElements();
      }

      // 6.2 Ungroup: Ctrl+Shift+G
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g' && e.shiftKey) {
        e.preventDefault();
        ungroupSelectedElements();
      }

      // 7. Arrow Key Nudge
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
    copySelectedElements,
    pasteElements,
    groupSelectedElements,
    ungroupSelectedElements,
    nudgeSelectedElements,
    selectAllElements,
    deselectAllElements,
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
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onSaveProject={saveProjectToFile}
        onLoadProject={loadProjectData}
      />

      {/* Main Workspace Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Elements Palette (Includes Smart Blocks, Media & Layers) */}
        <SidebarPalette
          mode={project.mode}
          activeSlide={activeSlide}
          selectedElementIds={project.selectedElementIds}
          onSelectElement={handleSelectElementWithGroup}
          onToggleLock={toggleLockElement}
          onToggleHide={toggleHideElement}
          onDeleteElement={deleteElementById}
          onReorderElement={reorderSelectedElement}
          onAddElement={addElement}
          onAddElements={addElements}
        />

        {/* Center Visual Canvas */}
        <main className="flex-1 relative overflow-hidden bg-slate-950">
          <CanvasViewport
            slide={activeSlide}
            scale={project.scale}
            panX={project.panX}
            panY={project.panY}
            showGrid={project.showGrid}
            showRulers={project.showRulers !== false}
            snapToGrid={project.snapToGrid}
            gridSize={project.gridSize}
            selectedElementIds={project.selectedElementIds}
            selectedElements={selectedElements}
            artboardRef={artboardRef}
            onPanChange={(panX, panY) => setProject(prev => ({ ...prev, panX, panY }))}
            onScaleChange={scale => setProject(prev => ({ ...prev, scale }))}
            onSelectElement={handleSelectElementWithGroup}
            onSelectMultipleElements={ids => {
              setProject(prev => ({ ...prev, selectedElementIds: ids }));
            }}
            onUpdateElement={updateElement}
            onUpdateElementLive={updateElementLive}
            onMoveSelectedLive={moveSelectedElementsLive}
            onCommitHistory={commitHistory}
            onContextMenuElement={(e, el) => {
              setContextMenu({ x: e.clientX, y: e.clientY, element: el });
            }}
            onContextMenuCanvas={e => {
              setContextMenu({ x: e.clientX, y: e.clientY, element: null });
            }}
          />

          {/* Floating Canvas Controls Toolbar (Zoom, Grid, Quick Actions) */}
          <Toolbar
            scale={project.scale}
            showGrid={project.showGrid}
            showRulers={project.showRulers !== false}
            hasSelectedElements={project.selectedElementIds.length > 0}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onZoomIn={() =>
              setProject(prev => ({ ...prev, scale: Math.min(3.0, Number((prev.scale + 0.1).toFixed(2))) }))
            }
            onZoomOut={() =>
              setProject(prev => ({ ...prev, scale: Math.max(0.15, Number((prev.scale - 0.1).toFixed(2))) }))
            }
            onResetZoom={handleZoomToFit}
            onSetScale={scale => setProject(prev => ({ ...prev, scale }))}
            onToggleGrid={() => setProject(prev => ({ ...prev, showGrid: !prev.showGrid }))}
            onToggleRulers={() =>
              setProject(prev => ({ ...prev, showRulers: prev.showRulers === false ? true : false }))
            }
            onDeleteSelected={deleteSelectedElements}
            onDuplicateSelected={duplicateSelectedElements}
          />
        </main>

        {/* Right Property Inspector with Visual Icon Picker & Style Controls */}
        <PropertyInspector
          element={selectedElement}
          activeSlide={activeSlide}
          selectedCount={project.selectedElementIds.length}
          onUpdateElement={updateElement}
          onUpdateSlide={updateSlideSettings}
          onDelete={deleteSelectedElements}
          onDuplicate={duplicateSelectedElements}
          onReorder={reorderSelectedElement}
          onAlignElement={alignSelectedElement}
          onDistributeElements={distributeSelectedElements}
          onToggleLock={toggleLockElement}
          onToggleHide={toggleHideElement}
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

      {/* Bottom Slide Strip for Presentation Mode with Mini Visual Thumbnails */}
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
          onReorderSlide={reorderSlide}
        />
      )}

      {/* Quick Command Palette (Ctrl+K) */}
      <QuickCommandPalette
        isOpen={isCommandPaletteOpen}
        slideWidth={activeSlide.width}
        slideHeight={activeSlide.height}
        onClose={() => setIsCommandPaletteOpen(false)}
        onAddElement={addElement}
        onAddElements={addElements}
      />

      {/* Floating Right-Click Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          element={contextMenu.element}
          selectedCount={project.selectedElementIds.length}
          onClose={() => setContextMenu(null)}
          onCopy={copySelectedElements}
          onPaste={pasteElements}
          onDuplicate={duplicateSelectedElements}
          onGroup={groupSelectedElements}
          onUngroup={ungroupSelectedElements}
          onReorder={reorderSelectedElement}
          onToggleLock={toggleLockElement}
          onDelete={deleteSelectedElements}
        />
      )}

      {/* Modals */}
      {isPresenterOpen && (
        <PresenterModal
          slides={project.slides}
          initialSlideIndex={project.slides.findIndex(s => s.id === project.activeSlideId)}
          onUpdateSlideNotes={(slideId, notes) => updateSlideSettings(slideId, { notes })}
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

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
