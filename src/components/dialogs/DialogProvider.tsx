import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { AlertTriangle, CheckCircle2, Info, HelpCircle, X } from 'lucide-react';

export type DialogVariant = 'danger' | 'warning' | 'info' | 'success';

export interface DialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
}

interface DialogContextValue {
  confirm: (options: DialogOptions | string) => Promise<boolean>;
  alert: (options: DialogOptions | string) => Promise<void>;
  showToast: (message: string, duration?: number) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeDialog, setActiveDialog] = useState<{
    isOpen: boolean;
    isConfirm: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    variant: DialogVariant;
    resolve: (val: any) => void;
  } | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = useCallback((msg: string, duration = 3000) => {
    setToast(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  const confirm = useCallback((options: DialogOptions | string): Promise<boolean> => {
    return new Promise(resolve => {
      const opts = typeof options === 'string' ? { message: options } : options;
      setActiveDialog({
        isOpen: true,
        isConfirm: true,
        title: opts.title || 'Konfirmasi',
        message: opts.message,
        confirmText: opts.confirmText || 'Ya, Lanjutkan',
        cancelText: opts.cancelText || 'Batal',
        variant: opts.variant || 'warning',
        resolve,
      });
    });
  }, []);

  const alert = useCallback((options: DialogOptions | string): Promise<void> => {
    return new Promise(resolve => {
      const opts = typeof options === 'string' ? { message: options } : options;
      setActiveDialog({
        isOpen: true,
        isConfirm: false,
        title: opts.title || 'Pemberitahuan',
        message: opts.message,
        confirmText: opts.confirmText || 'Mengerti',
        cancelText: '',
        variant: opts.variant || 'info',
        resolve,
      });
    });
  }, []);

  const handleClose = (result: boolean) => {
    if (activeDialog) {
      activeDialog.resolve(result);
      setActiveDialog(null);
    }
  };

  return (
    <DialogContext.Provider value={{ confirm, alert, showToast }}>
      {children}

      {/* Floating Modern Modal Dialog (Generous padding: NEVER touches screen edges) */}
      {activeDialog && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in duration-200 select-none overflow-y-auto"
          onClick={() => handleClose(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95 duration-150 my-auto relative max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            {/* Header Icon + Title */}
            <div className="flex items-start gap-3.5">
              <div
                className={`p-3 rounded-2xl shrink-0 ${
                  activeDialog.variant === 'danger'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : activeDialog.variant === 'warning'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : activeDialog.variant === 'success'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                }`}
              >
                {activeDialog.variant === 'danger' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : activeDialog.variant === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : activeDialog.variant === 'success' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : activeDialog.isConfirm ? (
                  <HelpCircle className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="text-base font-bold text-white leading-snug">{activeDialog.title}</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed whitespace-pre-wrap font-sans">
                  {activeDialog.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleClose(false)}
                className="p-1 hover:bg-slate-800 text-slate-500 hover:text-white rounded-lg transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
              {activeDialog.isConfirm && (
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  {activeDialog.cancelText}
                </button>
              )}
              <button
                type="button"
                autoFocus
                onClick={() => handleClose(true)}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg ${
                  activeDialog.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    : activeDialog.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                    : activeDialog.variant === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
              >
                {activeDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[120] px-4 py-2.5 bg-slate-900/95 border border-indigo-500/50 text-white rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>{toast}</span>
        </div>
      )}
    </DialogContext.Provider>
  );
};

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
