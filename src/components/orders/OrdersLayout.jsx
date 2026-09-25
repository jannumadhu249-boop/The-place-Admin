import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AllOrders from './AllOrders';
import ScheduledOrders from './ScheduledOrders';
import PendingOrders from './PendingOrders';
import AcceptedOrders from './AcceptedOrders';
import ProcessingOrders from './ProcessingOrders';
import FoodOnTheWayOrders from './FoodOnTheWayOrders';
import DeliveredOrders from './DeliveredOrders';
import CanceledOrders from './CanceledOrders';
import PaymentFailedOrders from './PaymentFailedOrders';
import RefundedOrders from './RefundedOrders';
import DineInOrders from './DineInOrders';
import OfflinePaymentsOrders from './OfflinePaymentsOrders';

export default function OrdersLayout({ orders, onUpdateStatus }) {
  const navigate = useNavigate();
  const { tab } = useParams(); // e.g. /orders/pending → tab = 'pending'
  const activeTab = tab || 'all';

  const orderTabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'scheduled', label: 'Scheduled', count: orders.filter(o => o.status === 'Scheduled').length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { id: 'accepted', label: 'Accepted', count: orders.filter(o => o.status === 'accepted').length },
    { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { id: 'food-on-the-way', label: 'Food on the Way', count: orders.filter(o => o.status === 'Food on the way').length },
    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length },
    { id: 'canceled', label: 'Canceled', count: orders.filter(o => o.status === 'Canceled').length },
    { id: 'payment-failed', label: 'Payment Failed', count: orders.filter(o => o.status === 'Payment Failed').length },
    { id: 'refunded', label: 'Refunded', count: orders.filter(o => o.status === 'Refunded').length },
    { id: 'dine-in', label: 'Dine In', count: orders.filter(o => o.status === 'Dine in' || o.orderType === 'Dine In').length },
    { id: 'offline-payments', label: 'Offline Payments', count: orders.filter(o => o.status === 'Offline Payments' || o.paymentMethod?.toLowerCase().includes('cash')).length }
  ];

  return (
    <div>
      {/* Sub-Navigation Tabs Bar — each tab updates the URL */}
      <div className="card-container" style={{ marginBottom: 20 }}>
        <div className="toolbar-tabs" style={{ padding: '8px 16px', gap: 6, flexWrap: 'wrap' }}>
          {orderTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`toolbar-tab-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() =>
                tab.id === 'all'
                  ? navigate('/orders')
                  : navigate(`/orders/${tab.id}`)
              }
              style={{ fontSize: 12.5, padding: '7px 12px' }}
            >
              <span>{tab.label}</span>
              <span className="toolbar-tab-badge">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'all' && <AllOrders orders={orders} onUpdateStatus={onUpdateStatus} />}
      {activeTab === 'scheduled' && <ScheduledOrders orders={orders} onUpdateStatus={onUpdateStatus} />}
      {activeTab === 'pending' && <PendingOrders orders={orders} onUpdateStatus={onUpdateStatus} />}
      {activeTab === 'accepted' && <AcceptedOrders orders={orders} onUpdateStatus={onUpdateStatus} />}
      {activeTab === 'processing' && <ProcessingOrders orders={orders} onUpdateStatus={onUpdateStatus} />}
      {activeTab === 'food-on-the-way' && <FoodOnTheWayOrders orders={orders} onUpdateStatus={onUpdateStatus} />}
      {activeTab === 'delivered' && <DeliveredOrders orders={orders} onUpdateStatus={onUpdateStatus} />}
      {activeTab === 'canceled' && <CanceledOrders orders={orders} onUpdateStatus={onUpdateStatus} />}
      {activeTab === 'payment-failed' && <PaymentFailedOrders orders={orders} onUpdateStatus={onUpdateStatus} />}
      {activeTab === 'refunded' && <RefundedOrders orders={orders} onUpdateStatus={onUpdateStatus} />}
      {activeTab === 'dine-in' && <DineInOrders orders={orders} onUpdateStatus={onUpdateStatus} />}
      {activeTab === 'offline-payments' && <OfflinePaymentsOrders orders={orders} onUpdateStatus={onUpdateStatus} />}
    </div>
  );
}
