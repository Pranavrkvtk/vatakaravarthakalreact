import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import MediaTab from "./MediaTab";
import NewsModal from "./NewsModal"
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

// ---------- Lightweight Rich Text Editor (no extra dependencies) ----------
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
    // Only run on mount of this instance (NewsModal remounts the editor per post)
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

// ---------- Enhanced News Tab with WordPress-like UI ----------
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
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [quickEditId, setQuickEditId] = useState(null);
  const [quickEditForm, setQuickEditForm] = useState({});

  // Calculate statistics
  const stats = {
    all: news.length,
    published: news.filter(n => n.status === 'published').length,
    scheduled: news.filter(n => n.status === 'scheduled').length,
    drafts: news.filter(n => n.status === 'draft' || n.status === 'pending').length,
    trash: news.filter(n => n.status === 'trash').length,
  };

  // Filter news based on status, category, and search
  const filteredNews = news.filter(item => {
    if (filters.status === 'published' && item.status !== 'published') return false;
    if (filters.status === 'scheduled' && item.status !== 'scheduled') return false;
    if (filters.status === 'drafts' && item.status !== 'draft' && item.status !== 'pending') return false;
    if (filters.status === 'trash' && item.status !== 'trash') return false;
    if (filters.status === 'all' && item.status === 'trash') return false; // trash hidden unless explicitly viewing it

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

  const handleSelectAll = (e) => {
    setSelectedItems(e.target.checked ? paginatedNews.map(item => item.id) : []);
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const startQuickEdit = (item) => {
    setQuickEditId(item.id);
    setQuickEditForm({
      title: item.title || "",
      category: item.category || "",
      tags: item.tags || "",
      status: item.status || "draft",
    });
  };

  const saveQuickEdit = () => {
    onQuickSave(quickEditId, quickEditForm);
    setQuickEditId(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24 }}>
      <style>{`
        .wpd-row-actions { opacity: 0; transition: opacity 0.12s; font-size: 12.5px; margin-top: 5px; color: var(--text-secondary); }
        .wpd-row:hover .wpd-row-actions { opacity: 1; }
        .wpd-row-actions button:hover { text-decoration: underline; }
        .wpd-sep { margin: 0 6px; color: var(--border-light); }
        .wpd-thumb { width: 56px; height: 40px; border-radius: 8px; object-fit: cover; display: block; }
        .wpd-thumb-placeholder { width: 56px; height: 40px; border-radius: 8px; background: var(--bg-base); display:flex; align-items:center; justify-content:center; font-size:18px; color: var(--text-secondary); }
      `}</style>

      {/* Header with Add button */}
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

      {/* Statistics Bar */}
      <div style={{
        display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap",
        padding: "12px 0", borderBottom: "1px solid var(--border-light)",
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
            }}
          >
            {label} <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>({count})</span>
          </span>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={bulkAction}
          onChange={(e) => setBulkAction(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-light)", background: "#fff", color: "var(--text-primary)", fontSize: 14 }}
        >
          <option value="">Bulk Actions</option>
          <option value="publish">Publish</option>
          <option value="draft">Move to Draft</option>
          <option value="trash">Move to Trash</option>
          {filters.status === 'trash' && <option value="restore">Restore</option>}
          {filters.status === 'trash' && <option value="delete">Delete Permanently</option>}
        </select>

        <button
          onClick={() => {
            if (selectedItems.length === 0) {
              Swal.fire("Warning", "No items selected", "warning");
              return;
            }
            if (!bulkAction) {
              Swal.fire("Warning", "Choose a bulk action first", "warning");
              return;
            }
            onApplyBulkAction(bulkAction, selectedItems);
            setSelectedItems([]);
          }}
          style={{ padding: "8px 20px", borderRadius: 8, border: "1px solid var(--border-light)", background: "#fff", cursor: "pointer", fontSize: 14 }}
        >
          Apply
        </button>

        <select
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-light)", background: "#fff", color: "var(--text-primary)", fontSize: 14 }}
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
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-light)", background: "#fff", color: "var(--text-primary)", fontSize: 14 }}
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
          style={{ flex: 1, minWidth: 200, padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-light)", background: "#fff", color: "var(--text-primary)", fontSize: 14 }}
        />
      </div>

      {/* News Table */}
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
                    <input type="checkbox" onChange={handleSelectAll}
                      checked={selectedItems.length === paginatedNews.length && paginatedNews.length > 0} />
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

                  return (
                    <tr key={item.id} className="wpd-row" style={{
                      borderBottom: "1px solid var(--border-light)",
                      background: selectedItems.includes(item.id) ? "var(--primary-soft)" : "transparent",
                    }}>
                      <td style={{ padding: "12px 16px" }}>
                        <input type="checkbox" checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)} />
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
                      <td style={{ padding: "12px 16px" }}><StatusBadge status={item.status} /></td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)", fontSize: 13 }}>
                        {item.status === 'scheduled' && item.scheduledDate
                          ? <span style={{ color: "#2563eb", fontWeight: 600 }}>Scheduled: {new Date(item.scheduledDate).toLocaleString()}</span>
                          : (item.publishedDate || item.createdAt || "2026/06/20")}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{item.views || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

// ---------- Categories Tab (full CRUD) ----------
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

// ---------- News Modal ----------
const tabBtnStyle = (active) => ({
  background: active ? "var(--primary)" : "#fff",
  color: active ? "#fff" : "var(--text-secondary)",
  border: "1px solid var(--border-light)",
  padding: "6px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
});



// ---------- Preview ("View") Modal ----------
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

  const [news, setNews] = useState([]);
  const [stats, setStats] = useState({ total: 0, published: 0, scheduled: 0, drafts: 0, trash: 0 });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  const [customCategories, setCustomCategories] = useState([]);

  const [filters, setFilters] = useState({ status: 'all', category: 'all', date: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkAction, setBulkAction] = useState('');

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
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-publish scheduled posts once their time arrives (frontend simulation of WP-Cron)
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

  // Fetch news
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

  // Recompute stats whenever news changes
  useEffect(() => {
    setStats({
      total: news.length,
      published: news.filter(n => n.status === 'published').length,
      scheduled: news.filter(n => n.status === 'scheduled').length,
      drafts: news.filter(n => n.status === 'draft' || n.status === 'pending').length,
      trash: news.filter(n => n.status === 'trash').length,
    });
  }, [news]);

  // Categories derived from posts + manually added empty ones
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

  // Generic item updater: tries the API, always reflects the change locally (frontend-only friendly)
  const updateNewsItem = async (id, changes) => {
    const current = news.find((n) => n.id === id);
    const updated = { ...current, ...changes };
    setNews((prev) => prev.map((n) => (n.id === id ? updated : n)));
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8080/api/news/${id}`, updated, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      // No backend endpoint yet for this change — local state already reflects it.
      console.warn("Backend sync skipped:", err?.message);
    }
  };

  // CRUD operations
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

  // Bulk action handler
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

  // Category CRUD
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const navItems = [
    { icon: "📊", label: "Dashboard", id: "dashboard" },
    { icon: "📰", label: "Posts", id: "news" },
    { icon: "📂", label: "Categories", id: "categories" },
    { icon: "🎬", label: "Media", id: "media" },
  ];

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

        {isMobile && (
          <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} items={navItems} />
        )}
      </div>

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
            // Frontend-only fallback so the UI still works without a matching backend
            setNews((prev) => editingNews
              ? prev.map((n) => (n.id === editingNews.id ? { ...n, ...data } : n))
              : [...prev, { ...data, id: Date.now(), views: 0, createdAt: new Date().toLocaleDateString() }]);
          }
          Swal.fire("Saved!", "", "success");
        }}
      />

      <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </>
  );
}