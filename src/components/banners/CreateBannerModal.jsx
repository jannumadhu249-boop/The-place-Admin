import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Calendar as CalendarIcon, CheckCircle, Upload, Link as LinkIcon, MapPin, Tag } from 'lucide-react';
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
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function CreateBannerModal({ isOpen, onClose, onSuccess, onError }) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('1');
  const [status, setStatus] = useState('active');
  const [link, setLink] = useState('');
  const [zone, setZone] = useState('All Zones');
  const [zonesList, setZonesList] = useState([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch zones from API
  useEffect(() => {
    if (isOpen) {
      const fetchZones = async () => {
        try {
          const res = await fetch(URLS.GetZones, {
            method: 'POST',
            headers: {
              authorization: getAuthHeader(),
              'Content-Type': 'application/json'
            }
          });
          const data = await res.json();
          if (res.ok && data.zones) {
            setZonesList(data.zones);
          }
        } catch (err) {
          console.error('Failed to load zones for banner modal:', err);
        }
      };
      fetchZones();
    }
  }, [isOpen]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setName('');
      setPriority('1');
      setStatus('active');
      setLink('');
      setZone('All Zones');
      setFromDate(new Date());
      setToDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
      setImageFile(null);
      setPreviewUrl('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      onError && onError('Please upload a banner image file.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('priority', String(priority));
      formData.append('status', status);
      formData.append('link', link.trim());
      formData.append('fromDate', toISODateString(fromDate));
      formData.append('toDate', toISODateString(toDate));
      formData.append('image', imageFile);
      if (zone) {
        formData.append('zone', zone);
      }

      const res = await fetch(URLS.CreateBanners, {
        method: 'POST',
        headers: {
          authorization: getAuthHeader()
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success !== false) {
        onSuccess && onSuccess(data);
      } else {
        throw new Error(data.message || 'Failed to create banner');
      }
    } catch (err) {
      console.error('Create banner error:', err);
      onError && onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 660, width: '92%' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: '#fff1f2', color: '#be123c',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17 }}>Create Marketing Campaign Banner</h3>
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

            {/* Live Image Preview / Upload Box */}
            <div style={{
              borderRadius: 10,
              overflow: 'hidden',
              minHeight: 140,
              position: 'relative',
              background: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16
            }}>
              {previewUrl ? (
                <div style={{ width: '100%', height: 160, position: 'relative' }}>
                  <img
                    src={previewUrl}
                    alt="Banner preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    background: 'rgba(0,0,0,0.65)',
                    padding: '3px 8px',
                    borderRadius: 4,
                    color: '#ffffff',
                    fontSize: 11,
                    fontWeight: 600
                  }}>
                    Ready to Upload: {imageFile?.name}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <Upload size={32} color="#94a3b8" style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Upload High-Resolution Banner Graphic *
                  </div>
                  <p style={{ margin: 0, fontSize: 11.5, color: '#64748b' }}>
                    Recommended aspect ratio 16:9 or 2:1 (PNG, JPG, WEBP)
                  </p>
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <input
                  type="file"
                  accept="image/*"
                  id="create-banner-file"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <label htmlFor="create-banner-file" className="btn btn-secondary" style={{ cursor: 'pointer', padding: '6px 14px', fontSize: 12.5 }}>
                  <Upload size={14} /> {previewUrl ? 'Change Graphic File' : 'Browse Graphic File'}
                </label>
              </div>
            </div>

            {/* Campaign Name */}
            <div className="form-group">
              <label>Campaign Title / Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Weekend Food Festival"
                className="form-control-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Priority & Status */}
            <div className="modal-grid">
              <div className="form-group">
                <label>Display Priority *</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 1"
                  className="form-control-input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Publication Status</label>
                <select
                  className="form-control-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Zone & Link Destination */}
            <div className="modal-grid">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} color="#0284c7" />
                  <span>Target Delivery Zone</span>
                </label>
                <select
                  className="form-control-input"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                >
                  <option value="All Zones">All Zones</option>
                  {zonesList.map((z) => (
                    <option key={z._id} value={z.name}>
                      {z.name} {z.status ? `(${z.status})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LinkIcon size={14} color="#7c3aed" />
                  <span>Deep-Link Target Destination *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /restaurants/featured or https://..."
                  className="form-control-input"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
            </div>

            {/* Start Date & End Date */}
            <div className="modal-grid">
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarIcon size={14} color="#0284c7" />
                  <span>Campaign Start Date *</span>
                </label>
                <DatePicker
                  selected={fromDate}
                  onChange={(date) => setFromDate(date)}
                  dateFormat="MMMM d, yyyy"
                  className="custom-datepicker-input"
                  selectsStart
                  startDate={fromDate}
                  endDate={toDate}
                  showPopperArrow={false}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarIcon size={14} color="#be123c" />
                  <span>Campaign Expiry Date *</span>
                </label>
                <DatePicker
                  selected={toDate}
                  onChange={(date) => setToDate(date)}
                  dateFormat="MMMM d, yyyy"
                  className="custom-datepicker-input"
                  selectsEnd
                  startDate={fromDate}
                  endDate={toDate}
                  minDate={fromDate}
                  showPopperArrow={false}
                />
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <CheckCircle size={15} /> {submitting ? 'Publishing...' : 'Publish Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
