import React, { useState } from 'react';
import { X, Volume2, ChevronLeft, ChevronRight, Sparkles, Mic, Edit3, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FlashCard } from '../types/card';
import { speechEngine } from '../utils/speech';
import { soundFX } from '../utils/soundEffects';

interface CardModalProps {
  card: FlashCard | null;
  onClose: () => void;
  onEdit?: (card: FlashCard) => void;
  onDelete?: (id: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  onClose,
  onEdit,
  onDelete,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingSpeed, setSpeakingSpeed] = useState<'normal' | 'slow' | 'fast'>('normal');
  const [stamps, setStamps] = useState<number>(0);

  if (!card) return null;

  const playSpeech = (speed: 'normal' | 'slow' | 'fast' = 'normal') => {
    setIsSpeaking(true);
    setSpeakingSpeed(speed);
    soundFX.playPop();

    const rate = speed === 'slow' ? 0.6 : speed === 'fast' ? 1.1 : 0.85;

    speechEngine.speak(
      card.word,
      speed === 'normal' ? card.recordedAudioUrl : undefined,
      { rate },
      {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      }
    );
  };

  const handlePraise = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playTada();
    setStamps((prev) => prev + 1);

    // Confetti celebration
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ec4899', '#06b6d4', '#10b981', '#f43f5e'],
    });

    speechEngine.speak('참 잘했어요! 최고예요!');
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playClick();
    onEdit?.(card);
    onClose();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`'${card.word}' 카드를 삭제할까요?`)) {
      soundFX.playPop();
      onDelete?.(card.id);
      onClose();
    }
  };

  // Split syllables for phonetic awareness (e.g. 사 • 과)
  const syllables = card.word.split('').join(' • ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 max-h-[95vh] flex flex-col">
        {/* Top bar */}
        <div className="bg-amber-100/80 px-4 py-3 flex items-center justify-between border-b border-amber-200">
          <div className="flex items-center gap-2">
            <span className="font-jua text-amber-800 text-lg flex items-center gap-1.5">
              <span>🌟 카드 크게 보기</span>
            </span>
            {card.recordedAudioUrl && (
              <span className="text-[11px] font-jua text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Mic className="w-3 h-3" />
                녹음된 목소리
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Edit Button */}
            <button
              onClick={handleEdit}
              className="py-1 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-jua flex items-center gap-1 shadow-xs transition active:scale-95"
              title="이 카드 수정하기"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>수정</span>
            </button>

            {/* Direct Delete Button */}
            <button
              onClick={handleDelete}
              className="py-1 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-jua flex items-center gap-1 border border-rose-200 transition active:scale-95"
              title="이 카드 삭제하기"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>삭제</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-600 transition shadow-xs ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center">
          {/* Real Photo Card Container */}
          <div className="relative w-full aspect-4/3 max-h-72 rounded-3xl overflow-hidden shadow-inner border-4 border-amber-200 bg-slate-100 mb-4">
            <img
              src={card.imageUrl}
              alt={card.word}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isSpeaking ? 'scale-105' : ''
              }`}
            />
            {isSpeaking && (
              <div className="absolute inset-0 bg-amber-500/15 ring-8 ring-amber-400 inset-ring pointer-events-none animate-pulse" />
            )}

            {/* Navigation arrows overlay */}
            {hasPrev && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundFX.playClick();
                  onPrev?.();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition active:scale-90"
                title="이전 카드"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  soundFX.playClick();
                  onNext?.();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition active:scale-90"
                title="다음 카드"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Huge Word */}
          <div className="text-center w-full mb-4">
            <h1
              onClick={() => playSpeech('normal')}
              className={`font-jua text-4xl sm:text-5xl font-black cursor-pointer transition select-none tracking-wide ${
                isSpeaking ? 'text-amber-500 scale-105' : 'text-slate-800 hover:text-amber-600'
              }`}
            >
              {card.word}
            </h1>

            {/* Syllable phonetic helper */}
            <p className="text-sm font-jua text-amber-600/90 mt-1 tracking-widest bg-amber-50 py-1 px-3 rounded-full inline-block">
              {syllables}
            </p>

            {card.description && (
              <p className="text-sm text-slate-500 mt-2 font-medium">
                {card.description}
              </p>
            )}
          </div>

          {/* Audio Playback Buttons */}
          <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-3 mb-4">
            {/* Normal speed */}
            <button
              onClick={() => playSpeech('normal')}
              disabled={isSpeaking}
              className={`py-3.5 px-4 rounded-2xl font-jua text-base sm:text-lg flex items-center justify-center gap-2 tactile-button transition ${
                isSpeaking && speakingSpeed === 'normal'
                  ? 'bg-amber-500 text-white shadow-lg scale-95 ring-4 ring-amber-300'
                  : 'bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-md'
              }`}
            >
              <Volume2 className="w-5 h-5" />
              <span>🔊 소리 듣기</span>
            </button>

            {/* Slow speed for articulation */}
            <button
              onClick={() => playSpeech('slow')}
              disabled={isSpeaking}
              className={`py-3.5 px-4 rounded-2xl font-jua text-base sm:text-lg flex items-center justify-center gap-2 tactile-button transition ${
                isSpeaking && speakingSpeed === 'slow'
                  ? 'bg-sky-500 text-white shadow-lg scale-95 ring-4 ring-sky-300'
                  : 'bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300'
              }`}
            >
              <span>🐢 천천히 듣기</span>
            </button>
          </div>

          {/* Praise & Stamp Action */}
          <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handlePraise}
              className="py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-jua text-sm flex items-center gap-1.5 border border-rose-200 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>잘했어요 도장 쾅!</span>
              {stamps > 0 && (
                <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold ml-1">
                  ⭐ {stamps}
                </span>
              )}
            </button>

            <span className="text-xs text-slate-400 font-medium">
              💡 큰 글씨를 누르면 소리가 나요
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
