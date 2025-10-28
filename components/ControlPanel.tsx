import React, { useEffect } from 'react';
import { OptionSelector } from './OptionSelector';
import { SparklesIcon } from './icons/SparklesIcon';
import type { StyleOptions, FormattingOptions, Tone, Style, Voice, ScriptType, NumberOfSpeakers, TopicSuggestionItem, SavedIdea, AiProvider } from '../types';
import { TONE_OPTIONS, STYLE_OPTIONS, VOICE_OPTIONS, LANGUAGE_OPTIONS, SCRIPT_TYPE_OPTIONS, NUMBER_OF_SPEAKERS_OPTIONS, AI_PROVIDER_OPTIONS, GEMINI_MODELS, OPENAI_MODELS } from '../constants';
import { IdeaBrainstorm } from './IdeaBrainstorm';
import { Tooltip } from './Tooltip';
import { TONE_EXPLANATIONS, STYLE_EXPLANATIONS, VOICE_EXPLANATIONS, FORMATTING_EXPLANATIONS } from '../constants/explanations';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { IdeaFileUploader } from './IdeaFileUploader';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { CheckIcon } from './icons/CheckIcon';


interface ControlPanelProps {
  title: string;
  setTitle: (title: string) => void;
  outlineContent: string;
  setOutlineContent: (content: string) => void;
  onGenerateSuggestions: () => void;
  isSuggesting: boolean;
  suggestions: TopicSuggestionItem[];
  suggestionError: string | null;
  hasGeneratedTopicSuggestions: boolean;
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
  hasGeneratedKeywordSuggestions: boolean;
  scriptType: ScriptType;
  setScriptType: (type: ScriptType) => void;
  numberOfSpeakers: NumberOfSpeakers;
  setNumberOfSpeakers: (num: NumberOfSpeakers) => void;
  onSuggestStyle: () => void;
  isSuggestingStyle: boolean;
  styleSuggestionError: string | null;
  hasSuggestedStyle: boolean;
  lengthType: 'words' | 'duration';
  setLengthType: (type: 'words' | 'duration') => void;
  videoDuration: string;
  setVideoDuration: (duration: string) => void;
  savedIdeas: SavedIdea[];
  onSaveIdea: (idea: TopicSuggestionItem) => void;
  onOpenSavedIdeasModal: () => void;
  onParseFile: (content: string) => void;
  isParsingFile: boolean;
  parsingFileError: string | null;
  uploadedIdeas: TopicSuggestionItem[];
  aiProvider: AiProvider;
  setAiProvider: (provider: AiProvider) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  title, setTitle,
  outlineContent, setOutlineContent,
  onGenerateSuggestions, isSuggesting, suggestions, suggestionError, hasGeneratedTopicSuggestions,
  targetAudience, setTargetAudience,
  styleOptions, setStyleOptions,
  keywords, setKeywords,
  formattingOptions, setFormattingOptions,
  wordCount, setWordCount,
  scriptParts, setScriptParts,
  onGenerate, isLoading,
  onGenerateKeywordSuggestions, isSuggestingKeywords, keywordSuggestions, keywordSuggestionError, hasGeneratedKeywordSuggestions,
  scriptType, setScriptType,
  numberOfSpeakers, setNumberOfSpeakers,
  onSuggestStyle, isSuggestingStyle, styleSuggestionError, hasSuggestedStyle,
  lengthType, setLengthType, videoDuration, setVideoDuration,
  savedIdeas, onSaveIdea, onOpenSavedIdeasModal,
  onParseFile, isParsingFile, parsingFileError, uploadedIdeas,
  aiProvider, setAiProvider, selectedModel, setSelectedModel
}) => {
  const handleCheckboxChange = (key: keyof FormattingOptions, value: boolean) => {
    setFormattingOptions({ ...formattingOptions, [key]: value });
  };

  const handleAddKeyword = (keyword: string) => {
    setKeywords(keywords ? `${keywords}, ${keyword}` : keyword);
  };
  
  const isIdeaSaved = (idea: TopicSuggestionItem) => {
    return savedIdeas.some(saved => saved.title === idea.title && saved.outline === idea.outline);
  };

  const handleSaveAll = (ideasToSave: TopicSuggestionItem[]) => {
      ideasToSave.forEach(idea => {
          if (!isIdeaSaved(idea)) {
              onSaveIdea(idea);
          }
      });
  };

  const handleProviderChange = (provider: AiProvider) => {
    setAiProvider(provider);
    // Set default model for the new provider
    if (provider === 'gemini') {
        setSelectedModel(GEMINI_MODELS[0].value);
    } else {
        setSelectedModel(OPENAI_MODELS[0].value);
    }
  };

  const modelOptions = aiProvider === 'gemini' ? GEMINI_MODELS : OPENAI_MODELS;

  const IdeaList: React.FC<{
    ideaList: TopicSuggestionItem[], 
    listTitle: string,
  }> = ({ ideaList, listTitle }) => (
    <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-text-secondary">{listTitle}:</p>
            {ideaList.length > 0 && (
                <button 
                    onClick={() => handleSaveAll(ideaList)}
                    className="flex items-center gap-1 text-xs bg-secondary hover:bg-primary text-text-secondary px-2 py-1 rounded-md transition"
                    aria-label="Lưu tất cả ý tưởng hiển thị"
                >
                    <BookmarkIcon className="w-3 h-3"/>
                    <span>Lưu tất cả</span>
                </button>
            )}
        </div>
        <div className="h-48 min-h-[10rem] resize-y overflow-auto border border-primary/50 rounded-md space-y-2 p-2">
            {ideaList.map((idea, index) => (
                <div key={`${listTitle}-${idea.title}-${index}`} className="text-left text-sm w-full p-3 rounded-md bg-primary/70">
                  <strong className="text-text-primary block">{idea.title}</strong>
                  {idea.vietnameseTitle && idea.vietnameseTitle !== idea.title && <span className="text-xs mt-1 block text-accent/80">{idea.vietnameseTitle}</span>}
                  <span className="text-xs mt-1 block text-text-secondary">{idea.outline}</span>
                  <div className="flex items-center gap-2 mt-2">
                    <button 
                      onClick={() => {
                        setTitle(idea.title);
                        setOutlineContent(idea.outline);
                      }}
                      className="text-xs bg-accent/80 hover:bg-accent text-white px-2 py-1 rounded-md transition"
                    >
                        Sử dụng
                    </button>
                    <button 
                      onClick={() => onSaveIdea(idea)}
                      disabled={isIdeaSaved(idea)}
                      className="flex items-center gap-1 text-xs bg-secondary hover:bg-primary text-text-secondary px-2 py-1 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <BookmarkIcon className="w-3 h-3"/>
                      {isIdeaSaved(idea) ? 'Đã lưu' : 'Lưu'}
                    </button>
                  </div>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="bg-secondary rounded-lg p-6 shadow-xl space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-2">1. Ý tưởng chính</label>
        <input
          id="title"
          type="text"
          className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
          placeholder="Nhập Tiêu đề Video, VD: 'Tương lai của du hành vũ trụ'"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          id="outline"
          rows={4}
          className="mt-2 w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
          placeholder="Phác họa nội dung (tùy chọn), VD: 'Đề cập đến SpaceX, Blue Origin. Các thách thức về công nghệ. Tầm nhìn 50 năm tới.'"
          value={outlineContent}
          onChange={(e) => setOutlineContent(e.target.value)}
        />
        <IdeaBrainstorm setTitle={setTitle} setOutlineContent={setOutlineContent} />
        <IdeaFileUploader 
            onParse={onParseFile}
            isLoading={isParsingFile}
            error={parsingFileError}
        />
        <div className="grid grid-cols-2 gap-2 mt-4">
            <button 
              onClick={onGenerateSuggestions} 
              disabled={isSuggesting || !title || isLoading}
              className="w-full flex items-center justify-center bg-secondary hover:bg-primary disabled:bg-primary/50 disabled:cursor-not-allowed text-text-primary font-bold py-2 px-4 rounded-lg transition"
            >
              {isSuggesting ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  <span>Gợi ý AI</span>
                  {!isSuggesting && hasGeneratedTopicSuggestions && <CheckIcon className="w-5 h-5 ml-2 text-green-400" />}
                </>
              )}
            </button>
            <button 
              onClick={onOpenSavedIdeasModal} 
              className="w-full flex items-center justify-center bg-secondary hover:bg-primary text-text-primary font-bold py-2 px-4 rounded-lg transition"
            >
              <LightbulbIcon className="w-5 h-5 mr-2" />
              Kho Ý Tưởng
            </button>
        </div>

        {suggestionError && <p className="text-red-400 text-sm mt-2">{suggestionError}</p>}
        {suggestions.length > 0 && <IdeaList ideaList={suggestions} listTitle="Gợi ý từ AI" />}
        {uploadedIdeas.length > 0 && <IdeaList ideaList={uploadedIdeas} listTitle="Ý tưởng từ File của bạn" />}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">2. Nhà cung cấp AI & Model</label>
        <div className="flex bg-primary/70 rounded-lg p-1 mb-3">
            {AI_PROVIDER_OPTIONS.map(option => (
                <button
                    key={option.value}
                    onClick={() => handleProviderChange(option.value)}
                    className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${
                        aiProvider === option.value ? 'bg-accent text-white' : 'text-text-secondary hover:bg-primary'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
         <select
          id="model"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
        >
          {modelOptions.map(model => (
            <option key={model.value} value={model.value}>{model.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-text-secondary mb-2">3. Từ khóa (Tùy chọn)</label>
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
          disabled={isSuggestingKeywords || !title || isLoading}
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
              <span>Gợi ý từ khóa</span>
              {!isSuggestingKeywords && hasGeneratedKeywordSuggestions && <CheckIcon className="w-4 h-4 ml-2 text-green-400" />}
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
        <label className="block text-sm font-medium text-text-secondary mb-2">4. Định dạng Kịch bản</label>
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
            title="5. Số lượng người nói"
            options={NUMBER_OF_SPEAKERS_OPTIONS}
            selectedOption={numberOfSpeakers}
            onSelect={setNumberOfSpeakers}
        />
      )}

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-text-secondary mb-2">{scriptType === 'Podcast' ? '6' : '5'}. Ngôn ngữ</label>
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
            disabled={isSuggestingStyle || !title || isLoading}
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
                    <span>AI Gợi ý (Mục 6, 7, 8)</span>
                    {!isSuggestingStyle && hasSuggestedStyle && <CheckIcon className="w-5 h-5 ml-2 text-green-400" />}
                </>
            )}
        </button>
        {styleSuggestionError && <p className="text-red-400 text-sm -mt-2 mb-2 text-center">{styleSuggestionError}</p>}
      </div>

      <OptionSelector<Tone>
        title={`${scriptType === 'Podcast' ? '7' : '6'}. Tông giọng (Tone)`}
        options={TONE_OPTIONS}
        selectedOption={styleOptions.tone}
        onSelect={(option) => setStyleOptions({ ...styleOptions, tone: option })}
        explanations={TONE_EXPLANATIONS}
      />

      <OptionSelector<Style>
        title={`${scriptType === 'Podcast' ? '8' : '7'}. Phong cách (Style)`}
        options={STYLE_OPTIONS}
        selectedOption={styleOptions.style}
        onSelect={(option) => setStyleOptions({ ...styleOptions, style: option })}
        explanations={STYLE_EXPLANATIONS}
      />
      
      <OptionSelector<Voice>
        title={`${scriptType === 'Podcast' ? '9' : '8'}. Lối diễn đạt (Voice)`}
        options={VOICE_OPTIONS}
        selectedOption={styleOptions.voice}
        onSelect={(option) => setStyleOptions({ ...styleOptions, voice: option })}
        explanations={VOICE_EXPLANATIONS}
      />

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">{scriptType === 'Podcast' ? '10' : '9'}. Cấu trúc & Định dạng</label>
        
        <div className="flex bg-primary/70 rounded-lg p-1 mb-4">
            <button
                onClick={() => setLengthType('words')}
                className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${
                    lengthType === 'words' ? 'bg-accent text-white' : 'text-text-secondary hover:bg-primary'
                }`}
            >
                Theo số từ
            </button>
            <button
                onClick={() => setLengthType('duration')}
                className={`w-full py-2 text-sm font-semibold rounded-md transition-colors ${
                    lengthType === 'duration' ? 'bg-accent text-white' : 'text-text-secondary hover:bg-primary'
                }`}
            >
                Theo thời lượng
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lengthType === 'words' ? (
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
            ) : (
                <Tooltip text={FORMATTING_EXPLANATIONS.videoDuration}>
                    <div>
                        <label htmlFor="videoDuration" className="block text-xs font-medium text-text-secondary mb-1">Thời lượng video (phút)</label>
                        <input id="videoDuration" type="number" value={videoDuration} onChange={e => setVideoDuration(e.target.value)} className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition" placeholder="VD: 5"/>
                         {scriptType === 'Video' && videoDuration && (parseInt(videoDuration, 10) * 150) > 1000 && (
                             <p className="text-xs text-amber-400 mt-2">
                                Lưu ý: Với kịch bản dài (&gt;1000 từ), AI sẽ tạo một dàn ý chi tiết để đảm bảo chất lượng.
                            </p>
                        )}
                    </div>
                </Tooltip>
            )}

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
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4">
            <Tooltip text={FORMATTING_EXPLANATIONS.includeIntro} className="block">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent bg-primary/70" checked={formattingOptions.includeIntro} onChange={(e) => handleCheckboxChange('includeIntro', e.target.checked)} />
                    <span className="text-text-primary">Intro</span>
                </label>
            </Tooltip>
             <Tooltip text={FORMATTING_EXPLANATIONS.includeOutro} className="block">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent bg-primary/70" checked={formattingOptions.includeOutro} onChange={(e) => handleCheckboxChange('includeOutro', e.target.checked)} />
                    <span className="text-text-primary">Outro</span>
                </label>
            </Tooltip>
            <Tooltip text={FORMATTING_EXPLANATIONS.headings} className="block">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent bg-primary/70" checked={formattingOptions.headings} onChange={(e) => handleCheckboxChange('headings', e.target.checked)} />
                    <span className="text-text-primary">Tiêu đề</span>
                </label>
            </Tooltip>
            <Tooltip text={FORMATTING_EXPLANATIONS.bullets} className="block">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent bg-primary/70" checked={formattingOptions.bullets} onChange={(e) => handleCheckboxChange('bullets', e.target.checked)} />
                    <span className="text-text-primary">Gạch đầu dòng</span>
                </label>
            </Tooltip>
             <Tooltip text={FORMATTING_EXPLANATIONS.bold} className="block">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent bg-primary/70" checked={formattingOptions.bold} onChange={(e) => handleCheckboxChange('bold', e.target.checked)} />
                    <span className="text-text-primary">In đậm/nghiêng</span>
                </label>
            </Tooltip>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading || !title}
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
