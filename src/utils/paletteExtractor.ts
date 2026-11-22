export interface ExtractedPalette {
  dominantDark: string;
  primaryAccent: string;
  secondaryAccent: string;
  lightTone: string;
  swatches: string[];
}

/**
 * Extracts a harmonious color palette from an image URL using HTML5 canvas sampling,
 * with resilient fallback colors in case of CORS restrictions or network errors.
 */
export async function extractPaletteFromImage(imageUrl: string): Promise<ExtractedPalette> {
  return new Promise((resolve) => {
    const fallbackPalette: ExtractedPalette = {
      dominantDark: '#0f172a',
      primaryAccent: '#6366f1',
      secondaryAccent: '#38bdf8',
      lightTone: '#f8fafc',
      swatches: ['#0f172a', '#1e293b', '#6366f1', '#38bdf8', '#f8fafc'],
    };

    if (!imageUrl) {
      resolve(fallbackPalette);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timer = setTimeout(() => {
      resolve(fallbackPalette);
    }, 2500);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 36;
        canvas.height = 36;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(fallbackPalette);
          return;
        }

        ctx.drawImage(img, 0, 0, 36, 36);
        const imgData = ctx.getImageData(0, 0, 36, 36).data;

        const colorMap = new Map<string, { r: number; g: number; b: number; count: number; brightness: number; sat: number }>();

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];
          if (a < 128) continue;

          // Quantize RGB to 24-step clusters
          const qr = Math.min(255, Math.round(r / 24) * 24);
          const qg = Math.min(255, Math.round(g / 24) * 24);
          const qb = Math.min(255, Math.round(b / 24) * 24);
          const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`;

          const max = Math.max(qr, qg, qb);
          const min = Math.min(qr, qg, qb);
          const sat = max === 0 ? 0 : (max - min) / max;
          const brightness = (qr * 299 + qg * 587 + qb * 114) / 1000;

          const existing = colorMap.get(hex);
          if (existing) {
            existing.count++;
          } else {
            colorMap.set(hex, { r: qr, g: qg, b: qb, count: 1, brightness, sat });
          }
        }

        const sorted = Array.from(colorMap.values()).sort((a, b) => b.count - a.count);
        if (sorted.length === 0) {
          resolve(fallbackPalette);
          return;
        }

        const toHex = (c: { r: number; g: number; b: number }) =>
          `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;

        // Categorize into dark tones, vibrant accents, and light highlights
        const darkTones = sorted.filter(c => c.brightness < 80);
        const vibrantTones = sorted.filter(c => c.brightness >= 70 && c.brightness <= 210 && c.sat >= 0.25);
        const lightTones = sorted.filter(c => c.brightness > 190);

        const dominantDark = darkTones[0] ? toHex(darkTones[0]) : '#090d16';
        const primaryAccent = vibrantTones[0] ? toHex(vibrantTones[0]) : (sorted[1] ? toHex(sorted[1]) : '#6366f1');
        const secondaryAccent = vibrantTones[1] ? toHex(vibrantTones[1]) : (sorted[2] ? toHex(sorted[2]) : '#38bdf8');
        const lightTone = lightTones[0] ? toHex(lightTones[0]) : '#f8fafc';

        // Collect top 5 distinctive swatches
        const swatchSet = new Set<string>();
        swatchSet.add(dominantDark);
        swatchSet.add(primaryAccent);
        swatchSet.add(secondaryAccent);
        swatchSet.add(lightTone);
        sorted.forEach(c => {
          if (swatchSet.size < 5) swatchSet.add(toHex(c));
        });

        resolve({
          dominantDark,
          primaryAccent,
          secondaryAccent,
          lightTone,
          swatches: Array.from(swatchSet).slice(0, 5),
        });
      } catch (err) {
        console.warn('Canvas pixel extraction CORS error, falling back gracefully:', err);
        resolve(fallbackPalette);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(fallbackPalette);
    };

    img.src = imageUrl;
  });
}
