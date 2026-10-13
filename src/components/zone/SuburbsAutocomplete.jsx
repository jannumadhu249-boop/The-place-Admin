import React, { useEffect, useRef, useState } from 'react';
import { MapPin, X, Plus, Search, Sparkles } from 'lucide-react';
import { URLS } from '../../url';

// Shared script loader promise
let googlePlacesPromise = null;
export function loadGoogleMapsWithPlaces(apiKey) {
  if (window.google?.maps?.places) {
    return Promise.resolve(window.google.maps);
  }
  if (googlePlacesPromise) {
    return googlePlacesPromise;
  }
  googlePlacesPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-api-script');
    if (existing) {
      if (window.google?.maps?.places) {
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
      googlePlacesPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });
  return googlePlacesPromise;
}

// Generate GeoJSON Polygon from array of { lat, lng } points
export function calculatePolygonFromLocations(locations) {
  if (!locations || locations.length === 0) return null;

  if (locations.length === 1) {
    const { lat, lng } = locations[0];
    const delta = 0.018; // ~2km perimeter box
    return {
      type: 'Polygon',
      coordinates: [
        [
          [Number((lng - delta).toFixed(6)), Number((lat + delta).toFixed(6))],
          [Number((lng + delta).toFixed(6)), Number((lat + delta).toFixed(6))],
          [Number((lng + delta).toFixed(6)), Number((lat - delta).toFixed(6))],
          [Number((lng - delta).toFixed(6)), Number((lat - delta).toFixed(6))],
          [Number((lng - delta).toFixed(6)), Number((lat + delta).toFixed(6))],
        ]
      ]
    };
  }

  // Multi-location: compute bounding box with margin
  const lats = locations.map(l => l.lat);
  const lngs = locations.map(l => l.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const pad = 0.012; // ~1.2km buffer padding

  return {
    type: 'Polygon',
    coordinates: [
      [
        [Number((minLng - pad).toFixed(6)), Number((maxLat + pad).toFixed(6))],
        [Number((maxLng + pad).toFixed(6)), Number((maxLat + pad).toFixed(6))],
        [Number((maxLng + pad).toFixed(6)), Number((minLat - pad).toFixed(6))],
        [Number((minLng - pad).toFixed(6)), Number((minLat - pad).toFixed(6))],
        [Number((minLng - pad).toFixed(6)), Number((maxLat + pad).toFixed(6))],
      ]
    ]
  };
}

export default function SuburbsAutocomplete({
  value = '',
  onChange,
  onAutoBoundaryGenerated,
  placeholder = 'Search suburb or neighborhood (e.g. Madhapur, Gachibowli)...'
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [suburbs, setSuburbs] = useState(() => {
    return value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
  });
  const [locations, setLocations] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [apiReady, setApiReady] = useState(false);

  // Sync external value
  useEffect(() => {
    const parsed = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
    setSuburbs(parsed);
  }, [value]);

  // Load Google Places
  useEffect(() => {
    loadGoogleMapsWithPlaces(URLS.GoogleMapApiKey)
      .then(() => setApiReady(true))
      .catch((err) => console.warn('Google Places load warning:', err));
  }, []);

  // Initialize Autocomplete on input
  useEffect(() => {
    if (!apiReady || !inputRef.current || !window.google?.maps?.places) return;

    if (autocompleteRef.current) {
      window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
    }

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
      fields: ['name', 'formatted_address', 'geometry']
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place || !place.geometry?.location) return;

      const placeName = place.name || (place.formatted_address ? place.formatted_address.split(',')[0] : '');
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      if (placeName && !suburbs.includes(placeName)) {
        const nextSuburbs = [...suburbs, placeName];
        const nextLocations = [...locations, { name: placeName, lat, lng }];

        setSuburbs(nextSuburbs);
        setLocations(nextLocations);
        setInputValue('');

        if (onChange) {
          onChange(nextSuburbs.join(', '));
        }

        if (onAutoBoundaryGenerated) {
          const poly = calculatePolygonFromLocations(nextLocations);
          if (poly) onAutoBoundaryGenerated(poly);
        }
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [apiReady, suburbs, locations, onChange, onAutoBoundaryGenerated]);

  const handleAddManualSuburb = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed && !suburbs.includes(trimmed)) {
        const next = [...suburbs, trimmed];
        setSuburbs(next);
        setInputValue('');
        if (onChange) onChange(next.join(', '));
      }
    }
  };

  const handleRemoveSuburb = (indexToRemove) => {
    const nextSuburbs = suburbs.filter((_, idx) => idx !== indexToRemove);
    const nextLocations = locations.filter((_, idx) => idx !== indexToRemove);
    setSuburbs(nextSuburbs);
    setLocations(nextLocations);
    if (onChange) onChange(nextSuburbs.join(', '));

    if (onAutoBoundaryGenerated && nextLocations.length > 0) {
      const poly = calculatePolygonFromLocations(nextLocations);
      if (poly) onAutoBoundaryGenerated(poly);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Search Input Box */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: 12, color: '#94a3b8', pointerEvents: 'none' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleAddManualSuburb}
          placeholder={placeholder}
          className="form-control-input"
          style={{ paddingLeft: 36, width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, color: '#64748b' }}>
        <span>Type to search via Google Places, or type name and press Enter</span>
        {locations.length > 0 && (
          <span style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={12} /> Auto-generated GPS polygon applied
          </span>
        )}
      </div>

      {/* Selected Suburbs Chips */}
      {suburbs.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {suburbs.map((sub, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: 600,
                color: '#334155'
              }}
            >
              <MapPin size={12} color="#be123c" />
              <span>{sub}</span>
              <button
                type="button"
                onClick={() => handleRemoveSuburb(idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: '#94a3b8'
                }}
                title="Remove"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
