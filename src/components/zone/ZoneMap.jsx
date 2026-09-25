import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Circle, CheckCircle, Navigation, Layers, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

export default function ZoneMap({ 
  zone, 
  allZones = [], 
  onSave, 
  onClose,
  height = 440,
  interactive = true 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const circlesRef = useRef({});
  const activeCircleRef = useRef(null);
  const activeMarkerRef = useRef(null);

  const [mapReady, setMapReady] = useState(false);
  const [currentZone, setCurrentZone] = useState(zone || allZones[0] || null);
  const [radiusKm, setRadiusKm] = useState(zone?.radiusKm || allZones[0]?.radiusKm || 6.0);
  const [center, setCenter] = useState(zone?.center || allZones[0]?.center || [40.7128, -74.006]);

  // Update when zone prop changes
  useEffect(() => {
    if (zone) {
      setCurrentZone(zone);
      setRadiusKm(zone.radiusKm || 6.0);
      const newCenter = zone.center || [40.7128, -74.006];
      setCenter(newCenter);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(newCenter, 12, { animate: true });
      }
    }
  }, [zone]);

  useEffect(() => {
    // Dynamically inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (!mapContainerRef.current || !isMounted) return;

        // Cleanup any prior instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center,
          zoom: 12,
          zoomControl: false,
          scrollWheelZoom: true,
        });

        // OpenStreetMap Tile Layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const zonesToRender = allZones.length > 0 ? allZones : (currentZone ? [currentZone] : []);
        const zoneColors = ['#be123c', '#0284c7', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

        zonesToRender.forEach((z, index) => {
          const zCenter = z.center || [40.7128 + (index * 0.03), -74.006 + (index * 0.03)];
          const zRadius = (z.radiusKm || 6) * 1000;
          const color = z.color || zoneColors[index % zoneColors.length];
          const isCurrent = currentZone && z.id === currentZone.id;

          const circle = L.circle(zCenter, {
            color: color,
            fillColor: color,
            fillOpacity: isCurrent ? 0.22 : 0.12,
            weight: isCurrent ? 3 : 1.8,
            dashArray: isCurrent ? '6 4' : null,
            radius: zRadius,
          }).addTo(map);

          circlesRef.current[z.id] = circle;

          const marker = L.marker(zCenter, {
            draggable: interactive && isCurrent,
          }).addTo(map);

          marker.bindPopup(`
            <div style="font-family: sans-serif; min-width: 160px;">
              <strong style="color: ${color}; font-size: 13px;">${z.name}</strong><br/>
              <span style="font-size: 11.5px; color: #64748b;">Radius: ${z.radiusKm || 6} km</span><br/>
              <span style="font-size: 11.5px; color: #334155;">Base Fee: ${z.minDeliveryCharge || '$3.50'}</span>
            </div>
          `);

          if (isCurrent) {
            marker.openPopup();
            activeCircleRef.current = circle;
            activeMarkerRef.current = marker;

            marker.on('dragend', (e) => {
              const pos = e.target.getLatLng();
              setCenter([pos.lat, pos.lng]);
              circle.setLatLng(pos);
            });
          }

          markersRef.current[z.id] = marker;
        });

        // Click on map to move current zone center
        if (interactive) {
          map.on('click', (e) => {
            const pos = [e.latlng.lat, e.latlng.lng];
            setCenter(pos);
            if (activeMarkerRef.current) {
              activeMarkerRef.current.setLatLng(pos);
            }
            if (activeCircleRef.current) {
              activeCircleRef.current.setLatLng(pos);
            }
          });
        }

        mapInstanceRef.current = map;
        if (isMounted) setMapReady(true);
      } catch (err) {
        console.error('Leaflet initialization error:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [allZones.length, currentZone?.id]);

  // Dynamically update active circle radius
  useEffect(() => {
    if (activeCircleRef.current) {
      activeCircleRef.current.setRadius(radiusKm * 1000);
    }
  }, [radiusKm]);

  const handleSave = () => {
    if (onSave) {
      onSave({
        zoneId: currentZone?.id,
        center,
        radiusKm: Number(radiusKm)
      });
    }
    if (onClose) onClose();
  };

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
      {/* Control Overlay Bar */}
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
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Circle size={16} color="#be123c" />
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                Geofence Radius:
              </label>
              <input
                type="range"
                min={1}
                max={20}
                step={0.5}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                style={{ width: 140, accentColor: '#be123c', cursor: 'pointer' }}
              />
              <span style={{
                background: '#fff1f2',
                color: '#be123c',
                fontWeight: 700,
                fontSize: 12.5,
                padding: '3px 10px',
                borderRadius: 6,
                minWidth: 55,
                textAlign: 'center'
              }}>
                {radiusKm} km
              </span>
            </div>

            <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Navigation size={13} color="#f59e0b" />
              <span>Click map or drag pin to redraw center coordinates: [<strong>{center[0].toFixed(4)}, {center[1].toFixed(4)}</strong>]</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onClose && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: 12.5 }}
                onClick={onClose}
              >
                Cancel
              </button>
            )}
            {onSave && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '6px 16px', fontSize: 12.5 }}
                onClick={handleSave}
              >
                <CheckCircle size={14} /> Save Boundary
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map Element */}
      <div
        ref={mapContainerRef}
        style={{
          height: height,
          width: '100%',
          backgroundColor: '#e2e8f0',
          position: 'relative',
          zIndex: 1
        }}
      />

      {/* Map Legend Overlay */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(8px)',
        padding: '8px 14px',
        borderRadius: 8,
        color: '#ffffff',
        fontSize: 11.5,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}>
        <span style={{ fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Live Geofences:
        </span>
        {(allZones.length > 0 ? allZones : (currentZone ? [currentZone] : [])).map((z, idx) => {
          const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#4ade80'];
          const c = z.color || colors[idx % colors.length];
          return (
            <div key={z.id || idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              <span style={{ color: '#e2e8f0' }}>{z.name ? z.name.split('-')[0] : `Zone ${idx + 1}`}</span>
            </div>
          );
        })}
      </div>

      {!mapReady && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          color: '#64748b',
          fontSize: 14,
          fontWeight: 600,
          gap: 8,
          zIndex: 1001
        }}>
          <MapPin size={20} color="#be123c" className="spinning-icon" />
          Initializing OpenStreetMap Leaflet Engine...
        </div>
      )}
    </div>
  );
}
