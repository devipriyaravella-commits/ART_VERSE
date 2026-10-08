import React from 'react';
import { CinematicHero } from '../components/common/CinematicHero';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const { setCurrentPage } = useApp();

  const enterArtverse = () => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="fixed inset-0 z-30 w-full h-full overflow-hidden bg-[#0E0A08]">
      <CinematicHero onEnterArtverse={enterArtverse} />
    </div>
  );
};
