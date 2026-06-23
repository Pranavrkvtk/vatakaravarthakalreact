// src/components/pages/NewsView.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsById } from '../../api/news';
import { getImageSrc } from '../../utils/imageUtils';
import { ArrowLeft, Calendar, Eye, ThumbsUp, Share2, Clock } from 'lucide-react';
import './NewsView.css';

const NewsView = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    getNewsById(id)
      .then((data) => {
        console.log('=== FETCHED NEWS ===');
        console.log('ID:', data.id);
        console.log('Title:', data.title);
        console.log('Image exists:', !!data.image);
        if (data.image) {
          console.log('Image length:', data.image.length);
          console.log('Image type:', data.image.startsWith('data:') ? 'base64' : 'url');
          console.log('Image preview:', data.image.substring(0, 100) + '...');
        }
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

  const imageSrc = getImageSrc(news.image);

  return (
    <div className="news-view-container">
      <Link to="/" className="back-link">
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <article className="news-article">
        {/* ✅ Image display - NO INLINE STYLES */}
        {news.image && (
          <div className="article-image-wrapper">
            <img 
              src={imageSrc || '/placeholder-image.jpg'}
              alt={news.title}
              onError={(e) => {
                console.error('Image failed to load:', imageSrc);
                setImageError(true);
                e.target.src = '/placeholder-image.jpg';
              }}
              // ✅ REMOVED: style prop - let CSS handle it
            />
            <div className="image-overlay">
              <span className="category-badge">{news.category || 'General'}</span>
            </div>
          </div>
        )}

        <div className="article-meta">
          <span className="meta-item">
            <Calendar size={16} />
            {new Date(news.publishedDate || news.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span className="meta-item">
            <Clock size={16} />
            {new Date(news.publishedDate || news.createdAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span className="meta-item">
            <Eye size={16} /> {news.views || 0} views
          </span>
        </div>

        <h1 className="article-title">{news.title}</h1>
        {news.subtitle && <h2 className="article-subtitle">{news.subtitle}</h2>}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {news.tags && (
          <div className="article-tags">
            {news.tags.split(',').map((tag, index) => (
              <span key={index} className="tag">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

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