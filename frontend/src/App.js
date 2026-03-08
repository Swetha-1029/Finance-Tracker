import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from '@/components/ui/sonner';

import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ExpensesPage from './pages/ExpensesPage';
import CalendarPage from './pages/CalendarPage';
import AIInsightsPage from './pages/AIInsightsPage';
import BudgetsPage from './pages/BudgetsPage';
import Layout from './components/Layout';



// Add this interceptor BEFORE return (
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


// 1️⃣ API base URL from .env
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';
export const API = `${BACKEND_URL}/api`;

// 2️⃣ Auth context
export const AuthContext = React.createContext(null);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3️⃣ Fetch user if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      // 🔥 FIXED: Clean user data from /auth/me endpoint
      setUser({
        id: response.data.id,
        email: response.data.email,
        name: response.data.name
      });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  // 4️⃣ Login and logout handlers - BOTH FIXED 
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({
      id: userData.id,
      email: userData.email,
      name: userData.name
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // 5️⃣ Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Auth route */}
          <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />

          {/* Protected routes */}
          <Route path="/" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/auth" />} />
          <Route path="/expenses" element={user ? <Layout><ExpensesPage /></Layout> : <Navigate to="/auth" />} />
          <Route path="/calendar" element={user ? <Layout><CalendarPage /></Layout> : <Navigate to="/auth" />} />
          <Route path="/insights" element={user ? <Layout><AIInsightsPage /></Layout> : <Navigate to="/auth" />} />
          <Route path="/budgets" element={user ? <Layout><BudgetsPage /></Layout> : <Navigate to="/auth" />} />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </AuthContext.Provider>
  );
}

export default App;
