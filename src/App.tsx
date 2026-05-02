/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddMeal from './pages/AddMeal';
import Orders from './pages/Orders';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/add-meal" 
                element={
                  <ProtectedRoute>
                    <AddMeal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          
          <footer className="mt-20 border-t border-gray-100 py-12 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="bg-orange-500 p-1.5 rounded-lg">
                  <div className="w-4 h-4 text-white">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                  </div>
                </div>
                <span className="text-xl font-bold tracking-tight">HomeMeal</span>
              </div>
              <p className="text-gray-400 text-sm font-medium">Built with love for home chefs and students.</p>
              <div className="mt-8 flex justify-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-300">
                <a href="#" className="hover:text-orange-500 transition-colors">About Us</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Privacy</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Terms</a>
                <a href="#" className="hover:text-orange-500 transition-colors">Contact</a>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
