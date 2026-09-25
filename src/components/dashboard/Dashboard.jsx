import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Store, 
  Bike, 
  DollarSign, 
  Clock, 
  ChevronRight, 
  ArrowUpRight, 
  Star,
  Users
} from 'lucide-react';
import { initialOrders, restaurantsData, foodItemsData } from '../../data/mockData';

export default function Dashboard() {
  const navigate = useNavigate();
  const recentOrders = initialOrders.slice(0, 5);

  return (
    <div>
      {/* Top Banner Header */}
      <div className="page-header">
        <div className="page-title-block">
          <h1>Culinary Operations Dashboard</h1>
          <p>Real-time analytics, revenue intelligence, and delivery dispatch metrics</p>
        </div>

        <div className="page-actions-block">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/orders')}
          >
            <Clock size={16} /> Live Orders (11)
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => navigate('/reports')}
          >
            <TrendingUp size={16} /> View Financial Reports
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fff1f2', color: '#be123c' }}>
              <DollarSign size={22} />
            </div>
            <span className="metric-badge-trend trend-up">
              <ArrowUpRight size={13} /> +18.4%
            </span>
          </div>
          <div>
            <div className="metric-val">$128,490.00</div>
            <div className="metric-title">Gross Merchandise Value (GMV)</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <ShoppingBag size={22} />
            </div>
            <span className="metric-badge-trend trend-up">
              <ArrowUpRight size={13} /> +12.1%
            </span>
          </div>
          <div>
            <div className="metric-val">3,842</div>
            <div className="metric-title">Orders Dispatched Today</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Store size={22} />
            </div>
            <span className="metric-badge-trend trend-up">98.5% Open</span>
          </div>
          <div>
            <div className="metric-val">185</div>
            <div className="metric-title">Active Partner Bistros</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
              <Bike size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Avg 22m</span>
          </div>
          <div>
            <div className="metric-val">102</div>
            <div className="metric-title">Active Delivery Couriers</div>
          </div>
        </div>
      </div>

      {/* Analytics Visualization & Live Orders Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24, marginBottom: 26 }}>
        {/* Weekly Revenue Trends Chart Simulation */}
        <div className="card-container" style={{ margin: 0 }}>
          <div className="card-header">
            <div>
              <h3>Weekly Revenue & Order Trend</h3>
              <p style={{ fontSize: 12.5, color: '#64748b' }}>Comparing last 7 days performance</p>
            </div>
            <span className="badge badge-accepted">+$24,500 vs Last Week</span>
          </div>

          <div style={{ padding: 24 }}>
            {/* Stylized Bar Chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 180, paddingTop: 20 }}>
              {[
                { day: 'Mon', height: '55%', val: '$14.2k' },
                { day: 'Tue', height: '65%', val: '$16.8k' },
                { day: 'Wed', height: '60%', val: '$15.5k' },
                { day: 'Thu', height: '78%', val: '$19.2k' },
                { day: 'Fri', height: '94%', val: '$24.6k' },
                { day: 'Sat', height: '100%', val: '$28.4k', highlight: true },
                { day: 'Sun', height: '88%', val: '$22.9k' }
              ].map((bar, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: bar.highlight ? '#be123c' : '#64748b' }}>
                    {bar.val}
                  </span>
                  <div style={{ 
                    width: 32, 
                    height: bar.height, 
                    background: bar.highlight ? 'linear-gradient(180deg, #be123c 0%, #881337 100%)' : '#e2e8f0', 
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.3s ease'
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{bar.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="card-container" style={{ margin: 0 }}>
          <div className="card-header">
            <div>
              <h3>Live Operations Pipeline</h3>
              <p style={{ fontSize: 12.5, color: '#64748b' }}>Active kitchen & transit stages</p>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ fontSize: 12, padding: '4px 10px' }}
              onClick={() => navigate('/orders')}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Pending Acceptance', count: 12, color: '#b45309', bg: '#fef3c7', percent: '15%' },
              { label: 'Accepted by Kitchen', count: 28, color: '#0284c7', bg: '#e0f2fe', percent: '35%' },
              { label: 'Cooking / In Processing', count: 42, color: '#6d28d9', bg: '#ede9fe', percent: '55%' },
              { label: 'Food on the Way (Courier)', count: 64, color: '#c2410c', bg: '#ffedd5', percent: '80%' },
              { label: 'Delivered (Today)', count: 320, color: '#15803d', bg: '#dcfce7', percent: '95%' }
            ].map((stat, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                  <span style={{ color: '#334155' }}>{stat.label}</span>
                  <span style={{ color: stat.color }}>{stat.count} orders</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: stat.percent, height: '100%', background: stat.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Section: Recent Orders & Top Selling Dishes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24 }}>
        {/* Recent Orders Ticker */}
        <div className="card-container" style={{ margin: 0 }}>
          <div className="card-header">
            <h3>Recent Incoming Orders</h3>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ fontSize: 12, padding: '5px 10px' }}
              onClick={() => navigate('/orders')}
            >
              All Orders
            </button>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#be123c' }}>{o.id}</span>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{o.restaurant}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{o.customer.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{o.createdAt}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>${o.total.toFixed(2)}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${o.status.toLowerCase().replace(/\s+/g, '')}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Culinary Dishes */}
        <div className="card-container" style={{ margin: 0 }}>
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
        </div>
      </div>
    </div>
  );
}
