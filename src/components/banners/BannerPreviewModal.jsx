import React, { useState } from 'react';
import { X, ExternalLink, Smartphone, Monitor, MapPin, Calendar, Link2, Sparkles, Tag } from 'lucide-react';
import { getBannerImageUrl } from './EditBannerModal';

function formatDateDisplay(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return d;
  }
}

export default function BannerPreviewModal({ banner, isOpen, onClose }) {
  const [deviceMode, setDeviceMode] = useState('mobile'); // 'mobile' | 'desktop'

  if (!isOpen || !banner) return null;

  const title = banner.name || banner.title || 'Promotional Campaign';
  const imgUrl = getBannerImageUrl(banner.image);
  const zoneName = banner.zone || 'All Delivery Zones';
  const redirectLink = banner.link || banner.redirectUrl || '/restaurants/featured';
  const startDateStr = formatDateDisplay(banner.fromDate || banner.startDate);
  const endDateStr = formatDateDisplay(banner.toDate || banner.endDate);
  const isActive = banner.status === 'active' || banner.status === 'Active';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: deviceMode === 'desktop' ? 820 : 460, transition: 'max-width 0.25s ease' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#fff1f2',
              color: '#be123c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17 }}>Customer App Banner Simulation</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Live customer preview &amp; interaction simulator</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
              <button
                type="button"
                onClick={() => setDeviceMode('mobile')}
                style={{
                  border: 'none',
                  background: deviceMode === 'mobile' ? '#ffffff' : 'transparent',
                  color: deviceMode === 'mobile' ? '#0f172a' : '#64748b',
                  fontWeight: 600,
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  boxShadow: deviceMode === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <Smartphone size={14} /> Mobile App
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('desktop')}
                style={{
                  border: 'none',
                  background: deviceMode === 'desktop' ? '#ffffff' : 'transparent',
                  color: deviceMode === 'desktop' ? '#0f172a' : '#64748b',
                  fontWeight: 600,
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  boxShadow: deviceMode === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <Monitor size={14} /> Web Storefront
              </button>
            </div>

            <button type="button" className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: 24 }}>
          {/* Simulated App Container */}
          <div style={{
            background: deviceMode === 'mobile' ? '#0f172a' : '#f8fafc',
            borderRadius: deviceMode === 'mobile' ? 28 : 14,
            padding: deviceMode === 'mobile' ? '20px 14px' : '20px',
            border: deviceMode === 'mobile' ? '8px solid #1e293b' : '1px solid #e2e8f0',
            boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.25)',
            margin: '0 auto',
            maxWidth: deviceMode === 'mobile' ? 380 : '100%'
          }}>
            {/* Mobile simulated status header */}
            {deviceMode === 'mobile' && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#94a3b8',
                fontSize: 11,
                fontWeight: 600,
                marginBottom: 14,
                padding: '0 8px'
              }}>
                <span>9:41</span>
                <span>The Place Food Delivery</span>
                <span>5G 100%</span>
              </div>
            )}

            {/* Simulated Banner Card inside App */}
            <div style={{
              borderRadius: 16,
              overflow: 'hidden',
              background: '#ffffff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              position: 'relative'
            }}>
              <div style={{ position: 'relative', height: deviceMode === 'mobile' ? 190 : 270, overflow: 'hidden' }}>
                <img
                  src={imgUrl}
                  alt={title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: deviceMode === 'mobile' ? '16px' : '24px'
                }}>
                  <span style={{
                    display: 'inline-block',
                    background: '#be123c',
                    color: '#ffffff',
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '3px 8px',
                    borderRadius: 6,
                    alignSelf: 'flex-start',
                    marginBottom: 6
                  }}>
                    Priority #{banner.priority || '1'}
                  </span>

                  <h3 style={{
                    color: '#ffffff',
                    margin: '0 0 6px 0',
                    fontSize: deviceMode === 'mobile' ? 17 : 22,
                    fontWeight: 800,
                    lineHeight: 1.25,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}>
                    {title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.85)', fontSize: 11.5 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} color="#f59e0b" /> {zoneName}
                    </span>
                    <span>&bull;</span>
                    <span>Tap to explore &rarr;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Meta Info Summary */}
          <div style={{
            marginTop: 20,
            padding: '14px 18px',
            background: '#f8fafc',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12,
            fontSize: 12.5
          }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600 }}>TARGET ZONE</span>
              <strong style={{ color: '#0f172a' }}>{zoneName}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600 }}>SCHEDULE DATES</span>
              <strong style={{ color: '#0f172a' }}>{startDateStr} &rarr; {endDateStr}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600 }}>DEEP-LINK ACTION</span>
              <span style={{ color: '#0284c7', fontWeight: 600, wordBreak: 'break-all' }}>{redirectLink}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 600 }}>STATUS</span>
              <span className={`badge ${isActive ? 'badge-delivered' : 'badge-pending'}`} style={{ textTransform: 'capitalize' }}>
                {banner.status || 'active'}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Preview
          </button>
          <a
            href={imgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ExternalLink size={14} /> Open Original Graphic
          </a>
        </div>
      </div>
    </div>
  );
}
