import { Slide, DesignElement } from '../types';

/**
 * Converts a Slide or UI/UX Artboard into clean React 19 + Tailwind CSS code.
 */
export function exportToReactTailwind(slide: Slide): string {
  const jsxElements = slide.elements
    .filter(el => !el.hidden)
    .sort((a, b) => a.zIndex - b.zIndex)
    .map(el => renderElementJSX(el))
    .join('\n');

  return `import React from 'react';

export default function ${sanitizeComponentName(slide.title)}Screen() {
  return (
    <div 
      className="relative overflow-hidden shadow-2xl transition-all duration-200"
      style={{
        width: '${slide.width}px',
        height: '${slide.height}px',
        backgroundColor: '${slide.background}',
      }}
    >
${jsxElements}
    </div>
  );
}
`;
}

function renderElementJSX(el: DesignElement): string {
  const styleString = `style={{ left: '${Math.round(el.x)}px', top: '${Math.round(el.y)}px', width: '${Math.round(el.width)}px', height: '${Math.round(el.height)}px' }}`;

  switch (el.type) {
    case 'heading':
      return `      {/* Heading: ${el.name} */}
      <h1 
        className="absolute font-bold text-slate-100 tracking-tight select-none"
        ${styleString}
        style={{ ...${styleString.replace('style=', '')}, color: '${el.color || '#ffffff'}', fontSize: '${el.fontSize || 36}px' }}
      >
        ${escapeJSX(el.content || 'Judul Utama')}
      </h1>`;

    case 'text':
      return `      {/* Paragraph: ${el.name} */}
      <p 
        className="absolute text-slate-300 leading-relaxed select-none"
        ${styleString}
        style={{ ...${styleString.replace('style=', '')}, color: '${el.color || '#cbd5e1'}', fontSize: '${el.fontSize || 16}px' }}
      >
        ${escapeJSX(el.content || 'Konten teks deskriptif')}
      </p>`;

    case 'button':
      return `      {/* Button: ${el.name} */}
      <button 
        type="button"
        className="absolute flex items-center justify-center font-medium rounded-xl shadow-lg transition-all active:scale-95"
        ${styleString}
        style={{ ...${styleString.replace('style=', '')}, backgroundColor: '${el.fill || '#6366f1'}', color: '${el.color || '#ffffff'}', borderRadius: '${el.borderRadius || 12}px' }}
      >
        ${escapeJSX(el.content || 'Tombol Aksi')}
      </button>`;

    case 'input':
      return `      {/* Input: ${el.name} */}
      <div 
        className="absolute flex items-center px-4 bg-slate-900/80 border border-slate-700 rounded-xl"
        ${styleString}
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
        ${styleString}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          ${escapeJSX(el.subTitle || 'Total Metrik')}
        </span>
        <div className="text-3xl font-bold text-indigo-400">
          ${escapeJSX(el.content || '1,248')}
        </div>
        <span className="text-xs text-emerald-400 font-medium">
          +12.5% vs bulan lalu
        </span>
      </div>`;

    case 'navbar':
      return `      {/* Navbar: ${el.name} */}
      <header 
        className="absolute top-0 left-0 right-0 px-6 h-16 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between z-20"
        ${styleString}
      >
        <span className="font-bold text-lg text-indigo-400 tracking-tight">DesignFlow App</span>
        <nav className="flex items-center space-x-6 text-sm text-slate-300">
          <a href="#" className="hover:text-white transition-colors">Fitur</a>
          <a href="#" className="hover:text-white transition-colors">Dokumentasi</a>
          <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium text-xs">Mulai</button>
        </nav>
      </header>`;

    case 'circle':
      return `      {/* Circle Shape */}
      <div 
        className="absolute rounded-full"
        ${styleString}
        style={{ ...${styleString.replace('style=', '')}, backgroundColor: '${el.fill || '#3b82f6'}' }}
      />`;

    case 'rect':
    case 'card':
    default:
      return `      {/* Container: ${el.name} */}
      <div 
        className="absolute rounded-2xl border border-slate-700/50 shadow-md backdrop-blur-sm"
        ${styleString}
        style={{ ...${styleString.replace('style=', '')}, backgroundColor: '${el.fill || '#1e293b'}', borderRadius: '${el.borderRadius || 16}px' }}
      >
        ${el.content ? `<div className="p-4 text-slate-200">${escapeJSX(el.content)}</div>` : ''}
      </div>`;
  }
}

function escapeJSX(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sanitizeComponentName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, '');
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'Canvas';
}
