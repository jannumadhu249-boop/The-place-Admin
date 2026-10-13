import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Plus, Navigation, Layers, DollarSign,
  Store, Bike, X, Check, Edit2, Trash2, RefreshCw, AlertCircle, Map
} from 'lucide-react';
import ZoneMap from './GoogleMap';
import SuburbsAutocomplete, { calculatePolygonFromLocations } from './SuburbsAutocomplete';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

const DEFAULT_POLYGON = {
  type: 'Polygon',
  coordinates: [
    [
      [78.4010, 17.4483],
      [78.4200, 17.4483],
      [78.4200, 17.4300],
      [78.4010, 17.4300],
      [78.4010, 17.4483]
    ]
  ]
};

const INITIAL_FORM = {
  name: '',
  priority: '',
  Suburbs: '',
  operationalRadius: '',
  baseMinimumDeliveryFee: '',
  perKilometerSurcharge: '',  
  minimumOrderCartAmount: '',
  status: '',
  location: DEFAULT_POLYGON
};

export default function ZoneSetup() {
  const [zones, setZones] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapModal, setMapModal] = useState({ open: false, zone: null });
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Auto clear alerts
  useEffect(() => {
    if (successMsg || error) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, error]);

  // Fetch all zones (GET endpoint via POST curl)
  const fetchZones = useCallback(async (isManual = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(URLS.GetZones, {
        method: 'POST',
        headers: {
          'authorization': getAuthHeader()
        }
      });
      const data = await res.json();
      if (res.ok && (data.success !== false)) {
        const zoneList = data.zones || data.data || [];
        setZones(zoneList);
        if (zoneList.length > 0 && !selectedZoneId) {
          setSelectedZoneId(zoneList[0]._id);
        }
        if (isManual) {
          setSuccessMsg(`Successfully refreshed ${zoneList.length} zones from server!`);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch zones');
      }
    } catch (err) {
      console.error('Fetch Zones Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedZoneId]);

  useEffect(() => {
    fetchZones();
  }, []);

  const handleRefresh = () => {
    fetchZones(true);
  };

  const activeZone = zones.find(z => z._id === selectedZoneId) || zones[0] || null;

  // Toggle zone status (active / inactive)
  const toggleZoneStatus = async (zone) => {
    setActionLoading(true);
    const newStatus = zone.status === 'active' ? 'inactive' : 'active';
    try {
      const payload = {
        name: zone.name,
        priority: String(zone.priority || '1'),
        Suburbs: zone.Suburbs || '',
        operationalRadius: String(zone.operationalRadius || '10'),
        baseMinimumDeliveryFee: String(zone.baseMinimumDeliveryFee || '50'),
        perKilometerSurcharge: String(zone.perKilometerSurcharge || '10'),
        minimumOrderCartAmount: String(zone.minimumOrderCartAmount || '200'),
        location: zone.location || DEFAULT_POLYGON,
        status: newStatus
      };

      const res = await fetch(URLS.UpdateZone + zone._id, {
        method: 'PUT',
        headers: {
          'authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSuccessMsg(`Zone status changed to "${newStatus}"`);
        await fetchZones();
      } else {
        throw new Error(data.message || 'Failed to update zone status');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Update zone boundary (from map editor)
  const handleUpdateZoneBoundary = async ({ zoneId, location }) => {
    const target = zones.find(z => z._id === (zoneId || activeZone?._id));
    if (!target) return;

    setActionLoading(true);
    try {
      const payload = {
        name: target.name,
        priority: String(target.priority || '1'),
        Suburbs: target.Suburbs || '',
        operationalRadius: String(target.operationalRadius || '10'),
        baseMinimumDeliveryFee: String(target.baseMinimumDeliveryFee || '50'),
        perKilometerSurcharge: String(target.perKilometerSurcharge || '10'),
        minimumOrderCartAmount: String(target.minimumOrderCartAmount || '200'),
        location: location || target.location,
        status: target.status || 'active'
      };

      const res = await fetch(URLS.UpdateZone + target._id, {
        method: 'PUT',
        headers: {
          'authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSuccessMsg('Zone boundary updated successfully!');
        await fetchZones();
      } else {
        throw new Error(data.message || 'Failed to update zone boundary');
      }
    } catch (err) {
      console.error('Update boundary error:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Create new zone
  const handleCreateZone = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        name: formData.name,
        priority: String(formData.priority || '1'),
        Suburbs: formData.Suburbs,
        operationalRadius: String(formData.operationalRadius || '10'),
        baseMinimumDeliveryFee: String(formData.baseMinimumDeliveryFee || '50'),
        perKilometerSurcharge: String(formData.perKilometerSurcharge || '10'),
        minimumOrderCartAmount: String(formData.minimumOrderCartAmount || '200'),
        location: formData.location || DEFAULT_POLYGON,
        status: formData.status || 'active'
      };

      const res = await fetch(URLS.CreateZone, {
        method: 'POST',
        headers: {
          'authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSuccessMsg('New delivery zone created successfully!');
        setIsModalOpen(false);
        setFormData(INITIAL_FORM);
        await fetchZones();
      } else {
        throw new Error(data.message || 'Failed to create zone');
      }
    } catch (err) {
      console.error('Create zone error:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Save edited zone
  const handleSaveEditZone = async (e) => {
    e.preventDefault();
    if (!editingZone?._id) return;
    setActionLoading(true);
    try {
      const payload = {
        name: editingZone.name,
        priority: String(editingZone.priority || '1'),
        Suburbs: editingZone.Suburbs || '',
        operationalRadius: String(editingZone.operationalRadius || '10'),
        baseMinimumDeliveryFee: String(editingZone.baseMinimumDeliveryFee || '50'),
        perKilometerSurcharge: String(editingZone.perKilometerSurcharge || '10'),
        minimumOrderCartAmount: String(editingZone.minimumOrderCartAmount || '200'),
        location: editingZone.location || DEFAULT_POLYGON,
        status: editingZone.status || 'active'
      };

      const res = await fetch(URLS.UpdateZone + editingZone._id, {
        method: 'PUT',
        headers: {
          'authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSuccessMsg('Zone details updated successfully!');
        setEditingZone(null);
        await fetchZones();
      } else {
        throw new Error(data.message || 'Failed to update zone');
      }
    } catch (err) {
      console.error('Edit zone error:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete zone
  const handleDeleteZone = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name || 'this zone'}"?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(URLS.DeleteZone + id, {
        method: 'DELETE',
        headers: {
          'authorization': getAuthHeader()
        }
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSuccessMsg('Zone deleted successfully!');
        if (selectedZoneId === id) {
          setSelectedZoneId(null);
        }
        await fetchZones();
      } else {
        throw new Error(data.message || 'Failed to delete zone');
      }
    } catch (err) {
      console.error('Delete zone error:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Alert Banners */}
      {error && (
        <div style={{
          padding: '12px 18px',
          marginBottom: 18,
          borderRadius: 8,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13.5
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{
          padding: '12px 18px',
          marginBottom: 18,
          borderRadius: 8,
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#15803d',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13.5
        }}>
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-block">
          <h1>Delivery Zone Setup & Geofencing</h1>
          <p>Configure operational delivery perimeters, GPS polygons, minimum cart thresholds, and distance rates</p>
        </div>
        <div className="page-actions-block">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh zones from server"
          >
            <RefreshCw
              size={15}
              style={{
                animation: loading ? 'spin 0.8s linear infinite' : 'none',
                display: 'inline-block'
              }}
            />{' '}
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setMapModal({ open: true, zone: activeZone })}
            disabled={zones.length === 0}
          >
            <MapPin size={16} /> Edit Boundary Map
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setFormData(INITIAL_FORM);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Delivery Zone
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fff1f2', color: '#be123c' }}>
              <Layers size={22} />
            </div>
            <span className="metric-badge-trend trend-up">
              {zones.filter(z => z.status === 'active').length} Active
            </span>
          </div>
          <div>
            <div className="metric-val">{zones.length}</div>
            <div className="metric-title">Total Configured Zones</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Store size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Operational</span>
          </div>
          <div>
            <div className="metric-val">{zones.filter(z => z.status === 'active').length}</div>
            <div className="metric-title">Active Polygons Live</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <Bike size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Dynamic Fleet</span>
          </div>
          <div>
            <div className="metric-val">
              {zones.length > 0
                ? `${(zones.reduce((acc, z) => acc + Number(z.operationalRadius || 0), 0) / zones.length).toFixed(1)} km`
                : '0 km'}
            </div>
            <div className="metric-title">Avg Operational Radius</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
              <DollarSign size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Base Fee</span>
          </div>
          <div>
            <div className="metric-val">
              ₹{zones.length > 0 ? (zones.reduce((acc, z) => acc + Number(z.baseMinimumDeliveryFee || 0), 0) / zones.length).toFixed(0) : '0'}
            </div>
            <div className="metric-title">Avg Base Delivery Fee</div>
          </div>
        </div>
      </div>

      {/* Interactive Delivery Zone Google Map Card */}
      <div className="card-container" style={{ marginBottom: 26, background: '#0f172a', color: '#f8fafc', border: 'none', overflow: 'hidden' }}>
        <div style={{ padding: '24px 28px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
              <Navigation size={14} /> Google Maps Geofence Engine
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>Metropolitan Coverage Map</h3>
            {/* <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              Interactive GeoJSON polygons powered by Google Maps API. Click boundaries to inspect details or draw custom zones.
            </p> */}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.15)' }}
              onClick={() => setMapModal({ open: true, zone: activeZone })}
              disabled={zones.length === 0}
            >
              <MapPin size={15} /> Fullscreen Map Editor
            </button>
          </div>
        </div>

        {/* Zone Selector Pills */}
        {zones.length > 0 && (
          <div style={{
            display: 'flex',
            gap: 8,
            padding: '0 28px 18px',
            overflowX: 'auto',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            {zones.map((z) => {
              const isSelected = z._id === selectedZoneId;
              return (
                <button
                  key={z._id}
                  type="button"
                  onClick={() => setSelectedZoneId(z._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: isSelected ? '1px solid #be123c' : '1px solid rgba(255,255,255,0.12)',
                    background: isSelected ? 'rgba(190, 18, 60, 0.25)' : 'rgba(255,255,255,0.04)',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: z.status === 'active' ? '#10b981' : '#64748b'
                  }} />
                  <span>{z.name}</span>
                  <span style={{
                    fontSize: 11,
                    background: 'rgba(255,255,255,0.12)',
                    padding: '2px 6px',
                    borderRadius: 4
                  }}>
                    {z.operationalRadius || '10'} km
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Live Interactive Google Map */}
        <div style={{ padding: 12 }}>
          <ZoneMap
            zone={activeZone}
            allZones={zones}
            height={440}
            interactive={true}
            onSave={handleUpdateZoneBoundary}
          />
        </div>
      </div>

      {/* Zones Table */}
      <div className="card-container">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Configured Zones ({zones.length})</h3>
          {actionLoading && (
            <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} className="spinning-icon" /> Updating...
            </span>
          )}
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Zone Name</th>
                <th>Suburbs / Neighborhoods</th>
                <th>Priority</th>
                <th>Radius</th>
                <th>Base Fee</th>
                <th>Per KM Fee</th>
                <th>Min Cart</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    {loading ? 'Loading zones from server...' : 'No delivery zones found. Click "Add Delivery Zone" to create one.'}
                  </td>
                </tr>
              ) : (
                zones.map((zone) => (
                  <tr key={zone._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: zone.status === 'active' ? '#10b981' : '#dc2626',
                          flexShrink: 0
                        }} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{zone.name}</div>
                          {/* <div style={{ fontSize: 11, color: '#94a3b8' }}>ID: {zone._id}</div> */}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12.5, color: '#475569', maxWidth: 220 }}>
                        {zone.Suburbs || '—'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontWeight: 600 }}>
                        {zone.priority || '1'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontWeight: 600 }}>
                        {zone.operationalRadius || '10'} km
                      </span>
                    </td>
                    <td><strong>₹{zone.baseMinimumDeliveryFee || '0'}</strong></td>
                    <td><span style={{ color: '#0284c7', fontWeight: 600 }}>₹{zone.perKilometerSurcharge || '0'}/km</span></td>
                    <td>₹{zone.minimumOrderCartAmount || '0'}</td>
                    <td>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={zone.status === 'active'}
                          onChange={() => toggleZoneStatus(zone)}
                          disabled={actionLoading}
                        />
                        <span className="slider"></span>
                      </label>
                      <span style={{
                        marginLeft: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        color: zone.status === 'active' ? '#16a34a' : '#dc2626'
                      }}>
                        {zone.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          onClick={() => {
                            setSelectedZoneId(zone._id);
                            setMapModal({ open: true, zone });
                          }}
                          title="Edit Map Boundary"
                        >
                          <MapPin size={14} /> Map
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12, color: "#0984E3", borderColor: "#0984E3" }}
                          onClick={() => setEditingZone({ ...zone })}
                          title="Edit Zone Details"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12, color: '#dc2626', borderColor: '#dc2626' }}
                          onClick={() => handleDeleteZone(zone._id, zone.name)}
                          title="Delete Zone"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fullscreen Map Boundary Modal */}
      {mapModal.open && (
        <div className="modal-overlay" onClick={() => setMapModal({ open: false, zone: null })}>
          <div
            className="modal-dialog"
            style={{ maxWidth: 900, padding: 0, overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={20} color="#be123c" />
                <h3 style={{ margin: 0 }}>Configure Boundary & Geofence — {mapModal.zone?.name || activeZone?.name}</h3>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setMapModal({ open: false, zone: null })}
              >
                <X size={18} />
              </button>
            </div>

            <ZoneMap
              zone={mapModal.zone || activeZone}
              allZones={zones}
              height={500}
              interactive={true}
              onSave={async (updated) => {
                if (mapModal.isNewZone) {
                  setFormData(prev => ({ ...prev, location: updated.location }));
                  setSuccessMsg('Boundary successfully customized for new delivery zone!');
                  setMapModal({ open: false, zone: null });
                } else {
                  await handleUpdateZoneBoundary(updated);
                  setMapModal({ open: false, zone: null });
                }
              }}
              onClose={() => setMapModal({ open: false, zone: null })}
            />
          </div>
        </div>
      )}

      {/* Edit Zone Details Modal */}
      {editingZone && (
        <div className="modal-overlay" onClick={() => setEditingZone(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Delivery Zone — {editingZone.name}</h3>
              <button type="button" className="btn-icon" onClick={() => setEditingZone(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditZone}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label>Zone Name</label>
                  <input
                    type="text"
                    required
                    value={editingZone.name}
                    onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                    className="form-control-input"
                  />
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Priority</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={editingZone.priority || '1'}
                      onChange={(e) => setEditingZone({ ...editingZone, priority: e.target.value })}
                      className="form-control-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Operational Radius (KM)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={editingZone.operationalRadius || '10'}
                      onChange={(e) => setEditingZone({ ...editingZone, operationalRadius: e.target.value })}
                      className="form-control-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Coverage Neighborhoods / Suburbs (Google Places Multi-Search)</label>
                  <SuburbsAutocomplete
                    value={editingZone.Suburbs || ''}
                    onChange={(val) => setEditingZone(prev => ({ ...prev, Suburbs: val }))}
                    onAutoBoundaryGenerated={(poly) => setEditingZone(prev => ({ ...prev, location: poly }))}
                  />
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Base Minimum Delivery Fee (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingZone.baseMinimumDeliveryFee || '50'}
                      onChange={(e) => setEditingZone({ ...editingZone, baseMinimumDeliveryFee: e.target.value })}
                      className="form-control-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Per Kilometer Surcharge (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingZone.perKilometerSurcharge || '10'}
                      onChange={(e) => setEditingZone({ ...editingZone, perKilometerSurcharge: e.target.value })}
                      className="form-control-input"
                    />
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Minimum Order Cart Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={editingZone.minimumOrderCartAmount || '200'}
                      onChange={(e) => setEditingZone({ ...editingZone, minimumOrderCartAmount: e.target.value })}
                      className="form-control-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={editingZone.status || 'active'}
                      onChange={(e) => setEditingZone({ ...editingZone, status: e.target.value })}
                      className="form-control-input"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingZone(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Zone Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Delivery Zone</h3>
              <button type="button" className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateZone}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label>Zone Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hyderabad Zone"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control-input"
                  />
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Priority</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="form-control-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Operational Radius (KM)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.operationalRadius}
                      onChange={(e) => setFormData({ ...formData, operationalRadius: e.target.value })}
                      className="form-control-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Coverage Neighborhoods / Suburbs (Google Places Multi-Search)</label>
                  <SuburbsAutocomplete
                    value={formData.Suburbs || ''}
                    onChange={(val) => setFormData(prev => ({ ...prev, Suburbs: val }))}
                    onAutoBoundaryGenerated={(poly) => setFormData(prev => ({ ...prev, location: poly }))}
                  />
                </div>

                {/* Boundary Polygon Preview & Customize Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  gap: 12
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                      Delivery Boundary Geofence
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                      {formData.location?.coordinates?.[0]?.length
                        ? `✅ Polygon active (${formData.location.coordinates[0].length - 1} GPS vertices configured)`
                        : 'Auto-computes from selected suburbs, or draw manually'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: 12, flexShrink: 0 }}
                    onClick={() => setMapModal({
                      open: true,
                      zone: { name: formData.name || 'New Delivery Zone', location: formData.location },
                      isNewZone: true
                    })}
                  >
                    <Map size={14} /> Draw on Map
                  </button>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Base Minimum Delivery Fee (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="50"
                      value={formData.baseMinimumDeliveryFee}
                      onChange={(e) => setFormData({ ...formData, baseMinimumDeliveryFee: e.target.value })}
                      className="form-control-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Per Kilometer Surcharge (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="10"
                      value={formData.perKilometerSurcharge}
                      onChange={(e) => setFormData({ ...formData, perKilometerSurcharge: e.target.value })}
                      className="form-control-input"
                    />
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Minimum Order Cart Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="200"
                      value={formData.minimumOrderCartAmount}
                      onChange={(e) => setFormData({ ...formData, minimumOrderCartAmount: e.target.value })}
                      className="form-control-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="form-control-input"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Save Delivery Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

