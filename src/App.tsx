import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ArtistsPage } from './pages/ArtistsPage';
import { ArtworkPage } from './pages/ArtworkPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { RisingTalentPage } from './pages/RisingTalentPage';
import { GlobalStagePage } from './pages/GlobalStagePage';
import { DashboardPage } from './pages/DashboardPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { SavedPage } from './pages/SavedPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { LoginPage } from './pages/LoginPage';
import { SignInPage } from './pages/SignInPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// Modals
import { AuthModal } from './components/modals/AuthModal';
import { ArtworkUploadModal } from './components/modals/ArtworkUploadModal';
import { AIPortfolioModal } from './components/modals/AIPortfolioModal';
import { AIMatchModal } from './components/modals/AIMatchModal';
import { CollaborationModal } from './components/modals/CollaborationModal';
import { ArtworkDetailModal } from './components/modals/ArtworkDetailModal';
import { OpportunityDetailModal } from './components/modals/OpportunityDetailModal';
import { GoogleRoleSetupModal } from './components/modals/GoogleRoleSetupModal';

const MainContent: React.FC = () => {
  const { currentPage, currentUser, setCurrentPage, setAiMatchModalOpen, selectedArtistId, isAuthLoading } = useApp();

  const isProtected = ['dashboard', 'explorer-dashboard', 'portfolio', 'saved', 'notifications', 'collaborations', 'profile', 'profile-edit'].includes(currentPage);
  const isLanding = currentPage === 'landing';

  useEffect(() => {
    // Only redirect after auth has fully resolved — never while loading
    if (!isAuthLoading && !currentUser && isProtected) {
      setCurrentPage('login');
    }
  }, [currentUser, isProtected, setCurrentPage, isAuthLoading]);

  // When navigating to ai-match, open the modal; when navigating away (including browser back), close it
  useEffect(() => {
    if (currentPage === 'ai-match') {
      setAiMatchModalOpen(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      setAiMatchModalOpen(false);
    }
  }, [currentPage, setAiMatchModalOpen]);

  // Show loading indicator while Supabase session is being restored
  if (isAuthLoading && isProtected) {
    return (
      <main className="min-h-[calc(100vh-80px-200px)] flex items-center justify-center bg-[#FAFAF8]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-full border-2 border-[#8B3A4A] border-t-transparent animate-spin" />
          <p className="text-sm text-[#8B3A4A] font-serif-headline tracking-wide">Restoring ARTVERSE session…</p>
        </div>
      </main>
    );
  }

  if (!isAuthLoading && !currentUser && isProtected) {
    return <LoginPage />;
  }

  return (
    <main className={isLanding ? '' : 'min-h-[calc(100vh-80px-200px)]'}>
      {isLanding && <LandingPage />}
      {currentPage === 'home' && <HomePage />}
      {(currentPage === 'discover' || currentPage === 'search' || currentPage === 'ai-match') && <DiscoverPage />}
      {currentPage === 'artists' && <ArtistsPage />}
      {currentPage === 'artwork' && <ArtworkPage />}
      {currentPage === 'opportunities' && <OpportunitiesPage />}
      {currentPage === 'rising-talent' && <RisingTalentPage />}
      {currentPage === 'global-stage' && <GlobalStagePage />}
      {(currentPage === 'dashboard' || currentPage === 'explorer-dashboard' || currentPage === 'collaborations') && <DashboardPage />}
      {currentPage === 'portfolio' && <PortfolioPage />}
      {currentPage === 'profile' && <ArtistsPage />}
      {currentPage === 'saved' && <SavedPage />}
      {currentPage === 'notifications' && <NotificationsPage />}
      {currentPage === 'login' && <LoginPage />}
      {(currentPage === 'signin' || currentPage === 'signup') && <SignInPage />}
      {currentPage === 'reset-password' && <ResetPasswordPage />}
    </main>
  );
};

const AppShell: React.FC = () => {
  const { currentPage } = useApp();
  const isAuthPage = currentPage === 'login' || currentPage === 'signin' || currentPage === 'signup' || currentPage === 'reset-password';
  const isLandingPage = currentPage === 'landing';

  return (
    <div className={`min-h-screen text-[#111111] flex flex-col font-sans selection:bg-[#F2E5E8] selection:text-[#8B3A4A] ${isLandingPage ? '' : 'bg-[#FAFAF8]'}`}>
      {!isAuthPage && !isLandingPage && <Navbar />}
      <MainContent />
      {!isAuthPage && !isLandingPage && <Footer />}

      {/* Global Modals & Notifications */}
      <AuthModal />
      <ArtworkUploadModal />
      <AIPortfolioModal />
      <AIMatchModal />
      <CollaborationModal />
      <ArtworkDetailModal />
      <OpportunityDetailModal />
      <GoogleRoleSetupModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
