import React, { useState, useEffect } from 'react';
import { X, Tag, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function CouponModal({ isOpen, onClose, onSave, coupon = null }) {
  const isEditing = Boolean(coupon);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    discountType: 'Percentage',
    discountValue: '20%',
    minOrder: '$30.00',
    maxDiscount: '$15.00',
    usageLimit: 500,
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days default
    status: 'Active'
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        ...coupon,
        validUntil: coupon.validUntil ? new Date(coupon.validUntil) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      });
    } else {
      setFormData({
        code: '',
        title: '',
        discountType: 'Percentage',
        discountValue: '20%',
        minOrder: '$30.00',
        maxDiscount: '$15.00',
        usageLimit: 500,
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'Active'
      });
    }
  }, [coupon, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedDate = formData.validUntil instanceof Date 
      ? formData.validUntil.toISOString().split('T')[0] 
      : formData.validUntil;

    onSave({
      ...formData,
      code: formData.code.toUpperCase().trim(),
      minOrder: formData.minOrder.startsWith('$') ? formData.minOrder : `$${formData.minOrder}`,
      maxDiscount: formData.maxDiscount.startsWith('$') ? formData.maxDiscount : `$${formData.maxDiscount}`,
      usageLimit: Number(formData.usageLimit),
      validUntil: formattedDate
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
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
              <Tag size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17 }}>
                {isEditing ? `Edit Coupon Campaign — ${coupon.code}` : 'Create New Promotional Coupon'}
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                {isEditing ? 'Update campaign parameters and validity' : 'Configure voucher parameters, limits, and dates'}
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="modal-grid">
              <div className="form-group">
                <label>Coupon Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FEAST25"
                  className="form-control-input"
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend Gourmet Delight"
                  className="form-control-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Discount Type</label>
                <select
                  className="form-control-input"
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                >
                  <option value="Percentage">Percentage Discount (%)</option>
                  <option value="Fixed Amount">Fixed Amount ($)</option>
                  <option value="Free Delivery">Free Delivery Perk</option>
                </select>
              </div>

              <div className="form-group">
                <label>Discount Value</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 25% or $10.00"
                  className="form-control-input"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Minimum Order Cart ($)</label>
                <input
                  type="text"
                  required
                  placeholder="$30.00"
                  className="form-control-input"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Max Cap / Discount Limit ($)</label>
                <input
                  type="text"
                  required
                  placeholder="$15.00"
                  className="form-control-input"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Redemption Usage Limit</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="500"
                  className="form-control-input"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                />
              </div>

              {/* Advanced Calendar DatePicker */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarIcon size={14} color="#be123c" />
                  <span>Expiry Date (Advanced Calendar)</span>
                </label>
                <DatePicker
                  selected={formData.validUntil instanceof Date ? formData.validUntil : new Date(formData.validUntil)}
                  onChange={(date) => setFormData({ ...formData, validUntil: date })}
                  dateFormat="MMMM d, yyyy"
                  minDate={new Date()}
                  className="custom-datepicker-input"
                  placeholderText="Select expiration date"
                  showPopperArrow={false}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={15} /> {isEditing ? 'Save Changes' : 'Publish Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
