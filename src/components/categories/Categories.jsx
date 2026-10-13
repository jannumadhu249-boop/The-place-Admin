import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  Layers,
  Utensils,
  Loader2,
  AlertCircle
} from 'lucide-react';
import CreateCategoryModal from './CreateCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ── Fetch All Categories ─────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(URLS.GetCategories, {
        method: 'POST',
        headers: { authorization: getAuthHeader() }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch categories');
      const list = Array.isArray(data) ? data : (data?.data || data?.categories || data?.category || data?.result || []);
      setCategories(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ── Add callback (modal handles API, we just refresh) ───────────────────
  const handleAddCategory = () => {
    showToast('Category created successfully!');
    fetchCategories();
  };

  // ── Edit callback (modal handles API, we just refresh) ──────────────────
  const handleSaveEditCategory = () => {
    setEditingCategory(null);
    showToast('Category updated successfully!');
    fetchCategories();
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDeleteCategory = async (cat) => {
    const id = cat._id || cat.id;
    if (!window.confirm(`Delete category "${cat.name}"? Sub-categories linked to this may be affected.`)) return;
    try {
      const res = await fetch(`${URLS.DeleteCategories}${id}`, {
        method: 'DELETE',
        headers: { authorization: getAuthHeader() }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Delete failed');
      showToast(`Category "${cat.name}" deleted.`);
      fetchCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ── Toggle Status via PUT ────────────────────────────────────────────────
  const toggleStatus = async (cat) => {
    const id = cat._id || cat.id;
    const isActive = (cat.status || '').toLowerCase() === 'active';
    const nextStatus = isActive ? 'inactive' : 'active';
    try {
      const formData = new FormData();
      formData.append('name', cat.name);
      formData.append('priority', cat.priority);
      formData.append('status', nextStatus);
      const res = await fetch(`${URLS.UpdateCategories}${id}`, {
        method: 'PUT',
        headers: { authorization: getAuthHeader() },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Status update failed');
      showToast(`Status updated to "${nextStatus}"`);
      fetchCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = categories.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ||
      (c.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalActive = categories.filter(c => (c.status || '').toLowerCase() === 'active').length;

  return (
    <div>
      {/* Toast */}
      {toastMsg && (
        <div style={{
          padding: '12px 18px', marginBottom: 18, borderRadius: 8,
          background: toastType === 'error' ? '#fff1f2' : '#f0fdf4',
          border: `1px solid ${toastType === 'error' ? '#fecdd3' : '#bbf7d0'}`,
          color: toastType === 'error' ? '#be123c' : '#15803d',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5
        }}>
          {toastType === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-block">
          <h1>Menu Categories Directory</h1>
          <p>Organize root menu catalog taxonomies, display hierarchies, and dish classifications</p>
        </div>
        <div className="page-actions-block">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={16} /> Add New Category
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fff1f2', color: '#be123c' }}>
              <FolderTree size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Catalog</span>
          </div>
          <div>
            <div className="metric-val">{categories.length}</div>
            <div className="metric-title">Total Primary Categories</div>
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
            <div className="metric-title">Live Active Categories</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <Layers size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Inactive</span>
          </div>
          <div>
            <div className="metric-val">{categories.length - totalActive}</div>
            <div className="metric-title">Inactive Categories</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fdf4ff', color: '#a855f7' }}>
              <Utensils size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Filtered</span>
          </div>
          <div>
            <div className="metric-val">{filtered.length}</div>
            <div className="metric-title">Showing Results</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-container">
        <div className="card-header">
          <div>
            <h3>All Menu Categories ({filtered.length})</h3>
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
                placeholder="Search category name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
              <p style={{ marginTop: 8 }}>Loading categories...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#be123c' }}>
              <AlertCircle size={28} style={{ marginBottom: 8 }} />
              <p style={{ marginTop: 8 }}>{error}</p>
              <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={fetchCategories}>
                Retry
              </button>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category Details</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: 36, color: '#64748b' }}>
                      No categories found matching your query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((cat) => {
                    const id = cat._id || cat.id;
                    const isActive = (cat.status || '').toLowerCase() === 'active';
                    const imageUrl = cat.image
                      ? (cat.image.startsWith('http') ? cat.image : `${URLS.ImageUrl}${cat.image}`)
                      : null;
                    return (
                      <tr key={id}>
                        <td>
                          <div className="table-entity-cell">
                            {imageUrl ? (
                              <img src={imageUrl} alt={cat.name} className="entity-thumb" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <FolderTree size={18} color="#94a3b8" />
                              </div>
                            )}
                            <div className="entity-info">
                              <h5 style={{ margin: 0, fontSize: 14 }}>{cat.name}</h5>
                              {/* <span style={{ fontSize: 11, color: '#94a3b8' }}>{id}</span> */}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-accepted" style={{ fontWeight: 700 }}>
                            {cat.priority}
                          </span>
                        </td>
                        <td>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => toggleStatus(cat)}
                            />
                            <span className="slider"></span>
                          </label>
                          <span style={{
                            marginLeft: 8, fontSize: 12, fontWeight: 600,
                            color: isActive ? '#16a34a' : '#94a3b8'
                          }}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', fontSize: 12, color: '#0284c7', borderColor: '#0284c7' }}
                              onClick={() => setEditingCategory(cat)}
                              title="Edit Category"
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', fontSize: 12, color: '#dc2626', borderColor: '#dc2626' }}
                              onClick={() => handleDeleteCategory(cat)}
                              title="Delete Category"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <CreateCategoryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAdd={handleAddCategory}
      />

      {/* Edit Modal */}
      <EditCategoryModal
        category={editingCategory}
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        onSave={handleSaveEditCategory}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

