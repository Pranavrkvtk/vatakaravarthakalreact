import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';

// ✅ Your news data (could also be moved to a separate file)
const newsData = [
  {
    id: 1,
    category: 'WEB DESK / BIG STORY / LATEST / NEWS',
    title: 'തൃശ്ശൂരിൽ വിദ്യാർഥികളെ ബന്ധിൽ കയ്യറ്റതിരുന്ന സംഭവം: കണ്ടുകൂടെ ലൈസൻസ് സന്ത്‌പേർഡ് ചെയ്തു',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=500&fit=crop',
    time: '2 hours ago',
    content: 'പൂർണ്ണ വിവരണം...'
  },
  // ... add more items
];

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage newsData={newsData} />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;