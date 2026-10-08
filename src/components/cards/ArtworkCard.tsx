import React from 'react';
import { motion } from 'framer-motion';
import { Artwork } from '../../types';
import { useApp } from '../../context/AppContext';
import { Heart, Bookmark, Eye, ArrowUpRight } from 'lucide-react';

interface ArtworkCardProps {
  artwork: Artwork;
  priority?: boolean;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork }) => {
  const {
    viewArtworkDetail,
    viewArtistProfile,
    likedArtworkIds,
    savedArtworkIds,
    toggleLikeArtwork,
    toggleSaveArtwork
  } = useApp();

  const [imgSrc, setImgSrc] = React.useState(artwork.imageUrl);
  const [avatarSrc, setAvatarSrc] = React.useState(artwork.artistAvatar);

  const isLiked = likedArtworkIds.includes(artwork.id);
  const isSaved = savedArtworkIds.includes(artwork.id);

  return (
    <motion.div
      onClick={() => viewArtworkDetail(artwork.id)}
      whileHover={{
        scale: 1.025,
        rotate: -0.75,
        y: -6
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 22,
        mass: 0.8
      }}
      className="editorial-card group relative overflow-hidden flex flex-col cursor-pointer bg-[#FFFFFF] will-change-transform"
    >
      {/* Visual Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3F3F0]">
        <img
          src={imgSrc}
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          onError={() => setImgSrc('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80')}
        />

        {/* Minimal Category Tag */}
        <div className="absolute top-3.5 left-3.5">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/90 text-[#111111] backdrop-blur-md border border-[#E7E7E4] shadow-sm">
            {artwork.category}
          </span>
        </div>

        {/* Floating Actions Overlay */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 opacity-90 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveArtwork(artwork.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isSaved
                ? 'bg-[#8B3A4A] text-white shadow-sm'
                : 'bg-white/90 text-gray-600 hover:text-[#8B3A4A] hover:bg-white'
            }`}
            title={isSaved ? 'Saved in collection' : 'Save artwork'}
            aria-label="Save artwork"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Editorial Card Info */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <div>
          <h4 className="font-serif-headline text-2xl font-normal text-gray-900 group-hover:text-[#8B3A4A] transition-colors line-clamp-1 leading-snug">
            {artwork.title}
          </h4>

          {/* Artist link */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              viewArtistProfile(artwork.artistId);
            }}
            className="flex items-center gap-2 mt-2 group/author cursor-pointer"
          >
            <img
              src={avatarSrc}
              alt={artwork.artistName}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-200"
              onError={() => setAvatarSrc('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-900 group-hover/author:text-[#8B3A4A] transition-colors">
                {artwork.artistName}
              </span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-[11px] text-gray-500 truncate max-w-[140px]">
                {artwork.artistLocation}
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Likes, Comments, View */}
        <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLikeArtwork(artwork.id);
              }}
              className={`flex items-center gap-1.5 transition-colors ${
                isLiked ? 'text-[#8B3A4A]' : 'text-gray-500 hover:text-[#8B3A4A]'
              }`}
              aria-label="Like artwork"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-[#8B3A4A]' : ''}`} />
              <span className="font-medium">{artwork.likesCount}</span>
            </button>

            <span className="text-[11px] text-gray-400 hidden sm:inline">
              {artwork.medium.split('(')[0].trim()}
            </span>
          </div>

          <span className="text-xs font-semibold text-gray-900 group-hover:text-[#8B3A4A] flex items-center gap-0.5">
            <span>View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};
