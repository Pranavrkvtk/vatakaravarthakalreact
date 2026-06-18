import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BreakingTicker from './components/BreakingTicker';
import FeaturedNews from './components/FeaturedNews';
import NewsGrid from './components/NewsGrid';
import MalayalamSection from './components/MalayalamSection';
import NewsDetail from './components/NewsDetail';
import Footer from './components/Footer';

// ✅ Define newsData with id and content
const newsData = [
  {
    id: 1,
    category: 'WEB DESK / BIG STORY / LATEST / NEWS',
    title: 'തൃശ്ശൂരിൽ വിദ്യാർഥികളെ ബന്ധിൽ കയ്യറ്റതിരുന്ന സംഭവം: കണ്ടുകൂടെ ലൈസൻസ് സന്ത്‌പേർഡ് ചെയ്തു',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=500&fit=crop',
    time: '2 hours ago',
    content: 'പൂർണ്ണ വിവരണം...'
  },
  // ... add all items with id and content
];

// ✅ Nav items (if still using inside Navbar – but you have it hardcoded, so it's fine)
// We'll keep it here for reference, but it's not used if Navbar has its own list.

function Home() {
  return (
    <>
      <BreakingTicker />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FeaturedNews news={newsData[0]} />
            <NewsGrid newsItems={newsData.slice(1)} />
            <MalayalamSection />
          </div>
          {/* <Sidebar ... /> */}
        </div>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news/:id" element={<NewsDetail newsData={newsData} />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;