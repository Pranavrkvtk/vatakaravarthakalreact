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

    // ===================== ADMIN ENDPOINTS =====================

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