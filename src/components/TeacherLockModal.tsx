import React, { useState } from 'react';
import { X, Lock, Check } from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

interface TeacherLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isUnlocking: boolean;
}

export const TeacherLockModal: React.FC<TeacherLockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isUnlocking,
}) => {
  // Generate a random math problem suitable for adults/teachers
  const [num1] = useState(() => Math.floor(Math.random() * 6) + 4);
  const [num2] = useState(() => Math.floor(Math.random() * 5) + 3);
  const [inputAnswer, setInputAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const correctAnswer = num1 + num2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(inputAnswer.trim(), 10) === correctAnswer) {
      soundFX.playTada();
      onSuccess();
      onClose();
    } else {
      soundFX.playPop();
      setErrorMsg('정답이 맞지 않아요. 다시 계산해 주세요.');
      setInputAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-amber-700">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-jua text-xl text-slate-800">
                {isUnlocking ? '선생님 / 보호자 확인' : '잠금 설정'}
              </h3>
              <p className="text-xs text-slate-500">아이들의 오작동을 방지해요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4 bg-amber-50 p-3 rounded-2xl border border-amber-100">
          카드 편집 및 삭제는 선생님과 보호자만 할 수 있어요. 아래 계산을 완료해 주세요:
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center py-3 bg-slate-50 rounded-2xl border-2 border-dashed border-amber-300">
            <span className="font-jua text-3xl text-amber-700 tracking-wider">
              {num1} + {num2} = ?
            </span>
          </div>

          <div>
            <input
              type="number"
              value={inputAnswer}
              onChange={(e) => {
                setInputAnswer(e.target.value);
                setErrorMsg('');
              }}
              placeholder="숫자 입력"
              autoFocus
              className="w-full text-center text-2xl font-bold py-3 px-4 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none bg-white shadow-inner"
            />
            {errorMsg && (
              <p className="text-xs text-rose-500 text-center mt-1 font-medium">{errorMsg}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-jua text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl font-jua text-white bg-amber-500 hover:bg-amber-600 tactile-button flex items-center justify-center gap-1 text-lg"
            >
              <Check className="w-5 h-5" />
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
