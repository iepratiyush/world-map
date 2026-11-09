import { memo, useCallback, useMemo } from 'react';
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

function StatBadge({
  icon,
  label,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border ${
        accent
          ? 'bg-[var(--color-accent-bg)] text-[var(--color-accent)] border-[var(--color-accent-bg)]'
          : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
      }`}
    >
      {icon}
      {label}
    </div>
  );
}

function SidebarHeader({
  placeCount,
  countryCount,
  onToggleTheme,
  theme,
}: {
  placeCount: number;
  countryCount: number;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}) {
  return (
    <div className="px-5 pt-5 pb-4 border-b border-[var(--color-border)] shrink-0">
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-[15px] font-semibold text-[var(--color-text)] leading-snug pr-2">
          Trip down the memory lane
        </h2>
        <ThemeToggle onToggle={onToggleTheme} theme={theme} />
      </div>
      <div className="flex items-center gap-2">
        <StatBadge
          accent
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          }
          label={`${placeCount} place${placeCount !== 1 ? 's' : ''}`}
        />
        <StatBadge
          icon={
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          }
          label={`${countryCount} countr${countryCount !== 1 ? 'ies' : 'y'}`}
        />
      </div>
    </div>
  );
}

export const Sidebar = memo(function Sidebar({
  places,
  selectedPlaceId,
  hoveredPlaceId,
  filter,
  sortOrder,
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
  const handleSearchChange = useCallback((value: string) => {
    onFilterChange(value);
  }, [onFilterChange]);

  const handleSearchClear = useCallback(() => {
    onFilterChange('');
    onSearchClear();
  }, [onFilterChange, onSearchClear]);

  const countryCount = useMemo(
    () => new Set(places.map((p) => p.country)).size,
    [places]
  );

  const sharedList = (
    <PlaceList
      places={places}
      selectedPlaceId={selectedPlaceId}
      hoveredPlaceId={hoveredPlaceId}
      filter={filter}
      sortOrder={sortOrder}
      onPlaceClick={onPlaceClick}
      onPlaceHover={onPlaceHover}
      onSortChange={onSortChange}
      onFilterChange={onFilterChange}
      totalCount={places.length}
      countryCount={countryCount}
    />
  );

  const sharedSearch = (
    <div className="px-4 py-3 border-b border-[var(--color-border)] shrink-0">
      <SearchBox
        value={filter}
        onChange={handleSearchChange}
        onSelect={onSearchSelect}
        onClear={handleSearchClear}
      />
    </div>
  );

  return (
    <>
      {/*
        ── Desktop sidebar ──────────────────────────────────────────────
        Always visible on lg+. Hidden on smaller screens via `hidden lg:flex`.
        No JS required — pure CSS breakpoint.
      */}
      <aside
        className="fixed left-0 top-0 bottom-0 w-[380px]
                   bg-[var(--color-bg)] border-r border-[var(--color-border)]
                   flex-col z-[800]
                   hidden lg:flex"
        role="complementary"
        aria-label="Places"
      >
        {/* Accent top stripe */}
        <div className="h-[3px] bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] shrink-0" />
        <SidebarHeader
          placeCount={places.length}
          countryCount={countryCount}
          onToggleTheme={onToggleTheme}
          theme={theme}
        />
        {sharedSearch}
        {sharedList}
      </aside>

      {/*
        ── Mobile / tablet bottom sheet ─────────────────────────────────
        Hidden on lg+ via `lg:hidden`. Shown/hidden by translate transform.
        Always in the DOM from first paint — no JS breakpoint, no flash.
      */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[750] lg:hidden transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } bg-black/50`}
        onClick={onCloseSidebar}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[800] lg:hidden
                    transition-transform duration-300 ease-out
                    ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'}`}
        role="dialog"
        aria-label="Places"
        aria-modal={isSidebarOpen}
      >
        <div className="flex flex-col h-[calc(100dvh-60px)] max-h-[75dvh]
                        bg-[var(--color-bg)] rounded-t-2xl shadow-xl overflow-hidden">
          {/* Drag handle */}
          <button
            onClick={onCloseSidebar}
            className="w-full px-4 py-3 flex items-center justify-center shrink-0
                       focus:outline-none"
            aria-label="Close places list"
          >
            <div className="w-10 h-1 bg-[var(--color-border)] rounded-full" />
          </button>

          <SidebarHeader
            placeCount={places.length}
            countryCount={countryCount}
            onToggleTheme={onToggleTheme}
            theme={theme}
          />
          {sharedSearch}
          {sharedList}
        </div>
      </div>
    </>
  );
});
