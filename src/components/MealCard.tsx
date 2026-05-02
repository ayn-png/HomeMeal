/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Meal, UserRole, OrderStatus, OperationType } from '../types';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Trash2, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MealCardProps {
  meal: Meal;
  onDelete?: (id: string) => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onDelete }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const handleOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (profile?.role !== UserRole.STUDENT) {
      alert('Only students can place orders.');
      return;
    }

    setOrdering(true);
    try {
      const orderData = {
        userId: user.uid,
        userName: profile?.name || 'Anonymous',
        mealId: meal.id,
        mealTitle: meal.title,
        mealPrice: meal.price,
        mealImageUrl: meal.imageUrl,
        providerId: meal.providerId,
        status: OrderStatus.PENDING,
        timestamp: Date.now(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      setOrdered(true);
      setTimeout(() => setOrdered(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'orders');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <motion.div 
      layout
      className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 flex flex-col h-full group"
    >
      <div className="relative h-56 overflow-hidden">
        <img 
          src={meal.imageUrl} 
          alt={meal.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
            meal.category === 'veg' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {meal.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{meal.title}</h3>
          <div className="flex items-center text-orange-500 gap-1 bg-orange-50 px-2 py-1 rounded-lg">
            <Star size={14} fill="currentColor" />
            <span className="text-sm font-bold">{meal.rating?.toFixed(1) || 'new'}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
          <span>By</span>
          <span className="font-semibold text-gray-700">{meal.providerName}</span>
        </p>

        <div className="mt-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest leading-none mb-1">Price</p>
            <p className="text-2xl font-black text-gray-900">${meal.price.toFixed(2)}</p>
          </div>

          {profile?.role === UserRole.PROVIDER && user?.uid === meal.providerId ? (
            <button 
              onClick={() => onDelete && onDelete(meal.id)}
              className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
              title="Delete Meal"
            >
              <Trash2 size={24} />
            </button>
          ) : (
            <button 
              onClick={handleOrder}
              disabled={ordering || ordered}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 ${
                ordered 
                  ? 'bg-green-500 text-white' 
                  : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-100'
              } disabled:opacity-75`}
            >
              <AnimatePresence mode="wait">
                {ordered ? (
                  <motion.div 
                    key="ordered"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle size={20} />
                    <span>Ordered!</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="idle"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    <span>{ordering ? 'Wait...' : 'Order'}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MealCard;
