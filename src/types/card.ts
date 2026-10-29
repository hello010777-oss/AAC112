export type CategoryId = 
  | 'food'        // 음식과 간식
  | 'daily'       // 유치원 일과 & 생활
  | 'expression'  // 마음과 표현 (AAC 필수)
  | 'play'        // 장난감과 놀이
  | 'nature'      // 동물과 자연
  | 'custom';     // 내가 만든 카드

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  emoji: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export interface FlashCard {
  id: string;
  word: string;             // 단어 (예: "물", "사과")
  description?: string;      // 부가 설명 (예: "시원한 물을 마셔요")
  imageUrl: string;         // 실물 사진 (Data URL 또는 웹 실물 사진 URL)
  categoryId: CategoryId;   // 카테고리
  colorTheme?: string;      // 카드 테두리 색상
  voiceRate?: number;       // 발화 속도 (0.5 ~ 1.5, 기본 0.9)
  voicePitch?: number;      // 발화 피치 (0.8 ~ 1.4, 기본 1.1)
  recordedAudioUrl?: string;// 직접 녹음한 음성 (Base64 Data URL)
  isCustom?: boolean;       // 사용자 생성 여부
  createdAt: number;
  clickCount?: number;
}

export type ViewMode = 'cards' | 'sentence' | 'quiz';

export interface SpeechOptions {
  rate: number;
  pitch: number;
  volume: number;
  voiceURI?: string;
}
