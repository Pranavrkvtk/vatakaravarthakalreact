import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';

const NewsGrid = ({ newsItems }) => {
  const navigate = useNavigate();

  if (!newsItems || newsItems.length === 0) {
    return null; // or show a message
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {newsItems.map((item) => (
        <div
          key={item.id}
          onClick={() => navigate(`/news/${item.id}`)}
          className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 hover:border-blue-200"
        >
          <div className="relative h-48 md:h-56 overflow-hidden"> {/* 👈 medium height */}
            <img
              src={item.image || item.imageUrl || 'https://via.placeholder.com/400x250'}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="p-5">
            <span className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              {item.category || 'വാർത്ത'}
            </span>
            <h3 className="text-lg font-bold text-gray-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              {item.summary || (item.content?.substring(0, 120) + '...')}
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>
                  {item.createdAt || item.time
                    ? new Date(item.createdAt || item.time).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Just now'}
                </span>
              </div>
              <span className="flex items-center gap-0.5 text-blue-500 font-medium group-hover:gap-1 transition-all">
                വായിക്കുക <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsGrid;