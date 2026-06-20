import React, { useEffect, useState } from 'react';
import { getLatestNews } from '../../services/newsService';
import { Link } from 'react-router-dom';

const LatestNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestNews()
      .then(res => setNews(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading latest news...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Latest News</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map(item => (
          <Link key={item.id} to={`/news/${item.id}`} className="block bg-white shadow rounded overflow-hidden hover:shadow-lg transition">
            <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="text-gray-600 mt-2">{item.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LatestNews;