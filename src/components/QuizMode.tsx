import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, RotateCcw, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FlashCard } from '../types/card';
import { speechEngine } from '../utils/speech';
import { soundFX } from '../utils/soundEffects';

interface QuizModeProps {
  cards: FlashCard[];
  onExit: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ cards, onExit }) => {
  const [targetCard, setTargetCard] = useState<FlashCard | null>(null);
  const [options, setOptions] = useState<FlashCard[]>([]);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const pickNewQuestion = useCallback(() => {
    if (cards.length < 2) return;
    setIsAnswered(false);
    setSelectedCardId(null);
    setFeedback('');

    // Pick 1 target
    const randomTarget = cards[Math.floor(Math.random() * cards.length)];
    setTargetCard(randomTarget);

    // Pick 2 or 3 distractors
    const otherCards = cards.filter((c) => c.id !== randomTarget.id);
    const shuffledOthers = [...otherCards].sort(() => 0.5 - Math.random());
    const count = Math.min(3, shuffledOthers.length);
    const quizOptions = [randomTarget, ...shuffledOthers.slice(0, count)].sort(
      () => 0.5 - Math.random()
    );

    setOptions(quizOptions);

    // Speak question prompt
    setTimeout(() => {
      speechEngine.speak(`${randomTarget.word} 어디 있을까요? ${randomTarget.word}를 찾아보세요!`);
    }, 200);
  }, [cards]);

  useEffect(() => {
    pickNewQuestion();
  }, [pickNewQuestion]);

  const handleReplayPrompt = () => {
    if (!targetCard) return;
    soundFX.playPop();
    speechEngine.speak(`${targetCard.word}! ${targetCard.word} 카드는 어디에 있을까요?`);
  };

  const handleSelectOption = (card: FlashCard) => {
    if (isAnswered || !targetCard) return;

    setSelectedCardId(card.id);
    setIsAnswered(true);

    if (card.id === targetCard.id) {
      // Correct!
      soundFX.playTada();
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setFeedback('딩동댕! 정답이에요! 참 잘했어요! 🎉');

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.5 },
      });

      speechEngine.speak(`딩동댕! 맞았어요! ${card.word}예요!`);

      // Automatically advance to next question after 2.2 seconds
      setTimeout(() => {
        pickNewQuestion();
      }, 2200);
    } else {
      // Wrong
      soundFX.playPop();
      setStreak(0);
      setFeedback(`아쉬워요! 이것은 '${card.word}'예요. 다시 들어볼까요?`);
      speechEngine.speak(`이것은 ${card.word}예요. ${targetCard.word}를 다시 찾아보세요.`);

      setTimeout(() => {
        setIsAnswered(false);
        setSelectedCardId(null);
      }, 1800);
    }
  };

  if (cards.length < 2) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl p-8 max-w-lg mx-auto shadow-md border-4 border-amber-200">
        <p className="font-jua text-xl text-slate-700 mb-4">
          퀴즈를 시작하려면 카드가 최소 2장 이상 필요해요!
        </p>
        <button
          onClick={onExit}
          className="py-3 px-6 rounded-2xl bg-amber-500 text-white font-jua text-base"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-5 animate-in fade-in duration-200">
      {/* Quiz Top Header & Scoreboard */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-lg border-4 border-amber-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-xs">
            🎯
          </div>
          <div>
            <h2 className="font-jua text-2xl sm:text-3xl text-slate-800">
              소리 듣고 카드 찾기 놀이
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              선생님 목소리를 잘 듣고 알맞은 사진을 골라보세요!
            </p>
          </div>
        </div>

        {/* Stars and points badge */}
        <div className="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 py-1.5 px-4 rounded-2xl">
          <Award className="w-6 h-6 text-amber-500" />
          <span className="font-jua text-xl text-amber-900">
            별 {score}개
          </span>
          {streak > 1 && (
            <span className="text-xs font-jua text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full font-bold">
              🔥 {streak}연속 성공!
            </span>
          )}
        </div>
      </div>

      {/* Question Prompt Card */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 rounded-3xl p-6 sm:p-8 text-center shadow-xl border-4 border-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center gap-3">
          <span className="text-4xl animate-bounce">🐥</span>
          <h3 className="font-jua text-3xl sm:text-4xl text-amber-950 tracking-wide drop-shadow-xs">
            &ldquo;어떤 카드일까요? 소리를 들어봐요!&rdquo;
          </h3>

          {/* Big Sound Replay Button */}
          <button
            onClick={handleReplayPrompt}
            className="mt-2 py-3 px-6 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 font-jua text-xl shadow-lg tactile-button flex items-center gap-2 border-2 border-amber-200 transition"
          >
            <Volume2 className="w-6 h-6 text-amber-600 animate-pulse" />
            <span>소리 다시 듣기</span>
          </button>

          {feedback && (
            <p className="mt-2 font-jua text-2xl text-slate-900 bg-white/90 py-2 px-6 rounded-2xl shadow-md animate-bounce">
              {feedback}
            </p>
          )}
        </div>
      </div>

      {/* Options Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 pt-2">
        {options.map((card) => {
          const isSelected = selectedCardId === card.id;
          const isCorrect = isAnswered && card.id === targetCard?.id;

          return (
            <div
              key={card.id}
              onClick={() => handleSelectOption(card)}
              className={`relative bg-white rounded-3xl overflow-hidden card-tactile cursor-pointer border-4 transition-all duration-200 p-2 ${
                isCorrect
                  ? 'border-emerald-500 ring-8 ring-emerald-300 scale-105 bg-emerald-50'
                  : isSelected && !isCorrect
                  ? 'border-rose-400 opacity-60'
                  : 'border-amber-200 hover:border-amber-400 hover:scale-102'
              }`}
            >
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={card.imageUrl}
                  alt={card.word}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-3 text-center">
                <span className="font-jua text-2xl font-bold text-slate-800">
                  {card.word}
                </span>
              </div>

              {isCorrect && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg animate-bounce">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Exit Button */}
      <div className="text-center pt-4">
        <button
          onClick={onExit}
          className="py-2.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-600 font-jua text-base border-2 border-slate-200 transition"
        >
          카드 모아보기로 돌아가기
        </button>
      </div>
    </div>
  );
};
