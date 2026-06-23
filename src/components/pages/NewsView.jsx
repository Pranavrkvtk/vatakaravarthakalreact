import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsById } from '../../api/news';
import { ArrowLeft, Calendar, Eye, ThumbsUp, Share2, Clock } from 'lucide-react';
import './NewsView.css';

const NewsView = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    getNewsById(id)
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Article not found.');
        setLoading(false);
      });
  }, [id]);

  const handleLike = () => {
    // optimistic update – you can also call API to persist
    setLiked(!liked);
    setNews((prev) => ({
      ...prev,
      likes: liked ? prev.likes - 1 : prev.likes + 1,
    }));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) return <div className="news-view-container"><div className="loader">Loading...</div></div>;
  if (error) return <div className="news-view-container error">{error}</div>;
  if (!news) return <div className="news-view-container">Article not found.</div>;

  return (
    <div className="news-view-container">
      {/* Back link */}
      <Link to="/" className="back-link">
        <ArrowLeft size={18} /> Back to Home
      </Link>

      {/* Article card */}
      <article className="news-article">
        {/* Image with overlay gradient */}
        <div className="article-image-wrapper">
          <img src={news.image || '/placeholder-image.jpg'} alt={news.title} />
          <div className="image-overlay">
            <span className="category-badge">{news.category || 'General'}</span>
          </div>
        </div>

        {/* Meta row */}
        <div className="article-meta">
          <span className="meta-item">
            <Calendar size={16} />
            {new Date(news.publishedDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span className="meta-item">
            <Clock size={16} />
            {new Date(news.publishedDate).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span className="meta-item">
            <Eye size={16} /> {news.views || 0} views
          </span>
        </div>

        {/* Title & subtitle */}
        <h1 className="article-title">{news.title}</h1>
        {news.subtitle && <h2 className="article-subtitle">{news.subtitle}</h2>}

        {/* Content (rendered as HTML) */}
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {/* Action buttons */}
        <div className="article-actions">
          <button
            className={`action-btn like-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <ThumbsUp size={20} fill={liked ? 'currentColor' : 'none'} />
            <span>{news.likes || 0}</span>
          </button>
          <button className="action-btn share-btn" onClick={handleShare}>
            <Share2 size={20} />
            <span>Share</span>
          </button>
        </div>
      </article>
    </div>
  );
};

export default NewsView;