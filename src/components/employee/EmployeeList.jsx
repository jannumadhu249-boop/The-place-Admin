import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Edit2, 
  Trash2, 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Building2,
  Filter,
  User,
  MapPin,
  Calendar
} from 'lucide-react';
import { URLS } from '../../url';
import EditEmployeeModal from './EditEmployeeModal';

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

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export default function EmployeeList({ onNavigateAdd }) {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Auto-clear toast
  useEffect(() => {
    if (successMsg || error) {
      const t = setTimeout(() => {
        setSuccessMsg(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg, error]);

  // Fetch employees and lookups
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, deptsRes, rolesRes] = await Promise.all([
        fetch(URLS.GetEmpolyee, {
          method: 'POST',
          headers: {
            authorization: getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }),
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

      const empData = await empRes.json();
      const deptsData = await deptsRes.json();
      const rolesData = await rolesRes.json();

      if (empRes.ok && empData.success !== false) {
        setEmployees(empData.staff || empData.data || []);
      } else {
        throw new Error(empData.message || 'Failed to fetch employees');
      }

      if (deptsRes.ok) {
        setDepartments(deptsData.departments || deptsData.data || []);
      }
      if (rolesRes.ok) {
        setRoles(rolesData.roles || rolesData.data || []);
      }
    } catch (err) {
      console.error('Fetch employee list error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Toggle Status
  const toggleStatus = async (emp) => {
    const id = emp._id || emp.id;
    const currentStatus = (emp.status || 'active').toLowerCase();
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setActionLoadingId(id);

    try {
      const fd = new FormData();
      fd.append('status', newStatus);
      fd.append('name', emp.name || '');
      fd.append('phone', emp.phone || '');
      fd.append('email', emp.email || '');
      fd.append('departmentId', emp.departmentId || '');
      fd.append('roleId', emp.roleId || '');
      fd.append('address', emp.address || '');

      const res = await fetch(`${URLS.UpdateEmpolyee}${id}`, {
        method: 'PUT',
        headers: {
          authorization: getAuthHeader()
        },
        body: fd
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSuccessMsg(`Status for "${emp.name}" changed to ${newStatus}.`);
        setEmployees(prev => prev.map(item => 
          (item._id === id || item.id === id) ? { ...item, status: newStatus } : item
        ));
      } else {
        throw new Error(data.message || 'Failed to update employee status');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete employee
  const handleDelete = async (emp) => {
    const id = emp._id || emp.id;
    if (!window.confirm(`Are you sure you want to delete employee "${emp.name}"? This action cannot be reversed.`)) {
      return;
    }

    setActionLoadingId(id);
    try {
      const res = await fetch(`${URLS.DeleteEmpolyee}${id}`, {
        method: 'DELETE',
        headers: {
          authorization: getAuthHeader()
        }
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSuccessMsg(`Employee "${emp.name}" was removed successfully.`);
        setEmployees(prev => prev.filter(e => (e._id !== id && e.id !== id)));
      } else {
        throw new Error(data.message || 'Failed to delete employee');
      }
    } catch (err) {
      console.error('Delete employee error:', err);
      setError(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveEmployee = () => {
    setSuccessMsg('Employee details updated successfully!');
    setEditingEmployee(null);
    fetchEmployees();
  };

  // Filtering
  const filtered = employees.filter((emp) => {
    const q = searchTerm.toLowerCase();
    const name = (emp.name || '').toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const phone = (emp.phone || '').toLowerCase();
    const roleName = (emp.roleName || emp.role || '').toLowerCase();
    const deptName = (emp.departmentName || emp.department || '').toLowerCase();
    const address = (emp.address || '').toLowerCase();

    const matchesSearch = name.includes(q) || email.includes(q) || phone.includes(q) || roleName.includes(q) || deptName.includes(q) || address.includes(q);
    const matchesDept = selectedDept === 'ALL' || emp.departmentId === selectedDept;
    const matchesRole = selectedRole === 'ALL' || emp.roleId === selectedRole;
    const matchesStatus = selectedStatus === 'ALL' || (emp.status || 'active').toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  return (
    <div>
      {/* Toast Alert */}
      {successMsg && (
        <div style={{
          marginBottom: 16,
          padding: '12px 18px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 8,
          color: '#15803d',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13.5,
          fontWeight: 600
        }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{
          marginBottom: 16,
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

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-block">
          <h1>Employee Directory</h1>
          <p>Active corporate administrators, operational dispatchers, and support personnel</p>
        </div>
        <div className="page-actions-block" style={{ display: 'flex', gap: 10 }}>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={fetchEmployees}
            title="Refresh employees"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={onNavigateAdd}
          >
            <Plus size={16} /> Add New Employee
          </button>
        </div>
      </div>

      <div className="card-container">
        {/* Header & Filter Controls */}
        <div className="card-header" style={{ flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h3>All Staff Members ({filtered.length})</h3>
            <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
              Manage access permissions and internal personnel profiles
            </p>
          </div>

          <div className="card-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Search Box */}
            <div className="topbar-search-box" style={{ width: 220, padding: '6px 12px' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search name, phone, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Department Filter */}
            <select
              className="form-control-input"
              style={{ width: 'auto', padding: '6px 10px', fontSize: 12.5 }}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.departmentName || d.name}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              className="form-control-input"
              style={{ width: 'auto', padding: '6px 10px', fontSize: 12.5 }}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              {roles.map(r => (
                <option key={r._id || r.id} value={r._id || r.id}>
                  {r.roleName || r.title}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="form-control-input"
              style={{ width: 'auto', padding: '6px 10px', fontSize: 12.5 }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Assigned Role</th>
                <th>Department</th>
                <th>Contact Info</th>
                <th>Location / Address</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
                    <RefreshCw size={22} className="spin" style={{ margin: '0 auto 10px' }} />
                    <p style={{ margin: 0, fontSize: 13 }}>Loading employee records from server...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
                    <User size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                    <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                      {searchTerm || selectedDept !== 'ALL' || selectedRole !== 'ALL' || selectedStatus !== 'ALL'
                        ? 'No employee profiles match the current filters.'
                        : 'No employee accounts registered yet.'}
                    </p>
                    <button type="button" className="btn btn-primary" onClick={onNavigateAdd}>
                      <Plus size={15} /> Add First Employee
                    </button>
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => {
                  const id = emp._id || emp.id;
                  const isActive = (emp.status || 'active').toLowerCase() === 'active';
                  const avatarUrl = getImageUrl(emp.image);

                  return (
                    <tr key={id}>
                      <td>
                        <div className="table-entity-cell">
                          {avatarUrl ? (
                            <img 
                              src={avatarUrl} 
                              alt={emp.name} 
                              className="entity-thumb"
                              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #be123c' }} 
                            />
                          ) : (
                            <div style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: '#fff1f2',
                              color: '#be123c',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 14
                            }}>
                              {(emp.name || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="entity-info">
                            <h5 style={{ fontWeight: 700, color: '#0f172a' }}>{emp.name}</h5>
                            {/* <p style={{ fontSize: 11, color: '#94a3b8' }}>ID: {id.slice(-6)}</p> */}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 6,
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: '#0f172a',
                          background: '#fff1f2',
                          padding: '3px 8px',
                          borderRadius: 6
                        }}>
                          <Shield size={13} color="#be123c" /> {emp.roleName || emp.role || 'Staff Member'}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: 13, color: '#334155', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <Building2 size={13} color="#0284c7" />
                          {emp.departmentName || emp.department || '—'}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: 12.5, color: '#0f172a', fontWeight: 600 }}>{emp.email}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{emp.phone}</div>
                      </td>

                      <td>
                        <span style={{ fontSize: 12.5, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} color="#64748b" /> {emp.address || '—'}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontSize: 12, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} color="#64748b" /> {formatDate(emp.logCreatedDate || emp.joinedDate)}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <label className="toggle-switch">
                            <input 
                              type="checkbox" 
                              checked={isActive}
                              disabled={actionLoadingId === id}
                              onChange={() => toggleStatus(emp)}
                            />
                            <span className="slider"></span>
                          </label>
                          <span style={{ 
                            fontSize: 11.5, 
                            fontWeight: 700, 
                            color: isActive ? '#16a34a' : '#dc2626' 
                          }}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button 
                            type="button" 
                            className="btn-icon"
                            title="Edit Employee Profile"
                            onClick={() => setEditingEmployee(emp)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            type="button" 
                            className="btn-icon" 
                            title="Delete Employee"
                            disabled={actionLoadingId === id}
                            onClick={() => handleDelete(emp)}
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        employee={editingEmployee}
        isOpen={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        onSave={handleSaveEmployee}
        onError={(errMsg) => setError(errMsg)}
      />
    </div>
  );
}
