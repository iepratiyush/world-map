import { memo, useRef, useEffect, useState } from 'react';
import type { Place } from '../types';
import { usePhotos } from '../hooks/usePhotos';
import { format } from 'date-fns';

interface PlaceListItemProps {
  place: Place;
  isSelected: boolean;
  isHovered: boolean;
  // Stable callbacks — not bound per-item so React.memo actually works
  onSelect: (place: Place) => void;
  onHoverChange: (id: string | null) => void;
}

export const PlaceListItem = memo(function PlaceListItem({
  place,
  isSelected,
  isHovered,
  onSelect,
  onHoverChange,
}: PlaceListItemProps) {
  const { photos, count: photoCount } = usePhotos(place.id);
  const firstPhoto = photos[0];
  const [imgError, setImgError] = useState(false);

  const formattedDate = format(new Date(place.visitedOn), 'MMM yyyy');
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSelected]);

  return (
    <div
      ref={itemRef}
      onClick={() => onSelect(place)}
      onMouseEnter={() => onHoverChange(place.id)}
      onMouseLeave={() => onHoverChange(null)}
      className={`group relative flex gap-3 pl-4 pr-3 py-3 rounded-xl cursor-pointer select-none
        transition-colors duration-150
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1
        ${isSelected
          ? 'bg-[var(--color-accent-bg)]'
          : 'hover:bg-[var(--color-bg-secondary)]'
        }
        ${isHovered && !isSelected ? 'bg-[var(--color-bg-secondary)]' : ''}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(place);
        }
      }}
      aria-selected={isSelected}
      aria-label={`${place.city}, ${place.country}, visited ${formattedDate}`}
    >
      {/* Selected accent bar */}
      {isSelected && (
        <div
          className="absolute left-0 top-3 bottom-3 w-[3px] bg-[var(--color-accent)] rounded-r-full"
          aria-hidden="true"
        />
      )}

      {/* Thumbnail */}
      <div className="relative w-[68px] h-[68px] shrink-0 rounded-xl overflow-hidden bg-[var(--color-bg-secondary)]">
        {firstPhoto && !imgError ? (
          <img
            src={firstPhoto.url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--color-border)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        {firstPhoto && !imgError && photoCount > 1 && (
          <div className="absolute bottom-1 right-1 bg-black/65 text-white text-[10px] font-medium px-1.5 py-[3px] rounded-md leading-none">
            +{photoCount - 1}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <h4 className="text-[14px] font-semibold text-[var(--color-text)] truncate leading-snug">
            {place.city}
          </h4>
          <p className="text-[12px] text-[var(--color-text-secondary)] truncate mt-0.5">
            {place.country}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          <span className="inline-block text-[11px] text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)]
                          px-2 py-[3px] rounded-md font-medium leading-none border border-[var(--color-border)]">
            {formattedDate}
          </span>
          {photoCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-accent)] leading-none font-medium">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {photoCount}
            </span>
          )}
        </div>

        {place.note && (
          <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1 mt-1 leading-relaxed">
            {place.note}
          </p>
        )}
      </div>
    </div>
  );
});
