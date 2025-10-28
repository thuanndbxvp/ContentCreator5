import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { OutputDisplay } from './components/OutputDisplay';
import { LibraryModal } from './components/LibraryModal';
import { DialogueModal } from './components/DialogueModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { VisualPromptModal } from './components/VisualPromptModal';
import { AllVisualPromptsModal } from './components/AllVisualPromptsModal';
import { SummarizeModal } from './components/SummarizeModal';
import { generateScript, generateScriptOutline, generateTopicSuggestions, reviseScript, generateScriptPart, extractDialogue, generateKeywordSuggestions, validateApiKey, generateVisualPrompt, generateAllVisualPrompts, summarizeScriptForScenes, suggestStyleOptions } from './services/geminiService';
import type { StyleOptions, FormattingOptions, LibraryItem, GenerationParams, VisualPrompt, AllVisualPromptsResult, ScriptPartSummary, ScriptType, NumberOfSpeakers, CachedData } from './types';
import { TONE_OPTIONS, STYLE_OPTIONS, VOICE_OPTIONS, LANGUAGE_OPTIONS } from './constants';
import { BookOpenIcon } from './components/icons/BookOpenIcon';

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
  { name: 'Indigo', color: '#6366f1' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Blue', color: '#3b82f6' },
];


const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>(LANGUAGE_OPTIONS[0].value);
  const [styleOptions, setStyleOptions] = useState<StyleOptions>({
    tone: TONE_OPTIONS[2].value,
    style: STYLE_OPTIONS[0].value,
    voice: VOICE_OPTIONS[1].value,
  });
  const [keywords, setKeywords] = useState<string>('');
  const [formattingOptions, setFormattingOptions] = useState<FormattingOptions>({
    headings: true,
    bullets: true,
    bold: true,
    includeIntro: true,
    includeOutro: true,
  });
  const [wordCount, setWordCount] = useState<string>('800');
  const [scriptParts, setScriptParts] = useState<string>('Auto');
  const [scriptType, setScriptType] = useState<ScriptType>('Video');
  const [numberOfSpeakers, setNumberOfSpeakers] = useState<NumberOfSpeakers>('Auto');

  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [isSuggestingKeywords, setIsSuggestingKeywords] = useState<boolean>(false);
  const [keywordSuggestionError, setKeywordSuggestionError] = useState<string | null>(null);

  const [isSuggestingStyle, setIsSuggestingStyle] = useState<boolean>(false);
  const [styleSuggestionError, setStyleSuggestionError] = useState<string | null>(null);

  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);

  const [revisionPrompt, setRevisionPrompt] = useState<string>('');
  const [revisionCount, setRevisionCount] = useState<number>(0);

  const [isGeneratingSequentially, setIsGeneratingSequentially] = useState<boolean>(false);
  const [outlineParts, setOutlineParts] = useState<string[]>([]);
  const [currentPartIndex, setCurrentPartIndex] = useState<number>(0);

  const [isDialogueModalOpen, setIsDialogueModalOpen] = useState<boolean>(false);
  const [extractedDialogue, setExtractedDialogue] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [apiKeys, setApiKeys] = useState<string[]>([]);

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

  // Caching states
  const [visualPromptsCache, setVisualPromptsCache] = useState<Map<string, VisualPrompt>>(new Map());
  const [allVisualPromptsCache, setAllVisualPromptsCache] = useState<AllVisualPromptsResult[] | null>(null);
  const [summarizedScriptCache, setSummarizedScriptCache] = useState<ScriptPartSummary[] | null>(null);
  const [extractedDialogueCache, setExtractedDialogueCache] = useState<string | null>(null);

  // Action completion states
  const [hasExtractedDialogue, setHasExtractedDialogue] = useState<boolean>(false);
  const [hasGeneratedAllVisualPrompts, setHasGeneratedAllVisualPrompts] = useState<boolean>(false);
  const [hasSummarizedScript, setHasSummarizedScript] = useState<boolean>(false);
  const [hasSavedToLibrary, setHasSavedToLibrary] = useState<boolean>(false);

  // Theme state
  const [themeColor, setThemeColor] = useState<string>(THEMES[2].color);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState<boolean>(false);
  const themeSelectorRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    try {
      const savedLibrary = localStorage.getItem('yt-script-library');
      if (savedLibrary) {
        setLibrary(JSON.parse(savedLibrary));
      }
      const savedApiKeys = localStorage.getItem('gemini-api-keys');
      if (savedApiKeys) {
        const parsedKeys = JSON.parse(savedApiKeys);
        if (Array.isArray(parsedKeys)) {
            setApiKeys(parsedKeys);
        }
      }
      const savedTheme = localStorage.getItem('yt-script-theme');
      if (savedTheme) {
        setThemeColor(savedTheme);
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('yt-script-theme', themeColor);
    document.documentElement.style.setProperty('--color-accent', themeColor);
  }, [themeColor]);

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
  
  const resetCachesAndStates = () => {
    setVisualPromptsCache(new Map());
    setAllVisualPromptsCache(null);
    setSummarizedScriptCache(null);
    setExtractedDialogueCache(null);
    setHasExtractedDialogue(false);
    setHasGeneratedAllVisualPrompts(false);
    setHasSummarizedScript(false);
    setHasSavedToLibrary(false);
  };


  const handleAddApiKey = async (key: string): Promise<{ success: boolean, error?: string }> => {
    if (apiKeys.includes(key)) return { success: false, error: 'API Key này đã tồn tại trong danh sách.' };

    try {
        await validateApiKey(key);
        // Add new key to the front to make it the active one
        const updatedKeys = [key, ...apiKeys];
        setApiKeys(updatedKeys);
        localStorage.setItem('gemini-api-keys', JSON.stringify(updatedKeys));
        return { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Lỗi không xác định khi xác thực key.' };
    }
  };

  const handleDeleteApiKey = (keyToDelete: string) => {
    const updatedKeys = apiKeys.filter(k => k !== keyToDelete);
    setApiKeys(updatedKeys);
    localStorage.setItem('gemini-api-keys', JSON.stringify(updatedKeys));
  };

  const handleSaveToLibrary = useCallback(() => {
    if (!generatedScript.trim() || !topic.trim()) return;

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
      topic: topic,
      script: generatedScript,
      cachedData: cachedData,
    };

    const updatedLibrary = [newItem, ...library];
    setLibrary(updatedLibrary);
    localStorage.setItem('yt-script-library', JSON.stringify(updatedLibrary));
    setHasSavedToLibrary(true);
  }, [
    generatedScript, topic, library, visualPromptsCache, allVisualPromptsCache, 
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

    setTopic(item.topic);
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
    
    setHasSavedToLibrary(true); // Since it's loaded from the library, it's considered saved.
    setIsLibraryOpen(false);
  }, []);

  const handleGenerateSuggestions = useCallback(async () => {
    if (!topic.trim()) {
      setSuggestionError('Vui lòng nhập chủ đề chính để nhận gợi ý.');
      return;
    }
    setIsSuggesting(true);
    setSuggestionError(null);
    setTopicSuggestions([]);

    try {
      const suggestions = await generateTopicSuggestions(topic);
      setTopicSuggestions(suggestions);
    } catch (err) {
      setSuggestionError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo gợi ý.');
    } finally {
      setIsSuggesting(false);
    }
  }, [topic]);

  const handleGenerateKeywordSuggestions = useCallback(async () => {
    if (!topic.trim()) {
      setKeywordSuggestionError('Vui lòng nhập chủ đề chính để nhận gợi ý từ khóa.');
      return;
    }
    setIsSuggestingKeywords(true);
    setKeywordSuggestionError(null);
    setKeywordSuggestions([]);

    try {
      const suggestions = await generateKeywordSuggestions(topic);
      setKeywordSuggestions(suggestions);
    } catch (err) {
      setKeywordSuggestionError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo gợi ý từ khóa.');
    } finally {
      setIsSuggestingKeywords(false);
    }
  }, [topic]);

  const handleSuggestStyleOptions = useCallback(async () => {
    if (!topic.trim()) {
      setStyleSuggestionError('Vui lòng nhập chủ đề chính trước.');
      return;
    }
    setIsSuggestingStyle(true);
    setStyleSuggestionError(null);

    try {
      const suggestedOptions = await suggestStyleOptions(topic);
      setStyleOptions(suggestedOptions);
    } catch (err) {
      setStyleSuggestionError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo gợi ý phong cách.');
    } finally {
      setIsSuggestingStyle(false);
    }
  }, [topic]);

  const handleGenerateScript = useCallback(async () => {
    if (!topic.trim()) {
      setError('Vui lòng nhập hoặc chọn một chủ đề video cụ thể.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedScript('');
    setIsGeneratingSequentially(false);
    setRevisionCount(0);
    resetCachesAndStates();

    try {
      const isLongScript = parseInt(wordCount, 10) > 1000 && scriptType === 'Video';
      if (isLongScript) {
        const outline = await generateScriptOutline(topic, wordCount, targetAudience);
        setGeneratedScript(outline);
      } else {
        const script = await generateScript({ topic, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers });
        setGeneratedScript(script);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers]);
  
  const handleReviseScript = useCallback(async () => {
    if (!revisionPrompt.trim() || !generatedScript.trim()) {
      setError('Vui lòng nhập yêu cầu sửa đổi.');
      return;
    }
    setIsLoading(true);
    setError(null);
    resetCachesAndStates();

    const params: GenerationParams = { topic, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers };

    try {
      const revisedScript = await reviseScript(generatedScript, revisionPrompt, params);
      setGeneratedScript(revisedScript);
      setRevisionCount(prev => prev + 1);
      setRevisionPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định khi sửa kịch bản.');
    } finally {
      setIsLoading(false);
    }
  }, [revisionPrompt, generatedScript, topic, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers]);

  const handleGenerateNextPart = useCallback(async () => {
      if (!isGeneratingSequentially || currentPartIndex >= outlineParts.length) {
          setIsGeneratingSequentially(false);
          return;
      }
      setIsLoading(true);
      setError(null);
      try {
          const fullOutline = outlineParts.join('\n');
          const currentPartOutline = outlineParts[currentPartIndex];
          const params = { targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers };
          const newPart = await generateScriptPart(fullOutline, generatedScript, currentPartOutline, params);
          
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
  }, [currentPartIndex, outlineParts, isGeneratingSequentially, generatedScript, targetAudience, styleOptions, keywords, formattingOptions, wordCount, scriptParts, scriptType, numberOfSpeakers]);
  
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

  const handleExtractDialogue = useCallback(async () => {
    if (!generatedScript.trim()) return;

    if (extractedDialogueCache) {
      setExtractedDialogue(extractedDialogueCache);
      setIsDialogueModalOpen(true);
      return;
    }
    
    setIsExtracting(true);
    setExtractionError(null);
    setExtractedDialogue(null);
    setIsDialogueModalOpen(true);

    try {
        const dialogue = await extractDialogue(generatedScript, targetAudience);
        setExtractedDialogue(dialogue);
        setExtractedDialogueCache(dialogue);
        setHasExtractedDialogue(true);
    } catch(err) {
        setExtractionError(err instanceof Error ? err.message : 'Lỗi không xác định khi tách lời thoại.');
    } finally {
        setIsExtracting(false);
    }
  }, [generatedScript, targetAudience, extractedDialogueCache]);

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
        const prompt = await generateVisualPrompt(scene);
        setVisualPrompt(prompt);
        setVisualPromptsCache(prevCache => new Map(prevCache).set(scene, prompt));
    } catch(err) {
        setVisualPromptError(err instanceof Error ? err.message : 'Lỗi không xác định khi tạo prompt.');
    } finally {
        setIsGeneratingVisualPrompt(false);
    }
  }, [visualPromptsCache]);
  
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
        const promptsFromServer = await generateAllVisualPrompts(generatedScript);
        
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
  }, [generatedScript, allVisualPromptsCache, visualPromptsCache]);

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
        const summary = await summarizeScriptForScenes(generatedScript);
        setSummarizedScript(summary);
        setSummarizedScriptCache(summary);
        setHasSummarizedScript(true);
    } catch(err) {
        setSummarizationError(err instanceof Error ? err.message : 'Lỗi không xác định khi tóm tắt kịch bản.');
    } finally {
        setIsSummarizing(false);
    }
  }, [generatedScript, summarizedScriptCache]);


  useEffect(() => {
    if (isGeneratingSequentially && currentPartIndex === 0 && generatedScript === '' && outlineParts.length > 0) {
      handleGenerateNextPart();
    }
  }, [isGeneratingSequentially, currentPartIndex, generatedScript, outlineParts, handleGenerateNextPart]);

  return (
    <div className="min-h-screen bg-primary font-sans">
      <header className="bg-secondary/50 border-b border-secondary p-4 shadow-lg flex justify-between items-center">
        <div className="flex-1"></div>
        <div className="flex-1 text-center">
            <div className="flex justify-center items-center gap-3">
              <YoutubeLogoIcon />
              <h1 className="text-2xl font-bold text-accent">
                Trợ lý Sáng tạo Kịch bản YouTube
              </h1>
            </div>
            <p className="text-text-secondary mt-1 text-sm md:text-base">
              Tạo kịch bản hoàn hảo cho video tiếp theo của bạn.
            </p>
        </div>
        <div className="flex-1 flex justify-end items-center gap-4">
            <div className="relative" ref={themeSelectorRef}>
                <button 
                    onClick={() => setIsThemeSelectorOpen(prev => !prev)}
                    className="p-2 rounded-full hover:bg-primary transition-colors"
                    aria-label="Chọn màu chủ đề"
                >
                    <PaletteIcon className="w-5 h-5 text-text-secondary"/>
                </button>
                {isThemeSelectorOpen && (
                    <div className="absolute top-full right-0 mt-2 bg-primary border border-secondary rounded-lg shadow-2xl p-2 flex gap-2 z-10">
                        {THEMES.map(theme => (
                            <button
                                key={theme.name}
                                aria-label={`Đặt chủ đề thành ${theme.name}`}
                                onClick={() => {
                                    setThemeColor(theme.color);
                                    setIsThemeSelectorOpen(false);
                                }}
                                className="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary focus:ring-white"
                                style={{ backgroundColor: theme.color }}
                            >
                                {themeColor === theme.color && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <button 
                onClick={() => setIsLibraryOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-primary text-text-primary font-semibold rounded-lg transition-colors"
                aria-label="Mở thư viện"
            >
                <BookOpenIcon className="w-5 h-5"/>
                <span className="hidden md:inline">Thư viện</span>
            </button>
            <button 
                onClick={() => setIsApiKeyModalOpen(true)}
                className="px-4 py-2 bg-secondary hover:bg-primary text-text-primary font-semibold rounded-lg transition-colors"
                aria-label="Cài đặt API Key"
            >
                API
            </button>
        </div>
      </header>

      <main className="flex flex-col md:flex-row gap-6 p-4 md:p-6 max-w-7xl mx-auto">
        <div className="w-full md:w-2/5 lg:w-1/3 flex-shrink-0">
          <ControlPanel
            topic={topic}
            setTopic={setTopic}
            onGenerateSuggestions={handleGenerateSuggestions}
            isSuggesting={isSuggesting}
            suggestions={topicSuggestions}
            suggestionError={suggestionError}
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
            isLoading={isLoading || isSuggesting || isSuggestingKeywords || apiKeys.length === 0}
            onGenerateKeywordSuggestions={handleGenerateKeywordSuggestions}
            isSuggestingKeywords={isSuggestingKeywords}
            keywordSuggestions={keywordSuggestions}
            keywordSuggestionError={keywordSuggestionError}
            scriptType={scriptType}
            setScriptType={setScriptType}
            numberOfSpeakers={numberOfSpeakers}
            setNumberOfSpeakers={setNumberOfSpeakers}
            onSuggestStyle={handleSuggestStyleOptions}
            isSuggestingStyle={isSuggestingStyle}
            styleSuggestionError={styleSuggestionError}
          />
        </div>
        <div className="w-full md:w-3/5 lg:w-2/3">
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
            revisionPrompt={revisionPrompt}
            setRevisionPrompt={setRevisionPrompt}
            onRevise={handleReviseScript}
            revisionCount={revisionCount}
            onExtractDialogue={handleExtractDialogue}
            isExtracting={isExtracting}
            onGenerateVisualPrompt={handleGenerateVisualPrompt}
            onGenerateAllVisualPrompts={handleGenerateAllVisualPrompts}
            isGeneratingAllVisualPrompts={isGeneratingAllVisualPrompts}
            onSummarizeScript={handleSummarizeScript}
            isSummarizing={isSummarizing}
            scriptType={scriptType}
            hasExtractedDialogue={hasExtractedDialogue}
            hasGeneratedAllVisualPrompts={hasGeneratedAllVisualPrompts}
            hasSummarizedScript={hasSummarizedScript}
            hasSavedToLibrary={hasSavedToLibrary}
            visualPromptsCache={visualPromptsCache}
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
        onAddKey={handleAddApiKey}
        onDeleteKey={handleDeleteApiKey}
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
      />
    </div>
  );
};

export default App;