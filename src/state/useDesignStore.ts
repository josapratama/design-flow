import { useState, useCallback, useRef } from 'react';
import { DesignElement, DesignMode, DesignProject, PRESET_SIZES, Slide } from '../types';
import { TEMPLATES } from '../templates/template-library';

export function useDesignStore() {
  const initialTemplate = TEMPLATES[0]; // Academic Thesis template as default

  const [project, setProject] = useState<DesignProject>({
    id: 'proj_1',
    title: 'Naskah Presentasi Sidang Skripsi',
    mode: 'slide',
    slides: JSON.parse(JSON.stringify(initialTemplate.slides)),
    activeSlideId: initialTemplate.slides[0].id,
    selectedElementIds: [],
    scale: 0.55,
    panX: 40,
    panY: 30,
    showGrid: true,
    snapToGrid: true,
    gridSize: 20,
  });

  // History Stack for Undo/Redo
  const pastRef = useRef<Slide[][]>([]);
  const futureRef = useRef<Slide[][]>([]);

  // Internal Clipboard for Cross-Slide Copy & Paste
  const clipboardRef = useRef<DesignElement[]>([]);

  const pushHistory = useCallback((currentSlides: Slide[]) => {
    pastRef.current.push(JSON.parse(JSON.stringify(currentSlides)));
    if (pastRef.current.length > 35) pastRef.current.shift();
    futureRef.current = [];
  }, []);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current.pop()!;
    futureRef.current.push(JSON.parse(JSON.stringify(project.slides)));
    setProject(prev => ({
      ...prev,
      slides: previous,
      selectedElementIds: [],
    }));
  }, [project.slides]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop()!;
    pastRef.current.push(JSON.parse(JSON.stringify(project.slides)));
    setProject(prev => ({
      ...prev,
      slides: next,
      selectedElementIds: [],
    }));
  }, [project.slides]);

  // Current active slide helper
  const activeSlide = project.slides.find(s => s.id === project.activeSlideId) || project.slides[0];

  // Selected element helper
  const selectedElements = activeSlide?.elements.filter(el =>
    project.selectedElementIds.includes(el.id)
  ) || [];

  const updateActiveSlide = useCallback((updater: (slide: Slide) => Slide) => {
    setProject(prev => {
      pushHistory(prev.slides);
      const newSlides = prev.slides.map(s => (s.id === prev.activeSlideId ? updater(s) : s));
      return { ...prev, slides: newSlides };
    });
  }, [pushHistory]);

  const updateSlideSettings = useCallback((slideId: string, updates: Partial<Slide>) => {
    setProject(prev => {
      pushHistory(prev.slides);
      const newSlides = prev.slides.map(s => (s.id === slideId ? { ...s, ...updates } : s));
      return { ...prev, slides: newSlides };
    });
  }, [pushHistory]);

  const addElement = useCallback((element: DesignElement) => {
    updateActiveSlide(slide => ({
      ...slide,
      elements: [...slide.elements, element],
    }));
    setProject(prev => ({ ...prev, selectedElementIds: [element.id] }));
  }, [updateActiveSlide]);

  const addElements = useCallback((elements: DesignElement[]) => {
    updateActiveSlide(slide => ({
      ...slide,
      elements: [...slide.elements, ...elements],
    }));
    setProject(prev => ({ ...prev, selectedElementIds: elements.map(e => e.id) }));
  }, [updateActiveSlide]);

  // Update element with history tracking
  const updateElement = useCallback((elementId: string, updates: Partial<DesignElement>) => {
    updateActiveSlide(slide => ({
      ...slide,
      elements: slide.elements.map(el => (el.id === elementId ? { ...el, ...updates } : el)),
    }));
  }, [updateActiveSlide]);

  // Live update without pushing to history (used while dragging, rotating, resizing)
  const updateElementLive = useCallback((elementId: string, updates: Partial<DesignElement>) => {
    setProject(prev => {
      const newSlides = prev.slides.map(s => {
        if (s.id !== prev.activeSlideId) return s;
        return {
          ...s,
          elements: s.elements.map(el => (el.id === elementId ? { ...el, ...updates } : el)),
        };
      });
      return { ...prev, slides: newSlides };
    });
  }, []);

  // Move multiple selected elements simultaneously during drag
  const moveSelectedElementsLive = useCallback((deltaX: number, deltaY: number, basePositions: Map<string, { x: number; y: number }>) => {
    setProject(prev => {
      const newSlides = prev.slides.map(s => {
        if (s.id !== prev.activeSlideId) return s;
        return {
          ...s,
          elements: s.elements.map(el => {
            const base = basePositions.get(el.id);
            if (base) {
              return { ...el, x: base.x + deltaX, y: base.y + deltaY };
            }
            return el;
          }),
        };
      });
      return { ...prev, slides: newSlides };
    });
  }, []);

  // Explicit history snapshot commit when mouse interaction finishes
  const commitHistory = useCallback(() => {
    pushHistory(project.slides);
  }, [project.slides, pushHistory]);

  const deleteSelectedElements = useCallback(() => {
    if (project.selectedElementIds.length === 0) return;
    updateActiveSlide(slide => ({
      ...slide,
      elements: slide.elements.filter(el => !project.selectedElementIds.includes(el.id)),
    }));
    setProject(prev => ({ ...prev, selectedElementIds: [] }));
  }, [project.selectedElementIds, updateActiveSlide]);

  const deleteElementById = useCallback((elementId: string) => {
    updateActiveSlide(slide => ({
      ...slide,
      elements: slide.elements.filter(el => el.id !== elementId),
    }));
    setProject(prev => ({
      ...prev,
      selectedElementIds: prev.selectedElementIds.filter(id => id !== elementId),
    }));
  }, [updateActiveSlide]);

  const toggleLockElement = useCallback((elementId: string) => {
    updateActiveSlide(slide => ({
      ...slide,
      elements: slide.elements.map(el => (el.id === elementId ? { ...el, locked: !el.locked } : el)),
    }));
  }, [updateActiveSlide]);

  const toggleHideElement = useCallback((elementId: string) => {
    updateActiveSlide(slide => ({
      ...slide,
      elements: slide.elements.map(el => (el.id === elementId ? { ...el, hidden: !el.hidden } : el)),
    }));
  }, [updateActiveSlide]);

  const duplicateSelectedElements = useCallback(() => {
    if (project.selectedElementIds.length === 0 || !activeSlide) return;
    const duplicated: DesignElement[] = [];
    const newSelectedIds: string[] = [];

    activeSlide.elements.forEach(el => {
      if (project.selectedElementIds.includes(el.id)) {
        const newId = `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const clone: DesignElement = {
          ...JSON.parse(JSON.stringify(el)),
          id: newId,
          name: `${el.name}_copy`,
          x: el.x + 30,
          y: el.y + 30,
          zIndex: activeSlide.elements.length + duplicated.length + 1,
        };
        duplicated.push(clone);
        newSelectedIds.push(newId);
      }
    });

    updateActiveSlide(slide => ({
      ...slide,
      elements: [...slide.elements, ...duplicated],
    }));
    setProject(prev => ({ ...prev, selectedElementIds: newSelectedIds }));
  }, [activeSlide, project.selectedElementIds, updateActiveSlide]);

  // Copy elements to clipboard (supports cross-slide paste)
  const copySelectedElements = useCallback(() => {
    if (project.selectedElementIds.length === 0 || !activeSlide) return;
    const targets = activeSlide.elements.filter(el => project.selectedElementIds.includes(el.id));
    clipboardRef.current = JSON.parse(JSON.stringify(targets));
  }, [activeSlide, project.selectedElementIds]);

  // Paste elements from clipboard onto the active slide
  const pasteElements = useCallback(() => {
    if (clipboardRef.current.length === 0 || !activeSlide) return;
    const newElements: DesignElement[] = [];
    const newSelectedIds: string[] = [];

    clipboardRef.current.forEach((el, idx) => {
      const newId = `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const clone: DesignElement = {
        ...JSON.parse(JSON.stringify(el)),
        id: newId,
        x: el.x + 25,
        y: el.y + 25,
        zIndex: activeSlide.elements.length + idx + 1,
      };
      newElements.push(clone);
      newSelectedIds.push(newId);
    });

    // Offset clipboard items so repeated pastes cascade down
    clipboardRef.current = clipboardRef.current.map(el => ({ ...el, x: el.x + 20, y: el.y + 20 }));

    addElements(newElements);
    setProject(prev => ({ ...prev, selectedElementIds: newSelectedIds }));
  }, [activeSlide, addElements]);

  const nudgeSelectedElements = useCallback((deltaX: number, deltaY: number) => {
    if (project.selectedElementIds.length === 0) return;
    updateActiveSlide(slide => ({
      ...slide,
      elements: slide.elements.map(el =>
        project.selectedElementIds.includes(el.id)
          ? { ...el, x: el.x + deltaX, y: el.y + deltaY }
          : el
      ),
    }));
  }, [project.selectedElementIds, updateActiveSlide]);

  const alignSelectedElement = useCallback(
    (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
      if (project.selectedElementIds.length === 0 || !activeSlide) return;
      const targetId = project.selectedElementIds[0];
      const targetEl = activeSlide.elements.find(el => el.id === targetId);
      if (!targetEl) return;

      let newX = targetEl.x;
      let newY = targetEl.y;

      switch (alignment) {
        case 'left':
          newX = 0;
          break;
        case 'center':
          newX = Math.round((activeSlide.width - targetEl.width) / 2);
          break;
        case 'right':
          newX = activeSlide.width - targetEl.width;
          break;
        case 'top':
          newY = 0;
          break;
        case 'middle':
          newY = Math.round((activeSlide.height - targetEl.height) / 2);
          break;
        case 'bottom':
          newY = activeSlide.height - targetEl.height;
          break;
      }

      updateElement(targetId, { x: newX, y: newY });
    },
    [activeSlide, project.selectedElementIds, updateElement]
  );

  // Distribute spacing evenly horizontally or vertically (for 3+ elements)
  const distributeSelectedElements = useCallback((direction: 'horizontal' | 'vertical') => {
    if (project.selectedElementIds.length < 3 || !activeSlide) return;
    const selected = activeSlide.elements
      .filter(el => project.selectedElementIds.includes(el.id));

    if (selected.length < 3) return;

    if (direction === 'horizontal') {
      selected.sort((a, b) => a.x - b.x);
      const minX = selected[0].x;
      const lastEl = selected[selected.length - 1];
      const maxX = lastEl.x + lastEl.width;
      const totalWidths = selected.reduce((sum, el) => sum + el.width, 0);
      const totalSpacing = maxX - minX - totalWidths;
      const gap = totalSpacing / (selected.length - 1);

      let currentX = minX;
      updateActiveSlide(slide => {
        const posMap = new Map<string, number>();
        selected.forEach(el => {
          posMap.set(el.id, Math.round(currentX));
          currentX += el.width + gap;
        });

        return {
          ...slide,
          elements: slide.elements.map(el => {
            if (posMap.has(el.id)) {
              return { ...el, x: posMap.get(el.id)! };
            }
            return el;
          }),
        };
      });
    } else {
      selected.sort((a, b) => a.y - b.y);
      const minY = selected[0].y;
      const lastEl = selected[selected.length - 1];
      const maxY = lastEl.y + lastEl.height;
      const totalHeights = selected.reduce((sum, el) => sum + el.height, 0);
      const totalSpacing = maxY - minY - totalHeights;
      const gap = totalSpacing / (selected.length - 1);

      let currentY = minY;
      updateActiveSlide(slide => {
        const posMap = new Map<string, number>();
        selected.forEach(el => {
          posMap.set(el.id, Math.round(currentY));
          currentY += el.height + gap;
        });

        return {
          ...slide,
          elements: slide.elements.map(el => {
            if (posMap.has(el.id)) {
              return { ...el, y: posMap.get(el.id)! };
            }
            return el;
          }),
        };
      });
    }
  }, [activeSlide, project.selectedElementIds, updateActiveSlide]);

  const reorderSelectedElement = useCallback((direction: 'front' | 'back' | 'up' | 'down') => {
    if (project.selectedElementIds.length === 0) return;
    const targetId = project.selectedElementIds[0];

    updateActiveSlide(slide => {
      const elements = [...slide.elements];
      const index = elements.findIndex(el => el.id === targetId);
      if (index === -1) return slide;

      const [removed] = elements.splice(index, 1);
      if (direction === 'front') {
        elements.push(removed);
      } else if (direction === 'back') {
        elements.unshift(removed);
      } else if (direction === 'up') {
        elements.splice(Math.min(elements.length, index + 1), 0, removed);
      } else if (direction === 'down') {
        elements.splice(Math.max(0, index - 1), 0, removed);
      }

      // Reassign sequential zIndexes
      elements.forEach((el, idx) => {
        el.zIndex = idx + 1;
      });

      return { ...slide, elements };
    });
  }, [project.selectedElementIds, updateActiveSlide]);

  // Slide Management
  const addSlide = useCallback((presetName?: string) => {
    const preset = PRESET_SIZES.find(p => p.name === presetName) || PRESET_SIZES[0];
    const newSlide: Slide = {
      id: `slide_${Date.now()}_${project.slides.length + 1}`,
      title: `Slide ${project.slides.length + 1}`,
      background: project.mode === 'slide' ? '#0f172a' : '#ffffff',
      elements: [],
      width: preset.width,
      height: preset.height,
      presetName: preset.name,
    };

    setProject(prev => {
      pushHistory(prev.slides);
      return {
        ...prev,
        slides: [...prev.slides, newSlide],
        activeSlideId: newSlide.id,
        selectedElementIds: [],
      };
    });
  }, [project.mode, project.slides.length, pushHistory]);

  const duplicateSlide = useCallback((slideId: string) => {
    const target = project.slides.find(s => s.id === slideId);
    if (!target) return;

    const clone: Slide = {
      ...JSON.parse(JSON.stringify(target)),
      id: `slide_${Date.now()}_copy`,
      title: `${target.title} (Salinan)`,
      elements: target.elements.map(el => ({
        ...el,
        id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      })),
    };

    setProject(prev => {
      pushHistory(prev.slides);
      const index = prev.slides.findIndex(s => s.id === slideId);
      const newSlides = [...prev.slides];
      newSlides.splice(index + 1, 0, clone);
      return {
        ...prev,
        slides: newSlides,
        activeSlideId: clone.id,
        selectedElementIds: [],
      };
    });
  }, [project.slides, pushHistory]);

  const deleteSlide = useCallback((slideId: string) => {
    if (project.slides.length <= 1) return; // Keep at least one slide

    setProject(prev => {
      pushHistory(prev.slides);
      const filtered = prev.slides.filter(s => s.id !== slideId);
      const nextActiveId = prev.activeSlideId === slideId ? filtered[0].id : prev.activeSlideId;
      return {
        ...prev,
        slides: filtered,
        activeSlideId: nextActiveId,
        selectedElementIds: [],
      };
    });
  }, [project.slides.length, pushHistory]);

  const reorderSlide = useCallback((slideId: string, direction: 'left' | 'right') => {
    setProject(prev => {
      const index = prev.slides.findIndex(s => s.id === slideId);
      if (index === -1) return prev;

      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.slides.length) return prev;

      pushHistory(prev.slides);
      const newSlides = [...prev.slides];
      const [moved] = newSlides.splice(index, 1);
      newSlides.splice(targetIndex, 0, moved);

      return {
        ...prev,
        slides: newSlides,
        activeSlideId: moved.id,
      };
    });
  }, [pushHistory]);

  // Load a complete template
  const loadTemplate = useCallback((template: typeof TEMPLATES[0]) => {
    pushHistory(project.slides);
    setProject(prev => ({
      ...prev,
      mode: template.category,
      slides: JSON.parse(JSON.stringify(template.slides)),
      activeSlideId: template.slides[0].id,
      selectedElementIds: [],
    }));
  }, [project.slides, pushHistory]);

  // Save project as JSON file
  const saveProjectToFile = useCallback(() => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(project, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.designflow.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [project]);

  // Load project from parsed JSON
  const loadProjectData = useCallback((importedProject: DesignProject) => {
    pushHistory(project.slides);
    setProject(prev => ({
      ...importedProject,
      activeSlideId: importedProject.slides[0]?.id || prev.activeSlideId,
      scale: prev.scale,
      panX: prev.panX,
      panY: prev.panY,
    }));
  }, [project.slides, pushHistory]);

  return {
    project,
    setProject,
    activeSlide,
    selectedElements,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
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
    nudgeSelectedElements,
    alignSelectedElement,
    distributeSelectedElements,
    reorderSelectedElement,
    addSlide,
    duplicateSlide,
    deleteSlide,
    reorderSlide,
    loadTemplate,
    saveProjectToFile,
    loadProjectData,
  };
}
