// src/components/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { getAllNews, getAdsByPosition, recordAdView, recordAdClick } from '../../api/news';
import { Rss, Search, ChevronLeft, ChevronRight, Clock, Zap, Menu, ArrowRight } from 'lucide-react';
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

  // Rotate ads every 8 seconds
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
          height: position === 'sidebar' ? '200px' : '90px', 
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
    console.log(`⚠️ No ads found for position: ${position}`);
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
              maxHeight: position === 'sidebar' ? '250px' : '120px',
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

// ----------------------------------------------------------------
// Reusable components
// ----------------------------------------------------------------

const DateLine = ({ date, className = '' }) => (
  <span className={`date-meta ${className}`}>
    <Clock size={12} /> {date}
  </span>
);

// ================================================================
// ✅ UPDATED: Sidebar Component with Auto-Rotating Trending
// ================================================================
const Sidebar = ({ newsData }) => {
  const [tab, setTab] = useState('latest');
  const [trendingIndex, setTrendingIndex] = useState(0);

  const getItems = (type) => {
    if (type === 'latest') {
      return newsData.slice(0, 5);
    } else {
      return newsData.slice(5, 10);
    }
  };

  const list = getItems(tab);

  // ✅ Auto-rotate trending news every 5 seconds
  useEffect(() => {
    if (tab === 'trending' && list.length > 0) {
      const interval = setInterval(() => {
        setTrendingIndex((prev) => (prev + 1) % list.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [tab, list.length]);

  // Reset trending index when tab changes
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
            <img src={list[0].image || '/placeholder-image.jpg'} alt="" />
            <div className="overlay"><p>{list[0].title}</p></div>
          </Link>
          <DateLine date={formatDate(list[0])} className="mt-2" />
        </div>
      )}

      {/* ✅ TRENDING TAB with Auto-Rotation */}
      {tab === 'trending' && list.length > 0 && (
        <div className="sidebar-trending">
          <div className="trending-slider">
            <Link to={`/news/${currentTrendingItem.id}`} className="trending-item-link">
              <div className="trending-item-card">
                <div className="trending-item-image">
                  <img 
                    src={currentTrendingItem.image || '/placeholder-image.jpg'} 
                    alt={currentTrendingItem.title}
                    className="trending-img"
                  />
                  <div className="trending-number-badge">{trendingIndex + 1}</div>
                </div>
                <div className="trending-item-content">
                  <h4 className="trending-item-title">{currentTrendingItem.title}</h4>
                  <DateLine date={formatDate(currentTrendingItem)} />
                </div>
              </div>
            </Link>
            
            {/* Dots indicator */}
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
                <img src={n.image || '/placeholder-image.jpg'} alt="" />
                <div className="info">
                  <p>{n.title}</p>
                  <DateLine date={formatDate(n)} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* ✅ Sidebar Ad */}
      <div className="sidebar-ad">
        <AdDisplay position="sidebar" />
      </div>
    </aside>
  );
};

// ================================================================
// ✅ UPDATED: Breaking Ticker with Auto-Rotation
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
      <span className="date">{formatDate(item)}</span>
      <span className="ticker-counter">{index + 1}/{items.length}</span>
      <div className="controls">
        <button onClick={() => go(-1)}><ChevronLeft size={15} /></button>
        <button onClick={() => go(1)}><ChevronRight size={15} /></button>
      </div>
    </div>
  );
};

// ================================================================
// AdBanner Component - Header Ad
// ================================================================
const AdBanner = () => {
  return (
    <div className="ad-banner-wrapper">
      <AdDisplay position="header" className="header-ad" />
    </div>
  );
};

// ================================================================
// MidAd Component - Mid Content Ad
// ================================================================
const MidAd = () => {
  return (
    <div className="mid-ad">
      <AdDisplay position="mid-content" className="mid-content-ad" />
    </div>
  );
};

// ================================================================
// FooterAd Component - Footer Ad
// ================================================================
const FooterAd = () => {
  return (
    <div className="footer-ad">
      <AdDisplay position="footer" className="footer-ad-display" />
    </div>
  );
};

// ================================================================
// FeaturedNews
// ================================================================
const FeaturedNews = ({ news }) => {
  if (!news) return null;
  return (
    <Link 
      to={`/news/${news.id}`} 
      className="featured-news" 
      style={{ display: 'block', textDecoration: 'none' }}
    >
      <img src={news.image || '/placeholder-image.jpg'} alt="" />
      <span
        className="category-tag"
        style={{ backgroundColor: CATEGORY_COLORS[news.category] || '#4338ca' }}
      >
        {news.category || 'Uncategorized'}
      </span>
      <div className="overlay">
        <h2>{news.title}</h2>
        <DateLine date={formatDate(news)} className="text-white/70" />
      </div>
    </Link>
  );
};

// ================================================================
// NewsCard
// ================================================================
const NewsCard = ({ news }) => (
  <div className="news-card">
    <div className="img-wrap">
      <Link to={`/news/${news.id}`} style={{ display: 'block' }}>
        <img src={news.image || '/placeholder-image.jpg'} alt="" />
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
      <div className="footer">
        <DateLine date={formatDate(news)} />
        <Link to={`/news/${news.id}`} className="read-more">
          Read <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  </div>
);

const NewsGrid = ({ newsData }) => {
  if (!newsData || newsData.length === 0) return null;
  const featured = newsData[0];
  const rest = newsData.slice(1);
  return (
    <div className="news-grid">
      <div className="span-2"><FeaturedNews news={featured} /></div>
      {rest.map((n) => (
        <NewsCard key={n.id} news={n} />
      ))}
    </div>
  );
};

// ----------------------------------------------------------------
// HomePage
// ----------------------------------------------------------------
const HomePage = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllNews()
      .then((data) => {
        setNewsData(data);
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
      <main className="main-layout">
        <Sidebar newsData={newsData} />
        <div className="main-content">
          <AdBanner />
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