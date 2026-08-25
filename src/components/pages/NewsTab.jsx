// components/pages/NewsTab.js
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

// ---------- Helper Components ----------
const LoadingSpinner = () => (
  <div style={{ textAlign: "center", padding: "40px" }}>
    <div style={{
      width: 40, height: 40, border: "4px solid #e2e8f0",
      borderTop: "4px solid #4f46e5", borderRadius: "50%",
      animation: "spin 0.8s linear infinite", display: "inline-block"
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

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
    <span style={{
      background: style.bg, color: style.color, padding: "4px 12px",
      borderRadius: 20, fontSize: 12, fontWeight: 600, display: "inline-block",
    }}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
};

const linkBtnStyle = {
  background: "none", border: "none", cursor: "pointer", fontSize: 12.5,
  padding: 0, fontFamily: "inherit",
};

const qeLabelStyle = {
  display: "block", fontSize: 11, fontWeight: 700,
  color: "var(--text-secondary)", marginBottom: 4,
  textTransform: "uppercase", letterSpacing: 0.3,
};

// ---------- Date Formatter ----------
const formatDate = (dateString) => {
  if (!dateString) return "—";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (e) {
    return "—";
  }
};

// ---------- Countdown Timer Component ----------
const CountdownTimer = ({ scheduledDate, onPublishNow }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!scheduledDate) return;
      
      const now = new Date().getTime();
      const target = new Date(scheduledDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsPast(true);
        setTimeLeft(null);
        return;
      }

      setIsPast(false);
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      let display = '';
      if (days > 0) display += `${days}d `;
      if (hours > 0 || days > 0) display += `${hours}h `;
      if (minutes > 0 || hours > 0 || days > 0) display += `${minutes}m `;
      display += `${seconds}s`;

      setTimeLeft(display);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [scheduledDate]);

  if (!scheduledDate) return null;
  
  if (isPast) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ color: "#16a34a", fontWeight: 600 }}>✅ Ready to publish</span>
        {onPublishNow && (
          <button
            onClick={onPublishNow}
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              padding: "4px 14px",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.background = "#059669"}
            onMouseLeave={(e) => e.target.style.background = "#16a34a"}
          >
            Publish Now
          </button>
        )}
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <span style={{ 
      color: "#2563eb", 
      fontWeight: 600,
      fontVariantNumeric: "tabular-nums",
    }}>
      ⏳ {timeLeft}
    </span>
  );
};

// ---------- Top Viewed News Component ----------
const TopViewedNews = ({ news, onView }) => {
  // Get top 5 viewed news (excluding trash)
  const topViewed = [...news]
    .filter(n => n.status !== 'trash')
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  if (topViewed.length === 0) return null;

  return (
    <div style={{
      background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
      borderRadius: 12,
      padding: "16px 20px",
      marginBottom: 20,
      border: "1px solid #f59e0b",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 24 }}>🔥</span>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#92400e" }}>
          Top 5 Most Viewed News
        </h4>
        <span style={{
          fontSize: 12,
          color: "#92400e",
          background: "rgba(255,255,255,0.5)",
          padding: "2px 10px",
          borderRadius: 12,
          marginLeft: "auto",
        }}>
          Total Views: {topViewed.reduce((sum, n) => sum + (n.views || 0), 0)}
        </span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 10,
      }}>
        {topViewed.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onView(item)}
            style={{
              background: "rgba(255,255,255,0.8)",
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1px solid rgba(245, 158, 11, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,1)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.8)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: index === 0 ? "#f59e0b" : 
                         index === 1 ? "#9ca3af" : 
                         index === 2 ? "#d97706" : "#e5e7eb",
              color: index < 3 ? "#fff" : "#6b7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}>
              {index + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1f2937",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {item.title}
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 11,
                color: "#6b7280",
                marginTop: 2,
              }}>
                <span>👁️ {item.views || 0} views</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- Main NewsTab Component ----------
const NewsTab = ({
  news,
  loading,
  onEdit,
  onAdd,
  onView,
  onTrash,
  onRestore,
  onDeleteForever,
  onQuickSave,
  filters,
  setFilters,
  bulkAction,
  setBulkAction,
  onApplyBulkAction,
  searchTerm,
  setSearchTerm,
  currentPage,
  setCurrentPage,
  categories,
  itemsPerPage = 10,
  selectedIds = [],
  onToggleSelect = () => {},
  onToggleSelectAll = () => {},
  onDeleteSelected = () => {},
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [quickEditId, setQuickEditId] = useState(null);
  const [quickEditForm, setQuickEditForm] = useState({});
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showTopViewed, setShowTopViewed] = useState(true);

  // Force re-render every second for countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    all: news.length,
    published: news.filter(n => n.status === 'published').length,
    scheduled: news.filter(n => n.status === 'scheduled').length,
    drafts: news.filter(n => n.status === 'draft' || n.status === 'pending').length,
    trash: news.filter(n => n.status === 'trash').length,
  };

  const filteredNews = news.filter(item => {
    if (filters.status === 'published' && item.status !== 'published') return false;
    if (filters.status === 'scheduled' && item.status !== 'scheduled') return false;
    if (filters.status === 'drafts' && item.status !== 'draft' && item.status !== 'pending') return false;
    if (filters.status === 'trash' && item.status !== 'trash') return false;
    if (filters.status === 'all' && item.status === 'trash') return false;
    if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return item.title.toLowerCase().includes(search) ||
             (item.author && item.author.toLowerCase().includes(search));
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / itemsPerPage));
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ============================================================
  // SELECTION HANDLERS
  // ============================================================
  const handleSelectAll = (e) => {
    if (onToggleSelectAll) {
      onToggleSelectAll();
    } else {
      setSelectedItems(e.target.checked ? paginatedNews.map(item => item.id) : []);
    }
  };

  const handleSelectItem = (id) => {
    if (onToggleSelect) {
      onToggleSelect(id);
    } else {
      setSelectedItems(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    }
  };

  const currentSelectedIds = selectedIds.length > 0 ? selectedIds : selectedItems;

  // ============================================================
  // HANDLE DELETE SELECTED
  // ============================================================
  const handleDeleteSelectedClick = () => {
    if (currentSelectedIds.length === 0) {
      Swal.fire("No Selection", "Please select at least one item to delete.", "warning");
      return;
    }

    if (onDeleteSelected) {
      onDeleteSelected();
    } else {
      Swal.fire({
        title: `Delete ${currentSelectedIds.length} selected item(s)?`,
        text: "This action cannot be undone. All selected posts will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        confirmButtonText: `Yes, delete ${currentSelectedIds.length} item(s)`,
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          currentSelectedIds.forEach(id => {
            onDeleteForever(id);
          });
          setSelectedItems([]);
          Swal.fire("Deleted", `${currentSelectedIds.length} item(s) deleted successfully.`, "success");
        }
      });
    }
  };

  // ============================================================
  // BULK ACTION HANDLER
  // ============================================================
  const handleApplyBulkAction = () => {
    const idsToUse = currentSelectedIds.length > 0 ? currentSelectedIds : selectedItems;
    
    if (idsToUse.length === 0) {
      Swal.fire("Warning", "No items selected", "warning");
      return;
    }
    if (!bulkAction) {
      Swal.fire("Warning", "Choose a bulk action first", "warning");
      return;
    }
    
    if (bulkAction === 'delete') {
      handleDeleteSelectedClick();
      return;
    }
    
    onApplyBulkAction(bulkAction, idsToUse);
    setSelectedItems([]);
  };

  const startQuickEdit = (item) => {
    setQuickEditId(item.id);
    setQuickEditForm({
      title: item.title || "",
      category: item.category || "",
      tags: item.tags || "",
      status: item.status || "draft",
      scheduledDate: item.scheduledDate || "",
    });
  };

  const saveQuickEdit = () => {
    onQuickSave(quickEditId, quickEditForm);
    setQuickEditId(null);
  };

  if (loading) return <LoadingSpinner />;

  const allVisibleSelected = paginatedNews.length > 0 && 
    paginatedNews.every(item => currentSelectedIds.includes(item.id));

  return (
    <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24 }}>
      <style>{`
        .wpd-row-actions { opacity: 0; transition: opacity 0.12s; font-size: 12.5px; margin-top: 5px; color: var(--text-secondary); }
        .wpd-row:hover .wpd-row-actions { opacity: 1; }
        .wpd-row-actions button:hover { text-decoration: underline; }
        .wpd-sep { margin: 0 6px; color: var(--border-light); }
        .wpd-thumb { width: 56px; height: 40px; border-radius: 8px; object-fit: cover; display: block; }
        .wpd-thumb-placeholder { width: 56px; height: 40px; border-radius: 8px; background: var(--bg-base); display:flex; align-items:center; justify-content:center; font-size:18px; color: var(--text-secondary); }
        .selected-count-badge { background: var(--primary); color: #fff; border-radius: 20px; padding: 2px 12px; font-size: 13px; font-weight: 600; }
        .delete-selected-btn { background: #dc2626; color: #fff; border: none; padding: 8px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .delete-selected-btn:hover { background: #b91c1c; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); }
        .delete-selected-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .countdown-timer { font-family: monospace; font-size: 13px; }
        .scheduled-badge { background: #dbeafe; color: #2563eb; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; display: inline-block; margin-right: 4px; }
        .publish-now-btn { background: #16a34a; color: #fff; border: none; padding: 2px 12px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .publish-now-btn:hover { background: #059669; transform: scale(1.02); }
        .toggle-top-viewed { background: none; border: none; color: #92400e; cursor: pointer; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 4px; transition: all 0.2s; }
        .toggle-top-viewed:hover { background: rgba(255,255,255,0.5); }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 22 }}>Posts</h3>
        <button
          onClick={onAdd}
          style={{
            background: "var(--primary)", color: "#fff", border: "none",
            padding: "12px 28px", borderRadius: 10, fontSize: 16, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
          }}
        >
          + Add New
        </button>
      </div>

      {/* Stats bar */}
      <div style={{
        display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap",
        padding: "12px 0", borderBottom: "1px solid var(--border-light)",
        alignItems: "center",
      }}>
        {[
          ["all", "All", stats.all],
          ["published", "Published", stats.published],
          ["scheduled", "Scheduled", stats.scheduled],
          ["drafts", "Drafts", stats.drafts],
          ["trash", "Trash", stats.trash],
        ].map(([key, label, count]) => (
          <span
            key={key}
            onClick={() => { setFilters({ ...filters, status: key }); setCurrentPage(1); }}
            style={{
              cursor: "pointer",
              fontWeight: filters.status === key ? 700 : 500,
              color: filters.status === key ? "var(--primary)" : "var(--text-primary)",
              background: key === 'scheduled' && count > 0 ? "#dbeafe" : "transparent",
              padding: key === 'scheduled' && count > 0 ? "2px 12px" : "0",
              borderRadius: key === 'scheduled' && count > 0 ? "20px" : "0",
            }}
          >
            {label} <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>({count})</span>
            {key === 'scheduled' && count > 0 && (
              <span style={{ marginLeft: 6, fontSize: 11 }}>⏳</span>
            )}
          </span>
        ))}
        
        {/* Toggle Top Viewed Button */}
        <button
          onClick={() => setShowTopViewed(!showTopViewed)}
          className="toggle-top-viewed"
          style={{
            marginLeft: "auto",
            background: showTopViewed ? "rgba(255,255,255,0.5)" : "transparent",
          }}
        >
          {showTopViewed ? "👁️ Hide Top Viewed" : "👁️ Show Top Viewed"}
        </button>
      </div>

      {/* Top Viewed News Section */}
      {showTopViewed && <TopViewedNews news={news} onView={onView} />}

      {/* Filter bar */}
      <div style={{ 
        display: "flex", 
        gap: 12, 
        marginBottom: 16, 
        flexWrap: "wrap", 
        alignItems: "center" 
      }}>
        <select
          value={bulkAction}
          onChange={(e) => setBulkAction(e.target.value)}
          style={{ 
            padding: "8px 12px", 
            borderRadius: 8, 
            border: "1px solid var(--border-light)", 
            background: "#fff", 
            color: "var(--text-primary)", 
            fontSize: 14 
          }}
        >
          <option value="">Bulk Actions</option>
          <option value="publish">Publish</option>
          <option value="draft">Move to Draft</option>
          <option value="trash">Move to Trash</option>
          {filters.status === 'trash' && <option value="restore">Restore</option>}
          {filters.status === 'trash' && <option value="delete">Delete Permanently</option>}
        </select>

        <button
          onClick={handleApplyBulkAction}
          style={{ 
            padding: "8px 20px", 
            borderRadius: 8, 
            border: "1px solid var(--border-light)", 
            background: "#fff", 
            cursor: "pointer", 
            fontSize: 14 
          }}
        >
          Apply
        </button>

        {currentSelectedIds.length > 0 && (
          <button
            onClick={handleDeleteSelectedClick}
            className="delete-selected-btn"
            style={{
              background: "#dc2626",
              color: "#fff",
              border: "none",
              padding: "8px 20px",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#b91c1c"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#dc2626"}
          >
            <span>🗑️</span>
            Delete Selected
            <span style={{
              background: "rgba(255,255,255,0.2)",
              padding: "2px 10px",
              borderRadius: 12,
              fontSize: 12,
            }}>
              {currentSelectedIds.length}
            </span>
          </button>
        )}

        <select
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          style={{ 
            padding: "8px 12px", 
            borderRadius: 8, 
            border: "1px solid var(--border-light)", 
            background: "#fff", 
            color: "var(--text-primary)", 
            fontSize: 14 
          }}
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          style={{ 
            padding: "8px 12px", 
            borderRadius: 8, 
            border: "1px solid var(--border-light)", 
            background: "#fff", 
            color: "var(--text-primary)", 
            fontSize: 14 
          }}
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.name} value={c.name}>{c.name} ({c.count})</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Type here to search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            flex: 1, 
            minWidth: 200, 
            padding: "8px 16px", 
            borderRadius: 8, 
            border: "1px solid var(--border-light)", 
            background: "#fff", 
            color: "var(--text-primary)", 
            fontSize: 14 
          }}
        />
      </div>

      {/* Selection Info Bar */}
      {currentSelectedIds.length > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "8px 16px",
          background: "var(--primary-soft)",
          borderRadius: 8,
          marginBottom: 12,
        }}>
          <span style={{ fontWeight: 600, color: "var(--primary)" }}>
            {currentSelectedIds.length} item(s) selected
          </span>
          <button
            onClick={() => {
              if (onToggleSelectAll) {
                onToggleSelectAll();
              } else {
                setSelectedItems([]);
              }
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Table */}
      {filteredNews.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", fontSize: 18, textAlign: "center", padding: "40px 0" }}>
          No news found.
        </p>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--bg-base)", textAlign: "left", borderBottom: "2px solid var(--border-light)" }}>
                  <th style={{ padding: "12px 16px", width: 40 }}>
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={allVisibleSelected}
                    />
                  </th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>Image</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>Title</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>Author</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>Category</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>Tags</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>Status</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>Date</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>Views</th>
                </tr>
              </thead>
              <tbody>
                {paginatedNews.map((item) => {
                  if (quickEditId === item.id) {
                    return (
                      <tr key={`qe-${item.id}`} style={{ background: "var(--primary-soft)" }}>
                        <td colSpan={9} style={{ padding: 18 }}>
                          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
                            <div style={{ flex: "2 1 220px" }}>
                              <label style={qeLabelStyle}>Title</label>
                              <input value={quickEditForm.title}
                                onChange={(e) => setQuickEditForm({ ...quickEditForm, title: e.target.value })} />
                            </div>
                            <div style={{ flex: "1 1 150px" }}>
                              <label style={qeLabelStyle}>Category</label>
                              <select value={quickEditForm.category}
                                onChange={(e) => setQuickEditForm({ ...quickEditForm, category: e.target.value })}>
                                <option value="">— None —</option>
                                {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                              </select>
                            </div>
                            <div style={{ flex: "1 1 150px" }}>
                              <label style={qeLabelStyle}>Tags</label>
                              <input value={quickEditForm.tags}
                                onChange={(e) => setQuickEditForm({ ...quickEditForm, tags: e.target.value })} />
                            </div>
                            <div style={{ flex: "1 1 140px" }}>
                              <label style={qeLabelStyle}>Status</label>
                              <select value={quickEditForm.status}
                                onChange={(e) => setQuickEditForm({ ...quickEditForm, status: e.target.value })}>
                                <option value="draft">Draft</option>
                                <option value="pending">Pending Review</option>
                                <option value="published">Published</option>
                                <option value="scheduled">Scheduled</option>
                              </select>
                            </div>
                            {quickEditForm.status === 'scheduled' && (
                              <div style={{ flex: "1 1 180px" }}>
                                <label style={qeLabelStyle}>Schedule Date/Time</label>
                                <input 
                                  type="datetime-local"
                                  value={quickEditForm.scheduledDate ? quickEditForm.scheduledDate.slice(0, 16) : ''}
                                  onChange={(e) => setQuickEditForm({ ...quickEditForm, scheduledDate: e.target.value })}
                                />
                              </div>
                            )}
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={saveQuickEdit} style={{
                                background: "var(--primary)", color: "#fff", border: "none",
                                padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer",
                              }}>Update</button>
                              <button onClick={() => setQuickEditId(null)} style={{
                                background: "#fff", border: "1px solid var(--border-light)",
                                padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer",
                              }}>Cancel</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  const isSelected = currentSelectedIds.includes(item.id);
                  const isScheduled = item.status === 'scheduled';

                  return (
                    <tr key={item.id} className="wpd-row" style={{
                      borderBottom: "1px solid var(--border-light)",
                      background: isSelected ? "var(--primary-soft)" : "transparent",
                    }}>
                      <td style={{ padding: "12px 16px" }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleSelectItem(item.id)} 
                        />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {item.image
                          ? <img src={item.image} alt="" className="wpd-thumb" />
                          : <div className="wpd-thumb-placeholder">🖼️</div>}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                        <div>{item.title}</div>
                        {item.status === 'trash' ? (
                          <span className="wpd-row-actions">
                            <button style={linkBtnStyle} onClick={() => onRestore(item.id)}>Restore</button>
                            <span className="wpd-sep">|</span>
                            <button style={{ ...linkBtnStyle, color: "var(--error)" }} onClick={() => onDeleteForever(item.id)}>Delete Permanently</button>
                          </span>
                        ) : (
                          <span className="wpd-row-actions">
                            <button style={{ ...linkBtnStyle, color: "var(--primary)" }} onClick={() => onEdit(item)}>Edit</button>
                            <span className="wpd-sep">|</span>
                            <button style={linkBtnStyle} onClick={() => startQuickEdit(item)}>Quick Edit</button>
                            <span className="wpd-sep">|</span>
                            <button style={{ ...linkBtnStyle, color: "var(--error)" }} onClick={() => onTrash(item.id)}>Trash</button>
                            <span className="wpd-sep">|</span>
                            <button style={linkBtnStyle} onClick={() => onView(item)}>View</button>
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>{item.author || "newsdesk"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: "#eef2ff", color: "#4f46e5", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>
                          {item.category || "Uncategorized"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{item.tags || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <StatusBadge status={item.status} />
                        {isScheduled && (
                          <span style={{ 
                            display: "block", 
                            fontSize: 10, 
                            color: "#2563eb", 
                            marginTop: 4,
                            fontFamily: "monospace",
                          }}>
                            ⏰ Scheduled
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: 13 }}>
                        {isScheduled && item.scheduledDate ? (
                          <div>
                            <div style={{ fontWeight: 600, color: "#2563eb" }}>
                              📅 {formatDate(item.scheduledDate)}
                            </div>
                            <div className="countdown-timer" style={{ marginTop: 4 }}>
                              <CountdownTimer 
                                scheduledDate={item.scheduledDate}
                                onPublishNow={() => {
                                  onQuickSave(item.id, {
                                    status: "published",
                                    publishedDate: new Date().toISOString(),
                                    scheduledDate: null
                                  });
                                  Swal.fire({
                                    icon: "success",
                                    title: "Published!",
                                    text: `"${item.title}" has been published successfully.`,
                                    timer: 2000,
                                    showConfirmButton: false,
                                  });
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          formatDate(item.publishedDate || item.createdAt || item.date)
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                        <span style={{
                          background: (item.views || 0) > 100 ? "#fef3c7" : "transparent",
                          padding: (item.views || 0) > 100 ? "2px 8px" : "0",
                          borderRadius: 4,
                          display: "inline-block",
                        }}>
                          👁️ {item.views || 0}
                          {(item.views || 0) > 100 && (
                            <span style={{ marginLeft: 4, fontSize: 11, color: "#d97706" }}>🔥</span>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid var(--border-light)", marginTop: 16 }}>
              <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredNews.length)} of {filteredNews.length} items
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                  style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border-light)", background: currentPage === 1 ? "#f3f4f6" : "#fff", color: currentPage === 1 ? "var(--text-secondary)" : "var(--text-primary)", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}>
                  ← Prev
                </button>
                <span style={{ padding: "6px 14px", borderRadius: 6, background: "var(--primary)", color: "#fff" }}>{currentPage}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                  style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border-light)", background: currentPage === totalPages ? "#f3f4f6" : "#fff", color: currentPage === totalPages ? "var(--text-secondary)" : "var(--text-primary)", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NewsTab;