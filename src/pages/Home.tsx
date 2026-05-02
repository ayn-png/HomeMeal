/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, where } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase/config';
import { Meal, OperationType } from '../types';
import MealCard from '../components/MealCard';
import { Utensils, Search, Filter, Loader2, MapPin, Target, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NearbyProviders from '../components/NearbyProviders';
import { UserProfile, UserRole } from '../types';
import { getCurrentPosition } from '../lib/utils';

const Home: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [providers, setProviders] = useState<UserProfile[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  useEffect(() => {
    // Fetch Meals
    const mealQ = query(collection(db, 'meals'), orderBy('createdAt', 'desc'));
    const unsubscribeMeals = onSnapshot(mealQ, (snapshot) => {
      const mealData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Meal[];
      setMeals(mealData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'meals');
      setLoading(false);
    });

    // Fetch Providers
    const providerQ = query(collection(db, 'users'), where('role', '==', UserRole.PROVIDER));
    const unsubscribeProviders = onSnapshot(providerQ, (snapshot) => {
      const providerData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setProviders(providerData);
    });

    return () => {
      unsubscribeMeals();
      unsubscribeProviders();
    };
  }, []);

  const handleDetectLocation = async () => {
    setDetecting(true);
    try {
      const pos = await getCurrentPosition();
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    } catch (err) {
      console.error('Location error:', err);
      alert('Could not detect location. Please check browser permissions.');
    } finally {
      setDetecting(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await deleteDoc(doc(db, 'meals', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `meals/${id}`);
      }
    }
  };

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || meal.category === categoryFilter;
    const matchesProvider = !selectedProvider || meal.providerId === selectedProvider.uid;
    return matchesSearch && matchesCategory && matchesProvider;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-12 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-3 bg-orange-100 text-orange-600 px-6 py-2 rounded-full mb-6 font-bold tracking-wide uppercase text-sm"
        >
          <Utensils size={20} />
          <span>Fresh Home-Cooked Meals</span>
        </motion.div>
        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Deliciousness Delivered.</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
          Support local home chefs and enjoy healthy, authentic meals delivered straight to your door.
        </p>

        {!userLocation ? (
          <button
            onClick={handleDetectLocation}
            disabled={detecting}
            className="inline-flex items-center gap-3 bg-white border border-orange-500 text-orange-500 px-8 py-4 rounded-2xl font-bold hover:bg-orange-500 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {detecting ? <Loader2 className="animate-spin" /> : <Target size={24} />}
            <span>Find Chefs Near Me</span>
          </button>
        ) : (
          <div className="bg-orange-50 inline-flex items-center gap-3 px-6 py-3 rounded-2xl border border-orange-100">
            <MapPin size={20} className="text-orange-500" />
            <span className="font-bold text-orange-700">Exploration mode enabled</span>
            <button onClick={() => setUserLocation(null)} className="text-xs font-bold text-orange-400 hover:text-orange-600 underline">Change</button>
          </div>
        )}
      </header>

      <AnimatePresence>
        {userLocation && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-20"
          >
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Nearby Home Kitchens</h2>
              <div className="h-0.5 grow bg-gray-100"></div>
            </div>
            <NearbyProviders 
              userLocation={userLocation} 
              providers={providers} 
              onSelectProvider={setSelectedProvider} 
            />
          </motion.section>
        )}
      </AnimatePresence>

      <section id="meals-listing">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {selectedProvider ? `${selectedProvider.name}'s Kitchen` : 'Explore All Meals'}
            </h2>
            {selectedProvider && (
              <button 
                onClick={() => setSelectedProvider(null)}
                className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest"
              >
                Clear Filter
              </button>
            )}
          </div>
          <div className="h-0.5 grow bg-gray-100 mx-8 hidden lg:block"></div>
        </div>

        <div className="mb-10 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="relative grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search for a meal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-gray-100 bg-white shadow-sm rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all outline-none"
              />
            </div>

            <div className="flex gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
              {(['all', 'veg', 'non-veg'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-6 py-2 rounded-xl font-bold capitalize transition-all whitespace-nowrap text-sm ${
                    categoryFilter === cat 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="text-orange-500 animate-spin mb-4" size={48} />
            <p className="text-gray-500 font-medium tracking-wide">Cooking up something special...</p>
          </div>
        ) : filteredMeals.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <Utensils size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No meals match your filter</h3>
            <p className="text-gray-400 uppercase font-bold tracking-widest text-sm">Try clearing filters or changing search</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
