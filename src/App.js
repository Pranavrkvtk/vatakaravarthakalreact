// App.js
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';
import NewsView from './components/pages/NewsView';
import CategoryPage from './components/pages/CategoryPage';
import { newsData } from './data/newsData';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/pages/AdminDashboard';
import Login from './components/pages/Login';
import SearchPage from './components/pages/SearchPage';
// Import the provider
import { CategoriesProvider } from './context/CategoriesContext';

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {!isAdminRoute && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage newsData={newsData} />} />
          <Route path="/news/:id" element={<NewsView newsData={newsData} />} />
          <Route path="/category/:category" element={<CategoryPage newsData={newsData} />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* CategoriesProvider now wraps the entire Layout, making categories available everywhere */}
      <CategoriesProvider>
        <Layout />
      </CategoriesProvider>
    </BrowserRouter>
  );
}

export default App;