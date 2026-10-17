import React, { useState, useEffect, useCallback } from "react";
import {
  Store, Plus, Search, Edit2, Trash2, RefreshCw,
  AlertCircle, Check, Loader2, MapPin, Utensils, KeyRound
} from "lucide-react";
import { URLS } from "../../url";
import EditRestaurantModal from "./EditRestaurantModal";
import AddRestaurantModal from "./AddRestaurantModal";
import ChangeRestaurantPasswordModal from "./ChangeRestaurantPasswordModal";

const FALLBACK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWIyNTM0NGY2NWU0OWY4ZmVmNjc3ZjQiLCJwYXNzd29yZCI6IiQyYiQxMCRCd092b3lZRm9hTVBBSWxnQmRMSlhlazdSL2gyYWJkMXFESTN0V2dJNkJWM25KR0U1R1lzeSIsInBob25lIjoiOTg3NjU0MzIxMCIsImVtYWlsIjoiZ29waUBnbWFpbC5jb20iLCJpYXQiOjE3OTAwNzE3NzEsImV4cCI6MTgyMTYwNzc3MX0.WSJnq7uArEqOISptoH-1PJAJZWBI15UE4l6cyyh7dkY";

const getAuthHeader = () => {
  const token = localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token") || FALLBACK_TOKEN;
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
};

const getImageUrl = (path) => {
  if (!path || typeof path !== "string" || path.trim() === "") return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const base = (URLS.ImageUrl || "").replace(/\/+$/, "");
  return `${base}/${path.replace(/^\/+/, "").replace(/\\/g, "/")}`;
};

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState("success");
  const [deletingId, setDeletingId] = useState(null);
  const [togglingKitchenId, setTogglingKitchenId] = useState(null);
  const [passwordRestaurant, setPasswordRestaurant] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(URLS.GetRestaurant, {
        method: "POST",
        headers: { 
          authorization: getAuthHeader(), 
          "Content-Type": "application/json" 
        }
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setRestaurants(data.restaurents || data.restaurants || data.data || []);
      } else {
        setError(data.message || "Failed to fetch restaurants.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const handleAddRestaurant = () => {
    setIsAddModalOpen(false);
    fetchRestaurants();
    showToast("Restaurant onboarded successfully!");
  };

  const handleSaveEditRestaurant = () => {
    setEditingRestaurant(null);
    fetchRestaurants();
    showToast("Restaurant updated successfully!");
  };

  const appendRestaurantFormFields = (fd, rest, statusOverride) => {
    const ownerFirst = rest.ownerFirstName || "";
    const ownerLast = rest.ownerLastName || "";
    const status = statusOverride ?? rest.status ?? "active";
    fd.append("restaurentName", rest.restaurentName || rest.name || "");
    fd.append("restaurentAddress", rest.restaurentAddress || rest.address || "");
    if (rest.cuisineTypeId) fd.append("cuisineTypeId", rest.cuisineTypeId);
    if (rest.zoneId) fd.append("zoneId", rest.zoneId);
    if (rest.categoryId) fd.append("categoryId", rest.categoryId);
    if (rest.subcategoryId) fd.append("subcategoryId", rest.subcategoryId);
    fd.append("map", rest.map || rest.restaurentAddress || rest.address || "");
    fd.append("estimatedDeliveryMinimumTime", rest.estimatedDeliveryMinimumTime || "test");
    fd.append("estimatedDeliveryMaximunTime", rest.estimatedDeliveryMaximunTime || "test");
    fd.append("estimatedDeliveryMinutes", rest.estimatedDeliveryMinutes || "test");
    fd.append("ownerFirstName", ownerFirst);
    fd.append("ownerLastName", ownerLast);
    fd.append("ownerPhone", rest.ownerPhone || rest.phone || "");
    fd.append("tags", "[]");
    fd.append("tinNumber", rest.tinNumber || "");
    fd.append("tinExpiryDate", rest.tinExpiryDate || "");
    fd.append("tinNumberTwo", rest.tinNumberTwo || "");
    fd.append("tinnumberTwoDate", rest.tinnumberTwoDate || "");
    fd.append("email", rest.email || "");
    fd.append("status", status);
    if (rest.openingTime) fd.append("openingTime", rest.openingTime);
    if (rest.closingTime) fd.append("closingTime", rest.closingTime);
  };

  const isKitchenOpen = (rest) => (rest.status || "").toLowerCase() === "active";

  const toggleKitchenOpen = async (rest) => {
    const id = rest._id || rest.id;
    const nextStatus = isKitchenOpen(rest) ? "inactive" : "active";
    setTogglingKitchenId(id);
    try {
      const fd = new FormData();
      appendRestaurantFormFields(fd, rest, nextStatus);
      const res = await fetch(`${URLS.UpdateRestaurant}${id}`, {
        method: "PUT",
        headers: { authorization: getAuthHeader() },
        body: fd
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setRestaurants((prev) =>
          prev.map((r) => ((r._id || r.id) === id ? { ...r, status: nextStatus } : r))
        );
        showToast(`Kitchen is now ${nextStatus === "active" ? "open" : "closed"}.`);
      } else {
        showToast(data.message || "Failed to update kitchen status.", "error");
      }
    } catch {
      showToast("Network error while updating kitchen status.", "error");
    } finally {
      setTogglingKitchenId(null);
    }
  };

  const handleDelete = async (rest) => {
    const id = rest._id || rest.id;
    if (!window.confirm(`Delete "${rest.restaurentName || rest.name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${URLS.DeleteRestaurant}${id}`, {
        method: "DELETE",
        headers: { authorization: getAuthHeader() }
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setRestaurants(prev => prev.filter(r => (r._id || r.id) !== id));
        showToast(`"${rest.restaurentName || rest.name}" deleted.`);
      } else {
        showToast(data.message || "Failed to delete.", "error");
      }
    } catch {
      showToast("Network error while deleting.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = restaurants.filter(r => {
    const term = searchTerm.toLowerCase();
    return (
      (r.restaurentName || r.name || "").toLowerCase().includes(term) ||
      (r.cuisineTypeName || "").toLowerCase().includes(term) ||
      (r.zoneName || "").toLowerCase().includes(term) ||
      (r.restaurentAddress || "").toLowerCase().includes(term)
    );
  });

  return (
    <div>
      {toastMsg && (
        <div style={{
          padding: "12px 18px", marginBottom: 18, borderRadius: 8,
          background: toastType === "error" ? "#fef2f2" : "#f0fdf4",
          border: `1px solid ${toastType === "error" ? "#fecaca" : "#bbf7d0"}`,
          color: toastType === "error" ? "#dc2626" : "#15803d",
          display: "flex", alignItems: "center", gap: 10, fontSize: 13.5
        }}>
          {toastType === "error" ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="page-header">
        <div className="page-title-block">
          <h1>Restaurant Merchant Directory</h1>
          <p>Manage culinary partners, merchant onboarding, operating details, and storefront approvals</p>
        </div>
        <div className="page-actions-block">
          <button type="button" className="btn btn-secondary" onClick={fetchRestaurants} disabled={loading} style={{ marginRight: 8 }}>
            <RefreshCw size={15} style={{ animation: loading ? "spin 0.8s linear infinite" : "none", display: "inline-block" }} />
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Add New Restaurant
          </button>
        </div>
      </div>

      <div className="card-container">
        <div className="card-header">
          <div><h3>All Partner Restaurants ({filtered.length})</h3></div>
          <div className="card-header-actions">
            <div className="topbar-search-box" style={{ width: 300, padding: "6px 12px" }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search name, cuisine, zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
            <Loader2 size={32} style={{ animation: "spin 1s linear infinite", marginBottom: 10 }} />
            <p style={{ margin: 0, fontSize: 14 }}>Loading restaurants...</p>
          </div>
        ) : error ? (
          <div style={{ margin: 16, padding: "16px 20px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
            <button className="btn btn-secondary" style={{ marginLeft: "auto", fontSize: 12 }} onClick={fetchRestaurants}>Retry</button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Cuisine</th>
                  <th>Zone</th>
                  <th>Commission</th>
                  <th>Contact</th>
                  <th>Owner</th>
                  <th>Rating</th>
                  <th>Orders</th>
                  <th>Earnings</th>
                  <th>Kitchen Open</th>
                  <th>Status</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ textAlign: "center", padding: 36, color: "#64748b" }}>No restaurants found.</td>
                  </tr>
                ) : filtered.map((rest) => {
                  const id = rest._id || rest.id;
                  const logoUrl = getImageUrl(rest.restaurentLogo || rest.logo);
                  const isActive = (rest.status || "").toLowerCase() === "active";
                  const kitchenOpen = isKitchenOpen(rest);
                  return (
                    <tr key={id}>
                      <td>
                        <div className="table-entity-cell">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={rest.restaurentName || rest.name}
                              className="entity-thumb"
                              style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }}
                              onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                            />
                          ) : null}
                          <div style={{ display: logoUrl ? "none" : "flex", width: 44, height: 44, borderRadius: 8, background: "#f1f5f9", border: "1px solid #e2e8f0", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Store size={20} color="#94a3b8" />
                          </div>
                          <div className="entity-info">
                            <h5 style={{ margin: 0, fontSize: 14 }}>{rest.restaurentName || rest.name}</h5>
                            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{rest.restaurentAddress || rest.address || "—"}</p>
                            {rest.email && <span style={{ fontSize: 11, color: "#0284c7" }}>{rest.email}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Utensils size={13} color="#be123c" />
                          <span style={{ fontSize: 13, color: "#334155" }}>{rest.cuisineTypeName || rest.cuisine || "—"}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <MapPin size={13} color="#0284c7" />
                          <span style={{ fontSize: 13, color: "#334155" }}>{rest.zoneName || rest.zone || "—"}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
                          {rest.commissionRate ? `${rest.commissionRate}%` : "—"}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, color: "#334155" }}>
                          {rest.phone || rest.ownerPhone || "—"}
                        </div>
                        {rest.estimatedDeliveryTime && (
                          <div style={{ fontSize: 11.5, color: "#64748b" }}>{rest.estimatedDeliveryTime}</div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: 13, color: "#334155" }}>
                          {rest.ownerFirstName || rest.ownerLastName ? `${rest.ownerFirstName || ""} ${rest.ownerLastName || ""}`.trim() : rest.ownerName || "—"}
                        </div>
                        {rest.ownerPhoneNumber && <div style={{ fontSize: 11.5, color: "#64748b" }}>{rest.ownerPhoneNumber}</div>}
                      </td>
                      <td>
                        <div style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
                          {rest.rating ? `⭐ ${rest.rating}` : "—"}
                        </div>
                        {rest.reviews && <div style={{ fontSize: 11.5, color: "#64748b" }}>{rest.reviews} reviews</div>}
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
                          {rest.totalOrders || 0}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 700 }}>
                          {rest.totalEarnings || "$0.00"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={kitchenOpen}
                              disabled={togglingKitchenId === id}
                              onChange={() => toggleKitchenOpen(rest)}
                            />
                            <span className="slider"></span>
                          </label>
                          <span style={{ fontSize: 12, fontWeight: 600, color: kitchenOpen ? "#16a34a" : "#94a3b8" }}>
                            {togglingKitchenId === id ? "..." : (kitchenOpen ? "Open" : "Closed")}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${isActive ? "badge-delivered" : "badge-pending"}`}>{rest.status || "—"}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <button type="button" className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: 12, color: "#7c3aed", borderColor: "#7c3aed" }} onClick={() => setPasswordRestaurant(rest)} title="Change password">
                            <KeyRound size={13} /> Password
                          </button>
                          <button type="button" className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: 12, color: "#0284c7", borderColor: "#0284c7" }} onClick={() => setEditingRestaurant(rest)} title="Edit">
                            <Edit2 size={13} /> Edit
                          </button>
                          <button type="button" className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: 12, color: "#dc2626", borderColor: "#dc2626" }} onClick={() => handleDelete(rest)} disabled={deletingId === id} title="Delete">
                            {deletingId === id ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={13} />}
                            Delete
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

      <EditRestaurantModal
        restaurant={editingRestaurant}
        isOpen={Boolean(editingRestaurant)}
        onClose={() => setEditingRestaurant(null)}
        onSave={handleSaveEditRestaurant}
        onError={(msg) => showToast(msg, "error")}
      />
      <AddRestaurantModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddRestaurant} />
      <ChangeRestaurantPasswordModal
        restaurant={passwordRestaurant}
        isOpen={Boolean(passwordRestaurant)}
        onClose={() => setPasswordRestaurant(null)}
        onSuccess={(msg) => showToast(msg)}
        onError={(msg) => showToast(msg, "error")}
      />
    </div>
  );
}
