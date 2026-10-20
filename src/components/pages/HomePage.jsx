// src/components/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { getAllNews, getAdsByPosition, recordAdView, recordAdClick } from '../../api/news';
import { getImageSrc } from '../../utils/imageUtils';
import { ChevronLeft, ChevronRight, Clock, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './HomePage.css';

// ----------------------------------------------------------------
// Category color map (shared across the app)
// ----------------------------------------------------------------
export const CATEGORY_COLORS = {
  'കേരളം': '#4338ca',
  'പ്രാദേശികം': '#4338ca',
  'ചരമം': '#d97706',
  'കായികം': '#059669',
  'യാത്ര': '#0284c7',
  'ദേശീയം': '#7c3aed',
  'വിദേശം': '#0d9488',
  'മലബാർ': '#b45309',
  'കല': '#db2777',
  'പരമം': '#4f46e5',
};

// ----------------------------------------------------------------
// Helper: format date from backend (publishedDate or createdAt)
// ----------------------------------------------------------------
const formatDate = (news) => {
  const raw = news.publishedDate || news.createdAt || news.date;
  if (!raw) return 'Just now';
  const d = new Date(raw);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ----------------------------------------------------------------
// Helper: Check if news is from the last 7 days
// ----------------------------------------------------------------
const isFromLastWeek = (news) => {
  const raw = news.publishedDate || news.createdAt || news.date;
  if (!raw) return false;
  const d = new Date(raw);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return d >= weekAgo;
};

// ----------------------------------------------------------------
// Helper: safe image src with placeholder fallback
// ----------------------------------------------------------------
const safeImage = (image) => {
  if (typeof getImageSrc === 'function') {
    return getImageSrc(image) || '/placeholder-image.jpg';
  }
  return image || '/placeholder-image.jpg';
};

const handleImgError = (e) => {
  console.error('Image failed to load:', e.target.src);
  e.target.onerror = null;
  e.target.src = '/placeholder-image.jpg';
};

// ----------------------------------------------------------------
// Ad Component - Display advertisement with tracking
// ----------------------------------------------------------------
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
        } else {
          console.log(`⚠️ No ads found for position: ${position}`);
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
      <div className={`real-ad-container ${className}`}>
        <div className="ad-label">— ADVERTISEMENT —</div>
        <div className="ad-loading" style={{
          height: position === 'sidebar' ? '300px' : '180px',
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
    return null;
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

  const getObjectFit = () => 'contain';

  const getMaxHeight = () => {
    if (position === 'sidebar') return '300px';
    return 'auto';
  };

  const getMinHeight = () => {
    if (position === 'sidebar') return '200px';
    return 'auto';
  };

  const getBorderRadius = () => {
    if (position === 'footer' || position === 'header' || position === 'mid-content') return '0';
    if (position === 'sidebar') return '0';
    return '12px';
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
          borderRadius: getBorderRadius(),
          overflow: 'hidden',
          display: 'block',
          transition: 'all 0.3s ease',
          textDecoration: 'none',
          width: '100%',
        }}
      >
        {ad.imageUrl ? (
          <img
            src={safeImage(ad.imageUrl)}
            alt={ad.altText || ad.title || 'Advertisement'}
            className="real-ad-image"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: getObjectFit(),
              maxHeight: getMaxHeight(),
              minHeight: getMinHeight(),
            }}
            onError={(e) => {
              console.error('❌ Ad image failed to load:', ad.imageUrl);
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div style="padding:20px;text-align:center;min-height:200px;display:flex;align-items:center;justify-content:center;flex-direction:column;width:100%;">
                    <h4 style="margin:0;color:#0f172a;font-size:18px;">${ad.title || 'Advertisement'}</h4>
                    ${ad.description ? `<p style="margin:8px 0 0;color:#64748b;font-size:15px;">${ad.description}</p>` : ''}
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '100%',
          }}>
            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>{ad.title || 'Advertisement'}</h4>
            {ad.description && (
              <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '15px' }}>{ad.description}</p>
            )}
          </div>
        )}
        {ads.length > 1 && (
          <div className="ad-dots" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 0',
            background: '#f8fafc'
          }}>
            {ads.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: idx === currentIndex ? '20px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
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

// ----------------------------------------------------------------
// Reusable: DateLine (used by Sidebar)
// ----------------------------------------------------------------
const DateLine = ({ date, className = '' }) => (
  <span className={`date-meta ${className}`}>
    <Clock size={12} /> {date}
  </span>
);

// ================================================================
// Sidebar Component with Weekly Trending (dates retained)
// ================================================================
const Sidebar = ({ newsData }) => {
  const [tab, setTab] = useState('latest');
  const [trendingIndex, setTrendingIndex] = useState(0);

  const latestItems = [...newsData].slice(0, 5);

  const getTrendingItems = () => {
    const weeklyNews = [...newsData].filter(item => isFromLastWeek(item));

    const sortedByViews = [...weeklyNews]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    if (sortedByViews.length < 5) {
      return [...newsData]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);
    }

    return sortedByViews;
  };

  const list = tab === 'latest' ? latestItems : getTrendingItems();

  useEffect(() => {
    if (tab === 'trending' && list.length > 0) {
      const interval = setInterval(() => {
        setTrendingIndex((prev) => (prev + 1) % list.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [tab, list.length]);

  useEffect(() => {
    setTrendingIndex(0);
  }, [tab]);

  if (!list.length) return null;

  const currentTrendingItem = list[trendingIndex] || list[0];

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        <button
          onClick={() => { setTab('latest'); setTrendingIndex(0); }}
          className={`tab-latest ${tab === 'latest' ? 'active' : ''}`}
        >
          LATEST
        </button>
        <button
          onClick={() => { setTab('trending'); setTrendingIndex(0); }}
          className={`tab-trending ${tab === 'trending' ? 'active' : ''}`}
        >
          <Zap size={14} /> TRENDING
        </button>
      </div>

      {tab === 'latest' && list.length > 0 && (
        <div className="sidebar-featured">
          <Link
            to={`/news/${list[0].id}`}
            className="img-wrap"
            style={{ display: 'block' }}
          >
            <img
              src={safeImage(list[0].image)}
              alt={list[0].title || 'News'}
              onError={handleImgError}
            />
            <div className="overlay"><p>{list[0].title}</p></div>
          </Link>
          <DateLine date={formatDate(list[0])} className="mt-2" />
        </div>
      )}

      {tab === 'trending' && list.length > 0 && (
        <div className="sidebar-trending">
          <div className="trending-slider">
            <Link to={`/news/${currentTrendingItem.id}`} className="trending-item-link">
              <div className="trending-item-card">
                <div className="trending-item-image">
                  <img
                    src={safeImage(currentTrendingItem.image)}
                    alt={currentTrendingItem.title || 'News'}
                    className="trending-img"
                    onError={handleImgError}
                  />
                </div>
                <div className="trending-item-content">
                  <h4 className="trending-item-title">{currentTrendingItem.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <DateLine date={formatDate(currentTrendingItem)} />
                  </div>
                </div>
              </div>
            </Link>

            <div className="trending-dots">
              {list.map((_, idx) => (
                <span
                  key={idx}
                  className={`trending-dot ${idx === trendingIndex ? 'active' : ''}`}
                  onClick={() => setTrendingIndex(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'latest' && (
        <ul className="sidebar-news-list">
          {list.slice(1).map((n) => (
            <li key={n.id}>
              <Link to={`/news/${n.id}`} style={{ display: 'flex', gap: '10px', textDecoration: 'none', flex: 1 }}>
                <img
                  src={safeImage(n.image)}
                  alt={n.title || 'News'}
                  onError={handleImgError}
                />
                <div className="info">
                  <p>{n.title}</p>
                  <DateLine date={formatDate(n)} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="sidebar-ad">
        <AdDisplay position="sidebar" />
      </div>
    </aside>
  );
};

// ================================================================
// Breaking Ticker with Auto-Rotation (no date)
// ================================================================
const BreakingTicker = ({ newsData }) => {
  const [index, setIndex] = useState(0);
  const items = newsData.slice(0, 5);

  useEffect(() => {
    if (items.length > 0) {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % items.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [items.length]);

  if (!items.length) return null;

  const item = items[index] || items[0];
  const go = (dir) => {
    setIndex((i) => (i + dir + items.length) % items.length);
  };

  return (
    <div className="ticker">
      <span className="badge"><Zap size={12} /> TRENDING</span>
      <Link to={`/news/${item.id}`} className="ticker-link">
        <p className="text">{item.title}</p>
      </Link>
      <span className="ticker-counter">{index + 1}/{items.length}</span>
      <div className="controls">
        <button onClick={() => go(-1)}><ChevronLeft size={15} /></button>
        <button onClick={() => go(1)}><ChevronRight size={15} /></button>
      </div>
    </div>
  );
};

// ================================================================
// Ad wrappers
// ================================================================
const AdBanner = () => (
  <div className="ad-banner-wrapper">
    <AdDisplay position="header" className="header-ad" />
  </div>
);

const MidAd = () => (
  <div className="mid-ad">
    <AdDisplay position="mid-content" className="mid-content-ad" />
  </div>
);

const FooterAd = () => (
  <div className="footer-ad-wrapper">
    <AdDisplay position="footer" className="footer-ad-display" />
  </div>
);

// ================================================================
// NewsCard - Individual news card (no date)
// ================================================================
const NewsCard = ({ news }) => (
  <div className="news-card">
    <div className="img-wrap">
      <Link to={`/news/${news.id}`} style={{ display: 'block' }}>
        <img
          src={safeImage(news.image)}
          alt={news.title || 'News'}
          onError={handleImgError}
        />
        <span
          className="category-tag"
          style={{ backgroundColor: CATEGORY_COLORS[news.category] || '#4338ca' }}
        >
          {news.category || 'Uncategorized'}
        </span>
      </Link>
    </div>
    <div className="body">
      <Link to={`/news/${news.id}`} style={{ textDecoration: 'none' }}>
        <h3>{news.title}</h3>
      </Link>
      <div className="footer" style={{ justifyContent: 'flex-end' }}>
        <Link to={`/news/${news.id}`} className="read-more">
          Read <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  </div>
);

// ================================================================
// NewsGrid - All cards equal size
// ================================================================
const NewsGrid = ({ newsData }) => {
  if (!newsData || newsData.length === 0) return null;

  return (
    <div className="news-grid">
      {newsData.map((n) => (
        <NewsCard key={n.id} news={n} />
      ))}
    </div>
  );
};

// ================================================================
// HomePage
// ================================================================
const HomePage = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllNews()
      .then((data) => {
        const publishedNews = data.filter(
          (item) => item.status === 'published' || !item.status
        );

        console.log(`📰 Total: ${data.length}, Published: ${publishedNews.length}`);
        setNewsData(publishedNews);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching news:', err);
        setError('Failed to load news. Please try again later.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <main className="main-layout">
          <div style={{ padding: '40px', textAlign: 'center', width: '100%' }}>
            Loading news...
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <main className="main-layout">
          <div className="error">{error}</div>
        </main>
      </div>
    );
  }

  if (!newsData || newsData.length === 0) {
    return (
      <div className="app-container">
        <main className="main-layout">
          <div style={{ padding: '40px', textAlign: 'center', width: '100%' }}>
            No news available
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header-ad-wrapper">
        <AdBanner />
      </div>

      <main className="main-layout">
        <Sidebar newsData={newsData} />
        <div className="main-content">
          <BreakingTicker newsData={newsData} />
          <MidAd />
          <NewsGrid newsData={newsData} />
          <FooterAd />
        </div>
      </main>
    </div>
  );
};

export default HomePage;