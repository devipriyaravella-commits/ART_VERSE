import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArtistCard } from '../components/cards/ArtistCard';
import { GLOBAL_STAGE_REGIONS } from '../data/mockData';
import { Globe2, MapPin, Sparkles, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export const GlobalStagePage: React.FC = () => {
  const { artists } = useApp();
  const [selectedCountry, setSelectedCountry] = useState<string>('India');

  // Filter artists by selected country
  const countryArtists = artists.filter((a) => {
    if (selectedCountry === 'All') return true;
    return a.country.toLowerCase() === selectedCountry.toLowerCase();
  });

  const activeRegion = GLOBAL_STAGE_REGIONS.find((r) => r.country === selectedCountry);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 bg-[#FAFAF8]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8]">
          <Globe2 className="w-3.5 h-3.5 text-[#8B3A4A]" />
          <span>International Creative Network</span>
        </div>
        <h1 className="font-serif-headline text-4xl sm:text-6xl font-normal text-gray-900">
          The ARTVERSE Global Stage
        </h1>
        <p className="text-base text-gray-600 leading-relaxed">
          Local talent can reach a global audience. No artist should remain invisible simply because they come from a small town or non-metropolitan hub.
        </p>
      </div>

      {/* Interactive World Visualizer / Country Cards */}
      <div className="rounded-3xl bg-white border border-[#E7E7E4] p-6 sm:p-10 space-y-8 shadow-sm">
        
        {/* Country selector tabs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center sm:text-left">
              Select a Region to Explore Creators ({artists.length} Total on Global Stage)
            </h3>
            {selectedCountry !== 'All' && (
              <button
                onClick={() => setSelectedCountry('All')}
                className="text-xs font-semibold text-[#8B3A4A] hover:underline cursor-pointer"
              >
                View All {artists.length} Creators →
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {/* All Regions Quick Selector */}
            <button
              onClick={() => setSelectedCountry('All')}
              className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
                selectedCountry === 'All'
                  ? 'bg-[#F2E5E8] border-[#8B3A4A] text-[#8B3A4A] shadow-sm scale-105 font-bold ring-2 ring-[#8B3A4A]/20'
                  : 'bg-gray-50 hover:bg-white hover:border-[#E8D3D8] border-[#E7E7E4] text-gray-600'
              }`}
            >
              <span className="text-2xl">🌍</span>
              <span className="text-xs font-bold text-gray-900 mt-1">All Global</span>
              <span className="text-[10px] text-[#8B3A4A] font-semibold">{artists.length} Creators</span>
            </button>

            {GLOBAL_STAGE_REGIONS.map((region) => {
              const isSelected = selectedCountry === region.country;
              const dynamicCount = artists.filter((a) => a.country?.toLowerCase() === region.country.toLowerCase()).length;
              return (
                <button
                  key={region.country}
                  onClick={() => setSelectedCountry(region.country)}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#F2E5E8] border-[#8B3A4A] text-[#8B3A4A] shadow-sm scale-105 font-bold ring-2 ring-[#8B3A4A]/20'
                      : 'bg-gray-50 hover:bg-white hover:border-[#E8D3D8] border-[#E7E7E4] text-gray-600'
                  }`}
                >
                  <span className="text-2xl">{region.flag}</span>
                  <span className="text-xs font-bold text-gray-900 mt-1">{region.country}</span>
                  <span className="text-[10px] text-[#8B3A4A] font-semibold">{dynamicCount} Artists</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Region Spotlight Banner */}
        {selectedCountry === 'All' ? (
          <div className="p-6 rounded-2xl bg-[#F2E5E8]/60 border border-[#E8D3D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌍</span>
                <h3 className="font-serif-headline text-2xl font-normal text-gray-900">
                  All Global Stage Creators
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F2E5E8] text-[#8B3A4A]">
                  {artists.length} Verified Artists
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Spanning over <strong className="text-[#8B3A4A]">24 countries and 60+ cultural regions</strong> worldwide with rich visual covers.
              </p>
            </div>

            <div className="text-xs text-gray-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full international artist index active</span>
            </div>
          </div>
        ) : activeRegion && (
          <div className="p-6 rounded-2xl bg-[#F2E5E8]/60 border border-[#E8D3D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeRegion.flag}</span>
                <h3 className="font-serif-headline text-2xl font-normal text-gray-900">
                  Spotlight on {activeRegion.country}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F2E5E8] text-[#8B3A4A]">
                  {countryArtists.length} Active Artists
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Hub cities:{' '}
                <strong className="text-[#8B3A4A]">{activeRegion.cities.join(', ')}</strong>
              </p>
            </div>

            <div className="text-xs text-gray-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>International curator inquiries open for this region</span>
            </div>
          </div>
        )}

        {/* Regional Artists Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif-headline text-2xl font-normal text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8B3A4A]" />
              <span>
                {selectedCountry === 'All'
                  ? `All Global Creators (${countryArtists.length})`
                  : `Artists from ${selectedCountry} (${countryArtists.length})`}
              </span>
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              Showing {countryArtists.length} {countryArtists.length === 1 ? 'artist' : 'artists'} with complete visual covers
            </span>
          </div>

          {countryArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {countryArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-[#E7E7E4]">
              <p className="text-xs text-gray-500">No artists registered from this region yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
