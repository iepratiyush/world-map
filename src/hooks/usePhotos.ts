import { useMemo } from 'react';
import type { PlacePhoto, Place } from '../types';
import placesData from '../data/places.json';

const places = placesData as Place[];

export function usePhotos(placeId: string): { photos: PlacePhoto[]; count: number } {
  return useMemo(() => {
    const place = places.find((p) => p.id === placeId);
    const photos = place?.photos ?? [];
    return { photos, count: photos.length };
  }, [placeId]);
}

// Synchronous helper for non-hook contexts (e.g. cluster icon sizing)
export function getPhotoCount(placeId: string): number {
  const place = places.find((p) => p.id === placeId);
  return place?.photos?.length ?? 0;
}
