// src/components/Navbar.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X, Search, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCategories } from "../context/CategoriesContext";
import { getLatestNews, getBreakingNews, getSearchSuggestions } from "../api/news";
import "./Navbar.css";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { categories, loading } = useCategories();
  const [latestNews, setLatestNews] = useState([]);
  const [breakingNews, setBreakingNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  
  const navigate = useNavigate();

  // Fetch news for ticker
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const [latestRes, breakingRes] = await Promise.all([
          getLatestNews(),
          getBreakingNews()
        ]);
        setLatestNews(latestRes || []);
        setBreakingNews(breakingRes || []);
        setNewsLoading(false);
      } catch (error) {
        console.error('Error fetching news for navbar:', error);
        setNewsLoading(false);
      }
    };

    fetchNews();

    // ✅ FIXED (Audit H7): Removed the 60-second setInterval. 
    // The navbar now only fetches news once on page load.
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

  // ─── Search with debounce ──────────────────────────────────────
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const suggestions = await getSearchSuggestions(query);
      setSearchSuggestions(suggestions || []);
      setShowSuggestions(suggestions && suggestions.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSearchSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 300);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchSuggestions]);

  // ─── Handle search submit ──────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      setShowSuggestions(false);
      setIsMobileSearchOpen(false);
      navigate(`/search?keyword=${encodeURIComponent(query)}`);
      setSearchQuery("");
    }
  };

  // ─── Handle suggestion click ──────────────────────────────────
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setIsMobileSearchOpen(false);
    navigate(`/search?keyword=${encodeURIComponent(suggestion)}`);
    setSearchQuery("");
  };

  // ─── Handle click outside ─────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Handle keyboard shortcuts ──────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSearchQuery("");
      setIsMobileSearchOpen(false);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchSuggestions.length > 0) {
        handleSuggestionClick(searchSuggestions[0]);
      } else {
        handleSearch(e);
      }
    }
  };

  // ─── Toggle mobile search ─────────────────────────────────────
  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    if (!isMobileSearchOpen) {
      setTimeout(() => {
        if (mobileSearchInputRef.current) {
          mobileSearchInputRef.current.focus();
        }
      }, 100);
    } else {
      setSearchQuery("");
      setShowSuggestions(false);
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
            {/* ✅ Desktop Search with Suggestions */}
            <div className="search-wrapper desktop-search" ref={searchRef}>
              <form onSubmit={handleSearch} className="search-form">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  name="search"
                  placeholder="തിരയുക..." 
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2 && searchSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  autoComplete="off"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="search-clear"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchSuggestions([]);
                      setShowSuggestions(false);
                    }}
                  >
                    ✕
                  </button>
                )}
                <button type="submit" className="search-submit-btn">
                  <Search size={16} />
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="search-suggestions">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Search size={14} className="suggestion-icon" />
                      <span className="suggestion-text">{suggestion}</span>
                      {isSearching && index === 0 && (
                        <span className="suggestion-loading">...</span>
                      )}
                    </div>
                  ))}
                  <div className="suggestion-footer">
                    <span>Press Enter to search all</span>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ Mobile Search Toggle Button */}
            <button
              className="mobile-search-toggle"
              onClick={toggleMobileSearch}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

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

        {/* ✅ Mobile Search Overlay */}
        <div className={`mobile-search-overlay ${isMobileSearchOpen ? 'active' : ''}`}>
          <div className="mobile-search-container">
            <form onSubmit={handleSearch} className="mobile-search-form">
              <Search size={20} className="mobile-search-icon" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                placeholder="Search news..."
                className="mobile-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="mobile-search-clear"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchSuggestions([]);
                    setShowSuggestions(false);
                  }}
                >
                  ✕
                </button>
              )}
              <button type="submit" className="mobile-search-submit">
                Search
              </button>
              <button
                type="button"
                className="mobile-search-close"
                onClick={toggleMobileSearch}
              >
                ✕
              </button>
            </form>

            {/* Mobile Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="mobile-search-suggestions">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="mobile-suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search size={14} className="suggestion-icon" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
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