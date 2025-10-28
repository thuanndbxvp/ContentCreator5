import React, { useState, useEffect } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { SaveIcon } from './icons/SaveIcon';
import { BoltIcon } from './icons/BoltIcon';
import { PencilIcon } from './icons/PencilIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { CameraIcon } from './icons/CameraIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { FilmIcon } from './icons/FilmIcon';
import { CheckIcon } from './icons/CheckIcon';
import type { ScriptType, VisualPrompt } from '../types';

interface OutputDisplayProps {
  script: string;
  isLoading: boolean;
  error: string | null;
  onSaveToLibrary: () => void;
  onStartSequentialGenerate: () => void;
  isGeneratingSequentially: boolean;
  onGenerateNextPart: () => void;
  currentPart: number;
  totalParts: number;
  revisionCount: number;
  onGenerateVisualPrompt: (scene: string) => void;
  onGenerateAllVisualPrompts: () => void;
  isGeneratingAllVisualPrompts: boolean;
  scriptType: ScriptType;
  hasGeneratedAllVisualPrompts: boolean;
  hasSavedToLibrary: boolean;
  visualPromptsCache: Map<string, VisualPrompt>;
}

const GeneratingIndicator: React.FC<{text: string}> = ({ text }) => (
    <div className="w-full bg-primary rounded-lg p-3 flex items-center justify-center space-x-3 shadow-lg">
        <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
        <span className="text-white font-semibold">{text}</span>
    </div>
);

const InitialState: React.FC = () => (
    <div className="text-text-secondary prose prose-invert max-w-none">
        <h2 className="text-xl font-semibold text-accent mb-4">Chào mừng bạn đến với Trợ lý Sáng tạo Kịch bản!</h2>
        <p>Công cụ này được thiết kế để giúp bạn biến những ý tưởng sơ khai thành các kịch bản hoàn chỉnh, hấp dẫn và nhất quán. Dù bạn là một YouTuber dày dặn kinh nghiệm hay một Podcaster đầy tham vọng, Trợ lý AI sẽ là người đồng hành đắc lực của bạn.</p>
        <h3 className="text-lg font-semibold mt-6 mb-3 text-accent/90">Hướng dẫn sử dụng</h3>
        <ol className="list-decimal list-inside space-y-3">
            <li><strong>Cài đặt API Key:</strong> Lần đầu sử dụng, hãy nhấp vào nút <strong>"API"</strong> ở góc trên bên phải để thêm API Key Gemini của bạn.</li>
            <li><strong>Nhập Chủ đề:</strong> Bắt đầu bằng cách nhập ý tưởng chính của bạn vào ô "Chủ đề". Nếu bạn đang bí ý tưởng, hãy thử tính năng <strong>"Gợi ý từ AI"</strong>.</li>
            <li><strong>Chọn Định dạng:</strong> Chọn giữa <strong>"Video YouTube"</strong> hoặc <strong>"Podcast"</strong>. Các tùy chọn sẽ tự động điều chỉnh cho phù hợp.</li>
            <li><strong>Tinh chỉnh & Tạo:</strong> Lựa chọn ngôn ngữ, phong cách, cấu trúc và nhấn <strong>"Tạo kịch bản"</strong>.</li>
            <li><strong>Sử dụng các công cụ khác:</strong> Dễ dàng <strong>Sửa đổi</strong> kịch bản, <strong>Tách lời thoại</strong> cho việc thu âm, và <strong>Lưu trữ</strong> trong thư viện cá nhân.</li>
        </ol>
        <p className="mt-8 text-center font-semibold text-text-primary text-base">
            Hãy điền thông tin ở cột trái và nhấn "Tạo kịch bản" để bắt đầu hành trình sáng tạo của bạn!
        </p>
    </div>
);

const parseMarkdown = (text: string) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 text-accent/90">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 text-accent">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/---/g, '<hr class="border-secondary my-4">')
        .replace(/\n/g, '<br />');
};

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ 
    script, isLoading, error, 
    onSaveToLibrary, onStartSequentialGenerate,
    isGeneratingSequentially, onGenerateNextPart, currentPart, totalParts,
    revisionCount,
    onGenerateVisualPrompt,
    onGenerateAllVisualPrompts, isGeneratingAllVisualPrompts,
    scriptType,
    hasGeneratedAllVisualPrompts, hasSavedToLibrary,
    visualPromptsCache
}) => {
    const [copySuccess, setCopySuccess] = useState('');
    const [loadingPromptIndex, setLoadingPromptIndex] = useState<number | null>(null);

    useEffect(() => {
        if (copySuccess) {
            const timer = setTimeout(() => setCopySuccess(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [copySuccess]);

    const handleCopy = () => {
        if (!script) return;
        navigator.clipboard.writeText(script).then(() => {
            setCopySuccess('Đã chép!');
        }, () => {
            setCopySuccess('Lỗi sao chép');
        });
    };
    
    const handleExportTxt = () => {
        if (!script) return;
        const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'youtube-script.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleGeneratePromptClick = async (index: number, scene: string) => {
        setLoadingPromptIndex(index);
        await onGenerateVisualPrompt(scene);
        setLoadingPromptIndex(null);
    };
    
    const isOutline = script.includes("### Dàn Ý Chi Tiết");
    const showActionControls = !!script;

    const getTitle = () => {
        if (isGeneratingSequentially) return `Đang tạo kịch bản... (Phần ${currentPart}/${totalParts})`;
        if (revisionCount > 0) return `Kịch bản được sửa lần thứ ${revisionCount}`;
        return 'Kịch bản được tạo';
    };

    const renderContent = () => {
        if (isLoading && !script) {
            return (
                <div className="flex items-start justify-center h-full">
                    <div className="w-full max-w-md">
                        <GeneratingIndicator text="Đang tạo..." />
                    </div>
                </div>
            );
        }
        if (error) {
            return <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-md">
                <h3 className="font-bold">Đã xảy ra lỗi</h3>
                <p>{error}</p>
            </div>;
        }
        if (script) {
            const sections = script.split(/(?=^## .*?$|^### .*?$)/m).filter(s => s.trim() !== '');
            return sections.map((section, index) => {
                const hasGeneratedPrompt = visualPromptsCache.has(section);
                return (
                    <div key={index} className="script-section mb-4 pb-4 border-b border-primary/50 last:border-b-0">
                        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(section) }} />
                        {!isOutline && section.trim().length > 50 && (
                            <div className="mt-3 text-right">
                                <button
                                    onClick={() => handleGeneratePromptClick(index, section)}
                                    disabled={loadingPromptIndex === index}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/70 hover:bg-primary text-text-secondary text-xs font-semibold rounded-md transition disabled:opacity-50"
                                >
                                    {loadingPromptIndex === index ? (
                                        <>
                                         <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                         </svg>
                                         <span>Đang tạo...</span>
                                        </>
                                    ) : (
                                        <>
                                          <CameraIcon className="w-4 h-4" />
                                          <span>Tạo Prompt Ảnh/Video</span>
                                          {hasGeneratedPrompt && <CheckIcon className="w-4 h-4 text-green-400 ml-1" />}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                );
            });
        }
        if (!isLoading) return <InitialState />;
        return null;
    }

  return (
    <div className="bg-secondary rounded-lg shadow-xl h-full flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-primary flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-text-primary">
                {getTitle()}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
                {script && !isLoading && isOutline && !isGeneratingSequentially && (
                    <button onClick={onStartSequentialGenerate} className="flex items-center space-x-2 bg-accent hover:bg-indigo-500 text-white px-3 py-1.5 rounded-md text-sm font-semibold transition">
                        <BoltIcon className="w-4 h-4" />
                        <span>Tạo kịch bản đầy đủ</span>
                    </button>
                )}
                {showActionControls && (
                    <>
                         {!isOutline && (
                            <button 
                                onClick={onGenerateAllVisualPrompts} 
                                className="flex items-center space-x-2 bg-primary/70 hover:bg-primary text-text-secondary px-3 py-1.5 rounded-md text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed" 
                                disabled={isGeneratingAllVisualPrompts || isLoading}
                            >
                                <CameraIcon className="w-4 h-4" />
                                <span>{isGeneratingAllVisualPrompts ? 'Đang tạo...' : 'Tạo ảnh/video'}</span>
                                {hasGeneratedAllVisualPrompts && !isGeneratingAllVisualPrompts && <CheckIcon className="w-4 h-4 text-green-400 ml-1" />}
                            </button>
                        )}
                        <button onClick={onSaveToLibrary} className="flex items-center space-x-2 bg-primary/70 hover:bg-primary text-text-secondary px-3 py-1.5 rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
                            <SaveIcon className="w-4 h-4" />
                            <span>Lưu vào thư viện</span>
                            {hasSavedToLibrary && <CheckIcon className="w-4 h-4 text-green-400 ml-1" />}
                        </button>
                        <button onClick={handleExportTxt} className="flex items-center space-x-2 bg-primary/70 hover:bg-primary text-text-secondary px-3 py-1.5 rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
                            <DownloadIcon className="w-4 h-4" />
                            <span>Tải .txt</span>
                        </button>
                        <button onClick={handleCopy} className="flex items-center space-x-2 bg-primary/70 hover:bg-primary text-text-secondary px-3 py-1.5 rounded-md text-sm transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={!!copySuccess || isLoading}>
                            <ClipboardIcon className="w-4 h-4" />
                            <span>{copySuccess || 'Sao chép'}</span>
                        </button>
                    </>
                )}
            </div>
        </div>
        <div className="p-6 overflow-y-auto flex-grow min-h-[400px]">
            <div className="w-full h-full">
                {isLoading && script && (
                    <div className="mb-4">
                        <GeneratingIndicator text="Đang sửa đổi..." />
                    </div>
                )}
                {renderContent()}
            </div>
        </div>
        {isGeneratingSequentially && currentPart < totalParts && !isLoading && (
            <div className="p-4 border-t border-primary">
                <button onClick={onGenerateNextPart} className="w-full flex items-center justify-center bg-accent hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition">
                    Tiếp tục tạo phần {currentPart + 1}/{totalParts}
                </button>
            </div>
        )}
    </div>
  );
};