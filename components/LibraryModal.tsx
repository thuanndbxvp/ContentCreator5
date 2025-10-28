import React from 'react';
import type { LibraryItem } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  library: LibraryItem[];
  onLoad: (item: LibraryItem) => void;
  onDelete: (id: number) => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({ isOpen, onClose, library, onLoad, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div 
        className="bg-secondary rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-primary">
          <h2 className="text-xl font-bold text-accent">Thư viện Kịch bản</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          {library.length === 0 ? (
            <p className="text-center text-text-secondary">Thư viện của bạn đang trống.</p>
          ) : (
            <ul className="space-y-4">
              {library.map(item => (
                <li key={item.id} className="bg-primary/50 p-4 rounded-lg flex justify-between items-start gap-4">
                  <div className="flex-grow">
                    <h3 className="font-semibold text-text-primary">{item.title}</h3>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">{item.outlineContent}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button onClick={() => onLoad(item)} className="text-xs bg-accent hover:bg-indigo-500 text-white font-bold py-1 px-3 rounded-md transition">Tải</button>
                    <button onClick={() => onDelete(item.id)} className="text-xs bg-red-600 hover:bg-red-500 text-white font-bold p-1 rounded-md transition" aria-label="Xóa">
                        <TrashIcon className="w-4 h-4"/>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
