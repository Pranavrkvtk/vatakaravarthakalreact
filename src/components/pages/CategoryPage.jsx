// src/components/pages/CategoryPage.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsByCategory } from '../../api/news';   // 👈 API call
import { CATEGORY_COLORS } from './HomePage';         // reuse colour map
import { Clock, ArrowRight } from 'lucide-react';
import './CategoryPage.css';  // optional – you can keep your own CSS

const DateLine = ({ date }) => {
  const d = date ? new Date(date) : null;
  const formatted = d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Just now';
  return (
    <span className="date-meta">
      <Clock size={14} /> {formatted}
    </span>
  );
};

const CategoryPage = () => {
  const { category } = useParams();      // category name from URL
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getNewsByCategory(category)
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching category news:', err);
        setError('Failed to load news for this category.');
        setLoading(false);
      });
  }, [category]);  // re‑fetch when category changes

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-700">
          "{category}" വാർത്തകളൊന്നുമില്ല
        </h2>
        <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
          ← മുഖ്യപുറത്തേക്ക് മടങ്ങുക
        </Link>
      </div>
    );
  }

  const featured = news[0];
  const rest = news.slice(1);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
        <span
          className="inline-block px-3 py-1 rounded-full text-white text-sm"
          style={{ backgroundColor: CATEGORY_COLORS[category] || '#4338ca' }}
        >
          {category}
        </span>
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Featured News */}
          <div className="featured-news">
            <img
              src={featured.image || '/placeholder-image.jpg'}
              alt={featured.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            <Link to={`/news/${featured.id}`}>
              <h2 className="text-2xl font-bold mt-2">{featured.title}</h2>
            </Link>
            <DateLine date={featured.publishedDate || featured.createdAt} />
          </div>

          {/* Rest of the news in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rest.map((item) => (
              <div key={item.id} className="news-card border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                <Link to={`/news/${item.id}`}>
                  <img
                    src={item.image || '/placeholder-image.jpg'}
                    alt={item.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                      <DateLine date={item.publishedDate || item.createdAt} />
                      <span className="flex items-center gap-1 text-blue-600">
                        Read <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar – you can reuse your existing Sidebar component if needed */}
        <aside className="hidden lg:block">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-500 text-sm">— ADVERTISEMENT —</p>
            <div className="h-64 bg-gray-100 flex items-center justify-center">300×250</div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default CategoryPage;   // 👈 ensure this line exists