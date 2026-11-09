import { useMemo } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import type { Place, Photo } from '../types';

interface PhotoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place | null;
  photos: Photo[];
}

export function PhotoLightbox({ isOpen, onClose, place, photos }: PhotoLightboxProps) {
  // Prepare lightbox items with captions from place.captions
  // yet-another-react-lightbox captions plugin expects `title` and `description` properties
  const items = useMemo(() => {
    if (!place || photos.length === 0) return [];

    return photos.map((photo) => ({
      src: photo.url,
      title: place.captions?.[photo.filename],
      description: undefined,
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
      index={0}
      thumbnails={{
        position: 'bottom',
        showToggle: items.length > 1,
      }}
      captions={{
        showToggle: items.length > 1,
      }}
    />
  );
}