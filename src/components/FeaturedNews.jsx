import React from "react";
import { useNavigate } from "react-router-dom";
import "./FeaturedNews.css";

const FeaturedNews = ({ news }) => {
  const navigate = useNavigate();

  if (!news) return null;

  const handleClick = () => {
    navigate(`/news/${news.id}`);
  };

  return (
    <div className="featured-news" onClick={handleClick}>
      <div className="featured-image-container">
        <img
          src={news.imageUrl || "https://via.placeholder.com/1200x600"}
          alt={news.title}
          className="featured-image"
        />
      </div>

      <div className="featured-content">
        <span className="featured-category">
          {news.category || "പ്രധാന വാർത്ത"}
        </span>

        <h1 className="featured-title">
          {news.title}
        </h1>

        <p className="featured-description">
          {news.summary || news.content?.substring(0, 180) + "..."}
        </p>

        <div className="featured-meta">
          <span>{news.author || "Admin"}</span>
          <span>•</span>
          <span>
            {news.createdAt
              ? new Date(news.createdAt).toLocaleDateString("en-IN")
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FeaturedNews;