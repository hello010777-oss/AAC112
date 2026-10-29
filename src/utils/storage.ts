import { FlashCard } from '../types/card';
import { DEFAULT_CARDS } from '../data/defaultCards';

const STORAGE_KEY = 'ssok_ssok_cards_v1';
const SETTINGS_KEY = 'ssok_ssok_settings_v1';

export interface UserSettings {
  speechRate: number;        // e.g. 0.85
  speechPitch: number;       // e.g. 1.15
  soundFXEnabled: boolean;   // true
  autoZoomOnTap: boolean;    // whether to open large modal on card tap or just speak
  selectedVoiceURI: string;  // voice URI
  teacherMode: boolean;      // whether edit buttons are unlocked
}

const DEFAULT_SETTINGS: UserSettings = {
  speechRate: 0.85,
  speechPitch: 1.15,
  soundFXEnabled: true,
  autoZoomOnTap: false,
  selectedVoiceURI: '',
  teacherMode: false,
};

export function loadCardsFromStorage(): FlashCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time loading: persist defaults
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CARDS));
      return DEFAULT_CARDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_CARDS;
  } catch (err) {
    console.error('Error loading cards from storage:', err);
    return DEFAULT_CARDS;
  }
}

export function saveCardsToStorage(cards: FlashCard[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (err) {
    console.error('Error saving cards to storage:', err);
  }
}

export function loadSettingsFromStorage(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

export function resetCardsToDefault(): FlashCard[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CARDS));
    return DEFAULT_CARDS;
  } catch {
    return DEFAULT_CARDS;
  }
}
