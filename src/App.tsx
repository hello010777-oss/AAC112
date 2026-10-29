import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Sparkles, Volume2, HelpCircle, Edit3, Unlock } from 'lucide-react';
import { FlashCard, CategoryId, ViewMode } from './types/card';
import {
  loadCardsFromStorage,
  saveCardsToStorage,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  resetCardsToDefault,
  UserSettings,
} from './utils/storage';
import { speechEngine } from './utils/speech';
import { soundFX } from './utils/soundEffects';

import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { CardItem } from './components/CardItem';
import { CardModal } from './components/CardModal';
import { CreateCardModal } from './components/CreateCardModal';
import { SentenceBar } from './components/SentenceBar';
import { QuizMode } from './components/QuizMode';
import { TeacherLockModal } from './components/TeacherLockModal';
import { SoundSettingsModal } from './components/SoundSettingsModal';

export default function App() {
  const [cards, setCards] = useState<FlashCard[]>(() => loadCardsFromStorage());
  const [settings, setSettings] = useState<UserSettings>(() => loadSettingsFromStorage());
  
  // Navigation & View State
  const [currentMode, setCurrentMode] = useState<ViewMode>('cards');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audio Playback State
  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);

  // Modals
  const [activeModalCard, setActiveModalCard] = useState<FlashCard | null>(null);
  const [editingCard, setEditingCard] = useState<FlashCard | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTeacherLockOpen, setIsTeacherLockOpen] = useState(false);

  // AAC Sentence Strip state
  const [sentenceCards, setSentenceCards] = useState<FlashCard[]>([]);

  // Initialize sound settings
  useEffect(() => {
    soundFX.setSoundEnabled(settings.soundFXEnabled);
    if (settings.selectedVoiceURI) {
      speechEngine.setSelectedVoice(settings.selectedVoiceURI);
    }
  }, [settings]);

  // Save cards when changed
  const updateCards = (newCards: FlashCard[]) => {
    setCards(newCards);
    saveCardsToStorage(newCards);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCard(null);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal for a specific card
  const handleOpenEditCard = (card: FlashCard) => {
    setEditingCard(card);
    setIsCreateModalOpen(true);
  };

  // Save card (handles both creation of new card & modification of existing card)
  const handleSaveCard = (cardToSave: FlashCard) => {
    const existingIndex = cards.findIndex((c) => c.id === cardToSave.id);

    let updated: FlashCard[];
    if (existingIndex >= 0) {
      // Edit existing card
      updated = [...cards];
      updated[existingIndex] = cardToSave;
      // Update in sentence bar if present
      setSentenceCards((prev) =>
        prev.map((c) => (c.id === cardToSave.id ? cardToSave : c))
      );
      // Update in active modal if open
      if (activeModalCard?.id === cardToSave.id) {
        setActiveModalCard(cardToSave);
      }
    } else {
      // Create new card
      updated = [cardToSave, ...cards];
    }

    updateCards(updated);
    setSelectedCategory('all');

    // Speak the card as confirmation
    setTimeout(() => {
      handleSpeakCard(cardToSave);
    }, 400);
  };

  // Delete card handler
  const handleDeleteCard = (cardId: string) => {
    const updated = cards.filter((c) => c.id !== cardId);
    updateCards(updated);
    // Also remove from sentence bar if present
    setSentenceCards((prev) => prev.filter((c) => c.id !== cardId));
    if (activeModalCard?.id === cardId) {
      setActiveModalCard(null);
    }
  };

  // Reset to default cards
  const handleResetDefaultCards = () => {
    const defaults = resetCardsToDefault();
    setCards(defaults);
  };

  // Save user settings
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
  };

  // Toggle teacher lock
  const handleToggleTeacherLock = () => {
    if (settings.teacherMode) {
      // Locking is immediate
      const newSettings = { ...settings, teacherMode: false };
      handleSaveSettings(newSettings);
      soundFX.playPop();
    } else {
      // Unlocking opens math challenge modal
      setIsTeacherLockOpen(true);
    }
  };

  // Speak a card word
  const handleSpeakCard = (card: FlashCard) => {
    setSpeakingCardId(card.id);

    // If autoZoomOnTap is enabled, open large modal
    if (settings.autoZoomOnTap) {
      setActiveModalCard(card);
    }

    speechEngine.speak(
      card.word,
      card.recordedAudioUrl,
      {
        rate: card.voiceRate || settings.speechRate,
        pitch: card.voicePitch || settings.speechPitch,
      },
      {
        onEnd: () => setSpeakingCardId(null),
        onError: () => setSpeakingCardId(null),
      }
    );
  };

  // AAC Sentence Bar actions
  const handleAddToSentence = (card: FlashCard) => {
    setSentenceCards((prev) => [...prev, card]);
  };

  const handleRemoveFromSentence = (index: number) => {
    setSentenceCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearSentence = () => {
    setSentenceCards([]);
  };

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchCategory =
        selectedCategory === 'all' || card.categoryId === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        card.word.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (card.description &&
          card.description.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      return matchCategory && matchSearch;
    });
  }, [cards, selectedCategory, searchQuery]);

  // Card counts per category
  const cardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cards.forEach((c) => {
      counts[c.categoryId] = (counts[c.categoryId] || 0) + 1;
    });
    return counts;
  }, [cards]);

  // Modal navigation indices
  const activeModalIndex = activeModalCard
    ? filteredCards.findIndex((c) => c.id === activeModalCard.id)
    : -1;

  const handleModalPrev = () => {
    if (activeModalIndex > 0) {
      const prevCard = filteredCards[activeModalIndex - 1];
      setActiveModalCard(prevCard);
      handleSpeakCard(prevCard);
    }
  };

  const handleModalNext = () => {
    if (activeModalIndex >= 0 && activeModalIndex < filteredCards.length - 1) {
      const nextCard = filteredCards[activeModalIndex + 1];
      setActiveModalCard(nextCard);
      handleSpeakCard(nextCard);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/40 flex flex-col font-sans">
      {/* Top Navigation & Controls */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        onOpenCreateModal={handleOpenCreateModal}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        teacherMode={settings.teacherMode}
        onToggleTeacherLock={handleToggleTeacherLock}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 space-y-4">
        {currentMode === 'quiz' ? (
          /* Listening Quiz Game Mode */
          <QuizMode cards={cards} onExit={() => setCurrentMode('cards')} />
        ) : (
          /* Flashcards & AAC Mode */
          <>
            {/* Friendly Mascot Intro Banner & Edit Mode Indicator */}
            <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-100 rounded-3xl p-3.5 sm:p-4 border-3 border-amber-300 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">🐥</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-jua text-lg sm:text-xl text-amber-950">
                      원하는 카드를 콕! 누르면 큰 소리로 읽어줘요!
                    </p>
                    {settings.teacherMode && (
                      <span className="text-xs font-jua text-rose-700 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold animate-pulse">
                        <Unlock className="w-3.5 h-3.5" />
                        수정·삭제 모드 켜짐
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-800 font-medium">
                    {settings.teacherMode
                      ? '카드마다 연필(✏️)을 눌러 수정하거나 휴지통(🗑️)을 눌러 삭제할 수 있어요.'
                      : '상단 자물쇠 버튼을 누르면 카드를 자유롭게 수정하거나 삭제할 수 있어요.'}
                  </p>
                </div>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="단어 검색 (예: 사과, 물)"
                  className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white border-2 border-amber-200 text-sm focus:outline-none focus:border-amber-400 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Chips */}
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              cardCounts={cardCounts}
            />

            {/* Cards Grid */}
            {filteredCards.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl p-8 border-4 border-dashed border-amber-200 shadow-sm">
                <span className="text-5xl block mb-3">🔍</span>
                <h3 className="font-jua text-2xl text-slate-700 mb-1">
                  찾는 카드가 없어요
                </h3>
                <p className="text-sm text-slate-500 mb-5">
                  직접 사진을 찍어 우리 아이만의 새 카드를 만들어볼까요?
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="py-3 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-jua text-lg tactile-button inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                  <span>새 카드 만들기</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 md:gap-5 pb-6">
                {filteredCards.map((card) => (
                  <CardItem
                    key={card.id}
                    card={card}
                    isSpeaking={speakingCardId === card.id}
                    onSpeak={handleSpeakCard}
                    onZoom={(c) => setActiveModalCard(c)}
                    onEdit={handleOpenEditCard}
                    onDelete={handleDeleteCard}
                    onAddToSentence={handleAddToSentence}
                    teacherMode={settings.teacherMode}
                    sentenceModeActive={currentMode === 'sentence'}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* AAC Sentence Board Bar */}
      {(currentMode === 'sentence' || sentenceCards.length > 0) && (
        <SentenceBar
          selectedCards={sentenceCards}
          onRemoveCard={handleRemoveFromSentence}
          onClear={handleClearSentence}
          onCardClick={(c) => handleSpeakCard(c)}
        />
      )}

      {/* Modal: Big Expanded Card View with Direct Edit & Delete */}
      <CardModal
        card={activeModalCard}
        onClose={() => setActiveModalCard(null)}
        onEdit={handleOpenEditCard}
        onDelete={handleDeleteCard}
        onPrev={handleModalPrev}
        onNext={handleModalNext}
        hasPrev={activeModalIndex > 0}
        hasNext={activeModalIndex >= 0 && activeModalIndex < filteredCards.length - 1}
      />

      {/* Modal: Create or Edit Card */}
      <CreateCardModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingCard(null);
        }}
        onSaveCard={handleSaveCard}
        editingCard={editingCard}
      />

      {/* Modal: Sound and Speech Settings */}
      <SoundSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onResetDefaultCards={handleResetDefaultCards}
      />

      {/* Modal: Teacher Lock Challenge */}
      <TeacherLockModal
        isOpen={isTeacherLockOpen}
        onClose={() => setIsTeacherLockOpen(false)}
        onSuccess={() => {
          handleSaveSettings({ ...settings, teacherMode: true });
        }}
        isUnlocking={true}
      />
    </div>
  );
}
