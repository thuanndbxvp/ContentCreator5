
import React, { useState, useEffect } from 'react';
import { SaveIcon } from './icons/SaveIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKeys: string[];
  onAddKey: (key: string) => Promise<{ success: boolean, error?: string }>;
  onDeleteKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, currentApiKeys, onAddKey, onDeleteKey }) => {
  const [newApiKeyInput, setNewApiKeyInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'validating' | 'error' | 'success'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewApiKeyInput('');
      setStatus('idle');
      setError('');
    }
  }, [isOpen]);

  const handleAdd = async () => {
    if (!newApiKeyInput.trim()) {
      setError('API Key không được để trống.');
      setStatus('error');
      return;
    }
    setStatus('validating');
    setError('');
    const result = await onAddKey(newApiKeyInput.trim());
    if (result.success) {
      setStatus('success');
      setNewApiKeyInput('');
      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    } else {
      setStatus('error');
      setError(result.error || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div 
        className="bg-secondary rounded-lg shadow-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-primary">
          <h2 className="text-xl font-bold text-accent">Quản lý API Keys</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl font-bold">&times;</button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-text-secondary mb-2">
                Thêm API Key mới
            </label>
            <div className="flex items-center gap-2">
                <input
                  id="apiKey"
                  type="password"
                  className="w-full bg-primary/70 border border-secondary rounded-md p-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent transition"
                  placeholder="Nhập API Key của bạn tại đây"
                  value={newApiKeyInput}
                  onChange={(e) => setNewApiKeyInput(e.target.value)}
                />
                <button
                    onClick={handleAdd}
                    disabled={status === 'validating' || !newApiKeyInput}
                    className="flex items-center justify-center w-32 shrink-0 gap-2 text-sm bg-accent hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition disabled:opacity-50"
                >
                    {status === 'validating' ? (
                        <>
                           <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                        </>
                    ) : (
                        'Thêm Key'
                    )}
                </button>
            </div>
          </div>
          {status === 'error' && <p className="text-red-400 text-sm">{error}</p>}
          {status === 'success' && <p className="text-green-400 text-sm">Thêm API Key thành công!</p>}
          
          <div className="border-t border-primary pt-4">
              <h3 className="text-md font-semibold text-text-primary mb-3">Các API Key đã lưu</h3>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {currentApiKeys.length === 0 ? (
                      <p className="text-sm text-text-secondary text-center py-4">Chưa có API Key nào được lưu.</p>
                  ) : (
                      <ul className="space-y-2">
                          {currentApiKeys.map((key, index) => (
                              <li key={key} className="bg-primary/50 p-3 rounded-md flex justify-between items-center text-sm">
                                  <div className="font-mono text-text-secondary">
                                      <span>{`••••••••••${key.slice(-6)}`}</span>
                                      {index === 0 && <span className="ml-3 text-xs font-sans text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full">Đang hoạt động</span>}
                                  </div>
                                  <button onClick={() => onDeleteKey(key)} className="p-1 text-red-400 hover:text-red-300 hover:bg-red-800/50 rounded-full transition" aria-label="Xóa key">
                                      <TrashIcon className="w-5 h-5" />
                                  </button>
                              </li>
                          ))}
                      </ul>
                  )}
              </div>
          </div>
        </div>
        <div className="p-4 border-t border-primary flex justify-end">
            <button onClick={onClose} className="text-sm bg-primary/70 hover:bg-primary text-text-secondary font-semibold py-2 px-4 rounded-md transition">
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};