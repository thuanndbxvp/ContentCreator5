// Literal types from constants
export type Tone = 'Formal' | 'Informative' | 'Conversational' | 'Persuasive' | 'Humorous' | 'Empathetic' | 'Inspirational';
export type Style = 'Narrative' | 'Descriptive' | 'Expository' | 'Persuasive' | 'Technical' | 'Academic' | 'Business';
export type Voice = 'Authoritative' | 'Conversational' | 'Personal' | 'Humorous' | 'Professional' | 'Empathetic' | 'Persuasive';
export type ScriptType = 'Video' | 'Podcast';
export type NumberOfSpeakers = 'Auto' | '2' | '3' | '4' | '5';
export type AiProvider = 'gemini' | 'openai' | 'elevenlabs';

// Options interfaces
export interface StyleOptions {
  tone: Tone;
  style: Style;
  voice: Voice;
}

export interface FormattingOptions {
  headings: boolean;
  bullets: boolean;

  bold: boolean;
  includeIntro: boolean;
  includeOutro: boolean;
}

// Data structures
export interface ElevenlabsVoice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url: string;
}

export interface TopicSuggestionItem {
    title: string;
    vietnameseTitle?: string;
    outline: string;
}

export interface SavedIdea {
  id: number;
  title: string;
  vietnameseTitle?: string;
  outline: string;
}

export interface CachedData {
  visualPrompts: Record<string, VisualPrompt>;
  allVisualPrompts: AllVisualPromptsResult[] | null;
  summarizedScript: ScriptPartSummary[] | null;
  extractedDialogue: Record<string, string> | null;
  hasExtractedDialogue: boolean;
  hasGeneratedAllVisualPrompts: boolean;
  hasSummarizedScript: boolean;
}

export interface LibraryItem {
  id: number;
  title: string;
  outlineContent: string;
  script: string;
  cachedData?: CachedData;
}

export interface GenerationParams {
  title: string;
  outlineContent: string;
  targetAudience: string;
  styleOptions: StyleOptions;
  keywords: string;
  formattingOptions: FormattingOptions;
  wordCount: string;
  scriptParts: string;
  scriptType: ScriptType;
  numberOfSpeakers: NumberOfSpeakers;
}

export interface VisualPrompt {
    english: string;
    vietnamese: string;
}

export interface AllVisualPromptsResult {
    scene: string;
    english: string;
    vietnamese: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface SceneSummary {
  sceneNumber: number;
  summary: string;
  visualPrompt: string;
}

export interface ScriptPartSummary {
  partTitle: string;
  scenes: SceneSummary[];
}

export interface WordCountStats {
  sections: { title: string; count: number }[];
  total: number;
}