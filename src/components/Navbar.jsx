import React, { useState } from "react";
import { Menu, X, Search, User, Bell } from "lucide-react";
import "./Navbar.css"; // <-- import the CSS file

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home" },
    { label: "Politics" },
    { label: "Kerala" },
    { label: "India" },
    { label: "Sports" },
    { label: "Technology" },
    { label: "Business" },
    { label: "Entertainment" },
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
          {/* LOGO */}
          <div className="logo-wrapper">
            <h1 className="logo-text">
              <span className="logo-gradient">Vatakara Varthakal</span>
            </h1>
          </div>

          {/* DESKTOP NAV */}
          <nav className="desktop-nav">
            {navItems.map((item, index) => (
              <a key={index} href="#" className="nav-link">
                <span className="nav-pill"></span>
                <span className="nav-label">{item.label}</span>
              </a>
            ))}
          </nav>

          {/* RIGHT ACTIONS */}
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
            {navItems.map((item, index) => (
              <a key={index} href="#" className="mobile-nav-link">
                {item.label}
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