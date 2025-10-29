import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { OutputDisplay } from './components/OutputDisplay';
import { LibraryModal } from './components/LibraryModal';
import { DialogueModal } from './components/DialogueModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { VisualPromptModal } from './components/VisualPromptModal';
import { AllVisualPromptsModal } from './components/AllVisualPromptsModal';
import { SummarizeModal } from './components/SummarizeModal';
import { SavedIdeasModal } from './components/SavedIdeasModal';
import { SideToolsPanel } from './components/SideToolsPanel';
import { TtsModal } from './components/TtsModal';
import { generateScript, generateScriptOutline, generateTopicSuggestions, reviseScript, generateScriptPart, extractDialogue, generateKeywordSuggestions, validateApiKey, generateVisualPrompt, generateAllVisualPrompts, summarizeScriptForScenes, suggestStyleOptions, parseIdeasFromFile, getElevenlabsVoices, generateElevenlabsTts } from './services/aiService';
import type { StyleOptions, FormattingOptions, LibraryItem, GenerationParams, VisualPrompt, AllVisualPromptsResult, ScriptPartSummary, ScriptType, NumberOfSpeakers, CachedData, TopicSuggestionItem, SavedIdea, AiProvider, WordCountStats, ElevenlabsVoice } from './types';
import { STYLE_OPTIONS, LANGUAGE_OPTIONS, GEMINI_MODELS } from './constants';

const YoutubeLogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="24" viewBox="0 0 28 20" fill="none" {...props}>
    <path d="M27.42 3.033a3.51 3.51 0 0 0-2.483-2.483C22.768 0 14 0 14 0S5.232 0 3.063.55A3.51 3.51 0 0 0 .58 3.033C0 5.2 0 10 0 10s0 4.8.58 6.967a3.51 3.51 0 0 0 2.483 2.483C5.232 20 14 20 14 20s8.768 0 10.937-.55a3.51 3.51 0 0 0 2.483-2.483C28 14.8 28 10 28 10s0-4.8-.58-6.967z" fill="#FF0000"/>
    <path d="M11.2 14.286V5.714L18.453 10 11.2 14.286z" fill="#FFFFFF"/>
  </svg>
);

const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.375 3.375 0 013.375 17.625a3.375 3.375 0 013.375-3.375h1.5a3.375 3.375 0 013.375 3.375v1.5a3.375 3.375 0 01-3.375 3.375h-1.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75a3.375 3.375 0 013.375-3.375h1.5a3.375 3.375 0 013.375 3.375v1.5a3.375 3.375 0 01-3.375 3.375h-1.5a3.375 3.375 0 01-3.375-3.375zM9 9.75a3.375 3.375 0 013.375-3.375h1.5a3.375 3.375 0 013.375 3.375v1.5a3.375 3.375 0 01-3.375 3.375h-1.5A3.375 3.375 0 019 11.25v-1.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.75a3.375 3.375 0 013.375-3.375h1.5a3.375 3.375 0 013.375 3.375v1.5a3.375 3.375 0 01-3.375 3.375h-1.5a3.375 3.375 0 01-3.375-3.375zM9 3.75a3.375 3.375 0 013.375-3.375h1.5a3.375 3.375 0 013.375 3.375v1.5A3.375 3.375 0 0113.875 9h-1.5A3.375 3.375 0 019 5.25v-1.5z" />
  </svg>
);

const THEMES = [
  { name: 'Sky', color: '#38bdf8' },
  { name: 'Rose', color: '#f43f5e' },
  { name: 'Teal', color: '#2dd4bf' },
  { name: 'Violet', color: '#8b5cf6' },
  { name: 'Amber', color: '#f59e0b' },
];

const calculateWordCountsFromDialogue = (dialogueObject: Record<string, string>): WordCountStats => {
    const countWords = (text: string): number => {
        if (!text) return 0;
        return text.trim().split(/\s+/).filter(Boolean).length;
    };

    const sections = Object.entries(dialogueObject).map(([title, content]) => ({
        title,
        count: countWords(content)
    }));

    const total = sections.reduce((sum, section) => sum + section.count, 0);

    return { sections, total };
};


const App: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [outlineContent, setOutlineContent] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>(LANGUAGE_OPTIONS[1].value);
  const [styleOptions, setStyleOptions] = useState<StyleOptions>({
    expression: 'Conversational',
    style: STYLE_OPTIONS[0].value,
  });
  const [keywords, setKeywords] = useState<string>('');
  const [formattingOptions, setFormattingOptions] = useState<FormattingOptions>({
    headings: true,
    bullets: true,
    bold: true,
    includeIntro: false,
    includeOutro: false,
  });
  const [wordCount, setWordCount] = useState<string>('800');
  const [scriptParts, setScriptParts] = useState<string>('Auto');
  const [scriptType, setScriptType] = useState<ScriptType>('Video');
  const [numberOfSpeakers, setNumberOfSpeakers] = useState<NumberOfSpeakers>('Auto');
  const [lengthType, setLengthType] = useState<'words' | 'duration'>('words');
  const [videoDuration, setVideoDuration] = useState<string>('5');

  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [topicSuggestions, setTopicSuggestions] = useState<TopicSuggestionItem[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [hasGeneratedTopicSuggestions, setHasGeneratedTopicSuggestions] = useState<boolean>(false);

  const [uploadedIdeas, setUploadedIdeas] = useState<TopicSuggestionItem[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsingError, setParsingError] = useState<string | null>(null);

  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [isSuggestingKeywords, setIsSuggestingKeywords] = useState<boolean>(false);
  const [keywordSuggestionError, setKeywordSuggestionError] = useState<string | null>(null);
  const [hasGeneratedKeywordSuggestions, setHasGeneratedKeywordSuggestions] = useState<boolean>(false);

  const [isSuggestingStyle, setIsSuggestingStyle] = useState<boolean>(false);
  const [styleSuggestionError, setStyleSuggestionError] = useState<string | null>(null);
  const [hasSuggestedStyle, setHasSuggestedStyle] = useState<boolean>(false);

  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);

  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [isSavedIdeasModalOpen, setIsSavedIdeasModalOpen] = useState<boolean>(false);

  const [revisionPrompt, setRevisionPrompt] = useState<string>('');
  const [revisionCount, setRevisionCount] = useState<number>(0);

  const [isGeneratingSequentially, setIsGeneratingSequentially] = useState<boolean>(false);
  const [outlineParts, setOutlineParts] = useState<string[]>([]);
  const [currentPartIndex, setCurrentPartIndex] = useState<number>(0);

  const [isDialogueModalOpen, setIsDialogueModalOpen] = useState<boolean>(false);
  const [extractedDialogue, setExtractedDialogue] = useState<Record<string, string> | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [apiKeys, setApiKeys] = useState<Record<AiProvider, string[]>>({ gemini: [], openai: [], elevenlabs: [] });

  const [isVisualPromptModalOpen, setIsVisualPromptModalOpen] = useState<boolean>(false);
  const [visualPrompt, setVisualPrompt] = useState<VisualPrompt | null>(null);
  const [isGeneratingVisualPrompt, setIsGeneratingVisualPrompt] = useState<boolean>(false);
  const [visualPromptError, setVisualPromptError] = useState<string | null>(null);

  const [isAllVisualPromptsModalOpen, setIsAllVisualPromptsModalOpen] = useState<boolean>(false);
  const [allVisualPrompts, setAllVisualPrompts] = useState<AllVisualPromptsResult[] | null>(null);
  const [isGeneratingAllVisualPrompts, setIsGeneratingAllVisualPrompts] = useState<boolean>(false);
  const [allVisualPromptsError, setAllVisualPromptsError] = useState<string | null>(null);

  const [isSummarizeModalOpen, setIsSummarizeModalOpen] = useState<boolean>(false);
  const [summarizedScript, setSummarizedScript] = useState<ScriptPartSummary[] | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [summarizationError, setSummarizationError] = useState<string | null>(null);

  const [isTtsModalOpen, setIsTtsModalOpen] = useState<boolean>(false);
  const [ttsVoices, setTtsVoices] = useState<ElevenlabsVoice[]>([]);
  const [isFetchingTtsVoices, setIsFetchingTtsVoices] = useState<boolean>(false);
  const [ttsModalError, setTtsModalError] = useState<string | null>(null);

  const [aiProvider, setAiProvider] = useState<AiProvider>('gemini');
  const [selectedModel, setSelectedModel] = useState<string>(GEMINI_MODELS[1].value);

  const [visualPromptsCache, setVisualPromptsCache] = useState<Map<string, VisualPrompt>>(new Map());
  const [allVisualPromptsCache, setAllVisualPromptsCache] = useState<AllVisualPromptsResult[] | null>(null);
  const [summarizedScriptCache, setSummarizedScriptCache] = useState<ScriptPartSummary[] | null>(null);
  const [extractedDialogueCache, setExtractedDialogueCache] = useState<Record<string, string> | null>(null);

  const [hasExtractedDialogue, setHasExtractedDialogue] = useState<boolean>(false);
  const [hasGeneratedAllVisualPrompts, setHasGeneratedAllVisualPrompts] = useState<boolean>(false);
  const [hasSummarizedScript, setHasSummarizedScript] = useState<boolean>(false);
  const [hasSavedToLibrary, setHasSavedToLibrary] = useState<boolean>(false);

  const [themeColor, setThemeColor] = useState<string>(THEMES[0].color);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState<boolean>(false);
  const themeSelectorRef = useRef<HTMLDivElement>(null);

  const [wordCountStats, setWordCountStats] = useState<WordCountStats | null>(null);


  useEffect(() => {
    try {
      const savedLibrary = localStorage.getItem('yt-script-library');
      if (savedLibrary) setLibrary(JSON.parse(savedLibrary));
      
      const savedIdeasData = localStorage.getItem('yt-script-saved-ideas');
      if (savedIdeasData) setSavedIdeas(JSON.parse(savedIdeasData));
      
      const savedApiKeys = localStorage.getItem('ai-api-keys');
      if (savedApiKeys) {
        const parsedKeys = JSON.parse(savedApiKeys);
        if (parsedKeys.gemini || parsedKeys.openai || parsedKeys.elevenlabs) {
            setApiKeys({
                gemini: parsedKeys.gemini || [],
                openai: parsedKeys.openai || [],
                elevenlabs: parsedKeys.elevenlabs || [],
            });
        }
      } else {
          const oldGeminiKeys = localStorage.getItem('gemini-api-keys');
          if(oldGeminiKeys) {
              const parsedOldKeys = JSON.parse(oldGeminiKeys);
              if (Array.isArray(parsedOldKeys)) {
                  const newKeys = { gemini: parsedOldKeys, openai: [], elevenlabs: [] };
                  setApiKeys(newKeys);
                  localStorage.setItem('ai-api-keys', JSON.stringify(newKeys));
                  localStorage.removeItem('gemini-api-keys');
              }
          }
      }
      
      const savedTheme = localStorage.getItem('yt-script-theme');
      if (savedTheme) setThemeColor(savedTheme);

    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('yt-script-theme', themeColor);
    document.documentElement.style.setProperty('--color-accent', themeColor);
  }, [themeColor]);
  
  useEffect(() => {
    localStorage.setItem('yt-script-saved-ideas', JSON.stringify(savedIdeas));
  }, [savedIdeas]);

  useEffect(() => {
    localStorage.setItem('ai-api-keys', JSON.stringify(apiKeys));
  }, [apiKeys]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeSelectorRef.current && !themeSelectorRef.current.contains(event.target as Node)) {
        setIsThemeSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    setHasGeneratedTopicSuggestions(false);
    setHasGeneratedKeywordSuggestions(false);
    setHasSuggestedStyle(false);
  }, [title, outlineContent]);


  const resetCachesAndStates = () => {
    setVisualPromptsCache(new Map());
    setAllVisualPromptsCache(null);
    setSummarizedScriptCache(null);
    setExtractedDialogueCache(null);
    setHasExtractedDialogue(false);
    setHasGeneratedAllVisualPrompts(false);
    setHasSummarizedScript(false);
    setHasSavedToLibrary(false);
    setWordCountStats(null);
  };


  const handleSaveApiKeys = (keysToSave: Record<AiProvider, string[]>) => {
    setApiKeys(keysToSave);
  };


  const handleSaveToLibrary = useCallback(() => {
    if (!generatedScript.trim() || !title.trim()) return;

    const cachedData: CachedData = {
        visualPrompts: Object.fromEntries(visualPromptsCache),
        allVisualPrompts: allVisualPromptsCache,
        summarizedScript: summarizedScriptCache,
        extractedDialogue: extractedDialogueCache,
        hasExtractedDialogue,
        hasGeneratedAllVisualPrompts,
        hasSummarizedScript,
    };

    const newItem: LibraryItem = {
      id: Date.now(),
      title: title,
      outlineContent: outlineContent,
      script: generatedScript,
      cachedData: cachedData,
    };

    const updatedLibrary = [newItem, ...library];
    setLibrary(updatedLibrary);
    localStorage.setItem('yt-script-library', JSON.stringify(updatedLibrary));
    setHasSavedToLibrary(true);
  }, [
    generatedScript, title, outlineContent, library, visualPromptsCache, allVisualPromptsCache, 
    summarizedScriptCache, extractedDialogueCache, hasExtractedDialogue, 
    hasGeneratedAllVisualPrompts, hasSummarizedScript
  ]);

  const handleDeleteScript = useCallback((id: number) => {
    const updatedLibrary = library.filter(item => item.id !== id);
    setLibrary(updatedLibrary);
    localStorage.setItem('yt-script-library', JSON.stringify(updatedLibrary));
  }, [library]);

  const handleLoadScript = useCallback((item: LibraryItem) => {
    resetCachesAndStates();

    setTitle(item.title);
    setOutlineContent(item.outlineContent);
    setGeneratedScript(item.script);

    if (item.cachedData) {
        setVisualPromptsCache(new Map(Object.entries(item.cachedData.visualPrompts || {})));
        setAllVisualPromptsCache(item.cachedData.allVisualPrompts);
        setSummarizedScriptCache(item.cachedData.summarizedScript);
        setExtractedDialogueCache(item.cachedData.extractedDialogue);
        setHasExtractedDialogue(item.cachedData.hasExtractedDialogue);
        setHasGeneratedAllVisualPrompts(item.cachedData.hasGeneratedAllVisualPrompts);
        setHasSummarizedScript(item.cachedData.hasSummarizedScript);
    }
    
    setHasSavedToLibrary(true);
    setIsLibraryOpen(false);
  }, []);
  
    const handleSaveIdea = useCallback((ideaToSave: TopicSuggestionItem) => {
        if (savedIdeas.some(idea => idea.title === ideaToSave.title && idea.outline === ideaToSave.outline)) {
            return;
        }
        const newIdea: SavedIdea = {
            id: Date.now(),
            title: ideaToSave.title,
            vietnameseTitle: ideaToSave.vietnameseTitle,
            outline: ideaToSave.outline,
        };
        setSavedIdeas(prev => [newIdea, ...prev]);
    }, [savedIdeas]);

    const handleDeleteIdea = useCallback((id: number) => {
        setSavedIdeas(prev => prev.filter(idea => idea.id !== id));
    }, []);

    const handleLoadIdea = useCallback((idea: SavedIdea) => {
        setTitle(idea.title);
        setOutlineContent(idea.outline);
        setIsSavedIdeasModalOpen(false);
    }, []);

    const handleParseFile = useCallback(async (fileContent: string) => {
        setIsParsing(true);
        setParsingError(null);
        setUploadedIdeas([]);
        try {
            const ideas = await parseIdeasFromFile(fileContent, aiProvider, selectedModel);
            setUploadedIdeas(ideas);
        } catch (err) {
            setParsingError(err instanceof Error ? err.message : 'Lỗi không xác định khi phân tích file.');
        } finally {
            setIsParsing(false);
        }
    }, [aiProvider, selectedModel]);

  const handleGenerateSuggestions = useCallback(async () => {
    if (!title.trim()) {
      setSuggestionError('Vui lòng nhập Tiêu đề Video để nhận gợi ý.');
      return;
    }
    setIsSuggesting(true);
    setSuggestionError(null);
    setTopicSuggestions([]);
    setHasGeneratedTopicSuggestions(false);

    try {
      const suggestions = await generateTopicSuggestions(title, aiProvider, selectedModel);
      setTopicSuggestions(suggestions);
      setHasGeneratedTopicSuggestions(true);
    } catch (err) {
      setSuggestionError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo gợi ý.');
    } finally {
      setIsSuggesting(false);
    }
  }, [title, aiProvider, selectedModel]);

  const handleGenerateKeywordSuggestions = useCallback(async () => {
    if (!title.trim()) {
      setKeywordSuggestionError('Vui lòng nhập Tiêu đề Video để nhận gợi ý từ khóa.');
      return;
    }
    setIsSuggestingKeywords(true);
    setKeywordSuggestionError(null);
    setKeywordSuggestions([]);
    setHasGeneratedKeywordSuggestions(false);

    try {
      const suggestions = await generateKeywordSuggestions(title, outlineContent, aiProvider, selectedModel);
      setKeywordSuggestions(suggestions);
      setHasGeneratedKeywordSuggestions(true);
    } catch (err) {
      setKeywordSuggestionError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo gợi ý từ khóa.');
    } finally {
      setIsSuggestingKeywords(false);
    }
  }, [title, outlineContent, aiProvider, selectedModel]);

  const handleSuggestStyleOptions = useCallback(async () => {
    if (!title.trim()) {
      setStyleSuggestionError('Vui lòng nhập Tiêu đề Video trước.');
      return;
    }
    setIsSuggestingStyle(true);
    setStyleSuggestionError(null);
    setHasSuggestedStyle(false);

    try {
      const suggestedOptions = await suggestStyleOptions(title, outlineContent, aiProvider, selectedModel);
      setStyleOptions(suggestedOptions);
      setHasSuggestedStyle(true);
    } catch (err) {
      setStyleSuggestionError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo gợi ý phong cách.');
    } finally {
      setIsSuggestingStyle(false);
    }
  }, [title, outlineContent, aiProvider, selectedModel]);

  const handleGenerateScript = useCallback(async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập hoặc chọn một tiêu đề video.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedScript('');
    setIsGeneratingSequentially(false);
    setRevisionCount(0);
    resetCachesAndStates();

    const finalWordCount = lengthType === 'duration' && videoDuration
      ? (parseInt(videoDuration, 10) * 150).toString()
      : wordCount;

    const params: GenerationParams = { title, outlineContent, targetAudience, styleOptions, keywords, formattingOptions, wordCount: finalWordCount, scriptParts, scriptType, numberOfSpeakers };

    try {
      const isLongScript = parseInt(finalWordCount, 10) > 1000 && scriptType === 'Video';
      if (isLongScript) {
        const outline = await generateScriptOutline(params, aiProvider, selectedModel);
        setGeneratedScript(outline);
      } else {
        const script = await generateScript(params, aiProvider, selectedModel);
        setGeneratedScript(script);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  }, [title, outlineContent, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers, lengthType, videoDuration, aiProvider, selectedModel]);
  
  const handleReviseScript = useCallback(async () => {
    if (!revisionPrompt.trim() || !generatedScript.trim()) {
      setError('Vui lòng nhập yêu cầu sửa đổi.');
      return;
    }
    setIsLoading(true);
    setError(null);
    resetCachesAndStates();

    const finalWordCount = lengthType === 'duration' && videoDuration
      ? (parseInt(videoDuration, 10) * 150).toString()
      : wordCount;

    const params: GenerationParams = { title, outlineContent, targetAudience, styleOptions, keywords, formattingOptions, wordCount: finalWordCount, scriptParts, scriptType, numberOfSpeakers };

    try {
      const revisedScript = await reviseScript(generatedScript, revisionPrompt, params, aiProvider, selectedModel);
      setGeneratedScript(revisedScript);
      setRevisionCount(prev => prev + 1);
      setRevisionPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định khi sửa kịch bản.');
    } finally {
      setIsLoading(false);
    }
  }, [revisionPrompt, generatedScript, title, outlineContent, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers, lengthType, videoDuration, aiProvider, selectedModel]);

  const handleGenerateNextPart = useCallback(async () => {
      if (!isGeneratingSequentially || currentPartIndex >= outlineParts.length) {
          setIsGeneratingSequentially(false);
          return;
      }
      setIsLoading(true);
      setError(null);
      try {
          const finalWordCount = lengthType === 'duration' && videoDuration
            ? (parseInt(videoDuration, 10) * 150).toString()
            : wordCount;
          
          const fullOutline = outlineParts.join('\n');
          const currentPartOutline = outlineParts[currentPartIndex];
          const params = { title, outlineContent, targetAudience, styleOptions, keywords, formattingOptions, wordCount: finalWordCount, scriptParts, scriptType, numberOfSpeakers };
          const newPart = await generateScriptPart(fullOutline, generatedScript, currentPartOutline, params, aiProvider, selectedModel);
          
          setGeneratedScript(prev => (prev ? prev + '\n\n' : '') + newPart);
          
          const nextPartIndex = currentPartIndex + 1;
          setCurrentPartIndex(nextPartIndex);

          if (nextPartIndex >= outlineParts.length) {
              setIsGeneratingSequentially(false);
          }
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Lỗi khi tạo phần tiếp theo.');
          setIsGeneratingSequentially(false);
      } finally {
          setIsLoading(false);
      }
  }, [currentPartIndex, outlineParts, isGeneratingSequentially, generatedScript, title, outlineContent, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers, lengthType, videoDuration, aiProvider, selectedModel]);
  
  const handleStartSequentialGeneration = useCallback(() => {
    if (!generatedScript.trim() || !generatedScript.includes("### Dàn Ý Chi Tiết")) {
        setError('Không có dàn ý nào để xử lý.');
        return;
    }
    const outlineContent = generatedScript.split('---')[1]?.trim();
    if (!outlineContent) {
        setError('Dàn ý không hợp lệ.');
        return;
    }
    const parts = outlineContent.split(/\n(?=(?:#){2,}\s)/).filter(p => p.trim() !== '');
    setOutlineParts(parts);
    setCurrentPartIndex(0);
    setIsGeneratingSequentially(true);
    setGeneratedScript('');
    resetCachesAndStates();
  }, [generatedScript]);

  const handleExtractAndCount = useCallback(async () => {
    if (!generatedScript.trim()) return;

    if (extractedDialogueCache) {
        const stats = calculateWordCountsFromDialogue(extractedDialogueCache);
        setWordCountStats(stats);
        setExtractedDialogue(extractedDialogueCache);
        setIsDialogueModalOpen(true);
        return;
    }
    
    setIsExtracting(true);
    setExtractionError(null);
    setExtractedDialogue(null);
    setWordCountStats(null);
    setIsDialogueModalOpen(true);

    try {
        const dialogueObject = await extractDialogue(generatedScript, targetAudience, aiProvider, selectedModel);
        setExtractedDialogue(dialogueObject);
        setExtractedDialogueCache(dialogueObject);
        setHasExtractedDialogue(true);
        
        const stats = calculateWordCountsFromDialogue(dialogueObject);
        setWordCountStats(stats);
    } catch(err) {
        setExtractionError(err instanceof Error ? err.message : 'Lỗi không xác định khi tách lời thoại.');
    } finally {
        setIsExtracting(false);
    }
  }, [generatedScript, targetAudience, extractedDialogueCache, aiProvider, selectedModel]);

  const handleGenerateVisualPrompt = useCallback(async (scene: string) => {
    if (visualPromptsCache.has(scene)) {
        setVisualPrompt(visualPromptsCache.get(scene)!);
        setIsVisualPromptModalOpen(true);
        return;
    }

    setIsGeneratingVisualPrompt(true);
    setVisualPrompt(null);
    setVisualPromptError(null);
    setIsVisualPromptModalOpen(true);

    try {
        const prompt = await generateVisualPrompt(scene, aiProvider, selectedModel);
        setVisualPrompt(prompt);
        setVisualPromptsCache(prevCache => new Map(prevCache).set(scene, prompt));
    } catch(err) {
        setVisualPromptError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo prompt.');
    } finally {
        setIsGeneratingVisualPrompt(false);
    }
  }, [visualPromptsCache, aiProvider, selectedModel]);
  
  const handleGenerateAllVisualPrompts = useCallback(async () => {
    if (!generatedScript.trim()) return;

    if (allVisualPromptsCache) {
        const mergedPrompts = allVisualPromptsCache.map(p => {
            const singleCached = visualPromptsCache.get(p.scene);
            if (singleCached) {
                return { ...p, ...singleCached };
            }
            return p;
        });
        setAllVisualPrompts(mergedPrompts);
        setIsAllVisualPromptsModalOpen(true);
        return;
    }

    setIsGeneratingAllVisualPrompts(true);
    setAllVisualPrompts(null);
    setAllVisualPromptsError(null);
    setIsAllVisualPromptsModalOpen(true);

    try {
        const promptsFromServer = await generateAllVisualPrompts(generatedScript, aiProvider, selectedModel);
        
        const finalPrompts = promptsFromServer.map(serverPrompt => {
            const cachedSinglePrompt = visualPromptsCache.get(serverPrompt.scene);
            if (cachedSinglePrompt) {
                return {
                    scene: serverPrompt.scene,
                    english: cachedSinglePrompt.english,
                    vietnamese: cachedSinglePrompt.vietnamese,
                };
            }
            return serverPrompt;
        });

        setAllVisualPrompts(finalPrompts);
        setAllVisualPromptsCache(finalPrompts);
        setHasGeneratedAllVisualPrompts(true);
    } catch(err) {
        setAllVisualPromptsError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo prompt hàng loạt.');
    } finally {
        setIsGeneratingAllVisualPrompts(false);
    }
  }, [generatedScript, allVisualPromptsCache, visualPromptsCache, aiProvider, selectedModel]);

  const handleSummarizeScript = useCallback(async () => {
    if (!generatedScript.trim()) return;
    
    if (summarizedScriptCache) {
        setSummarizedScript(summarizedScriptCache);
        setIsSummarizeModalOpen(true);
        return;
    }

    setIsSummarizing(true);
    setSummarizedScript(null);
    setSummarizationError(null);
    setIsSummarizeModalOpen(true);

    try {
        const summary = await summarizeScriptForScenes(generatedScript, aiProvider, selectedModel);
        setSummarizedScript(summary);
        setSummarizedScriptCache(summary);
        setHasSummarizedScript(true);
    } catch(err) {
        setSummarizationError(err instanceof Error ? err.message : 'Lỗi không xác định khi tóm tắt kịch bản.');
    } finally {
        setIsSummarizing(false);
    }
  }, [generatedScript, summarizedScriptCache, aiProvider, selectedModel]);


  const handleOpenTtsModal = async () => {
    if (!extractedDialogueCache) {
        if (!generatedScript.trim()) {
            setTtsModalError("Vui lòng tạo kịch bản trước.");
            setIsTtsModalOpen(true);
            return;
        }
        setIsExtracting(true);
        try {
            const dialogueObject = await extractDialogue(generatedScript, targetAudience, aiProvider, selectedModel);
            setExtractedDialogueCache(dialogueObject);
            setHasExtractedDialogue(true);
             setIsTtsModalOpen(true);
        } catch(err) {
            setTtsModalError(err instanceof Error ? err.message : 'Lỗi khi tách lời thoại cho TTS.');
            setIsTtsModalOpen(true);
        } finally {
            setIsExtracting(false);
        }
    } else {
      setIsTtsModalOpen(true);
    }
    
    setTtsModalError(null);
    if(ttsVoices.length === 0) {
        setIsFetchingTtsVoices(true);
        try {
            const voices = await getElevenlabsVoices();
            setTtsVoices(voices);
        } catch (err) {
            setTtsModalError(err instanceof Error ? err.message : 'Lỗi không xác định khi lấy danh sách giọng nói.');
        } finally {
            setIsFetchingTtsVoices(false);
        }
    }
  };

  const handleGenerateTts = async (text: string, voiceId: string): Promise<string> => {
      if (!text || !voiceId) {
          throw new Error("Không có lời thoại hoặc chưa chọn giọng nói.");
      }
      return await generateElevenlabsTts(text, voiceId);
  };


  useEffect(() => {
    if (isGeneratingSequentially && currentPartIndex === 0 && generatedScript === '' && outlineParts.length > 0) {
      handleGenerateNextPart();
    }
  }, [isGeneratingSequentially, currentPartIndex, generatedScript, outlineParts, handleGenerateNextPart]);

  const finalWordCount = lengthType === 'duration' && videoDuration
      ? (parseInt(videoDuration, 10) * 150).toString()
      : wordCount;
      
  const hasApiKey = apiKeys[aiProvider] && apiKeys[aiProvider].length > 0;

  return (
    <div className="min-h-screen bg-primary">
      <header className="bg-secondary/60 border-b border-border p-4 shadow-sm flex justify-between items-center sticky top-0 z-20 backdrop-blur-sm">
        <div className="flex-1"></div>
        <div className="flex-1 text-center">
            <a href="/" className="inline-flex justify-center items-center gap-3 no-underline transition-opacity hover:opacity-80" style={{ textDecoration: 'none' }}>
              <YoutubeLogoIcon />
              <h1 className="text-2xl font-bold" style={{color: 'var(--color-accent)'}}>
                Youtube Script Generator by AI
              </h1>
            </a>
            <p className="text-text-secondary mt-1 text-sm md:text-base">
              Tạo kịch bản hoàn hảo cho video tiếp theo của bạn.
            </p>
        </div>
        <div className="flex-1 flex justify-end items-center gap-4">
            <div className="relative" ref={themeSelectorRef}>
                <button 
                    onClick={() => setIsThemeSelectorOpen(prev => !prev)}
                    className="p-2 rounded-full hover:bg-secondary transition-colors"
                    aria-label="Chọn màu chủ đề"
                >
                    <PaletteIcon className="w-5 h-5 text-text-secondary"/>
                </button>
                {isThemeSelectorOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-secondary border border-border rounded-lg shadow-2xl p-2 flex gap-2 z-10">
                        {THEMES.map(theme => (
                            <button
                                key={theme.name}
                                aria-label={`Đặt chủ đề thành ${theme.name}`}
                                onClick={() => {
                                    setThemeColor(theme.color);
                                    setIsThemeSelectorOpen(false);
                                }}
                                className="w-8 h-8 rounded-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white"
                                style={{ backgroundColor: theme.color }}
                            >
                                {themeColor === theme.color && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 max-w-[96rem] mx-auto">
        <div className="lg:col-span-3">
          <ControlPanel
            title={title}
            setTitle={setTitle}
            outlineContent={outlineContent}
            setOutlineContent={setOutlineContent}
            onGenerateSuggestions={handleGenerateSuggestions}
            isSuggesting={isSuggesting}
            suggestions={topicSuggestions}
            suggestionError={suggestionError}
            hasGeneratedTopicSuggestions={hasGeneratedTopicSuggestions}
            targetAudience={targetAudience}
            setTargetAudience={setTargetAudience}
            styleOptions={styleOptions}
            setStyleOptions={setStyleOptions}
            keywords={keywords}
            setKeywords={setKeywords}
            formattingOptions={formattingOptions}
            setFormattingOptions={setFormattingOptions}
            wordCount={wordCount}
            setWordCount={setWordCount}
            scriptParts={scriptParts}
            setScriptParts={setScriptParts}
            onGenerate={handleGenerateScript}
            isLoading={isLoading || isSuggesting || isSuggestingKeywords || !hasApiKey}
            onGenerateKeywordSuggestions={handleGenerateKeywordSuggestions}
            isSuggestingKeywords={isSuggestingKeywords}
            keywordSuggestions={keywordSuggestions}
            keywordSuggestionError={keywordSuggestionError}
            hasGeneratedKeywordSuggestions={hasGeneratedKeywordSuggestions}
            scriptType={scriptType}
            setScriptType={setScriptType}
            numberOfSpeakers={numberOfSpeakers}
            setNumberOfSpeakers={setNumberOfSpeakers}
            onSuggestStyle={handleSuggestStyleOptions}
            isSuggestingStyle={isSuggestingStyle}
            styleSuggestionError={styleSuggestionError}
            hasSuggestedStyle={hasSuggestedStyle}
            lengthType={lengthType}
            setLengthType={setLengthType}
            videoDuration={videoDuration}
            setVideoDuration={setVideoDuration}
            savedIdeas={savedIdeas}
            onSaveIdea={handleSaveIdea}
            onOpenSavedIdeasModal={() => setIsSavedIdeasModalOpen(true)}
            onParseFile={handleParseFile}
            isParsingFile={isParsing}
            parsingFileError={parsingError}
            uploadedIdeas={uploadedIdeas}
            aiProvider={aiProvider}
            setAiProvider={setAiProvider}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>
        <div className="lg:col-span-6">
          <OutputDisplay
            script={generatedScript}
            isLoading={isLoading}
            error={error}
            onSaveToLibrary={handleSaveToLibrary}
            onStartSequentialGenerate={handleStartSequentialGeneration}
            isGeneratingSequentially={isGeneratingSequentially}
            onGenerateNextPart={handleGenerateNextPart}
            currentPart={currentPartIndex}
            totalParts={outlineParts.length}
            revisionCount={revisionCount}
            onGenerateVisualPrompt={handleGenerateVisualPrompt}
            onGenerateAllVisualPrompts={handleGenerateAllVisualPrompts}
            isGeneratingAllVisualPrompts={isGeneratingAllVisualPrompts}
            scriptType={scriptType}
            hasGeneratedAllVisualPrompts={hasGeneratedAllVisualPrompts}
            hasSavedToLibrary={hasSavedToLibrary}
            visualPromptsCache={visualPromptsCache}
          />
        </div>
         <div className="lg:col-span-3">
            <SideToolsPanel
                script={generatedScript}
                targetWordCount={finalWordCount}
                revisionPrompt={revisionPrompt}
                setRevisionPrompt={setRevisionPrompt}
                onRevise={handleReviseScript}
                onSummarizeScript={handleSummarizeScript}
                isLoading={isLoading}
                isSummarizing={isSummarizing}
                hasSummarizedScript={hasSummarizedScript}
                onOpenLibrary={() => setIsLibraryOpen(true)}
                onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
                onExtractAndCount={handleExtractAndCount}
                wordCountStats={wordCountStats}
                isExtracting={isExtracting}
                onOpenTtsModal={handleOpenTtsModal}
            />
        </div>
      </main>
      <LibraryModal 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        library={library}
        onLoad={handleLoadScript}
        onDelete={handleDeleteScript}
      />
      <SavedIdeasModal
        isOpen={isSavedIdeasModalOpen}
        onClose={() => setIsSavedIdeasModalOpen(false)}
        ideas={savedIdeas}
        onLoad={handleLoadIdea}
        onDelete={handleDeleteIdea}
      />
      <DialogueModal
        isOpen={isDialogueModalOpen}
        onClose={() => setIsDialogueModalOpen(false)}
        dialogue={extractedDialogue}
        isLoading={isExtracting}
        error={extractionError}
      />
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentApiKeys={apiKeys}
        onSaveKeys={handleSaveApiKeys}
      />
      <VisualPromptModal
        isOpen={isVisualPromptModalOpen}
        onClose={() => setIsVisualPromptModalOpen(false)}
        prompt={visualPrompt}
        isLoading={isGeneratingVisualPrompt}
        error={visualPromptError}
      />
      <AllVisualPromptsModal
        isOpen={isAllVisualPromptsModalOpen}
        onClose={() => setIsAllVisualPromptsModalOpen(false)}
        prompts={allVisualPrompts}
        isLoading={isGeneratingAllVisualPrompts}
        error={allVisualPromptsError}
      />
       <SummarizeModal
        isOpen={isSummarizeModalOpen}
        onClose={() => setIsSummarizeModalOpen(false)}
        summary={summarizedScript}
        isLoading={isSummarizing}
        error={summarizationError}
        scriptType={scriptType}
        title={title}
      />
      <TtsModal
        isOpen={isTtsModalOpen}
        onClose={() => setIsTtsModalOpen(false)}
        dialogue={extractedDialogueCache}
        voices={ttsVoices}
        isLoadingVoices={isFetchingTtsVoices}
        onGenerate={handleGenerateTts}
        error={ttsModalError}
      />
    </div>
  );
};

export default App;