import React from 'react';
import { useNavigate } from 'react-router-dom';

const NewsGrid = ({ newsItems }) => {
  const navigate = useNavigate();

  const handleClick = (id) => {
    navigate(`/news/${id}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {newsItems.map((item) => (
        <div key={item.id} className="bg-white rounded-xl ... cursor-pointer" onClick={() => handleClick(item.id)}>
          {/* card content */}
        </div>
      ))}
    </div>
  );
};

export default NewsGrid;