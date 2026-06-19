import React, { useState } from 'react';
import { Rss, Search, ChevronLeft, ChevronRight, Clock, Zap, Menu, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';  // added for proper linking
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
};

// ----------------------------------------------------------------
// Reusable components (now accept data via props)
// ----------------------------------------------------------------

const DateLine = ({ date, className = '' }) => (
  <span className={`date-meta ${className}`}>
    <Clock size={12} /> {date}
  </span>
);

// Sidebar – uses `newsData` to populate "Latest" and "Trending"
const Sidebar = ({ newsData }) => {
  const [tab, setTab] = useState('latest');

  // Helper to get items for a tab (fallback to all if not enough)
  const getItems = (type) => {
    if (type === 'latest') {
      // Show first 5 as "latest" (you can sort by date if you have a date field)
      return newsData.slice(0, 5);
    } else {
      // Show next 5 as "trending" (or any other logic)
      return newsData.slice(5, 10);
    }
  };

  const list = getItems(tab);

  if (!list.length) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-tabs">
        <button
          onClick={() => setTab('latest')}
          className={`tab-latest ${tab === 'latest' ? 'active' : ''}`}
        >
          LATEST
        </button>
        <button
          onClick={() => setTab('trending')}
          className={`tab-trending ${tab === 'trending' ? 'active' : ''}`}
        >
          <Zap size={14} /> TRENDING
        </button>
      </div>

      {tab === 'latest' && list.length > 0 && (
        <div className="sidebar-featured">
          <div className="img-wrap">
            <img src={list[0].image} alt="" />
            <div className="overlay"><p>{list[0].title}</p></div>
          </div>
          <DateLine date={list[0].date} className="mt-2" />
        </div>
      )}

      <ul className="sidebar-news-list">
        {list.slice(1).map((n) => (
          <li key={n.id}>
            <img src={n.image} alt="" />
            <div className="info">
              <Link to={`/news/${n.id}`}>
                <p>{n.title}</p>
              </Link>
              <DateLine date={n.date} />
            </div>
          </li>
        ))}
      </ul>

      {/* Sidebar Ad */}
      <div className="sidebar-ad">
        <p className="ad-label">— ADVERTISEMENT —</p>
        <div className="ad-content"><div className="ad-placeholder">300×250</div></div>
      </div>
    </aside>
  );
};

// Ad banners (unchanged)
const AdBanner = () => (
  <div className="ad-banner">
    <div className="ad-text">
      <p className="small">Smart &amp; Responsive</p>
      <p className="big">ADVERTISEMENT</p>
    </div>
    <span className="ad-size">728×90</span>
    <button className="ad-btn">LEARN MORE</button>
    <div className="glow" />
  </div>
);

const MidAd = () => (
  <div className="mid-ad">
    <p className="ad-label">— ADVERTISEMENT —</p>
    <div className="ad-content"><div className="ad-placeholder">728×90</div></div>
  </div>
);

const FooterAd = () => (
  <div className="footer-ad">
    <p className="ad-label">— ADVERTISEMENT —</p>
    <div className="ad-content"><div className="ad-placeholder">Full-width Banner</div></div>
  </div>
);

// Breaking Ticker – uses first 5 items (or all)
const BreakingTicker = ({ newsData }) => {
  const [index, setIndex] = useState(0);
  const items = newsData.slice(0, 5);
  if (!items.length) return null;
  const item = items[index] || items[0];
  const go = (dir) => setIndex((i) => (i + dir + items.length) % items.length);

  return (
    <div className="ticker">
      <span className="badge"><Zap size={12} /> TRENDING</span>
      <p className="text">{item.title}</p>
      <span className="date">{item.date}</span>
      <div className="controls">
        <button onClick={() => go(-1)}><ChevronLeft size={15} /></button>
        <button onClick={() => go(1)}><ChevronRight size={15} /></button>
      </div>
    </div>
  );
};

// Featured News (big card) – uses the first item in the array
const FeaturedNews = ({ news }) => {
  if (!news) return null;
  return (
    <div className="featured-news">
      <img src={news.image} alt="" />
      <span
        className="category-tag"
        style={{ backgroundColor: CATEGORY_COLORS[news.category] || '#4338ca' }}
      >
        {news.category}
      </span>
      <div className="overlay">
        <Link to={`/news/${news.id}`}>
          <h2>{news.title}</h2>
        </Link>
        <DateLine date={news.date} className="text-white/70" />
      </div>
    </div>
  );
};

// Grid card (small)
const NewsCard = ({ news }) => (
  <div className="news-card">
    <div className="img-wrap">
      <img src={news.image} alt="" />
      <span
        className="category-tag"
        style={{ backgroundColor: CATEGORY_COLORS[news.category] || '#4338ca' }}
      >
        {news.category}
      </span>
    </div>
    <div className="body">
      <Link to={`/news/${news.id}`}>
        <h3>{news.title}</h3>
      </Link>
      <div className="footer">
        <DateLine date={news.date} />
        <span className="read-more">Read <ArrowRight size={14} /></span>
      </div>
    </div>
  </div>
);

// News Grid – uses the entire newsData; featured is the first item, rest in grid
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
// HomePage – receives newsData as a prop
// ----------------------------------------------------------------
const HomePage = ({ newsData }) => {
  if (!newsData || newsData.length === 0) {
    return <div className="app-container"><p>No news available</p></div>;
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