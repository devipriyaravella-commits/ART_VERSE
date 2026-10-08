import React from 'react';
import { Artist } from '../../types';
import { useApp } from '../../context/AppContext';
import { MapPin, UserPlus, UserCheck, Sparkles, ArrowRight, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

interface ArtistCardProps {
  artist: Artist;
  featured?: boolean;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const {
    viewArtistProfile,
    followedArtistIds,
    toggleFollowArtist,
    savedArtistIds,
    toggleSaveArtist,
    setCollabModalTargetArtist,
    currentUser,
    setCurrentPage,
    notify
  } = useApp();

  const [avatarSrc, setAvatarSrc] = React.useState(artist.avatar);
  const [coverSrc, setCoverSrc] = React.useState(artist.coverImage);

  const isFollowed = followedArtistIds.includes(artist.id);
  const isSaved = savedArtistIds.includes(artist.id);

  // Availability styling
  const isAvailable = artist.availability === 'Available';
  const isBusy = artist.availability === 'Busy';

  const handleCollaborate = () => {
    if (!currentUser) {
      notify('Sign in to propose a collaboration with this creator', 'info');
      setCurrentPage('login');
      return;
    }
    setCollabModalTargetArtist(artist);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="editorial-card group overflow-hidden flex flex-col justify-between bg-white border border-[#E7E7E4] shadow-xs"
    >
      {/* Visual Header / Cover with subtle artwork zoom */}
      <div
        className="relative h-48 w-full overflow-hidden bg-gray-100 cursor-pointer"
        onClick={() => viewArtistProfile(artist.id)}
      >
        <img
          src={coverSrc}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          onError={() => setCoverSrc('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

        {/* Availability Badge */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide backdrop-blur-md border ${
              isAvailable
                ? 'bg-white/95 text-emerald-800 border-emerald-200 shadow-xs'
                : isBusy
                ? 'bg-white/95 text-amber-800 border-amber-200 shadow-xs'
                : 'bg-white/95 text-[#8B3A4A] border-[#E8D3D8] shadow-xs'
            }`}
          >
            {artist.availability}
          </span>
        </div>

        {/* Save Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveArtist(artist.id);
          }}
          className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isSaved
              ? 'bg-[#8B3A4A] text-white shadow-xs'
              : 'bg-white/85 text-gray-600 hover:text-[#8B3A4A] hover:bg-white'
          }`}
          title={isSaved ? 'Saved in collection' : 'Save artist'}
          aria-label="Save artist"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Portrait inset overlapping bottom */}
        <div className="absolute -bottom-6 left-6 z-10">
          <img
            src={avatarSrc}
            alt={artist.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
            onError={() => setAvatarSrc('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')}
          />
        </div>
      </div>

      {/* Body Details */}
      <div className="pt-8 p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div
              className="cursor-pointer"
              onClick={() => viewArtistProfile(artist.id)}
            >
              <h3 className="font-serif-headline text-2xl font-normal text-gray-900 group-hover:text-[#8B3A4A] transition-colors leading-tight">
                {artist.name}
              </h3>
              <p className="text-xs font-semibold text-[#8B3A4A] mt-0.5">
                {artist.category}
              </p>
            </div>

            <button
              onClick={() => toggleFollowArtist(artist.id)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 border ${
                isFollowed
                  ? 'bg-[#F2E5E8] text-[#8B3A4A] border-[#E8D3D8]'
                  : 'bg-white hover:bg-[#F2E5E8]/50 hover:border-[#E8D3D8] text-gray-700 border-[#E7E7E4]'
              }`}
            >
              {isFollowed ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-[#8B3A4A]" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{artist.location}</span>
          </div>

          <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
            {artist.bio}
          </p>

          {/* Skills pills */}
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {artist.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-[11px] px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-600 border border-[#E7E7E4]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Metrics & Actions (Pink & White Buttons) */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <span className="font-bold text-gray-900">{artist.followersCount.toLocaleString()}</span> followers
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCollaborate}
              className="text-xs px-3 py-1.5 rounded-full text-gray-800 hover:text-[#8B3A4A] bg-white hover:bg-[#F2E5E8]/50 hover:border-[#E8D3D8] border border-[#E7E7E4] transition-colors font-medium shadow-2xs cursor-pointer"
            >
              Collaborate
            </button>
            <button
              onClick={() => viewArtistProfile(artist.id)}
              className="text-xs px-3.5 py-1.5 rounded-full font-semibold bg-[#8B3A4A] text-white hover:bg-[#732D3B] shadow-sm shadow-[#8B3A4A]/20 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Profile</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
