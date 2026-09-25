import React, { useState } from 'react';
import { Bike, Search, Star, Phone, Battery, CheckCircle, Navigation, MapPin, AlertTriangle } from 'lucide-react';
import { deliveryFleetData } from '../../data/mockData';

export default function DeliveryManagement() {
  const [fleet, setFleet] = useState(deliveryFleetData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = fleet.filter(d => {
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Delivery Courier Fleet Management</h1>
          <p>Real-time delivery driver monitoring, vehicle status, active routes, and performance ratings</p>
        </div>
        <div className="page-actions-block">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => alert("Initiating broadcast ping to all available couriers...")}
          >
            <Navigation size={15} /> Ping Available Fleet
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
            <span className="metric-badge-trend trend-up">Active Shift</span>
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
            <span className="metric-badge-trend trend-up">60% Active</span>
          </div>
          <div>
            <div className="metric-val">{fleet.filter(f => f.status === 'On Delivery').length}</div>
            <div className="metric-title">Couriers En Route</div>
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
            <div className="metric-val">{fleet.filter(f => f.status === 'Available').length}</div>
            <div className="metric-title">Idle / Available Couriers</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
              <Star size={22} />
            </div>
            <span className="metric-badge-trend trend-up">High SLA</span>
          </div>
          <div>
            <div className="metric-val">4.90 ★</div>
            <div className="metric-title">Average Fleet Rating</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card-container" style={{ marginBottom: 20 }}>
        <div className="toolbar-tabs" style={{ padding: '8px 16px' }}>
          {['All', 'On Delivery', 'Available', 'Offline'].map((st) => (
            <button
              key={st}
              type="button"
              className={`toolbar-tab-item ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st} ({st === 'All' ? fleet.length : fleet.filter(f => f.status === st).length})
            </button>
          ))}
        </div>
      </div>

      <div className="card-container">
        <div className="card-header">
          <div>
            <h3>Active Courier Fleet ({filtered.length})</h3>
          </div>
          <div className="card-header-actions">
            <div className="topbar-search-box" style={{ width: 260, padding: '6px 12px' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search driver, vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Courier Partner</th>
                <th>Vehicle & Plate</th>
                <th>Assigned Zone</th>
                <th>Today's Earnings</th>
                <th>Battery / Fuel</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'center' }}>Live Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((driver) => (
                <tr key={driver.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{driver.name}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={11} /> {driver.phone}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{driver.vehicle}</div>
                    <span style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#475569' }}>
                      {driver.plateNo}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: '#475569' }}>{driver.zone}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{driver.earningsToday}</span>
                    <div style={{ fontSize: 11, color: '#16a34a' }}>{driver.completedOrders} total trips</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700 }}>
                      <Battery size={15} color="#16a34a" /> {driver.batteryOrFuel}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      driver.status === 'On Delivery' ? 'badge-ontheway' :
                      driver.status === 'Available' ? 'badge-delivered' : 'badge-offline'
                    }`}>
                      {driver.status}
                    </span>
                    {driver.currentOrder && (
                      <div style={{ fontSize: 11, color: '#be123c', fontWeight: 600, marginTop: 2 }}>
                        Order #{driver.currentOrder}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '5px 10px', fontSize: 12 }}
                      onClick={() => alert(`Locating live GPS coordinates for ${driver.name}`)}
                    >
                      <MapPin size={13} /> Track GPS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
