import { useMemo } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import type { Place, PlacePhoto } from '../types';

interface PhotoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place | null;
  photos: PlacePhoto[];
}

export function PhotoLightbox({ isOpen, onClose, place, photos }: PhotoLightboxProps) {
  const items = useMemo(() => {
    if (!place || photos.length === 0) return [];

    return photos.map((photo) => ({
      src: photo.url,
      // description (not title) → renders as a bottom overlay via captions.css
      description: photo.caption || undefined,
      thumbnail: photo.url,
    }));
  }, [place, photos]);

  if (!isOpen || !place || items.length === 0) return null;

  return (
    <Lightbox
      open={isOpen}
      slides={items}
      close={onClose}
      plugins={[Thumbnails, Counter, Zoom, Captions]}
      thumbnails={{
        position: 'bottom',
        height: 64,
        showToggle: items.length > 1,
      }}
      captions={{
        showToggle: false,
        descriptionTextAlign: 'center',
        descriptionMaxLines: 2,
      }}
    />
  );
}
