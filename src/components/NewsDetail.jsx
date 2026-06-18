import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const NewsDetail = ({ newsData }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const news = newsData.find(item => item.id === parseInt(id));

  if (!news) {
    return (
      <div className="detail-container">
        <h2>വാർത്ത കണ്ടെത്തിയില്ല</h2>
        <button onClick={() => navigate('/')}>മുൻപേജിലേക്ക്</button>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={() => navigate('/')}>← തിരികെ</button>
      <div className="detail-card">
        <img src={news.image} alt={news.title} className="detail-image" />
        <div className="detail-body">
          <span className="detail-category">{news.category}</span>
          <h1 className="detail-title">{news.title}</h1>
          <span className="detail-time">🕒 {news.time}</span>
          <p className="detail-content">{news.content || 'വിവരണം ലഭ്യമല്ല'}</p>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;