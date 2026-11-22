/**
 * WCAG 2.1 Color Contrast Utilities
 * Calculates luminance and contrast ratios to ensure optimal readability.
 */

export function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || typeof hex !== 'string') return null;
  let cleaned = hex.trim().replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  if (cleaned.length !== 6) return null;
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(colorA: string, colorB: string): number {
  const rgbA = parseHexColor(colorA) || { r: 255, g: 255, b: 255 };
  const rgbB = parseHexColor(colorB) || { r: 15, g: 23, b: 42 };

  const lumA = getRelativeLuminance(rgbA.r, rgbA.g, rgbA.b);
  const lumB = getRelativeLuminance(rgbB.r, rgbB.g, rgbB.b);

  const brighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);

  const ratio = (brighter + 0.05) / (darker + 0.05);
  return Number(ratio.toFixed(1));
}

export interface ContrastScore {
  ratio: number;
  level: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  label: string;
  isGood: boolean;
  recommendedColor: string;
}

export function evaluateContrast(textColor: string, bgColor: string): ContrastScore {
  const ratio = getContrastRatio(textColor, bgColor);
  
  // Test white vs black to find the best auto-fix
  const ratioWhite = getContrastRatio('#ffffff', bgColor);
  const ratioBlack = getContrastRatio('#000000', bgColor);
  const recommendedColor = ratioWhite >= ratioBlack ? '#ffffff' : '#000000';

  if (ratio >= 7.0) {
    return {
      ratio,
      level: 'AAA',
      label: 'Sangat Bagus (AAA)',
      isGood: true,
      recommendedColor,
    };
  }
  if (ratio >= 4.5) {
    return {
      ratio,
      level: 'AA',
      label: 'Bagus (AA Pass)',
      isGood: true,
      recommendedColor,
    };
  }
  if (ratio >= 3.0) {
    return {
      ratio,
      level: 'AA Large',
      label: 'Cukup (Judul/Tebal)',
      isGood: true,
      recommendedColor,
    };
  }
  return {
    ratio,
    level: 'Fail',
    label: 'Kontras Rendah',
    isGood: false,
    recommendedColor,
  };
}
