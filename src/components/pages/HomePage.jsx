import React from 'react';
import BreakingTicker from '../BreakingTicker';
import FeaturedNews from '../FeaturedNews';
import NewsGrid from '../NewsGrid';

const HomePage = ({ newsData }) => {
  if (!newsData || newsData.length === 0) {
    return <main className="max-w-7xl mx-auto px-4 py-6">No news</main>;
  }

  return (
    <>
      <BreakingTicker />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FeaturedNews news={newsData[0]} />
            <NewsGrid newsItems={newsData.slice(1)} />
          </div>
          <aside className="hidden lg:block">Sidebar</aside>
        </div>
      </main>
    </>
  );
};

export default HomePage;