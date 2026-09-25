import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Store, 
  UtensilsCrossed, 
  MapPin, 
  Bike, 
  Ticket, 
  Image as ImageIcon, 
  Bell, 
  Landmark, 
  BarChart3, 
  Users, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import '../../styles/layout.css';

export default function Sidebar({ isCollapsed, onToggleCollapse, user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const pathToSection = (pathname) => {
    const p = pathname.replace('/', '').split('/')[0];
    return p || 'dashboard';
  };
  const currentSection = pathToSection(location.pathname);

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: 'Operations',
      items: [
        { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: '11' },
        { id: 'restaurants', label: 'Restaurants', icon: Store },
        { id: 'food', label: 'Food Management', icon: UtensilsCrossed },
        { id: 'zone', label: 'Zone Setup', icon: MapPin },
        { id: 'delivery', label: 'Delivery Management', icon: Bike }
      ]
    },
    {
      group: 'Marketing & Engagement',
      items: [
        { id: 'coupons', label: 'Coupons', icon: Ticket },
        { id: 'banners', label: 'Banners', icon: ImageIcon },
        { id: 'notifications', label: 'Push Notifications', icon: Bell }
      ]
    },
    {
      group: 'Finance & Team',
      items: [
        { id: 'disbursement', label: 'Disbursements', icon: Landmark },
        { id: 'reports', label: 'Report Management', icon: BarChart3 },
        { id: 'employee', label: 'Employee Management', icon: Users }
      ]
    }
  ];

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon-wrapper">
            <UtensilsCrossed size={20} />
          </div>
          {!isCollapsed && (
            <div className="brand-title">
              <h2>Gourmet Admin</h2>
              <span>Culinary Dispatch</span>
            </div>
          )}
        </div>

        <button 
          type="button" 
          className="sidebar-toggle-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav List */}
      <div className="sidebar-nav">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            {!isCollapsed && (
              <div className="sidebar-category">{group.group}</div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(`/${item.id}`)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={18} />
                  {!isCollapsed && (
                    <>
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="sidebar-link-badge">{item.badge}</span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer — admin info only, no logout */}
      <div className="sidebar-footer">
        <img 
          src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"} 
          alt="Admin Avatar" 
          className="user-avatar-sm"
        />
        {!isCollapsed && (
          <div className="sidebar-user-info" style={{ flex: 1 }}>
            <span className="sidebar-user-name">{user?.name || "Alexandria M."}</span>
            <span className="sidebar-user-role">{user?.role || "Super Admin"}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
