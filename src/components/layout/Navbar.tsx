import React, { useState, useEffect } from 'react';
import { useApp, NavigationPage } from '../../context/AppContext';
import {
  Search,
  Bookmark,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Palette,
  Compass,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    currentUser,
    logout,
    savedArtworkIds,
    savedArtistIds,
    savedOpportunityIds,
    notifications,
    searchQuery,
    setSearchQuery,
    setSelectedArtistId,
    setSelectedArtworkId,
    setAiMatchModalOpen,
    viewArtistProfile,
    isAuthLoading
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalSavedCount =
    savedArtworkIds.length + savedArtistIds.length + savedOpportunityIds.length;
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const navigateTo = (page: NavigationPage) => {
    setCurrentPage(page);
    setSelectedArtistId(null);
    setSelectedArtworkId(null);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleArtistCollaborations = () => {
    setCurrentPage('dashboard');
    setSelectedArtistId(null);
    setSelectedArtworkId(null);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setTimeout(() => {
      const el = document.getElementById('collaborations-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 1000, behavior: 'smooth' });
      }
    }, 120);
  };

  const handleExplorerCollaborations = () => {
    setCurrentPage('explorer-dashboard');
    setSelectedArtistId(null);
    setSelectedArtworkId(null);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setTimeout(() => {
      const el = document.getElementById('collaborations-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 600, behavior: 'smooth' });
      }
    }, 120);
  };

  const isArtist = currentUser?.role === 'artist';

  // Prevent navigation flickering during initial auth check
  if (isAuthLoading) {
    return (
      <header
        className={`sticky top-0 z-40 w-full bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E7E7E4] transition-all duration-300 ${
          isScrolled ? 'h-16 shadow-2xs' : 'h-20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 select-none shrink-0">
            <span className="font-serif-headline text-2xl sm:text-3xl font-normal tracking-tight text-[#111111]">
              ARTVERSE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B3A4A] mt-1" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-8 rounded-full bg-[#F3F3F0] animate-pulse hidden sm:block" />
            <div className="w-24 h-8 rounded-full bg-[#F3F3F0] animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  // ============================================================
  // 1. BEFORE LOGIN: PUBLIC NAVIGATION
  // Show only:
  // ARTVERSE
  // Discover
  // Artists
  // Artwork
  // Opportunities
  // Global Stage
  // Search
  //
  // Right side:
  // Sign in
  // Join ARTVERSE
  //
  // Remove/hide before login:
  // Dashboard, Portfolio, AI Match, Saved, Notifications, Collaborations, Profile,
  // Settings, Bookmark counts, Notification counts, Personalized recommendations
  // ============================================================
  if (!currentUser) {
    const publicNavLinks: { label: string; page: NavigationPage }[] = [
      { label: 'Home', page: 'home' },
      { label: 'Discover', page: 'discover' },
      { label: 'Artists', page: 'artists' },
      { label: 'Artwork', page: 'artwork' },
      { label: 'Opportunities', page: 'opportunities' },
      { label: 'AI Match', page: 'ai-match' },
      { label: 'Global Stage', page: 'global-stage' }
    ];

    return (
      <header
        className={`sticky top-0 z-40 w-full bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E7E7E4] transition-all duration-300 ${
          isScrolled ? 'h-[72px] shadow-2xs' : 'h-[88px]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
          
          {/* LEFT: ARTVERSE Logo & Public Nav Links */}
          <div className="flex items-center gap-6 md:gap-8">
            <div
              onClick={() => navigateTo('landing')}
              className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
              title="ARTVERSE"
            >
              <span className="font-serif-headline text-3xl sm:text-4xl font-normal tracking-tight text-[#111111] group-hover:text-[#8B3A4A] transition-colors">
                ARTVERSE
              </span>
              <span className="w-2 h-2 rounded-full bg-[#8B3A4A] mt-1" />
            </div>

            {/* Desktop Public Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {publicNavLinks.map((link) => {
                const isActive = currentPage === link.page;
                return (
                  <button
                    key={link.label}
                    onClick={() => navigateTo(link.page)}
                    className={`px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-colors cursor-pointer ${
                      isActive
                        ? 'text-[#8B3A4A] font-semibold bg-[#F2E5E8]'
                        : 'text-[#666666] hover:text-[#111111] hover:bg-[#F3F3F0]'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* RIGHT: Search, Sign in & Join ARTVERSE */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input Toggle */}
            <div className="relative">
              {showSearchInput ? (
                <div className="flex items-center bg-[#FFFFFF] border border-[#E7E7E4] rounded-full px-3 py-1.5 w-44 sm:w-60 shadow-xs">
                  <Search className="w-3.5 h-3.5 text-[#999999] shrink-0 mr-1.5" />
                  <input
                    type="text"
                    placeholder="Search creators, works..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigateTo('discover');
                      }
                    }}
                    autoFocus
                    className="bg-transparent text-xs text-[#111111] placeholder-[#999999] outline-none w-full"
                  />
                  <button
                    onClick={() => setShowSearchInput(false)}
                    className="text-[#999999] hover:text-[#111111] ml-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="p-2 rounded-full text-[#666666] hover:text-[#111111] hover:bg-[#F3F3F0] transition-colors cursor-pointer"
                  title="Search ARTVERSE"
                  aria-label="Search ARTVERSE"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sign in Button */}
            <button
              onClick={() => navigateTo('login')}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                currentPage === 'login'
                  ? 'bg-[#F2E5E8] text-[#8B3A4A] border-[#E8D3D8]'
                  : 'text-[#111111] bg-[#FFFFFF] hover:text-[#8B3A4A] hover:border-[#E8D3D8] border-[#E7E7E4]'
              }`}
            >
              Sign in
            </button>

            {/* Join ARTVERSE Button */}
            <button
              onClick={() => navigateTo('signin')}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all tracking-wide cursor-pointer ${
                currentPage === 'signin' || currentPage === 'signup'
                  ? 'bg-[#732D3B] ring-2 ring-[#E8D3D8]'
                  : 'bg-[#8B3A4A] hover:bg-[#732D3B]'
              }`}
            >
              Join ARTVERSE
            </button>

            {/* Mobile Menu Button for Public Header */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-[#111111] hover:bg-[#F3F3F0] lg:hidden transition-colors cursor-pointer"
              aria-label="Toggle Public Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Pre-login Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#FFFFFF] border-b border-[#E7E7E4] px-6 py-6 space-y-4 overflow-hidden shadow-md"
            >
              <div className="space-y-1">
                {publicNavLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => navigateTo(link.page)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      currentPage === link.page
                        ? 'bg-[#F2E5E8] text-[#8B3A4A] font-semibold'
                        : 'text-[#666666] hover:text-[#111111] hover:bg-[#F3F3F0]'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-[#E7E7E4] space-y-2">
                <button
                  onClick={() => navigateTo('login')}
                  className="w-full py-2.5 rounded-full text-xs font-semibold text-[#111111] border border-[#E7E7E4] text-center hover:bg-[#F3F3F0] transition-colors cursor-pointer"
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigateTo('signin')}
                  className="w-full py-2.5 rounded-full text-xs font-semibold text-white bg-[#8B3A4A] hover:bg-[#732D3B] text-center transition-colors cursor-pointer"
                >
                  Join ARTVERSE
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    );
  }

  // ============================================================
  // 2. AFTER LOGIN: AUTHENTICATED APPLICATION NAVIGATION
  //
  // Artist:
  // Dashboard, Discover, Portfolio, Opportunities, AI Match, Collaborations
  // Right side: Search, Saved, Notifications, Profile
  //
  // Explorer:
  // Dashboard, Discover, Artists, Artwork, Opportunities, AI Match, Collaborations
  // Right side: Search, Saved, Notifications, Profile
  // ============================================================

  // ARTIST NAVIGATION LINKS
  const artistNavLinks = [
    { label: 'Dashboard', action: () => navigateTo('dashboard'), active: currentPage === 'dashboard' },
    { label: 'Discover', action: () => navigateTo('discover'), active: currentPage === 'discover' },
    { label: 'Portfolio', action: () => navigateTo('portfolio'), active: currentPage === 'portfolio' },
    { label: 'Opportunities', action: () => navigateTo('opportunities'), active: currentPage === 'opportunities' },
    { label: 'AI Match', action: () => setAiMatchModalOpen(true), active: false, isAction: true },
    { label: 'Collaborations', action: handleArtistCollaborations, active: false }
  ];

  // EXPLORER NAVIGATION LINKS
  const explorerNavLinks = [
    { label: 'Dashboard', action: () => navigateTo('explorer-dashboard'), active: currentPage === 'explorer-dashboard' },
    { label: 'Discover', action: () => navigateTo('discover'), active: currentPage === 'discover' },
    { label: 'Artists', action: () => navigateTo('artists'), active: currentPage === 'artists' },
    { label: 'Artwork', action: () => navigateTo('artwork'), active: currentPage === 'artwork' },
    { label: 'Opportunities', action: () => navigateTo('opportunities'), active: currentPage === 'opportunities' },
    { label: 'AI Match', action: () => setAiMatchModalOpen(true), active: false, isAction: true },
    { label: 'Collaborations', action: handleExplorerCollaborations, active: false }
  ];

  const currentNavLinks = isArtist ? artistNavLinks : explorerNavLinks;

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E7E7E4] transition-all duration-300 ${
        isScrolled ? 'h-[72px] shadow-2xs' : 'h-[88px]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        
        {/* LEFT: ARTVERSE Logo & Role-Aware Desktop Navigation */}
        <div className="flex items-center gap-6 xl:gap-8">
          <div
            onClick={() => navigateTo(isArtist ? 'dashboard' : 'explorer-dashboard')}
            className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
          >
            <span className="font-serif-headline text-3xl sm:text-4xl font-normal tracking-tight text-[#111111] group-hover:text-[#8B3A4A] transition-colors">
              ARTVERSE
            </span>
            <span className="w-2 h-2 rounded-full bg-[#8B3A4A] mt-1" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {currentNavLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className={`px-4 py-2 rounded-full text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                  link.active
                    ? 'bg-[#8B3A4A] text-white'
                    : 'text-[#666666] hover:text-[#111111] hover:bg-[#F3F3F0]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* RIGHT: Role-Aware Controls (Search, Saved, Notifications, Profile) for BOTH roles */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Universal Search Input */}
          <div className="relative">
            {showSearchInput ? (
              <div className="flex items-center bg-[#FFFFFF] border border-[#E7E7E4] rounded-full px-3 py-1.5 w-44 sm:w-60 shadow-xs">
                <Search className="w-3.5 h-3.5 text-[#999999] shrink-0 mr-1.5" />
                <input
                  type="text"
                  placeholder="Search creators, works..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigateTo('discover');
                    }
                  }}
                  autoFocus
                  className="bg-transparent text-xs text-[#111111] placeholder-[#999999] outline-none w-full"
                />
                <button
                  onClick={() => setShowSearchInput(false)}
                  className="text-[#999999] hover:text-[#111111] ml-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                className="p-2 rounded-full text-[#666666] hover:text-[#111111] hover:bg-[#F3F3F0] transition-colors cursor-pointer"
                title="Search ARTVERSE"
                aria-label="Search ARTVERSE"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Saved Icon (Right side for BOTH Artist and Explorer) */}
          <button
            onClick={() => navigateTo('saved')}
            className={`p-2 rounded-full relative transition-colors cursor-pointer ${
              currentPage === 'saved'
                ? 'bg-[#8B3A4A] text-white'
                : 'text-[#666666] hover:text-[#111111] hover:bg-[#F3F3F0]'
            }`}
            title="Saved Collection"
            aria-label="Saved Collection"
          >
            <Bookmark className="w-4 h-4" />
            {totalSavedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#8B3A4A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalSavedCount}
              </span>
            )}
          </button>

          {/* Notifications Button (With unread indicator) */}
          <button
            onClick={() => navigateTo('notifications')}
            className={`p-2 rounded-full relative transition-colors cursor-pointer ${
              currentPage === 'notifications'
                ? 'bg-[#8B3A4A] text-white'
                : 'text-[#666666] hover:text-[#111111] hover:bg-[#F3F3F0]'
            }`}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-[#8B3A4A] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-[#FFFFFF] hover:bg-[#F2E5E8]/60 border border-[#E7E7E4] hover:border-[#E8D3D8] transition-all cursor-pointer"
            >
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-[#8B3A4A]/30"
                onError={(e: any) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <span className="text-xs font-semibold text-[#111111] hidden sm:inline max-w-[100px] truncate">
                {currentUser.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#666666] mr-1" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FFFFFF] p-2 shadow-xl border border-[#E7E7E4] z-50 animate-in fade-in duration-150">
                <div className="p-3 border-b border-[#E7E7E4]">
                  <p className="text-sm font-bold text-[#111111]">{currentUser.name}</p>
                  <p className="text-xs text-[#8B3A4A] capitalize font-medium">{currentUser.role} account</p>
                  <p className="text-[11px] text-[#999999] truncate mt-0.5">{currentUser.email}</p>
                </div>

                <div className="py-1 text-xs">
                  {isArtist ? (
                    <>
                      <button
                        onClick={() => navigateTo('dashboard')}
                        className="w-full text-left px-3 py-2 rounded-xl text-[#111111] hover:bg-[#F2E5E8] hover:text-[#8B3A4A] flex items-center gap-2 cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#8B3A4A]" />
                        <span>Artist Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          viewArtistProfile(currentUser.id);
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-[#111111] hover:bg-[#F2E5E8] hover:text-[#8B3A4A] flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#8B3A4A]" />
                        <span>View Public Profile</span>
                      </button>
                      <button
                        onClick={() => navigateTo('portfolio')}
                        className="w-full text-left px-3 py-2 rounded-xl text-[#111111] hover:bg-[#F2E5E8] hover:text-[#8B3A4A] flex items-center gap-2 cursor-pointer"
                      >
                        <Palette className="w-4 h-4 text-[#8B3A4A]" />
                        <span>My Portfolio</span>
                      </button>
                      <button
                        onClick={() => navigateTo('saved')}
                        className="w-full text-left px-3 py-2 rounded-xl text-[#111111] hover:bg-[#F2E5E8] hover:text-[#8B3A4A] flex items-center gap-2 cursor-pointer"
                      >
                        <Bookmark className="w-4 h-4 text-[#8B3A4A]" />
                        <span>Saved Collection</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigateTo('explorer-dashboard')}
                        className="w-full text-left px-3 py-2 rounded-xl text-[#111111] hover:bg-[#F2E5E8] hover:text-[#8B3A4A] flex items-center gap-2 cursor-pointer"
                      >
                        <Compass className="w-4 h-4 text-[#8B3A4A]" />
                        <span>Explorer Dashboard</span>
                      </button>
                      <button
                        onClick={() => navigateTo('saved')}
                        className="w-full text-left px-3 py-2 rounded-xl text-[#111111] hover:bg-[#F2E5E8] hover:text-[#8B3A4A] flex items-center gap-2 cursor-pointer"
                      >
                        <Bookmark className="w-4 h-4 text-[#8B3A4A]" />
                        <span>Saved Collection</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="pt-1 border-t border-[#E7E7E4]">
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#8B3A4A] hover:bg-[#F2E5E8] flex items-center gap-2 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle (Authenticated) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-[#111111] hover:bg-[#F3F3F0] lg:hidden transition-colors cursor-pointer"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Authenticated Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#FFFFFF] border-b border-[#E7E7E4] px-6 py-6 space-y-4 overflow-hidden shadow-lg"
          >
            <div className="space-y-1">
              {currentNavLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    link.active
                      ? 'bg-[#8B3A4A] text-white'
                      : 'text-[#666666] hover:text-[#111111] hover:bg-[#F3F3F0]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E7E7E4] space-y-2">
              <button
                onClick={() => navigateTo('saved')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-[#666666] hover:text-[#111111] flex items-center justify-between cursor-pointer"
              >
                <span>Saved Items</span>
                <span className="text-xs bg-[#F3F3F0] text-[#111111] px-2 py-0.5 rounded-full">{totalSavedCount}</span>
              </button>

              <button
                onClick={() => navigateTo('notifications')}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-[#666666] hover:text-[#111111] flex items-center justify-between cursor-pointer"
              >
                <span>Notifications</span>
                {unreadNotificationCount > 0 && (
                  <span className="text-xs bg-[#8B3A4A] text-white px-2 py-0.5 rounded-full">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-full text-xs font-semibold text-[#8B3A4A] bg-[#F2E5E8] hover:bg-[#E8D3D8] text-center transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
