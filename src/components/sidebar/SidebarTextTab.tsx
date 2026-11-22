import React from 'react';
import { Type, Quote } from 'lucide-react';
import { DesignElement } from '../../types';
import { createBaseElement } from './sidebarUtils';

interface SidebarTextTabProps {
  onAddElement: (element: DesignElement) => void;
}

export const SidebarTextTab: React.FC<SidebarTextTabProps> = ({ onAddElement }) => {
  return (
    <div className="space-y-3">
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        Tipografi
      </span>
      <div className="space-y-2">
        <button
          onClick={() =>
            onAddElement(
              createBaseElement('heading', 'Judul Utama', 600, 70, {
                content: 'Judul Presentasi Utama',
                fontSize: 48,
                fontWeight: 'bold',
                color: '#ffffff',
              })
            )
          }
          className="w-full text-left p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 transition-all flex items-center gap-3 group"
        >
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-200 text-sm">Judul Utama (H1)</div>
            <div className="text-[10px] text-slate-400">Teks tebal 48px</div>
          </div>
        </button>

        <button
          onClick={() =>
            onAddElement(
              createBaseElement('heading', 'Sub-Judul', 500, 50, {
                content: 'Sub-Judul / Topik Pembahasan',
                fontSize: 32,
                fontWeight: 'semibold',
                color: '#94a3b8',
              })
            )
          }
          className="w-full text-left p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 transition-all flex items-center gap-3 group"
        >
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200 text-xs">Sub-Judul (H2)</div>
            <div className="text-[10px] text-slate-400">Teks 32px slate</div>
          </div>
        </button>

        <button
          onClick={() =>
            onAddElement(
              createBaseElement('text', 'Paragraf Teks', 500, 90, {
                content:
                  'Deskripsi penjelasan naskah secara komprehensif dengan tata bahasa akademik yang lugas dan terstruktur.',
                fontSize: 18,
                color: '#cbd5e1',
              })
            )
          }
          className="w-full text-left p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 transition-all flex items-center gap-3 group"
        >
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-slate-200 text-xs">Paragraf Standar</div>
            <div className="text-[10px] text-slate-400">Ukuran 18px paragraf naskah</div>
          </div>
        </button>

        <button
          onClick={() =>
            onAddElement(
              createBaseElement('quote', 'Kutipan Inspiratif', 520, 110, {
                content: 'Inovasi membedakan antara seorang pemimpin dan pengikut.',
                subTitle: 'Steve Jobs — Pendiri Apple',
                fontSize: 22,
                color: '#e2e8f0',
              })
            )
          }
          className="w-full text-left p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 transition-all flex items-center gap-3 group"
        >
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
            <Quote className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-200 text-xs">Kutipan / Blockquote</div>
            <div className="text-[10px] text-slate-400">Garis aksen, italic & tokoh</div>
          </div>
        </button>
      </div>
    </div>
  );
};
