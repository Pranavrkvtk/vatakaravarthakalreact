// src/components/pages/AdminDashboard.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import api from '../../api/axios';
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import MediaTab from "./MediaTab";
import NewsModal from "./NewsModal";
import NewsTab from "./NewsTab";
import AdsTab from "./AdsTab";
import CategoriesTab from "./CategoriesTab";
import DashboardTab from "./DashboardTab";

// ✅ ADD: import checkScheduledPosts
import { getAllNewsAdmin as getAllNews, createNews, updateNews, deleteNews, bulkAction, checkScheduledPosts } from '../../api/news';

// ---------- Loading Spinner ----------
const LoadingSpinner = () => (
  <div style={{ textAlign: "center", padding: "40px" }}>
    <div
      style={{
        width: 40,
        height: 40,
        border: "4px solid #e2e8f0",
        borderTop: "4px solid #4f46e5",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        display: "inline-block",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ---------- NavItem Component ----------
const NavItem = ({ icon, label, active, onClick, badge }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 20px",
      margin: "0 8px 4px",
      borderRadius: 12,
      cursor: "pointer",
      background: active ? "var(--primary-soft)" : "transparent",
      color: active ? "var(--primary)" : "var(--text-secondary)",
      fontWeight: active ? 600 : 500,
      transition: "all 0.2s",
    }}
  >
    <span style={{ fontSize: 18 }}>{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {badge > 0 && (
      <span
        style={{
          background: "var(--primary)",
          color: "#fff",
          borderRadius: 20,
          padding: "0 10px",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {badge}
      </span>
    )}
  </div>
);

// ---------- Mobile Bottom Navigation ----------
const MobileBottomNav = ({ activeTab, onTabChange, onLogout, items }) => (
  <div
    style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "var(--surface)",
      borderTop: "1px solid var(--border-light)",
      display: "flex",
      justifyContent: "space-around",
      padding: "8px 0",
      zIndex: 100,
    }}
  >
    {items.slice(0, 4).map((item) => (
      <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        style={{
          background: "none",
          border: "none",
          padding: "4px 8px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: activeTab === item.id ? "var(--primary)" : "var(--text-secondary)",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 20 }}>{item.icon}</span>
        <span>{item.label}</span>
      </button>
    ))}
    <button
      onClick={onLogout}
      style={{
        background: "none",
        border: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "var(--error)",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      <span style={{ fontSize: 20 }}>🚪</span>
      <span>Logout</span>
    </button>
  </div>
);

// ---------- DateTime Widget ----------
const DateTimeWidget = ({ isMobile, currentTime }) => (
  <div
    style={{
      background: "var(--surface)",
      padding: "6px 14px",
      borderRadius: 30,
      border: "1px solid var(--border-light)",
      fontSize: isMobile ? 11 : 13,
      color: "var(--text-secondary)",
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}
  >
    <span>🕒</span> {currentTime}
  </div>
);

// ---------- Status badge ----------
const STATUS_STYLES = {
  published: { bg: "#dcfce7", color: "#16a34a" },
  draft: { bg: "#fef3c7", color: "#d97706" },
  pending: { bg: "#fef3c7", color: "#d97706" },
  scheduled: { bg: "#dbeafe", color: "#2563eb" },
  trash: { bg: "#fee2e2", color: "#dc2626" },
};

const StatusBadge = ({ status }) => {
  const s = status || "draft";
  const style = STATUS_STYLES[s] || STATUS_STYLES.draft;
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        display: "inline-block",
      }}
    >
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
};

const linkBtnStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 12.5,
  padding: 0,
  fontFamily: "inherit",
};

const qeLabelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--text-secondary)",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

// ---------- Preview Modal ----------
function PreviewModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          maxWidth: 700,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          padding: "30px",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 24,
            cursor: "pointer",
          }}
        >
          ✕
        </button>
        <h2>{item.title}</h2>
        <StatusBadge status={item.status} />
        <div style={{ marginTop: 16 }} dangerouslySetInnerHTML={{ __html: item.content }} />
      </div>
    </div>
  );
}

// ---------- MAIN ADMIN DASHBOARD ----------
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // ---- News state ----
  const [news, setNews] = useState([]);

  // ---- Dashboard stats (from API) ----
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    scheduled: 0,
    drafts: 0,
    trash: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // ---- Categories state ----
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // ---- Ads state ----
  const [ads, setAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(false);

  // ---- Modals ----
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  // ---- Selected items for bulk actions ----
  const [selectedNewsIds, setSelectedNewsIds] = useState([]);

  // ---- Toast notification for auto-publish ----
  const [autoPublishToast, setAutoPublishToast] = useState(null);

  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    date: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkAction, setBulkAction] = useState("");

  // ---------- Resize ----------
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ---------- Clock ----------
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ============================================================
  // Auto-publish scheduled posts using backend endpoint
  // ============================================================
  useEffect(() => {
    const autoPublish = async () => {
      try {
        const result = await checkScheduledPosts();
        if (result.published > 0) {
          console.log(`✅ Auto-published ${result.published} post(s):`, result.titles);
          
          // Refresh the news list
          await loadAllData();
          
          // Show toast notification
          setAutoPublishToast({
            count: result.published,
            titles: result.titles,
            timestamp: new Date(),
          });

          setTimeout(() => {
            setAutoPublishToast(null);
          }, 5000);
        }
      } catch (error) {
        // Silent fail - don't show errors to user
        console.error('Auto-publish check failed:', error);
      }
    };

    // Run immediately when dashboard loads
    autoPublish();
    
    // Then check every 30 seconds
    const interval = setInterval(autoPublish, 30000);
    
    return () => clearInterval(interval);
  }, []); // Empty dependency array - runs once on mount

  // ---------- Unified data loader (news + stats) ----------
  const loadAllData = async () => {
    setLoading(true);
    try {
      const newsData = await getAllNews();
      setNews(newsData);

      // Fetch dashboard stats
      const statsResponse = await api.get("/dashboard/stats");
      const statsObj = {
        total: 0,
        published: 0,
        scheduled: 0,
        drafts: 0,
        trash: 0,
      };
      statsResponse.data.forEach((kpi) => {
        switch (kpi.label) {
          case "Total Posts": statsObj.total = kpi.value; break;
          case "Published": statsObj.published = kpi.value; break;
          case "Scheduled": statsObj.scheduled = kpi.value; break;
          case "Drafts": statsObj.drafts = kpi.value; break;
          case "Trash": statsObj.trash = kpi.value; break;
          default: break;
        }
      });
      setStats(statsObj);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // ============================================================
  // NEW: Handle filter changes from DashboardTab
  // ============================================================
  const handleFilterChange = useCallback((status, category) => {
    // Switch to news tab
    setActiveTab('news');
    
    // Update filters after a small delay (to allow tab switch)
    setTimeout(() => {
      if (status && status !== 'all') {
        setFilters(prev => ({ ...prev, status }));
      } else if (status === 'all') {
        setFilters(prev => ({ ...prev, status: 'all' }));
      }
      
      if (category && category !== 'all') {
        setFilters(prev => ({ ...prev, category }));
      } else if (category === 'all') {
        setFilters(prev => ({ ...prev, category: 'all' }));
      }
      
      // Reset to first page
      setCurrentPage(1);
    }, 150);
  }, []);

  // ============================================================
  // NEW: Listen for filter events from DashboardTab
  // ============================================================
  useEffect(() => {
    const handleFilterEvent = (event) => {
      const { status, category } = event.detail;
      if (status) {
        setFilters(prev => ({ ...prev, status }));
      }
      if (category) {
        setFilters(prev => ({ ...prev, category }));
      }
      setCurrentPage(1);
    };

    window.addEventListener('filterChange', handleFilterEvent);
    return () => window.removeEventListener('filterChange', handleFilterEvent);
  }, []);

  // ---------- Categories (Backend integrated) ----------
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      deriveCategoriesFromNews();
      console.warn("Categories API not available, using derived from news", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const deriveCategoriesFromNews = () => {
    const counts = {};
    news.forEach((n) => {
      const cat = n.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    setCategories(
      Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  useEffect(() => {
    if (!categories.length) {
      deriveCategoriesFromNews();
    }
  }, [news]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (name) => {
    try {
      await api.post("/categories", { name });
      fetchCategories();
      Swal.fire("Added", "Category created.", "success");
    } catch (err) {
      const trimmed = name.trim();
      if (categories.some((c) => c.name === trimmed)) {
        Swal.fire("Already exists", "", "warning");
        return;
      }
      setCategories([...categories, { name: trimmed, count: 0 }]);
      Swal.fire("Added", "Category created (local only).", "success");
    }
  };

  const handleRenameCategory = async (oldName, newName) => {
    try {
      await api.put(`/categories/${encodeURIComponent(oldName)}`, { name: newName });
      const updatedNews = news.map((n) =>
        n.category === oldName ? { ...n, category: newName } : n
      );
      setNews(updatedNews);
      fetchCategories();
      Swal.fire("Renamed", "Category updated.", "success");
    } catch (err) {
      setNews((prev) =>
        prev.map((n) => (n.category === oldName ? { ...n, category: newName } : n))
      );
      setCategories(
        categories.map((c) =>
          c.name === oldName ? { ...c, name: newName } : c
        )
      );
      Swal.fire("Renamed", "Category updated (local only).", "success");
    }
  };

  const handleDeleteCategory = async (name) => {
    const result = await Swal.fire({
      title: `Delete "${name}"?`,
      text: "Posts in this category will be set to Uncategorized.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/categories/${encodeURIComponent(name)}`);
      setNews((prev) =>
        prev.map((n) => (n.category === name ? { ...n, category: "" } : n))
      );
      fetchCategories();
      Swal.fire("Deleted", "", "success");
    } catch (err) {
      setNews((prev) =>
        prev.map((n) => (n.category === name ? { ...n, category: "" } : n))
      );
      setCategories(categories.filter((c) => c.name !== name));
      Swal.fire("Deleted", "Category removed (local only).", "success");
    }
  };

  // ---------- Ads (Backend integrated) ----------
  const fetchAds = async () => {
    setAdsLoading(true);
    try {
      const res = await api.get("/ads");
      setAds(res.data);
    } catch (err) {
      console.warn("Ads API not available, using localStorage", err);
      try {
        const stored = localStorage.getItem("ads");
        setAds(stored ? JSON.parse(stored) : []);
      } catch (e) {
        setAds([]);
      }
    } finally {
      setAdsLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    localStorage.setItem("ads", JSON.stringify(ads));
  }, [ads]);

  const handleAddAd = async (data) => {
    try {
      const res = await api.post("/ads", data);
      setAds([res.data, ...ads]);
      Swal.fire("Added", "Advertisement created.", "success");
    } catch (err) {
      const newAd = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
      setAds([newAd, ...ads]);
      Swal.fire("Added", "Ad added (local only).", "success");
    }
  };

  const handleEditAd = async (id, data) => {
    try {
      const res = await api.put(`/ads/${id}`, data);
      setAds(ads.map((ad) => (ad.id === id ? res.data : ad)));
      Swal.fire("Updated", "Advertisement updated.", "success");
    } catch (err) {
      setAds(ads.map((ad) => (ad.id === id ? { ...ad, ...data } : ad)));
      Swal.fire("Updated", "Ad updated (local only).", "success");
    }
  };

  const handleDeleteAd = async (id) => {
    try {
      await api.delete(`/ads/${id}`);
      setAds(ads.filter((ad) => ad.id !== id));
      Swal.fire("Deleted", "Advertisement removed.", "success");
    } catch (err) {
      setAds(ads.filter((ad) => ad.id !== id));
      Swal.fire("Deleted", "Ad removed (local only).", "success");
    }
  };

  // ---------- News update helper ----------
  const updateNewsItem = async (id, changes) => {
    const current = news.find((n) => n.id === id);
    const updated = { ...current, ...changes };
    setNews((prev) => prev.map((n) => (n.id === id ? updated : n)));
    try {
      await updateNews(id, updated);
    } catch (err) {
      console.warn("Backend sync skipped:", err?.message);
    }
  };

  // ---------- News CRUD ----------
  const handleAddNews = () => setIsAddModalOpen(true);
  const handleEditNews = (item) => {
    setEditingNews(item);
    setIsEditModalOpen(true);
  };
  const handleViewNews = (item) => setPreviewItem(item);
  const handleQuickSave = (id, partial) => updateNewsItem(id, partial);

  const handleTrashNews = async (id) => {
    const result = await Swal.fire({
      title: "Move to Trash?",
      text: "You can restore this post later from the Trash tab.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Move to Trash",
    });
    if (!result.isConfirmed) return;
    await updateNewsItem(id, { status: "trash" });
    Swal.fire("Moved to Trash", "", "success");
    setSelectedNewsIds(prev => prev.filter(sid => sid !== id));
  };

  const handleRestoreNews = async (id) => {
    await updateNewsItem(id, { status: "draft" });
    Swal.fire("Restored", "Post moved back to Drafts.", "success");
    setSelectedNewsIds(prev => prev.filter(sid => sid !== id));
  };

  const handleDeleteForever = async (id) => {
    const result = await Swal.fire({
      title: "Delete Permanently?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete Forever",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteNews(id);
    } catch (err) {
      console.warn("Backend delete skipped:", err?.message);
    }
    setNews((prev) => prev.filter((n) => n.id !== id));
    setSelectedNewsIds(prev => prev.filter(sid => sid !== id));
    Swal.fire("Deleted", "", "success");
  };

  // ============================================================
  // Handle multiple selected news deletion
  // ============================================================
  const handleDeleteSelected = async () => {
    if (selectedNewsIds.length === 0) {
      Swal.fire("No Selection", "Please select at least one item to delete.", "warning");
      return;
    }

    const result = await Swal.fire({
      title: `Delete ${selectedNewsIds.length} selected item(s)?`,
      text: "This action cannot be undone. All selected posts will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: `Yes, delete ${selectedNewsIds.length} item(s)`,
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await bulkAction(selectedNewsIds, "delete");
    } catch (err) {
      console.warn("Backend bulk delete skipped:", err?.message);
      for (const id of selectedNewsIds) {
        try {
          await deleteNews(id);
        } catch (e) {
          console.warn(`Failed to delete ${id}:`, e);
        }
      }
    }

    setNews((prev) => prev.filter((n) => !selectedNewsIds.includes(n.id)));
    setSelectedNewsIds([]);
    Swal.fire("Deleted", `${selectedNewsIds.length} item(s) deleted successfully.`, "success");
  };

  // ============================================================
  // Toggle selection for a single item
  // ============================================================
  const toggleSelectNews = (id) => {
    setSelectedNewsIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // ============================================================
  // Select/Deselect all visible items
  // ============================================================
  const toggleSelectAll = () => {
    const visibleIds = getFilteredNews().map((n) => n.id);
    const allSelected = visibleIds.every((id) => selectedNewsIds.includes(id));
    if (allSelected) {
      setSelectedNewsIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedNewsIds((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  // ---------- Bulk action ----------
  const handleBulkAction = async (action, selectedIds) => {
    if (!action || selectedIds.length === 0) return;
    
    if (action === "delete") {
      handleDeleteSelected();
      return;
    }
    
    const labels = {
      publish: "publish",
      draft: "move to draft",
      trash: "move to trash",
      restore: "restore",
    };
    const result = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} selected items?`,
      text: `This will ${labels[action] || action} ${selectedIds.length} selected item(s).`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4f46e5",
      confirmButtonText: "Yes",
    });
    if (!result.isConfirmed) return;

    try {
      await bulkAction(selectedIds, action);
    } catch (err) {
      console.warn("Backend bulk sync skipped:", err?.message);
    }

    const statusMap = {
      publish: "published",
      draft: "draft",
      trash: "trash",
      restore: "draft",
    };
    setNews((prev) =>
      prev.map((n) =>
        selectedIds.includes(n.id)
          ? { ...n, status: statusMap[action] || n.status }
          : n
      )
    );
    setSelectedNewsIds([]);
    Swal.fire("Done", "", "success");
  };

  // ---------- Get filtered news ----------
  const getFilteredNews = () => {
    let filtered = [...news];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title?.toLowerCase().includes(term) ||
          n.content?.toLowerCase().includes(term) ||
          n.category?.toLowerCase().includes(term)
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((n) => n.status === filters.status);
    }

    if (filters.category !== "all") {
      filtered = filtered.filter((n) => n.category === filters.category);
    }

    return filtered;
  };

  // ---------- Logout ----------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // ---------- Navigation ----------
  const navItems = [
    { icon: "📊", label: "Dashboard", id: "dashboard" },
    { icon: "📰", label: "Posts", id: "news" },
    { icon: "📂", label: "Categories", id: "categories" },
    { icon: "📢", label: "Ads", id: "ads" },
    { icon: "🎬", label: "Media", id: "media" },
  ];

  // ---------- Render content ----------
  const renderContent = () => {
    if (loading && activeTab !== "dashboard") return <LoadingSpinner />;
    if (error) return <div style={{ color: "var(--error)" }}>⚠️ {error}</div>;

    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab 
            stats={stats} 
            recentPosts={news} 
            categories={categories}
            onFilterChange={handleFilterChange}
          />
        );
      case "news":
        return (
          <NewsTab
            news={news}
            loading={loading}
            onAdd={handleAddNews}
            onEdit={handleEditNews}
            onView={handleViewNews}
            onTrash={handleTrashNews}
            onRestore={handleRestoreNews}
            onDeleteForever={handleDeleteForever}
            onQuickSave={handleQuickSave}
            filters={filters}
            setFilters={setFilters}
            bulkAction={bulkAction}
            setBulkAction={setBulkAction}
            onApplyBulkAction={handleBulkAction}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            categories={categories}
            selectedIds={selectedNewsIds}
            onToggleSelect={toggleSelectNews}
            onToggleSelectAll={toggleSelectAll}
            onDeleteSelected={handleDeleteSelected}
          />
        );
      case "categories":
        return (
          <CategoriesTab
            categories={categories}
            loading={categoriesLoading}
            onAdd={handleAddCategory}
            onRename={handleRenameCategory}
            onDelete={handleDeleteCategory}
          />
        );
      case "ads":
        return (
          <AdsTab
            ads={ads}
            loading={adsLoading}
            onAdd={handleAddAd}
            onEdit={handleEditAd}
            onDelete={handleDeleteAd}
            onSave={(data, id) => {
              if (id) {
                handleEditAd(id, data);
              } else {
                handleAddAd(data);
              }
            }}
          />
        );
      case "media":
        return <MediaTab />;
      default:
        return <div>Unknown tab</div>;
    }
  };

  // ---------- Return JSX ----------
  return (
    <>
      <style>{`
        :root {
          --bg-base: #f8f9fb;
          --surface: #ffffff;
          --text-primary: #0f172a;
          --text-secondary: #64748b;
          --border-light: #e4e7ec;
          --primary: #4f46e5;
          --primary-soft: #eef2ff;
          --error: #dc2626;
        }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: system-ui, sans-serif; }
        input, textarea, select {
          background: #fff !important;
          color: #0f172a !important;
          border: 1px solid var(--border-light);
          padding: 8px 12px;
          border-radius: 8px;
          width: 100%;
        }
        .auto-publish-toast {
          position: fixed;
          bottom: 80px;
          right: 20px;
          background: #16a34a;
          color: #fff;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          z-index: 9999;
          max-width: 400px;
          animation: slideInUp 0.3s ease-out;
          font-size: 14px;
        }
        .auto-publish-toast .count {
          font-weight: 700;
          font-size: 18px;
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .auto-publish-toast {
            bottom: 70px;
            right: 10px;
            left: 10px;
            max-width: none;
            padding: 12px 16px;
            font-size: 13px;
          }
        }
      `}</style>

      {/* Auto-Publish Toast Notification */}
      {autoPublishToast && (
        <div className="auto-publish-toast">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>✅</span>
            <div>
              <div>
                <span className="count">{autoPublishToast.count}</span> post(s) auto-published
              </div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                {autoPublishToast.titles.slice(0, 2).join(", ")}
                {autoPublishToast.titles.length > 2 && ` +${autoPublishToast.titles.length - 2} more`}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--bg-base)",
          paddingBottom: isMobile ? 70 : 0,
        }}
      >
        {/* Sidebar */}
        {!isMobile && (
          <nav
            style={{
              width: sidebarOpen ? 260 : 0,
              background: "var(--surface)",
              borderRight: sidebarOpen ? "1px solid var(--border-light)" : "none",
              display: "flex",
              flexDirection: "column",
              padding: sidebarOpen ? "28px 0" : "0",
              position: "sticky",
              top: 0,
              height: "100vh",
              overflow: "hidden",
              transition: "width 0.3s",
              flexShrink: 0,
            }}
          >
            {sidebarOpen && (
              <>
                <div
                  style={{
                    padding: "0 20px",
                    marginBottom: 32,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 24 }}>📰</span>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>
                    News Admin
                  </span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      marginLeft: "auto",
                      background: "none",
                      border: "none",
                      fontSize: 20,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
                {navItems.map((item) => (
                  <NavItem
                    key={item.id}
                    {...item}
                    active={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                  />
                ))}
                <div style={{ flex: 1 }} />
                <button
                  onClick={handleLogout}
                  style={{
                    margin: "0 16px 20px",
                    padding: "12px",
                    borderRadius: 12,
                    border: "1px solid var(--border-light)",
                    background: "var(--surface)",
                    cursor: "pointer",
                    color: "var(--error)",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  🚪 Logout
                </button>
              </>
            )}
          </nav>
        )}

        {/* Mobile Header */}
        {isMobile && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              background: "var(--surface)",
              padding: "12px 16px",
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--border-light)",
              zIndex: 99,
            }}
          >
            <span style={{ fontWeight: 700 }}>📰 News Admin</span>
            <DateTimeWidget isMobile currentTime={currentTime} />
          </div>
        )}

        {/* Main */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? "70px 16px 20px" : "32px 40px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              flexDirection: isMobile ? "column" : "row",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {!isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  padding: "4px 8px",
                  marginRight: 12,
                }}
              >
                {sidebarOpen ? "◀" : "☰"}
              </button>
            )}
            <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 28 }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {!isMobile && <DateTimeWidget isMobile={false} currentTime={currentTime} />}
              
              {/* Check Scheduled Button */}
              {activeTab === 'news' && (
                <button
                  onClick={async () => {
                    try {
                      const result = await checkScheduledPosts();
                      if (result.published > 0) {
                        Swal.fire({
                          icon: 'success',
                          title: `${result.published} post(s) published!`,
                          text: result.titles.join('\n'),
                          timer: 3000,
                          showConfirmButton: false,
                        });
                        await loadAllData();
                      } else {
                        Swal.fire({
                          icon: 'info',
                          title: 'No scheduled posts due',
                          text: 'All scheduled posts are still pending their scheduled time.',
                          timer: 2000,
                          showConfirmButton: false,
                        });
                      }
                    } catch (error) {
                      Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to check scheduled posts.',
                      });
                    }
                  }}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>🔄</span> Check Scheduled
                </button>
              )}
            </div>
          </div>
          {renderContent()}
        </main>

        {/* Mobile Bottom Nav */}
        {isMobile && (
          <MobileBottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            items={navItems}
          />
        )}
      </div>

      {/* News Modal */}
      <NewsModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setEditingNews(null);
        }}
        news={editingNews}
        categories={categories}
        onAddCategory={handleAddCategory}
        onSave={async (data) => {
          console.log('=== SAVING FROM ADMIN DASHBOARD ===');
          console.log('Data:', data);
          console.log('Image exists:', !!data.image);
          if (data.image) {
            console.log('Image length:', data.image.length);
            console.log('Image type:', data.image.startsWith('data:') ? 'base64' : 'url');
          }
          
          try {
            if (editingNews) {
              const payload = { ...editingNews, ...data };
              await updateNews(editingNews.id, payload);
            } else {
              await createNews(data);
            }
            
            await loadAllData();
            Swal.fire('Success!', 'News saved successfully', 'success');
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setEditingNews(null);
          } catch (err) {
            console.error('Error saving news:', err);
            
            const newItem = {
              ...data,
              id: editingNews ? editingNews.id : Date.now(),
              views: 0,
              likes: 0,
              shares: 0,
              createdAt: new Date().toISOString(),
              publishedDate: data.status === 'published' ? new Date().toISOString() : null,
            };
            
            setNews((prev) => 
              editingNews 
                ? prev.map((n) => n.id === editingNews.id ? { ...n, ...newItem } : n)
                : [newItem, ...prev]
            );
            
            Swal.fire('Saved Locally', 'Article saved in local mode', 'success');
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setEditingNews(null);
          }
        }}
      />

      {/* Preview Modal */}
      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </>
  );
}