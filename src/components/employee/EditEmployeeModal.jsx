import React, { useState, useEffect } from 'react';
import { X, CheckCircle, User, Shield, Mail, Phone, Building } from 'lucide-react';

export default function EditEmployeeModal({ employee, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
    }
  }, [employee]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
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
              <User size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17 }}>Edit Employee Profile</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{formData.id} &bull; {formData.name}</p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Avatar Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <img
                src={formData.avatar}
                alt={formData.name}
                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #be123c' }}
              />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4, display: 'block' }}>
                  Avatar Profile Photo URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="form-control-input"
                  style={{ fontSize: 12.5 }}
                />
              </div>
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Full Legal Name</label>
                <input
                  type="text"
                  required
                  className="form-control-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Assigned Administrative Role</label>
                <select
                  className="form-control-input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="Super Administrator">Super Administrator</option>
                  <option value="Kitchen Operations Lead">Kitchen Operations Lead</option>
                  <option value="Fleet & Dispatch Supervisor">Fleet & Dispatch Supervisor</option>
                  <option value="Customer Care Representative">Customer Care Representative</option>
                  <option value="Finance & Accounting Manager">Finance & Accounting Manager</option>
                </select>
              </div>
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Department</label>
                <select
                  className="form-control-input"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Executive Management">Executive Management</option>
                  <option value="Culinary Operations">Culinary Operations</option>
                  <option value="Logistics & Dispatch">Logistics & Dispatch</option>
                  <option value="Customer Experience">Customer Experience</option>
                  <option value="Finance & Accounts">Finance & Accounts</option>
                </select>
              </div>

              <div className="form-group">
                <label>Work Email</label>
                <input
                  type="email"
                  required
                  className="form-control-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  required
                  className="form-control-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Joined Date</label>
                <input
                  type="text"
                  className="form-control-input"
                  value={formData.joinedDate}
                  onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                />
              </div>
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
                <strong style={{ fontSize: 13, color: '#0f172a' }}>Employee Account Status</strong>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  Active employees can sign in and manage portal operations
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.status === 'Active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })}
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
              <CheckCircle size={15} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
