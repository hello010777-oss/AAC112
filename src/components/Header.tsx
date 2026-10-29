import React from 'react';
import { Plus, Settings, Lock, Unlock, MessageSquare, Layers, HelpCircle } from 'lucide-react';
import { ViewMode } from '../types/card';
import { soundFX } from '../utils/soundEffects';

interface HeaderProps {
  currentMode: ViewMode;
  onSelectMode: (mode: ViewMode) => void;
  onOpenCreateModal: () => void;
  onOpenSettingsModal: () => void;
  teacherMode: boolean;
  onToggleTeacherLock: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenCreateModal,
  onOpenSettingsModal,
  teacherMode,
  onToggleTeacherLock,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b-4 border-amber-300 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={() => onSelectMode('cards')}>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-2xl shadow-md border-2 border-amber-200 transform hover:rotate-6 transition">
              🐥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-jua text-2xl sm:text-3xl text-slate-800 tracking-wide leading-none">
                  말하는 쏙쏙 카드
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-jua text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                  유치원 AAC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                사진과 단어를 쏙! 누르면 소리내어 읽어줘요
              </p>
            </div>
          </div>

          {/* Action buttons (Create card, Teacher Lock, Sound Settings) */}
          <div className="flex items-center gap-2">
            {/* Create Card Button */}
            <button
              onClick={() => {
                soundFX.playPop();
                onOpenCreateModal();
              }}
              className="py-2.5 px-3.5 sm:px-4 rounded-2xl font-jua text-sm sm:text-base text-white bg-amber-500 hover:bg-amber-600 tactile-button shadow-md flex items-center gap-1.5 transition active:scale-95"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>새 카드 만들기</span>
            </button>

            {/* Edit / Teacher Mode Button */}
            <button
              onClick={() => {
                soundFX.playClick();
                onToggleTeacherLock();
              }}
              className={`py-2 px-3 rounded-2xl text-xs font-jua flex items-center gap-1.5 border-2 transition ${
                teacherMode
                  ? 'bg-rose-500 border-rose-600 text-white shadow-xs'
                  : 'bg-amber-100/70 border-amber-300 text-amber-900 hover:bg-amber-100'
              }`}
              title={teacherMode ? '수정/삭제 모드가 켜져 있습니다' : '카드 수정 및 삭제를 활성화하려면 누르세요'}
            >
              {teacherMode ? (
                <>
                  <Unlock className="w-4 h-4 text-white" />
                  <span>수정·삭제 켜짐</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-amber-800" />
                  <span>수정·삭제 잠금</span>
                </>
              )}
            </button>

            {/* Sound Settings Button */}
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenSettingsModal();
              }}
              className="w-10 h-10 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border-2 border-amber-200 flex items-center justify-center transition"
              title="소리 및 발화 설정"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs (카드 쏙쏙, 문장 말하기, 말놀이 퀴즈) */}
        <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-amber-100">
          <button
            onClick={() => {
              soundFX.playClick();
              onSelectMode('cards');
            }}
            className={`flex-1 sm:flex-initial py-1.5 px-3.5 rounded-xl font-jua text-sm flex items-center justify-center gap-1.5 transition ${
              currentMode === 'cards'
                ? 'bg-amber-400 text-amber-950 shadow-sm'
                : 'text-slate-600 hover:bg-amber-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>낱말 카드 모음</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onSelectMode('sentence');
            }}
            className={`flex-1 sm:flex-initial py-1.5 px-3.5 rounded-xl font-jua text-sm flex items-center justify-center gap-1.5 transition ${
              currentMode === 'sentence'
                ? 'bg-amber-400 text-amber-950 shadow-sm'
                : 'text-slate-600 hover:bg-amber-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>문장 말하기판</span>
          </button>

          <button
            onClick={() => {
              soundFX.playClick();
              onSelectMode('quiz');
            }}
            className={`flex-1 sm:flex-initial py-1.5 px-3.5 rounded-xl font-jua text-sm flex items-center justify-center gap-1.5 transition ${
              currentMode === 'quiz'
                ? 'bg-amber-400 text-amber-950 shadow-sm'
                : 'text-slate-600 hover:bg-amber-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>소리 맞추기 퀴즈</span>
          </button>
        </div>
      </div>
    </header>
  );
};
