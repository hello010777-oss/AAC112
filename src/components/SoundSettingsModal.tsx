import React, { useEffect, useState } from 'react';
import { X, Volume2, Mic, RotateCcw, Sparkles } from 'lucide-react';
import { UserSettings } from '../utils/storage';
import { speechEngine } from '../utils/speech';
import { soundFX } from '../utils/soundEffects';

interface SoundSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  onResetDefaultCards: () => void;
}

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetDefaultCards,
}) => {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [koreanVoices, setKoreanVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    const voices = speechEngine.getKoreanVoices();
    setKoreanVoices(voices);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleTestSpeech = () => {
    setIsPlayingTest(true);
    soundFX.playPop();
    speechEngine.speak(
      '안녕하세요! 말하는 쏙쏙 카드예요. 반가워요!',
      undefined,
      {
        rate: localSettings.speechRate,
        pitch: localSettings.speechPitch,
      },
      {
        onEnd: () => setIsPlayingTest(false),
        onError: () => setIsPlayingTest(false),
      }
    );
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voiceURI = e.target.value;
    speechEngine.setSelectedVoice(voiceURI);
    setLocalSettings((prev) => ({ ...prev, selectedVoiceURI: voiceURI }));
  };

  const handleSave = () => {
    soundFX.setSoundEnabled(localSettings.soundFXEnabled);
    onSaveSettings(localSettings);
    onClose();
  };

  const handleResetCards = () => {
    if (window.confirm('기본 제공 낱말카드를 초기 상태로 복원할까요? (내가 만든 카드는 보존됩니다)')) {
      onResetDefaultCards();
      soundFX.playTada();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-jua text-2xl text-slate-800">소리 및 발화 설정</h3>
              <p className="text-xs text-slate-500">유아 발화 훈련에 맞게 조절해요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5">
          {/* 말하기 속도 조절 */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100">
            <div className="flex justify-between items-center mb-2">
              <label className="font-jua text-slate-700 flex items-center gap-1.5">
                <span>말하기 속도</span>
                <span className="text-xs font-normal text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full">
                  {localSettings.speechRate <= 0.7
                    ? '🐢 매우 천천히 (발화 치료용)'
                    : localSettings.speechRate <= 0.9
                    ? '👶 또박또박 (추천)'
                    : '🐰 보통 속도'}
                </span>
              </label>
              <span className="text-sm font-bold text-amber-900">{localSettings.speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.05"
              value={localSettings.speechRate}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, speechRate: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-500 cursor-pointer h-2 bg-amber-200 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
              <span>0.5x (느리게)</span>
              <span>0.85x (유아 추천)</span>
              <span>1.2x (빠르게)</span>
            </div>
          </div>

          {/* 목소리 톤 (피치) 조절 */}
          <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100">
            <div className="flex justify-between items-center mb-2">
              <label className="font-jua text-slate-700 flex items-center gap-1.5">
                <span>목소리 톤 (음높이)</span>
                <span className="text-xs font-normal text-sky-700 bg-sky-200/60 px-2 py-0.5 rounded-full">
                  {localSettings.speechPitch > 1.1 ? '✨ 밝고 다정한 목소리' : '차분한 목소리'}
                </span>
              </label>
              <span className="text-sm font-bold text-sky-900">{localSettings.speechPitch}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={localSettings.speechPitch}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, speechPitch: parseFloat(e.target.value) })
              }
              className="w-full accent-sky-500 cursor-pointer h-2 bg-sky-200 rounded-lg"
            />
          </div>

          {/* 시스템 한국어 목소리 선택 */}
          {koreanVoices.length > 0 && (
            <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100">
              <label className="font-jua text-slate-700 block mb-2 text-sm flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-purple-600" />
                <span>한국어 발화 목소리 엔진</span>
              </label>
              <select
                value={localSettings.selectedVoiceURI || speechEngine.getSelectedVoice()?.voiceURI || ''}
                onChange={handleVoiceChange}
                className="w-full py-2.5 px-3 rounded-xl border border-purple-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-purple-400"
              >
                {koreanVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} {v.default ? '(기본)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 효과음 토글 & 큰 화면 토글 */}
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/60 transition">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <span>🔊 터치 뾱뾱 효과음</span>
              </span>
              <input
                type="checkbox"
                checked={localSettings.soundFXEnabled}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, soundFXEnabled: e.target.checked })
                }
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/60 transition">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <span>🔍 카드 터치 시 바로 크게 보기</span>
              </span>
              <input
                type="checkbox"
                checked={localSettings.autoZoomOnTap}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, autoZoomOnTap: e.target.checked })
                }
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* 소리 미리듣기 버튼 */}
          <button
            type="button"
            onClick={handleTestSpeech}
            disabled={isPlayingTest}
            className="w-full py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-jua text-base flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-5 h-5" />
            {isPlayingTest ? '소리 나는 중...' : '설정한 목소리 미리 들어보기'}
          </button>

          {/* 기본 카드 복원 */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetCards}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              기본 제공 카드 다시 불러오기
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-jua text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-3 rounded-2xl font-jua text-white bg-amber-500 hover:bg-amber-600 tactile-button text-lg"
            >
              설정 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
