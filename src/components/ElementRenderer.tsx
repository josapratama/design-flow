import React from 'react';
import { DesignElement } from '../types';
import * as Icons from 'lucide-react';
import { getFontFamilyStyle } from '../utils/fontLoader';

export function renderRichInlineText(text: string): React.ReactNode {
  if (!text) return null;
  if (!/[*_=`]/.test(text)) {
    return text;
  }
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|==[^=]+==|_[^_]+_|`[^`]+`)/g;
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('==') && part.endsWith('==') && part.length >= 4) {
      return (
        <mark key={i} className="bg-indigo-500/30 text-indigo-200 px-1 rounded border border-indigo-500/40 not-italic">
          {part.slice(2, -2)}
        </mark>
      );
    }
    if (part.startsWith('_') && part.endsWith('_') && part.length >= 2) {
      return <span key={i} className="underline underline-offset-2">{part.slice(1, -1)}</span>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} className="font-mono bg-slate-800/80 text-cyan-300 px-1 py-0.5 rounded text-[0.9em] border border-slate-700/60">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

interface ElementRendererProps {
  element: DesignElement;
  isSelected: boolean;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element, isSelected }) => {
  if (element.hidden) return null;

  const {
    type,
    content,
    width,
    height,
    fill,
    stroke,
    strokeWidth,
    strokeDash,
    borderRadius,
    shadow,
    fontSize,
    fontWeight,
    fontStyle,
    textDecoration,
    textTransform,
    color,
    textAlign,
    letterSpacing,
    lineHeight,
    subTitle,
    iconName,
    placeholder,
    imageUrl,
    name,
  } = element;

  const resolvedFontFamily = getFontFamilyStyle(element.fontFamily);

  // Shadow and Glow class mapping
  const shadowClass =
    shadow === 'sm'
      ? 'shadow-sm'
      : shadow === 'md'
      ? 'shadow-md'
      : shadow === 'lg'
      ? 'shadow-lg'
      : shadow === 'xl'
      ? 'shadow-xl'
      : shadow === '2xl'
      ? 'shadow-2xl'
      : shadow === 'glow-indigo'
      ? 'shadow-[0_0_24px_rgba(99,102,241,0.55)]'
      : shadow === 'glow-cyan'
      ? 'shadow-[0_0_24px_rgba(56,189,248,0.55)]'
      : shadow === 'glow-emerald'
      ? 'shadow-[0_0_24px_rgba(16,185,129,0.55)]'
      : shadow === 'glow-rose'
      ? 'shadow-[0_0_24px_rgba(244,63,94,0.55)]'
      : '';

  const borderDashStyle =
    strokeDash === 'dashed'
      ? 'dashed'
      : strokeDash === 'dotted'
      ? 'dotted'
      : 'solid';

  const glassClass = fill && fill.includes('rgba(') ? 'backdrop-blur-md' : '';

  const fontClass =
    element.fontFamily === 'serif'
      ? 'font-serif'
      : element.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // Dynamic Lucide Icon
  const IconComponent =
    iconName && (Icons as any)[iconName]
      ? (Icons as any)[iconName]
      : (Icons as any)['Sparkles'];

  const animClass = element.animation && element.animation !== 'none'
    ? `df-anim-${element.animation}`
    : '';

  const animStyle: React.CSSProperties = {
    ...(element.animation && element.animation !== 'none' ? {
      '--df-anim-dur': `${element.animationDuration || 0.6}s`,
      '--df-anim-delay': `${element.animationDelay || 0}s`,
    } as any : {})
  };

  const renderContent = () => {
  switch (type) {
    case 'icon': {
      const LucideIcon = iconName && (Icons as any)[iconName] ? (Icons as any)[iconName] : Icons.Sparkles;
      return (
        <div
          className={`w-full h-full flex items-center justify-center select-none ${shadowClass}`}
          style={{ color: color || '#818cf8' }}
        >
          <LucideIcon
            className="w-full h-full"
            strokeWidth={strokeWidth || 2}
            style={{ color: color || '#818cf8' }}
          />
        </div>
      );
    }

    case 'avatar': {
      return (
        <div
          className={`w-full h-full relative rounded-full overflow-hidden select-none border-2 ${shadowClass}`}
          style={{
            borderColor: stroke || '#6366f1',
            background: fill || '#1e293b',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name || 'Avatar'}
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center font-bold text-lg select-none ${fontClass}`}
              style={{ color: color || '#ffffff' }}
            >
              {content || 'DF'}
            </div>
          )}
          <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
        </div>
      );
    }

    case 'badge-shape': {
      return (
        <div
          className={`w-full h-full inline-flex items-center justify-center px-3 py-1 font-semibold rounded-full select-none ${fontClass} ${shadowClass}`}
          style={{
            background: fill || 'rgba(99, 102, 241, 0.2)',
            color: color || '#818cf8',
            border: stroke ? `${strokeWidth || 1}px ${borderDashStyle} ${stroke}` : '1px solid rgba(99, 102, 241, 0.4)',
            fontSize: `${fontSize || 12}px`,
          }}
        >
          {iconName && (Icons as any)[iconName] && (
            React.createElement((Icons as any)[iconName], { className: 'w-3.5 h-3.5 mr-1.5' })
          )}
          <span>{content || element.badgeText || 'NEW FEATURE'}</span>
        </div>
      );
    }

    case 'toggle': {
      const isActive = content !== 'off';
      return (
        <div
          className={`w-full h-full rounded-full p-1 flex items-center cursor-pointer transition-colors duration-200 select-none ${shadowClass}`}
          style={{
            backgroundColor: isActive ? (fill || '#6366f1') : '#334155',
          }}
        >
          <div
            className={`h-full aspect-square rounded-full bg-white shadow-md transition-transform duration-200 transform ${
              isActive ? 'translate-x-[110%]' : 'translate-x-0'
            }`}
          />
        </div>
      );
    }

    case 'triangle': {
      return (
        <div className={`w-full h-full select-none ${shadowClass}`}>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points="50,0 100,100 0,100"
              fill={fill || '#6366f1'}
              stroke={stroke || 'transparent'}
              strokeWidth={strokeWidth || 0}
            />
          </svg>
        </div>
      );
    }

    case 'star': {
      return (
        <div className={`w-full h-full select-none ${shadowClass}`}>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points="50,2 62,38 100,38 69,60 81,96 50,74 19,96 31,60 0,38 38,38"
              fill={fill || '#f59e0b'}
              stroke={stroke || 'transparent'}
              strokeWidth={strokeWidth || 0}
            />
          </svg>
        </div>
      );
    }

    case 'arrow': {
      return (
        <div className={`w-full h-full select-none ${shadowClass}`}>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points="0,35 60,35 60,10 100,50 60,90 60,65 0,65"
              fill={fill || '#3b82f6'}
              stroke={stroke || 'transparent'}
              strokeWidth={strokeWidth || 0}
            />
          </svg>
        </div>
      );
    }

    case 'hexagon': {
      return (
        <div className={`w-full h-full select-none ${shadowClass}`}>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points="50,2 95,25 95,75 50,98 5,75 5,25"
              fill={fill || '#8b5cf6'}
              stroke={stroke || 'transparent'}
              strokeWidth={strokeWidth || 0}
            />
          </svg>
        </div>
      );
    }

    case 'heart': {
      return (
        <div className={`w-full h-full select-none ${shadowClass}`}>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M50 88 C20 62 4 44 4 26 C4 12 14 2 28 2 C37 2 45 7 50 15 C55 7 63 2 72 2 C86 2 96 12 96 26 C96 44 80 62 50 88 Z"
              fill={fill || '#f43f5e'}
              stroke={stroke || 'transparent'}
              strokeWidth={strokeWidth || 0}
            />
          </svg>
        </div>
      );
    }

    case 'diamond': {
      return (
        <div className={`w-full h-full select-none ${shadowClass}`}>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon
              points="50,2 98,50 50,98 2,50"
              fill={fill || '#06b6d4'}
              stroke={stroke || 'transparent'}
              strokeWidth={strokeWidth || 0}
            />
          </svg>
        </div>
      );
    }

    case 'speech-bubble': {
      return (
        <div className={`w-full h-full select-none relative ${shadowClass}`}>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M10 10 h80 a8 8 0 0 1 8 8 v50 a8 8 0 0 1 -8 8 h-45 l-15 16 v-16 h-20 a8 8 0 0 1 -8 -8 v-50 a8 8 0 0 1 8 -8 z"
              fill={fill || '#1e293b'}
              stroke={stroke || '#475569'}
              strokeWidth={strokeWidth || 1}
            />
          </svg>
          {content && (
            <div className="absolute inset-0 pb-3 flex items-center justify-center p-3 text-center text-xs font-medium text-slate-100 overflow-hidden">
              {content}
            </div>
          )}
        </div>
      );
    }

    case 'chart': {
      const chartMode = element.chartType || 'bar';
      const data = element.chartData || [
        { label: 'Q1', value: 45 },
        { label: 'Q2', value: 78 },
        { label: 'Q3', value: 55 },
        { label: 'Q4', value: 92 },
      ];
      const maxValue = Math.max(...data.map(d => d.value), 10);
      const primaryColor = fill || '#6366f1';
      const accentColor = color || '#38bdf8';

      return (
        <div
          className={`w-full h-full p-4 rounded-2xl flex flex-col justify-between border select-none ${shadowClass}`}
          style={{
            backgroundColor: '#0f172a',
            borderColor: stroke || 'rgba(255,255,255,0.08)',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 16}px`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs font-bold text-slate-100">{content || 'Analisis Kinerja'}</div>
              <div className="text-[10px] text-slate-400">{subTitle || 'Metrik evaluasi performa'}</div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-semibold uppercase">
              {chartMode}
            </span>
          </div>

          {/* SVG Chart Area */}
          <div className="flex-1 w-full relative min-h-0">
            {chartMode === 'bar' && (
              <div className="w-full h-full flex items-end justify-around gap-2 pt-4 pb-5">
                {data.map((item, idx) => {
                  const heightPercent = Math.round((item.value / maxValue) * 78);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                      <span className="text-[10px] font-mono font-bold text-slate-300 mb-1">
                        {item.value}
                      </span>
                      <div
                        className="w-full rounded-t-md transition-all duration-300 hover:brightness-125"
                        style={{
                          height: `${heightPercent}%`,
                          background: `linear-gradient(to top, ${primaryColor}, ${accentColor})`,
                          minHeight: '4px',
                        }}
                      />
                      <span className="text-[10px] font-medium text-slate-400 mt-1 truncate">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {chartMode === 'line' && (
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`grad_${element.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={primaryColor} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="300" y2="70" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="300" y2="110" stroke="rgba(255,255,255,0.1)" />
                {(() => {
                  const points = data.map((d, i) => {
                    const x = (i / (data.length - 1 || 1)) * 280 + 10;
                    const y = 110 - (d.value / maxValue) * 85;
                    return { x, y, label: d.label, val: d.value };
                  });
                  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
                  const areaPoints = `${points[0]?.x || 0},110 ` + polylinePoints + ` ${points[points.length - 1]?.x || 300},110`;
                  return (
                    <>
                      <polygon points={areaPoints} fill={`url(#grad_${element.id})`} />
                      <polyline points={polylinePoints} fill="none" stroke={primaryColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      {points.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke={primaryColor} strokeWidth="2" />
                          <text x={p.x} y={p.y - 7} fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                            {p.val}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            )}

            {chartMode === 'donut' && (
              <div className="w-full h-full flex items-center justify-center gap-6">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    strokeWidth="4.2"
                    strokeDasharray="72, 100"
                    strokeLinecap="round"
                    stroke={primaryColor}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="space-y-1.5 text-xs">
                  {data.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: idx === 0 ? primaryColor : idx === 1 ? accentColor : '#94a3b8' }}
                      />
                      <span className="text-slate-300 font-medium text-[11px]">{item.label}</span>
                      <span className="text-slate-400 font-mono text-[10px] ml-auto">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'table': {
      const defaultTableText = `Indikator | Target | Realisasi | Status\nAkurasi Model | 95.0% | 99.4% | Tercapai\nLatensi Inferensi | < 20ms | 11.8ms | Optimal\nThroughput | 2.0x | 3.4x | Melampaui`;
      const tableRaw = content || defaultTableText;
      const rows = tableRaw
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0)
        .map(r => r.split('|').map(c => c.trim()));

      const headerRow = rows[0] || [];
      const bodyRows = rows.slice(1);

      return (
        <div
          className={`w-full h-full overflow-hidden select-none border transition-all flex flex-col ${glassClass} ${shadowClass}`}
          style={{
            backgroundColor: fill || '#0f172a',
            border: stroke ? `${strokeWidth || 1}px ${borderDashStyle} ${stroke}` : '1px solid rgba(255,255,255,0.08)',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 14}px`,
            color: color || '#f8fafc',
          }}
        >
          <div className="w-full h-full overflow-auto">
            <table className="w-full h-full border-collapse text-left" style={{ fontSize: fontSize ? `${fontSize}px` : '12px' }}>
              {headerRow.length > 0 && (
                <thead>
                  <tr className="bg-indigo-950/40 border-b border-white/10">
                    {headerRow.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-3.5 py-2.5 font-bold tracking-wider uppercase text-[10px] text-indigo-300 border-r border-white/5 last:border-r-0"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={`border-b border-white/5 last:border-b-0 ${
                      rIdx % 2 === 1 ? 'bg-white/[0.02]' : 'bg-transparent'
                    } hover:bg-white/[0.04] transition-colors`}
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2.5 border-r border-white/5 last:border-r-0 text-slate-300">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    case 'image':
      return (
        <div
          className={`w-full h-full overflow-hidden select-none ${shadowClass}`}
          style={{
            borderRadius: `${borderRadius !== undefined ? borderRadius : 12}px`,
            border: stroke ? `${strokeWidth || 1}px ${borderDashStyle} ${stroke}` : 'none',
          }}
        >
          <img
            src={imageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80'}
            alt={name || 'Foto Media'}
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>
      );

    case 'heading':
    case 'text':
      return (
        <div
          className={`w-full h-full flex flex-col justify-center select-none overflow-hidden ${shadowClass}`}
          style={{
            fontFamily: resolvedFontFamily,
            color: color || '#ffffff',
            fontSize: `${fontSize || 24}px`,
            fontWeight:
              fontWeight === 'extrabold'
                ? 800
                : fontWeight === 'bold'
                  ? 700
                  : fontWeight === 'semibold'
                    ? 600
                    : 400,
            fontStyle: fontStyle || undefined,
            textDecoration: textDecoration || undefined,
            textTransform: textTransform || undefined,
            textAlign: textAlign || 'left',
            letterSpacing: letterSpacing !== undefined ? `${letterSpacing}px` : undefined,
            lineHeight: lineHeight !== undefined ? lineHeight : (type === 'heading' ? 1.2 : 1.35),
            whiteSpace: 'pre-wrap',
          }}
        >
          {content ? renderRichInlineText(content) : (type === 'heading' ? 'Judul Teks' : 'Teks Paragraf')}
        </div>
      );

    case 'quote':
      return (
        <div
          className={`w-full h-full flex flex-col justify-center border-l-4 border-indigo-500 pl-4 py-1 select-none overflow-hidden ${shadowClass}`}
          style={{
            fontFamily: resolvedFontFamily,
            color: color || '#e2e8f0',
            fontSize: `${fontSize || 22}px`,
            fontStyle: fontStyle || 'italic',
            textDecoration: textDecoration || undefined,
            textTransform: textTransform || undefined,
            textAlign: textAlign || 'left',
            letterSpacing: letterSpacing !== undefined ? `${letterSpacing}px` : undefined,
            lineHeight: lineHeight !== undefined ? lineHeight : 1.35,
          }}
        >
          <div className="whitespace-pre-wrap">“{content ? renderRichInlineText(content) : 'Kutipan inspiratif atau testimonial pelanggan.'}”</div>
          {subTitle && (
            <div className="text-xs not-italic text-slate-400 mt-2 font-normal">
              — {subTitle}
            </div>
          )}
        </div>
      );

    case 'button':
      return (
        <div
          className={`w-full h-full flex items-center justify-center font-medium transition-all select-none cursor-pointer ${shadowClass}`}
          style={{
            fontFamily: resolvedFontFamily,
            background: fill || '#6366f1',
            border: stroke ? `${strokeWidth || 1}px ${borderDashStyle} ${stroke}` : 'none',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 12}px`,
            color: color || '#ffffff',
            fontSize: `${fontSize || 16}px`,
            fontWeight: fontWeight === 'bold' ? 700 : 600,
            fontStyle: fontStyle || undefined,
            textDecoration: textDecoration || undefined,
            textTransform: textTransform || undefined,
            letterSpacing: letterSpacing !== undefined ? `${letterSpacing}px` : undefined,
          }}
        >
          {IconComponent && <IconComponent className="w-4 h-4 mr-2" />}
          <span>{content || 'Tombol Aksi'}</span>
        </div>
      );

    case 'input':
      return (
        <div
          className={`w-full h-full flex items-center px-4 bg-slate-900/90 border border-slate-700/80 select-none ${shadowClass}`}
          style={{
            borderRadius: `${borderRadius !== undefined ? borderRadius : 12}px`,
            borderColor: stroke || '#334155',
          }}
        >
          {IconComponent && <IconComponent className="w-4 h-4 text-slate-400 mr-2 shrink-0" />}
          <span className="text-sm text-slate-400 truncate">
            {placeholder || 'Ketik sesuatu...'}
          </span>
        </div>
      );

    case 'metric-card':
      return (
        <div
          className={`w-full h-full p-6 flex flex-col justify-between border select-none ${shadowClass}`}
          style={{
            background: fill || '#1e293b',
            borderColor: stroke || '#334155',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 18}px`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {subTitle || 'Metrik Utama'}
            </span>
            {IconComponent && <IconComponent className="w-5 h-5 text-indigo-400" />}
          </div>
          <div
            className="text-4xl font-extrabold text-indigo-400 tracking-tight"
            style={{ color: color || '#818cf8' }}
          >
            {content || '0'}
          </div>
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <span>↑ 12.8%</span>
            <span className="text-slate-400">vs periode sebelumnya</span>
          </div>
        </div>
      );

    case 'navbar':
      return (
        <div
          className="w-full h-full px-6 flex items-center justify-between bg-slate-900/95 border-b border-slate-800 select-none"
          style={{ background: fill || '#0f172a' }}
        >
          <div className="flex items-center space-x-2 font-bold text-base text-indigo-400">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs">
              ⚡
            </div>
            <span>App Branding</span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-slate-300">
            <span>Home</span>
            <span>Fitur</span>
            <span>Harga</span>
            <span className="px-3 py-1 rounded-md bg-indigo-600 text-white font-medium">Masuk</span>
          </div>
        </div>
      );

    case 'bottom-nav':
      return (
        <div
          className="w-full h-full px-6 flex items-center justify-around bg-slate-900/95 border-t border-slate-800 text-slate-400 select-none"
          style={{ background: fill || '#0f172a' }}
        >
          <div className="flex flex-col items-center gap-1 text-indigo-400">
            <Icons.Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Beranda</span>
          </div>
          <div className="flex flex-col items-center gap-1 hover:text-slate-200">
            <Icons.Compass className="w-5 h-5" />
            <span className="text-[10px] font-medium">Eksplor</span>
          </div>
          <div className="flex flex-col items-center gap-1 hover:text-slate-200">
            <Icons.CreditCard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Dompet</span>
          </div>
          <div className="flex flex-col items-center gap-1 hover:text-slate-200">
            <Icons.User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profil</span>
          </div>
        </div>
      );

    case 'rating': {
      const score = content || '4.9';
      const label = subTitle || '(2.5k ulasan)';
      return (
        <div
          className={`w-full h-full p-3.5 flex items-center gap-3 border select-none ${glassClass} ${shadowClass}`}
          style={{
            background: fill || '#0f172a',
            borderColor: stroke || '#334155',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 14}px`,
          }}
        >
          <div className="flex items-center gap-1 text-amber-400 shrink-0">
            {[1, 2, 3, 4, 5].map(i => (
              <Icons.Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-sm font-bold text-white font-mono">{score}</span>
            <span className="text-xs text-slate-400 truncate">{label}</span>
          </div>
        </div>
      );
    }

    case 'breadcrumb': {
      const crumbs = (content || 'Home / Dashboard / Analisis Data').split('/').map(c => c.trim()).filter(Boolean);
      return (
        <div
          className={`w-full h-full px-4 py-2 flex items-center gap-2 text-xs select-none border ${glassClass} ${shadowClass}`}
          style={{
            background: fill || '#0f172a',
            borderColor: stroke || '#1e293b',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 10}px`,
            color: color || '#94a3b8',
          }}
        >
          <Icons.Home className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          {crumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <Icons.ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
              <span className={`truncate ${idx === crumbs.length - 1 ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      );
    }

    case 'alert-box': {
      const isSuccess = element.variant === 'success' || (stroke && stroke.includes('#10b981'));
      const isDanger = element.variant === 'danger' || (stroke && stroke.includes('#ef4444'));
      const isWarning = element.variant === 'warning' || (stroke && stroke.includes('#f59e0b'));

      const AlertIcon = isSuccess
        ? Icons.CheckCircle2
        : isDanger
        ? Icons.AlertCircle
        : isWarning
        ? Icons.AlertTriangle
        : Icons.Info;

      const accentColor = isSuccess
        ? '#10b981'
        : isDanger
        ? '#f43f5e'
        : isWarning
        ? '#f59e0b'
        : (color || '#38bdf8');

      return (
        <div
          className={`w-full h-full p-4 flex items-start gap-3 border select-none ${glassClass} ${shadowClass}`}
          style={{
            background: fill || '#0f172a',
            borderColor: stroke || `${accentColor}55`,
            borderRadius: `${borderRadius !== undefined ? borderRadius : 14}px`,
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
          >
            <AlertIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white mb-0.5">
              {subTitle || 'Pemberitahuan Sistem'}
            </div>
            <div className="text-[11px] text-slate-300 leading-snug">
              {content || 'Pesan konfirmasi atau instruksi peringatan penting untuk pengguna.'}
            </div>
          </div>
        </div>
      );
    }

    case 'accordion-item': {
      return (
        <div
          className={`w-full h-full p-4 flex flex-col justify-between border select-none ${glassClass} ${shadowClass}`}
          style={{
            background: fill || '#1e293b',
            borderColor: stroke || '#334155',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 14}px`,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-100 truncate">
              {subTitle || 'Pertanyaan yang Sering Diajukan (FAQ)'}
            </div>
            <Icons.ChevronDown className="w-4 h-4 text-indigo-400 shrink-0" />
          </div>
          <div className="text-[11px] text-slate-300 pt-2 border-t border-slate-700/60 leading-relaxed">
            {content || 'Jawaban lengkap dan penjelasan rinci mengenai topik terkait disajikan di sini secara terstruktur.'}
          </div>
        </div>
      );
    }

    case 'progress-bar': {
      const pct = Math.min(100, Math.max(0, parseInt(content || '75', 10) || 75));
      const barFill = fill || 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)';
      return (
        <div
          className={`w-full h-full p-4 flex flex-col justify-center border select-none ${glassClass} ${shadowClass}`}
          style={{
            background: '#0f172a',
            borderColor: stroke || '#334155',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 14}px`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300 truncate">
              {subTitle || 'Proses Pencapaian'}
            </span>
            <span className="text-xs font-bold text-indigo-400 font-mono">
              {pct}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${pct}%`, background: barFill }}
            />
          </div>
        </div>
      );
    }

    case 'pricing-card': {
      return (
        <div
          className={`w-full h-full p-5 flex flex-col justify-between border select-none relative overflow-hidden ${glassClass} ${shadowClass}`}
          style={{
            background: fill || 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            borderColor: stroke || '#4f46e5',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 18}px`,
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                {subTitle || 'Paket Profesional'}
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                POPULER
              </span>
            </div>
            <div className="flex items-baseline gap-1 my-2">
              <span className="text-2xl font-black text-white">{content || 'Rp 99.000'}</span>
              <span className="text-[10px] text-slate-400">/ bulan</span>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
              <div className="flex items-center gap-2">
                <Icons.Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Semua Fitur Presenter & AI</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Kolaborasi Tim Tanpa Batas</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ekspor PPTX, PDF & Video HD</span>
              </div>
            </div>
          </div>
          <div className="mt-3 w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs text-center shadow-md">
            Mulai Uji Coba Gratis →
          </div>
        </div>
      );
    }

    case 'timeline-item': {
      return (
        <div
          className={`w-full h-full p-4 flex gap-3 border select-none ${glassClass} ${shadowClass}`}
          style={{
            background: fill || '#0f172a',
            borderColor: stroke || '#334155',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 14}px`,
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20 shrink-0" />
            <div className="w-0.5 flex-1 bg-slate-800 my-1" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono text-indigo-400 font-semibold block mb-0.5">
              {subTitle || 'Fase 01 • Q1 2026'}
            </span>
            <div className="text-xs font-bold text-white mb-1 truncate">
              {name || 'Milestone Peluncuran Arsitektur'}
            </div>
            <div className="text-[11px] text-slate-400 leading-snug line-clamp-2">
              {content || 'Penyelesaian integrasi pipeline analitik dan pengujian stres performa beban tinggi.'}
            </div>
          </div>
        </div>
      );
    }

    case 'chat-bubble': {
      const isRight = element.variant === 'secondary' || element.textAlign === 'right';
      return (
        <div
          className={`w-full h-full p-3 flex gap-2.5 items-end select-none ${isRight ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <div className="w-7 h-7 rounded-full bg-indigo-600/80 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow">
            {isRight ? 'Saya' : 'AI'}
          </div>
          <div
            className={`max-w-[85%] p-3 rounded-2xl text-xs select-none border ${shadowClass}`}
            style={{
              background: isRight ? (fill || '#4f46e5') : (fill || '#1e293b'),
              borderColor: stroke || (isRight ? '#6366f1' : '#334155'),
              color: color || '#f8fafc',
              borderBottomRightRadius: isRight ? '4px' : undefined,
              borderBottomLeftRadius: !isRight ? '4px' : undefined,
            }}
          >
            <div className="leading-relaxed whitespace-pre-wrap">
              {content || 'Halo! Bagaimana progres presentasi naskah skripsi Anda hari ini?'}
            </div>
            <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
              <span>{subTitle || '10:42'}</span>
              {isRight && <Icons.CheckCheck className="w-3 h-3 text-cyan-300" />}
            </div>
          </div>
        </div>
      );
    }

    case 'code-snippet': {
      return (
        <div
          className={`w-full h-full flex flex-col bg-slate-950 border select-none overflow-hidden font-mono ${shadowClass}`}
          style={{
            borderColor: stroke || '#334155',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 14}px`,
          }}
        >
          <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-[10px] text-slate-400 font-sans truncate">
              {subTitle || 'inference_model.ts'}
            </span>
            <Icons.Code2 className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="p-3 text-[11px] leading-relaxed overflow-hidden text-slate-300">
            {content || `// Pipeline Transformasi Data
async function processPipeline(input: Tensor) {
  const model = await loadNeuralWeights();
  return model.predict(input.normalize());
}`}
          </div>
        </div>
      );
    }

    case 'testimonial-card': {
      return (
        <div
          className={`w-full h-full p-5 flex flex-col justify-between border select-none relative ${glassClass} ${shadowClass}`}
          style={{
            background: fill || '#1e293b',
            borderColor: stroke || '#334155',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 16}px`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <Icons.Quote className="w-6 h-6 text-indigo-400/60" />
            <div className="flex items-center gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map(i => (
                <Icons.Star key={i} className="w-3 h-3 fill-amber-400" />
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-200 italic leading-relaxed line-clamp-3">
            "{content || 'Platform ini mengubah efisiensi pembuatan slide dan prototipe kami menjadi 5x lebih cepat dengan hasil yang memukau.'}"
          </div>
          <div className="flex items-center gap-2.5 pt-3 border-t border-slate-800/80 mt-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {name ? name.slice(0, 2).toUpperCase() : 'DR'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{name || 'Dr. Hendra Kurniawan'}</div>
              <div className="text-[10px] text-slate-400 truncate">{subTitle || 'Dosen Pembimbing & Peneliti'}</div>
            </div>
          </div>
        </div>
      );
    }

    case 'circle':
      return (
        <div
          className={`w-full h-full rounded-full select-none ${shadowClass}`}
          style={{
            background: fill || '#3b82f6',
            border: stroke ? `${strokeWidth || 1}px ${borderDashStyle} ${stroke}` : 'none',
          }}
        />
      );

    case 'line':
      return (
        <div
          className="w-full h-full flex items-center select-none"
        >
          <div
            className="w-full"
            style={{
              height: `${strokeWidth || 2}px`,
              backgroundColor: stroke || '#94a3b8',
              borderTop: strokeDash !== 'solid' ? `${strokeWidth || 2}px ${borderDashStyle} ${stroke || '#94a3b8'}` : undefined,
            }}
          />
        </div>
      );

    case 'rect':
    case 'card':
    default:
      return (
        <div
          className={`w-full h-full p-4 overflow-hidden select-none border transition-all ${glassClass} ${shadowClass}`}
          style={{
            background: fill || '#1e293b',
            border: stroke ? `${strokeWidth || 1}px ${borderDashStyle} ${stroke}` : '1px solid rgba(255,255,255,0.06)',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 16}px`,
            color: color || '#f8fafc',
            textAlign: textAlign || 'left',
          }}
        >
          {content && (
            <div
              className="text-sm font-medium leading-relaxed whitespace-pre-wrap"
              style={{ fontSize: fontSize ? `${fontSize}px` : undefined }}
            >
              {content}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className={`w-full h-full ${animClass}`} style={animStyle}>
      {renderContent()}
    </div>
  );
};
