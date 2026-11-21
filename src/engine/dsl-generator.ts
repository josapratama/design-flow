import { DesignProject, Slide, DesignElement } from '../types';

/**
 * Serializes a DesignProject or a single Slide into human-readable DesignFlow DSL.
 */
export function generateDesignDSL(project: DesignProject): string {
  const lines: string[] = [];

  lines.push(`@design title="${escapeString(project.title)}" mode="${project.mode}"`);
  lines.push('');

  project.slides.forEach((slide, index) => {
    lines.push(`// --- Slide / Artboard ${index + 1}: ${slide.title} ---`);
    lines.push(`artboard "${escapeString(slide.title)}" {`);
    lines.push(`  size: [${slide.width}, ${slide.height}]`);
    lines.push(`  preset: "${slide.presetName}"`);
    lines.push(`  background: "${slide.background}"`);
    if (slide.notes && slide.notes.trim()) {
      lines.push(`  notes: "${escapeString(slide.notes)}"`);
    }
    lines.push('');

    slide.elements.forEach(el => {
      lines.push(`  ${el.type} ${sanitizeIdentifier(el.name || el.id)} {`);
      lines.push(`    position: [${Math.round(el.x)}, ${Math.round(el.y)}]`);
      lines.push(`    size: [${Math.round(el.width)}, ${Math.round(el.height)}]`);
      if (el.zIndex !== undefined) lines.push(`    zIndex: ${el.zIndex}`);
      if (el.rotation) lines.push(`    rotation: ${el.rotation}`);
      if (el.opacity !== undefined && el.opacity < 1) lines.push(`    opacity: ${el.opacity}`);
      if (el.locked) lines.push(`    locked: true`);
      if (el.hidden) lines.push(`    hidden: true`);
      if (el.flipX) lines.push(`    flipX: true`);
      if (el.flipY) lines.push(`    flipY: true`);
      if (el.groupId) lines.push(`    groupId: "${escapeString(el.groupId)}"`);
      if (el.chartType) lines.push(`    chartType: "${el.chartType}"`);

      // Content & Typography
      if (el.content !== undefined) lines.push(`    content: "${escapeString(el.content)}"`);
      if (el.fontFamily && el.fontFamily !== 'sans') lines.push(`    fontFamily: "${el.fontFamily}"`);
      if (el.fontSize) lines.push(`    fontSize: ${el.fontSize}`);
      if (el.fontWeight && el.fontWeight !== 'normal') lines.push(`    fontWeight: "${el.fontWeight}"`);
      if (el.textAlign && el.textAlign !== 'left') lines.push(`    textAlign: "${el.textAlign}"`);
      if (el.color) lines.push(`    color: "${el.color}"`);

      // Styling
      if (el.fill) lines.push(`    fill: "${el.fill}"`);
      if (el.stroke) lines.push(`    stroke: "${el.stroke}"`);
      if (el.strokeWidth) lines.push(`    strokeWidth: ${el.strokeWidth}`);
      if (el.strokeDash && el.strokeDash !== 'solid') lines.push(`    strokeDash: "${el.strokeDash}"`);
      if (el.borderRadius) lines.push(`    borderRadius: ${el.borderRadius}`);
      if (el.shadow && el.shadow !== 'none') lines.push(`    shadow: "${el.shadow}"`);

      // Media & UI components
      if (el.imageUrl) lines.push(`    imageUrl: "${escapeString(el.imageUrl)}"`);
      if (el.variant) lines.push(`    variant: "${el.variant}"`);
      if (el.placeholder) lines.push(`    placeholder: "${escapeString(el.placeholder)}"`);
      if (el.iconName) lines.push(`    icon: "${el.iconName}"`);
      if (el.subTitle) lines.push(`    subTitle: "${escapeString(el.subTitle)}"`);
      if (el.badgeText) lines.push(`    badge: "${escapeString(el.badgeText)}"`);

      lines.push('  }');
      lines.push('');
    });

    lines.push('}');
    lines.push('');
  });

  return lines.join('\n');
}

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function sanitizeIdentifier(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
}
