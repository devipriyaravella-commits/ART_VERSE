import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Artist,
  Artwork,
  Opportunity,
  CollaborationRequest,
  Comment,
  UserRole,
  NotificationItem
} from '../types';
import {
  INITIAL_ARTISTS,
  INITIAL_ARTWORKS,
  INITIAL_OPPORTUNITIES,
  INITIAL_COLLABORATIONS,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { supabaseService, ProfileRow } from '../services/supabaseService';
import { storageService } from '../services/storageService';
import type { Session } from '@supabase/supabase-js';

export type NavigationPage =
  | 'landing'
  | 'home'
  | 'discover'
  | 'artists'
  | 'artwork'
  | 'opportunities'
  | 'ai-match'
  | 'rising-talent'
  | 'global-stage'
  | 'search'
  | 'dashboard'
  | 'explorer-dashboard'
  | 'portfolio'
  | 'saved'
  | 'notifications'
  | 'collaborations'
  | 'profile'
  | 'profile-edit'
  | 'login'
  | 'signin'
  | 'signup'
  | 'reset-password';

export const getArtistIdFromLocation = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('artist') || params.get('artistId') || params.get('id');
  if (fromQuery && (params.get('artist') || params.get('artistId') || window.location.pathname.startsWith('/artists'))) return fromQuery;
  const path = window.location.pathname;
  if (path.startsWith('/artists/')) {
    const segment = path.replace('/artists/', '').trim();
    if (segment) return segment;
  }
  return null;
};

export const getArtworkIdFromLocation = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('artwork') || params.get('artworkId');
  if (fromQuery) return fromQuery;
  const path = window.location.pathname;
  if (path.startsWith('/artwork/')) {
    const segment = path.replace('/artwork/', '').trim();
    if (segment) return segment;
  }
  return null;
};

export const getPageFromPath = (path: string): NavigationPage => {
  // Check for Supabase recovery link in hash or query parameters
  if (
    typeof window !== 'undefined' &&
    (window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery') ||
      window.location.pathname === '/reset-password')
  ) {
    return 'reset-password';
  }

  const clean = path.replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '' || clean === '/landing') return 'landing';
  if (clean === '/home') return 'home';
  if (clean === '/discover' || clean.startsWith('/discover/')) return 'discover';
  if (clean === '/artists' || clean.startsWith('/artists/')) return 'artists';
  if (clean === '/artwork' || clean.startsWith('/artwork/')) return 'artwork';
  if (clean === '/opportunities' || clean.startsWith('/opportunities/')) return 'opportunities';
  if (clean === '/ai-match' || clean.startsWith('/ai-match/')) return 'ai-match';
  if (clean === '/rising-talent' || clean.startsWith('/rising-talent/')) return 'rising-talent';
  if (clean === '/global-stage' || clean.startsWith('/global-stage/')) return 'global-stage';
  if (clean === '/search' || clean.startsWith('/search/')) return 'search';
  if (clean === '/dashboard' || clean.startsWith('/dashboard/')) return 'dashboard';
  if (clean === '/explorer-dashboard' || clean.startsWith('/explorer-dashboard/')) return 'explorer-dashboard';
  if (clean === '/portfolio' || clean.startsWith('/portfolio/')) return 'portfolio';
  if (clean === '/saved' || clean.startsWith('/saved/')) return 'saved';
  if (clean === '/notifications' || clean.startsWith('/notifications/')) return 'notifications';
  if (clean === '/collaborations' || clean.startsWith('/collaborations/')) return 'collaborations';
  if (clean === '/profile' || clean.startsWith('/profile/')) return 'profile';
  if (clean === '/signin' || clean.startsWith('/signin/')) return 'signin';
  if (clean === '/signup' || clean.startsWith('/signup/')) return 'signup';
  if (clean === '/login' || clean.startsWith('/login/')) return 'login';
  if (clean === '/reset-password' || clean.startsWith('/reset-password/')) return 'reset-password';
  return 'home';
};

export const getPathFromPage = (page: NavigationPage): string => {
  switch (page) {
    case 'landing':
      return '/';
    case 'home':
      return '/home';
    case 'discover':
      return '/discover';
    case 'artists':
      return '/artists';
    case 'artwork':
      return '/artwork';
    case 'opportunities':
      return '/opportunities';
    case 'ai-match':
      return '/ai-match';
    case 'rising-talent':
      return '/rising-talent';
    case 'global-stage':
      return '/global-stage';
    case 'search':
      return '/search';
    case 'dashboard':
    case 'explorer-dashboard':
      return '/dashboard';
    case 'portfolio':
      return '/portfolio';
    case 'saved':
      return '/saved';
    case 'notifications':
      return '/notifications';
    case 'collaborations':
      return '/collaborations';
    case 'profile':
    case 'profile-edit':
      return '/profile';
    case 'signin':
      return '/signin';
    case 'signup':
      return '/signup';
    case 'login':
      return '/login';
    case 'reset-password':
      return '/reset-password';
    default:
      return '/';
  }
};

export const updatePageMetadata = (page: NavigationPage) => {
  const titles: Record<string, string> = {
    landing: 'ARTVERSE — A World of Creative Possibility',
    home: 'ARTVERSE — Local Talent, Global Stage',
    discover: 'ARTVERSE — Discover Emerging Artists & Works',
    artists: 'ARTVERSE — Artists & Cultural Creators Network',
    artwork: 'ARTVERSE — Contemporary Artwork Gallery',
    opportunities: 'ARTVERSE — Creative Grants, Residencies & Open Calls',
    'ai-match': 'ARTVERSE — AI Artist & Opportunity Matching Engine',
    'global-stage': 'ARTVERSE — From Local Studios to the Global Stage',
    'rising-talent': 'ARTVERSE — Rising Talent & Platform Engagement Data',
    search: 'ARTVERSE — Universal Search',
    dashboard: 'ARTVERSE — Member Command Center',
    'explorer-dashboard': 'ARTVERSE — Explorer & Curator Hub',
    portfolio: 'ARTVERSE — Artist Portfolio Management',
    saved: 'ARTVERSE — Curated Saved Collection',
    notifications: 'ARTVERSE — Activity & Notifications',
    collaborations: 'ARTVERSE — Collaboration Proposals',
    profile: 'ARTVERSE — Creator Profile',
    login: 'ARTVERSE — Sign In',
    signin: 'ARTVERSE — Join ARTVERSE',
    signup: 'ARTVERSE — Join ARTVERSE',
    'reset-password': 'ARTVERSE — Set New Password'
  };

  const title = titles[page] || 'ARTVERSE — Local Talent, Global Stage';
  document.title = title;
};

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;
  selectedArtistId: string | null;
  setSelectedArtistId: (id: string | null) => void;
  selectedArtworkId: string | null;
  setSelectedArtworkId: (id: string | null) => void;
  selectedOpportunityId: string | null;
  setSelectedOpportunityId: (id: string | null) => void;

  // Search & Global filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  locationFilter: string;
  setLocationFilter: (location: string) => void;
  availabilityFilter: string;
  setAvailabilityFilter: (avail: string) => void;

  // Data
  currentUser: Artist | { id: string; name: string; email: string; role: UserRole; avatar: string } | null;
  artists: Artist[];
  artworks: Artwork[];
  opportunities: Opportunity[];
  collaborations: CollaborationRequest[];
  comments: Comment[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;

  // Saved & Collections
  likedArtworkIds: string[];
  savedArtworkIds: string[];
  savedArtistIds: string[];
  savedOpportunityIds: string[];
  followedArtistIds: string[];

  // Actions
  /** @deprecated — mock only, do not use in production */
  loginAs: (type: 'ananya' | 'rahul' | 'explorer' | 'custom', customData?: any) => void;
  logout: () => void;
  toggleLikeArtwork: (artworkId: string) => void;
  toggleSaveArtwork: (artworkId: string) => void;
  toggleSaveArtist: (artistId: string) => void;
  toggleSaveOpportunity: (oppId: string) => void;
  toggleFollowArtist: (artistId: string) => void;
  addArtwork: (artwork: Omit<Artwork, 'id' | 'likesCount' | 'savesCount' | 'viewsCount' | 'commentsCount' | 'createdAt'>) => Promise<string | void> | void;
  updateArtwork: (artworkId: string, updates: Partial<Artwork>) => Promise<void> | void;
  deleteArtwork: (artworkId: string) => Promise<void> | void;
  updateArtistProfile: (artistId: string, updates: Partial<Artist>) => void;
  uploadAvatar: (file: File) => Promise<string>;
  deleteAvatar: () => Promise<void>;
  uploadCover: (file: File) => Promise<string>;
  deleteCover: () => Promise<void>;
  editingArtwork: Artwork | null;
  setEditingArtwork: (artwork: Artwork | null) => void;
  sendCollaboration: (req: Omit<CollaborationRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateCollabStatus: (collabId: string, status: 'accepted' | 'declined' | 'rejected') => void;
  addComment: (artworkId: string, text: string) => Promise<void> | void;
  updateComment: (commentId: string, text: string) => Promise<void> | void;
  deleteComment: (commentId: string) => Promise<void> | void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Modals
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  uploadModalOpen: boolean;
  setUploadModalOpen: (open: boolean) => void;
  aiPortfolioModalOpen: boolean;
  setAiPortfolioModalOpen: (open: boolean) => void;
  aiMatchModalOpen: boolean;
  setAiMatchModalOpen: (open: boolean) => void;
  aiOpportunityModalOpen: boolean;
  setAiOpportunityModalOpen: (open: boolean) => void;
  collabModalTargetArtist: Artist | null;
  setCollabModalTargetArtist: (artist: Artist | null) => void;

  // Toast
  toasts: Toast[];
  notify: (message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
  
  // Quick View Detail Helpers
  viewArtistProfile: (artistId: string) => void;
  viewArtworkDetail: (artworkId: string) => void;
  viewOpportunityDetail: (oppId: string) => void;

  // Supabase Backend & Auth State
  authLoading: boolean;
  isAuthLoading: boolean;
  currentSession: Session | null;
  currentProfile: ProfileRow | null;
  currentRole: UserRole | null;
  supabaseConfigured: boolean;
  isDataLoading: boolean;
  dataError: string | null;
  refreshData: () => Promise<void>;
  pendingGoogleUser: { id: string; email: string; name: string; avatar: string } | null;
  setPendingGoogleUser: (user: { id: string; email: string; name: string; avatar: string } | null) => void;
  refreshAuthSession: () => Promise<void>;
  syncUserSession: (explicitSession?: Session | null) => Promise<{ user: any; profile: ProfileRow | null; role: UserRole } | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & selection state — initialize from browser URL for deep linking
  const [currentPage, setCurrentPageRaw] = useState<NavigationPage>(() => getPageFromPath(window.location.pathname));
  const [selectedArtistId, setSelectedArtistIdRaw] = useState<string | null>(() => getArtistIdFromLocation());
  const [selectedArtworkId, setSelectedArtworkIdRaw] = useState<string | null>(() => getArtworkIdFromLocation());
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);

  const setSelectedArtistId = (id: string | null) => {
    setSelectedArtistIdRaw(id);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (id) {
          url.searchParams.set('artist', id);
        } else {
          url.searchParams.delete('artist');
          url.searchParams.delete('artistId');
          url.searchParams.delete('id');
        }
        window.history.replaceState(null, '', url.pathname + (url.search || ''));
      } catch {}
    }
  };

  const setSelectedArtworkId = (id: string | null) => {
    setSelectedArtworkIdRaw(id);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (id) {
          url.searchParams.set('artwork', id);
        } else {
          url.searchParams.delete('artwork');
          url.searchParams.delete('artworkId');
        }
        window.history.replaceState(null, '', url.pathname + (url.search || ''));
      } catch {}
    }
  };

  // Wrap setCurrentPage to sync browser URL and page title
  const setCurrentPage = (page: NavigationPage) => {
    setCurrentPageRaw(page);
    const targetPath = getPathFromPage(page);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    updatePageMetadata(page);
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopstate = () => {
      const page = getPageFromPath(window.location.pathname);
      setCurrentPageRaw(page);
      // For pages that don't have detail views, clear selection state
      // This prevents blank screens when pressing Back from a profile/artwork view
      const artistId = getArtistIdFromLocation();
      const artworkId = getArtworkIdFromLocation();
      setSelectedArtistIdRaw(artistId);
      setSelectedArtworkIdRaw(artworkId);
      // If we navigated back to a page without an artist/artwork param, clear selections
      if (!artistId && ['home', 'landing', 'discover', 'opportunities', 'global-stage', 'rising-talent', 'dashboard', 'explorer-dashboard'].includes(page)) {
        setSelectedArtistIdRaw(null);
        setSelectedArtworkIdRaw(null);
      }
      // Sync modal states with browser back/forward buttons
      if (page === 'ai-match') {
        setAiMatchModalOpen(true);
      } else {
        setAiMatchModalOpen(false);
      }
      updatePageMetadata(page);
      // Always scroll to top on back/forward navigation
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('popstate', handlePopstate);
    // Set initial page title
    updatePageMetadata(getPageFromPath(window.location.pathname));
    return () => window.removeEventListener('popstate', handlePopstate);
  }, []);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  // Persistence keys with robust deduplication and auto-upgrade to 100+ cards
  const [artists, setArtists] = useState<Artist[]>(() => {
    try {
      const saved = localStorage.getItem('artverse_editorial_artists');
      let baseList: Artist[] = INITIAL_ARTISTS;
      if (saved) {
        const parsed: Artist[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length >= INITIAL_ARTISTS.length) {
            baseList = parsed;
          } else {
            const initMap = new Map(INITIAL_ARTISTS.map(a => [a.id, a]));
            const custom = parsed.filter(a => !initMap.has(a.id));
            baseList = [...INITIAL_ARTISTS, ...custom];
          }
        }
      }
      const seen = new Set<string>();
      const deduplicated: Artist[] = [];
      for (const a of baseList) {
        const key = (a.id || a.email || a.name).toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          deduplicated.push(a);
        }
      }
      return deduplicated.length > 0 ? deduplicated : INITIAL_ARTISTS;
    } catch {
      return INITIAL_ARTISTS;
    }
  });

  const [artworks, setArtworks] = useState<Artwork[]>(() => {
    try {
      const saved = localStorage.getItem('artverse_editorial_artworks');
      if (saved) {
        const parsed: Artwork[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length >= INITIAL_ARTWORKS.length) {
            return parsed;
          }
          const initMap = new Map(INITIAL_ARTWORKS.map(a => [a.id, a]));
          const custom = parsed.filter(a => !initMap.has(a.id));
          return [...INITIAL_ARTWORKS, ...custom];
        }
      }
      return INITIAL_ARTWORKS;
    } catch {
      return INITIAL_ARTWORKS;
    }
  });

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    try {
      const saved = localStorage.getItem('artverse_editorial_opportunities');
      if (saved) {
        const parsed: Opportunity[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length >= INITIAL_OPPORTUNITIES.length) {
            return parsed;
          }
          const initMap = new Map(INITIAL_OPPORTUNITIES.map(o => [o.id, o]));
          const custom = parsed.filter(o => !initMap.has(o.id));
          return [...INITIAL_OPPORTUNITIES, ...custom];
        }
      }
      return INITIAL_OPPORTUNITIES;
    } catch {
      return INITIAL_OPPORTUNITIES;
    }
  });

  const [collaborations, setCollaborations] = useState<CollaborationRequest[]>(() => {
    try {
      const saved = localStorage.getItem('artverse_editorial_collaborations');
      if (saved) {
        const parsed: CollaborationRequest[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length >= INITIAL_COLLABORATIONS.length) {
            return parsed;
          }
          const initMap = new Map(INITIAL_COLLABORATIONS.map(c => [c.id, c]));
          const custom = parsed.filter(c => !initMap.has(c.id));
          return [...INITIAL_COLLABORATIONS, ...custom];
        }
      }
      return INITIAL_COLLABORATIONS;
    } catch {
      return INITIAL_COLLABORATIONS;
    }
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const saved = localStorage.getItem('artverse_editorial_comments');
      if (saved) {
        const parsed: Comment[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length >= INITIAL_COMMENTS.length) {
            return parsed;
          }
          const initMap = new Map(INITIAL_COMMENTS.map(c => [c.id, c]));
          const custom = parsed.filter(c => !initMap.has(c.id));
          return [...INITIAL_COMMENTS, ...custom];
        }
      }
      return INITIAL_COMMENTS;
    } catch {
      return INITIAL_COMMENTS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('artverse_editorial_notifications');
      if (saved) {
        const parsed: NotificationItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length >= INITIAL_NOTIFICATIONS.length) {
            return parsed;
          }
          const initMap = new Map(INITIAL_NOTIFICATIONS.map(n => [n.id, n]));
          const custom = parsed.filter(n => !initMap.has(n.id));
          return [...INITIAL_NOTIFICATIONS, ...custom];
        }
      }
      return INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Current logged in user & Supabase auth profile states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentProfile, setCurrentProfile] = useState<ProfileRow | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);

  // Google OAuth: if a user signs in via Google and has no profile/role, hold them here
  const [pendingGoogleUser, setPendingGoogleUser] = useState<any>(null);

  // User engagement collections (start empty — Supabase session listener will load real data)
  const [likedArtworkIds, setLikedArtworkIds] = useState<string[]>([]);
  const [savedArtworkIds, setSavedArtworkIds] = useState<string[]>([]);
  const [savedArtistIds, setSavedArtistIds] = useState<string[]>([]);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>([]);
  const [followedArtistIds, setFollowedArtistIds] = useState<string[]>([]);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [aiPortfolioModalOpen, setAiPortfolioModalOpen] = useState(false);
  const [aiMatchModalOpen, setAiMatchModalOpen] = useState(false);
  const [aiOpportunityModalOpen, setAiOpportunityModalOpen] = useState(false);
  const [collabModalTargetArtist, setCollabModalTargetArtist] = useState<Artist | null>(null);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Supabase Backend State & Session Listener
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => isSupabaseConfigured());
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const supabaseConfigured = isSupabaseConfigured();

  const loadDatabaseData = async () => {
    if (!isSupabaseConfigured()) return;
    setIsDataLoading(true);
    setDataError(null);
    try {
      const [dbArtists, dbArtworks, dbOpps] = await Promise.all([
        supabaseService.getArtistsWithMetrics().catch(() => []),
        supabaseService.getArtworksWithArtists().catch(() => []),
        supabaseService.getOpportunitiesData().catch(() => [])
      ]);

      if (dbArtists && dbArtists.length > 0) {
        setArtists((prev) => {
          const realIds = new Set(dbArtists.map((a) => a.id));
          const preserved = prev.filter((p) => !realIds.has(p.id));
          return [...dbArtists, ...preserved];
        });
      }

      if (dbArtworks && dbArtworks.length > 0) {
        setArtworks((prev) => {
          const realIds = new Set(dbArtworks.map((a) => a.id));
          const preserved = prev.filter((p) => !realIds.has(p.id));
          return [...dbArtworks, ...preserved];
        });
      }

      if (dbOpps && dbOpps.length > 0) {
        setOpportunities((prev) => {
          const realIds = new Set(dbOpps.map((o) => o.id));
          const preserved = prev.filter((p) => !realIds.has(p.id));
          return [...dbOpps, ...preserved];
        });
      }
    } catch (err: any) {
      console.warn('[ARTVERSE] Database query warning:', err?.message || err);
      setDataError('Unable to load latest gallery records.');
    } finally {
      setIsDataLoading(false);
    }
  };

  const refreshData = async () => {
    await loadDatabaseData();
  };

  /**
   * Centralized Authentication Initialization & Profile Synchronization Flow
   * Loads profile using auth.uid() / session.user.id and synchronizes full context state.
   */
  const syncUserSession = async (
    explicitSession?: Session | null
  ): Promise<{ user: any; profile: ProfileRow | null; role: UserRole } | null> => {
    if (!isSupabaseConfigured()) {
      setIsAuthLoading(false);
      return null;
    }

    setIsAuthLoading(true);

    try {
      let session = explicitSession;
      if (session === undefined) {
        const { data } = await supabase.auth.getSession();
        session = data.session;
      }

      if (!session?.user) {
        setCurrentSession(null);
        setCurrentProfile(null);
        setCurrentRole(null);
        setCurrentUser(null);
        setPendingGoogleUser(null);
        return null;
      }

      const userId = session.user.id;
      setCurrentSession(session);

      // 1. Fetch user's profile row from public.profiles using auth.uid() / session.user.id
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // 2. If profile is missing (e.g. freshly created user before DB trigger ran)
      if (!profile) {
        const metadataRole = (session.user.user_metadata?.role === 'explorer' ? 'explorer' : 'artist') as UserRole;
        const emailPrefix = (session.user.email || 'creator').split('@')[0];
        const autoName =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
        const username = `${emailPrefix.replace(/[^a-zA-Z0-9_]/g, '')}_${userId.slice(0, 5)}`;

        try {
          const { data: inserted } = await supabase
            .from('profiles')
            .upsert(
              {
                id: userId,
                full_name: autoName,
                username,
                role: metadataRole,
                city: session.user.user_metadata?.city || 'Global',
                country: session.user.user_metadata?.country || 'Global',
                primary_medium:
                  metadataRole === 'artist'
                    ? session.user.user_metadata?.primary_medium || 'Visual Art'
                    : null,
                skills: ['Visual Art'],
                interests: []
              },
              { onConflict: 'id' }
            )
            .select()
            .maybeSingle();

          if (inserted) {
            profile = inserted;
          }
        } catch (upsertErr) {
          console.warn('[ARTVERSE] Profile sync creation notice:', upsertErr);
        }
      }

      // 3. Check strictly for Google OAuth users without role selection
      const isGoogleOAuth = session.user.app_metadata?.provider === 'google' || 
                            session.user.identities?.some((id: any) => id.provider === 'google');
      if (!profile && isGoogleOAuth && !session.user.user_metadata?.role) {
        const googleName =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split('@')[0] ||
          'Creator';
        setPendingGoogleUser({
          id: userId,
          email: session.user.email || '',
          name: googleName,
          avatar:
            session.user.user_metadata?.avatar_url ||
            session.user.user_metadata?.picture ||
            ''
        });
        return null;
      }

      const role = (profile?.role === 'explorer' ? 'explorer' : (session.user.user_metadata?.role === 'explorer' ? 'explorer' : 'artist')) as UserRole;
      const userName =
        profile?.full_name ||
        profile?.username ||
        session.user.user_metadata?.full_name ||
        session.user.email?.split('@')[0] ||
        'Creator';

      const userObj = {
        id: userId,
        name: userName,
        email: session.user.email || '',
        role: role,
        avatar:
          profile?.avatar_url ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        coverImage:
          profile?.cover_url ||
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80',
        location: [profile?.city, profile?.country].filter(Boolean).join(', ') || 'Global',
        title: profile?.primary_medium
          ? `${profile.primary_medium} Creator`
          : 'Visual Creator',
        bio: profile?.bio || '',
        skills:
          profile?.skills && profile.skills.length > 0 ? profile.skills : ['Visual Art'],
        followersCount: 1,
        profileViews: 1,
        artworkViews: 1,
        viewsGrowth: '+0%',
        engagementGrowth: '+0%',
        isRising: false,
        isFeatured: false,
        isTrending: false,
        createdAt: profile?.created_at || new Date().toISOString()
      };

      setCurrentProfile(profile || null);
      setCurrentRole(role);
      setCurrentUser(userObj);
      setPendingGoogleUser(null);

      // Background load user collections
      supabaseService.getUserEngagement(userId).then((eng) => {
        if (eng.likedArtworkIds.length) setLikedArtworkIds(eng.likedArtworkIds);
        if (eng.savedArtworkIds.length) setSavedArtworkIds(eng.savedArtworkIds);
        if (eng.savedArtistIds.length) setSavedArtistIds(eng.savedArtistIds);
        if (eng.savedOpportunityIds.length) setSavedOpportunityIds(eng.savedOpportunityIds);
        if (eng.followedArtistIds.length) setFollowedArtistIds(eng.followedArtistIds);
      }).catch(() => {});

      // Background load user notifications
      supabaseService.getNotifications().then((dbNotifs) => {
        if (dbNotifs && dbNotifs.length > 0) {
          setNotifications(
            dbNotifs.map((n) => ({
              id: n.id,
              title: n.title,
              message: n.message || '',
              time: n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Recent',
              type: (n.type as any) || 'system',
              read: n.is_read || false,
              link: n.type?.includes('collab') ? 'dashboard' : undefined
            }))
          );
        }
      }).catch(() => {});

      // Background load user collaborations
      supabaseService.getCollaborations().then((dbCollabs) => {
        if (dbCollabs && dbCollabs.length > 0) {
          setCollaborations(
            dbCollabs.map((c: any) => ({
              id: c.id,
              senderId: c.sender_id,
              senderName: c.sender?.full_name || c.sender?.username || 'Collaborator',
              senderEmail: c.sender_email || '',
              senderAvatar: c.sender?.avatar_url || '',
              receiverId: c.receiver_id,
              receiverName: c.receiver?.full_name || c.receiver?.username || 'Artist',
              projectTitle: c.project_title || 'Creative Collaboration',
              projectDescription: c.project_description || '',
              type: c.type || 'Commission',
              requiredSkills: c.required_skills || [],
              message: c.message,
              budget: c.budget || '',
              timeline: c.timeline || '',
              status: c.status,
              artworkId: c.artwork_id || undefined,
              opportunityId: c.opportunity_id || undefined,
              createdAt: c.created_at ? c.created_at.split('T')[0] : 'Recent'
            }))
          );
        }
      }).catch(() => {});

      return { user: userObj, profile: profile || null, role };
    } catch (err) {
      console.warn('[ARTVERSE] syncUserSession error:', err);
      return null;
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setIsAuthLoading(false);
      return;
    }

    let isMounted = true;
    let realtimeUnsubscribe: (() => void) | undefined;

    // Load initial database data
    loadDatabaseData();

    // Supabase project connection check
    supabaseService.pingConnection().then((status) => {
      if (status.connected) {
        console.info('[ARTVERSE] Connected to Supabase project successfully:', status.url);
      } else {
        console.warn('[ARTVERSE] Supabase connection check warning:', status.error);
      }
    }).catch((err) => {
      console.warn('[ARTVERSE] Supabase ping error:', err?.message || err);
    });

    // 1. Wait for getSession() on startup
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      if (session) {
        await syncUserSession(session);
        if (session.user && isMounted) {
          realtimeUnsubscribe = supabaseService.subscribeToUserEvents(session.user.id, {
            onNotification: (notif) => {
              notify(`New notification: ${notif.title}`, 'info');
              setNotifications((prev) => [
                {
                  id: notif.id,
                  title: notif.title,
                  message: notif.message || '',
                  time: 'Just now',
                  type: (notif.type as any) || 'system',
                  read: notif.is_read || false,
                  link: notif.type?.includes('collab') ? 'dashboard' : undefined
                },
                ...prev.filter((n) => n.id !== notif.id)
              ]);
            },
            onCollaboration: () => {
              notify('Collaboration request updated!', 'success');
              supabaseService.getCollaborations().then((collabs) => {
                if (collabs && isMounted) {
                  setCollaborations(
                    collabs.map((c: any) => ({
                      id: c.id,
                      senderId: c.sender_id,
                      senderName: c.sender?.full_name || c.sender?.username || 'Collaborator',
                      senderEmail: c.sender_email || '',
                      senderAvatar: c.sender?.avatar_url || '',
                      receiverId: c.receiver_id,
                      receiverName: c.receiver?.full_name || c.receiver?.username || 'Artist',
                      projectTitle: c.project_title || 'Creative Collaboration',
                      projectDescription: c.project_description || '',
                      type: c.type || 'Commission',
                      requiredSkills: c.required_skills || [],
                      message: c.message,
                      budget: c.budget || '',
                      timeline: c.timeline || '',
                      status: c.status,
                      artworkId: c.artwork_id || undefined,
                      opportunityId: c.opportunity_id || undefined,
                      createdAt: c.created_at ? c.created_at.split('T')[0] : 'Recent'
                    }))
                  );
                }
              });
            }
          });
        }
      } else {
        setIsAuthLoading(false);
      }
    }).catch(() => {
      if (isMounted) setIsAuthLoading(false);
    });

    // 2. Subscribe to onAuthStateChange()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'PASSWORD_RECOVERY') {
        setCurrentPage('reset-password');
        setIsAuthLoading(false);
        return;
      }
      if (event === 'SIGNED_OUT') {
        setCurrentSession(null);
        setCurrentProfile(null);
        setCurrentRole(null);
        setCurrentUser(null);
        setPendingGoogleUser(null);
        setIsAuthLoading(false);
        return;
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        await syncUserSession(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (realtimeUnsubscribe) realtimeUnsubscribe();
    };
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('artverse_editorial_artists', JSON.stringify(artists));
  }, [artists]);

  useEffect(() => {
    localStorage.setItem('artverse_editorial_artworks', JSON.stringify(artworks));
  }, [artworks]);

  useEffect(() => {
    localStorage.setItem('artverse_editorial_collaborations', JSON.stringify(collaborations));
  }, [collaborations]);

  useEffect(() => {
    localStorage.setItem('artverse_editorial_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('artverse_editorial_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('artverse_liked_ids', JSON.stringify(likedArtworkIds));
  }, [likedArtworkIds]);

  useEffect(() => {
    localStorage.setItem('artverse_saved_artwork_ids', JSON.stringify(savedArtworkIds));
  }, [savedArtworkIds]);

  useEffect(() => {
    localStorage.setItem('artverse_saved_artist_ids', JSON.stringify(savedArtistIds));
  }, [savedArtistIds]);

  useEffect(() => {
    localStorage.setItem('artverse_saved_opp_ids', JSON.stringify(savedOpportunityIds));
  }, [savedOpportunityIds]);

  useEffect(() => {
    localStorage.setItem('artverse_followed_ids', JSON.stringify(followedArtistIds));
  }, [followedArtistIds]);

  const notify = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Refreshes the active session & profile directly from Supabase
   */
  const refreshAuthSession = async () => {
    await syncUserSession();
  };

  // Auth actions for demo accounts modal
  const loginAs = (type: 'ananya' | 'rahul' | 'explorer' | 'custom', customData?: any) => {
    if (type === 'ananya') {
      const ananya = artists.find((a) => a.id === 'artist-1') || INITIAL_ARTISTS[0];
      setCurrentUser(ananya);
      notify('Signed in as Ananya Rao (Artist)', 'success');
      setAuthModalOpen(false);
      return;
    }
    if (type === 'rahul') {
      const rahul = artists.find((a) => a.id === 'artist-2') || INITIAL_ARTISTS[1];
      setCurrentUser(rahul);
      notify('Signed in as Rahul Kumar (3D & Digital Artist)', 'success');
      setAuthModalOpen(false);
      return;
    }
    if (type === 'explorer') {
      const explorer = {
        id: 'user-explorer-1',
        name: 'Alex Rivera',
        email: 'alex.curator@artverse.demo',
        role: 'explorer' as UserRole,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'
      };
      setCurrentUser(explorer);
      notify('Signed in as Alex Rivera (Explorer & Curator)', 'success');
      setAuthModalOpen(false);
      return;
    }
    if (type === 'custom') {
      console.warn('[ARTVERSE] Mock custom auth fallback is disabled. Use Supabase authentication.');
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[ARTVERSE] SignOut error:', err);
      }
    }
    setCurrentSession(null);
    setCurrentProfile(null);
    setCurrentRole(null);
    setCurrentUser(null);
    setPendingGoogleUser(null);
    setIsAuthLoading(false);
    setSelectedArtistIdRaw(null);
    setSelectedArtworkIdRaw(null);
    setSelectedOpportunityId(null);
    localStorage.removeItem('artverse_editorial_user');
    setLikedArtworkIds([]);
    setSavedArtworkIds([]);
    setSavedArtistIds([]);
    setSavedOpportunityIds([]);
    setFollowedArtistIds([]);
    setCollaborations([]);
    setNotifications([]);
    setCurrentPage('login');
    notify('Signed out of ARTVERSE', 'info');
  };

  // Like & Save & Follow (Prompt sign-in when not authenticated)
  const toggleLikeArtwork = async (artworkId: string) => {
    if (!currentUser) {
      notify('Sign in to like this artwork', 'info');
      setCurrentPage('login');
      return;
    }
    const isLiked = likedArtworkIds.includes(artworkId);
    const targetArt = artworks.find((a) => a.id === artworkId);

    // Optimistic UI update
    setLikedArtworkIds((prev) =>
      isLiked ? prev.filter((id) => id !== artworkId) : [...prev, artworkId]
    );
    setArtworks((artList) =>
      artList.map((art) => {
        if (art.id === artworkId) {
          return {
            ...art,
            likesCount: isLiked ? Math.max(0, art.likesCount - 1) : art.likesCount + 1
          };
        }
        return art;
      })
    );
    notify(isLiked ? 'Removed from liked works' : 'Added to your liked works', isLiked ? 'info' : 'success');

    // Async sync with Supabase and rollback on error
    if (isSupabaseConfigured()) {
      try {
        if (isLiked) {
          await supabaseService.unlikeArtwork(artworkId);
        } else {
          await supabaseService.likeArtwork(artworkId);
          // Notify artwork owner
          if (targetArt && targetArt.artistId && targetArt.artistId !== currentUser.id) {
            supabaseService.createNotification({
              userId: targetArt.artistId,
              type: 'like',
              title: 'Artwork Liked',
              message: `${currentUser.name || 'Someone'} liked your artwork "${targetArt.title}".`
            }).catch(() => {});
          }
        }
      } catch (err: any) {
        console.warn('[ARTVERSE] Like sync error, rolling back:', err?.message || err);
        // Rollback state
        setLikedArtworkIds((prev) =>
          isLiked ? [...prev, artworkId] : prev.filter((id) => id !== artworkId)
        );
        setArtworks((artList) =>
          artList.map((art) => {
            if (art.id === artworkId) {
              return {
                ...art,
                likesCount: isLiked ? art.likesCount + 1 : Math.max(0, art.likesCount - 1)
              };
            }
            return art;
          })
        );
        notify('Failed to update like. Please try again.', 'error');
      }
    }
  };

  const toggleSaveArtwork = async (artworkId: string) => {
    if (!currentUser) {
      notify('Sign in to save this artwork to your collection', 'info');
      setCurrentPage('login');
      return;
    }
    const isSaved = savedArtworkIds.includes(artworkId);

    // Optimistic UI update
    setSavedArtworkIds((prev) =>
      isSaved ? prev.filter((id) => id !== artworkId) : [...prev, artworkId]
    );
    setArtworks((artList) =>
      artList.map((art) => {
        if (art.id === artworkId) {
          return {
            ...art,
            savesCount: isSaved ? Math.max(0, art.savesCount - 1) : art.savesCount + 1
          };
        }
        return art;
      })
    );
    notify(isSaved ? 'Removed from saved collection' : 'Artwork saved to collection', 'info');

    // Async sync with Supabase and rollback on error
    if (isSupabaseConfigured()) {
      try {
        if (isSaved) {
          await supabaseService.unsaveItem({ artworkId });
        } else {
          await supabaseService.saveItem({ artworkId });
        }
      } catch (err: any) {
        console.warn('[ARTVERSE] Save artwork sync error, rolling back:', err?.message || err);
        // Rollback state
        setSavedArtworkIds((prev) =>
          isSaved ? [...prev, artworkId] : prev.filter((id) => id !== artworkId)
        );
        setArtworks((artList) =>
          artList.map((art) => {
            if (art.id === artworkId) {
              return {
                ...art,
                savesCount: isSaved ? art.savesCount + 1 : Math.max(0, art.savesCount - 1)
              };
            }
            return art;
          })
        );
        notify('Failed to update saved collection. Please try again.', 'error');
      }
    }
  };

  const toggleSaveArtist = async (artistId: string) => {
    if (!currentUser) {
      notify('Sign in to save this artist to your collection', 'info');
      setCurrentPage('login');
      return;
    }
    const isSaved = savedArtistIds.includes(artistId);
    const target = artists.find((a) => a.id === artistId);

    // Optimistic UI update
    setSavedArtistIds((prev) =>
      isSaved ? prev.filter((id) => id !== artistId) : [...prev, artistId]
    );
    notify(isSaved ? `Removed ${target?.name || 'artist'} from saved` : `Saved ${target?.name || 'artist'} to collection`, 'info');

    // Async sync with Supabase and rollback on error
    if (isSupabaseConfigured()) {
      try {
        if (isSaved) {
          await supabaseService.unsaveItem({ artistId });
        } else {
          await supabaseService.saveItem({ artistId });
        }
      } catch (err: any) {
        console.warn('[ARTVERSE] Save artist sync error, rolling back:', err?.message || err);
        setSavedArtistIds((prev) =>
          isSaved ? [...prev, artistId] : prev.filter((id) => id !== artistId)
        );
        notify('Failed to update saved artist. Please try again.', 'error');
      }
    }
  };

  const toggleSaveOpportunity = async (oppId: string) => {
    if (!currentUser) {
      notify('Sign in to save this opportunity', 'info');
      setCurrentPage('login');
      return;
    }
    const isSaved = savedOpportunityIds.includes(oppId);

    // Optimistic UI update
    setSavedOpportunityIds((prev) =>
      isSaved ? prev.filter((id) => id !== oppId) : [...prev, oppId]
    );
    notify(isSaved ? 'Removed from saved opportunities' : 'Opportunity saved to collection', 'info');

    // Async sync with Supabase and rollback on error
    if (isSupabaseConfigured()) {
      try {
        if (isSaved) {
          await supabaseService.unsaveItem({ opportunityId: oppId });
        } else {
          await supabaseService.saveItem({ opportunityId: oppId });
        }
      } catch (err: any) {
        console.warn('[ARTVERSE] Save opportunity sync error, rolling back:', err?.message || err);
        setSavedOpportunityIds((prev) =>
          isSaved ? [...prev, oppId] : prev.filter((id) => id !== oppId)
        );
        notify('Failed to update saved opportunity. Please try again.', 'error');
      }
    }
  };

  const toggleFollowArtist = async (artistId: string) => {
    if (!currentUser) {
      notify('Sign in to follow this artist', 'info');
      setCurrentPage('login');
      return;
    }

    // Prevent self-follow
    if (currentUser.id === artistId) {
      notify('You cannot follow your own artist profile', 'info');
      return;
    }

    const isFollowed = followedArtistIds.includes(artistId);
    const target = artists.find((a) => a.id === artistId);

    // Optimistic UI update
    setFollowedArtistIds((prev) =>
      isFollowed ? prev.filter((id) => id !== artistId) : [...prev, artistId]
    );

    setArtists((list) =>
      list.map((artist) => {
        if (artist.id === artistId) {
          return {
            ...artist,
            followersCount: isFollowed ? Math.max(0, artist.followersCount - 1) : artist.followersCount + 1
          };
        }
        return artist;
      })
    );
    notify(isFollowed ? `Unfollowed ${target?.name || 'artist'}` : `Now following ${target?.name || 'artist'}`, 'success');

    // Async sync with Supabase and rollback on error
    if (isSupabaseConfigured()) {
      try {
        if (isFollowed) {
          await supabaseService.unfollowArtist(artistId);
        } else {
          await supabaseService.followArtist(artistId);
          if (artistId !== currentUser.id) {
            supabaseService.createNotification({
              userId: artistId,
              type: 'follow',
              title: 'New Follower',
              message: `${currentUser.name || 'Someone'} started following you.`
            }).catch(() => {});
          }
        }
      } catch (err: any) {
        console.warn('[ARTVERSE] Follow sync error, rolling back:', err?.message || err);
        // Rollback state
        setFollowedArtistIds((prev) =>
          isFollowed ? [...prev, artistId] : prev.filter((id) => id !== artistId)
        );
        setArtists((list) =>
          list.map((artist) => {
            if (artist.id === artistId) {
              return {
                ...artist,
                followersCount: isFollowed ? artist.followersCount + 1 : Math.max(0, artist.followersCount - 1)
              };
            }
            return artist;
          })
        );
        notify('Failed to update follow status. Please try again.', 'error');
      }
    }
  };

  // Add artwork
  const addArtwork = async (artworkData: Omit<Artwork, 'id' | 'likesCount' | 'savesCount' | 'viewsCount' | 'commentsCount' | 'createdAt'>) => {
    let finalId = `art-${Date.now()}`;

    if (isSupabaseConfigured() && currentUser) {
      try {
        const createdRow = await supabaseService.createArtwork({
          title: artworkData.title,
          description: artworkData.description,
          medium: artworkData.medium,
          category: artworkData.category,
          imageUrl: artworkData.imageUrl
        });
        if (createdRow) {
          finalId = createdRow.id;
        }
      } catch (err: any) {
        console.warn('Artwork DB insert notification:', err.message);
      }
    }

    const newArt: Artwork = {
      ...artworkData,
      id: finalId,
      likesCount: 0,
      savesCount: 0,
      viewsCount: 1,
      commentsCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setArtworks((prev) => [newArt, ...prev]);
    notify(`Artwork "${newArt.title}" successfully published!`, 'success');
  };

  // Update artwork
  const updateArtwork = async (artworkId: string, updates: Partial<Artwork>) => {
    setArtworks((prev) =>
      prev.map((art) => (art.id === artworkId ? { ...art, ...updates } : art))
    );

    if (isSupabaseConfigured() && currentUser) {
      try {
        await supabaseService.updateArtwork(artworkId, {
          title: updates.title,
          description: updates.description,
          medium: updates.medium,
          category: updates.category,
          imageUrl: updates.imageUrl
        });
      } catch (err: any) {
        console.warn('Artwork DB update notice:', err.message);
      }
    }

    notify('Artwork updated successfully', 'success');
  };

  // Delete artwork
  const deleteArtwork = async (artworkId: string) => {
    const target = artworks.find((a) => a.id === artworkId);
    setArtworks((prev) => prev.filter((art) => art.id !== artworkId));

    if (isSupabaseConfigured() && currentUser) {
      try {
        await supabaseService.deleteArtwork(artworkId, target?.imageUrl);
      } catch (err: any) {
        console.warn('Artwork DB delete notice:', err.message);
      }
    }

    notify('Artwork removed from portfolio', 'info');
  };

  // Update artist profile
  const updateArtistProfile = (artistId: string, updates: Partial<Artist>) => {
    setArtists((prev) =>
      prev.map((artist) => {
        if (artist.id === artistId) {
          return { ...artist, ...updates };
        }
        return artist;
      })
    );

    if (currentUser && currentUser.id === artistId) {
      setCurrentUser((prev: any) => ({ ...prev, ...updates }));
    }

    notify('Profile updated successfully', 'success');
  };

  // Upload Profile Avatar
  const uploadAvatar = async (file: File): Promise<string> => {
    if (!currentUser) throw new Error('Please sign in to upload your profile image');
    const { publicUrl } = await storageService.uploadProfileAvatar(file, currentUser.id);

    setCurrentUser((prev: any) => (prev ? { ...prev, avatar: publicUrl } : prev));
    setArtists((prev) =>
      prev.map((a) => (a.id === currentUser.id ? { ...a, avatar: publicUrl } : a))
    );

    notify('Profile picture updated successfully', 'success');
    return publicUrl;
  };

  // Delete Profile Avatar
  const deleteAvatar = async () => {
    if (!currentUser) return;
    const currentAvatar = (currentUser as any).avatar;
    await storageService.deleteProfileAvatar(currentUser.id, currentAvatar);

    const fallbackAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    setCurrentUser((prev: any) => (prev ? { ...prev, avatar: fallbackAvatar } : prev));
    setArtists((prev) =>
      prev.map((a) => (a.id === currentUser.id ? { ...a, avatar: fallbackAvatar } : a))
    );

    notify('Profile picture removed', 'info');
  };

  // Upload Cover Image
  const uploadCover = async (file: File): Promise<string> => {
    if (!currentUser) throw new Error('Please sign in to upload your cover image');
    const { publicUrl } = await storageService.uploadCoverImage(file, currentUser.id);

    setCurrentUser((prev: any) => (prev ? { ...prev, coverImage: publicUrl } : prev));
    setArtists((prev) =>
      prev.map((a) => (a.id === currentUser.id ? { ...a, coverImage: publicUrl } : a))
    );

    notify('Cover image updated successfully', 'success');
    return publicUrl;
  };

  // Delete Cover Image
  const deleteCover = async () => {
    if (!currentUser) return;
    const currentCover = (currentUser as any).coverImage;
    await storageService.deleteCoverImage(currentUser.id, currentCover);

    const fallbackCover = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80';
    setCurrentUser((prev: any) => (prev ? { ...prev, coverImage: fallbackCover } : prev));
    setArtists((prev) =>
      prev.map((a) => (a.id === currentUser.id ? { ...a, coverImage: fallbackCover } : a))
    );

    notify('Cover image reset to default', 'info');
  };

  // Collaboration
  const sendCollaboration = async (reqData: Omit<CollaborationRequest, 'id' | 'status' | 'createdAt'>) => {
    if (!currentUser) {
      notify('Sign in to submit a collaboration proposal', 'info');
      setCurrentPage('login');
      return;
    }

    // Prevent self-collaboration
    if (currentUser.id === reqData.receiverId) {
      notify('You cannot send a collaboration request to yourself', 'info');
      return;
    }

    // Prevent duplicate active pending requests
    const existingActive = collaborations.find(
      (c) =>
        (c.senderId === currentUser.id || c.senderEmail === currentUser.email) &&
        c.receiverId === reqData.receiverId &&
        c.status === 'pending'
    );
    if (existingActive) {
      notify('You already have an active collaboration request with this artist', 'info');
      return;
    }

    const tempId = `collab-${Date.now()}`;
    const newCollab: CollaborationRequest = {
      ...reqData,
      senderId: currentUser.id,
      id: tempId,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCollaborations((prev) => [newCollab, ...prev]);

    // Notification for sender
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'collaboration',
      title: 'New Collaboration Proposal Sent',
      message: `Proposal for "${newCollab.projectTitle}" submitted to artist.`,
      time: 'Just now',
      read: false,
      link: 'dashboard'
    };
    setNotifications((prev) => [newNotif, ...prev]);

    notify(`Collaboration proposal sent for "${newCollab.projectTitle}"`, 'success');

    // Supabase DB creation
    if (isSupabaseConfigured()) {
      try {
        const res = await supabaseService.createCollaborationRequest({
          receiverId: reqData.receiverId,
          message: reqData.message,
          artworkId: reqData.artworkId,
          opportunityId: reqData.opportunityId
        });

        if (res?.data) {
          setCollaborations((prev) =>
            prev.map((c) => (c.id === tempId ? { ...c, id: res.data.id } : c))
          );
        }

        // Notify recipient User B
        supabaseService.createNotification({
          userId: reqData.receiverId,
          type: 'collaboration',
          title: 'Collaboration Proposal Received',
          message: `${currentUser.name || 'A creator'} sent you a collaboration request.`
        }).catch(() => {});
      } catch (err: any) {
        console.warn('[ARTVERSE] Remote collaboration request notice:', err?.message || err);
      }
    }
  };

  const updateCollabStatus = async (collabId: string, status: 'accepted' | 'declined' | 'rejected') => {
    const normalizedStatus: 'accepted' | 'rejected' = status === 'accepted' ? 'accepted' : 'rejected';
    const target = collaborations.find((c) => c.id === collabId);

    // Optimistic UI update
    setCollaborations((prev) =>
      prev.map((collab) => {
        if (collab.id === collabId) {
          return { ...collab, status: normalizedStatus };
        }
        return collab;
      })
    );

    const isAccepted = normalizedStatus === 'accepted';
    if (isAccepted) {
      const activeNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        type: 'collab_accepted',
        title: 'COLLABORATION ACTIVE',
        message: `Collaboration "${target?.projectTitle || 'Project'}" is now active!`,
        time: 'Just now',
        read: false,
        link: 'dashboard'
      };
      setNotifications((prev) => [activeNotif, ...prev]);
    }

    notify(`Collaboration request ${isAccepted ? 'accepted' : 'declined'}`, isAccepted ? 'success' : 'info');

    // Supabase DB update
    if (isSupabaseConfigured()) {
      try {
        await supabaseService.updateCollaborationStatus(collabId, normalizedStatus);

        // Notify sender User A
        if (target && target.senderId && target.senderId !== currentUser?.id) {
          const artistName = currentUser?.name || 'The artist';
          supabaseService.createNotification({
            userId: target.senderId,
            type: isAccepted ? 'collaboration_accepted' : 'collaboration_rejected',
            title: isAccepted ? 'Collaboration Accepted' : 'Collaboration Request Update',
            message: isAccepted
              ? `Your collaboration request was accepted by ${artistName}.`
              : 'Your collaboration request was declined.'
          }).catch(() => {});
        }
      } catch (err: any) {
        console.warn('[ARTVERSE] Remote collaboration status sync notice:', err?.message || err);
      }
    }
  };

  // Comments
  const addComment = async (artworkId: string, text: string) => {
    if (!text.trim()) return;
    if (!currentUser) {
      notify('Sign in to leave a comment', 'info');
      setCurrentPage('login');
      return;
    }

    const tempId = `comm-${Date.now()}`;
    const authorName = currentUser.name || 'Art Explorer';
    const authorAvatar = currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
    const authorId = currentUser.id;

    const newComment: Comment = {
      id: tempId,
      artworkId,
      userId: authorId,
      userName: authorName,
      userAvatar: authorAvatar,
      text: text.trim(),
      createdAt: 'Just now'
    };

    setComments((prev) => [...prev, newComment]);

    setArtworks((artList) =>
      artList.map((art) => {
        if (art.id === artworkId) {
          return { ...art, commentsCount: art.commentsCount + 1 };
        }
        return art;
      })
    );

    if (isSupabaseConfigured()) {
      try {
        const created = await supabaseService.createComment(artworkId, text.trim());
        if (created) {
          setComments((prev) => prev.map((c) => (c.id === tempId ? created : c)));
        }

        // Notify artwork owner
        const targetArt = artworks.find((a) => a.id === artworkId);
        if (targetArt && targetArt.artistId && targetArt.artistId !== currentUser.id) {
          supabaseService.createNotification({
            userId: targetArt.artistId,
            type: 'comment',
            title: 'New Comment',
            message: `${currentUser.name || 'Someone'} commented on your artwork "${targetArt.title}".`
          }).catch(() => {});
        }
      } catch (err: any) {
        console.warn('[ARTVERSE] Remote comment insert error:', err?.message || err);
      }
    }

    notify('Comment added', 'success');
  };

  const updateComment = async (commentId: string, text: string) => {
    if (!text.trim()) return;
    if (!currentUser) {
      notify('Sign in to edit your comment', 'info');
      setCurrentPage('login');
      return;
    }

    const previous = comments.find((c) => c.id === commentId);
    if (!previous) return;
    if (previous.userId !== currentUser.id) {
      notify('You can only edit your own comments', 'error');
      return;
    }

    // Optimistic update
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, text: text.trim() } : c))
    );

    if (isSupabaseConfigured()) {
      try {
        await supabaseService.updateComment(commentId, text.trim());
      } catch (err: any) {
        console.warn('[ARTVERSE] Comment update error, rolling back:', err?.message || err);
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? previous : c))
        );
        notify('Failed to update comment on server', 'error');
        return;
      }
    }

    notify('Comment updated', 'success');
  };

  const deleteComment = async (commentId: string) => {
    if (!currentUser) {
      notify('Sign in to delete your comment', 'info');
      setCurrentPage('login');
      return;
    }

    const target = comments.find((c) => c.id === commentId);
    if (!target) return;
    if (target.userId !== currentUser.id) {
      notify('You can only delete your own comments', 'error');
      return;
    }

    // Optimistic delete
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setArtworks((artList) =>
      artList.map((art) =>
        art.id === target.artworkId
          ? { ...art, commentsCount: Math.max(0, art.commentsCount - 1) }
          : art
      )
    );

    if (isSupabaseConfigured()) {
      try {
        await supabaseService.deleteComment(commentId);
      } catch (err: any) {
        console.warn('[ARTVERSE] Comment delete error, rolling back:', err?.message || err);
        setComments((prev) => [...prev, target]);
        notify('Failed to delete comment on server', 'error');
        return;
      }
    }

    notify('Comment deleted', 'info');
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (isSupabaseConfigured()) {
      supabaseService.markNotificationAsRead(id).catch(() => {});
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notify('All notifications marked as read', 'info');
    if (isSupabaseConfigured()) {
      supabaseService.markAllNotificationsAsRead().catch(() => {});
    }
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const viewArtistProfile = (artistId: string) => {
    setSelectedArtistId(artistId);
    setSelectedArtworkId(null);
    setCurrentPage('artists');
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.pathname = '/artists';
        url.searchParams.set('artist', artistId);
        url.searchParams.delete('artwork');
        url.searchParams.delete('artworkId');
        window.history.pushState(null, '', url.pathname + url.search);
      } catch {}
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewArtworkDetail = (artworkId: string) => {
    setSelectedArtworkId(artworkId);
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('artwork', artworkId);
        window.history.pushState(null, '', url.pathname + (url.search || ''));
      } catch {}
    }
  };

  const viewOpportunityDetail = (oppId: string) => {
    setSelectedOpportunityId(oppId);
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedArtistId,
        setSelectedArtistId,
        selectedArtworkId,
        setSelectedArtworkId,
        selectedOpportunityId,
        setSelectedOpportunityId,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        locationFilter,
        setLocationFilter,
        availabilityFilter,
        setAvailabilityFilter,
        currentUser,
        artists,
        artworks,
        opportunities,
        collaborations,
        comments,
        notifications,
        unreadNotificationCount,
        likedArtworkIds,
        savedArtworkIds,
        savedArtistIds,
        savedOpportunityIds,
        followedArtistIds,
        loginAs,
        logout,
        toggleLikeArtwork,
        toggleSaveArtwork,
        toggleSaveArtist,
        toggleSaveOpportunity,
        toggleFollowArtist,
        addArtwork,
        updateArtwork,
        deleteArtwork,
        updateArtistProfile,
        uploadAvatar,
        deleteAvatar,
        uploadCover,
        deleteCover,
        editingArtwork,
        setEditingArtwork,
        sendCollaboration,
        updateCollabStatus,
        addComment,
        updateComment,
        deleteComment,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        authModalOpen,
        setAuthModalOpen,
        uploadModalOpen,
        setUploadModalOpen,
        aiPortfolioModalOpen,
        setAiPortfolioModalOpen,
        aiMatchModalOpen,
        setAiMatchModalOpen,
        aiOpportunityModalOpen,
        setAiOpportunityModalOpen,
        collabModalTargetArtist,
        setCollabModalTargetArtist,
        toasts,
        notify,
        dismissToast,
        viewArtistProfile,
        viewArtworkDetail,
        viewOpportunityDetail,
        authLoading: isAuthLoading,
        isAuthLoading,
        currentSession,
        currentProfile,
        currentRole,
        supabaseConfigured,
        isDataLoading,
        dataError,
        refreshData,
        pendingGoogleUser,
        setPendingGoogleUser,
        refreshAuthSession,
        syncUserSession
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
