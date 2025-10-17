import React from 'react';
import { OptionSelector } from './OptionSelector';
import { SparklesIcon } from './icons/SparklesIcon';
import type { StyleOptions, FormattingOptions, Tone, Style, Voice, ScriptType, NumberOfSpeakers } from '../types';
import { TONE_OPTIONS, STYLE_OPTIONS, VOICE_OPTIONS, LANGUAGE_OPTIONS, SCRIPT_TYPE_OPTIONS, NUMBER_OF_SPEAKERS_OPTIONS } from '../constants';
import { IdeaBrainstorm } from './IdeaBrainstorm';
import { Tooltip } from './Tooltip';
import { TONE_EXPLANATIONS, STYLE_EXPLANATIONS, VOICE_EXPLANATIONS, FORMATTING_EXPLANATIONS } from '../constants/explanations';

interface ControlPanelProps {
  topic: string;
  setTopic: (topic: string) => void;
  onGenerateSuggestions: () => void;
  isSuggesting: boolean;
  suggestions: string[];
  suggestionError: string | null;
  targetAudience: string;
  setTargetAudience: (audience: string) => void;
  styleOptions: StyleOptions;
  setStyleOptions: (options: StyleOptions) => void;
  keywords: string;
  setKeywords: (keywords: string) => void;
  formattingOptions: FormattingOptions;
  setFormattingOptions: (options: FormattingOptions) => void;
  wordCount: string;
  setWordCount: (count: string) => void;
  scriptParts: string;
  setScriptParts: (parts: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onGenerateKeywordSuggestions: () => void;
  isSuggestingKeywords: boolean;
  keywordSuggestions: string[];
  keywordSuggestionError: string | null;
  scriptType: ScriptType;
  setScriptType: (type: ScriptType) => void;
  numberOfSpeakers: NumberOfSpeakers;
  setNumberOfSpeakers: (num: NumberOfSpeakers) => void;
  onSuggestStyle: () => void;
  isSuggestingStyle: boolean;
  styleSuggestionError: string | null;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  topic, setTopic,
  onGenerateSuggestions, isSuggesting, suggestions, suggestionError,
  targetAudience, setTargetAudience,
  styleOptions, setStyleOptions,
  keywords, setKeywords,
  formattingOptions, setFormattingOptions,
  wordCount, setWordCount,
  scriptParts, setScriptParts,
  onGenerate, isLoading,
  onGenerateKeywordSuggestions, isSuggestingKeywords, keywordSuggestions, keywordSuggestionError,
  scriptType, setScriptType,
  numberOfSpeakers, setNumberOfSpeakers,
  onSuggestStyle, isSuggestingStyle, styleSuggestionError
}) => {
  const handleCheckboxChange = (key: keyof FormattingOptions, value: boolean) => {
    setFormattingOptions({ ...formattingOptions, [key]: value });
  };

  const handleAddKeyword = (keyword: string) => {
    setKeywords(keywords ? `${keywords}, ${keyword}` : keyword);
  };

  return (
    <div className="bg-secondary rounded-lg p-6 shadow-xl space-y-6">
      <div>
        <label htmlFor="topic" className="block text-sm font-medium text-text-secondary mb-2">1. Chủ đề</label>
        <textarea
          id="topic"
          rows={3}
          className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
          placeholder="Nhập ý tưởng chung, VD: 'Tương lai của du hành vũ trụ'"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <IdeaBrainstorm setTopic={setTopic} />
        <button 
          onClick={onGenerateSuggestions} 
          disabled={isSuggesting || !topic}
          className="w-full mt-4 flex items-center justify-center bg-secondary hover:bg-primary disabled:bg-primary/50 disabled:cursor-not-allowed text-text-primary font-bold py-2 px-4 rounded-lg transition"
        >
          {isSuggesting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang tìm ý tưởng...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Gợi ý từ AI
            </>
          )}
        </button>
        {suggestionError && <p className="text-red-400 text-sm mt-2">{suggestionError}</p>}
        {suggestions.length > 0 && (
            <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-text-secondary">Chọn một chủ đề hoặc giữ nguyên chủ đề của bạn:</p>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {suggestions.map((suggestion, index) => (
                        <button key={index} onClick={() => setTopic(suggestion)} className="text-left text-sm w-full p-2 rounded-md bg-primary/70 hover:bg-primary text-text-secondary hover:text-text-primary transition">
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
      
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-text-secondary mb-2">2. Từ khóa (Tùy chọn)</label>
        <input
          id="keywords"
          type="text"
          className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
          placeholder="VD: AI, sáng tạo, tương lai"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
        <button 
          onClick={onGenerateKeywordSuggestions} 
          disabled={isSuggestingKeywords || !topic}
          className="w-full mt-2 flex items-center justify-center bg-secondary/70 hover:bg-primary disabled:bg-primary/50 disabled:cursor-not-allowed text-text-secondary py-2 px-4 rounded-lg transition text-sm"
        >
          {isSuggestingKeywords ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang gợi ý...
            </>
          ) : (
            <>
              <SparklesIcon className="w-4 h-4 mr-2" />
              Gợi ý từ khóa
            </>
          )}
        </button>
        <p className="text-xs text-text-secondary/80 mt-1">
          Nhập các từ khóa cách nhau bằng dấu phẩy. AI sẽ cố gắng đưa chúng vào kịch bản một cách tự nhiên.
        </p>
        {keywordSuggestionError && <p className="text-red-400 text-sm mt-2">{keywordSuggestionError}</p>}
        {keywordSuggestions.length > 0 && (
            <div className="mt-3">
                <p className="text-xs font-medium text-text-secondary mb-2">Gợi ý:</p>
                <div className="flex flex-wrap gap-2">
                    {keywordSuggestions.map((suggestion, index) => (
                        <button key={index} onClick={() => handleAddKeyword(suggestion)} className="px-3 py-1 text-xs font-medium rounded-full transition-colors bg-primary/70 hover:bg-primary text-text-secondary">
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">3. Định dạng Kịch bản</label>
        <div className="flex bg-primary/70 rounded-lg p-1">
            {SCRIPT_TYPE_OPTIONS.map(option => (
                <button
                    key={option.value}
                    onClick={() => setScriptType(option.value)}
                    className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${
                        scriptType === option.value ? 'bg-accent text-white' : 'text-text-secondary hover:bg-primary'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
      </div>

      {scriptType === 'Podcast' && (
        <OptionSelector<NumberOfSpeakers>
            title="4. Số lượng người nói"
            options={NUMBER_OF_SPEAKERS_OPTIONS}
            selectedOption={numberOfSpeakers}
            onSelect={setNumberOfSpeakers}
        />
      )}

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-text-secondary mb-2">{scriptType === 'Podcast' ? '5' : '4'}. Ngôn ngữ</label>
        <select
          id="language"
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
        >
          {LANGUAGE_OPTIONS.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>

      <div className="pt-4 mt-4 border-t border-primary/50">
        <button 
            onClick={onSuggestStyle}
            disabled={isSuggestingStyle || !topic}
            className="w-full mb-4 flex items-center justify-center bg-secondary hover:bg-primary disabled:bg-primary/50 disabled:cursor-not-allowed text-text-primary font-semibold py-2 px-4 rounded-lg transition"
        >
            {isSuggestingStyle ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang phân tích...
                </>
            ) : (
                <>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    AI Gợi ý (Mục 5, 6, 7)
                </>
            )}
        </button>
        {styleSuggestionError && <p className="text-red-400 text-sm -mt-2 mb-2 text-center">{styleSuggestionError}</p>}
      </div>

      <OptionSelector<Tone>
        title={`${scriptType === 'Podcast' ? '6' : '5'}. Tông giọng (Tone)`}
        options={TONE_OPTIONS}
        selectedOption={styleOptions.tone}
        onSelect={(option) => setStyleOptions({ ...styleOptions, tone: option })}
        explanations={TONE_EXPLANATIONS}
      />

      <OptionSelector<Style>
        title={`${scriptType === 'Podcast' ? '7' : '6'}. Phong cách (Style)`}
        options={STYLE_OPTIONS}
        selectedOption={styleOptions.style}
        onSelect={(option) => setStyleOptions({ ...styleOptions, style: option })}
        explanations={STYLE_EXPLANATIONS}
      />
      
      <OptionSelector<Voice>
        title={`${scriptType === 'Podcast' ? '8' : '7'}. Lối diễn đạt (Voice)`}
        options={VOICE_OPTIONS}
        selectedOption={styleOptions.voice}
        onSelect={(option) => setStyleOptions({ ...styleOptions, voice: option })}
        explanations={VOICE_EXPLANATIONS}
      />

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">{scriptType === 'Podcast' ? '9' : '8'}. Cấu trúc & Định dạng</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Tooltip text={FORMATTING_EXPLANATIONS.wordCount}>
                <div>
                    <label htmlFor="wordCount" className="block text-xs font-medium text-text-secondary mb-1">Tổng số từ</label>
                    <input id="wordCount" type="number" value={wordCount} onChange={e => setWordCount(e.target.value)} className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition" placeholder="VD: 800"/>
                    {scriptType === 'Video' && parseInt(wordCount, 10) > 1000 && (
                        <p className="text-xs text-amber-400 mt-2">
                            Lưu ý: Với kịch bản dài (&gt;1000 từ), AI sẽ tạo một dàn ý chi tiết để đảm bảo chất lượng.
                        </p>
                    )}
                </div>
            </Tooltip>
            {scriptType === 'Video' && (
              <Tooltip text={FORMATTING_EXPLANATIONS.scriptParts}>
                  <div>
                      <label htmlFor="scriptParts" className="block text-xs font-medium text-text-secondary mb-1">Số phần</label>
                      <div className="flex items-center space-x-2">
                          <input 
                              id="scriptParts" 
                              type="number" 
                              value={scriptParts === 'Auto' ? '' : scriptParts} 
                              onChange={e => setScriptParts(e.target.value)} 
                              disabled={scriptParts === 'Auto'}
                              className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition disabled:bg-primary/50 disabled:cursor-not-allowed" 
                              placeholder="3"
                          />
                          <label className="flex items-center space-x-2 cursor-pointer whitespace-nowrap">
                              <input 
                                  type="checkbox" 
                                  className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent bg-primary/70" 
                                  checked={scriptParts === 'Auto'} 
                                  onChange={(e) => setScriptParts(e.target.checked ? 'Auto' : '3')} 
                              />
                              <span className="text-sm text-text-primary">Tự động</span>
                          </label>
                      </div>
                  </div>
              </Tooltip>
            )}
        </div>
        <div className="space-y-2 mt-4">
            <Tooltip text={FORMATTING_EXPLANATIONS.includeIntro} className="block">
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent bg-primary/70" checked={formattingOptions.includeIntro} onChange={(e) => handleCheckboxChange('includeIntro', e.target.checked)} />
                    <span className="text-text-primary">Bao gồm Intro</span>
                </label>
            </Tooltip>
             <Tooltip text={FORMATTING_EXPLANATIONS.includeOutro} className="block">
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent bg-primary/70" checked={formattingOptions.includeOutro} onChange={(e) => handleCheckboxChange('includeOutro', e.target.checked)} />
                    <span className="text-text-primary">Bao gồm Outro</span>
                </label>
            </Tooltip>
            <Tooltip text={FORMATTING_EXPLANATIONS.headings} className="block">
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent bg-primary/70" checked={formattingOptions.headings} onChange={(e) => handleCheckboxChange('headings', e.target.checked)} />
                    <span className="text-text-primary capitalize">Sử dụng Tiêu đề</span>
                </label>
            </Tooltip>
            <Tooltip text={FORMATTING_EXPLANATIONS.bullets} className="block">
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent bg-primary/70" checked={formattingOptions.bullets} onChange={(e) => handleCheckboxChange('bullets', e.target.checked)} />
                    <span className="text-text-primary capitalize">Sử dụng Gạch đầu dòng</span>
                </label>
            </Tooltip>
             <Tooltip text={FORMATTING_EXPLANATIONS.bold} className="block">
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent bg-primary/70" checked={formattingOptions.bold} onChange={(e) => handleCheckboxChange('bold', e.target.checked)} />
                    <span className="text-text-primary capitalize">Sử dụng In đậm/nghiêng</span>
                </label>
            </Tooltip>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !topic}
        className="w-full flex items-center justify-center bg-accent hover:bg-indigo-500 disabled:bg-indigo-400/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 ease-in-out transform hover:scale-105"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tạo...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Tạo kịch bản
          </>
        )}
      </button>
    </div>
  );
};