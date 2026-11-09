import { useState, useCallback, useRef, useEffect } from 'react';
import type { GeocodeResult, SearchSuggestion } from '../types';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const REQUEST_DELAY = 1000; // Nominatim usage policy: max 1 request/second
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: GeocodeResult[];
  timestamp: number;
}

// In-memory cache for geocode results
const geocodeCache = new Map<string, CacheEntry>();

/**
 * Convert Nominatim result to our SearchSuggestion format
 */
function resultToSuggestion(result: GeocodeResult): SearchSuggestion {
  const lat = parseFloat(result.lat);
  const lng = parseFloat(result.lon);

  // Determine zoom level based on place type
  let zoom = 11; // default city
  if (result.type === 'country') zoom = 5;
  else if (['state', 'region', 'province', 'county'].includes(result.type)) zoom = 7;
  else if (['city', 'town', 'village'].includes(result.type)) zoom = 11;

  // Parse bounding box if available
  let bounds: [[number, number], [number, number]] | undefined;
  if (result.boundingbox && result.boundingbox.length === 4) {
    bounds = [
      [parseFloat(result.boundingbox[0]), parseFloat(result.boundingbox[2])],
      [parseFloat(result.boundingbox[1]), parseFloat(result.boundingbox[3])],
    ];
  }

  // Build a clean label
  const address = result.address;
  const city = address.city || address.town || address.village || '';
  const state = address.state || address.county || '';
  const country = address.country || '';

  let label = result.display_name.split(',')[0]; // First part is usually the name
  if (city && state && country) {
    label = `${city}, ${state}, ${country}`;
  } else if (city && country) {
    label = `${city}, ${country}`;
  } else if (country) {
    label = country;
  }

  return {
    id: `nominatim-${result.place_id}`,
    label,
    lat,
    lng,
    bounds,
    zoom,
  };
}

/**
 * Hook for geocoding search with debouncing, caching, and rate limiting
 */
export function useGeocode() {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestTimeRef = useRef<number>(0);
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setError(null);
      return;
    }

    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    const cached = geocodeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setSuggestions(cached.data.map(resultToSuggestion));
      setError(null);
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
    }

    // Rate limiting: ensure at least REQUEST_DELAY since last request
    const timeSinceLastRequest = Date.now() - lastRequestTimeRef.current;
    const delay = Math.max(0, REQUEST_DELAY - timeSinceLastRequest);

    setLoading(true);
    setError(null);

    const executeSearch = async () => {
      abortControllerRef.current = new AbortController();

      try {
        const params = new URLSearchParams({
          q: query,
          format: 'jsonv2',
          limit: '5',
          addressdetails: '1',
        });

        const response = await fetch(`${NOMINATIM_BASE_URL}?${params}`, {
          signal: abortControllerRef.current.signal,
          headers: {
            'User-Agent': 'WorldMap/1.0 (travel map app)',
          },
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data: GeocodeResult[] = await response.json();

        // Cache results
        geocodeCache.set(cacheKey, { data, timestamp: Date.now() });

        if (!abortControllerRef.current.signal.aborted) {
          setSuggestions(data.map(resultToSuggestion));
          setError(null);
        }

        lastRequestTimeRef.current = Date.now();
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
          setSuggestions([]);
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (delay > 0) {
      pendingTimeoutRef.current = setTimeout(executeSearch, delay);
    } else {
      await executeSearch();
    }
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
      }
    };
  }, []);

  return {
    suggestions,
    loading,
    error,
    search,
    clear,
  };
}