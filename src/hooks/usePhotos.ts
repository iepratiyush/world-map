import { useMemo } from 'react';
import type { PlacePhoto } from '../types';
import placesData from '../data/places.json';

// Get photos from places.json (Cloudinary URLs)
export function usePhotos(placeId: string): PlacePhoto[] {
  return useMemo(() => {
    const place = (placesData as any[]).find(p => p.id === placeId);
    if (!place || !place.photos) return [];
    return place.photos;
  }, [placeId]);
}

export function useAllPhotos(): Record<string, PlacePhoto[]> {
  return useMemo(() => {
    const grouped: Record<string, PlacePhoto[]> = {};
    for (const place of placesData as any[]) {
      if (place.photos) {
        grouped[place.id] = place.photos;
      }
    }
    return grouped;
  }, []);
}

export function getPhotoCount(placeId: string): number {
  const place = (placesData as any[]).find(p => p.id === placeId);
  return place?.photos?.length || 0;
}
