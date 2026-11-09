import { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { SearchBox } from './SearchBox';
import { PlaceList } from './PlaceList';
import { ThemeToggle } from './ThemeToggle';
import type { Place, SearchSuggestion, SortOrder } from '../types';

interface SidebarProps {
  places: Place[];
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  filter: string;
  sortOrder: SortOrder;
  searchPin: SearchSuggestion | null;
  isMobile: boolean;
  isSidebarOpen: boolean;
  onPlaceClick: (place: Place) => void;
  onPlaceHover: (placeId: string | null) => void;
  onFilterChange: (filter: string) => void;
  onSortChange: (order: SortOrder) => void;
  onSearchSelect: (suggestion: SearchSuggestion) => void;
  onSearchClear: () => void;
  onCloseSidebar: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}

export const Sidebar = memo(function Sidebar({
  places,
  selectedPlaceId,
  hoveredPlaceId,
  filter,
  sortOrder,
  isMobile,
  isSidebarOpen,
  onPlaceClick,
  onPlaceHover,
  onFilterChange,
  onSortChange,
  onSearchSelect,
  onSearchClear,
  onCloseSidebar,
  onToggleTheme,
  theme,
}: SidebarProps) {
  const [searchValue, setSearchValue] = useState(filter);

  // Sync search value with filter prop
  useEffect(() => {
    setSearchValue(filter);
  }, [filter]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    onFilterChange(value);
  }, [onFilterChange]);

  const handleSearchClear = useCallback(() => {
    setSearchValue('');
    onFilterChange('');
    onSearchClear();
  }, [onFilterChange, onSearchClear]);

  // Calculate country count
  const countryCount = useMemo(
    () => new Set(places.map((p) => p.country)).size,
    [places]
  );

  // Mobile bottom sheet
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onCloseSidebar}
            aria-hidden="true"
          />
        )}

        {/* Bottom Sheet */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ease-out ${
            isSidebarOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          role="dialog"
          aria-label="Trip down the memory lane"
          aria-modal={isSidebarOpen}
        >
          {/* Handle bar */}
          <button
            onClick={onCloseSidebar}
            className="w-full px-4 py-3 flex items-center justify-center border-b border-[var(--color-border)] bg-[var(--color-bg)]"
            aria-label={isSidebarOpen ? 'Close places list' : 'Open places list'}
          >
            <div className="w-10 h-1 bg-[var(--color-border)] rounded-full" />
          </button>

          {/* Sheet content */}
          <div className="flex flex-col h-[calc(100vh-60px)] max-h-[70vh] bg-[var(--color-bg)] rounded-t-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--color-text)]">Trip down the memory lane</h2>
              <ThemeToggle onToggle={onToggleTheme} theme={theme} />
            </div>

            {/* Search */}
            <div className="p-4 border-b border-[var(--color-border)]">
              <SearchBox
                value={searchValue}
                onChange={handleSearchChange}
                onSelect={onSearchSelect}
                onClear={handleSearchClear}
              />
            </div>

            {/* List */}
            <PlaceList
              places={places}
              selectedPlaceId={selectedPlaceId}
              hoveredPlaceId={hoveredPlaceId}
              filter={filter}
              sortOrder={sortOrder}
              onPlaceClick={onPlaceClick}
              onPlaceHover={onPlaceHover}
              onSortChange={onSortChange}
              totalCount={places.length}
              countryCount={countryCount}
            />
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[380px] bg-[var(--color-bg)] border-r border-[var(--color-border)] flex-col z-30 hidden lg:flex"
      role="complementary"
      aria-label="Trip down the memory lane"
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <h2 className="font-semibold text-[var(--color-text)]">Trip down the memory lane</h2>
        <ThemeToggle onToggle={onToggleTheme} theme={theme} />
      </div>

      {/* Search */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <SearchBox
          value={searchValue}
          onChange={handleSearchChange}
          onSelect={onSearchSelect}
          onClear={handleSearchClear}
        />
      </div>

      {/* List */}
      <PlaceList
        places={places}
        selectedPlaceId={selectedPlaceId}
        hoveredPlaceId={hoveredPlaceId}
        filter={filter}
        sortOrder={sortOrder}
        onPlaceClick={onPlaceClick}
        onPlaceHover={onPlaceHover}
        onSortChange={onSortChange}
        totalCount={places.length}
        countryCount={countryCount}
      />
    </aside>
  );
});