// src/components/pages/CategoryPage.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsByCategory, getAdsByPosition, recordAdView, recordAdClick } from '../../api/news';
import { CATEGORY_COLORS } from './HomePage';
import { 
  Clock, ArrowRight, AlertCircle, RefreshCw, Zap, 
  ChevronRight, Sparkles, Flame, Bookmark 
} from 'lucide-react';
import './CategoryPage.css';

// ─── Fallback image ──────────────────────────────────────────
const FALLBACK_IMG =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240">
       <rect width="100%" height="100%" fill="#f1f5f9"/>
       <text x="50%" y="50%" fill="#94a3b8" font-family="sans-serif" font-size="14"
             text-anchor="middle" dominant-baseline="middle">No image</text>
     </svg>`
  );

// ─── Get Image URL Helper ────────────────────────────────────
const getImageUrl = (item) => {
  if (!item) return FALLBACK_IMG;

  if (typeof item === 'string') {
    if (item.startsWith('data:') || item.startsWith('http://') || item.startsWith('https://')) {
      return item;
    }
    return item.startsWith('/') ? item : `/${item}`;
  }

  const possibleFields = [
    'image', 'imageUrl', 'imagePath', 'thumbnail', 'coverImage',
    'image_url', 'img', 'picture', 'photo', 'cover',
    'featuredImage', 'featured_image'
  ];

  let image = null;

  for (const field of possibleFields) {
    const value = item[field];
    if (value) {
      if (typeof value === 'object') {
        image = value.url || value.path || value.image || null;
      } else if (typeof value === 'string') {
        image = value;
      }
      if (image) break;
    }
  }

  if (!image) {
    for (const key of Object.keys(item)) {
      const val = item[key];
      if (typeof val === 'string' && 
          (val.startsWith('data:image') || 
           val.startsWith('/uploads') || 
           val.startsWith('/images') ||
           val.startsWith('http'))) {
        image = val;
        break;
      }
    }
  }

  if (!image) return FALLBACK_IMG;

  if (image.startsWith('data:') || image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  return image.startsWith('/') ? image : `/${image}`;
};

// ─── Optimized Image Component ──────────────────────────────
const OptimizedImage = ({ src, alt, className = '', priority = false }) => {
  const [imgSrc, setImgSrc] = useState(FALLBACK_IMG);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(priority);
  const imgRef = useRef(null);

  useEffect(() => {
    if (priority) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.01 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.disconnect();
      }
    };
  }, [priority]);

  useEffect(() => {
    if (isVisible) {
      const url = getImageUrl(src);
      setImgSrc(url);
    }
  }, [isVisible, src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMG;
    setIsLoaded(true);
  };

  return (
    <div ref={imgRef} className="image-wrapper">
      {!isLoaded && isVisible && (
        <div className="image-skeleton shimmer">
          <div className="skeleton-content">
            <span className="skeleton-icon">🖼️</span>
            <span className="skeleton-text">Loading...</span>
          </div>
        </div>
      )}
      {!isVisible && (
        <div className="image-skeleton">
          <div className="skeleton-content">
            <span className="skeleton-icon">📰</span>
          </div>
        </div>
      )}
      {isVisible && (
        <img
          src={imgSrc}
          alt={alt || 'News image'}
          className={`${className} ${isLoaded ? 'image-loaded' : 'image-loading'}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
};

// ─── DateLine Component ──────────────────────────────────────
const DateLine = ({ date, className = '' }) => {
  const d = date ? new Date(date) : null;
  const formatted = d && !isNaN(d.getTime())
    ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Just now';
  return (
    <span className={`date-line ${className}`}>
      <Clock size={14} /> {formatted}
    </span>
  );
};

// ─── CategoryPill Component ──────────────────────────────────
const CategoryPill = ({ label, className = '' }) => {
  const color = CATEGORY_COLORS?.[label] || '#6C63FF';
  return (
    <span
      className={`category-pill ${className}`}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  );
};

// ─── Ad Display Component ────────────────────────────────────
const AdDisplay = ({ position, className = '' }) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadAds = async () => {
      try {
        console.log(`📢 Fetching ads for position: ${position}`);
        const data = await getAdsByPosition(position);
        console.log(`📢 Ads response for ${position}:`, data);
        
        if (data && data.length > 0) {
          setAds(data);
          if (data[0].id) {
            recordAdView(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading ads:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAds();
  }, [position]);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const newIndex = (prev + 1) % ads.length;
          if (ads[newIndex]?.id) {
            recordAdView(ads[newIndex].id);
          }
          return newIndex;
        });
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [ads]);

  if (loading) {
    return (
      <div className="real-ad-container">
        <div className="ad-label">— ADVERTISEMENT —</div>
        <div className="ad-loading" style={{ 
          height: '250px', 
          background: '#f1f5f9', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          fontSize: '14px'
        }}>
          Loading ad...
        </div>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="ad-card">
        <div className="ad-header">
          <span className="ad-label">— Sponsored —</span>
        </div>
        <div className="ad-content">
          <div className="ad-placeholder">
            <span className="ad-icon">📢</span>
            <p>Advertise Here</p>
            <span className="ad-size">300 × 250</span>
          </div>
        </div>
      </div>
    );
  }

  const ad = ads[currentIndex];

  const handleAdClick = (e) => {
    if (ad.id) {
      recordAdClick(ad.id);
    }
    if (!ad.linkUrl) {
      e.preventDefault();
    }
  };

  return (
    <div className={`real-ad-container ${className}`}>
      <div className="ad-label">— ADVERTISEMENT —</div>
      <a
        href={ad.linkUrl || '#'}
        target={ad.linkUrl ? '_blank' : '_self'}
        rel="noopener noreferrer"
        onClick={handleAdClick}
        className="real-ad-link"
        style={{
          backgroundColor: ad.backgroundColor || '#ffffff',
          border: `1px solid ${ad.borderColor || '#e2e8f0'}`,
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'block',
          transition: 'all 0.3s ease',
          textDecoration: 'none',
        }}
      >
        {ad.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.altText || ad.title || 'Advertisement'}
            className="real-ad-image"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'contain',
              maxHeight: '250px',
            }}
            onError={(e) => {
              console.error('❌ Ad image failed to load:', ad.imageUrl);
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div style="padding:20px;text-align:center;">
                    <h4 style="margin:0;color:#0f172a;font-size:16px;">${ad.title || 'Advertisement'}</h4>
                    ${ad.description ? `<p style="margin:8px 0 0;color:#64748b;font-size:14px;">${ad.description}</p>` : ''}
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '16px' }}>{ad.title || 'Advertisement'}</h4>
            {ad.description && (
              <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '14px' }}>{ad.description}</p>
            )}
          </div>
        )}
        {ads.length > 1 && (
          <div className="ad-dots" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '6px', 
            padding: '8px 0',
            background: '#f8fafc'
          }}>
            {ads.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: idx === currentIndex ? '16px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === currentIndex ? '#6C63FF' : '#e2e8f0',
                  transition: 'all 0.3s ease',
                  display: 'inline-block',
                }}
              />
            ))}
          </div>
        )}
      </a>
    </div>
  );
};

// ─── ✅ UPDATED: Trending Section with Images (No View Count) ──
const TrendingSection = ({ news }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate trending news every 5 seconds
  useEffect(() => {
    if (news.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.min(news.length, 5));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [news.length]);

  const trendingNews = news.slice(0, 5);

  if (trendingNews.length === 0) return null;

  const currentItem = trendingNews[currentIndex];

  return (
    <div className="trending-section">
      <div className="trending-header">
        <div className="trending-title-group">
          <Flame className="trending-flame" size={20} />
          <h3>Trending Now</h3>
          <span className="trending-badge">HOT</span>
        </div>
        <div className="trending-pulse" />
      </div>

      {/* ✅ Featured Trending Item with Image */}
      <div className="trending-featured">
        <Link to={`/news/${currentItem.id || currentItem._id}`} className="trending-featured-link">
          <div className="trending-featured-image">
            <OptimizedImage
              src={currentItem}
              alt={currentItem.title}
              className="trending-featured-img"
              priority={false}
            />
            <div className="trending-featured-overlay">
              <span className="trending-rank-badge">#{currentIndex + 1}</span>
            </div>
          </div>
          <div className="trending-featured-content">
            <h4 className="trending-featured-title">{currentItem.title}</h4>
            <div className="trending-featured-meta">
              <DateLine date={currentItem.publishedDate || currentItem.publishedAt || currentItem.createdAt} />
            </div>
          </div>
        </Link>
      </div>

      {/* ✅ Trending List with Small Images - No View Count */}
      <div className="trending-list">
        {trendingNews.map((item, index) => {
          const itemId = item.id || item._id;
          const colors = ['#FF6B6B', '#FFB347', '#4ECDC4', '#45B7D1', '#6C63FF'];
          const isActive = index === currentIndex;
          
          return (
            <Link
              key={itemId}
              to={`/news/${itemId}`}
              className={`trending-item ${hoveredIndex === index ? 'hovered' : ''} ${isActive ? 'active' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="trending-item-image-wrapper">
                <img
                  src={getImageUrl(item)}
                  alt={item.title}
                  className="trending-item-img"
                  onError={(e) => {
                    e.target.src = FALLBACK_IMG;
                  }}
                />
                <div className="trending-number" style={{ background: colors[index] }}>
                  {index + 1}
                </div>
              </div>
              <div className="trending-content">
                <p className="trending-title">{item.title}</p>
                <div className="trending-meta">
                  <span className="trending-date">
                    <Clock size={12} /> 
                    {item.publishedDate || item.createdAt ? 
                      new Date(item.publishedDate || item.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric', month: 'short' 
                      }) : 'Recent'
                    }
                  </span>
                </div>
              </div>
              <ChevronRight className="trending-arrow" size={16} />
            </Link>
          );
        })}
      </div>

      {/* Dots indicator */}
      <div className="trending-dots">
        {trendingNews.map((_, index) => (
          <span
            key={index}
            className={`trending-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Main CategoryPage Component ─────────────────────────────
const CategoryPage = () => {
  const { category } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const decodedCategory = decodeURIComponent(category || '');
      const data = await getNewsByCategory(decodedCategory);

      let newsData = [];
      if (Array.isArray(data)) newsData = data;
      else if (data?.news && Array.isArray(data.news)) newsData = data.news;
      else if (data?.data && Array.isArray(data.data)) newsData = data.data;
      else newsData = [];

      const validNews = newsData.filter((item) => item.title?.trim());
      setNews(validNews);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching category news:', err);
      setError('Failed to load news. Please try again.');
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews, retryCount]);

  const handleRetry = () => setRetryCount((prev) => prev + 1);

  const decodedCategory = decodeURIComponent(category || '');
  const categoryColor = CATEGORY_COLORS?.[decodedCategory] || '#6C63FF';

  if (loading) {
    return (
      <div className="category-state">
        <div className="loading-spinner">
          <div className="spinner-ring" />
          <div className="spinner-ring" />
          <div className="spinner-ring" />
        </div>
        <p className="loading-text">Loading {decodedCategory} news...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-state">
        <div className="error-card">
          <div className="error-icon">
            <AlertCircle size={48} />
          </div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleRetry} className="btn-primary">
              <RefreshCw size={16} /> Try Again
            </button>
            <Link to="/" className="btn-secondary">
              ← Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="category-state">
        <div className="empty-state">
          <div className="empty-icon">📰</div>
          <h2>No articles found</h2>
          <p>We couldn't find any news in "{decodedCategory}"</p>
          <Link to="/" className="btn-primary">
            ← Browse All News
          </Link>
        </div>
      </div>
    );
  }

  const featured = news[0];
  const rest = news.slice(1);

  return (
    <div className="category-page">
      <div className="category-bg">
        <div className="category-bg-gradient" />
        <div className="category-bg-pattern" />
      </div>

      <div className="category-container">
        {/* Category Header */}
        <div className="category-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="category-title">
                {decodedCategory}
              </h1>
            </div>
            <Link to="/" className="back-home">
              <ChevronRight size={16} className="back-icon" />
              Back Home
            </Link>
          </div>
          <div className="header-accent" style={{ background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}88)` }} />
        </div>

        {/* Main Layout */}
        <div className="category-layout">
          <div className="category-main">
            {/* Featured Article */}
            <article className="featured-article">
              <Link to={`/news/${featured.id || featured._id}`} className="featured-link">
                <div className="featured-image">
                  <OptimizedImage
                    src={featured}
                    alt={featured.title}
                    className="featured-img"
                    priority={true}
                  />
                  <div className="featured-overlay">
                    <div className="featured-badges">
                      <CategoryPill label={featured.category || decodedCategory} />
                      {featured.featured && <span className="badge-featured">⭐ Featured</span>}
                      {featured.breakingNews && <span className="badge-breaking">🔴 Breaking</span>}
                    </div>
                  </div>
                </div>
                <div className="featured-content">
                  <h2 className="featured-title">{featured.title}</h2>
                  {featured.subtitle && (
                    <p className="featured-subtitle">{featured.subtitle}</p>
                  )}
                  <div className="featured-meta">
                    <div className="meta-left">
                      {featured.author && (
                        <span className="featured-author">
                          <span className="author-avatar" />
                          {featured.author}
                        </span>
                      )}
                      <DateLine date={featured.publishedDate || featured.publishedAt || featured.createdAt} />
                    </div>
                    <span className="read-more-btn">
                      Read Article <ArrowRight size={18} className="arrow-icon" />
                    </span>
                  </div>
                </div>
              </Link>
            </article>

            {/* News Grid */}
            <div className="news-grid">
              {rest.map((item) => {
                const itemId = item.id || item._id;
                return (
                  <article key={itemId} className="news-card">
                    <Link to={`/news/${itemId}`} className="card-link">
                      <div className="card-image">
                        <OptimizedImage
                          src={item}
                          alt={item.title}
                          className="card-img"
                          priority={false}
                        />
                        <CategoryPill label={item.category || decodedCategory} className="card-category" />
                        {item.breakingNews && <span className="card-breaking">LIVE</span>}
                      </div>
                      <div className="card-content">
                        <h3 className="card-title">{item.title}</h3>
                        {item.subtitle && (
                          <p className="card-excerpt">{item.subtitle}</p>
                        )}
                        <div className="card-footer">
                          <DateLine date={item.publishedDate || item.publishedAt || item.createdAt} />
                          <div className="card-actions">
                            <button className="card-save" onClick={(e) => { e.preventDefault(); }}>
                              <Bookmark size={14} />
                            </button>
                            <span className="card-read">
                              Read <ArrowRight size={14} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Sidebar - with Real Ads */}
          <aside className="category-sidebar">
            {/* ✅ Trending Section with Images (No View Count) */}
            <TrendingSection news={news} />

            {/* ✅ Real Ad Display */}
            <AdDisplay position="sidebar" />

            {/* Newsletter Card */}
            <div className="newsletter-card">
              <div className="newsletter-icon">📬</div>
              <h4>Get the latest news</h4>
              <p>Subscribe to our newsletter for daily updates</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Enter your email" />
                <button>Subscribe</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;