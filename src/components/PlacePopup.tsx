import { memo, useState } from 'react';
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
  const [imgError, setImgError] = useState(false);

  const formattedDate = format(new Date(place.visitedOn), 'MMMM yyyy');

  return (
    <div className="min-w-[280px] max-w-[320px]">
      {/* Hero image */}
      {firstPhoto && !imgError ? (
        <div className="relative w-full overflow-hidden rounded-t-xl bg-[var(--color-bg-secondary)]" style={{ aspectRatio: '16/9' }}>
          <img
            src={firstPhoto.url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
          {photoCount > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/65 text-white text-xs font-medium px-2 py-1 rounded-md leading-none">
              1 / {photoCount}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full bg-[var(--color-bg-secondary)] flex items-center justify-center rounded-t-xl" style={{ aspectRatio: '16/9' }}>
          <svg className="w-8 h-8 text-[var(--color-border)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-[var(--color-text)] leading-tight">
              {place.city}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{place.country}</p>
          </div>
          {isSelected && (
            <button
              onClick={onClose}
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
                         hover:bg-[var(--color-bg-secondary)] transition-colors text-[var(--color-text-secondary)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              aria-label="Close popup"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Visit date */}
        <div className="flex items-center gap-1.5">
          <span className="inline-block text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-secondary)]
                           px-2 py-1 rounded-md font-medium border border-[var(--color-border)] leading-none">
            {formattedDate}
          </span>
        </div>

        {/* Note */}
        {place.note && (
          <p className="text-[13px] text-[var(--color-text)] leading-relaxed">{place.note}</p>
        )}

        {/* CTA */}
        {photoCount > 0 ? (
          <button
            onClick={() => onViewPhotos(place)}
            className="btn-primary w-full justify-center text-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            View {photoCount} photo{photoCount !== 1 ? 's' : ''}
          </button>
        ) : (
          <div className="text-center text-xs text-[var(--color-text-secondary)] py-1">
            No photos yet
          </div>
        )}
      </div>
    </div>
  );
});
