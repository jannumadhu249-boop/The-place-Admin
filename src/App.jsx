import React, { useState } from 'react';
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

import { initialOrders } from './data/mockData';
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
        <Route path="/delivery" element={<DeliveryManagement />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState(initialOrders);

  const handleLogin = (userData) => {
    setUser({ ...userData, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
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
