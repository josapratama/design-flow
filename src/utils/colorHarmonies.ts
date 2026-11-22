/**
 * Color Harmonies generator utility.
 * Calculates Complementary, Analogous, Triadic, and Monochromatic palettes from a base hex color.
 */

function hexToHsl(hex: string): [number, number, number] {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const normH = ((h % 360) + 360) % 360;
  const sDec = Math.max(0, Math.min(100, s)) / 100;
  const lDec = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * lDec - 1)) * sDec;
  const x = c * (1 - Math.abs(((normH / 60) % 2) - 1));
  const m = lDec - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (normH < 60) {
    r = c; g = x; b = 0;
  } else if (normH < 120) {
    r = x; g = c; b = 0;
  } else if (normH < 180) {
    r = 0; g = c; b = x;
  } else if (normH < 240) {
    r = 0; g = x; b = c;
  } else if (normH < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hexStr = Math.round((n + m) * 255).toString(16);
    return hexStr.length === 1 ? '0' + hexStr : hexStr;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export interface ColorHarmonyGroup {
  type: 'complementary' | 'analogous' | 'triadic' | 'monochromatic';
  name: string;
  colors: string[];
}

export function generateColorHarmonies(baseHex: string): ColorHarmonyGroup[] {
  if (!baseHex || !baseHex.startsWith('#')) return [];

  const [h, s, l] = hexToHsl(baseHex);

  return [
    {
      type: 'complementary',
      name: 'Komplementer (Kontras Kuat)',
      colors: [baseHex, hslToHex(h + 180, s, l)],
    },
    {
      type: 'analogous',
      name: 'Analog (Harmonis Sejajar)',
      colors: [hslToHex(h - 30, s, l), baseHex, hslToHex(h + 30, s, l)],
    },
    {
      type: 'triadic',
      name: 'Triadik (Seimbang 3 Titik)',
      colors: [baseHex, hslToHex(h + 120, s, l), hslToHex(h + 240, s, l)],
    },
    {
      type: 'monochromatic',
      name: 'Monokrom (Variasi Terang-Gelap)',
      colors: [
        hslToHex(h, s, Math.max(15, l - 30)),
        baseHex,
        hslToHex(h, s, Math.min(85, l + 25)),
      ],
    },
  ];
}
