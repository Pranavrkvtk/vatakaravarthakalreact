// components/pages/NewsFormPage.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

// ---------- RichTextEditor (shared) ----------
const rteBtnStyle = {
  background: "#fff",
  border: "1px solid var(--border-light)",
  borderRadius: 6,
  width: 30,
  height: 30,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text-primary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function RichTextEditor({ value, onChange }) {
  const editorRef = React.useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || "";
    }
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
      <div style={{ display: "flex", gap: 6, padding: 8, background: "var(--bg-base)", borderBottom: "1px solid var(--border-light)", flexWrap: "wrap" }}>
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
        style={{ minHeight: 220, padding: "14px 16px", fontSize: 15, lineHeight: 1.6, outline: "none", color: "#0f172a", background: "#fff", overflowY: "auto" }}
      />
    </div>
  );
}

// ---------- Tab button helper ----------
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

// ---------- NewsFormPage ----------
function NewsFormPage({ categories, onAddCategory, fetchNews }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    content: "",
    category: "",
    image: "",
    status: "draft",
    tags: "",
    scheduledDate: "",
  });
  const [imageMode, setImageMode] = useState("url");
  const [loading, setLoading] = useState(false);

  // Load existing data if editing
  useEffect(() => {
    if (isEditing) {
      const fetchItem = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`http://localhost:8080/api/news/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setForm({ scheduledDate: "", ...res.data });
          setImageMode(res.data.image && res.data.image.startsWith("data:") ? "upload" : "url");
        } catch (err) {
          Swal.fire("Error", "Failed to load news item", "error");
          navigate("/admin/news");
        }
      };
      fetchItem();
    }
  }, [id, isEditing, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.status === "scheduled" && !form.scheduledDate) {
      Swal.fire("Missing date", "Pick a publish date/time for a scheduled post.", "warning");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (isEditing) {
        await axios.put(`http://localhost:8080/api/news/${id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("http://localhost:8080/api/news", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      Swal.fire("Saved!", "", "success");
      if (fetchNews) fetchNews();
      navigate("/admin/news");
    } catch (err) {
      // fallback for frontend-only mode
      Swal.fire("Error", "Failed to save. Please try again.", "error");
    } finally {
      setLoading(false);
    }
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

  const handleCategoryChange = (e) => {
    if (e.target.value === "__add__") {
      const name = window.prompt("New category name:");
      if (name && name.trim()) {
        onAddCategory(name.trim());
        setForm({ ...form, category: name.trim() });
      }
    } else {
      setForm({ ...form, category: e.target.value });
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 0" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 28 }}>
        {isEditing ? "Edit News" : "Add New News"}
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>
            Title *
          </label>
          <input
            placeholder="Enter title"
            value={form.title}
            required
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{ padding: "12px 16px", fontSize: 16, borderRadius: 10, border: "1px solid var(--border-light)", width: "100%", background: "#fff", color: "#0f172a" }}
          />
        </div>

        {/* Subtitle */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>
            Subtitle
          </label>
          <input
            placeholder="Enter subtitle"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            style={{ padding: "12px 16px", fontSize: 16, borderRadius: 10, border: "1px solid var(--border-light)", width: "100%", background: "#fff", color: "#0f172a" }}
          />
        </div>

        {/* Content */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>
            Content
          </label>
          <RichTextEditor
            key={isEditing ? id : "new"}
            value={form.content}
            onChange={(html) => setForm((f) => ({ ...f, content: html }))}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>
            Category
          </label>
          <select
            value={form.category}
            onChange={handleCategoryChange}
            style={{ padding: "12px 16px", fontSize: 16, borderRadius: 10, border: "1px solid var(--border-light)", width: "100%", background: "#fff", color: "#0f172a" }}
          >
            <option value="">— Select category —</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
            <option value="__add__">+ Add new category…</option>
          </select>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>
            Tags
          </label>
          <input
            placeholder="Add tags separated by commas"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            style={{ padding: "12px 16px", fontSize: 16, borderRadius: 10, border: "1px solid var(--border-light)", width: "100%", background: "#fff", color: "#0f172a" }}
          />
        </div>

        {/* Status & Scheduling */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            style={{ padding: "12px 16px", fontSize: 16, borderRadius: 10, border: "1px solid var(--border-light)", width: "100%", background: "#fff", color: "#0f172a" }}
          >
            <option value="draft">Draft</option>
            <option value="pending">Pending Review</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
          {form.status === "scheduled" && (
            <input
              type="datetime-local"
              value={form.scheduledDate}
              onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
              style={{ marginTop: 10, padding: "12px 16px", fontSize: 16, borderRadius: 10, border: "1px solid var(--border-light)", width: "100%", background: "#fff", color: "#0f172a" }}
            />
          )}
        </div>

        {/* Featured Image */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>
            Featured Image
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button type="button" style={tabBtnStyle(imageMode === "upload")} onClick={() => setImageMode("upload")}>
              Upload
            </button>
            <button type="button" style={tabBtnStyle(imageMode === "url")} onClick={() => setImageMode("url")}>
              URL
            </button>
          </div>
          {imageMode === "upload" ? (
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          ) : (
            <input
              placeholder="https://example.com/image.jpg"
              value={form.image && !form.image.startsWith("data:") ? form.image : ""}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              style={{ padding: "12px 16px", fontSize: 16, borderRadius: 10, border: "1px solid var(--border-light)", width: "100%", background: "#fff", color: "#0f172a" }}
            />
          )}
          {form.image && (
            <div style={{ marginTop: 12, position: "relative", display: "inline-block" }}>
              <img src={form.image} alt="Preview" style={{ maxWidth: 220, maxHeight: 140, borderRadius: 10, border: "1px solid var(--border-light)", display: "block" }} />
              <button
                type="button"
                onClick={() => setForm({ ...form, image: "" })}
                style={{ position: "absolute", top: -8, right: -8, background: "var(--error)", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 13 }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 14, justifyContent: "flex-end", borderTop: "1px solid var(--border-light)", paddingTop: 20 }}>
          <button
            type="button"
            onClick={() => navigate("/admin/news")}
            style={{ background: "transparent", border: "1px solid var(--border-light)", padding: "12px 28px", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: "pointer", color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ background: "var(--primary)", color: "#fff", border: "none", padding: "12px 32px", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(79,70,229,0.3)", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewsFormPage;