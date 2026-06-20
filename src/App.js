import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';
import NewsView from './components/pages/NewsView';   // renamed from NewsDetail
import CategoryPage from './components/pages/CategoryPage';
import { newsData } from './data/newsData';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/pages/AdminDashboard'
import Login from './components/pages/Login';
import SearchPage from './components/pages/SearchPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage newsData={newsData} />} />
          <Route path="/news/:id" element={<NewsView newsData={newsData} />} />
          <Route path="/category/:category" element={<CategoryPage newsData={newsData} />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<SearchPage />} />

          <Route path="/login" element={<Login />} />


        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;