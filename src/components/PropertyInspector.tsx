import React, { useState, useEffect, useMemo } from 'react';
import { DesignElement, Slide } from '../types';
import { Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { renderElementJSX } from '../engine/tailwind-exporter';
import {
  copyElementStyle,
  pasteElementStyle,
  hasCopiedStyle,
  subscribeStyleClipboard,
} from '../utils/styleClipboard';
import { generateColorHarmonies } from '../utils/colorHarmonies';
import { useDialog } from './dialogs/DialogProvider';
import { useTranslation } from '../i18n/PolyglotContext';

// Modular Inspector Subcomponents
import { SlideCanvasInspector } from './inspector/SlideCanvasInspector';
import { PropertyInspectorHeader } from './inspector/PropertyInspectorHeader';
import { ElementDesignTab } from './inspector/ElementDesignTab';
import { ElementLayoutTab } from './inspector/ElementLayoutTab';

interface PropertyInspectorProps {
  element: DesignElement | null;
  activeSlide: Slide;
  slides?: Slide[];
  selectedCount?: number;
  onUpdateElement: (elementId: string, updates: Partial<DesignElement>) => void;
  onUpdateSlide: (slideId: string, updates: Partial<Slide>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onReorder: (direction: 'front' | 'back' | 'up' | 'down') => void;
  onAlignElement: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistributeElements?: (direction: 'horizontal' | 'vertical') => void;
  onTidyUpElements?: () => void;
  onBatchUpdateElements?: (updater: (el: DesignElement) => Partial<DesignElement>) => void;
  onApplySlideTheme?: (theme: { background: string; primaryAccent: string; cardFill: string; textColor: string }) => void;
  onInvertSlideTheme?: () => void;
  onToggleLock?: (elementId: string) => void;
  onToggleHide?: (elementId: string) => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onReplaceColorInProject?: (fromColor: string, toColor: string) => number;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  element,
  activeSlide,
  slides = [],
  selectedCount = 0,
  onUpdateElement,
  onUpdateSlide,
  onDelete,
  onDuplicate,
  onReorder,
  onAlignElement,
  onDistributeElements,
  onTidyUpElements,
  onBatchUpdateElements,
  onApplySlideTheme,
  onInvertSlideTheme,
  onToggleLock,
  onToggleHide,
  onGroup,
  onUngroup,
  onReplaceColorInProject,
}) => {
  const { alert: dialogAlert } = useDialog();
  const { t } = useTranslation();

  const [inspectorTab, setInspectorTab] = useState<'design' | 'layout'>('design');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconFilter, setIconFilter] = useState('');
  const [fontFilterCategory, setFontFilterCategory] = useState<'all' | 'Sans Serif' | 'Serif' | 'Monospace' | 'Display'>('all');
  const [isRatioLocked, setIsRatioLocked] = useState(false);
  const [copiedStyleActive, setCopiedStyleActive] = useState<boolean>(() => hasCopiedStyle());
  const [inspectorToast, setInspectorToast] = useState<string | null>(null);

  // Auto-extracted document colors used across active slide
  const documentColors = useMemo(() => {
    const set = new Set<string>();
    if (activeSlide.background && activeSlide.background.startsWith('#')) {
      set.add(activeSlide.background.toLowerCase());
    }
    activeSlide.elements.forEach(el => {
      if (el.fill && el.fill.startsWith('#')) set.add(el.fill.toLowerCase());
      if (el.color && el.color.startsWith('#')) set.add(el.color.toLowerCase());
      if (el.stroke && el.stroke.startsWith('#')) set.add(el.stroke.toLowerCase());
    });
    return Array.from(set).slice(0, 10);
  }, [activeSlide]);

  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('designflow_recent_colors');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const recordRecentColor = (color: string) => {
    if (!color || !color.startsWith('#')) return;
    setRecentColors(prev => {
      const next = [color.toLowerCase(), ...prev.filter(c => c.toLowerCase() !== color.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem('designflow_recent_colors', JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  const popularIconNames = [
    'Star', 'Heart', 'Shield', 'ShieldCheck', 'Check', 'CheckCircle', 'CheckCircle2', 'User', 'Users', 'UserCheck', 'Search', 'Settings', 'Home',
    'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ChevronRight', 'ChevronLeft', 'ChevronUp', 'ChevronDown', 'Zap', 'Download', 'Upload',
    'Compass', 'Laptop', 'Monitor', 'Smartphone', 'Tablet', 'Mail', 'Phone', 'PhoneCall', 'MessageSquare', 'MessageCircle', 'Send', 'Share2',
    'Calendar', 'Clock', 'Lock', 'Unlock', 'Sparkles', 'Folder', 'FolderOpen', 'FileText', 'File', 'BarChart', 'BarChart2', 'BarChart3', 'PieChart', 'LineChart',
    'CreditCard', 'Wallet', 'DollarSign', 'Camera', 'Video', 'Bell', 'Tag', 'Bookmark', 'Globe', 'HelpCircle', 'Info', 'AlertCircle', 'AlertTriangle',
    'Image', 'Music', 'Headphones', 'Volume2', 'VolumeX', 'Play', 'Pause', 'Film', 'Radio', 'Tv', 'Sliders', 'SlidersHorizontal', 'Eye', 'EyeOff',
    'Smile', 'Frown', 'Award', 'Gift', 'Flame', 'Sun', 'Moon', 'Cloud', 'CloudRain', 'Wind', 'Coffee', 'Utensils',
    'Code', 'Terminal', 'Cpu', 'Database', 'Server', 'HardDrive', 'Wifi', 'Bluetooth', 'Key', 'Layers', 'Boxes', 'Box', 'Activity', 'TrendingUp', 'TrendingDown',
    'Briefcase', 'Building', 'ShoppingBag', 'ShoppingCart', 'Receipt', 'Target', 'Flag', 'MapPin', 'Map', 'Navigation', 'Rocket', 'Plane', 'Car',
    'Paperclip', 'Archive', 'Printer', 'Trash2', 'Copy', 'Edit', 'Edit2', 'Pen', 'Crop', 'Maximize2', 'Minimize2', 'Plus', 'Minus', 'X', 'RefreshCw'
  ];

  const filteredIcons = popularIconNames.filter(name =>
    name.toLowerCase().includes(iconFilter.toLowerCase())
  );

  useEffect(() => {
    return subscribeStyleClipboard(() => {
      setCopiedStyleActive(hasCopiedStyle());
    });
  }, []);

  const showToast = (msg: string) => {
    setInspectorToast(msg);
    setTimeout(() => setInspectorToast(null), 2000);
  };

  const handleCopyStyle = () => {
    if (!element) return;
    copyElementStyle(element);
    showToast('Gaya Disalin! (Pilih elemen lain untuk Tempel)');
  };

  const handlePasteStyle = () => {
    if (!element) return;
    const applied = pasteElementStyle(element.id, onUpdateElement);
    if (applied) {
      showToast('Gaya Diterapkan!');
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
    }
  };

  const activeColorForHarmonies = useMemo(() => {
    if (element?.fill && element.fill.startsWith('#') && element.fill !== 'transparent') {
      return element.fill;
    }
    if (element?.color && element.color.startsWith('#')) {
      return element.color;
    }
    return '#6366f1';
  }, [element?.fill, element?.color]);

  const colorHarmonies = useMemo(() => {
    return generateColorHarmonies(activeColorForHarmonies);
  }, [activeColorForHarmonies]);

  const handleCopyJSX = () => {
    if (!element) return;
    try {
      const snippet = renderElementJSX(element);
      navigator.clipboard.writeText(snippet);
      showToast('Kode JSX Disalin!');
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } catch {
      showToast('Gagal menyalin JSX.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopyStyle();
      } else if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePasteStyle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [element]);

  // 1. IF NO ELEMENT IS SELECTED: SHOW CANVAS & SLIDE SETTINGS
  if (!element) {
    return (
      <SlideCanvasInspector
        activeSlide={activeSlide}
        onUpdateSlide={onUpdateSlide}
        onApplySlideTheme={onApplySlideTheme}
        onInvertSlideTheme={onInvertSlideTheme}
        onReplaceColorInProject={onReplaceColorInProject}
        showToast={showToast}
      />
    );
  }

  // 2. IF AN ELEMENT IS SELECTED: SHOW ELEMENT PROPERTIES
  const handleChange = (field: keyof DesignElement, val: any) => {
    if ((field === 'fill' || field === 'color' || field === 'stroke') && typeof val === 'string' && val.startsWith('#')) {
      recordRecentColor(val);
    }
    const isStyleField = [
      'fill', 'color', 'stroke', 'strokeWidth', 'strokeDash',
      'opacity', 'fontFamily', 'fontSize', 'fontWeight', 'borderRadius',
      'shadow', 'textAlign', 'letterSpacing', 'lineHeight'
    ].includes(field as string);

    if (isStyleField && selectedCount && selectedCount > 1 && onBatchUpdateElements) {
      onBatchUpdateElements(() => ({ [field]: val }));
    } else {
      onUpdateElement(element.id, { [field]: val });
    }
  };

  const handleEyeDropper = async (field: 'fill' | 'color' | 'stroke') => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const res = await eyeDropper.open();
        if (res?.sRGBHex) {
          handleChange(field, res.sRGBHex);
        }
      } catch {
        // User cancelled sampling
      }
    } else {
      dialogAlert({
        title: 'Pipet Warna Tidak Didukung',
        message: 'Fitur Pipet Eyedropper hanya didukung di browser modern berbasis Chromium (Chrome, Edge, Opera, Brave).',
        variant: 'info',
      });
    }
  };

  const handleAutoContrast = () => {
    const bg = element.fill || activeSlide.background || '#0f172a';
    let hex = bg.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 15;
    const g = parseInt(hex.substring(2, 4), 16) || 23;
    const b = parseInt(hex.substring(4, 6), 16) || 42;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    const contrastColor = yiq >= 128 ? '#0f172a' : '#ffffff';
    handleChange('color', contrastColor);
  };

  const handleExplodeElement = (elementId: string, replacementElements: DesignElement[]) => {
    const idx = activeSlide.elements.findIndex(el => el.id === elementId);
    if (idx === -1) return;
    const newElements = [...activeSlide.elements];
    newElements.splice(idx, 1, ...replacementElements);
    onUpdateSlide(activeSlide.id, { elements: newElements });
    showToast('Berhasil memecah elemen menjadi Group satuan (Figma-Style)!');
  };

  return (
    <aside className="w-72 h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 select-none z-10 relative">
      {/* Toast Feedback */}
      {inspectorToast && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 bg-slate-950 border border-indigo-500/60 text-white rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100 whitespace-nowrap">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-medium">{inspectorToast}</span>
        </div>
      )}

      {/* Header with Title and Quick Action Buttons */}
      <PropertyInspectorHeader
        element={element}
        selectedCount={selectedCount}
        copiedStyleActive={copiedStyleActive}
        onToggleLock={onToggleLock}
        onToggleHide={onToggleHide}
        onGroup={onGroup}
        onUngroup={onUngroup}
        onCopyStyle={handleCopyStyle}
        onPasteStyle={handlePasteStyle}
        onCopyJSX={handleCopyJSX}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />

      {/* 2 Modern Segmented Tabs: Desain & Tata Letak */}
      <div className="grid grid-cols-2 p-1.5 border-b border-slate-800 bg-slate-950/60 shrink-0 gap-1">
        <button
          type="button"
          onClick={() => setInspectorTab('design')}
          className={`py-1.5 text-xs font-semibold rounded-lg border transition-all text-center ${
            inspectorTab === 'design'
              ? 'bg-slate-800 border-slate-700 text-white shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          Desain & Gaya
        </button>
        <button
          type="button"
          onClick={() => setInspectorTab('layout')}
          className={`py-1.5 text-xs font-semibold rounded-lg border transition-all text-center ${
            inspectorTab === 'layout'
              ? 'bg-slate-800 border-slate-700 text-white shadow-sm'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          Tata Letak & Aksi
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-300">
        {inspectorTab === 'design' ? (
          <ElementDesignTab
            element={element}
            activeSlide={activeSlide}
            onUpdateElement={onUpdateElement}
            handleChange={handleChange}
            handleEyeDropper={handleEyeDropper}
            handleAutoContrast={handleAutoContrast}
            documentColors={documentColors}
            recentColors={recentColors}
            colorHarmonies={colorHarmonies}
            activeColorForHarmonies={activeColorForHarmonies}
            showIconPicker={showIconPicker}
            setShowIconPicker={setShowIconPicker}
            iconFilter={iconFilter}
            setIconFilter={setIconFilter}
            filteredIcons={filteredIcons}
            fontFilterCategory={fontFilterCategory}
            setFontFilterCategory={setFontFilterCategory}
            showToast={showToast}
            onExplodeElement={handleExplodeElement}
          />
        ) : (
          <ElementLayoutTab
            element={element}
            slides={slides}
            selectedCount={selectedCount}
            isRatioLocked={isRatioLocked}
            setIsRatioLocked={setIsRatioLocked}
            onUpdateElement={onUpdateElement}
            handleChange={handleChange}
            onAlignElement={onAlignElement}
            onDistributeElements={onDistributeElements}
            onTidyUpElements={onTidyUpElements}
            onBatchUpdateElements={onBatchUpdateElements}
            onReorder={onReorder}
            showToast={showToast}
          />
        )}
      </div>
    </aside>
  );
};
