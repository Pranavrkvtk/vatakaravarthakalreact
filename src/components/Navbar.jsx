import React, { useState } from "react";
import { Menu, X, Search } from "lucide-react";
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

  return (
    <>
  

      {/* Header */}
      <header className="main-header">
        <div className="header-top">

              {/* Top Breaking Bar */}
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
    <div
  style={{
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center"
  }}
>
  <h1>വടകര വാർത്തകൾ</h1>
</div>

          <div className="header-actions">
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
          {navItems.map((item, index) => (
            <a href="#" key={index} className="nav-link">
              {item}
            </a>
          ))}
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="വാർത്തകൾ തിരയുക..."
              />
            </div>

            {navItems.map((item, index) => (
              <a
                href="#"
                key={index}
                className="mobile-nav-link"
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </header>
    </>
  );
}

export default Navbar;