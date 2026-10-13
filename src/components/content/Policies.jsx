import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  RotateCcw, 
  Save, 
  Check, 
  AlertCircle, 
  Eye, 
  Edit3, 
  Loader2,
  ShieldCheck,
  Clock,
  Undo2
} from 'lucide-react';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

const POLICY_TABS = [
  {
    key: 'termsAndCondition',
    label: 'Terms & Conditions',
    icon: FileText,
    subtitle: 'Platform rules, user agreements, order eligibility, and legal stipulations.',
    updateUrlKey: 'UpdateTerms'
  },
  {
    key: 'privacyPolicy',
    label: 'Privacy Policy',
    icon: ShieldCheck,
    subtitle: 'Data governance, user privacy safeguards, cookies, and location tracking policies.',
    updateUrlKey: 'UpdatePrivacyPolicy'
  },
  {
    key: 'refundPolicy',
    label: 'Refund Policy',
    icon: RotateCcw,
    subtitle: 'Order cancellations, merchant food waste liability, and payment refund turnaround SLAs.',
    updateUrlKey: 'UpdateRefundPolicy'
  }
];

export default function Policies() {
  const [activeTab, setActiveTab] = useState('termsAndCondition');
  const [policyData, setPolicyData] = useState({
    _id: '',
    termsAndCondition: '',
    privacyPolicy: '',
    refundPolicy: '',
    logCreatedDate: '',
    logModifiedDate: ''
  });
  const [originalPolicyData, setOriginalPolicyData] = useState(null);
  const [viewMode, setViewMode] = useState('editor'); // 'editor' | 'preview'
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ── Fetch Policies from API ────────────────────────────────────────────────
  const fetchPolicies = useCallback(async () => {
    setFetching(true);
    setError(null);
    try {
      const res = await fetch(URLS.GetPolicies, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch policy data');
      const policy = data?.policy || data?.data || data?.result || {};
      const loaded = {
        _id: policy._id || '',
        termsAndCondition: policy.termsAndCondition || '',
        privacyPolicy: policy.privacyPolicy || '',
        refundPolicy: policy.refundPolicy || '',
        logCreatedDate: policy.logCreatedDate || '',
        logModifiedDate: policy.logModifiedDate || ''
      };
      setPolicyData(loaded);
      setOriginalPolicyData(loaded);
    } catch (err) {
      setError(err.message || 'Error loading policies');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  // ── Update Active Policy ───────────────────────────────────────────────────
  const handleSaveActivePolicy = async (e) => {
    if (e) e.preventDefault();
    const currentTabMeta = POLICY_TABS.find(t => t.key === activeTab);
    if (!currentTabMeta) return;

    setSaving(true);
    const endpoint = URLS[currentTabMeta.updateUrlKey];
    const payload = {
      [activeTab]: policyData[activeTab] || ''
    };

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || `Failed to update ${currentTabMeta.label}`);
      }
      showToast(`${currentTabMeta.label} updated and published successfully!`);
      // Update original snapshot so reset works accurately
      setOriginalPolicyData(prev => ({ ...prev, [activeTab]: policyData[activeTab] }));
      fetchPolicies();
    } catch (err) {
      showToast(err.message || 'Error saving policy', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetActivePolicy = () => {
    if (!originalPolicyData) return;
    setPolicyData(prev => ({
      ...prev,
      [activeTab]: originalPolicyData[activeTab] || ''
    }));
    showToast('Reverted unsaved changes to latest saved version.');
  };

  const currentTabMeta = POLICY_TABS.find(t => t.key === activeTab) || POLICY_TABS[0];
  const currentContent = policyData[activeTab] || '';
  const wordCount = currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0;
  const charCount = currentContent.length;

  const lastUpdated = policyData.logModifiedDate || policyData.logCreatedDate;

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
          <h1>Legal & Compliance Policies</h1>
          <p>Maintain corporate guidelines, client service terms, and regulatory disclosures</p>
        </div>
        <div className="page-actions-block" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {lastUpdated && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12.5, color: '#64748b', background: '#f8fafc',
              padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0'
            }}>
              <Clock size={14} color="#94a3b8" />
              <span>Last Sync: {new Date(lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20,
        borderBottom: '1px solid #e2e8f0', paddingBottom: 12
      }}>
        {POLICY_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 8, border: 'none',
                background: isActive ? '#8B0000' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#475569',
                fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Container Card */}
      <div className="card-container">
        {/* Card Header with View Switcher */}
        <div className="card-header" style={{ alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: 17 }}>{currentTabMeta.label}</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              {currentTabMeta.subtitle}
            </p>
          </div>

          <div className="card-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                style={{
                  padding: '6px 14px', border: 'none',
                  background: viewMode === 'editor' ? '#8B0000' : '#ffffff',
                  color: viewMode === 'editor' ? '#ffffff' : '#64748b',
                  fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <Edit3 size={14} /> Editor
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                style={{
                  padding: '6px 14px', border: 'none',
                  background: viewMode === 'preview' ? '#8B0000' : '#ffffff',
                  color: viewMode === 'preview' ? '#ffffff' : '#64748b',
                  fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <Eye size={14} /> Live Preview
              </button>
            </div>
          </div>
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: 56, color: '#64748b' }}>
            <Loader2 size={30} style={{ animation: 'spin 1s linear infinite', marginBottom: 10 }} />
            <p style={{ margin: 0 }}>Retrieving policy document from server...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#be123c' }}>
            <AlertCircle size={30} style={{ marginBottom: 10 }} />
            <p style={{ margin: '0 0 16px' }}>{error}</p>
            <button className="btn btn-secondary" onClick={fetchPolicies}>
              Retry Fetch
            </button>
          </div>
        ) : viewMode === 'editor' ? (
          /* ── EDITOR MODE ──────────────────────────────────────────────── */
          <form onSubmit={handleSaveActivePolicy}>
            <div style={{ padding: 20 }}>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>
                    Document Policy Content *
                  </label>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    <span>{wordCount} words</span> &bull; <span>{charCount} characters</span>
                  </div>
                </div>

                <textarea
                  rows={14}
                  required
                  placeholder={`Enter the full ${currentTabMeta.label} text here...`}
                  className="form-control-input"
                  style={{
                    width: '100%',
                    minHeight: 340,
                    lineHeight: 1.65,
                    fontSize: 14,
                    padding: 16,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                  value={policyData[activeTab] || ''}
                  onChange={(e) => setPolicyData({ ...policyData, [activeTab]: e.target.value })}
                />
              </div>

              {/* Action Toolbar */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: 16, borderTop: '1px solid #f1f5f9'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                  onClick={handleResetActivePolicy}
                  disabled={saving}
                >
                  <Undo2 size={15} /> Revert Changes
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '10px 22px', fontSize: 13.5 }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      Publishing Changes...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save & Publish {currentTabMeta.label}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* ── PREVIEW MODE ─────────────────────────────────────────────── */
          <div style={{ padding: '24px 28px', maxWidth: 880, margin: '0 auto' }}>
            {/* Document Header Banner */}
            <div style={{
              padding: '24px 28px', borderRadius: 12,
              background: '#f8fafc', border: '1px solid #e2e8f0',
              marginBottom: 24, textAlign: 'center'
            }}>
              <span className="badge badge-accepted" style={{ fontSize: 11, marginBottom: 8, display: 'inline-block' }}>
                Official Document &bull; Published
              </span>
              <h2 style={{ margin: '6px 0 8px', fontSize: 22, color: '#0f172a' }}>
                {currentTabMeta.label}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                {currentTabMeta.subtitle}
              </p>
              {lastUpdated && (
                <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
                  Effective / Last Updated: {new Date(lastUpdated).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>

            {/* Document Body */}
            <div style={{
              background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              {!currentContent.trim() ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  No content has been added to this policy yet. Switch to Editor mode to compose it.
                </div>
              ) : (
                <div style={{
                  fontSize: 14.5, lineHeight: 1.8, color: '#334155',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                }}>
                  {currentContent}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
