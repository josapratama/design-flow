import React, { useState } from 'react';
import {
  Type,
  LayoutTemplate,
  Square,
  Upload,
  Sparkles,
  Layers,
} from 'lucide-react';
import { DesignElement, DesignMode, Slide } from '../types';
import { SidebarTextTab } from './sidebar/SidebarTextTab';
import { SidebarUIKitTab } from './sidebar/SidebarUIKitTab';
import { SidebarShapesTab } from './sidebar/SidebarShapesTab';
import { SidebarMediaTab } from './sidebar/SidebarMediaTab';
import { SidebarSmartBlocksTab } from './sidebar/SidebarSmartBlocksTab';
import { SidebarLayersTab } from './sidebar/SidebarLayersTab';

interface SidebarPaletteProps {
  mode: DesignMode;
  activeSlide: Slide;
  selectedElementIds: string[];
  onSelectElement: (elementId: string, multiSelect: boolean) => void;
  onToggleLock: (elementId: string) => void;
  onToggleHide: (elementId: string) => void;
  onDeleteElement: (elementId: string) => void;
  onReorderElement: (direction: 'front' | 'back' | 'up' | 'down', elementId?: string) => void;
  onAddElement: (element: DesignElement) => void;
  onAddElements: (elements: DesignElement[]) => void;
}

export const SidebarPalette: React.FC<SidebarPaletteProps> = ({
  activeSlide,
  selectedElementIds,
  onSelectElement,
  onToggleLock,
  onToggleHide,
  onDeleteElement,
  onReorderElement,
  onAddElement,
  onAddElements,
}) => {
  const [activeTab, setActiveTab] = useState<'elements' | 'ui' | 'shapes' | 'media' | 'blocks' | 'layers'>('elements');

  const tabs = [
    { id: 'elements', label: 'Teks', icon: Type },
    { id: 'ui', label: 'UI Kit', icon: LayoutTemplate },
    { id: 'shapes', label: 'Bentuk', icon: Square },
    { id: 'media', label: 'Media', icon: Upload },
    { id: 'blocks', label: 'Blok AI', icon: Sparkles },
    { id: 'layers', label: 'Layer', icon: Layers, badge: activeSlide.elements.length },
  ];

  return (
    <aside className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 select-none z-20">
      {/* Top Tab Switcher */}
      <div className="grid grid-cols-6 border-b border-slate-800 bg-slate-900/50 p-1 gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={tab.label}
            >
              <tab.icon className="w-4 h-4 mb-1" />
              <span className="text-[10px] leading-tight truncate w-full text-center">
                {tab.label}
              </span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {activeTab === 'elements' && <SidebarTextTab onAddElement={onAddElement} />}
        {activeTab === 'ui' && <SidebarUIKitTab onAddElement={onAddElement} />}
        {activeTab === 'shapes' && <SidebarShapesTab onAddElement={onAddElement} />}
        {activeTab === 'media' && <SidebarMediaTab onAddElement={onAddElement} />}
        {activeTab === 'blocks' && (
          <SidebarSmartBlocksTab onAddElement={onAddElement} onAddElements={onAddElements} />
        )}
        {activeTab === 'layers' && (
          <SidebarLayersTab
            activeSlide={activeSlide}
            selectedElementIds={selectedElementIds}
            onSelectElement={onSelectElement}
            onToggleLock={onToggleLock}
            onToggleHide={onToggleHide}
            onDeleteElement={onDeleteElement}
            onReorderElement={onReorderElement}
          />
        )}
      </div>
    </aside>
  );
};
