import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DesignElement } from '../../types';
import { SMART_BLOCKS } from '../../templates/smart-blocks';
import { createBaseElement } from './sidebarUtils';

interface SidebarSmartBlocksTabProps {
  onAddElement: (element: DesignElement) => void;
  onAddElements: (elements: DesignElement[]) => void;
}

export const SidebarSmartBlocksTab: React.FC<SidebarSmartBlocksTabProps> = ({
  onAddElement,
  onAddElements,
}) => {
  const [aiTopic, setAiTopic] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleGenerateFromTopic = () => {
    if (!aiTopic.trim()) return;
    setIsAiGenerating(true);
    const topic = aiTopic.trim();

    const elements: DesignElement[] = [
      createBaseElement('text', 'Topik Tag', 240, 32, {
        x: 120,
        y: 120,
        content: 'IKHTISAR RISET & STRATEGI',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#818cf8',
      }),
      createBaseElement('heading', 'Judul Slide', 1200, 70, {
        x: 120,
        y: 160,
        content: topic,
        fontSize: 44,
        fontWeight: 'extrabold',
        color: '#ffffff',
      }),
      createBaseElement('text', 'Deskripsi Topik', 900, 50, {
        x: 120,
        y: 235,
        content: `Analisis mendalam dan tinjauan komprehensif mengenai implementasi ${topic.toLowerCase()} untuk keunggulan operasional.`,
        fontSize: 18,
        color: '#94a3b8',
      }),
      createBaseElement('card', 'Pilar 1', 380, 220, {
        x: 120,
        y: 320,
        content: 'Fokus Utama 01\n\nOptimasi arsitektur sistem dan peningkatan efisiensi alur kerja data secara terukur.',
        fill: '#1e293b',
        stroke: '#4f46e5',
        strokeWidth: 1.5,
        borderRadius: 16,
        shadow: 'lg',
      }),
      createBaseElement('card', 'Pilar 2', 380, 220, {
        x: 530,
        y: 320,
        content: 'Fokus Utama 02\n\nIntegrasi model kecerdasan buatan dengan parameter adaptif dan keandalan tinggi.',
        fill: '#1e293b',
        stroke: '#06b6d4',
        strokeWidth: 1.5,
        borderRadius: 16,
        shadow: 'lg',
      }),
      createBaseElement('card', 'Pilar 3', 380, 220, {
        x: 940,
        y: 320,
        content: 'Fokus Utama 03\n\nValidasi empiris hasil evaluasi komparatif terhadap metrik standar industri.',
        fill: '#1e293b',
        stroke: '#10b981',
        strokeWidth: 1.5,
        borderRadius: 16,
        shadow: 'lg',
      }),
      createBaseElement('metric-card', 'Metrik Utama', 240, 100, {
        x: 120,
        y: 570,
        content: '99.2%',
        subTitle: 'Reliability Index',
        fill: '#0f172a',
        color: '#38bdf8',
        borderRadius: 12,
      }),
      createBaseElement('button', 'Tombol Aksi', 220, 50, {
        x: 390,
        y: 595,
        content: 'Pelajari Selengkapnya →',
        fill: '#4f46e5',
        color: '#ffffff',
        borderRadius: 12,
        shadow: 'md',
      }),
    ];

    onAddElements(elements);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setIsAiGenerating(false);
    setAiTopic('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 text-amber-400">
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-bold text-slate-100">AI Slide Drafter</span>
      </div>

      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <label className="text-[10px] text-slate-400 font-medium block">
          Tulis topik atau judul presentasi:
        </label>
        <textarea
          rows={2}
          value={aiTopic}
          onChange={e => setAiTopic(e.target.value)}
          placeholder="cth: 'Arsitektur Microservices & Kubernetes', 'Pitch Deck Fintech Syariah'..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-indigo-500 resize-none font-medium"
        />
        <button
          onClick={handleGenerateFromTopic}
          disabled={!aiTopic.trim() || isAiGenerating}
          className="w-full py-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAiGenerating ? 'Menyusun Layout...' : 'Susun Slide dengan AI'}</span>
        </button>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-800">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
          Pustaka Blok Desain Cepat
        </span>
        <div className="space-y-2">
          {SMART_BLOCKS.map(block => (
            <button
              key={block.id}
              onClick={() => {
                const generated = block.generateElements(120, 120);
                onAddElements(generated);
                confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
              }}
              className="w-full p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 text-xs group-hover:text-white">
                  {block.name}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-400 border border-indigo-500/20 font-mono">
                  Smart Block
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                {block.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
