import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  CheckCircle, 
  Shield, 
  Check, 
  Search, 
  SlidersHorizontal, 
  LayoutDashboard, 
  ShoppingBag, 
  Store, 
  UtensilsCrossed, 
  MapPin, 
  Ticket, 
  Landmark, 
  Users, 
  FileText,
  Sparkles,
  RotateCcw,
  CheckCheck
} from 'lucide-react';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export const ALL_PERMISSIONS = [
  // Overview & Analytics
  { id: 'dashboard:view', label: 'View Analytics Dashboard', desc: 'Real-time sales revenue, KPI charts & activity summary', category: 'Overview & Analytics', icon: LayoutDashboard },
  { id: 'reports:view', label: 'View & Export Reports', desc: 'Download sales, commission, tax & audit transaction ledgers', category: 'Overview & Analytics', icon: LayoutDashboard },

  // Orders & Deliveries
  { id: 'orders:view', label: 'Live Order Pipeline', desc: 'Monitor active, placed, pending & live order feeds', category: 'Orders & Deliveries', icon: ShoppingBag },
  { id: 'orders:manage', label: 'Process & Cancel Orders', desc: 'Accept incoming orders, assign dispatch & process refunds', category: 'Orders & Deliveries', icon: ShoppingBag },
  { id: 'delivery:tracking', label: 'Courier Dispatch & Tracking', desc: 'Live GPS courier runs and delivery partner assignments', category: 'Orders & Deliveries', icon: ShoppingBag },

  // Food & Catalog
  { id: 'categories:manage', label: 'Manage Categories & Cuisines', desc: 'Create, reorder and update catalog categories and cuisines', category: 'Catalog & Menu', icon: UtensilsCrossed },
  { id: 'subcategories:manage', label: 'Manage Sub-Categories', desc: 'Create and organize hierarchical subcategories', category: 'Catalog & Menu', icon: UtensilsCrossed },
  { id: 'food:manage', label: 'Food Items & Availability', desc: 'Add dishes, pricing, dietary flags and toggle inventory', category: 'Catalog & Menu', icon: UtensilsCrossed },

  // Merchants & Restaurants
  { id: 'restaurants:view', label: 'View Restaurant Outlets', desc: 'Explore approved and pending restaurant branch listings', category: 'Merchants & Outlets', icon: Store },
  { id: 'restaurants:manage', label: 'Onboard & Edit Merchants', desc: 'Approve new vendors, modify contact details & store hours', category: 'Merchants & Outlets', icon: Store },
  { id: 'restaurants:commission', label: 'Set Commission Rates', desc: 'Configure customized platform commission percentages', category: 'Merchants & Outlets', icon: Store },

  // Marketing & Campaigns
  { id: 'coupons:manage', label: 'Promotional Coupons', desc: 'Publish, schedule and retire discount promo vouchers', category: 'Marketing & Retention', icon: Ticket },
  { id: 'banners:manage', label: 'Hero Banners & Carousels', desc: 'Update mobile application promotion banners and links', category: 'Marketing & Retention', icon: Ticket },
  { id: 'notifications:send', label: 'Push Broadcast Notifications', desc: 'Send marketing and emergency push messages to users', category: 'Marketing & Retention', icon: Ticket },

  // Logistics & Zones
  { id: 'zone:setup', label: 'Delivery Zones & Geofencing', desc: 'Configure map polygon zones, surge fees and coverage areas', category: 'Logistics & Geography', icon: MapPin },

  // Finance & Disbursements
  { id: 'disbursement:view', label: 'View Payout Requests', desc: 'Inspect pending restaurant and courier payment settlements', category: 'Finance & Disbursements', icon: Landmark },
  { id: 'disbursement:manage', label: 'Approve & Release Funds', desc: 'Authorize batch bank disbursements and payment receipts', category: 'Finance & Disbursements', icon: Landmark },

  // Team & Administration
  { id: 'employee:view', label: 'View Staff Directory', desc: 'Browse internal staff members and contact profiles', category: 'Team & Security', icon: Users },
  { id: 'employee:manage', label: 'Add & Manage Employees', desc: 'Onboard new staff, change passwords and deactivate access', category: 'Team & Security', icon: Users },
  { id: 'roles:manage', label: 'Role-Based Access Control', desc: 'Create and adjust roles and granular security privileges', category: 'Team & Security', icon: Users },
  { id: 'departments:manage', label: 'Department Configuration', desc: 'Create and organize corporate departmental divisions', category: 'Team & Security', icon: Users },

  // Pages & Support
  { id: 'faqs:manage', label: 'Help Center & FAQs', desc: 'Manage frequently asked questions and user knowledge base', category: 'Pages & Support', icon: FileText },
  { id: 'content:manage', label: 'About, Contact & Legal Policies', desc: 'Update terms of service, privacy policy and refund policies', category: 'Pages & Support', icon: FileText }
];

export default function RolePermissionsModal({ role, isOpen, onClose, onSuccess, onError }) {
  const isEditing = Boolean(role && (role._id || role.id));
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (isOpen) {
      if (role && (role._id || role.id)) {
        setRoleName(role.roleName || role.title || '');
        setStatus(role.status || 'active');
        const rawPerms = Array.isArray(role.rolesAndPermission) 
          ? role.rolesAndPermission 
          : Array.isArray(role.permissions) 
            ? role.permissions 
            : [];
        // Match against IDs or labels
        const initialIds = ALL_PERMISSIONS
          .filter(p => rawPerms.includes(p.id) || rawPerms.includes(p.label))
          .map(p => p.id);
        setSelectedPermissions(initialIds);
      } else {
        setRoleName('');
        setStatus('active');
        setSelectedPermissions([]);
      }
      setSearchQuery('');
    }
  }, [role, isOpen]);

  const filteredPermissions = useMemo(() => {
    if (!searchQuery.trim()) return ALL_PERMISSIONS;
    const q = searchQuery.toLowerCase();
    return ALL_PERMISSIONS.filter(p => 
      p.label.toLowerCase().includes(q) || 
      p.desc.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const togglePermission = (permId) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPermissions(ALL_PERMISSIONS.map(p => p.id));
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  const applyPreset = (presetType) => {
    switch (presetType) {
      case 'superadmin':
        handleSelectAll();
        break;
      case 'operations':
        setSelectedPermissions([
          'dashboard:view',
          'orders:view',
          'orders:manage',
          'delivery:tracking',
          'food:manage',
          'restaurants:view',
          'faqs:manage'
        ]);
        break;
      case 'finance':
        setSelectedPermissions([
          'dashboard:view',
          'reports:view',
          'disbursement:view',
          'disbursement:manage',
          'restaurants:commission'
        ]);
        break;
      case 'marketing':
        setSelectedPermissions([
          'dashboard:view',
          'coupons:manage',
          'banners:manage',
          'notifications:send'
        ]);
        break;
      case 'readonly':
        setSelectedPermissions([
          'dashboard:view',
          'reports:view',
          'orders:view',
          'restaurants:view',
          'employee:view'
        ]);
        break;
      default:
        break;
    }
  };

  const categories = Array.from(new Set(ALL_PERMISSIONS.map(p => p.category)));

  const toggleCategory = (catName) => {
    const catPermIds = ALL_PERMISSIONS.filter(p => p.category === catName).map(p => p.id);
    const allSelected = catPermIds.every(id => selectedPermissions.includes(id));
    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !catPermIds.includes(id)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...catPermIds])));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      onError && onError('Please enter a valid role name.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        roleName: roleName.trim(),
        rolesAndPermission: selectedPermissions
      };

      const url = isEditing 
        ? `${URLS.UpdateRole}${role._id || role.id}` 
        : URLS.CreateRole;
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          authorization: getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        onSuccess && onSuccess(isEditing ? 'Role updated successfully!' : 'Role created successfully!');
        onClose();
      } else {
        throw new Error(data.message || `Failed to ${isEditing ? 'update' : 'create'} role`);
      }
    } catch (err) {
      console.error('Role submit error:', err);
      onError && onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: 840, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#fff1f2',
              color: '#be123c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                {isEditing ? `Configure Privileges — ${role.roleName || role.title}` : 'Define New Administrative Role'}
              </h3>
              <p style={{ margin: 0, fontSize: 12.5, color: '#64748b' }}>
                Assign granular module-level authorization and system execution rights
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div 
            className="modal-body" 
            style={{ 
              overflowY: 'auto', 
              padding: '20px 24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 20 
            }}
          >
            {/* Role Name Input & Status */}
            <div className="modal-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div className="form-group">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  Role Title / Designation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Operations Dispatcher"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="form-control-input"
                  style={{ fontWeight: 600 }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  Active Privileges Count
                </label>
                <div style={{
                  padding: '9px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  color: selectedPermissions.length > 0 ? '#be123c' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <Shield size={16} />
                  <span>{selectedPermissions.length} / {ALL_PERMISSIONS.length} Privileges Granted</span>
                </div>
              </div>
            </div>

            {/* Presets and Filter Bar */}
            <div style={{ 
              background: '#f8fafc', 
              borderRadius: 12, 
              border: '1px solid #e2e8f0', 
              padding: '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Sparkles size={14} color="#be123c" />
                  <span>Quick Privilege Presets:</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => applyPreset('superadmin')}
                  >
                    All Permissions
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => applyPreset('operations')}
                  >
                    Operations Lead
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => applyPreset('finance')}
                  >
                    Finance & Accounts
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => applyPreset('marketing')}
                  >
                    Marketing Lead
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => applyPreset('readonly')}
                  >
                    Read Only
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 12, color: '#dc2626' }}
                    onClick={handleClearAll}
                    title="Deselect all permissions"
                  >
                    <RotateCcw size={12} /> Clear
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
                <input
                  type="text"
                  placeholder="Filter module permissions (e.g. orders, coupons, disbursements, catalog)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control-input"
                  style={{ paddingLeft: 36, background: '#ffffff', fontSize: 13 }}
                />
              </div>
            </div>

            {/* Permission Categories Accordion / Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {categories.map((catName) => {
                const permsInCat = filteredPermissions.filter(p => p.category === catName);
                if (permsInCat.length === 0) return null;

                const allCatIds = ALL_PERMISSIONS.filter(p => p.category === catName).map(p => p.id);
                const isCatFullySelected = allCatIds.every(id => selectedPermissions.includes(id));
                const catSelectedCount = allCatIds.filter(id => selectedPermissions.includes(id)).length;

                return (
                  <div 
                    key={catName} 
                    style={{ 
                      border: '1px solid #e2e8f0', 
                      borderRadius: 12, 
                      overflow: 'hidden',
                      background: '#ffffff',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    {/* Category Header */}
                    <div style={{
                      padding: '12px 16px',
                      background: '#f8fafc',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                          {catName}
                        </span>
                        <span style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: catSelectedCount > 0 ? '#fff1f2' : '#f1f5f9',
                          color: catSelectedCount > 0 ? '#be123c' : '#64748b'
                        }}>
                          {catSelectedCount} of {allCatIds.length} enabled
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCategory(catName)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600,
                          color: isCatFullySelected ? '#dc2626' : '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {isCatFullySelected ? 'Deselect Category' : 'Select All In Category'}
                      </button>
                    </div>

                    {/* Permissions Grid */}
                    <div style={{ 
                      padding: 16, 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                      gap: 12 
                    }}>
                      {permsInCat.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.id);
                        const Icon = perm.icon || Shield;

                        return (
                          <div
                            key={perm.id}
                            onClick={() => togglePermission(perm.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 12,
                              padding: '10px 14px',
                              borderRadius: 10,
                              border: isChecked ? '1px solid #be123c' : '1px solid #e2e8f0',
                              background: isChecked ? '#fff1f215' : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // handled by parent onClick
                              style={{ width: 17, height: 17, accentColor: '#be123c', marginTop: 3, cursor: 'pointer' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontSize: 13, 
                                fontWeight: 600, 
                                color: isChecked ? '#0f172a' : '#334155',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                              }}>
                                <span>{perm.label}</span>
                              </div>
                              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.35 }}>
                                {perm.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer" style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <CheckCircle size={15} /> {submitting ? 'Saving Role...' : isEditing ? 'Save Role Changes' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
