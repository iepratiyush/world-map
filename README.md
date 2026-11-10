# Pratyush's Atlas - Travel Map

A personal travel tracker — interactive world map with photo galleries for every visited place.

## Features

- **Interactive World Map** - Pan, zoom, and explore visited places with smooth animations
- **Marker Clustering** - Automatically groups nearby markers when zoomed out
- **Photo Gallery** - Lightbox with thumbnails, zoom, and keyboard/swipe navigation
- **Search & Geocoding** - Search any city/country via Nominatim (OpenStreetMap)
- **Responsive Design** - Desktop sidebar + mobile bottom sheet
- **Dark/Light Mode** - OS preference detection, persisted in localStorage, no flash

## Tech Stack

- **Vite + React 19 + TypeScript** - Modern build tooling
- **Leaflet + react-leaflet** - Interactive maps
- **react-leaflet-cluster** - Marker clustering
- **yet-another-react-lightbox** - Photo gallery
- **Tailwind CSS** - Styling with CSS variables for theming
- **date-fns** - Date formatting
- **Nominatim API** - Free geocoding (no API key required)
- **Cloudinary** - Photo hosting (cloud name: `uesrzvcy`)

## Getting Started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run preview    # preview production build
npm run lint       # oxlint
```

## Project Structure

```
src/
├── components/
│   ├── MapView.tsx        # Map with markers, clusters, popups, zoom controls
│   ├── PlacePopup.tsx     # Marker popup content (photo preview + info)
│   ├── Sidebar.tsx        # Desktop sidebar / mobile bottom sheet
│   ├── SearchBox.tsx      # Search with Nominatim autocomplete
│   ├── PlaceList.tsx      # Scrollable visited places list
│   ├── PlaceListItem.tsx  # Individual place item
│   ├── ThemeToggle.tsx    # Light/dark mode toggle
│   └── PhotoLightbox.tsx  # Full-screen photo gallery lightbox
├── hooks/
│   ├── useTheme.tsx       # Theme management (OS pref, localStorage)
│   ├── useDebounce.ts     # Value/callback debouncing
│   ├── useGeocode.ts      # Nominatim search with caching
│   └── usePhotos.ts       # Photo lookup from places.json
├── data/
│   └── places.json        # Place data (id, city, country, coords, date, note, photos)
├── types.ts               # TypeScript types
├── App.tsx                # Main app component + state management
├── main.tsx               # Entry point
└── index.css              # Tailwind + CSS variables + Leaflet overrides
```

## Adding a New Place

### 1. Add entry to `src/data/places.json`

```json
{
  "id": "paris-fr",
  "city": "Paris",
  "country": "France",
  "lat": 48.8566,
  "lng": 2.3522,
  "visitedOn": "2023-06-14",
  "note": "Optional trip note",
  "photos": [
    { "url": "https://res.cloudinary.com/uesrzvcy/image/upload/v1/world-map/paris-fr/1.jpg", "caption": "Eiffel Tower from Champ de Mars" },
    { "url": "https://res.cloudinary.com/uesrzvcy/image/upload/v1/world-map/paris-fr/2.jpg", "caption": "Seine River at golden hour" }
  ]
}
```

**Required fields:** `id`, `city`, `country`, `lat`, `lng`, `visitedOn` (YYYY-MM-DD)  
**Optional:** `note`, `photos`

### 2. Upload photos to Cloudinary

Upload to path `world-map/<place-id>/` naming files `1.jpg`, `2.jpg`, etc.  
Cloud name: `uesrzvcy`

### 3. Finding Coordinates

- **Google Maps**: Right-click → "What's here?" → copy coordinates
- **OpenStreetMap**: Search place → click → copy lat/lng from URL
- **Resort/venue websites** often list GPS coordinates directly

## Deployment (Vercel)

```bash
# Automatic: push to GitHub, import in vercel.com — Vite preset auto-detected
# Manual:
npm run build
# Upload dist/ to any static host (Netlify, Cloudflare Pages, GitHub Pages, etc.)
```

A `vercel.json` is included for SPA routing configuration.

## Customization

### Theme Colors

Edit CSS variables in `src/index.css`:

```css
:root {
  --color-accent: #2563eb;
  --color-accent-hover: #1d4ed8;
  /* ... */
}
.dark {
  --color-accent: #3b82f6;
  /* ... */
}
```

### Map Tiles

Tile URL in `MapView.tsx` (`tileUrl` variable). Currently uses OpenStreetMap.  
Dark mode is applied via CSS filter on `.leaflet-tile-pane` — no second tile source needed.

## Performance

- Marker clustering reduces DOM nodes at low zoom
- Photo thumbnails lazy-loaded (`loading="lazy"`)
- Debounced search (400ms) with AbortController cancellation
- In-memory geocode cache (5 min TTL)
- Memoized components (`React.memo`, `useMemo`, `useCallback`)

## Notes

- **Nominatim rate limiting**: 1 req/sec + in-memory cache. Not suitable for high-volume autocomplete.
- **Mobile breakpoint**: Tailwind `lg:` (1024px). Below that, sidebar becomes a bottom sheet.
- **Date format**: `visitedOn` uses ISO 8601 (YYYY-MM-DD).
- **Cluster thresholds**: <10 = small, 10–99 = medium, 100+ = large.

---

Built for travelers who want a beautiful, personal map.
