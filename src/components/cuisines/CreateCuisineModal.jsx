import React, { useState } from 'react';
import { X, Plus, Utensils, Upload, Image as ImageIcon, CheckCircle, Flame } from 'lucide-react';

export default function CreateCuisineModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    priority: 1,
    isPopular: false,
    status: 'Active'
  });

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      priority: Number(formData.priority) || 1,
      totalRestaurants: 0,
      totalFoods: 0,
      image: formData.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80'
    });
    setFormData({
      name: '',
      description: '',
      image: '',
      priority: 1,
      isPopular: false,
      status: 'Active'
    });
    onClose();
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
              <h3 style={{ margin: 0, fontSize: 18 }}>Create New Cuisine</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Add culinary tradition category to organize restaurant storefronts
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Name & Priority */}
            <div className="modal-grid">
              <div className="form-group">
                <label>Cuisine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Italian, Thai, Mexican"
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
                  placeholder="1"
                  className="form-control-input"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description / Culinary Notes</label>
              <textarea
                rows="2"
                placeholder="e.g. Traditional handmade pastas, Neapolitan pizzas, and gourmet cheeses"
                className="form-control-input"
                style={{ resize: 'vertical' }}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
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
                  {formData.image ? (
                    <img src={formData.image} alt="Cuisine" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <ImageIcon size={24} color="#94a3b8" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="cuisine-img-upload"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="cuisine-img-upload" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: 12, cursor: 'pointer', marginBottom: 6 }}>
                    <Upload size={13} /> Choose Image File
                  </label>
                  <input
                    type="text"
                    placeholder="Or paste direct image URL"
                    className="form-control-input"
                    style={{ fontSize: 12, padding: '6px 10px' }}
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
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
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={15} /> Create Cuisine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
