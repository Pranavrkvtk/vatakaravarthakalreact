import React from 'react';
import { ChevronRight } from 'lucide-react';
import './MalayalamSection.css';

const MalayalamSection = () => {
  return (
    <div className="malayalam-section">
      <div className="section-header">
        <h3 className="section-title">
          <span className="red-bar"></span>
          ചിലവും
        </h3>
        <a href="#" className="more-link">
          കൂടുതൽ <ChevronRight className="arrow-icon" />
        </a>
      </div>
      <div className="news-grid">
        <div className="news-card">
          <p className="news-card-title">ഇന്നി പണക്കുല ഇല്ലാതെ</p>
          <span className="news-card-time">2 hours ago</span>
        </div>
        <div className="news-card">
          <p className="news-card-title">സംസ്ഥാനത്ത് വ്യാപക മഴ</p>
          <span className="news-card-time">4 hours ago</span>
        </div>
        <div className="news-card">
          <p className="news-card-title">പുതിയ ടൂറിസം പദ്ധതികൾ</p>
          <span className="news-card-time">6 hours ago</span>
        </div>
      </div>
    </div>
  );
};

export default MalayalamSection;