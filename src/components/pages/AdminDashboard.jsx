import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import MediaTab from "./MediaTab";
import NewsModal from "./NewsModal";
import NewsTab from "./NewsTab";
import AdsTab from "./AdsTab";

// ---------- Loading Spinner ----------
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

// ---------- NavItem Component ----------
const NavItem = ({ icon, label, active, onClick, badge }) => (
  <div onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 20px", margin: "0 8px 4px", borderRadius: 12,
    cursor: "pointer", background: active ? "var(--primary-soft)" : "transparent",
    color: active ? "var(--primary)" : "var(--text-secondary)",
    fontWeight: active ? 600 : 500, transition: "all 0.2s",
  }}>
    <span style={{ fontSize: 18 }}>{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {badge > 0 && <span style={{
      background: "var(--primary)", color: "#fff", borderRadius: 20,
      padding: "0 10px", fontSize: 12, fontWeight: 600
    }}>{badge}</span>}
  </div>
);

// ---------- Mobile Bottom Navigation ----------
const MobileBottomNav = ({ activeTab, onTabChange, onLogout, items }) => (
  <div style={{
    position: "fixed", bottom: 0, left: 0, right: 0,
    background: "var(--surface)", borderTop: "1px solid var(--border-light)",
    display: "flex", justifyContent: "space-around", padding: "8px 0",
    zIndex: 100,
  }}>
    {items.slice(0, 4).map(item => (
      <button key={item.id} onClick={() => onTabChange(item.id)} style={{
        background: "none", border: "none", padding: "4px 8px",
        display: "flex", flexDirection: "column", alignItems: "center",
        color: activeTab === item.id ? "var(--primary)" : "var(--text-secondary)",
        fontSize: 12, cursor: "pointer",
      }}>
        <span style={{ fontSize: 20 }}>{item.icon}</span>
        <span>{item.label}</span>
      </button>
    ))}
    <button onClick={onLogout} style={{
      background: "none", border: "none",
      display: "flex", flexDirection: "column", alignItems: "center",
      color: "var(--error)", fontSize: 12, cursor: "pointer",
    }}>
      <span style={{ fontSize: 20 }}>🚪</span>
      <span>Logout</span>
    </button>
  </div>
);

// ---------- DateTime Widget ----------
const DateTimeWidget = ({ isMobile, currentTime }) => (
  <div style={{
    background: "var(--surface)", padding: "6px 14px", borderRadius: 30,
    border: "1px solid var(--border-light)",
    fontSize: isMobile ? 11 : 13, color: "var(--text-secondary)",
    display: "flex", alignItems: "center", gap: 8,
  }}>
    <span>🕒</span> {currentTime}
  </div>
);

// ---------- Dashboard Tab with KPIs ----------
const DashboardTab = ({ stats }) => {
  const kpis = [
    { label: "Total Posts", value: stats.total, icon: "📄", iconBg: "#eef2ff", color: "#4f46e5" },
    { label: "Published", value: stats.published, icon: "✅", iconBg: "#dcfce7", color: "#16a34a" },
    { label: "Scheduled", value: stats.scheduled, icon: "🗓️", iconBg: "#dbeafe", color: "#2563eb" },
    { label: "Drafts", value: stats.drafts, icon: "✏️", iconBg: "#fef3c7", color: "#d97706" },
    { label: "Trash", value: stats.trash, icon: "🗑️", iconBg: "#fee2e2", color: "#dc2626" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
      {kpis.map((k, i) => (
        <div key={i} style={{
          background: "var(--surface)", borderRadius: 16, padding: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid var(--border-light)",
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: k.iconBg, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 24,
          }}>{k.icon}</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{k.value}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{k.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------- RichTextEditor (shared) ----------
const rteBtnStyle = {
  background: "#fff", border: "1px solid var(--border-light)", borderRadius: 6,
  width: 30, height: 30, cursor: "pointer", fontSize: 13, fontWeight: 700,
  color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center",
};

function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const exec = (cmd, arg = null) => {
    document.execCommand(cmd, false, arg);
    handleInput();
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  };

  const Btn = ({ children, onClick, title }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={rteBtnStyle}
    >
      {children}
    </button>
  );

  return (
    <div style={{ border: "1px solid var(--border-light)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{
        display: "flex", gap: 6, padding: 8, background: "var(--bg-base)",
        borderBottom: "1px solid var(--border-light)", flexWrap: "wrap",
      }}>
        <Btn title="Bold" onClick={() => exec("bold")}>B</Btn>
        <Btn title="Italic" onClick={() => exec("italic")}><em>I</em></Btn>
        <Btn title="Underline" onClick={() => exec("underline")}><u>U</u></Btn>
        <Btn title="Heading" onClick={() => exec("formatBlock", "<h2>")}>H2</Btn>
        <Btn title="Paragraph" onClick={() => exec("formatBlock", "<p>")}>P</Btn>
        <Btn title="Bullet list" onClick={() => exec("insertUnorderedList")}>•≡</Btn>
        <Btn title="Numbered list" onClick={() => exec("insertOrderedList")}>1≡</Btn>
        <Btn title="Quote" onClick={() => exec("formatBlock", "<blockquote>")}>❝</Btn>
        <Btn title="Insert link" onClick={insertLink}>🔗</Btn>
        <Btn title="Clear formatting" onClick={() => exec("removeFormat")}>⨯</Btn>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        style={{
          minHeight: 220, padding: "14px 16px", fontSize: 15, lineHeight: 1.6,
          outline: "none", color: "#0f172a", background: "#fff", overflowY: "auto",
        }}
      />
    </div>
  );
}

// ---------- Status badge (for posts) ----------
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

const qeLabelStyle = { display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 };

// ---------- Categories Tab ----------
function CategoriesTab({ categories, onAdd, onRename, onDelete }) {
  const [newCat, setNewCat] = useState("");
  const [editingCat, setEditingCat] = useState(null);
  const [editValue, setEditValue] = useState("");

  const submitAdd = () => {
    if (!newCat.trim()) return;
    onAdd(newCat);
    setNewCat("");
  };

  const startEdit = (name) => { setEditingCat(name); setEditValue(name); };
  const saveEdit = () => {
    if (editValue.trim() && editValue.trim() !== editingCat) onRename(editingCat, editValue.trim());
    setEditingCat(null);
  };

  return (
    <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24 }}>
      <h3 style={{ marginTop: 0, marginBottom: 20 }}>Categories ({categories.length})</h3>

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input
          placeholder="New category name"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submitAdd(); }}
          style={{ flex: "0 1 320px", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-light)" }}
        />
        <button onClick={submitAdd} style={{
          background: "var(--primary)", color: "#fff", border: "none",
          padding: "10px 22px", borderRadius: 8, fontWeight: 700, cursor: "pointer",
        }}>
          + Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>No categories yet. Add one above.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border-light)" }}>
              <th style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>Name</th>
              <th style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>Posts</th>
              <th style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.name} style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "10px 14px" }}>
                  {editingCat === cat.name ? (
                    <input autoFocus value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingCat(null); }}
                      style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border-light)" }}
                    />
                  ) : cat.name}
                </td>
                <td style={{ padding: "10px 14px" }}>
                  <span style={{ background: "#eef2ff", color: "#4f46e5", padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                    {cat.count}
                  </span>
                </td>
                <td style={{ padding: "10px 14px" }}>
                  {editingCat === cat.name ? (
                    <>
                      <button style={{ ...linkBtnStyle, color: "var(--primary)", fontWeight: 600 }} onClick={saveEdit}>Save</button>
                      <span className="wpd-sep" style={{ margin: "0 8px", color: "var(--border-light)" }}>|</span>
                      <button style={linkBtnStyle} onClick={() => setEditingCat(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button style={{ ...linkBtnStyle, color: "var(--primary)" }} onClick={() => startEdit(cat.name)}>Rename</button>
                      <span style={{ margin: "0 8px", color: "var(--border-light)" }}>|</span>
                      <button style={{ ...linkBtnStyle, color: "var(--error)" }} onClick={() => onDelete(cat.name)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ---------- Preview Modal ----------
function PreviewModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, maxWidth: 720, width: "100%",
        maxHeight: "88vh", overflowY: "auto",
      }}>
        {item.image && (
          <img src={item.image} alt={item.title} style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: "16px 16px 0 0" }} />
        )}
        <div style={{ padding: "28px 36px 36px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 28, background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--text-secondary)" }}>✕</button>
          <span style={{ background: "#eef2ff", color: "#4f46e5", padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
            {item.category || "Uncategorized"}
          </span>
          <h1 style={{ fontSize: 28, margin: "14px 0 6px", color: "#0f172a" }}>{item.title}</h1>
          {item.subtitle && <p style={{ fontSize: 17, color: "var(--text-secondary)", marginTop: 0 }}>{item.subtitle}</p>}
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            By {item.author || "newsdesk"} · {item.publishedDate || item.createdAt || ""} · <StatusBadge status={item.status} />
          </p>
          <div
            style={{ fontSize: 16, lineHeight: 1.7, color: "#1e293b", marginTop: 20 }}
            dangerouslySetInnerHTML={{ __html: item.content || '<p style="color:#94a3b8">No content yet.</p>' }}
          />
        </div>
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
  const [stats, setStats] = useState({ total: 0, published: 0, scheduled: 0, drafts: 0, trash: 0 });

  // ---- Ads state ----
  const [ads, setAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(false);

  // ---- Modals ----
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  const [customCategories, setCustomCategories] = useState([]);

  const [filters, setFilters] = useState({ status: 'all', category: 'all', date: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkAction, setBulkAction] = useState('');

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
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ---------- Auto-publish scheduled posts ----------
  useEffect(() => {
    const timer = setInterval(() => {
      setNews((prev) => prev.map((n) => (
        n.status === 'scheduled' && n.scheduledDate && new Date(n.scheduledDate) <= new Date()
          ? { ...n, status: 'published' }
          : n
      )));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // ---------- Fetch news ----------
  const fetchNews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8080/api/news", { headers: { Authorization: `Bearer ${token}` } });
      setNews(res.data);
    } catch (err) {
      setError("Failed to load news");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  // ---------- Recompute stats ----------
  useEffect(() => {
    setStats({
      total: news.length,
      published: news.filter(n => n.status === 'published').length,
      scheduled: news.filter(n => n.status === 'scheduled').length,
      drafts: news.filter(n => n.status === 'draft' || n.status === 'pending').length,
      trash: news.filter(n => n.status === 'trash').length,
    });
  }, [news]);

  // ---------- Categories ----------
  const allCategories = useMemo(() => {
    const counts = {};
    news.forEach((n) => {
      const cat = n.category || "Uncategorized";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    customCategories.forEach((c) => { if (!(c in counts)) counts[c] = 0; });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [news, customCategories]);

  // ---------- Generic item updater for news ----------
  const updateNewsItem = async (id, changes) => {
    const current = news.find((n) => n.id === id);
    const updated = { ...current, ...changes };
    setNews((prev) => prev.map((n) => (n.id === id ? updated : n)));
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8080/api/news/${id}`, updated, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.warn("Backend sync skipped:", err?.message);
    }
  };

  // ---------- News CRUD ----------
  const handleAddNews = () => setIsAddModalOpen(true);
  const handleEditNews = (item) => { setEditingNews(item); setIsEditModalOpen(true); };
  const handleViewNews = (item) => setPreviewItem(item);
  const handleQuickSave = (id, partial) => updateNewsItem(id, partial);

  const handleTrashNews = async (id) => {
    const result = await Swal.fire({
      title: "Move to Trash?",
      text: "You can restore this post later from the Trash tab.",
      icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Move to Trash",
    });
    if (!result.isConfirmed) return;
    await updateNewsItem(id, { status: "trash" });
    Swal.fire("Moved to Trash", "", "success");
  };

  const handleRestoreNews = async (id) => {
    await updateNewsItem(id, { status: "draft" });
    Swal.fire("Restored", "Post moved back to Drafts.", "success");
  };

  const handleDeleteForever = async (id) => {
    const result = await Swal.fire({
      title: "Delete Permanently?",
      text: "This action cannot be undone.",
      icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Delete Forever",
    });
    if (!result.isConfirmed) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/news/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.warn("Backend delete skipped:", err?.message);
    }
    setNews((prev) => prev.filter((n) => n.id !== id));
    Swal.fire("Deleted", "", "success");
  };

  // ---------- Bulk action ----------
  const handleBulkAction = async (action, selectedIds) => {
    if (!action || selectedIds.length === 0) return;
    const labels = { publish: "publish", draft: "move to draft", trash: "move to trash", restore: "restore", delete: "permanently delete" };
    const result = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} selected items?`,
      text: `This will ${labels[action] || action} ${selectedIds.length} selected item(s).`,
      icon: "warning", showCancelButton: true, confirmButtonColor: "#4f46e5", confirmButtonText: "Yes",
    });
    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:8080/api/news/bulk`, { ids: selectedIds, action }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.warn("Backend bulk sync skipped:", err?.message);
    }

    if (action === "delete") {
      setNews((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    } else {
      const statusMap = { publish: "published", draft: "draft", trash: "trash", restore: "draft" };
      setNews((prev) => prev.map((n) => (selectedIds.includes(n.id) ? { ...n, status: statusMap[action] || n.status } : n)));
    }
    Swal.fire("Done", "", "success");
  };

  // ---------- Category CRUD ----------
  const handleAddCategory = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (allCategories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      Swal.fire("Already exists", `"${trimmed}" is already a category.`, "warning");
      return;
    }
    setCustomCategories((prev) => [...prev, trimmed]);
  };

  const handleRenameCategory = async (oldName, newName) => {
    setNews((prev) => prev.map((n) => (n.category === oldName ? { ...n, category: newName } : n)));
    setCustomCategories((prev) => prev.map((c) => (c === oldName ? newName : c)));
    try {
      const token = localStorage.getItem("token");
      const affected = news.filter((n) => n.category === oldName);
      await Promise.all(affected.map((n) =>
        axios.put(`http://localhost:8080/api/news/${n.id}`, { ...n, category: newName }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
      ));
    } catch { /* frontend-only fallback already applied */ }
  };

  const handleDeleteCategory = async (name) => {
    const result = await Swal.fire({
      title: `Delete "${name}"?`,
      text: "Posts in this category will be set to Uncategorized.",
      icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;
    setNews((prev) => prev.map((n) => (n.category === name ? { ...n, category: "" } : n)));
    setCustomCategories((prev) => prev.filter((c) => c !== name));
    try {
      const token = localStorage.getItem("token");
      const affected = news.filter((n) => n.category === name);
      await Promise.all(affected.map((n) =>
        axios.put(`http://localhost:8080/api/news/${n.id}`, { ...n, category: "" }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
      ));
    } catch { /* frontend-only fallback already applied */ }
    Swal.fire("Deleted", "", "success");
  };

  // ---------- Ads CRUD (localStorage) ----------
  const fetchAds = () => {
    setAdsLoading(true);
    try {
      const stored = localStorage.getItem("ads");
      setAds(stored ? JSON.parse(stored) : []);
    } catch (e) {
      setAds([]);
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

  const handleAddAd = (data) => {
    const newAd = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
    setAds([newAd, ...ads]);
  };

  const handleEditAd = (id, data) => {
    setAds(ads.map(ad => (ad.id === id ? { ...ad, ...data } : ad)));
  };

  const handleDeleteAd = (id) => {
    setAds(ads.filter(ad => ad.id !== id));
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
        return <DashboardTab stats={stats} />;
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
            categories={allCategories}
          />
        );
      case "categories":
        return (
          <CategoriesTab
            categories={allCategories}
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
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)", paddingBottom: isMobile ? 70 : 0 }}>
        {/* Sidebar */}
        {!isMobile && (
          <nav style={{
            width: sidebarOpen ? 260 : 0, background: "var(--surface)",
            borderRight: sidebarOpen ? "1px solid var(--border-light)" : "none",
            display: "flex", flexDirection: "column",
            padding: sidebarOpen ? "28px 0" : "0",
            position: "sticky", top: 0, height: "100vh",
            overflow: "hidden", transition: "width 0.3s", flexShrink: 0,
          }}>
            {sidebarOpen && (
              <>
                <div style={{ padding: "0 20px", marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>📰</span>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>News Admin</span>
                  <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>✕</button>
                </div>
                {navItems.map(item => (
                  <NavItem key={item.id} {...item} active={activeTab === item.id} onClick={() => setActiveTab(item.id)} />
                ))}
                <div style={{ flex: 1 }} />
                <button onClick={handleLogout} style={{
                  margin: "0 16px 20px", padding: "12px", borderRadius: 12,
                  border: "1px solid var(--border-light)", background: "var(--surface)",
                  cursor: "pointer", color: "var(--error)", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 10,
                }}>🚪 Logout</button>
              </>
            )}
          </nav>
        )}

        {/* Mobile Header */}
        {isMobile && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0,
            background: "var(--surface)", padding: "12px 16px",
            display: "flex", justifyContent: "space-between",
            borderBottom: "1px solid var(--border-light)", zIndex: 99,
          }}>
            <span style={{ fontWeight: 700 }}>📰 News Admin</span>
            <DateTimeWidget isMobile currentTime={currentTime} />
          </div>
        )}

        {/* Main */}
        <main style={{ flex: 1, padding: isMobile ? "70px 16px 20px" : "32px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: 12, marginBottom: 24 }}>
            {!isMobile && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", padding: "4px 8px", marginRight: 12 }}>
                {sidebarOpen ? "◀" : "☰"}
              </button>
            )}
            <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 28 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            {!isMobile && <DateTimeWidget isMobile={false} currentTime={currentTime} />}
          </div>
          {renderContent()}
        </main>

        {/* Mobile Bottom Nav */}
        {isMobile && (
          <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} items={navItems} />
        )}
      </div>

      {/* News Modal */}
      <NewsModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setEditingNews(null); }}
        news={editingNews}
        categories={allCategories}
        onAddCategory={handleAddCategory}
        onSave={async (data) => {
          try {
            const token = localStorage.getItem("token");
            if (editingNews) {
              await axios.put(`http://localhost:8080/api/news/${editingNews.id}`, data, { headers: { Authorization: `Bearer ${token}` } });
            } else {
              await axios.post("http://localhost:8080/api/news", data, { headers: { Authorization: `Bearer ${token}` } });
            }
            await fetchNews();
          } catch (err) {
            // Frontend-only fallback
            setNews((prev) => editingNews
              ? prev.map((n) => (n.id === editingNews.id ? { ...n, ...data } : n))
              : [...prev, { ...data, id: Date.now(), views: 0, createdAt: new Date().toLocaleDateString() }]);
          }
          Swal.fire("Saved!", "", "success");
        }}
      />

      {/* Preview Modal */}
      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </>
  );
}