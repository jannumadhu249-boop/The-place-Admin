import React, { useState, useEffect, useCallback } from 'react';
import {
  Utensils,
  Plus,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Upload,
  Store,
  Layers,
  Sparkles
} from 'lucide-react';
import { URLS } from '../../url';

const FALLBACK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY';

const getAuthHeader = () => {
  const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token') || localStorage.getItem('token') || FALLBACK_TOKEN;
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

const getImageUrl = (path) => {
  if (!path || typeof path !== 'string' || path.trim() === '') return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = (URLS.ImageUrl || URLS.Base || '').replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '').replace(/\\/g, '/')}`;
};

export default function FoodManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRestaurantFilter, setSelectedRestaurantFilter] = useState('All');
  const [selectedDietFilter, setSelectedDietFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Toast / feedback state
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    restaurentId: '',
    categoryId: '',
    price: '',
    offerPrice: '',
    foodType: 'vegg',
    status: 'active'
  });

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. Fetch Categories for Filter & Dropdowns
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(URLS.GetCategories, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        const list = Array.isArray(data)
          ? data
          : data.category || data.categories || data.data || [];
        setCategories(list);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // 2. Fetch Restaurants for Filter & Dropdowns
  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await fetch(URLS.GetRestaurant, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        const list = Array.isArray(data)
          ? data
          : data.restaurents || data.restaurants || data.data || [];
        setRestaurants(list);
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    }
  }, []);

  // 3. Fetch Restaurant Products (All or By Restaurant ID)
  const fetchProducts = useCallback(async (restaurantId = selectedRestaurantFilter) => {
    setLoading(true);
    try {
      let res;
      if (restaurantId && restaurantId !== 'All') {
        // Get all products by restaurant ID
        res = await fetch(URLS.GetByIdRestaurantProducts, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: getAuthHeader()
          },
          body: JSON.stringify({ restaurentId: restaurantId })
        });
      } else {
        // Get all restaurant products
        res = await fetch(URLS.GetRestaurantProducts, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: getAuthHeader()
          },
          body: JSON.stringify({})
        });
      }

      const data = await res.json();
      if (res.ok && data.success !== false) {
        const list = Array.isArray(data)
          ? data
          : data.restaurentProducts || data.products || data.data || [];
        setProducts(list);
      } else {
        showToast(data.message || 'Failed to fetch food products', 'error');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      showToast('Network error while loading food items', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurantFilter]);

  // Initial Load
  useEffect(() => {
    fetchCategories();
    fetchRestaurants();
    fetchProducts();
  }, [fetchCategories, fetchRestaurants, fetchProducts]);

  // Handle Restaurant Filter Change
  const handleRestaurantFilterChange = (restId) => {
    setSelectedRestaurantFilter(restId);
    fetchProducts(restId);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      restaurentId: restaurants[0]?._id || restaurants[0]?.id || '',
      categoryId: categories[0]?._id || categories[0]?.id || '',
      price: '',
      offerPrice: '',
      foodType: 'vegg',
      status: 'active'
    });
    setImageFile(null);
    setImagePreview('');
    setModalError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal (calls getsinglerestaurentproduct)
  const handleOpenEditModal = async (prod) => {
    const prodId = prod._id || prod.id;
    setIsModalOpen(true);
    setModalLoading(true);
    setModalError('');
    setImageFile(null);

    try {
      const res = await fetch(URLS.GetByIdSingleRestaurantProducts, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: getAuthHeader()
        },
        body: JSON.stringify({ restaurentProductId: prodId })
      });
      const data = await res.json();
      const current = (data.success && data.restaurentProduct) ? data.restaurentProduct : prod;

      setEditingProduct(current);
      setFormData({
        name: current.name || '',
        restaurentId: current.restaurentId?._id || current.restaurentId || '',
        categoryId: current.categoryId?._id || current.categoryId || '',
        price: current.price || '',
        offerPrice: current.offerPrice || '',
        foodType: (current.foodType || 'vegg').toLowerCase().includes('non') ? 'nonvegg' : 'vegg',
        status: (current.status || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active'
      });
      setImagePreview(getImageUrl(current.image) || '');
    } catch (err) {
      console.error('Error fetching single product:', err);
      // Fallback to table item
      setEditingProduct(prod);
      setFormData({
        name: prod.name || '',
        restaurentId: prod.restaurentId?._id || prod.restaurentId || '',
        categoryId: prod.categoryId?._id || prod.categoryId || '',
        price: prod.price || '',
        offerPrice: prod.offerPrice || '',
        foodType: (prod.foodType || 'vegg').toLowerCase().includes('non') ? 'nonvegg' : 'vegg',
        status: (prod.status || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active'
      });
      setImagePreview(getImageUrl(prod.image) || '');
    } finally {
      setModalLoading(false);
    }
  };

  // Image Selection Handler
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Submit Create or Edit Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.name.trim()) {
      setModalError('Please enter dish name.');
      return;
    }
    if (!formData.restaurentId) {
      setModalError('Please select a restaurant.');
      return;
    }
    if (!formData.categoryId) {
      setModalError('Please select a category.');
      return;
    }
    if (!formData.price) {
      setModalError('Please enter base price.');
      return;
    }
    if (!editingProduct && !imageFile) {
      setModalError('Please select a food dish image.');
      return;
    }

    setModalSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('price', String(formData.price));
      fd.append('offerPrice', String(formData.offerPrice || '0'));
      fd.append('foodType', formData.foodType);
      fd.append('status', formData.status);
      fd.append('restaurentId', formData.restaurentId);
      fd.append('categoryId', formData.categoryId);

      if (imageFile) {
        fd.append('image', imageFile);
      }

      let res;
      if (editingProduct) {
        // Update product curl: PUT UpdateRestaurantProducts + id
        const id = editingProduct._id || editingProduct.id;
        res = await fetch(`${URLS.UpdateRestaurantProducts}${id}`, {
          method: 'PUT',
          headers: {
            authorization: getAuthHeader()
          },
          body: fd
        });
      } else {
        // Create product curl: POST CreateRestaurantProducts
        res = await fetch(URLS.CreateRestaurantProducts, {
          method: 'POST',
          headers: {
            authorization: getAuthHeader()
          },
          body: fd
        });
      }

      const data = await res.json();
      if (res.ok && data.success !== false) {
        showToast(
          data.message || (editingProduct ? 'Dish updated successfully!' : 'Dish added to menu successfully!')
        );
        setIsModalOpen(false);
        fetchProducts();
      } else {
        setModalError(data.message || 'Operation failed. Please try again.');
      }
    } catch (err) {
      console.error('Error saving dish:', err);
      setModalError('Network error. Please try again.');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (prod) => {
    const id = prod._id || prod.id;
    if (!window.confirm(`Are you sure you want to delete "${prod.name}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`${URLS.DeleteRestaurantProducts}${id}`, {
        method: 'DELETE',
        headers: {
          authorization: getAuthHeader()
        }
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        showToast(data.message || 'Dish deleted successfully');
        setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
      } else {
        showToast(data.message || 'Failed to delete dish', 'error');
      }
    } catch (err) {
      console.error('Error deleting dish:', err);
      showToast('Network error while deleting item', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Toggle Live Stock / Status
  const handleToggleStatus = async (prod) => {
    const id = prod._id || prod.id;
    const nextStatus = prod.status === 'active' ? 'inactive' : 'active';
    setTogglingId(id);

    try {
      const fd = new FormData();
      fd.append('name', prod.name || '');
      fd.append('price', String(prod.price || '0'));
      fd.append('offerPrice', String(prod.offerPrice || '0'));
      fd.append('foodType', prod.foodType || 'vegg');
      fd.append('status', nextStatus);
      fd.append('restaurentId', prod.restaurentId?._id || prod.restaurentId || '');
      fd.append('categoryId', prod.categoryId?._id || prod.categoryId || '');

      const res = await fetch(`${URLS.UpdateRestaurantProducts}${id}`, {
        method: 'PUT',
        headers: {
          authorization: getAuthHeader()
        },
        body: fd
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setProducts((prev) =>
          prev.map((p) => ((p._id || p.id) === id ? { ...p, status: nextStatus } : p))
        );
        showToast(`"${prod.name}" status updated to ${nextStatus}.`);
      } else {
        showToast(data.message || 'Failed to update stock status', 'error');
      }
    } catch {
      showToast('Network error updating stock', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Filter products by Search, Category, and Dietary type
  const filteredProducts = products.filter((item) => {
    const nameMatch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const restMatch = (item.restaurentName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const catMatch = (item.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || restMatch || catMatch;

    const matchesCategory =
      selectedCategory === 'All' ||
      item.categoryId === selectedCategory ||
      item.categoryName === selectedCategory ||
      item.categoryId?._id === selectedCategory;

    const isNonVeg = (item.foodType || '').toLowerCase().includes('non');
    const matchesDiet =
      selectedDietFilter === 'All' ||
      (selectedDietFilter === 'vegg' && !isNonVeg) ||
      (selectedDietFilter === 'nonvegg' && isNonVeg);

    return matchesSearch && matchesCategory && matchesDiet;
  });

  return (
    <div>
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 20px',
            borderRadius: 10,
            background: toastType === 'error' ? '#ef4444' : '#10b981',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            fontWeight: 600,
            fontSize: 14,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {toastType === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#fff1f2',
              color: '#be123c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Utensils size={20} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22 }}>Food Menu & Catalog Management</h1>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                Manage restaurant dishes, pricing, dietary indicators, and live kitchen availability
              </p>
            </div>
          </div>
        </div>
        <div className="page-actions-block" style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fetchProducts()}
            disabled={loading}
            title="Refresh Products"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreateModal}
          >
            <Plus size={16} /> Add Food Item
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Category Pills & Restaurant Dropdown */}
      <div className="card-container" style={{ marginBottom: 18, padding: '14px 18px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {/* Category Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: 4 }}>
              Category:
            </span>
            <button
              type="button"
              className={`toolbar-tab-item ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
              style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13 }}
            >
              All Categories ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id || cat.id}
                type="button"
                className={`toolbar-tab-item ${selectedCategory === (cat._id || cat.id) ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat._id || cat.id)}
                style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13 }}
              >
                {cat.name || cat.categoryName}
              </button>
            ))}
          </div>

          {/* Quick Filters: Restaurant & Dietary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Restaurant Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Store size={15} color="#64748b" />
              <select
                className="form-control-input"
                style={{ width: 190, padding: '6px 10px', fontSize: 13 }}
                value={selectedRestaurantFilter}
                onChange={(e) => handleRestaurantFilterChange(e.target.value)}
              >
                <option value="All">All Restaurants</option>
                {restaurants.map((r) => (
                  <option key={r._id || r.id} value={r._id || r.id}>
                    {r.restaurentName || r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dietary Type Filter */}
            <select
              className="form-control-input"
              style={{ width: 140, padding: '6px 10px', fontSize: 13 }}
              value={selectedDietFilter}
              onChange={(e) => setSelectedDietFilter(e.target.value)}
            >
              <option value="All">All Diet Types</option>
              <option value="vegg">Vegetarian</option>
              <option value="nonvegg">Non-Veg</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-container">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16 }}>
              Menu Dishes ({filteredProducts.length})
            </h3>
          </div>
          <div className="card-header-actions">
            <div className="topbar-search-box" style={{ width: 280, padding: '6px 12px' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search dish name, category, or restaurant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: 14 }}>Loading restaurant menu dishes...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            <Utensils size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <h4 style={{ margin: '0 0 6px', color: '#1e293b' }}>No Food Items Found</h4>
            <p style={{ margin: 0, fontSize: 13 }}>
              {searchTerm
                ? 'No dishes match your search criteria.'
                : 'No food items available in this category or restaurant.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Dish Details</th>
                  <th>Category</th>
                  <th>Restaurant Provider</th>
                  <th>Pricing</th>
                  <th>Dietary Type</th>
                  <th>Availability</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => {
                  const id = prod._id || prod.id;
                  const isVeg = !(prod.foodType || '').toLowerCase().includes('non');
                  const inStock = (prod.status || '').toLowerCase() === 'active';
                  const basePrice = Number(prod.price || 0);
                  const offer = Number(prod.offerPrice || 0);
                  const hasOffer = offer > 0 && offer < basePrice;
                  const thumb = getImageUrl(prod.image);

                  return (
                    <tr key={id}>
                      <td>
                        <div className="table-entity-cell" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 10,
                              background: '#f1f5f9',
                              border: '1px solid #e2e8f0',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={prod.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageIcon size={20} color="#94a3b8" />
                            )}
                          </div>
                          <div className="entity-info" style={{ maxWidth: 220 }}>
                            <h5 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                              {prod.name}
                            </h5>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-accepted" style={{ fontWeight: 600 }}>
                          {prod.categoryName || 'Uncategorized'}
                        </span>
                        {/* {prod.subcategoryName && (
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>
                            {prod.subcategoryName}
                          </div>
                        )} */}
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Store size={14} color="#64748b" />
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>
                            {prod.restaurentName || 'Assigned Restaurant'}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                              ₹{hasOffer ? offer.toLocaleString() : basePrice.toLocaleString()}
                            </span>
                            {hasOffer && (
                              <span style={{ fontSize: 12, textDecoration: 'line-through', color: '#94a3b8' }}>
                                ₹{basePrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {hasOffer && (
                            <span style={{ fontSize: 10.5, color: '#16a34a', fontWeight: 700 }}>
                              Save ₹{(basePrice - offer).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                            background: isVeg ? '#f0fdf4' : '#fff1f2',
                            color: isVeg ? '#15803d' : '#be123c',
                            border: `1px solid ${isVeg ? '#bbf7d0' : '#fecdd3'}`
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: isVeg ? '#16a34a' : '#be123c'
                            }}
                          />
                          {isVeg ? 'Vegetarian' : 'Non-Veg'}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={inStock}
                              disabled={togglingId === id}
                              onChange={() => handleToggleStatus(prod)}
                            />
                            <span className="slider"></span>
                          </label>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: inStock ? '#16a34a' : '#dc2626'
                            }}
                          >
                            {inStock ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: 12 }}
                            onClick={() => handleOpenEditModal(prod)}
                            title="Edit dish"
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-icon"
                            style={{
                              color: '#dc2626',
                              padding: 6,
                              borderRadius: 6,
                              background: '#fef2f2',
                              border: '1px solid #fee2e2'
                            }}
                            disabled={deletingId === id}
                            onClick={() => handleDeleteProduct(prod)}
                            title="Delete dish"
                          >
                            {deletingId === id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Culinary Dish Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !modalSubmitting && setIsModalOpen(false)}>
          <div
            className="modal-dialog"
            style={{ maxWidth: 680, width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
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
                  <Utensils size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17 }}>
                    {editingProduct ? 'Edit Culinary Dish' : 'Add Culinary Dish'}
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                    {editingProduct ? 'Update menu dish specifications, pricing, and restaurant assignment' : 'Add a new mouthwatering dish to restaurant catalog'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => !modalSubmitting && setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {modalLoading ? (
              <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
                <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 10 }} />
                <p style={{ margin: 0, fontSize: 13 }}>Loading dish details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitForm}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 24px' }}>
                  {modalError && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: '#fef2f2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <AlertCircle size={16} />
                      <span>{modalError}</span>
                    </div>
                  )}

                  {/* Dish Name */}
                  <div className="form-group">
                    <label>Dish Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Special Chicken Biryani, Paneer Tikka..."
                      className="form-control-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={modalSubmitting}
                    />
                  </div>

                  {/* Restaurant & Category Grid */}
                  <div className="modal-grid">
                    <div className="form-group">
                      <label>Restaurant Kitchen *</label>
                      <select
                        className="form-control-input"
                        required
                        value={formData.restaurentId}
                        onChange={(e) => setFormData({ ...formData, restaurentId: e.target.value })}
                        disabled={modalSubmitting}
                      >
                        <option value="">Select Restaurant</option>
                        {restaurants.map((r) => (
                          <option key={r._id || r.id} value={r._id || r.id}>
                            {r.restaurentName || r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Food Category *</label>
                      <select
                        className="form-control-input"
                        required
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        disabled={modalSubmitting}
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c._id || c.id} value={c._id || c.id}>
                            {c.name || c.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pricing Grid */}
                  <div className="modal-grid">
                    <div className="form-group">
                      <label>Base Price (₹) *</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        required
                        placeholder="e.g. 500"
                        className="form-control-input"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        disabled={modalSubmitting}
                      />
                    </div>

                    <div className="form-group">
                      <label>Offer Price (₹)</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="e.g. 450 (Optional discount price)"
                        className="form-control-input"
                        value={formData.offerPrice}
                        onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                        disabled={modalSubmitting}
                      />
                    </div>
                  </div>

                  {/* Dietary & Status Grid */}
                  <div className="modal-grid">
                    <div className="form-group">
                      <label>Dietary Type *</label>
                      <select
                        className="form-control-input"
                        value={formData.foodType}
                        onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                        disabled={modalSubmitting}
                      >
                        <option value="vegg">Vegetarian</option>
                        <option value="nonvegg">Non-Vegetarian</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Availability Status *</label>
                      <select
                        className="form-control-input"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        disabled={modalSubmitting}
                      >
                        <option value="active">Active (In Stock)</option>
                        <option value="inactive">Inactive (Out of Stock)</option>
                      </select>
                    </div>
                  </div>

                  {/* Dish Image Upload */}
                  <div className="form-group">
                    <label>
                      Dish Photography Image {!editingProduct && '*'}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 10,
                          background: '#f8fafc',
                          border: '1px dashed #cbd5e1',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <ImageIcon size={24} color="#94a3b8" />
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <input
                          type="file"
                          id="dish-image-input"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleImageChange}
                          disabled={modalSubmitting}
                        />
                        <label
                          htmlFor="dish-image-input"
                          className="btn btn-secondary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                        >
                          <Upload size={14} /> {imagePreview ? 'Change Photo' : 'Select Dish Photo'}
                        </label>
                        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b' }}>
                          Upload JPG, PNG, or WebP menu photograph
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                    disabled={modalSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={modalSubmitting}
                  >
                    {modalSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Saving Dish...
                      </>
                    ) : (
                      editingProduct ? 'Update Dish' : 'Save Dish to Menu'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
