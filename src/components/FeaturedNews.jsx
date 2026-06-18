// ==============================
// 4. components/FeaturedNews.jsx
// ==============================
import React from 'react';
import { Clock } from 'lucide-react';

const FeaturedNews = ({ news }) => {
  if (!news) return null;
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="relative">
        <img 
          src={news.image} 
          alt="News" 
          className="w-full h-64 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
          <div className="flex items-center space-x-2 mb-2">
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              BIG STORY
            </span>
            <span className="text-white/70 text-xs flex items-center">
              <Clock size={12} className="mr-1" />
              {news.time}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">
            {news.title}
          </h2>
          <p className="text-white/60 text-xs mt-1">{news.category}</p>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNews;