import { useState, useCallback, useMemo, useRef } from 'react';
import L from 'leaflet';
import placesData from './data/places.json';
import type { Place, MapViewport, SearchSuggestion, SortOrder } from './types';

import { ThemeProvider, useTheme } from './hooks/useTheme';
import { Sidebar } from './components/Sidebar';
import { MapView, ZoomControls } from './components/MapView';
import { PhotoLightbox } from './components/PhotoLightbox';
import { usePhotos } from './hooks/usePhotos';

function AppContent() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const mapRef = useRef<L.Map | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchPin, setSearchPin] = useState<SearchSuggestion | null>(null);
  const [viewport, setViewport] = useState<MapViewport>({ center: [20, 0], zoom: 2 });
  const [flyToPlace, setFlyToPlace] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lightboxPlace, setLightboxPlace] = useState<Place | null>(null);

  const places = useMemo(() => placesData as Place[], []);
  const { photos: lightboxPhotos } = usePhotos(lightboxPlace?.id || '');


  const handlePlaceClick = useCallback((place: Place) => {
    setSelectedPlaceId(place.id);
    setFlyToPlace({ lat: place.lat, lng: place.lng, zoom: 13 });
    // Always close the mobile sheet when a place is selected;
    // on desktop isSidebarOpen is always false so this is a no-op.
    setIsSidebarOpen(false);
  }, []);

  const handlePlaceHover = useCallback((placeId: string | null) => {
    setHoveredPlaceId(placeId);
  }, []);

  const handleFilterChange = useCallback((value: string) => {
    setFilter(value);
  }, []);

  const handleSearchSelect = useCallback((suggestion: SearchSuggestion) => {
    setSearchPin(suggestion);
    setFlyToPlace({ lat: suggestion.lat, lng: suggestion.lng, zoom: suggestion.zoom });
    setIsSidebarOpen(false);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchPin(null);
  }, []);

  const handleSortChange = useCallback((order: SortOrder) => {
    setSortOrder(order);
  }, []);

  const handleViewPhotos = useCallback((place: Place) => {
    setLightboxPlace(place);
  }, []);

  const handleLightboxClose = useCallback(() => {
    setLightboxPlace(null);
  }, []);

  const handleFlyComplete = useCallback(() => {
    setFlyToPlace(null);
  }, []);

  const handleViewportChange = useCallback((newViewport: MapViewport) => {
    setViewport(newViewport);
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedPlaceId(null);
  }, []);

  const handleRemoveSearchPin = useCallback(() => {
    setSearchPin(null);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {/*
        Hamburger — visible on < lg via CSS, no JS breakpoint needed.
        Always in the DOM from first paint so it never flashes in.
      */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-[800] lg:hidden
                   flex items-center justify-center w-10 h-10 rounded-lg
                   bg-[var(--color-accent)] text-white
                   shadow-[0_2px_8px_rgba(0,0,0,0.35)]
                   transition-colors hover:bg-[var(--color-accent-hover)]
                   focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[var(--color-accent)]"
        aria-label={isSidebarOpen ? 'Close places list' : 'Open places list'}
        aria-expanded={isSidebarOpen}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Map */}
      <div className="absolute inset-0 lg:ml-[380px]">
        <MapView
          places={places}
          selectedPlaceId={selectedPlaceId}
          onPlaceClick={handlePlaceClick}
          onClosePopup={handleClosePopup}
          onViewPhotos={handleViewPhotos}
          searchPin={searchPin}
          onRemoveSearchPin={handleRemoveSearchPin}
          viewport={viewport}
          onViewportChange={handleViewportChange}
          flyToPlace={flyToPlace}
          onFlyComplete={handleFlyComplete}
          mapRef={mapRef}
        />
        <ZoomControls mapRef={mapRef} />
      </div>

      {/* Sidebar — handles both desktop and mobile layouts internally */}
      <Sidebar
        places={places}
        selectedPlaceId={selectedPlaceId}
        hoveredPlaceId={hoveredPlaceId}
        filter={filter}
        sortOrder={sortOrder}
        searchPin={searchPin}
        isSidebarOpen={isSidebarOpen}
        onPlaceClick={handlePlaceClick}
        onPlaceHover={handlePlaceHover}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onSearchSelect={handleSearchSelect}
        onSearchClear={handleSearchClear}
        onCloseSidebar={() => setIsSidebarOpen(false)}
        onToggleTheme={toggleTheme}
        theme={resolvedTheme}
      />

      <PhotoLightbox
        isOpen={!!lightboxPlace}
        onClose={handleLightboxClose}
        place={lightboxPlace}
        photos={lightboxPhotos}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
