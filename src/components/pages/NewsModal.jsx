// src/components/pages/NewsModal.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { compressImage } from '../../utils/imageUtils';

// ---------- Rich Text Editor ----------
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
      const current = editorRef.current.innerHTML;
      if (value !== current) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

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
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: 8,
          background: "var(--bg-base)",
          borderBottom: "1px solid var(--border-light)",
          flexWrap: "wrap",
        }}
      >
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
          minHeight: 280,
          padding: "14px 16px",
          fontSize: 15,
          lineHeight: 1.6,
          outline: "none",
          color: "#0f172a",
          background: "#fff",
          overflowY: "auto",
        }}
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

// Shared field styles
const labelStyle = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 6,
  color: "var(--text-secondary)",
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

// ---------- NewsModal Component – FULL SCREEN ----------
function NewsModal({ isOpen, onClose, news, onSave, categories, onAddCategory }) {
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
  const [imagePreview, setImagePreview] = useState("");

  // Reset form when modal opens or `news` changes
  useEffect(() => {
    if (news) {
      const scheduled = news.scheduledDate
        ? new Date(news.scheduledDate).toISOString().slice(0, 16)
        : "";
      setForm({
        ...news,
        scheduledDate: scheduled,
      });
      setImageMode(news.image && news.image.startsWith("data:") ? "upload" : "url");
      setImagePreview(news.image || "");
    } else {
      setForm({
        title: "",
        subtitle: "",
        content: "",
        category: "",
        image: "",
        status: "draft",
        tags: "",
        scheduledDate: "",
      });
      setImageMode("url");
      setImagePreview("");
    }
  }, [news, isOpen]);

  if (!isOpen) return null;

  // ✅ UPDATED: Handle image upload with compression
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'Please select an image file', 'error');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire('Error', 'Image must be less than 2MB', 'error');
      return;
    }
    
    try {
      // Show loading
      Swal.fire({
        title: 'Processing...',
        text: 'Compressing image...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          // Compress the image
          const compressed = await compressImage(event.target.result, 800, 600, 0.7);
          setForm((f) => ({ ...f, image: compressed }));
          setImagePreview(compressed);
          Swal.close();
        } catch (error) {
          console.error('Error compressing:', error);
          Swal.fire('Error', 'Failed to process image', 'error');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Failed to upload image', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 🔍 Debug logging
    console.log('=== SAVING NEWS ===');
    console.log('Title:', form.title);
    console.log('Image exists:', !!form.image);
    if (form.image) {
      console.log('Image length:', form.image.length);
      console.log('Image starts with data:', form.image.startsWith('data:'));
    }
    
    if (form.status === "scheduled" && !form.scheduledDate) {
      Swal.fire("Missing date", "Pick a publish date/time for a scheduled post.", "warning");
      return;
    }
    
    onSave(form);
    onClose();
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
      {/* Close button */}
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

      {/* Form container */}
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
          {news ? "Edit News" : "Add News"}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Title + Subtitle */}
          <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 320px" }}>
              <label style={labelStyle}>Title *</label>
              <input
                placeholder="Enter title"
                value={form.title}
                required
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: "1 1 320px" }}>
              <label style={labelStyle}>Subtitle</label>
              <input
                placeholder="Enter subtitle"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Content */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Content</label>
            <RichTextEditor
              key={news ? news.id : "new"}
              value={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
            />
          </div>

          {/* Category + Tags + Status */}
          <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 220px" }}>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={handleCategoryChange} style={inputStyle}>
                <option value="">— Select category —</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value="__add__">+ Add new category…</option>
              </select>
            </div>

            <div style={{ flex: "1 1 220px" }}>
              <label style={labelStyle}>Tags</label>
              <input
                placeholder="Add tags separated by commas"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ flex: "1 1 220px" }}>
              <label style={labelStyle}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={inputStyle}
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending Review</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          {form.status === "scheduled" && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Publish Date &amp; Time</label>
              <input
                type="datetime-local"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                style={{ ...inputStyle, maxWidth: 320 }}
              />
            </div>
          )}

          {/* ✅ UPDATED: Featured Image with better handling */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Featured Image</label>
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
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                style={{ ...inputStyle, padding: "8px" }}
              />
            ) : (
              <input
                placeholder="https://example.com/image.jpg"
                value={form.image && !form.image.startsWith("data:") ? form.image : ""}
                onChange={(e) => {
                  setForm({ ...form, image: e.target.value });
                  setImagePreview(e.target.value);
                }}
                style={inputStyle}
              />
            )}
            
            {/* ✅ Image Preview */}
            {imagePreview && (
              <div style={{ marginTop: 12, position: "relative", display: "inline-block" }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: 320,
                    maxHeight: 200,
                    borderRadius: 10,
                    border: "1px solid var(--border-light)",
                    display: "block",
                  }}
                  onError={(e) => {
                    console.error('Preview image failed to load:', imagePreview);
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...form, image: "" });
                    setImagePreview("");
                  }}
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

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "flex-end",
              borderTop: "1px solid var(--border-light)",
              paddingTop: 24,
              marginTop: 8,
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
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-base)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(79,70,229,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.35)";
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

export default NewsModal;