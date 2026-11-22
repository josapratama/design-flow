import React from 'react';
import * as Icons from 'lucide-react';
import { DesignElement } from '../../types';
import { ComputedRendererStyle, renderRichInlineText } from './rendererUtils';

interface ShapeElementRendererProps {
  element: DesignElement;
  computed: ComputedRendererStyle;
}

export const ShapeElementRenderer: React.FC<ShapeElementRendererProps> = ({ element, computed }) => {
  const {
    type,
    content,
    fill,
    stroke,
    strokeWidth,
    strokeDash,
    borderRadius,
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
  } = element;

  const { resolvedFontFamily, shadowClass, borderDashStyle, glassClass, fontClass } = computed;

  switch (type) {
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

    case 'triangle':
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

    case 'star':
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

    case 'arrow':
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

    case 'hexagon':
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

    case 'heart':
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

    case 'diamond':
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

    case 'speech-bubble':
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
            lineHeight: lineHeight !== undefined ? lineHeight : type === 'heading' ? 1.2 : 1.35,
            whiteSpace: 'pre-wrap',
          }}
        >
          {content ? renderRichInlineText(content) : type === 'heading' ? 'Judul Teks' : 'Teks Paragraf'}
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
          <div className="whitespace-pre-wrap">
            “{content ? renderRichInlineText(content) : 'Kutipan inspiratif atau testimonial pelanggan.'}”
          </div>
          {subTitle && <div className="text-xs not-italic text-slate-400 mt-2 font-normal">— {subTitle}</div>}
        </div>
      );

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
        <div className="w-full h-full flex items-center select-none">
          <div
            className="w-full"
            style={{
              height: `${strokeWidth || 2}px`,
              backgroundColor: stroke || '#94a3b8',
              borderTop:
                strokeDash !== 'solid' ? `${strokeWidth || 2}px ${borderDashStyle} ${stroke || '#94a3b8'}` : undefined,
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
