import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Shield, Check, Lock, AlertCircle } from 'lucide-react';

const ALL_AVAILABLE_PERMISSIONS = [
  { id: 'dashboard', label: 'View Dashboard & Financial Metrics', category: 'Analytics' },
  { id: 'orders_view', label: 'View Live Order Pipelines', category: 'Orders' },
  { id: 'orders_action', label: 'Accept, Process & Cancel Orders', category: 'Orders' },
  { id: 'orders_refund', label: 'Issue Customer Refunds & Offline Overrides', category: 'Orders' },
  { id: 'restaurants_manage', label: 'Onboard & Edit Restaurant Merchants', category: 'Merchants' },
  { id: 'restaurants_commission', label: 'Adjust Platform Commission Rates', category: 'Merchants' },
  { id: 'food_catalog', label: 'Edit Food Menus & Stock Availability', category: 'Catalog' },
  { id: 'zones_geofence', label: 'Configure Delivery Zones & GPS Polygons', category: 'Logistics' },
  { id: 'delivery_dispatch', label: 'Dispatch Couriers & Assign Transit Runs', category: 'Logistics' },
  { id: 'marketing_coupons', label: 'Create & Publish Promotional Coupons', category: 'Marketing' },
  { id: 'marketing_banners', label: 'Publish App Hero Banners & Carousels', category: 'Marketing' },
  { id: 'notifications_push', label: 'Broadcast Push Alerts to Customers', category: 'Marketing' },
  { id: 'finance_disbursement', label: 'Approve & Release Merchant Payouts', category: 'Finance' },
  { id: 'finance_reports', label: 'Export Tax, Sales & Ledger Reports', category: 'Finance' },
  { id: 'security_employees', label: 'Manage Staff Profiles & Role Privileges', category: 'Security' }
];

export default function RolePermissionsModal({ role, isOpen, onClose, onSave }) {
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    if (role) {
      // If role already has permissions string array, match or include them
      const initial = role.permissions || [];
      setSelectedPermissions([...initial]);
    }
  }, [role]);

  if (!isOpen || !role) return null;

  const togglePermission = (permLabel) => {
    if (selectedPermissions.includes(permLabel)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permLabel));
    } else {
      setSelectedPermissions([...selectedPermissions, permLabel]);
    }
  };

  const handleSelectAll = () => {
    setSelectedPermissions(ALL_AVAILABLE_PERMISSIONS.map(p => p.label));
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...role,
      permissions: selectedPermissions
    });
    onClose();
  };

  // Group by category
  const categories = Array.from(new Set(ALL_AVAILABLE_PERMISSIONS.map(p => p.category)));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
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
              <Shield size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17 }}>Role Access Privileges & Permissions</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                {role.title} &bull; ({selectedPermissions.length} permissions granted)
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '16px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 12.5, color: '#64748b' }}>
                Toggle individual module permissions for staff members assigned to this role.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: 11.5 }}
                  onClick={handleSelectAll}
                >
                  Select All
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: 11.5 }}
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {categories.map((cat) => {
                const permsInCat = ALL_AVAILABLE_PERMISSIONS.filter(p => p.category === cat);
                return (
                  <div key={cat} style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#be123c',
                      marginBottom: 10
                    }}>
                      {cat} Module
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                      {permsInCat.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.label);
                        return (
                          <label
                            key={perm.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              background: isChecked ? '#ffffff' : 'transparent',
                              padding: '8px 12px',
                              borderRadius: 8,
                              border: isChecked ? '1px solid #be123c' : '1px solid #e2e8f0',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.label)}
                              style={{ width: 16, height: 16, accentColor: '#be123c' }}
                            />
                            <span style={{ fontSize: 13, fontWeight: isChecked ? 600 : 400, color: isChecked ? '#0f172a' : '#475569' }}>
                              {perm.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={15} /> Save Role Privileges
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
