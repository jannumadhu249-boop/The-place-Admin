import React, { useState } from 'react';
import { BarChart3, Download, Calendar, DollarSign, ArrowUpRight, TrendingUp, FileText, Check } from 'lucide-react';

export default function ReportManagement() {
  const [period, setPeriod] = useState('This Month');

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Financial & Operational Analytics Reports</h1>
          <p>Export executive summaries, tax schedules, commission income, and merchant volume audits</p>
        </div>
        <div className="page-actions-block">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => alert("Downloading formatted PDF Financial Report...")}
          >
            <FileText size={15} /> Download PDF Report
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => alert("Exporting raw CSV data...")}
          >
            <Download size={15} /> Export Excel / CSV
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="card-container" style={{ marginBottom: 20 }}>
        <div className="toolbar-tabs" style={{ padding: '8px 16px' }}>
          {['Today', 'This Week', 'This Month', 'Last Quarter', 'Year to Date'].map((t) => (
            <button
              key={t}
              type="button"
              className={`toolbar-tab-item ${period === t ? 'active' : ''}`}
              onClick={() => setPeriod(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Report Summary Breakdown Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fff1f2', color: '#be123c' }}>
              <DollarSign size={22} />
            </div>
            <span className="metric-badge-trend trend-up">+14.2%</span>
          </div>
          <div>
            <div className="metric-val">$482,900.00</div>
            <div className="metric-title">Gross Food Sales ({period})</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <TrendingUp size={22} />
            </div>
            <span className="metric-badge-trend trend-up">15.8% avg</span>
          </div>
          <div>
            <div className="metric-val">$76,300.00</div>
            <div className="metric-title">Platform Net Commission</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#eff6ff', color: '#0284c7' }}>
              <BarChart3 size={22} />
            </div>
            <span className="metric-badge-trend trend-up">+8.7%</span>
          </div>
          <div>
            <div className="metric-val">$24,190.00</div>
            <div className="metric-title">Courier Delivery Surcharges</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <div className="metric-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
              <FileText size={22} />
            </div>
            <span className="metric-badge-trend trend-up">8.875% Rate</span>
          </div>
          <div>
            <div className="metric-val">$42,850.00</div>
            <div className="metric-title">State Sales Tax Escrow</div>
          </div>
        </div>
      </div>

      {/* Breakdown Tables & Report Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24 }}>
        {/* Top Revenue Generating Restaurants */}
        <div className="card-container" style={{ margin: 0 }}>
          <div className="card-header">
            <h3>Top Restaurant Revenue Contributors</h3>
            <span className="badge badge-accepted">Active Period</span>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Orders</th>
                  <th>Gross GMV</th>
                  <th>Commission Earned</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Firenze Woodfired Pizza", orders: 5410, gmv: "$112,650.00", comm: "$15,771.00" },
                  { name: "Kyoto Artisan Sushi", orders: 2710, gmv: "$92,400.00", comm: "$16,632.00" },
                  { name: "L'Amour Bistro & Lounge", orders: 3840, gmv: "$84,290.00", comm: "$12,643.50" },
                  { name: "Spice Dynasty Indian", orders: 3190, gmv: "$68,900.00", comm: "$10,335.00" },
                  { name: "Green Gourmet Vegan Cafe", orders: 1820, gmv: "$41,200.00", comm: "$4,944.00" }
                ].map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13, color: '#475569' }}>{item.orders}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.gmv}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#be123c' }}>{item.comm}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Fulfillment Health Report */}
        <div className="card-container" style={{ margin: 0 }}>
          <div className="card-header">
            <h3>Fulfillment & SLA Health Report</h3>
          </div>

          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { metric: "Successful Delivery Rate", val: "99.4%", description: "Percentage of orders delivered without refund or complaint" },
              { metric: "Average Kitchen Prep Time", val: "14.2 minutes", description: "From customer order confirmation to driver handover" },
              { metric: "Average Courier Transit Time", val: "18.6 minutes", description: "From restaurant pickup to doorstep customer signature" },
              { metric: "Dispute & Cancellation Rate", val: "0.6%", description: "Lower than 1% industry target benchmark" }
            ].map((sla, i) => (
              <div key={i} style={{ borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none', paddingBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{sla.metric}</h5>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>{sla.val}</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>{sla.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
