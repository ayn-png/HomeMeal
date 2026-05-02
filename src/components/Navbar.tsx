/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { CookingPot, LogOut, ShoppingBag, PlusCircle, User, LogIn } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-orange-500 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <CookingPot className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">HomeMeal</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Home</Link>
          
          {user ? (
            <>
              {profile?.role === UserRole.PROVIDER && (
                <Link to="/add-meal" className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 font-medium transition-colors">
                  <PlusCircle size={20} />
                  <span>Add Meal</span>
                </Link>
              )}
              
              <Link to="/orders" className="flex items-center gap-1.5 text-gray-600 hover:text-orange-500 font-medium transition-colors">
                <ShoppingBag size={20} />
                <span>Orders</span>
              </Link>
              
              <div className="h-6 w-px bg-gray-200"></div>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{profile?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-full">
                  <User className="text-gray-600" size={20} />
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-orange-500 font-medium transition-colors">Login</Link>
              <Link 
                to="/register" 
                className="bg-orange-500 text-white px-5 py-2 rounded-full font-semibold hover:bg-orange-600 transition-all flex items-center gap-2"
              >
                <LogIn size={18} />
                <span>Join Now</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
