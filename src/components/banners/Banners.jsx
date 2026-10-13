import React, { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon, Plus, Calendar, Link as LinkIcon, Edit2, Eye, Trash2, RefreshCw, AlertCircle, Check, MapPin, Tag } from 'lucide-react';
import { URLS } from '../../url';
import CreateBannerModal from './CreateBannerModal';
import EditBannerModal, { getBannerImageUrl } from './EditBannerModal';
import BannerPreviewModal from './BannerPreviewModal';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

function formatDateDisplay(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [previewingBanner, setPreviewingBanner] = useState(null);

  // Auto-clear alerts
  useEffect(() => {
    if (successMsg || error) {
      const t = setTimeout(() => { setSuccessMsg(null); setError(null); }, 4500);
      return () => clearTimeout(t);
    }
  }, [successMsg, error]);

  // Fetch all banners from API
  const fetchBanners = useCallback(async (isManual = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(URLS.GetBanners, {
        method: 'POST',
        headers: {
          authorization: getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        const list = data.banners || data.data || [];
        setBanners(list);
        if (isManual) setSuccessMsg(`Refreshed ${list.length} campaign banners from server!`);
      } else {
        throw new Error(data.message || 'Failed to fetch banners');
      }
    } catch (err) {
      console.error('Fetch banners error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Toggle active/inactive status
  const toggleBannerStatus = async (banner) => {
    setActionLoading(true);
    const newStatus = banner.status === 'active' ? 'inactive' : 'active';
    try {
      const formData = new FormData();
      formData.append('name', banner.name || '');
      formData.append('priority', String(banner.priority || '1'));
      formData.append('status', newStatus);
      formData.append('link', banner.link || '');
      formData.append('fromDate', banner.fromDate || '');
      formData.append('toDate', banner.toDate || '');
      if (banner.zone) formData.append('zone', banner.zone);

      const res = await fetch(URLS.UpdateBanners + banner._id, {
        method: 'PUT',
        headers: {
          authorization: getAuthHeader()
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSuccessMsg(`Banner "${banner.name}" status set to "${newStatus}"!`);
        await fetchBanners();
      } else {
        throw new Error(data.message || 'Failed to update banner status');
      }
    } catch (err) {
      console.error('Toggle banner error:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete banner
  const handleDeleteBanner = async (banner) => {
    if (!window.confirm(`Delete banner "${banner.name}"? This action cannot be undone.`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(URLS.DeleteBanners + banner._id, {
        method: 'DELETE',
        headers: {
          authorization: getAuthHeader()
        }
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSuccessMsg(`Banner "${banner.name}" deleted successfully!`);
        await fetchBanners();
      } else {
        throw new Error(data.message || 'Failed to delete banner');
      }
    } catch (err) {
      console.error('Delete banner error:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = banners.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      (b.name || '').toLowerCase().includes(term) ||
      (b.link || '').toLowerCase().includes(term) ||
      (b.zone || '').toLowerCase().includes(term)
    );
  });

  return (
    <div>
      {/* Alert Banners */}
      {error && (
        <div style={{
          padding: '12px 18px', marginBottom: 18, borderRadius: 8,
          background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5
        }}>
          <AlertCircle size={18} /><span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div style={{
          padding: '12px 18px', marginBottom: 18, borderRadius: 8,
          background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5
        }}>
          <Check size={18} /><span>{successMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-block">
          <h1>Promotional Banners &amp; Carousels</h1>
          <p>Manage customer app hero banners, marketing graphics, promotional schedules, and direct deep-links</p>
        </div>
        <div className="page-actions-block">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fetchBanners(true)}
            disabled={loading}
            title="Refresh banners from server"
          >
            <RefreshCw
              size={15}
              style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none', display: 'inline-block' }}
            />{' '}
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={16} /> Add Campaign Banner
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {banners.length === 0 && !loading ? (
        <div className="card-container" style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
          <ImageIcon size={44} color="#94a3b8" style={{ marginBottom: 12 }} />
          <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: 17 }}>No Campaign Banners Found</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: 13 }}>Click below to create your first promotional campaign graphic</p>
          <button type="button" className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={15} /> Add Campaign Banner
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {filtered.map((banner) => {
            const imgUrl = getBannerImageUrl(banner.image);
            const isActive = banner.status === 'active';

            return (
              <div key={banner._id || banner.id} className="card-container" style={{ margin: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Banner Media Box */}
                <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: '#f1f5f9' }}>
                  <img
                    src={imgUrl}
                    alt={banner.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(15, 23, 42, 0.78)',
                    backdropFilter: 'blur(6px)',
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    color: '#ffffff',
                    fontWeight: 700,
                    letterSpacing: '0.04em'
                  }}>
                    Priority {banner.priority || '1'}
                  </div>
                </div>

                {/* Banner Details */}
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 12, lineHeight: 1.4 }}>
                    {banner.name}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5, color: '#64748b', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={13} color="#0284c7" />
                      <span style={{ fontWeight: 600, color: '#334155' }}>Target Zone:</span>
                      <span>{banner.zone || 'All Zones'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LinkIcon size={13} color="#94a3b8" />
                      <span style={{ color: '#0284c7', fontWeight: 600, wordBreak: 'break-all' }}>{banner.link || '—'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} color="#be123c" />
                      <span style={{ color: '#334155', fontWeight: 500 }}>
                        {formatDateDisplay(banner.fromDate)} &rarr; {formatDateDisplay(banner.toDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div style={{
                  padding: '12px 20px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => toggleBannerStatus(banner)}
                        disabled={actionLoading}
                      />
                      <span className="slider"></span>
                    </label>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isActive ? '#16a34a' : '#94a3b8',
                      textTransform: 'capitalize'
                    }}>
                      {banner.status || 'active'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '5px 11px', fontSize: 12 }}
                      onClick={() => setPreviewingBanner(banner)}
                      title="Preview Customer View"
                    >
                      <Eye size={13} /> Preview
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '5px 11px', fontSize: 12, color: '#0284c7', borderColor: '#0284c7' }}
                      onClick={() => setEditingBanner(banner)}
                      title="Edit Banner"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '5px 11px', fontSize: 12, color: '#dc2626', borderColor: '#dc2626' }}
                      onClick={() => handleDeleteBanner(banner)}
                      title="Delete Banner"
                      disabled={actionLoading}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer App Simulation Preview Modal */}
      <BannerPreviewModal
        banner={previewingBanner}
        isOpen={Boolean(previewingBanner)}
        onClose={() => setPreviewingBanner(null)}
      />

      {/* Create Banner Modal */}
      <CreateBannerModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          fetchBanners();
          setSuccessMsg('Campaign banner created successfully!');
        }}
        onError={(msg) => setError(msg)}
      />

      {/* Edit Banner Modal */}
      <EditBannerModal
        isOpen={Boolean(editingBanner)}
        banner={editingBanner}
        onClose={() => setEditingBanner(null)}
        onSuccess={() => {
          setEditingBanner(null);
          fetchBanners();
          setSuccessMsg('Campaign banner updated successfully!');
        }}
        onError={(msg) => setError(msg)}
      />
    </div>
  );
}
