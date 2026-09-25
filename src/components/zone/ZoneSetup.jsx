import React, { useState } from 'react';
import { MapPin, Plus, Navigation, Layers, DollarSign, Store, Bike, X, Check, Edit2, ShieldAlert } from 'lucide-react';
import { zonesData } from '../../data/mockData';
import ZoneMap from './ZoneMap';

export default function ZoneSetup() {
  const [zones, setZones] = useState(zonesData);
  const [selectedZoneId, setSelectedZoneId] = useState(zonesData[0]?.id || 'ZONE-01');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapModal, setMapModal] = useState({ open: false, zone: null });
  const [editingZone, setEditingZone] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    coverageArea: '',
    radiusKm: 6.0,
    minDeliveryCharge: '$3.50',
    perKmCharge: '$1.25',
    minOrderValue: '$15.00'
  });

  const activeZone = zones.find(z => z.id === selectedZoneId) || zones[0];

  const toggleZoneStatus = (id) => {
    setZones(zones.map(z => {
      if (z.id === id) {
        return { ...z, status: z.status === 'Active' ? 'Disabled' : 'Active' };
      }
      return z;
    }));
  };

  const handleUpdateZoneBoundary = ({ zoneId, center, radiusKm }) => {
    const targetId = zoneId || activeZone?.id;
    setZones(zones.map(z => z.id === targetId ? { ...z, center, radiusKm } : z));
  };

  const handleCreateZone = (e) => {
    e.preventDefault();
    const newZone = {
      id: `ZONE-0${zones.length + 1}`,
      name: formData.name,
      code: formData.code || `ZN-NEW-0${zones.length + 1}`,
      coverageArea: formData.coverageArea,
      radiusKm: Number(formData.radiusKm),
      center: [40.7128 + (zones.length * 0.02), -74.0060 - (zones.length * 0.02)],
      color: '#ec4899',
      minDeliveryCharge: formData.minDeliveryCharge.startsWith('$') ? formData.minDeliveryCharge : `$${formData.minDeliveryCharge}`,
      perKmCharge: formData.perKmCharge.startsWith('$') ? formData.perKmCharge : `$${formData.perKmCharge}`,
      minOrderValue: formData.minOrderValue.startsWith('$') ? formData.minOrderValue : `$${formData.minOrderValue}`,
      assignedRestaurants: 0,
      activeDrivers: 0,
      status: 'Active'
    };
    setZones([...zones, newZone]);
    setSelectedZoneId(newZone.id);
    setIsModalOpen(false);
    setFormData({
      name: '',
      code: '',
      coverageArea: '',
      radiusKm: 6.0,
      minDeliveryCharge: '$3.50',
      perKmCharge: '$1.25',
      minOrderValue: '$15.00'
    });
  };

  const handleSaveEditZone = (e) => {
    e.preventDefault();
    setZones(zones.map(z => z.id === editingZone.id ? editingZone : z));
    setEditingZone(null);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Delivery Zone Setup & Geofencing</h1>
          <p>Configure operational delivery perimeters, GPS polygons, minimum cart thresholds, and distance rates</p>
        </div>
        <div className="page-actions-block">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => setMapModal({ open: true, zone: activeZone })}
          >
            <MapPin size={16} /> Edit Boundary Map
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
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
            <span className="metric-badge-trend trend-up">All Operational</span>
          </div>
          <div>
            <div className="metric-val">{zones.filter(z => z.status === 'Active').length}</div>
            <div className="metric-title">Active Delivery Zones</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Store size={22} />
            </div>
            <span className="metric-badge-trend trend-up">+14 This Month</span>
          </div>
          <div>
            <div className="metric-val">204</div>
            <div className="metric-title">Bistros Geofenced</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <Bike size={22} />
            </div>
            <span className="metric-badge-trend trend-up">102 On Road</span>
          </div>
          <div>
            <div className="metric-val">102</div>
            <div className="metric-title">Active Couriers Deployed</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
              <DollarSign size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Avg $4.25</span>
          </div>
          <div>
            <div className="metric-val">$1.30/km</div>
            <div className="metric-title">Avg Distance Rate</div>
          </div>
        </div>
      </div>

      {/* Interactive Delivery Zone Geofencing & Polygon Map Card */}
      <div className="card-container" style={{ marginBottom: 26, background: '#0f172a', color: '#f8fafc', border: 'none', overflow: 'hidden' }}>
        <div style={{ padding: '24px 28px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
              <Navigation size={14} /> Interactive Geofence Map
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>Metropolitan Coverage Map</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              Drag markers or use the radius slider to adjust delivery boundaries. All zones are mapped in real-time.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.15)' }}
              onClick={() => setMapModal({ open: true, zone: activeZone })}
            >
              <MapPin size={15} /> Fullscreen Map Editor
            </button>
          </div>
        </div>

        {/* Zone Selector Pills */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '0 28px 18px',
          overflowX: 'auto',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          {zones.map((z) => {
            const isSelected = z.id === selectedZoneId;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => setSelectedZoneId(z.id)}
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
                  background: z.color || '#be123c'
                }} />
                <span>{z.name.split('-')[0]}</span>
                <span style={{
                  fontSize: 11,
                  background: 'rgba(255,255,255,0.12)',
                  padding: '2px 6px',
                  borderRadius: 4
                }}>
                  {z.radiusKm} km
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Interactive Leaflet Map */}
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
        <div className="card-header">
          <h3>Configured Zones ({zones.length})</h3>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Zone ID & Name</th>
                <th>Coverage Neighborhoods</th>
                <th>Radius</th>
                <th>Min Delivery</th>
                <th>Per KM Fee</th>
                <th>Min Cart</th>
                <th>Merchants</th>
                <th>Couriers</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr key={zone.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: zone.color || '#be123c',
                        flexShrink: 0
                      }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{zone.name}</div>
                        <div style={{ fontSize: 11.5, color: '#64748b' }}>{zone.code}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5, color: '#475569', maxWidth: 220 }}>
                      {zone.coverageArea}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontWeight: 600 }}>
                      {zone.radiusKm} km
                    </span>
                  </td>
                  <td><strong>{zone.minDeliveryCharge}</strong></td>
                  <td><span style={{ color: '#0284c7', fontWeight: 600 }}>{zone.perKmCharge}</span></td>
                  <td>{zone.minOrderValue}</td>
                  <td>
                    <span className="badge badge-success">{zone.assignedRestaurants} Bistros</span>
                  </td>
                  <td>
                    <span className="badge badge-warning">{zone.activeDrivers} Riders</span>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={zone.status === 'Active'}
                        onChange={() => toggleZoneStatus(zone.id)}
                      />
                      <span className="slider"></span>
                    </label>
                    <span style={{ 
                      marginLeft: 8, 
                      fontSize: 12, 
                      fontWeight: 600, 
                      color: zone.status === 'Active' ? '#16a34a' : '#dc2626' 
                    }}>
                      {zone.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: 12 }}
                        onClick={() => {
                          setSelectedZoneId(zone.id);
                          setMapModal({ open: true, zone });
                        }}
                        title="Edit Map Geofence"
                      >
                        <MapPin size={14} /> Map
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: 12 }}
                        onClick={() => setEditingZone({ ...zone })}
                        title="Edit Zone Details"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Map Boundary Modal */}
      {mapModal.open && (
        <div className="modal-overlay" onClick={() => setMapModal({ open: false, zone: null })}>
          <div 
            className="modal-dialog" 
            style={{ maxWidth: 840, padding: 0, overflow: 'hidden' }} 
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
              onSave={(updated) => {
                handleUpdateZoneBoundary(updated);
                setMapModal({ open: false, zone: null });
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
                  <label>Zone Title</label>
                  <input
                    type="text"
                    required
                    value={editingZone.name}
                    onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                    className="form-control-input"
                  />
                </div>

                <div className="form-group">
                  <label>Coverage Neighborhoods / Suburbs</label>
                  <input
                    type="text"
                    required
                    value={editingZone.coverageArea}
                    onChange={(e) => setEditingZone({ ...editingZone, coverageArea: e.target.value })}
                    className="form-control-input"
                  />
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Operational Radius (KM)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={editingZone.radiusKm}
                      onChange={(e) => setEditingZone({ ...editingZone, radiusKm: Number(e.target.value) })}
                      className="form-control-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Base Minimum Delivery Fee</label>
                    <input
                      type="text"
                      required
                      value={editingZone.minDeliveryCharge}
                      onChange={(e) => setEditingZone({ ...editingZone, minDeliveryCharge: e.target.value })}
                      className="form-control-input"
                    />
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Per Kilometer Surcharge</label>
                    <input
                      type="text"
                      required
                      value={editingZone.perKmCharge}
                      onChange={(e) => setEditingZone({ ...editingZone, perKmCharge: e.target.value })}
                      className="form-control-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Minimum Order Cart Amount</label>
                    <input
                      type="text"
                      required
                      value={editingZone.minOrderValue}
                      onChange={(e) => setEditingZone({ ...editingZone, minOrderValue: e.target.value })}
                      className="form-control-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingZone(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
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
                  <label>Zone Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zone 5 - Queens Central & Astoria"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control-input"
                  />
                </div>

                <div className="form-group">
                  <label>Coverage Neighborhoods / Suburbs</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Astoria, Long Island City, Sunnyside"
                    value={formData.coverageArea}
                    onChange={(e) => setFormData({ ...formData, coverageArea: e.target.value })}
                    className="form-control-input"
                  />
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Operational Radius (KM)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.radiusKm}
                      onChange={(e) => setFormData({ ...formData, radiusKm: e.target.value })}
                      className="form-control-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Base Minimum Delivery Fee</label>
                    <input
                      type="text"
                      required
                      placeholder="$3.50"
                      value={formData.minDeliveryCharge}
                      onChange={(e) => setFormData({ ...formData, minDeliveryCharge: e.target.value })}
                      className="form-control-input"
                    />
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Per Kilometer Surcharge</label>
                    <input
                      type="text"
                      required
                      placeholder="$1.25"
                      value={formData.perKmCharge}
                      onChange={(e) => setFormData({ ...formData, perKmCharge: e.target.value })}
                      className="form-control-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Minimum Order Cart Amount</label>
                    <input
                      type="text"
                      required
                      placeholder="$15.00"
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                      className="form-control-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Delivery Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
