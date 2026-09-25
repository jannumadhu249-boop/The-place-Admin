import React, { useState } from 'react';
import { Shield, Plus, Users, Check, X, Lock, SlidersHorizontal } from 'lucide-react';
import { employeeRolesData } from '../../data/mockData';
import RolePermissionsModal from './RolePermissionsModal';

export default function EmployeeRole() {
  const [roles, setRoles] = useState(employeeRolesData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [configuringRole, setConfiguringRole] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreateRole = (e) => {
    e.preventDefault();
    if (!newTitle) return;
    const newRoleObj = {
      id: `ROLE-0${roles.length + 1}`,
      title: newTitle,
      description: newDesc,
      assignedEmployees: 0,
      permissions: [
        "View Dashboard & Financial Metrics",
        "View Live Order Pipelines",
        "Accept, Process & Cancel Orders",
        "Edit Food Menus & Stock Availability"
      ]
    };
    setRoles([...roles, newRoleObj]);
    setNewTitle('');
    setNewDesc('');
    setIsModalOpen(false);
  };

  const handleSavePermissions = (updatedRole) => {
    setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
    setConfiguringRole(null);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Employee Roles & Access Control</h1>
          <p>Define administrative access levels, granular module permissions, and department privileges</p>
        </div>
        <div className="page-actions-block">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} /> Create New Role
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {roles.map((role) => (
          <div key={role.id} className="card-container" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                <span className="badge badge-accepted" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users size={12} /> {role.assignedEmployees} Members
                </span>
              </div>

              <h3 style={{ fontSize: 16.5, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                {role.title}
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 18 }}>
                {role.description}
              </p>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Granted Privileges:
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#be123c' }}>
                    {role.permissions?.length || 0} active
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {role.permissions?.map((perm, idx) => (
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
                      <Check size={11} color="#16a34a" /> {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>ID: {role.id}</span>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '5px 12px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={() => setConfiguringRole(role)}
              >
                <SlidersHorizontal size={13} /> Configure Privileges
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Role Permissions Configuration Modal - Separate Component */}
      <RolePermissionsModal
        role={configuringRole}
        isOpen={Boolean(configuringRole)}
        onClose={() => setConfiguringRole(null)}
        onSave={handleSavePermissions}
      />

      {/* Add Role Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Define New Employee Role</h3>
              <button type="button" className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRole}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label>Role Title / Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Quality Assurance Inspector"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="form-control-input"
                  />
                </div>

                <div className="form-group">
                  <label>Role Description & Scope</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe responsibilities and oversight level..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="form-control-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
