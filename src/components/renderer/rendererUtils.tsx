import React from 'react';
import { DesignElement } from '../../types';
import { getFontFamilyStyle } from '../../utils/fontLoader';

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

export interface ComputedRendererStyle {
  resolvedFontFamily: string;
  shadowClass: string;
  borderDashStyle: 'solid' | 'dashed' | 'dotted';
  glassClass: string;
  fontClass: string;
}

export function getComputedRendererStyle(element: DesignElement): ComputedRendererStyle {
  const { shadow, strokeDash, fill } = element;
  const resolvedFontFamily = getFontFamilyStyle(element.fontFamily);

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

  return {
    resolvedFontFamily,
    shadowClass,
    borderDashStyle,
    glassClass,
    fontClass,
  };
}
