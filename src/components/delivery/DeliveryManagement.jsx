import React, { useState } from 'react';
import { 
  Bike, 
  Search, 
  Star, 
  Phone, 
  Battery, 
  CheckCircle, 
  Navigation, 
  MapPin, 
  AlertTriangle,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Radio,
  FileSpreadsheet,
  Grid,
  List,
  Car,
  ShieldCheck,
  Compass,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { deliveryFleetData } from '../../data/mockData';
import AddDeliveryManModal from './AddDeliveryManModal';
import EditDeliveryManModal from './EditDeliveryManModal';
import DeliveryManDetailsModal from './DeliveryManDetailsModal';

export default function DeliveryManagement() {
  const [fleet, setFleet] = useState(deliveryFleetData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [viewingDriver, setViewingDriver] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Handlers
  const handleAddDriver = (newDriver) => {
    setFleet(prev => [newDriver, ...prev]);
    showToast(`Courier "${newDriver.name}" registered successfully!`);
  };

  const handleSaveEditDriver = (updatedDriver) => {
    setFleet(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
    setEditingDriver(null);
    showToast(`Courier "${updatedDriver.name}" updated successfully!`);
  };

  const handleDeleteDriver = (driver) => {
    if (!window.confirm(`Deactivate & remove courier partner "${driver.name}" (${driver.id})?`)) return;
    setFleet(prev => prev.filter(d => d.id !== driver.id));
    showToast(`Courier "${driver.name}" removed from active fleet.`);
  };

  const handleToggleStatus = (driver) => {
    const nextStatus = driver.status === 'Available' ? 'Offline' : 'Available';
    setFleet(prev => prev.map(d => d.id === driver.id ? { ...d, status: nextStatus } : d));
    showToast(`Courier "${driver.name}" status changed to ${nextStatus}.`);
  };

  const handleSettleCash = (driver) => {
    setFleet(prev => prev.map(d => d.id === driver.id ? { ...d, cashInHand: '$0.00' } : d));
    if (viewingDriver && viewingDriver.id === driver.id) {
      setViewingDriver(prev => ({ ...prev, cashInHand: '$0.00' }));
    }
    showToast(`Cash in hand for ${driver.name} settled and credited to system balance.`);
  };

  const handleBroadcastPing = () => {
    const availableCount = fleet.filter(f => f.status === 'Available').length;
    showToast(`Broadcast dispatch ping sent to ${availableCount} available couriers across all active zones!`);
  };

  const handleExportRoster = () => {
    showToast(`Fleet roster with ${fleet.length} active courier partners exported.`);
  };

  // Filtering
  const filtered = fleet.filter(d => {
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesVehicle = vehicleFilter === 'All' || (d.vehicle || '').toLowerCase().includes(vehicleFilter.toLowerCase());
    const matchesZone = zoneFilter === 'All' || (d.zone || '').toLowerCase().includes(zoneFilter.toLowerCase());
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      (d.name || '').toLowerCase().includes(query) ||
      (d.phone || '').toLowerCase().includes(query) ||
      (d.plateNo || '').toLowerCase().includes(query) ||
      (d.id || '').toLowerCase().includes(query) ||
      (d.vehicle || '').toLowerCase().includes(query);

    return matchesStatus && matchesVehicle && matchesZone && matchesSearch;
  });

  const totalActive = fleet.filter(f => f.status === 'Available').length;
  const totalOnDelivery = fleet.filter(f => f.status === 'On Delivery').length;
  const totalOffline = fleet.filter(f => f.status === 'Offline').length;

  return (
    <div>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          padding: '12px 18px', marginBottom: 18, borderRadius: 8,
          background: toastType === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${toastType === 'error' ? '#fecaca' : '#bbf7d0'}`,
          color: toastType === 'error' ? '#dc2626' : '#15803d',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5
        }}>
          {toastType === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-block">
          <h1>Delivery Courier Fleet &amp; Personnel</h1>
          <p>Real-time delivery driver monitoring, vehicle status, active routes, and performance ratings</p>
        </div>
        <div className="page-actions-block" style={{ display: 'flex', gap: 8 }}>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleBroadcastPing}
            title="Broadcast Ping"
          >
            <Radio size={15} color="#0284c7" /> Ping Fleet
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleExportRoster}
            title="Export Roster"
          >
            <FileSpreadsheet size={15} /> Export
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus size={16} /> Add Delivery Man
          </button>
        </div>
      </div>

      {/* Fleet KPI Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fff1f2', color: '#be123c' }}>
              <Bike size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Fleet Size</span>
          </div>
          <div>
            <div className="metric-val">{fleet.length}</div>
            <div className="metric-title">Registered Fleet Couriers</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#eff6ff', color: '#0284c7' }}>
              <Navigation size={22} />
            </div>
            <span className="metric-badge-trend trend-up">
              {fleet.length ? Math.round((totalOnDelivery / fleet.length) * 100) : 0}% Active
            </span>
          </div>
          <div>
            <div className="metric-val">{totalOnDelivery}</div>
            <div className="metric-title">Couriers En Route (Trips)</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Instant Dispatch</span>
          </div>
          <div>
            <div className="metric-val">{totalActive}</div>
            <div className="metric-title">Idle / Available Couriers</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
              <Star size={22} fill="#b45309" />
            </div>
            <span className="metric-badge-trend trend-up">High SLA</span>
          </div>
          <div>
            <div className="metric-val">4.90 ★</div>
            <div className="metric-title">Average Fleet Rating</div>
          </div>
        </div>
      </div>

      {/* Main Filter & Action Container */}
      <div className="card-container">
        
        {/* Status Filter Tabs */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0', padding: '12px 20px', flexWrap: 'wrap', gap: 12
        }}>
          <div className="toolbar-tabs" style={{ margin: 0, padding: 0 }}>
            {[
              { id: 'All', label: `All (${fleet.length})` },
              { id: 'Available', label: `Available (${totalActive})` },
              { id: 'On Delivery', label: `On Delivery (${totalOnDelivery})` },
              { id: 'Offline', label: `Offline (${totalOffline})` },
              { id: 'Suspended', label: `Suspended (${fleet.filter(f => f.status === 'Suspended').length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`toolbar-tab-item ${statusFilter === tab.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 8 }}>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                border: 'none', padding: '5px 10px', borderRadius: 6,
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: viewMode === 'table' ? '#0f172a' : '#64748b',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer'
              }}
            >
              <List size={14} /> Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                border: 'none', padding: '5px 10px', borderRadius: 6,
                background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: viewMode === 'grid' ? '#0f172a' : '#64748b',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer'
              }}
            >
              <Grid size={14} /> Driver Cards
            </button>
          </div>
        </div>

        {/* Filter Dropdowns & Search */}
        <div className="card-header" style={{ background: '#f8fafc', padding: '12px 20px' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="form-control-input"
              style={{ width: 'auto', padding: '6px 12px', fontSize: 12.5 }}
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
            >
              <option value="All">All Vehicle Types</option>
              <option value="Scooter">Scooter / Moped</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Car">Car</option>
              <option value="Bike">Bicycle / E-Bike</option>
            </select>

            <select
              className="form-control-input"
              style={{ width: 'auto', padding: '6px 12px', fontSize: 12.5 }}
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
            >
              <option value="All">All Service Zones</option>
              <option value="Zone 1">Zone 1 - Downtown Core</option>
              <option value="Zone 2">Zone 2 - West District</option>
              <option value="Zone 3">Zone 3 - Midtown Central</option>
              <option value="Zone 4">Zone 4 - Brooklyn North</option>
            </select>
          </div>

          <div className="card-header-actions">
            <div className="topbar-search-box" style={{ width: 280, padding: '6px 12px' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search driver, phone, plate #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* VIEW 1: TABLE VIEW */}
        {viewMode === 'table' ? (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Driver ID</th>
                  <th>Courier Partner</th>
                  <th>Vehicle &amp; Plate</th>
                  <th>Assigned Zone</th>
                  <th style={{ width: 110 }}>Rating</th>
                  <th>Trip Metrics</th>
                  <th>Battery / Fuel</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: 36, color: '#64748b' }}>
                      No delivery couriers found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((driver) => {
                    const isAvailable = driver.status === 'Available';
                    return (
                      <tr key={driver.id}>
                        <td>
                          <span style={{
                            fontSize: 12, fontWeight: 700, padding: '4px 8px', borderRadius: 6,
                            background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0',
                            letterSpacing: '0.02em', display: 'inline-block'
                          }}>
                            {driver.id}
                          </span>
                        </td>

                        <td>
                          <div className="table-entity-cell">
                            <div style={{
                              width: 44, height: 44, borderRadius: 10,
                              background: '#f1f5f9', overflow: 'hidden',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              {driver.image ? (
                                <img src={driver.image} alt={driver.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <Bike size={20} color="#0284c7" />
                              )}
                            </div>
                            <div className="entity-info">
                              <h5 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                                {driver.name}
                              </h5>
                              <div style={{ fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Phone size={11} /> {driver.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{driver.vehicle}</div>
                          <span style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#475569', fontWeight: 600 }}>
                            {driver.plateNo}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: 12.5, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} color="#ea580c" />
                            {driver.zone}
                          </span>
                        </td>

                        <td>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '3px 8px', borderRadius: 20,
                            background: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: 12
                          }}>
                            <Star size={12} fill="#b45309" color="#b45309" />
                            <span>{driver.rating || '4.90'}</span>
                          </div>
                          <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 3 }}>
                            {driver.completedOrders || 0} reviews
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{driver.earningsToday}</div>
                          <div style={{ fontSize: 11, color: '#16a34a' }}>
                            {driver.completedOrders} total trips
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#059669' }}>
                            <Battery size={15} /> {driver.batteryOrFuel}
                          </div>
                          {driver.cashInHand && (
                            <div style={{ fontSize: 10.5, color: '#be123c', fontWeight: 600, marginTop: 2 }}>
                              Cash: {driver.cashInHand}
                            </div>
                          )}
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={isAvailable}
                                disabled={driver.status === 'On Delivery'}
                                onChange={() => handleToggleStatus(driver)}
                              />
                              <span className="slider"></span>
                            </label>
                            <span className={`badge ${
                              driver.status === 'On Delivery' ? 'badge-ontheway' :
                              driver.status === 'Available' ? 'badge-delivered' : 'badge-offline'
                            }`}>
                              {driver.status}
                            </span>
                          </div>
                          {driver.currentOrder && (
                            <div style={{ fontSize: 11, color: '#be123c', fontWeight: 700, marginTop: 4 }}>
                              Trip: #{driver.currentOrder}
                            </div>
                          )}
                        </td>

                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '5px 8px', fontSize: 12 }}
                              onClick={() => setViewingDriver(driver)}
                              title="View Full Profile & Analytics"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '5px 8px', fontSize: 12, color: '#0284c7', borderColor: '#0284c7' }}
                              onClick={() => setEditingDriver(driver)}
                              title="Edit Courier Partner"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '5px 8px', fontSize: 12, color: '#dc2626', borderColor: '#dc2626' }}
                              onClick={() => handleDeleteDriver(driver)}
                              title="Remove Courier"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* VIEW 2: DRIVER CARDS GRID VIEW */
          <div style={{ padding: 20 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
                No delivery couriers found matching your filters.
              </div>
            ) : (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16
              }}>
                {filtered.map((driver) => {
                  const isAvailable = driver.status === 'Available';
                  return (
                    <div 
                      key={driver.id} 
                      style={{
                        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12,
                        padding: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        transition: 'all 0.2s ease', position: 'relative'
                      }}
                    >
                      {/* Top Header in Card */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{
                              width: 50, height: 50, borderRadius: 12, background: '#f1f5f9',
                              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {driver.image ? (
                                <img src={driver.image} alt={driver.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <Bike size={24} color="#0284c7" />
                              )}
                            </div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                                {driver.name}
                              </h4>
                              <span style={{ fontSize: 11.5, color: '#64748b' }}>{driver.id}</span>
                            </div>
                          </div>

                          <span className={`badge ${
                            driver.status === 'On Delivery' ? 'badge-ontheway' :
                            driver.status === 'Available' ? 'badge-delivered' : 'badge-offline'
                          }`}>
                            {driver.status}
                          </span>
                        </div>

                        {/* Vehicle and Plate */}
                        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, marginBottom: 12, fontSize: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1e293b', fontWeight: 600 }}>
                            <span>{driver.vehicle}</span>
                            <span style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>
                              {driver.plateNo}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: 6, fontSize: 11.5 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={11} color="#ea580c" /> {driver.zone}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a', fontWeight: 700 }}>
                              <Battery size={13} /> {driver.batteryOrFuel}
                            </span>
                          </div>
                        </div>

                        {/* Order & Earnings Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, textAlign: 'center', marginBottom: 14 }}>
                          <div style={{ background: '#fafafa', padding: 8, borderRadius: 6, border: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: 11, color: '#64748b' }}>Today's Trips</span>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>{driver.completedOrders}</div>
                          </div>
                          <div style={{ background: '#fafafa', padding: 8, borderRadius: 6, border: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: 11, color: '#64748b' }}>Rating</span>
                            <div style={{ fontWeight: 800, color: '#b45309', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                              <Star size={12} fill="#b45309" /> {driver.rating}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Bottom Actions */}
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={isAvailable}
                              disabled={driver.status === 'On Delivery'}
                              onChange={() => handleToggleStatus(driver)}
                            />
                            <span className="slider"></span>
                          </label>
                          <span style={{ fontSize: 11.5, color: '#64748b' }}>
                            {isAvailable ? 'Available' : 'Offline'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '5px 8px', fontSize: 12 }}
                            onClick={() => setViewingDriver(driver)}
                            title="Profile & Trips"
                          >
                            <Eye size={13} /> Details
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '5px 8px', fontSize: 12, color: '#0284c7', borderColor: '#0284c7' }}
                            onClick={() => setEditingDriver(driver)}
                            title="Edit Driver"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Delivery Man Modal */}
      <AddDeliveryManModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddDriver}
      />

      {/* Edit Delivery Man Modal */}
      <EditDeliveryManModal
        driver={editingDriver}
        isOpen={Boolean(editingDriver)}
        onClose={() => setEditingDriver(null)}
        onSave={handleSaveEditDriver}
      />

      {/* Details & Live GPS Modal */}
      <DeliveryManDetailsModal
        driver={viewingDriver}
        isOpen={Boolean(viewingDriver)}
        onClose={() => setViewingDriver(null)}
        onSettleCash={handleSettleCash}
        onTrackGPS={(d) => alert(`Locating live GPS coordinates for ${d.name} (${d.plateNo}) in ${d.zone}`)}
      />
    </div>
  );
}
