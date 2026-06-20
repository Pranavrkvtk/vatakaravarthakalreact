// components/pages/AdsTab.js
import React, { useState } from "react";
import Swal from "sweetalert2";

const STATUS_STYLES = {
  active: { bg: "#dcfce7", color: "#16a34a" },
  inactive: { bg: "#fee2e2", color: "#dc2626" },
  pending: { bg: "#fef3c7", color: "#d97706" },
};

const StatusBadge = ({ status }) => {
  const s = status || "inactive";
  const style = STATUS_STYLES[s] || STATUS_STYLES.inactive;
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

const inputStyle = {
  padding: "12px 16px",
  fontSize: 16,
  borderRadius: 10,
  border: "1px solid var(--border-light)",
  width: "100%",
  background: "#fff",
  color: "#0f172a",
};

const labelStyle = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 6,
  color: "var(--text-secondary)",
};

const tabBtnStyle = (active) => ({
  background: active ? "var(--primary)" : "#fff",
  color: active ? "#fff" : "var(--text-secondary)",
  border: "1px solid var(--border-light)",
  padding: "6px 16px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
});

function AdsModal({ isOpen, onClose, ad, onSave }) {
  const [form, setForm] = useState({
    title: "",
    image: "",
    link: "",
    status: "inactive",
  });
  const [imageMode, setImageMode] = useState("url");

  React.useEffect(() => {
    if (ad) {
      setForm({ ...ad });
      setImageMode(ad.image && ad.image.startsWith("data:") ? "upload" : "url");
    } else {
      setForm({ title: "", image: "", link: "", status: "inactive" });
      setImageMode("url");
    }
  }, [ad, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      Swal.fire("Error", "Title is required", "error");
      return;
    }
    onSave(form);
    onClose();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire("Error", "Please choose an image file", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "#fff",
        zIndex: 9999,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          width: "45px",
          height: "45px",
          borderRadius: "50%",
          border: "none",
          background: "#ef4444",
          color: "#fff",
          fontSize: "20px",
          cursor: "pointer",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(239,68,68,0.4)",
          transition: "transform 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        ✕
      </button>

      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "30px 40px",
          overflowY: "auto",
          background: "var(--surface)",
          position: "relative",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            fontSize: 28,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 28,
          }}
        >
          {ad ? "Edit Advertisement" : "Add Advertisement"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Title *</label>
            <input
              placeholder="Enter ad title"
              value={form.title}
              required
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Image</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button
                type="button"
                style={tabBtnStyle(imageMode === "upload")}
                onClick={() => setImageMode("upload")}
              >
                Upload
              </button>
              <button
                type="button"
                style={tabBtnStyle(imageMode === "url")}
                onClick={() => setImageMode("url")}
              >
                URL
              </button>
            </div>
            {imageMode === "upload" ? (
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            ) : (
              <input
                placeholder="https://example.com/ad-image.jpg"
                value={form.image && !form.image.startsWith("data:") ? form.image : ""}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                style={inputStyle}
              />
            )}
            {form.image && (
              <div style={{ marginTop: 12, position: "relative", display: "inline-block" }}>
                <img
                  src={form.image}
                  alt="Preview"
                  style={{
                    maxWidth: 320,
                    maxHeight: 200,
                    borderRadius: 10,
                    border: "1px solid var(--border-light)",
                    display: "block",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image: "" })}
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    background: "var(--error)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Link (URL)</label>
            <input
              placeholder="https://example.com/landing-page"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={inputStyle}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "flex-end",
              borderTop: "1px solid var(--border-light)",
              paddingTop: 24,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid var(--border-light)",
                padding: "12px 32px",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--text-secondary)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                padding: "12px 36px",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdsTab({ ads, loading, onAdd, onEdit, onDelete, onSave }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  const handleAdd = () => {
    setEditingAd(null);
    setModalOpen(true);
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    onSave(data, editingAd?.id);
    setModalOpen(false);
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading ads…</div>;

  return (
    <div style={{ background: "var(--surface)", borderRadius: 16, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h3 style={{ margin: 0, fontSize: 22 }}>Advertisements</h3>
        <button
          onClick={handleAdd}
          style={{
            background: "var(--primary)", color: "#fff", border: "none",
            padding: "12px 28px", borderRadius: 10, fontSize: 16, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
          }}
        >
          + Add New Ad
        </button>
      </div>

      {ads.length === 0 ? (
        <p style={{ color: "var(--text-secondary)", fontSize: 18, textAlign: "center", padding: "40px 0" }}>
          No advertisements yet.
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "var(--bg-base)", textAlign: "left", borderBottom: "2px solid var(--border-light)" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>Image</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>Title</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>Link</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>Status</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-secondary)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    {ad.image ? (
                      <img src={ad.image} alt={ad.title} style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 8 }} />
                    ) : (
                      <div style={{ width: 56, height: 40, background: "var(--bg-base)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--text-secondary)" }}>🖼️</div>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>{ad.title}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {ad.link ? (
                      <a href={ad.link} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "none" }}>
                        {ad.link.length > 30 ? ad.link.slice(0, 30) + "…" : ad.link}
                      </a>
                    ) : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}><StatusBadge status={ad.status} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => handleEdit(ad)}
                      style={{ ...linkBtnStyle, color: "var(--primary)", marginRight: 12 }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        Swal.fire({
                          title: "Delete Ad?",
                          text: "This action cannot be undone.",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#dc2626",
                          confirmButtonText: "Delete",
                        }).then((result) => {
                          if (result.isConfirmed) onDelete(ad.id);
                        });
                      }}
                      style={{ ...linkBtnStyle, color: "var(--error)" }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        ad={editingAd}
        onSave={handleSave}
      />
    </div>
  );
}

export default AdsTab;