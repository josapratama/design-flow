import { DesignElement, DesignMode, ElementType, PRESET_SIZES, Slide } from '../types';

const ALL_ELEMENT_TYPES: ElementType[] = [
  'rect',
  'circle',
  'triangle',
  'star',
  'hexagon',
  'heart',
  'diamond',
  'speech-bubble',
  'arrow',
  'line',
  'card',
  'badge-shape',
  'heading',
  'text',
  'quote',
  'button',
  'input',
  'navbar',
  'bottom-nav',
  'avatar',
  'metric-card',
  'toggle',
  'table',
  'chart',
  'rating',
  'breadcrumb',
  'alert-box',
  'accordion-item',
  'progress-bar',
  'pricing-card',
  'timeline-item',
  'chat-bubble',
  'code-snippet',
  'testimonial-card',
  'icon',
  'image',
  'qr-code',
];

const ELEMENT_REGEX = new RegExp(
  `^(${ALL_ELEMENT_TYPES.join('|')})\\s+([a-zA-Z0-9_-]+)\\s*\\{`
);

/**
 * Parses DesignFlow DSL back into structured Slides and Elements.
 */
export function parseDesignDSL(dsl: string, currentMode: DesignMode = 'slide'): {
  title: string;
  mode: DesignMode;
  slides: Slide[];
} {
  const lines = dsl.split('\n');
  let title = 'Untitled Project';
  let mode: DesignMode = currentMode;
  const slides: Slide[] = [];

  let currentSlide: Slide | null = null;
  let currentElement: Partial<DesignElement> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line || line.startsWith('//') || line.startsWith('#')) {
      continue;
    }

    if (line.startsWith('@design')) {
      const titleMatch = line.match(/title="([^"]+)"/);
      if (titleMatch) title = unescapeString(titleMatch[1]);

      const modeMatch = line.match(/mode="(slide|uiux|graphic)"/);
      if (modeMatch) mode = modeMatch[1] as DesignMode;
      continue;
    }

    const artboardMatch = line.match(/^(?:artboard|slide)\s+"([^"]+)"\s*\{/);
    if (artboardMatch) {
      const defaultPreset = PRESET_SIZES.find(p => p.mode === mode) || PRESET_SIZES[0];
      currentSlide = {
        id: `slide_${Date.now()}_${slides.length + 1}`,
        title: unescapeString(artboardMatch[1]),
        background: mode === 'slide' ? '#0f172a' : '#ffffff',
        elements: [],
        width: defaultPreset.width,
        height: defaultPreset.height,
        presetName: defaultPreset.name,
      };
      slides.push(currentSlide);
      continue;
    }

    const elementMatch = line.match(ELEMENT_REGEX);
    if (elementMatch && currentSlide) {
      const type = elementMatch[1] as ElementType;
      const rawName = elementMatch[2];
      currentElement = {
        id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type,
        name: rawName,
        x: 100,
        y: 100,
        width: type === 'button' ? 180 : type === 'heading' ? 600 : type === 'qr-code' ? 180 : 200,
        height: type === 'button' ? 48 : type === 'heading' ? 64 : type === 'qr-code' ? 180 : 100,
        zIndex: currentSlide.elements.length + 1,
      };
      continue;
    }

    if (line === '}') {
      if (currentElement && currentSlide) {
        currentSlide.elements.push(currentElement as DesignElement);
        currentElement = null;
      } else if (currentSlide) {
        currentSlide = null;
      }
      continue;
    }

    if (currentElement) {
      parseElementProperty(line, currentElement);
    } else if (currentSlide) {
      parseSlideProperty(line, currentSlide);
    }
  }

  if (slides.length === 0) {
    const defaultPreset = PRESET_SIZES.find(p => p.mode === mode) || PRESET_SIZES[0];
    slides.push({
      id: `slide_${Date.now()}_1`,
      title: 'Slide 1',
      background: mode === 'slide' ? '#0f172a' : '#ffffff',
      elements: [],
      width: defaultPreset.width,
      height: defaultPreset.height,
      presetName: defaultPreset.name,
    });
  }

  return { title, mode, slides };
}

function parseSlideProperty(line: string, slide: Slide) {
  const sizeMatch = line.match(/size:\s*\[(\d+),\s*(\d+)\]/);
  if (sizeMatch) {
    slide.width = parseInt(sizeMatch[1], 10);
    slide.height = parseInt(sizeMatch[2], 10);
    return;
  }

  const bgMatch = line.match(/background:\s*"([^"]+)"/);
  if (bgMatch) {
    slide.background = bgMatch[1];
    return;
  }

  const presetMatch = line.match(/preset:\s*"([^"]+)"/);
  if (presetMatch) {
    slide.presetName = presetMatch[1];
    return;
  }

  const notesMatch = line.match(/notes:\s*"([^"]+)"/);
  if (notesMatch) {
    slide.notes = unescapeString(notesMatch[1]);
    return;
  }

  const wallpaperMatch = line.match(/wallpaper:\s*"([^"]+)"/);
  if (wallpaperMatch) {
    slide.wallpaper = unescapeString(wallpaperMatch[1]);
    return;
  }

  const overlayMatch = line.match(/wallpaperOverlay:\s*([0-9.]+)/);
  if (overlayMatch) {
    slide.wallpaperOverlay = parseFloat(overlayMatch[1]);
    return;
  }

  const transitionMatch = line.match(/transition:\s*"([^"]+)"/);
  if (transitionMatch) {
    slide.transition = transitionMatch[1] as any;
    return;
  }

  const transitionDurMatch = line.match(/transitionDuration:\s*([0-9.]+)/);
  if (transitionDurMatch) {
    slide.transitionDuration = parseFloat(transitionDurMatch[1]);
    return;
  }
}

function parseElementProperty(line: string, el: Partial<DesignElement>) {
  const chartDataMatch = line.match(/chartData:\s*(\[.+\])/);
  if (chartDataMatch) {
    try {
      el.chartData = JSON.parse(chartDataMatch[1]);
    } catch {}
    return;
  }

  const posMatch = line.match(/position:\s*\[(-?\d+),\s*(-?\d+)\]/);
  if (posMatch) {
    el.x = parseInt(posMatch[1], 10);
    el.y = parseInt(posMatch[2], 10);
    return;
  }

  const sizeMatch = line.match(/size:\s*\[(\d+),\s*(\d+)\]/);
  if (sizeMatch) {
    el.width = parseInt(sizeMatch[1], 10);
    el.height = parseInt(sizeMatch[2], 10);
    return;
  }

  // Legacy aliases support
  const iconMatch = line.match(/^icon:\s*"([^"]+)"/);
  if (iconMatch) {
    el.iconName = unescapeString(iconMatch[1]);
    return;
  }

  const badgeAliasMatch = line.match(/^badge:\s*"([^"]+)"/);
  if (badgeAliasMatch) {
    el.badgeText = unescapeString(badgeAliasMatch[1]);
    return;
  }

  if (line.startsWith('locked:')) {
    el.locked = line.includes('true');
    return;
  }
  if (line.startsWith('hidden:')) {
    el.hidden = line.includes('true');
    return;
  }
  if (line.startsWith('flipX:')) {
    el.flipX = line.includes('true');
    return;
  }
  if (line.startsWith('flipY:')) {
    el.flipY = line.includes('true');
    return;
  }

  const strProps: (keyof DesignElement)[] = [
    'content',
    'color',
    'fill',
    'stroke',
    'variant',
    'placeholder',
    'iconName',
    'subTitle',
    'badgeText',
    'shadow',
    'strokeDash',
    'fontWeight',
    'fontStyle',
    'textDecoration',
    'textTransform',
    'textAlign',
    'imageUrl',
    'groupId',
    'fontFamily',
    'chartType',
    'linkToSlideId',
    'animation',
  ];

  for (const prop of strProps) {
    const match = line.match(new RegExp(`^${prop}:\\s*"([^"]*)"`));
    if (match) {
      (el as any)[prop] = unescapeString(match[1]);
      return;
    }
  }

  const numProps: (keyof DesignElement)[] = [
    'zIndex',
    'rotation',
    'opacity',
    'fontSize',
    'strokeWidth',
    'borderRadius',
    'letterSpacing',
    'lineHeight',
    'animationDuration',
    'animationDelay',
  ];

  for (const prop of numProps) {
    const match = line.match(new RegExp(`^${prop}:\\s*(-?[0-9.]+)`));
    if (match) {
      (el as any)[prop] = parseFloat(match[1]);
      return;
    }
  }
}

function unescapeString(str: string): string {
  return str.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}
