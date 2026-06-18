import React, { useState } from "react";
import { Menu, X, Search, User, Bell } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
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
    "സാമ്പത്തികം"
  ];

  return (
    <>
      {/* Top Bar */}
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

      {/* Header */}
      <header className="main-header">
        <div className="header-inner">

          {/* Logo */}
          <div className="logo-center">
            <h1 className="logo-text">
              വടകര വാർത്തകൾ
            </h1>
          </div>

          {/* Desktop Menu */}
          <nav className="desktop-nav">
            {navItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className="nav-link"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="header-actions">
            <button className="icon-btn">
              <Search size={20} />
            </button>

            <button className="icon-btn">
              <Bell size={20} />
            </button>

            <button className="icon-btn">
              <User size={20} />
            </button>

            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            {navItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className="mobile-nav-link"
              >
                {item}
              </a>
            ))}

            <div className="mobile-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="വാർത്തകൾ തിരയുക..."
              />
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;