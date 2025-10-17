import React from 'react';

interface OptionSelectorProps<T extends string> {
  title: string;
  options: readonly { value: T; label: string }[];
  selectedOption: T;
  onSelect: (option: T) => void;
}

export const OptionSelector = <T extends string,>({ title, options, selectedOption, onSelect }: OptionSelectorProps<T>) => {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">{title}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              selectedOption === option.value
                ? 'bg-accent text-white shadow-md'
                : 'bg-primary/70 hover:bg-primary text-text-secondary'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};