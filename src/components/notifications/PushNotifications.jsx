import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  Send, 
  Smartphone, 
  Users, 
  CheckCircle, 
  Clock, 
  Zap, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { URLS } from '../../url';

const FALLBACK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWJkM2RkYjAzMGEyODdlMzhhMWRlZmYiLCJwaG9uZSI6Ijg1MDAyNDEwOTMiLCJpYXQiOjE3OTA3ODcwNDUsImV4cCI6MTgyMjMyMzA0NX0.8Y91D3P6whWIu8Cy2hCO-ivQiIwHXPhPQ41DznvwomM";

const getAuthHeader = () => {
  const token = localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token") || localStorage.getItem("token") || FALLBACK_TOKEN;
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
};

export default function PushNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [zones, setZones] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [zone, setZone] = useState('');

  // Status alerts
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Auto-clear alerts
  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  // Fetch active zones
  const fetchActiveZones = useCallback(async () => {
    setLoadingZones(true);
    try {
      const res = await fetch(URLS.GetActiveZones, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setZones(data.zones || data.data || []);
      }
    } catch (err) {
      console.error('Error fetching active zones:', err);
    } finally {
      setLoadingZones(false);
    }
  }, []);

  // Fetch active users for target audience
  const fetchActiveUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(URLS.GetActiveUsers, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        const list = data.user || data.users || data.data || [];
        setActiveUsers(list);
      }
    } catch (err) {
      console.error('Error fetching active users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(URLS.GetPushNotifications, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && (data.message === 'Successful' || data.success !== false)) {
        setNotifications(data.notifications || data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setErrorMsg(err.message || 'Error fetching notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchNotifications();
    fetchActiveZones();
    fetchActiveUsers();
  }, [fetchNotifications, fetchActiveZones, fetchActiveUsers]);

  // Handle broadcast submission
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMsg('Please enter both headline and body message.');
      return;
    }

    let selectedUsers = [];
    if (targetAudience === 'ALL') {
      selectedUsers = activeUsers.map((u) => u._id).filter(Boolean);
    } else if (targetAudience) {
      selectedUsers = [targetAudience];
    }

    if (!selectedUsers.length) {
      setErrorMsg('No active recipient users found to send notification.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      sendTo: 'User',
      users: selectedUsers,
      title: title.trim(),
      description: message.trim()
    };

    if (zone && zone !== 'All Zones') {
      payload.zoneId = zone;
    }

    try {
      const res = await fetch(URLS.CreatePushNotifications, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success !== false) {
        setSuccessMsg(data.message || 'Broadcast notification sent successfully!');
        setTitle('');
        setMessage('');
        setZone('');
        await fetchNotifications();
      } else {
        throw new Error(data.message || 'Failed to broadcast notification');
      }
    } catch (err) {
      console.error('Error broadcasting notification:', err);
      setErrorMsg(err.message || 'Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle single delete
  const handleDelete = async (notifId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;

    setDeletingId(notifId);
    setErrorMsg(null);
    try {
      const res = await fetch(URLS.DeletePushNotifications, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify({ ids: [notifId] })
      });
      const data = await res.json();

      if (res.ok && data.success !== false) {
        setSuccessMsg(data.message || 'Notification deleted successfully');
        setSelectedIds((prev) => prev.filter((id) => id !== notifId));
        await fetchNotifications();
      } else {
        throw new Error(data.message || 'Failed to delete notification');
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      setErrorMsg(err.message || 'Failed to delete notification');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected notification(s)?`)) return;

    setBulkDeleting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(URLS.DeletePushNotifications, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      const data = await res.json();

      if (res.ok && data.success !== false) {
        setSuccessMsg(data.message || `${selectedIds.length} notifications deleted successfully`);
        setSelectedIds([]);
        await fetchNotifications();
      } else {
        throw new Error(data.message || 'Failed to delete selected notifications');
      }
    } catch (err) {
      console.error('Error bulk deleting notifications:', err);
      setErrorMsg(err.message || 'Failed to delete notifications');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Toggle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(notifications.map((n) => n._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Toggle select row
  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Helper to format timestamp
  const formatTimestamp = (notif) => {
    if (notif.date && notif.time) {
      return `${notif.date} ${notif.time}`;
    }
    if (notif.logCreatedDate) {
      try {
        return new Date(notif.logCreatedDate).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });
      } catch {
        return notif.logCreatedDate;
      }
    }
    return '—';
  };

  // Helper to resolve zone name
  const getZoneName = (notif) => {
    if (notif.zone) return notif.zone;
    if (notif.zoneId) {
      const match = zones.find((z) => z._id === notif.zoneId);
      if (match) return match.name;
    }
    return 'All Zones';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Push Notification Dispatcher</h1>
          <p>Broadcast high-priority alerts, seasonal promotions, and courier weather surge announcements</p>
        </div>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, color: '#065f46', fontSize: 13, marginBottom: 20 }}>
          <CheckCircle size={18} color="#10b981" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, color: '#991b1b', fontSize: 13, marginBottom: 20 }}>
          <AlertCircle size={18} color="#ef4444" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* Left Column: Broadcast Composer */}
        <div className="card-container" style={{ margin: 0 }}>
          <div className="card-header">
            <h3>Compose Broadcast Campaign</h3>
          </div>

          <form onSubmit={handleBroadcast} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label>Notification Headline / Title</label>
              <input
                type="text"
                required
                className="form-control-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flash Sale! 20% Off Tonight"
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Notification Body Message</label>
              <textarea
                rows={4}
                required
                className="form-control-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write compelling text under 120 characters..."
                disabled={submitting}
              />
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Target Audience Segment (Active Users)</label>
                <select
                  className="form-control-input"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  disabled={submitting || loadingUsers}
                >
                  <option value="ALL">All Active Users ({activeUsers.length})</option>
                  {activeUsers.length > 0 && (
                    <optgroup label="Specific Active User">
                      {activeUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name ? `${u.name} (${u.phone || u.email || u._id})` : `User (${u.phone || u._id})`}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Target Geographic Zone</label>
                <select
                  className="form-control-input"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  disabled={submitting || loadingZones}
                >
                  <option value="">All Delivery Zones</option>
                  {zones.map((z) => (
                    <option key={z._id} value={z._id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: 12, marginTop: 8 }}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Broadcasting...
                </>
              ) : (
                <>
                  <Send size={16} /> Broadcast Notification Now
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Mobile Device Mockup Preview */}
        <div className="card-container" style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
            <Smartphone size={16} /> Live Device Lock-Screen Preview
          </div>

          {/* Smartphone Frame */}
          <div style={{
            width: 300,
            height: 480,
            background: '#0f172a',
            borderRadius: 36,
            border: '8px solid #334155',
            boxShadow: '0 20px 30px rgba(0,0,0,0.2)',
            padding: '16px 14px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
          }}>
            {/* Top Notch */}
            <div style={{ width: 100, height: 16, background: '#334155', borderRadius: '0 0 12px 12px', margin: '0 auto 24px' }} />

            {/* Time Stamp */}
            <div style={{ textAlign: 'center', color: '#ffffff', marginBottom: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>07:45</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Friday, September 21</div>
            </div>

            {/* Glass Push Notification Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(10px)',
              borderRadius: 16,
              padding: 14,
              boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.3)',
              wordBreak: 'break-word'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: '#be123c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Bell size={11} />
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a' }}>GOURMET EXPRESS</span>
                </div>
                <span style={{ fontSize: 10, color: '#64748b' }}>now</span>
              </div>
              <h5 style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>
                {title || 'Midnight Cravings Alert! 🌙 15% Off'}
              </h5>
              <p style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.4 }}>
                {message || 'Satisfy late-night appetites with gourmet woodfired pizzas & artisanal desserts.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sent History Table */}
      <div className="card-container">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h3>Campaign Delivery Log</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {selectedIds.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ color: '#dc2626', borderColor: '#fca5a5', fontSize: 12, padding: '6px 12px' }}
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
              >
                {bulkDeleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={13} /> Delete Selected ({selectedIds.length})
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 12, padding: '6px 12px' }}
              onClick={fetchNotifications}
              disabled={loading}
              title="Refresh list from server"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={notifications.length > 0 && selectedIds.length === notifications.length}
                    onChange={handleSelectAll}
                    disabled={notifications.length === 0}
                  />
                </th>
                <th>Campaign Headline</th>
                <th>Target Segment</th>
                <th>Zone Scope</th>
                <th>Sent Timestamp</th>
                <th>Delivered</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && notifications.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                    <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px', display: 'block' }} />
                    Loading notifications from server...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px 16px', color: '#64748b' }}>
                    <Bell size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                    No notifications broadcasted yet.
                  </td>
                </tr>
              ) : (
                notifications.map((notif) => {
                  const isSelected = selectedIds.includes(notif._id);
                  const isBeingDeleted = deletingId === notif._id;
                  return (
                    <tr key={notif._id} style={{ background: isSelected ? '#f8fafc' : 'transparent' }}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(notif._id)}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{notif.title}</div>
                        <div style={{ fontSize: 12, color: '#64748b', maxWidth: 360, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {notif.description}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-accepted">{notif.sendTo || 'User'}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: '#475569' }}>{getZoneName(notif)}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5, color: '#64748b' }}>{formatTimestamp(notif)}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>
                          {notif.users?.length ? `${notif.users.length} User(s)` : '1 User'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-delivered">
                          {notif.seen ? 'Read' : 'Delivered'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12, color: '#dc2626', borderColor: '#fca5a5' }}
                          onClick={() => handleDelete(notif._id)}
                          disabled={isBeingDeleted}
                          title="Delete notification"
                        >
                          {isBeingDeleted ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          <span style={{ marginLeft: 4 }}>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
