import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NewsGrid.css'; // import the CSS file

const NewsGrid = ({ newsItems }) => {
  const navigate = useNavigate();

  const handleClick = (id) => {
    navigate(`/news/${id}`);
  };

  return (
    <div className="news-grid-container">
      {newsItems.map((item) => (
        <div
          key={item.id}
          className="news-grid-item"
          onClick={() => handleClick(item.id)}
        >
          <img
            src={item.imageUrl || 'https://via.placeholder.com/400x200'}
            alt={item.title}
            className="news-grid-image"
          />
          <div className="news-grid-body">
            <div className="news-grid-meta">
              <span className="news-grid-badge">
                {item.category || 'വാർത്ത'}
              </span>
              <span className="news-grid-time">
                <span className="clock-icon">🕒</span>
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString('en-IN')
                  : ''}
              </span>
            </div>
            <h3 className="news-grid-title">{item.title}</h3>
            <p className="news-grid-category">
              {item.author || 'Admin'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsGrid;