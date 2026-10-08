import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabaseService } from '../services/supabaseService';
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, Palette, Compass, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export const SignInPage: React.FC = () => {
  const { setCurrentPage, syncUserSession } = useApp();

  const [role, setRole] = useState<'artist' | 'explorer'>('artist');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [category, setCategory] = useState('Visual Art');
  const [location, setLocation] = useState('Hyderabad, India');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError('Please provide your full name or creator alias.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    if (!agreeTerms) {
      setError('Please accept the community guidelines to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await supabaseService.signUp({
        email: cleanEmail,
        password,
        fullName: cleanName,
        role,
        primaryMedium: role === 'artist' ? category : undefined,
        location
      });

      if (!res.success && res.error) {
        setError(supabaseService.getFriendlyErrorMessage(res.error));
        return;
      }

      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 }
      });

      if (res.data?.session) {
        // Option A: Automatically establish the session and enter the account
        await syncUserSession(res.data.session);
        if (role === 'artist') {
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('explorer-dashboard');
        }
      } else {
        // Option B: Redirect to Sign in with a clear successful account-created message
        setSuccessMessage('Account created successfully! Please sign in with your email and password.');
        setTimeout(() => {
          setCurrentPage('login');
        }, 2000);
      }
    } catch (err: any) {
      setError(supabaseService.getFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    try {
      const res = await supabaseService.signInWithGoogle();
      if (res && !res.success && res.error) {
        setError(supabaseService.getFriendlyErrorMessage(res.error));
      }
    } catch (err: any) {
      setError(supabaseService.getFriendlyErrorMessage(err));
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAFAF8] flex flex-col justify-center py-8 sm:py-12 px-4">
      {/* Top Navigation */}
      <div className="w-full max-w-[700px] mx-auto mb-3">
        <button
          onClick={() => setCurrentPage('home')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#8B3A4A] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to ARTVERSE</span>
        </button>
      </div>

      {/* Main Single-Column Centered Registration Card */}
      <main className="w-full max-w-[700px] mx-auto">
        <div className="w-full rounded-2xl sm:rounded-3xl bg-white border border-[#E7E7E4]/80 shadow-xs p-8 sm:p-12 lg:p-14">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Heading & Subtitle */}
            <div className="mb-7">
              <h1 className="font-serif-headline text-3xl sm:text-[36px] lg:text-[38px] font-normal text-gray-900 tracking-tight leading-tight">
                Create an ARTVERSE account
              </h1>
              <p className="text-[14px] sm:text-[14.5px] text-gray-500 font-sans mt-2 leading-normal">
                Showcase your work and connect with global opportunities.
              </p>
            </div>

            {/* Account Type Selection: Compact Artist / Explorer */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setRole('artist')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    role === 'artist'
                      ? 'bg-[#F2E5E8]/70 border-[#8B3A4A] ring-1 ring-[#8B3A4A]/20'
                      : 'bg-white border-[#E7E7E4] hover:border-[#E7E7E4]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Palette className="w-4 h-4 text-[#8B3A4A] shrink-0" />
                    <span className={`text-[13.5px] font-semibold ${role === 'artist' ? 'text-[#8B3A4A]' : 'text-gray-900'}`}>
                      Artist
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">
                    Showcase creativity & grants
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('explorer')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    role === 'explorer'
                      ? 'bg-[#F2E5E8]/70 border-[#8B3A4A] ring-1 ring-[#8B3A4A]/20'
                      : 'bg-white border-[#E7E7E4] hover:border-[#E7E7E4]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Compass className="w-4 h-4 text-[#8B3A4A] shrink-0" />
                    <span className={`text-[13.5px] font-semibold ${role === 'explorer' ? 'text-[#8B3A4A]' : 'text-gray-900'}`}>
                      Explorer
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">
                    Discover creators & collections
                  </p>
                </button>
              </div>
            </div>

            {/* Error Feedback */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="mb-5 p-3.5 rounded-xl bg-[#F2E5E8] border border-[#E8D3D8] flex items-center gap-2.5 text-xs text-[#8B3A4A]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#8B3A4A]" />
                  <span>{error}</span>
                </motion.div>
              )}
              {successMessage && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="status"
                  className="mb-5 p-3.5 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2.5 text-xs text-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="reg-name" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Full name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Enter your full name or creator alias"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full h-[52px] px-4 rounded-xl bg-white border border-[#E7E7E4] text-[14.5px] text-gray-900 placeholder:text-[14px] placeholder:text-gray-400 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A] transition-colors shadow-2xs"
                />
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="reg-email" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full h-[52px] px-4 rounded-xl bg-white border border-[#E7E7E4] text-[14.5px] text-gray-900 placeholder:text-[14px] placeholder:text-gray-400 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A] transition-colors shadow-2xs"
                />
              </div>

              {/* Artist Additional Specifics */}
              {role === 'artist' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="reg-category" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      Primary medium
                    </label>
                    <select
                      id="reg-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-[52px] px-4 rounded-xl bg-white border border-[#E7E7E4] text-[14.5px] text-gray-900 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A] transition-colors shadow-2xs cursor-pointer"
                    >
                      <option value="Visual Art">Visual Art</option>
                      <option value="Digital Art">Digital Art</option>
                      <option value="Photography">Photography</option>
                      <option value="Music">Music</option>
                      <option value="Dance">Dance</option>
                      <option value="Film">Film</option>
                      <option value="3D / Animation">3D / Animation</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="reg-location" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      City / Base location
                    </label>
                    <input
                      id="reg-location"
                      type="text"
                      placeholder="e.g. Hyderabad, India"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full h-[52px] px-4 rounded-xl bg-white border border-[#E7E7E4] text-[14.5px] text-gray-900 placeholder:text-[14px] placeholder:text-gray-400 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A] transition-colors shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="reg-password" className="block text-[13px] font-medium text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-[#8B3A4A] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full h-[52px] px-4 rounded-xl bg-white border border-[#E7E7E4] text-[14.5px] text-gray-900 placeholder:text-[14px] placeholder:text-gray-400 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A] transition-colors shadow-2xs"
                  />
                </div>

                <div>
                  <label htmlFor="reg-confirm-password" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    Confirm password
                  </label>
                  <input
                    id="reg-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full h-[52px] px-4 rounded-xl bg-white border border-[#E7E7E4] text-[14.5px] text-gray-900 placeholder:text-[14px] placeholder:text-gray-400 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A] transition-colors shadow-2xs"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-[12.5px] text-gray-500">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-[#E7E7E4] text-[#8B3A4A] focus:ring-[#8B3A4A] cursor-pointer"
                  />
                  <span className="leading-snug">
                    I agree to the ARTVERSE terms and community guidelines.
                  </span>
                </label>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[52px] mt-6 px-5 rounded-xl font-semibold text-[14px] bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-xs shadow-[#8B3A4A]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer tracking-wide"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create ARTVERSE account →</span>
                )}
              </button>
            </form>

            {/* Subtle Divider */}
            <div className="relative my-7 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E7E7E4]/80" />
              </div>
              <span className="relative px-3.5 bg-white text-[11.5px] font-semibold text-gray-400 uppercase tracking-wider">
                OR CONTINUE WITH
              </span>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full h-[52px] px-4 rounded-xl border border-[#E7E7E4] hover:border-[#E7E7E4] hover:bg-gray-50/80 bg-white text-[14px] font-medium text-gray-700 flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Bottom Auth Link */}
            <div className="mt-6 text-center text-[13.5px] text-gray-500">
              <span>Already have an account? </span>
              <button
                type="button"
                onClick={() => setCurrentPage('login')}
                className="font-semibold text-[#8B3A4A] hover:text-[#8B3A4A] hover:underline cursor-pointer"
              >
                Sign in with Password or Email OTP.
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
