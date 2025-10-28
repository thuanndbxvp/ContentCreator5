import React from 'react';
import { PencilIcon } from './icons/PencilIcon';
import { FilmIcon } from './icons/FilmIcon';
import { CheckIcon } from './icons/CheckIcon';

interface ScriptToolsProps {
  revisionPrompt: string;
  setRevisionPrompt: (prompt: string) => void;
  onRevise: () => void;
  onSummarizeScript: () => void;
  isLoading: boolean;
  isSummarizing: boolean;
  hasSummarizedScript: boolean;
}

export const ScriptTools: React.FC<ScriptToolsProps> = ({
  revisionPrompt,
  setRevisionPrompt,
  onRevise,
  onSummarizeScript,
  isLoading,
  isSummarizing,
  hasSummarizedScript,
}) => {
  return (
    <div className="bg-secondary rounded-lg p-6 shadow-xl">
        <h3 className="text-md font-semibold text-text-primary mb-3">Công cụ Kịch bản</h3>
        <textarea
            rows={4}
            className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
            placeholder="Nhập yêu cầu sửa đổi, VD: 'Làm cho phần mở đầu kịch tính hơn'"
            value={revisionPrompt}
            onChange={(e) => setRevisionPrompt(e.target.value)}
            disabled={isLoading}
        />
        <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <button
                onClick={onRevise}
                disabled={!revisionPrompt.trim() || isLoading}
                className="flex-1 flex items-center justify-center border border-text-secondary/50 bg-transparent hover:bg-primary/70 disabled:opacity-50 disabled:cursor-not-allowed text-text-primary font-bold py-2 px-4 rounded-lg transition"
            >
                <PencilIcon className="w-5 h-5 mr-2" />
                Sửa Kịch bản
            </button>
             <button
                onClick={onSummarizeScript}
                disabled={isLoading || isSummarizing}
                className="flex-1 flex items-center justify-center bg-primary hover:bg-primary/70 disabled:bg-primary/50 disabled:cursor-not-allowed text-text-secondary font-bold py-2 px-4 rounded-lg transition"
            >
                {isSummarizing ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Đang làm...</span>
                    </>
                ) : (
                    <>
                        <FilmIcon className="w-5 h-5 mr-2" />
                        <span>Chuyển thể kịch bản</span>
                    </>
                )}
                {hasSummarizedScript && !isSummarizing && <CheckIcon className="w-5 h-5 text-green-400 ml-2" />}
            </button>
        </div>
    </div>
  );
};
