import { SpeechOptions } from '../types/card';

export interface SpeakCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

class SpeechEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private koreanVoices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private defaultOptions: SpeechOptions = {
    rate: 0.85,    // 유아 발화 연습을 위해 약간 또박또박한 0.85배속
    pitch: 1.15,   // 친근하고 다정한 약간 높은 피치
    volume: 1.0,
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    this.koreanVoices = voices.filter(
      (v) => v.lang.includes('ko') || v.lang.includes('KO') || v.name.includes('Korean') || v.name.includes('한국어')
    );
    if (this.koreanVoices.length > 0 && !this.selectedVoice) {
      // Prefer high quality / natural voices if available (e.g., Google 한국의 or Yuna)
      const preferred = this.koreanVoices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Yuna') || v.name.includes('Heami'));
      this.selectedVoice = preferred || this.koreanVoices[0];
    }
  }

  public getKoreanVoices(): SpeechSynthesisVoice[] {
    if (this.koreanVoices.length === 0) {
      this.loadVoices();
    }
    return this.koreanVoices;
  }

  public setSelectedVoice(voiceURI: string) {
    const v = this.koreanVoices.find((item) => item.voiceURI === voiceURI);
    if (v) {
      this.selectedVoice = v;
    }
  }

  public getSelectedVoice(): SpeechSynthesisVoice | null {
    return this.selectedVoice;
  }

  public stopAll() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Speak a card's word (or sentence).
   * If recordedAudioUrl is provided, plays the teacher/parent's recorded voice!
   * Otherwise falls back to Web Speech API TTS.
   */
  public speak(
    text: string,
    recordedAudioUrl?: string,
    customOptions?: Partial<SpeechOptions>,
    callbacks?: SpeakCallbacks
  ) {
    this.stopAll();

    // 1. If recorded audio exists, play it first!
    if (recordedAudioUrl && recordedAudioUrl.startsWith('data:audio')) {
      try {
        callbacks?.onStart?.();
        const audio = new Audio(recordedAudioUrl);
        this.currentAudio = audio;
        audio.onended = () => {
          callbacks?.onEnd?.();
          this.currentAudio = null;
        };
        audio.onerror = (e) => {
          // If recorded audio fails, fall back to TTS
          this.speakTTS(text, customOptions, callbacks);
        };
        audio.play().catch(() => {
          this.speakTTS(text, customOptions, callbacks);
        });
        return;
      } catch {
        // Fall back to TTS
      }
    }

    // 2. Play with SpeechSynthesis
    this.speakTTS(text, customOptions, callbacks);
  }

  private speakTTS(
    text: string,
    customOptions?: Partial<SpeechOptions>,
    callbacks?: SpeakCallbacks
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      callbacks?.onError?.(new Error('음성 합성을 지원하지 않는 브라우저입니다.'));
      return;
    }

    // Chrome bug workaround: cancel before speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';

    const rate = customOptions?.rate ?? this.defaultOptions.rate;
    const pitch = customOptions?.pitch ?? this.defaultOptions.pitch;
    const volume = customOptions?.volume ?? this.defaultOptions.volume;

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    } else if (this.koreanVoices.length > 0) {
      utterance.voice = this.koreanVoices[0];
    }

    utterance.onstart = () => {
      callbacks?.onStart?.();
    };

    utterance.onend = () => {
      callbacks?.onEnd?.();
      this.currentUtterance = null;
    };

    utterance.onerror = (e) => {
      callbacks?.onError?.(e);
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public speakSlowly(text: string, recordedAudioUrl?: string, callbacks?: SpeakCallbacks) {
    // 0.6x speed for deep speech therapy / articulation practice
    this.speak(text, undefined, { rate: 0.6, pitch: 1.05 }, callbacks);
  }
}

export const speechEngine = new SpeechEngine();

/**
 * Audio Recording Helper for Teachers/Parents
 */
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  public async start(): Promise<boolean> {
    try {
      this.audioChunks = [];
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.stream, { mimeType })
        : new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
      return true;
    } catch (err) {
      console.warn('Could not start voice recording:', err);
      return false;
    }
  }

  public stop(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanup();
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        try {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            this.cleanup();
            resolve(base64Audio);
          };
          reader.onerror = () => {
            this.cleanup();
            resolve(null);
          };
          reader.readAsDataURL(audioBlob);
        } catch {
          this.cleanup();
          resolve(null);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  public cancel() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    this.cleanup();
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}
