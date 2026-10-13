import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  GoogleMap,
  Polygon,
  Polyline,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { MapPin, CheckCircle, Layers, AlertTriangle, Undo, Check, RotateCcw } from 'lucide-react';
import { URLS } from '../../url';

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };
const ZONE_COLORS = [
  '#be123c', '#0284c7', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899',
  '#f43f5e', '#38bdf8', '#fbbf24', '#4ade80',
];

// Singleton script loader to completely prevent "Loader must not be called again with different options"
let googleMapsPromise = null;
function loadGoogleMapsScript(apiKey) {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }
  if (googleMapsPromise) {
    return googleMapsPromise;
  }
  googleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-api-script');
    if (existing) {
      if (window.google?.maps) {
        resolve(window.google.maps);
      } else {
        existing.addEventListener('load', () => resolve(window.google.maps));
        existing.addEventListener('error', (err) => reject(err));
      }
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = (err) => {
      googleMapsPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });
  return googleMapsPromise;
}

function useGoogleMaps(apiKey) {
  const [isLoaded, setIsLoaded] = useState(() => Boolean(window.google?.maps));
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }
    let isMounted = true;
    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (isMounted) setIsLoaded(true);
      })
      .catch((err) => {
        if (isMounted) setLoadError(err);
      });
    return () => {
      isMounted = false;
    };
  }, [apiKey]);

  return { isLoaded, loadError };
}

// GeoJSON [lng, lat] ring → Google Maps {lat, lng} array (drop closing point)
function geoJsonRingToLatLngs(ring) {
  if (!ring || ring.length === 0) return [];
  return ring.slice(0, -1).map(([lng, lat]) => ({ lat, lng }));
}

// Google Maps {lat, lng} array → GeoJSON [lng, lat] ring (closed)
function latLngsToGeoJsonRing(latLngs) {
  const coords = latLngs.map((p) => {
    const lat = typeof p.lat === 'function' ? p.lat() : p.lat;
    const lng = typeof p.lng === 'function' ? p.lng() : p.lng;
    return [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
  });
  if (coords.length > 0) coords.push(coords[0]);
  return coords;
}

// Compute centroid of a GeoJSON ring
function computeCentroid(ring) {
  if (!ring || ring.length < 2) return { lat: 17.385, lng: 78.4867 };
  const pts = ring.slice(0, -1);
  const lat = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const lng = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  return { lat, lng };
}

export default function ZoneMap({
  zone,
  allZones = [],
  onSave,
  onClose,
  height = 440,
  interactive = true,
}) {
  const { isLoaded, loadError } = useGoogleMaps(URLS.GoogleMapApiKey);

  const mapRef = useRef(null);
  const polygonRef = useRef(null);

  const [selectedZoneInfo, setSelectedZoneInfo] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [drawnCoords, setDrawnCoords] = useState(null);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const [mapCenter, setMapCenter] = useState(() => {
    if (zone?.location?.coordinates?.[0]) {
      return computeCentroid(zone.location.coordinates[0]);
    }
    return { lat: 17.385, lng: 78.4867 };
  });

  useEffect(() => {
    if (zone?.location?.coordinates?.[0]) {
      const c = computeCentroid(zone.location.coordinates[0]);
      setMapCenter(c);
      if (mapRef.current) mapRef.current.panTo(c);
    }
    setDrawingPoints([]);
    setDrawnCoords(null);
    setIsDrawingMode(false);
    setSaveSuccessNotice(false);
  }, [zone]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Map click handler for drawing mode
  const handleMapClick = (e) => {
    if (!isDrawingMode) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setDrawingPoints((prev) => [...prev, { lat, lng }]);
  };

  const handleStartDraw = () => {
    setIsDrawingMode(true);
    setDrawingPoints([]);
    setDrawnCoords(null);
    setSaveSuccessNotice(false);
  };

  const handleUndoPoint = () => {
    setDrawingPoints((prev) => prev.slice(0, -1));
  };

  const handleResetDraw = () => {
    setDrawingPoints([]);
    setDrawnCoords(null);
    setIsDrawingMode(false);
  };

  const handleFinishDraw = () => {
    if (drawingPoints.length < 3) {
      alert('A polygon needs at least 3 points. Click on the map to add more boundary points.');
      return;
    }
    const ring = latLngsToGeoJsonRing(drawingPoints);
    setDrawnCoords(ring);
    setIsDrawingMode(false);
  };

  // When polygon vertices are edited
  const onPolygonEdit = useCallback(() => {
    if (polygonRef.current) {
      const path = polygonRef.current.getPath();
      const points = [];
      for (let i = 0; i < path.getLength(); i++) {
        const pt = path.getAt(i);
        points.push({ lat: pt.lat(), lng: pt.lng() });
      }
      const ring = latLngsToGeoJsonRing(points);
      setDrawnCoords(ring);
    }
  }, []);

  const handleSave = () => {
    if (!onSave) return;
    const finalRing = drawnCoords || zone?.location?.coordinates?.[0] || null;
    if (!finalRing) {
      alert('Please draw a boundary polygon on the map first.');
      return;
    }
    onSave({
      zoneId: zone?._id,
      location: { type: 'Polygon', coordinates: [finalRing] },
    });
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 4000);
    if (onClose) onClose();
  };

  if (loadError) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>
        <AlertTriangle size={24} />
        <p style={{ marginTop: 8 }}>Failed to load Google Maps. Please check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        color: '#64748b',
        fontSize: 14,
        fontWeight: 600,
        gap: 8,
      }}>
        <MapPin size={20} color="#be123c" />
        Loading Google Maps Engine...
      </div>
    );
  }

  // Filter live zones: inactive zones must not be rendered as active live geofences!
  const allAvailableZones = allZones.length > 0 ? allZones : (zone ? [zone] : []);
  const zonesToRender = allAvailableZones.filter((z) => {
    if (!showOnlyActive) return true;
    // Always render current zone being inspected even if inactive, but with distinct style
    if (zone && z._id === zone._id) return true;
    return z.status === 'active';
  });
  const liveActiveZones = allAvailableZones.filter((z) => z.status === 'active');

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
      {/* Control Bar */}
      {interactive && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: 12,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={15} color="#be123c" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                {zone?.name || 'All Zones'}
              </span>
            </div>

            {!isDrawingMode ? (
              <button
                type="button"
                onClick={handleStartDraw}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  borderRadius: 7,
                  border: '1.5px solid #be123c',
                  background: '#fff1f2',
                  color: '#be123c',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <MapPin size={14} />
                Draw New Boundary
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  background: '#fef3c7',
                  color: '#b45309',
                  padding: '4px 10px',
                  borderRadius: 6,
                }}>
                  Click map to place points ({drawingPoints.length} placed)
                </span>

                <button
                  type="button"
                  onClick={handleFinishDraw}
                  disabled={drawingPoints.length < 3}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 6,
                    border: 'none',
                    background: drawingPoints.length >= 3 ? '#16a34a' : '#cbd5e1',
                    color: '#ffffff',
                    cursor: drawingPoints.length >= 3 ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Check size={14} /> Finish Polygon
                </button>

                {drawingPoints.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUndoPoint}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '6px 10px',
                      fontSize: 12,
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    <Undo size={13} /> Undo
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetDraw}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 10px',
                    fontSize: 12,
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#dc2626',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={13} /> Cancel
                </button>
              </div>
            )}

            {/* Toggle Active / All filter */}
            <button
              type="button"
              onClick={() => setShowOnlyActive(!showOnlyActive)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '5px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: showOnlyActive ? '#f0fdf4' : '#ffffff',
                color: showOnlyActive ? '#16a34a' : '#64748b',
                cursor: 'pointer'
              }}
              title="Toggle inactive zones visibility on map"
            >
              {showOnlyActive ? '🟢 Live Active Only' : '⚪ Showing All Zones'}
            </button>

            {drawnCoords && !isDrawingMode && (
              <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={13} /> Boundary ready ({drawnCoords.length - 1} points)
              </span>
            )}

            {saveSuccessNotice && (
              <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>
                ✅ Boundary Saved!
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onClose && (
              <button
                type="button"
                style={{ padding: '6px 14px', fontSize: 12.5, borderRadius: 7, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }}
                onClick={onClose}
              >
                Cancel
              </button>
            )}
            {onSave && (
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 16px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  borderRadius: 7,
                  border: 'none',
                  background: '#be123c',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: drawnCoords ? '0 0 10px rgba(190, 18, 60, 0.4)' : 'none'
                }}
                onClick={handleSave}
              >
                <CheckCircle size={14} /> Save Boundary
              </button>
            )}
          </div>
        </div>
      )}

      {/* Drawing Mode Instructions Strip */}
      {isDrawingMode && (
        <div style={{
          background: '#fef3c7',
          color: '#92400e',
          padding: '8px 16px',
          fontSize: 12.5,
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #fde68a'
        }}>
          <span>📍 Click on map to place perimeter vertices ({drawingPoints.length} points placed). Minimum 3 points required.</span>
          <span style={{ fontSize: 11.5, color: '#b45309' }}>When done, click "Finish Polygon" button above</span>
        </div>
      )}

      {/* Boundary Ready to Save Banner */}
      {drawnCoords && !isDrawingMode && onSave && (
        <div style={{
          background: '#dcfce7',
          color: '#166534',
          padding: '8px 16px',
          fontSize: 12.5,
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #bbf7d0'
        }}>
          <span>✨ New boundary created with {drawnCoords.length - 1} vertices! Click "Save Boundary" to apply to zone.</span>
          <button
            type="button"
            onClick={handleSave}
            style={{
              background: '#16a34a',
              color: '#ffffff',
              border: 'none',
              padding: '4px 12px',
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Apply & Save Now
          </button>
        </div>
      )}

      {/* Google Map */}
      <div style={{ height, width: '100%' }}>
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={mapCenter}
          zoom={12}
          onLoad={onMapLoad}
          onClick={handleMapClick}
          options={{
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            draggableCursor: isDrawingMode ? 'crosshair' : undefined,
            styles: [
              { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            ],
          }}
        >
          {/* Active drawing points preview */}
          {isDrawingMode && drawingPoints.length > 0 && (
            <>
              {drawingPoints.length >= 3 ? (
                <Polygon
                  paths={drawingPoints}
                  options={{
                    fillColor: '#be123c',
                    fillOpacity: 0.25,
                    strokeColor: '#be123c',
                    strokeWeight: 2,
                    strokeDashstyle: 'dash',
                    clickable: false,
                  }}
                />
              ) : (
                <Polyline
                  path={drawingPoints}
                  options={{
                    strokeColor: '#be123c',
                    strokeWeight: 2.5,
                    clickable: false,
                  }}
                />
              )}

              {/* Show small markers at placed vertices */}
              {drawingPoints.map((pt, idx) => (
                <Marker
                  key={idx}
                  position={pt}
                  label={{
                    text: String(idx + 1),
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}
                  icon={{
                    path: window.google?.maps?.SymbolPath?.CIRCLE,
                    scale: 10,
                    fillColor: '#be123c',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  }}
                />
              ))}
            </>
          )}

          {/* Newly drawn polygon (completed & editable) */}
          {drawnCoords && !isDrawingMode && (
            <Polygon
              onLoad={(poly) => {
                polygonRef.current = poly;
                const path = poly.getPath();
                path.addListener('set_at', onPolygonEdit);
                path.addListener('insert_at', onPolygonEdit);
                path.addListener('remove_at', onPolygonEdit);
              }}
              paths={geoJsonRingToLatLngs(drawnCoords)}
              options={{
                fillColor: '#16a34a',
                fillOpacity: 0.32,
                strokeColor: '#16a34a',
                strokeWeight: 3,
                editable: interactive,
                draggable: interactive,
                zIndex: 10,
              }}
            />
          )}

          {/* Render existing zones from backend */}
          {zonesToRender.map((z, index) => {
            // If this zone is being redrawn, skip rendering its old boundary
            if (drawnCoords && zone && z._id === zone._id) return null;

            const ring = z?.location?.coordinates?.[0];
            if (!ring || ring.length < 4) return null;
            const paths = geoJsonRingToLatLngs(ring);
            const isInactive = z.status !== 'active';
            const color = isInactive ? '#64748b' : (z.color || ZONE_COLORS[index % ZONE_COLORS.length]);
            const isCurrent = zone && z._id === zone._id;
            const centroid = computeCentroid(ring);

            return (
              <React.Fragment key={z._id || index}>
                <Polygon
                  paths={paths}
                  options={{
                    fillColor: color,
                    fillOpacity: isInactive ? 0.08 : (isCurrent ? 0.28 : 0.12),
                    strokeColor: color,
                    strokeWeight: isCurrent ? 3 : (isInactive ? 1.5 : 2),
                    strokeDashstyle: isInactive ? 'dash' : undefined,
                    strokeOpacity: isInactive ? 0.6 : 1,
                    clickable: !isDrawingMode,
                    zIndex: isCurrent ? 3 : (isInactive ? 1 : 2),
                  }}
                  onClick={() => {
                    if (!isDrawingMode) {
                      setSelectedZoneInfo({ zone: z, position: centroid });
                    }
                  }}
                />
                {!isDrawingMode && (
                  <Marker
                    position={centroid}
                    title={`${z.name}${isInactive ? ' (Inactive)' : ''}`}
                    onClick={() => setSelectedZoneInfo({ zone: z, position: centroid })}
                    icon={{
                      path: window.google?.maps?.SymbolPath?.CIRCLE,
                      scale: isInactive ? 6 : 8,
                      fillColor: color,
                      fillOpacity: isInactive ? 0.7 : 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Info Window */}
          {selectedZoneInfo && !isDrawingMode && (
            <InfoWindow
              position={selectedZoneInfo.position}
              onCloseClick={() => setSelectedZoneInfo(null)}
            >
              <div style={{ fontFamily: 'sans-serif', minWidth: 190, padding: 4 }}>
                <strong style={{ fontSize: 14, color: '#0f172a' }}>{selectedZoneInfo.zone.name}</strong>
                <div style={{ marginTop: 6, fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                  <div>📍 <strong>Suburbs:</strong> {selectedZoneInfo.zone.Suburbs || '—'}</div>
                  <div>🚀 <strong>Radius:</strong> {selectedZoneInfo.zone.operationalRadius || '—'} km</div>
                  <div>💰 <strong>Base Fee:</strong> ₹{selectedZoneInfo.zone.baseMinimumDeliveryFee || '0'}</div>
                  <div>📦 <strong>Min Cart:</strong> ₹{selectedZoneInfo.zone.minimumOrderCartAmount || '0'}</div>
                  <div style={{
                    marginTop: 6, display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                    fontSize: 11, fontWeight: 700,
                    background: selectedZoneInfo.zone.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: selectedZoneInfo.zone.status === 'active' ? '#16a34a' : '#dc2626',
                  }}>
                    {selectedZoneInfo.zone.status === 'active' ? '● ACTIVE LIVE ZONE' : '○ INACTIVE ZONE'}
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Legend - Only displays Active Live Zones! */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16,
        background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(8px)',
        padding: '8px 14px', borderRadius: 8, color: '#ffffff', fontSize: 11.5,
        display: 'flex', alignItems: 'center', gap: 14, zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)', flexWrap: 'wrap', maxWidth: 'calc(100% - 32px)',
      }}>
        <span style={{ fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Live Geofences ({liveActiveZones.length}):
        </span>
        {liveActiveZones.length === 0 ? (
          <span style={{ color: '#94a3b8' }}>No active zones configured</span>
        ) : (
          liveActiveZones.map((z, idx) => {
            const c = z.color || ZONE_COLORS[idx % ZONE_COLORS.length];
            return (
              <div key={z._id || idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
                <span style={{ color: '#e2e8f0' }}>{z.name}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


