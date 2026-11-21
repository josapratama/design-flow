export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'Sans Serif' | 'Serif' | 'Monospace' | 'Display';
  googleFont?: string;
}

export const POPULAR_FONTS: FontOption[] = [
  // Sans Serif
  {
    id: 'inter',
    name: 'Inter',
    family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    category: 'Sans Serif',
    googleFont: 'Inter:wght@300;400;500;600;700;800',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    family: "'Poppins', sans-serif",
    category: 'Sans Serif',
    googleFont: 'Poppins:wght@300;400;500;600;700;800',
  },
  {
    id: 'plus-jakarta-sans',
    name: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', sans-serif",
    category: 'Sans Serif',
    googleFont: 'Plus+Jakarta+Sans:wght@400;500;600;700;800',
  },
  {
    id: 'roboto',
    name: 'Roboto',
    family: "'Roboto', sans-serif",
    category: 'Sans Serif',
    googleFont: 'Roboto:wght@300;400;500;700',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    family: "'Montserrat', sans-serif",
    category: 'Sans Serif',
    googleFont: 'Montserrat:wght@400;500;600;700;800',
  },

  // Serif
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    family: "'Playfair Display', Georgia, serif",
    category: 'Serif',
    googleFont: 'Playfair+Display:ital,wght@0,400;0,600;0,700;1,400',
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    family: "'Merriweather', serif",
    category: 'Serif',
    googleFont: 'Merriweather:wght@300;400;700',
  },
  {
    id: 'lora',
    name: 'Lora',
    family: "'Lora', Georgia, serif",
    category: 'Serif',
    googleFont: 'Lora:ital,wght@0,400;0,600;1,400',
  },

  // Monospace
  {
    id: 'fira-code',
    name: 'Fira Code',
    family: "'Fira Code', monospace",
    category: 'Monospace',
    googleFont: 'Fira+Code:wght@400;500;600;700',
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    family: "'JetBrains Mono', monospace",
    category: 'Monospace',
    googleFont: 'JetBrains+Mono:wght@400;500;700',
  },

  // Display
  {
    id: 'outfit',
    name: 'Outfit',
    family: "'Outfit', sans-serif",
    category: 'Display',
    googleFont: 'Outfit:wght@400;500;600;700;800',
  },
  {
    id: 'oswald',
    name: 'Oswald',
    family: "'Oswald', sans-serif",
    category: 'Display',
    googleFont: 'Oswald:wght@400;500;600;700',
  },
];

const loadedFonts = new Set<string>();

/**
 * Dynamically injects Google Font link into document head
 */
export function loadGoogleFont(font: FontOption): void {
  if (typeof document === 'undefined' || !font.googleFont || loadedFonts.has(font.id)) {
    return;
  }

  try {
    const linkId = `google-font-${font.id}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${font.googleFont}&display=swap`;
      document.head.appendChild(link);
    }
    loadedFonts.add(font.id);
  } catch (err) {
    console.warn(`Failed to inject Google Font: ${font.name}`, err);
  }
}

/**
 * Preload commonly used fonts
 */
export function preloadCoreFonts(): void {
  ['inter', 'poppins', 'plus-jakarta-sans', 'fira-code'].forEach(id => {
    const f = POPULAR_FONTS.find(font => font.id === id);
    if (f) loadGoogleFont(f);
  });
}

/**
 * Maps a fontFamily value (id, alias, or custom family) to full CSS font-family string
 */
export function getFontFamilyStyle(fontFamily?: string): string {
  if (!fontFamily) return "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

  if (fontFamily === 'sans') return "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
  if (fontFamily === 'serif') return "'Playfair Display', Georgia, serif";
  if (fontFamily === 'mono') return "'Fira Code', monospace";

  const found = POPULAR_FONTS.find(
    f => f.id === fontFamily || f.name.toLowerCase() === fontFamily.toLowerCase()
  );

  if (found) {
    loadGoogleFont(found);
    return found.family;
  }

  return fontFamily;
}
