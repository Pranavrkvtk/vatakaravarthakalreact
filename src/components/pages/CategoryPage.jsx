import React from 'react';
import { useParams, Link } from 'react-router-dom';
import FeaturedNews from '../FeaturedNews';
import NewsGrid from '../NewsGrid';

const CategoryPage = ({ newsData }) => {
  const { category } = useParams();
  const filtered = newsData.filter(item =>
    item.category?.toLowerCase().includes(category?.toLowerCase())
  );

  if (filtered.length === 0) {
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

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
        {category}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FeaturedNews news={featured} />
          <NewsGrid newsItems={rest} />
        </div>
        <aside className="hidden lg:block">Sidebar</aside>
      </div>
    </main>
  );
};

export default CategoryPage;   // 👈 MUST have this line