import React from 'react';
import { DesignElement } from '../types';
import * as Icons from 'lucide-react';

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
    color,
    textAlign,
    subTitle,
    iconName,
    placeholder,
  } = element;

  // Shadow class mapping
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
      : '';

  const borderDashStyle =
    strokeDash === 'dashed'
      ? 'dashed'
      : strokeDash === 'dotted'
      ? 'dotted'
      : 'solid';

  // Dynamic Lucide Icon
  const IconComponent = iconName && (Icons as any)[iconName] ? (Icons as any)[iconName] : null;

  switch (type) {
    case 'heading':
    case 'text':
    case 'quote':
      return (
        <div
          className={`w-full h-full flex flex-col justify-center select-none overflow-hidden ${shadowClass}`}
          style={{
            color: color || '#ffffff',
            fontSize: `${fontSize || 24}px`,
            fontWeight: fontWeight === 'extrabold' ? 800 : fontWeight === 'bold' ? 700 : fontWeight === 'semibold' ? 600 : 400,
            textAlign: textAlign || 'left',
            lineHeight: 1.25,
            whiteSpace: 'pre-wrap',
          }}
        >
          {content || (type === 'heading' ? 'Judul Teks' : 'Teks Paragraf')}
        </div>
      );

    case 'button':
      return (
        <div
          className={`w-full h-full flex items-center justify-center font-medium transition-all select-none cursor-pointer ${shadowClass}`}
          style={{
            backgroundColor: fill || '#6366f1',
            border: stroke ? `${strokeWidth || 1}px ${borderDashStyle} ${stroke}` : 'none',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 12}px`,
            color: color || '#ffffff',
            fontSize: `${fontSize || 16}px`,
            fontWeight: fontWeight === 'bold' ? 700 : 600,
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
            backgroundColor: fill || '#1e293b',
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
          style={{ backgroundColor: fill || '#0f172a' }}
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
          style={{ backgroundColor: fill || '#0f172a' }}
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

    case 'circle':
      return (
        <div
          className={`w-full h-full rounded-full select-none ${shadowClass}`}
          style={{
            backgroundColor: fill || '#3b82f6',
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
          className={`w-full h-full p-4 overflow-hidden select-none border transition-all ${shadowClass}`}
          style={{
            backgroundColor: fill || '#1e293b',
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
