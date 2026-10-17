import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Plus, 
  Users, 
  Check, 
  X, 
  SlidersHorizontal, 
  Trash2, 
  Search, 
  AlertCircle,
  RefreshCw,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { URLS } from '../../url';
import RolePermissionsModal, { ALL_PERMISSIONS } from './RolePermissionsModal';
import { RBAC_MODULES, normalizePermissions } from '../../context/PermissionContext';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export default function EmployeeRole() {
  const [roles, setRoles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  // Fetch roles and staff list from live API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, staffRes] = await Promise.all([
        fetch(URLS.GetRole, {
          method: 'POST',
          headers: {
            authorization: getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }),
        fetch(URLS.GetEmpolyee, {
          method: 'POST',
          headers: {
            authorization: getAuthHeader(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        })
      ]);

      const rolesData = await rolesRes.json();
      const staffData = await staffRes.json();

      if (rolesRes.ok && rolesData.success !== false) {
        setRoles(rolesData.roles || rolesData.data || []);
      } else {
        throw new Error(rolesData.message || 'Failed to fetch roles');
      }

      if (staffRes.ok && staffData.success !== false) {
        setStaff(staffData.staff || staffData.data || []);
      }
    } catch (err) {
      console.error('Fetch roles error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteRole = async (role) => {
    const roleId = role._id || role.id;
    const assignedCount = staff.filter(s => s.roleId === roleId).length;

    let confirmMsg = `Are you sure you want to delete role "${role.roleName || role.title}"?`;
    if (assignedCount > 0) {
      confirmMsg += `\nWarning: There are currently ${assignedCount} active employee(s) assigned to this role!`;
    }

    if (!window.confirm(confirmMsg)) return;

    setDeletingId(roleId);
    try {
      const res = await fetch(`${URLS.DeleteRole}${roleId}`, {
        method: 'DELETE',
        headers: {
          authorization: getAuthHeader()
        }
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSuccessMsg(`Role "${role.roleName || role.title}" deleted successfully!`);
        fetchData();
      } else {
        throw new Error(data.message || 'Failed to delete role');
      }
    } catch (err) {
      console.error('Delete role error:', err);
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const filteredRoles = roles.filter(r => {
    const name = (r.roleName || r.title || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return name.includes(q);
  });

  return (
    <div>
      {/* Toast Notification */}
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
          <h1>Employee Roles & Access Control</h1>
          <p>Define administrative access levels, granular module permissions, and department privileges</p>
        </div>
        <div className="page-actions-block" style={{ display: 'flex', gap: 10 }}>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={fetchData}
            title="Refresh roles"
          >
            <RefreshCw size={15} /> Refresh
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleOpenCreate}
          >
            <Plus size={16} /> Create New Role
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card-container" style={{ padding: '12px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div className="topbar-search-box" style={{ width: 320, padding: '6px 12px' }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search role by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ fontSize: 13, color: '#64748b' }}>
            Showing <strong>{filteredRoles.length}</strong> of <strong>{roles.length}</strong> configured roles
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div className="card-container" style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px' }} />
          <p style={{ margin: 0 }}>Loading configured employee roles from server...</p>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="card-container" style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
          <Shield size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            {searchTerm ? `No roles matching "${searchTerm}"` : 'No Roles Defined Yet'}
          </h3>
          <p style={{ margin: '0 auto 16px', maxWidth: 400, fontSize: 13 }}>
            Create custom roles to assign tailored permissions for dispatchers, accountants, and staff members.
          </p>
          <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
            <Plus size={15} /> Define First Role
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {filteredRoles.map((role) => {
            const roleId = role._id || role.id;
            const assignedStaff = staff.filter(s => s.roleId === roleId);
            const assignedCount = assignedStaff.length;
            const rawPerms = Array.isArray(role.rolesAndPermission) 
              ? role.rolesAndPermission 
              : Array.isArray(role.permissions) 
                ? role.permissions 
                : [];
            const perms = rawPerms;
            const displayPermLabels = perms.map(p => {
              const matched = ALL_PERMISSIONS.find(item => item.id === p || item.label === p);
              return matched ? matched.label : p;
            });
            const normalizedPerms = normalizePermissions(rawPerms);

            const moduleSummaries = RBAC_MODULES.map(m => {
              const modPerms = normalizedPerms.filter(p => p.startsWith(`${m.id}:`));
              if (modPerms.length === 0) return null;
              const actions = modPerms.map(p => p.split(':')[1]);
              const isAll = m.actions.every(a => actions.includes(a.id));
              return {
                id: m.id,
                label: m.label,
                isAll,
                actionsStr: actions.map(act => act.charAt(0).toUpperCase()).join(', ')
              };
            }).filter(Boolean);

            return (
              <div 
                key={roleId} 
                className="card-container" 
                style={{ 
                  margin: 0, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: 12, 
                      background: '#fff1f2', 
                      color: '#be123c', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Shield size={22} />
                    </div>
                    <span 
                      className="badge badge-accepted" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 5,
                        background: assignedCount > 0 ? '#ecfdf5' : '#f1f5f9',
                        color: assignedCount > 0 ? '#047857' : '#64748b',
                        border: 'none',
                        fontWeight: 700
                      }}
                    >
                      <Users size={12} /> {assignedCount} {assignedCount === 1 ? 'Member' : 'Members'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                    {role.roleName || role.title}
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#64748b', marginBottom: 16 }}>
                    Status: <strong style={{ color: role.status === 'active' ? '#16a34a' : '#64748b' }}>{role.status || 'active'}</strong>
                  </p>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Granted Privileges:
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: '#be123c' }}>
                        {perms.length} {perms.length === 1 ? 'privilege' : 'privileges'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 48 }}>
                      {displayPermLabels.length === 0 ? (
                        <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                          No specific module permissions assigned yet.
                        </span>
                      ) : (
                        displayPermLabels.slice(0, 5).map((label, idx) => (
                          <span 
                            key={idx} 
                            style={{ 
                              background: '#f8fafc', 
                              border: '1px solid #e2e8f0', 
                              padding: '3px 8px', 
                              borderRadius: 6, 
                              fontSize: 11.5, 
                              color: '#334155',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Check size={11} color="#16a34a" /> {label}
                          </span>
                        ))
                      )}
                      {displayPermLabels.length > 5 && (
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          background: '#fff1f2',
                          color: '#be123c'
                        }}>
                          +{displayPermLabels.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  padding: '12px 20px', 
                  background: '#f8fafc', 
                  borderTop: '1px solid #e2e8f0', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                    onClick={() => handleOpenEdit(role)}
                  >
                    <SlidersHorizontal size={13} /> Configure Privileges
                  </button>

                  <button 
                    type="button" 
                    className="btn-icon" 
                    style={{ color: '#ef4444' }}
                    title="Delete Role"
                    disabled={deletingId === roleId}
                    onClick={() => handleDeleteRole(role)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Role Permissions Configuration / Creation Modal */}
      <RolePermissionsModal
        role={editingRole}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRole(null);
        }}
        onSuccess={(msg) => {
          setSuccessMsg(msg);
          fetchData();
        }}
        onError={(errMsg) => setError(errMsg)}
      />
    </div>
  );
}
