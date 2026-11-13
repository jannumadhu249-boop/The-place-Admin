import React, { useState } from 'react';
import { Eye, Search, Download, ArrowUpDown, FileText, ExternalLink, Loader2 } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';
import { URLS } from '../../url';
import { exportToExcel } from '../../utils/excelExport';

const getImageUrl = (path) => {
  if (!path || typeof path !== 'string' || path.trim() === '') return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = (URLS.ImageUrl || URLS.Base || '').replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
};

export default function OrderTable({ title, orders = [], bookingExcell = [], onUpdateStatus, emptyMessage, loading = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter((order) => {
    const q = searchTerm.toLowerCase();
    const id = (order.orderUniqueId || order.id || order._id || '').toLowerCase();
    const customer = (order.userName || order.customer?.name || '').toLowerCase();
    const phone = (order.userPhone || order.customer?.phone || '').toLowerCase();
    const restaurant = (order.restaurentName || order.restaurant || '').toLowerCase();
    const status = (order.bookingStatus || order.status || '').toLowerCase();
    const txn = (order.transactionId || '').toLowerCase();

    return (
      id.includes(q) ||
      customer.includes(q) ||
      phone.includes(q) ||
      restaurant.includes(q) ||
      status.includes(q) ||
      txn.includes(q)
    );
  });

  const getStatusBadgeClass = (status) => {
    const key = (status || '').toLowerCase().replace(/[\s_-]+/g, '');
    switch (key) {
      case 'pending': return 'badge-pending';
      case 'confirmed':
      case 'accepted': return 'badge-accepted';
      case 'preparing':
      case 'processing': return 'badge-processing';
      case 'ready': return 'badge-scheduled';
      case 'outfordelivery':
      case 'foodontheway': return 'badge-ontheway';
      case 'delivered': return 'badge-delivered';
      case 'cancelled':
      case 'canceled': return 'badge-canceled';
      default: return 'badge-active';
    }
  };

  const handleExportXLSX = () => {
    if (!orders.length && !bookingExcell.length) {
      alert('No orders to export.');
      return;
    }

    let exportRows = [];

    if (bookingExcell && bookingExcell.length > 0) {
      exportRows = bookingExcell.map((item, idx) => {
        const match = orders.find(
          (o) => o.transactionId && o.transactionId === item.transactionId
        ) || orders[idx];

        return {
          'Order ID': match?.orderUniqueId || match?._id || `ORD${String(idx + 1).padStart(3, '0')}`,
          'Date': match?.date || '',
          'Time': match?.time || '',
          'Customer Name': item.userName || match?.userName || '',
          'Phone Number': item.userPhone || match?.userPhone || '',
          'Restaurant Name': item.restaurentName || match?.restaurentName || '',
          'Products': item.products || '',
          'Booking Status': item.bookingStatus || match?.bookingStatus || '',
          'Payment Status': item.paymentStatus || match?.paymentStatus || '',
          'Transaction ID': item.transactionId || match?.transactionId || '',
          'Total Amount': item.totalAmount ?? match?.totalAmount ?? 0,
          'Discount Amount': item.discountAmount ?? match?.discountAmount ?? 0
        };
      });
    } else {
      exportRows = filteredOrders.map((o) => ({
        'Order ID': o.orderUniqueId || o.id || o._id || '',
        'Date': o.date || (o.logCreatedDate ? o.logCreatedDate.split('T')[0] : '') || '',
        'Time': o.time || '',
        'Customer Name': o.userName || o.customer?.name || '',
        'Phone Number': o.userPhone || o.customer?.phone || '',
        'Restaurant Name': o.restaurentName || o.restaurant || '',
        'Products': (o.products || []).map((p) => `${p.name} (Qty: ${p.quantity})`).join(', '),
        'Booking Status': o.bookingStatus || o.status || 'pending',
        'Payment Status': o.paymentStatus || 'paid',
        'Transaction ID': o.transactionId || '',
        'Total Amount': o.totalAmount || 0,
        'Discount Amount': o.discountAmount || 0
      }));
    }

    exportToExcel(exportRows, 'orders_export', 'Orders');
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
          <div className="topbar-search-box" style={{ width: 260, padding: '6px 12px' }}>
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search ID, customer, restaurant, txn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ padding: '7px 12px', fontSize: 12.5 }}
            onClick={handleExportXLSX}
            title="Export orders to Excel (.xlsx)"
          >
            <Download size={15} /> Export XLSX
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
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 10 }} />
                  <p style={{ margin: 0, fontSize: 13.5 }}>Fetching live booking orders...</p>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#64748b' }}>
                    {emptyMessage || 'No orders found matching this filter.'}
                  </div>
                  <p style={{ fontSize: 12.5, marginTop: 4 }}>Check back later or adjust search keywords</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const orderId = order.orderUniqueId || order.id || order._id;
                const status = order.bookingStatus || order.status || 'pending';
                const dateTime = order.date && order.time ? `${order.date} ${order.time}` : (order.createdAt || '');
                const customerName = order.userName || order.customer?.name || 'Customer';
                const customerPhone = order.userPhone || order.customer?.phone || 'N/A';
                const restaurant = order.restaurentName || order.restaurant || 'Restaurant';
                const products = Array.isArray(order.products) ? order.products : (order.items || []);
                const totalAmount = Number(order.totalAmount || order.total || 0);
                const paymentStatus = order.paymentStatus || 'Paid';
                const invoiceUrl = getImageUrl(order.invoice);

                return (
                  <tr key={order._id || order.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#be123c' }}>{orderId}</span>
                      {/* {order.transactionId && (
                        <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>
                          Txn: {order.transactionId}
                        </div>
                      )} */}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{dateTime}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{customerName}</div>
                      <div style={{ fontSize: 11.5, color: '#64748b' }}>{customerPhone}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{restaurant}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: '#334155', fontWeight: 600 }}>
                        {products.length} {products.length === 1 ? 'item' : 'items'}
                      </span>
                      <div style={{ fontSize: 11, color: '#94a3b8', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {products.map((p) => p.name).join(', ')}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>
                        ₹{totalAmount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: (paymentStatus || '').toLowerCase() === 'paid' ? '#f0fdf4' : '#fef2f2',
                          color: (paymentStatus || '').toLowerCase() === 'paid' ? '#16a34a' : '#dc2626'
                        }}
                      >
                        {paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          onClick={() => setSelectedOrder(order)}
                          title="View order details"
                        >
                          <Eye size={13} /> Details
                        </button>

                        {invoiceUrl && (
                          <a
                            href={invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-icon"
                            style={{
                              padding: 6,
                              borderRadius: 6,
                              background: '#fff1f2',
                              color: '#be123c',
                              border: '1px solid #fecdd3'
                            }}
                            title="Open invoice PDF"
                          >
                            <FileText size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
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
            if (onUpdateStatus) onUpdateStatus(id, newStatus);
            setSelectedOrder((prev) => ({ ...prev, bookingStatus: newStatus, status: newStatus }));
          }}
        />
      )}
    </div>
  );
}
