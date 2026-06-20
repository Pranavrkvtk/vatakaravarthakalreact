import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// ---------- Sub‑components (you can split into separate files later) ----------
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

// ---------- TABS ----------
const DashboardTab = ({ kpis }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
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

const NewsTab = ({ news, loading, onEdit, onDelete, onAdd }) => {
  if (loading) return <LoadingSpinner />;
  return (
    <div style={{ background: "var(--surface)", borderRadius: 16, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>All News Articles</h3>
        <button onClick={onAdd} style={{
          background: "var(--primary)", color: "#fff", border: "none",
          padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer"
        }}>+ Add News</button>
      </div>
      {news.length === 0 ? <p style={{ color: "var(--text-secondary)" }}>No news yet.</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg-base)", textAlign: "left" }}>
              <th style={{ padding: "10px 12px" }}>ID</th>
              <th style={{ padding: "10px 12px" }}>Title</th>
              <th style={{ padding: "10px 12px" }}>Category</th>
              <th style={{ padding: "10px 12px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {news.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                <td style={{ padding: "10px 12px" }}>{item.id}</td>
                <td style={{ padding: "10px 12px" }}>{item.title}</td>
                <td style={{ padding: "10px 12px" }}>{item.category || "General"}</td>
                <td style={{ padding: "10px 12px" }}>
                  <button onClick={() => onEdit(item)} style={{ color: "var(--primary)", background: "none", border: "none", cursor: "pointer", marginRight: 12 }}>✏️</button>
                  <button onClick={() => onDelete(item.id)} style={{ color: "var(--error)", background: "none", border: "none", cursor: "pointer" }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ---------- MAIN ADMIN DASHBOARD ----------
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Data states
  const [news, setNews] = useState([]);
  const [stats, setStats] = useState({ totalNews: 0, totalCategories: 0, totalAdmins: 1 });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);

  // Resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch news
  const fetchNews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8080/api/news", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNews(res.data);
      setStats(prev => ({ ...prev, totalNews: res.data.length }));
    } catch (err) {
      setError("Failed to load news");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats (total categories etc.)
  const fetchStats = async () => {
    // In a real app, you'd have a /api/stats endpoint.
    // For now, we count unique categories from news.
    const cats = new Set(news.map(n => n.category).filter(Boolean));
    setStats(prev => ({ ...prev, totalCategories: cats.size }));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [news]);

  // CRUD operations
  const handleAddNews = () => setIsAddModalOpen(true);
  const handleEditNews = (item) => { setEditingNews(item); setIsEditModalOpen(true); };

  const handleDeleteNews = async (id) => {
    const result = await Swal.fire({
      title: "Delete News?",
      text: "This action cannot be undone.",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete"
    });
    if (!result.isConfirmed) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/news/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchNews();
      Swal.fire("Deleted!", "", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to delete", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // Navigation items
  const navItems = [
    { icon: "📊", label: "Dashboard", id: "dashboard" },
    { icon: "📰", label: "News", id: "news" },
    { icon: "📂", label: "Categories", id: "categories" },
    { icon: "🎬", label: "Media", id: "media" },
  ];

  const kpis = [
    { label: "Total News", value: stats.totalNews, icon: "📰", iconBg: "#eef2ff" },
    { label: "Categories", value: stats.totalCategories, icon: "📂", iconBg: "#ccfbf1" },
    { label: "Admins", value: stats.totalAdmins, icon: "👤", iconBg: "#fef3c7" },
  ];

  const renderContent = () => {
    if (loading && activeTab !== "dashboard") return <LoadingSpinner />;
    if (error) return <div style={{ color: "var(--error)" }}>⚠️ {error}</div>;

    switch (activeTab) {
      case "dashboard":
        return <DashboardTab kpis={kpis} />;
      case "news":
        return (
          <NewsTab
            news={news}
            loading={loading}
            onAdd={handleAddNews}
            onEdit={handleEditNews}
            onDelete={handleDeleteNews}
          />
        );
      case "categories":
        return <CategoriesTab categories={Array.from(new Set(news.map(n => n.category).filter(Boolean)))} />;
      case "media":
        return <MediaTab />;
      default:
        return <div>Unknown tab</div>;
    }
  };

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
            width: sidebarOpen ? 260 : 0,
            background: "var(--surface)",
            borderRight: sidebarOpen ? "1px solid var(--border-light)" : "none",
            display: "flex", flexDirection: "column",
            padding: sidebarOpen ? "28px 0" : "0",
            position: "sticky", top: 0, height: "100vh",
            overflow: "hidden", transition: "width 0.3s",
            flexShrink: 0,
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
            <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 28 }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            {!isMobile && <DateTimeWidget isMobile={false} currentTime={currentTime} />}
          </div>
          {renderContent()}
        </main>

        {isMobile && (
          <MobileBottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            items={navItems}
          />
        )}
      </div>

      {/* Add/Edit Modals (simple) */}
      <NewsModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); setEditingNews(null); }}
        news={editingNews}
        onSave={async (data) => {
          try {
            const token = localStorage.getItem("token");
            if (editingNews) {
              await axios.put(`http://localhost:8080/api/news/${editingNews.id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
              });
            } else {
              await axios.post("http://localhost:8080/api/news", data, {
                headers: { Authorization: `Bearer ${token}` }
              });
            }
            await fetchNews();
            Swal.fire("Saved!", "", "success");
          } catch (err) {
            Swal.fire("Error", "Failed to save news", "error");
          }
        }}
      />
    </>
  );
}

// ---------- Simple Modal for News ----------
function NewsModal({ isOpen, onClose, news, onSave }) {
  const [form, setForm] = useState({ title: "", subtitle: "", content: "", category: "", image: "" });

  useEffect(() => {
    if (news) setForm(news);
    else setForm({ title: "", subtitle: "", content: "", category: "", image: "" });
  }, [news]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24, maxWidth: 500, width: "100%" }}>
        <h3 style={{ marginTop: 0 }}>{news ? "Edit News" : "Add News"}</h3>
        <form onSubmit={handleSubmit}>
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <input placeholder="Subtitle" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
          <textarea placeholder="Content" rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
          <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <input placeholder="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button type="submit" style={{ background: "var(--primary)", color: "#fff", border: "none", padding: "8px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Save</button>
            <button type="button" onClick={onClose} style={{ background: "transparent", border: "1px solid var(--border-light)", padding: "8px 24px", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Categories Tab ----------
function CategoriesTab({ categories }) {
  return (
    <div style={{ background: "var(--surface)", borderRadius: 16, padding: 20 }}>
      <h3>Categories ({categories.length})</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {categories.map(cat => <li key={cat} style={{ padding: "8px 0", borderBottom: "1px solid var(--border-light)" }}>{cat}</li>)}
      </ul>
    </div>
  );
}

// ---------- Media Tab (placeholder) ----------
function MediaTab() {
  return (
    <div style={{ background: "var(--surface)", borderRadius: 16, padding: 20 }}>
      <h3>Media Manager</h3>
      <p style={{ color: "var(--text-secondary)" }}>Upload banners, images, or manage video for the home page (future feature).</p>
    </div>
  );
}