/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Order, UserRole, OrderStatus, OperationType } from '../types';
import { ShoppingBag, Clock, CheckCircle2, User, MapPin, ExternalLink, Loader2, Star, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { updateAverageRating } from '../services/ratingService';

const Orders: React.FC = () => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingOrderId, setRatingOrderId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;

    let q;
    if (profile.role === UserRole.STUDENT) {
      q = query(
        collection(db, 'orders'), 
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
    } else {
      q = query(
        collection(db, 'orders'), 
        where('providerId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(orderData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, profile]);

  const markAsDelivered = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: OrderStatus.DELIVERED
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const submitReview = async (order: Order) => {
    if (!user) return;
    setSubmittingReview(true);
    try {
      const reviewData = {
        userId: user.uid,
        userName: profile?.name || 'Anonymous',
        mealId: order.mealId,
        rating,
        comment,
        timestamp: Date.now()
      };
      await addDoc(collection(db, 'reviews'), reviewData);
      
      // Trigger rating aggregation
      await updateAverageRating(order.mealId, order.providerId);

      setRatingOrderId(null);
      setComment('');
      setRating(5);
      alert('Thank you for your rating!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'reviews');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="text-orange-500 animate-spin mb-4" size={48} />
        <p className="text-gray-500 font-medium">Fetching your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {profile?.role === UserRole.STUDENT ? 'My Orders' : 'Incoming Orders'}
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            {profile?.role === UserRole.STUDENT 
              ? 'Track your meal deliveries and history' 
              : 'Manage and fulfill orders from students'}
          </p>
        </div>
        <div className="bg-orange-100 p-4 rounded-3xl text-orange-600 hidden sm:block">
          <ShoppingBag size={28} />
        </div>
      </header>

      {orders.length > 0 ? (
        <div className="space-y-6">
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center group hover:shadow-md transition-all"
              >
                <div className="relative w-full md:w-32 h-32 rounded-2xl overflow-hidden shadow-inner">
                  <img 
                    src={order.mealImageUrl} 
                    alt={order.mealTitle} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white ${
                    order.status === OrderStatus.DELIVERED ? 'bg-green-500' : 'bg-orange-500'
                  }`}>
                    {order.status}
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{order.mealTitle}</h3>
                      <p className="text-sm font-medium text-gray-400 font-mono tracking-tighter">Order ID: #{order.id.slice(0, 8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900">${order.mealPrice.toFixed(2)}</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Amount Paid</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User size={16} className="text-orange-400" />
                      <span className="font-semibold">{profile?.role === UserRole.STUDENT ? 'Provider' : 'Student'}:</span>
                      <span className="truncate">{profile?.role === UserRole.STUDENT ? 'Home Chef' : order.userName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} className="text-orange-400" />
                      <span className="font-semibold">Time:</span>
                      <span className="truncate">{new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} className="text-orange-400" />
                      <span className="font-semibold">Method:</span>
                      <span className="truncate">Cash on Delivery</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CheckCircle2 size={16} className={order.status === OrderStatus.DELIVERED ? 'text-green-500' : 'text-gray-300'} />
                      <span className="font-semibold">Status:</span>
                      <span className={order.status === OrderStatus.DELIVERED ? 'text-green-600 font-bold' : 'text-orange-500'}>{order.status}</span>
                    </div>
                  </div>
                </div>

                {profile?.role === UserRole.PROVIDER && order.status === OrderStatus.PENDING && (
                  <button
                    onClick={() => markAsDelivered(order.id)}
                    className="w-full md:w-auto px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 size={24} />
                    <span>Mark as Delivered</span>
                  </button>
                )}

                {profile?.role === UserRole.STUDENT && order.status === OrderStatus.DELIVERED && (
                  <div className="w-full md:w-auto">
                    {ratingOrderId === order.id ? (
                      <div className="bg-orange-50 p-6 rounded-3xl w-full md:w-80 space-y-4 shadow-inner border border-orange-100">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-orange-900 uppercase tracking-widest text-xs">Rate Meal</span>
                          <button onClick={() => setRatingOrderId(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} onClick={() => setRating(s)} className="p-1 hover:scale-110 transition-transform">
                              <Star size={24} fill={rating >= s ? '#f97316' : 'none'} className={rating >= s ? 'text-orange-500' : 'text-gray-300'} />
                            </button>
                          ))}
                        </div>
                        <textarea
                          placeholder="What did you think of the meal?"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full p-4 bg-white border border-orange-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-orange-500 resize-none h-24 font-medium"
                        />
                        <button
                          disabled={submittingReview}
                          onClick={() => submitReview(order)}
                          className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-orange-100"
                        >
                          <Send size={18} />
                          <span>{submittingReview ? 'Sending...' : 'Submit Review'}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setRatingOrderId(order.id)}
                        className="w-full md:w-auto px-8 py-4 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Star size={24} />
                        <span>Rate Meal</span>
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
          <ShoppingBag size={80} className="mx-auto text-gray-200 mb-6" />
          <h3 className="text-3xl font-black text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm max-w-xs mx-auto">
            {profile?.role === UserRole.STUDENT 
              ? "Hungry? Start exploring delicious local meals on our homepage!" 
              : "Hang tight! Your delicious meals will attract customers soon."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Orders;
