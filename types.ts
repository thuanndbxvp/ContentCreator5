// Literal types from constants
export type Tone = 'Formal' | 'Informative' | 'Conversational' | 'Persuasive' | 'Humorous' | 'Empathetic' | 'Inspirational';
export type Style = 'Narrative' | 'Descriptive' | 'Expository' | 'Persuasive' | 'Technical' | 'Academic' | 'Business';
export type Voice = 'Authoritative' | 'Conversational' | 'Personal' | 'Humorous' | 'Professional' | 'Empathetic' | 'Persuasive';
export type ScriptType = 'Video' | 'Podcast';
export type NumberOfSpeakers = 'Auto' | '2' | '3' | '4' | '5';

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

export interface CachedData {
  visualPrompts: Record<string, VisualPrompt>;
  allVisualPrompts: AllVisualPromptsResult[] | null;
  summarizedScript: ScriptPartSummary[] | null;
  extractedDialogue: string | null;
  hasExtractedDialogue: boolean;
  hasGeneratedAllVisualPrompts: boolean;
  hasSummarizedScript: boolean;
}

export interface LibraryItem {
  id: number;
  topic: string;
  script: string;
  cachedData?: CachedData;
}

export interface GenerationParams {
  topic: string;
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