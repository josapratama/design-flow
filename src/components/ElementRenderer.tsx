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
    imageUrl,
    name,
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
            backgroundColor: fill || '#1e293b',
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
            backgroundColor: fill || 'rgba(99, 102, 241, 0.2)',
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
    case 'quote':
      return (
        <div
          className={`w-full h-full flex flex-col justify-center select-none overflow-hidden ${fontClass} ${shadowClass}`}
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
          className={`w-full h-full flex items-center justify-center font-medium transition-all select-none cursor-pointer ${fontClass} ${shadowClass}`}
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
