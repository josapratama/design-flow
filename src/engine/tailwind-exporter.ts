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
        ${slide.wallpaper ? `backgroundImage: 'url(${slide.wallpaper})', backgroundSize: 'cover', backgroundPosition: 'center',` : ''}
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

  const transforms = [
    el.rotation ? `rotate(${el.rotation}deg)` : '',
    el.flipX ? 'scaleX(-1)' : '',
    el.flipY ? 'scaleY(-1)' : '',
  ].filter(Boolean);
  if (transforms.length > 0) baseStyle.transform = transforms.join(' ');
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
        className="absolute rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg"
        style={{ left: '${el.x}px', top: '${el.y}px', width: '${el.width}px', height: '${el.height}px' }}
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
        ${toStyleAttr({ backgroundColor: el.fill || '#3b82f6' })}
      />`;

    case 'badge-shape':
      return `      {/* Pill Badge: ${el.name} */}
      <div 
        className="absolute inline-flex items-center justify-center font-semibold rounded-full select-none ${getShadowClass(el.shadow)}"
        ${toStyleAttr({
          backgroundColor: el.fill || 'rgba(99, 102, 241, 0.2)',
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
        ${toStyleAttr({ backgroundColor: el.fill || '#475569' })}
      />`;

    case 'avatar':
      return `      {/* Avatar Profile: ${el.name} */}
      <div 
        className="absolute relative rounded-full overflow-hidden border-2 flex items-center justify-center select-none ${getShadowClass(el.shadow)}"
        ${toStyleAttr({
          backgroundColor: el.fill || '#1e293b',
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
        ${toStyleAttr({
          backgroundColor: isActive ? (el.fill || '#10b981') : '#334155',
        })}
      >
        <div className="h-full aspect-square rounded-full bg-white shadow-md transition-transform duration-200 transform ${isActive ? 'translate-x-full' : 'translate-x-0'}" />
      </div>`;
    }

    case 'icon':
      return `      {/* Vector Icon: ${el.name} */}
      <div 
        className="absolute flex items-center justify-center select-none ${getShadowClass(el.shadow)}"
        ${toStyleAttr({
          color: el.color || '#818cf8',
        })}
      >
        <span className="text-2xl font-bold">★</span>
      </div>`;

    case 'navbar':
      return `      {/* Navigation Bar: ${el.name} */}
      <nav 
        className="absolute px-6 flex items-center justify-between border-b border-slate-800"
        ${toStyleAttr({
          backgroundColor: el.fill || '#0f172a',
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
        className="absolute px-6 flex items-center justify-around border-t border-slate-800 text-slate-400"
        ${toStyleAttr({
          backgroundColor: el.fill || '#0f172a',
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

function escapeJSX(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sanitizeComponentName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9]/g, '');
  return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'Canvas';
}
