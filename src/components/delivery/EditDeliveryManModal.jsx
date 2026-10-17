import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Bike, 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  MapPin, 
  CheckCircle, 
  Upload, 
  FileText
} from 'lucide-react';

export default function EditDeliveryManModal({ driver, isOpen, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (driver) {
      setFormData({
        ...driver,
        name: driver.name || '',
        phone: driver.phone || '',
        email: driver.email || '',
        identityType: driver.identityType || 'Driving License',
        identityNumber: driver.identityNumber || 'DL-88219-A',
        vehicleType: driver.vehicleType || (driver.vehicle?.includes('Car') ? 'Car' : driver.vehicle?.includes('Bike') ? 'Bicycle' : 'Electric Scooter'),
        vehicleModel: driver.vehicleModel || driver.vehicle || 'Honda Scooter',
        plateNo: driver.plateNo || 'NY-8821-E',
        drivingLicenseNo: driver.drivingLicenseNo || 'DL-908122',
        licenseExpiry: driver.licenseExpiry || '2028-12-31',
        zone: driver.zone || 'Zone 1 - Downtown Core',
        shift: driver.shift || 'Full Day (9 AM - 9 PM)',
        status: driver.status || 'Available',
        maxActiveOrders: driver.maxActiveOrders || 2,
        accountHolder: driver.accountHolder || driver.name || '',
        bankName: driver.bankName || 'Chase Bank',
        accountNumber: driver.accountNumber || '09281928391',
        routingCode: driver.routingCode || '021000021'
      });
      setImagePreview(driver.image || '');
    }
  }, [driver]);

  if (!isOpen || !formData) return null;

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      set('image', reader.result);
    };
  const steps = ['personal', 'vehicle', 'operations', 'bank'];

  const handleNext = () => {
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
    const updated = {
      ...formData,
      vehicle: `${formData.vehicleModel} (${formData.vehicleType})`
    };
    onSave(updated);
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
              <h3 style={{ margin: 0, fontSize: 18 }}>Edit Courier Details</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{formData.id}</span> &bull; {formData.name}
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
                      <Upload size={13} /> Change Courier Photo
                    </button>
                    <p style={{ margin: 0, fontSize: 11.5, color: '#64748b' }}>
                      Update profile avatar for customer live tracking map
                    </p>
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Full Legal Name *</label>
                    <input
                      type="text"
                      required
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
                      className="form-control-input"
                      value={formData.email}
                      onChange={(e) => set('email', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Fleet Operational Status</label>
                    <select
                      className="form-control-input"
                      value={formData.status}
                      onChange={(e) => set('status', e.target.value)}
                    >
                      <option value="Available">Available (Instant Dispatch Ready)</option>
                      <option value="On Delivery">On Delivery</option>
                      <option value="Offline">Offline</option>
                      <option value="Suspended">Suspended / On Leave</option>
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
                      className="form-control-input"
                      value={formData.identityNumber}
                      onChange={(e) => set('identityNumber', e.target.value)}
                    />
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
                      className="form-control-input"
                      value={formData.plateNo}
                      onChange={(e) => set('plateNo', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Driving License Number</label>
                    <input
                      type="text"
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
                      className="form-control-input"
                      value={formData.accountHolder}
                      onChange={(e) => set('accountHolder', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Bank Name</label>
                    <input
                      type="text"
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
                      className="form-control-input"
                      value={formData.accountNumber}
                      onChange={(e) => set('accountNumber', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Routing / IFSC Code</label>
                    <input
                      type="text"
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
                  <CheckCircle size={15} /> Save Changes
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
}
