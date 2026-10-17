import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  UserPlus, 
  Upload, 
  Shield, 
  CheckCircle, 
  Lock, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  AlertCircle,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export default function AddNewEmployee({ onBackToList, onEmployeeCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    roleId: '',
    password: '',
    confirmPassword: '',
    address: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingLookups, setLoadingLookups] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Fetch departments and roles via API on mount
  useEffect(() => {
    let isMounted = true;
    async function loadLookups() {
      setLoadingLookups(true);
      setError(null);
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
          const deptsList = deptsData.departments || deptsData.data || [];
          const rolesList = rolesData.roles || rolesData.data || [];
          setDepartments(deptsList);
          setRoles(rolesList);

          // Pre-select first values if available
          setFormData(prev => ({
            ...prev,
            departmentId: deptsList[0]?._id || '',
            roleId: rolesList[0]?._id || ''
          }));
        }
      } catch (err) {
        console.error('Failed to load departments or roles:', err);
        if (isMounted) setError('Failed to load departments or roles. Please check connection.');
      } finally {
        if (isMounted) setLoadingLookups(false);
      }
    }

    loadLookups();
    return () => { isMounted = false; };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!formData.departmentId) {
      setError('Please select a department.');
      return;
    }

    if (!formData.roleId) {
      setError('Please assign an administrative role.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('phone', formData.phone.trim());
      fd.append('email', formData.email.trim());
      fd.append('password', formData.password);
      fd.append('departmentId', formData.departmentId);
      fd.append('roleId', formData.roleId);
      fd.append('address', formData.address.trim());
      
      if (imageFile) {
        fd.append('image', imageFile);
      }

      const res = await fetch(URLS.CreateEmpolyee, {
        method: 'POST',
        headers: {
          authorization: getAuthHeader()
        },
        body: fd
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSubmitted(true);
        if (onEmployeeCreated) {
          onEmployeeCreated(data.staff || data.employee);
        }
        setTimeout(() => {
          onBackToList();
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to add employee account');
      }
    } catch (err) {
      console.error('Create employee error:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <button 
            type="button" 
            onClick={onBackToList}
            className="btn btn-secondary" 
            style={{ marginBottom: 12, padding: '6px 14px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={16} /> Back to Employee List
          </button>
          <h1>Onboard New Employee</h1>
          <p>Create a dedicated administrative profile with customizable privilege sets</p>
        </div>
      </div>

      <div className="card-container" style={{ maxWidth: 840, margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <div className="card-header">
          <div>
            <h3>Employee Profile Details</h3>
            <p style={{ margin: 0, fontSize: 12.5, color: '#64748b' }}>Fill in corporate credentials and assign organizational roles</p>
          </div>
        </div>

        {error && (
          <div style={{
            margin: '20px 28px 0',
            padding: '12px 18px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13.5,
            fontWeight: 600
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <CheckCircle size={52} color="#16a34a" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Employee Profile Created!</h3>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 6, maxWidth: 440, margin: '6px auto 0' }}>
              The account for <strong>{formData.name}</strong> has been created and registered on the server. Returning to directory...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Avatar Upload Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              background: '#f8fafc',
              padding: 20,
              borderRadius: 12,
              border: '1px dashed #cbd5e1'
            }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #be123c',
                flexShrink: 0
              }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={38} color="#94a3b8" />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 4 }}>
                  Profile Photograph / Avatar
                </label>
                <p style={{ margin: '0 0 10px', fontSize: 12, color: '#64748b' }}>
                  Upload a high-resolution PNG or JPG portrait (max 5MB)
                </p>
                <label 
                  className="btn btn-secondary" 
                  style={{ 
                    cursor: 'pointer', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 8,
                    padding: '6px 14px',
                    fontSize: 12.5
                  }}
                >
                  <Upload size={14} /> Choose Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
                {imageFile && (
                  <span style={{ marginLeft: 12, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                    Selected: {imageFile.name}
                  </span>
                )}
              </div>
            </div>

            {/* General Info Grid */}
            <div className="modal-grid">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} color="#64748b" />
                  <span>Full Legal Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jannu"
                  className="form-control-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} color="#64748b" />
                  <span>Corporate Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="jannu@foodexpress.admin"
                  className="form-control-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={14} color="#64748b" />
                  <span>Contact Phone Number *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  className="form-control-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} color="#64748b" />
                  <span>Residential / Work Address *</span>
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

            {/* Department & Role Dropdowns (Populated via API) */}
            <div className="modal-grid">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={14} color="#64748b" />
                  <span>Assigned Department *</span>
                </label>
                {loadingLookups ? (
                  <div style={{ padding: '8px 12px', fontSize: 13, color: '#64748b' }}>
                    Loading departments...
                  </div>
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
                  <Shield size={14} color="#be123c" />
                  <span>Assign Administrative Role *</span>
                </label>
                {loadingLookups ? (
                  <div style={{ padding: '8px 12px', fontSize: 13, color: '#64748b' }}>
                    Loading roles...
                  </div>
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

            {/* Password Setup */}
            <div className="modal-grid">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={14} color="#64748b" />
                  <span>Account Password *</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  className="form-control-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={14} color="#64748b" />
                  <span>Confirm Password *</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  className="form-control-input"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 18 }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onBackToList}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={submitting || loadingLookups}
              >
                <UserPlus size={16} /> {submitting ? 'Creating Employee...' : 'Complete Employee Onboarding'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
