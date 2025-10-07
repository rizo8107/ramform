import React from 'react';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  language: 'en' | 'ta';
  onLanguageChange: (language: 'en' | 'ta') => void;
}

export default function LanguageToggle({ language, onLanguageChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-white/20">
      <Globe className="h-4 w-4 text-green-600" />
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-white text-green-600'
            : 'text-gray-700 hover:bg-green-50'
        }`}
      >
        English
      </button>
      <button
        onClick={() => onLanguageChange('ta')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'ta'
            ? 'bg-white text-green-600'
            : 'text-gray-700 hover:bg-green-50'
        }`}
      >
        தமிழ்
      </button>
    </div>
  );
}