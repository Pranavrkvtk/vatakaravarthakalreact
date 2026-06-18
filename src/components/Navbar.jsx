import React, { useState } from "react";
import { Menu, X, Search, User, Bell } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    "Home", "Politics", "Kerala", "India",
    "Sports", "Technology", "Business", "Entertainment"
  ];

  return (
    <>
      {/* ===== TOP BAR ===== */}
      <div className="top-bar">
        <div className="top-bar-inner">
          <div className="ticker">
            <span className="live-badge">
              <span className="pulse-dot"></span>
              Live
            </span>
            <div className="breaking-news">
              <span className="breaking-label">Breaking:</span>
              <span className="breaking-text">
                India wins series final by 6 wickets • Kerala floods: Rescue ops underway
              </span>
            </div>
          </div>
          <div className="top-bar-right">
            <span>Thursday, June 18, 2026</span>
            <div className="status">
              <span className="status-dot"></span>
              <span>Stable</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN HEADER ===== */}
      <header className="main-header">
        <div className="header-inner">
          {/* LEFT: Desktop Navigation */}
          <nav className="desktop-nav">
            {navItems.map((label) => (
              <a key={label} href="#" className="nav-link">
                <span className="nav-pill"></span>
                <span className="nav-label">{label}</span>
              </a>
            ))}
          </nav>

          {/* CENTER: Logo (always centered) */}
          <div className="logo-center">
            <h1 className="logo-text">
              <span className="logo-gradient">Vatakara Varthakal</span>
            </h1>
          </div>

          {/* RIGHT: Actions */}
          <div className="header-actions">
            <div className="search-wrapper">
              <Search size={16} />
              <input type="text" placeholder="Search news..." />
            </div>

            <button className="icon-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <button className="icon-btn">
              <User size={20} />
            </button>

            <a href="#" className="subscribe-btn">Subscribe</a>

            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ===== MOBILE MENU ===== */}
        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <div className="mobile-menu-inner">
            {navItems.map((label) => (
              <a key={label} href="#" className="mobile-nav-link">
                {label}
              </a>
            ))}
            <div className="mobile-extra">
              <div className="mobile-search">
                <Search size={16} />
                <input type="text" placeholder="Search..." />
              </div>
              <a href="#" className="mobile-subscribe">
                Subscribe Now
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;