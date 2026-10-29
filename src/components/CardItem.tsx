import React from 'react';
import { Volume2, Maximize2, Trash2, Mic, Plus, Edit3 } from 'lucide-react';
import { FlashCard } from '../types/card';
import { soundFX } from '../utils/soundEffects';

interface CardItemProps {
  card: FlashCard;
  isSpeaking: boolean;
  onSpeak: (card: FlashCard) => void;
  onZoom: (card: FlashCard) => void;
  onEdit: (card: FlashCard) => void;
  onDelete?: (id: string) => void;
  onAddToSentence?: (card: FlashCard) => void;
  teacherMode: boolean;
  sentenceModeActive: boolean;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  isSpeaking,
  onSpeak,
  onZoom,
  onEdit,
  onDelete,
  onAddToSentence,
  teacherMode,
  sentenceModeActive,
}) => {
  const borderColor = card.colorTheme || '#f59e0b';

  const handleCardClick = () => {
    soundFX.playPop();
    onSpeak(card);
    if (sentenceModeActive && onAddToSentence) {
      onAddToSentence(card);
    }
  };

  const handleZoomClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    onZoom(card);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    onEdit(card);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`'${card.word}' 카드를 삭제할까요?`)) {
      onDelete?.(card.id);
      soundFX.playPop();
    }
  };

  const handleAddSentenceOnly = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playPop();
    onAddToSentence?.(card);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white rounded-3xl overflow-hidden card-tactile cursor-pointer transition-all duration-200 select-none border-4 flex flex-col ${
        isSpeaking
          ? 'scale-105 ring-8 ring-amber-300 ring-offset-2 shadow-2xl -translate-y-2'
          : 'hover:-translate-y-1.5 hover:shadow-xl active:scale-95'
      }`}
      style={{
        borderColor: isSpeaking ? '#f59e0b' : borderColor,
      }}
      role="button"
      tabIndex={0}
      aria-label={`${card.word} 카드, 누르면 읽어줍니다`}
    >
      {/* Speaking Glow & Sound Wave Badge */}
      {isSpeaking && (
        <div className="absolute top-3 left-3 z-20 bg-amber-500 text-white font-jua text-xs py-1 px-2.5 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce">
          <Volume2 className="w-3.5 h-3.5 animate-pulse" />
          <span>말하는 중...</span>
        </div>
      )}

      {/* Teacher/Parent Recorded Audio Badge */}
      {card.recordedAudioUrl && !isSpeaking && (
        <div className="absolute top-3 left-3 z-20 bg-rose-500 text-white text-[11px] font-jua py-0.5 px-2 rounded-full shadow-md flex items-center gap-1">
          <Mic className="w-3 h-3" />
          <span>선생님 목소리</span>
        </div>
      )}

      {/* Teacher/Edit Mode Action Buttons (Edit & Delete) */}
      {teacherMode && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <button
            onClick={handleEditClick}
            className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-lg transition active:scale-90"
            title="카드 내용 수정"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition active:scale-90"
            title="카드 삭제"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Real Photograph Frame */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={card.imageUrl}
          alt={card.word}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isSpeaking ? 'scale-110' : 'group-hover:scale-105'
          }`}
        />
        {/* Subtle photo vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5 pointer-events-none" />

        {/* Zoom Button in Photo Corner */}
        <button
          onClick={handleZoomClick}
          className="absolute bottom-2.5 right-2.5 z-10 w-9 h-9 rounded-2xl bg-white/90 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition active:scale-90"
          title="크게 보기"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Add to Sentence Button when Sentence Mode is Active */}
        {sentenceModeActive && (
          <button
            onClick={handleAddSentenceOnly}
            className="absolute bottom-2.5 left-2.5 z-10 w-9 h-9 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md flex items-center justify-center transition active:scale-90"
            title="문장판에 담기"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        )}
      </div>

      {/* Word Banner with Big Friendly Typography */}
      <div
        className={`p-3.5 text-center flex-1 flex flex-col justify-center items-center transition-colors ${
          isSpeaking ? 'bg-amber-100' : 'bg-amber-50/40 group-hover:bg-amber-50'
        }`}
      >
        <span
          className={`font-jua text-2xl sm:text-3xl font-extrabold tracking-wide transition-colors ${
            isSpeaking ? 'text-amber-900 scale-105' : 'text-slate-800'
          }`}
        >
          {card.word}
        </span>
        
        {card.description && (
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 font-medium">
            {card.description}
          </p>
        )}

        {/* Cute Tap to Speak Prompt */}
        <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600/80 font-jua opacity-80 group-hover:opacity-100">
          <Volume2 className="w-3.5 h-3.5" />
          <span>눌러서 듣기</span>
        </div>
      </div>
    </div>
  );
};
