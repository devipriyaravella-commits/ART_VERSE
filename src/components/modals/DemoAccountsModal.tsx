import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ArrowRight, Palette, Compass, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoAccountsModal: React.FC<DemoAccountsModalProps> = ({ isOpen, onClose }) => {
  const { loginAs, setCurrentPage, artists } = useApp();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const ananyaArtist = artists.find((a) => a.id === 'artist-1');
  const rahulArtist = artists.find((a) => a.id === 'artist-2');

  const demoProfiles = [
    {
      id: 'ananya' as const,
      name: 'Ananya Rao',
      role: 'Artist',
      badge: 'Visual Art',
      location: 'Hyderabad, India',
      bio: 'Contemporary visual artist blending regional folklore with modern editorial design.',
      avatar: ananyaArtist?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      icon: <Palette className="w-4 h-4 text-[#8B3A4A]" />,
      targetPage: 'dashboard' as const
    },
    {
      id: 'rahul' as const,
      name: 'Rahul Kumar',
      role: 'Artist',
      badge: '3D & Digital Art',
      location: 'Mumbai, India',
      bio: 'Digital sculptor exploring futuristic cultural artifacts and immersive animations.',
      avatar: rahulArtist?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      icon: <Palette className="w-4 h-4 text-[#8B3A4A]" />,
      targetPage: 'dashboard' as const
    },
    {
      id: 'explorer' as const,
      name: 'Alex Rivera',
      role: 'Explorer',
      badge: 'Curator & Collector',
      location: 'London / International',
      bio: 'Scouting emerging talent for international biennial exhibitions and creative commissions.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      icon: <Compass className="w-4 h-4 text-[#8B3A4A]" />,
      targetPage: 'explorer-dashboard' as const
    }
  ];

  const handleSelectPersona = (profile: typeof demoProfiles[number]) => {
    loginAs(profile.id);
    onClose();
    setCurrentPage(profile.targetPage);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg rounded-3xl bg-white border border-[#E7E7E4] shadow-2xl p-6 sm:p-8 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close demo modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B3A4A] block mb-1">
              Demonstration Access
            </span>
            <h2 id="demo-modal-title" className="font-serif-headline text-3xl font-normal text-gray-900 leading-tight">
              Explore Demo Accounts
            </h2>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Experience ARTVERSE from different perspectives. Select an account below to sign in instantly.
            </p>
          </div>

          {/* Account Cards */}
          <div className="space-y-3">
            {demoProfiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => handleSelectPersona(profile)}
                className="group relative flex items-center justify-between p-4 rounded-2xl bg-[#F8F9FA] hover:bg-[#F2E5E8]/40 border border-[#E7E7E4] hover:border-[#E8D3D8] transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-gray-200 group-hover:ring-[#E8D3D8] transition-all shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#8B3A4A] transition-colors truncate">
                        {profile.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-gray-700 border border-[#E7E7E4]">
                        {profile.role}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {profile.badge} • {profile.location}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#E7E7E4] group-hover:bg-[#8B3A4A] group-hover:border-[#8B3A4A] group-hover:text-white text-gray-500 flex items-center justify-center transition-all shadow-2xs">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Modal Footer Note */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Authentication session will be initialized locally.</span>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900 font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
