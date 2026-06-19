import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';
import NewsDetail from './components/NewsDetail';
import CategoryPage from './components/pages/CategoryPage'; // 👈 new
import { newsData } from './data/newsData';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage newsData={newsData} />} />
          <Route path="/news/:id" element={<NewsDetail newsData={newsData} />} />
          <Route path="/category/:category" element={<CategoryPage newsData={newsData} />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;