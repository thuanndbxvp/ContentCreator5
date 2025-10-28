import React from 'react';
import { WordCountCheck } from './WordCountCheck';
import { ScriptTools } from './ScriptTools';

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
}

export const SideToolsPanel: React.FC<SideToolsPanelProps> = (props) => {
    const showTools = !!props.script && !props.isLoading;

    if (!showTools) {
        // Render a placeholder to maintain layout structure even when empty
        return <div className="hidden lg:block"></div>;
    }

    return (
        <div className="w-full space-y-6">
            <WordCountCheck script={props.script} targetWordCount={props.targetWordCount} />
            <ScriptTools 
                revisionPrompt={props.revisionPrompt}
                setRevisionPrompt={props.setRevisionPrompt}
                onRevise={props.onRevise}
                onSummarizeScript={props.onSummarizeScript}
                isLoading={props.isLoading}
                isSummarizing={props.isSummarizing}
                hasSummarizedScript={props.hasSummarizedScript}
            />
        </div>
    );
};
