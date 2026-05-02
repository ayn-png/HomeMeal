/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError } from '../firebase/config';
import { motion } from 'motion/react';
import { UserPlus, Mail, Lock, User, Briefcase, GraduationCap, AlertCircle, MapPin, Phone, Target } from 'lucide-react';
import { UserRole, OperationType, UserProfile } from '../types';
import { getCurrentPosition } from '../lib/utils';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDetectLocation = async () => {
    setDetecting(true);
    try {
      const pos = await getCurrentPosition();
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    } catch (err: any) {
      setError('Could not detect location. Please check your browser permissions.');
    } finally {
      setDetecting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === UserRole.PROVIDER && (!location || !phone || !address)) {
      setError('Providers must provide location and contact details.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const profileData: UserProfile = {
        uid: user.uid,
        name,
        email,
        role,
        createdAt: Date.now(),
        ...(role === UserRole.PROVIDER ? {
          phone,
          address,
          latitude: location?.lat,
          longitude: location?.lng,
          rating: 0,
          reviewCount: 0
        } : {})
      };

      try {
        await setDoc(doc(db, 'users', user.uid), profileData);
        navigate('/');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-orange-100 p-4 rounded-2xl mb-4 text-orange-600">
            <UserPlus size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Join HomeMeal</h2>
          <p className="mt-2 text-gray-600">Start your home-cooked journey today</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-gray-900"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-gray-900"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Join as a:</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.STUDENT)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    role === UserRole.STUDENT 
                      ? 'border-orange-500 bg-orange-50 text-orange-600' 
                      : 'border-gray-100 hover:border-gray-300 text-gray-500'
                  }`}
                >
                  <GraduationCap size={24} />
                  <span className="font-bold text-sm">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.PROVIDER)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    role === UserRole.PROVIDER 
                      ? 'border-orange-500 bg-orange-50 text-orange-600' 
                      : 'border-gray-100 hover:border-gray-300 text-gray-500'
                  }`}
                >
                  <Briefcase size={24} />
                  <span className="font-bold text-sm">Provider</span>
                </button>
              </div>
            </div>

            {role === UserRole.PROVIDER && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-gray-100"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none text-gray-900"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Physical Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <MapPin size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all outline-none text-gray-900"
                      placeholder="123 Chef Street, Food City"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Geolocation</label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detecting}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                      location 
                        ? 'bg-green-50 border-green-500 text-green-700' 
                        : 'bg-white border-dashed border-gray-300 text-gray-600 hover:border-orange-500 hover:text-orange-500'
                    }`}
                  >
                    {detecting ? (
                      <Target className="animate-spin" size={20} />
                    ) : location ? (
                      <Target size={20} />
                    ) : (
                      <MapPin size={20} />
                    )}
                    <span className="font-bold">
                      {detecting ? 'Detecting...' : location ? 'Location Captured ✓' : 'Pin My Location'}
                    </span>
                  </button>
                  <p className="text-[10px] text-gray-400 mt-1 px-1 italic">We use this to show your kitchen to nearby hungry students!</p>
                </div>
              </motion.div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-white bg-orange-500 hover:bg-orange-600 font-bold text-lg shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
