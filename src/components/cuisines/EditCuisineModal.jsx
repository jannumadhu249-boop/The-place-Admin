import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Utensils, Upload, Image as ImageIcon, Flame, Loader2 } from 'lucide-react';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token =
    localStorage.getItem('admin_token') ||
    sessionStorage.getItem('admin_token') ||
    localStorage.getItem('token') ||
    FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export default function EditCuisineModal({ cuisine, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (cuisine) {
      const isInactive = String(cuisine.status || '').toLowerCase() === 'inactive';
      setFormData({
        ...cuisine,
        name: cuisine.name || '',
        priority: cuisine.priority || 1,
        isPopular: Boolean(cuisine.isPopular),
        status: isInactive ? 'inactive' : 'active'
      });
      setImageFile(null);
      if (cuisine.image && typeof cuisine.image === 'string' && cuisine.image.trim() !== '') {
        if (cuisine.image.startsWith('http://') || cuisine.image.startsWith('https://') || cuisine.image.startsWith('data:')) {
          setImagePreview(cuisine.image);
        } else {
          const base = (URLS.ImageUrl || 'http://16.113.133.178:3000').replace(/\/+$/, '');
          const clean = cuisine.image.replace(/^\/+/, '').replace(/\\/g, '/');
          setImagePreview(`${base}/${clean}`);
        }
      } else {
        setImagePreview('');
      }
      setError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [cuisine]);

  if (!isOpen || !formData) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const id = formData._id || formData.id;
    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('priority', String(formData.priority || 1));
      fd.append('status', formData.status || 'active');
      if (formData.isPopular !== undefined) {
        fd.append('isPopular', String(Boolean(formData.isPopular)));
      }
      if (imageFile instanceof File) {
        fd.append('image', imageFile);
      }

      const res = await fetch(`${URLS.UpdateCuisine}${id}`, {
        method: 'PUT',
        headers: {
          Authorization: getAuthHeader()
        },
        body: fd
      });
      const data = await res.json();
      if (res.ok && (data.success || data.status)) {
        const updated = data.data || data.cuisineType || data.result || {
          ...formData
        };
        onSave({ ...formData, ...updated });
        onClose();
      } else {
        setError(data.message || 'Failed to update cuisine. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 580, width: '92%' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: '#fff1f2', color: '#be123c',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Utensils size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>Edit Cuisine Details</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formData.name}</span>
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#dc2626', fontSize: 13
              }}>
                {error}
              </div>
            )}

            {/* Name & Priority */}
            <div className="modal-grid">
              <div className="form-group">
                <label>Cuisine Name *</label>
                <input
                  type="text"
                  required
                  className="form-control-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Display Priority / Order *</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="form-control-input"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                />
              </div>
            </div>

            {/* Image Preview & Upload */}
            <div className="form-group" style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ImageIcon size={14} color="#0284c7" /> Cuisine Showcase Image *
              </label>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 8,
                  background: '#e2e8f0', border: '1px solid #cbd5e1',
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Cuisine"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                      }}
                    />
                  ) : (
                    <ImageIcon size={24} color="#94a3b8" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="edit-cuisine-img-upload"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="edit-cuisine-img-upload" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: 12, cursor: 'pointer', marginBottom: 6 }}>
                    <Upload size={13} /> {imageFile ? 'Change Selected File' : 'Change Image File'}
                  </label>
                  {imageFile && (
                    <span style={{ display: 'block', fontSize: 11.5, color: '#16a34a', fontWeight: 500 }}>
                      Selected: {imageFile.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Popular Badge & Status */}
            <div className="modal-grid">
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 10 }}>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Flame size={14} color="#f97316" /> Mark as Trending / Popular
                  </span>
                  <p style={{ margin: 0, fontSize: 11.5, color: '#64748b' }}>Display badge on customer app</p>
                </div>
              </div>

              <div className="form-group">
                <label>Publication Status</label>
                <select
                  className="form-control-input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                : <><CheckCircle size={15} /> Save Changes</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
