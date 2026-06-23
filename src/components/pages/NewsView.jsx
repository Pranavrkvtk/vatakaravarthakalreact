// src/components/pages/NewsView.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsById } from '../../api/news'; // assume you have this function
import { ArrowLeft, Calendar, Eye, ThumbsUp, Share2 } from 'lucide-react';
import './NewsView.css'; // optional styles

const NewsView = () => {
  const { id } = useParams(); // get the ID from URL
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // fetch the specific news by ID
    getNewsById(id)
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load news:', err);
        setError('Article not found or server error.');
        setLoading(false);
      });
  }, [id]); // re‑fetch if ID changes

  if (loading) return <div className="news-view-container">Loading...</div>;
  if (error) return <div className="news-view-container error">{error}</div>;
  if (!news) return <div className="news-view-container">Article not found.</div>;

  return (
    <div className="news-view-container">
      {/* Back button */}
      <Link to="/" className="back-link">
        <ArrowLeft size={20} /> Back to Home
      </Link>

      {/* Image */}
      <div className="news-image">
        <img src={news.image || '/placeholder-image.jpg'} alt={news.title} />
      </div>

      {/* Meta info */}
      <div className="news-meta">
        <span className="category">{news.category || 'General'}</span>
        <span className="date">
          <Calendar size={14} /> {new Date(news.publishedDate).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </span>
        <span className="views"><Eye size={14} /> {news.views || 0}</span>
      </div>

      {/* Title & Subtitle */}
      <h1 className="news-title">{news.title}</h1>
      {news.subtitle && <h2 className="news-subtitle">{news.subtitle}</h2>}

      {/* Full Content */}
      <div className="news-content" dangerouslySetInnerHTML={{ __html: news.content }} />

      {/* Social actions (optional) */}
      <div className="news-actions">
        <button className="like-btn">
          <ThumbsUp size={18} /> Like ({news.likes || 0})
        </button>
        <button className="share-btn">
          <Share2 size={18} /> Share
        </button>
      </div>
    </div>
  );
};

export default NewsView;