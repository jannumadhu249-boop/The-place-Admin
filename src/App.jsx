import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './components/dashboard/Dashboard';
import OrdersLayout from './components/orders/OrdersLayout';
import Restaurants from './components/restaurants/Restaurants';
import FoodManagement from './components/food/FoodManagement';
import Coupons from './components/coupons/Coupons';
import Banners from './components/banners/Banners';
import PushNotifications from './components/notifications/PushNotifications';
import DisbursementManagement from './components/disbursement/DisbursementManagement';
import ReportManagement from './components/reports/ReportManagement';
import EmployeeManagement from './components/employee/EmployeeManagement';
import DeliveryManagement from './components/delivery/DeliveryManagement';
import ZoneSetup from './components/zone/ZoneSetup';
import Profile from './components/auth/Profile';
import Categories from './components/categories/Categories';
import SubCategories from './components/subcategories/SubCategories';
import Cuisines from './components/cuisines/Cuisines';
import Departments from './components/departments/Departments';
import Faqs from './components/faqs/Faqs';
import AboutUs from './components/content/AboutUs';
import ContactUs from './components/content/ContactUs';
import Policies from './components/content/Policies';
import Users from './components/users/Users';

import { initialOrders } from './data/mockData';
import { URLS } from './url';
import { PermissionProvider, usePermissions } from './context/PermissionContext';
import './styles/index.css';
import './styles/components.css';

// Guard for checking module view permission before rendering page
function ModuleGuard({ module, children }) {
  const { canView, firstAccessibleRoute } = usePermissions();
  if (!canView(module)) {
    return <Navigate to={firstAccessibleRoute || '/profile'} replace />;
  }
  return children;
}

// Protected route wrapper
function ProtectedApp({ orders, onUpdateOrderStatus, onLogout, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { firstAccessibleRoute } = usePermissions();

  // Derive active section from current pathname for sidebar highlight
  const pathToSection = (pathname) => {
    const p = pathname.replace('/', '').split('/')[0];
    return p || 'dashboard';
  };

  const handleSelectSection = (sectionId) => {
    navigate(`/${sectionId}`);
  };

  const currentSection = pathToSection(location.pathname);

  return (
    <AdminLayout
      currentSection={currentSection}
      onSelectSection={handleSelectSection}
      user={user}
      onLogout={() => { onLogout(); navigate('/login'); }}
    >
      <Routes>
        <Route path="/" element={<Navigate to={firstAccessibleRoute || "/dashboard"} replace />} />
        <Route path="/dashboard" element={<ModuleGuard module="dashboard"><Dashboard onNavigateSection={handleSelectSection} /></ModuleGuard>} />
        <Route path="/categories" element={<ModuleGuard module="categories"><Categories /></ModuleGuard>} />
        <Route path="/sub-categories" element={<ModuleGuard module="sub-categories"><SubCategories /></ModuleGuard>} />
        <Route path="/subcategories" element={<ModuleGuard module="sub-categories"><SubCategories /></ModuleGuard>} />
        <Route path="/cuisines" element={<ModuleGuard module="cuisines"><Cuisines /></ModuleGuard>} />
        <Route path="/orders" element={<ModuleGuard module="orders"><OrdersLayout orders={orders} onUpdateStatus={onUpdateOrderStatus} /></ModuleGuard>} />
        <Route path="/orders/:tab" element={<ModuleGuard module="orders"><OrdersLayout orders={orders} onUpdateStatus={onUpdateOrderStatus} /></ModuleGuard>} />
        <Route path="/users" element={<ModuleGuard module="users"><Users /></ModuleGuard>} />
        <Route path="/customers" element={<ModuleGuard module="users"><Users /></ModuleGuard>} />
        <Route path="/restaurants" element={<ModuleGuard module="restaurants"><Restaurants /></ModuleGuard>} />
        <Route path="/food" element={<ModuleGuard module="food"><FoodManagement /></ModuleGuard>} />
        <Route path="/zone" element={<ModuleGuard module="zone"><ZoneSetup /></ModuleGuard>} />
        <Route path="/coupons" element={<ModuleGuard module="coupons"><Coupons /></ModuleGuard>} />
        <Route path="/banners" element={<ModuleGuard module="banners"><Banners /></ModuleGuard>} />
        <Route path="/notifications" element={<ModuleGuard module="notifications"><PushNotifications /></ModuleGuard>} />
        <Route path="/disbursement" element={<ModuleGuard module="disbursement"><DisbursementManagement /></ModuleGuard>} />
        <Route path="/reports" element={<ModuleGuard module="reports"><ReportManagement /></ModuleGuard>} />
        <Route path="/employee" element={<ModuleGuard module="employee"><EmployeeManagement /></ModuleGuard>} />
        <Route path="/employee/:tab" element={<ModuleGuard module="employee"><EmployeeManagement /></ModuleGuard>} />
        <Route path="/departments" element={<ModuleGuard module="departments"><Departments /></ModuleGuard>} />
        <Route path="/faqs" element={<ModuleGuard module="faqs"><Faqs /></ModuleGuard>} />
        <Route path="/about-us" element={<ModuleGuard module="about-us"><AboutUs /></ModuleGuard>} />
        <Route path="/contact-us" element={<ModuleGuard module="contact-us"><ContactUs /></ModuleGuard>} />
        <Route path="/policies" element={<ModuleGuard module="policies"><Policies /></ModuleGuard>} />
        <Route path="/policies/:tab" element={<ModuleGuard module="policies"><Policies /></ModuleGuard>} />
        <Route path="/delivery" element={<ModuleGuard module="delivery"><DeliveryManagement /></ModuleGuard>} />
        <Route path="/profile" element={<Profile user={user} onLogout={() => { onLogout(); navigate('/login'); }} />} />
        <Route path="*" element={<Navigate to={firstAccessibleRoute || "/dashboard"} replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token'));
  });
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('admin_user') || sessionStorage.getItem('admin_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [orders, setOrders] = useState(initialOrders);

  // Restore session from storage on first load & fetch latest profile
  useEffect(() => {
    const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    if (token) {

      // Fetch fresh profile from API
      const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      fetch(URLS.GetProfile, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': authHeader,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success !== false && data.status !== false) {
            const p = data?.profile || data?.data || data;
            const pic = p.image || p.profilePic;
            const fullAvatar = pic
              ? (pic.startsWith('http://') || pic.startsWith('https://') || pic.startsWith('data:') ? pic : URLS.ImageUrl + pic)
              : null;

            const storage = localStorage.getItem('admin_token') ? localStorage : sessionStorage;
            const prevStored = JSON.parse(storage.getItem('admin_user') || '{}');

            const isSuper = (
              p.email === 'gopi@gmail.com' ||
              prevStored.email === 'gopi@gmail.com' ||
              p.department === 'Admin'
            );

            const mergedUser = {
              ...prevStored,
              id: p._id || prevStored.id || '',
              name: p.name || prevStored.name || (isSuper ? 'Admin' : 'Staff Member'),
              email: p.email || prevStored.email || '',
              phone: p.phone || prevStored.phone || '',
              location: p.address || p.location || prevStored.location || '',
              avatar: fullAvatar || prevStored.avatar,
              role: prevStored.role || (isSuper ? 'Super Admin' : 'Staff Member'),
              roleName: prevStored.roleName || (isSuper ? 'Super Admin' : ''),
              roleId: prevStored.roleId || '',
              rolesAndPermission: (Array.isArray(prevStored.rolesAndPermission) && prevStored.rolesAndPermission.length > 0)
                ? prevStored.rolesAndPermission
                : (isSuper ? ['*'] : [])
            };

            setUser(mergedUser);
            storage.setItem('admin_user', JSON.stringify(mergedUser));
          }
        })
        .catch(() => {});
    }
  }, []);

  // Listen to profile updates dispatched across components
  useEffect(() => {
    const handleProfileUpdate = (e) => {
      if (e.detail) {
        setUser((prev) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  const handleLogin = (userData) => {
    // avatar comes from the API via Login.jsx; fall back to default if not provided
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus, category: newStatus.toLowerCase().replace(/\s+/g, '') }
          : order
      )
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Login onLogin={handleLogin} onNavigateForgot={undefined} />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <ForgotPassword onBackToLogin={undefined} />
          }
        />

        {/* Protected admin routes */}
        <Route
          path="/*"
          element={
            isAuthenticated
              ? (
                <PermissionProvider user={user}>
                  <ProtectedApp
                    orders={orders}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    onLogout={handleLogout}
                    user={user}
                  />
                </PermissionProvider>
              )
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
