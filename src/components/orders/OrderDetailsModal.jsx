import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Clock,
  MapPin,
  Phone,
  User,
  Store,
  CreditCard,
  AlertCircle,
  FileText,
  Download,
  Loader2,
  ExternalLink,
  Utensils
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

export default function OrderDetailsModal({ order: initialOrder, onClose, onUpdateStatus }) {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);

  // Fetch full order details by booking ID using GetOrderById curl
  useEffect(() => {
    if (!initialOrder?._id && !initialOrder?.id) return;
    const bookingId = initialOrder._id || initialOrder.id;

    let cancelled = false;
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(URLS.GetOrderById, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: getAuthHeader()
          },
          body: JSON.stringify({ bookingId })
        });
        const data = await res.json();
        if (!cancelled && res.ok && data.success && data.data) {
          setOrder((prev) => ({ ...prev, ...data.data }));
        }
      } catch (err) {
        console.error('Error fetching order details by id:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrderDetails();
    return () => {
      cancelled = true;
    };
  }, [initialOrder]);

  if (!order) return null;

  const orderId = order.orderUniqueId || order.id || order._id;
  const status = order.bookingStatus || order.status || 'pending';
  const dateTime = order.date && order.time ? `${order.date} ${order.time}` : order.createdAt || '';
  const customerName = order.userName || order.customer?.name || 'Customer';
  const customerPhone = order.userPhone || order.customer?.phone || 'N/A';
  const customerAddress = order.address || order.userAddress || order.customer?.address || 'Customer Delivery Address';
  const restaurantName = order.restaurentName || order.restaurant || 'Restaurant Provider';
  const restaurantAddress = order.restaurentAddress || '';
  const restaurantLogo = getImageUrl(order.restaurentLogo);
  const customerImg = getImageUrl(order.userImage);
  const invoiceUrl = getImageUrl(order.invoice);

  const products = Array.isArray(order.products) && order.products.length > 0
    ? order.products
    : (order.items || []);

  const productTotal = Number(order.productTotal || 0);
  const discountAmount = Number(order.discountAmount || 0);
  const totalAmount = Number(order.totalAmount || order.total || 0);

  const getBadgeClass = (st) => {
    const key = (st || '').toLowerCase().replace(/[\s_-]+/g, '');
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 740, width: '95%' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <span className="badge badge-scheduled" style={{ marginBottom: 4 }}>
              Order Details
            </span>
            <h3 style={{ margin: 0, fontSize: 18 }}>{orderId}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Invoice Button */}
            {invoiceUrl ? (
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: 12.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title="Open official PDF invoice"
              >
                <FileText size={15} color="#be123c" /> View Invoice
                <ExternalLink size={12} />
              </a>
            ) : (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: 12.5 }}
                onClick={() => window.print()}
              >
                <Printer size={15} /> Print
              </button>
            )}

            <button type="button" className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 22 }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b', padding: '6px 12px', background: '#f8fafc', borderRadius: 8 }}>
              <Loader2 size={14} className="animate-spin" />
              <span>Fetching latest booking details...</span>
            </div>
          )}

          {/* Status & Timing Banner */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: '#fff1f2',
                  color: '#be123c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Clock size={20} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
                  Order Booking Status
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span className={`badge ${getBadgeClass(status)}`}>
                    {status}
                  </span>
                  {dateTime && (
                    <span style={{ fontSize: 12, color: '#64748b' }}>• Placed on {dateTime}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Change Status Dropdown matching enum */}
            {/* {onUpdateStatus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Change Status:</label>
                <select
                  value={status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    onUpdateStatus(orderId, newStatus);
                    setOrder((prev) => ({ ...prev, bookingStatus: newStatus, status: newStatus }));
                  }}
                  className="form-control-input"
                  style={{ padding: '6px 10px', fontSize: 12.5, width: 'auto' }}
              >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Accepted</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="out_for_delivery">Out for delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
            </div>
            )} */}
          </div>

          {/* Restaurant & Customer Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Restaurant Info */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#be123c' }}>
                <Store size={18} />
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Restaurant Kitchen</h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {restaurantLogo && (
                  <img
                    src={restaurantLogo}
                    alt={restaurantName}
                    style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }}
                  />
                )}
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: 0 }}>{restaurantName}</p>
                  {restaurantAddress && (
                    <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>{restaurantAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#be123c' }}>
                <User size={18} />
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Customer & Delivery</h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {customerImg && (
                  <img
                    src={customerImg}
                    alt={customerName}
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                  />
                )}
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', margin: 0 }}>{customerName}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', marginTop: 4 }}>
                    <Phone size={13} color="#94a3b8" /> {customerPhone}
                  </div>
                </div>
              </div>
              {customerAddress && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: '#475569', marginTop: 8, paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                  <MapPin size={13} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{customerAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Food Products Table */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '10px 16px' }}>Item</th>
                  <th style={{ padding: '10px 16px' }}>Category</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>
                      No items listed for this order.
                    </td>
                  </tr>
                ) : (
                  products.map((item, idx) => {
                    const itemName = item.name || 'Dish Item';
                    const itemQty = item.quantity || item.qty || 1;
                    const itemPrice = Number(item.offerPrice && Number(item.offerPrice) > 0 ? item.offerPrice : item.price || 0);
                    const itemSubtotal = Number(item.productTotal || itemQty * itemPrice);
                    const itemThumb = getImageUrl(item.image);

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {itemThumb && (
                              <img
                                src={itemThumb}
                                alt={itemName}
                                style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <span>{itemName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>
                          {item.categoryName || '-'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>×{itemQty}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>₹{itemPrice.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          ₹{itemSubtotal.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Bill Summary */}
            <div style={{ padding: '14px 18px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {productTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
                  <span>Items Subtotal:</span>
                  <span>₹{productTotal.toLocaleString()}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                  <span>Promotional Discount:</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#0f172a',
                  borderTop: '1px dashed #cbd5e1',
                  paddingTop: 8,
                  marginTop: 4
                }}
              >
                <span>Grand Total:</span>
                <span style={{ color: '#be123c' }}>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment & Transaction Info */}
          <div
            style={{
              background: '#f1f5f9',
              borderRadius: 10,
              padding: 14,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              fontSize: 12.5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={16} color="#64748b" />
              <span>
                <strong>Payment:</strong> {order.paymentStatus}
              </span>
              {/* {order.transactionId && (
                <span style={{ color: '#64748b' }}>
                  (Txn: {order.transactionId})
                </span>
              )} */}
            </div>

            {invoiceUrl && (
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#be123c', fontWeight: 600, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                Download Official Invoice PDF
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ padding: '12px 22px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
