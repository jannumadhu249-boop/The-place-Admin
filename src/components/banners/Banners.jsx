import React, { useState } from 'react';
import { Image, Plus, Calendar, Link as LinkIcon, Edit2, Eye, ExternalLink } from 'lucide-react';
import { bannersData } from '../../data/mockData';
import BannerPreviewModal from './BannerPreviewModal';
import BannerModal from './BannerModal';

export default function Banners() {
  const [banners, setBanners] = useState(bannersData);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [previewingBanner, setPreviewingBanner] = useState(null);

  const toggleBannerStatus = (id) => {
    setBanners(banners.map(b => {
      if (b.id === id) {
        return { ...b, status: b.status === 'Active' ? 'Paused' : 'Active' };
      }
      return b;
    }));
  };

  const handleSaveBanner = (bannerData) => {
    if (editingBanner) {
      setBanners(banners.map(b => b.id === editingBanner.id ? { ...b, ...bannerData } : b));
      setEditingBanner(null);
    } else {
      const newBanner = {
        ...bannerData,
        id: `BNR-0${banners.length + 1}`,
        status: 'Active'
      };
      setBanners([newBanner, ...banners]);
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Promotional Banners & Carousels</h1>
          <p>Control customer app home carousels, category spotlights, and regional marketing graphics with live device simulation</p>
        </div>
        <div className="page-actions-block">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => { setEditingBanner(null); setIsCreateModalOpen(true); }}
          >
            <Plus size={16} /> Add Campaign Banner
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {banners.map((banner) => (
          <div key={banner.id} className="card-container" style={{ margin: 0, overflow: 'hidden' }}>
            {/* Banner Media Box */}
            <div style={{ position: 'relative', height: 170, overflow: 'hidden' }}>
              <img 
                src={banner.image} 
                alt={banner.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ 
                position: 'absolute', 
                top: 12, 
                right: 12, 
                background: 'rgba(15, 23, 42, 0.75)', 
                backdropFilter: 'blur(6px)',
                padding: '4px 10px', 
                borderRadius: 20, 
                fontSize: 11, 
                color: '#ffffff', 
                fontWeight: 600 
              }}>
                {banner.category}
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8, lineHeight: 1.4 }}>
                {banner.title}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Target Delivery Zone:</span> {banner.zone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LinkIcon size={13} color="#94a3b8" />
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>{banner.redirectUrl}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Calendar size={13} color="#be123c" />
                  <span style={{ color: '#334155', fontWeight: 500 }}>{banner.startDate} → {banner.endDate}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={banner.status === 'Active'}
                    onChange={() => toggleBannerStatus(banner.id)}
                  />
                  <span className="slider"></span>
                </label>
                <span style={{ fontSize: 12, fontWeight: 700, color: banner.status === 'Active' ? '#16a34a' : '#94a3b8' }}>
                  {banner.status}
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
                  style={{ padding: '5px 11px', fontSize: 12 }}
                  onClick={() => setEditingBanner(banner)}
                  title="Edit Banner Settings"
                >
                  <Edit2 size={13} /> Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer App Simulation Preview Modal - Separate Component */}
      <BannerPreviewModal
        banner={previewingBanner}
        isOpen={Boolean(previewingBanner)}
        onClose={() => setPreviewingBanner(null)}
      />

      {/* Create & Edit Banner Modal with React Datepicker - Separate Component */}
      <BannerModal
        isOpen={isCreateModalOpen || Boolean(editingBanner)}
        banner={editingBanner}
        onClose={() => { setIsCreateModalOpen(false); setEditingBanner(null); }}
        onSave={handleSaveBanner}
      />
    </div>
  );
}
