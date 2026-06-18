// ==============================
// 5. components/NewsGrid.jsx
// ==============================
import React from 'react';
import { Clock } from 'lucide-react';

const NewsGrid = ({ newsItems }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {newsItems.map((item, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
          <img 
            src={item.image} 
            alt="News" 
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                LATEST
              </span>
              <span className="text-gray-400 text-xs flex items-center">
                <Clock size={12} className="mr-1" />
                {item.time}
              </span>
            </div>
            <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">
              {item.title}
            </h3>
            <p className="text-gray-400 text-[10px] mt-1">{item.category}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsGrid;