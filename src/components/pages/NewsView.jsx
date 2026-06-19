import React, { useState, useEffect } from 'react';
import {
  Clock, ArrowLeft, Share2, Link2, MessageCircle, Bookmark,
  ThumbsUp, Eye, ChevronRight,
} from 'lucide-react';
import './NewsView.css';

// ----------------------------------------------------------------
// Category color map (kept in sync with HomePage.jsx)
// ----------------------------------------------------------------
const CATEGORY_COLORS = {
  'കേരളം': '#4338ca',
  'പ്രാദേശികം': '#4338ca',
  'ചരമം': '#d97706',
  'കായികം': '#059669',
  'യാത്ര': '#0284c7',
};

// ----------------------------------------------------------------
// Mock article (replace with the article fetched by id/slug)
// ----------------------------------------------------------------
const article = {
  category: 'കേരളം',
  title: 'ഗവർണർ യോഗം വിളിച്ചു; ജനാധിപത്യ മര്യാദകളുടെ ലംഘനമെന്ന് മുഖ്യമന്ത്രി',
  subtitle:
    'നിയമസഭാ സമ്മേളനത്തിന് മുന്നോടിയായി ഗവർണർ വിളിച്ച പ്രത്യേക യോഗത്തിൽ സർക്കാർ പ്രതിനിധികൾ പങ്കെടുത്തില്ല എന്ന് വൃത്തങ്ങൾ അറിയിച്ചു',
  author: 'സുനിൽ കുമാർ',
  date: 'JUNE 19, 2026',
  readTime: '4 മിനിറ്റ് വായന',
  views: '12.4K',
  likes: 312,
  image: 'https://picsum.photos/seed/featuredmain/1200/700',
  imageCaption: 'ഗവർണർ വിളിച്ച യോഗത്തിൽ നിന്നുള്ള ദൃശ്യം',
  content: [
    'സംസ്ഥാനത്തെ ഭരണപരമായ ചില വിഷയങ്ങൾ ചർച്ച ചെയ്യുന്നതിനായി ഗവർണർ വിളിച്ചുചേർത്ത യോഗത്തിൽ സർക്കാർ ഭാഗത്തുനിന്നുള്ള മുതിർന്ന പ്രതിനിധികൾ ഹാജരായില്ല എന്നാണ് റിപ്പോർട്ടുകൾ. ഇത് സംബന്ധിച്ച് ഇരുഭാഗത്തുനിന്നും വ്യത്യസ്ത വിശദീകരണങ്ങളാണ് പുറത്തുവരുന്നത്.',
    'വിഷയത്തിൽ പ്രതികരിച്ച മുഖ്യമന്ത്രി, ജനാധിപത്യപരമായ കീഴ്‌വഴക്കങ്ങൾ പാലിക്കാതെയാണ് യോഗം വിളിച്ചതെന്നും, ഇത് ഭരണഘടനാപരമായ പരിധികൾക്ക് അനുസൃതമല്ലെന്നും ആരോപിച്ചു. എന്നാൽ ഇക്കാര്യത്തിൽ രാജ്ഭവൻ ഇതുവരെ ഔദ്യോഗിക പ്രതികരണം നൽകിയിട്ടില്ല.',
    'പ്രതിപക്ഷ നേതാക്കൾ വിഷയത്തിൽ ഇടപെട്ടു, സർക്കാരും ഗവർണറും തമ്മിലുള്ള ഭിന്നത പരിഹരിക്കാൻ വേഗത്തിൽ ചർച്ച നടത്തണമെന്ന് ആവശ്യപ്പെട്ടു. നിയമസഭാ സമ്മേളനത്തിന് ദിവസങ്ങൾ മാത്രം ശേഷിക്കെയാണ് ഈ സംഭവവികാസം എന്നതും ശ്രദ്ധേയമാണ്.',
    'അതിനിടെ, വിഷയത്തിൽ ഭരണഘടനാ വിദഗ്ധരുടെ അഭിപ്രായം തേടാൻ സർക്കാർ ഒരുങ്ങുന്നതായും സൂചനയുണ്ട്. അടുത്ത ദിവസങ്ങളിൽ ഇതുസംബന്ധിച്ച കൂടുതൽ വ്യക്തത ഉണ്ടാകുമെന്നാണ് കരുതുന്നത്.',
  ],
  pullQuote: 'ജനാധിപത്യപരമായ കീഴ്‌വഴക്കങ്ങൾ പാലിക്കാതെയാണ് യോഗം വിളിച്ചതെന്ന് മുഖ്യമന്ത്രി ആരോപിച്ചു.',
  tags: ['ഗവർണർ', 'നിയമസഭ', 'കേരള രാഷ്ട്രീയം', 'മുഖ്യമന്ത്രി'],
};

const relatedNews = [
  {
    id: 31,
    category: 'കേരളം',
    title: 'നിയമസഭാ സമ്മേളനം അടുത്ത ആഴ്ച; അജണ്ട പുറത്തുവിട്ടു',
    image: 'https://picsum.photos/seed/related1/200/200',
    date: 'JUNE 18, 2026',
  },
  {
    id: 32,
    category: 'കേരളം',
    title: 'പ്രതിപക്ഷ യോഗം ഇന്ന്; തന്ത്രങ്ങൾ ചർച്ച ചെയ്യും',
    image: 'https://picsum.photos/seed/related2/200/200',
    date: 'JUNE 18, 2026',
  },
  {
    id: 33,
    category: 'ദേശീയം',
    title: 'സമാന സംഭവം മറ്റൊരു സംസ്ഥാനത്തും; കേന്ദ്രം നിരീക്ഷിക്കുന്നു',
    image: 'https://picsum.photos/seed/related3/200/200',
    date: 'JUNE 17, 2026',
  },
  {
    id: 34,
    category: 'പ്രാദേശികം',
    title: 'ജില്ലാ ഭരണകൂടം പുതിയ മാർഗനിർദേശം പുറപ്പെടുവിച്ചു',
    image: 'https://picsum.photos/seed/related4/200/200',
    date: 'JUNE 17, 2026',
  },
];

const moreFromCategory = [
  {
    id: 41,
    category: 'കേരളം',
    title: 'പുതിയ പദ്ധതിക്ക് മന്ത്രിസഭയുടെ അംഗീകാരം',
    image: 'https://picsum.photos/seed/more1/420/260',
    date: 'JUNE 19, 2026',
  },
  {
    id: 42,
    category: 'കേരളം',
    title: 'ജില്ലാ കളക്ടർമാരുടെ യോഗം നാളെ',
    image: 'https://picsum.photos/seed/more2/420/260',
    date: 'JUNE 19, 2026',
  },
  {
    id: 43,
    category: 'കേരളം',
    title: 'പുതുക്കിയ ബജറ്റ് നിർദേശങ്ങൾ അവതരിപ്പിച്ചു',
    image: 'https://picsum.photos/seed/more3/420/260',
    date: 'JUNE 18, 2026',
  },
];

// ----------------------------------------------------------------
// Reading progress bar (fixed, fills as the page is scrolled)
// ----------------------------------------------------------------
const ReadingProgress = () => {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? (scrolled / max) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="av-progress-track">
      <div className="av-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
};

const DateLine = ({ date, className = '' }) => (
  <span className={`av-date-meta ${className}`}>
    <Clock size={12} /> {date}
  </span>
);

// ----------------------------------------------------------------
// Breadcrumb
// ----------------------------------------------------------------
const Breadcrumb = ({ category }) => (
  <div className="av-breadcrumb">
    <a href="#"><ArrowLeft size={14} /> ഹോം</a>
    <ChevronRight size={13} className="av-breadcrumb-sep" />
    <a href="#">{category}</a>
    <ChevronRight size={13} className="av-breadcrumb-sep" />
    <span className="av-breadcrumb-current">വാർത്ത</span>
  </div>
);

// ----------------------------------------------------------------
// Share row
// ----------------------------------------------------------------
const ShareRow = () => (
  <div className="av-share-row">
    <span className="av-share-label">ഷെയർ ചെയ്യുക</span>
    <button className="av-share-chip av-share-whatsapp">
      <MessageCircle size={14} /> WhatsApp
    </button>
    <button className="av-share-chip av-share-generic">
      <Share2 size={14} /> ഷെയർ
    </button>
    <button className="av-share-chip av-share-generic">
      <Link2 size={14} /> ലിങ്ക് കോപ്പി
    </button>
  </div>
);

// ----------------------------------------------------------------
// Related news mini list (used in sidebar)
// ----------------------------------------------------------------
const RelatedList = () => (
  <div className="av-related-box">
    <p className="av-box-title">ബന്ധപ്പെട്ട വാർത്തകൾ</p>
    <ul className="av-related-list">
      {relatedNews.map((n) => (
        <li key={n.id}>
          <img src={n.image} alt="" />
          <div className="av-related-info">
            <p>{n.title}</p>
            <DateLine date={n.date} />
          </div>
        </li>
      ))}
    </ul>
  </div>
);

const SidebarAd = () => (
  <div className="av-ad-box">
    <p className="av-ad-label">— ADVERTISEMENT —</p>
    <div className="av-ad-content"><div className="av-ad-placeholder">300×250</div></div>
  </div>
);

// ----------------------------------------------------------------
// More-from-category card (compact)
// ----------------------------------------------------------------
const MoreCard = ({ news }) => (
  <div className="av-more-card">
    <div className="av-more-img-wrap">
      <img src={news.image} alt="" />
      <span
        className="av-category-tag"
        style={{ backgroundColor: CATEGORY_COLORS[news.category] || '#4338ca' }}
      >
        {news.category}
      </span>
    </div>
    <div className="av-more-body">
      <h4>{news.title}</h4>
      <DateLine date={news.date} />
    </div>
  </div>
);

// ----------------------------------------------------------------
// Page
// ----------------------------------------------------------------
const NewsView = () => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likes);
  const [saved, setSaved] = useState(false);

  const toggleLike = () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <div className="av-page">
      <ReadingProgress />

      <div className="av-layout">
        {/* ---------------- Main article column ---------------- */}
        <article className="av-article">
          <Breadcrumb category={article.category} />

          <span
            className="av-category-pill"
            style={{ backgroundColor: CATEGORY_COLORS[article.category] || '#4338ca' }}
          >
            {article.category}
          </span>

          <h1 className="av-title">{article.title}</h1>
          <p className="av-subtitle">{article.subtitle}</p>

          <div className="av-meta-row">
            <div className="av-author">
              <div className="av-author-avatar">{article.author.charAt(0)}</div>
              <div>
                <p className="av-author-name">{article.author}</p>
                <DateLine date={article.date} />
              </div>
            </div>
            <div className="av-meta-stats">
              <span><Eye size={14} /> {article.views}</span>
              <span>{article.readTime}</span>
            </div>
          </div>

          <div className="av-hero-wrap">
            <img src={article.image} alt="" className="av-hero-img" />
          </div>
          <p className="av-caption">{article.imageCaption}</p>

          <ShareRow />

          <div className="av-body">
            {article.content.slice(0, 2).map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            <blockquote className="av-pullquote">{article.pullQuote}</blockquote>

            {article.content.slice(2).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="av-tags">
            {article.tags.map((t) => (
              <span key={t} className="av-tag">#{t}</span>
            ))}
          </div>

          <div className="av-engage-row">
            <button className={`av-engage-btn ${liked ? 'av-active' : ''}`} onClick={toggleLike}>
              <ThumbsUp size={16} /> {likeCount}
            </button>
            <button className={`av-engage-btn ${saved ? 'av-active' : ''}`} onClick={() => setSaved((v) => !v)}>
              <Bookmark size={16} /> {saved ? 'സേവ് ചെയ്തു' : 'സേവ് ചെയ്യുക'}
            </button>
          </div>

          <div className="av-mid-ad">
            <p className="av-ad-label">— ADVERTISEMENT —</p>
            <div className="av-ad-content av-ad-content-wide"><div className="av-ad-placeholder">728×90</div></div>
          </div>

          <div className="av-more-section">
            <p className="av-box-title">{article.category} വിഭാഗത്തിൽ നിന്ന് കൂടുതൽ</p>
            <div className="av-more-grid">
              {moreFromCategory.map((n) => (
                <MoreCard key={n.id} news={n} />
              ))}
            </div>
          </div>

          <div className="av-comments">
            <p className="av-box-title">അഭിപ്രായങ്ങൾ (0)</p>
            <textarea className="av-comment-input" placeholder="നിങ്ങളുടെ അഭിപ്രായം എഴുതുക..." rows={3} />
            <button className="av-comment-submit">പോസ്റ്റ് ചെയ്യുക</button>
            <p className="av-comments-empty">ഇതുവരെ അഭിപ്രായങ്ങൾ ഒന്നുമില്ല. ആദ്യം അഭിപ്രായം എഴുതൂ.</p>
          </div>
        </article>

        {/* ---------------- Sidebar ---------------- */}
        <aside className="av-aside">
          <RelatedList />
          <SidebarAd />
        </aside>
      </div>
    </div>
  );
};

export default NewsView;