// src/components/pages/CategoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsByCategory } from '../../api/news';
import { CATEGORY_COLORS } from './HomePage';
import { Clock, ArrowRight, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import './CategoryPage.css';

// Reuse the DateLine component from HomePage
const DateLine = ({ date, className = '' }) => {
  const d = date ? new Date(date) : null;
  const formatted = d && !isNaN(d.getTime()) 
    ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
    : 'Just now';
  return (
    <span className={`date-meta flex items-center gap-1 text-sm text-gray-500 ${className}`}>
      <Clock size={12} /> {formatted}
    </span>
  );
};

const CategoryPage = () => {
  const { category } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Decode the category name from URL
      const decodedCategory = decodeURIComponent(category);
      console.log('Fetching news for category:', decodedCategory);
      
      const data = await getNewsByCategory(decodedCategory);
      console.log('API Response:', data);
      
      // Handle different response formats
      let newsData = [];
      if (Array.isArray(data)) {
        newsData = data;
      } else if (data && data.news && Array.isArray(data.news)) {
        newsData = data.news;
      } else if (data && data.data && Array.isArray(data.data)) {
        newsData = data.data;
      } else {
        newsData = [];
      }
      
      // Filter out items without titles or with empty titles
      const validNews = newsData.filter(item => item.title && item.title.trim() !== '');
      console.log('Valid news items:', validNews.length);
      
      setNews(validNews);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching category news:', err);
      
      let errorMessage = 'Failed to load news for this category.';
      if (err.response) {
        errorMessage = err.response.data?.message || 
                      `Server error (${err.response.status})`;
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [category, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Loading State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading news for "{decodeURIComponent(category)}"...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={48} />
          <p className="text-red-600 font-medium">{error}</p>
          <div className="mt-4 flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw size={16} /> Retry
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No News State
  if (!news || news.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          "{decodeURIComponent(category)}" വാർത്തകളൊന്നുമില്ല
        </h2>
        <p className="text-gray-500 mb-4">No news articles found in this category.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline"
        >
          ← മുഖ്യപുറത്തേക്ക് മടങ്ങുക
        </Link>
      </div>
    );
  }

  // Featured news (first item)
  const featured = news[0];
  const rest = news.slice(1);
  
  // Get category color with fallback
  const categoryColor = CATEGORY_COLORS?.[category] || '#4338ca';
  const decodedCategory = decodeURIComponent(category);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: categoryColor }}
          >
            {decodedCategory}
          </span>
          <span className="text-sm font-normal text-gray-500">
            ({news.length} വാർത്തകൾ)
          </span>
        </h1>
        <Link
          to="/"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          ← Home
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured News */}
          {featured && (
            <div className="featured-news bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
              <Link to={`/news/${featured.id || featured._id}`} className="block">
                <div className="relative">
                  {featured.image && (
                    <img
                      src={featured.image}
                      alt={featured.title || 'News image'}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  )}
                  {/* Category badge overlay */}
                  <span
                    className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-medium"
                    style={{ backgroundColor: categoryColor }}
                  >
                    {decodedCategory}
                  </span>
                </div>
                <div className="p-4">
                  <h2 className="text-2xl font-bold hover:text-blue-600 transition">
                    {featured.title || 'Untitled'}
                  </h2>
                  {featured.summary && (
                    <p className="text-gray-600 mt-2">{featured.summary}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <DateLine date={featured.publishedDate || featured.publishedAt || featured.createdAt} />
                    {featured.views !== undefined && (
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <span>👁️</span> {featured.views}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Rest of the news in a grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rest.map((item) => {
                const itemId = item.id || item._id;
                return (
                  <div
                    key={itemId}
                    className="news-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    <Link to={`/news/${itemId}`} className="block">
                      <div className="relative">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title || 'News image'}
                            className="w-full h-40 object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        )}
                        <span
                          className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-xs font-medium"
                          style={{ backgroundColor: categoryColor }}
                        >
                          {decodedCategory}
                        </span>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-lg line-clamp-2 hover:text-blue-600 transition">
                          {item.title || 'Untitled'}
                        </h3>
                        {item.summary && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {item.summary}
                          </p>
                        )}
                        <div className="flex justify-between items-center mt-3">
                          <DateLine date={item.publishedDate || item.publishedAt || item.createdAt} />
                          <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                            Read <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar - Trending Section */}
        <aside className="hidden lg:block space-y-4">
          {/* Trending Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-yellow-500" />
              <h3 className="font-bold text-gray-700">TRENDING</h3>
            </div>
            <div className="space-y-3">
              {news.slice(0, 5).map((item, index) => {
                const itemId = item.id || item._id;
                // Skip items without titles
                if (!item.title || item.title.trim() === '') return null;
                
                return (
                  <Link 
                    key={itemId} 
                    to={`/news/${itemId}`}
                    className="block hover:bg-gray-50 p-2 rounded transition group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-gray-400 min-w-[20px] group-hover:text-blue-600">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 group-hover:text-blue-600 transition">
                          {item.title || 'Untitled'}
                        </p>
                        <DateLine 
                          date={item.publishedDate || item.publishedAt || item.createdAt} 
                          className="text-xs mt-1"
                        />
                      </div>
                    </div>
                  </Link>
                );
              }).filter(Boolean)} {/* Remove null items */}
            </div>
          </div>

          {/* Advertisement */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-400 text-xs text-center mb-2">— ADVERTISEMENT —</p>
            <div className="h-64 bg-gray-100 flex items-center justify-center rounded">
              <span className="text-gray-400 text-sm">300×250 Ad</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default CategoryPage;