/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ConfirmationResult,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { motion } from 'motion/react';
import { AlertCircle, Chrome, KeyRound, Lock, LogIn, Mail, MessageSquareText, Phone } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    };
  }, []);

  const getRecaptchaVerifier = () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }

    return recaptchaVerifierRef.current;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingCode(true);
    setError('');

    try {
      const verifier = getRecaptchaVerifier();
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Use an international format like +15551234567.');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirmationResult) {
      setError('Please request a verification code first.');
      return;
    }

    setVerifyingCode(true);
    setError('');

    try {
      await confirmationResult.confirm(verificationCode);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to verify code.');
    } finally {
      setVerifyingCode(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.18),transparent_32%),linear-gradient(180deg,#fffdf8_0%,#fff_48%,#fff7ed_100%)] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full bg-white/95 backdrop-blur border border-orange-100 p-8 sm:p-10 rounded-4xl shadow-[0_24px_80px_rgba(251,146,60,0.15)]"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-orange-100 p-4 rounded-2xl mb-4 text-orange-600">
            <LogIn size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-gray-600 max-w-lg mx-auto">Sign in with email and password, Google, or phone verification.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-6 animate-pulse">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Email and password</h3>
                  <p className="text-sm text-gray-500">Use your existing account credentials.</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleEmailLogin}>
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

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-white bg-orange-500 hover:bg-orange-600 font-bold text-lg shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {emailLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            </div>

            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
                  <Chrome size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Google</h3>
                  <p className="text-sm text-gray-500">Continue with your Google account.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-gray-200 bg-white text-gray-800 hover:border-orange-300 hover:text-orange-600 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {googleLoading ? 'Opening Google...' : 'Continue with Google'}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
                <Phone size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Phone verification</h3>
                <p className="text-sm text-gray-500">Get a one-time code on your phone.</p>
              </div>
            </div>

            {!confirmationResult ? (
              <form className="space-y-4" onSubmit={handleSendCode}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-gray-900"
                      placeholder="+15551234567"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Use international format with country code.</p>
                </div>

                <button
                  type="submit"
                  disabled={sendingCode}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-white bg-gray-900 hover:bg-black font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <MessageSquareText size={18} />
                  {sendingCode ? 'Sending code...' : 'Send Verification Code'}
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleVerifyCode}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Verification Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none text-gray-900"
                      placeholder="123456"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={verifyingCode}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-white bg-orange-500 hover:bg-orange-600 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {verifyingCode ? 'Verifying...' : 'Verify and Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConfirmationResult(null);
                    setVerificationCode('');
                  }}
                  className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold hover:border-orange-300 hover:text-orange-600 transition-colors"
                >
                  Change phone number
                </button>
              </form>
            )}

            <div id="recaptcha-container" />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 font-bold hover:underline">
              Create one for free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
