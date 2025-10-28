import React from 'react';
import { WordCountCheck } from './WordCountCheck';
import { ScriptTools } from './ScriptTools';
import { BookOpenIcon } from './icons/BookOpenIcon';

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
    onOpenApiKeyModal
}) => {

    return (
        <div className="w-full space-y-6">
            {script ? (
                <>
                    <WordCountCheck script={script} targetWordCount={targetWordCount} />
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
            ) : (
                <div className="bg-secondary rounded-lg p-6 shadow-xl space-y-4 sticky top-6">
                     <button 
                        onClick={onOpenLibrary}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-primary/70 hover:bg-primary text-text-primary font-semibold rounded-lg transition-colors"
                        aria-label="Mở thư viện"
                    >
                        <BookOpenIcon className="w-5 h-5"/>
                        <span>Thư viện</span>
                    </button>
                    <button 
                        onClick={onOpenApiKeyModal}
                        className="w-full px-4 py-2 bg-primary/70 hover:bg-primary text-text-primary font-semibold rounded-lg transition-colors"
                        aria-label="Cài đặt API Key"
                    >
                        API
                    </button>
                </div>
            )}
        </div>
    );
};