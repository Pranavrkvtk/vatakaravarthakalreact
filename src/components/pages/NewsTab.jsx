// components/pages/NewsTab.js
import React, { useState } from "react";
import Swal from "sweetalert2";

// ---------- Helper Components (copied from AdminDashboard) ----------
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
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [quickEditId, setQuickEditId] = useState(null);
  const [quickEditForm, setQuickEditForm] = useState({});

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

      {/* Filter bar */}
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