// src/components/pages/SearchPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchNews, getSearchSuggestions, advancedSearch } from '../../api/news';
import { Search, X, Clock, ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import './SearchPage.css';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get('keyword') || '';
  
  const [keyword, setKeyword] = useState(initialKeyword);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {
        setSearchHistory([]);
      }
    }
  }, []);

  // Perform search
  const performSearch = useCallback(async (query, page = 0, sort = 'relevance') => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setTotalResults(0);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    setHasSearched(true);

    try {
      // ✅ Use advancedSearch which is exported
      const data = await advancedSearch({
        keyword: query.trim(),
        page,
        size: 12,
        sortBy: sort
      });
      
      console.log('🔍 Search response:', data);
      
      // Handle the response correctly - it's an object with 'news' array
      if (data && typeof data === 'object') {
        // Extract news array from response
        const newsData = data.news || [];
        setResults(newsData);
        setTotalResults(data.total || 0);
        setTotalPages(data.totalPages || 0);
        setCurrentPage(data.page || 0);
        
        // Save to history only if results found
        if (data.total > 0) {
          const trimmedQuery = query.trim();
          const newHistory = [trimmedQuery, ...searchHistory.filter(h => h !== trimmedQuery)].slice(0, 10);
          setSearchHistory(newHistory);
          localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        }
      } else if (Array.isArray(data)) {
        // Fallback for array response
        setResults(data);
        setTotalResults(data.length);
        setTotalPages(Math.ceil(data.length / 12));
      } else {
        setResults([]);
        setTotalResults(0);
      }
    } catch (err) {
      console.error('❌ Search error:', err);
      setError('Failed to search. Please try again.');
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [searchHistory]);

  // Initial search on page load - runs once
  useEffect(() => {
    if (initialKeyword) {
      performSearch(initialKeyword, 0, 'relevance');
    }
  }, []); // Empty dependency array - only runs once on mount

  // Get suggestions while typing with debounce
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setKeyword(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length >= 2) {
      // Debounce suggestions
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const data = await getSearchSuggestions(value);
          setSuggestions(Array.isArray(data) ? data.slice(0, 8) : []);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Error fetching suggestions:', err);
          setSuggestions([]);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = keyword.trim();
    if (query.length >= 2) {
      setSearchParams({ keyword: query });
      performSearch(query, 0, sortBy);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setKeyword(suggestion);
    setShowSuggestions(false);
    setSearchParams({ keyword: suggestion });
    performSearch(suggestion, 0, sortBy);
  };

  const clearSearch = () => {
    setKeyword('');
    setResults([]);
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchParams({});
    setTotalResults(0);
    setHasSearched(false);
  };

  const handleHistoryClick = (term) => {
    setKeyword(term);
    setSearchParams({ keyword: term });
    performSearch(term, 0, sortBy);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    performSearch(keyword, page, sortBy);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    if (keyword.trim().length >= 2) {
      performSearch(keyword, 0, newSort);
    }
  };

  // Ensure results is always an array for mapping
  const displayResults = Array.isArray(results) ? results : [];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recent';
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Recent';
    }
  };

  return (
    <div className="search-page">
      <div className="search-container">
        {/* Search Header */}
        <div className="search-header">
          <h1>Search News</h1>
          <p>Find the latest news articles by title</p>
        </div>

        {/* Search Bar */}
        <div className="search-bar-wrapper">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                value={keyword}
                onChange={handleInputChange}
                onFocus={() => {
                  if (keyword.trim().length >= 2 && suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                placeholder="Search news by title..."
                className="search-input"
                autoFocus
              />
              {keyword && (
                <button type="button" className="search-clear" onClick={clearSearch}>
                  <X size={18} />
                </button>
              )}
              <button type="submit" className="search-submit">
                Search
              </button>
            </div>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Search size={16} />
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search History */}
        {!hasSearched && searchHistory.length > 0 && (
          <div className="search-history">
            <div className="history-header">
              <span>Recent Searches</span>
              <button onClick={clearHistory} className="clear-history">
                Clear All
              </button>
            </div>
            <div className="history-list">
              {searchHistory.map((term, index) => (
                <button
                  key={index}
                  className="history-item"
                  onClick={() => handleHistoryClick(term)}
                >
                  <Clock size={14} />
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {loading && (
          <div className="search-loading">
            <div className="spinner" />
            <p>Searching news...</p>
          </div>
        )}

        {error && (
          <div className="search-error">{error}</div>
        )}

        {!loading && displayResults.length > 0 && (
          <div className="search-results">
            <div className="results-header">
              <div className="results-left">
                <span className="results-count">
                  Found {totalResults} result{totalResults > 1 ? 's' : ''} for "{keyword}"
                </span>
                {totalPages > 1 && (
                  <span className="results-page">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                )}
              </div>
              <div className="results-right">
                <select value={sortBy} onChange={handleSortChange} className="sort-select">
                  <option value="relevance">Most Relevant</option>
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>
            </div>

            <div className="results-grid">
              {displayResults.map((news) => (
                <article key={news.id} className="result-card">
                  <Link to={`/news/${news.id}`} className="result-link">
                    {news.image && (
                      <div className="result-image">
                        <img
                          src={news.image}
                          alt={news.title}
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                        {news.category && (
                          <span className="result-category">{news.category}</span>
                        )}
                      </div>
                    )}
                    <div className="result-content">
                      <h3 className="result-title">{news.title}</h3>
                      {news.subtitle && (
                        <p className="result-excerpt">{news.subtitle}</p>
                      )}
                      <div className="result-meta">
                        <span className="result-date">
                          <Calendar size={14} />
                          {formatDate(news.publishedDate || news.createdAt)}
                        </span>
                        {news.views > 0 && (
                          <span className="result-views">
                            <TrendingUp size={14} />
                            {news.views} views
                          </span>
                        )}
                        <span className="result-read">
                          Read <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="search-pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="page-btn"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage <= 2) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && hasSearched && displayResults.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No results found</h3>
            <p>
              We couldn't find any news matching "{keyword}".
              Try using different keywords or check your spelling.
            </p>
            <div className="no-results-suggestions">
              <span>Try searching for:</span>
              <button onClick={() => handleSuggestionClick('breaking')}>Breaking</button>
              <button onClick={() => handleSuggestionClick('latest')}>Latest</button>
              <button onClick={() => handleSuggestionClick('today')}>Today</button>
              <button onClick={() => handleSuggestionClick('kerala')}>Kerala</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;