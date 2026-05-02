/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { UserRole, OperationType } from '../types';
import { PlusCircle, Image as ImageIcon, IndianRupee, Tag, Send, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const AddMeal: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'veg' | 'non-veg'>('veg');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (profile?.role !== UserRole.PROVIDER) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !user) {
      setError('Please provide an image for the meal.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // 1. Upload image to Storage
      const imageRef = ref(storage, `meals/${Date.now()}_${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      // 2. Save meal data to Firestore
      const mealData = {
        title,
        price: parseFloat(price),
        category,
        imageUrl,
        providerId: user.uid,
        providerName: profile.name,
        createdAt: Date.now(),
      };

      await addDoc(collection(db, 'meals'), mealData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to add meal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100"
      >
        <div className="flex items-center gap-4 mb-10 border-b border-gray-50 pb-6">
          <div className="bg-orange-100 p-4 rounded-2xl text-orange-600">
            <PlusCircle size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Add New Meal</h1>
            <p className="text-gray-500 font-medium">Share your delicious cooking with the students</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-8">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Meal Title</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Tag size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-100 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none text-gray-900 font-medium"
                  placeholder="e.g. Grandma's Special Biryani"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Price ($)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <IndianRupee size={18} />
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-100 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all outline-none text-gray-900 font-medium"
                  placeholder="9.99"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-widest">Category</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCategory('veg')}
                  className={`py-3 rounded-2xl font-bold transition-all border-2 ${
                    category === 'veg' 
                      ? 'bg-green-50 border-green-500 text-green-700' 
                      : 'bg-gray-50 border-transparent text-gray-400 hover:border-gray-200'
                  }`}
                >
                  Vegetarian
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('non-veg')}
                  className={`py-3 rounded-2xl font-bold transition-all border-2 ${
                    category === 'non-veg' 
                      ? 'bg-red-50 border-red-500 text-red-700' 
                      : 'bg-gray-50 border-transparent text-gray-400 hover:border-gray-200'
                  }`}
                >
                  Non-Vegetarian
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest">Meal Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                  id="image-upload"
                  required
                />
                <label 
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full aspect-square border-4 border-dashed border-gray-100 rounded-3xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer group"
                >
                  {image ? (
                    <div className="relative w-full h-full p-4">
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-2xl shadow-md"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl m-4">
                        <p className="text-white font-bold flex items-center gap-2">
                          <ImageIcon size={20} />
                          Change Image
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="bg-white p-6 rounded-3xl shadow-sm text-gray-400 mb-4 group-hover:scale-110 transition-transform inline-block">
                        <ImageIcon size={48} />
                      </div>
                      <p className="text-gray-500 font-bold mb-1">Click to upload photo</p>
                      <p className="text-xs text-gray-400">PNG, JPG or JPEG (Max 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 py-4 rounded-2xl text-white bg-orange-500 hover:bg-orange-600 font-bold text-xl shadow-xl shadow-orange-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Post Meal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddMeal;
