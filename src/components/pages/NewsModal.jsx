// src/components/pages/NewsModal.jsx
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { compressImage } from '../../utils/imageUtils';
import { uploadContentImage } from '../../api/news';
import { X, Bold, Italic, Underline, List, Quote, Link, Image, Upload } from 'lucide-react';

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%2394a3b8' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

// ✅ HELPER: Fixes broken images by adding the backend URL (port 8080) dynamically
const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http')) return url;
  // If it's a relative path like /uploads/..., prepend the backend domain
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const serverUrl = apiUrl.replace(/\/api\/?$/, '');
  return `${serverUrl}${url}`;
};

// ---------- Modern Rich Text Editor ----------
function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      const current = editorRef.current.innerHTML;
      if (value !== current) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (cmd, arg = null) => {
    document.execCommand(cmd, false, arg);
    handleInput();
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  };

  const removeImage = (imageElement) => {
    if (!imageElement) return;
    Swal.fire({
      title: 'Remove image?',
      text: 'This will remove the image from the content',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Remove',
    }).then((result) => {
      if (result.isConfirmed) {
        const parentDiv = imageElement.closest('.image-container');
        if (parentDiv) {
          parentDiv.remove();
          handleInput();
        }
      }
    });
  };

  const uploadImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return Swal.fire('Error', 'Please select an image file', 'error');
    if (file.size > 5 * 1024 * 1024) return Swal.fire('Error', 'Image must be less than 5MB', 'error');

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const data = await uploadContentImage(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      if (data && data.url) {
        // ✅ FIXED: Resolve the relative URL to the full absolute URL for display
        const fullImageUrl = resolveImageUrl(data.url);

        const imgHtml = `
          <div class="image-container" style="display: block; max-width: 100%; margin: 16px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); background: #f8fafc; border: 1px solid #e2e8f0; position: relative; clear: both;">
            <div style="display: flex; justify-content: center; align-items: center; padding: 8px; background: #f8fafc;">
              <img src="${fullImageUrl}" alt="Uploaded image" style="max-width: 100%; width: auto; height: auto; max-height: 450px; display: block; object-fit: contain; background: #f8fafc; border-radius: 8px;" />
            </div>
            <div style="position: absolute; top: 12px; right: 12px; opacity: 0; transition: opacity 0.25s ease; z-index: 10;" class="image-actions">
              <button style="background: rgba(220, 38, 38, 0.95); color: #fff; border: none; border-radius: 50%; width: 36px; height: 36px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25); transition: all 0.2s;">X</button>
            </div>
          </div><br />
        `;
        
        document.execCommand('insertHTML', false, imgHtml);
        handleInput();

        setTimeout(() => {
          const containers = editorRef.current?.querySelectorAll('.image-container');
          if (containers) {
            containers.forEach(container => {
              const img = container.querySelector('img');
              const removeBtn = container.querySelector('.image-actions button');
              if (removeBtn && img) {
                removeBtn.onclick = (e) => { e.stopPropagation(); removeImage(img); };
              }
              container.addEventListener('mouseenter', () => {
                const actions = container.querySelector('.image-actions');
                if (actions) actions.style.opacity = '1';
              });
              container.addEventListener('mouseleave', () => {
                const actions = container.querySelector('.image-actions');
                if (actions) actions.style.opacity = '0';
              });
            });
          }
        }, 100);

        Swal.fire({ icon: 'success', title: 'Image inserted!', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Swal.fire('Error', 'Failed to upload image.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) uploadImage(file);
    e.target.value = '';
  };

  const handlePaste = (e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          uploadImage(items[i].getAsFile());
          break;
        }
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      uploadImage(files[0]);
    }
  };

  const insertImageUrl = () => {
    const url = window.prompt("Enter image URL:", "https://example.com/image.jpg");
    if (url) {
      const fullUrl = resolveImageUrl(url);
      const imgHtml = `<div class="image-container" style="display: block; max-width: 100%; margin: 16px 0; text-align: center;"><img src="${fullUrl}" alt="Image" style="max-width: 100%; height: auto; border-radius: 8px;" /></div><br />`;
      document.execCommand('insertHTML', false, imgHtml);
      handleInput();
    }
  };

  const ToolbarButton = ({ children, onClick, title }) => (
    <button type="button" title={title} onMouseDown={(e) => e.preventDefault()} onClick={onClick} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </button>
  );

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", gap: 3, padding: "8px 12px", background: "#fafbfc", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap", alignItems: "center" }}>
        <ToolbarButton title="Bold" onClick={() => exec("bold")}><Bold size={15} /></ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => exec("italic")}><Italic size={15} /></ToolbarButton>
        <ToolbarButton title="Underline" onClick={() => exec("underline")}><Underline size={15} /></ToolbarButton>
        <div style={{ width: 1, height: 24, background: "#e2e8f0", margin: "0 4px" }} />
        <ToolbarButton title="H2" onClick={() => exec("formatBlock", "<h2>")}><span style={{ fontWeight: 700 }}>H2</span></ToolbarButton>
        <ToolbarButton title="H3" onClick={() => exec("formatBlock", "<h3>")}><span style={{ fontWeight: 600 }}>H3</span></ToolbarButton>
        <div style={{ width: 1, height: 24, background: "#e2e8f0", margin: "0 4px" }} />
        <ToolbarButton title="List" onClick={() => exec("insertUnorderedList")}><List size={15} /></ToolbarButton>
        <ToolbarButton title="Quote" onClick={() => exec("formatBlock", "<blockquote>")}><Quote size={15} /></ToolbarButton>
        <div style={{ width: 1, height: 24, background: "#e2e8f0", margin: "0 4px" }} />
        <ToolbarButton title="Link" onClick={insertLink}><Link size={15} /></ToolbarButton>
        <ToolbarButton title="Image URL" onClick={insertImageUrl}><Image size={15} /></ToolbarButton>

        <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6, padding: "0 14px", height: 32, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Upload size={15} /> {isUploading ? `${uploadProgress}%` : 'Upload'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ minHeight: 350, padding: "20px 24px", fontSize: 16, lineHeight: 1.8, outline: "none", color: "#0f172a", background: "#fff", overflowY: "auto" }}
      />
    </div>
  );
}

// ---------- Shared styles ----------
const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#475569" };
const inputStyle = { padding: "12px 16px", fontSize: 15, borderRadius: 10, border: "1px solid #e2e8f0", width: "100%", background: "#fff", color: "#0f172a", outline: "none" };
const tabBtnStyle = (active) => ({ background: active ? "#4f46e5" : "#fff", color: active ? "#fff" : "#64748b", border: active ? "1px solid #4f46e5" : "1px solid #e2e8f0", padding: "6px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" });

// ---------- NewsModal Component ----------
function NewsModal({ isOpen, onClose, news, onSave, categories, onAddCategory }) {
  const [form, setForm] = useState({ title: "", subtitle: "", content: "", category: "", image: "", status: "draft", tags: "", scheduledDate: "" });
  const [imageMode, setImageMode] = useState("url");
  const [imagePreview, setImagePreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFeatured, setIsUploadingFeatured] = useState(false);

  useEffect(() => {
    if (news) {
      const scheduled = news.scheduledDate ? news.scheduledDate.slice(0, 16) : "";
      setForm({
        title: news.title || "", subtitle: news.subtitle || "", content: news.content || "",
        category: news.category || "", image: news.image || "", status: news.status || "draft",
        tags: news.tags || "", scheduledDate: scheduled,
      });
      // ✅ FIXED: Resolve the image URL for preview
      setImagePreview(resolveImageUrl(news.image));
    } else {
      setForm({ title: "", subtitle: "", content: "", category: "", image: "", status: "draft", tags: "", scheduledDate: "" });
      setImagePreview("");
    }
  }, [news, isOpen]);

  if (!isOpen) return null;

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return Swal.fire('Error', 'Please select an image file', 'error');
    if (file.size > 5 * 1024 * 1024) return Swal.fire('Error', 'Image must be less than 5MB', 'error');

    setIsUploadingFeatured(true);
    Swal.fire({ title: 'Processing...', text: 'Compressing and uploading image...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const compressed = await compressImage(event.target.result, 800, 600, 0.7);
          const res = await fetch(compressed);
          const blob = await res.blob();
          const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });

          const response = await uploadContentImage(compressedFile);
          
          if (response && response.url) {
            setForm((f) => ({ ...f, image: response.url })); // Save relative to DB
            setImagePreview(resolveImageUrl(response.url)); // Show absolute in UI
            Swal.close();
          } else {
            throw new Error("No URL returned");
          }
        } catch (error) {
          console.error('Error uploading:', error);
          Swal.fire('Error', 'Failed to upload image', 'error');
        } finally {
          setIsUploadingFeatured(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Failed to upload image', 'error');
      setIsUploadingFeatured(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    if (form.status === "scheduled" && !form.scheduledDate) {
      Swal.fire("Missing date", "Pick a publish date/time for a scheduled post.", "warning");
      setIsSaving(false);
      return;
    }

    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#f8fafc", zIndex: 9999, overflow: "hidden" }}>
      <button type="button" onClick={onClose} style={{ position: "fixed", top: 20, right: 20, width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(239, 68, 68, 0.95)", color: "#fff", cursor: "pointer", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(239,68,68,0.35)" }}>
        <X size={24} />
      </button>

      <div style={{ width: "100%", height: "100%", padding: "30px 40px 40px", overflowY: "auto", background: "#f8fafc", position: "relative" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #4f46e5, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 700 }}>
            {news ? "✏️" : "📝"}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0f172a" }}>{news ? "Edit News" : "Create New News"}</h3>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>{news ? "Update the article details below" : "Fill in the details to create a new article"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 320px" }}>
              <label style={labelStyle}>Title <span style={{ color: "#ef4444" }}>*</span></label>
              <input placeholder="Enter article title" value={form.title} required onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ ...inputStyle, fontSize: 17, fontWeight: 600 }} />
            </div>
            <div style={{ flex: "1 1 320px" }}>
              <label style={labelStyle}>Subtitle</label>
              <input placeholder="Enter subtitle (optional)" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Content</label>
            <RichTextEditor key={news ? news.id : "new"} value={form.content} onChange={(html) => setForm((f) => ({ ...f, content: html }))} />
          </div>

          <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 220px" }}>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={(e) => {
                if (e.target.value === "__add__") {
                  const name = window.prompt("New category name:");
                  if (name && name.trim()) { onAddCategory(name.trim()); setForm({ ...form, category: name.trim() }); }
                } else { setForm({ ...form, category: e.target.value }); }
              }} style={inputStyle}>
                <option value="">-- Select category --</option>
                {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                <option value="__add__">+ Add new category...</option>
              </select>
            </div>

            <div style={{ flex: "1 1 220px" }}>
              <label style={labelStyle}>Tags</label>
              <input placeholder="Add tags separated by commas" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} style={inputStyle} />
            </div>

            <div style={{ flex: "1 1 220px" }}>
              <label style={labelStyle}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                <option value="draft">📄 Draft</option>
                <option value="pending">⏳ Pending Review</option>
                <option value="published">✅ Published</option>
                <option value="scheduled">📅 Scheduled</option>
              </select>
            </div>
          </div>

          {form.status === "scheduled" && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Publish Date & Time</label>
              <input type="datetime-local" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} style={{ ...inputStyle, maxWidth: 320 }} />
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Featured Image</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button type="button" style={tabBtnStyle(imageMode === "upload")} onClick={() => setImageMode("upload")}>📤 Upload</button>
              <button type="button" style={tabBtnStyle(imageMode === "url")} onClick={() => setImageMode("url")}>🔗 URL</button>
            </div>

            {imageMode === "upload" ? (
              <>
                <input type="file" accept="image/*" onChange={handleFeaturedImageUpload} style={{ ...inputStyle, padding: "10px", cursor: "pointer" }} />
                {isUploadingFeatured && <p style={{ fontSize: 12, color: "#4f46e5", marginTop: 8 }}>Uploading image...</p>}
              </>
            ) : (
              <input placeholder="https://example.com/image.jpg" value={form.image && !form.image.startsWith("data:") ? form.image : ""} onChange={(e) => { setForm({ ...form, image: e.target.value }); setImagePreview(e.target.value); }} style={inputStyle} />
            )}

            {imagePreview && (
              <div style={{ marginTop: 12, position: "relative", display: "inline-block" }}>
                <img src={imagePreview} alt="Preview" style={{ maxWidth: 320, maxHeight: 200, borderRadius: 12, border: "1px solid #e2e8f0", display: "block", objectFit: "contain", background: "#f8fafc" }} onError={(e) => { e.target.src = FALLBACK_IMG; }} />
                <button type="button" onClick={() => { setForm({ ...form, image: "" }); setImagePreview(""); }} style={{ position: "absolute", top: -8, right: -8, background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 14, justifyContent: "flex-end", borderTop: "1px solid #e2e8f0", paddingTop: 24, marginTop: 8, background: "#fafbfc", margin: "0 -40px -40px", padding: "20px 40px", borderRadius: "0 0 12px 12px" }}>
            <button type="button" onClick={onClose} style={{ background: "transparent", border: "1px solid #e2e8f0", padding: "12px 32px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", color: "#64748b" }}>Cancel</button>
            <button type="submit" disabled={isSaving || isUploadingFeatured} style={{ background: isSaving ? "#94a3b8" : "linear-gradient(135deg, #4f46e5, #6366f1)", color: "#fff", border: "none", padding: "12px 40px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: (isSaving || isUploadingFeatured) ? "not-allowed" : "pointer" }}>
              {isSaving ? "Saving..." : (news ? "💾 Update Article" : "✨ Create Article")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewsModal;