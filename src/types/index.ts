export type DesignMode = 'slide' | 'uiux' | 'graphic';

export interface PresetSize {
  name: string;
  width: number;
  height: number;
  mode: DesignMode;
  icon?: string;
  description?: string;
}

export const PRESET_SIZES: PresetSize[] = [
  // Presentation (Slides)
  { name: 'Slide 16:9 (FHD)', width: 1920, height: 1080, mode: 'slide', description: 'Standar presentasi widescreen modern' },
  { name: 'Slide 4:3 (Klasik)', width: 1024, height: 768, mode: 'slide', description: 'Format proyektor sekolah/kampus klasik' },
  
  // UI / UX Wireframing
  { name: 'Mobile (iPhone 15)', width: 393, height: 852, mode: 'uiux', description: 'Artboard antarmuka iOS' },
  { name: 'Mobile (Android)', width: 360, height: 800, mode: 'uiux', description: 'Artboard antarmuka Android' },
  { name: 'Tablet (iPad Air)', width: 820, height: 1180, mode: 'uiux', description: 'Artboard tablet 11 inci' },
  { name: 'Desktop (1440p)', width: 1440, height: 900, mode: 'uiux', description: 'Artboard dashboard web desktop' },

  // Graphic Design & Social Media
  { name: 'Instagram Post (1:1)', width: 1080, height: 1080, mode: 'graphic', description: 'Feed Instagram persegi' },
  { name: 'Instagram Story (9:16)', width: 1080, height: 1920, mode: 'graphic', description: 'Story IG / TikTok vertical' },
  { name: 'Dokumen A4', width: 794, height: 1123, mode: 'graphic', description: 'Format cetak laporan A4 (96 DPI)' },
  { name: 'YouTube Thumbnail', width: 1280, height: 720, mode: 'graphic', description: 'Sampul video YouTube' },
];

export type ElementType = 
  // Basic Shapes
  | 'rect'
  | 'circle'
  | 'line'
  | 'card'
  | 'badge-shape'
  // Typography
  | 'heading'
  | 'text'
  | 'quote'
  // UI Components
  | 'button'
  | 'input'
  | 'navbar'
  | 'bottom-nav'
  | 'avatar'
  | 'metric-card'
  | 'toggle'
  | 'table'
  // Media & Icons
  | 'icon'
  | 'image';

export interface DesignElement {
  id: string;
  type: ElementType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  locked?: boolean;
  hidden?: boolean;
  opacity?: number;

  // Visual Styling
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDash?: 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  // Typography
  content?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  fontFamily?: 'sans' | 'serif' | 'mono';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  letterSpacing?: number;
  lineHeight?: number;

  // Component specifics
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  placeholder?: string;
  value?: string;
  iconName?: string;
  imageUrl?: string;
  subTitle?: string;
  badgeText?: string;
  
  // Custom user meta
  meta?: Record<string, any>;
}

export interface Slide {
  id: string;
  title: string;
  notes?: string;
  background: string;
  elements: DesignElement[];
  width: number;
  height: number;
  presetName: string;
}

export interface DesignProject {
  id: string;
  title: string;
  mode: DesignMode;
  slides: Slide[];
  activeSlideId: string;
  selectedElementIds: string[];
  scale: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
}
