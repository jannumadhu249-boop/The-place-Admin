import React, { useState, useRef } from 'react';
import { X, Plus, Layers, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export default function CreateSubCategoryModal({ isOpen, categories = [], onClose, onAdd }) {
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    priority: '',
    status: 'active'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({ categoryId: '', name: '', priority: '', status: 'active' });
    setImageFile(null);
    setImagePreview('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedCatId = formData.categoryId || (categories[0]?._id || categories[0]?.id || '');
    if (!selectedCatId) { setError('Please select a parent category'); return; }
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('categoryId', selectedCatId);
      fd.append('name', formData.name);
      fd.append('priority', String(formData.priority));
      fd.append('status', formData.status);
      if (imageFile) fd.append('image', imageFile);

      const res = await fetch(URLS.CreateSubCategories, {
        method: 'POST',
        headers: { authorization: getAuthHeader() },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to create sub-category');
      resetForm();
      onAdd();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 620, width: '92%' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: '#fff1f2', color: '#be123c',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Layers size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>Add Sub-Category</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Create child sub-classification linked to parent menu category
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Parent Category & Name */}
            <div className="modal-grid">
              <div className="form-group">
                <label>Parent Category *</label>
                <select
                  className="form-control-input"
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => {
                    const cid = c._id || c.id;
                    return <option key={cid} value={cid}>{c.name}</option>;
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>Sub-Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Woodfired Pizzas, Fresh Pasta"
                  className="form-control-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Priority & Status */}
            <div className="modal-grid">
              <div className="form-group">
                <label>Display Priority *</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="1"
                  className="form-control-input"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
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


            {/* Sub-Category Image */}
            <div className="form-group" style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ImageIcon size={14} color="#0284c7" /> Sub-Category Thumbnail Photo
              </label>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 8,
                  background: '#e2e8f0', border: '1px solid #cbd5e1',
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Subcat" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <ImageIcon size={22} color="#94a3b8" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="subcat-img-upload"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="subcat-img-upload" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: 12, cursor: 'pointer', marginBottom: 6 }}>
                    <Upload size={13} /> {imageFile ? imageFile.name : 'Upload Image'}
                  </label>
                  {imageFile && (
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>File selected: {imageFile.name}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', fontSize: 13 }}>
                {error}
              </div>
            )}

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => { resetForm(); onClose(); }} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Creating...</> : <><Plus size={15} /> Add Sub-Category</>}
            </button>
          </div>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </form>
      </div>
    </div>
  );
}
