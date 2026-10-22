import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Store,
  DollarSign,
  Clock,
  ChevronRight,
  ArrowUpRight,
  FileText,
  ExternalLink,
  RefreshCw,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Truck,
  ChefHat,
  PackageCheck
} from 'lucide-react';
import { URLS } from '../../url';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchDashboard = useCallback(async (manual = false) => {
    if (manual) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await fetch(URLS.GetDashboard, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify({})
      });
      const resData = await res.json();
      if (res.ok && resData.success !== false) {
        setData(resData.data || null);
        if (manual) showToast('Dashboard refreshed with latest operational data!');
      } else {
        setError(resData.message || 'Failed to fetch dashboard metrics');
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Network error loading dashboard');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  const orderCounts = data?.orderCounts || {
    pendingOrders: 0,
    confirmedOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    outForDeliveryOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  };

  const totalOrdersInPipeline = Object.values(orderCounts).reduce(
    (acc, val) => acc + Number(val || 0),
    0
  );

  const latestBookings = Array.isArray(data?.latestBookings) ? data.latestBookings : [];
  const latestRestaurants = Array.isArray(data?.latestRestaurants) ? data.latestRestaurants : [];
  const topDeliveredProducts = Array.isArray(data?.topDeliveredProducts) ? data.topDeliveredProducts : [];

  const getStatusBadgeClass = (status) => {
    const key = (status || '').toLowerCase().replace(/[\s_-]+/g, '');
    switch (key) {
      case 'pending': return 'badge-pending';
      case 'confirmed': return 'badge-accepted';
      case 'preparing': return 'badge-processing';
      case 'ready': return 'badge-scheduled';
      case 'outfordelivery': return 'badge-ontheway';
      case 'delivered': return 'badge-delivered';
      case 'cancelled': return 'badge-canceled';
      default: return 'badge-active';
    }
  };

  const pipelineStages = [
    {
      label: 'Pending Acceptance',
      count: orderCounts.pendingOrders || 0,
      path: '/orders/pending',
      color: '#d97706',
      icon: Clock
    },
    {
      label: 'Confirmed Orders',
      count: orderCounts.confirmedOrders || 0,
      path: '/orders/confirmed',
      color: '#0284c7',
      icon: CheckCircle2
    },
    {
      label: 'Preparing in Kitchen',
      count: orderCounts.preparingOrders || 0,
      path: '/orders/preparing',
      color: '#7c3aed',
      icon: ChefHat
    },
    {
      label: 'Ready for Dispatch',
      count: orderCounts.readyOrders || 0,
      path: '/orders/ready',
      color: '#059669',
      icon: PackageCheck
    },
    {
      label: 'Out for Delivery',
      count: orderCounts.outForDeliveryOrders || 0,
      path: '/orders/out_for_delivery',
      color: '#ea580c',
      icon: Truck
    },
    {
      label: 'Delivered Orders',
      count: orderCounts.deliveredOrders || 0,
      path: '/orders/delivered',
      color: '#16a34a',
      icon: CheckCircle2
    },
    {
      label: 'Cancelled Orders',
      count: orderCounts.cancelledOrders || 0,
      path: '/orders/cancelled',
      color: '#dc2626',
      icon: AlertCircle
    }
  ];

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
            background: '#10b981',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            fontWeight: 600,
            fontSize: 14
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner Header */}
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
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22 }}>The Place Operations Dashboard</h1>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                {data?.todayDate
                  ? `Live operations summary for ${data.todayDate}`
                  : 'Real-time analytics, order dispatch pipeline, and restaurant metrics'}
              </p>
            </div>
          </div>
        </div>

        <div className="page-actions-block" style={{ display: 'flex', gap: 10 }}>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => fetchDashboard(true)}
            disabled={isRefreshing || loading}
            title="Refresh dashboard metrics"
          >
            <RefreshCw
              size={15}
              style={{
                animation: (isRefreshing || loading) ? 'spin 0.8s linear infinite' : 'none'
              }}
            />{' '}
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/orders')}
          >
            <ShoppingBag size={15} /> All Orders ({totalOrdersInPipeline})
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => navigate('/food')}
          >
            <Store size={15} /> Menu Catalog
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#991b1b', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Metrics Cards */}
      <div className="metrics-grid">
        {/* Today Completed Revenue */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fff1f2', color: '#be123c' }}>
              <DollarSign size={22} />
            </div>
            <span className="metric-badge-trend trend-up">
              <ArrowUpRight size={13} /> Completed
            </span>
          </div>
          <div>
            <div className="metric-val">
              ₹{Number(data?.todayCompletedAmount || 0).toLocaleString()}
            </div>
            <div className="metric-title">Today Completed Revenue</div>
          </div>
        </div>

        {/* Completed Orders Today */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <ShoppingBag size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Today</span>
          </div>
          <div>
            <div className="metric-val">
              {Number(data?.todayCompletedOrders || 0)}
            </div>
            <div className="metric-title">Completed Orders Today</div>
          </div>
        </div>

        {/* Active Partner Restaurants */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Store size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Active</span>
          </div>
          <div>
            <div className="metric-val">
              {Number(data?.activeRestaurants || 0)}
            </div>
            <div className="metric-title">Active Partner Restaurants</div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
              <Clock size={22} />
            </div>
            <span className="metric-badge-trend" style={{ background: '#fef3c7', color: '#92400e' }}>
              Requires Action
            </span>
          </div>
          <div>
            <div className="metric-val">
              {Number(orderCounts.pendingOrders || 0)}
            </div>
            <div className="metric-title">Pending Kitchen Acceptance</div>
          </div>
        </div>
      </div>

      {/* Middle Section: Operations Pipeline & Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: 24, marginBottom: 26 }}>
        {/* Live Operations Pipeline */}
        <div className="card-container" style={{ margin: 0 }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16 }}>Live Order Pipeline by Status</h3>
              <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>
                Click any stage to filter orders
              </p>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ fontSize: 12, padding: '4px 10px' }}
              onClick={() => navigate('/orders')}
            >
              View Orders <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pipelineStages.map((stage, idx) => {
              const maxCount = Math.max(totalOrdersInPipeline, 1);
              const percent = Math.min(Math.round((stage.count / maxCount) * 100), 100);
              const IconComp = stage.icon;

              return (
                <div
                  key={idx}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    background: '#f8fafc'
                  }}
                  onClick={() => navigate(stage.path)}
                  title={`View ${stage.label}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <IconComp size={15} color={stage.color} />
                      <span style={{ color: '#1e293b' }}>{stage.label}</span>
                    </div>
                    <span style={{ color: stage.color, fontWeight: 700 }}>
                      {stage.count} {stage.count === 1 ? 'order' : 'orders'}
                    </span>
                  </div>
                  <div style={{ height: 6, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${stage.count > 0 ? Math.max(percent, 8) : 0}%`,
                        height: '100%',
                        background: stage.color,
                        borderRadius: 4
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Partner Restaurants */}
        <div className="card-container" style={{ margin: 0 }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16 }}>Partner Restaurants ({latestRestaurants.length})</h3>
              <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>Active merchants on platform</p>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ fontSize: 12, padding: '4px 10px' }}
              onClick={() => navigate('/restaurants')}
            >
              All Restaurants <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {latestRestaurants.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>
                No restaurants available.
              </div>
            ) : (
              latestRestaurants.slice(0, 5).map((r) => {
                const logo = getImageUrl(r.restaurentLogo);
                return (
                  <div
                    key={r._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 10,
                      borderRadius: 10,
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {logo ? (
                        <img
                          src={logo}
                          alt={r.restaurentName}
                          style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ width: 42, height: 42, borderRadius: 8, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Store size={18} color="#64748b" />
                        </div>
                      )}
                      <div>
                        <h5 style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {r.restaurentName || r.name}
                        </h5>
                        <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                          {r.restaurentAddress || r.address || 'Address registered'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="badge badge-accepted" style={{ textTransform: 'capitalize' }}>
                        {r.status || 'Active'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Lower Section: Recent Incoming Orders */}
      <div className="card-container" style={{ margin: 0 }}>
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16 }}>Latest Booking Orders</h3>
            <p style={{ fontSize: 12.5, color: '#64748b', margin: '2px 0 0' }}>
              Real-time incoming customer transactions
            </p>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ fontSize: 12, padding: '5px 12px' }}
            onClick={() => navigate('/orders')}
          >
            View All in Orders Roster <ChevronRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Restaurant</th>
                <th>Customer</th>
                <th>Date & Time</th>
                <th>Total</th>
                <th>Status</th>
                {/* <th style={{ textAlign: 'center' }}>Invoice</th> */}
              </tr>
            </thead>
            <tbody>
              {latestBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px 20px', color: '#94a3b8' }}>
                    No recent booking orders found.
                  </td>
                </tr>
              ) : (
                latestBookings.slice(0, 8).map((b) => {
                  const id = b.orderUniqueId || b._id;
                  const invoiceUrl = getImageUrl(b.invoice);

                  return (
                    <tr key={b._id}>
                      <td>
                        <span style={{ fontWeight: 700, color: '#be123c' }}>{id}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {b.restaurentName || 'Assigned Kitchen'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.userName || 'Customer'}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{b.userPhone || ''}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: 12.5, color: '#334155' }}>
                          {b.date} {b.time}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>
                          ₹{Number(b.totalAmount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(b.bookingStatus)}`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                      {/* <td style={{ textAlign: 'center' }}>
                        {invoiceUrl ? (
                          <a
                            href={invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                            title="Open invoice PDF"
                          >
                            <FileText size={13} color="#be123c" /> PDF
                            <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>-</span>
                        )}
                      </td> */}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

        {/* Top Culinary Dishes */}
        {/* <div className="card-container" style={{ margin: 0 }}>
          <div className="card-header">
            <h3>Top Performing Dishes</h3>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ fontSize: 12, padding: '5px 10px' }}
              onClick={() => navigate('/food')}
            >
              Menu Catalog
            </button>
          </div>

          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {foodItemsData.slice(0, 4).map((food) => (
              <div key={food.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 10, background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img 
                    src={food.image} 
                    alt={food.name} 
                    style={{ width: 46, height: 46, borderRadius: 8, objectFit: 'cover' }} 
                  />
                  <div>
                    <h5 style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{food.name}</h5>
                    <p style={{ fontSize: 12, color: '#64748b' }}>{food.restaurant}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#be123c' }}>${food.price.toFixed(2)}</span>
                  <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>{food.salesCount} sold</div>
                </div>
              </div>
            ))}
          </div>
        </div> */}
    </div>
  );
}
