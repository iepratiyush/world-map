import { useMemo } from 'react';
import type { Photo } from '../types';

// Vite glob: with `import: 'default'`, each value IS the URL string directly
const photoModules = import.meta.glob<string>(
  '/src/assets/photos/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  { eager: true, query: '?url', import: 'default' }
);

export function usePhotos(placeId: string): Photo[] {
  return useMemo(() => {
    const photos: Photo[] = [];

    for (const [path, url] of Object.entries(photoModules)) {
      const match = path.match(/\/src\/assets\/photos\/([^/]+)\/([^/]+)$/);
      if (!match) continue;

      const [, folderId, filename] = match;
      if (folderId !== placeId) continue;

      photos.push({ url, filename });
    }

    photos.sort((a, b) => a.filename.localeCompare(b.filename));

    return photos;
  }, [placeId]);
}

export function useAllPhotos(): Record<string, Photo[]> {
  return useMemo(() => {
    const grouped: Record<string, Photo[]> = {};

    for (const [path, url] of Object.entries(photoModules)) {
      const match = path.match(/\/src\/assets\/photos\/([^/]+)\/([^/]+)$/);
      if (!match) continue;

      const [, folderId, filename] = match;

      if (!grouped[folderId]) grouped[folderId] = [];
      grouped[folderId].push({ url, filename });
    }

    for (const id of Object.keys(grouped)) {
      grouped[id].sort((a, b) => a.filename.localeCompare(b.filename));
    }

    return grouped;
  }, []);
}

export function getPhotoCount(placeId: string): number {
  let count = 0;
  for (const path of Object.keys(photoModules)) {
    const match = path.match(/\/src\/assets\/photos\/([^/]+)\//);
    if (match && match[1] === placeId) count++;
  }
  return count;
}
