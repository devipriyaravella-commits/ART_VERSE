import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { supabaseService } from '../../services/supabaseService';
import { DemoAccountsModal } from './DemoAccountsModal';
import { X, Sparkles, Palette, Compass, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, Mail, KeyRound, RefreshCw, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

function maskEmail(emailStr: string): string {
  const parts = emailStr.split('@');
  if (parts.length !== 2) return emailStr;
  const name = parts[0];
  const domain = parts[1];
  const visibleChars = Math.min(2, name.length);
  const maskedName = name.slice(0, visibleChars) + '****';
  return `${maskedName}@${domain}`;
}

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, setCurrentPage, syncUserSession } = useApp();
  const [mode, setMode] = useState<'signin' | 'otp' | 'signup'>('signin');
  const [role, setRole] = useState<'artist' | 'explorer'>('artist');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useState('Hyderabad, India');
  const [category, setCategory] = useState('Visual Art');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  // Real Supabase OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP Countdown Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  if (!authModalOpen) return null;

  // Real Supabase Email OTP Send
  const handleSendOtp = async () => {
    setError(null);
    setSuccessMessage(null);
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid email address.');
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
      } else {
        setError(supabaseService.getFriendlyErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (otpTimer > 0 || isSubmitting) return;
    setOtpCode(['', '', '', '', '', '']);
    handleSendOtp();
  };

  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtpCode(['', '', '', '', '', '']);
    setOtpVerified(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];

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

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Real Supabase Email OTP Verify
  const handleVerifyOtp = async () => {
    setError(null);
    const cleanEmail = email.trim();
    const token = otpCode.join('');

    if (token.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: verifyErr } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token,
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

      // 3. Get user using getUser()
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

      // 6. Navigate to the authenticated dashboard directly without browser refresh
      const role = synced.role || 'artist';
      setAuthModalOpen(false);
      if (role === 'explorer') {
        setCurrentPage('explorer-dashboard');
      } else {
        setCurrentPage('dashboard');
      }
    } catch (err: any) {
      const msg = (err?.message || String(err || '')).toLowerCase();
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

  // Password & Signup Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!cleanEmail.includes('@') && mode === 'signup') {
      setError('Please provide a valid email address.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please provide your full name or creator alias.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        const res = await supabaseService.signUp({
          email: cleanEmail,
          password: password,
          fullName: name.trim(),
          role,
          primaryMedium: role === 'artist' ? category : undefined,
          location
        });

        if (!res.success && res.error) {
          setError(supabaseService.getFriendlyErrorMessage(res.error));
          return;
        }

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });

        if (res.data?.session) {
          await syncUserSession(res.data.session);
          setAuthModalOpen(false);
          if (role === 'artist') {
            setCurrentPage('dashboard');
          } else {
            setCurrentPage('explorer-dashboard');
          }
          return;
        } else {
          setSuccessMessage('Account created successfully! Please sign in with your email and password.');
          setTimeout(() => {
            setMode('signin');
          }, 2000);
          return;
        }
      } else {
        const res = await supabaseService.signIn(cleanEmail, password);
        if (!res.success && res.error) {
          setError(supabaseService.getFriendlyErrorMessage(res.error));
          return;
        }

        const session = res.data?.session;
        if (!session) {
          setError('Sign in succeeded, but no active session was returned.');
          return;
        }

        const synced = await syncUserSession(session);
        const userRole = synced?.role || 'artist';
        setAuthModalOpen(false);
        if (userRole === 'explorer') {
          setCurrentPage('explorer-dashboard');
        } else {
          setCurrentPage('dashboard');
        }
      }

      setEmail('');
      setPassword('');
      setName('');
      setError(null);
    } catch (err: any) {
      setError(supabaseService.getFriendlyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white border border-[#E7E7E4] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setError(null);
            setSuccessMessage(null);
            setAuthModalOpen(false);
          }}
          className="absolute top-4 right-4 z-20 text-gray-500 hover:text-gray-900 p-2 rounded-full bg-white/90 backdrop-blur-md border border-[#E7E7E4] hover:border-[#E8D3D8] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: Editorial Story with Gallery Theme */}
        <div className="md:w-5/12 relative hidden md:flex flex-col justify-between p-10 bg-gray-900 text-white overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80"
            alt="Editorial Art"
            className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent" />

          <div className="relative z-10 flex items-center gap-2">
            <span className="font-serif-headline text-3xl font-normal text-white tracking-wide">
              ARTVERSE
            </span>
            <span className="w-2 h-2 rounded-full bg-[#8B3A4A] animate-pulse" />
          </div>

          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-[#111111]/70 border border-[#8B3A4A]/30 text-[#E8D3D8]">
              <Sparkles className="w-3 h-3 text-[#8B3A4A]" />
              <span>Contemporary Network</span>
            </span>
            <h2 className="font-serif-headline text-3xl sm:text-4xl font-normal text-white leading-tight">
              Talent is everywhere.
              <br />
              <span className="italic text-[#E8D3D8]">Opportunity isn't.</span>
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Step into the contemporary talent platform where local creators build portfolios, connect with curators, and reach global stages.
            </p>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-[#E8D3D8]/80">
              <CheckCircle2 className="w-4 h-4 text-[#8B3A4A] shrink-0" />
              <span>Real Supabase Email Authentication</span>
            </div>
          </div>
        </div>

        {/* Right: Auth Form */}
        <div className="md:w-7/12 p-6 sm:p-10 flex flex-col justify-between bg-white max-h-[90vh] overflow-y-auto">
          <div>
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#8B3A4A] uppercase tracking-wider block mb-1">
                  {mode === 'signin' ? 'Password Sign In' : mode === 'otp' ? 'Email OTP' : 'Create Account'}
                </span>
                <h3 className="font-serif-headline text-2xl sm:text-3xl font-normal text-gray-900">
                  {mode === 'signin' ? 'Sign in to ARTVERSE' : mode === 'otp' ? 'Email OTP Sign In' : 'Join ARTVERSE'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="text-[11px] font-medium text-[#8B3A4A] hover:underline cursor-pointer"
              >
                Demo accounts &rarr;
              </button>
            </div>

            {/* Mode Switch Tabs (Password | OTP | Join) */}
            <div className="flex items-center p-1 rounded-xl bg-gray-100 mb-5 border border-[#E7E7E4]">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-white text-gray-900 shadow-sm border border-[#E7E7E4]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('otp');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  mode === 'otp'
                    ? 'bg-white text-gray-900 shadow-sm border border-[#E7E7E4]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <KeyRound className="w-3 h-3 text-[#8B3A4A]" />
                <span>Email OTP</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-gray-900 shadow-sm border border-[#E7E7E4]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Join
              </button>
            </div>

            {/* Error & Success Feedback */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[#F2E5E8] border border-[#E8D3D8] flex items-center gap-2 text-xs text-[#8B3A4A] animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#8B3A4A]" />
                <span>{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2 text-xs text-green-700 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Role Switch for Signup */}
            {mode === 'signup' && (
              <div className="mb-3.5">
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  I am registering as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('artist')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      role === 'artist'
                        ? 'bg-[#F2E5E8] border-[#8B3A4A] text-[#8B3A4A] font-bold shadow-xs'
                        : 'bg-white border-[#E7E7E4] text-gray-600 hover:border-[#E8D3D8]'
                    }`}
                  >
                    <Palette className="w-4 h-4 text-[#8B3A4A]" />
                    <span>Artist / Creator</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('explorer')}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      role === 'explorer'
                        ? 'bg-[#F2E5E8] border-[#8B3A4A] text-[#8B3A4A] font-bold shadow-xs'
                        : 'bg-white border-[#E7E7E4] text-gray-600 hover:border-[#E8D3D8]'
                    }`}
                  >
                    <Compass className="w-4 h-4 text-[#8B3A4A]" />
                    <span>Curator / Explorer</span>
                  </button>
                </div>
              </div>
            )}

            {/* 1. REAL SUPABASE EMAIL OTP VIEW */}
            {mode === 'otp' && (
              <div className="space-y-3.5">
                {!otpSent ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError(null);
                          }}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A]"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Mail className="w-3.5 h-3.5 text-[#8B3A4A]" />
                        </div>
                      </div>
                      <p className="mt-1.5 text-[11px] text-gray-400">
                        We will send a 6-digit verification code to your email inbox.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSubmitting || !email.trim()}
                      className="w-full py-3 rounded-full font-bold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-md shadow-[#8B3A4A]/25 flex items-center justify-center gap-2 transition-all tracking-wide disabled:opacity-70 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending code...</span>
                        </>
                      ) : (
                        <span>Send OTP &rarr;</span>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-center my-1">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[#F2E5E8] border border-[#E8D3D8] mb-1">
                        <KeyRound className="w-4 h-4 text-[#8B3A4A]" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900">Verification code sent</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        We sent a 6-digit code to{' '}
                        <span className="font-semibold text-gray-800">
                          {maskEmail(email.trim())}
                        </span>
                      </p>
                    </div>

                    {/* 6 Digits Grid */}
                    <div className="flex justify-center gap-2 my-2">
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
                          className={`w-10 h-12 text-center text-lg font-bold rounded-xl border-2 transition-all focus:outline-none ${
                            otpVerified
                              ? 'border-green-400 bg-green-50 text-green-700'
                              : digit
                              ? 'border-[#8B3A4A] bg-[#F2E5E8]/30 text-[#8B3A4A]'
                              : 'border-[#E7E7E4] bg-white text-gray-900 focus:border-[#8B3A4A]'
                          }`}
                          disabled={otpVerified || isSubmitting}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isSubmitting || otpVerified || otpCode.join('').length !== 6}
                      className={`w-full py-3 rounded-full font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all tracking-wide disabled:opacity-60 cursor-pointer ${
                        otpVerified
                          ? 'bg-green-600 text-white shadow-green-500/25'
                          : 'bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-[#8B3A4A]/25'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying code...</span>
                        </>
                      ) : otpVerified ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified! Access Granted</span>
                        </>
                      ) : (
                        <span>Verify OTP & Sign In &rarr;</span>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      <button
                        type="button"
                        onClick={handleChangeEmail}
                        className="hover:text-[#8B3A4A] cursor-pointer"
                      >
                        &larr; Change email
                      </button>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={otpTimer > 0 || isSubmitting}
                        className="text-[#8B3A4A] hover:underline disabled:text-gray-400 disabled:no-underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend code'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 2. PASSWORD & SIGN UP VIEWS */}
            {mode !== 'otp' && (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Maya Deshmukh"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A]"
                      />
                    </div>

                    {role === 'artist' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-800 mb-1">
                            Primary Art Medium
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 focus:outline-none focus:border-[#8B3A4A]"
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
                          <label className="block text-xs font-semibold text-gray-800 mb-1">
                            City / Region
                          </label>
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Hyderabad, India"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 focus:outline-none focus:border-[#8B3A4A]"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-gray-500" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 py-3.5 rounded-full font-bold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-md shadow-[#8B3A4A]/25 flex items-center justify-center gap-2 transition-all tracking-wide disabled:opacity-70 cursor-pointer"
                >
                  <span>{mode === 'signin' ? 'Sign In to ARTVERSE' : 'Create ARTVERSE Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup');
                setError(null);
                setSuccessMessage(null);
              }}
              className="font-bold text-[#8B3A4A] hover:text-[#8B3A4A] hover:underline cursor-pointer"
            >
              {mode === 'signup' ? 'Sign in here' : 'Join ARTVERSE now'}
            </button>
          </div>
        </div>
      </div>

      <DemoAccountsModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  );
};
