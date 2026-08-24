// src/components/pages/AdsTab.jsx
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { 
  Plus, Edit, Trash2, Eye, TrendingUp, Calendar, 
  Image, Link, ToggleLeft, ToggleRight, Clock,
  Filter, Search, X, ChevronLeft, ChevronRight,
  BarChart3, MousePointer, Zap, AlertCircle, Upload,
  FileImage, CloudUpload, Trash
} from "lucide-react";
import { 
  getAllAds, 
  createAd, 
  updateAd, 
  deleteAd, 
  toggleAdStatus,
  getAdStats,
  recordAdView,
  uploadContentImage
} from '../../api/news';
import { compressImage } from '../../utils/imageUtils';
import './AdsTab.css';

const AdsTab = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  
  const [filters, setFilters] = useState({
    position: 'all',
    status: 'all',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // ─── Form State ──────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    position: 'sidebar',
    size: '300x250',
    active: true,
    clickable: true,
    priority: 0,
    premium: false,
    startDate: '',
    endDate: '',
    targetUrl: '',
    altText: '',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0'
  });

  // ─── Load Ads ────────────────────────────────────────────────────
  const loadAds = async () => {
    try {
      setLoading(true);
      const data = await getAllAds();
      setAds(data);
      
      const statsData = await getAdStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading ads:', error);
      Swal.fire('Error', 'Failed to load advertisements', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  // ─── Filter Ads ──────────────────────────────────────────────────
  const filteredAds = ads.filter(ad => {
    const matchPosition = filters.position === 'all' || ad.position === filters.position;
    const matchStatus = filters.status === 'all' || 
      (filters.status === 'active' && ad.active) ||
      (filters.status === 'inactive' && !ad.active);
    const matchSearch = !filters.search || 
      ad.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      ad.description?.toLowerCase().includes(filters.search.toLowerCase());
    return matchPosition && matchStatus && matchSearch;
  });

  // ─── Pagination ──────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredAds.length / itemsPerPage);
  const paginatedAds = filteredAds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ─── Image Upload Handler ──────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire('Error', 'Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Error', 'Image must be less than 5MB', 'error');
      return;
    }

    try {
      setUploadingImage(true);
      setUploadProgress(0);

      // Compress image first
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          // Compress to 800px width with 0.7 quality
          const compressed = await compressImage(event.target.result, 800, 600, 0.7);
          
          // Upload to server
          const response = await uploadContentImage(file, (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          });

          if (response && response.url) {
            // Set the image URL in form
            const imageUrl = response.url.startsWith('http') ? response.url : `http://localhost:8080${response.url}`;
            setFormData(prev => ({
              ...prev,
              imageUrl: imageUrl
            }));
            
            Swal.fire({
              icon: 'success',
              title: 'Image uploaded!',
              timer: 1500,
              showConfirmButton: false,
            });
          }
        } catch (error) {
          console.error('Error compressing/uploading:', error);
          Swal.fire('Error', 'Failed to upload image', 'error');
        } finally {
          setUploadingImage(false);
          setUploadProgress(0);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Failed to upload image', 'error');
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  // ─── Remove Image ───────────────────────────────────────────────
  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ─── CRUD Operations ────────────────────────────────────────────
  const handleCreate = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      position: 'sidebar',
      size: '300x250',
      active: true,
      clickable: true,
      priority: 0,
      premium: false,
      startDate: '',
      endDate: '',
      targetUrl: '',
      altText: '',
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0'
    });
    setShowModal(true);
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || '',
      description: ad.description || '',
      imageUrl: ad.imageUrl || '',
      linkUrl: ad.linkUrl || '',
      position: ad.position || 'sidebar',
      size: ad.size || '300x250',
      active: ad.active !== undefined ? ad.active : true,
      clickable: ad.clickable !== undefined ? ad.clickable : true,
      priority: ad.priority || 0,
      premium: ad.premium || false,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().slice(0, 16) : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().slice(0, 16) : '',
      targetUrl: ad.targetUrl || '',
      altText: ad.altText || '',
      backgroundColor: ad.backgroundColor || '#ffffff',
      borderColor: ad.borderColor || '#e2e8f0'
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAd) {
        await updateAd(editingAd.id, formData);
        Swal.fire('Updated!', 'Advertisement updated successfully', 'success');
      } else {
        await createAd(formData);
        Swal.fire('Created!', 'Advertisement created successfully', 'success');
      }
      setShowModal(false);
      loadAds();
    } catch (error) {
      console.error('Error saving ad:', error);
      Swal.fire('Error', 'Failed to save advertisement', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Advertisement?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    
    if (result.isConfirmed) {
      try {
        await deleteAd(id);
        Swal.fire('Deleted!', 'Advertisement removed', 'success');
        loadAds();
      } catch (error) {
        console.error('Error deleting ad:', error);
        Swal.fire('Error', 'Failed to delete advertisement', 'error');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleAdStatus(id);
      loadAds();
    } catch (error) {
      console.error('Error toggling ad status:', error);
      Swal.fire('Error', 'Failed to toggle ad status', 'error');
    }
  };

  // ─── Stats Cards ──────────────────────────────────────────────────
  const StatsCards = () => {
    if (!stats) return null;
    
    const statItems = [
      { 
        label: 'Total Ads', 
        value: stats.totalAds || 0, 
        icon: <Image size={20} />, 
        color: '#6C63FF',
        bg: '#f0f0ff'
      },
      { 
        label: 'Active Ads', 
        value: stats.activeAds || 0, 
        icon: <ToggleRight size={20} />, 
        color: '#16a34a',
        bg: '#dcfce7'
      },
      { 
        label: 'Total Views', 
        value: stats.totalViews || 0, 
        icon: <Eye size={20} />, 
        color: '#2563eb',
        bg: '#dbeafe'
      },
      { 
        label: 'Total Clicks', 
        value: stats.totalClicks || 0, 
        icon: <MousePointer size={20} />, 
        color: '#d97706',
        bg: '#fef3c7'
      },
    ];

    return (
      <div className="ads-stats-grid">
        {statItems.map((item, index) => (
          <div key={index} className="ads-stat-card">
            <div className="ads-stat-icon" style={{ background: item.bg, color: item.color }}>
              {item.icon}
            </div>
            <div className="ads-stat-content">
              <span className="ads-stat-value">{item.value}</span>
              <span className="ads-stat-label">{item.label}</span>
            </div>
          </div>
        ))}
        {stats.clickThroughRate && (
          <div className="ads-stat-card premium">
            <div className="ads-stat-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <TrendingUp size={20} />
            </div>
            <div className="ads-stat-content">
              <span className="ads-stat-value">{stats.clickThroughRate}</span>
              <span className="ads-stat-label">Click-Through Rate</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ─── Loading State ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="ads-loading">
        <div className="ads-spinner" />
        <p>Loading advertisements...</p>
      </div>
    );
  }

  return (
    <div className="ads-tab">
      {/* Header */}
      <div className="ads-header">
        <div className="ads-header-left">
          <h2>Advertisement Management</h2>
          <p className="ads-subtitle">Manage all advertisements across your website</p>
        </div>
        <button className="ads-add-btn" onClick={handleCreate}>
          <Plus size={18} />
          Add New Ad
        </button>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Filters */}
      <div className="ads-filters">
        <div className="ads-filter-group">
          <select
            value={filters.position}
            onChange={(e) => setFilters({ ...filters, position: e.target.value })}
            className="ads-filter-select"
          >
            <option value="all">All Positions</option>
            <option value="header">Header</option>
            <option value="sidebar">Sidebar</option>
            <option value="footer">Footer</option>
            <option value="featured">Featured</option>
            <option value="mid-content">Mid Content</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="ads-filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="ads-search-wrapper">
            <Search size={16} className="ads-search-icon" />
            <input
              type="text"
              placeholder="Search ads..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="ads-search-input"
            />
            {filters.search && (
              <button 
                className="ads-search-clear"
                onClick={() => setFilters({ ...filters, search: '' })}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        <span className="ads-count">{filteredAds.length} ads found</span>
      </div>

      {/* Table */}
      <div className="ads-table-wrapper">
        <table className="ads-table">
          <thead>
            <tr>
              <th>Ad</th>
              <th>Position</th>
              <th>Size</th>
              <th>Status</th>
              <th>Views</th>
              <th>Clicks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAds.length === 0 ? (
              <tr>
                <td colSpan="7" className="ads-empty">
                  <div className="ads-empty-state">
                    <Image size={48} />
                    <p>No advertisements found</p>
                    <button className="ads-empty-btn" onClick={handleCreate}>
                      Create your first ad
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedAds.map((ad) => (
                <tr key={ad.id} className={!ad.active ? 'ads-inactive' : ''}>
                  <td className="ads-title-cell">
                    <div className="ads-title-info">
                      {ad.imageUrl && (
                        <img 
                          src={ad.imageUrl} 
                          alt={ad.title} 
                          className="ads-thumbnail"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div>
                        <div className="ads-title">{ad.title}</div>
                        {ad.description && (
                          <div className="ads-description">{ad.description}</div>
                        )}
                        {ad.premium && (
                          <span className="ads-premium-badge">Premium</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="ads-position-badge">{ad.position || 'N/A'}</span>
                  </td>
                  <td>{ad.size || 'N/A'}</td>
                  <td>
                    <button 
                      className={`ads-status-btn ${ad.active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleStatus(ad.id)}
                    >
                      {ad.active ? (
                        <>
                          <ToggleRight size={14} />
                          Active
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={14} />
                          Inactive
                        </>
                      )}
                    </button>
                  </td>
                  <td>{ad.views || 0}</td>
                  <td>{ad.clicks || 0}</td>
                  <td>
                    <div className="ads-actions">
                      <button 
                        className="ads-action-btn edit"
                        onClick={() => handleEdit(ad)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="ads-action-btn delete"
                        onClick={() => handleDelete(ad.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      {ad.linkUrl && (
                        <a 
                          href={ad.linkUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ads-action-btn view"
                          title="View"
                        >
                          <Eye size={16} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="ads-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="ads-page-btn"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span className="ads-page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="ads-page-btn"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ─── Modal with Image Upload ────────────────────────────── */}
      {showModal && (
        <div className="ads-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ads-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ads-modal-header">
              <h3>{editingAd ? 'Edit Advertisement' : 'Create Advertisement'}</h3>
              <button className="ads-modal-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="ads-modal-body">
              <div className="ads-form-grid">
                {/* Title */}
                <div className="ads-form-group full">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter ad title"
                    required
                  />
                </div>

                {/* Description */}
                <div className="ads-form-group full">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter ad description"
                    rows="2"
                  />
                </div>

                {/* Image Upload - NEW */}
                <div className="ads-form-group full">
                  <label>Image</label>
                  <div className="ads-image-upload">
                    {formData.imageUrl ? (
                      <div className="ads-image-preview">
                        <img src={formData.imageUrl} alt="Ad preview" />
                        <div className="ads-image-actions">
                          <button 
                            type="button"
                            className="ads-image-remove"
                            onClick={removeImage}
                          >
                            <Trash size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="ads-image-dropzone"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <CloudUpload size={40} />
                        <p>Click to upload image</p>
                        <span>PNG, JPG up to 5MB</span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    {uploadingImage && (
                      <div className="ads-upload-progress">
                        <div className="ads-progress-bar">
                          <div 
                            className="ads-progress-fill"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <span>Uploading... {uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Link URL */}
                <div className="ads-form-group full">
                  <label>Link URL</label>
                  <div className="ads-url-input">
                    <Link size={16} />
                    <input
                      type="text"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {/* Position & Size */}
                <div className="ads-form-group">
                  <label>Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  >
                    <option value="header">Header</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="footer">Footer</option>
                    <option value="featured">Featured</option>
                    <option value="mid-content">Mid Content</option>
                  </select>
                </div>

                <div className="ads-form-group">
                  <label>Size</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  >
                    <option value="300x250">300 × 250</option>
                    <option value="728x90">728 × 90</option>
                    <option value="160x600">160 × 600</option>
                    <option value="full-width">Full Width</option>
                  </select>
                </div>

                {/* Start & End Date */}
                <div className="ads-form-group">
                  <label>Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="ads-form-group">
                  <label>End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>

                {/* Priority & Premium */}
                <div className="ads-form-group">
                  <label>Priority</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                  />
                  <small>Higher priority = shown first</small>
                </div>

                <div className="ads-form-group">
                  <label>Premium Ad</label>
                  <div className="ads-toggle-group">
                    <button
                      type="button"
                      className={`ads-toggle-btn ${formData.premium ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, premium: !formData.premium })}
                    >
                      {formData.premium ? 'Yes' : 'No'}
                    </button>
                  </div>
                </div>

                {/* Colors */}
                <div className="ads-form-group">
                  <label>Background Color</label>
                  <div className="ads-color-picker">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div className="ads-form-group">
                  <label>Border Color</label>
                  <div className="ads-color-picker">
                    <input
                      type="color"
                      value={formData.borderColor}
                      onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                    />
                    <input
                      type="text"
                      value={formData.borderColor}
                      onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                      placeholder="#e2e8f0"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="ads-form-group full">
                  <div className="ads-checkboxes">
                    <label className="ads-checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      />
                      Active
                    </label>
                    <label className="ads-checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.clickable}
                        onChange={(e) => setFormData({ ...formData, clickable: e.target.checked })}
                      />
                      Clickable
                    </label>
                  </div>
                </div>

                {/* Alt Text */}
                <div className="ads-form-group full">
                  <label>Alt Text</label>
                  <input
                    type="text"
                    value={formData.altText}
                    onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                    placeholder="Image alt text for accessibility"
                  />
                </div>
              </div>

              <div className="ads-modal-footer">
                <button type="button" className="ads-modal-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="ads-modal-save">
                  {editingAd ? 'Update Ad' : 'Create Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsTab;