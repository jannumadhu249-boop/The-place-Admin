import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Store, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Upload, 
  Image as ImageIcon, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';

export default function AddRestaurantModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    zone: '',
    address: '',
    phone: '',
    commissionRate: '15',
    estimatedDeliveryTime: '20-30 min',
    // Media & Branding
    logo: '',
    image: '',
    // Tax & Legal
    tinNumber: '',
    expiryDate: '',
    tinCertificate: '',
    tinCertificateName: '',
    licenceDocument: '',
    licenceDocumentName: '',
    // Owner & Operations
    ownerName: '',
    ownerPhoneNumber: '',
    openingTime: '09:00',
    closingTime: '22:00',
    // Account Information
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (field, nameField, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        [field]: reader.result,
        [nameField]: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match. Please ensure both passwords match.');
      return;
    }
    setPasswordError('');

    onAdd({
      ...formData,
      commissionRate: Number(formData.commissionRate) || 15,
      rating: 5.0,
      reviews: 1,
      totalOrders: 0,
      totalEarnings: '$0.00',
      status: 'Active',
      isOpen: true,
      image: formData.image || 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80',
      logo: formData.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
      address: formData.address || 'Central Culinary Quarter, NY'
    });
    onClose();
  };

  const set = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (field === 'password' || field === 'confirmPassword') {
      setPasswordError('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 760, width: '92%' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: '#fff1f2', color: '#be123c',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Store size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>Onboard Partner Restaurant</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Complete merchant profile, legal tax compliance, and account credentials
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '22px 26px' }}>

            {/* SECTION 1: General Information */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Store size={16} color="#be123c" />
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  1. General Restaurant Information
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="modal-grid">
                  <div className="form-group">
                    <label>Restaurant Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bella Trattoria"
                      className="form-control-input"
                      value={formData.name}
                      onChange={(e) => set('name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cuisine Category *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Authentic Italian, Neapolitan Pizza"
                      className="form-control-input"
                      value={formData.cuisine}
                      onChange={(e) => set('cuisine', e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Assigned Zone *</label>
                    <select
                      className="form-control-input"
                      required
                      value={formData.zone}
                      onChange={(e) => set('zone', e.target.value)}
                    >
                      <option value="">Select Delivery Zone</option>
                      <option value="Zone 1 - Downtown Core">Zone 1 - Downtown Core</option>
                      <option value="Zone 2 - West District">Zone 2 - West District</option>
                      <option value="Zone 3 - Midtown Central">Zone 3 - Midtown Central</option>
                      <option value="Zone 4 - Brooklyn North">Zone 4 - Brooklyn North</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Platform Commission (%) *</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      required
                      placeholder="15"
                      className="form-control-input"
                      value={formData.commissionRate}
                      onChange={(e) => set('commissionRate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Contact Phone *</label>
                    <input
                      type="text"
                      required
                      placeholder="+1 (555) 234-5678"
                      className="form-control-input"
                      value={formData.phone}
                      onChange={(e) => set('phone', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Estimated Delivery Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 20-30 min"
                      className="form-control-input"
                      value={formData.estimatedDeliveryTime}
                      onChange={(e) => set('estimatedDeliveryTime', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Physical Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 452 Culinary Ave, Suite 100, New York, NY"
                    className="form-control-input"
                    value={formData.address}
                    onChange={(e) => set('address', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Restaurant Branding & Media */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <ImageIcon size={16} color="#0284c7" />
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  2. Branding &amp; Storefront Media
                </h4>
              </div>

              <div className="modal-grid">
                {/* Restaurant Logo */}
                <div className="form-group" style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Store size={14} color="#be123c" /> Restaurant Logo *
                  </label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 54, height: 54, borderRadius: 8,
                      background: '#e2e8f0', border: '1px solid #cbd5e1',
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ImageIcon size={22} color="#94a3b8" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input
                        type="file"
                        accept="image/*"
                        id="logo-upload"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload('logo', 'logoName', e)}
                      />
                      <label htmlFor="logo-upload" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: 12, cursor: 'pointer', marginBottom: 6 }}>
                        <Upload size={13} /> Choose Logo Image
                      </label>
                      <input
                        type="text"
                        placeholder="Or paste Logo Image URL"
                        className="form-control-input"
                        style={{ fontSize: 12, padding: '6px 10px' }}
                        value={formData.logo}
                        onChange={(e) => set('logo', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Storefront Cover Image */}
                <div className="form-group" style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ImageIcon size={14} color="#0284c7" /> Storefront Cover Banner *
                  </label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 54, height: 54, borderRadius: 8,
                      background: '#e2e8f0', border: '1px solid #cbd5e1',
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {formData.image ? (
                        <img src={formData.image} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ImageIcon size={22} color="#94a3b8" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input
                        type="file"
                        accept="image/*"
                        id="cover-upload"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload('image', 'imageName', e)}
                      />
                      <label htmlFor="cover-upload" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: 12, cursor: 'pointer', marginBottom: 6 }}>
                        <Upload size={13} /> Choose Banner Image
                      </label>
                      <input
                        type="text"
                        placeholder="Or paste Banner Image URL"
                        className="form-control-input"
                        style={{ fontSize: 12, padding: '6px 10px' }}
                        value={formData.image}
                        onChange={(e) => set('image', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Tax Identification & Legal Documents */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <ShieldCheck size={16} color="#059669" />
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  3. Tax Identification (TIN) &amp; Business Licensing
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="modal-grid">
                  <div className="form-group">
                    <label>Taxpayer Identification Number (TIN) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TIN-98234-881A"
                      className="form-control-input"
                      value={formData.tinNumber}
                      onChange={(e) => set('tinNumber', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color="#0284c7" />
                      <span>Licence / TIN Expiry Date *</span>
                    </label>
                    <input
                      type="date"
                      required
                      className="form-control-input"
                      value={formData.expiryDate}
                      onChange={(e) => set('expiryDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-grid">
                  {/* TIN Certificate */}
                  <div className="form-group" style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={14} color="#059669" /> TIN Certificate (Image or Document) *
                    </label>
                    <p style={{ margin: '0 0 10px 0', fontSize: 11.5, color: '#64748b' }}>
                      Upload valid government Taxpayer Identification document
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      id="tin-upload"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload('tinCertificate', 'tinCertificateName', e)}
                    />
                    <label htmlFor="tin-upload" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: 12, cursor: 'pointer', marginBottom: 6 }}>
                      <Upload size={13} /> {formData.tinCertificateName ? 'Change Certificate' : 'Upload TIN Certificate'}
                    </label>
                    {formData.tinCertificateName && (
                      <div style={{ fontSize: 11.5, color: '#059669', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FileText size={12} /> {formData.tinCertificateName}
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Or document URL link"
                      className="form-control-input"
                      style={{ fontSize: 12, padding: '6px 10px', marginTop: 6 }}
                      value={formData.tinCertificate}
                      onChange={(e) => set('tinCertificate', e.target.value)}
                    />
                  </div>

                  {/* Licence Document */}
                  <div className="form-group" style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={14} color="#d97706" /> Licence Document *
                    </label>
                    <p style={{ margin: '0 0 10px 0', fontSize: 11.5, color: '#64748b' }}>
                      Upload trade business / food hygiene authority licence
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      id="licence-upload"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload('licenceDocument', 'licenceDocumentName', e)}
                    />
                    <label htmlFor="licence-upload" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: 12, cursor: 'pointer', marginBottom: 6 }}>
                      <Upload size={13} /> {formData.licenceDocumentName ? 'Change Licence' : 'Upload Licence Document'}
                    </label>
                    {formData.licenceDocumentName && (
                      <div style={{ fontSize: 11.5, color: '#d97706', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FileText size={12} /> {formData.licenceDocumentName}
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Or licence URL link"
                      className="form-control-input"
                      style={{ fontSize: 12, padding: '6px 10px', marginTop: 6 }}
                      value={formData.licenceDocument}
                      onChange={(e) => set('licenceDocument', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Owner & Operational Hours */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Clock size={16} color="#7c3aed" />
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  4. Operations &amp; Owner Profile
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="modal-grid">
                  <div className="form-group">
                    <label>Principal Owner Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Chef Marco Rossi"
                      className="form-control-input"
                      value={formData.ownerName}
                      onChange={(e) => set('ownerName', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Owner Direct Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 (555) 998-1122"
                      className="form-control-input"
                      value={formData.ownerPhoneNumber}
                      onChange={(e) => set('ownerPhoneNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Daily Opening Time</label>
                    <input
                      type="time"
                      className="form-control-input"
                      value={formData.openingTime}
                      onChange={(e) => set('openingTime', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Daily Closing Time</label>
                    <input
                      type="time"
                      className="form-control-input"
                      value={formData.closingTime}
                      onChange={(e) => set('closingTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: Account Information (Merchant Credentials) */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Lock size={16} color="#be123c" />
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  5. Merchant Portal Account Information
                </h4>
              </div>

              {passwordError && (
                <div style={{
                  padding: '10px 14px', marginBottom: 14, borderRadius: 8,
                  background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5
                }}>
                  <AlertCircle size={15} /> <span>{passwordError}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label>Merchant Portal Login Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="merchant@restaurant.com"
                    className="form-control-input"
                    value={formData.email}
                    onChange={(e) => set('email', e.target.value)}
                  />
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Portal Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      className="form-control-input"
                      value={formData.password}
                      onChange={(e) => set('password', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter password"
                      className="form-control-input"
                      value={formData.confirmPassword}
                      onChange={(e) => set('confirmPassword', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={15} /> Register Partner Restaurant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
