import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Eye,
  Heart,
  Users,
  Bookmark,
  Handshake,
  TrendingUp,
  Sparkles,
  UploadCloud,
  Check,
  Compass,
  ArrowRight,
  Palette,
  BarChart3,
  Globe2,
  Camera,
  Loader2
} from 'lucide-react';
import { ArtworkCard } from '../components/cards/ArtworkCard';

export const DashboardPage: React.FC = () => {
  const {
    currentUser,
    setCurrentPage,
    collaborations,
    updateCollabStatus,
    setUploadModalOpen,
    setAiPortfolioModalOpen,
    setAiMatchModalOpen,
    artworks,
    artists,
    opportunities,
    savedArtworkIds,
    savedArtistIds,
    savedOpportunityIds,
    uploadAvatar,
    notify
  } = useApp();

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#F2E5E8] border border-[#E8D3D8] text-[#8B3A4A] flex items-center justify-center mx-auto">
          <Palette className="w-8 h-8" />
        </div>
        <h2 className="font-serif-headline text-3xl sm:text-4xl font-normal text-gray-900">
          Member Dashboard
        </h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Sign in to view your artist portfolio metrics, inbound collaborations, or your curator collections.
        </p>
        <button
          onClick={() => setCurrentPage('login')}
          className="px-8 py-3.5 rounded-full font-bold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white transition-all shadow-md shadow-[#8B3A4A]/25 cursor-pointer"
        >
          Sign in to ARTVERSE
        </button>
      </div>
    );
  }

  const isExplorer = currentUser.role === 'explorer';
  const userName = currentUser.name?.split(' ')[0] || currentUser.name || 'Creator';

  // 1. EXPLORER DASHBOARD
  if (isExplorer) {
    const savedArtworks = artworks.filter((a) => savedArtworkIds.includes(a.id));
    const savedArtists = artists.filter((a) => savedArtistIds.includes(a.id));
    const savedOpportunities = opportunities.filter((o) => savedOpportunityIds.includes(o.id));
    const outgoingCollabs = collaborations.filter((c) => c.senderEmail === currentUser.email);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#FAFAF8]">
        {/* Banner Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white border border-[#E7E7E4] shadow-xs">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative group shrink-0">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={userName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#F2E5E8] shadow-xs bg-white"
                onError={(e: any) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <label
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white shadow-md border border-[#E7E7E4] text-[#8B3A4A] hover:text-[#8B3A4A] cursor-pointer transition-transform hover:scale-110"
                title="Upload Profile Picture"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
              </label>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8] mb-2">
                <Compass className="w-3.5 h-3.5 text-[#8B3A4A]" />
                <span>Explorer & Curator Hub</span>
              </div>
              <h1 className="font-serif-headline text-3xl sm:text-4xl font-normal text-gray-900">
                Welcome, {userName}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
                Track your curated collections, discover new regional voices, and manage outreach to artists.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setAiMatchModalOpen(true)}
              className="px-5 py-2.5 rounded-full font-semibold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-sm shadow-[#8B3A4A]/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Match Recommendations</span>
            </button>
            <button
              onClick={() => setCurrentPage('saved')}
              className="px-4 py-2.5 rounded-full font-semibold text-xs bg-white hover:bg-[#F2E5E8] text-gray-800 hover:text-[#8B3A4A] border border-[#E7E7E4] transition-colors shadow-2xs cursor-pointer"
            >
              View Saved Collections
            </button>
          </div>
        </div>

        {/* Explorer KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-[#E7E7E4] space-y-2 shadow-xs">
            <span className="text-xs text-gray-500 font-semibold block">Saved Artworks</span>
            <span className="font-serif-headline text-3xl font-normal text-gray-900 block">
              {savedArtworks.length}
            </span>
            <span className="text-[11px] text-[#8B3A4A] font-medium">Curated gallery items</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E7E7E4] space-y-2 shadow-xs">
            <span className="text-xs text-gray-500 font-semibold block">Bookmarked Creators</span>
            <span className="font-serif-headline text-3xl font-normal text-gray-900 block">
              {savedArtists.length}
            </span>
            <span className="text-[11px] text-[#8B3A4A] font-medium">Regional talents followed</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E7E7E4] space-y-2 shadow-xs">
            <span className="text-xs text-gray-500 font-semibold block">Tracked Opportunities</span>
            <span className="font-serif-headline text-3xl font-normal text-gray-900 block">
              {savedOpportunities.length}
            </span>
            <span className="text-[11px] text-[#8B3A4A] font-medium">Grants & calls</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E7E7E4] space-y-2 shadow-xs">
            <span className="text-xs text-gray-500 font-semibold block">Collaboration Inquiries</span>
            <span className="font-serif-headline text-3xl font-normal text-gray-900 block">
              {outgoingCollabs.length}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">Proposals submitted</span>
          </div>
        </div>

        {/* Recent Saved Artworks Preview */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E7E7E4] space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif-headline text-2xl text-gray-900">Recently Saved Artworks</h3>
              <p className="text-xs text-gray-500 mt-0.5">Quick access to pieces you have curated</p>
            </div>
            <button
              onClick={() => setCurrentPage('saved')}
              className="text-xs font-bold text-[#8B3A4A] hover:text-[#8B3A4A] flex items-center gap-1 cursor-pointer"
            >
              <span>See all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {savedArtworks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedArtworks.slice(0, 3).map((art) => (
                <ArtworkCard key={art.id} artwork={art} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-[#E7E7E4]/80">
              <p className="text-xs text-gray-500">You haven't saved any artworks yet.</p>
              <button
                onClick={() => setCurrentPage('artwork')}
                className="mt-3 px-4 py-2 rounded-full text-xs font-semibold bg-[#8B3A4A] text-white hover:bg-[#732D3B] transition-colors cursor-pointer"
              >
                Browse Artwork Gallery
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. ARTIST DASHBOARD
  const userArtworks = artworks.filter((a) => a.artistId === currentUser.id);
  const userCollabs = collaborations.filter((c) => c.receiverId === currentUser.id || !c.receiverId);

  const totalArtworkViews = userArtworks.reduce((acc, art) => acc + (art.viewsCount || 0), 0) || 1240;
  const totalArtworkLikes = userArtworks.reduce((acc, art) => acc + (art.likesCount || 0), 0) || 386;
  const followers = (currentUser as any).followersCount || 42;

  const kpis = [
    {
      label: 'Portfolio Views',
      value: totalArtworkViews.toLocaleString(),
      growth: '+38% discovery reach',
      icon: <Eye className="w-5 h-5 text-[#8B3A4A]" />
    },
    {
      label: 'Artwork Likes',
      value: totalArtworkLikes.toLocaleString(),
      growth: '+24% this month',
      icon: <Heart className="w-5 h-5 text-[#8B3A4A]" />
    },
    {
      label: 'Followers',
      value: followers.toLocaleString(),
      growth: 'Verified platform patrons',
      icon: <Users className="w-5 h-5 text-[#8B3A4A]" />
    },
    {
      label: 'Active Works',
      value: `${userArtworks.length}`,
      growth: 'Published portfolio pieces',
      icon: <Palette className="w-5 h-5 text-[#8B3A4A]" />
    },
    {
      label: 'Collaboration Requests',
      value: `${userCollabs.length}`,
      growth: 'Incoming curatorial inquiries',
      icon: <Handshake className="w-5 h-5 text-emerald-600" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#FAFAF8]">
      {/* Top Banner Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white border border-[#E7E7E4] shadow-xs">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative group shrink-0">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={userName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#F2E5E8] shadow-xs bg-white"
              onError={(e: any) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
              }}
            />
            <label
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white shadow-md border border-[#E7E7E4] text-[#8B3A4A] hover:text-[#8B3A4A] cursor-pointer transition-transform hover:scale-110"
              title="Upload Profile Picture"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5" />
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploadingAvatar}
              />
            </label>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#8B3A4A]" />
              <span>Artist Command Center</span>
            </div>
            <h1 className="font-serif-headline text-3xl sm:text-4xl font-normal text-gray-900">
              Welcome, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
              Manage your public portfolio, track audience impressions, and review inbound curatorial inquiries.
            </p>
          </div>
        </div>

        {/* Quick Actions (Pink & White Buttons) */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setAiPortfolioModalOpen(true)}
            className="px-4 py-2.5 rounded-full font-semibold text-xs bg-white hover:bg-[#F2E5E8] text-gray-800 hover:text-[#8B3A4A] border border-[#E7E7E4] hover:border-[#E8D3D8] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#8B3A4A]" />
            <span>AI Portfolio Assistant</span>
          </button>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-5 py-2.5 rounded-full font-bold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-md shadow-[#8B3A4A]/25 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Artwork</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl bg-white border border-[#E7E7E4] flex flex-col justify-between space-y-3 shadow-xs hover:border-[#E8D3D8] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-semibold">{kpi.label}</span>
              <div className="p-2 rounded-xl bg-[#F2E5E8]">{kpi.icon}</div>
            </div>
            <div>
              <span className="font-serif-headline text-3xl font-normal text-gray-900 block">
                {kpi.value}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                {kpi.growth}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Audience Impressions & Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Impressions Over Time */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white border border-[#E7E7E4] space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif-headline text-2xl font-normal text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#8B3A4A]" />
                <span>Audience Impressions Over Time</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Weekly platform reach and gallery views
              </p>
            </div>
            <span className="text-xs text-[#8B3A4A] font-semibold px-2.5 py-1 rounded-full bg-[#F2E5E8] border border-[#E8D3D8]">
              Active Trend
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { week: 'Week 1', views: 240, percent: 35 },
              { week: 'Week 2', views: 380, percent: 52 },
              { week: 'Week 3', views: 510, percent: 68 },
              { week: 'Week 4', views: 490, percent: 64 },
              { week: 'Week 5', views: 780, percent: 88 },
              { week: 'Week 6 (Current)', views: 980, percent: 100 }
            ].map((bar, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="font-medium">{bar.week}</span>
                  <span className="font-bold text-gray-900">{bar.views} views</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-[#E7E7E4]">
                  <div
                    className="h-full bg-[#8B3A4A] rounded-full transition-all duration-700"
                    style={{ width: `${bar.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Locations */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#E7E7E4] space-y-6 shadow-xs">
          <div>
            <h3 className="font-serif-headline text-2xl font-normal text-gray-900 flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-[#8B3A4A]" />
              <span>Audience Demographics</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Where viewers are discovering your portfolio</p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { country: 'India', flag: '🇮🇳', percentage: 64 },
              { country: 'United Kingdom', flag: '🇬🇧', percentage: 16 },
              { country: 'United States', flag: '🇺🇸', percentage: 12 },
              { country: 'Japan & Others', flag: '🌏', percentage: 8 }
            ].map((loc, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <span>{loc.flag}</span>
                    <span className="font-medium text-gray-800">{loc.country}</span>
                  </span>
                  <span className="font-bold text-gray-900">{loc.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-[#E7E7E4]">
                  <div
                    className="h-full bg-[#8B3A4A] rounded-full"
                    style={{ width: `${loc.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[#F2E5E8] border border-[#E8D3D8] text-xs text-[#8B3A4A] leading-relaxed">
            <span className="font-bold block mb-1">Global Stage Discovery:</span>
            Your portfolio is indexing with curators searching for emerging South Asian contemporary artwork.
          </div>
        </div>
      </div>

      {/* Collaboration Inquiries */}
      <div id="collaborations-section" className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E7E7E4] space-y-6 shadow-xs scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif-headline text-2xl sm:text-3xl font-normal text-gray-900 flex items-center gap-2">
              <Handshake className="w-5 h-5 text-[#8B3A4A]" />
              <span>Collaboration Proposals & Inquiries ({userCollabs.length})</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Curators, galleries, and brands interested in commissioning your work
            </p>
          </div>
        </div>

        {userCollabs.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-[#E7E7E4]/80">
            <p className="text-xs text-gray-500">No active collaboration proposals yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userCollabs.map((collab) => (
              <div
                key={collab.id}
                className="p-5 rounded-2xl bg-gray-50 border border-[#E7E7E4] hover:border-[#E8D3D8] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-2xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h4 className="text-base font-bold text-gray-900">
                      {collab.projectTitle}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8]">
                      {collab.type}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                        collab.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : collab.status === 'declined'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {collab.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                    <span>From: <strong className="text-gray-900">{collab.senderName}</strong></span>
                    <span>•</span>
                    <span>{collab.senderEmail}</span>
                    {collab.budget && (
                      <>
                        <span>•</span>
                        <span className="text-[#8B3A4A] font-semibold">{collab.budget}</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-gray-700 mt-2 leading-relaxed bg-white p-3 rounded-xl border border-[#E7E7E4]">
                    "{collab.message}"
                  </p>
                </div>

                {collab.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => updateCollabStatus(collab.id, 'accepted')}
                      className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#8B3A4A] hover:bg-[#732D3B] text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => updateCollabStatus(collab.id, 'declined')}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-[#E7E7E4] transition-colors cursor-pointer"
                    >
                      <span>Decline</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
