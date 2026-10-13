import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Ticket, Plus, Search, Calendar, Tag, Copy, Edit2, Trash2, RefreshCw, AlertCircle, Check, X } from 'lucide-react';
import CreateCouponModal from './CreateCouponModal';
import UpdateCouponModal from './UpdateCouponModal';
import { URLS } from '../../url';

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

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const isInitialMount = useRef(true);

  // Auto-clear alerts
  useEffect(() => {
    if (successMsg || error) {
      const t = setTimeout(() => { setSuccessMsg(null); setError(null); }, 4500);
      return () => clearTimeout(t);
    }
  }, [successMsg, error]);

  // Fetch coupons from API (handles search query hitting the server network endpoint)
  const fetchCoupons = useCallback(async (search = '', isManual = false) => {
    setLoading(true);
    setError(null);
    try {
      const trimmed = (typeof search === 'string' ? search : '').trim();
      const url = trimmed
        ? `${URLS.GetSearchQuery}${encodeURIComponent(trimmed)}`
        : URLS.GetCoupons;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        const list = data.coupons || data.data || data.result || [];
        setCoupons(list);
        if (isManual) setSuccessMsg(`Refreshed ${list.length} coupons from server!`);
      } else {
        throw new Error(data.message || 'Failed to fetch coupons');
      }
    } catch (err) {
      console.error('Fetch coupons error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and debounce search query to hit the API
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchCoupons('');
      return;
    }

    const timer = setTimeout(() => {
      fetchCoupons(searchTerm);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchCoupons]);

  // Toggle active/inactive
  const toggleCoupon = async (coupon) => {
    setActionLoading(true);
    const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(URLS.UpdateCoupons + coupon._id, {
        method: 'PUT',
        headers: {
          authorization: getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...coupon, status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSuccessMsg(`Coupon status set to "${newStatus}"`);
        await fetchCoupons(searchTerm);
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Toggle coupon error:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete coupon
  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(URLS.DeleteCoupons + coupon._id, {
        method: 'DELETE',
        headers: { authorization: getAuthHeader() }
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setSuccessMsg(`Coupon "${coupon.code}" deleted successfully!`);
        await fetchCoupons(searchTerm);
      } else {
        throw new Error(data.message || 'Failed to delete coupon');
      }
    } catch (err) {
      console.error('Delete coupon error:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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

      <div className="page-header">
        <div className="page-title-block">
          <h1>Promotional Coupons &amp; Vouchers</h1>
          <p>Create discount campaigns, percentage-off perks, and customer retention coupons with advanced schedule control</p>
        </div>
        <div className="page-actions-block">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fetchCoupons(searchTerm, true)}
            disabled={loading}
            title="Refresh coupons from server"
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
            <Plus size={16} /> Create New Coupon
          </button>
        </div>
      </div>

      <div className="card-container">
        <div className="card-header">
          <div>
            <h3>All Discount Campaigns ({coupons.length})</h3>
          </div>
          <div className="card-header-actions">
            {actionLoading && (
              <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> Updating...
              </span>
            )}
            <div className="topbar-search-box" style={{ width: 280, padding: '6px 12px' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by code or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#94a3b8' }}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Campaign Title</th>
                <th>Discount Type</th>
                <th>Discount Value</th>
                <th>Description / Terms</th>
                <th>Usage</th>
                <th>Start Date</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: 36, color: '#64748b' }}>
                    {loading ? 'Loading coupons...' : searchTerm ? `No coupons found matching "${searchTerm}".` : 'No coupons found. Click "Create New Coupon" to add one.'}
                  </td>
                </tr>
              ) : (
                coupons.map((cpn) => {
                  const title = cpn.name || cpn.title || cpn.code;
                  const rawType = (cpn.type || 'percentage').toLowerCase();
                  const isPercentage = rawType === 'percentage';
                  const discountDisplay = isPercentage ? `${cpn.discount}%` : `₹${cpn.discount}`;
                  const typeLabel = isPercentage ? 'Percentage' : 'Fixed Amount';

                  return (
                    <tr key={cpn._id || cpn.id}>
                      <td>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                          background: '#fff1f2', border: '1px dashed #be123c',
                          padding: '4px 10px', borderRadius: 8,
                          color: '#be123c', fontWeight: 800, fontSize: 13, letterSpacing: '0.05em'
                        }}>
                          <Tag size={13} />
                          {cpn.code}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{title}</span>
                      </td>
                      <td>
                        <span className="badge badge-accepted" style={{ fontWeight: 700 }}>
                          {typeLabel}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-accepted" style={{ fontWeight: 700 }}>
                          {discountDisplay}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            fontSize: 12.5,
                            color: '#475569',
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={cpn.description || '—'}
                        >
                          {cpn.description || '—'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                          {cpn.usedCount || 0} / {cpn.limit ?? '—'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                          <Calendar size={13} color="#0284c7" /> {formatDateDisplay(cpn.fromDate || cpn.startDate)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                          <Calendar size={13} color="#be123c" /> {formatDateDisplay(cpn.toDate || cpn.validUntil || cpn.expiryDate)}
                        </div>
                      </td>
                      <td>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={cpn.status === 'active'}
                            onChange={() => toggleCoupon(cpn)}
                            disabled={actionLoading}
                          />
                          <span className="slider"></span>
                        </label>
                        <span style={{
                          marginLeft: 8, fontSize: 12, fontWeight: 600,
                          color: cpn.status === 'active' ? '#16a34a' : '#94a3b8'
                        }}>
                          {cpn.status === 'active' ? 'Active' : 'Inactive'}
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
                            style={{ padding: '6px 10px', fontSize: 12, color: '#0284c7', borderColor: '#0284c7' }}
                            onClick={() => setEditingCoupon(cpn)}
                            title="Edit Campaign"
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: 12, color: '#dc2626', borderColor: '#dc2626' }}
                            onClick={() => handleDelete(cpn)}
                            title="Delete Coupon"
                            disabled={actionLoading}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <CreateCouponModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          fetchCoupons(searchTerm);
          setSuccessMsg('Coupon created successfully!');
        }}
        onError={(msg) => setError(msg)}
      />

      {/* Update Coupon Modal */}
      <UpdateCouponModal
        isOpen={Boolean(editingCoupon)}
        coupon={editingCoupon}
        onClose={() => setEditingCoupon(null)}
        onSuccess={() => {
          setEditingCoupon(null);
          fetchCoupons(searchTerm);
          setSuccessMsg('Coupon updated successfully!');
        }}
        onError={(msg) => setError(msg)}
      />
    </div>
  );
}
