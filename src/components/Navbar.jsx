import React, { useState } from "react";
import { Menu, X, Search, Home } from "lucide-react";
import { Link } from "react-router-dom"; // 👈 import Link
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

  // Prepend "Home" to nav items
  const navItemsWithHome = ["പ്രധാനം", ...navItems];

  return (
    <>
      {/* Top Bar (unchanged) */}
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
        <div className="header-top">
          {/* Make the title a link to home as well (optional) */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <h1
              style={{
                color: "black",
                textAlign: "center",
                margin: 0,
                fontSize: "3rem",
              }}
            >
              വടകര വാർത്തകൾ
            </h1>
          </Link>

          <div className="header-actions">
            {/* 👇 Home button with icon */}
            <Link to="/" className="home-button" aria-label="Home">
              <Home size={24} />
            </Link>

            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>


{/* Desktop Navigation */}
<nav className="desktop-nav">
  {navItemsWithHome.map((item, index) => (
    <Link
      to={item === "പ്രധാനം" ? "/" : `/category/${encodeURIComponent(item)}`}
      key={index}
      className="nav-link"
    >
      {item}
    </Link>
  ))}
</nav>

{/* Mobile Menu */}
{mobileMenuOpen && (
  <div className="mobile-menu">
    <div className="mobile-search">...</div>
    {navItemsWithHome.map((item, index) => (
      <Link
        to={item === "പ്രധാനം" ? "/" : `/category/${encodeURIComponent(item)}`}
        key={index}
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