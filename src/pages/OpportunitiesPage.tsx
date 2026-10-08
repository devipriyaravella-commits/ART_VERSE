import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OpportunityCard } from '../components/cards/OpportunityCard';
import { OpportunityCategory } from '../types';
import { Briefcase, Search, Award, Globe, Filter, Calendar } from 'lucide-react';

const CATEGORIES: ('All' | OpportunityCategory)[] = [
  'All',
  'Grants',
  'Exhibitions',
  'Competitions',
  'Freelance',
  'Jobs',
  'Collaborations',
  'Scholarships',
  'Workshops',
  'Internships'
];

export type OpportunitySortOption =
  | 'deadline-asc'
  | 'deadline-desc'
  | 'featured'
  | 'newest'
  | 'compensation-desc'
  | 'title-asc';

export const OpportunitiesPage: React.FC = () => {
  const { opportunities, isDataLoading, dataError, refreshData } = useApp();
  const [selectedCat, setSelectedCat] = useState<'All' | OpportunityCategory>('All');
  const [modeFilter, setModeFilter] = useState<'All' | 'Online' | 'Offline' | 'Hybrid'>('All');
  const [sortBy, setSortBy] = useState<OpportunitySortOption>('deadline-asc');
  const [search, setSearch] = useState('');

  const filtered = opportunities.filter((opp) => {
    if (selectedCat !== 'All' && opp.category !== selectedCat) return false;
    if (modeFilter !== 'All' && opp.mode !== modeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        opp.title.toLowerCase().includes(q) ||
        opp.organization.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q) ||
        (opp.tags && opp.tags.some((t) => t.toLowerCase().includes(q)));
      if (!match) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'deadline-asc') {
      const timeA = new Date(a.deadline).getTime() || Infinity;
      const timeB = new Date(b.deadline).getTime() || Infinity;
      return timeA - timeB;
    }
    if (sortBy === 'deadline-desc') {
      const timeA = new Date(a.deadline).getTime() || 0;
      const timeB = new Date(b.deadline).getTime() || 0;
      return timeB - timeA;
    }
    if (sortBy === 'featured') {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'title-asc') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'compensation-desc') {
      const parseAmount = (str?: string) => {
        if (!str) return 0;
        const nums = str.replace(/[^0-9]/g, '');
        const val = parseInt(nums, 10) || 0;
        if (str.includes('$')) return val * 85;
        if (str.includes('€')) return val * 92;
        if (str.includes('£')) return val * 108;
        return val;
      };
      return parseAmount(b.compensation || b.prize) - parseAmount(a.compensation || a.prize);
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FAFAF8]">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8] mb-2">
          <Briefcase className="w-3.5 h-3.5 text-[#8B3A4A]" />
          <span>Opportunity Hub</span>
        </div>
        <h1 className="font-serif-headline text-4xl sm:text-5xl font-normal text-gray-900">
          Grants, Competitions & Creative Calls
        </h1>
        <p className="text-sm text-gray-600 mt-1 max-w-xl">
          Don't just showcase talent. Create opportunities for it. Browse funded opportunities and open calls curated for emerging creators.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="editorial-card p-5 sm:p-6 bg-white border border-[#E7E7E4] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search competitions, grants, freelance briefs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-[#E7E7E4] text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B3A4A] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-gray-500 font-semibold">Mode:</span>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 outline-none focus:border-[#8B3A4A] cursor-pointer"
            >
              <option value="All">All Modes</option>
              <option value="Online">Online Only</option>
              <option value="Offline">On-Site / Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-gray-500 font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as OpportunitySortOption)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 outline-none focus:border-[#8B3A4A] cursor-pointer font-medium"
            >
              <option value="deadline-asc">⏳ Deadline (Ending Soonest)</option>
              <option value="deadline-desc">📅 Deadline (Furthest Out)</option>
              <option value="featured">✨ Curator Featured First</option>
              <option value="newest">🆕 Recently Added</option>
              <option value="compensation-desc">💰 Highest Grant / Value</option>
              <option value="title-asc">🔤 Title (A to Z)</option>
            </select>
          </div>
        </div>

        {/* Categories (Pink & White) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-gray-100">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedCat === cat
                  ? 'bg-[#8B3A4A] text-white shadow-xs'
                  : 'bg-white hover:bg-[#F2E5E8]/50 hover:border-[#E8D3D8] hover:text-[#8B3A4A] text-gray-600 border border-[#E7E7E4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif-headline text-2xl font-normal text-gray-900">
          {selectedCat === 'All' ? 'All Curated Opportunities' : `${selectedCat}`} ({filtered.length})
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          Showing {filtered.length} of {opportunities.length} open calls
        </span>
      </div>

      {/* Loading State */}
      {isDataLoading && opportunities.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-white border border-[#E7E7E4] p-6 space-y-4">
              <div className="h-4 bg-gray-100 rounded-full w-1/3" />
              <div className="h-6 bg-gray-100 rounded-full w-3/4" />
              <div className="h-4 bg-gray-100 rounded-full w-1/2" />
              <div className="h-12 bg-gray-100 rounded-2xl w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isDataLoading && dataError && opportunities.length === 0 && (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-[#E7E7E4] shadow-xs space-y-3">
          <Briefcase className="w-10 h-10 text-[#8B3A4A] mx-auto opacity-70" />
          <h3 className="font-serif-headline text-2xl font-normal text-gray-900">Unable to load opportunities</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">{dataError}</p>
          <button
            onClick={() => refreshData()}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-[#8B3A4A] text-white hover:bg-[#732D3B] transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Opportunities Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      ) : !isDataLoading && (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-[#E7E7E4] shadow-xs">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-serif-headline text-2xl font-normal text-gray-900">No opportunities found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or switching category filters.
          </p>
        </div>
      )}
    </div>
  );
};
