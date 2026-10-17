import React from 'react';
import { 
  X, 
  Bike, 
  Phone, 
  Mail, 
  Star, 
  CheckCircle, 
  MapPin, 
  Battery, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Navigation,
  Award,
  Package,
  AlertTriangle,
  Store,
  Compass
} from 'lucide-react';

export default function DeliveryManDetailsModal({ driver, isOpen, onClose, onSettleCash, onTrackGPS }) {
  if (!isOpen || !driver) return null;

  const isActiveTrip = driver.status === 'On Delivery' && driver.currentOrder;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: 680, width: '92%', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: '#f1f5f9', color: '#475569'
            }}>
              Courier ID: {driver.id}
            </span>
            <span className={`badge ${
              driver.status === 'On Delivery' ? 'badge-ontheway' :
              driver.status === 'Available' ? 'badge-delivered' : 'badge-offline'
            }`}>
              {driver.status}
            </span>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Driver Profile Hero Card */}
          <div style={{
            display: 'flex', gap: 16, alignItems: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: 18, borderRadius: 12, border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 16,
              background: '#e2e8f0', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexShrink: 0
            }}>
              {driver.image ? (
                <img src={driver.image} alt={driver.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Bike size={32} color="#0284c7" />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{driver.name}</h3>
                <span title="Identity & License Verified" style={{ display: 'inline-flex', color: '#0284c7' }}>
                  <ShieldCheck size={18} />
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12.5, color: '#64748b', marginTop: 4 }}>
                <a href={`tel:${driver.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                  <Phone size={13} /> {driver.phone}
                </a>
                {driver.email && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Mail size={13} /> {driver.email}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} color="#ea580c" /> {driver.zone}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 20,
                background: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: 13
              }}>
                <Star size={14} fill="#b45309" color="#b45309" />
                {driver.rating || '4.90'}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b' }}>
                {driver.completedOrders || 0} reviews
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Lifetime Trips</span>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                {driver.completedOrders || 0}
              </div>
              <span style={{ fontSize: 10.5, color: '#16a34a', fontWeight: 700 }}>98.4% On-Time</span>
            </div>

            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Today's Earnings</span>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                {driver.earningsToday || '$0.00'}
              </div>
              <span style={{ fontSize: 10.5, color: '#0284c7', fontWeight: 700 }}>+ Tips Included</span>
            </div>

            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Cash in Hand</span>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#be123c', marginTop: 2 }}>
                {driver.cashInHand || '$42.50'}
              </div>
              <button
                type="button"
                onClick={() => onSettleCash && onSettleCash(driver)}
                style={{
                  border: 'none', background: 'transparent',
                  color: '#be123c', fontSize: 10.5, fontWeight: 700,
                  textDecoration: 'underline', cursor: 'pointer', padding: 0
                }}
              >
                Settle Now
              </button>
            </div>

            <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 10, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>Battery / Fuel</span>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#059669', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Battery size={16} />
                {driver.batteryOrFuel || '90%'}
              </div>
              <span style={{ fontSize: 10.5, color: '#64748b' }}>Sufficient</span>
            </div>
          </div>

          {/* Active Trip Card if on delivery */}
          {isActiveTrip && (
            <div style={{
              background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10,
              padding: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Navigation size={18} color="#be123c" />
                  <span style={{ fontWeight: 700, color: '#9f1239', fontSize: 14 }}>
                    Active Delivery Run: Order #{driver.currentOrder}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 8px', fontSize: 11.5, color: '#be123c', borderColor: '#f43f5e' }}
                  onClick={() => onTrackGPS && onTrackGPS(driver)}
                >
                  <Compass size={13} /> Live GPS View
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12.5, color: '#881337' }}>
                <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #ffe4e6' }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, color: '#0f172a' }}>
                    <Store size={13} color="#be123c" /> Merchant Pick-up:
                  </div>
                  <div style={{ color: '#475569', marginTop: 2 }}>Trattoria Bella Napoli (452 Culinary Ave)</div>
                </div>

                <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #ffe4e6' }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, color: '#0f172a' }}>
                    <Package size={13} color="#059669" /> Customer Destination:
                  </div>
                  <div style={{ color: '#475569', marginTop: 2 }}>742 Evergreen Terrace (Apartment 4B)</div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle & Equipment Details */}
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 13.5, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bike size={16} color="#0284c7" /> Vehicle Specifications &amp; License
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12.5 }}>
              <div>
                <span style={{ color: '#64748b' }}>Assigned Vehicle:</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{driver.vehicle}</div>
              </div>

              <div>
                <span style={{ color: '#64748b' }}>License Plate Number:</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>
                  <span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                    {driver.plateNo}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ color: '#64748b' }}>Driving License Number:</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{driver.drivingLicenseNo || 'DL-NY-891238'}</div>
              </div>

              <div>
                <span style={{ color: '#64748b' }}>Shift / Operational Hours:</span>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{driver.shift || 'Full Day (9:00 AM - 9:00 PM)'}</div>
              </div>
            </div>
          </div>

          {/* Compliance & Bank Account Verification */}
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 13.5, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={16} color="#059669" /> Verification Badges &amp; Settlement
            </h4>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', background: '#ecfdf5', border: '1px solid #bbf7d0',
                color: '#15803d', borderRadius: 8, fontSize: 12, fontWeight: 600
              }}>
                <CheckCircle size={14} /> Background Check Passed
              </div>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', background: '#eff6ff', border: '1px solid #bfdbfe',
                color: '#1d4ed8', borderRadius: 8, fontSize: 12, fontWeight: 600
              }}>
                <CheckCircle size={14} /> Commercial Driver Insurance Active
              </div>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', background: '#fdf4ff', border: '1px solid #f5d0fe',
                color: '#9333ea', borderRadius: 8, fontSize: 12, fontWeight: 600
              }}>
                <CheckCircle size={14} /> Direct Deposit Banking Configured
              </div>
            </div>
          </div>

        </div>

        <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onTrackGPS && onTrackGPS(driver)}
          >
            <Compass size={15} /> Track Courier GPS Coordinates
          </button>
        </div>
      </div>
    </div>
  );
}
