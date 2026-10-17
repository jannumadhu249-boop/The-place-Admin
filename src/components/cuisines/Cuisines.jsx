import React, { useState, useEffect, useCallback } from 'react';
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
  Store,
  Loader2,
  RefreshCw
} from 'lucide-react';
import CreateCuisineModal from './CreateCuisineModal';
import EditCuisineModal from './EditCuisineModal';
import { URLS } from '../../url';

export default function Cuisines() {
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCuisine, setEditingCuisine] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

  const getAuthHeader = () => {
    const token =
      localStorage.getItem('admin_token') ||
      sessionStorage.getItem('admin_token') ||
      localStorage.getItem('token') ||
      FALLBACK_TOKEN;
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  };

  const getImageUrl = (img) => {
    if (!img || typeof img !== 'string' || img.trim() === '') return null;
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
      return img;
    }
    const base = (URLS.ImageUrl || '').replace(/\/+$/, '');
    const cleanPath = img.replace(/^\/+/, '').replace(/\\/g, '/');
    return `${base}/${cleanPath}`;
  };

  const isCuisineActive = (c) => {
    if (typeof c?.status === 'boolean') return c.status;
    return String(c?.status || '').toLowerCase() === 'active';
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch all cuisines
  const fetchCuisines = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(URLS.GetCuisine, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader()
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && (data.success || data.status)) {
        const list = data.data || data.cuisineTypes || data.result || [];
        setCuisines(list);
      } else {
        setError(data.message || 'Failed to load cuisines.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCuisines();
  }, [fetchCuisines]);

  // Add cuisine (called from modal after successful create)
  const handleAddCuisine = (newCuisine) => {
    setCuisines(prev => [newCuisine, ...prev]);
    showToast(`Cuisine "${newCuisine.name}" created successfully!`);
    fetchCuisines();
  };

  // Save edit (called from modal after successful update)
  const handleSaveEditCuisine = (updated) => {
    setCuisines(prev => prev.map(c => (c._id === updated._id || c.id === updated.id) ? { ...c, ...updated } : c));
    setEditingCuisine(null);
    showToast(`Cuisine "${updated.name}" updated successfully!`);
    fetchCuisines();
  };

  // Delete cuisine
  const handleDeleteCuisine = async (cuisine) => {
    const id = cuisine._id || cuisine.id;
    if (!window.confirm(`Delete cuisine "${cuisine.name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${URLS.DeleteCuisine}${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader()
        }
      });
      const data = await res.json();
      if (res.ok && (data.success || data.status)) {
        setCuisines(prev => prev.filter(c => (c._id || c.id) !== id));
        showToast(`Cuisine "${cuisine.name}" removed.`);
      } else {
        showToast(data.message || 'Failed to delete cuisine.', 'error');
      }
    } catch {
      showToast('Network error while deleting.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle status via update API (FormData — backend uses multer)
  const toggleStatus = async (item) => {
    const id = item._id || item.id;
    const currentlyActive = isCuisineActive(item);
    const nextStatus = currentlyActive ? 'inactive' : 'active';
    setTogglingId(id);
    try {
      const fd = new FormData();
      fd.append('name', item.name || '');
      fd.append('priority', String(item.priority || 1));
      fd.append('status', nextStatus);
      if (item.isPopular !== undefined) {
        fd.append('isPopular', String(Boolean(item.isPopular)));
      }
      // Do NOT append image — backend preserves existing file when no new file sent

      const res = await fetch(`${URLS.UpdateCuisine}${id}`, {
        method: 'PUT',
        headers: {
          Authorization: getAuthHeader()
        },
        body: fd
      });
      const data = await res.json();
      if (res.ok && (data.success || data.status)) {
        setCuisines(prev =>
          prev.map(c => (c._id || c.id) === id ? { ...c, status: nextStatus } : c)
        );
        showToast(`Status updated to "${nextStatus}"`);
      } else {
        showToast(data.message || 'Failed to update status.', 'error');
      }
    } catch {
      showToast('Network error while updating status.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = cuisines.filter(c => {
    const matchesSearch =
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && isCuisineActive(c)) ||
      (statusFilter === 'Inactive' && !isCuisineActive(c));
    return matchesSearch && matchesStatus;
  });

  const totalActive = cuisines.filter(isCuisineActive).length;
  const totalPopular = cuisines.filter(c => Boolean(c.isPopular)).length;
  const totalRestaurantsRepresented = cuisines.reduce((acc, curr) => acc + (curr.totalRestaurants || 0), 0);

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
          {toastType === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{toastMsg}</span>
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
            className="btn btn-secondary"
            onClick={fetchCuisines}
            style={{ marginRight: 8 }}
            title="Refresh"
          >
            <RefreshCw size={15} /> Refresh
          </button>
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 10 }} />
            <p style={{ margin: 0, fontSize: 14 }}>Loading cuisines...</p>
          </div>
        ) : error ? (
          <div style={{
            margin: 16, padding: '16px 20px', borderRadius: 8,
            background: '#fef2f2', border: '1px solid #fecaca',
            color: '#dc2626', display: 'flex', alignItems: 'center', gap: 10
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
            <button className="btn btn-secondary" style={{ marginLeft: 'auto', fontSize: 12 }} onClick={fetchCuisines}>
              Retry
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cuisine &amp; Cover</th>
                  <th>Priority</th>
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
                  filtered.map((item) => {
                    const itemId = item._id || item.id;
                    const imageUrl = getImageUrl(item.image);
                    const isActive = isCuisineActive(item);

                    return (
                      <tr key={itemId}>
                        <td>
                          <div className="table-entity-cell">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.name}
                                className="entity-thumb"
                                style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div style={{
                              display: imageUrl ? 'none' : 'flex',
                              width: 44, height: 44, borderRadius: 8,
                              background: '#f1f5f9', border: '1px solid #e2e8f0',
                              alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              <Utensils size={20} color="#94a3b8" />
                            </div>
                            <div className="entity-info">
                              <h5 style={{ margin: 0, fontSize: 14 }}>{item.name}</h5>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-accepted" style={{ fontWeight: 700 }}>
                            {item.priority || '—'}
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
                              checked={isActive}
                              disabled={togglingId === itemId}
                              onChange={() => toggleStatus(item)}
                            />
                            <span className="slider"></span>
                          </label>
                          <span style={{
                            marginLeft: 8, fontSize: 12, fontWeight: 600,
                            color: isActive ? '#16a34a' : '#94a3b8'
                          }}>
                            {togglingId === itemId ? '...' : (isActive ? 'Active' : 'Inactive')}
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
                              disabled={deletingId === itemId}
                              title="Delete Cuisine"
                            >
                              {deletingId === itemId
                                ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                : <Trash2 size={13} />
                              }
                              Delete
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
        )}
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
