import React, { useState, useEffect, useCallback } from 'react';
import {
  Users as UsersIcon,
  Search,
  RefreshCw,
  Download,
  Eye,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Phone,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Unlock,
  X
} from 'lucide-react';
import UserDetailsModal from './UserDetailsModal';
import { URLS } from '../../url';
import { exportToExcel } from '../../utils/excelExport';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWJkM2RkYjAzMGEyODdlMzhhMWRlZmYiLCJwaG9uZSI6Ijg1MDAyNDEwOTMiLCJpYXQiOjE3OTA3ODcwNDUsImV4cCI6MTgyMjMyMzA0NX0.8Y91D3P6whWIu8Cy2hCO-ivQiIwHXPhPQ41DznvwomM';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

const getImageUrl = (path) => {
  if (!path || typeof path !== 'string' || path.trim() === '') return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = (URLS.ImageUrl || URLS.Base || '').replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [userExcell, setUserExcell] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  // Status updating / toggling state
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Block Prompt Modal
  const [blockingTarget, setBlockingTarget] = useState(null);
  const [blockReasonInput, setBlockReasonInput] = useState('');

  // Unblock Confirm Modal
  const [unblockTarget, setUnblockTarget] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch Users using Get User curl
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(URLS.GetUsers, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        const list = Array.isArray(data)
          ? data
          : data.user || data.users || data.data || [];
        setUsers(list);
        setUserExcell(data.userExcell || []);
      } else {
        showToast(data.message || 'Failed to fetch customer directory', 'error');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      showToast('Network error loading customer list', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update User Status (active <-> blocked)
  const handleUpdateStatus = async (user, nextStatus, reason = '') => {
    const userId = user._id;
    setUpdatingId(userId);
    try {
      // Build payload — only include blockedReason when blocking
      const payload = { userId, status: nextStatus };
      if (nextStatus === 'blocked') {
        payload.blockedReason = reason || 'Blocked by administrator';
      }

      const res = await fetch(URLS.UpdateUserStatus, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId
              ? { ...u, status: nextStatus, blockedReason: nextStatus === 'blocked' ? reason : '' }
              : u
          )
        );
        showToast(
          nextStatus === 'blocked'
            ? `Customer ${user.name || user.phone} has been blocked successfully!`
            : `Customer ${user.name || user.phone} has been activated successfully!`
        );
        // Close whichever modal was open
        setBlockingTarget(null);
        setBlockReasonInput('');
        setUnblockTarget(null);
      } else {
        showToast(data.message || 'Failed to update user status', 'error');
      }
    } catch {
      showToast('Network error while updating user status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleClick = (user) => {
    if (user.status === 'blocked') {
      // Show unblock confirmation modal
      setUnblockTarget(user);
    } else {
      // Show block reason prompt
      setBlockingTarget(user);
      setBlockReasonInput('');
    }
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const nameMatch = (u.name || '').toLowerCase().includes(q);
    const phoneMatch = (u.phone || '').toLowerCase().includes(q);
    const emailMatch = (u.email || '').toLowerCase().includes(q);
    const addrMatch = (u.address || '').toLowerCase().includes(q);
    const matchesSearch = nameMatch || phoneMatch || emailMatch || addrMatch;

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'active' && u.status !== 'blocked') ||
      (statusFilter === 'blocked' && u.status === 'blocked');

    return matchesSearch && matchesStatus;
  });

  const activeCount = users.filter((u) => u.status !== 'blocked').length;
  const blockedCount = users.filter((u) => u.status === 'blocked').length;

  const handleExportXLSX = () => {
    if (!users.length && !userExcell.length) {
      alert('No customer records to export.');
      return;
    }

    let exportRows = [];

    if (userExcell && userExcell.length > 0) {
      exportRows = userExcell.map((item, idx) => {
        const match = users.find(
          (u) => (u.phone && u.phone === item.phone) || (u.email && u.email === item.email)
        ) || users[idx];

        return {
          'Name': item.name || match?.name || '',
          'Phone Number': item.phone || match?.phone || '',
          'Email': item.email || match?.email || '',
          'Address': match?.address || '',
          'Status': match?.status || 'active',
          'Registered Date': match?.date || (match?.logCreatedDate ? match.logCreatedDate.split('T')[0] : '') || '',
          'Registered Time': match?.time || ''
        };
      });
    } else {
      exportRows = filteredUsers.map((u) => ({
        'Name': u.name || '',
        'Phone Number': u.phone || '',
        'Email': u.email || '',
        'Address': u.address || '',
        'Status': u.status || 'active',
        'Registered Date': u.date || (u.logCreatedDate ? u.logCreatedDate.split('T')[0] : '') || '',
        'Registered Time': u.time || ''
      }));
    }

    exportToExcel(exportRows, 'customers_export', 'Customers');
  };

  return (
    <div>
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 20px',
            borderRadius: 10,
            background: toastType === 'error' ? '#ef4444' : '#10b981',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            fontWeight: 600,
            fontSize: 14,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {toastType === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-block">
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
              <UsersIcon size={20} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22 }}>Customer Management</h1>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                Manage registered user accounts, contact profiles, and security access
              </p>
            </div>
          </div>
        </div>

        <div className="page-actions-block" style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchUsers}
            disabled={loading}
            title="Refresh customer directory"
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportXLSX}
            title="Export customer list to Excel (.xlsx)"
          >
            <Download size={15} /> Export XLSX
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="metrics-grid" style={{ marginBottom: 20 }}>
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <UsersIcon size={20} />
            </div>
            <span className="metric-badge-trend trend-up">Registered</span>
          </div>
          <div>
            <div className="metric-val">{users.length}</div>
            <div className="metric-title">Total Customers</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <ShieldCheck size={20} />
            </div>
            <span className="metric-badge-trend trend-up">Active</span>
          </div>
          <div>
            <div className="metric-val">{activeCount}</div>
            <div className="metric-title">Active Accounts</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <ShieldAlert size={20} />
            </div>
            <span className="metric-badge-trend" style={{ background: '#fee2e2', color: '#b91c1c' }}>
              Restricted
            </span>
          </div>
          <div>
            <div className="metric-val">{blockedCount}</div>
            <div className="metric-title">Blocked Accounts</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-container">
        {/* Table Toolbar */}
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, padding: '16px 20px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className={`toolbar-tab-item ${statusFilter === 'All' ? 'active' : ''}`}
              onClick={() => setStatusFilter('All')}
              style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13 }}
            >
              All Customers ({users.length})
            </button>
            <button
              type="button"
              className={`toolbar-tab-item ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
              style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13 }}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              className={`toolbar-tab-item ${statusFilter === 'blocked' ? 'active' : ''}`}
              onClick={() => setStatusFilter('blocked')}
              style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13 }}
            >
              Blocked ({blockedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="card-header-actions">
            <div className="topbar-search-box" style={{ width: 280, padding: '6px 12px' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search name, phone, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Physical Address</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'center' }}>Actions (Active / Block)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 10 }} />
                    <p style={{ margin: 0, fontSize: 13.5 }}>Fetching customer directory...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>
                      No customer accounts found matching your filter.
                    </div>
                    <p style={{ fontSize: 12.5, marginTop: 4 }}>
                      Adjust search keywords or check back later
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const avatar = getImageUrl(u.image);
                  const isBlocked = u.status === 'blocked';
                  const isUpdating = updatingId === u._id;

                  return (
                    <tr key={u._id}>
                      {/* 1. Image */}
                      <td>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: '#f1f5f9',
                            border: '1.5px solid #e2e8f0',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {avatar ? (
                            <img
                              src={avatar}
                              alt={u.name || 'User'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <User size={20} color="#94a3b8" />
                          )}
                        </div>
                      </td>
                      {/* 2. Name */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                            {u.name || 'Unregistered'}
                          </span>
                          {u.email && (
                            <span style={{ fontSize: 11.5, color: '#64748b' }}>
                              {u.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Phone Number */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#0f172a' }}>
                          <Phone size={13} color="#94a3b8" />
                          <span>{u.phone || 'N/A'}</span>
                        </div>
                      </td>
                      {/* 4. Address */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, maxWidth: 260 }}>
                          <MapPin size={14} color="#be123c" style={{ flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: 13, color: '#334155' }}>
                            {u.address || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No address provided</span>}
                          </span>
                        </div>
                      </td>

                      {/* 5. Status */}
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '3px 10px',
                            borderRadius: 14,
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            background: isBlocked ? '#fef2f2' : '#f0fdf4',
                            color: isBlocked ? '#dc2626' : '#15803d',
                            border: `1px solid ${isBlocked ? '#fecdd3' : '#bbf7d0'}`
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: isBlocked ? '#dc2626' : '#16a34a'
                            }}
                          />
                          {u.status || 'active'}
                        </span>
                        {isBlocked && u.blockedReason && (
                          <div style={{ fontSize: 11, color: '#be123c', marginTop: 3, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.blockedReason}
                          </div>
                        )}
                      </td>

                      {/* 6. Actions (Active and block) */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          {/* Live Toggle Switch */}
                          {/* <label className="toggle-switch" title={isBlocked ? 'Click to unblock' : 'Click to block'}>
                            <input
                              type="checkbox"
                              checked={!isBlocked}
                              disabled={isUpdating}
                              onChange={() => handleToggleClick(u)}
                            />
                            <span className="slider"></span>
                          </label> */}

                          {/* Quick Action Button */}
                          {isBlocked ? (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{
                                padding: '5px 10px',
                                fontSize: 12,
                                background: '#f0fdf4',
                                color: '#15803d',
                                border: '1px solid #bbf7d0'
                              }}
                              disabled={isUpdating}
                              onClick={() => setUnblockTarget(u)}
                              title="Activate Customer"
                            >
                              {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Unlock size={13} />} Unblock
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{
                                padding: '5px 10px',
                                fontSize: 12,
                                background: '#fff1f2',
                                color: '#be123c',
                                border: '1px solid #fecdd3'
                              }}
                              disabled={isUpdating}
                              onClick={() => handleToggleClick(u)}
                              title="Block Customer"
                            >
                              {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} />} Block
                            </button>
                          )}

                          {/* Details Button */}
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '5px 10px', fontSize: 12 }}
                            onClick={() => setSelectedUserForDetails(u)}
                            title="View customer profile details"
                          >
                            <Eye size={13} /> View
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

      {/* Unblock Confirm Modal */}
      {unblockTarget && (
        <div className="modal-overlay" onClick={() => setUnblockTarget(null)}>
          <div
            className="modal-dialog"
            style={{ maxWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Unblock Customer Account</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                    {unblockTarget.name || unblockTarget.phone}
                  </p>
                </div>
              </div>
              <button type="button" className="btn-icon" onClick={() => setUnblockTarget(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px 22px' }}>
              <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                Are you sure you want to <strong>unblock</strong> this customer?{' '}
                They will regain full access to place orders on the platform.
              </p>
            </div>

            <div className="modal-footer" style={{ padding: '12px 22px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setUnblockTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: '#15803d', borderColor: '#15803d' }}
                disabled={updatingId === unblockTarget._id}
                onClick={() => handleUpdateStatus(unblockTarget, 'active', '')}
              >
                {updatingId === unblockTarget._id
                  ? <><Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Activating...</>
                  : <><Unlock size={13} /> Confirm Unblock</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Reason Prompt Modal */}
      {blockingTarget && (
        <div className="modal-overlay" onClick={() => setBlockingTarget(null)}>
          <div
            className="modal-dialog"
            style={{ maxWidth: 460 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Block Customer Account</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                    {blockingTarget.name || blockingTarget.phone}
                  </p>
                </div>
              </div>
              <button type="button" className="btn-icon" onClick={() => setBlockingTarget(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                Are you sure you want to block this customer? Blocked customers will be restricted from placing orders.
              </p>

              <div className="form-group">
                <label style={{ fontSize: 12.5, fontWeight: 600 }}>Reason for Blocking</label>
                <input
                  type="text"
                  required
                  className="form-control-input"
                  placeholder="e.g. Fraudulent activity, abuse, unpaid bookings..."
                  value={blockReasonInput}
                  onChange={(e) => setBlockReasonInput(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '12px 22px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setBlockingTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: '#be123c', borderColor: '#be123c' }}
                onClick={() => handleUpdateStatus(blockingTarget, 'blocked', blockReasonInput.trim() || 'Blocked by administrator')}
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserForDetails && (
        <UserDetailsModal
          user={selectedUserForDetails}
          onClose={() => setSelectedUserForDetails(null)}
          onStatusUpdated={(updatedUser) => {
            setUsers((prev) =>
              prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
            );
            setSelectedUserForDetails(updatedUser);
          }}
        />
      )}
    </div>
  );
}
