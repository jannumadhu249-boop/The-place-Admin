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
  ChevronRight,
  FolderTree,
  Layers,
  Utensils,
  Building2,
  HelpCircle,
  Info,
  PhoneCall,
  FileText
} from 'lucide-react';
import '../../styles/layout.css';
import { usePermissions } from '../../context/PermissionContext';

export default function Sidebar({ isCollapsed, onToggleCollapse, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { canView } = usePermissions();

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
      group: 'My Categories',
      items: [
        { id: 'categories', label: 'Categories', icon: FolderTree },
        { id: 'sub-categories', label: 'Sub Categories', icon: Layers },
        { id: 'cuisines', label: 'Cuisines', icon: Utensils }
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
        { id: 'employee', label: 'Employee Management', icon: Users },
        // { id: 'departments', label: 'Departments', icon: Building2 }
      ]
    },
    {
      group: 'Pages & Support',
      items: [
        { id: 'faqs', label: 'Help & FAQs', icon: HelpCircle },
        { id: 'about-us', label: 'About Us', icon: Info },
        { id: 'contact-us', label: 'Contact Us', icon: PhoneCall },
        { id: 'policies', label: 'Legal & Policies', icon: FileText }
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
              <h2>The Place</h2>
              <span>Culinary Food & Delivery</span>
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
        {navGroups
          .map(group => ({
            ...group,
            items: group.items.filter(item => canView(item.id))
          }))
          .filter(group => group.items.length > 0)
          .map((group, gIdx) => (
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

        {/* If employee has no permissions assigned */}
        {!isCollapsed && navGroups.every(g => g.items.filter(item => canView(item.id)).length === 0) && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>No permissions assigned.</p>
            <p style={{ margin: '4px 0 0', fontSize: 11 }}>Please contact Super Admin.</p>
          </div>
        )}
      </div>

      {/* Sidebar Footer — admin info only, no logout */}
      {/* <div className="sidebar-footer">
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
      </div> */}
    </aside>
  );
}
