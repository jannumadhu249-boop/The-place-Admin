import React, { useState } from 'react';
import { Utensils, Plus, Search, Star, DollarSign, Tag, Check, X, Edit2 } from 'lucide-react';
import { foodItemsData } from '../../data/mockData';

export default function FoodManagement() {
  const [foods, setFoods] = useState(foodItemsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Main Course',
    restaurant: "L'Amour Bistro & Lounge",
    price: 18.00,
    discountPrice: '',
    isVeg: true,
    description: '',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'
  });

  const categories = ['All', 'Main Course', 'Appetizers', 'Steaks & Grills', 'Sushi & Sashimi', 'Woodfired Pizza', 'Desserts'];

  const toggleStock = (id) => {
    setFoods(foods.map(f => {
      if (f.id === id) {
        return { ...f, inStock: !f.inStock };
      }
      return f;
    }));
  };

  const handleAddFood = (e) => {
    e.preventDefault();
    const newFood = {
      id: `FOOD-${Math.floor(Math.random() * 900) + 100}`,
      name: formData.name,
      category: formData.category,
      restaurant: formData.restaurant,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
      rating: 5.0,
      isVeg: formData.isVeg,
      inStock: true,
      salesCount: 0,
      image: formData.image,
      description: formData.description
    };
    setFoods([newFood, ...foods]);
    setIsModalOpen(false);
  };

  const filtered = foods.filter(f => {
    const matchesCat = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.restaurant.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Food Menu & Catalog Management</h1>
          <p>Organize restaurant menu dishes, pricing, dietary indicators, and live kitchen availability</p>
        </div>
        <div className="page-actions-block">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} /> Add Food Item
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="card-container" style={{ marginBottom: 20 }}>
        <div className="toolbar-tabs" style={{ padding: '10px 18px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`toolbar-tab-item ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="card-container">
        <div className="card-header">
          <div>
            <h3>Menu Dishes ({filtered.length})</h3>
          </div>
          <div className="card-header-actions">
            <div className="topbar-search-box" style={{ width: 280, padding: '6px 12px' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search food item or bistro..."
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
                <th>Dish Details</th>
                <th>Category</th>
                <th>Restaurant Provider</th>
                <th>Pricing</th>
                <th>Dietary Type</th>
                <th>Total Sold</th>
                <th>In Stock</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((food) => (
                <tr key={food.id}>
                  <td>
                    <div className="table-entity-cell">
                      <img src={food.image} alt={food.name} className="entity-thumb" />
                      <div className="entity-info" style={{ maxWidth: 240 }}>
                        <h5>{food.name}</h5>
                        <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {food.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-accepted">{food.category}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{food.restaurant}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>
                        ${food.price.toFixed(2)}
                      </span>
                      {food.discountPrice && (
                        <span style={{ fontSize: 11.5, textDecoration: 'line-through', color: '#94a3b8' }}>
                          ${food.discountPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 4, 
                      fontSize: 12, 
                      fontWeight: 700, 
                      color: food.isVeg ? '#15803d' : '#be123c' 
                    }}>
                      <span style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        background: food.isVeg ? '#16a34a' : '#be123c' 
                      }} />
                      {food.isVeg ? 'Vegetarian' : 'Non-Veg'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{food.salesCount} sold</span>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={food.inStock}
                        onChange={() => toggleStock(food.id)}
                      />
                      <span className="slider"></span>
                    </label>
                    <span style={{ 
                      marginLeft: 8, 
                      fontSize: 12, 
                      fontWeight: 600, 
                      color: food.inStock ? '#16a34a' : '#dc2626' 
                    }}>
                      {food.inStock ? 'In Stock' : 'Sold Out'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: 12 }}
                      onClick={() => alert(`Editing item ${food.name}`)}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dish Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Culinary Dish</h3>
              <button type="button" className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddFood}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label>Dish Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lobster Thermidor Deluxe"
                    className="form-control-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Menu Category</label>
                    <select
                      className="form-control-input"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Restaurant Kitchen</label>
                    <select
                      className="form-control-input"
                      value={formData.restaurant}
                      onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                    >
                      <option value="L'Amour Bistro & Lounge">L'Amour Bistro & Lounge</option>
                      <option value="Kyoto Artisan Sushi">Kyoto Artisan Sushi</option>
                      <option value="Firenze Woodfired Pizza">Firenze Woodfired Pizza</option>
                      <option value="Spice Dynasty Indian Cuisine">Spice Dynasty Indian Cuisine</option>
                    </select>
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="form-group">
                    <label>Base Price ($)</label>
                    <input
                      type="number"
                      step="0.50"
                      required
                      className="form-control-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Dietary Indicator</label>
                    <select
                      className="form-control-input"
                      value={formData.isVeg ? 'veg' : 'nonveg'}
                      onChange={(e) => setFormData({ ...formData, isVeg: e.target.value === 'veg' })}
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="nonveg">Non-Vegetarian</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Ingredients & Culinary Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe textures, key spices and origins..."
                    className="form-control-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Dish Photography URL</label>
                  <input
                    type="url"
                    className="form-control-input"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Dish to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
