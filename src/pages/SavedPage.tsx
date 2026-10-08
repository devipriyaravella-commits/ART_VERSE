import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArtworkCard } from '../components/cards/ArtworkCard';
import { ArtistCard } from '../components/cards/ArtistCard';
import { OpportunityCard } from '../components/cards/OpportunityCard';
import { Bookmark, Image as ImageIcon, Users, Briefcase, ArrowRight } from 'lucide-react';

export const SavedPage: React.FC = () => {
  const {
    currentUser,
    setCurrentPage,
    artworks,
    artists,
    opportunities,
    savedArtworkIds,
    savedArtistIds,
    savedOpportunityIds,
    isDataLoading,
    dataError,
    refreshData
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'artworks' | 'artists' | 'opportunities'>('all');

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#F2E5E8] border border-[#E8D3D8] text-[#8B3A4A] flex items-center justify-center mx-auto">
          <Bookmark className="w-8 h-8" />
        </div>
        <h2 className="font-serif-headline text-3xl sm:text-4xl font-normal text-gray-900">
          Saved Collections
        </h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Sign in to view your saved artworks, bookmarked creator profiles, and tracked opportunity grants.
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

  const savedArtworks = artworks.filter((a) => savedArtworkIds.includes(a.id));
  const savedArtists = artists.filter((a) => savedArtistIds.includes(a.id));
  const savedOpportunities = opportunities.filter((o) => savedOpportunityIds.includes(o.id));

  const totalSaved = savedArtworks.length + savedArtists.length + savedOpportunities.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FAFAF8]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8] mb-2">
            <Bookmark className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Curated Collection</span>
          </div>
          <h1 className="font-serif-headline text-4xl sm:text-5xl font-normal text-gray-900">
            My Saved Items ({totalSaved})
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
            Your personal archive of inspiring creators, standout artworks, and bookmarked global opportunities.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 rounded-full bg-white border border-[#E7E7E4] text-xs shadow-2xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#8B3A4A] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({totalSaved})
          </button>
          <button
            onClick={() => setActiveTab('artworks')}
            className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              activeTab === 'artworks'
                ? 'bg-[#8B3A4A] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Artwork ({savedArtworks.length})
          </button>
          <button
            onClick={() => setActiveTab('artists')}
            className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              activeTab === 'artists'
                ? 'bg-[#8B3A4A] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Artists ({savedArtists.length})
          </button>
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              activeTab === 'opportunities'
                ? 'bg-[#8B3A4A] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Opportunities ({savedOpportunities.length})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isDataLoading && totalSaved === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-white border border-[#E7E7E4] p-5 space-y-4">
              <div className="h-44 bg-gray-100 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded-full w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isDataLoading && dataError && totalSaved === 0 && (
        <div className="p-16 rounded-3xl bg-white border border-[#E7E7E4] text-center space-y-4 shadow-xs">
          <Bookmark className="w-12 h-12 text-[#8B3A4A] mx-auto opacity-70" />
          <h3 className="font-serif-headline text-2xl text-gray-900">Unable to load saved items</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">{dataError}</p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => refreshData()}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#8B3A4A] hover:bg-[#732D3B] text-white transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isDataLoading && !dataError && totalSaved === 0 && (
        <div className="p-16 rounded-3xl bg-white border border-[#E7E7E4] text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-serif-headline text-2xl text-gray-900">Your collection is empty</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Click the bookmark icon on any artist profile, artwork piece, or opportunity card to curate your personal archive.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setCurrentPage('artwork')}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#8B3A4A] hover:bg-[#732D3B] text-white transition-colors cursor-pointer"
            >
              Explore Artworks
            </button>
            <button
              onClick={() => setCurrentPage('artists')}
              className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white border border-[#E7E7E4] text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Discover Artists
            </button>
          </div>
        </div>
      )}

      {/* Content Rendering */}
      {totalSaved > 0 && (
        <div className="space-y-12">
          {/* Saved Artworks */}
          {(activeTab === 'all' || activeTab === 'artworks') && savedArtworks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E7E7E4] pb-3">
                <ImageIcon className="w-4 h-4 text-[#8B3A4A]" />
                <h3 className="font-serif-headline text-2xl text-gray-900">
                  Saved Artworks ({savedArtworks.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedArtworks.map((art) => (
                  <ArtworkCard key={art.id} artwork={art} />
                ))}
              </div>
            </div>
          )}

          {/* Saved Artists */}
          {(activeTab === 'all' || activeTab === 'artists') && savedArtists.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E7E7E4] pb-3">
                <Users className="w-4 h-4 text-[#8B3A4A]" />
                <h3 className="font-serif-headline text-2xl text-gray-900">
                  Bookmarked Artists ({savedArtists.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            </div>
          )}

          {/* Saved Opportunities */}
          {(activeTab === 'all' || activeTab === 'opportunities') && savedOpportunities.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E7E7E4] pb-3">
                <Briefcase className="w-4 h-4 text-[#8B3A4A]" />
                <h3 className="font-serif-headline text-2xl text-gray-900">
                  Saved Opportunities ({savedOpportunities.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedOpportunities.map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
