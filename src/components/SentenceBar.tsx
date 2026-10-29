import React, { useState } from 'react';
import { Play, RotateCcw, Delete, Volume2, Sparkles, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FlashCard } from '../types/card';
import { speechEngine } from '../utils/speech';
import { soundFX } from '../utils/soundEffects';

interface SentenceBarProps {
  selectedCards: FlashCard[];
  onRemoveCard: (index: number) => void;
  onClear: () => void;
  onCardClick?: (card: FlashCard) => void;
}

export const SentenceBar: React.FC<SentenceBarProps> = ({
  selectedCards,
  onRemoveCard,
  onClear,
  onCardClick,
}) => {
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  const handleSpeakAll = async () => {
    if (selectedCards.length === 0 || isPlayingAll) return;
    setIsPlayingAll(true);
    soundFX.playPop();

    // Read cards in sequence with visual highlight on each
    for (let i = 0; i < selectedCards.length; i++) {
      setActiveWordIndex(i);
      const card = selectedCards[i];
      await new Promise<void>((resolve) => {
        speechEngine.speak(
          card.word,
          card.recordedAudioUrl,
          { rate: 0.9 },
          {
            onEnd: () => resolve(),
            onError: () => resolve(),
          }
        );
      });
      // Small pause between words
      await new Promise((r) => setTimeout(r, 150));
    }

    setActiveWordIndex(null);
    setIsPlayingAll(false);

    // Celebrate completed sentence expression!
    if (selectedCards.length >= 2) {
      soundFX.playTada();
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
      });
    }
  };

  const fullSentence = selectedCards.map((c) => c.word).join(' ');

  return (
    <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t-4 border-amber-300 shadow-2xl p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-amber-400 text-amber-950 font-bold flex items-center justify-center text-sm">
              <MessageSquare className="w-4 h-4" />
            </span>
            <span className="font-jua text-base text-slate-800">
              말하기 문장판 (카드를 모아 문장으로 말해요)
            </span>
          </div>

          {selectedCards.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundFX.playPop();
                  onRemoveCard(selectedCards.length - 1);
                }}
                className="py-1 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-jua flex items-center gap-1 transition"
                title="마지막 카드 지우기"
              >
                <Delete className="w-3.5 h-3.5" />
                지우기
              </button>
              <button
                onClick={() => {
                  soundFX.playPop();
                  onClear();
                }}
                className="py-1 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-jua flex items-center gap-1 transition"
                title="문장판 비우기"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                모두 비우기
              </button>
            </div>
          )}
        </div>

        {/* Card Strip / Drop Container */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-2 min-h-[96px] bg-amber-50/60 rounded-2xl p-2 border-2 border-dashed border-amber-200">
          {selectedCards.length === 0 ? (
            <div className="w-full text-center py-4 text-amber-700/60 font-jua text-sm flex items-center justify-center gap-2">
              <span>👆 위 카드를 터치해서 문장을 만들어보세요 (예: 물 + 주세요)</span>
            </div>
          ) : (
            selectedCards.map((card, index) => {
              const isCurrent = activeWordIndex === index;
              return (
                <div
                  key={`${card.id}-${index}`}
                  onClick={() => {
                    soundFX.playPop();
                    speechEngine.speak(card.word, card.recordedAudioUrl);
                    onCardClick?.(card);
                  }}
                  className={`shrink-0 flex items-center gap-2 bg-white rounded-2xl p-1.5 pr-3 shadow-md border-3 transition-all cursor-pointer ${
                    isCurrent
                      ? 'scale-110 border-amber-500 ring-4 ring-amber-300 ring-offset-1 bg-amber-50'
                      : 'border-amber-200 hover:border-amber-400 hover:scale-105'
                  }`}
                >
                  <img
                    src={card.imageUrl}
                    alt={card.word}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <span className="font-jua text-lg text-slate-800 block leading-tight">
                      {card.word}
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold">눌러서 듣기</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Speak All Action Bar */}
        {selectedCards.length > 0 && (
          <div className="mt-2.5 flex items-center justify-between gap-3">
            <div className="truncate flex-1">
              <span className="font-jua text-xl text-amber-900 bg-amber-100/70 px-3 py-1 rounded-xl inline-block truncate max-w-full">
                💬 &ldquo;{fullSentence}&rdquo;
              </span>
            </div>

            <button
              onClick={handleSpeakAll}
              disabled={isPlayingAll}
              className={`py-3 px-6 rounded-2xl font-jua text-lg text-white tactile-button shadow-md flex items-center gap-2 transition shrink-0 ${
                isPlayingAll
                  ? 'bg-amber-600 ring-4 ring-amber-300 animate-pulse'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{isPlayingAll ? '말하는 중...' : '문장 한번에 말하기!'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
