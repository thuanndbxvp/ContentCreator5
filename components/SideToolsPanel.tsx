import React from 'react';
import { WordCountCheck } from './WordCountCheck';
import { ScriptTools } from './ScriptTools';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { CogIcon } from './icons/CogIcon';
import type { WordCountStats } from '../types';

// Combine all props needed for the side panel
interface SideToolsPanelProps {
  script: string;
  targetWordCount: string;
  revisionPrompt: string;
  setRevisionPrompt: (prompt: string) => void;
  onRevise: () => void;
  onSummarizeScript: () => void;
  isLoading: boolean;
  isSummarizing: boolean;
  hasSummarizedScript: boolean;
  onOpenLibrary: () => void;
  onOpenApiKeyModal: () => void;
  onExtractAndCount: () => void;
  wordCountStats: WordCountStats | null;
  isExtracting: boolean;
}

export const SideToolsPanel: React.FC<SideToolsPanelProps> = ({
    script,
    targetWordCount,
    revisionPrompt,
    setRevisionPrompt,
    onRevise,
    onSummarizeScript,
    isLoading,
    isSummarizing,
    hasSummarizedScript,
    onOpenLibrary,
    onOpenApiKeyModal,
    onExtractAndCount,
    wordCountStats,
    isExtracting,
}) => {

    return (
        <div className="w-full space-y-6">
            <div className="bg-secondary rounded-lg p-6 shadow-xl space-y-4 sticky top-6">
                 <h3 className="text-md font-semibold text-text-primary mb-3 text-center">Tiện ích & Cài đặt</h3>
                 <button 
                    onClick={onOpenLibrary}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/70 hover:bg-primary text-text-primary font-semibold rounded-lg transition-colors"
                    aria-label="Mở thư viện"
                >
                    <BookOpenIcon className="w-5 h-5"/>
                    <span>Thư viện</span>
                </button>
                <button 
                    onClick={onOpenApiKeyModal}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/70 hover:bg-primary text-text-primary font-semibold rounded-lg transition-colors"
                    aria-label="Cài đặt API Key"
                >
                    <CogIcon className="w-5 h-5" />
                    <span>API</span>
                </button>
            </div>

            {script && (
                <>
                    <WordCountCheck
                        stats={wordCountStats}
                        targetWordCount={targetWordCount}
                        onExtractAndCount={onExtractAndCount}
                        isLoading={isExtracting}
                    />
                    <ScriptTools 
                        revisionPrompt={revisionPrompt}
                        setRevisionPrompt={setRevisionPrompt}
                        onRevise={onRevise}
                        onSummarizeScript={onSummarizeScript}
                        isLoading={isLoading}
                        isSummarizing={isSummarizing}
                        hasSummarizedScript={hasSummarizedScript}
                    />
                </>
            )}
        </div>
    );
};
