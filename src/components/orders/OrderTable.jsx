import React, { useState } from 'react';
import { Eye, Search, Filter, Download, ArrowUpDown } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';

export default function OrderTable({ title, orders, onUpdateStatus, emptyMessage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter(order => {
    const q = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.customer.name.toLowerCase().includes(q) ||
      order.restaurant.toLowerCase().includes(q) ||
      order.status.toLowerCase().includes(q)
    );
  });

  const getStatusBadgeClass = (status) => {
    const key = status.toLowerCase().replace(/\s+/g, '');
    switch (key) {
      case 'pending': return 'badge-pending';
      case 'accepted': return 'badge-accepted';
      case 'processing': return 'badge-processing';
      case 'foodontheway': return 'badge-ontheway';
      case 'delivered': return 'badge-delivered';
      case 'scheduled': return 'badge-scheduled';
      case 'canceled': return 'badge-canceled';
      case 'paymentfailed': return 'badge-failed';
      case 'refunded': return 'badge-refunded';
      case 'dinein': return 'badge-dinein';
      case 'offlinepayments': return 'badge-offline';
      default: return 'badge-active';
    }
  };

  return (
    <div className="card-container">
      {/* Table Toolbar */}
      <div className="card-header">
        <div>
          <h3>{title} ({filteredOrders.length})</h3>
          <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
            Real-time feed and lifecycle management
          </p>
        </div>

        <div className="card-header-actions">
          <div className="topbar-search-box" style={{ width: 240, padding: '6px 12px' }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by ID, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ padding: '7px 12px', fontSize: 12.5 }}
            onClick={() => alert(`Exporting ${filteredOrders.length} orders as CSV...`)}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date & Time</th>
              <th>Customer Info</th>
              <th>Restaurant</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>
                    {emptyMessage || 'No orders found matching this filter.'}
                  </div>
                  <p style={{ fontSize: 12.5, marginTop: 4 }}>Check back later or adjust search keywords</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#be123c' }}>{order.id}</span>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{order.orderType}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{order.createdAt}</span>
                    {order.scheduledTime && (
                      <div style={{ fontSize: 11, color: '#4338ca', fontWeight: 600 }}>
                        {order.scheduledTime}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{order.customer.name}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>{order.customer.phone}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{order.restaurant}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12.5, color: '#334155' }}>
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </span>
                    <div style={{ fontSize: 11, color: '#94a3b8', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.items.map(i => i.name).join(', ')}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>
                      ${order.total.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{order.paymentMethod}</div>
                    <span style={{ 
                      fontSize: 11, 
                      fontWeight: 700, 
                      color: order.paymentStatus.includes('Paid') ? '#16a34a' : '#dc2626' 
                    }}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: 12 }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye size={14} /> Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={(id, newStatus) => {
            onUpdateStatus(id, newStatus);
            setSelectedOrder(prev => ({ ...prev, status: newStatus }));
          }}
        />
      )}
    </div>
  );
}
