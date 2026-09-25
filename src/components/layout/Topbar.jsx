import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut } from 'lucide-react';
import '../../styles/layout.css';

export default function Topbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, title: "New Order #ORD-9821 from Sophia Reynolds", time: "10m ago", isNew: true },
    { id: 2, title: "L'Amour Bistro requested a $4,820 payout", time: "45m ago", isNew: true },
    { id: 3, title: "Rain surge pricing active in Midtown", time: "2h ago", isNew: false }
  ];

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
        >
          <span className="live-pulse-dot" />
          <span>11 Live Orders</span>
        </button>

        {/* Notifications Popover Trigger */}
        <div style={{ position: 'relative' }}>
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

        {/* Profile Popover */}
        <div style={{ position: 'relative' }}>
          <button 
            type="button" 
            className="topbar-profile-trigger"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"} 
              alt="Admin" 
              className="topbar-avatar" 
            />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{user?.name || "Alexandria M."}</span>
              <span style={{ fontSize: 11, color: '#881337', fontWeight: 600 }}>Super Admin</span>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </button>

          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 52,
              width: 200,
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              zIndex: 1000,
              overflow: 'hidden',
              padding: 6
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 12, color: '#64748b' }}>
                Signed in as<br /><strong style={{ color: '#0f172a' }}>{user?.email || "admin@foodexpress.com"}</strong>
              </div>
              <button 
                type="button"
                onClick={onLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#ef4444',
                  marginTop: 4,
                  textAlign: 'left'
                }}
                className="btn-secondary"
              >
                <LogOut size={15} /> Sign Out of Suite
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
