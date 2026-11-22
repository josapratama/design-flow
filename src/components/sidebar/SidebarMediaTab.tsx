import React, { useState } from 'react';
import { Upload, Link, Search, Sparkles } from 'lucide-react';
import { DesignElement } from '../../types';
import { createBaseElement } from './sidebarUtils';
import { SAMPLE_STOCK_PHOTOS } from './stockPhotos';

interface SidebarMediaTabProps {
  onAddElement: (element: DesignElement) => void;
}

export const SidebarMediaTab: React.FC<SidebarMediaTabProps> = ({ onAddElement }) => {
  const [mediaCategory, setMediaCategory] = useState<'all' | 'tech' | 'business' | 'arch' | 'nature' | 'people' | 'abstract'>('all');
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [directImageUrl, setDirectImageUrl] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        onAddElement(
          createBaseElement('image', file.name.replace(/\.[^/.]+$/, ''), 420, 280, {
            imageUrl: dataUrl,
            borderRadius: 16,
          })
        );
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Unggah Media & Foto
        </span>

        {/* File Upload Trigger */}
        <label className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-950/80 group">
          <Upload className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform mb-1.5" />
          <span className="text-xs font-semibold text-slate-200">Unggah Gambar Lokal</span>
          <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP, SVG</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Direct Image URL Inserter */}
      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
        <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
          <Link className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sisipkan dari URL Web</span>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="url"
            placeholder="https://images.unsplash.com/photo..."
            value={directImageUrl}
            onChange={e => setDirectImageUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && directImageUrl.trim()) {
                onAddElement(
                  createBaseElement('image', 'Gambar Web', 400, 260, {
                    imageUrl: directImageUrl.trim(),
                    borderRadius: 12,
                    shadow: 'md',
                  })
                );
                setDirectImageUrl('');
              }
            }}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
          />
          <button
            type="button"
            disabled={!directImageUrl.trim()}
            onClick={() => {
              if (!directImageUrl.trim()) return;
              onAddElement(
                createBaseElement('image', 'Gambar Web', 400, 260, {
                  imageUrl: directImageUrl.trim(),
                  borderRadius: 12,
                  shadow: 'md',
                })
              );
              setDirectImageUrl('');
            }}
            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-semibold shrink-0 transition-colors"
          >
            Sisipkan
          </button>
        </div>
      </div>

      {/* Preset Stock Photos with Live Search & Category Chips */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Foto Stok Bebas Royalti
          </span>
          <span className="text-[9px] text-indigo-400 font-mono">Unsplash HD</span>
        </div>

        {/* Stock Photo Live Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari foto (kopi, tech, neon)..."
            value={stockSearchQuery}
            onChange={e => setStockSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500 font-medium"
          />
          {stockSearchQuery && (
            <button
              type="button"
              onClick={() => setStockSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'tech', label: 'Teknologi' },
            { id: 'business', label: 'Bisnis' },
            { id: 'arch', label: 'Arsitektur' },
            { id: 'nature', label: 'Alam' },
            { id: 'people', label: 'Tim' },
            { id: 'abstract', label: 'Abstrak' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setMediaCategory(cat.id as any)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 transition-all ${
                mediaCategory === cat.id
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Dynamic Search Button if Query Present */}
        {stockSearchQuery.trim() && (
          <button
            type="button"
            onClick={() => {
              const query = encodeURIComponent(stockSearchQuery.trim());
              onAddElement(
                createBaseElement('image', `Unsplash: ${stockSearchQuery.trim()}`, 400, 260, {
                  imageUrl: `https://images.unsplash.com/featured/800x600/?${query}&auto=format&fit=crop&q=80`,
                  borderRadius: 12,
                  shadow: 'md',
                })
              );
            }}
            className="w-full py-1.5 px-2 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-700/60 rounded-lg text-indigo-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Sisipkan Foto Unsplash "{stockSearchQuery}"</span>
          </button>
        )}

        {/* Photo Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
          {SAMPLE_STOCK_PHOTOS
            .filter(p => {
              const matchesCategory = mediaCategory === 'all' || p.category === mediaCategory;
              if (!matchesCategory) return false;
              if (!stockSearchQuery.trim()) return true;
              const q = stockSearchQuery.toLowerCase();
              return (
                p.title.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
              );
            })
            .map((photo, i) => (
              <button
                key={i}
                onClick={() =>
                  onAddElement(
                    createBaseElement('image', photo.title, 360, 240, {
                      imageUrl: photo.url,
                      borderRadius: 12,
                      shadow: 'md',
                    })
                  )
                }
                className="group relative rounded-lg overflow-hidden border border-slate-800 hover:border-indigo-500 text-left transition-all aspect-video"
              >
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                  <span className="text-[9px] font-medium text-white truncate">
                    {photo.title}
                  </span>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};
