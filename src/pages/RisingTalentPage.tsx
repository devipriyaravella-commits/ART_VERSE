import React from 'react';
import { useApp } from '../context/AppContext';
import { ArtistCard } from '../components/cards/ArtistCard';
import { TrendingUp, Zap, Sparkles, Eye, Users, Info, ArrowUpRight } from 'lucide-react';

export const RisingTalentPage: React.FC = () => {
  const { artists, viewArtistProfile, setCollabModalTargetArtist } = useApp();

  const risingArtists = artists.filter((a) => a.isRising);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#FAFAF8]">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8] mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-[#8B3A4A]" />
          <span>Velocity & Momentum</span>
        </div>
        <h1 className="font-serif-headline text-4xl sm:text-5xl font-normal text-gray-900">
          Rising Talent
        </h1>
        <p className="text-base text-gray-600 mt-2 max-w-2xl">
          Meet creators before everyone else does. These artists are gaining unprecedented engagement, curator saves, and portfolio views this month.
        </p>

        {/* Platform Engagement Data Label */}
        <div className="mt-4 px-3 py-1.5 inline-flex items-center gap-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#F3F3F0] text-[#666666] border border-[#E7E7E4]">
          PLATFORM ENGAGEMENT DATA
        </div>

        {/* Platform note */}
        <div className="mt-3 p-3 rounded-xl bg-[#F2E5E8]/60 border border-[#E8D3D8] flex items-center gap-2 text-xs text-[#8B3A4A] max-w-2xl">
          <Info className="w-4 h-4 text-[#8B3A4A] shrink-0" />
          <span>
            Growth metrics are derived from platform interaction data — profile views, portfolio saves, and engagement deltas over the last 30 days. These are internal ARTVERSE analytics and do not represent external endorsements.
          </span>
        </div>
      </div>

      {/* Featured Highlight: Top Rising Hero Card */}
      {risingArtists.length > 0 && (
        <div className="rounded-3xl bg-white border border-[#E7E7E4] p-6 sm:p-8 relative overflow-hidden shadow-sm">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative shrink-0">
              <img
                src={risingArtists[0].avatar}
                alt={risingArtists[0].name}
                className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl object-cover ring-4 ring-[#8B3A4A]/30 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-extrabold bg-[#8B3A4A] text-white shadow-md">
                #1 Rising
              </span>
            </div>

            <div className="space-y-3 flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8]">
                <Zap className="w-3.5 h-3.5 text-[#8B3A4A]" />
                <span>{risingArtists[0].viewsGrowth} views spike this month</span>
              </div>

              <h2 className="font-serif-headline text-2xl sm:text-4xl font-normal text-gray-900">
                {risingArtists[0].name}
              </h2>
              <p className="text-sm font-semibold text-[#8B3A4A]">
                {risingArtists[0].title} • {risingArtists[0].location}
              </p>
              <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
                "{risingArtists[0].bio}"
              </p>

              <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-xs font-bold text-gray-700">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#8B3A4A]" />
                  {risingArtists[0].profileViews} Views
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#8B3A4A]" />
                  {risingArtists[0].followersCount} Followers
                </span>
                <span className="text-emerald-600">
                  {risingArtists[0].engagementGrowth} Engagement
                </span>
              </div>

              {/* Pink & White Action Buttons */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={() => viewArtistProfile(risingArtists[0].id)}
                  className="px-6 py-2.5 rounded-full font-bold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-md shadow-[#8B3A4A]/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Explore Portfolio</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCollabModalTargetArtist(risingArtists[0])}
                  className="px-5 py-2.5 rounded-full font-semibold text-xs bg-white hover:bg-[#F2E5E8] text-gray-800 hover:text-[#8B3A4A] border border-[#E7E7E4] hover:border-[#E8D3D8] transition-all shadow-xs cursor-pointer"
                >
                  Collaborate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of all rising artists */}
      <div className="space-y-4">
        <h3 className="font-serif-headline text-2xl font-normal text-gray-900">
          All Velocity Leaders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {risingArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </div>
    </div>
  );
};
