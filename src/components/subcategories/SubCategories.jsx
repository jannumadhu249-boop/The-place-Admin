import React, { useState, useEffect, useCallback } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  FolderTree, 
  Utensils,
  Loader2,
  AlertCircle
} from 'lucide-react';
import CreateSubCategoryModal from './CreateSubCategoryModal';
import EditSubCategoryModal from './EditSubCategoryModal';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};




export default function SubCategories() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParentCategory, setSelectedParentCategory] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ── Fetch categories for dropdown ────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(URLS.GetCategories, {
        method: 'POST',
        headers: { authorization: getAuthHeader() }
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.data || data?.categories || data?.category || data?.result || []);
      setCategories(list);
    } catch {}
  }, []);

  // ── Fetch Sub-Categories ─────────────────────────────────────────────────
  const fetchSubCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(URLS.GetSubCategories, {
        method: 'POST',
        headers: { authorization: getAuthHeader() }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch sub-categories');
      const list = Array.isArray(data) ? data : (data?.data || data?.subcategories || data?.subCategories || data?.subcategory || data?.result || []);
      setSubCategories(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, [fetchCategories, fetchSubCategories]);

  // ── Callbacks from modals ────────────────────────────────────────────────
  const handleAddSubCategory = () => {
    showToast('Sub-category created successfully!');
    fetchSubCategories();
  };

  const handleSaveEditSubCategory = () => {
    setEditingSubCategory(null);
    showToast('Sub-category updated successfully!');
    fetchSubCategories();
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDeleteSubCategory = async (item) => {
    const id = item._id || item.id;
    if (!window.confirm(`Delete sub-category "${item.name}"?`)) return;
    try {
      const res = await fetch(`${URLS.DeleteSubCategories}${id}`, {
        method: 'DELETE',
        headers: { authorization: getAuthHeader() }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Delete failed');
      showToast(`Sub-category "${item.name}" deleted.`);
      fetchSubCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ── Toggle Status via PUT ────────────────────────────────────────────────
  const toggleStatus = async (sub) => {
    const id = sub._id || sub.id;
    const isActive = (sub.status || '').toLowerCase() === 'active';
    const nextStatus = isActive ? 'inactive' : 'active';
    try {
      const fd = new FormData();
      fd.append('name', sub.name);
      fd.append('priority', sub.priority);
      fd.append('status', nextStatus);
      if (sub.categoryId || sub.category?._id) {
        fd.append('categoryId', sub.categoryId || sub.category?._id);
      }
      const res = await fetch(`${URLS.UpdateSubCategories}${id}`, {
        method: 'PUT',
        headers: { authorization: getAuthHeader() },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Status update failed');
      showToast(`Status updated to "${nextStatus}"`);
      fetchSubCategories();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = subCategories.filter(s => {
    const catName = s.category?.name || s.categoryName || s.category || '';
    const matchesSearch =
      (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      catName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedParentCategory === 'All' ||
      catName.toLowerCase() === selectedParentCategory.toLowerCase() ||
      (s.categoryId === selectedParentCategory);
    return matchesSearch && matchesCategory;
  });

  const totalActive = subCategories.filter(s => (s.status || '').toLowerCase() === 'active').length;
  const uniqueParentIds = new Set(subCategories.map(s => s.categoryId || s.category?._id || s.category));
  const parentCategoriesCount = uniqueParentIds.size;

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
          <h1>Menu Sub-Categories</h1>
          <p>Configure specific secondary dish classifications mapped under parent categories</p>
        </div>
        <div className="page-actions-block">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={16} /> Add Sub-Category
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fff1f2', color: '#be123c' }}>
              <Layers size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Catalog</span>
          </div>
          <div>
            <div className="metric-val">{subCategories.length}</div>
            <div className="metric-title">Total Sub-Categories</div>
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
            <div className="metric-title">Live Active Sub-Levels</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <FolderTree size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Parents</span>
          </div>
          <div>
            <div className="metric-val">{parentCategoriesCount}</div>
            <div className="metric-title">Linked Parent Groups</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fdf4ff', color: '#a855f7' }}>
              <Utensils size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Total</span>
          </div>
          <div>
            <div className="metric-val">{subCategories.length}</div>
            <div className="metric-title">Total Sub-Categories</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-container">
        <div className="card-header">
          <div>
            <h3>All Sub-Categories ({filtered.length})</h3>
          </div>
          <div className="card-header-actions">
            {/* Filter by parent category */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Parent:</span>
              <select
                className="form-control-input"
                style={{ width: 190, padding: '6px 12px', fontSize: 12.5 }}
                value={selectedParentCategory}
                onChange={(e) => setSelectedParentCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map(c => {
                  const cid = c._id || c.id;
                  return <option key={cid} value={c.name}>{c.name}</option>;
                })}
              </select>
            </div>

            <div className="topbar-search-box" style={{ width: 260, padding: '6px 12px' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search sub-category..."
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
              <p style={{ marginTop: 8 }}>Loading sub-categories...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#be123c' }}>
              <AlertCircle size={28} style={{ marginBottom: 8 }} />
              <p style={{ marginTop: 8 }}>{error}</p>
              <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={fetchSubCategories}>Retry</button>
            </div>
          ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sub-Category Details</th>
                <th>Parent Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: 36, color: '#64748b' }}>
                      No sub-categories found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((sub) => {
                    const id = sub._id || sub.id;
                    const isActive = (sub.status || '').toLowerCase() === 'active';
                    const catName = sub.category?.name || sub.categoryName || (typeof sub.category === 'string' ? sub.category : '') || '—';
                    const imageUrl = sub.image
                      ? (sub.image.startsWith('http') ? sub.image : `${URLS.ImageUrl}${sub.image}`)
                      : null;
                    return (
                      <tr key={id}>
                        <td>
                          <div className="table-entity-cell">
                            {imageUrl ? (
                              <img src={imageUrl} alt={sub.name} className="entity-thumb" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Layers size={18} color="#94a3b8" />
                              </div>
                            )}
                            <div className="entity-info">
                              <h5 style={{ margin: 0, fontSize: 14 }}>{sub.name}</h5>
                              {/* <span style={{ fontSize: 11, color: '#94a3b8' }}>{id}</span> */}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-accepted" style={{ fontWeight: 700, background: '#f0f9ff', color: '#0369a1', borderColor: '#bae6fd' }}>
                            {catName}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-accepted" style={{ fontWeight: 700 }}>
                            {sub.priority}
                          </span>
                        </td>
                        <td>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => toggleStatus(sub)}
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
                              onClick={() => setEditingSubCategory(sub)}
                              title="Edit Sub-Category"
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', fontSize: 12, color: '#dc2626', borderColor: '#dc2626' }}
                              onClick={() => handleDeleteSubCategory(sub)}
                              title="Delete Sub-Category"
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
      <CreateSubCategoryModal
        isOpen={isCreateOpen}
        categories={categories}
        onClose={() => setIsCreateOpen(false)}
        onAdd={handleAddSubCategory}
      />

      {/* Edit Modal */}
      <EditSubCategoryModal
        subCategory={editingSubCategory}
        categories={categories}
        isOpen={Boolean(editingSubCategory)}
        onClose={() => setEditingSubCategory(null)}
        onSave={handleSaveEditSubCategory}
      />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
