# World Map - Personal Travel Tracker

A React + TypeScript application for tracking visited places on an interactive map with photo galleries.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build/dev server
- **Leaflet** + **react-leaflet** for interactive maps
- **react-leaflet-cluster** for marker clustering
- **yet-another-react-lightbox** for photo galleries
- **Tailwind CSS** for styling
- **date-fns** for date formatting

## Project Structure

```
src/
├── App.tsx              # Main app component, state management
├── main.tsx             # Entry point
├── index.css            # Global styles + Tailwind + theme variables
├── types.ts             # TypeScript interfaces
├── data/
│   └── places.json      # Place data (cities, coordinates, captions)
├── components/
│   ├── MapView.tsx      # Leaflet map with markers/clusters
│   ├── PlacePopup.tsx   # Marker popup with photo preview
│   ├── PlaceList.tsx    # Sidebar place list
│   ├── PlaceListItem.tsx# Individual place list item
│   ├── SearchBox.tsx    # Location search with geocoding
│   ├── PhotoLightbox.tsx# Full-screen photo gallery
│   ├── Sidebar.tsx      # Desktop sidebar / mobile bottom sheet
│   └── ThemeToggle.tsx  # Light/dark mode toggle
├── hooks/
│   ├── usePhotos.ts     # Photo lookup from places.json (Cloudinary URLs)
│   ├── useTheme.tsx     # Theme persistence (localStorage + media query)
│   ├── useGeocode.ts    # Nominatim geocoding for search
│   └── useDebounce.ts   # Debounce utility
└── assets/
    └── photos/          # Photo assets organized by place ID
```

## Key Features

- **Interactive Map**: OpenStreetMap with clustered markers
- **Photo Galleries**: Full-screen lightbox with thumbnails, zoom, captions
- **Search**: Geocode locations via Nominatim (OpenStreetMap)
- **Theme**: Light/dark mode with persistence
- **Responsive**: Desktop sidebar + mobile bottom sheet
- **Offline-capable**: Photos bundled via Vite, no external image hosting

## Data Format (`places.json`)

```json
{
  "id": "unique-place-id",
  "city": "City Name",
  "country": "Country",
  "lat": 12.3456,
  "lng": -78.9012,
  "visitedOn": "2024-01-01",
  "note": "Optional note",
  "photos": [
    { "url": "https://res.cloudinary.com/uesrzvcy/image/upload/v1/world-map/unique-place-id/1.jpg", "caption": "Caption for photo 1" },
    { "url": "https://res.cloudinary.com/uesrzvcy/image/upload/v1/world-map/unique-place-id/2.jpg", "caption": "Caption for photo 2" }
  ]
}
```

Photos are hosted on Cloudinary under cloud name `uesrzvcy`, path `world-map/{place-id}/`.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Type-check + production build
npm run lint     # Run oxlint
npm run preview  # Preview production build
```

## Architecture Notes

### State Management (App.tsx)
All state lives in `AppContent` component:
- `selectedPlaceId` - Currently selected marker
- `lightboxPlace` - Place for photo lightbox
- `viewport` - Map center/zoom
- `filter/sortOrder` - List filtering/sorting
- `searchPin` - Temporary search result pin

### Photo Loading (usePhotos.ts)
Reads the `photos` array directly from `places.json` for a given place ID. Photos are Cloudinary URLs — no local assets or Vite glob involved.

### Map Dark Mode
Applied via CSS filter on `.leaflet-tile-pane` (inverts OSM tiles) - no Mapbox/paid tiles needed.

### Performance
- Marker clustering via `react-leaflet-cluster`
- Photos lazy-loaded in popups (`loading="lazy"`)
- Lightbox only mounts when open
- Memoized components (`Sidebar`, `PlacePopup`, `PlaceListItem`)

## Adding New Places

1. Add entry to `src/data/places.json` with the `photos` array
2. Upload photos to Cloudinary under `world-map/{id}/` (named `1.jpg`, `2.jpg`, etc.)
3. Run `npm run build`

## Environment

- Node.js 20+
- TI corporate network: uses internal LLM gateway via `.claude/settings.json`
- WebSearch/WebFetch blocked - use MCP tools instead