import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArtworkCard } from '../components/cards/ArtworkCard';
import { Palette, Sparkles, Filter, PlusCircle } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Visual Art',
  'Digital Art',
  'Photography',
  'Music',
  '3D / Animation',
  'Film'
];

export const ArtworkPage: React.FC = () => {
  const { artworks, setUploadModalOpen, currentUser, setCurrentPage, isDataLoading, dataError, refreshData } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = selectedCategory === 'All'
    ? artworks
    : artworks.filter((a) => a.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FAFAF8]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8] mb-2">
            <Palette className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Curated Creative Works</span>
          </div>
          <h1 className="font-serif-headline text-4xl sm:text-5xl font-normal text-gray-900">
            Artwork Gallery
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Explore paintings, digital illustrations, street photographs, and 3D worlds created by emerging voices.
          </p>
        </div>

        <button
          onClick={() => {
            if (currentUser) {
              setUploadModalOpen(true);
            } else {
              setCurrentPage('login');
            }
          }}
          className="px-5 py-2.5 rounded-full font-bold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-md shadow-[#8B3A4A]/25 flex items-center gap-2 self-start sm:self-end transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload Artwork</span>
        </button>
      </div>

      {/* Category Pills (Pink & White) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#8B3A4A] text-white shadow-xs'
                : 'bg-white hover:bg-[#F2E5E8]/50 hover:border-[#E8D3D8] hover:text-[#8B3A4A] text-gray-600 border border-[#E7E7E4]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isDataLoading && artworks.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-white border border-[#E7E7E4] p-4 space-y-3">
              <div className="h-52 bg-gray-100 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded-full w-3/4" />
              <div className="h-3 bg-gray-100 rounded-full w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isDataLoading && dataError && artworks.length === 0 && (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-[#E7E7E4] shadow-xs space-y-3">
          <Palette className="w-10 h-10 text-[#8B3A4A] mx-auto opacity-70" />
          <h3 className="font-serif-headline text-2xl font-normal text-gray-900">Unable to load gallery</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">{dataError}</p>
          <button
            onClick={() => refreshData()}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-[#8B3A4A] text-white hover:bg-[#732D3B] transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isDataLoading && filtered.length === 0 && (
        <div className="text-center py-16 px-4 rounded-3xl bg-white border border-[#E7E7E4] shadow-xs">
          <Palette className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-serif-headline text-2xl font-normal text-gray-900">No artwork found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try choosing another category or uploading your own creation.
          </p>
        </div>
      )}

      {/* Gallery Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((art) => (
            <ArtworkCard key={art.id} artwork={art} />
          ))}
        </div>
      )}
    </div>
  );
};
