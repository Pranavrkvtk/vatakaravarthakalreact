import React from "react";
import { useNavigate } from "react-router-dom";

const FeaturedNews = ({ news }) => {
  const navigate = useNavigate();

  if (!news) return null;

  const handleClick = () => {
    navigate(`/news/${news.id}`);
  };

  const imageSrc = news.image || news.imageUrl || "https://via.placeholder.com/1200x600";
  const dateString = news.createdAt || news.time;
  const formattedDate = dateString
    ? new Date(dateString).toLocaleDateString("en-IN")
    : "";

  return (
    <div
      className="group relative bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 cursor-pointer transition-shadow hover:shadow-md"
      onClick={handleClick}
    >
      <div className="relative w-full h-56 md:h-72"> {/* 👈 medium height */}
        <img
          src={imageSrc}
          alt={news.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="p-4 md:p-6">
        <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
          {news.category || "പ്രധാന വാർത്ത"}
        </span>

        <h1 className="mt-2 text-xl md:text-2xl font-bold text-gray-800 leading-tight line-clamp-2">
          {news.title}
        </h1>

        <p className="mt-1 text-sm text-gray-600 line-clamp-3">
{news.summary ||
  (Array.isArray(news.content)
    ? news.content.join(' ').substring(0, 180) + '...'
    : news.content?.substring(0, 180) + '...')}        </p>

        <div className="mt-3 flex items-center text-xs text-gray-400 space-x-2">
          <span>{news.author || "Admin"}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNews;