import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, Volume2, Mic, Square, Check, Sparkles, Image as ImageIcon, Trash2, Edit3 } from 'lucide-react';
import { CategoryId, FlashCard } from '../types/card';
import { CATEGORIES, PHOTO_PRESETS } from '../data/defaultCards';
import { soundFX } from '../utils/soundEffects';
import { speechEngine, VoiceRecorder } from '../utils/speech';

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCard: (card: FlashCard) => void;
  editingCard?: FlashCard | null;
}

const COLOR_THEMES = [
  { name: '노랑', color: '#f59e0b', bg: 'bg-amber-100', border: 'border-amber-400' },
  { name: '분홍', color: '#ec4899', bg: 'bg-pink-100', border: 'border-pink-400' },
  { name: '하늘', color: '#0ea5e9', bg: 'bg-sky-100', border: 'border-sky-400' },
  { name: '연두', color: '#10b981', bg: 'bg-emerald-100', border: 'border-emerald-400' },
  { name: '보라', color: '#8b5cf6', bg: 'bg-purple-100', border: 'border-purple-400' },
  { name: '주황', color: '#f97316', bg: 'bg-orange-100', border: 'border-orange-400' },
];

export const CreateCardModal: React.FC<CreateCardModalProps> = ({
  isOpen,
  onClose,
  onSaveCard,
  editingCard,
}) => {
  const [word, setWord] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId>('custom');
  const [selectedColor, setSelectedColor] = useState(COLOR_THEMES[0].color);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);

  // Tab for image source
  const [imageTab, setImageTab] = useState<'upload' | 'preset'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<VoiceRecorder | null>(null);

  useEffect(() => {
    if (editingCard) {
      setWord(editingCard.word);
      setDescription(editingCard.description || '');
      setImageUrl(editingCard.imageUrl);
      setCategoryId(editingCard.categoryId);
      setSelectedColor(editingCard.colorTheme || COLOR_THEMES[0].color);
      setRecordedAudioUrl(editingCard.recordedAudioUrl || null);
      setImageTab('upload');
    } else {
      setWord('');
      setDescription('');
      setImageUrl('');
      setCategoryId('custom');
      setSelectedColor(COLOR_THEMES[0].color);
      setRecordedAudioUrl(null);
      setImageTab('upload');
    }
  }, [editingCard, isOpen]);

  if (!isOpen) return null;

  const isEditMode = Boolean(editingCard);

  // Handle image upload from file or camera
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize image to max 800x800 for optimal local storage and sharp high-DPI display
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setImageUrl(compressedDataUrl);
          soundFX.playPop();
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Start voice recording
  const handleStartRecord = async () => {
    soundFX.playPop();
    const recorder = new VoiceRecorder();
    recorderRef.current = recorder;
    const ok = await recorder.start();
    if (ok) {
      setIsRecording(true);
    } else {
      alert('마이크 접근 권한이 필요합니다. 브라우저 마이크 권한을 허용해 주세요.');
    }
  };

  // Stop voice recording
  const handleStopRecord = async () => {
    if (!recorderRef.current) return;
    const base64Audio = await recorderRef.current.stop();
    setIsRecording(false);
    if (base64Audio) {
      setRecordedAudioUrl(base64Audio);
      soundFX.playTada();
    }
  };

  // Preview TTS
  const handlePreviewTTS = () => {
    if (!word.trim()) return;
    setIsPlayingTTS(true);
    speechEngine.speak(
      word.trim(),
      undefined,
      undefined,
      {
        onEnd: () => setIsPlayingTTS(false),
        onError: () => setIsPlayingTTS(false),
      }
    );
  };

  // Preview Recorded Voice
  const handlePreviewRecorded = () => {
    if (!recordedAudioUrl) return;
    setIsPlayingRecorded(true);
    speechEngine.speak(
      word.trim() || '녹음된 소리',
      recordedAudioUrl,
      undefined,
      {
        onEnd: () => setIsPlayingRecorded(false),
        onError: () => setIsPlayingRecorded(false),
      }
    );
  };

  // Card submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) {
      alert('단어를 입력해 주세요 (예: 사과, 물)');
      return;
    }
    if (!imageUrl) {
      alert('실물 사진을 업로드하거나 아래 추천 사진에서 골라주세요!');
      return;
    }

    const cardToSave: FlashCard = {
      id: editingCard
        ? editingCard.id
        : `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      word: word.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl,
      categoryId: categoryId,
      colorTheme: selectedColor,
      recordedAudioUrl: recordedAudioUrl || undefined,
      isCustom: editingCard ? editingCard.isCustom : true,
      createdAt: editingCard ? editingCard.createdAt : Date.now(),
    };

    onSaveCard(cardToSave);
    soundFX.playTada();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-white/90 shadow flex items-center justify-center text-amber-600 font-bold text-xl">
              {isEditMode ? <Edit3 className="w-5 h-5 text-amber-600" /> : '📸'}
            </div>
            <div>
              <h2 className="font-jua text-2xl text-slate-800 tracking-wide">
                {isEditMode ? '낱말 카드 수정하기' : '새 낱말 카드 만들기'}
              </h2>
              <p className="text-xs text-amber-900 font-medium">
                {isEditMode
                  ? '사진, 단어, 녹음 음성을 수정할 수 있어요'
                  : '실물 사진과 단어를 넣어 아이 맞춤 카드를 완성해요'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* 1. 실물 사진 선택 섹션 */}
          <div>
            <label className="font-jua text-base text-slate-800 flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5">
                <span className="text-amber-500 font-black">1.</span>
                <span>실물 사진 등록/변경</span>
                <span className="text-rose-500 font-bold">*</span>
              </span>
              <span className="text-xs font-normal text-slate-500">
                실제 사진일수록 유아 인식률이 높아요
              </span>
            </label>

            {/* Photo Tabs: Upload vs Preset */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setImageTab('upload')}
                className={`flex-1 py-2 rounded-xl text-sm font-jua transition flex items-center justify-center gap-1.5 ${
                  imageTab === 'upload'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                직접 사진 올리기 / 촬영
              </button>
              <button
                type="button"
                onClick={() => setImageTab('preset')}
                className={`flex-1 py-2 rounded-xl text-sm font-jua transition flex items-center justify-center gap-1.5 ${
                  imageTab === 'preset'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                추천 실물 사진에서 고르기
              </button>
            </div>

            {imageTab === 'upload' ? (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFile}
                  accept="image/*"
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-300 bg-slate-50 aspect-4/3 max-h-48 flex items-center justify-center group">
                    <img
                      src={imageUrl}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-1.5 px-3 bg-white text-slate-800 rounded-xl text-xs font-jua flex items-center gap-1 shadow"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        사진 변경
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="py-1.5 px-3 bg-rose-500 text-white rounded-xl text-xs font-jua flex items-center gap-1 shadow"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        사진 삭제
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-3 border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-50 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 group-hover:scale-105 transition flex items-center justify-center text-amber-600 shadow-xs">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-jua text-base text-slate-700">
                        클릭하여 실물 사진을 업로드하거나 촬영하세요
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        내 기기 앨범 또는 카메라로 물건을 찍어보세요 (JPG, PNG)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 mb-2 font-medium">
                  아래 추천 실물 사진을 클릭하면 바로 적용돼요:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
                  {PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        if (!word) setWord(preset.word);
                        soundFX.playPop();
                      }}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition hover:scale-105 ${
                        imageUrl === preset.url
                          ? 'border-amber-500 ring-2 ring-amber-300 ring-offset-1'
                          : 'border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.word}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] py-0.5 text-center font-bold truncate">
                        {preset.word}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. 단어 입력 섹션 */}
          <div>
            <label className="font-jua text-base text-slate-800 flex items-center gap-1.5 mb-1.5">
              <span className="text-amber-500 font-black">2.</span>
              <span>카드 단어 입력</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="예: 사과, 시원한 물, 도와주세요"
                className="flex-1 text-xl font-bold py-3 px-4 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none bg-slate-50/50 shadow-inner font-jua"
                maxLength={20}
              />
              <button
                type="button"
                onClick={handlePreviewTTS}
                disabled={!word.trim() || isPlayingTTS}
                className="px-4 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-jua text-sm flex items-center gap-1 transition disabled:opacity-50"
                title="단어 발음 들어보기"
              >
                <Volume2 className="w-4 h-4" />
                {isPlayingTTS ? '읽는 중...' : '발음 듣기'}
              </button>
            </div>
          </div>

          {/* 3. 부가 설명 입력 (선택) */}
          <div>
            <label className="font-jua text-sm text-slate-700 flex items-center gap-1.5 mb-1">
              <span>부가 설명 (선택)</span>
              <span className="text-xs font-normal text-slate-400">
                - 카드 상세보기에 친절하게 표시돼요
              </span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 목이 마를 때 꿀꺽꿀꺽 마셔요"
              className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:outline-none text-sm text-slate-700 bg-slate-50/50"
              maxLength={40}
            />
          </div>

          {/* 4. 카테고리 & 테두리 색상 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-jua text-sm text-slate-700 block mb-1.5">
                카테고리 선택
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value as CategoryId)}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-amber-400 text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-jua text-sm text-slate-700 block mb-1.5">
                카드 테두리 색상
              </label>
              <div className="flex gap-2 pt-1">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => {
                      setSelectedColor(theme.color);
                      soundFX.playClick();
                    }}
                    style={{ backgroundColor: theme.color }}
                    className={`w-7 h-7 rounded-full transition transform hover:scale-110 flex items-center justify-center ${
                      selectedColor === theme.color
                        ? 'ring-3 ring-amber-400 ring-offset-2 scale-110'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {selectedColor === theme.color && (
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. 직접 음성 녹음 (선생님/엄마 목소리 등록) */}
          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200">
            <div className="flex items-center justify-between mb-2">
              <label className="font-jua text-slate-800 text-sm flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-rose-500" />
                <span>선생님 / 엄마 목소리 직접 녹음 (선택)</span>
              </label>
              <span className="text-[11px] text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full font-bold">
                유아 친밀도 UP!
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              실제 친숙한 목소리로 녹음해주면 발화가 서툰 아이의 모방 반응이 훨씬 빨라집니다.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecord}
                  className="py-2 px-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-jua text-sm flex items-center gap-1.5 tactile-button shadow-xs"
                >
                  <Mic className="w-4 h-4" />
                  {recordedAudioUrl ? '목소리 다시 녹음하기' : '목소리 녹음 시작'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecord}
                  className="py-2 px-4 rounded-xl bg-red-600 text-white font-jua text-sm flex items-center gap-2 animate-pulse shadow-md"
                >
                  <Square className="w-4 h-4 fill-white" />
                  녹음 멈추기 (말씀 후 눌러주세요)
                </button>
              )}

              {recordedAudioUrl && !isRecording && (
                <>
                  <button
                    type="button"
                    onClick={handlePreviewRecorded}
                    disabled={isPlayingRecorded}
                    className="py-2 px-3 rounded-xl bg-white text-rose-700 border border-rose-300 font-jua text-xs flex items-center gap-1 hover:bg-rose-50 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {isPlayingRecorded ? '재생 중...' : '녹음 듣기'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRecordedAudioUrl(null);
                      soundFX.playPop();
                    }}
                    className="p-2 text-slate-400 hover:text-rose-500 transition"
                    title="녹음 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    녹음 완료됨
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 6. 카드 미리보기 */}
          {imageUrl && word && (
            <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
              <p className="font-jua text-xs text-amber-800 mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {isEditMode ? '수정된 카드 미리보기' : '완성될 카드 미리보기'}
              </p>
              <div className="w-44 mx-auto bg-white rounded-2xl overflow-hidden shadow-md border-4" style={{ borderColor: selectedColor }}>
                <div className="aspect-square w-full overflow-hidden bg-slate-100">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
                <div className="p-2 text-center bg-amber-50/40">
                  <span className="font-jua text-lg font-bold text-slate-800 truncate block">
                    {word}
                  </span>
                  {recordedAudioUrl && (
                    <span className="text-[10px] text-rose-600 font-bold">🎤 직접 녹음됨</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl font-jua text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-2 py-3.5 rounded-2xl font-jua text-white bg-amber-500 hover:bg-amber-600 tactile-button text-lg flex items-center justify-center gap-1.5 shadow-md"
            >
              <Check className="w-5 h-5" />
              {isEditMode ? '수정 내용 저장하기' : '카드 완성하고 등록하기!'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
