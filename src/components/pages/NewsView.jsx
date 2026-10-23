// src/components/pages/NewsView.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsById, getAdsByPosition, recordAdView, recordAdClick } from '../../api/news';
import { getImageSrc } from '../../utils/imageUtils';
import { ArrowLeft, Calendar, Clock, Image as ImageIcon } from 'lucide-react';
import DOMPurify from 'dompurify';
import './NewsView.css';

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%2394a3b8' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
const sanitize = (html) => DOMPurify.sanitize(html);

const InContentAd = ({ position = 'mid-content', className = '' }) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const loadAds = async () => {
      try {
        const data = await getAdsByPosition(position);
        if (data && data.length > 0) {
          setAds(data);
          if (data[0].id) recordAdView(data[0].id);
        }
      } catch (error) {
        console.error(`❌ Error loading ads for ${position}:`, error);
      } finally {
        setLoading(false);
      }
    };
    loadAds();
  }, [position]);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
        setImgError(false);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [ads]);

  if (loading) return <div className={`in-content-ad ${className}`}><div className="ad-label">— {position === 'header' ? 'ADVERTISEMENT' : 'SPONSORED'} —</div><div className="in-content-ad-link" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>Loading ad...</div></div>;
  if (ads.length === 0) {
    if (position === 'header') return null;
    return <div className={`in-content-ad ${className}`}><div className="ad-label">— SPONSORED —</div><div className="in-content-ad-link" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', textAlign: 'center', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '14px' }}>Ad space available</div></div>;
  }

  const ad = ads[currentIndex];
  const handleAdClick = (e) => { if (ad.id) recordAdClick(ad.id); if (!ad.linkUrl) e.preventDefault(); };
  const imageSrc = ad.imageUrl ? getImageSrc(ad.imageUrl) : null;
  const isHeader = position === 'header';

  return (
    <div className={`in-content-ad ${className}`}>
      <div className="ad-label">— {isHeader ? 'ADVERTISEMENT' : 'SPONSORED'} —</div>
      <a href={ad.linkUrl || '#'} target={ad.linkUrl ? '_blank' : '_self'} rel="noopener noreferrer" onClick={handleAdClick} className="in-content-ad-link" style={{ backgroundColor: ad.backgroundColor || '#ffffff', border: isHeader ? 'none' : `1px solid ${ad.borderColor || '#e2e8f0'}`, borderBottom: isHeader ? '1px solid #e2e8f0' : `1px solid ${ad.borderColor || '#e2e8f0'}`, borderRadius: isHeader ? '0' : '12px', overflow: 'hidden', display: 'block', textDecoration: 'none', width: '100%' }}>
        {imageSrc && !imgError ? (
          <img src={imageSrc} alt={ad.altText || ad.title || 'Advertisement'} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} onError={() => setImgError(true)} />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width: '100%' }}>
            <h4 style={{ margin: 0, color: '#0f172a', fontSize: '16px' }}>{ad.title || 'Advertisement'}</h4>
            {ad.description && <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '14px' }}>{ad.description}</p>}
          </div>
        )}
        {ads.length > 1 && !isHeader && (
          <div className="ad-dots" style={{ display: 'flex', justifyContent: 'center', gap: '6px', padding: '8px 0', background: '#f8fafc' }}>
            {ads.map((_, idx) => <span key={idx} style={{ width: idx === currentIndex ? '16px' : '8px', height: '8px', borderRadius: '4px', background: idx === currentIndex ? '#6C63FF' : '#e2e8f0', transition: 'all 0.3s ease', display: 'inline-block' }} />)}
          </div>
        )}
      </a>
    </div>
  );
};

const splitIntoBlocks = (content) => {
  if (!content) return [];
  const lines = content.split('\n');
  const blocks = [];
  let currentBlock = '';
  let inList = false;
  let listType = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentBlock) { blocks.push(currentBlock); currentBlock = ''; inList = false; listType = null; }
      continue;
    }
    const isOrderedListItem = /^\d+\.\s/.test(trimmed);
    const isUnorderedListItem = /^[-*•]\s/.test(trimmed);
    const isListItem = isOrderedListItem || isUnorderedListItem;
    const isHeading = /^#{1,6}\s/.test(trimmed);
    
    if (isListItem) {
      if (currentBlock && !inList) { blocks.push(currentBlock); currentBlock = ''; }
      if (!inList) { inList = true; listType = isOrderedListItem ? 'ordered' : 'unordered'; currentBlock = trimmed; }
      else { currentBlock += '\n' + trimmed; }
    } else if (isHeading) {
      if (currentBlock) { blocks.push(currentBlock); currentBlock = ''; }
      inList = false; listType = null; blocks.push(trimmed);
    } else {
      if (inList) {
        if (currentBlock) { blocks.push(currentBlock); currentBlock = ''; }
        inList = false; listType = null; currentBlock = trimmed;
      } else {
        if (currentBlock) { currentBlock += ' ' + trimmed; } else { currentBlock = trimmed; }
      }
    }
  }
  if (currentBlock) blocks.push(currentBlock);
  return blocks;
};

const isListBlock = (block) => {
  const lines = block.split('\n').filter(l => l.trim());
  if (lines.length === 0) return false;
  return /^\d+\.\s/.test(lines[0].trim()) || /^[-*•]\s/.test(lines[0].trim());
};

const isHeadingBlock = (block) => /^#{1,6}\s/.test(block.trim());

const renderListBlock = (block, key) => {
  const lines = block.split('\n').filter(item => item.trim());
  if (lines.length === 0) return null;
  const isOrdered = /^\d+\.\s/.test(lines[0].trim());
  
  const listItems = lines.map((item, idx) => {
    let text = item.trim();
    text = isOrdered ? text.replace(/^\d+\.\s*/, '') : text.replace(/^[-*•]\s*/, '');
    return <li key={`${key}-li-${idx}`} dangerouslySetInnerHTML={{ __html: sanitize(text) }} />;
  });
  
  return (
    <div key={key} className="article-list-wrapper">
      {isOrdered ? <ol className="article-list ordered">{listItems}</ol> : <ul className="article-list unordered">{listItems}</ul>}
    </div>
  );
};

const renderHeadingBlock = (block, key) => {
  const trimmed = block.trim();
  const match = trimmed.match(/^(#{1,6})\s(.+)/);
  if (!match) return null;
  const HeadingTag = `h${Math.min(match[1].length, 6)}`;
  return React.createElement(HeadingTag, { key: key, className: 'article-heading' }, match[2]);
};

const renderContentWithInlineAds = (content, adPositions = []) => {
  if (!content) return <p>No content available</p>;
  const blocks = splitIntoBlocks(content);
  if (blocks.length === 0) return <div dangerouslySetInnerHTML={{ __html: sanitize(content) }} />;

  const elements = [];
  let adIndex = 0;
  let renderedBlockCount = 0;

  blocks.forEach((block, blockIndex) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    const shouldHaveAd = adPositions.includes(renderedBlockCount);

    if (isHeadingBlock(trimmed)) {
      elements.push(renderHeadingBlock(trimmed, `heading-${blockIndex}`));
      renderedBlockCount++;
    } else if (isListBlock(trimmed)) {
      elements.push(renderListBlock(trimmed, `list-${blockIndex}`));
      renderedBlockCount++;
    } else {
      const isLongParagraph = trimmed.length > 100;
      if (shouldHaveAd && isLongParagraph) {
        let sentences = trimmed.match(/[^.!?]+[.!?]+/g);
        if (!sentences || sentences.length < 2) {
          const words = trimmed.split(' ');
          if (words.length > 10) {
            const midPoint = Math.floor(words.length * 0.5);
            const firstHalf = words.slice(0, midPoint).join(' ');
            const secondHalf = words.slice(midPoint).join(' ');
            
            elements.push(<div key={`p-${blockIndex}-start`} className="article-paragraph"><span dangerouslySetInnerHTML={{ __html: sanitize(firstHalf) }} /></div>);
            elements.push(<InContentAd key={`ad-inline-${blockIndex}-${adIndex}`} position="inline" className="ad-inline" />);
            adIndex++;
            elements.push(<div key={`p-${blockIndex}-end`} className="article-paragraph"><span dangerouslySetInnerHTML={{ __html: sanitize(secondHalf) }} /></div>);
          } else {
            elements.push(<div key={`p-${blockIndex}`} className="article-paragraph"><span dangerouslySetInnerHTML={{ __html: sanitize(trimmed) }} /></div>);
          }
        } else {
          const breakIndex = Math.floor(sentences.length * 0.5);
          const firstHalf = sentences.slice(0, breakIndex).join(' ');
          const secondHalf = sentences.slice(breakIndex).join(' ');
          
          elements.push(<div key={`p-${blockIndex}-start`} className="article-paragraph"><span dangerouslySetInnerHTML={{ __html: sanitize(firstHalf) }} /></div>);
          elements.push(<InContentAd key={`ad-inline-${blockIndex}-${adIndex}`} position="inline" className="ad-inline" />);
          adIndex++;
          elements.push(<div key={`p-${blockIndex}-end`} className="article-paragraph"><span dangerouslySetInnerHTML={{ __html: sanitize(secondHalf) }} /></div>);
        }
      } else {
        elements.push(<div key={`p-${blockIndex}`} className="article-paragraph"><span dangerouslySetInnerHTML={{ __html: sanitize(trimmed) }} /></div>);
        if (renderedBlockCount % 3 === 2 && renderedBlockCount < blocks.length - 1) {
          elements.push(<InContentAd key={`ad-between-${blockIndex}`} position="mid-content" className="ad-between-paragraphs" />);
        }
      }
      renderedBlockCount++;
    }
  });

  elements.push(<InContentAd key="ad-end" position="footer" className="ad-content-end" />);
  return elements;
};

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
      .then((data) => { setNews(data); setLoading(false); })
      .catch((err) => { console.error(err); setError('Article not found.'); setLoading(false); });
  }, [id]);

  const renderContent = () => {
    if (!news || !news.content) return <p>No content available</p>;
    return renderContentWithInlineAds(news.content, [1, 3, 5, 7, 9]);
  };

  const handleContextMenu = (e) => { e.preventDefault(); return false; };
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && ['c', 'C', 's', 'S', 'p', 'P', 'u', 'U', 'i', 'I'].includes(e.key)) e.preventDefault();
    if (e.key === 'F12') e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J')) e.preventDefault();
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) e.preventDefault();
  };
  const handleSelectStart = (e) => { if (!e.target.closest('.share-btn') && !e.target.closest('.back-link')) e.preventDefault(); };
  const handleCopy = (e) => { if (!e.target.closest('.share-btn') && !e.target.closest('.back-link')) e.preventDefault(); };
  const handleCut = (e) => e.preventDefault();
  const handlePaste = (e) => e.preventDefault();
  const handleDrag = (e) => e.preventDefault();
  const handleDrop = (e) => e.preventDefault();
  const handleImageContextMenu = (e) => e.preventDefault();
  const handleImageDrag = (e) => e.preventDefault();
  const handleTouchMove = (e) => { if (e.target.tagName === 'IMG' || e.target.closest('.protected-content')) e.preventDefault(); };

  const shareOnWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`${news.title}\n\nRead more: ${window.location.href}`)}`, '_blank');
  const shareOnFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  const shareOnInstagram = () => { navigator.clipboard.writeText(window.location.href); alert('📋 Link copied!'); };

  if (loading) return <div className="news-view-container"><div className="loader">Loading...</div></div>;
  if (error) return <div className="news-view-container error">{error}</div>;
  if (!news) return <div className="news-view-container">Article not found.</div>;

  const imageSrc = getImageSrc(news.image) || FALLBACK_IMG;

  return (
    <div className="news-view-container protected-content" ref={articleRef} onContextMenu={handleContextMenu} onKeyDown={handleKeyDown} onSelectStart={handleSelectStart} onCopy={handleCopy} onCut={handleCut} onPaste={handlePaste} onDragStart={handleDrag} onDrag={handleDrag} onDrop={handleDrop} onTouchMove={handleTouchMove} style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', WebkitTouchCallout: 'none', pointerEvents: 'auto', touchAction: 'manipulation' }}>
      
      <div className="header-ad-wrapper"><InContentAd position="header" className="ad-header-top" /></div>
      <Link to="/" className="back-link"><ArrowLeft size={18} /> Back to Home</Link>

      <article className="news-article">
        {news.image && (
          <div className="article-image-wrapper">
            <div className="image-protection-overlay">
              <img ref={imageRef} src={imageSrc} alt={news.title} className={`article-image ${isImageLoaded ? 'loaded' : 'loading'}`} onError={(e) => { e.target.src = FALLBACK_IMG; }} onLoad={() => setIsImageLoaded(true)} onContextMenu={handleImageContextMenu} onDragStart={handleImageDrag} draggable={false} style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', pointerEvents: 'none', WebkitTouchCallout: 'none', touchAction: 'none' }} />
              <div className="image-protection-layer" onContextMenu={handleImageContextMenu} onDragStart={handleImageDrag} />
            </div>
            <div className="image-overlay"><span className="category-badge">{news.category || 'General'}</span></div>
          </div>
        )}

        <div className="article-meta">
          <span className="meta-item"><Calendar size={16} />{new Date(news.publishedDate || news.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span className="meta-item"><Clock size={16} />{new Date(news.publishedDate || news.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <h1 className="article-title">{news.title}</h1>
        {news.subtitle && <h2 className="article-subtitle">{news.subtitle}</h2>}

        <div className="article-content protected-text">
          {renderContent()}
        </div>

        {news.tags && (
          <div className="article-tags">
            {news.tags.split(',').map((tag, index) => (<span key={index} className="tag">#{tag.trim()}</span>))}
          </div>
        )}

        <div className="share-section">
          <h3 className="share-title">Share this News</h3>
          <div className="share-buttons">
            <button className="share-btn whatsapp" onClick={shareOnWhatsApp}><span className="share-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></span><span className="share-label">WhatsApp</span></button>
            <button className="share-btn facebook" onClick={shareOnFacebook}><span className="share-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></span><span className="share-label">Facebook</span></button>
            <button className="share-btn instagram" onClick={shareOnInstagram}><span className="share-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></span><span className="share-label">Instagram</span></button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default NewsView;