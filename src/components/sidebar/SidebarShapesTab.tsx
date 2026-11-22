import React from 'react';
import {
  Square,
  Circle,
  Triangle,
  Star,
  Hexagon,
  MoveRight,
  Minus,
  Heart,
  Diamond,
  MessageSquare,
} from 'lucide-react';
import { DesignElement } from '../../types';
import { createBaseElement } from './sidebarUtils';

interface SidebarShapesTabProps {
  onAddElement: (element: DesignElement) => void;
}

export const SidebarShapesTab: React.FC<SidebarShapesTabProps> = ({ onAddElement }) => {
  const shapes = [
    {
      id: 'rect',
      name: 'Kotak / Card',
      icon: Square,
      action: () =>
        onAddElement(
          createBaseElement('rect', 'Persegi Panjang', 240, 160, {
            fill: '#1e293b',
            borderRadius: 12,
            shadow: 'sm',
          })
        ),
    },
    {
      id: 'circle',
      name: 'Lingkaran',
      icon: Circle,
      action: () =>
        onAddElement(
          createBaseElement('circle', 'Lingkaran', 140, 140, {
            fill: '#312e81',
            borderRadius: 9999,
          })
        ),
    },
    {
      id: 'line',
      name: 'Garis Pembatas',
      icon: Minus,
      action: () =>
        onAddElement(
          createBaseElement('line', 'Garis Pembatas', 400, 4, {
            fill: '#475569',
          })
        ),
    },
    {
      id: 'triangle',
      name: 'Segitiga',
      icon: Triangle,
      action: () =>
        onAddElement(
          createBaseElement('triangle', 'Segitiga Vektor', 120, 120, {
            fill: '#6366f1',
          })
        ),
    },
    {
      id: 'star',
      name: 'Bintang',
      icon: Star,
      action: () =>
        onAddElement(
          createBaseElement('star', 'Bintang Vektor', 120, 120, {
            fill: '#f59e0b',
          })
        ),
    },
    {
      id: 'arrow',
      name: 'Panah Arah',
      icon: MoveRight,
      action: () =>
        onAddElement(
          createBaseElement('arrow', 'Panah Vektor', 160, 60, {
            fill: '#06b6d4',
          })
        ),
    },
    {
      id: 'hexagon',
      name: 'Hexagon',
      icon: Hexagon,
      action: () =>
        onAddElement(
          createBaseElement('hexagon', 'Segi Enam (Hexagon)', 140, 130, {
            fill: '#8b5cf6',
          })
        ),
    },
    {
      id: 'heart',
      name: 'Hati (Heart)',
      icon: Heart,
      action: () =>
        onAddElement(
          createBaseElement('heart', 'Hati (Heart)', 120, 110, {
            fill: '#f43f5e',
          })
        ),
    },
    {
      id: 'diamond',
      name: 'Diamond',
      icon: Diamond,
      action: () =>
        onAddElement(
          createBaseElement('diamond', 'Belah Ketupat', 120, 120, {
            fill: '#06b6d4',
          })
        ),
    },
    {
      id: 'speech-bubble',
      name: 'Callout Balon',
      icon: MessageSquare,
      action: () =>
        onAddElement(
          createBaseElement('speech-bubble', 'Gelembung Pesan', 220, 130, {
            content: 'Gagas ide Anda di sini!',
            fill: '#1e293b',
            stroke: '#475569',
            strokeWidth: 1.5,
          })
        ),
    },
  ];

  return (
    <div className="space-y-3">
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
        Bentuk Vektor Dasar
      </span>
      <div className="grid grid-cols-2 gap-1.5">
        {shapes.map((sh) => (
          <button
            key={sh.id}
            onClick={sh.action}
            className="p-2 bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl flex items-center gap-2.5 transition-all text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/40 group-hover:bg-indigo-950/20 transition-colors shrink-0">
              <sh.icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">
              {sh.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
