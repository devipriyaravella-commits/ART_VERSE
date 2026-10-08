import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArtistCard } from '../components/cards/ArtistCard';
import { ArtworkCard } from '../components/cards/ArtworkCard';
import { supabaseService } from '../services/supabaseService';
import { Artist, Artwork } from '../types';
import {
  Users,
  MapPin,
  Sparkles,
  UserCheck,
  UserPlus,
  Share2,
  Handshake,
  Award,
  Globe,
  Instagram,
  ArrowLeft,
  Calendar,
  Layers,
  Bookmark,
  Camera,
  Loader2,
  Trash2,
  RefreshCw
} from 'lucide-react';

export const ArtistsPage: React.FC = () => {
  const {
    artists,
    artworks,
    selectedArtistId,
    setSelectedArtistId,
    followedArtistIds,
    toggleFollowArtist,
    savedArtistIds,
    toggleSaveArtist,
    setCollabModalTargetArtist,
    currentUser,
    uploadAvatar,
    deleteAvatar,
    uploadCover,
    deleteCover,
    notify,
    isDataLoading,
    dataError,
    refreshData,
    currentPage
  } = useApp();

  const [portfolioTab, setPortfolioTab] = useState<'all' | 'selected'>('all');
  const [filterCategory, setFilterCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | 'Available' | 'Busy' | 'Upcoming'>('All');
  const [artistSort, setArtistSort] = useState<'availability' | 'followers' | 'views' | 'name' | 'featured'>('availability');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // All artists listing when none is selected (strictly deduplicated) - declared before any conditional returns
  const deduplicatedArtists = React.useMemo(() => {
    const seen = new Set<string>();
    const list: typeof artists = [];
    for (const a of artists) {
      const key = (a.name || '').toLowerCase().trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        list.push(a);
      }
    }
    return list;
  }, [artists]);

  // Dedicated Supabase data hook for real profile & stored artworks
  const [remoteArtist, setRemoteArtist] = useState<Artist | null>(null);
  const [remoteArtworks, setRemoteArtworks] = useState<Artwork[] | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Effective artist ID: from selectedArtistId, or if on 'profile' page from currentUser
  const effectiveArtistId = selectedArtistId || (currentPage === 'profile' && currentUser ? currentUser.id : null);

  // Local artist fallback from context or current user
  const localArtist = effectiveArtistId
    ? artists.find((a) => a.id === effectiveArtistId) ||
      (currentUser && currentUser.id === effectiveArtistId ? (currentUser as Artist) : null)
    : null;

  // Active artist strictly matches the effectiveArtistId
  const activeArtist = (remoteArtist && remoteArtist.id === effectiveArtistId) ? remoteArtist : localArtist;

  useEffect(() => {
    setRemoteArtist(null);
    setRemoteArtworks(null);

    if (!effectiveArtistId) {
      setIsProfileLoading(false);
      return;
    }

    let isMounted = true;
    if (!localArtist) {
      setIsProfileLoading(true);
    }

    supabaseService.getArtistProfileWithArtworks(effectiveArtistId).then((res) => {
      if (!isMounted) return;
      if (res && res.artist) {
        setRemoteArtist(res.artist);
        if (res.artworks && res.artworks.length > 0) {
          setRemoteArtworks(res.artworks);
        }
      }
      setIsProfileLoading(false);
    }).catch((err) => {
      console.warn('[ARTVERSE] Error loading artist profile from Supabase:', err);
      if (isMounted) setIsProfileLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [effectiveArtistId]);

  // If loading a profile with no local fallback yet
  if (effectiveArtistId && isProfileLoading && !activeArtist) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#8B3A4A] animate-spin" />
        <p className="text-xs uppercase tracking-widest text-[#666666] font-semibold">
          Loading creator profile...
        </p>
      </div>
    );
  }

  // If an artist was requested but not found anywhere
  if (effectiveArtistId && !isProfileLoading && !activeArtist) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F2E5E8] border border-[#E8D3D8] text-[#8B3A4A] flex items-center justify-center mx-auto">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="font-serif-headline text-3xl font-normal text-gray-900">
          Artist Profile Not Found
        </h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          The requested creator profile could not be loaded or may have been removed.
        </p>
        <button
          onClick={() => setSelectedArtistId(null)}
          className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#8B3A4A] text-white hover:bg-[#732D3B] transition-all cursor-pointer shadow-xs"
        >
          Back to Artists Network
        </button>
      </div>
    );
  }

  if (activeArtist) {
    const isFollowed = followedArtistIds.includes(activeArtist.id);
    const isSaved = savedArtistIds.includes(activeArtist.id);
    const isOwnProfile = currentUser && (currentUser.id === activeArtist.id || (currentUser.role === 'artist' && currentUser.name === activeArtist.name));
    
    // Use stored Supabase artworks if available, falling back to context artworks
    const artistArtworks = remoteArtworks || artworks.filter((art) => art.artistId === activeArtist.id);
    const displayedArtworks =
      portfolioTab === 'selected'
        ? artistArtworks.filter((a) => a.isFeatured)
        : artistArtworks;

    const handleShare = () => {
      if (navigator.clipboard) {
        const shareUrl = new URL(window.location.origin + '/artists');
        shareUrl.searchParams.set('artist', activeArtist.id);
        navigator.clipboard.writeText(shareUrl.toString());
        notify(`Copied profile link for ${activeArtist.name}`, 'success');
      }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploadingCover(true);
      try {
        await uploadCover(file);
      } catch (err: any) {
        notify(err.message || 'Failed to upload cover image', 'error');
      } finally {
        setIsUploadingCover(false);
        e.target.value = '';
      }
    };

    const handleCoverDelete = async () => {
      try {
        await deleteCover();
      } catch (err: any) {
        notify('Failed to reset cover image', 'error');
      }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploadingAvatar(true);
      try {
        await uploadAvatar(file);
      } catch (err: any) {
        notify(err.message || 'Failed to upload profile picture', 'error');
      } finally {
        setIsUploadingAvatar(false);
        e.target.value = '';
      }
    };

    const handleAvatarDelete = async () => {
      try {
        await deleteAvatar();
      } catch (err: any) {
        notify('Failed to remove profile picture', 'error');
      }
    };

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-in fade-in bg-[#FAFAF8]">
        {/* Back navigation */}
        <button
          onClick={() => setSelectedArtistId(null)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#8B3A4A] bg-white px-4 py-2 rounded-full border border-[#E7E7E4] hover:border-[#E8D3D8] transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Artists Network</span>
        </button>

        {/* Large Editorial Cover & Hero Presentation */}
        <div className="rounded-3xl overflow-hidden bg-white border border-[#E7E7E4] relative shadow-sm">
          <div className="h-72 sm:h-96 w-full overflow-hidden bg-gray-100 relative group">
            <img
              src={activeArtist.coverImage}
              alt={activeArtist.name}
              className="w-full h-full object-cover"
              onError={(e: any) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent" />

            {/* Owner Cover Controls */}
            {isOwnProfile && (
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <label className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/95 hover:bg-white text-gray-800 shadow-md backdrop-blur-md border border-[#E7E7E4] cursor-pointer flex items-center gap-1.5 transition-all">
                  {isUploadingCover ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B3A4A]" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-[#8B3A4A]" />
                  )}
                  <span>{isUploadingCover ? 'Uploading Cover...' : 'Change Cover'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverUpload}
                    className="hidden"
                    disabled={isUploadingCover}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleCoverDelete}
                  title="Reset cover to default"
                  className="p-2 rounded-full bg-white/95 hover:bg-white text-gray-600 hover:text-rose-600 shadow-md backdrop-blur-md border border-[#E7E7E4] cursor-pointer transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Profile Details Header */}
          <div className="px-6 sm:px-12 pb-10 pt-0 -mt-20 sm:-mt-24 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              {/* Avatar & Identification */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                <div className="relative group">
                  <img
                    src={activeArtist.avatar}
                    alt={activeArtist.name}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white"
                    onError={(e: any) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <span className="absolute -bottom-2 -right-2 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8] shadow-xs">
                    {activeArtist.availability}
                  </span>

                  {/* Owner Avatar Controls */}
                  {isOwnProfile && (
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <label
                        className="p-2 rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-[#8B3A4A] border border-[#E7E7E4] shadow-md cursor-pointer transition-all"
                        title="Upload new profile picture"
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B3A4A]" />
                        ) : (
                          <Camera className="w-3.5 h-3.5 text-[#8B3A4A]" />
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={isUploadingAvatar}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleAvatarDelete}
                        title="Remove profile picture"
                        className="p-2 rounded-full bg-white/95 hover:bg-white text-gray-700 hover:text-rose-600 border border-[#E7E7E4] shadow-md cursor-pointer transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="font-serif-headline text-3xl sm:text-5xl font-normal text-gray-900 leading-tight">
                      {activeArtist.name}
                    </h1>
                    {activeArtist.isFeatured && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8]">
                        Featured Creator
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#8B3A4A]">
                    {activeArtist.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{activeArtist.location}</span>
                    <span>•</span>
                    <span className="text-gray-900 font-medium">{activeArtist.category}</span>
                    <span>•</span>
                    <span className="capitalize">{activeArtist.experience}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Pink & White) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => toggleFollowArtist(activeArtist.id)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                    isFollowed
                      ? 'bg-[#F2E5E8] text-[#8B3A4A] border-[#E8D3D8] shadow-xs'
                      : 'bg-white hover:bg-[#F2E5E8]/50 hover:border-[#E8D3D8] text-gray-800 border-[#E7E7E4] shadow-xs'
                  }`}
                >
                  {isFollowed ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-[#8B3A4A]" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 text-gray-600" />
                      <span>Follow</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleSaveArtist(activeArtist.id)}
                  className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-[#8B3A4A] text-white border-[#8B3A4A] shadow-xs'
                      : 'bg-white hover:bg-[#F2E5E8] text-gray-600 hover:text-[#8B3A4A] border-[#E7E7E4] shadow-xs'
                  }`}
                  title={isSaved ? 'Saved in collection' : 'Save artist'}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => setCollabModalTargetArtist(activeArtist)}
                  className="px-5 py-2.5 rounded-full font-bold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-md shadow-[#8B3A4A]/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Handshake className="w-4 h-4" />
                  <span>Collaborate</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-white hover:bg-[#F2E5E8] border border-[#E7E7E4] hover:border-[#E8D3D8] text-gray-600 hover:text-[#8B3A4A] transition-colors shadow-xs cursor-pointer"
                  title="Share profile"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Performance Stats Bar */}
            <div className="mt-8 pt-6 border-t border-[#E7E7E4] grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-[#E7E7E4]">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                  Followers
                </span>
                <span className="font-serif-headline text-2xl font-normal text-gray-900">
                  {activeArtist.followersCount.toLocaleString()}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-[#E7E7E4]">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                  Portfolio Views
                </span>
                <span className="font-serif-headline text-2xl font-normal text-[#8B3A4A]">
                  {activeArtist.profileViews.toLocaleString()}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-[#E7E7E4]">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                  Artwork Count
                </span>
                <span className="font-serif-headline text-2xl font-normal text-gray-900">
                  {artistArtworks.length} Works
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-[#E7E7E4]">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                  Growth Velocity
                </span>
                <span className="font-serif-headline text-2xl font-normal text-emerald-600">
                  {activeArtist.viewsGrowth}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative & Selected Works */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Bio & Statement */}
          <div className="lg:col-span-4 space-y-6">
            <div className="editorial-card p-6 bg-white border border-[#E7E7E4] space-y-4 shadow-sm">
              <h3 className="font-serif-headline text-2xl font-normal text-gray-900">
                Artist Statement
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">
                "{activeArtist.statement}"
              </p>
            </div>

            <div className="editorial-card p-6 bg-white border border-[#E7E7E4] space-y-4 shadow-sm">
              <h3 className="font-serif-headline text-2xl font-normal text-gray-900">
                Biography
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {activeArtist.bio}
              </p>

              <div className="pt-2 border-t border-gray-100">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Skills & Techniques
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeArtist.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-[#E7E7E4]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {activeArtist.achievements.length > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                    Key Milestones
                  </span>
                  <ul className="space-y-1.5">
                    {activeArtist.achievements.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
                        <Award className="w-3.5 h-3.5 text-[#8B3A4A] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Works / Portfolio Gallery */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#E7E7E4] pb-4">
              <h3 className="font-serif-headline text-3xl font-normal text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#8B3A4A]" />
                <span>Selected Works ({displayedArtworks.length})</span>
              </h3>

              <div className="flex items-center p-1 rounded-full bg-gray-100 border border-[#E7E7E4] text-xs">
                <button
                  onClick={() => setPortfolioTab('all')}
                  className={`px-3.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                    portfolioTab === 'all' ? 'bg-[#8B3A4A] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Works
                </button>
                <button
                  onClick={() => setPortfolioTab('selected')}
                  className={`px-3.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                    portfolioTab === 'selected' ? 'bg-[#8B3A4A] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Curator Selected
                </button>
              </div>
            </div>

            {displayedArtworks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {displayedArtworks.map((art) => (
                  <ArtworkCard key={art.id} artwork={art} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 rounded-3xl bg-white border border-[#E7E7E4] shadow-xs">
                <p className="text-xs text-gray-400">No works in this category filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // All artists listing when none is selected

  const filtered = deduplicatedArtists.filter((a) => {
    if (filterCategory !== 'All' && a.category !== filterCategory) return false;
    if (availabilityFilter !== 'All') {
      if (availabilityFilter === 'Available' && a.availability !== 'Available') return false;
      if (availabilityFilter === 'Busy' && a.availability !== 'Busy') return false;
      if (availabilityFilter === 'Upcoming' && !a.availability.toLowerCase().includes('from')) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (artistSort === 'availability') {
      const getRank = (avail: string) => {
        if (avail === 'Available') return 1;
        if (avail.toLowerCase().includes('from')) return 2;
        return 3; // Busy
      };
      return getRank(a.availability) - getRank(b.availability);
    }
    if (artistSort === 'followers') return (b.followersCount || 0) - (a.followersCount || 0);
    if (artistSort === 'views') return (b.profileViews || 0) - (a.profileViews || 0);
    if (artistSort === 'name') return a.name.localeCompare(b.name);
    if (artistSort === 'featured') {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FAFAF8]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#8B3A4A] block mb-2">
            Creator Roster
          </span>
          <h1 className="font-serif-headline text-4xl sm:text-6xl font-normal text-[#111111]">
            Artists of ARTVERSE
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] mt-1 max-w-xl font-sans">
            Meet emerging and local voices spanning visual arts, documentary photography, sound design, and contemporary craft.
          </p>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-semibold text-gray-500">Sort by:</span>
          <select
            value={artistSort}
            onChange={(e) => setArtistSort(e.target.value as any)}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white border border-[#E7E7E4] text-gray-900 outline-none focus:border-[#8B3A4A] cursor-pointer shadow-xs"
          >
            <option value="availability">⚡ Sort: Available First</option>
            <option value="featured">✨ Curator Featured</option>
            <option value="followers">👥 Most Followers</option>
            <option value="views">👁️ Most Profile Views</option>
            <option value="name">🔤 Name (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Filter Toolbar: Categories & Availability */}
      <div className="editorial-card p-4 sm:p-5 bg-white border border-[#E7E7E4] space-y-3 shadow-xs">
        {/* Category Tabs */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
            Disciplines
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {['All', 'Visual Art', 'Photography', 'Music', 'Design', '3D / Animation', 'Film'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-[#8B3A4A] text-white shadow-xs'
                    : 'bg-gray-50 hover:bg-[#F2E5E8] hover:border-[#E8D3D8] hover:text-[#8B3A4A] text-gray-600 border border-[#E7E7E4]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Availability Filter Pills */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1.5 shrink-0">
              Availability:
            </span>
            {[
              { id: 'All', label: 'All Availability' },
              { id: 'Available', label: '🟢 Available Now' },
              { id: 'Busy', label: '🟡 Busy on Project' },
              { id: 'Upcoming', label: '📅 Available Soon' }
            ].map((avail) => (
              <button
                key={avail.id}
                onClick={() => setAvailabilityFilter(avail.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                  availabilityFilter === avail.id
                    ? 'bg-[#8B3A4A] text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-gray-50 text-gray-600 border border-[#E7E7E4]'
                }`}
              >
                {avail.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-medium text-gray-500 shrink-0">
            Showing {sorted.length} of {deduplicatedArtists.length} creators
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isDataLoading && deduplicatedArtists.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-white border border-[#E7E7E4] p-5 space-y-4">
              <div className="h-44 bg-gray-100 rounded-2xl" />
              <div className="h-4 bg-gray-100 rounded-full w-2/3" />
              <div className="h-3 bg-gray-100 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isDataLoading && dataError && deduplicatedArtists.length === 0 && (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-[#E7E7E4] shadow-xs space-y-3">
          <Users className="w-10 h-10 text-[#8B3A4A] mx-auto opacity-70" />
          <h3 className="font-serif-headline text-2xl font-normal text-[#111111]">Unable to load creator roster</h3>
          <p className="text-xs text-[#666666] max-w-sm mx-auto">{dataError}</p>
          <button
            onClick={() => refreshData()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold bg-[#8B3A4A] text-white hover:bg-[#732D3B] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isDataLoading && sorted.length === 0 && (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-[#E7E7E4] shadow-xs">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-serif-headline text-2xl font-normal text-[#111111]">No creators in this category</h3>
          <p className="text-xs text-[#666666] mt-1 max-w-sm mx-auto">
            Try selecting "All" or exploring another discipline.
          </p>
        </div>
      )}

      {/* Roster Grid */}
      {sorted.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </div>
  );
};
