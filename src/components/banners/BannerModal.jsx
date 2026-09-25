import React, { useState, useEffect } from 'react';
import { X, Image, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function BannerModal({ isOpen, onClose, onSave, banner = null }) {
  const isEditing = Boolean(banner);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Promotional Banner',
    zone: 'All Zones',
    redirectUrl: '/restaurants/featured',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&auto=format&fit=crop&q=80',
    status: 'Active'
  });

  useEffect(() => {
    if (banner) {
      setFormData({
        ...banner,
        startDate: banner.startDate ? new Date(banner.startDate) : new Date(),
        endDate: banner.endDate ? new Date(banner.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    } else {
      setFormData({
        title: '',
        category: 'Promotional Banner',
        zone: 'All Zones',
        redirectUrl: '/restaurants/featured',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&auto=format&fit=crop&q=80',
        status: 'Active'
      });
    }
  }, [banner, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedStart = formData.startDate instanceof Date 
      ? formData.startDate.toISOString().split('T')[0] 
      : formData.startDate;

    const formattedEnd = formData.endDate instanceof Date 
      ? formData.endDate.toISOString().split('T')[0] 
      : formData.endDate;

    onSave({
      ...formData,
      startDate: formattedStart,
      endDate: formattedEnd
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
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
              <Image size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17 }}>
                {isEditing ? `Edit Marketing Banner — ${banner.id}` : 'Create Marketing Campaign Banner'}
              </h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Configure homepage hero banner cards, schedules, and link destinations
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Live Image Thumbnail Preview */}
            <div style={{
              borderRadius: 10,
              overflow: 'hidden',
              height: 140,
              position: 'relative',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0'
            }}>
              <img
                src={formData.image}
                alt="Banner preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&auto=format&fit=crop&q=80';
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                background: 'rgba(0,0,0,0.6)',
                padding: '3px 8px',
                borderRadius: 4,
                color: '#ffffff',
                fontSize: 11
              }}>
                Live Thumbnail Preview
              </div>
            </div>

            <div className="form-group">
              <label>Campaign Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Masterclass French Pastries Festival"
                className="form-control-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="modal-grid">
              <div className="form-group">
                <label>Banner Category / Tag</label>
                <select
                  className="form-control-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Promotional Banner">Promotional Banner</option>
                  <option value="Featured Collection">Featured Collection</option>
                  <option value="Festival Exclusive">Festival Exclusive</option>
                  <option value="Seasonal Discount">Seasonal Discount</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Delivery Zone</label>
                <select
                  className="form-control-input"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                >
                  <option value="All Zones">All Zones</option>
                  <option value="Zone 1 & Zone 2">Zone 1 & Zone 2 (Downtown / Chelsea)</option>
                  <option value="Zone 3 - Midtown Central">Zone 3 - Midtown Central</option>
                  <option value="Zone 4 - Brooklyn North">Zone 4 - Brooklyn North</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Deep-link Target Destination</label>
              <input
                type="text"
                required
                placeholder="/restaurants/french-bistros or /food/desserts"
                className="form-control-input"
                value={formData.redirectUrl}
                onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
              />
            </div>

            {/* Advanced Calendar Date Pickers for Start and End Date */}
            <div className="modal-grid">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarIcon size={14} color="#be123c" />
                  <span>Start Date (Advanced Calendar)</span>
                </label>
                <DatePicker
                  selected={formData.startDate instanceof Date ? formData.startDate : new Date(formData.startDate)}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  dateFormat="MMMM d, yyyy"
                  className="custom-datepicker-input"
                  selectsStart
                  startDate={formData.startDate}
                  endDate={formData.endDate}
                  showPopperArrow={false}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarIcon size={14} color="#be123c" />
                  <span>End Date (Advanced Calendar)</span>
                </label>
                <DatePicker
                  selected={formData.endDate instanceof Date ? formData.endDate : new Date(formData.endDate)}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                  dateFormat="MMMM d, yyyy"
                  className="custom-datepicker-input"
                  selectsEnd
                  startDate={formData.startDate}
                  endDate={formData.endDate}
                  minDate={formData.startDate}
                  showPopperArrow={false}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Banner Graphic Image URL</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/photo-..."
                className="form-control-input"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={15} /> {isEditing ? 'Save Changes' : 'Publish Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
