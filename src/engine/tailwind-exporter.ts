import { Slide, DesignElement } from '../types';

/**
 * Converts a Slide or UI/UX Artboard into clean React 19 + Tailwind CSS code.
 */
export function exportToReactTailwind(slide: Slide): string {
  const jsxElements = slide.elements
    .filter(el => !el.hidden)
    .sort((a, b) => a.zIndex - b.zIndex)
    .map(el => renderElementJSX(el))
    .join('\n\n');

  return `import React from 'react';

export default function ${sanitizeComponentName(slide.title)}Screen() {
  return (
    <div 
      className="relative overflow-hidden shadow-2xl transition-all duration-200 select-none"
      style={{
        width: '${slide.width}px',
        height: '${slide.height}px',
        background: '${slide.background || '#0f172a'}',
      }}
    >
${jsxElements}
    </div>
  );
}
`;
}

function renderElementJSX(el: DesignElement): string {
  const baseStyle: Record<string, string | number> = {
    left: `${Math.round(el.x)}px`,
    top: `${Math.round(el.y)}px`,
    width: `${Math.round(el.width)}px`,
    height: `${Math.round(el.height)}px`,
    zIndex: el.zIndex,
  };

  if (el.rotation) baseStyle.transform = `rotate(${el.rotation}deg)`;
  if (el.opacity !== undefined && el.opacity < 1) baseStyle.opacity = el.opacity;

  const toStyleAttr = (extras: Record<string, string | number | undefined> = {}) => {
    const merged = { ...baseStyle };
    for (const [k, v] of Object.entries(extras)) {
      if (v !== undefined) merged[k] = v;
    }
    const entries = Object.entries(merged)
      .map(([k, v]) => `${k}: '${v}'`)
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
    case 'quote':
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

    case 'button':
      return `      {/* Button: ${el.name} */}
      <button 
        type="button"
        className="absolute flex items-center justify-center font-medium transition-all active:scale-95 ${fontClass} ${getShadowClass(el.shadow)}"
        ${toStyleAttr({
          backgroundColor: el.fill || '#6366f1',
          color: el.color || '#ffffff',
          borderRadius: `${el.borderRadius || 12}px`,
        })}
      >
        ${escapeJSX(el.content || 'Tombol Aksi')}
      </button>`;

    case 'input':
      return `      {/* Input Field: ${el.name} */}
      <div 
        className="absolute flex items-center px-4 bg-slate-900/80 border border-slate-700"
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
        className="absolute p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-xl backdrop-blur-sm flex flex-col justify-between"
        ${toStyleAttr({
          backgroundColor: el.fill || '#1e293b',
          borderRadius: `${el.borderRadius || 16}px`,
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

    case 'circle':
      return `      {/* Circle Shape: ${el.name} */}
      <div 
        className="absolute rounded-full"
        ${toStyleAttr({ backgroundColor: el.fill || '#3b82f6' })}
      />`;

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

    case 'line':
      return `      {/* Divider Line: ${el.name} */}
      <div 
        className="absolute"
        ${toStyleAttr({ backgroundColor: el.fill || '#475569' })}
      />`;

    case 'rect':
    case 'card':
    default:
      return `      {/* Container Card: ${el.name} */}
      <div 
        className="absolute border border-slate-700/50 ${getShadowClass(el.shadow)}"
        ${toStyleAttr({
          backgroundColor: el.fill || '#1e293b',
          borderRadius: `${el.borderRadius || 16}px`,
        })}
      >
        ${el.content ? `<div className="p-4 text-slate-200">${escapeJSX(el.content)}</div>` : ''}
      </div>`;
  }
}

function getShadowClass(shadow?: string): string {
  switch (shadow) {
    case 'sm': return 'shadow-sm';
    case 'md': return 'shadow-md';
    case 'lg': return 'shadow-lg';
    case 'xl': return 'shadow-xl';
    case '2xl': return 'shadow-2xl';
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

function escapeJSX(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sanitizeComponentName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, '');
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'Canvas';
}
