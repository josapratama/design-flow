import { DesignElement } from '../types';

export interface CopiedVisualAttributes {
  fill?: string;
  color?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDash?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  shadow?: DesignElement['shadow'];
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: DesignElement['fontWeight'];
  opacity?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: DesignElement['textAlign'];
}

let activeStyleClipboard: CopiedVisualAttributes | null = null;
const listeners = new Set<(style: CopiedVisualAttributes | null) => void>();

export const copyElementStyle = (element: DesignElement): CopiedVisualAttributes => {
  activeStyleClipboard = {
    fill: element.fill,
    color: element.color,
    stroke: element.stroke,
    strokeWidth: element.strokeWidth,
    strokeDash: element.strokeDash,
    borderRadius: element.borderRadius,
    shadow: element.shadow,
    fontFamily: element.fontFamily,
    fontSize: element.fontSize,
    fontWeight: element.fontWeight,
    opacity: element.opacity,
    letterSpacing: element.letterSpacing,
    lineHeight: element.lineHeight,
    textAlign: element.textAlign,
  };
  listeners.forEach(l => l(activeStyleClipboard));
  return activeStyleClipboard;
};

export const pasteElementStyle = (
  targetElementId: string,
  onUpdate: (id: string, updates: Partial<DesignElement>) => void
): boolean => {
  if (!activeStyleClipboard) return false;
  const updates: Partial<DesignElement> = {};
  if (activeStyleClipboard.fill !== undefined) updates.fill = activeStyleClipboard.fill;
  if (activeStyleClipboard.color !== undefined) updates.color = activeStyleClipboard.color;
  if (activeStyleClipboard.stroke !== undefined) updates.stroke = activeStyleClipboard.stroke;
  if (activeStyleClipboard.strokeWidth !== undefined) updates.strokeWidth = activeStyleClipboard.strokeWidth;
  if (activeStyleClipboard.strokeDash !== undefined) updates.strokeDash = activeStyleClipboard.strokeDash;
  if (activeStyleClipboard.borderRadius !== undefined) updates.borderRadius = activeStyleClipboard.borderRadius;
  if (activeStyleClipboard.shadow !== undefined) updates.shadow = activeStyleClipboard.shadow;
  if (activeStyleClipboard.fontFamily !== undefined) updates.fontFamily = activeStyleClipboard.fontFamily;
  if (activeStyleClipboard.fontSize !== undefined) updates.fontSize = activeStyleClipboard.fontSize;
  if (activeStyleClipboard.fontWeight !== undefined) updates.fontWeight = activeStyleClipboard.fontWeight;
  if (activeStyleClipboard.opacity !== undefined) updates.opacity = activeStyleClipboard.opacity;
  if (activeStyleClipboard.letterSpacing !== undefined) updates.letterSpacing = activeStyleClipboard.letterSpacing;
  if (activeStyleClipboard.lineHeight !== undefined) updates.lineHeight = activeStyleClipboard.lineHeight;
  if (activeStyleClipboard.textAlign !== undefined) updates.textAlign = activeStyleClipboard.textAlign;

  onUpdate(targetElementId, updates);
  return true;
};

export const hasCopiedStyle = (): boolean => Boolean(activeStyleClipboard);

export const getCopiedStyle = (): CopiedVisualAttributes | null => activeStyleClipboard;

export const subscribeStyleClipboard = (callback: (style: CopiedVisualAttributes | null) => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};
