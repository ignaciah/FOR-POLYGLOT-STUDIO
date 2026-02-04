
export interface ProjectMedia {
  id: string;
  type: 'image' | 'audio' | 'text';
  content: string; // Base64 or plain text
  mimeType?: string;
  fileName?: string;
}

export interface CulturalFlag {
  severity: 'low' | 'medium' | 'high';
  issue: string;
  suggestion: string;
}

export interface LocalizationResult {
  translatedText: string;
  culturalNotes: string[];
  suggestedVisualChanges: string;
  culturalFlags: CulturalFlag[];
  brandVoiceCheck: string;
  localizedAudioUrl?: string;
  localizedImageUrl?: string;
  qualityScore: number;
}

export enum TargetLanguage {
  JAPANESE = 'Japanese',
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German',
  CHINESE = 'Mandarin Chinese',
  ARABIC = 'Arabic'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
