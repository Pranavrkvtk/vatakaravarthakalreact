import React, { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useCategories } from "../context/CategoriesContext";
import "./Navbar.css";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Use the context – no local state or fetch needed
  const { categories, loading } = useCategories();

  // While loading, you can show a placeholder or just an empty list
  // Here we show "Home" only until categories load
  const navItems = loading ? ["Home"] : ["Home", ...categories];

  return (
    <header className="main-header">
      {/* Top Bar – unchanged */}
      <div className="top-bar">
        <div className="top-bar-inner">
          <div className="ticker">
            <span className="live-badge">LIVE</span>
            <span className="breaking-text">
              വടകര വാർത്തകൾ - ഏറ്റവും പുതിയ വാർത്തകൾ ഉടൻ ലഭ്യമാകും
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
          <Link to="/login" className="brand-link">
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
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="തിരയുക..." className="search-input" />
            </div>
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
        </div>
      )}
    </header>
  );
}

export default Navbar;