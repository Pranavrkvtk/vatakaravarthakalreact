// src/components/pages/NewsModal.jsx
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { compressImage } from '../../utils/imageUtils';
import { uploadContentImage } from '../../api/news';

// ---------- Rich Text Editor with Image Upload ----------
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
  transition: "all 0.2s",
};

function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState([]);
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
    if (editorRef.current) onChange(editorRef.current.innerHTML);
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

  // ─── Remove Image ──────────────────────────────────────────────
  const removeImage = (imageElement) => {
    if (!imageElement) return;

    Swal.fire({
      title: 'Remove image?',
      text: 'This will remove the image from the content',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const parentDiv = imageElement.closest('.image-container');
        if (parentDiv) {
          parentDiv.remove();
          handleInput();
          const imgSrc = imageElement.src;
          setUploadedImages(prev => prev.filter(url => url !== imgSrc));
          Swal.fire('Removed', 'Image has been removed', 'success');
        }
      }
    });
  };

  // ─── Upload Image to Server ──────────────────────────────────
  const uploadImage = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'Please select an image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error', 'Image must be less than 5MB', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const data = await uploadContentImage(file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      console.log('Upload response:', data);

      if (data && data.url) {
        const imageUrl = data.url;
        const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:8080${imageUrl}`;
        
        console.log('Full Image URL:', fullImageUrl);
        
        setUploadedImages(prev => [...prev, fullImageUrl]);

        // ✅ FIXED: Image with proper block display for Enter key support
        const imgHtml = `
          <div class="image-container" style="
            display: block;
            max-width: 100%;
            margin: 12px 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            position: relative;
            clear: both;
          ">
            <div style="
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 4px;
            ">
              <img 
                src="${fullImageUrl}" 
                alt="Uploaded image" 
                style="
                  max-width: 100%;
                  width: auto;
                  height: auto;
                  max-height: 400px;
                  display: block;
                  object-fit: contain;
                  background: #f1f5f9;
                  border-radius: 4px;
                "
              />
            </div>
            <div style="
              position: absolute;
              top: 8px;
              right: 8px;
              opacity: 0;
              transition: opacity 0.2s ease;
              z-index: 10;
            " class="image-actions">
              <button 
                style="
                  background: rgba(220, 38, 38, 0.9);
                  color: #fff;
                  border: none;
                  border-radius: 50%;
                  width: 32px;
                  height: 32px;
                  font-size: 16px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                  transition: all 0.2s;
                "
                onmouseover="this.style.transform='scale(1.1)'"
                onmouseout="this.style.transform='scale(1)'"
              >
                ✕
              </button>
            </div>
            <div style="
              position: absolute;
              bottom: 8px;
              left: 8px;
              background: rgba(0,0,0,0.4);
              color: #fff;
              padding: 2px 10px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 500;
              backdrop-filter: blur(4px);
            ">📸</div>
          </div>
          <br />
        `;
        
        document.execCommand('insertHTML', false, imgHtml);
        handleInput();

        // Move cursor after the image
        setTimeout(() => {
          const range = document.createRange();
          const selection = window.getSelection();
          const lastChild = editorRef.current?.lastChild;
          if (lastChild) {
            range.setStartAfter(lastChild);
            range.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
          editorRef.current?.focus();
        }, 50);

        // Add event listeners for hover
        setTimeout(() => {
          const containers = editorRef.current?.querySelectorAll('.image-container');
          if (containers) {
            containers.forEach(container => {
              const img = container.querySelector('img');
              const removeBtn = container.querySelector('.image-actions button');
              if (removeBtn && img) {
                removeBtn.onclick = (e) => {
                  e.stopPropagation();
                  removeImage(img);
                };
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

        Swal.fire({
          icon: 'success',
          title: 'Image uploaded!',
          text: 'Image inserted into content',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire('Error', 'No image URL returned from server', 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Swal.fire('Error', 'Failed to upload image. Please try again.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadImage(file);
    }
    e.target.value = '';
  };

  const handlePaste = (e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          uploadImage(file);
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

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const insertImageUrl = () => {
    const url = window.prompt("Enter image URL:", "https://example.com/image.jpg");
    if (url) {
      const imgHtml = `
        <div class="image-container" style="
          display: block;
          max-width: 100%;
          margin: 12px 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          position: relative;
          clear: both;
        ">
          <div style="display: flex; justify-content: center; align-items: center; padding: 4px;">
            <img 
              src="${url}" 
              alt="Image" 
              style="
                max-width: 100%;
                width: auto;
                height: auto;
                max-height: 400px;
                display: block;
                object-fit: contain;
                background: #f1f5f9;
                border-radius: 4px;
              "
            />
          </div>
          <div style="
            position: absolute;
            top: 8px;
            right: 8px;
            opacity: 0;
            transition: opacity 0.2s ease;
            z-index: 10;
          " class="image-actions">
            <button 
              style="
                background: rgba(220, 38, 38, 0.9);
                color: #fff;
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                font-size: 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              "
            >
              ✕
            </button>
          </div>
          <div style="
            position: absolute;
            bottom: 8px;
            left: 8px;
            background: rgba(0,0,0,0.4);
            color: #fff;
            padding: 2px 10px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
            backdrop-filter: blur(4px);
          ">📸</div>
        </div>
        <br />
      `;
      document.execCommand('insertHTML', false, imgHtml);
      handleInput();

      setTimeout(() => {
        const range = document.createRange();
        const selection = window.getSelection();
        const lastChild = editorRef.current?.lastChild;
        if (lastChild) {
          range.setStartAfter(lastChild);
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        editorRef.current?.focus();
      }, 50);

      setTimeout(() => {
        const containers = editorRef.current?.querySelectorAll('.image-container');
        if (containers) {
          containers.forEach(container => {
            const img = container.querySelector('img');
            const removeBtn = container.querySelector('.image-actions button');
            if (removeBtn && img) {
              removeBtn.onclick = (e) => {
                e.stopPropagation();
                removeImage(img);
              };
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
    }
  };

  const Btn = ({ children, onClick, title }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={rteBtnStyle}
      onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
      onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
    >
      {children}
    </button>
  );

  return (
    <div style={{ border: "1px solid var(--border-light)", borderRadius: 10, overflow: "hidden" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 8,
          background: "var(--bg-base)",
          borderBottom: "1px solid var(--border-light)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Btn title="Bold" onClick={() => exec("bold")}><strong>B</strong></Btn>
        <Btn title="Italic" onClick={() => exec("italic")}><em>I</em></Btn>
        <Btn title="Underline" onClick={() => exec("underline")}><u>U</u></Btn>
        <Btn title="Strikethrough" onClick={() => exec("strikeThrough")}><s>S</s></Btn>

        <span style={{ width: 1, height: 24, background: "var(--border-light)", margin: "0 4px" }} />

        <Btn title="Heading 2" onClick={() => exec("formatBlock", "<h2>")}>H2</Btn>
        <Btn title="Heading 3" onClick={() => exec("formatBlock", "<h3>")}>H3</Btn>
        <Btn title="Paragraph" onClick={() => exec("formatBlock", "<p>")}>P</Btn>

        <span style={{ width: 1, height: 24, background: "var(--border-light)", margin: "0 4px" }} />

        <Btn title="Bullet list" onClick={() => exec("insertUnorderedList")}>List</Btn>
        <Btn title="Numbered list" onClick={() => exec("insertOrderedList")}>Num</Btn>
        <Btn title="Quote" onClick={() => exec("formatBlock", "<blockquote>")}>Quote</Btn>

        <span style={{ width: 1, height: 24, background: "var(--border-light)", margin: "0 4px" }} />

        <Btn title="Insert link" onClick={insertLink}>Link</Btn>
        <Btn title="Insert image URL" onClick={insertImageUrl}>Image</Btn>

        <span style={{ width: 1, height: 24, background: "var(--border-light)", margin: "0 4px" }} />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            ...rteBtnStyle,
            width: 'auto',
            padding: '0 14px',
            gap: 6,
            background: isUploading ? "#f0fdf4" : "#fff",
            color: isUploading ? "#16a34a" : "var(--text-primary)",
          }}
          title="Upload image (paste or drag & drop too)"
        >
          {isUploading ? 'Uploading ' + uploadProgress + '%' : 'Upload'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <Btn title="Clear formatting" onClick={() => exec("removeFormat")}>Clear</Btn>
        <Btn title="Clear all" onClick={() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = '';
            handleInput();
          }
        }}>X</Btn>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div style={{
          padding: "8px 16px",
          background: "#f0fdf4",
          borderBottom: "1px solid #dcfce7",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              background: "linear-gradient(90deg, #6C63FF, #8B83FF)",
              borderRadius: 4,
              transition: "width 0.3s ease",
              width: uploadProgress + '%',
            }} />
          </div>
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
            Uploading... {uploadProgress}%
          </span>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          minHeight: 350,
          padding: "16px 20px",
          fontSize: 16,
          lineHeight: 1.8,
          outline: "none",
          color: "#0f172a",
          background: "#fff",
          overflowY: "auto",
        }}
        data-placeholder="Write your article content here... You can paste images, drag & drop, or use the upload button"
      />

      {/* Footer */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 16px",
        background: "#f8fafc",
        borderTop: "1px solid #e2e8f0",
        fontSize: 12,
        color: "#94a3b8",
      }}>
        <span>
          <strong>{editorRef.current?.textContent?.length || 0}</strong> characters
          {uploadedImages.length > 0 && (
            <span style={{ marginLeft: 16 }}>
              Images: {uploadedImages.length}
            </span>
          )}
        </span>
        <span>Tip: Hover over images to see remove button</span>
      </div>
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
  transition: "all 0.2s",
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
  transition: "border-color 0.2s",
};

// ---------- NewsModal Component ----------
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

  useEffect(() => {
    if (news) {
      const scheduled = news.scheduledDate
        ? new Date(news.scheduledDate).toISOString().slice(0, 16)
        : "";
      setForm({
        title: news.title || "",
        subtitle: news.subtitle || "",
        content: news.content || "",
        category: news.category || "",
        image: news.image || "",
        status: news.status || "draft",
        tags: news.tags || "",
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'Please select an image file', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire('Error', 'Image must be less than 2MB', 'error');
      return;
    }

    try {
      Swal.fire({
        title: 'Processing...',
        text: 'Compressing image...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
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

    console.log('=== SAVING NEWS ===');
    console.log('Title:', form.title);
    console.log('Content length:', form.content?.length || 0);
    console.log('Image exists:', !!form.image);
    if (form.image) {
      console.log('Image length:', form.image.length);
      console.log('Image starts with data:', form.image?.startsWith('data:'));
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
        overflow: "hidden",
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
        X
      </button>

      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "30px 40px 40px",
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

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Content</label>
            <RichTextEditor
              key={news ? news.id : "new"}
              value={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
            />
          </div>

          <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 220px" }}>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={handleCategoryChange} style={inputStyle}>
                <option value="">-- Select category --</option>
                {categories.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value="__add__">+ Add new category...</option>
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
              <label style={labelStyle}>Publish Date & Time</label>
              <input
                type="datetime-local"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                style={{ ...inputStyle, maxWidth: 320 }}
              />
            </div>
          )}

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
                    objectFit: "contain",
                    background: "#f8fafc",
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
                  X
                </button>
              </div>
            )}
          </div>

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