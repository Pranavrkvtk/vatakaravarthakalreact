import React, { useState } from "react";
import { Menu, X, Search, Home } from "lucide-react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    "പ്രാദേശികം",
    "മലബാര്‍",
    "കേരളം",
    "ദേശീയം",
    "വിദേശം",
    "ചരമം",
    "കല",
    "സാംസ്‌കാരികം",
    "വിദ്യാഭ്യാസം",
    "വിനോദം",
    "യാത്ര",
    "സാമ്പത്തികം",
  ];

  const navItemsWithHome = ["Home", ...navItems];

  return (
    <>
      {/* ========== MAIN HEADER (sticky) ========== */}
      <header className="main-header">
        {/* TOP BAR – LIVE ticker + date */}
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

        {/* MAIN NAV – brand + links + menu button */}
        <div className="nav-main">
          <div className="nav-container">
            {/* Brand / Logo */}
            <Link to="/" className="brand-link">
              <span className="brand-name">വടകര വാർത്തകൾ</span>
            </Link>

            {/* Desktop Navigation – hidden on mobile, shown on larger screens */}
            <nav className="desktop-nav">
              {navItemsWithHome.map((item, index) => (
                <Link
                  key={index}
                  to={item === "Home" ? "/" : `/category/${encodeURIComponent(item)}`}
                  className="nav-link"
                >
                  {item}
                </Link>
              ))}
            </nav>

            {/* Right side: search + menu toggle (for mobile) */}
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

        {/* Mobile Menu (slides down) */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
         
            {navItemsWithHome.map((item, index) => (
              <Link
                key={index}
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
    </>
  );
}

export default Navbar;