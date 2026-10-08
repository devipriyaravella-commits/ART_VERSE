import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArtistCard } from '../components/cards/ArtistCard';
import { ArtworkCard } from '../components/cards/ArtworkCard';
import { OpportunityCard } from '../components/cards/OpportunityCard';
import { Search, Sparkles, RefreshCw, Users, Palette, Briefcase, Filter } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Visual Art',
  'Photography',
  'Music',
  'Design',
  'Dance',
  'Film',
  'Digital Art'
];

const LOCATIONS = [
  'All',
  'Hyderabad',
  'Mumbai',
  'Chennai',
  'Bengaluru',
  'Delhi',
  'Kolkata',
  'London',
  'Tokyo',
  'Dubai',
  'Austin',
  'Lagos'
];

export const DiscoverPage: React.FC = () => {
  const {
    artists,
    artworks,
    opportunities,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    locationFilter,
    setLocationFilter,
    availabilityFilter,
    setAvailabilityFilter
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'artists' | 'artworks' | 'opportunities'>('all');
  const [artistSort, setArtistSort] = useState<'availability' | 'followers' | 'views' | 'name' | 'featured'>('availability');

  const q = searchQuery.toLowerCase().trim();

  // Filter Artists
  const filteredArtists = artists.filter((artist) => {
    if (q) {
      const match =
        artist.name.toLowerCase().includes(q) ||
        artist.location.toLowerCase().includes(q) ||
        artist.category.toLowerCase().includes(q) ||
        artist.bio.toLowerCase().includes(q) ||
        artist.skills.some((s) => s.toLowerCase().includes(q)) ||
        artist.tags.some((t) => t.toLowerCase().includes(q)) ||
        (q.includes('avail') && artist.availability.toLowerCase().includes('avail'));
      if (!match) return false;
    }

    if (categoryFilter !== 'All' && artist.category !== categoryFilter) return false;

    if (locationFilter !== 'All') {
      if (!artist.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    }

    if (availabilityFilter !== 'All') {
      if (availabilityFilter === 'Available' && artist.availability !== 'Available') return false;
      if (availabilityFilter === 'Busy' && artist.availability !== 'Busy') return false;
      if (availabilityFilter === 'Upcoming' && !artist.availability.toLowerCase().includes('from')) return false;
    }

    return true;
  });

  // Sort Artists (Available First, Followers, Views, etc.)
  const sortedArtists = [...filteredArtists].sort((a, b) => {
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

  // Filter Artworks
  const filteredArtworks = artworks.filter((art) => {
    if (q) {
      const match =
        art.title.toLowerCase().includes(q) ||
        art.artistName.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (categoryFilter !== 'All' && art.category !== categoryFilter) return false;
    if (locationFilter !== 'All' && !art.artistLocation.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    return true;
  });

  // Filter Opportunities
  const filteredOpportunities = opportunities.filter((opp) => {
    if (q) {
      const match =
        opp.title.toLowerCase().includes(q) ||
        opp.organization.toLowerCase().includes(q) ||
        opp.category.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (locationFilter !== 'All' && !opp.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    return true;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setLocationFilter('All');
    setAvailabilityFilter('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#FAFAF8]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#8B3A4A] block mb-2">
            Universal Discovery
          </span>
          <h1 className="font-serif-headline text-4xl sm:text-6xl font-normal text-gray-900">
            Discover Across ARTVERSE
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
            Search creators, original artwork, and open calls with live category and availability filtering.
          </p>
        </div>

        <button
          onClick={resetFilters}
          className="px-4 py-2 rounded-full font-semibold text-xs bg-white hover:bg-[#F2E5E8] text-gray-700 hover:text-[#8B3A4A] border border-[#E7E7E4] hover:border-[#E8D3D8] flex items-center gap-1.5 self-start md:self-end transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Universal Search & Filter Bar */}
      <div className="editorial-card p-5 sm:p-6 bg-white border border-[#E7E7E4] space-y-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search artists, artwork, opportunities (e.g. 'illustrators in Hyderabad', 'photography opportunities', 'available for collaboration')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border border-[#E7E7E4] text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B3A4A] focus:bg-white transition-all"
          />
        </div>

        {/* Tab & Filter Selectors (Pink & White) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {/* Main Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-gray-100 border border-[#E7E7E4] text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-[#8B3A4A] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Results
            </button>
            <button
              onClick={() => setActiveTab('artists')}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                activeTab === 'artists' ? 'bg-[#8B3A4A] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Artists ({filteredArtists.length})
            </button>
            <button
              onClick={() => setActiveTab('artworks')}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                activeTab === 'artworks' ? 'bg-[#8B3A4A] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Artwork ({filteredArtworks.length})
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                activeTab === 'opportunities' ? 'bg-[#8B3A4A] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Opportunities ({filteredOpportunities.length})
            </button>
          </div>

          {/* Sub-Filters: Location, Availability & Sorting */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="text-xs bg-white border border-[#E7E7E4] rounded-full px-3 py-1.5 text-gray-900 outline-none focus:border-[#8B3A4A] cursor-pointer"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === 'All' ? 'All Locations' : loc}
                </option>
              ))}
            </select>

            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="text-xs bg-white border border-[#E7E7E4] rounded-full px-3 py-1.5 text-gray-900 outline-none focus:border-[#8B3A4A] cursor-pointer font-medium"
            >
              <option value="All">All Availability</option>
              <option value="Available">🟢 Available Now</option>
              <option value="Busy">🟡 Busy on Project</option>
              <option value="Upcoming">📅 Available Soon</option>
            </select>

            <select
              value={artistSort}
              onChange={(e) => setArtistSort(e.target.value as any)}
              className="text-xs bg-white border border-[#E7E7E4] rounded-full px-3 py-1.5 text-gray-900 outline-none focus:border-[#8B3A4A] cursor-pointer font-medium"
            >
              <option value="availability">⚡ Sort: Available First</option>
              <option value="featured">✨ Curator Featured</option>
              <option value="followers">👥 Most Followers</option>
              <option value="views">👁️ Most Profile Views</option>
              <option value="name">🔤 Name (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills (Pink & White) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-gray-100">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#8B3A4A] text-white font-semibold shadow-xs'
                  : 'bg-white hover:bg-[#F2E5E8]/50 hover:border-[#E8D3D8] hover:text-[#8B3A4A] text-gray-600 border border-[#E7E7E4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Categorized Results Presentation */}
      <div className="space-y-12">
        {/* 1. Artists Section */}
        {(activeTab === 'all' || activeTab === 'artists') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E7E4] pb-2">
              <h3 className="font-serif-headline text-2xl font-normal text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8B3A4A]" />
                <span>Artists ({sortedArtists.length})</span>
              </h3>
              {activeTab === 'all' && sortedArtists.length > 3 && (
                <button
                  onClick={() => setActiveTab('artists')}
                  className="text-xs font-semibold text-[#8B3A4A] hover:text-[#8B3A4A] hover:underline cursor-pointer"
                >
                  View all {sortedArtists.length} artists →
                </button>
              )}
            </div>

            {sortedArtists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === 'all' ? sortedArtists.slice(0, 3) : sortedArtists).map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-4">No artists matching this query or filter.</p>
            )}
          </div>
        )}

        {/* 2. Artwork Section */}
        {(activeTab === 'all' || activeTab === 'artworks') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E7E4] pb-2">
              <h3 className="font-serif-headline text-2xl font-normal text-gray-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#8B3A4A]" />
                <span>Artwork ({filteredArtworks.length})</span>
              </h3>
              {activeTab === 'all' && filteredArtworks.length > 3 && (
                <button
                  onClick={() => setActiveTab('artworks')}
                  className="text-xs font-semibold text-[#8B3A4A] hover:text-[#8B3A4A] hover:underline"
                >
                  View all {filteredArtworks.length} pieces →
                </button>
              )}
            </div>

            {filteredArtworks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === 'all' ? filteredArtworks.slice(0, 3) : filteredArtworks).map((art) => (
                  <ArtworkCard key={art.id} artwork={art} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-4">No artwork matching this query or filter.</p>
            )}
          </div>
        )}

        {/* 3. Opportunities Section */}
        {(activeTab === 'all' || activeTab === 'opportunities') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E7E4] pb-2">
              <h3 className="font-serif-headline text-2xl font-normal text-gray-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#8B3A4A]" />
                <span>Creative Calls & Opportunities ({filteredOpportunities.length})</span>
              </h3>
              {activeTab === 'all' && filteredOpportunities.length > 3 && (
                <button
                  onClick={() => setActiveTab('opportunities')}
                  className="text-xs font-semibold text-[#8B3A4A] hover:text-[#8B3A4A] hover:underline"
                >
                  View all {filteredOpportunities.length} opportunities →
                </button>
              )}
            </div>

            {filteredOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === 'all' ? filteredOpportunities.slice(0, 3) : filteredOpportunities).map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-4">No opportunities matching this query or filter.</p>
            )}
          </div>
        )}

        {/* Empty state if nothing found at all */}
        {filteredArtists.length === 0 && filteredArtworks.length === 0 && filteredOpportunities.length === 0 && (
          <div className="text-center py-16 px-4 rounded-3xl bg-white border border-[#E7E7E4] space-y-3 shadow-xs">
            <h3 className="font-serif-headline text-2xl font-normal text-gray-900">
              We couldn't find creators matching those filters.
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try broader keywords or resetting your category and availability filters.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#8B3A4A] text-white hover:bg-[#732D3B] shadow-sm shadow-[#8B3A4A]/25 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
