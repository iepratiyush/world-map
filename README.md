# Places I've Visited - Travel Map

A minimal, elegant single-page travel map application built with React, Leaflet, and TypeScript. Features an interactive world map with visited places, photo galleries, search, and dark/light mode.

## Features

- **Interactive World Map** - Pan, zoom, and explore visited places with smooth animations
- **Marker Clustering** - Automatically groups nearby markers when zoomed out
- **Photo Gallery** - Lightbox with thumbnails, zoom, and keyboard/swipe navigation
- **Search & Geocoding** - Search any city/country via Nominatim (OpenStreetMap)
- **Responsive Design** - Desktop sidebar + mobile bottom sheet
- **Dark/Light Mode** - OS preference detection, persisted in localStorage, no flash
- **No Backend** - Static JSON data + auto-discovered photos from folders

## Tech Stack

- **Vite + React + TypeScript** - Modern build tooling
- **Leaflet + react-leaflet** - Interactive maps
- **react-leaflet-cluster** - Marker clustering
- **yet-another-react-lightbox** - Photo gallery
- **Tailwind CSS** - Styling with CSS variables for theming
- **lucide-react** - Icons
- **Nominatim API** - Free geocoding (no API key required)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Build

```bash
npm run build
```

Outputs to `dist/` folder, ready for deployment.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── MapView.tsx      # Map with markers, clusters, popups
│   ├── PlacePopup.tsx   # Marker popup content
│   ├── Sidebar.tsx      # Left sidebar / mobile bottom sheet
│   ├── SearchBox.tsx    # Search with Nominatim autocomplete
│   ├── PlaceList.tsx    # Scrollable visited places list
│   ├── PlaceListItem.tsx # Individual place item
│   ├── ThemeToggle.tsx  # Light/dark mode toggle
│   ├── PhotoLightbox.tsx # Photo gallery lightbox
│   └── ZoomControls.tsx  # Map zoom buttons
├── hooks/               # Custom React hooks
│   ├── useTheme.tsx     # Theme management (OS pref, localStorage)
│   ├── useDebounce.ts   # Value/callback debouncing
│   ├── useGeocode.ts    # Nominatim search with caching
│   └── usePhotos.ts     # Vite glob photo loader
├── data/
│   └── places.json      # Place data (id, city, country, coords, date, note, captions)
├── assets/
│   └── photos/          # Auto-discovered photos: <place-id>/*.jpg
├── types.ts             # TypeScript types
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Tailwind + custom styles + Leaflet overrides
```

## Adding a New Place

### 1. Add Entry to `src/data/places.json`

```json
{
  "id": "paris-fr",
  "city": "Paris",
  "country": "France",
  "lat": 48.8566,
  "lng": 2.3522,
  "visitedOn": "2023-06-14",
  "note": "Eiffel Tower at sunset",
  "captions": {
    "1.jpg": "Eiffel Tower from Champ de Mars",
    "2.jpg": "Seine River at golden hour"
  }
}
```

**Required fields:** `id`, `city`, `country`, `lat`, `lng`, `visitedOn` (YYYY-MM-DD)
**Optional:** `note`, `captions` (keyed by filename)

### 2. Add Photos

Create folder: `src/assets/photos/<place-id>/`
Drop images inside (JPG, JPEG, PNG, WebP)

```
src/assets/photos/paris-fr/
├── 1.jpg
├── 2.jpg
└── 3.jpg
```

Photos are auto-discovered by Vite's `import.meta.glob` - no code changes needed!

### 3. Finding Coordinates

- **Google Maps**: Right-click → "What's here?" → copy coordinates
- **OpenStreetMap**: Search place → click → copy lat/lng from URL
- **latlong.net**: Enter city name → get coordinates

## Photo Optimization

**Recommended:** Resize photos to ~1600px wide, under 500KB each before committing.

**Quick optimization tools:**

```bash
# Using ImageMagick (install: brew install imagemagick)
mogrify -resize 1600x1600\> -quality 85 src/assets/photos/**/*.jpg

# Using Sharp (Node.js)
npx sharp-cli -i src/assets/photos -o src/assets/photos --width 1600 --quality 85
```

The build will content-hash filenames for cache busting.

## Deployment (Vercel)

### Automatic (Recommended)

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com/new)
3. Framework preset: **Vite** (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy!

No `vercel.json` needed - zero config static deployment.

### Manual

```bash
npm run build
# Upload dist/ folder to any static host (Netlify, Cloudflare Pages, GitHub Pages, etc.)
```

## Customization

### Theme Colors

Edit CSS variables in `src/index.css`:

```css
:root {
  --color-accent: #2563eb;      /* Primary accent color */
  --color-accent-hover: #1d4ed8;
  --color-accent-bg: #eff6ff;
  /* ... */
}

.dark {
  --color-accent: #3b82f6;
  /* ... */
}
```

### Map Style

Tile layers in `MapView.tsx`:

```ts
// Light theme (default)
'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

// Dark theme
'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
```

## Accessibility

- Keyboard navigation throughout (Tab, arrows, Enter, Escape)
- ARIA labels on all interactive elements
- Focus rings visible in both themes
- `prefers-reduced-motion` respected (shortens flyTo animations)
- Alt text on all images
- Semantic HTML structure

## Performance

- Marker clustering reduces DOM nodes at low zoom
- Photo thumbnails lazy-loaded (`loading="lazy"`)
- Debounced search (400ms) with AbortController cancellation
- In-memory geocode cache (5 min TTL)
- Memoized components (`React.memo`, `useMemo`, `useCallback`)
- Vite code-splitting for production

## Browser Support

- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Requires ES2020+ (optional chaining, nullish coalescing)

## License

MIT - Feel free to use for your own travel map!

---

## Assumptions Made

1. **Photo organization**: Photos live in `src/assets/photos/<place-id>/` folders, matching the `id` in `places.json`. Filenames sort alphabetically for display order.

2. **No build-time photo processing**: The app uses Vite's `import.meta.glob` with `?url` to get hashed URLs. Large photos should be optimized before committing.

3. **Nominatim rate limiting**: Implements 1 req/sec minimum delay and in-memory caching to respect OSM's usage policy. Not suitable for high-volume autocomplete.

4. **Static deployment**: No backend, database, or authentication. All data in JSON + filesystem.

5. **Coordinate precision**: Places use WGS84 lat/lng (standard GPS). Map uses Web Mercator (Leaflet default).

6. **Date format**: `visitedOn` uses ISO 8601 (YYYY-MM-DD) for consistent sorting.

7. **Mobile breakpoint**: 768px (Tailwind's `lg:`). Sidebar becomes bottom sheet below this.

8. **Cluster thresholds**: <10 = small, 10-99 = medium, 100+ = large cluster icons.

9. **Map bounds**: World view constrained with `maxBoundsViscosity={1.0}` and `noWrap` tiles to prevent infinite panning.

10. **Lightbox plugins**: Uses Thumbnails, Counter, Zoom from yet-another-react-lightbox. Fullscreen button included.

---

Built with ❤️ for travelers who want a beautiful, personal map.