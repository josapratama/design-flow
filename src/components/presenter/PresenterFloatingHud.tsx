import React from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, PartyPopper, Smile, HelpCircle, BarChart3 } from 'lucide-react';

interface PresenterFloatingHudProps {
  isHidden: boolean;
  currentIndex: number;
  totalSlides: number;
  goToPrev: () => void;
  goToNext: () => void;
  showSlideNavigator: boolean;
  setShowSlideNavigator: React.Dispatch<React.SetStateAction<boolean>>;
  triggerCelebration: () => void;
  showReactionMenu: boolean;
  setShowReactionMenu: (show: boolean) => void;
  reactionMenuRef: React.RefObject<HTMLDivElement | null>;
  onSendReaction: (emoji: string) => void;
  setShowHelpOverlay: (show: boolean) => void;
  isPollOpen: boolean;
  onTogglePoll: () => void;
}

export const PresenterFloatingHud: React.FC<PresenterFloatingHudProps> = ({
  isHidden,
  currentIndex,
  totalSlides,
  goToPrev,
  goToNext,
  showSlideNavigator,
  setShowSlideNavigator,
  triggerCelebration,
  showReactionMenu,
  setShowReactionMenu,
  reactionMenuRef,
  onSendReaction,
  setShowHelpOverlay,
  isPollOpen,
  onTogglePoll,
}) => {
  return (
    <div
      className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-2xl backdrop-blur-xl z-30 transition-opacity duration-300 ${
        isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <button
        onClick={goToPrev}
        disabled={currentIndex === 0}
        title="Slide Sebelumnya (← / Panah Kiri)"
        className="p-1.5 hover:bg-slate-800 disabled:opacity-25 rounded-xl text-slate-300 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => setShowSlideNavigator(prev => !prev)}
        title="Buka Kisi Miniatur Slide untuk Melompat Cepat (G)"
        className={`text-xs font-mono font-medium px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1.5 ${
          showSlideNavigator
            ? 'bg-indigo-600 text-white font-bold shadow'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
        <span>
          {currentIndex + 1} / {totalSlides}
        </span>
      </button>
      <button
        onClick={goToNext}
        disabled={currentIndex === totalSlides - 1}
        title="Slide Selanjutnya (Spasi / Panah Kanan)"
        className="p-1.5 hover:bg-slate-800 disabled:opacity-25 rounded-xl text-slate-300 hover:text-white transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />

      {/* Live Poll Toggle Button */}
      <button
        onClick={onTogglePoll}
        title="Live Interactive Poll & Voting Audiens (V)"
        className={`p-1.5 rounded-xl transition-colors ${
          isPollOpen
            ? 'bg-indigo-600 text-white shadow'
            : 'hover:bg-slate-800 text-emerald-400 hover:text-emerald-300'
        }`}
      >
        <BarChart3 className="w-4 h-4" />
      </button>

      {/* Confetti Celebration Button */}
      <button
        onClick={triggerCelebration}
        title="Tembakkan Selebrasi Confetti"
        className="p-1.5 hover:bg-slate-800 rounded-xl text-amber-400 hover:text-amber-300 transition-colors"
      >
        <PartyPopper className="w-4 h-4" />
      </button>

      {/* Audience Reaction Button with Popover */}
      <div ref={reactionMenuRef} className="relative">
        <button
          onClick={() => setShowReactionMenu(!showReactionMenu)}
          title="Kirim Reaksi Emotikon Audiens"
          className={`p-1.5 rounded-xl transition-colors ${
            showReactionMenu ? 'bg-slate-800 text-indigo-300' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Smile className="w-4 h-4" />
        </button>

        {showReactionMenu && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-40 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
            {['👏', '❤️', '🔥', '💡', '🚀'].map(emoji => (
              <button
                key={emoji}
                onClick={() => onSendReaction(emoji)}
                title={`Reaksi ${emoji}`}
                className="w-7 h-7 flex items-center justify-center text-sm hover:scale-125 transition-transform rounded-xl hover:bg-slate-800"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Helper Modal Button */}
      <button
        onClick={() => setShowHelpOverlay(true)}
        title="Buka Panduan Pintasan Tombol (? / H)"
        className="p-1.5 hover:bg-slate-800 rounded-xl text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </div>
  );
};
