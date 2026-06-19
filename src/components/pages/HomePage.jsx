import React from 'react';
import BreakingTicker from '../BreakingTicker';
import FeaturedNews from '../FeaturedNews';
import NewsGrid from '../NewsGrid';
// import MalayalamSection from '../components/MalayalamSection'; // uncomment when ready
const HomePage = ({ newsData }) => {
  // If no data, show a loading/empty state
  if (!newsData || newsData.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-center text-gray-500">No news available</p>
      </main>
    );
  }

  // Use first item as featured, rest in grid
  const featuredNews = newsData[0];
  const gridNews = newsData.slice(1);

  return (
    <>
      <BreakingTicker />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Featured + Grid */}
          <div className="lg:col-span-2 space-y-6">
            <FeaturedNews news={featuredNews} />
            <NewsGrid newsItems={gridNews} />
            {/* <MalayalamSection /> */}
          </div>

          {/* Right column: Sidebar (optional) */}
          <aside className="hidden lg:block">
            {/* You can add a sidebar component here later */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <h3 className="font-bold text-lg mb-2">Trending</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {gridNews.slice(0, 5).map((item) => (
                  <li key={item.id} className="border-b border-gray-100 pb-2">
                    <a href={`/news/${item.id}`} className="hover:text-blue-600">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
};

export default HomePage;