import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';
import { ArrowLeft, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Mail, KeyRound, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function maskEmail(emailStr: string): string {
  const parts = emailStr.split('@');
  if (parts.length !== 2) return emailStr;
  const name = parts[0];
  const domain = parts[1];
  const visibleChars = Math.min(2, name.length);
  const maskedName = name.slice(0, visibleChars) + '****';
  return `${maskedName}@${domain}`;
}

export const LoginPage: React.FC = () => {
  const { setCurrentPage, syncUserSession } = useApp();

  // Auth mode: 'password', 'otp', or 'forgot'
  const [authMode, setAuthMode] = useState<'password' | 'otp' | 'forgot'>('password');

  // Shared state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Real Supabase OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  // Send real email OTP via Supabase Auth
  const handleSendOtp = async () => {
    setError(null);
    setSuccessMessage(null);
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: otpErr } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: false
        }
      });

      if (otpErr) {
        throw otpErr;
      }

      setOtpSent(true);
      setOtpTimer(30);
      setOtpCode(['', '', '', '', '', '']);
      setOtpVerified(false);
      setSuccessMessage(`We sent a 6-digit verification code to ${maskEmail(cleanEmail)}.`);

      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      const msg = (err?.message || String(err || '')).toLowerCase();
      if (
        msg.includes('signups not allowed') ||
        msg.includes('user not found') ||
        msg.includes('otp disabled for signups') ||
        msg.includes('signup requires')
      ) {
        setError('No account exists with this email address. Please sign up to create your account.');
      } else if (msg.includes('rate') || msg.includes('too many') || msg.includes('over_email_send_rate_limit')) {
        setError('Too many attempts. Please wait a few minutes before requesting another code.');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('Unable to reach authentication service. Please check your internet connection.');
      } else {
        setError(supabaseService.getFriendlyErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP handler with cooldown
  const handleResendOtp = () => {
    if (otpTimer > 0 || isSubmitting) return;
    setOtpCode(['', '', '', '', '', '']);
    handleSendOtp();
  };

  // Change email handler: clears previous verification state
  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtpCode(['', '', '', '', '', '']);
    setOtpVerified(false);
    setError(null);
    setSuccessMessage(null);
  };

  // Handle 6-digit OTP box changes with auto-advance and paste support
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];

    // Handle full paste of 6-digit code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtpCode(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-advance to next input box
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP input boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!otpCode[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Verify OTP via Supabase Auth
  const handleVerifyOtp = async () => {
    setError(null);
    const cleanEmail = email.trim();
    const enteredToken = otpCode.join('');

    if (enteredToken.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: enteredToken,
        type: 'email'
      });

      if (verifyErr) {
        throw verifyErr;
      }

      // 1. Confirm data.session exists
      if (!data?.session) {
        setError('Verification completed, but no active session was returned. Please try signing in with password.');
        setIsSubmitting(false);
        return;
      }

      // 2. Wait for authenticated session
      const { data: sessionData } = await supabase.auth.getSession();
      const activeSession = data.session || sessionData?.session;
      if (!activeSession) {
        setError('Authenticated session could not be established. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // 3. Get the authenticated user with supabase.auth.getUser()
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        setError('Authenticated user could not be verified. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // 4. Fetch the profile using auth.uid() & 5. Update AppContext/auth state
      const synced = await syncUserSession(activeSession);
      if (!synced?.user) {
        setError('Unable to load user profile. Please try signing in again.');
        setIsSubmitting(false);
        return;
      }

      setOtpVerified(true);
      setSuccessMessage('Code verified successfully.');

      // 6. Navigate to the authenticated dashboard directly without browser refresh or login redirect
      const role = synced.role || 'artist';
      const targetPage: any = role === 'explorer' ? 'explorer-dashboard' : 'dashboard';
      setCurrentPage(targetPage);
    } catch (err: any) {
      const msg = (err?.message || err?.error_description || String(err || '')).toLowerCase();
      if (msg.includes('expired')) {
        setError('This code has expired. Please request a new one.');
      } else if (msg.includes('rate') || msg.includes('too many')) {
        setError('Too many attempts. Please wait a few minutes before trying again.');
      } else {
        setError("That code isn't correct. Please check your email and try again.");
      }
      setOtpCode(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password sign-in via Supabase Auth
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await supabaseService.signIn(cleanEmail, password);
      if (!res.success && res.error) {
        setError(supabaseService.getFriendlyErrorMessage(res.error));
        return;
      }

      // 1. Confirm session exists
      const session = res.data?.session;
      if (!session) {
        setError('Sign in succeeded, but no active session was returned.');
        return;
      }

      // 2. Fetch user using getUser()
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        setError('Authenticated user could not be verified.');
        return;
      }

      // 3. Synchronize profile directly using session.user.id (auth.uid())
      const synced = await syncUserSession(session);
      if (!synced?.user) {
        setError('Unable to load user profile. Please try again.');
        return;
      }

      // 4. Determine role from user profile and navigate to correct dashboard
      const role = synced.role || 'artist';
      if (role === 'explorer') {
        setCurrentPage('explorer-dashboard');
      } else {
        setCurrentPage('dashboard');
      }
    } catch (err: any) {
      setError(supabaseService.getFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const emailHint = email.trim() || undefined;
      const res = await supabaseService.signInWithGoogle(emailHint);
      if (res && !res.success && res.error) {
        setError(supabaseService.getFriendlyErrorMessage(res.error));
      }
    } catch (err: any) {
      setError(supabaseService.getFriendlyErrorMessage(err));
    }
  };

  // Switch to Forgot Password view
  const handleOpenForgotPassword = () => {
    setAuthMode('forgot');
    setError(null);
    setSuccessMessage(null);
  };

  // Forgot password via Supabase Auth
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address to reset your password.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (resetErr) {
        throw resetErr;
      }

      setSuccessMessage(`Password reset link sent to ${maskEmail(cleanEmail)}. Please check your inbox.`);
    } catch (err: any) {
      const msg = (err?.message || String(err || '')).toLowerCase();
      if (msg.includes('rate') || msg.includes('too many') || msg.includes('over_email_send_rate_limit')) {
        setError('Too many requests. Please wait a few moments before requesting another link.');
      } else {
        setError(supabaseService.getFriendlyErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAFAF8] flex flex-col justify-center py-6 sm:py-10">
      {/* Top Navigation */}
      <div className="w-full max-w-[1060px] mx-auto px-4 sm:px-6 mb-3">
        <button
          onClick={() => setCurrentPage('home')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#8B3A4A] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to ARTVERSE</span>
        </button>
      </div>

      {/* Main Split-Screen Card */}
      <main className="w-full max-w-[1060px] mx-auto px-4 sm:px-6">
        <div className="w-full rounded-2xl sm:rounded-3xl bg-white border border-[#E7E7E4]/80 shadow-xs overflow-hidden flex flex-col lg:flex-row min-h-[580px] lg:h-[660px]">
          
          {/* LEFT: Artwork Panel */}
          <div className="lg:w-[46%] relative flex flex-col justify-end p-8 sm:p-10 lg:p-12 bg-gray-900 text-white overflow-hidden h-48 sm:h-56 lg:h-auto shrink-0">
            <img
              src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80"
              alt="Editorial Floral Artwork"
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

            <div className="relative z-10 space-y-3 max-w-sm">
              <blockquote className="font-serif-headline text-2xl sm:text-3xl lg:text-[38px] font-normal text-white leading-tight">
                Talent is everywhere.
                <br />
                <span className="italic text-[#E8D3D8]">Opportunity isn't.</span>
              </blockquote>
              <p className="text-xs sm:text-[13px] text-gray-300 leading-relaxed font-sans">
                Connecting undiscovered creators with global curators, patrons, and cultural commissions.
              </p>
            </div>
          </div>

          {/* RIGHT: Form Panel */}
          <div className="lg:w-[54%] p-8 sm:p-10 lg:p-14 flex items-center justify-center flex-1">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-[410px]"
            >
              {/* Heading */}
              <div className="mb-5">
                <h1 className="font-serif-headline text-3xl sm:text-[36px] lg:text-[38px] font-normal text-gray-900 tracking-tight leading-tight">
                  {authMode === 'forgot' ? 'Reset your password' : 'Sign in to ARTVERSE'}
                </h1>
                <p className="text-[14.5px] text-gray-500 font-sans mt-1.5 leading-normal">
                  {authMode === 'forgot'
                    ? 'Enter your email to receive a secure password reset link.'
                    : 'Continue your creative journey.'}
                </p>
              </div>

              {/* Mode Tabs or Back to Sign In */}
              {authMode === 'forgot' ? (
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('password');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B3A4A] hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              ) : (
                /* Auth Mode Tabs: Password vs OTP */
                <div className="flex mb-5 bg-[#F3F3F0] rounded-xl p-1 border border-[#E7E7E4]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('password');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                      authMode === 'password'
                        ? 'bg-white text-gray-900 shadow-sm border border-[#E7E7E4]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Password</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('otp');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${
                      authMode === 'otp'
                        ? 'bg-white text-gray-900 shadow-sm border border-[#E7E7E4]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>OTP</span>
                  </button>
                </div>
              )}

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
                {successMessage && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="status"
                    className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2.5 text-xs text-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ========== 1. PASSWORD MODE ========== */}
              {authMode === 'password' && (
                <form onSubmit={handleSubmitPassword}>
                  <div>
                    <label htmlFor="login-email" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full h-[50px] px-3.5 rounded-xl bg-white border border-[#E7E7E4] text-[14.5px] text-gray-900 placeholder:text-[14px] placeholder:text-gray-400 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A] transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="login-password" className="block text-[13px] font-medium text-gray-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={handleOpenForgotPassword}
                        className="text-[13px] font-medium text-[#8B3A4A] hover:underline transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        placeholder="Enter your password"
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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[50px] mt-5 px-5 rounded-xl font-semibold text-[14px] bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-xs shadow-[#8B3A4A]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer tracking-wide"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <span>Sign in &rarr;</span>
                    )}
                  </button>
                </form>
              )}

              {/* ========== 2. REAL SUPABASE EMAIL OTP MODE ========== */}
              {authMode === 'otp' && (
                <div className="space-y-4">
                  {/* Step 1: Enter email and request real OTP */}
                  {!otpSent ? (
                    <div>
                      <div>
                        <label htmlFor="otp-email" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                          Email address
                        </label>
                        <div className="relative">
                          <input
                            id="otp-email"
                            type="email"
                            required
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (error) setError(null);
                            }}
                            className="w-full h-[50px] pl-11 pr-3.5 rounded-xl bg-white border border-[#E7E7E4] text-[14.5px] text-gray-900 placeholder:text-[13px] placeholder:text-gray-400 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A] transition-colors shadow-2xs"
                          />
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail className="w-4 h-4 text-[#8B3A4A]" />
                          </div>
                        </div>
                        <p className="mt-1.5 text-[11.5px] text-gray-400">
                          We will send a 6-digit verification code to your email inbox.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSubmitting || !email.trim()}
                        className="w-full h-[50px] mt-4 px-5 rounded-xl font-semibold text-[14px] bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-xs shadow-[#8B3A4A]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer tracking-wide"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending code...</span>
                          </>
                        ) : (
                          <span>Generate OTP &rarr;</span>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* Step 2: Enter received 6-digit OTP code */
                    <div>
                      <div className="text-center mb-3">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F2E5E8] border border-[#E8D3D8] mb-2">
                          <KeyRound className="w-5 h-5 text-[#8B3A4A]" />
                        </div>
                        <h3 className="text-[15px] font-semibold text-gray-900">Verification code sent</h3>
                        <p className="text-[12.5px] text-gray-500 mt-1 leading-normal">
                          We sent a 6-digit verification code to{' '}
                          <span className="font-semibold text-gray-800">
                            {maskEmail(email.trim())}
                          </span>
                        </p>
                      </div>

                      {/* Six OTP Input Boxes */}
                      <div className="flex justify-center gap-2 sm:gap-2.5 my-4">
                        {otpCode.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => {
                              otpInputRefs.current[i] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={i === 0 ? 6 : 1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            className={`w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-bold rounded-xl border-2 transition-all shadow-2xs focus:outline-none ${
                              otpVerified
                                ? 'border-green-400 bg-green-50 text-green-700'
                                : digit
                                ? 'border-[#8B3A4A] bg-[#F2E5E8]/30 text-[#8B3A4A]'
                                : 'border-[#E7E7E4] bg-white text-gray-900 focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A]'
                            }`}
                            disabled={otpVerified || isSubmitting}
                          />
                        ))}
                      </div>

                      {/* Verify Button */}
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isSubmitting || otpVerified || otpCode.join('').length !== 6}
                        className={`w-full h-[50px] px-5 rounded-xl font-semibold text-[14px] shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer tracking-wide ${
                          otpVerified
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20'
                            : 'bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-[#8B3A4A]/20'
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Verifying code...</span>
                          </>
                        ) : otpVerified ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verified! Redirecting...</span>
                          </>
                        ) : (
                          <span>Verify OTP &rarr;</span>
                        )}
                      </button>

                      {/* Resend with Cooldown / Change Email */}
                      <div className="flex items-center justify-between mt-4 text-[12.5px]">
                        <button
                          type="button"
                          onClick={handleChangeEmail}
                          disabled={isSubmitting}
                          className="font-medium text-gray-500 hover:text-[#8B3A4A] transition-colors cursor-pointer"
                        >
                          &larr; Change email
                        </button>
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={otpTimer > 0 || isSubmitting}
                          className="font-medium text-[#8B3A4A] hover:underline disabled:text-gray-400 disabled:no-underline transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>{otpTimer > 0 ? `Resend code in ${otpTimer}s` : 'Resend code'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ========== 3. FORGOT PASSWORD MODE ========== */}
              {authMode === 'forgot' && (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="forgot-email" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                      Account email address
                    </label>
                    <div className="relative">
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full h-[50px] pl-11 pr-3.5 rounded-xl bg-white border border-[#E7E7E4] text-[14.5px] text-gray-900 placeholder:text-[13px] placeholder:text-gray-400 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A] transition-colors shadow-2xs"
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail className="w-4 h-4 text-[#8B3A4A]" />
                      </div>
                    </div>
                    <p className="mt-1.5 text-[11.5px] text-gray-400">
                      We'll send a secure password reset link to your email address.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim()}
                    className="w-full h-[50px] mt-2 rounded-xl bg-[#8B3A4A] hover:bg-[#732D3B] text-white text-[14.5px] font-medium transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <span>Send Password Reset Link</span>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('password');
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs text-gray-500 hover:text-[#8B3A4A] transition-colors cursor-pointer"
                    >
                      Remember your password? Sign in
                    </button>
                  </div>
                </form>
              )}

              {/* Divider & Google Login (only shown when not in forgot password mode) */}
              {authMode !== 'forgot' && (
                <>
                  <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E7E7E4]/80" />
                    </div>
                    <span className="relative px-3 bg-white text-[11.5px] font-semibold text-gray-400 uppercase tracking-wider">
                      OR CONTINUE WITH
                    </span>
                  </div>

                  {/* Google Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full h-[50px] px-4 rounded-xl border border-[#E7E7E4] hover:border-[#E7E7E4] hover:bg-gray-50/80 bg-white text-[14px] font-medium text-gray-700 flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
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

                  {/* Registration Prompt */}
                  <div className="mt-6 text-center text-[13.5px] text-gray-500">
                    <span>New to ARTVERSE? </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage('signin')}
                      className="font-semibold text-[#8B3A4A] hover:text-[#8B3A4A] hover:underline cursor-pointer"
                    >
                      Create an account
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};
