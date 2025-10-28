import React, { useState, useEffect } from 'react';
import { TrashIcon } from './icons/TrashIcon';
import type { AiProvider } from '../types';
import { validateApiKey } from '../services/aiService';
import { Tooltip } from './Tooltip';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKeys: Record<AiProvider, string[]>;
  onAddKey: (key: string, provider: AiProvider) => Promise<{ success: boolean, error?: string }>;
  onDeleteKey: (key: string, provider: AiProvider) => void;
}

const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.582-3.654-11.03-8.594l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.596 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

const OpenAIIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 41 41" fill="none" {...props}>
        <path d="M36.3333 19.4882C36.3333 21.3215 35.8888 23.1348 35.0277 24.7848C34.1667 26.4348 32.9127 27.8848 31.3381 29.0482C28.2748 31.2882 24.5333 32.4882 20.5083 32.4882C18.675 32.4882 16.8617 32.0437 15.2117 31.1826C13.5617 30.3215 12.1117 29.0675 10.9483 27.4929C8.70833 24.4296 7.50833 20.6882 7.50833 16.6632C7.50833 14.8298 7.95278 13.0165 8.81389 11.3665C9.675 9.71651 10.929 8.26651 12.5035 7.10317C15.5668 4.86317 19.3083 3.66317 23.3333 3.66317" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></path>
        <path d="M4.66669 21.5118C4.66669 19.6785 5.11113 17.8652 5.97224 16.2152C6.83335 14.5652 8.08733 13.1152 9.66192 11.9518C12.7252 9.71183 16.4667 8.51183 20.4917 8.51183C22.325 8.51183 24.1384 8.95628 25.7884 9.81739C27.4384 10.6785 28.8884 11.9325 30.0517 13.5071C32.2917 16.5704 33.4917 20.3118 33.4917 24.3368C33.4917 26.1702 33.0472 27.9835 32.1861 29.6335C31.325 31.2835 30.071 32.7335 28.4965 33.8968C25.4332 36.1368 21.6917 37.3368 17.6667 37.3368" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
);

const StatusIcon: React.FC<{ status: 'valid' | 'invalid' | 'checking' | 'idle' }> = ({ status }) => {
    switch (status) {
        case 'checking':
            return <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
        case 'valid':
            return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-400"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>;
        case 'invalid':
            return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-400"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>;
        default:
            return <div className="h-5 w-5 flex items-center justify-center"><div className="h-3 w-3 rounded-full border-2 border-gray-500"></div></div>;
    }
};

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, currentApiKeys, onAddKey, onDeleteKey }) => {
    const [geminiKeysInput, setGeminiKeysInput] = useState('');
    const [openAIKeysInput, setOpenAIKeysInput] = useState('');

    const [keyStatuses, setKeyStatuses] = useState<Record<string, { status: 'valid' | 'invalid' | 'checking' | 'idle'; error?: string }>>({});
    const [isChecking, setIsChecking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const geminiKeys = currentApiKeys.gemini || [];
            const openaiKeys = currentApiKeys.openai || [];

            setGeminiKeysInput(geminiKeys.join('\n'));
            setOpenAIKeysInput(openaiKeys.join('\n'));

            const initialStatuses: Record<string, { status: 'valid' | 'invalid' | 'checking' | 'idle'; error?: string }> = {};
            [...geminiKeys, ...openaiKeys].forEach(key => {
                initialStatuses[key] = { status: 'idle' };
            });
            setKeyStatuses(initialStatuses);
            setIsChecking(false);
            setIsSaving(false);
        }
    }, [isOpen, currentApiKeys]);

    const handleCheckAllKeys = async () => {
        setIsChecking(true);
        const allKeys = [
            ...currentApiKeys.gemini.map(key => ({ key, provider: 'gemini' as AiProvider })),
            ...currentApiKeys.openai.map(key => ({ key, provider: 'openai' as AiProvider }))
        ];

        setKeyStatuses(prev => {
            const newStatuses = { ...prev };
            allKeys.forEach(({ key }) => {
                newStatuses[key] = { status: 'checking' };
            });
            return newStatuses;
        });

        const results = await Promise.allSettled(
            allKeys.map(({ key, provider }) => validateApiKey(key, provider).catch(err => { throw err; }))
        );

        setKeyStatuses(prev => {
            const newStatuses = { ...prev };
            results.forEach((result, index) => {
                const { key } = allKeys[index];
                if (result.status === 'fulfilled') {
                    newStatuses[key] = { status: 'valid' };
                } else {
                    newStatuses[key] = { status: 'invalid', error: result.reason instanceof Error ? result.reason.message : 'Lỗi không xác định' };
                }
            });
            return newStatuses;
        });
        setIsChecking(false);
    };

    const handleSaveAndCheck = async () => {
        setIsSaving(true);
    
        const newGeminiKeys = geminiKeysInput.split('\n').map(k => k.trim()).filter(Boolean);
        const newOpenAIKeys = openAIKeysInput.split('\n').map(k => k.trim()).filter(Boolean);
    
        const oldGeminiKeys = currentApiKeys.gemini || [];
        const oldOpenAIKeys = currentApiKeys.openai || [];
    
        const geminiKeysToDelete = oldGeminiKeys.filter(k => !newGeminiKeys.includes(k));
        const openAIKeysToDelete = oldOpenAIKeys.filter(k => !newOpenAIKeys.includes(k));
    
        geminiKeysToDelete.forEach(key => onDeleteKey(key, 'gemini'));
        openAIKeysToDelete.forEach(key => onDeleteKey(key, 'openai'));
    
        const geminiKeysToAdd = newGeminiKeys.filter(k => !oldGeminiKeys.includes(k));
        const openAIKeysToAdd = newOpenAIKeys.filter(k => !newOpenAIKeys.includes(k));
    
        const allNewKeys = [...newGeminiKeys.map(key => ({ key, provider: 'gemini' as AiProvider})), ...newOpenAIKeys.map(key => ({ key, provider: 'openai' as AiProvider}))];
        
        // Remove old keys, then add all current keys from textarea to respect new order
        [...oldGeminiKeys, ...oldOpenAIKeys].forEach(key => onDeleteKey(key, allNewKeys.find(k => k.key === key)?.provider || 'gemini'));
        
        for (const key of newGeminiKeys.reverse()) {
             await onAddKey(key, 'gemini');
        }
        for (const key of newOpenAIKeys.reverse()) {
             await onAddKey(key, 'openai');
        }
    
        setIsSaving(false);
        onClose();
    };    

    if (!isOpen) return null;
    
    const renderKeyPanel = (provider: AiProvider) => {
        const isGemini = provider === 'gemini';
        const title = isGemini ? 'Google Gemini' : 'OpenAI';
        const icon = isGemini ? <GoogleIcon /> : <OpenAIIcon className="text-white"/>;
        const keys = currentApiKeys[provider] || [];
        const inputValue = isGemini ? geminiKeysInput : openAIKeysInput;
        const setInputValue = isGemini ? setGeminiKeysInput : setOpenAIKeysInput;
        const link = isGemini 
            ? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google AI Studio</a>
            : <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">trang tổng quan OpenAI</a>;
        
        return (
            <div className="bg-primary/50 p-4 rounded-lg border border-secondary flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                    {icon}
                    <h3 className="font-semibold text-text-primary text-lg">{title}</h3>
                </div>
                <label className="text-sm text-text-secondary mb-1">Chỉnh sửa Keys {title} (mỗi key một dòng)</label>
                <textarea
                    className="w-full h-40 bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition font-mono text-sm"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <p className="text-xs text-text-secondary/80 mt-1">Lấy key từ {link}.</p>
                <div className="mt-4 flex-grow space-y-2 h-32 overflow-y-auto pr-2">
                    {keys.length === 0 ? (
                        <div className="text-center text-sm text-text-secondary pt-8">Chưa có key nào.</div>
                    ) : (
                        keys.map((key, index) => (
                            <div key={key} className={`bg-secondary p-2 rounded-md flex justify-between items-center text-sm transition-all ${index === 0 ? 'border-l-2 border-accent' : ''}`}>
                                <div className="flex items-center gap-2">
                                    <Tooltip text={keyStatuses[key]?.error || keyStatuses[key]?.status}>
                                        <StatusIcon status={keyStatuses[key]?.status || 'idle'} />
                                    </Tooltip>
                                    <span className="font-mono text-text-secondary">{`...${key.slice(-6)}`}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {index === 0 && <span className="text-xs font-bold text-accent bg-primary/50 px-2 py-0.5 rounded-full">ACTIVE</span>}
                                    <button onClick={() => onDeleteKey(key, provider)} className="p-1 text-red-400 hover:text-red-300 rounded-full transition" aria-label="Xóa key"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-2xl w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-primary">
                    <h2 className="text-xl font-bold text-accent">Quản lý API Keys</h2>
                    <p className="text-sm text-text-secondary mt-1">Thêm hoặc chỉnh sửa API Keys cho Google Gemini và OpenAI. Hệ thống sẽ tự động thử các key hợp lệ theo thứ tự.</p>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderKeyPanel('gemini')}
                    {renderKeyPanel('openai')}
                </div>
                <div className="p-4 bg-primary/30 border-t border-primary flex flex-wrap justify-end items-center gap-3">
                    <button onClick={handleCheckAllKeys} disabled={isChecking || isSaving} className="text-sm bg-secondary hover:bg-primary text-text-secondary font-semibold py-2 px-4 rounded-md transition disabled:opacity-50">
                       {isChecking ? 'Đang kiểm tra...' : 'Kiểm tra lại API Keys'}
                    </button>
                    <button onClick={handleSaveAndCheck} disabled={isSaving || isChecking} className="text-sm bg-accent hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50">
                        {isSaving ? 'Đang lưu...' : 'Lưu và kiểm tra tất cả'}
                    </button>
                    <button onClick={onClose} className="text-sm bg-secondary hover:bg-primary text-text-secondary font-semibold py-2 px-4 rounded-md transition">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};