import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Bike, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Upload, 
  Image as ImageIcon,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function AddDeliveryManModal({ isOpen, onClose, onAdd }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    identityType: 'Driving License',
    identityNumber: '',
    vehicleType: 'Electric Scooter',
    vehicleModel: '',
    plateNo: '',
    drivingLicenseNo: '',
    licenseExpiry: '',
    zone: 'Zone 1 - Downtown Core',
    shift: 'Full Day (9 AM - 9 PM)',
    maxActiveOrders: 2,
    status: 'Available',
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    routingCode: '',
    image: '',
    identityDocument: ''
  });

  const [imagePreview, setImagePreview] = useState('');
  const [idDocName, setIdDocName] = useState('');
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  if (!isOpen) return null;

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      set('image', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDocUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdDocName(file.name);
    set('identityDocument', file.name);
  };

  const steps = ['personal', 'vehicle', 'operations', 'bank'];

  const handleNext = () => {
    if (activeTab === 'personal') {
      if (!formData.name.trim() || !formData.phone.trim()) {
        alert('Please fill in required fields: Full Legal Name & Phone Number.');
        return;
      }
    }
    const currentIndex = steps.indexOf(activeTab);
    if (currentIndex < steps.length - 1) {
      setActiveTab(steps[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    const currentIndex = steps.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(steps[currentIndex - 1]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (activeTab !== 'bank') {
      handleNext();
      return;
    }
    handleSubmit(e);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please fill in required fields (Name & Phone).');
      return;
    }

    const newDriver = {
      ...formData,
      id: `DRV-${Math.floor(100 + Math.random() * 900)}`,
      rating: 5.0,
      completedOrders: 0,
      earningsToday: '$0.00',
      cashInHand: '$0.00',
      batteryOrFuel: '100%',
      joinedDate: new Date().toISOString().split('T')[0],
      currentOrder: null,
      vehicle: `${formData.vehicleModel || 'Scooter'} (${formData.vehicleType})`
    };

    onAdd(newDriver);
    onClose();
  };

  const zonesList = [
    'Zone 1 - Downtown Core',
    'Zone 2 - West District',
    'Zone 3 - Midtown Central',
    'Zone 4 - Brooklyn North',
    'Zone 5 - East River Bay'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        style={{ maxWidth: 720, width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: '#eff6ff', color: '#0284c7',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Bike size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>Onboard New Delivery Partner</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Register courier details, verify driving license and set dispatch zone
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc',
          padding: '4px 20px 0 20px', gap: 8
        }}>
          {[
            { id: 'personal', label: '1. Personal Info', icon: User },
            { id: 'vehicle', label: '2. Vehicle & License', icon: Bike },
            { id: 'operations', label: '3. Shift & Zone', icon: MapPin },
            { id: 'bank', label: '4. Bank & Payouts', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 14px', fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                  border: 'none', background: 'transparent',
                  borderBottom: isActive ? '2px solid #0284c7' : '2px solid transparent',
                  color: isActive ? '#0284c7' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="modal-body" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* TAB 1: PERSONAL INFO */}
            {activeTab === 'personal' && (
              <>
                {/* Photo & Basic details */}
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div style={{
                    width: 76, height: 76, borderRadius: 12, background: '#e2e8f0',
                    overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    border: '1px solid #cbd5e1'
                  }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Driver" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={32} color="#94a3b8" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: '6px 12px', marginBottom: 4 }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={13} /> Upload Courier Photo
                    </button>
                    <p style={{ margin: 0, fontSize: 11.5, color: '#64748b' }}>
                      Clear headshot picture for customer delivery app badge (JPG/PNG, max 2MB)
                    </p>
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Chen"
                      className="form-control-input"
                      value={formData.name}
                      onChange={(e) => set('name', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 (555) 443-1289"
                      className="form-control-input"
                      value={formData.phone}
                      onChange={(e) => set('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. david.chen@fleetmail.com"
                      className="form-control-input"
                      value={formData.email}
                      onChange={(e) => set('email', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Initial Fleet Status</label>
                    <select
                      className="form-control-input"
                      value={formData.status}
                      onChange={(e) => set('status', e.target.value)}
                    >
                      <option value="Available">Available (Instant Dispatch Ready)</option>
                      <option value="Offline">Offline</option>
                      <option value="Suspended">Under Verification / On Leave</option>
                    </select>
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Identity Proof Type</label>
                    <select
                      className="form-control-input"
                      value={formData.identityType}
                      onChange={(e) => set('identityType', e.target.value)}
                    >
                      <option value="Driving License">Driving License</option>
                      <option value="National ID">National ID Card</option>
                      <option value="Passport">Passport</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Identity Document Number</label>
                    <input
                      type="text"
                      placeholder="e.g. DL-9812-4421"
                      className="form-control-input"
                      value={formData.identityNumber}
                      onChange={(e) => set('identityNumber', e.target.value)}
                    />
                  </div>
                </div>

                {/* Document file */}
                <div className="form-group">
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>
                    Upload Government ID Proof (PDF or Image)
                  </label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      ref={docInputRef}
                      style={{ display: 'none' }}
                      onChange={handleDocUpload}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: '6px 12px' }}
                      onClick={() => docInputRef.current?.click()}
                    >
                      <FileText size={13} /> {idDocName ? 'Change File' : 'Select Document'}
                    </button>
                    {idDocName && (
                      <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                        <CheckCircle size={13} style={{ display: 'inline', marginRight: 4 }} />
                        {idDocName}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: VEHICLE & LICENSE */}
            {activeTab === 'vehicle' && (
              <>
                <div className="modal-grid">
                  <div className="form-group">
                    <label>Vehicle Type *</label>
                    <select
                      className="form-control-input"
                      value={formData.vehicleType}
                      onChange={(e) => set('vehicleType', e.target.value)}
                    >
                      <option value="Electric Scooter">Electric Scooter</option>
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Car">Passenger Car</option>
                      <option value="Bicycle">Bicycle / E-Bike</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Vehicle Brand &amp; Model *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Honda PCX / Yamaha NMAX / Prius"
                      className="form-control-input"
                      value={formData.vehicleModel}
                      onChange={(e) => set('vehicleModel', e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Vehicle License Plate / ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NY-8821-E"
                      className="form-control-input"
                      value={formData.plateNo}
                      onChange={(e) => set('plateNo', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Driving License Number</label>
                    <input
                      type="text"
                      placeholder="e.g. DL-NY-90231"
                      className="form-control-input"
                      value={formData.drivingLicenseNo}
                      onChange={(e) => set('drivingLicenseNo', e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>License Expiry Date</label>
                    <input
                      type="date"
                      className="form-control-input"
                      value={formData.licenseExpiry}
                      onChange={(e) => set('licenseExpiry', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Concurrent Orders</label>
                    <select
                      className="form-control-input"
                      value={formData.maxActiveOrders}
                      onChange={(e) => set('maxActiveOrders', Number(e.target.value))}
                    >
                      <option value={1}>1 Order (Single drop)</option>
                      <option value={2}>2 Orders (Batched routes)</option>
                      <option value={3}>3 Orders (Peak surge)</option>
                      <option value={4}>4 Orders (Max capacity)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: OPERATIONS & ZONE */}
            {activeTab === 'operations' && (
              <>
                <div className="form-group">
                  <label>Assigned Delivery Zone *</label>
                  <select
                    className="form-control-input"
                    value={formData.zone}
                    onChange={(e) => set('zone', e.target.value)}
                  >
                    {zonesList.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                  <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#64748b' }}>
                    Orders originating in this geofenced polygon will be prioritized for this courier
                  </p>
                </div>

                <div className="form-group">
                  <label>Working Shift Window</label>
                  <select
                    className="form-control-input"
                    value={formData.shift}
                    onChange={(e) => set('shift', e.target.value)}
                  >
                    <option value="Morning Shift (7 AM - 3 PM)">Morning Shift (7:00 AM - 3:00 PM)</option>
                    <option value="Evening Rush (3 PM - 11 PM)">Evening Rush (3:00 PM - 11:00 PM)</option>
                    <option value="Night Owl (11 PM - 7 AM)">Night Owl (11:00 PM - 7:00 AM)</option>
                    <option value="Full Day (9 AM - 9 PM)">Full Day (9:00 AM - 9:00 PM)</option>
                    <option value="Flexible / Freelance">Flexible / Freelance on Demand</option>
                  </select>
                </div>

                <div style={{
                  padding: 14, borderRadius: 8, background: '#f0fdf4',
                  border: '1px solid #bbf7d0', color: '#15803d', fontSize: 12.5,
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <ShieldCheck size={18} />
                  <span>
                    Couriers automatically receive SLA safety guidelines and automated order acceptance prompts upon entering assigned zones.
                  </span>
                </div>
              </>
            )}

            {/* TAB 4: BANK & PAYOUTS */}
            {activeTab === 'bank' && (
              <>
                <div className="modal-grid">
                  <div className="form-group">
                    <label>Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. David Chen"
                      className="form-control-input"
                      value={formData.accountHolder}
                      onChange={(e) => set('accountHolder', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Chase Bank / CitiBank"
                      className="form-control-input"
                      value={formData.bankName}
                      onChange={(e) => set('bankName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 091823901928"
                      className="form-control-input"
                      value={formData.accountNumber}
                      onChange={(e) => set('accountNumber', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Routing / IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 021000021"
                      className="form-control-input"
                      value={formData.routingCode}
                      onChange={(e) => set('routingCode', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {activeTab !== 'personal' && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrev}
                >
                  Previous Step
                </button>
              )}
              {activeTab !== 'bank' ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  Next Step
                </button>
              ) : (
                <button type="submit" className="btn btn-primary">
                  <CheckCircle size={15} /> Confirm &amp; Register Partner
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
