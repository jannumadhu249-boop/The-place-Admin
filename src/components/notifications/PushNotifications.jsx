import React, { useState } from 'react';
import { Bell, Send, Smartphone, Users, CheckCircle, Clock, Zap } from 'lucide-react';
import { pushNotificationsData } from '../../data/mockData';

export default function PushNotifications() {
  const [notifications, setNotifications] = useState(pushNotificationsData);
  const [title, setTitle] = useState('Midnight Cravings Alert! 🌙 15% Off');
  const [message, setMessage] = useState('Satisfy late-night appetites with gourmet woodfired pizzas & artisanal desserts.');
  const [targetAudience, setTargetAudience] = useState('All Customers');
  const [zone, setZone] = useState('All Zones');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleBroadcast = (e) => {
    e.preventDefault();
    const newNotif = {
      id: `PUSH-${Math.floor(Math.random() * 900) + 100}`,
      title,
      message,
      target: targetAudience,
      zone,
      sentAt: 'Just now',
      deliveredCount: targetAudience === 'Delivery Fleet Drivers' ? '410' : '28,400',
      openRate: '36.8%',
      status: 'Sent'
    };
    setNotifications([newNotif, ...notifications]);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Push Notification Dispatcher</h1>
          <p>Broadcast high-priority alerts, seasonal promotions, and courier weather surge announcements</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* Left Column: Broadcast Composer */}
        <div className="card-container" style={{ margin: 0 }}>
          <div className="card-header">
            <h3>Compose Broadcast Campaign</h3>
          </div>

          <form onSubmit={handleBroadcast} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sentSuccess && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, color: '#065f46', fontSize: 13 }}>
                <CheckCircle size={18} color="#10b981" />
                <span>Broadcast successfully delivered to target devices!</span>
              </div>
            )}

            <div className="form-group">
              <label>Notification Headline / Title</label>
              <input
                type="text"
                required
                className="form-control-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flash Sale! 20% Off Tonight"
              />
            </div>

            <div className="form-group">
              <label>Notification Body Message</label>
              <textarea
                rows={4}
                required
                className="form-control-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write compelling text under 120 characters..."
              />
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Target Audience Segment</label>
                <select
                  className="form-control-input"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                >
                  <option value="All Customers">All Customers (Registered)</option>
                  <option value="Delivery Fleet Drivers">Delivery Fleet Drivers</option>
                  <option value="Restaurant Merchants">Restaurant Merchants</option>
                  <option value="VIP Members">VIP Club Members</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Geographic Zone</label>
                <select
                  className="form-control-input"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                >
                  <option value="All Zones">All Delivery Zones</option>
                  <option value="Midtown & Downtown">Midtown & Downtown</option>
                  <option value="Zone 1 - Downtown Core">Zone 1 - Downtown Core</option>
                  <option value="Zone 4 - Brooklyn North">Zone 4 - Brooklyn North</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: 12, marginTop: 8 }}>
              <Send size={16} /> Broadcast Notification Now
            </button>
          </form>
        </div>

        {/* Right Column: Live Mobile Device Mockup Preview */}
        <div className="card-container" style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, color: '#64748b', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
            <Smartphone size={16} /> Live Device Lock-Screen Preview
          </div>

          {/* Smartphone Frame */}
          <div style={{
            width: 300,
            height: 480,
            background: '#0f172a',
            borderRadius: 36,
            border: '8px solid #334155',
            boxShadow: '0 20px 30px rgba(0,0,0,0.2)',
            padding: '16px 14px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start'
          }}>
            {/* Top Notch */}
            <div style={{ width: 100, height: 16, background: '#334155', borderRadius: '0 0 12px 12px', margin: '0 auto 24px' }} />

            {/* Time Stamp */}
            <div style={{ textAlign: 'center', color: '#ffffff', marginBottom: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>07:45</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Friday, September 21</div>
            </div>

            {/* Glass Push Notification Card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(10px)',
              borderRadius: 16,
              padding: 14,
              boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: '#be123c', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Bell size={11} />
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a' }}>GOURMET EXPRESS</span>
                </div>
                <span style={{ fontSize: 10, color: '#64748b' }}>now</span>
              </div>
              <h5 style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{title}</h5>
              <p style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.4 }}>{message}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sent History Table */}
      <div className="card-container">
        <div className="card-header">
          <h3>Campaign Delivery Log</h3>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Campaign Headline</th>
                <th>Target Segment</th>
                <th>Zone Scope</th>
                <th>Sent Timestamp</th>
                <th>Delivered</th>
                <th>Open Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notif) => (
                <tr key={notif.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{notif.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b', maxWidth: 360, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {notif.message}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-accepted">{notif.target}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: '#475569' }}>{notif.zone}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12.5, color: '#64748b' }}>{notif.sentAt}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{notif.deliveredCount}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#16a34a' }}>{notif.openRate}</span>
                  </td>
                  <td>
                    <span className="badge badge-delivered">{notif.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
