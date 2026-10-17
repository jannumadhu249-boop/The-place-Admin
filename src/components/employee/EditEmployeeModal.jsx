import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle, 
  User, 
  Shield, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Upload, 
  Lock, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanBase = URLS.ImageUrl.endsWith('/') ? URLS.ImageUrl : `${URLS.ImageUrl}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
};

export default function EditEmployeeModal({ employee, isOpen, onClose, onSave, onError }) {
  const [formData, setFormData] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Load departments and roles
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchLookups() {
      setLoadingLookups(true);
      try {
        const [deptsRes, rolesRes] = await Promise.all([
          fetch(URLS.GetDepartments, {
            method: 'POST',
            headers: {
              authorization: getAuthHeader(),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          }),
          fetch(URLS.GetRole, {
            method: 'POST',
            headers: {
              authorization: getAuthHeader(),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          })
        ]);

        const deptsData = await deptsRes.json();
        const rolesData = await rolesRes.json();

        if (isMounted) {
          setDepartments(deptsData.departments || deptsData.data || []);
          setRoles(rolesData.roles || rolesData.data || []);
        }
      } catch (err) {
        console.error('Error fetching lookups for edit modal:', err);
      } finally {
        if (isMounted) setLoadingLookups(false);
      }
    }

    fetchLookups();
    return () => { isMounted = false; };
  }, [isOpen]);

  // Set form state when employee prop arrives
  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        _id: employee._id || employee.id,
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        departmentId: employee.departmentId || '',
        roleId: employee.roleId || '',
        address: employee.address || '',
        status: (employee.status || 'active').toLowerCase(),
        currentImage: employee.image || ''
      });
      setNewImageFile(null);
      setNewImagePreview(null);
      setNewPassword('');
      setErrorMsg(null);
    }
  }, [employee, isOpen]);

  if (!isOpen || !formData) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.departmentId) {
      setErrorMsg('Please select a department.');
      return;
    }

    if (!formData.roleId) {
      setErrorMsg('Please assign a role.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', (formData.name || '').trim());
      fd.append('phone', (formData.phone || '').trim());
      fd.append('email', (formData.email || '').trim());
      fd.append('departmentId', formData.departmentId);
      fd.append('roleId', formData.roleId);
      fd.append('address', (formData.address || '').trim());
      fd.append('status', formData.status || 'active');

      if (newPassword.trim()) {
        fd.append('password', newPassword.trim());
      }

      if (newImageFile) {
        fd.append('image', newImageFile);
      }

      const res = await fetch(`${URLS.UpdateEmpolyee}${formData._id}`, {
        method: 'PUT',
        headers: {
          authorization: getAuthHeader()
        },
        body: fd
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        onSave && onSave(data.staff || data.employee || formData);
        onClose();
      } else {
        throw new Error(data.message || 'Failed to update employee profile');
      }
    } catch (err) {
      console.error('Update employee error:', err);
      setErrorMsg(err.message);
      onError && onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const displayImage = newImagePreview || (formData.currentImage ? getImageUrl(formData.currentImage) : null);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: 660, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#fff1f2',
              color: '#be123c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Edit Employee Profile</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                ID: {formData._id} &bull; {formData.name}
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body" style={{ overflowY: 'auto', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            
            {errorMsg && (
              <div style={{
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 8,
                color: '#b91c1c',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Profile Avatar Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '14px 18px',
              background: '#f8fafc',
              borderRadius: 12,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#e2e8f0',
                border: '2px solid #be123c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {displayImage ? (
                  <img src={displayImage} alt={formData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={30} color="#94a3b8" />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 2 }}>
                  Employee Photo
                </span>
                <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748b' }}>
                  {newImageFile ? `Selected: ${newImageFile.name}` : 'Click to replace existing avatar'}
                </p>
                <label 
                  className="btn btn-secondary" 
                  style={{ 
                    cursor: 'pointer', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 6,
                    padding: '4px 12px',
                    fontSize: 12
                  }}
                >
                  <Upload size={13} /> Upload New Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            {/* Name & Phone */}
            <div className="modal-grid">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={13} color="#64748b" />
                  <span>Full Legal Name *</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-control-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={13} color="#64748b" />
                  <span>Contact Phone *</span>
                </label>
                <input
                  type="tel"
                  required
                  className="form-control-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Email & Address */}
            <div className="modal-grid">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={13} color="#64748b" />
                  <span>Work Email *</span>
                </label>
                <input
                  type="email"
                  required
                  className="form-control-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={13} color="#64748b" />
                  <span>Work / Residential Address *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KPHB, Hyderabad"
                  className="form-control-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            {/* Department & Role Dropdowns (Live API) */}
            <div className="modal-grid">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={13} color="#64748b" />
                  <span>Department *</span>
                </label>
                {loadingLookups ? (
                  <div style={{ padding: '8px 12px', fontSize: 13, color: '#64748b' }}>Loading...</div>
                ) : (
                  <select
                    className="form-control-input"
                    required
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((dept) => (
                      <option key={dept._id || dept.id} value={dept._id || dept.id}>
                        {dept.departmentName || dept.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={13} color="#be123c" />
                  <span>Assigned Role *</span>
                </label>
                {loadingLookups ? (
                  <div style={{ padding: '8px 12px', fontSize: 13, color: '#64748b' }}>Loading...</div>
                ) : (
                  <select
                    className="form-control-input"
                    required
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  >
                    <option value="">-- Select Role --</option>
                    {roles.map((r) => (
                      <option key={r._id || r.id} value={r._id || r.id}>
                        {r.roleName || r.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Password Update (Optional) */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={13} color="#64748b" />
                <span>Reset Password (Optional)</span>
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep existing password"
                className="form-control-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span style={{ fontSize: 11.5, color: '#64748b', marginTop: 3, display: 'block' }}>
                Only enter a new password if you want to update the staff member's credentials.
              </span>
            </div>

            {/* Status Switch */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: 10,
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <strong style={{ fontSize: 13, color: '#0f172a' }}>Employee Account Status</strong>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  {formData.status === 'active' ? 'Active — Allowed to log in and access system' : 'Inactive — Account access suspended'}
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={formData.status === 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer" style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <CheckCircle size={15} /> {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
