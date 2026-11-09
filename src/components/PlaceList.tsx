import { memo, useMemo } from 'react';
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
  onFilterChange: (value: string) => void;
  totalCount: number;
  countryCount: number;
}

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A – Z' },
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
  onFilterChange,
  totalCount,
}: PlaceListProps) {
  const processedPlaces = useMemo(() => {
    let result = [...places];

    if (filter.trim()) {
      const search = filter.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.city.toLowerCase().includes(search) ||
          p.country.toLowerCase().includes(search)
      );
    }

    result.sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.visitedOn).getTime() - new Date(a.visitedOn).getTime();
        case 'oldest':
          return new Date(a.visitedOn).getTime() - new Date(b.visitedOn).getTime();
        case 'az':
          return `${a.city}, ${a.country}`.localeCompare(`${b.city}, ${b.country}`);
        default:
          return 0;
      }
    });

    return result;
  }, [places, filter, sortOrder]);

  const filteredCount = processedPlaces.length;
  const isFiltered = !!filter.trim() && filteredCount !== totalCount;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
      {/* Sort + filter feedback row */}
      <div className="flex items-center justify-between px-4 py-2.5 sticky top-0 bg-[var(--color-bg)] border-b border-[var(--color-border)] z-10">
        {isFiltered ? (
          <span className="text-xs text-[var(--color-text-secondary)]">
            {filteredCount} of {totalCount}
          </span>
        ) : (
          <span />
        )}

        <div className="relative flex items-center">
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as SortOrder)}
            className="appearance-none text-xs font-medium text-[var(--color-text-secondary)]
                       bg-transparent border-none pr-5 pl-0 py-1 cursor-pointer
                       focus:outline-none focus:text-[var(--color-text)]"
            aria-label="Sort places"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-secondary)] pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <div className="p-2">
        {/* Empty state */}
        {processedPlaces.length === 0 && (
          <div className="flex flex-col items-center justify-center h-56 text-center px-6">
            <div className="w-12 h-12 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-[var(--color-text-secondary)]"
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
            </div>
            <p className="text-sm font-medium text-[var(--color-text)]">
              {filter.trim() ? 'No matches' : 'No places yet'}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {filter.trim() ? `Nothing for "${filter}"` : 'Add your first trip to get started'}
            </p>
            {filter.trim() && (
              <button
                onClick={() => onFilterChange('')}
                className="mt-3 text-xs font-medium text-[var(--color-accent)] hover:underline focus:outline-none"
              >
                Clear filter
              </button>
            )}
          </div>
        )}

        {/* Places list — pass stable callbacks directly; no inline arrows so React.memo works */}
        <div role="list" aria-label="Visited places">
          {processedPlaces.map((place) => (
            <PlaceListItem
              key={place.id}
              place={place}
              isSelected={selectedPlaceId === place.id}
              isHovered={hoveredPlaceId === place.id}
              onSelect={onPlaceClick}
              onHoverChange={onPlaceHover}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
