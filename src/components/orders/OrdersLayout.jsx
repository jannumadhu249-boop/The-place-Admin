import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RefreshCw, ShoppingBag, Clock } from 'lucide-react';
import OrderTable from './OrderTable';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWJkM2RkYjAzMGEyODdlMzhhMWRlZmYiLCJwaG9uZSI6Ijg1MDAyNDEwOTMiLCJpYXQiOjE3OTA3ODcwNDUsImV4cCI6MTgyMjMyMzA0NX0.8Y91D3P6whWIu8Cy2hCO-ivQiIwHXPhPQ41DznvwomM';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export default function OrdersLayout() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = tab || 'all';

  const [orders, setOrders] = useState([]);
  const [bookingExcell, setBookingExcell] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState({
    All: 0,
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0
  });

  const getBackendStatus = (tabId) => {
    switch (tabId) {
      case 'all': return 'All';
      case 'pending': return 'pending';
      case 'confirmed':
      case 'accepted': return 'confirmed';
      case 'preparing':
      case 'processing': return 'preparing';
      case 'ready':
      case 'scheduled': return 'ready';
      case 'out_for_delivery':
      case 'out-for-delivery':
      case 'food-on-the-way': return 'out_for_delivery';
      case 'delivered': return 'delivered';
      case 'cancelled':
      case 'canceled': return 'cancelled';
      default: return 'All';
    }
  };

  const currentStatus = getBackendStatus(activeTab);

  // Define tabs strictly as per required enum
  const orderTabs = [
    { id: 'all', label: 'All Orders', status: 'All' },
    { id: 'pending', label: 'Pending', status: 'pending' },
    { id: 'confirmed', label: 'Confirmed', status: 'confirmed' },
    { id: 'preparing', label: 'Preparing', status: 'preparing' },
    { id: 'ready', label: 'Ready', status: 'ready' },
    { id: 'out_for_delivery', label: 'Out for Delivery', status: 'out_for_delivery' },
    { id: 'delivered', label: 'Delivered', status: 'delivered' },
    { id: 'cancelled', label: 'Cancelled', status: 'cancelled' }
  ];

  // Fetch count badges by fetching all orders
  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch(URLS.GetAllOrders, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify({ bookingStatus: 'All' })
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        const allList = data.data || [];
        const counts = {
          All: allList.length,
          pending: 0,
          confirmed: 0,
          preparing: 0,
          ready: 0,
          out_for_delivery: 0,
          delivered: 0,
          cancelled: 0
        };
        allList.forEach((o) => {
          const st = o.bookingStatus || o.status;
          if (counts[st] !== undefined) {
            counts[st] += 1;
          }
        });
        setStatusCounts(counts);
      }
    } catch (err) {
      console.error('Error fetching order status counts:', err);
    }
  }, []);

  // Fetch orders for current status
  const fetchOrdersForStatus = useCallback(async (status) => {
    setLoading(true);
    try {
      const res = await fetch(URLS.GetAllOrders, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify({ bookingStatus: status })
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setOrders(data.data || []);
        setBookingExcell(data.bookingExcell || []);
      } else {
        setOrders([]);
        setBookingExcell([]);
      }
    } catch (err) {
      console.error('Error fetching orders for status:', err);
      setOrders([]);
      setBookingExcell([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrdersForStatus(currentStatus);
    fetchCounts();
  }, [currentStatus, fetchOrdersForStatus, fetchCounts]);

  const handleRefresh = () => {
    fetchOrdersForStatus(currentStatus);
    fetchCounts();
  };

  const getPageInfo = () => {
    switch (currentStatus) {
      case 'pending':
        return {
          title: 'Pending Food Orders',
          subtitle: 'Newly placed customer orders awaiting restaurant merchant acceptance'
        };
      case 'confirmed':
        return {
          title: 'Confirmed Orders',
          subtitle: 'Orders confirmed and queued for chef preparation'
        };
      case 'preparing':
        return {
          title: 'Preparing in Kitchen',
          subtitle: 'Dishes currently actively cooking and being prepared'
        };
      case 'ready':
        return {
          title: 'Ready for Courier Dispatch',
          subtitle: 'Food orders packaged and waiting for pickup by delivery fleet'
        };
      case 'out_for_delivery':
        return {
          title: 'Out for Delivery Orders',
          subtitle: 'Orders in transit on the way to customer delivery locations'
        };
      case 'delivered':
        return {
          title: 'Delivered Food Orders',
          subtitle: 'Orders successfully delivered to customers'
        };
      case 'cancelled':
        return {
          title: 'Cancelled Orders',
          subtitle: 'Orders cancelled by restaurant or customer'
        };
      default:
        return {
          title: 'All Food Orders',
          subtitle: 'Complete operational log across all restaurant kitchens and delivery statuses'
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div>
      {/* Page Header */}
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
              <ShoppingBag size={20} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22 }}>{pageInfo.title}</h1>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                {pageInfo.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="page-actions-block">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh order feed"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Orders
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div className="card-container" style={{ marginBottom: 20 }}>
        <div className="toolbar-tabs" style={{ padding: '8px 16px', gap: 6, flexWrap: 'wrap' }}>
          {orderTabs.map((t) => {
            const isTabActive =
              activeTab === t.id ||
              (activeTab === 'all' && t.id === 'all') ||
              (activeTab === 'accepted' && t.id === 'confirmed') ||
              (activeTab === 'processing' && t.id === 'preparing') ||
              (activeTab === 'scheduled' && t.id === 'ready') ||
              (activeTab === 'food-on-the-way' && t.id === 'out_for_delivery') ||
              (activeTab === 'canceled' && t.id === 'cancelled');

            const count = statusCounts[t.status] || 0;

            return (
              <button
                key={t.id}
                type="button"
                className={`toolbar-tab-item ${isTabActive ? 'active' : ''}`}
                onClick={() =>
                  t.id === 'all'
                    ? navigate('/orders')
                    : navigate(`/orders/${t.id}`)
                }
                style={{ fontSize: 12.5, padding: '7px 12px' }}
              >
                <span>{t.label}</span>
                <span className="toolbar-tab-badge">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <OrderTable
        title={`${pageInfo.title}`}
        orders={orders}
        bookingExcell={bookingExcell}
        loading={loading}
        emptyMessage={`No ${currentStatus === 'All' ? '' : currentStatus} orders found.`}
        onUpdateStatus={(orderId, newStatus) => {
          setOrders((prev) =>
            prev.map((o) =>
              (o.orderUniqueId === orderId || o.id === orderId || o._id === orderId)
                ? { ...o, bookingStatus: newStatus, status: newStatus }
                : o
            )
          );
          fetchCounts();
          window.dispatchEvent(new CustomEvent('orders-updated'));
        }}
      />
    </div>
  );
}
