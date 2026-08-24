// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCategories } from "../context/CategoriesContext";
import api from "../api/axios";
import "./Navbar.css";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { categories, loading } = useCategories();
  const [latestNews, setLatestNews] = useState([]);
  const [breakingNews, setBreakingNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const navigate = useNavigate();

  // Fetch news for ticker
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Fetch latest news for ticker
        const latestRes = await api.get('/news/latest');
        setLatestNews(latestRes.data || []);
        
        // Fetch breaking news
        const breakingRes = await api.get('/news/breaking');
        setBreakingNews(breakingRes.data || []);
        
        setNewsLoading(false);
      } catch (error) {
        console.error('Error fetching news for navbar:', error);
        setNewsLoading(false);
      }
    };

    fetchNews();

    // Refresh every 60 seconds
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate breaking news
  useEffect(() => {
    if (breakingNews.length > 0) {
      const timer = setInterval(() => {
        setCurrentNewsIndex((prev) => (prev + 1) % breakingNews.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [breakingNews]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) {
      navigate(`/search?keyword=${encodeURIComponent(query)}`);
      e.target.search.value = '';
    }
  };

  // Get news to display in ticker
  const getTickerNews = () => {
    if (breakingNews.length > 0) {
      return breakingNews[currentNewsIndex]?.title || '';
    }
    if (latestNews.length > 0) {
      return latestNews[0]?.title || '';
    }
    return 'വടകര വാർത്തകൾ - ഏറ്റവും പുതിയ വാർത്തകൾ ഉടൻ ലഭ്യമാകും';
  };

  const getTickerNewsId = () => {
    if (breakingNews.length > 0) {
      return breakingNews[currentNewsIndex]?.id;
    }
    if (latestNews.length > 0) {
      return latestNews[0]?.id;
    }
    return null;
  };

  const newsTitle = getTickerNews();
  const newsId = getTickerNewsId();

  // Nav items - using categories from context
  const navItems = loading ? ["Home"] : ["Home", ...categories];

  return (
    <header className="main-header">
      {/* Top Bar - Breaking News Ticker */}
      <div className="top-bar">
        <div className="top-bar-inner">
          <div className="ticker">
            <span className="live-badge">LIVE</span>
            <span className="breaking-text">
              {newsLoading ? (
                "Loading news..."
              ) : (
                <span 
                  className="breaking-news-link"
                  onClick={() => newsId && navigate(`/news/${newsId}`)}
                  style={{ cursor: newsId ? 'pointer' : 'default' }}
                >
                  {newsTitle}
                </span>
              )}
            </span>
          </div>
          <div className="top-bar-right">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="nav-main">
        <div className="nav-container">
          <Link to="/" className="brand-link">
            <span className="brand-name">വടകര വാർത്തകൾ</span>
          </Link>

          <nav className="desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/category/${encodeURIComponent(item)}`}
                className="nav-link"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <form onSubmit={handleSearch} className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                name="search"
                placeholder="തിരയുക..." 
                className="search-input" 
              />
            </form>
            <Link to="/login" className="admin-login-link" title="Admin Login">
              <span className="admin-icon">👤</span>
            </Link>
            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navItems.map((item) => (
            <Link
              key={item}
              to={item === "Home" ? "/" : `/category/${encodeURIComponent(item)}`}
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <Link
            to="/login"
            className="mobile-nav-link admin-mobile-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            👤 Admin Login
          </Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;