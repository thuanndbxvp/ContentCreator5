import React, { useState, useEffect, useRef } from 'react';
import type { ElevenlabsVoice } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { PlayIcon } from './icons/PlayIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';

interface TtsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dialogue: Record<string, string> | null;
  voices: ElevenlabsVoice[];
  isLoadingVoices: boolean;
  onGenerate: (voiceId: string) => void;
  isGenerating: boolean;
  audioUrl: string | null;
  error: string | null;
}

const VoiceItem: React.FC<{voice: ElevenlabsVoice, isSelected: boolean, onSelect: () => void}> = ({ voice, isSelected, onSelect }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayPreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            } else {
                audioRef.current.play().catch(console.error);
            }
        }
    }

    useEffect(() => {
        const audio = audioRef.current;
        const onStateChange = () => setIsPlaying(!!(audio && !audio.paused && !audio.ended));
        audio?.addEventListener('play', onStateChange);
        audio?.addEventListener('pause', onStateChange);
        audio?.addEventListener('ended', onStateChange);
        return () => {
            audio?.removeEventListener('play', onStateChange);
            audio?.removeEventListener('pause', onStateChange);
            audio?.removeEventListener('ended', onStateChange);
        }
    }, []);

    return (
        <li 
            onClick={onSelect}
            className={`p-3 rounded-lg flex justify-between items-center cursor-pointer transition-colors border ${isSelected ? 'bg-accent text-white border-accent' : 'bg-primary hover:bg-primary/50 border-border'}`}
        >
            <div className="flex-grow">
                <p className="font-semibold">{voice.name}</p>
                <div className="text-xs opacity-80 flex flex-wrap gap-x-2 gap-y-1 mt-1">
                    {voice.labels.gender && <span>{voice.labels.gender}</span>}
                    {voice.labels.age && <span>{voice.labels.age}</span>}
                    {voice.labels.accent && <span>{voice.labels.accent}</span>}
                </div>
            </div>
            <button onClick={handlePlayPreview} className="p-2 rounded-full hover:bg-white/20 transition-colors flex-shrink-0" aria-label={`Nghe thử giọng ${voice.name}`}>
                <PlayIcon className={`w-5 h-5 ${isPlaying ? 'text-yellow-400' : ''}`} />
            </button>
            <audio ref={audioRef} src={voice.preview_url} preload="none" />
        </li>
    );
};


export const TtsModal: React.FC<TtsModalProps> = ({ isOpen, onClose, dialogue, voices, isLoadingVoices, onGenerate, isGenerating, audioUrl, error }) => {
    const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');

    useEffect(() => {
        if(voices.length > 0 && !selectedVoiceId) {
            setSelectedVoiceId(voices[0].voice_id);
        }
    }, [voices, selectedVoiceId]);
    
    if (!isOpen) return null;

    const dialogueText = dialogue ? Object.values(dialogue).join('\n\n') : 'Không có lời thoại để chuyển đổi. Vui lòng tạo kịch bản và tách lời thoại trước.';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-secondary rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-border" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-border">
                <div className="flex items-center gap-3">
                    <SpeakerWaveIcon className="w-6 h-6 text-accent"/>
                    <h2 className="text-xl font-bold text-accent">Chuyển kịch bản thành giọng nói (TTS)</h2>
                </div>
                <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl font-bold">&times;</button>
            </div>

            {/* Content */}
            <div className="flex-grow p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                {/* Left: Voice Selection */}
                <div className="flex flex-col min-h-0">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">1. Chọn một giọng đọc</h3>
                    <div className="flex-grow bg-primary rounded-lg p-3 overflow-y-auto border border-border">
                        {isLoadingVoices && <p className="text-center p-4">Đang tải danh sách giọng nói...</p>}
                        {voices.length > 0 && (
                            <ul className="space-y-2">
                                {voices.map(voice => (
                                    <VoiceItem 
                                        key={voice.voice_id}
                                        voice={voice}
                                        isSelected={selectedVoiceId === voice.voice_id}
                                        onSelect={() => setSelectedVoiceId(voice.voice_id)}
                                    />
                                ))}
                            </ul>
                        )}
                        {!isLoadingVoices && voices.length === 0 && !error && <p className="text-center p-4">Không tìm thấy giọng nói. Vui lòng kiểm tra API key ElevenLabs của bạn.</p>}
                    </div>
                </div>
                {/* Right: Text and Player */}
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-text-primary mb-3">2. Lời thoại & Kết quả</h3>
                    <textarea
                        readOnly
                        value={dialogueText}
                        className="w-full h-48 bg-primary border border-border rounded-md p-3 text-text-primary resize-none mb-4"
                    />
                    
                    {audioUrl && !isGenerating && (
                        <div className="bg-primary p-4 rounded-lg space-y-3 border border-border">
                            <h4 className="font-semibold">Nghe thử kết quả</h4>
                            <audio controls src={audioUrl} className="w-full"></audio>
                            <a href={audioUrl} download="script_audio.mp3" className="flex items-center justify-center gap-2 w-full mt-2 text-sm bg-secondary hover:bg-secondary/70 text-text-secondary font-semibold py-2 px-4 rounded-md transition border border-border">
                                <DownloadIcon className="w-5 h-5"/>
                                Tải xuống file MP3
                            </a>
                        </div>
                    )}
                     {isGenerating && (
                        <div className="bg-primary p-4 rounded-lg flex items-center justify-center text-accent border border-border">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang tạo audio, quá trình này có thể mất vài phút...
                        </div>
                     )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex justify-end items-center gap-4 flex-wrap">
                {error && <p className="text-red-400 text-sm flex-grow">{error}</p>}
                {(isGenerating || isLoadingVoices) && <div className="flex-grow text-sm text-accent">Đang xử lý, vui lòng chờ...</div>}
                
                <button onClick={onClose} className="bg-secondary/70 hover:bg-secondary text-text-secondary font-bold py-2 px-4 rounded-md transition border border-border">
                    Đóng
                </button>
                <button 
                    onClick={() => onGenerate(selectedVoiceId)}
                    disabled={isGenerating || isLoadingVoices || !selectedVoiceId || !dialogue}
                    className="bg-accent hover:brightness-110 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50"
                >
                    {isGenerating ? 'Đang tạo...' : 'Tạo Audio'}
                </button>
            </div>
        </div>
      </div>
    );
};