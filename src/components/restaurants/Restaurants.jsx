import React, { useState } from 'react';
import { Store, Plus, Search, Star, Edit2 } from 'lucide-react';
import { restaurantsData } from '../../data/mockData';
import EditRestaurantModal from './EditRestaurantModal';
import AddRestaurantModal from './AddRestaurantModal';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState(restaurantsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);

  const toggleOpenStatus = (id) => {
    setRestaurants(restaurants.map(r => {
      if (r.id === id) {
        return { ...r, isOpen: !r.isOpen };
      }
      return r;
    }));
  };

  const handleAddRestaurant = (newRest) => {
    const created = {
      ...newRest,
      id: `REST-00${restaurants.length + 1}`
    };
    setRestaurants([created, ...restaurants]);
  };

  const handleSaveEditRestaurant = (updatedRest) => {
    setRestaurants(restaurants.map(r => r.id === updatedRest.id ? updatedRest : r));
    setEditingRestaurant(null);
  };

  const filtered = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Restaurant Merchant Directory</h1>
          <p>Manage culinary partners, merchant commissions, operating hours, and storefront approvals</p>
        </div>
        <div className="page-actions-block">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} /> Add New Restaurant
          </button>
        </div>
      </div>

      <div className="card-container">
        <div className="card-header">
          <div>
            <h3>All Partner Bistros ({filtered.length})</h3>
          </div>
          <div className="card-header-actions">
            <div className="topbar-search-box" style={{ width: 280, padding: '6px 12px' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search restaurant or cuisine..."
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
                <th>Restaurant Details</th>
                <th>Assigned Zone</th>
                <th>Commission</th>
                <th>Performance</th>
                <th>Total Earnings</th>
                <th>Kitchen Open</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rest) => (
                <tr key={rest.id}>
                  <td>
                    <div className="table-entity-cell">
                      <img src={rest.image} alt={rest.name} className="entity-thumb" />
                      <div className="entity-info">
                        <h5>{rest.name}</h5>
                        <p>{rest.cuisine}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>
                      {rest.zone}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-accepted" style={{ fontWeight: 700 }}>
                      {rest.commissionRate}% Commission
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: '#d97706' }}>
                      <Star size={14} fill="#d97706" color="#d97706" /> {rest.rating}
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>({rest.reviews})</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>{rest.totalOrders} total orders</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{rest.totalEarnings}</span>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={rest.isOpen}
                        onChange={() => toggleOpenStatus(rest.id)}
                      />
                      <span className="slider"></span>
                    </label>
                    <span style={{ 
                      marginLeft: 8, 
                      fontSize: 12, 
                      fontWeight: 600, 
                      color: rest.isOpen ? '#16a34a' : '#94a3b8' 
                    }}>
                      {rest.isOpen ? 'Accepting' : 'Closed'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${rest.status === 'Active' ? 'badge-delivered' : 'badge-pending'}`}>
                      {rest.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: 12 }}
                      onClick={() => setEditingRestaurant(rest)}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Restaurant Modal - Separate Component */}
      <EditRestaurantModal
        restaurant={editingRestaurant}
        isOpen={Boolean(editingRestaurant)}
        onClose={() => setEditingRestaurant(null)}
        onSave={handleSaveEditRestaurant}
      />

      {/* Add Restaurant Modal - Separate Component */}
      <AddRestaurantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddRestaurant}
      />
    </div>
  );
}
