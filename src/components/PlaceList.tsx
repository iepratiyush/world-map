import { memo, useMemo, useCallback } from 'react';
import type { Place, SortOrder } from '../types';
import { PlaceListItem } from './PlaceListItem';

interface PlaceListProps {
  places: Place[];
  selectedPlaceId: string | null;
  hoveredPlaceId: string | null;
  filter: string;
  sortOrder: SortOrder;
  onPlaceClick: (place: Place) => void;
  onPlaceHover: (placeId: string | null) => void;
  onSortChange: (order: SortOrder) => void;
  totalCount: number;
  countryCount: number;
}

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'az', label: 'A–Z' },
];

export const PlaceList = memo(function PlaceList({
  places,
  selectedPlaceId,
  hoveredPlaceId,
  filter,
  sortOrder,
  onPlaceClick,
  onPlaceHover,
  onSortChange,
  totalCount,
  countryCount,
}: PlaceListProps) {
  // Sort and filter places
  const processedPlaces = useMemo(() => {
    let result = [...places];

    // Apply filter
    if (filter.trim()) {
      const search = filter.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.city.toLowerCase().includes(search) ||
          p.country.toLowerCase().includes(search)
      );
    }

    // Apply sort
    result.sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.visitedOn).getTime() - new Date(a.visitedOn).getTime();
        case 'oldest':
          return new Date(a.visitedOn).getTime() - new Date(b.visitedOn).getTime();
        case 'az':
          return `${a.city}, ${a.country}`.localeCompare(`${b.city}, ${b.country}`);
      }
    });

    return result;
  }, [places, filter, sortOrder]);

  const handleItemClick = useCallback((place: Place) => {
    onPlaceClick(place);
  }, [onPlaceClick]);

  const handleItemHover = useCallback((placeId: string | null) => {
    onPlaceHover(placeId);
  }, [onPlaceHover]);

  const filteredCount = processedPlaces.length;
  const showFilterCount = filter.trim() && filteredCount !== totalCount;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-2">
      {/* Header with count and sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky top-0 bg-[var(--color-bg)] pb-3 border-b border-[var(--color-border)] z-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-medium text-[var(--color-text)]">{filteredCount}</span>
            <span className="text-[var(--color-text-secondary)]">place{filteredCount !== 1 ? 's' : ''}</span>
            {showFilterCount && (
              <>
                <span className="text-[var(--color-text-secondary)]">of</span>
                <span className="font-medium text-[var(--color-text)]">{totalCount}</span>
              </>
            )}
            <span className="text-[var(--color-text-secondary)]">•</span>
            <span className="font-medium text-[var(--color-text)]">{countryCount}</span>
            <span className="text-[var(--color-text-secondary)]">countr{countryCount !== 1 ? 'ies' : 'y'}</span>
          </div>
        </div>

        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as SortOrder)}
            className="input pr-8 py-1.5 text-sm w-auto min-w-[140px] appearance-none bg-[var(--color-bg)]"
            aria-label="Sort places"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)] pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Empty state */}
      {processedPlaces.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center px-6">
          <svg
            className="w-12 h-12 text-[var(--color-text-secondary)] mb-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="8" x2="14" y2="14" />
            <line x1="8" y1="14" x2="14" y2="8" />
          </svg>
          <p className="text-[var(--color-text-secondary)]">
            {filter.trim()
              ? `No places match "${filter}"`
              : 'No places visited yet'}
          </p>
          {filter.trim() && (
            <button
              onClick={() => handleItemHover(null)}
              className="mt-2 btn-ghost text-sm"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Places list */}
      <div className="space-y-1.5" role="list" aria-label="Visited places">
        {processedPlaces.map((place) => (
          <PlaceListItem
            key={place.id}
            place={place}
            isSelected={selectedPlaceId === place.id}
            isHovered={hoveredPlaceId === place.id}
            onClick={() => handleItemClick(place)}
            onMouseEnter={() => handleItemHover(place.id)}
            onMouseLeave={() => handleItemHover(null)}
          />
        ))}
      </div>
    </div>
  );
});