import React, { useState } from 'react';
import {
  QrCode,
  BarChart3,
  Table2,
  FileSpreadsheet,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { DesignElement } from '../../../types';

interface SpecialComponentsSectionProps {
  element: DesignElement;
  handleChange: (field: keyof DesignElement, val: any) => void;
  showIconPicker: boolean;
  setShowIconPicker: (show: boolean) => void;
  iconFilter: string;
  setIconFilter: (filter: string) => void;
  filteredIcons: string[];
}

export const SpecialComponentsSection: React.FC<SpecialComponentsSectionProps> = ({
  element,
  handleChange,
  showIconPicker,
  setShowIconPicker,
  iconFilter,
  setIconFilter,
  filteredIcons,
}) => {
  const [csvRawInput, setCsvRawInput] = useState('');
  const [showCsvImporter, setShowCsvImporter] = useState(false);

  const handleApplyChartCsv = (raw: string) => {
    const lines = raw
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);
    const parsed: { label: string; value: number }[] = [];

    for (const line of lines) {
      const parts = line.includes('\t')
        ? line.split('\t')
        : line.includes(';')
        ? line.split(';')
        : line.includes('|')
        ? line.split('|')
        : line.split(',');
      if (parts.length >= 2) {
        const label = parts[0].trim();
        const num = parseFloat(parts[1].replace(/[^0-9.-]/g, ''));
        if (label && !isNaN(num)) {
          parsed.push({ label, value: num });
        }
      }
    }

    if (parsed.length > 0) {
      handleChange('chartData', parsed);
      setCsvRawInput('');
      setShowCsvImporter(false);
    }
  };

  const handleApplyTableCsv = (raw: string) => {
    const lines = raw
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return;

    const formattedRows = lines.map(line => {
      const cells = line.includes('\t')
        ? line.split('\t')
        : line.includes(';')
        ? line.split(';')
        : line.includes('|')
        ? line.split('|')
        : line.split(',');
      return cells.map(c => c.trim()).join(' | ');
    });

    handleChange('content', formattedRows.join('\n'));
    setCsvRawInput('');
    setShowCsvImporter(false);
  };

  const handleCsvFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: 'chart' | 'table'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      if (text) {
        if (mode === 'chart') handleApplyChartCsv(text);
        else handleApplyTableCsv(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Pengaturan Khusus Grafik Data (Chart) + CSV / Spreadsheet Importer */}
      {element.type === 'chart' && (() => {
        const currentData = element.chartData || [
          { label: 'Q1', value: 45 },
          { label: 'Q2', value: 78 },
          { label: 'Q3', value: 55 },
          { label: 'Q4', value: 92 },
        ];
        return (
          <div className="space-y-2.5 p-3 bg-slate-950/80 border border-indigo-500/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-400">
                <BarChart3 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Data & Tipe Grafik
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCsvImporter(!showCsvImporter)}
                className="px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>{showCsvImporter ? 'Tutup CSV' : 'Impor CSV'}</span>
              </button>
            </div>

            {/* Chart Type Selector */}
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'bar', label: 'Bar' },
                { id: 'line', label: 'Line' },
                { id: 'donut', label: 'Donut' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleChange('chartType', t.id)}
                  className={`py-1 rounded text-[10px] font-semibold border transition-all ${
                    (element.chartType || 'bar') === t.id
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* CSV / Excel Paste Importer */}
            {showCsvImporter && (
              <div className="p-2.5 rounded-lg bg-slate-900 border border-indigo-500/40 space-y-2 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-indigo-300">
                    Paste CSV / Excel (Label, Nilai)
                  </span>
                  <label className="text-[10px] text-cyan-400 hover:underline cursor-pointer flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    <span>File .csv</span>
                    <input
                      type="file"
                      accept=".csv,.txt,.tsv"
                      className="hidden"
                      onChange={e => handleCsvFileUpload(e, 'chart')}
                    />
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={csvRawInput}
                  onChange={e => setCsvRawInput(e.target.value)}
                  placeholder={`Januari, 65\nFebruari, 82\nMaret, 94`}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] font-mono text-slate-200 outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleApplyChartCsv(csvRawInput)}
                  className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold transition-colors"
                >
                  Terapkan Data CSV ke Grafik
                </button>
              </div>
            )}

            {/* Interactive Data Rows */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
              {currentData.map((row, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={row.label}
                    onChange={e => {
                      const next = currentData.map((r, i) =>
                        i === idx ? { ...r, label: e.target.value } : r
                      );
                      handleChange('chartData', next);
                    }}
                    placeholder="Label"
                    className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 outline-none focus:border-indigo-500"
                  />
                  <input
                    type="number"
                    value={row.value}
                    onChange={e => {
                      const next = currentData.map((r, i) =>
                        i === idx ? { ...r, value: Number(e.target.value) || 0 } : r
                      );
                      handleChange('chartData', next);
                    }}
                    className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-indigo-300 outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    disabled={currentData.length <= 2}
                    onClick={() => {
                      handleChange(
                        'chartData',
                        currentData.filter((_, i) => i !== idx)
                      );
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-25"
                    title="Hapus baris"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                handleChange('chartData', [
                  ...currentData,
                  { label: `Data ${currentData.length + 1}`, value: 50 },
                ])
              }
              className="w-full py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3 text-indigo-400" />
              <span>Tambah Baris Data</span>
            </button>
          </div>
        );
      })()}

      {/* Pengaturan Khusus Tabel Data + CSV / Spreadsheet Importer */}
      {element.type === 'table' && (
        <div className="space-y-2.5 p-3 bg-slate-950/80 border border-emerald-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Table2 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Impor & Format Tabel
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowCsvImporter(!showCsvImporter)}
              className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold flex items-center gap-1 transition-colors"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>{showCsvImporter ? 'Tutup CSV' : 'Impor CSV / Excel'}</span>
            </button>
          </div>

          {showCsvImporter && (
            <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/40 space-y-2 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-emerald-300">
                  Paste CSV atau Copy-Paste Sel Excel
                </span>
                <label className="text-[10px] text-cyan-400 hover:underline cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>File .csv</span>
                  <input
                    type="file"
                    accept=".csv,.txt,.tsv"
                    className="hidden"
                    onChange={e => handleCsvFileUpload(e, 'table')}
                  />
                </label>
              </div>
              <textarea
                rows={4}
                value={csvRawInput}
                onChange={e => setCsvRawInput(e.target.value)}
                placeholder={`Metrik, Target, Realisasi, Status\nAkurasi, 95%, 99.4%, Tercapai\nLatensi, 20ms, 11ms, Optimal`}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-[11px] font-mono text-slate-200 outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleApplyTableCsv(csvRawInput)}
                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-colors"
              >
                Konversi CSV ke Tabel
              </button>
            </div>
          )}
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Pisahkan kolom dengan tanda <code className="text-emerald-300 font-mono">|</code> pada kolom Teks Utama di bawah, atau gunakan fitur Impor CSV di atas.
          </p>
        </div>
      )}

      {/* Pengaturan Khusus QR Code Interaktif */}
      {element.type === 'qr-code' && (
        <div className="space-y-2.5 p-3 bg-slate-950/70 border border-indigo-500/30 rounded-xl">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <QrCode className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Pengaturan QR Code Vektor (Offline)
            </span>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Tautan Web / URL Tujuan</label>
            <input
              type="url"
              value={element.content || ''}
              onChange={e => handleChange('content', e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-indigo-300 font-mono outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Label / Keterangan di Bawah</label>
            <input
              type="text"
              value={element.subTitle || ''}
              onChange={e => handleChange('subTitle', e.target.value)}
              placeholder="Pindai untuk Unduh Materi"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Pengaturan Khusus Progress Bar */}
      {element.type === 'progress-bar' && (
        <div className="space-y-2.5 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider block">
            Pengaturan Progress Bar
          </span>
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span>Nilai Capaian</span>
              <span className="font-mono font-bold text-teal-400">{element.content || '75'}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={parseInt(element.content || '75', 10) || 75}
              onChange={e => handleChange('content', e.target.value)}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Judul Indikator</label>
            <input
              type="text"
              value={element.subTitle || ''}
              onChange={e => handleChange('subTitle', e.target.value)}
              placeholder="Contoh: Realisasi Target Evaluasi"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-teal-500"
            />
          </div>
        </div>
      )}

      {/* Pengaturan Khusus Rating Bintang */}
      {element.type === 'rating' && (
        <div className="space-y-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
            Pengaturan Rating Bintang
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Nilai Skor</label>
              <input
                type="text"
                value={element.content || '4.9'}
                onChange={e => handleChange('content', e.target.value)}
                placeholder="4.9"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-amber-400 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Label Ulasan</label>
              <input
                type="text"
                value={element.subTitle || '(2.8k Ulasan)'}
                onChange={e => handleChange('subTitle', e.target.value)}
                placeholder="(2.8k Ulasan)"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Pengaturan Khusus Alert Banner */}
      {element.type === 'alert-box' && (
        <div className="space-y-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block">
            Pengaturan Alert Banner
          </span>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Tipe / Varian</label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'primary', label: 'Info' },
                { id: 'success', label: 'Sukses' },
                { id: 'warning', label: 'Peringatan' },
                { id: 'danger', label: 'Bahaya' },
              ].map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleChange('variant', v.id)}
                  className={`py-1 rounded text-[10px] font-medium border transition-all ${
                    (element.variant || 'warning') === v.id
                      ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pengaturan Khusus Gambar Media */}
      {element.type === 'image' && (
        <div className="space-y-2.5 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider block">
            Pengaturan Media Gambar
          </span>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">URL Gambar</label>
            <input
              type="url"
              value={element.imageUrl || ''}
              onChange={e => handleChange('imageUrl', e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-purple-500 font-mono"
            />
          </div>
        </div>
      )}

      {/* Pengaturan Ikon Lucide Vector */}
      {element.type === 'icon' && (
        <div className="space-y-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
              Pilih Ikon Vektor ({element.iconName || element.content || 'Sparkles'})
            </span>
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="text-[10px] text-indigo-400 hover:underline font-semibold"
            >
              {showIconPicker ? 'Tutup Pustaka' : 'Ganti Ikon'}
            </button>
          </div>

          {showIconPicker && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                placeholder="Cari ikon (heart, star, user)..."
                value={iconFilter}
                onChange={e => setIconFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-500"
              />
              <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto p-1 bg-slate-950 rounded border border-slate-800/80">
                {filteredIcons.map(name => {
                  const Icon = (LucideIcons as any)[name];
                  if (!Icon) return null;
                  const isSelected = (element.iconName || element.content) === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        handleChange('iconName', name);
                        handleChange('content', name);
                        setShowIconPicker(false);
                      }}
                      title={name}
                      className={`p-1.5 rounded flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
