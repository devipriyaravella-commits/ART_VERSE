import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { setCurrentPage, setSelectedArtistId, setSelectedArtworkId, setAiMatchModalOpen, notify } = useApp();
  const [infoModal, setInfoModal] = useState<string | null>(null);

  const handleNav = (page: any) => {
    setCurrentPage(page);
    setSelectedArtistId(null);
    setSelectedArtworkId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLegalModal = (title: string, content: string) => {
    setInfoModal(title);
    notify(`Viewing ${title}`, 'info');
  };

  return (
    <footer className="w-full bg-[#FAFAF8] border-t border-[#E7E7E4] py-16 text-[#666666]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-12 border-b border-[#E7E7E4] text-xs">
          
          {/* Brand Col */}
          <div className="col-span-2 space-y-3 pr-4">
            <span
              onClick={() => handleNav('home')}
              className="font-serif-headline text-3xl font-normal text-[#111111] cursor-pointer hover:text-[#8B3A4A] transition-colors"
            >
              ARTVERSE
            </span>
            <p className="text-[#666666] text-xs max-w-sm leading-relaxed font-sans">
              Discover local talent. Create global opportunities.
            </p>
          </div>

          {/* EXPLORE */}
          <div>
            <h4 className="font-semibold text-[#111111] uppercase tracking-wider mb-4 text-[11px]">
              Explore
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => handleNav('discover')} className="text-[#666666] hover:text-[#8B3A4A] transition-colors cursor-pointer">
                  Discover
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('artists')} className="text-[#666666] hover:text-[#8B3A4A] transition-colors cursor-pointer">
                  Artists
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('artwork')} className="text-[#666666] hover:text-[#8B3A4A] transition-colors cursor-pointer">
                  Artwork
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('opportunities')} className="text-[#666666] hover:text-[#8B3A4A] transition-colors cursor-pointer">
                  Opportunities
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('global-stage')} className="text-[#666666] hover:text-[#8B3A4A] transition-colors cursor-pointer">
                  Global Stage
                </button>
              </li>
            </ul>
          </div>

          {/* FOR ARTISTS */}
          <div>
            <h4 className="font-semibold text-[#111111] uppercase tracking-wider mb-4 text-[11px]">
              For Artists
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => handleNav('portfolio')} className="text-[#666666] hover:text-[#8B3A4A] transition-colors cursor-pointer">
                  Portfolio
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('opportunities')} className="text-[#666666] hover:text-[#8B3A4A] transition-colors cursor-pointer">
                  Opportunities
                </button>
              </li>
              <li>
                <button
                  onClick={() => setAiMatchModalOpen(true)}
                  className="text-[#666666] hover:text-[#8B3A4A] transition-colors cursor-pointer"
                >
                  AI Match
                </button>
              </li>
            </ul>
          </div>

          {/* FOR EXPLORERS */}
          <div>
            <h4 className="font-semibold text-[#111111] uppercase tracking-wider mb-4 text-[11px]">
              For Explorers
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => handleNav('saved')} className="text-[#666666] hover:text-[#8B3A4A] transition-colors cursor-pointer">
                  Saved
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('artists')} className="text-[#666666] hover:text-[#8B3A4A] transition-colors cursor-pointer">
                  Collaborations
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#999999]">
          <p>© 2026 ARTVERSE. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNav('home')}
              className="text-[#999999] hover:text-[#8B3A4A] transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => handleLegalModal('Privacy Policy', 'ARTVERSE respects your creative sovereignty and personal privacy. We do not sell creator portfolios or visitor data to third parties.')}
              className="text-[#999999] hover:text-[#8B3A4A] transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <button
              onClick={() => handleLegalModal('Terms of Service', 'Creators retain 100% intellectual property ownership of their uploaded artwork, portfolios, and creative project proposals on ARTVERSE.')}
              className="text-[#999999] hover:text-[#8B3A4A] transition-colors cursor-pointer"
            >
              Terms
            </button>
            <button
              onClick={() => handleLegalModal('Contact Support', 'Get in touch with the ARTVERSE curatorial desk at contact@artverse.gallery')}
              className="text-[#999999] hover:text-[#8B3A4A] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
