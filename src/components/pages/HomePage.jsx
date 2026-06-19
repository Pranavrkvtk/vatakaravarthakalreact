import React, { useState } from 'react';
import { Rss, Search, ChevronLeft, ChevronRight, Clock, Zap, Menu, ArrowRight } from 'lucide-react';
import './HomePage.css';

// ----------------------------------------------------------------
// Category color map (used by FeaturedNews & NewsCard)
// ----------------------------------------------------------------
const CATEGORY_COLORS = {
  'കേരളം': '#4338ca',
  'പ്രാദേശികം': '#4338ca',
  'ചരമം': '#d97706',
  'കായികം': '#059669',
  'യാത്ര': '#0284c7',
};

// ----------------------------------------------------------------
// Mock data (replace with your real feed)
// ----------------------------------------------------------------
const today = 'JUNE 19, 2026';
const yesterday = 'JUNE 18, 2026';

const latestList = [
  {
    id: 1,
    title: 'എല്ലാ കുടുംബങ്ങൾക്കും ആരോഗ്യ ഇൻഷുറൻസ് പദ്ധതി; സർക്കാർ പ്രഖ്യാപനം',
    image: 'https://picsum.photos/seed/insurance1/500/320',
    date: today,
    big: true,
  },
  {
    id: 2,
    title: 'നിയമസഭാ സമ്മേളനം ഇന്ന് ആരംഭിക്കും; സർവകക്ഷി യോഗം വിളിച്ചു',
    image: 'https://picsum.photos/seed/assembly2/120/120',
    date: today,
  },
  {
    id: 3,
    title: 'മുതിർന്ന സാമൂഹിക പ്രവർത്തകൻ അന്തരിച്ചു; നാളെ സംസ്കാരം',
    image: 'https://picsum.photos/seed/obit3/120/120',
    date: today,
  },
  {
    id: 4,
    title: 'വിദ്യാർത്ഥികൾക്കിടയിലെ സംഘർഷം; അന്വേഷണത്തിന് ഉത്തരവ്',
    image: 'https://picsum.photos/seed/school4/120/120',
    date: today,
  },
  {
    id: 5,
    title: 'ജില്ലയിൽ ഇന്ന് മഴ മുന്നറിയിപ്പ്; ജാഗ്രത നിർദേശം',
    image: 'https://picsum.photos/seed/rain5/120/120',
    date: today,
  },
];

const trendingList = [
  {
    id: 11,
    title: 'ലോകകപ്പ് സമയത്തെ ലോഡ് ഷെഡ്ഡിങ്: പ്രതിഷേധം ശക്തമാകുന്നു',
    image: 'https://picsum.photos/seed/trend1/120/120',
    date: yesterday,
  },
  {
    id: 12,
    title: 'പുതിയ പാത ഉദ്ഘാടനം ചെയ്തു; ഗതാഗതം സുഗമമാകും',
    image: 'https://picsum.photos/seed/trend2/120/120',
    date: yesterday,
  },
  {
    id: 13,
    title: 'ജില്ലാ കായികമേള തുടങ്ങി; വർണ്ണാഭമായ ഉദ്ഘാടനം',
    image: 'https://picsum.photos/seed/trend3/120/120',
    date: yesterday,
  },
  {
    id: 14,
    title: 'പുതിയ ഗ്രന്ഥശാല നാടിന് സമർപ്പിച്ചു',
    image: 'https://picsum.photos/seed/trend4/120/120',
    date: yesterday,
  },
];

const tickerItems = [
  { title: 'ലോകകപ്പ് സമയത്തെ ലോഡ് ഷെഡ്ഡിങ്: ഫുട്ബോൾ ആരാധകർ പ്രതിഷേധിച്ചു', date: yesterday },
  { title: 'സംസ്ഥാനത്ത് ഇന്ന് മുതൽ പുതിയ ഗതാഗത നിയമങ്ങൾ പ്രാബല്യത്തിൽ', date: today },
  { title: 'ജില്ലാ ആശുപത്രിയിൽ പുതിയ സൗകര്യങ്ങൾ ഒരുങ്ങി', date: today },
];

const featuredMain = {
  category: 'കേരളം',
  title: 'ഗവർണർ യോഗം വിളിച്ചു; ജനാധിപത്യ മര്യാദകളുടെ ലംഘനമെന്ന് മുഖ്യമന്ത്രി',
  image: 'https://picsum.photos/seed/featuredmain/700/620',
  date: today,
};

const gridCards = [
  {
    id: 21,
    category: 'കേരളം',
    title: 'ഗവർണർ യോഗം വിളിച്ചു; ജനാധിപത്യ മര്യാദകളുടെ ലംഘനം',
    image: 'https://picsum.photos/seed/grid1/420/260',
    date: today,
  },
  {
    id: 22,
    category: 'ചരമം',
    title: 'മുൻ പഞ്ചായത്ത് അംഗം അന്തരിച്ചു',
    image: 'https://picsum.photos/seed/grid2/420/260',
    date: today,
  },
  {
    id: 23,
    category: 'പ്രാദേശികം',
    title: 'പുതിയ പാലത്തിന്റെ നിർമാണം ഇന്ന് ആരംഭിക്കും',
    image: 'https://picsum.photos/seed/grid3/420/260',
    date: today,
  },
  {
    id: 24,
    category: 'പ്രാദേശികം',
    title: 'ജില്ലയിൽ വൈദ്യുതി മുടക്കം; നാളെ പുനഃസ്ഥാപിക്കും',
    image: 'https://picsum.photos/seed/grid4/420/260',
    date: today,
  },
];

// ----------------------------------------------------------------
// Reusable components (unchanged)
// ----------------------------------------------------------------

const DateLine = ({ date, className = '' }) => (
  <span className={`date-meta ${className}`}>
    <Clock size={12} /> {date}
  </span>
);

// ⚠️ Header component is REMOVED – Navbar is rendered in App.js

const Sidebar = () => {
  const [tab, setTab] = useState('latest');
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

      {tab === 'latest' && (
        <div className="sidebar-featured">
          <div className="img-wrap">
            <img src={latestList[0].image} alt="" />
            <div className="overlay"><p>{latestList[0].title}</p></div>
          </div>
          <DateLine date={latestList[0].date} className="mt-2" />
        </div>
      )}

      <ul className="sidebar-news-list">
        {(tab === 'latest' ? latestList.slice(1) : trendingList).map((n) => (
          <li key={n.id}>
            <img src={n.image} alt="" />
            <div className="info">
              <p>{n.title}</p>
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

const BreakingTicker = () => {
  const [index, setIndex] = useState(0);
  const item = tickerItems[index];
  const go = (dir) => setIndex((i) => (i + dir + tickerItems.length) % tickerItems.length);
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

const FeaturedNews = ({ news }) => (
  <div className="featured-news">
    <img src={news.image} alt="" />
    <span className="category-tag" style={{ backgroundColor: CATEGORY_COLORS[news.category] || '#4338ca' }}>
      {news.category}
    </span>
    <div className="overlay">
      <h2>{news.title}</h2>
      <DateLine date={news.date} className="text-white/70" />
    </div>
  </div>
);

const NewsCard = ({ news }) => (
  <div className="news-card">
    <div className="img-wrap">
      <img src={news.image} alt="" />
      <span className="category-tag" style={{ backgroundColor: CATEGORY_COLORS[news.category] || '#4338ca' }}>
        {news.category}
      </span>
    </div>
    <div className="body">
      <h3>{news.title}</h3>
      <div className="footer">
        <DateLine date={news.date} />
        <span className="read-more">Read <ArrowRight size={14} /></span>
      </div>
    </div>
  </div>
);

const NewsGrid = ({ newsItems }) => (
  <div className="news-grid">
    <div className="span-2"><FeaturedNews news={featuredMain} /></div>
    {newsItems.map((n) => <NewsCard key={n.id} news={n} />)}
  </div>
);

// ----------------------------------------------------------------
// HomePage – now without the duplicate header
// ----------------------------------------------------------------
const HomePage = () => (
  <div className="app-container">
    <main className="main-layout">
      <Sidebar />
      <div className="main-content">
        <AdBanner />
        <BreakingTicker />
        <MidAd />
        <NewsGrid newsItems={gridCards} />
        <FooterAd />
      </div>
    </main>
  </div>
);

export default HomePage;