export interface PlacePhoto {
  url: string;
  caption: string;
}

export interface Place {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  visitedOn: string; // ISO date string (YYYY-MM-DD)
  note?: string;
  photos?: PlacePhoto[]; // Cloudinary URLs with captions
}

export interface Photo {
  url: string;
  filename: string;
  caption?: string;
}

export interface GeocodeResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
    [key: string]: string | undefined;
  };
  boundingbox: string[];
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

export interface SearchSuggestion {
  id: string;
  label: string;
  lat: number;
  lng: number;
  bounds?: [[number, number], [number, number]];
  zoom?: number;
}

export type SortOrder = 'newest' | 'oldest' | 'az';

export interface MapViewport {
  center: [number, number];
  zoom: number;
}