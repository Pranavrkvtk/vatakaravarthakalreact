import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';

const NewsDetail = ({ newsData }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const article = newsData.find(item => Number(item.id) === Number(id));

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

  const imageSrc = article.image || article.imageUrl || 'https://via.placeholder.com/1200x600';
  const dateString = article.createdAt || article.time;
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
        <div className="w-full h-64 md:h-80"> {/* 👈 medium height */}
          <img
            src={imageSrc}
            alt={article.title}
            className="w-full h-full object-cover"
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
            {article.content ? (
              article.content.split('\n').map((paragraph, idx) => (
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