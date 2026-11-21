import React, { useEffect, useRef } from 'react';
import {
  Copy,
  ClipboardPaste,
  Files,
  BringToFront,
  SendToBack,
  Lock,
  Unlock,
  Trash2,
  Boxes,
  CheckSquare,
  Command,
  PlusCircle,
  CopyPlus,
  Shield,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from 'lucide-react';
import { DesignElement } from '../types';

interface ContextMenuProps {
  x: number;
  y: number;
  element: DesignElement | null;
  selectedCount?: number;
  onClose: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onGroup?: () => void;
  onUngroup?: () => void;
  onReorder: (direction: 'front' | 'back' | 'up' | 'down') => void;
  onToggleLock: (elementId: string) => void;
  onDelete: () => void;
  onSelectAll?: () => void;
  onOpenCommandPalette?: () => void;
  onAddSlide?: () => void;
  onDuplicateSlide?: () => void;
  onToggleSafeMargin?: () => void;
  onAlign?: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  element,
  selectedCount = 1,
  onClose,
  onCopy,
  onPaste,
  onDuplicate,
  onGroup,
  onUngroup,
  onReorder,
  onToggleLock,
  onDelete,
  onSelectAll,
  onOpenCommandPalette,
  onAddSlide,
  onDuplicateSlide,
  onToggleSafeMargin,
  onAlign,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('contextmenu', handleOutsideClick);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('contextmenu', handleOutsideClick);
    };
  }, [onClose]);

  // Adjust menu position to keep within screen
  const menuWidth = 220;
  const menuHeight = selectedCount >= 2 ? 380 : element ? 280 : 220;
  const safeX = Math.min(x, window.innerWidth - menuWidth - 10);
  const safeY = Math.min(y, window.innerHeight - menuHeight - 10);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-56 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 text-xs text-slate-200 select-none animate-in fade-in-50 zoom-in-95 duration-100"
      style={{ left: `${safeX}px`, top: `${safeY}px` }}
    >
      {element ? (
        <>
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800 truncate">
            {selectedCount >= 2 ? `${selectedCount} Elemen Terpilih` : element.name || element.type}
          </div>

          <button
            onClick={() => {
              onCopy();
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
              <span>Salin Elemen</span>
            </span>
            <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+C</kbd>
          </button>

          <button
            onClick={() => {
              onDuplicate();
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <Files className="w-3.5 h-3.5 text-indigo-400" />
              <span>Duplikat</span>
            </span>
            <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+D</kbd>
          </button>

          {/* Grouping / Ungrouping */}
          {selectedCount >= 2 && onGroup && (
            <button
              onClick={() => {
                onGroup();
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kelompokkan Elemen</span>
              </span>
              <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+G</kbd>
            </button>
          )}

          {element.groupId && onUngroup && (
            <button
              onClick={() => {
                onUngroup();
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Boxes className="w-3.5 h-3.5 text-amber-400" />
                <span>Pisahkan Grup</span>
              </span>
              <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+Shift+G</kbd>
            </button>
          )}

          {/* Multi-Element Alignment Quick Sub-actions */}
          {selectedCount >= 2 && onAlign && (
            <>
              <div className="my-1 border-t border-slate-800" />
              <div className="px-3 py-1 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                Perataan ({selectedCount} Elemen)
              </div>
              <div className="px-3 py-1 grid grid-cols-6 gap-1">
                <button
                  onClick={() => { onAlign('left'); onClose(); }}
                  title="Rata Kiri"
                  className="p-1.5 hover:bg-slate-800 rounded flex justify-center text-slate-400 hover:text-white"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { onAlign('center'); onClose(); }}
                  title="Rata Tengah Horisontal"
                  className="p-1.5 hover:bg-slate-800 rounded flex justify-center text-slate-400 hover:text-white"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { onAlign('right'); onClose(); }}
                  title="Rata Kanan"
                  className="p-1.5 hover:bg-slate-800 rounded flex justify-center text-slate-400 hover:text-white"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { onAlign('top'); onClose(); }}
                  title="Rata Atas"
                  className="p-1.5 hover:bg-slate-800 rounded flex justify-center text-slate-400 hover:text-white"
                >
                  <AlignStartVertical className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { onAlign('middle'); onClose(); }}
                  title="Rata Tengah Vertikal"
                  className="p-1.5 hover:bg-slate-800 rounded flex justify-center text-slate-400 hover:text-white"
                >
                  <AlignCenterVertical className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { onAlign('bottom'); onClose(); }}
                  title="Rata Bawah"
                  className="p-1.5 hover:bg-slate-800 rounded flex justify-center text-slate-400 hover:text-white"
                >
                  <AlignEndVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}

          <div className="my-1 border-t border-slate-800" />

          <button
            onClick={() => {
              onReorder('front');
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <BringToFront className="w-3.5 h-3.5 text-sky-400" />
            <span>Bawa ke Paling Depan</span>
          </button>

          <button
            onClick={() => {
              onReorder('back');
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <SendToBack className="w-3.5 h-3.5 text-sky-400" />
            <span>Kirim ke Paling Belakang</span>
          </button>

          <button
            onClick={() => {
              onToggleLock(element.id);
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {element.locked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-amber-400" />
                <span>Buka Kunci</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Kunci Elemen</span>
              </>
            )}
          </button>

          <div className="my-1 border-t border-slate-800" />

          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-rose-500/20 text-rose-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Elemen</span>
            </span>
            <kbd className="text-[10px] text-rose-500 font-mono">Del</kbd>
          </button>
        </>
      ) : (
        <>
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800">
            Kanvas & Slide
          </div>

          <button
            onClick={() => {
              onPaste();
              onClose();
            }}
            className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ClipboardPaste className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tempel di Sini</span>
            </span>
            <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+V</kbd>
          </button>

          {onSelectAll && (
            <button
              onClick={() => {
                onSelectAll();
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pilih Semua Elemen</span>
              </span>
              <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+A</kbd>
            </button>
          )}

          {onOpenCommandPalette && (
            <button
              onClick={() => {
                onOpenCommandPalette();
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Command className="w-3.5 h-3.5 text-purple-400" />
                <span>Spotlight Command</span>
              </span>
              <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+K</kbd>
            </button>
          )}

          <div className="my-1 border-t border-slate-800" />

          {onAddSlide && (
            <button
              onClick={() => {
                onAddSlide();
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Tambah Slide Baru</span>
            </button>
          )}

          {onDuplicateSlide && (
            <button
              onClick={() => {
                onDuplicateSlide();
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <CopyPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Duplikat Slide Ini</span>
            </button>
          )}

          {onToggleSafeMargin && (
            <button
              onClick={() => {
                onToggleSafeMargin();
                onClose();
              }}
              className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Batas Area Aman</span>
              </span>
              <kbd className="text-[10px] text-slate-500 font-mono">Shift+M</kbd>
            </button>
          )}
        </>
      )}
    </div>
  );
};
