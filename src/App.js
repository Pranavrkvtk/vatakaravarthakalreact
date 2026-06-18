import React from 'react';
import Navbar from './components/Navbar';
import BreakingTicker from './components/BreakingTicker';
import FeaturedNews from './components/FeaturedNews';
import NewsGrid from './components/NewsGrid';
import MalayalamSection from './components/MalayalamSection';
// import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
const newsData = [
  {
    category: 'WEB DESK / BIG STORY / LATEST / NEWS',
    title: 'തൃശ്ശൂരിൽ വിദ്യാർഥികളെ ബന്ധിൽ കയ്യറ്റതിരുന്ന സംഭവം: കണ്ടുകൂടെ ലൈസൻസ് സന്ത്‌പേർഡ് ചെയ്തു',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=500&fit=crop',
    time: '2 hours ago'
  },
  {
    category: 'WEB DESK / BIG STORY / KERALA / LATEST / NEWS',
    title: 'പിടിയിലായത് ഇടനിലക്കാരനോ? ഉപ്പള വിഭ്ളേജ് ഓഫീസിൽ വിജിലൻസ് റെയ്ഡ്, കൈക്കെല്ലേ വാങ്ങിയത് കാഷ്ട്രത്തെ സ്വിപ്പൂർ',
    image: 'https://images.unsplash.com/photo-1584267385494-9fdd9a71ad75?w=800&h=500&fit=crop',
    time: '4 hours ago'
  },
  {
    category: 'WEB DESK / LATEST / NEWS',
    title: 'സംസ്ഥാനത്ത് വ്യാപക മഴ: എട്ട് ജില്ലകളിൽ യെല്ലോ അലേർട്ട്',
    image: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&h=500&fit=crop',
    time: '6 hours ago'
  },
  // ----- NEW ITEMS START HERE -----
  {
    category: 'WEB DESK / KERALA / LATEST / NEWS',
    title: 'വയനാട്ടിൽ ഉരുൾപൊട്ടൽ: ദുരിതാശ്വാസ പ്രവർത്തനങ്ങൾ തുടരുന്നു',
    image: 'https://images.unsplash.com/photo-1584267385494-9fdd9a71ad75?w=800&h=500&fit=crop',
    time: '8 hours ago'
  },
  {
    category: 'WEB DESK / SPORTS / LATEST / NEWS',
    title: 'ഐ.പി.എൽ. 2026: കൊൽക്കത്ത നൈറ്റ് റൈഡേഴ്സ് സെമിയിൽ',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=500&fit=crop',
    time: '10 hours ago'
  },
  {
    category: 'WEB DESK / BUSINESS / LATEST / NEWS',
    title: 'സംസ്ഥാന ബജറ്റ് അവതരിപ്പിച്ചു; പുതിയ പദ്ധതികൾ പ്രഖ്യാപിച്ചു',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop',
    time: '12 hours ago'
  },
  {
    category: 'WEB DESK / TECH / LATEST / NEWS',
    title: 'ഇന്ത്യയുടെ ആദ്യ സ്വദേശി ചിപ്പ് പുറത്തിറക്കി; ടെസ്റ്റ് വിജയകരം',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop',
    time: '14 hours ago'
  },
  {
    category: 'WEB DESK / ENTERTAINMENT / LATEST / NEWS',
    title: 'മമ്മൂട്ടിയുടെ പുതിയ ചിത്രത്തിന് മികച്ച പ്രതികരണം',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop',
    time: '1 day ago'
  },
  {
    category: 'WEB DESK / HEALTH / LATEST / NEWS',
    title: 'കേരളത്തിൽ ഡെങ്കി വ്യാപനം രൂക്ഷം; പ്രതിരോധ നിർദ്ദേശങ്ങൾ',
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&h=500&fit=crop',
    time: '1 day ago'
  }
]; 
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