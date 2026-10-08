import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { Palette, Compass, CheckCircle2, Loader2, ArrowRight, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const GoogleRoleSetupModal: React.FC = () => {
  const {
    pendingGoogleUser,
    setPendingGoogleUser,
    refreshAuthSession,
    setCurrentPage,
    notify,
    logout
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<'artist' | 'explorer'>('artist');
  const [primaryMedium, setPrimaryMedium] = useState('Visual Art');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!pendingGoogleUser) return null;

  const handleCompleteSetup = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const emailPrefix = (pendingGoogleUser.email || 'creator').split('@')[0];
      const username = `${emailPrefix}_${pendingGoogleUser.id.slice(0, 5)}`;

      const { error: upsertError } = await supabase.from('profiles').upsert(
        {
          id: pendingGoogleUser.id,
          full_name: pendingGoogleUser.name || 'ARTVERSE Creator',
          username: username,
          role: selectedRole,
          city: 'Global',
          country: 'Global',
          primary_medium: selectedRole === 'artist' ? primaryMedium : null,
          avatar_url: pendingGoogleUser.avatar || null,
          skills: selectedRole === 'artist' ? [primaryMedium] : ['Art Appreciation'],
          interests: ['Contemporary Art']
        },
        { onConflict: 'id' }
      );

      if (upsertError) {
        throw upsertError;
      }

      await refreshAuthSession();

      notify(`Welcome to ARTVERSE as an ${selectedRole === 'artist' ? 'Artist' : 'Explorer'}!`, 'success');

      if (selectedRole === 'artist') {
        setCurrentPage('portfolio');
      } else {
        setCurrentPage('explorer-dashboard');
      }
    } catch (err: any) {
      console.error('[ARTVERSE] Role setup error:', err);
      setError(err?.message || 'Unable to save your role. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPendingGoogleUser(null);
    logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg rounded-3xl bg-white border border-[#E7E7E4] shadow-2xl p-6 sm:p-8 overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#E7E7E4]">
          {pendingGoogleUser.avatar ? (
            <img
              src={pendingGoogleUser.avatar}
              alt={pendingGoogleUser.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#8B3A4A]/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#F2E5E8] flex items-center justify-center text-[#8B3A4A] font-bold text-lg">
              {pendingGoogleUser.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-serif-headline text-2xl font-normal text-gray-900 leading-tight truncate">
              Welcome, {pendingGoogleUser.name}
            </h2>
            <p className="text-xs text-gray-500 truncate font-sans">
              Signed in via Google ({pendingGoogleUser.email})
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-serif-headline text-lg font-normal text-gray-900 mb-1">
            Choose your ARTVERSE role
          </h3>
          <p className="text-xs text-gray-500 font-sans">
            Tell us how you would like to participate in the creative community.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#F2E5E8] border border-[#E8D3D8] text-xs text-[#8B3A4A]">
            {error}
          </div>
        )}

        {/* Role Cards Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Artist Role Card */}
          <button
            type="button"
            onClick={() => setSelectedRole('artist')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[140px] ${
              selectedRole === 'artist'
                ? 'bg-[#F2E5E8]/60 border-[#8B3A4A] ring-2 ring-[#8B3A4A]/30 shadow-xs'
                : 'bg-white border-[#E7E7E4] hover:border-[#8B3A4A]/40 hover:bg-[#FAFAF8]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${selectedRole === 'artist' ? 'bg-[#8B3A4A] text-white' : 'bg-[#F2E5E8] text-[#8B3A4A]'}`}>
                  <Palette className="w-4 h-4" />
                </div>
                {selectedRole === 'artist' && (
                  <CheckCircle2 className="w-4 h-4 text-[#8B3A4A]" />
                )}
              </div>
              <h4 className="text-sm font-semibold text-gray-900">Artist</h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed font-sans">
                Showcase artwork, receive commissions, and connect with global collectors.
              </p>
            </div>
          </button>

          {/* Explorer Role Card */}
          <button
            type="button"
            onClick={() => setSelectedRole('explorer')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[140px] ${
              selectedRole === 'explorer'
                ? 'bg-[#F2E5E8]/60 border-[#8B3A4A] ring-2 ring-[#8B3A4A]/30 shadow-xs'
                : 'bg-white border-[#E7E7E4] hover:border-[#8B3A4A]/40 hover:bg-[#FAFAF8]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl ${selectedRole === 'explorer' ? 'bg-[#8B3A4A] text-white' : 'bg-[#F2E5E8] text-[#8B3A4A]'}`}>
                  <Compass className="w-4 h-4" />
                </div>
                {selectedRole === 'explorer' && (
                  <CheckCircle2 className="w-4 h-4 text-[#8B3A4A]" />
                )}
              </div>
              <h4 className="text-sm font-semibold text-gray-900">Explorer</h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed font-sans">
                Discover creators, follow artists, save works, and explore opportunities.
              </p>
            </div>
          </button>
        </div>

        {/* Medium Selection for Artists */}
        {selectedRole === 'artist' && (
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-700 mb-1.5 font-sans">
              Primary Medium
            </label>
            <select
              value={primaryMedium}
              onChange={(e) => setPrimaryMedium(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-[#E7E7E4] bg-white text-xs text-gray-900 focus:outline-none focus:border-[#8B3A4A] focus:ring-1 focus:ring-[#8B3A4A]"
            >
              <option value="Visual Art">Visual Art & Painting</option>
              <option value="Digital & 3D">Digital & 3D Art</option>
              <option value="Photography">Fine Art Photography</option>
              <option value="Sculpture">Sculpture & Installation</option>
              <option value="Mixed Media">Mixed Media & Printmaking</option>
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCompleteSetup}
            className="w-full h-12 rounded-xl bg-[#8B3A4A] hover:bg-[#732D3B] text-white text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer tracking-wide"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Setting up profile...</span>
              </>
            ) : (
              <>
                <span>Complete Profile as {selectedRole === 'artist' ? 'Artist' : 'Explorer'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCancel}
            className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-sans"
          >
            <LogOut className="w-3 h-3" />
            <span>Cancel and sign out</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
