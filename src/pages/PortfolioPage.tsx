import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Palette,
  PlusCircle,
  Sparkles,
  Trash2,
  Heart,
  Bookmark,
  Eye,
  MessageSquare,
  ExternalLink,
  Edit3
} from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const {
    artworks,
    currentUser,
    deleteArtwork,
    setUploadModalOpen,
    setAiPortfolioModalOpen,
    viewArtworkDetail,
    viewArtistProfile,
    setEditingArtwork
  } = useApp();

  const userArtworks = artworks.filter(
    (a) => a.artistId === currentUser?.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FAFAF8]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8] mb-2">
            <Palette className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Portfolio Management</span>
          </div>
          <h1 className="font-serif-headline text-3xl sm:text-5xl font-normal text-gray-900">
            My Public Portfolio ({userArtworks.length})
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Curate and manage the artwork visible to international collectors, curators, and clients worldwide.
          </p>
        </div>

        {/* Pink & White Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setAiPortfolioModalOpen(true)}
            className="px-4 py-2.5 rounded-full font-semibold text-xs bg-white hover:bg-[#F2E5E8] text-gray-800 hover:text-[#8B3A4A] border border-[#E7E7E4] hover:border-[#E8D3D8] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>AI Bio & Skills</span>
          </button>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-5 py-2.5 rounded-full font-bold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-md shadow-[#8B3A4A]/25 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Piece</span>
          </button>
        </div>
      </div>

      {/* Artworks List / Grid */}
      {userArtworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userArtworks.map((art) => (
            <div
              key={art.id}
              className="rounded-3xl overflow-hidden bg-white border border-[#E7E7E4] flex flex-col justify-between group transition-all shadow-xs hover:border-[#E8D3D8] hover:shadow-md"
            >
              <div
                className="relative aspect-video w-full overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => viewArtworkDetail(art.id)}
              >
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent opacity-60" />

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 text-gray-900 border border-[#E7E7E4] backdrop-blur-md shadow-xs">
                    {art.category}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4
                    onClick={() => viewArtworkDetail(art.id)}
                    className="font-serif-headline text-2xl font-normal text-gray-900 hover:text-[#8B3A4A] cursor-pointer transition-colors"
                  >
                    {art.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {art.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {art.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-[#E7E7E4]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Performance stats & Delete */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[#8B3A4A]">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{art.likesCount}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[#8B3A4A]">
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                      <span>{art.savesCount}</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{art.viewsCount}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewArtworkDetail(art.id)}
                      className="text-xs text-gray-600 hover:text-[#8B3A4A] transition-colors p-1"
                      title="View Details"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingArtwork(art);
                        setUploadModalOpen(true);
                      }}
                      className="text-xs text-gray-600 hover:text-[#8B3A4A] transition-colors p-1 cursor-pointer"
                      title="Edit Artwork"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteArtwork(art.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 transition-colors p-1 cursor-pointer"
                      title="Remove from portfolio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-3xl bg-white border border-[#E7E7E4] shadow-xs">
          <Palette className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-serif-headline text-2xl font-normal text-gray-900">Your portfolio is empty</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Upload your first artwork to start getting discovered by curators worldwide.
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="mt-5 px-6 py-2.5 rounded-full font-bold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-md shadow-[#8B3A4A]/25 inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Artwork</span>
          </button>
        </div>
      )}
    </div>
  );
};
