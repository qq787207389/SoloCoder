import { useState, useEffect, useRef } from 'react';
import { useWeatherStore } from '../store/weatherStore';

export function SearchBar() {
  const { searchQuery, searchResults, searchCities, selectCity, clearSearch } = useWeatherStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchCities(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setIsOpen(searchResults.length > 0);
  }, [searchResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (city: { id: string; name: string; country: string }) => {
    selectCity(city);
    setIsOpen(false);
  };

  const handleClear = () => {
    clearSearch();
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索城市..."
          value={searchQuery}
          onChange={(e) => useWeatherStore.getState().setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setIsOpen(true)}
          className="w-full px-4 py-3 pl-12 pr-10 text-gray-700 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          {searchResults.map((city) => (
            <button
              key={city.id}
              onClick={() => handleSelectCity(city)}
              className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <span className="text-gray-700 font-medium">{city.name}</span>
                <span className="text-gray-400 text-sm ml-2">{city.country}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
