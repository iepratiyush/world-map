import { memo } from 'react';
import type { Place } from '../types';
import { usePhotos, getPhotoCount } from '../hooks/usePhotos';
import { format } from 'date-fns';

interface PlacePopupProps {
  place: Place;
  isSelected: boolean;
  onClose: () => void;
  onViewPhotos: (place: Place) => void;
}

export const PlacePopup = memo(function PlacePopup({
  place,
  isSelected,
  onClose,
  onViewPhotos,
}: PlacePopupProps) {
  const photos = usePhotos(place.id);
  const photoCount = getPhotoCount(place.id);
  const firstPhoto = photos[0];

  const formattedDate = format(new Date(place.visitedOn), 'MMMM yyyy');

  return (
    <div className="min-w-[280px] max-w-[320px]">
      {/* Thumbnail */}
      {firstPhoto && (
        <div className="relative aspect-video w-full rounded-t-xl overflow-hidden">
          <img
            src={firstPhoto.url}
            alt={`Photo of ${place.city}, ${place.country}`}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-[var(--color-text)] text-base">
              {place.city}
            </h3>
            <p className="text-[var(--color-text-secondary)] text-sm">{place.country}</p>
          </div>
          {isSelected && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[var(--color-bg-secondary)] transition-colors text-[var(--color-text-secondary)]"
              aria-label="Close popup"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Visit date */}
        <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{formattedDate}</span>
        </div>

        {/* Note */}
        {place.note && (
          <p className="text-sm text-[var(--color-text)] leading-relaxed">{place.note}</p>
        )}

        {/* View photos button */}
        {photoCount > 0 ? (
          <button
            onClick={() => onViewPhotos(place)}
            className="btn-primary w-full justify-center mt-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            View photos ({photoCount})
          </button>
        ) : (
          <button
            className="btn-secondary w-full justify-center mt-1"
            disabled
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 opacity-50">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            No photos yet
          </button>
        )}
      </div>
    </div>
  );
});