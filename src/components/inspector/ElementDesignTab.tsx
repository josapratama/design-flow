import React from 'react';
import { DesignElement, Slide } from '../../types';
import { SpecialComponentsSection } from './design/SpecialComponentsSection';
import { TypographySection } from './design/TypographySection';
import { ColorFillSection } from './design/ColorFillSection';
import { BorderShadowSection } from './design/BorderShadowSection';

interface ElementDesignTabProps {
  element: DesignElement;
  activeSlide: Slide;
  onUpdateElement: (elementId: string, updates: Partial<DesignElement>) => void;
  handleChange: (field: keyof DesignElement, val: any) => void;
  handleEyeDropper: (field: 'fill' | 'color' | 'stroke') => void;
  handleAutoContrast: () => void;
  documentColors: string[];
  recentColors: string[];
  colorHarmonies: any;
  activeColorForHarmonies: string;
  showIconPicker: boolean;
  setShowIconPicker: (show: boolean) => void;
  iconFilter: string;
  setIconFilter: (filter: string) => void;
  filteredIcons: string[];
  fontFilterCategory: 'all' | 'Sans Serif' | 'Serif' | 'Monospace' | 'Display';
  setFontFilterCategory: (cat: 'all' | 'Sans Serif' | 'Serif' | 'Monospace' | 'Display') => void;
  showToast: (msg: string) => void;
  onExplodeElement?: (elementId: string, replacementElements: DesignElement[]) => void;
}

export const ElementDesignTab: React.FC<ElementDesignTabProps> = ({
  element,
  activeSlide,
  handleChange,
  handleEyeDropper,
  handleAutoContrast,
  documentColors,
  colorHarmonies,
  showIconPicker,
  setShowIconPicker,
  iconFilter,
  setIconFilter,
  filteredIcons,
  fontFilterCategory,
  setFontFilterCategory,
  showToast,
  onExplodeElement,
}) => {
  return (
    <div className="space-y-4">
      {/* 1. Special Element Specific Controls (QR Code, Progress, Rating, Alert, Icon, Image, Navbar) */}
      <SpecialComponentsSection
        element={element}
        handleChange={handleChange}
        showIconPicker={showIconPicker}
        setShowIconPicker={setShowIconPicker}
        iconFilter={iconFilter}
        setIconFilter={setIconFilter}
        filteredIcons={filteredIcons}
        onExplodeElement={onExplodeElement}
      />

      {/* 2. Typography Controls */}
      <TypographySection
        element={element}
        handleChange={handleChange}
        handleAutoContrast={handleAutoContrast}
        fontFilterCategory={fontFilterCategory}
        setFontFilterCategory={setFontFilterCategory}
      />

      {/* 3. Color, Fill, Gradients, and Opacity Controls */}
      <ColorFillSection
        element={element}
        activeSlide={activeSlide}
        handleChange={handleChange}
        handleEyeDropper={handleEyeDropper}
        documentColors={documentColors}
        colorHarmonies={colorHarmonies}
        showToast={showToast}
      />

      {/* 4. Border Radius, Stroke & Shadow Controls */}
      <BorderShadowSection
        element={element}
        handleChange={handleChange}
        handleEyeDropper={handleEyeDropper}
      />
    </div>
  );
};
