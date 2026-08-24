// App.js
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/pages/HomePage';
import NewsView from './components/pages/NewsView';
import CategoryPage from './components/pages/CategoryPage';
// Remove this import if you're using API data
// import { newsData } from './data/newsData';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/pages/AdminDashboard';
import Login from './components/pages/Login';
import SearchPage from './components/pages/SearchPage';
import { CategoriesProvider } from './context/CategoriesContext';

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {!isAdminRoute && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* HomePage - no longer needs newsData prop if it fetches from API */}
          <Route path="/" element={<HomePage />} />
          
          {/* NewsView - no longer needs newsData prop, it fetches by ID from API */}
          <Route path="/news/:id" element={<NewsView />} />
          
          {/* CategoryPage - no longer needs newsData prop, it fetches by category from API */}
          <Route path="/category/:category" element={<CategoryPage />} />
          
          {/* Admin routes */}
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
      <CategoriesProvider>
        <Layout />
      </CategoriesProvider>
    </BrowserRouter>
  );
}

export default App;