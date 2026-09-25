import React, { useState } from 'react';
import { Ticket, Plus, Search, Calendar, Tag, Copy, Edit2 } from 'lucide-react';
import { couponsData } from '../../data/mockData';
import CouponModal from './CouponModal';

export default function Coupons() {
  const [coupons, setCoupons] = useState(couponsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const toggleCoupon = (id) => {
    setCoupons(coupons.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === 'Active' ? 'Paused' : 'Active' };
      }
      return c;
    }));
  };

  const handleSaveCoupon = (couponData) => {
    if (editingCoupon) {
      setCoupons(coupons.map(c => c.id === editingCoupon.id ? { ...c, ...couponData } : c));
      setEditingCoupon(null);
    } else {
      const newCoupon = {
        ...couponData,
        id: `CPN-0${coupons.length + 1}`,
        usedCount: 0
      };
      setCoupons([newCoupon, ...coupons]);
      setIsModalOpen(false);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filtered = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Promotional Coupons & Vouchers</h1>
          <p>Create discount campaigns, percentage-off perks, and customer retention coupons with advanced schedule control</p>
        </div>
        <div className="page-actions-block">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => { setEditingCoupon(null); setIsModalOpen(true); }}
          >
            <Plus size={16} /> Create New Coupon
          </button>
        </div>
      </div>

      <div className="card-container">
        <div className="card-header">
          <div>
            <h3>All Active Discount Campaigns ({filtered.length})</h3>
          </div>
          <div className="card-header-actions">
            <div className="topbar-search-box" style={{ width: 260, padding: '6px 12px' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search coupon code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Campaign Title</th>
                <th>Discount Details</th>
                <th>Min Spend / Cap</th>
                <th>Redemption Progress</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cpn) => {
                const percent = Math.min(100, Math.round((cpn.usedCount / cpn.usageLimit) * 100));
                return (
                  <tr key={cpn.id}>
                    <td>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 8,
                        background: '#fff1f2',
                        border: '1px dashed #be123c',
                        padding: '4px 10px',
                        borderRadius: 8,
                        color: '#be123c',
                        fontWeight: 800,
                        fontSize: 13,
                        letterSpacing: '0.05em'
                      }}>
                        <Tag size={13} />
                        {cpn.code}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{cpn.title}</span>
                    </td>
                    <td>
                      <span className="badge badge-accepted" style={{ fontWeight: 700 }}>
                        {cpn.discountValue}
                      </span>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{cpn.discountType}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Min: {cpn.minOrder}</div>
                      <div style={{ fontSize: 11.5, color: '#64748b' }}>Max off: {cpn.maxDiscount}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                        {cpn.usedCount} / {cpn.usageLimit} ({percent}%)
                      </div>
                      <div style={{ height: 6, width: 130, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${percent}%`, 
                          background: percent > 90 ? '#ef4444' : '#10b981',
                          borderRadius: 3 
                        }} />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                        <Calendar size={13} color="#be123c" /> {cpn.validUntil}
                      </div>
                    </td>
                    <td>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={cpn.status === 'Active'}
                          onChange={() => toggleCoupon(cpn.id)}
                        />
                        <span className="slider"></span>
                      </label>
                      <span style={{ 
                        marginLeft: 8, 
                        fontSize: 12, 
                        fontWeight: 600, 
                        color: cpn.status === 'Active' ? '#16a34a' : '#94a3b8' 
                      }}>
                        {cpn.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          onClick={() => handleCopy(cpn.code)}
                          title="Copy Code"
                        >
                          <Copy size={13} /> {copiedCode === cpn.code ? 'Copied!' : 'Copy'}
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          onClick={() => setEditingCoupon(cpn)}
                          title="Edit Campaign"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Modal (Create & Edit with React Datepicker) */}
      <CouponModal
        isOpen={isModalOpen || Boolean(editingCoupon)}
        coupon={editingCoupon}
        onClose={() => { setIsModalOpen(false); setEditingCoupon(null); }}
        onSave={handleSaveCoupon}
      />
    </div>
  );
}
