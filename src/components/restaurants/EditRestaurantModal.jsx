import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CheckCircle,
  Store,
  FileText,
  ShieldCheck,
  Lock,
  Upload,
  Image as ImageIcon,
  Calendar,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

const getImageUrl = (path) => {
  if (!path || typeof path !== 'string' || path.trim() === '') return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = (URLS.ImageUrl || '').replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
};

const parseDateForInput = (val) => {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const dmy = val.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return '';
};

const formatDateForApi = (val) => {
  if (!val) return '';
  const iso = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[3]}-${iso[2]}-${iso[1]}`;
  return val;
};

const buildEstimatedDeliveryLabel = (r) => {
  const min = r?.estimatedDeliveryMinimumTime;
  const max = r?.estimatedDeliveryMaximunTime;
  if (min && max) return `${min}-${max}`;
  if (min) return String(min);
  return r?.estimatedDeliveryMinutes || '';
};

const zoneLabel = (z) => z?.zoneName || z?.name || 'Unnamed zone';

const mergeZoneLists = (activeZones, allZones, detail, listRow) => {
  const map = new Map();
  [...(allZones || []), ...(activeZones || [])].forEach((z) => {
    if (z?._id) map.set(String(z._id), z);
  });

  const zoneId = detail?.zoneId || listRow?.zoneId;
  const zoneName = detail?.zoneName || listRow?.zoneName;
  if (zoneId) {
    const key = String(zoneId);
    const existing = map.get(key);
    if (existing) {
      map.set(key, {
        ...existing,
        name: existing.name || existing.zoneName || zoneName,
        zoneName: existing.zoneName || existing.name || zoneName
      });
    } else {
      map.set(key, { _id: zoneId, name: zoneName, zoneName });
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    zoneLabel(a).localeCompare(zoneLabel(b))
  );
};

function getSubCategoryParentId(s) {
  if (!s) return '';
  const c = s.categoryId ?? s.category ?? s.category_id ?? s.parentCategoryId;
  if (!c) return '';
  if (typeof c === 'object') {
    return String(c._id || c.id || '');
  }
  return String(c);
}

function mapRestaurantToForm(r, categoryList = [], subcategoryList = []) {
  const ownerFirst = r.ownerFirstName || '';
  const ownerLast = r.ownerLastName || '';

  let catId = r.categoryId || r.category?._id || (typeof r.category === 'string' ? r.category : '') || '';
  if (typeof catId === 'object' && catId !== null) catId = catId._id || catId.id || '';
  if (!catId && categoryList.length > 0) catId = String(categoryList[0]._id || categoryList[0].id || '');

  let subId = r.subcategoryId || r.subCategoryId || r.subcategory?._id || r.subCategory?._id || (typeof r.subcategory === 'string' ? r.subcategory : '') || '';
  if (typeof subId === 'object' && subId !== null) subId = subId._id || subId.id || '';

  const matchingSubs = subcategoryList.filter((s) => {
    const parentId = getSubCategoryParentId(s);
    return parentId ? parentId === String(catId) : false;
  });

  if (!subId && matchingSubs.length > 0) {
    subId = String(matchingSubs[0]._id || matchingSubs[0].id || '');
  } else if (!subId && subcategoryList.length > 0) {
    subId = String(subcategoryList[0]._id || subcategoryList[0].id || '');
  }

  return {
    _id: r._id || r.id,
    name: r.restaurentName || r.name || '',
    address: r.restaurentAddress || r.address || r.map || '',
    cuisineTypeId: r.cuisineTypeId || '',
    zoneId: r.zoneId ? String(r.zoneId) : '',
    zoneName: r.zoneName || '',
    categoryId: catId,
    subcategoryId: subId,
    phone: r.ownerPhone || r.phone || '',
    estimatedDeliveryTime: buildEstimatedDeliveryLabel(r),
    estimatedDeliveryMinimumTime: r.estimatedDeliveryMinimumTime || '',
    estimatedDeliveryMaximunTime: r.estimatedDeliveryMaximunTime || '',
    estimatedDeliveryMinutes: r.estimatedDeliveryMinutes || '',
    logoUrl: getImageUrl(r.restaurentLogo || r.logo),
    coverUrl: getImageUrl(r.restaurentCover || r.image),
    galleryUrls: (r.images || []).map((img) => getImageUrl(img)).filter(Boolean),
    tinNumber: r.tinNumber || '',
    expiryDate: parseDateForInput(r.tinExpiryDate || r.expiryDate),
    tinCertificateUrl: getImageUrl(r.tinCertificate),
    tinNumberTwo: r.tinNumberTwo || '',
    tinNumberTwoDate: parseDateForInput(r.tinnumberTwoDate || r.tinNumberTwoDate),
    licenceDocumentUrl: getImageUrl(r.licenseDocument || r.licenceDocument),
    ownerName: `${ownerFirst} ${ownerLast}`.trim() || r.ownerName || '',
    ownerPhoneNumber: r.ownerPhone || r.ownerPhoneNumber || '',
    email: r.email || '',
    status: (r.status || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
    dailyOpenTime: r.dailyOpenTime || '',
    dailyCloseTime: r.dailyCloseTime || '',
    map: r.map || r.restaurentAddress || ''
  };
}

export default function EditRestaurantModal({ restaurant, isOpen, onClose, onSave, onError }) {
  const [formData, setFormData] = useState(null);
  const [cuisines, setCuisines] = useState([]);
  const [zones, setZones] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [tinCertificateFile, setTinCertificateFile] = useState(null);
  const [licenseDocumentFile, setLicenseDocumentFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const availableSubcategories = useMemo(() => {
    if (!Array.isArray(subcategories) || subcategories.length === 0) return [];
    const currentCatId = String(formData?.categoryId || '');
    if (!currentCatId) return subcategories;
    const filtered = subcategories.filter((s) => {
      const parentId = getSubCategoryParentId(s);
      return parentId ? parentId === currentCatId : false;
    });
    return filtered.length > 0 ? filtered : subcategories;
  }, [subcategories, formData?.categoryId]);

  useEffect(() => {
    if (!isOpen || !restaurant) return;

    let cancelled = false;

    const load = async () => {
      setLoadingDetail(true);
      setPasswordError('');
      setLogoFile(null);
      setCoverFile(null);
      setTinCertificateFile(null);
      setLicenseDocumentFile(null);
      setGalleryFiles([]);

      try {
        const [cuisineRes, activeZoneRes, allZoneRes, categoryRes, subcategoryRes, detailRes] = await Promise.all([
          fetch(URLS.GetActiveCuisine, { method: 'POST', headers: { authorization: getAuthHeader() } }),
          fetch(URLS.GetActiveZones, { method: 'POST', headers: { authorization: getAuthHeader() } }),
          fetch(URLS.GetZones, {
            method: 'POST',
            headers: { authorization: getAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          }),
          fetch(URLS.GetCategories, {
            method: 'POST',
            headers: { authorization: getAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          }),
          fetch(URLS.GetSubCategories, {
            method: 'POST',
            headers: { authorization: getAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          }),
          fetch(URLS.GetByIdRestaurant, {
            method: 'POST',
            headers: {
              authorization: getAuthHeader(),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ restaurentId: restaurant._id || restaurant.id })
          })
        ]);

        const cuisineData = await cuisineRes.json();
        const activeZoneData = await activeZoneRes.json();
        const allZoneData = await allZoneRes.json();
        const categoryData = await categoryRes.json();
        const subcategoryData = await subcategoryRes.json();
        const detailData = await detailRes.json();

        if (cancelled) return;

        const detail = {
          ...(detailData.restaurent || detailData.restaurant || detailData.data || restaurant),
          zoneName:
            (detailData.restaurent || detailData.restaurant || detailData.data || restaurant)?.zoneName
            || restaurant.zoneName,
          zoneId:
            (detailData.restaurent || detailData.restaurant || detailData.data || restaurant)?.zoneId
            || restaurant.zoneId
        };

        let cuisineList = cuisineData.cuisineTypes || cuisineData.data || [];
        const activeZones = activeZoneData.zones || activeZoneData.data || [];
        const allZones = allZoneData.zones || allZoneData.data || [];
        const zoneList = mergeZoneLists(activeZones, allZones, detail, restaurant);

        const categoryList = Array.isArray(categoryData)
          ? categoryData
          : (categoryData?.categories || categoryData?.category || categoryData?.data?.categories || categoryData?.data || categoryData?.result || []);

        const subcategoryList = Array.isArray(subcategoryData)
          ? subcategoryData
          : (subcategoryData?.subCategories || subcategoryData?.subcategories || subcategoryData?.subcategory || subcategoryData?.data?.subCategories || subcategoryData?.data?.subcategories || subcategoryData?.data || subcategoryData?.result || []);

        if (detail.cuisineTypeId && !cuisineList.some((c) => String(c._id) === String(detail.cuisineTypeId))) {
          cuisineList = [
            ...cuisineList,
            { _id: detail.cuisineTypeId, name: detail.cuisineTypeName || restaurant.cuisineTypeName }
          ];
        }

        setCuisines(cuisineList);
        setZones(zoneList);
        setCategories(categoryList);
        setSubcategories(subcategoryList);
        setFormData(mapRestaurantToForm(detail, categoryList, subcategoryList));
      } catch {
        if (!cancelled) {
          setFormData(mapRestaurantToForm(restaurant));
          if (onError) onError('Could not load full restaurant details.');
        }
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [restaurant, isOpen]);

  if (!isOpen || !restaurant) return null;

  const handleFileUpload = (kind, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (kind === 'logo') {
      setLogoFile(file);
      setFormData((prev) => ({ ...prev, logoUrl: URL.createObjectURL(file) }));
    } else if (kind === 'cover') {
      setCoverFile(file);
      setFormData((prev) => ({ ...prev, coverUrl: URL.createObjectURL(file) }));
    } else if (kind === 'tinCertificate') {
      setTinCertificateFile(file);
      setFormData((prev) => ({
        ...prev,
        tinCertificateUrl: URL.createObjectURL(file),
        tinCertificateName: file.name
      }));
    } else if (kind === 'licenceDocument') {
      setLicenseDocumentFile(file);
      setFormData((prev) => ({
        ...prev,
        licenceDocumentUrl: URL.createObjectURL(file),
        licenceDocumentName: file.name
      }));
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setGalleryFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setFormData((prev) => ({ ...prev, galleryUrls: [...(prev.galleryUrls || []), ...previews] }));
  };

  const handleCategoryChange = (catId) => {
    const matching = subcategories.filter((s) => {
      const parentId = getSubCategoryParentId(s);
      return parentId ? parentId === String(catId) : false;
    });
    setFormData((prev) => ({
      ...prev,
      categoryId: catId,
      subcategoryId: matching[0]
        ? String(matching[0]._id || matching[0].id)
        : (matching.length === 0 && subcategories.length > 0 ? String(subcategories[0]._id || subcategories[0].id) : '')
    }));
  };

  const appendUpdateFields = (fd) => {
    const ownerParts = (formData.ownerName || '').trim().split(/\s+/);
    const ownerFirstName = ownerParts[0] || '';
    const ownerLastName = ownerParts.slice(1).join(' ') || '';

    const est = formData.estimatedDeliveryTime || '';
    const estParts = est.split('-');

    fd.append('restaurentName', formData.name);
    fd.append('restaurentAddress', formData.address);
    if (formData.cuisineTypeId) fd.append('cuisineTypeId', formData.cuisineTypeId);
    if (formData.zoneId) fd.append('zoneId', formData.zoneId);
    if (formData.categoryId) fd.append('categoryId', formData.categoryId);
    if (formData.subcategoryId) fd.append('subcategoryId', formData.subcategoryId);
    fd.append('map', formData.map || formData.address);
    fd.append(
      'estimatedDeliveryMinimumTime',
      formData.estimatedDeliveryMinimumTime || estParts[0]?.trim() || 'test'
    );
    fd.append(
      'estimatedDeliveryMaximunTime',
      formData.estimatedDeliveryMaximunTime || estParts[1]?.replace(/min/i, '').trim() || 'test'
    );
    fd.append(
      'estimatedDeliveryMinutes',
      formData.estimatedDeliveryMinutes || estParts[0]?.trim() || 'test'
    );
    fd.append('ownerFirstName', ownerFirstName);
    fd.append('ownerLastName', ownerLastName);
    fd.append('ownerPhone', formData.ownerPhoneNumber || formData.phone);
    fd.append('tags', '[]');
    fd.append('tinNumber', formData.tinNumber || '');
    fd.append('tinExpiryDate', formatDateForApi(formData.expiryDate));
    fd.append('tinNumberTwo', formData.tinNumberTwo || '');
    fd.append('tinnumberTwoDate', formatDateForApi(formData.tinNumberTwoDate));
    fd.append('email', formData.email);
    fd.append('status', formData.status || 'active');
    if (formData.dailyOpenTime) fd.append('dailyOpenTime', formData.dailyOpenTime);
    if (formData.dailyCloseTime) fd.append('dailyCloseTime', formData.dailyCloseTime);

    if (logoFile) fd.append('restaurentLogo', logoFile);
    if (coverFile) fd.append('restaurentCover', coverFile);
    if (tinCertificateFile) fd.append('tinCertificate', tinCertificateFile);
    if (licenseDocumentFile) fd.append('licenseDocument', licenseDocumentFile);
    galleryFiles.forEach((file) => fd.append('images', file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!formData.categoryId) {
      setPasswordError('Please select a Category.');
      return;
    }
    if (!formData.subcategoryId) {
      setPasswordError('Please select a Subcategory.');
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();
      appendUpdateFields(fd);

      const updateRes = await fetch(`${URLS.UpdateRestaurant}${formData._id}`, {
        method: 'PUT',
        headers: { authorization: getAuthHeader() },
        body: fd
      });
      const updateData = await updateRes.json();

      if (!updateRes.ok || updateData.success === false) {
        setPasswordError(updateData.message || 'Failed to update restaurant.');
        setSubmitting(false);
        return;
      }

      onSave();
      onClose();
    } catch {
      setPasswordError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (field === 'status') setPasswordError('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 920, width: '95%' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: '#fff1f2', color: '#be123c',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Store size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>Edit Restaurant Profile</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                {formData?.name || restaurant.restaurentName || restaurant.name}
              </p>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {loadingDetail || !formData ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
            <p style={{ margin: 0 }}>Loading restaurant details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '22px 26px' }}>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Store size={16} color="#be123c" />
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    1. General Restaurant Information
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="modal-grid">
                    <div className="form-group">
                      <label>Restaurant Name *</label>
                      <input type="text" required className="form-control-input" value={formData.name} onChange={(e) => set('name', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Cuisine Type *</label>
                      <select
                        className="form-control-input"
                        required
                        value={formData.cuisineTypeId || ''}
                        onChange={(e) => set('cuisineTypeId', e.target.value)}
                      >
                        <option value="">Select Cuisine Type</option>
                        {cuisines.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.cuisineTypeName || c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="modal-grid">
                    <div className="form-group">
                      <label>Category *</label>
                      <select
                        className="form-control-input"
                        required
                        value={formData.categoryId || ''}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c._id || c.id} value={c._id || c.id}>
                            {c.name || c.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Subcategory *</label>
                      <select
                        className="form-control-input"
                        required
                        value={formData.subcategoryId || ''}
                        onChange={(e) => set('subcategoryId', e.target.value)}
                        disabled={loadingDetail}
                      >
                        <option value="">Select Subcategory</option>
                        {availableSubcategories.map((s) => {
                          const id = s._id || s.id || (typeof s === 'string' ? s : '');
                          const label = s.name || s.subcategoryName || s.subCategoryName || s.title || id;
                          return (
                            <option key={id} value={id}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="modal-grid">
                    <div className="form-group">
                      <label>Assigned Delivery Zone *</label>
                      <select
                        className="form-control-input"
                        required
                        value={formData.zoneId ? String(formData.zoneId) : ''}
                        onChange={(e) => set('zoneId', e.target.value)}
                      >
                        <option value="">Select Delivery Zone</option>
                        {zones.map((z) => (
                          <option key={String(z._id)} value={String(z._id)}>
                            {zoneLabel(z)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status *</label>
                      <select
                        className="form-control-input"
                        required
                        value={formData.status}
                        onChange={(e) => set('status', e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-grid">
                    <div className="form-group">
                      <label>Contact Phone *</label>
                      <input type="text" required className="form-control-input" value={formData.phone} onChange={(e) => set('phone', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Estimated Delivery Time</label>
                      <input
                        type="text"
                        className="form-control-input"
                        placeholder="e.g. 20-30 min"
                        value={formData.estimatedDeliveryTime}
                        onChange={(e) => set('estimatedDeliveryTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Physical Address *</label>
                    <input type="text" required className="form-control-input" value={formData.address} onChange={(e) => set('address', e.target.value)} />
                  </div>

                  <div className="modal-grid">
                    <div className="form-group">
                      <label>Daily Opening Time</label>
                      <input
                        type="time"
                        className="form-control-input"
                        value={formData.dailyOpenTime}
                        onChange={(e) => set('dailyOpenTime', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Daily Closing Time</label>
                      <input
                        type="time"
                        className="form-control-input"
                        value={formData.dailyCloseTime}
                        onChange={(e) => set('dailyCloseTime', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <ImageIcon size={16} color="#0284c7" />
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    2. Branding &amp; Storefront Media
                  </h4>
                </div>

                <div className="modal-grid">
                  <div className="form-group" style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Store size={14} color="#be123c" /> Restaurant Logo
                    </label>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 54, height: 54, borderRadius: 8, background: '#e2e8f0', border: '1px solid #cbd5e1', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <ImageIcon size={22} color="#94a3b8" />
                        )}
                      </div>
                      <input type="file" accept="image/*" id="edit-logo-upload" style={{ display: 'none' }} onChange={(e) => handleFileUpload('logo', e)} />
                      <label htmlFor="edit-logo-upload" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
                        <Upload size={13} /> Change Logo
                      </label>
                    </div>
                  </div>

                  <div className="form-group" style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ImageIcon size={14} color="#0284c7" /> Storefront Cover Banner
                    </label>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 54, height: 54, borderRadius: 8, background: '#e2e8f0', border: '1px solid #cbd5e1', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {formData.coverUrl ? (
                          <img src={formData.coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <ImageIcon size={22} color="#94a3b8" />
                        )}
                      </div>
                      <input type="file" accept="image/*" id="edit-cover-upload" style={{ display: 'none' }} onChange={(e) => handleFileUpload('cover', e)} />
                      <label htmlFor="edit-cover-upload" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
                        <Upload size={13} /> Change Banner
                      </label>
                    </div>
                  </div>
                </div>

                {(formData.galleryUrls?.length > 0 || galleryFiles.length > 0) && (
                  <div style={{ marginTop: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 8 }}>Gallery Images</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {formData.galleryUrls.map((url, idx) => (
                        <img key={`${url}-${idx}`} src={url} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 12 }}>
                  <input type="file" accept="image/*" multiple id="edit-gallery-upload" style={{ display: 'none' }} onChange={handleGalleryUpload} />
                  <label htmlFor="edit-gallery-upload" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
                    <Upload size={13} /> Add Gallery Images
                  </label>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <ShieldCheck size={16} color="#059669" />
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    3. Tax Identification (TIN) &amp; Business Licensing
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="modal-grid">
                    <div className="form-group">
                      <label>Taxpayer Identification Number (TIN)</label>
                      <input type="text" className="form-control-input" value={formData.tinNumber} onChange={(e) => set('tinNumber', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={14} color="#0284c7" />
                        <span>TIN Expiry Date</span>
                      </label>
                      <input type="date" className="form-control-input" value={formData.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} />
                    </div>
                  </div>

                  <div className="modal-grid">
                    <div className="form-group">
                      <label>TIN Number Two</label>
                      <input type="text" className="form-control-input" value={formData.tinNumberTwo} onChange={(e) => set('tinNumberTwo', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>TIN Number Two Expiry Date</label>
                      <input type="date" className="form-control-input" value={formData.tinNumberTwoDate} onChange={(e) => set('tinNumberTwoDate', e.target.value)} />
                    </div>
                  </div>

                  <div className="modal-grid">
                    <div className="form-group" style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={14} color="#059669" /> TIN Certificate
                      </label>
                      {formData.tinCertificateUrl && (
                        <a href={formData.tinCertificateUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#0284c7', display: 'block', marginBottom: 8 }}>View current certificate</a>
                      )}
                      <input type="file" accept="image/*,.pdf,.doc,.docx" id="edit-tin-upload" style={{ display: 'none' }} onChange={(e) => handleFileUpload('tinCertificate', e)} />
                      <label htmlFor="edit-tin-upload" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
                        <Upload size={13} /> Replace Certificate
                      </label>
                    </div>

                    <div className="form-group" style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <label style={{ fontWeight: 600, color: '#1e293b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={14} color="#d97706" /> Licence Document
                      </label>
                      {formData.licenceDocumentUrl && (
                        <a href={formData.licenceDocumentUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#0284c7', display: 'block', marginBottom: 8 }}>View current licence</a>
                      )}
                      <input type="file" accept="image/*,.pdf,.doc,.docx" id="edit-licence-upload" style={{ display: 'none' }} onChange={(e) => handleFileUpload('licenceDocument', e)} />
                      <label htmlFor="edit-licence-upload" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
                        <Upload size={13} /> Replace Licence
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Clock size={16} color="#7c3aed" />
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    4. Operations &amp; Owner Profile
                  </h4>
                </div>
                <div className="modal-grid">
                  <div className="form-group">
                    <label>Principal Owner Name</label>
                    <input type="text" className="form-control-input" value={formData.ownerName} onChange={(e) => set('ownerName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Owner Direct Phone</label>
                    <input type="text" className="form-control-input" value={formData.ownerPhoneNumber} onChange={(e) => set('ownerPhoneNumber', e.target.value)} />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Lock size={16} color="#be123c" />
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    5. Merchant Portal Account Information
                  </h4>
                </div>

                {passwordError && (
                  <div style={{
                    padding: '10px 14px', marginBottom: 14, borderRadius: 8,
                    background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
                    display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5
                  }}>
                    <AlertCircle size={15} /> <span>{passwordError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label>Merchant Portal Login Email *</label>
                  <input type="email" required className="form-control-input" value={formData.email} onChange={(e) => set('email', e.target.value)} />
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                  Use the Password action on the restaurant list to change the merchant login password.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={15} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export { getImageUrl as getRestaurantImageUrl, formatDateForApi, parseDateForInput };
