import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Place, MapViewport } from '../types';
import { PlacePopup } from './PlacePopup';

// Custom marker icon using divIcon (no image bundling issues)
function createMarkerIcon(isSelected: boolean = false) {
  return L.divIcon({
    className: `custom-marker ${isSelected ? 'selected' : ''}`,
    html: '<div class="marker-dot"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

// Cluster icon creation
function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  let className = 'custom-marker-cluster custom-marker-cluster-small';
  if (count >= 100) className = 'custom-marker-cluster custom-marker-cluster-large';
  else if (count >= 10) className = 'custom-marker-cluster custom-marker-cluster-medium';

  return L.divIcon({
    className,
    html: `<div><span>${count}</span></div>`,
    iconSize: count >= 100 ? [60, 60] : count >= 10 ? [50, 50] : [40, 40],
    iconAnchor: count >= 100 ? [30, 30] : count >= 10 ? [25, 25] : [20, 20],
  });
}

// Component to handle map events (viewport changes)
function MapEventsController({
  onViewportChange,
}: {
  onViewportChange?: (viewport: MapViewport) => void;
}) {
  const map = useMapEvents({
    moveend() {
      if (onViewportChange) {
        onViewportChange({
          center: [map.getCenter().lat, map.getCenter().lng],
          zoom: map.getZoom(),
        });
      }
    },
  });

  return null;
}

// Component to handle flyTo animations
function FlyToController({
  flyToPlace,
  onFlyComplete,
}: {
  flyToPlace: { lat: number; lng: number; zoom?: number } | null;
  onFlyComplete: () => void;
}) {
  const map = useMapEvents({});

  useEffect(() => {
    if (flyToPlace && map) {
      map.flyTo([flyToPlace.lat, flyToPlace.lng], flyToPlace.zoom ?? 13, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25,
      }).once('moveend', () => {
        onFlyComplete();
      });
    }
  }, [flyToPlace, map, onFlyComplete]);

  return null;
}

interface MapViewProps {
  places: Place[];
  selectedPlaceId: string | null;
  onPlaceClick: (place: Place) => void;
  onClosePopup: () => void;
  onViewPhotos: (place: Place) => void;
  searchPin: { lat: number; lng: number; label: string } | null;
  onRemoveSearchPin: () => void;
  viewport: MapViewport;
  onViewportChange: (viewport: MapViewport) => void;
  flyToPlace: { lat: number; lng: number; zoom?: number } | null;
  onFlyComplete: () => void;
  mapRef?: React.RefObject<L.Map | null>;
}

export function MapView({
  places,
  selectedPlaceId,
  onPlaceClick,
  onClosePopup,
  onViewPhotos,
  searchPin,
  onRemoveSearchPin,
  viewport,
  onViewportChange,
  flyToPlace,
  onFlyComplete,
  mapRef: forwardedRef,
}: MapViewProps & { mapRef?: React.RefObject<L.Map | null> }) {
  const internalMapRef = useRef<L.Map | null>(null);
  const mapRef = forwardedRef || internalMapRef;

  // Always use OSM tiles; dark mode is applied via CSS filter on the tile pane
  const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <MapContainer
      ref={mapRef as any}
      center={viewport.center}
      zoom={viewport.zoom}
      zoomControl={false}
      scrollWheelZoom={true}
      doubleClickZoom={true}
      touchZoom={true}
      boxZoom={false}
      keyboard={true}
      minZoom={2}
      maxZoom={18}
      maxBounds={[
        [-90, -180],
        [90, 180],
      ]}
      maxBoundsViscosity={1.0}
      style={{ width: '100%', height: '100%' }}
      whenReady={() => {
        // Map is ready, ref will be set via forwardedRef
      }}
    >
      <TileLayer
        url={tileUrl}
        attribution={tileAttribution}
        noWrap={true}
        maxZoom={18}
        minZoom={2}
      />

      <MapEventsController onViewportChange={onViewportChange} />
      <FlyToController flyToPlace={flyToPlace} onFlyComplete={onFlyComplete} />

      {/* Marker Clusters */}
      <MarkerClusterGroup
        options={{
          iconCreateFunction: createClusterIcon,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          maxClusterRadius: 50,
          disableClusteringAtZoom: 14,
        }}
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={createMarkerIcon(selectedPlaceId === place.id)}
            zIndexOffset={selectedPlaceId === place.id ? 1000 : 0}
            eventHandlers={{
              click: () => onPlaceClick(place),
            }}
          >
            <Popup
              autoClose={false}
              closeOnClick={false}
              className="custom-popup"
            >
              <PlacePopup
                place={place}
                isSelected={selectedPlaceId === place.id}
                onClose={onClosePopup}
                onViewPhotos={onViewPhotos}
              />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      {/* Search Pin */}
      {searchPin && (
        <Marker
          position={[searchPin.lat, searchPin.lng]}
          icon={L.divIcon({
            className: 'search-pin',
            html: '<div class="search-pin-dot"></div>',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14],
          })}
        >
          <Popup
            className="search-popup"
            autoClose={false}
            closeOnClick={false}
            closeButton={false}
          >
            <div className="p-3 flex items-center gap-2">
              <span className="font-medium text-sm">{searchPin.label}</span>
              <button
                onClick={onRemoveSearchPin}
                className="ml-auto p-1 rounded hover:bg-[var(--color-bg-secondary)] transition-colors"
                aria-label="Remove search pin"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

// Zoom controls component
interface ZoomControlsProps {
  mapRef: React.RefObject<L.Map | null>;
}

export function ZoomControls({ mapRef }: ZoomControlsProps) {
  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };
  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
      <button
        onClick={handleZoomIn}
        className="btn-secondary w-10 h-10 p-0"
        aria-label="Zoom in"
        title="Zoom in"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>
      <button
        onClick={handleZoomOut}
        className="btn-secondary w-10 h-10 p-0"
        aria-label="Zoom out"
        title="Zoom out"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </button>
    </div>
  );
}