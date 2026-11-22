import { Slide, DesignElement, DesignProject } from '../types';

/**
 * Converts a Slide or UI/UX Artboard into clean React 19 + Tailwind CSS code.
 */
export function exportToReactTailwind(slide: Slide): string {
  const usedIcons = Array.from(
    new Set(
      slide.elements
        .filter(el => !el.hidden && el.type === 'icon')
        .map(el => el.iconName || 'Sparkles')
    )
  );

  const googleFonts = Array.from(
    new Set(
      slide.elements
        .map(el => el.fontFamily)
        .filter((f): f is string => Boolean(f && !['sans', 'serif', 'mono'].includes(f)))
    )
  );

  const lucideImport = usedIcons.length > 0 ? `import { ${usedIcons.join(', ')} } from 'lucide-react';\n` : '';
  const fontStyleTag = googleFonts.length > 0
    ? `      <style>{\`@import url('https://fonts.googleapis.com/css2?${googleFonts.map(f => `family=${encodeURIComponent(f)}:wght@400;600;700`).join('&')}&display=swap');\`}</style>\n`
    : '';

  const jsxElements = slide.elements
    .filter(el => !el.hidden)
    .sort((a, b) => a.zIndex - b.zIndex)
    .map(el => renderElementJSX(el))
    .join('\n\n');

  return `import React from 'react';
${lucideImport}
export default function ${sanitizeComponentName(slide.title)}Screen() {
  return (
    <div 
      className="relative overflow-hidden shadow-2xl transition-all duration-200 select-none"
      style={{
        width: '${slide.width}px',
        height: '${slide.height}px',
        background: '${slide.background || '#0f172a'}',
        ${slide.wallpaper ? (slide.wallpaperOverlay && slide.wallpaperOverlay > 0 ? `backgroundImage: 'linear-gradient(rgba(0,0,0,${slide.wallpaperOverlay}), rgba(0,0,0,${slide.wallpaperOverlay})), url(${slide.wallpaper})', backgroundSize: 'cover', backgroundPosition: 'center',` : `backgroundImage: 'url(${slide.wallpaper})', backgroundSize: 'cover', backgroundPosition: 'center',`) : ''}
      }}
    >
${fontStyleTag}${jsxElements}
    </div>
  );
}
`;
}

/**
 * Converts an entire presentation deck (multi-slide) into a complete, interactive
 * React 19 + Tailwind CSS slideshow component with state, navigation, keyboard controls, and progress.
 */
export function exportProjectToReactDeck(project: DesignProject): string {
  const allIcons = Array.from(
    new Set(
      project.slides.flatMap(s =>
        s.elements
          .filter(el => !el.hidden && el.type === 'icon')
          .map(el => el.iconName || 'Sparkles')
      )
    )
  );

  const allGoogleFonts = Array.from(
    new Set(
      project.slides.flatMap(s =>
        s.elements
          .map(el => el.fontFamily)
          .filter((f): f is string => Boolean(f && !['sans', 'serif', 'mono'].includes(f)))
      )
    )
  );

  const lucideIcons = ['ChevronLeft', 'ChevronRight', ...allIcons];
  const lucideImport = `import { ${Array.from(new Set(lucideIcons)).join(', ')} } from 'lucide-react';\n`;
  const fontStyleTag = allGoogleFonts.length > 0
    ? `      <style>{\`@import url('https://fonts.googleapis.com/css2?${allGoogleFonts.map(f => `family=${encodeURIComponent(f)}:wght@400;600;700`).join('&')}&display=swap');\`}</style>\n`
    : '';

  const slideComponents = project.slides.map((slide, idx) => {
    const compName = `Slide${idx + 1}_${sanitizeComponentName(slide.title)}`;
    const jsxElements = slide.elements
      .filter(el => !el.hidden)
      .sort((a, b) => a.zIndex - b.zIndex)
      .map(el => renderElementJSX(el))
      .join('\n\n');

    return `function ${compName}() {
  return (
    <div 
      className="relative overflow-hidden shadow-2xl transition-all duration-300 select-none mx-auto"
      style={{
        width: '${slide.width}px',
        height: '${slide.height}px',
        background: '${slide.background || '#0f172a'}',
        ${slide.wallpaper ? (slide.wallpaperOverlay && slide.wallpaperOverlay > 0 ? `backgroundImage: 'linear-gradient(rgba(0,0,0,${slide.wallpaperOverlay}), rgba(0,0,0,${slide.wallpaperOverlay})), url(${slide.wallpaper})', backgroundSize: 'cover', backgroundPosition: 'center',` : `backgroundImage: 'url(${slide.wallpaper})', backgroundSize: 'cover', backgroundPosition: 'center',`) : ''}
      }}
    >
${jsxElements}
    </div>
  );
}`;
  }).join('\n\n');

  const slideListArray = project.slides
    .map((slide, idx) => `    { id: '${slide.id}', title: ${JSON.stringify(slide.title)}, Component: Slide${idx + 1}_${sanitizeComponentName(slide.title)} },`)
    .join('\n');

  return `import React, { useState, useEffect } from 'react';
${lucideImport}
${slideComponents}

const SLIDES = [
${slideListArray}
];

export interface PresentationDeckProps {
  initialSlide?: number;
  onFinish?: () => void;
  className?: string;
}

export default function ${sanitizeComponentName(project.title || 'Presentation')}Deck({
  initialSlide = 0,
  onFinish,
  className = '',
}: PresentationDeckProps = {}) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlide);

  const goToNext = () => {
    if (currentSlideIndex === SLIDES.length - 1) {
      onFinish?.();
    } else {
      setCurrentSlideIndex(prev => Math.min(prev + 1, SLIDES.length - 1));
    }
  };

  const goToPrev = () => {
    setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const ActiveComponent = SLIDES[currentSlideIndex].Component;

  return (
    <div className={"min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans select-none " + (className || '')}>
${fontStyleTag}
      {/* Top Header: Title & Progress Bar */}
      <header className="flex items-center justify-between max-w-7xl w-full mx-auto mb-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-sm sm:text-base font-bold text-slate-100">${escapeJSX(project.title || 'Presentasi')}</h1>
          <p className="text-xs text-slate-400">Slide {currentSlideIndex + 1} dari {SLIDES.length}: {SLIDES[currentSlideIndex].title}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
            {Math.round(((currentSlideIndex + 1) / SLIDES.length) * 100)}%
          </span>
        </div>
      </header>

      {/* Main Slide Presentation Viewport */}
      <main className="flex-1 flex items-center justify-center overflow-auto my-2">
        <ActiveComponent />
      </main>

      {/* Bottom Controls Bar */}
      <footer className="flex items-center justify-between max-w-7xl w-full mx-auto mt-4 pt-3 border-t border-slate-800">
        <span className="text-xs text-slate-500 hidden sm:inline">
          Gunakan tombol <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 font-mono">←</kbd> dan <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 font-mono">→</kbd> untuk berpindah slide
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={goToPrev}
            disabled={currentSlideIndex === 0}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>
          <button
            onClick={goToNext}
            disabled={currentSlideIndex === SLIDES.length - 1}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-lg shadow-indigo-600/30"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
`;
}

export function renderElementJSX(el: DesignElement): string {
  const baseStyle: Record<string, string | number> = {
    left: `${Math.round(el.x)}px`,
    top: `${Math.round(el.y)}px`,
    width: `${Math.round(el.width)}px`,
    height: `${Math.round(el.height)}px`,
    zIndex: el.zIndex,
  };

  const transforms = [
    el.rotation ? `rotate(${el.rotation}deg)` : '',
    el.flipX ? 'scaleX(-1)' : '',
    el.flipY ? 'scaleY(-1)' : '',
  ].filter(Boolean);
  if (transforms.length > 0) baseStyle.transform = transforms.join(' ');
  if (el.opacity !== undefined && el.opacity < 1) baseStyle.opacity = el.opacity;
  if (el.letterSpacing !== undefined && el.letterSpacing !== 0) baseStyle.letterSpacing = `${el.letterSpacing}px`;
  if (el.lineHeight !== undefined) baseStyle.lineHeight = el.lineHeight;
  if (el.fontStyle) baseStyle.fontStyle = el.fontStyle;
  if (el.textDecoration && el.textDecoration !== 'none') baseStyle.textDecoration = el.textDecoration;
  if (el.textTransform && el.textTransform !== 'none') baseStyle.textTransform = el.textTransform;

  // Custom typography (Google Fonts)
  if (el.fontFamily && !['sans', 'serif', 'mono'].includes(el.fontFamily)) {
    baseStyle.fontFamily = `"${el.fontFamily}", sans-serif`;
  }

  // Border / Stroke styling
  if (el.stroke) {
    baseStyle.border = `${el.strokeWidth || 1}px ${el.strokeDash || 'solid'} ${el.stroke}`;
  }

  const getFillStyle = (fillVal?: string, fallback: string = '#1e293b'): Record<string, string> => {
    const val = fillVal || fallback;
    return val.includes('gradient') ? { background: val } : { backgroundColor: val };
  };

  const toStyleAttr = (extras: Record<string, string | number | undefined> = {}) => {
    const merged = { ...baseStyle };
    for (const [k, v] of Object.entries(extras)) {
      if (v !== undefined) merged[k] = v;
    }
    const entries = Object.entries(merged)
      .map(([k, v]) => (typeof v === 'number' ? `${k}: ${v}` : `${k}: ${JSON.stringify(v)}`))
      .join(', ');
    return `style={{ ${entries} }}`;
  };

  const fontClass =
    el.fontFamily === 'serif'
      ? 'font-serif'
      : el.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  switch (el.type) {
    case 'image':
      return `      {/* Image Media: ${el.name} */}
      <div 
        className="absolute overflow-hidden ${getShadowClass(el.shadow)}"
        ${toStyleAttr({ borderRadius: `${el.borderRadius !== undefined ? el.borderRadius : 12}px` })}
      >
        <img 
          src="${el.imageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80'}"
          alt="${escapeJSX(el.name || 'Foto')}"
          className="w-full h-full object-cover"
        />
      </div>`;

    case 'heading':
      return `      {/* Heading: ${el.name} */}
      <h1 
        className="absolute font-bold tracking-tight flex items-center ${fontClass} ${getTextAlignClass(el.textAlign)}"
        ${toStyleAttr({
          color: el.color || '#ffffff',
          fontSize: `${el.fontSize || 36}px`,
          fontWeight: el.fontWeight || 'bold',
        })}
      >
        ${escapeJSX(el.content || 'Judul Utama')}
      </h1>`;

    case 'text':
      return `      {/* Paragraph: ${el.name} */}
      <p 
        className="absolute leading-relaxed whitespace-pre-wrap ${fontClass} ${getTextAlignClass(el.textAlign)}"
        ${toStyleAttr({
          color: el.color || '#cbd5e1',
          fontSize: `${el.fontSize || 16}px`,
        })}
      >
        ${escapeJSX(el.content || 'Konten teks deskriptif')}
      </p>`;

    case 'quote':
      return `      {/* Blockquote: ${el.name} */}
      <blockquote 
        className="absolute border-l-4 border-indigo-500 pl-4 py-1 italic leading-relaxed whitespace-pre-wrap ${fontClass} ${getTextAlignClass(el.textAlign)}"
        ${toStyleAttr({
          color: el.color || '#e2e8f0',
          fontSize: `${el.fontSize || 20}px`,
        })}
      >
        “${escapeJSX(el.content || 'Kutipan inspiratif')}”
        ${el.subTitle ? `\n        <footer className="text-sm not-italic text-slate-400 mt-2 font-normal">— ${escapeJSX(el.subTitle)}</footer>` : ''}
      </blockquote>`;

    case 'button':
      return `      {/* Button: ${el.name} */}
      <button 
        type="button"
        className="absolute flex items-center justify-center font-medium transition-all active:scale-95 ${fontClass} ${getShadowClass(el.shadow)}"
        ${toStyleAttr({
          ...getFillStyle(el.fill, '#6366f1'),
          color: el.color || '#ffffff',
          borderRadius: `${el.borderRadius || 12}px`,
        })}
      >
        ${escapeJSX(el.content || 'Tombol Aksi')}
      </button>`;

    case 'input':
      return `      {/* Input Field: ${el.name} */}
      <div 
        className="absolute flex items-center px-4 bg-slate-900/80 border border-slate-700 backdrop-blur-sm"
        ${toStyleAttr({ borderRadius: `${el.borderRadius || 10}px` })}
      >
        <input 
          type="text" 
          placeholder="${escapeJSX(el.placeholder || 'Ketik sesuatu...')}" 
          className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
        />
      </div>`;

    case 'metric-card':
      return `      {/* Metric Card: ${el.name} */}
      <div 
        className="absolute p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-xl backdrop-blur-md flex flex-col justify-between"
        ${toStyleAttr({
          ...getFillStyle(el.fill, '#1e293b'),
          borderRadius: `${el.borderRadius || 16}px`,
          backdropFilter: 'blur(12px)',
        })}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          ${escapeJSX(el.subTitle || 'Total Metrik')}
        </span>
        <div className="text-3xl font-bold" style={{ color: '${el.color || '#38bdf8'}' }}>
          ${escapeJSX(el.content || '1,248')}
        </div>
        <span className="text-xs text-emerald-400 font-medium">
          Aktif & Terverifikasi
        </span>
      </div>`;

    case 'table': {
      const defaultTableText = `Indikator | Target | Realisasi | Status\nAkurasi Model | 95.0% | 99.4% | Tercapai\nLatensi Inferensi | < 20ms | 11.8ms | Optimal\nThroughput | 2.0x | 3.4x | Melampaui`;
      const tableRaw = el.content || defaultTableText;
      const rows = tableRaw
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0)
        .map(r => r.split('|').map(c => c.trim()));

      const headerRow = rows[0] || [];
      const bodyRows = rows.slice(1);

      return `      {/* Table Element: ${el.name} */}
      <div 
        className="absolute rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg ${fontClass} ${getShadowClass(el.shadow)}"
        ${toStyleAttr({ borderRadius: `${el.borderRadius !== undefined ? el.borderRadius : 12}px` })}
      >
        <table className="w-full h-full border-collapse text-left text-xs">
          <thead className="bg-indigo-950/40 border-b border-slate-800 text-indigo-300 font-bold uppercase text-[10px]">
            <tr>
              ${headerRow.map(h => `<th className="px-3 py-2 border-r border-slate-800/60 last:border-r-0">${h}</th>`).join('\n              ')}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            ${bodyRows.map((r, i) => `<tr>\n              ${r.map(c => `<td className="px-3 py-2 border-r border-slate-800/40 last:border-r-0 ${i % 2 === 1 ? 'bg-slate-800/30' : ''}">${c}</td>`).join('\n              ')}\n            </tr>`).join('\n            ')}
          </tbody>
        </table>
      </div>`;
    }

    case 'circle':
      return `      {/* Circle Shape: ${el.name} */}
      <div 
        className="absolute rounded-full"
        ${toStyleAttr(getFillStyle(el.fill, '#3b82f6'))}
      />`;

    case 'badge-shape':
      return `      {/* Pill Badge: ${el.name} */}
      <div 
        className="absolute inline-flex items-center justify-center font-semibold rounded-full select-none ${getShadowClass(el.shadow)}"
        ${toStyleAttr({
          ...getFillStyle(el.fill, 'rgba(99, 102, 241, 0.2)'),
          color: el.color || '#818cf8',
          border: el.stroke ? `${el.strokeWidth || 1}px solid ${el.stroke}` : '1px solid rgba(99, 102, 241, 0.4)',
          fontSize: `${el.fontSize || 12}px`,
        })}
      >
        <span>${escapeJSX(el.content || el.badgeText || 'NEW')}</span>
      </div>`;

    case 'triangle':
      return `      {/* Triangle Shape: ${el.name} */}
      <svg 
        className="absolute"
        ${toStyleAttr()}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon points="50,0 100,100 0,100" fill="${el.fill || '#6366f1'}" stroke="${el.stroke || 'none'}" strokeWidth="${el.strokeWidth || 0}" />
      </svg>`;

    case 'star':
      return `      {/* Star Shape: ${el.name} */}
      <svg 
        className="absolute"
        ${toStyleAttr()}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon points="50,2 62,38 100,38 69,60 81,96 50,74 19,96 31,60 0,38 38,38" fill="${el.fill || '#f59e0b'}" stroke="${el.stroke || 'none'}" strokeWidth="${el.strokeWidth || 0}" />
      </svg>`;

    case 'hexagon':
      return `      {/* Hexagon Shape: ${el.name} */}
      <svg 
        className="absolute"
        ${toStyleAttr()}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon points="50,2 95,25 95,75 50,98 5,75 5,25" fill="${el.fill || '#8b5cf6'}" stroke="${el.stroke || 'none'}" strokeWidth="${el.strokeWidth || 0}" />
      </svg>`;

    case 'arrow':
      return `      {/* Arrow Shape: ${el.name} */}
      <svg 
        className="absolute"
        ${toStyleAttr()}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon points="0,35 60,35 60,10 100,50 60,90 60,65 0,65" fill="${el.fill || '#3b82f6'}" stroke="${el.stroke || 'none'}" strokeWidth="${el.strokeWidth || 0}" />
      </svg>`;

    case 'chart': {
      const chartData = el.chartData && el.chartData.length > 0 ? el.chartData : [
        { label: 'Q1', value: 35 },
        { label: 'Q2', value: 65 },
        { label: 'Q3', value: 45 },
        { label: 'Q4', value: 90 },
      ];
      const maxVal = Math.max(...chartData.map(d => d.value), 1);
      const chartType = el.chartType || 'bar';

      let innerChart = '';
      if (chartType === 'bar') {
        const bars = chartData.map(d => {
          const hPercent = Math.round((d.value / maxVal) * 80);
          return `          <div className="flex-1 flex flex-col items-center h-full justify-end">
            <span className="text-[10px] font-mono font-bold text-slate-300 mb-1">${d.value}</span>
            <div className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-cyan-400" style={{ height: '${hPercent}%', minHeight: '4px' }} />
            <span className="text-[10px] font-medium text-slate-400 mt-1 truncate">${escapeJSX(d.label)}</span>
          </div>`;
        }).join('\n');
        innerChart = `        <div className="flex-1 flex items-end justify-around gap-2 pt-2">
${bars}
        </div>`;
      } else {
        innerChart = `        <div className="flex-1 flex items-center justify-center p-2 text-xs text-indigo-400 font-mono">
          [${chartType.toUpperCase()} CHART: ${chartData.map(d => `${escapeJSX(d.label)}: ${d.value}`).join(', ')}]
        </div>`;
      }

      return `      {/* Chart: ${el.name} */}
      <div 
        className="absolute p-4 rounded-2xl bg-slate-900 border border-slate-800 ${getShadowClass(el.shadow)} flex flex-col justify-between"
        ${toStyleAttr({ backgroundColor: '#0f172a', borderRadius: `${el.borderRadius || 16}px` })}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-xs font-bold text-slate-100">${escapeJSX(el.content || 'Analisis Kinerja')}</div>
            <div className="text-[10px] text-slate-400">${escapeJSX(el.subTitle || 'Metrik evaluasi')}</div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-semibold uppercase">
            ${chartType}
          </span>
        </div>
${innerChart}
      </div>`;
    }

    case 'line':
      return `      {/* Divider Line: ${el.name} */}
      <div 
        className="absolute"
        ${toStyleAttr(getFillStyle(el.fill, '#475569'))}
      />`;

    case 'avatar':
      return `      {/* Avatar Profile: ${el.name} */}
      <div 
        className="absolute relative rounded-full overflow-hidden border-2 flex items-center justify-center select-none ${getShadowClass(el.shadow)}"
        ${toStyleAttr({
          ...getFillStyle(el.fill, '#1e293b'),
          borderColor: el.stroke || '#6366f1',
          borderWidth: `${el.strokeWidth || 2}px`,
        })}
      >
        ${el.imageUrl ? `<img src="${el.imageUrl}" alt="${escapeJSX(el.name || 'Avatar')}" className="w-full h-full object-cover pointer-events-none" />` : `<span className="font-bold text-sm" style={{ color: '${el.color || '#ffffff'}' }}>${escapeJSX(el.content || 'DF')}</span>`}
        <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
      </div>`;

    case 'toggle': {
      const isActive = el.content !== 'off';
      return `      {/* Toggle Switch: ${el.name} */}
      <div 
        className="absolute rounded-full p-1 flex items-center cursor-pointer transition-colors duration-200 ${getShadowClass(el.shadow)}"
        ${toStyleAttr(getFillStyle(isActive ? (el.fill || '#10b981') : '#334155'))}
      >
        <div className="h-full aspect-square rounded-full bg-white shadow-md transition-transform duration-200 transform ${isActive ? 'translate-x-full' : 'translate-x-0'}" />
      </div>`;
    }

    case 'icon': {
      const iconComp = el.iconName || 'Sparkles';
      return `      {/* Vector Icon: ${el.name} */}
      <div 
        className="absolute flex items-center justify-center select-none ${getShadowClass(el.shadow)}"
        ${toStyleAttr({
          color: el.color || '#818cf8',
        })}
      >
        <${iconComp} className="w-full h-full" strokeWidth={${el.strokeWidth || 2}} />
      </div>`;
    }

    case 'navbar':
      return `      {/* Navigation Bar: ${el.name} */}
      <nav 
        className="absolute px-6 flex items-center justify-between border-b border-slate-800 backdrop-blur-md"
        ${toStyleAttr({
          ...getFillStyle(el.fill, '#0f172a'),
          backdropFilter: 'blur(12px)',
        })}
      >
        <div className="flex items-center gap-2 font-bold text-sm text-indigo-400">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">⚡</span>
          <span>App Branding</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-300 font-medium">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#features" className="hover:text-white transition-colors">Fitur</a>
          <a href="#pricing" className="hover:text-white transition-colors">Harga</a>
          <button className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">Masuk</button>
        </div>
      </nav>`;

    case 'bottom-nav':
      return `      {/* Mobile Bottom Navigation: ${el.name} */}
      <nav 
        className="absolute px-6 flex items-center justify-around border-t border-slate-800 text-slate-400 backdrop-blur-md"
        ${toStyleAttr({
          ...getFillStyle(el.fill, '#0f172a'),
          backdropFilter: 'blur(12px)',
        })}
      >
        <button className="flex flex-col items-center gap-1 text-indigo-400 font-medium text-[10px]">
          <span>🏠</span>
          <span>Beranda</span>
        </button>
        <button className="flex flex-col items-center gap-1 hover:text-slate-200 text-[10px]">
          <span>🧭</span>
          <span>Eksplor</span>
        </button>
        <button className="flex flex-col items-center gap-1 hover:text-slate-200 text-[10px]">
          <span>💳</span>
          <span>Dompet</span>
        </button>
        <button className="flex flex-col items-center gap-1 hover:text-slate-200 text-[10px]">
          <span>👤</span>
          <span>Profil</span>
        </button>
      </nav>`;

    case 'rect':
    case 'card':
    default: {
      const hasCustomBorder = Boolean(el.stroke);
      const borderClass = hasCustomBorder ? '' : 'border border-slate-700/50';
      const isSemiTransparent = Boolean(el.fill && (el.fill.includes('rgba') || el.fill === 'transparent'));
      const blurClass = isSemiTransparent ? 'backdrop-blur-md' : '';
      return `      {/* Container Card: ${el.name} */}
      <div 
        className="absolute ${borderClass} ${blurClass} ${getShadowClass(el.shadow)}"
        ${toStyleAttr({
          ...getFillStyle(el.fill, '#1e293b'),
          borderRadius: `${el.borderRadius !== undefined ? el.borderRadius : 16}px`,
          backdropFilter: isSemiTransparent ? 'blur(12px)' : undefined,
        })}
      >
        ${el.content ? `<div className="p-4 text-slate-200">${escapeJSX(el.content)}</div>` : ''}
      </div>`;
    }
  }
}

function getShadowClass(shadow?: string): string {
  switch (shadow) {
    case 'sm': return 'shadow-sm';
    case 'md': return 'shadow-md';
    case 'lg': return 'shadow-lg';
    case 'xl': return 'shadow-xl';
    case '2xl': return 'shadow-2xl';
    case 'glow-indigo': return 'shadow-[0_0_24px_rgba(99,102,241,0.55)]';
    case 'glow-cyan': return 'shadow-[0_0_24px_rgba(56,189,248,0.55)]';
    case 'glow-emerald': return 'shadow-[0_0_24px_rgba(16,185,129,0.55)]';
    case 'glow-rose': return 'shadow-[0_0_24px_rgba(244,63,94,0.55)]';
    default: return '';
  }
}

function getTextAlignClass(align?: string): string {
  switch (align) {
    case 'center': return 'text-center justify-center';
    case 'right': return 'text-right justify-end';
    default: return 'text-left justify-start';
  }
}

export function escapeJSX(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

function sanitizeComponentName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, '');
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'Canvas';
}
