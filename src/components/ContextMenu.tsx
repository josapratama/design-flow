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
} from 'lucide-react';
import { DesignElement } from '../types';

interface ContextMenuProps {
  x: number;
  y: number;
  element: DesignElement | null;
  onClose: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onReorder: (direction: 'front' | 'back' | 'up' | 'down') => void;
  onToggleLock: (elementId: string) => void;
  onDelete: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  element,
  onClose,
  onCopy,
  onPaste,
  onDuplicate,
  onReorder,
  onToggleLock,
  onDelete,
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
  const menuWidth = 200;
  const menuHeight = 260;
  const safeX = Math.min(x, window.innerWidth - menuWidth - 10);
  const safeY = Math.min(y, window.innerHeight - menuHeight - 10);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-52 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 text-xs text-slate-200 select-none animate-in fade-in-50 zoom-in-95 duration-100"
      style={{ left: `${safeX}px`, top: `${safeY}px` }}
    >
      {element ? (
        <>
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800 truncate">
            {element.name || element.type}
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
      )}
    </div>
  );
};
