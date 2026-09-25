import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Store, Image, DollarSign, MapPin, Phone, Mail } from 'lucide-react';

export default function EditRestaurantModal({ restaurant, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        ...restaurant,
        commissionRate: restaurant.commissionRate || 15,
        zone: restaurant.zone || 'Zone 1 - Downtown Core',
        phone: restaurant.phone || '+1 (555) 234-5678',
        email: restaurant.email || 'contact@restaurant.com',
        address: restaurant.address || '452 Culinary Ave, NY',
      });
    }
  }, [restaurant]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      commissionRate: Number(formData.commissionRate)
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
              <h3 style={{ margin: 0, fontSize: 17 }}>Edit Restaurant Profile</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{formData.id} &bull; {formData.name}</p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Restaurant Cover Banner Preview */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <img
                src={formData.image}
                alt={formData.name}
                style={{ width: 72, height: 72, borderRadius: 8, objectFit: 'cover', border: '1px solid #cbd5e1' }}
              />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>
                  Image URL / Storefront Thumbnail
                </label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="form-control-input"
                  style={{ fontSize: 12.5 }}
                />
              </div>
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Restaurant Name</label>
                <input
                  type="text"
                  required
                  className="form-control-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Cuisine / Category</label>
                <input
                  type="text"
                  required
                  className="form-control-input"
                  value={formData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Assigned Delivery Zone</label>
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

              <div className="form-group">
                <label>Platform Commission (%)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    step="1"
                    required
                    className="form-control-input"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                  />
                  <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: 13 }}>
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="text"
                  required
                  className="form-control-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Merchant Email</label>
                <input
                  type="email"
                  required
                  className="form-control-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Physical Address</label>
              <input
                type="text"
                required
                className="form-control-input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <strong style={{ fontSize: 13, color: '#0f172a' }}>Kitchen Acceptance Status</strong>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  Toggle whether this restaurant is currently accepting live delivery orders
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.isOpen}
                  onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={15} /> Save Restaurant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
