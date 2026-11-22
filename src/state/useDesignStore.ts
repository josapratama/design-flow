import { useState, useCallback, useRef, useEffect } from 'react';
import { DesignElement, DesignMode, DesignProject, PRESET_SIZES, Slide } from '../types';
import { TEMPLATES } from '../templates/template-library';

const AUTOSAVE_STORAGE_KEY = 'designflow_project_state_v1';

function getInitialProject(): DesignProject {
  const initialTemplate = TEMPLATES[0]; // Academic Thesis template as default
  try {
    const saved = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse autosaved project from localStorage', err);
  }
  return {
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
    showRulers: true,
  };
}

export function useDesignStore() {
  const [project, setProject] = useState<DesignProject>(getInitialProject);
  const [lastSaved, setLastSaved] = useState<Date | null>(() => new Date());

  // Debounced Auto-Save to localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(project));
        setLastSaved(new Date());
      } catch (e) {
        console.warn('LocalStorage autosave failed:', e);
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [project]);

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
    updateActiveSlide(slide => {
      const highestZ = slide.elements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0);
      const elementWithZ = {
        ...element,
        zIndex: element.zIndex && element.zIndex > highestZ ? element.zIndex : highestZ + 1,
      };
      return {
        ...slide,
        elements: [...slide.elements, elementWithZ],
      };
    });
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

  // Group selected elements into a single cohesive group
  const groupSelectedElements = useCallback(() => {
    if (project.selectedElementIds.length < 2 || !activeSlide) return;
    const newGroupId = `grp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    updateActiveSlide(slide => ({
      ...slide,
      elements: slide.elements.map(el =>
        project.selectedElementIds.includes(el.id)
          ? { ...el, groupId: newGroupId }
          : el
      ),
    }));
  }, [activeSlide, project.selectedElementIds, updateActiveSlide]);

  // Ungroup selected elements
  const ungroupSelectedElements = useCallback(() => {
    if (project.selectedElementIds.length === 0 || !activeSlide) return;
    updateActiveSlide(slide => ({
      ...slide,
      elements: slide.elements.map(el =>
        project.selectedElementIds.includes(el.id)
          ? { ...el, groupId: undefined }
          : el
      ),
    }));
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
      const selected = activeSlide.elements.filter(el => project.selectedElementIds.includes(el.id));
      if (selected.length === 0) return;

      if (selected.length === 1) {
        // Single element: align relative to canvas / artboard
        const targetEl = selected[0];
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

        updateElement(targetEl.id, { x: newX, y: newY });
      } else {
        // Multi-element: align relative to selection bounding box
        const minX = Math.min(...selected.map(el => el.x));
        const maxX = Math.max(...selected.map(el => el.x + el.width));
        const minY = Math.min(...selected.map(el => el.y));
        const maxY = Math.max(...selected.map(el => el.y + el.height));
        const midX = (minX + maxX) / 2;
        const midY = (minY + maxY) / 2;

        updateActiveSlide(slide => ({
          ...slide,
          elements: slide.elements.map(el => {
            if (!project.selectedElementIds.includes(el.id)) return el;
            let newX = el.x;
            let newY = el.y;

            switch (alignment) {
              case 'left':
                newX = minX;
                break;
              case 'center':
                newX = Math.round(midX - el.width / 2);
                break;
              case 'right':
                newX = maxX - el.width;
                break;
              case 'top':
                newY = minY;
                break;
              case 'middle':
                newY = Math.round(midY - el.height / 2);
                break;
              case 'bottom':
                newY = maxY - el.height;
                break;
            }

            return { ...el, x: newX, y: newY };
          }),
        }));
      }
    },
    [activeSlide, project.selectedElementIds, updateActiveSlide, updateElement]
  );

  // Select / Deselect all selectable elements
  const selectAllElements = useCallback(() => {
    if (!activeSlide) return;
    const selectableIds = activeSlide.elements
      .filter(el => !el.locked && !el.hidden)
      .map(el => el.id);
    setProject(prev => ({ ...prev, selectedElementIds: selectableIds }));
  }, [activeSlide]);

  const deselectAllElements = useCallback(() => {
    setProject(prev => ({ ...prev, selectedElementIds: [] }));
  }, []);

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

  const reorderSlide = useCallback((slideId: string, direction: 'left' | 'right' | 'start' | 'end') => {
    setProject(prev => {
      const index = prev.slides.findIndex(s => s.id === slideId);
      if (index === -1) return prev;

      let targetIndex = index;
      if (direction === 'left') targetIndex = index - 1;
      else if (direction === 'right') targetIndex = index + 1;
      else if (direction === 'start') targetIndex = 0;
      else if (direction === 'end') targetIndex = prev.slides.length - 1;

      if (targetIndex < 0 || targetIndex >= prev.slides.length || targetIndex === index) return prev;

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

  const moveSlideToIndex = useCallback((slideId: string, targetIndex: number) => {
    setProject(prev => {
      const index = prev.slides.findIndex(s => s.id === slideId);
      if (index === -1) return prev;
      if (targetIndex < 0 || targetIndex >= prev.slides.length || targetIndex === index) return prev;

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

  // Global Find and Replace across elements and slide meta
  const replaceTextInElements = useCallback(
    (findText: string, replaceText: string, scope: 'active' | 'all' = 'active', matchCase: boolean = false): number => {
      if (!findText) return 0;
      pushHistory(project.slides);

      let replaceCount = 0;
      const flags = matchCase ? 'g' : 'gi';
      const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedFind, flags);

      const replaceInField = (val?: string): string | undefined => {
        if (!val) return val;
        const matches = val.match(regex);
        if (matches && matches.length > 0) {
          replaceCount += matches.length;
          return val.replace(regex, replaceText);
        }
        return val;
      };

      const newSlides = project.slides.map(slide => {
        if (scope === 'active' && slide.id !== project.activeSlideId) return slide;

        let slideTitle = slide.title;
        let slideNotes = slide.notes;

        if (slideTitle) slideTitle = replaceInField(slideTitle) || slideTitle;
        if (slideNotes) slideNotes = replaceInField(slideNotes);

        const newElements = slide.elements.map(el => {
          let updated = { ...el };
          let changed = false;

          const replaceInElField = (val?: string): string | undefined => {
            if (!val) return val;
            const matches = val.match(regex);
            if (matches && matches.length > 0) {
              replaceCount += matches.length;
              changed = true;
              return val.replace(regex, replaceText);
            }
            return val;
          };

          if (updated.content) updated.content = replaceInElField(updated.content);
          if (updated.subTitle) updated.subTitle = replaceInElField(updated.subTitle);
          if (updated.badgeText) updated.badgeText = replaceInElField(updated.badgeText);
          if (updated.placeholder) updated.placeholder = replaceInElField(updated.placeholder);

          return changed ? updated : el;
        });

        return { ...slide, title: slideTitle, notes: slideNotes, elements: newElements };
      });

      if (replaceCount > 0) {
        setProject(prev => ({ ...prev, slides: newSlides }));
      }

      return replaceCount;
    },
    [project.slides, project.activeSlideId, pushHistory]
  );

  // Reset to clean initial default project
  const resetProjectToDefault = useCallback(() => {
    const initialTemplate = TEMPLATES[0];
    localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
    pushHistory(project.slides);
    setProject({
      id: `proj_${Date.now()}`,
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
      showRulers: true,
    });
  }, [project.slides, pushHistory]);

  // Apply a unified color theme to the active slide and all its elements
  const applyThemeToActiveSlide = useCallback(
    (theme: {
      background: string;
      primaryAccent: string;
      cardFill: string;
      textColor: string;
    }) => {
      pushHistory(project.slides);
      setProject(prev => {
        const newSlides = prev.slides.map(slide => {
          if (slide.id !== prev.activeSlideId) return slide;
          const newElements = slide.elements.map(el => {
            const updated = { ...el };
            if (['button', 'metric-card', 'badge-shape', 'chart'].includes(el.type)) {
              updated.fill = theme.primaryAccent;
            } else if (['card', 'rect'].includes(el.type)) {
              updated.fill = theme.cardFill;
            }
            if (['heading'].includes(el.type)) {
              updated.color = '#ffffff';
            } else if (['text', 'quote'].includes(el.type)) {
              updated.color = theme.textColor;
            }
            return updated;
          });
          return {
            ...slide,
            background: theme.background,
            elements: newElements,
          };
        });
        return { ...prev, slides: newSlides };
      });
    },
    [project.slides, pushHistory]
  );

  // Invert active slide background & element colors (Dark ⇄ Light)
  const invertActiveSlideTheme = useCallback(() => {
    if (!activeSlide) return;
    pushHistory(project.slides);

    const isCurrentlyDark =
      activeSlide.background.startsWith('#0') ||
      activeSlide.background.startsWith('#1') ||
      activeSlide.background.includes('#090d16') ||
      activeSlide.background.includes('#0f172a');

    const newBg = isCurrentlyDark ? '#f8fafc' : '#090d16';

    const newElements = activeSlide.elements.map(el => {
      let updated = { ...el };

      if (isCurrentlyDark) {
        if (!el.color || el.color.startsWith('#f') || el.color.startsWith('#e') || el.color === '#ffffff') {
          updated.color = '#0f172a';
        } else if (el.color === '#94a3b8' || el.color === '#cbd5e1') {
          updated.color = '#475569';
        }
        if (el.fill && (el.fill.startsWith('#0') || el.fill.startsWith('#1') || el.fill.startsWith('rgba(30') || el.fill.startsWith('rgba(59'))) {
          updated.fill = '#ffffff';
          updated.stroke = '#cbd5e1';
        }
      } else {
        if (!el.color || el.color.startsWith('#0') || el.color.startsWith('#1') || el.color === '#0f172a') {
          updated.color = '#f8fafc';
        } else if (el.color === '#475569' || el.color === '#64748b') {
          updated.color = '#94a3b8';
        }
        if (el.fill && (el.fill.startsWith('#f') || el.fill === '#ffffff')) {
          updated.fill = '#131b2e';
          updated.stroke = '#1e293b';
        }
      }

      return updated;
    });

    updateActiveSlide(slide => ({
      ...slide,
      background: newBg,
      elements: newElements,
    }));
  }, [activeSlide, project.slides, pushHistory, updateActiveSlide]);

  return {
    project,
    setProject,
    lastSaved,
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
    moveSlideToIndex,
    loadTemplate,
    saveProjectToFile,
    loadProjectData,
    replaceTextInElements,
    resetProjectToDefault,
    applyThemeToActiveSlide,
    invertActiveSlideTheme,
  };
}
