import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useGeocode, useDebounce } from '../hooks';
import type { SearchSuggestion } from '../types';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: SearchSuggestion) => void;
  onClear: () => void;
  placeholder?: string;
}

const KEYBOARD_NAVIGATION_KEYS = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'] as const;

export const SearchBox = memo(function SearchBox({
  value,
  onChange,
  onSelect,
  onClear,
  placeholder = 'Search city or country…',
}: SearchBoxProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { suggestions, loading, error, search, clear: clearGeocode } = useGeocode();
  const debouncedSearch = useDebounce(value, 400);

  // Trigger geocoding search when debounced value changes
  useEffect(() => {
    if (debouncedSearch.trim()) {
      search(debouncedSearch);
    } else {
      clearGeocode();
    }
  }, [debouncedSearch, search, clearGeocode]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!KEYBOARD_NAVIGATION_KEYS.includes(e.key as any)) return;

    e.preventDefault();

    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        setHighlightedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          onSelect(suggestions[highlightedIndex]);
          setShowDropdown(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [suggestions, highlightedIndex, onSelect]);

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowDropdown(true);
    setHighlightedIndex(-1);
  }, [onChange]);

  // Handle input focus
  const handleFocus = useCallback(() => {
    if (value.trim() || suggestions.length > 0) {
      setShowDropdown(true);
    }
  }, [value, suggestions.length]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlight when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  return (
    <div className="relative" role="search">
      <label htmlFor="search-input" className="sr-only">
        Search places
      </label>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)] pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input pl-10 pr-10"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showDropdown && suggestions.length > 0}
          aria-activedescendant={highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined}
          autoComplete="off"
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              onClear();
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[var(--color-bg-secondary)] transition-colors text-[var(--color-text-secondary)]"
            aria-label="Clear search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        {loading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-[var(--color-accent)]">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 card overflow-hidden animate-fade-in z-20"
        >
          {error && (
            <div className="p-3 text-sm text-red-500 dark:text-red-400" role="alert">
              {error}
            </div>
          )}

          {suggestions.length === 0 && !loading && !error && value.trim() && (
            <div className="p-3 text-sm text-[var(--color-text-secondary)]" role="option">
              No results found
            </div>
          )}

          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => {
                onSelect(suggestion);
                setShowDropdown(false);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-3 py-2.5 text-left flex items-center gap-2 transition-colors ${
                index === highlightedIndex
                  ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]'
                  : 'hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)]'
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-sm truncate">{suggestion.label}</span>
            </button>
          ))}

          {suggestions.length === 0 && !loading && !error && !value.trim() && (
            <div className="p-3 text-sm text-[var(--color-text-secondary)]" role="option" aria-disabled="true">
              Start typing to search…
            </div>
          )}
        </div>
      )}
    </div>
  );
});