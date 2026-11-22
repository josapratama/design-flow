import React from 'react';
import { DesignElement } from '../types';
import { getComputedRendererStyle, renderRichInlineText } from './renderer/rendererUtils';
import { MediaElementRenderer } from './renderer/MediaElementRenderer';
import { UIKitElementRenderer } from './renderer/UIKitElementRenderer';
import { ShapeElementRenderer } from './renderer/ShapeElementRenderer';

export { renderRichInlineText };

interface ElementRendererProps {
  element: DesignElement;
  isSelected: boolean;
}

const MEDIA_TYPES = new Set(['icon', 'avatar', 'image', 'qr-code']);
const UIKIT_TYPES = new Set([
  'toggle',
  'chart',
  'table',
  'button',
  'input',
  'metric-card',
  'navbar',
  'bottom-nav',
  'rating',
  'breadcrumb',
  'alert-box',
  'accordion-item',
  'progress-bar',
  'pricing-card',
  'timeline-item',
  'chat-bubble',
  'code-snippet',
  'testimonial-card',
]);

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element }) => {
  if (element.hidden) return null;

  const computed = getComputedRendererStyle(element);

  const animClass =
    element.animation && element.animation !== 'none'
      ? `df-anim-${element.animation}`
      : '';

  const animStyle: React.CSSProperties = {
    ...(element.animation && element.animation !== 'none'
      ? ({
          '--df-anim-dur': `${element.animationDuration || 0.6}s`,
          '--df-anim-delay': `${element.animationDelay || 0}s`,
        } as any)
      : {}),
  };

  const renderContent = () => {
    if (MEDIA_TYPES.has(element.type)) {
      return <MediaElementRenderer element={element} computed={computed} />;
    }
    if (UIKIT_TYPES.has(element.type)) {
      return <UIKitElementRenderer element={element} computed={computed} />;
    }
    return <ShapeElementRenderer element={element} computed={computed} />;
  };

  return (
    <div className={`w-full h-full ${animClass}`} style={animStyle}>
      {renderContent()}
    </div>
  );
};
