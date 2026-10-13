import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import CreateFaqModal from './CreateFaqModal';
import EditFaqModal from './EditFaqModal';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export default function Faqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ── Fetch FAQs from API ────────────────────────────────────────────────────
  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(URLS.GetFaqs, {
        method: 'POST',
        headers: { authorization: getAuthHeader() }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch FAQs');
      const list = Array.isArray(data) ? data : (data?.faqs || data?.data || data?.result || []);
      setFaqs(list);
      if (list.length > 0) {
        setExpandedId(prev => prev || list[0]._id || list[0].id);
      }
    } catch (err) {
      setError(err.message || 'Error fetching FAQs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddFaq = () => {
    showToast('FAQ published successfully!');
    fetchFaqs();
  };

  const handleSaveFaq = () => {
    setEditingFaq(null);
    showToast('FAQ updated successfully!');
    fetchFaqs();
  };

  const handleDeleteFaq = async (faq) => {
    const id = faq._id || faq.id;
    if (!window.confirm(`Are you sure you want to delete this FAQ: "${faq.question}"?`)) {
      return;
    }

    try {
      const res = await fetch(`${URLS.DeleteFaq}${id}`, {
        method: 'DELETE',
        headers: { authorization: getAuthHeader() }
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Failed to delete FAQ');
      showToast('FAQ article deleted.');
      fetchFaqs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const toggleStatus = async (faq) => {
    const id = faq._id || faq.id;
    const current = (faq.status || '').toLowerCase();
    const nextStatus = current === 'active' ? 'inactive' : 'active';
    const payload = {
      question: faq.question,
      answer: faq.answer,
      priority: Number(faq.priority) || 1,
      status: nextStatus
    };

    try {
      const res = await fetch(`${URLS.UpdateFaq}${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Failed to update FAQ status');
      showToast(`FAQ marked as "${nextStatus}".`);
      fetchFaqs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = faqs.filter(f => {
    const q = (f.question || '').toLowerCase();
    const a = (f.answer || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch = q.includes(term) || a.includes(term);

    const matchesStatus =
      statusFilter === 'All' ||
      (f.status || '').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          padding: '12px 18px', marginBottom: 18, borderRadius: 8,
          background: toastType === 'error' ? '#fff1f2' : '#f0fdf4',
          border: `1px solid ${toastType === 'error' ? '#fecdd3' : '#bbf7d0'}`,
          color: toastType === 'error' ? '#be123c' : '#15803d',
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: 500
        }}>
          {toastType === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          {toastMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-block">
          <h1>Help Center & FAQs</h1>
          <p>Curate questions, self-serve resolution guides, and customer support documentation</p>
        </div>
        <div className="page-actions-block">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={16} /> Add FAQ Article
          </button>
        </div>
      </div>

      {/* Main Accordion Card Container */}
      <div className="card-container">
        <div className="card-header">
          <div>
            <h3>Frequently Asked Questions ({filtered.length})</h3>
          </div>
          <div className="card-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Status Filter */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['All', 'Active', 'Inactive'].map(st => (
                <button
                  key={st}
                  type="button"
                  className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: 12.5 }}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Box on Right Top */}
            <div className="topbar-search-box" style={{ width: 280, padding: '6px 12px' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search question or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Accordion View */}
        <div style={{ padding: 20 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
              <p style={{ marginTop: 8 }}>Loading FAQs...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#be123c' }}>
              <AlertCircle size={28} style={{ marginBottom: 8 }} />
              <p style={{ marginTop: 8 }}>{error}</p>
              <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={fetchFaqs}>
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              No FAQ articles found matching your criteria.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map((faq, index) => {
                const id = faq._id || faq.id;
                const isExpanded = expandedId === id;
                const isActive = (faq.status || '').toLowerCase() === 'active';

                return (
                  <div
                    key={id || index}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      overflow: 'hidden',
                      background: isExpanded ? '#ffffff' : '#fafafa',
                      boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Accordion Header */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        gap: 16
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: isExpanded ? '#fef3c7' : '#f1f5f9',
                          color: isExpanded ? '#b45309' : '#64748b',
                          fontSize: 12, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          {index + 1}
                        </span>
                        <h4 style={{ margin: 0, fontSize: 14.5, color: '#0f172a', fontWeight: 600 }}>
                          {faq.question}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} onClick={(e) => e.stopPropagation()}>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => toggleStatus(faq)}
                          />
                          <span className="slider"></span>
                        </label>
                        <span style={{
                          fontSize: 12, fontWeight: 600, minWidth: 50,
                          color: isActive ? '#16a34a' : '#94a3b8'
                        }}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ padding: 4 }}
                          onClick={() => setExpandedId(isExpanded ? null : id)}
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                        <p style={{ margin: '0 0 16px', fontSize: 14, color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {faq.answer}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px dashed #e2e8f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#64748b' }}>
                            <span>Priority: <strong style={{ color: '#0f172a' }}>{faq.priority || 1}</strong></span>
                            {faq.logCreatedDate && (
                              <>
                                <span>&bull;</span>
                                <span>Added: {new Date(faq.logCreatedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              </>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '5px 10px', fontSize: 12, color: '#0284c7', borderColor: '#0284c7' }}
                              onClick={() => setEditingFaq(faq)}
                              title="Edit FAQ Article"
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '5px 10px', fontSize: 12, color: '#dc2626', borderColor: '#dc2626' }}
                              onClick={() => handleDeleteFaq(faq)}
                              title="Delete FAQ Article"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <CreateFaqModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAdd={handleAddFaq}
      />

      {/* Edit Modal */}
      <EditFaqModal
        faq={editingFaq}
        isOpen={Boolean(editingFaq)}
        onClose={() => setEditingFaq(null)}
        onSave={handleSaveFaq}
      />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
