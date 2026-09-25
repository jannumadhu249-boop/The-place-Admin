import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Upload, Shield, CheckCircle, Lock } from 'lucide-react';

export default function AddNewEmployee({ onBackToList, onEmployeeCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Operations & Order Manager',
    department: 'Dispatch & Operations',
    password: '',
    confirmPassword: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const newEmp = {
      id: `EMP-00${Math.floor(Math.random() * 900) + 100}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      department: formData.department,
      joinedDate: 'Just Now',
      status: 'Active',
      avatar: formData.avatar
    };

    if (onEmployeeCreated) {
      onEmployeeCreated(newEmp);
    }

    setSubmitted(true);
    setTimeout(() => {
      onBackToList();
    }, 1200);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <button 
            type="button" 
            onClick={onBackToList}
            className="btn btn-secondary" 
            style={{ marginBottom: 12, padding: '6px 12px', fontSize: 13 }}
          >
            <ArrowLeft size={16} /> Back to Employee List
          </button>
          <h1>Onboard New Employee</h1>
          <p>Create a dedicated administrative profile with customizable privilege sets</p>
        </div>
      </div>

      <div className="card-container" style={{ maxWidth: 840, margin: '0 auto' }}>
        <div className="card-header">
          <h3>Employee Information Form</h3>
        </div>

        {submitted ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <CheckCircle size={48} color="#16a34a" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Employee Profile Created!</h3>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>
              The profile for <strong>{formData.name}</strong> has been created and login credentials dispatched.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Avatar Selection */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: '#f8fafc', padding: 18, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <img 
                src={formData.avatar} 
                alt="Avatar Preview" 
                style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '2px solid #be123c' }} 
              />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 4 }}>
                  Profile Image URL
                </label>
                <input
                  type="url"
                  className="form-control-input"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            {/* General Info Grid */}
            <div className="modal-grid">
              <div className="form-group">
                <label>Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Victoria Sterling"
                  className="form-control-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Corporate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="v.sterling@foodexpress.admin"
                  className="form-control-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Contact Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  className="form-control-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  className="form-control-input"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Dispatch & Operations">Dispatch & Operations</option>
                  <option value="Finance & Accounting">Finance & Accounting</option>
                  <option value="Marketing & Growth">Marketing & Growth</option>
                  <option value="Customer Care">Customer Care</option>
                  <option value="Executive Management">Executive Management</option>
                </select>
              </div>
            </div>

            {/* Role & Access Tier */}
            <div className="form-group">
              <label>Assign Administrative Role</label>
              <select
                className="form-control-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Super Administrator">Super Administrator (Full Master Privileges)</option>
                <option value="Operations & Order Manager">Operations & Order Manager</option>
                <option value="Financial Controller & Auditor">Financial Controller & Auditor</option>
                <option value="Catalog & Menu Specialist">Catalog & Menu Specialist</option>
                <option value="Customer Support Representative">Customer Support Representative</option>
              </select>
            </div>

            {/* Password Setup */}
            <div className="modal-grid">
              <div className="form-group">
                <label>Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-control-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-control-input"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={onBackToList}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                <UserPlus size={16} /> Complete Employee Onboarding
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
