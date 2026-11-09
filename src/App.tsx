import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
  const [viewport, setViewport] = useState<MapViewport>({
    center: [20, 0],
    zoom: 2,
  });
  const [flyToPlace, setFlyToPlace] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lightboxPlace, setLightboxPlace] = useState<Place | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Load places from JSON
  const places = useMemo(() => placesData as Place[], []);

  // Get photos for lightbox
  const lightboxPhotos = usePhotos(lightboxPlace?.id || '');

  // Check mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle place click from map or list
  const handlePlaceClick = useCallback((place: Place) => {
    setSelectedPlaceId(place.id);
    setFlyToPlace({ lat: place.lat, lng: place.lng, zoom: 13 });
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  // Handle place hover from list
  const handlePlaceHover = useCallback((placeId: string | null) => {
    setHoveredPlaceId(placeId);
  }, []);

  // Handle filter change (from search box)
  const handleFilterChange = useCallback((value: string) => {
    setFilter(value);
  }, []);

  // Handle search result selection
  const handleSearchSelect = useCallback((suggestion: SearchSuggestion) => {
    setSearchPin(suggestion);
    setFlyToPlace({
      lat: suggestion.lat,
      lng: suggestion.lng,
      zoom: suggestion.zoom,
    });
    if (isMobile) setIsSidebarOpen(false);
  }, [isMobile]);

  // Handle search clear
  const handleSearchClear = useCallback(() => {
    setSearchPin(null);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((order: SortOrder) => {
    setSortOrder(order);
  }, []);

  // Handle view photos
  const handleViewPhotos = useCallback((place: Place) => {
    setLightboxPlace(place);
  }, []);

  // Handle lightbox close
  const handleLightboxClose = useCallback(() => {
    setLightboxPlace(null);
  }, []);

  // Handle fly complete
  const handleFlyComplete = useCallback(() => {
    setFlyToPlace(null);
  }, []);

  // Handle viewport change
  const handleViewportChange = useCallback((newViewport: MapViewport) => {
    setViewport(newViewport);
  }, []);

  // Close popup when clicking away (handled by map)
  const handleClosePopup = useCallback(() => {
    setSelectedPlaceId(null);
  }, []);

  // Remove search pin
  const handleRemoveSearchPin = useCallback(() => {
    setSearchPin(null);
  }, []);

  // Toggle sidebar on mobile
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 btn-secondary shadow-lg lg:hidden"
          aria-label={isSidebarOpen ? 'Close places list' : 'Open places list'}
          aria-expanded={isSidebarOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

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

        {/* Zoom controls */}
        <ZoomControls mapRef={mapRef} />
      </div>

      {/* Sidebar */}
      <Sidebar
        places={places}
        selectedPlaceId={selectedPlaceId}
        hoveredPlaceId={hoveredPlaceId}
        filter={filter}
        sortOrder={sortOrder}
        searchPin={searchPin}
        isMobile={isMobile}
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

      {/* Photo Lightbox */}
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