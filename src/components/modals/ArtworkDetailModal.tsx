import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabaseService, mapArtworkRowToArtwork, mapProfileToArtist } from '../../services/supabaseService';
import { Artwork, Artist, Comment } from '../../types';
import {
  X,
  Heart,
  Bookmark,
  Share2,
  Calendar,
  Tag,
  Send,
  MessageSquare,
  ArrowRight,
  MapPin,
  Handshake,
  Loader2,
  Pencil,
  Trash2,
  Check
} from 'lucide-react';

export const ArtworkDetailModal: React.FC = () => {
  const {
    selectedArtworkId,
    setSelectedArtworkId,
    artworks,
    artists,
    comments,
    likedArtworkIds,
    savedArtworkIds,
    toggleLikeArtwork,
    toggleSaveArtwork,
    addComment,
    updateComment,
    deleteComment,
    viewArtistProfile,
    setCollabModalTargetArtist,
    currentUser,
    setCurrentPage,
    notify
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [remoteArtwork, setRemoteArtwork] = useState<Artwork | null>(null);
  const [remoteArtist, setRemoteArtist] = useState<Artist | null>(null);
  const [remoteComments, setRemoteComments] = useState<Comment[] | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isArtworkLoading, setIsArtworkLoading] = useState(false);

  // Local fallback from artworks list
  const localArtwork = artworks.find((a) => a.id === selectedArtworkId);
  // Active artwork strictly matches selectedArtworkId
  const artwork = (remoteArtwork && remoteArtwork.id === selectedArtworkId) ? remoteArtwork : localArtwork;

  const localArtist = artwork
    ? (artists.find((a) => a.id === artwork.artistId) ||
       (currentUser && currentUser.id === artwork.artistId ? (currentUser as Artist) : null))
    : null;
  const artist = (remoteArtist && remoteArtist.id === artwork?.artistId) ? remoteArtist : localArtist;

  useEffect(() => {
    setRemoteArtwork(null);
    setRemoteArtist(null);
    setRemoteComments(null);
    setEditingCommentId(null);

    if (!selectedArtworkId) {
      setIsArtworkLoading(false);
      return;
    }

    let isMounted = true;
    const initialLocalArt = artworks.find((a) => a.id === selectedArtworkId);
    if (initialLocalArt) {
      setRemoteArtwork(initialLocalArt);
      const initialLocalArtist = artists.find((a) => a.id === initialLocalArt.artistId) ||
        (currentUser && currentUser.id === initialLocalArt.artistId ? (currentUser as Artist) : null);
      if (initialLocalArtist) setRemoteArtist(initialLocalArtist);
      setIsArtworkLoading(false);
    } else {
      setIsArtworkLoading(true);
    }

    supabaseService.getArtworkById(selectedArtworkId).then(async (row) => {
      if (!isMounted) return;
      if (!row) {
        setIsArtworkLoading(false);
        return;
      }
      let artistProfile = null;
      if (row.artist_id) {
        artistProfile = await supabaseService.getArtistById(row.artist_id);
      }
      if (isMounted) {
        const mappedArt = mapArtworkRowToArtwork(row, artistProfile);
        setRemoteArtwork(mappedArt);
        if (artistProfile) {
          setRemoteArtist(mapProfileToArtist(artistProfile));
        }
        setIsArtworkLoading(false);
      }
    }).catch((err) => {
      console.warn('[ARTVERSE] Remote artwork detail fetch:', err);
      if (isMounted) setIsArtworkLoading(false);
    });

    // Fetch comments from Supabase & realtime updates
    const fetchFreshComments = () => {
      supabaseService.getComments(selectedArtworkId).then((data) => {
        if (isMounted && data && data.length > 0) {
          setRemoteComments(data);
        }
      }).catch((err) => console.warn('[ARTVERSE] Remote comments fetch notice:', err));
    };

    fetchFreshComments();
    const unsubscribeComments = supabaseService.subscribeToArtworkComments(selectedArtworkId, () => {
      fetchFreshComments();
    });

    return () => {
      isMounted = false;
      unsubscribeComments();
    };
  }, [selectedArtworkId, artworks, artists, currentUser]);

  if (!selectedArtworkId) return null;

  // Show loading modal while fetching if not available locally
  if (selectedArtworkId && isArtworkLoading && !artwork) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedArtworkId(null);
        }}
      >
        <div className="relative w-full max-w-sm rounded-3xl bg-white border border-[#E7E7E4] p-8 text-center space-y-4 shadow-xl">
          <Loader2 className="w-8 h-8 text-[#8B3A4A] animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#666666] font-semibold">
            Loading artwork detail...
          </p>
          <button
            onClick={() => setSelectedArtworkId(null)}
            className="text-xs text-gray-500 hover:text-gray-900 underline"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (selectedArtworkId && !isArtworkLoading && !artwork) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedArtworkId(null);
        }}
      >
        <div className="relative w-full max-w-sm rounded-3xl bg-white border border-[#E7E7E4] p-8 text-center space-y-4 shadow-xl">
          <p className="text-sm font-semibold text-gray-800">Artwork not found</p>
          <p className="text-xs text-gray-500">The selected piece could not be loaded or is unavailable.</p>
          <button
            onClick={() => setSelectedArtworkId(null)}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#8B3A4A] text-white hover:bg-[#732D3B] transition-all cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!artwork) return null;

  const isLiked = likedArtworkIds.includes(artwork.id);
  const isSaved = savedArtworkIds.includes(artwork.id);

  // Comments (remote Supabase comments prioritized, falling back to local state)
  const artworkComments = remoteComments || comments.filter((c) => c.artworkId === artwork.id);

  // More from this artist
  const moreFromArtist = artworks
    .filter((a) => a.artistId === artwork.artistId && a.id !== artwork.id)
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      const shareUrl = new URL(window.location.origin + '/artwork');
      shareUrl.searchParams.set('artwork', artwork.id);
      navigator.clipboard.writeText(shareUrl.toString());
      notify(`Copied share link for "${artwork.title}"`, 'success');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!currentUser) {
      notify('Sign in to leave a comment on this piece', 'info');
      setCurrentPage('login');
      setSelectedArtworkId(null);
      return;
    }

    setIsSubmittingComment(true);
    try {
      await addComment(artwork.id, commentText);
      setCommentText('');
      // Reload comments
      supabaseService.getComments(artwork.id).then((fresh) => {
        if (fresh && fresh.length > 0) setRemoteComments(fresh);
      });
    } catch (err: any) {
      notify(err?.message || 'Failed to submit comment', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStartEdit = (c: Comment) => {
    setEditingCommentId(c.id);
    setEditingCommentText(c.text);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    try {
      await updateComment(commentId, editingCommentText);
      setEditingCommentId(null);
      // Update local remote state
      setRemoteComments((prev) =>
        prev ? prev.map((c) => (c.id === commentId ? { ...c, text: editingCommentText.trim() } : c)) : prev
      );
    } catch (err: any) {
      notify(err?.message || 'Failed to edit comment', 'error');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setRemoteComments((prev) =>
        prev ? prev.filter((c) => c.id !== commentId) : prev
      );
    } catch (err: any) {
      notify(err?.message || 'Failed to delete comment', 'error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedArtworkId(null);
      }}
    >
      <div className="relative w-full max-w-5xl rounded-3xl bg-white border border-[#E7E7E4] shadow-2xl overflow-hidden my-4 sm:my-8 flex flex-col lg:flex-row max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedArtworkId(null)}
          className="absolute top-4 right-4 z-20 text-gray-500 hover:text-gray-900 p-2 rounded-full bg-white/90 backdrop-blur-md border border-[#E7E7E4] hover:border-[#E8D3D8] transition-colors shadow-xs cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Artwork Large Presentation */}
        <div className="lg:w-7/12 bg-gray-100 flex items-center justify-center relative overflow-hidden p-6 sm:p-10">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-md ring-1 ring-black/5"
            onError={(e: any) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80';
            }}
          />
        </div>

        {/* Right: Editorial Information & Actions */}
        <div className="lg:w-5/12 flex flex-col justify-between overflow-y-auto p-6 sm:p-8 bg-white border-t lg:border-t-0 lg:border-l border-[#E7E7E4]">
          <div className="space-y-6">
            
            {/* Category & Date */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="px-3 py-1 rounded-full font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8]">
                {artwork.category}
              </span>

              <span className="flex items-center gap-1.5 text-gray-400">
                <Calendar className="w-3.5 h-3.5" />
                {artwork.createdAt}
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="font-serif-headline text-3xl sm:text-4xl font-normal text-gray-900 leading-tight">
                {artwork.title}
              </h2>
              <p className="text-xs text-gray-500 mt-1 font-medium">
                {artwork.medium}
              </p>
            </div>

            {/* Artist Mini Card */}
            <div
              onClick={() => {
                viewArtistProfile(artwork.artistId);
                setSelectedArtworkId(null);
              }}
              className="p-3.5 rounded-2xl bg-[#F8F9FA] hover:bg-[#F2E5E8]/50 border border-[#E7E7E4] hover:border-[#E8D3D8] transition-all flex items-center justify-between cursor-pointer group shadow-xs"
            >
              <div className="flex items-center gap-3">
                <img
                  src={artwork.artistAvatar}
                  alt={artwork.artistName}
                  className="w-11 h-11 rounded-xl object-cover ring-1 ring-gray-200"
                  onError={(e: any) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#8B3A4A] transition-colors">
                    {artwork.artistName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>{artwork.artistLocation}</span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-semibold text-gray-700 group-hover:text-[#8B3A4A] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>View Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                Artwork Description
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                {artwork.description}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {artwork.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-600 border border-[#E7E7E4] flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5 text-[#8B3A4A]" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Action Bar (Like, Save, Share) */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLikeArtwork(artwork.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                    isLiked
                      ? 'bg-[#F2E5E8] text-[#8B3A4A] border-[#E8D3D8]'
                      : 'bg-white hover:bg-[#F2E5E8]/50 hover:border-[#E8D3D8] text-gray-700 border-[#E7E7E4]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-[#8B3A4A]' : ''}`} />
                  <span>{artwork.likesCount} Likes</span>
                </button>

                <button
                  onClick={() => toggleSaveArtwork(artwork.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                    isSaved
                      ? 'bg-[#8B3A4A] text-white border-[#8B3A4A] shadow-xs'
                      : 'bg-white hover:bg-[#F2E5E8]/50 hover:border-[#E8D3D8] text-gray-700 border-[#E7E7E4]'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              <button
                onClick={handleShare}
                className="p-2 rounded-full text-gray-500 hover:text-[#8B3A4A] hover:bg-[#F2E5E8] border border-[#E7E7E4] transition-colors cursor-pointer"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Primary CTA: Collaborate with Artist (Pink Button) */}
            {artist && (
              <div>
                <button
                  onClick={() => {
                    setCollabModalTargetArtist(artist);
                    setSelectedArtworkId(null);
                  }}
                  className="w-full py-3 rounded-full font-bold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-md shadow-[#8B3A4A]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Handshake className="w-4 h-4" />
                  <span>Collaborate with {artwork.artistName}</span>
                </button>
              </div>
            )}

            {/* Community Comments */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-[#8B3A4A]" />
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Community Dialogue ({artworkComments.length})
                </h4>
              </div>

              {/* Comments List */}
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1 mb-3">
                {artworkComments.length > 0 ? (
                  artworkComments.map((c) => {
                    const isOwnComment = currentUser && currentUser.id === c.userId;
                    const isEditing = editingCommentId === c.id;

                    return (
                      <div key={c.id} className="p-3 rounded-xl bg-gray-50 border border-[#E7E7E4] text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={c.userAvatar}
                              alt={c.userName}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            <span className="font-bold text-gray-900">{c.userName}</span>
                            {isOwnComment && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F2E5E8] text-[#8B3A4A] font-semibold">
                                You
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">{c.createdAt}</span>
                            {isOwnComment && !isEditing && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(c)}
                                  className="text-gray-400 hover:text-[#8B3A4A] p-0.5 transition-colors cursor-pointer"
                                  title="Edit comment"
                                  aria-label="Edit comment"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(c.id)}
                                  className="text-gray-400 hover:text-red-600 p-0.5 transition-colors cursor-pointer"
                                  title="Delete comment"
                                  aria-label="Delete comment"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-1.5 pt-1">
                            <input
                              type="text"
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-[#E8D3D8] bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3A4A]"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(c.id)}
                              className="p-1 rounded-md bg-[#8B3A4A] text-white hover:bg-[#732D3B] transition-colors cursor-pointer"
                              title="Save changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              className="p-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-600 leading-relaxed break-words">{c.text}</p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 italic py-1">
                    No notes yet. Be the first to share feedback on this piece.
                  </p>
                )}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Share a thoughtful observation..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-full bg-gray-50 border border-[#E7E7E4] text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B3A4A] focus:bg-white"
                />
                <button
                  type="submit"
                  className="p-2 rounded-full bg-[#8B3A4A] hover:bg-[#732D3B] text-white transition-colors cursor-pointer shadow-xs"
                  aria-label="Post comment"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Related Artwork */}
            {moreFromArtist.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                  More from {artwork.artistName}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {moreFromArtist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedArtworkId(item.id)}
                      className="group cursor-pointer rounded-xl overflow-hidden aspect-video bg-gray-100 relative ring-1 ring-gray-200 hover:ring-[#8B3A4A] transition-all shadow-2xs"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
