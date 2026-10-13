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

import { initialOrders } from './data/mockData';
import { URLS } from './url';
import './styles/index.css';
import './styles/components.css';

// Protected route wrapper
function ProtectedApp({ orders, onUpdateOrderStatus, onLogout, user }) {
  const navigate = useNavigate();
  const location = useLocation();

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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard onNavigateSection={handleSelectSection} />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/sub-categories" element={<SubCategories />} />
        <Route path="/subcategories" element={<SubCategories />} />
        <Route path="/cuisines" element={<Cuisines />} />
        <Route path="/orders" element={<OrdersLayout orders={orders} onUpdateStatus={onUpdateOrderStatus} />} />
        <Route path="/orders/:tab" element={<OrdersLayout orders={orders} onUpdateStatus={onUpdateOrderStatus} />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/food" element={<FoodManagement />} />
        <Route path="/zone" element={<ZoneSetup />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/banners" element={<Banners />} />
        <Route path="/notifications" element={<PushNotifications />} />
        <Route path="/disbursement" element={<DisbursementManagement />} />
        <Route path="/reports" element={<ReportManagement />} />
        <Route path="/employee" element={<EmployeeManagement />} />
        <Route path="/employee/:tab" element={<EmployeeManagement />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/policies" element={<Policies />} />
        <Route path="/policies/:tab" element={<Policies />} />
        <Route path="/delivery" element={<DeliveryManagement />} />
        <Route path="/profile" element={<Profile user={user} onLogout={() => { onLogout(); navigate('/login'); }} />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
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

            const freshData = {
              id: p._id || '',
              name: p.name || 'Admin',
              email: p.email || '',
              phone: p.phone || '',
              role: p.department || p.role || 'Super Admin',
              avatar: fullAvatar,
              location: p.address || p.location || '',
            };
            setUser((prev) => ({ ...prev, ...freshData }));
            const storage = localStorage.getItem('admin_token') ? localStorage : sessionStorage;
            storage.setItem('admin_user', JSON.stringify(freshData));
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
                <ProtectedApp
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onLogout={handleLogout}
                  user={user}
                />
              )
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
