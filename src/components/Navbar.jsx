import React, { useState } from "react";
import { Menu, X, Search, Home, Rss } from "lucide-react";   // ← added Rss
import { Link } from "react-router-dom";
import "./Navbar.css";
import "./pages/HomePage";   // ← import premium header styles

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

  const navItemsWithHome = ["പ്രധാനം", ...navItems];

  return (
    <>
      {/* Top Bar – LIVE ticker */}
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

      {/* Main Header – premium dark gradient */}
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <div className="header-logo-icon">വ</div>
            <span className="header-brand">വടകര വാർത്തകൾ</span>
          </div>

          <nav className="header-nav">
            {navItemsWithHome.map((item, i) => (
              <Link
                key={item}
                to={item === "പ്രധാനം" ? "/" : `/category/${encodeURIComponent(item)}`}
                className={i === 0 ? "active" : ""}
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <button aria-label="RSS feed" className="rss-btn">
              <Rss size={18} />   {/* now Rss is defined */}
            </button>
            <div className="header-search">
              <input type="text" placeholder="Search..." />
              <button aria-label="Search">
                <Search size={16} />
              </button>
            </div>
            <button
              aria-label="Menu"
              className="header-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-panel">
          <div className="mobile-search">
            <Search size={18} />
            <input type="text" placeholder="വാർത്തകൾ തിരയുക..." />
          </div>
          {navItemsWithHome.map((item) => (
            <Link
              key={item}
              to={item === "പ്രധാനം" ? "/" : `/category/${encodeURIComponent(item)}`}
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default Navbar;