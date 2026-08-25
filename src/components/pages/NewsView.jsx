// src/components/pages/NewsView.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsById } from '../../api/news';
import { getImageSrc } from '../../utils/imageUtils';
import { ArrowLeft, Calendar, Clock, Image as ImageIcon } from 'lucide-react';
import './NewsView.css';

const NewsView = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const articleRef = useRef(null);
  const imageRef = useRef(null);

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

  // ============================================================
  // PROTECTION: Disable right-click on entire article (silent)
  // ============================================================
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // ============================================================
  // PROTECTION: Disable keyboard shortcuts (silent)
  // ============================================================
  const handleKeyDown = (e) => {
    // Prevent Ctrl+C, Ctrl+S, Ctrl+P, Ctrl+U, Ctrl+Shift+I, F12
    if (
      (e.ctrlKey || e.metaKey) && 
      ['c', 'C', 's', 'S', 'p', 'P', 'u', 'U', 'i', 'I'].includes(e.key)
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Prevent F12 (DevTools)
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Prevent Ctrl+Shift+I (DevTools)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'i' || e.key === 'I')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Prevent Ctrl+Shift+J (DevTools Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'j' || e.key === 'J')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Prevent Ctrl+U (View Source)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // ============================================================
  // PROTECTION: Disable text selection (silent)
  // ============================================================
  const handleSelectStart = (e) => {
    // Allow selection on share buttons and back link
    if (e.target.closest('.share-btn') || e.target.closest('.back-link')) {
      return true;
    }
    e.preventDefault();
    return false;
  };

  // ============================================================
  // PROTECTION: Disable copy (silent)
  // ============================================================
  const handleCopy = (e) => {
    // Allow copy on share buttons and back link
    if (e.target.closest('.share-btn') || e.target.closest('.back-link')) {
      return true;
    }
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // ============================================================
  // PROTECTION: Disable cut (silent)
  // ============================================================
  const handleCut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // ============================================================
  // PROTECTION: Disable paste (silent)
  // ============================================================
  const handlePaste = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // ============================================================
  // PROTECTION: Disable drag (silent)
  // ============================================================
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // ============================================================
  // PROTECTION: Disable drop (silent)
  // ============================================================
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // ============================================================
  // PROTECTION: Disable image interactions (silent)
  // ============================================================
  const handleImageContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleImageDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  // ============================================================
  // PROTECTION: Disable touch events on mobile (silent)
  // ============================================================
  const handleTouchStart = (e) => {
    const target = e.target;
    // Allow touch on share buttons and back link
    if (target.closest('.share-btn') || target.closest('.back-link')) {
      return true;
    }
    
    // Block long press on images and text
    if (target.tagName === 'IMG' || target.closest('.protected-content')) {
      // Only block if it's a long press (touch > 500ms)
      const touchStartTime = Date.now();
      const timer = setTimeout(() => {
        const touchEndTime = Date.now();
        if (touchEndTime - touchStartTime > 500) {
          e.preventDefault();
        }
      }, 500);
      
      target._touchTimer = timer;
    }
  };

  const handleTouchEnd = (e) => {
    const target = e.target;
    if (target._touchTimer) {
      clearTimeout(target._touchTimer);
      delete target._touchTimer;
    }
  };

  const handleTouchMove = (e) => {
    // Block touch move on images
    if (e.target.tagName === 'IMG' || e.target.closest('.protected-content')) {
      e.preventDefault();
      return false;
    }
  };

  // ============================================================
  // PROTECTION: Disable double click selection (silent)
  // ============================================================
  const handleDoubleClick = (e) => {
    if (!e.target.closest('.share-btn') && !e.target.closest('.back-link')) {
      e.preventDefault();
      return false;
    }
  };

  // ============================================================
  // Share functions
  // ============================================================
  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = `${news.title}\n\nRead more: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareOnInstagram = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('📋 Link copied! Open Instagram and paste it in your story or post.');
  };

  // ============================================================
  // Render
  // ============================================================
  if (loading) return <div className="news-view-container"><div className="loader">Loading...</div></div>;
  if (error) return <div className="news-view-container error">{error}</div>;
  if (!news) return <div className="news-view-container">Article not found.</div>;

  const imageSrc = getImageSrc(news.image);

  return (
    <div 
      className="news-view-container protected-content"
      ref={articleRef}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      onSelectStart={handleSelectStart}
      onCopy={handleCopy}
      onCut={handleCut}
      onPaste={handlePaste}
      onDragStart={handleDrag}
      onDrag={handleDrag}
      onDrop={handleDrop}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onDoubleClick={handleDoubleClick}
      // CSS protection
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        pointerEvents: 'auto',
        touchAction: 'manipulation',
      }}
    >
      <Link to="/" className="back-link">
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <article className="news-article">
        {/* Image display with protection */}
        {news.image && (
          <div className="article-image-wrapper">
            <div className="image-protection-overlay">
              <img 
                ref={imageRef}
                src={imageSrc || '/placeholder-image.jpg'}
                alt={news.title}
                className={`article-image ${isImageLoaded ? 'loaded' : 'loading'}`}
                onError={(e) => {
                  console.error('Image failed to load:', imageSrc);
                  e.target.src = '/placeholder-image.jpg';
                }}
                onLoad={handleImageLoad}
                onContextMenu={handleImageContextMenu}
                onDragStart={handleImageDrag}
                draggable={false}
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  pointerEvents: 'none',
                  WebkitTouchCallout: 'none',
                  touchAction: 'none',
                }}
              />
              {/* Protection layer - invisible but blocks all interactions */}
              <div 
                className="image-protection-layer"
                onContextMenu={handleImageContextMenu}
                onDragStart={handleImageDrag}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              />
      
            </div>
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
        </div>

        <h1 className="article-title">{news.title}</h1>
        {news.subtitle && <h2 className="article-subtitle">{news.subtitle}</h2>}

        <div
          className="article-content protected-text"
          dangerouslySetInnerHTML={{ __html: news.content }}
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            WebkitTouchCallout: 'none',
          }}
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

        {/* Share Buttons - WhatsApp, Facebook, Instagram */}
        <div className="share-section">
          <h3 className="share-title">Share this News</h3>
          <div className="share-buttons">
            {/* WhatsApp */}
            <button className="share-btn whatsapp" onClick={shareOnWhatsApp}>
              <span className="share-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </span>
              <span className="share-label">WhatsApp</span>
            </button>

            {/* Facebook */}
            <button className="share-btn facebook" onClick={shareOnFacebook}>
              <span className="share-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </span>
              <span className="share-label">Facebook</span>
            </button>

            {/* Instagram */}
            <button className="share-btn instagram" onClick={shareOnInstagram}>
              <span className="share-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </span>
              <span className="share-label">Instagram</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default NewsView;