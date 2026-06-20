    import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const MediaTab = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");

  // Fetch current video and banners
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Video endpoint
      const videoRes = await axios.get("http://localhost:8080/api/media/video", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideoUrl(videoRes.data.videoUrl || "");
      setNewVideoUrl(videoRes.data.videoUrl || "");

      // Banners endpoint
      const bannerRes = await axios.get("http://localhost:8080/api/media/banners", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanners(bannerRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Update video URL
  const handleSaveVideo = async () => {
    if (!newVideoUrl.trim()) {
      Swal.fire("Error", "Please enter a valid URL", "error");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:8080/api/media/video",
        { videoUrl: newVideoUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVideoUrl(newVideoUrl);
      Swal.fire("Success!", "Video URL updated.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to update video URL", "error");
    }
  };

  // Upload banner image
  const handleUploadBanner = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:8080/api/media/banners", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setBanners([...banners, res.data]);
      Swal.fire("Uploaded!", "Banner added.", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to upload banner", "error");
    } finally {
      setUploading(false);
      e.target.value = ""; // reset input
    }
  };

  // Delete banner
  const handleDeleteBanner = async (id) => {
    const result = await Swal.fire({
      title: "Delete Banner?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/media/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanners(banners.filter(b => b.id !== id));
      Swal.fire("Deleted!", "", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to delete banner", "error");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Video URL Section */}
      <div style={{
        background: "var(--surface)",
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        border: "1px solid var(--border-light)",
      }}>
        <h3 style={{ marginTop: 0 }}>🎬 Home Page Video</h3>
        <p style={{ color: "var(--text-secondary)" }}>Paste a video URL (YouTube or direct MP4).</p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="https://www.youtube.com/embed/..."
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            onClick={handleSaveVideo}
            style={{
              padding: "8px 20px",
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Save URL
          </button>
        </div>
        {videoUrl && (
          <div style={{ marginTop: 12 }}>
            <strong>Current Video:</strong>
            <a href={videoUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>
              {videoUrl}
            </a>
          </div>
        )}
      </div>

      {/* Banner Upload Section */}
      <div style={{
        background: "var(--surface)",
        borderRadius: 16,
        padding: 24,
        border: "1px solid var(--border-light)",
      }}>
        <h3 style={{ marginTop: 0 }}>🖼️ Banners / Images</h3>
        <p style={{ color: "var(--text-secondary)" }}>Upload images for carousels or home page banners.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <label
            htmlFor="banner-upload"
            style={{
              background: "var(--primary-soft)",
              color: "var(--primary)",
              padding: "8px 16px",
              borderRadius: 8,
              cursor: "pointer",
              border: "1px dashed var(--primary)",
              display: "inline-block",
              fontWeight: 600,
            }}
          >
            {uploading ? "Uploading..." : "Choose Image"}
          </label>
          <input
            id="banner-upload"
            type="file"
            accept="image/*"
            onChange={handleUploadBanner}
            disabled={uploading}
            style={{ display: "none" }}
          />
          {uploading && <span>Uploading...</span>}
        </div>

        {banners.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No banners uploaded yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
            {banners.map((banner) => (
              <div key={banner.id} style={{
                border: "1px solid var(--border-light)",
                borderRadius: 8,
                overflow: "hidden",
                position: "relative",
              }}>
                <img
                  src={banner.url}
                  alt={banner.filename}
                  style={{ width: "100%", height: 100, objectFit: "cover" }}
                />
                <div style={{ padding: 6, fontSize: 12, textAlign: "center" }}>
                  {banner.filename}
                </div>
                <button
                  onClick={() => handleDeleteBanner(banner.id)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(220,38,38,0.8)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 24,
                    height: 24,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaTab;