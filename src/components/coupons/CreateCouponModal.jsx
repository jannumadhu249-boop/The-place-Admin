import React, { useState, useEffect } from 'react';
import { X, Tag, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

function toISODateString(d) {
  if (!d) return '';
  if (typeof d === 'string') {
    const match = d.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const INITIAL_FORM = {
  code: '',
  name: '',
  type: 'percentage',
  discount: '',
  limit: '',
  description: '',
  fromDate: new Date(),
  toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  status: 'active'
};

export default function CreateCouponModal({ isOpen, onClose, onSuccess, onError }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setFormData(INITIAL_FORM);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isPercentage = formData.type === 'percentage';
      const apiType = isPercentage ? 'percentage' : 'amount';

      const payload = {
        fromDate: toISODateString(formData.fromDate),
        toDate: toISODateString(formData.toDate),
        name: (formData.name || '').trim(),
        code: (formData.code || '').toUpperCase().trim(),
        type: apiType,
        discount: Number(formData.discount) || 0,
        limit: formData.limit !== '' && formData.limit !== null ? Number(formData.limit) : 0,
        description: (formData.description || '').trim() || (isPercentage ? `${formData.discount}% discount on selected purchases` : `₹${formData.discount} discount on selected purchases`),
        oncePerCustomer: true,
        status: formData.status || 'active'
      };

      const res = await fetch(URLS.CreateCoupons, {
        method: 'POST',
        headers: {
          authorization: getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        onSuccess && onSuccess();
      } else {
        throw new Error(data.message || 'Failed to create coupon');
      }
    } catch (err) {
      console.error('Create coupon error:', err);
      onError && onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const set = (field, val) => setFormData((prev) => ({ ...prev, [field]: val }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: '#fff1f2', color: '#be123c',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Tag size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17 }}>Create New Promotional Coupon</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Configure voucher parameters, limits, and dates</p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Code & Name */}
            <div className="modal-grid">
              <div className="form-group">
                <label>Coupon Promo Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER20"
                  className="form-control-input"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
                  value={formData.code}
                  onChange={(e) => set('code', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Campaign Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Discount"
                  className="form-control-input"
                  value={formData.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </div>
            </div>

            {/* Discount Type & Value */}
            <div className="modal-grid">
              <div className="form-group">
                <label>Discount Type *</label>
                <select
                  className="form-control-input"
                  value={formData.type === 'fixed' ? 'amount' : formData.type}
                  onChange={(e) => set('type', e.target.value)}
                >
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="amount">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  {formData.type === 'percentage' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder={formData.type === 'percentage' ? 'e.g. 20' : 'e.g. 100'}
                  className="form-control-input"
                  value={formData.discount}
                  onChange={(e) => set('discount', e.target.value)}
                />
              </div>
            </div>

            {/* Usage Limit & Status */}
            <div className="modal-grid">
              <div className="form-group">
                <label>Redemption Usage Limit *</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 100"
                  className="form-control-input"
                  value={formData.limit}
                  onChange={(e) => set('limit', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-control-input"
                  value={formData.status}
                  onChange={(e) => set('status', e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Start Date & Expiry Date */}
            <div className="modal-grid">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarIcon size={14} color="#0284c7" />
                  <span>Start Date *</span>
                </label>
                <DatePicker
                  selected={formData.fromDate instanceof Date ? formData.fromDate : new Date(formData.fromDate)}
                  onChange={(date) => set('fromDate', date)}
                  dateFormat="MMMM d, yyyy"
                  className="custom-datepicker-input"
                  placeholderText="Select start date"
                  showPopperArrow={false}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarIcon size={14} color="#be123c" />
                  <span>Expiry Date *</span>
                </label>
                <DatePicker
                  selected={formData.toDate instanceof Date ? formData.toDate : new Date(formData.toDate)}
                  onChange={(date) => set('toDate', date)}
                  dateFormat="MMMM d, yyyy"
                  minDate={formData.fromDate || new Date()}
                  className="custom-datepicker-input"
                  placeholderText="Select expiration date"
                  showPopperArrow={false}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Campaign Description / Notes</label>
              <textarea
                className="form-control-input"
                rows="2"
                placeholder="e.g. 20% discount on selected purchases"
                value={formData.description}
                onChange={(e) => set('description', e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <CheckCircle size={15} /> {submitting ? 'Publishing...' : 'Publish Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
