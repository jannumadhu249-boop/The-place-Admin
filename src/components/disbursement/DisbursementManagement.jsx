import React, { useState } from 'react';
import { Landmark, CheckCircle2, Clock, Download, Search, Check, AlertCircle, ArrowUpRight } from 'lucide-react';
import { disbursementData } from '../../data/mockData';

export default function DisbursementManagement() {
  const [records, setRecords] = useState(disbursementData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const approveDisbursement = (id) => {
    setRecords(records.map(r => {
      if (r.id === id) {
        return { ...r, status: 'Completed' };
      }
      return r;
    }));
  };

  const filtered = records.filter(r => {
    const matchesType = filterType === 'All' || r.type === filterType;
    const matchesSearch = r.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.txRef.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Merchant & Driver Disbursement Management</h1>
          <p>Automated settlement cycles, bank payouts, and earnings withdrawal processing</p>
        </div>
        <div className="page-actions-block">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => alert("Exporting ACH Disbursement Ledger...")}
          >
            <Download size={15} /> Export Ledger (CSV)
          </button>
        </div>
      </div>

      {/* Metrics Header */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Landmark size={22} />
            </div>
            <span className="metric-badge-trend trend-up">Weekly Cycle</span>
          </div>
          <div>
            <div className="metric-val">$16,791.45</div>
            <div className="metric-title">Settled Payouts This Week</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
              <Clock size={22} />
            </div>
            <span className="metric-badge-trend trend-down">2 Pending Review</span>
          </div>
          <div>
            <div className="metric-val">$5,975.95</div>
            <div className="metric-title">Pending Settlement Approvals</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <CheckCircle2 size={22} />
            </div>
            <span className="metric-badge-trend trend-up">100% Verified</span>
          </div>
          <div>
            <div className="metric-val">Stripe ACH</div>
            <div className="metric-title">Primary Gateway Routing</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card-container" style={{ marginBottom: 20 }}>
        <div className="toolbar-tabs" style={{ padding: '8px 16px' }}>
          {['All', 'Restaurant', 'Delivery Partner'].map((type) => (
            <button
              key={type}
              type="button"
              className={`toolbar-tab-item ${filterType === type ? 'active' : ''}`}
              onClick={() => setFilterType(type)}
            >
              {type === 'All' ? 'All Beneficiaries' : type === 'Restaurant' ? 'Restaurant Merchants' : 'Delivery Drivers'}
            </button>
          ))}
        </div>
      </div>

      <div className="card-container">
        <div className="card-header">
          <div>
            <h3>Payout Transaction Ledger ({filtered.length})</h3>
          </div>
          <div className="card-header-actions">
            <div className="topbar-search-box" style={{ width: 260, padding: '6px 12px' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search recipient, tx..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Disbursement ID</th>
                <th>Recipient Entity</th>
                <th>Recipient Type</th>
                <th>Bank Account</th>
                <th>Settlement Amount</th>
                <th>Billing Cycle</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#be123c' }}>{item.id}</span>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{item.txRef}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.recipient}</span>
                  </td>
                  <td>
                    <span className={`badge ${item.type === 'Restaurant' ? 'badge-accepted' : 'badge-scheduled'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12.5, color: '#475569' }}>{item.accountNumber}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{item.amount}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{item.period}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      item.status === 'Completed' ? 'badge-delivered' :
                      item.status === 'Processing' ? 'badge-processing' : 'badge-pending'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {item.status !== 'Completed' ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '5px 12px', fontSize: 12 }}
                        onClick={() => approveDisbursement(item.id)}
                      >
                        <Check size={13} /> Approve & Pay
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>
                        <Check size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} /> Settled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
