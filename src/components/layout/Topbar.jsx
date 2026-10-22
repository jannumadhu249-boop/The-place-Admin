import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut, User } from 'lucide-react';
import { URLS } from '../../url';
import '../../styles/layout.css';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('admin_user') || sessionStorage.getItem('admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const resolveAvatar = (userObj) => {
  const pic = userObj?.avatar || userObj?.image || userObj?.profilePic;
  if (!pic) return DEFAULT_AVATAR;
  if (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('data:')) {
    return pic;
  }
  return `${URLS.ImageUrl}${pic.startsWith('/') ? pic.slice(1) : pic}`;
};

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWJkM2RkYjAzMGEyODdlMzhhMWRlZmYiLCJwaG9uZSI6Ijg1MDAyNDEwOTMiLCJpYXQiOjE3OTA3ODcwNDUsImV4cCI6MTgyMjMyMzA0NX0.8Y91D3P6whWIu8Cy2hCO-ivQiIwHXPhPQ41DznvwomM';

export default function Topbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [liveOrderCount, setLiveOrderCount] = useState(null);

  // User state synced with props, storage, and API
  const [currentUser, setCurrentUser] = useState(() => user || getStoredUser());

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Fetch live orders count from API
  const fetchLiveOrdersCount = async () => {
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('token') || FALLBACK_TOKEN;
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const res = await fetch(URLS.GetAllOrders, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: authHeader
        },
        body: JSON.stringify({ bookingStatus: 'pending' })
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        const count = data.totalBookings !== undefined ? data.totalBookings : (data.data?.length || 0);
        setLiveOrderCount(count);
      }
    } catch (err) {
      console.error('Topbar failed to fetch live orders count:', err);
    }
  };

  useEffect(() => {
    fetchLiveOrdersCount();

    const handleUpdate = () => fetchLiveOrdersCount();
    window.addEventListener('orders-updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('orders-updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  // Sync with prop changes
  useEffect(() => {
    if (user) {
      setCurrentUser((prev) => ({ ...prev, ...user }));
    }
  }, [user]);

  // Listen to profile updates dispatched from Profile.jsx
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e.detail) {
        setCurrentUser(e.detail);
      } else {
        const stored = getStoredUser();
        if (stored) setCurrentUser(stored);
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  // Fetch fresh profile from API on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    if (!token) return;

    const fetchAdminProfile = async () => {
      try {
        const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        const res = await fetch(URLS.GetProfile, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': authHeader,
          },
        });

        const data = await res.json();
        if (res.ok && data.status !== false && data.success !== false) {
          const p = data?.profile || data?.data || data;
          const pic = p.image || p.profilePic;
          const fullAvatar = pic
            ? (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('data:') ? pic : URLS.ImageUrl + pic)
            : null;

          const freshData = {
            id: p._id || '',
            name: p.name || '',
            email: p.email || '',
            phone: p.phone || '',
            role: p.department || p.role || '',
            roleName: p.roleName || p.role || '',
            roleId: p.roleId || p.role_id || '',
            rolesAndPermission: p.rolesAndPermission || p.permissions || [],
            avatar: fullAvatar,
            location: p.address || p.location || '',
          };

          setCurrentUser((prev) => ({ ...prev, ...freshData }));

          const storage = localStorage.getItem('admin_token') ? localStorage : sessionStorage;
          storage.setItem('admin_user', JSON.stringify(freshData));
        }
      } catch (err) {
        console.error('Topbar failed to fetch profile:', err);
      }
    };

    fetchAdminProfile();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: "New Order #ORD-9821 from Sophia Reynolds", time: "10m ago", isNew: true },
    { id: 2, title: "L'Amour Bistro requested a $4,820 payout", time: "45m ago", isNew: true },
    { id: 3, title: "Rain surge pricing active in Midtown", time: "2h ago", isNew: false }
  ];

  const avatarSrc = resolveAvatar(currentUser);

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <div className="topbar-search-box">
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search orders, bistros, dishes..." 
          />
          <span className="search-shortcut">Ctrl+K</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Live Orders Pulse Indicator */}
        <button 
          type="button" 
          className="live-order-indicator"
          onClick={() => navigate('/orders')}
          title="View Live Orders"
        >
          <span className="live-pulse-dot" />
          <span>{liveOrderCount !== null ? `${liveOrderCount} Live Orders` : 'Live Orders'}</span>
        </button>

        {/* Notifications Popover Trigger */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            type="button" 
            className="topbar-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} />
            <span className="topbar-badge-dot" />
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 50,
              width: 320,
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a' }}>System Notifications</span>
                <span className="badge badge-accepted">3 New</span>
              </div>
              <div>
                {notifications.map(n => (
                  <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: n.isNew ? '#fff1f2' : '#ffffff', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>{n.title}</p>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Popover with Avatar & Email on Top Right */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button 
            type="button" 
            className="topbar-profile-trigger"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title="Account Menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 10,
              transition: 'background 0.2s',
            }}
          >
            <img 
              src={avatarSrc} 
              alt={currentUser?.name || "Admin"} 
              className="topbar-avatar" 
              onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.25 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                {currentUser?.name || "Admin"}
              </span>
              <span style={{
                fontSize: 11,
                color: '#64748b',
                fontWeight: 500,
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {currentUser?.email || "admin@foodexpress.com"}
              </span>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </button>

          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 52,
              width: 230,
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              zIndex: 1000,
              overflow: 'hidden',
              padding: 8
            }}>
              {/* Header inside popover */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 10px 12px',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: 4,
              }}>
                <img 
                  src={avatarSrc} 
                  alt="Admin Avatar" 
                  style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #be123c', flexShrink: 0 }}
                  onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser?.name || "Admin"}
                  </p>
                  <p style={{ margin: 0, fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser?.email || "admin@foodexpress.com"}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#881337',
                    background: '#fff1f2',
                    padding: '1px 6px',
                    borderRadius: 4,
                    marginTop: 4
                  }}>
                    {currentUser?.roleName || currentUser?.role || (currentUser?.email === 'gopi@gmail.com' ? 'Super Admin' : 'Staff Member')}
                  </span>
                </div>
              </div>

              {/* My Profile */}
              <button
                type="button"
                onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#0f172a',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <User size={15} color="#475569" /> My Profile
              </button>

              {/* Divider */}
              <div style={{ height: 1, background: '#f1f5f9', margin: '4px 8px' }} />

              {/* Sign Out */}
              <button 
                type="button" 
                onClick={onLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#ef4444',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
