import React, { useState, useEffect } from 'react';
import { TrashIcon } from './icons/TrashIcon';
import type { AiProvider } from '../types';
import { validateApiKey } from '../services/aiService';
import { Tooltip } from './Tooltip';
import { CheckIcon } from './icons/CheckIcon';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKeys: Record<AiProvider, string[]>;
  onSaveKeys: (keys: Record<AiProvider, string[]>) => void;
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

const ElevenLabsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M16.0911 20.3333C17.0278 20.3333 18.0556 19.8611 18.0556 18.9244V5.07555C18.0556 4.13888 17.1189 3.66666 16.0911 3.66666C15.0633 3.66666 14.1267 4.13888 14.1267 5.07555V18.9244C14.1267 19.8611 15.0633 20.3333 16.0911 20.3333Z" fill="currentColor"/>
        <path d="M10.1978 21.7778C11.1345 21.7778 12.1622 21.3055 12.1622 20.3689V3.63111C12.1622 2.69444 11.2256 2.22222 10.1978 2.22222C9.17004 2.22222 8.23337 2.69444 8.23337 3.63111V20.3689C8.23337 21.3055 9.17004 21.7778 10.1978 21.7778Z" fill="currentColor"/>
        <path d="M4.30449 20.3333C5.24116 20.3333 6.26893 19.8611 6.26893 18.9244V5.07555C6.26893 4.13888 5.33227 3.66666 4.30449 3.66666C3.27671 3.66666 2.34004 4.13888 2.34004 5.07555V18.9244C2.34004 19.8611 3.27671 20.3333 4.30449 20.3333Z" fill="currentColor"/>
        <path d="M21.9845 18.2578C22.9212 18.2578 23.9489 17.7855 23.9489 16.8489V7.15111C23.9489 6.21444 23.0123 5.74222 21.9845 5.74222C20.9567 5.74222 20.0201 6.21444 20.0201 7.15111V16.8489C20.0201 17.7855 20.9567 18.2578 21.9845 18.2578Z" fill="currentColor"/>
        <path d="M0.0511475 16.8489C1.07892 16.8489 2.01559 16.3767 2.01559 15.44V8.56C2.01559 7.62333 1.07892 7.15111 0.0511475 7.15111C-0.88552 7.15111 -1.82219 7.62333 -1.82219 8.56V15.44C-1.82219 16.3767 -0.88552 16.8489 0.0511475 16.8489Z" fill="currentColor"/>
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

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, currentApiKeys, onSaveKeys }) => {
    const [geminiKeysInput, setGeminiKeysInput] = useState('');
    const [openAIKeysInput, setOpenAIKeysInput] = useState('');
    const [elevenLabsKeysInput, setElevenLabsKeysInput] = useState('');

    const [savingStatus, setSavingStatus] = useState<Record<AiProvider, 'idle' | 'saving' | 'success' | 'error'>>({ gemini: 'idle', openai: 'idle', elevenlabs: 'idle' });
    const [saveErrors, setSaveErrors] = useState<Record<AiProvider, string | null>>({ gemini: null, openai: null, elevenlabs: null });


    useEffect(() => {
        if (isOpen) {
            setGeminiKeysInput((currentApiKeys.gemini || []).join('\n'));
            setOpenAIKeysInput((currentApiKeys.openai || []).join('\n'));
            setElevenLabsKeysInput((currentApiKeys.elevenlabs || []).join('\n'));
            
            setSavingStatus({ gemini: 'idle', openai: 'idle', elevenlabs: 'idle' });
            setSaveErrors({ gemini: null, openai: null, elevenlabs: null });
        }
    }, [isOpen, currentApiKeys]);

    const handleSaveProviderKeys = async (provider: AiProvider) => {
        setSavingStatus(prev => ({ ...prev, [provider]: 'saving' }));
        setSaveErrors(prev => ({ ...prev, [provider]: null }));
    
        const keysInput = provider === 'gemini' ? geminiKeysInput : provider === 'openai' ? openAIKeysInput : elevenLabsKeysInput;
        const newKeys = keysInput.split('\n').map(k => k.trim()).filter(Boolean);
    
        try {
            if (newKeys.length > 0) {
                const validationPromises = newKeys.map(key => 
                    validateApiKey(key, provider).catch(err => {
                        const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
                        throw new Error(`Key ...${key.slice(-4)} không hợp lệ: ${err.message}`);
                    })
                );
                await Promise.all(validationPromises);
            }
            
            const newApiKeysState = { ...currentApiKeys, [provider]: newKeys };
            onSaveKeys(newApiKeysState);

            setSavingStatus(prev => ({ ...prev, [provider]: 'success' }));
            setTimeout(() => setSavingStatus(prev => ({ ...prev, [provider]: 'idle' })), 2000);
    
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Lỗi xác thực không xác định.';
            setSaveErrors(prev => ({ ...prev, [provider]: errorMessage }));
            setSavingStatus(prev => ({ ...prev, [provider]: 'error' }));
        }
    };
    

    if (!isOpen) return null;
    
    const renderKeyPanel = (provider: AiProvider) => {
        const isGemini = provider === 'gemini';
        const isElevenLabs = provider === 'elevenlabs';
        const title = isGemini ? 'Google Gemini' : isElevenLabs ? 'ElevenLabs TTS' : 'OpenAI';
        const icon = isGemini ? <GoogleIcon /> : isElevenLabs ? <ElevenLabsIcon className="text-sky-400"/> : <OpenAIIcon className="text-white"/>;
        
        const inputValue = isGemini ? geminiKeysInput : isElevenLabs ? elevenLabsKeysInput : openAIKeysInput;
        const setInputValue = isGemini ? setGeminiKeysInput : isElevenLabs ? setElevenLabsKeysInput : setOpenAIKeysInput;
        const displayedKeys = (currentApiKeys[provider] || []);

        const link = isGemini 
            ? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Google AI Studio</a>
            : isElevenLabs
            ? <a href="https://elevenlabs.io/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">trang chủ ElevenLabs</a>
            : <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">trang tổng quan OpenAI</a>;
        
        const getButtonContent = () => {
            switch (savingStatus[provider]) {
                case 'saving':
                    return (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Đang lưu...
                        </>
                    );
                case 'success':
                    return (
                        <>
                            <CheckIcon className="w-4 h-4 mr-2" />
                            Đã lưu!
                        </>
                    );
                default:
                    return 'Lưu & Kiểm tra';
            }
        };

        return (
            <div className="bg-primary/50 p-4 rounded-lg border border-border flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                    {icon}
                    <h3 className="font-semibold text-text-primary text-lg">{title}</h3>
                </div>
                <label className="text-sm text-text-secondary mb-1">Dán Keys của bạn vào đây (mỗi key một dòng):</label>
                <textarea
                    className="w-full h-28 bg-secondary/50 border border-border rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition font-mono text-sm"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="dán_api_key_của_bạn_vào_đây"
                />
                <p className="text-xs text-text-secondary/80 mt-1">Lấy key từ {link}. Key ở trên cùng sẽ được ưu tiên sử dụng.</p>

                <div className="mt-4 pt-4 border-t border-border/50 flex flex-col items-end">
                    {saveErrors[provider] && <p className="text-red-400 text-xs mb-2 text-right w-full">{saveErrors[provider]}</p>}
                    <button
                        onClick={() => handleSaveProviderKeys(provider)}
                        disabled={savingStatus[provider] === 'saving'}
                        className={`flex items-center justify-center text-sm font-bold py-2 px-4 rounded-md transition disabled:opacity-50
                            ${savingStatus[provider] === 'success' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-accent hover:brightness-110 text-white'
                            }`
                        }
                    >
                        {getButtonContent()}
                    </button>
                </div>

                <div className="mt-4 flex-grow space-y-2 min-h-[5rem] overflow-y-auto pr-2">
                    <h4 className="text-xs font-semibold text-text-secondary/80">Keys đang được lưu:</h4>
                    {displayedKeys.length === 0 ? (
                        <div className="text-center text-sm text-text-secondary pt-4">Chưa có key nào.</div>
                    ) : (
                        displayedKeys.map((key, index) => (
                            <div key={`${provider}-${index}`} className={`bg-secondary p-2 rounded-md flex justify-between items-center text-sm transition-all ${index === 0 ? 'border-l-2 border-accent' : ''}`}>
                                <span className="font-mono text-text-secondary">{`...${key.slice(-6)}`}</span>
                                {index === 0 && <span className="text-xs font-bold text-accent bg-primary/50 px-2 py-0.5 rounded-full">ACTIVE</span>}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-secondary rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col border border-border" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-border">
                    <h2 className="text-xl font-bold text-accent">Quản lý API Keys</h2>
                    <p className="text-sm text-text-secondary mt-1">Thêm hoặc chỉnh sửa API Keys. Hệ thống sẽ tự động thử các key hợp lệ theo thứ tự từ trên xuống dưới.</p>
                </div>
                <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
                    {renderKeyPanel('gemini')}
                    {renderKeyPanel('openai')}
                    {renderKeyPanel('elevenlabs')}
                </div>
                <div className="p-4 bg-primary/30 border-t border-border flex flex-col sm:flex-row justify-end items-center gap-3">
                     <button onClick={onClose} className="text-sm bg-secondary hover:bg-secondary/70 text-text-secondary font-semibold py-2 px-4 rounded-md transition border border-border">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};