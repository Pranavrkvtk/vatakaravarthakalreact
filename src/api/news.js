// src/api/news.js
import api from './axios';

// ===================== PUBLIC USER ENDPOINTS =====================

/**
 * Fetch all published news (for public homepage)
 * @returns {Promise<Array>} List of published news items
 */
export const getAllNews = async () => {
  const response = await api.get('/news/published');
  return response.data;
};

/**
 * Fetch latest news (top 10 published)
 * @returns {Promise<Array>} List of latest news
 */
export const getLatestNews = async () => {
  const response = await api.get('/news/latest');
  return response.data;
};

/**
 * Fetch breaking news
 * @returns {Promise<Array>} List of breaking news
 */
export const getBreakingNews = async () => {
  const response = await api.get('/news/breaking');
  return response.data;
};

/**
 * Fetch trending news (by views)
 * @returns {Promise<Array>} List of trending news
 */
export const getTrendingNews = async () => {
  const response = await api.get('/news/trending');
  return response.data;
};

/**
 * Fetch news by category
 * @param {string} category - Category name (e.g., 'കേരളം')
 * @returns {Promise<Array>} List of news in category
 */
export const getNewsByCategory = async (category) => {
  const response = await api.get(`/news/category/${encodeURIComponent(category)}`);
  return response.data;
};

/**
 * Fetch a single news item by ID (increments view count)
 * @param {number|string} id - News ID
 * @returns {Promise<Object>} News object with updated views
 */
export const getNewsById = async (id) => {
  const response = await api.get(`/news/${id}`);
  return response.data;
};

/**
 * Like a news article
 * @param {number|string} id - News ID
 * @returns {Promise<Object>} Updated news object with new like count
 */
export const likeNews = async (id) => {
  const response = await api.post(`/news/${id}/like`);
  return response.data;
};

/**
 * Search news (public)
 * @param {string} keyword - Search keyword
 * @returns {Promise<Array>} List of matching news
 */
export const searchNews = async (keyword) => {
  const response = await api.get(`/news/search?keyword=${encodeURIComponent(keyword)}`);
  return response.data;
};

// ===================== CATEGORY ENDPOINTS =====================

/**
 * Fetch all categories (public)
 * @returns {Promise<Array>} List of categories
 */
export const getAllCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// ===================== IMAGE UPLOAD ENDPOINT =====================

/**
 * Upload an image for news content
 * @param {File} file - Image file to upload
 * @param {Function} onUploadProgress - Progress callback
 * @returns {Promise<Object>} Upload response with image URL
 */
export const uploadContentImage = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/news/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });

  return response.data;
};

// ===================== ADMIN NEWS ENDPOINTS =====================

/**
 * Create a new news item (admin only)
 * @param {Object} data - News data (title, content, category, image, status, etc.)
 * @returns {Promise<Object>} Created news object
 */
export const createNews = async (data) => {
  const response = await api.post('/news', data);
  return response.data;
};

/**
 * Update an existing news item (admin only)
 * @param {number|string} id - News ID
 * @param {Object} data - Updated news data
 * @returns {Promise<Object>} Updated news object
 */
export const updateNews = async (id, data) => {
  const response = await api.put(`/news/${id}`, data);
  return response.data;
};

/**
 * Delete a news item permanently (admin only)
 * @param {number|string} id - News ID
 * @returns {Promise<void>}
 */
export const deleteNews = async (id) => {
  await api.delete(`/news/${id}`);
};

/**
 * Perform a bulk action on multiple news items (admin only)
 * @param {Array<number|string>} ids - Array of news IDs
 * @param {string} action - One of: 'publish', 'draft', 'trash', 'restore', 'delete'
 * @returns {Promise<void>}
 */
export const bulkAction = async (ids, action) => {
  await api.post('/news/bulk', { ids, action });
};

/**
 * Fetch all news including drafts and trash (admin only)
 * @returns {Promise<Array>} All news items
 */
export const getAllNewsAdmin = async () => {
  const response = await api.get('/news/all');
  return response.data;
};

/**
 * Fetch news by status (admin only)
 * @param {string} status - 'draft', 'published', 'trash'
 * @returns {Promise<Array>} News items with given status
 */
export const getNewsByStatus = async (status) => {
  const response = await api.get(`/news/status/${status}`);
  return response.data;
};

// ===================== SEARCH ENDPOINTS =====================

/**
 * Get search suggestions (autocomplete)
 * @param {string} prefix - Search prefix
 * @returns {Promise<Array>} List of suggested titles
 */
export const getSearchSuggestions = async (prefix) => {
  const response = await api.get(`/news/search/suggestions?prefix=${encodeURIComponent(prefix)}`);
  return response.data;
};

/**
 * Advanced search with pagination
 * @param {string} keyword - Search keyword
 * @param {number} page - Page number (0-based)
 * @param {number} size - Items per page
 * @param {string} sortBy - Sort: 'relevance', 'latest', 'oldest', 'views', 'likes'
 * @returns {Promise<Object>} Search results with pagination
 */
export const searchNewsAdvanced = async (keyword, page = 0, size = 10, sortBy = 'relevance') => {
  const response = await api.get('/news/search', {
    params: { keyword, page, size, sortBy }
  });
  return response.data;
};

/**
 * Advanced search with multiple filters
 * @param {Object} params - Search parameters
 * @param {string} params.keyword - Search keyword
 * @param {string} params.category - Category filter
 * @param {string} params.author - Author filter
 * @param {string} params.fromDate - Start date (YYYY-MM-DD)
 * @param {string} params.toDate - End date (YYYY-MM-DD)
 * @param {number} params.page - Page number
 * @param {number} params.size - Items per page
 * @param {string} params.sortBy - Sort field
 * @returns {Promise<Object>} Search results
 */
export const advancedSearch = async (params) => {
  const response = await api.get('/news/search/advanced', { params });
  return response.data;
};

// ===================== AD ENDPOINTS =====================

/**
 * Get all ads (admin)
 * @returns {Promise<Array>} List of all ads
 */
export const getAllAds = async () => {
  const response = await api.get('/ads');
  return response.data;
};

/**
 * Get active ads (public)
 * @returns {Promise<Array>} List of active ads
 */
export const getActiveAds = async () => {
  const response = await api.get('/ads/active');
  return response.data;
};

/**
 * Get ads by position (public)
 * @param {string} position - header, sidebar, footer, featured, mid-content
 * @returns {Promise<Array>} List of ads in that position
 */
export const getAdsByPosition = async (position) => {
  const response = await api.get(`/ads/position/${position}`);
  return response.data;
};

/**
 * Get a single ad by ID
 * @param {number|string} id - Ad ID
 * @returns {Promise<Object>} Ad object
 */
export const getAdById = async (id) => {
  const response = await api.get(`/ads/${id}`);
  return response.data;
};

/**
 * Create a new ad (admin only)
 * @param {Object} data - Ad data
 * @returns {Promise<Object>} Created ad
 */
export const createAd = async (data) => {
  const response = await api.post('/ads', data);
  return response.data;
};

/**
 * Update an ad (admin only)
 * @param {number|string} id - Ad ID
 * @param {Object} data - Updated ad data
 * @returns {Promise<Object>} Updated ad
 */
export const updateAd = async (id, data) => {
  const response = await api.put(`/ads/${id}`, data);
  return response.data;
};

/**
 * Delete an ad (admin only)
 * @param {number|string} id - Ad ID
 * @returns {Promise<void>}
 */
export const deleteAd = async (id) => {
  await api.delete(`/ads/${id}`);
};

/**
 * Toggle ad active status (admin only)
 * @param {number|string} id - Ad ID
 * @returns {Promise<Object>} Updated ad
 */
export const toggleAdStatus = async (id) => {
  const response = await api.patch(`/ads/${id}/toggle`);
  return response.data;
};

/**
 * Record ad view (public)
 * @param {number|string} id - Ad ID
 * @returns {Promise<Object>} Response
 */
export const recordAdView = async (id) => {
  const response = await api.post(`/ads/${id}/view`);
  return response.data;
};

/**
 * Record ad click (public)
 * @param {number|string} id - Ad ID
 * @returns {Promise<Object>} Response
 */
export const recordAdClick = async (id) => {
  const response = await api.post(`/ads/${id}/click`);
  return response.data;
};

/**
 * Get ad statistics (admin only)
 * @returns {Promise<Object>} Ad statistics
 */
export const getAdStats = async () => {
  const response = await api.get('/ads/stats');
  return response.data;
};

/**
 * Bulk delete ads (admin only)
 * @param {Array<number|string>} ids - Array of ad IDs
 * @returns {Promise<void>}
 */
export const bulkDeleteAds = async (ids) => {
  await api.delete('/ads/bulk', { data: ids });
};