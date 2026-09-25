import React from 'react';
import { X, Printer, CheckCircle, Clock, MapPin, Phone, User, Store, Bike, CreditCard, AlertCircle } from 'lucide-react';

export default function OrderDetailsModal({ order, onClose, onUpdateStatus }) {
  if (!order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge badge-scheduled" style={{ marginBottom: 4 }}>Order Details</span>
            <h3>{order.id}</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ padding: '6px 12px', fontSize: 12.5 }}
              onClick={() => window.print()}
            >
              <Printer size={15} /> Print Invoice
            </button>
            <button type="button" className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Status & Timing Banner */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                width: 38, 
                height: 38, 
                borderRadius: '50%', 
                background: '#fff1f2', 
                color: '#be123c', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Clock size={20} />
              </div>
              <div>
                <p style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Current Order Status</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <span className={`badge badge-${order.status.toLowerCase().replace(/\s+/g, '')}`}>
                    {order.status}
                  </span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>• Placed {order.createdAt}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Change Status:</label>
              <select 
                value={order.status}
                onChange={(e) => onUpdateStatus && onUpdateStatus(order.id, e.target.value)}
                className="form-control-input"
                style={{ padding: '6px 10px', fontSize: 12.5, width: 'auto' }}
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="processing">Processing</option>
                <option value="Food on the way">Food on the way</option>
                <option value="Delivered">Delivered</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Dine in">Dine in</option>
                <option value="Offline Payments">Offline Payments</option>
                <option value="Payment Failed">Payment Failed</option>
                <option value="Refunded">Refunded</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
          </div>

          {/* Restaurant & Customer Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Restaurant Box */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#881337' }}>
                <Store size={18} />
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Restaurant Details</h4>
              </div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{order.restaurant}</p>
              <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>Pickup confirmation verified</p>
            </div>

            {/* Customer Box */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: '#881337' }}>
                <User size={18} />
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Customer & Destination</h4>
              </div>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{order.customer.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#475569', marginTop: 4 }}>
                <Phone size={13} color="#94a3b8" /> {order.customer.phone}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#475569', marginTop: 4 }}>
                <MapPin size={13} color="#94a3b8" /> {order.customer.address}
              </div>
            </div>
          </div>

          {/* Delivery Partner Assigned */}
          {order.deliveryPartner && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bike size={18} />
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Assigned Delivery Partner</p>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{order.deliveryPartner.name} • {order.deliveryPartner.phone}</p>
                </div>
              </div>
              <span className="badge badge-active">★ {order.deliveryPartner.rating} Rating</span>
            </div>
          )}

          {/* Itemized Foods Table */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '10px 16px' }}>Item</th>
                  <th style={{ padding: '10px 16px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '10px 16px', textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{item.name}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>×{item.qty}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>${item.price.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>
                      ${(item.qty * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bill Totals */}
            <div style={{ padding: '14px 16px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
                <span>Subtotal Items:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
                <span>Delivery & Courier Fee:</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                  <span>Promotional Discount:</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#0f172a', borderTop: '1px dashed #cbd5e1', paddingTop: 8, marginTop: 4 }}>
                <span>Grand Total:</span>
                <span style={{ color: '#be123c' }}>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment & Notes */}
          <div style={{ background: '#f1f5f9', borderRadius: 10, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={16} color="#64748b" />
              <span><strong>Payment Method:</strong> {order.paymentMethod}</span>
              <span className={`badge ${order.paymentStatus.includes('Paid') ? 'badge-delivered' : 'badge-failed'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {order.specialInstructions && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: 12, display: 'flex', gap: 10 }}>
              <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 12.5, color: '#92400e' }}>
                <strong>Customer Note:</strong> "{order.specialInstructions}"
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
