import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeaturedNews = ({ news }) => {
  const navigate = useNavigate();
  if (!news) return null;

  const handleClick = () => {
    navigate(`/news/${news.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 cursor-pointer" onClick={handleClick}>
      {/* your existing JSX without <Link> */}
    </div>
  );
};

export default FeaturedNews;