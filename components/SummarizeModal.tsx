import React, { useState, useEffect } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import type { ScriptPartSummary, ScriptType } from '../types';

// Make TypeScript aware of the global XLSX object from the CDN
declare const XLSX: any;

interface SummarizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ScriptPartSummary[] | null;
  isLoading: boolean;
  error: string | null;
  scriptType: ScriptType;
  title: string;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-4 p-4 bg-primary/50 rounded-lg">
                <div className="h-6 bg-primary rounded w-1/3 mb-4"></div>
                {[...Array(3)].map((_, j) => (
                    <div key={j} className="border-t border-secondary pt-4 mt-4">
                        <div className="h-4 bg-primary rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-primary rounded w-1/4 mb-2"></div>
                        <div className="h-16 bg-primary rounded w-full"></div>
                    </div>
                ))}
            </div>
        ))}
    </div>
);

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const handleCopy = () => {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="mt-2 flex items-center space-x-2 bg-primary/70 hover:bg-primary text-text-secondary px-3 py-1.5 rounded-md text-xs font-semibold transition"
        >
            <ClipboardIcon className="w-4 h-4" />
            <span>{copied ? 'Đã chép!' : 'Sao chép'}</span>
        </button>
    );
};

export const SummarizeModal: React.FC<SummarizeModalProps> = ({ isOpen, onClose, summary, isLoading, error, scriptType, title }) => {
    if (!isOpen) return null;

    const handleDownloadExcel = () => {
        if (!summary || typeof XLSX === 'undefined') return;

        const header = ['STT', 'Prompt', 'Trạng thái', 'Dịch nghĩa prompt'];
        const data: (string | number)[][] = [];
        let sceneCounter = 1;

        summary.forEach(part => {
            part.scenes.forEach(scene => {
                data.push([
                    sceneCounter++,      // STT
                    scene.visualPrompt,  // Prompt
                    '',                  // Trạng thái
                    scene.summary        // Using summary as the Vietnamese meaning
                ]);
            });
        });

        const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Prompts Tóm Tắt');
        
        const sanitizedTitle = title.replace(/[^a-z0-9_-\s]/gi, '').trim().replace(/\s+/g, '_');
        const fileName = `Prompt_${sanitizedTitle || 'untitled'}.xlsx`;
        
        XLSX.writeFile(workbook, fileName);
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div 
                className="bg-secondary rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-primary">
                    <h2 className="text-xl font-bold text-accent">Chuyển thể Kịch bản thành Cảnh quay</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl font-bold">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    {isLoading && <LoadingSkeleton />}
                    {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
                    {!isLoading && !error && summary && (
                        <div className="space-y-8">
                            {summary.map((part, index) => (
                                <div key={index} className="bg-primary/50 p-4 rounded-lg">
                                    <h3 className="text-lg font-bold text-accent mb-4 border-b border-secondary pb-2">{part.partTitle}</h3>
                                    <div className="space-y-4">
                                        {part.scenes.map(scene => (
                                            <div key={scene.sceneNumber} className="border-t border-secondary/50 pt-3">
                                                <p className="text-sm text-text-secondary"><strong className="text-text-primary font-semibold">Cảnh {scene.sceneNumber} - Tóm tắt (cho ~8s):</strong> {scene.summary}</p>
                                                <div className="mt-2">
                                                    <label className="block text-xs font-semibold text-text-secondary mb-1">Prompt Video (Tiếng Anh)</label>
                                                    <textarea
                                                        readOnly
                                                        rows={3}
                                                        className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary resize-y text-sm font-mono"
                                                        value={scene.visualPrompt}
                                                    />
                                                    <CopyButton text={scene.visualPrompt} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-primary flex justify-end items-center gap-4">
                    {isLoading && (
                        <p className="text-xs text-accent flex-grow">Bạn có thể đóng hộp thoại này và quay trở lại sau khi hoàn tất.</p>
                    )}
                    <button 
                        onClick={handleDownloadExcel}
                        disabled={isLoading || !summary || summary.length === 0}
                        className="flex items-center gap-2 text-sm bg-primary/70 hover:bg-primary text-text-secondary font-semibold py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Download Prompts
                    </button>
                    <button onClick={onClose} className="bg-accent hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};