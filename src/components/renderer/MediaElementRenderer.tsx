import React from 'react';
import * as Icons from 'lucide-react';
import { DesignElement } from '../../types';
import { ComputedRendererStyle } from './rendererUtils';
import { getQrCodeUrl } from '../../utils/qrGenerator';

interface MediaElementRendererProps {
  element: DesignElement;
  computed: ComputedRendererStyle;
}

export const MediaElementRenderer: React.FC<MediaElementRendererProps> = ({ element, computed }) => {
  const {
    type,
    content,
    width,
    height,
    fill,
    stroke,
    strokeWidth,
    borderRadius,
    color,
    subTitle,
    iconName,
    imageUrl,
    name,
  } = element;

  const { shadowClass, borderDashStyle, fontClass } = computed;

  switch (type) {
    case 'icon': {
      const resolvedIconName = iconName || content || 'Sparkles';
      const LucideIcon = (Icons as any)[resolvedIconName] ? (Icons as any)[resolvedIconName] : Icons.Sparkles;
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

    case 'qr-code':
      return (
        <div
          className={`w-full h-full p-2.5 bg-white rounded-xl shadow-lg flex flex-col items-center justify-between select-none ${shadowClass}`}
          style={{
            background: fill || '#ffffff',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 16}px`,
            border: stroke ? `${strokeWidth || 1}px ${borderDashStyle} ${stroke}` : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <img
            src={getQrCodeUrl(content || 'https://designflow.app', Math.min(width, height) * 2, color || '000000', fill || 'ffffff')}
            alt={name || 'QR Code'}
            className="w-full h-full object-contain pointer-events-none"
          />
          {subTitle && (
            <span className="text-[10px] font-semibold text-slate-800 text-center truncate w-full mt-1">
              {subTitle}
            </span>
          )}
        </div>
      );

    default:
      return null;
  }
};
