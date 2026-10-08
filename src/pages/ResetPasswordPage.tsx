import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export const ResetPasswordPage: React.FC = () => {
  const { setCurrentPage, syncUserSession } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [linkExpired, setLinkExpired] = useState(false);

  useEffect(() => {
    // Check if error was passed in URL hash or search params
    if (typeof window !== 'undefined') {
      const rawHash = window.location.hash.startsWith('#')
        ? window.location.hash.substring(1)
        : window.location.hash;
      const rawSearch = window.location.search.startsWith('?')
        ? window.location.search.substring(1)
        : window.location.search;
      const params = new URLSearchParams(rawHash || rawSearch);
      const errorCode = params.get('error_code');
      const errorDesc = params.get('error_description') || params.get('error');

      // otp_expired or access_denied means the reset link is no longer valid
      if (errorCode === 'otp_expired' || params.get('error') === 'access_denied' || errorCode === 'access_denied') {
        setLinkExpired(true);
        return; // Don't set up recovery listener — link is dead
      }

      if (errorDesc) {
        setError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
      }
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setLinkExpired(false);
        setError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your new password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: updateErr } = await supabase.auth.updateUser({
        password
      });

      if (updateErr) {
        setError(supabaseService.getFriendlyErrorMessage(updateErr));
        return;
      }

      setSuccess(true);
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Sign the user into their account if a valid session exists, otherwise redirect to /login
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const synced = await syncUserSession(session);
        const role = synced?.role || 'artist';
        setTimeout(() => {
          if (role === 'explorer') {
            setCurrentPage('explorer-dashboard');
          } else {
            setCurrentPage('dashboard');
          }
        }, 1200);
      } else {
        setTimeout(() => {
          setCurrentPage('login');
        }, 1500);
      }
    } catch (err: any) {
      setError(supabaseService.getFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAFAF8] flex flex-col justify-center py-6 sm:py-10">
      {/* Top Navigation */}
      <div className="w-full max-w-[1060px] mx-auto px-4 sm:px-6 mb-3">
        <button
          onClick={() => setCurrentPage('login')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#8B3A4A] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Sign In</span>
        </button>
      </div>

      {/* Main Split-Screen Card */}
      <main className="w-full max-w-[1060px] mx-auto px-4 sm:px-6">
        <div className="w-full rounded-2xl sm:rounded-3xl bg-white border border-[#E7E7E4]/80 shadow-xs overflow-hidden flex flex-col lg:flex-row min-h-[540px]">
          
          {/* LEFT: Artwork Panel */}
          <div className="lg:w-[46%] relative flex flex-col justify-end p-8 sm:p-10 lg:p-12 bg-gray-900 text-white overflow-hidden h-48 sm:h-56 lg:h-auto shrink-0">
            <img
              src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80"
              alt="Editorial Floral Artwork"
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

            <div className="relative z-10 space-y-3 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-white/10 backdrop-blur-md border border-white/15 text-[#E8D3D8]">
                <ShieldCheck className="w-3 h-3 text-[#8B3A4A]" />
                <span>Account Security</span>
              </div>
              <blockquote className="font-serif-headline text-2xl sm:text-3xl font-normal text-white leading-tight">
                Protect your creative journey.
              </blockquote>
              <p className="text-xs sm:text-[13px] text-gray-300 leading-relaxed font-sans">
                Set a strong, memorable password to secure your artist portfolio, curator discussions, and commission history.
              </p>
            </div>
          </div>

          {/* RIGHT: Password Reset Form */}
          <div className="lg:w-[54%] p-7 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-[380px] w-full mx-auto">
              
              <div className="mb-6">
                <div className="w-10 h-10 rounded-2xl bg-[#F2E5E8] flex items-center justify-center text-[#8B3A4A] mb-3 border border-[#E8D3D8]">
                  <Lock className="w-5 h-5" />
                </div>
                <h1 className="font-serif-headline text-3xl font-normal text-gray-900 tracking-tight">
                  Create a new password
                </h1>
                <p className="text-xs text-gray-500 mt-1 font-sans">
                  Enter and confirm your new password below.
                </p>
              </div>

              {/* Expired Link State — replaces the entire form */}
              {linkExpired ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-[#F2E5E8] border border-[#E8D3D8] flex flex-col gap-2 text-[#8B3A4A]">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="text-[13px] font-semibold">Reset link expired</span>
                    </div>
                    <p className="text-xs text-[#8B3A4A]/80 leading-relaxed">
                      This password reset link has expired or has already been used.
                      Please request a new one from the login page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('login')}
                    className="w-full h-[50px] rounded-xl bg-[#8B3A4A] hover:bg-[#732D3B] text-white text-[14.5px] font-medium transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Request a new reset link
                  </button>
                </motion.div>
              ) : (
              <>
              {/* Feedback Alerts */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="alert"
                    className="mb-4 p-3 rounded-xl bg-[#F2E5E8] border border-[#E8D3D8] flex items-center gap-2.5 text-xs text-[#8B3A4A]"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#8B3A4A]" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="status"
                    className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex flex-col gap-2 text-xs text-green-800"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                      <span className="font-semibold">Password updated successfully!</span>
                    </div>
                    <p className="text-green-700 text-[11.5px]">
                      Your password has been changed. Entering ARTVERSE...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!success ? (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label htmlFor="new-password" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full h-[50px] pl-3.5 pr-11 rounded-xl bg-white border border-[#E7E7E4] text-[14.5px] text-gray-900 placeholder:text-[14px] placeholder:text-gray-400 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A] transition-colors shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-enter your new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full h-[50px] pl-3.5 pr-11 rounded-xl bg-white border border-[#E7E7E4] text-[14.5px] text-gray-900 placeholder:text-[14px] placeholder:text-gray-400 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A] transition-colors shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 transition-colors cursor-pointer"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[50px] mt-2 rounded-xl bg-[#8B3A4A] hover:bg-[#732D3B] text-white text-[14.5px] font-medium transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Updating password...</span>
                      </>
                    ) : (
                      <span>Update password</span>
                    )}
                  </button>
                </form>
              ) : (
                <div className="mt-4">
                  <button
                    onClick={() => setCurrentPage('login')}
                    className="w-full h-[50px] rounded-xl bg-[#8B3A4A] hover:bg-[#732D3B] text-white text-[14.5px] font-medium transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Sign In with New Password</span>
                  </button>
                </div>
              )}
              </>
              )}

              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <button
                  type="button"
                  onClick={() => setCurrentPage('login')}
                  className="text-xs text-gray-500 hover:text-[#8B3A4A] transition-colors cursor-pointer"
                >
                  Return to login
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
