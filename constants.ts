import type { Tone, Style, Voice, ScriptType, NumberOfSpeakers, AiProvider } from './types';

interface LabeledOption<T> {
  value: T;
  label: string;
}

export const AI_PROVIDER_OPTIONS: LabeledOption<AiProvider>[] = [
    { value: 'gemini', label: 'Google Gemini' },
    { value: 'openai', label: 'OpenAI' },
];

export const GEMINI_MODELS: LabeledOption<string>[] = [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
];

export const OPENAI_MODELS: LabeledOption<string>[] = [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];


export const SCRIPT_TYPE_OPTIONS: LabeledOption<ScriptType>[] = [
    { value: 'Video', label: 'Video YouTube' },
    { value: 'Podcast', label: 'Podcast' },
];

export const NUMBER_OF_SPEAKERS_OPTIONS: LabeledOption<NumberOfSpeakers>[] = [
  { value: 'Auto', label: 'Tự động' },
  { value: '2', label: '2 người' },
  { value: '3', label: '3 người' },
  { value: '4', label: '4 người' },
  { value: '5', label: '5 người' },
];

export const TONE_OPTIONS: LabeledOption<Tone>[] = [
  { value: 'Formal', label: 'Trang trọng' },
  { value: 'Informative', label: 'Cung cấp thông tin' },
  { value: 'Conversational', label: 'Thân mật' },
  { value: 'Persuasive', label: 'Thuyết phục' },
  { value: 'Humorous', label: 'Hài hước' },
  { value: 'Empathetic', label: 'Đồng cảm' },
  { value: 'Inspirational', label: 'Truyền cảm hứng' },
];

export const STYLE_OPTIONS: LabeledOption<Style>[] = [
  { value: 'Narrative', label: 'Kể chuyện' },
  { value: 'Descriptive', label: 'Miêu tả' },
  { value: 'Expository', label: 'Giải thích' },
  { value: 'Persuasive', label: 'Thuyết phục' },
  { value: 'Technical', label: 'Kỹ thuật' },
  { value: 'Academic', label: 'Học thuật' },
  { value: 'Business', label: 'Kinh doanh' },
];

export const VOICE_OPTIONS: LabeledOption<Voice>[] = [
  { value: 'Authoritative', label: 'Chuyên gia' },
  { value: 'Conversational', label: 'Trò chuyện' },
  { value: 'Personal', label: 'Cá nhân' },
  { value: 'Humorous', label: 'Hài hước' },
  { value: 'Professional', label: 'Chuyên nghiệp' },
  { value: 'Empathetic', label: 'Đồng cảm' },
  { value: 'Persuasive', label: 'Thuyết phục' },
];

export const LANGUAGE_OPTIONS: { value: string, label: string }[] = [
    { value: 'Vietnamese', label: 'Tiếng Việt' },
    { value: 'English', label: 'Tiếng Anh' },
    { value: 'Korean', label: 'Tiếng Hàn' },
    { value: 'Japanese', label: 'Tiếng Nhật' },
    { value: 'Spanish', label: 'Tiếng Tây Ban Nha' },
    { value: 'Portuguese', label: 'Tiếng Bồ Đào Nha' },
    { value: 'Hindi', label: 'Tiếng Hindi' },
];
