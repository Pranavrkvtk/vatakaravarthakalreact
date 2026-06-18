import React from 'react';
import Navbar from './components/Navbar';
import BreakingTicker from './components/BreakingTicker';
import FeaturedNews from './components/FeaturedNews';
import NewsGrid from './components/NewsGrid';
import MalayalamSection from './components/MalayalamSection';
// import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

function App() {
  const navItems = [
    { label: 'NEWS' }, { label: 'ENTERTAINMENT' }, { label: 'SPORTS' },
    { label: 'BUSINESS' }, { label: 'TECH' }, { label: 'HEALTH' },
    { label: 'FOOD' }, { label: 'EDUCATION & CAREER' }, { label: 'AUTO' },
    { label: 'CRIME' }, { label: 'GULF' }, { label: 'WORLD' }
  ];


  const trendingNews = [
    { title: 'രാജ്യത്ത് കോവിഡ് വ്യാപനം വർധിക്കുന്നു', time: '1 hour ago' },
    { title: 'സംസ്ഥാന ബജറ്റ് അവതരിപ്പിച്ചു', time: '3 hours ago' },
    { title: 'ഇന്ത്യ-പാക് അതിർത്തിയിൽ വെടിനിർത്തൽ', time: '5 hours ago' },
    { title: 'ചന്ദ്രയാൻ-3 വിജയകരമായി വിക്ഷേപിച്ചു', time: '7 hours ago' },
    { title: 'കേരളത്തിൽ പുതിയ ടൂറിസം പദ്ധതികൾ', time: '9 hours ago' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar navItems={navItems} />
      <BreakingTicker />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FeaturedNews news={newsData[0]} />
            <NewsGrid newsItems={newsData.slice(1)} />
            <MalayalamSection />
          </div>
          {/* <Sidebar trending={trendingNews} navItems={navItems} /> */}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;