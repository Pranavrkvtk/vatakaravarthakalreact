import React from 'react';
import './NewsGrid.css';

const NewsGrid = ({ newsItems }) => {
  return (
    <div className="news-grid-container">
      {newsItems.map((item, index) => (
        <div key={index} className="news-grid-item">
          <img 
            src={item.image} 
            alt="News" 
            className="news-grid-image"
          />
          <div className="news-grid-body">
            <div className="news-grid-meta">
              <span className="news-grid-badge">
                LATEST
              </span>
              <span className="news-grid-time">
                <span className="clock-icon">🕒</span> {item.time}
              </span>
            </div>
            <h3 className="news-grid-title">
              {item.title}
            </h3>
            <p className="news-grid-category">{item.category}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsGrid;  