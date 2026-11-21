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

  const pushHistory = useCallback((currentSlides: Slide[]) => {
    pastRef.current.push(JSON.parse(JSON.stringify(currentSlides)));
    if (pastRef.current.length > 30) pastRef.current.shift();
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

  const updateElement = useCallback((elementId: string, updates: Partial<DesignElement>) => {
    updateActiveSlide(slide => ({
      ...slide,
      elements: slide.elements.map(el => (el.id === elementId ? { ...el, ...updates } : el)),
    }));
  }, [updateActiveSlide]);

  const deleteSelectedElements = useCallback(() => {
    if (project.selectedElementIds.length === 0) return;
    updateActiveSlide(slide => ({
      ...slide,
      elements: slide.elements.filter(el => !project.selectedElementIds.includes(el.id)),
    }));
    setProject(prev => ({ ...prev, selectedElementIds: [] }));
  }, [project.selectedElementIds, updateActiveSlide]);

  const duplicateSelectedElements = useCallback(() => {
    if (project.selectedElementIds.length === 0) return;
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
  };
}
