/**
 * Slide Background utility for rendering solid colors, wallpapers, and dimmer overlays.
 */

export interface SlideBackgroundProps {
  background?: string;
  wallpaper?: string;
  wallpaperOverlay?: number;
}

export function getSlideBackground(slide: SlideBackgroundProps): string {
  if (slide.wallpaper) {
    const overlay = Math.min(Math.max(slide.wallpaperOverlay ?? 0, 0), 0.95);
    if (overlay > 0) {
      return `linear-gradient(rgba(0, 0, 0, ${overlay}), rgba(0, 0, 0, ${overlay})), url('${slide.wallpaper}') center / cover no-repeat`;
    }
    return `url('${slide.wallpaper}') center / cover no-repeat`;
  }
  return slide.background || '#0f172a';
}
