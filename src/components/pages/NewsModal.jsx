// src/components/pages/NewsModal.jsx
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { compressImage } from '../../utils/imageUtils';
import { uploadContentImage } from '../../api/news';
import { X, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Link, Image, Upload, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%2394a3b8' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

// ---------- Modern Rich Text Editor ----------
function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      const current = editorRef.current.innerHTML;
      if (value !== current) {
        editorRef.current.innerHTML = value || "";
        updateCharCount();
      }
    }
  }, [value]);

  const updateCharCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || "";
      setCharCount(text.length);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      updateCharCount();
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

      if (data && data.url) {
        const imageUrl = data.url;
        
        // ✅ FIXED (Audit B11): Don't hardcode localhost. Use environment variable.
        const apiUrl = process.env.REACT_APP_API_URL || '/api';
        const serverUrl = apiUrl.replace(/\/api\/?$/, '');
        const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${serverUrl}${imageUrl}`;
        
        setUploadedImages(prev => [...prev, fullImageUrl]);

        const imgHtml = `
          <div class="image-container" style="
            display: block;
            max-width: 100%;
            margin: 16px 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            position: relative;
            clear: both;
            transition: box-shadow 0.3s ease;
          ">
            <div style="
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 8px;
              background: #f8fafc;
            ">
              <img 
                src="${fullImageUrl}" 
                alt="Uploaded image" 
                style="
                  max-width: 100%;
                  width: auto;
                  height: auto;
                  max-height: 450px;
                  display: block;
                  object-fit: contain;
                  background: #f8fafc;
                  border-radius: 8px;
                "
              />
            </div>
            <div style="
              position: absolute;
              top: 12px;
              right: 12px;
              opacity: 0;
              transition: opacity 0.25s ease;
              z-index: 10;
            " class="image-actions">
              <button 
                style="
                  background: rgba(220, 38, 38, 0.95);
                  color: #fff;
                  border: none;
                  border-radius: 50%;
                  width: 36px;
                  height: 36px;
                  font-size: 16px;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                  transition: all 0.2s;
                  backdrop-filter: blur(4px);
                "
                onmouseover="this.style.transform='scale(1.1)'; this.style.background='rgba(220,38,38,1)'"
                onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(220,38,38,0.95)'"
              >
                <X size={16} />
              </button>
            </div>
            <div style="
              position: absolute;
              bottom: 12px;
              left: 12px;
              background: rgba(0,0,0,0.5);
              color: #fff;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 500;
              backdrop-filter: blur(8px);
              letter-spacing: 0.3px;
            ">📸 Image</div>
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
                container.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
              });
              container.addEventListener('mouseleave', () => {
                const actions = container.querySelector('.image-actions');
                if (actions) actions.style.opacity = '0';
                container.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
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
          toast: true,
          position: 'top-end',
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
          margin: 16px 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          position: relative;
          clear: both;
        ">
          <div style="display: flex; justify-content: center; align-items: center; padding: 8px; background: #f8fafc;">
            <img 
              src="${url}" 
              alt="Image" 
              style="
                max-width: 100%;
                width: auto;
                height: auto;
                max-height: 450px;
                display: block;
                object-fit: contain;
                background: #f8fafc;
                border-radius: 8px;
              "
            />
          </div>
          <div style="
            position: absolute;
            top: 12px;
            right: 12px;
            opacity: 0;
            transition: opacity 0.25s ease;
            z-index: 10;
          " class="image-actions">
            <button 
              style="
                background: rgba(220, 38, 38, 0.95);
                color: #fff;
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                font-size: 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                transition: all 0.2s;
              "
            >
              <X size={16} />
            </button>
          </div>
          <div style="
            position: absolute;
            bottom: 12px;
            left: 12px;
            background: rgba(0,0,0,0.5);
            color: #fff;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 500;
            backdrop-filter: blur(8px);
          ">📸 Image</div>
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

  const ToolbarButton = ({ children, onClick, title, active }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={{
        background: active ? "#eef2ff" : "#fff",
        border: active ? "1px solid #4f46e5" : "1px solid #e2e8f0",
        borderRadius: 6,
        width: 32,
        height: 32,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500,
        color: active ? "#4f46e5" : "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "#f1f5f9";
          e.currentTarget.style.borderColor = "#94a3b8";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.borderColor = "#e2e8f0";
        }
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ 
      border: "1px solid #e2e8f0", 
      borderRadius: 12, 
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 3,
          padding: "8px 12px",
          background: "#fafbfc",
          borderBottom: "1px solid #e2e8f0",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Text Formatting */}
        <ToolbarButton title="Bold" onClick={() => exec("bold")}>
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => exec("italic")}>
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton title="Underline" onClick={() => exec("underline")}>
          <Underline size={15} />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => exec("strikeThrough")}>
          <Strikethrough size={15} />
        </ToolbarButton>

        <div style={{ width: 1, height: 24, background: "#e2e8f0", margin: "0 4px" }} />

        {/* Headings */}
        <ToolbarButton title="Heading 2" onClick={() => exec("formatBlock", "<h2>")}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>H2</span>
        </ToolbarButton>
        <ToolbarButton title="Heading 3" onClick={() => exec("formatBlock", "<h3>")}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>H3</span>
        </ToolbarButton>
        <ToolbarButton title="Paragraph" onClick={() => exec("formatBlock", "<p>")}>
          <span style={{ fontSize: 13 }}>P</span>
        </ToolbarButton>

        <div style={{ width: 1, height: 24, background: "#e2e8f0", margin: "0 4px" }} />

        {/* Lists */}
        <ToolbarButton title="Bullet list" onClick={() => exec("insertUnorderedList")}>
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" onClick={() => exec("insertOrderedList")}>
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton title="Quote" onClick={() => exec("formatBlock", "<blockquote>")}>
          <Quote size={15} />
        </ToolbarButton>

        <div style={{ width: 1, height: 24, background: "#e2e8f0", margin: "0 4px" }} />

        {/* Links & Images */}
        <ToolbarButton title="Insert link" onClick={insertLink}>
          <Link size={15} />
        </ToolbarButton>
        <ToolbarButton title="Insert image URL" onClick={insertImageUrl}>
          <Image size={15} />
        </ToolbarButton>

        <div style={{ width: 1, height: 24, background: "#e2e8f0", margin: "0 4px" }} />

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: isUploading ? "#f0fdf4" : "#fff",
            border: isUploading ? "1px solid #22c55e" : "1px solid #e2e8f0",
            borderRadius: 6,
            padding: "0 14px",
            height: 32,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            color: isUploading ? "#16a34a" : "#0f172a",
            display: "flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!isUploading) {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.borderColor = "#94a3b8";
            }
          }}
          onMouseLeave={(e) => {
            if (!isUploading) {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }
          }}
          title="Upload image (paste or drag & drop too)"
        >
          <Upload size={15} />
          {isUploading ? `${uploadProgress}%` : 'Upload'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div style={{ width: 1, height: 24, background: "#e2e8f0", margin: "0 4px" }} />

        <ToolbarButton title="Clear formatting" onClick={() => exec("removeFormat")}>
          <span style={{ fontSize: 14 }}>↺</span>
        </ToolbarButton>
        <ToolbarButton title="Clear all" onClick={() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = '';
            handleInput();
          }
        }}>
          <X size={15} />
        </ToolbarButton>
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
          <div style={{ flex: 1, height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              background: "linear-gradient(90deg, #4f46e5, #818cf8)",
              borderRadius: 2,
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
          padding: "20px 24px",
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
        background: "#fafbfc",
        borderTop: "1px solid #e2e8f0",
        fontSize: 12,
        color: "#94a3b8",
      }}>
        <span>
          <span style={{ fontWeight: 600, color: "#475569" }}>{charCount}</span> characters
          {uploadedImages.length > 0 && (
            <span style={{ marginLeft: 16 }}>
              🖼️ <span style={{ fontWeight: 600, color: "#475569" }}>{uploadedImages.length}</span> images
            </span>
          )}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ 
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#22c55e",
          }} />
          Ready
        </span>
      </div>
    </div>
  );
}

// ---------- Tab button helper ----------
const tabBtnStyle = (active) => ({
  background: active ? "#4f46e5" : "#fff",
  color: active ? "#fff" : "#64748b",
  border: active ? "1px solid #4f46e5" : "1px solid #e2e8f0",
  padding: "6px 18px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
});

// Shared field styles
const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6,
  color: "#475569",
  letterSpacing: "0.3px",
};

const inputStyle = {
  padding: "12px 16px",
  fontSize: 15,
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  width: "100%",
  background: "#fff",
  color: "#0f172a",
  transition: "border-color 0.2s, box-shadow 0.2s",
  outline: "none",
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (news) {
      // ✅ FIXED (Audit B7): Removed .toISOString() to prevent the -5:30 time shift on every save.
      const scheduled = news.scheduledDate ? news.scheduledDate.slice(0, 16) : "";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    if (form.status === "scheduled" && !form.scheduledDate) {
      Swal.fire("Missing date", "Pick a publish date/time for a scheduled post.", "warning");
      setIsSaving(false);
      return;
    }

    try {
      // ✅ FIXED (Audit B11): Strip any hardcoded localhost URLs from the HTML before saving to the DB
      const cleanedContent = form.content.replace(/http:\/\/localhost:8080/g, '');
      
      await onSave({ ...form, content: cleanedContent });
      onClose();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
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
        background: "#f8fafc",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "none",
          background: "rgba(239, 68, 68, 0.95)",
          color: "#fff",
          cursor: "pointer",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(239,68,68,0.35)",
          transition: "all 0.2s ease",
          backdropFilter: "blur(4px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.background = "rgba(239,68,68,1)";
          e.currentTarget.style.boxShadow = "0 6px 24px rgba(239,68,68,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.background = "rgba(239,68,68,0.95)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(239,68,68,0.35)";
        }}
      >
        <X size={24} />
      </button>

      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "30px 40px 40px",
          overflowY: "auto",
          background: "#f8fafc",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 28,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "linear-gradient(135deg, #4f46e5, #818cf8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 22,
            fontWeight: 700,
            boxShadow: "0 4px 16px rgba(79,70,229,0.3)",
          }}>
            {news ? "✏️" : "📝"}
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 700,
                color: "#0f172a",
                letterSpacing: "-0.5px",
              }}
            >
              {news ? "Edit News" : "Create New News"}
            </h3>
            <p style={{
              margin: "4px 0 0",
              fontSize: 14,
              color: "#64748b",
            }}>
              {news ? "Update the article details below" : "Fill in the details to create a new article"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title & Subtitle */}
          <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 320px" }}>
              <label style={labelStyle}>Title <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                placeholder="Enter article title"
                value={form.title}
                required
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{
                  ...inputStyle,
                  fontSize: 17,
                  fontWeight: 600,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4f46e5";
                  e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div style={{ flex: "1 1 320px" }}>
              <label style={labelStyle}>Subtitle</label>
              <input
                placeholder="Enter subtitle (optional)"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4f46e5";
                  e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
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

          {/* Category, Tags, Status */}
          <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 220px" }}>
              <label style={labelStyle}>Category</label>
              <select 
                value={form.category} 
                onChange={handleCategoryChange} 
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4f46e5";
                  e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              >
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
                onFocus={(e) => {
                  e.target.style.borderColor = "#4f46e5";
                  e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ flex: "1 1 220px" }}>
              <label style={labelStyle}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4f46e5";
                  e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              >
                <option value="draft">📄 Draft</option>
                <option value="pending">⏳ Pending Review</option>
                <option value="published">✅ Published</option>
                <option value="scheduled">📅 Scheduled</option>
              </select>
            </div>
          </div>

          {/* Scheduled Date */}
          {form.status === "scheduled" && (
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Publish Date & Time</label>
              <input
                type="datetime-local"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                style={{
                  ...inputStyle,
                  maxWidth: 320,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4f46e5";
                  e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          )}

          {/* Featured Image */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Featured Image</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button
                type="button"
                style={tabBtnStyle(imageMode === "upload")}
                onClick={() => setImageMode("upload")}
              >
                📤 Upload
              </button>
              <button
                type="button"
                style={tabBtnStyle(imageMode === "url")}
                onClick={() => setImageMode("url")}
              >
                🔗 URL
              </button>
            </div>

            {imageMode === "upload" ? (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{
                  ...inputStyle,
                  padding: "10px",
                  cursor: "pointer",
                }}
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
                onFocus={(e) => {
                  e.target.style.borderColor = "#4f46e5";
                  e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
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
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    display: "block",
                    objectFit: "contain",
                    background: "#f8fafc",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                  onError={(e) => {
                    if (e.target.src === FALLBACK_IMG) return;
                    e.target.src = FALLBACK_IMG;
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
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    cursor: "pointer",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <X size={16} />
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
              borderTop: "1px solid #e2e8f0",
              paddingTop: 24,
              marginTop: 8,
              background: "#fafbfc",
              margin: "0 -40px -40px",
              padding: "20px 40px",
              borderRadius: "0 0 12px 12px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid #e2e8f0",
                padding: "12px 32px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                color: "#64748b",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.borderColor = "#94a3b8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                background: isSaving ? "#94a3b8" : "linear-gradient(135deg, #4f46e5, #6366f1)",
                color: "#fff",
                border: "none",
                padding: "12px 40px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: isSaving ? "not-allowed" : "pointer",
                boxShadow: isSaving ? "none" : "0 4px 16px rgba(79,70,229,0.35)",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(79,70,229,0.45)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(79,70,229,0.35)";
                }
              }}
            >
              {isSaving ? (
                <>
                  <span style={{
                    display: "inline-block",
                    width: 18,
                    height: 18,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid #fff",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  Saving...
                </>
              ) : (
                <>
                  {news ? "💾 Update Article" : "✨ Create Article"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

export default NewsModal;