import React, { useState } from 'react';
import { 
  Utensils, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Flame, 
  Check, 
  AlertCircle, 
  Layers, 
  Store 
} from 'lucide-react';
import CreateCuisineModal from './CreateCuisineModal';
import EditCuisineModal from './EditCuisineModal';

const initialCuisines = [
  {
    id: "CUIS-001",
    name: "Italian & Neapolitan",
    description: "Woodfired sourdough pizzas, fresh handcrafted pasta, and Tuscan wines",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
    priority: 1,
    totalRestaurants: 18,
    totalFoods: 94,
    isPopular: true,
    status: "Active"
  },
  {
    id: "CUIS-002",
    name: "Japanese & Sushi",
    description: "Omakase nigiri, ramen broths, robata skewers, and tempura delicacies",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80",
    priority: 2,
    totalRestaurants: 14,
    totalFoods: 72,
    isPopular: true,
    status: "Active"
  },
  {
    id: "CUIS-003",
    name: "North Indian & Mughlai",
    description: "Clay oven tandoor bread, aromatic rich gravies, biryanis, and kebabs",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=80",
    priority: 3,
    totalRestaurants: 22,
    totalFoods: 135,
    isPopular: true,
    status: "Active"
  },
  {
    id: "CUIS-004",
    name: "French Fine Dining",
    description: "Artisanal bakery pastries, butter confits, and Parisian gourmet entrées",
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=500&auto=format&fit=crop&q=80",
    priority: 4,
    totalRestaurants: 9,
    totalFoods: 48,
    isPopular: false,
    status: "Active"
  },
  {
    id: "CUIS-005",
    name: "Mexican Cantina",
    description: "Corn street tacos, guacamole, fajitas, enchiladas, and habanero salsas",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80",
    priority: 5,
    totalRestaurants: 12,
    totalFoods: 66,
    isPopular: true,
    status: "Active"
  },
  {
    id: "CUIS-006",
    name: "Mediterranean & Greek",
    description: "Hummus, grilled skewers, falafel platters, tzatziki, and olive salads",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80",
    priority: 6,
    totalRestaurants: 8,
    totalFoods: 42,
    isPopular: false,
    status: "Active"
  }
];

export default function Cuisines() {
  const [cuisines, setCuisines] = useState(initialCuisines);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCuisine, setEditingCuisine] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddCuisine = (newCuisine) => {
    const created = {
      ...newCuisine,
      id: `CUIS-00${cuisines.length + 1}`
    };
    setCuisines([created, ...cuisines]);
    showToast(`Cuisine "${created.name}" created successfully!`);
  };

  const handleSaveEditCuisine = (updated) => {
    setCuisines(cuisines.map(c => c.id === updated.id ? updated : c));
    setEditingCuisine(null);
    showToast(`Cuisine "${updated.name}" updated successfully!`);
  };

  const handleDeleteCuisine = (cuisine) => {
    if (!window.confirm(`Delete cuisine "${cuisine.name}"? This action cannot be undone.`)) return;
    setCuisines(cuisines.filter(c => c.id !== cuisine.id));
    showToast(`Cuisine "${cuisine.name}" removed.`);
  };

  const toggleStatus = (id) => {
    setCuisines(cuisines.map(c => {
      if (c.id === id) {
        const next = c.status === 'Active' ? 'Inactive' : 'Active';
        return { ...c, status: next };
      }
      return c;
    }));
  };

  const filtered = cuisines.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalActive = cuisines.filter(c => c.status === 'Active').length;
  const totalPopular = cuisines.filter(c => c.isPopular).length;
  const totalRestaurantsRepresented = cuisines.reduce((acc, curr) => acc + (curr.totalRestaurants || 0), 0);

  return (
    <div>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          padding: '12px 18px', marginBottom: 18, borderRadius: 8,
          background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5
        }}>
          <Check size={18} /><span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-block">
          <h1>Cuisine Management &amp; Specialties</h1>
          <p>Organize restaurant classifications by cultural culinary traditions, flavors, and trending cuisines</p>
        </div>
        <div className="page-actions-block">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={16} /> Add New Cuisine
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fff1f2', color: '#be123c' }}>
              <Utensils size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Catalog</span>
          </div>
          <div>
            <div className="metric-val">{cuisines.length}</div>
            <div className="metric-title">Total Registered Cuisines</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <Check size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Active</span>
          </div>
          <div>
            <div className="metric-val">{totalActive}</div>
            <div className="metric-title">Live Active Cuisines</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fff7ed', color: '#ea580c' }}>
              <Flame size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Trending</span>
          </div>
          <div>
            <div className="metric-val">{totalPopular}</div>
            <div className="metric-title">Customer Favorites</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <Store size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Merchants</span>
          </div>
          <div>
            <div className="metric-val">{totalRestaurantsRepresented}</div>
            <div className="metric-title">Restaurant Connections</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-container">
        <div className="card-header">
          <div>
            <h3>All Registered Cuisines ({filtered.length})</h3>
          </div>
          <div className="card-header-actions">
            <div style={{ display: 'flex', gap: 8 }}>
              {['All', 'Active', 'Inactive'].map(st => (
                <button
                  key={st}
                  type="button"
                  className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: 12.5 }}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>
            <div className="topbar-search-box" style={{ width: 280, padding: '6px 12px' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search cuisine name or notes..."
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
                <th>Cuisine &amp; Cover</th>
                <th>Culinary Flavor Notes</th>
                <th>Priority</th>
                <th>Bistros</th>
                <th>Dishes</th>
                <th>Trending Badge</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: 36, color: '#64748b' }}>
                    No cuisines found matching your query.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-entity-cell">
                        <img src={item.image} alt={item.name} className="entity-thumb" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                        <div className="entity-info">
                          <h5 style={{ margin: 0, fontSize: 14 }}>{item.name}</h5>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{item.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12.5, color: '#475569', maxWidth: 280, lineHeight: 1.4 }}>
                        {item.description}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-accepted" style={{ fontWeight: 700 }}>
                        Rank #{item.priority}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>
                        {item.totalRestaurants} bistros
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: '#64748b' }}>
                        {item.totalFoods} items
                      </span>
                    </td>
                    <td>
                      {item.isPopular ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11.5, fontWeight: 700, color: '#ea580c',
                          background: '#fff7ed', border: '1px solid #ffedd5',
                          padding: '3px 8px', borderRadius: 20
                        }}>
                          <Flame size={12} /> Popular
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Standard</span>
                      )}
                    </td>
                    <td>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={item.status === 'Active'}
                          onChange={() => toggleStatus(item.id)}
                        />
                        <span className="slider"></span>
                      </label>
                      <span style={{
                        marginLeft: 8, fontSize: 12, fontWeight: 600,
                        color: item.status === 'Active' ? '#16a34a' : '#94a3b8'
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12, color: '#0284c7', borderColor: '#0284c7' }}
                          onClick={() => setEditingCuisine(item)}
                          title="Edit Cuisine"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12, color: '#dc2626', borderColor: '#dc2626' }}
                          onClick={() => handleDeleteCuisine(item)}
                          title="Delete Cuisine"
                        >
                          <Trash2 size={13} /> Delete
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

      {/* Create Cuisine Modal */}
      <CreateCuisineModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAdd={handleAddCuisine}
      />

      {/* Edit Cuisine Modal */}
      <EditCuisineModal
        cuisine={editingCuisine}
        isOpen={Boolean(editingCuisine)}
        onClose={() => setEditingCuisine(null)}
        onSave={handleSaveEditCuisine}
      />
    </div>
  );
}
