import { memo, useRef, useEffect } from 'react';
import type { Place } from '../types';
import { usePhotos, getPhotoCount } from '../hooks/usePhotos';
import { format } from 'date-fns';

interface PlaceListItemProps {
  place: Place;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const PlaceListItem = memo(function PlaceListItem({
  place,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: PlaceListItemProps) {
  const photos = usePhotos(place.id);
  const photoCount = getPhotoCount(place.id);
  const firstPhoto = photos[0];

  const formattedDate = format(new Date(place.visitedOn), 'MMMM yyyy');
  const itemRef = useRef<HTMLDivElement>(null);

  // Scroll into view when selected
  useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSelected]);

  return (
    <div
      ref={itemRef}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group relative flex gap-3 p-3 rounded-xl transition-all cursor-pointer ${
        isSelected
          ? 'bg-[var(--color-accent-bg)] border-l-4 border-[var(--color-accent)]'
          : 'hover:bg-[var(--color-bg-secondary)]'
      } ${isHovered && !isSelected ? 'bg-[var(--color-bg-secondary)]' : ''}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-selected={isSelected}
      aria-label={`${place.city}, ${place.country}, visited ${formattedDate}`}
    >
      {/* Thumbnail */}
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--color-border)]">
        {firstPhoto ? (
          <img
            src={firstPhoto.url}
            alt={`Photo of ${place.city}, ${place.country}`}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-text-secondary)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        {photoCount > 1 && (
          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
            +{photoCount - 1}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-medium text-[var(--color-text)] truncate">{place.city}</h4>
            <p className="text-sm text-[var(--color-text-secondary)] truncate">{place.country}</p>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="truncate">{formattedDate}</span>
        </div>
        {place.note && (
          <p className="mt-1 text-xs text-[var(--color-text-secondary)] line-clamp-2">{place.note}</p>
        )}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-[var(--color-accent)] rounded-xl pointer-events-none" aria-hidden="true" />
      )}
    </div>
  );
});