import { Search, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { searchMessages } from '../utils/db';
import type { Message } from '../types';

interface SearchBarProps {
  onSearch: (keyword: string, results: Message[]) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentChannel = useChatStore((state) => state.currentChannel);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleSearch = async () => {
      if (keyword.trim()) {
        const searchResults = await searchMessages(currentChannel, keyword);
        setResults(searchResults);
        setCurrentIndex(0);
        onSearch(keyword, searchResults);
      } else {
        setResults([]);
        onSearch('', []);
      }
    };

    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [keyword, currentChannel, onSearch]);

  const handleClose = () => {
    setIsOpen(false);
    setKeyword('');
    setResults([]);
    onSearch('', []);
  };

  const goToNext = () => {
    if (results.length > 0) {
      const nextIndex = (currentIndex + 1) % results.length;
      setCurrentIndex(nextIndex);
      const element = document.querySelector(`[data-message-id="${results[nextIndex].id}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const goToPrev = () => {
    if (results.length > 0) {
      const prevIndex = (currentIndex - 1 + results.length) % results.length;
      setCurrentIndex(prevIndex);
      const element = document.querySelector(`[data-message-id="${results[prevIndex].id}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2">
      <Search className="w-4 h-4 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索消息..."
        className="bg-transparent outline-none text-sm text-gray-700 dark:text-white placeholder-gray-400 w-40"
      />
      {results.length > 0 && (
        <span className="text-xs text-gray-400">
          {currentIndex + 1}/{results.length}
        </span>
      )}
      {keyword && (
        <>
          <button
            onClick={goToPrev}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ↑
          </button>
          <button
            onClick={goToNext}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            ↓
          </button>
        </>
      )}
      <button
        onClick={handleClose}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
