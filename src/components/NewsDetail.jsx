import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import axios from 'axios';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/news/${id}`);
        setArticle(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('വാർത്ത ലോഡ് ചെയ്യുന്നതിൽ പിശക് സംഭവിച്ചു. ദയവായി വീണ്ടും ശ്രമിക്കുക.');
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800">ലോഡ് ചെയ്യുന്നു...</h2>
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">പിശക്</h2>
        <p className="text-gray-600 mt-2">{error}</p>
        <Link to="/" className="inline-block mt-4 text-blue-600 hover:underline">
          ← മുഖ്യപുറത്തേക്ക് മടങ്ങുക
        </Link>
      </div>
    );
  }

  // Not found (if article is null after loading)
  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800">വാർത്ത കണ്ടെത്തിയില്ല</h2>
        <p className="text-gray-500 mt-2">ഈ വാർത്ത ലഭ്യമല്ല അല്ലെങ്കിൽ നീക്കം ചെയ്തിരിക്കുന്നു.</p>
        <Link to="/" className="inline-block mt-4 text-blue-600 hover:underline">
          ← മുഖ്യപുറത്തേക്ക് മടങ്ങുക
        </Link>
      </div>
    );
  }

  // Extract image URL – try multiple possible fields
  const imageSrc = article.image || article.imageUrl || 'https://via.placeholder.com/1200x600';

  // Format date – try different field names
  const dateString = article.createdAt || article.date || article.time;
  const formattedDate = dateString
    ? new Date(dateString).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Handle content: if it's an array, join with newlines; if string, keep as is
  let contentParagraphs = [];
  if (article.content) {
    if (Array.isArray(article.content)) {
      contentParagraphs = article.content;
    } else if (typeof article.content === 'string') {
      // Split by newline, but filter out empty lines
      contentParagraphs = article.content.split('\n').filter(p => p.trim() !== '');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4"
      >
        <ArrowLeft size={20} />
        <span>തിരികെ</span>
      </button>

      <article className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="w-full h-64 md:h-80">
          <img
            src={imageSrc}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/1200x600?text=Image+Not+Available';
            }}
          />
        </div>

        <div className="p-6 md:p-8">
          <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
            {article.category || 'പ്രധാന വാർത്ത'}
          </span>
          <h1 className="mt-4 text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <User size={16} />
              {article.author || 'Admin'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {formattedDate}
            </span>
          </div>
          <div className="mt-6 prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {contentParagraphs.length > 0 ? (
              contentParagraphs.map((paragraph, idx) => (
                <p key={idx} className="mb-4">{paragraph}</p>
              ))
            ) : (
              <p className="text-gray-400">വിവരണം ലഭ്യമല്ല.</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default NewsDetail;