import React, { useState } from 'react';
import { X, Plus, Store } from 'lucide-react';

export default function AddRestaurantModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    phone: '',
    email: '',
    commissionRate: 15,
    zone: 'Zone 1 - Downtown Core',
    address: '',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      ...formData,
      commissionRate: Number(formData.commissionRate),
      rating: 5.0,
      reviews: 1,
      totalOrders: 0,
      totalEarnings: '$0.00',
      status: 'Active',
      isOpen: true,
      address: formData.address || 'Central Culinary Quarter, NY'
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#fff1f2',
              color: '#be123c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Store size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17 }}>Onboard Partner Restaurant</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Register new culinary merchant onto the platform</p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label>Restaurant Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Bella Trattoria"
                className="form-control-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Cuisine Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Authentic Italian, Pizza"
                  className="form-control-input"
                  value={formData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Assigned Zone</label>
                <select
                  className="form-control-input"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                >
                  <option value="Zone 1 - Downtown Core">Zone 1 - Downtown Core</option>
                  <option value="Zone 2 - West District">Zone 2 - West District</option>
                  <option value="Zone 3 - Midtown Central">Zone 3 - Midtown Central</option>
                  <option value="Zone 4 - Brooklyn North">Zone 4 - Brooklyn North</option>
                </select>
              </div>
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+1 (555) 234-5678"
                  className="form-control-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Platform Commission (%)</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  required
                  placeholder="15"
                  className="form-control-input"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  required
                  placeholder="manager@restaurant.com"
                  className="form-control-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="452 Culinary Ave, NY"
                  className="form-control-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Storefront Cover Image URL</label>
              <input
                type="url"
                required
                className="form-control-input"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={15} /> Add Restaurant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
