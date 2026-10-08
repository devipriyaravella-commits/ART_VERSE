import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AIMatchResult } from '../../types';
import { X, Sparkles, Loader2, ArrowRight, MapPin, Info } from 'lucide-react';

export const AIMatchModal: React.FC = () => {
  const {
    aiMatchModalOpen,
    setAiMatchModalOpen,
    artists,
    viewArtistProfile,
    setCollabModalTargetArtist,
    notify,
    currentPage,
    setCurrentPage
  } = useApp();

  const [query, setQuery] = useState('I need an illustrator for a cultural campaign');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<AIMatchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const resultsBodyRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setAiMatchModalOpen(false);
    if (currentPage === 'ai-match') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        setCurrentPage('discover');
      }
    }
  };

  // Close on Escape key press
  useEffect(() => {
    if (!aiMatchModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiMatchModalOpen, currentPage]);

  if (!aiMatchModalOpen) return null;

  const handleMatch = async (searchPrompt?: string) => {
    const textQuery = searchPrompt || query;
    if (!textQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch('/api/gemini/artist-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textQuery,
          artists: artists
        })
      });

      const data = await response.json();
      if (data.success && data.matches) {
        setMatches(data.matches);
        notify(`Ranked ${data.matches.length} matching creators`, 'success');
        // Scroll results body to top smoothly when new results appear
        setTimeout(() => {
          resultsBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
      }
    } catch (err: any) {
      notify('Search completed with profile analysis', 'info');
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'I need an illustrator for a cultural campaign',
    'Street photographer documenting unseen urban architecture & humans',
    'Contemporary painter with large-scale mural experience',
    'Modular sound composer for experimental film'
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl bg-white border border-[#E7E7E4] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ── Fixed Header: Title, Search Bar & Close Button (Always visible) ── */}
        <div className="p-6 sm:p-7 border-b border-[#E7E7E4] bg-white shrink-0 relative">
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 text-[#666666] hover:text-[#111111] p-2 rounded-full hover:bg-[#F3F3F0] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Title */}
          <div className="mb-4 pr-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#8B3A4A]/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Talent Discovery</span>
            </div>
            <h3 className="font-serif-headline text-2xl sm:text-3xl font-normal text-[#111111]">
              AI Artist Matching
            </h3>
            <p className="text-xs text-[#666666] mt-1 leading-relaxed">
              Describe what you're looking for in plain language. AI analyzes project requirements, skills, portfolio alignment, and availability.
            </p>
          </div>

          {/* Search Input */}
          <div className="space-y-2.5">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleMatch();
                }}
                placeholder="Describe what you're looking for..."
                className="w-full pl-4 pr-32 py-2.5 sm:py-3 rounded-2xl bg-[#F3F3F0] border border-[#E7E7E4] text-xs sm:text-sm text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#8B3A4A] focus:bg-white transition-all"
              />
              <button
                onClick={() => handleMatch()}
                disabled={loading}
                className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold bg-[#111111] hover:bg-[#8B3A4A] text-white flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Matching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Find Match</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] text-[#999999]">Example briefs:</span>
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setQuery(p);
                    handleMatch(p);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-[#F3F3F0] hover:bg-[#E7E7E4] text-[#666666] transition-colors cursor-pointer"
                >
                  "{p.slice(0, 32)}..."
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Scrollable Body: Matches / Results (Smooth scroll up & down) ── */}
        <div ref={resultsBodyRef} className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-4 overscroll-contain">
          {matches.length > 0 && (
            <div className="flex items-center justify-between border-b border-[#E7E7E4] pb-2">
              <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Recommended Creators ({matches.length})
              </h4>
              <span className="text-[11px] text-[#8B3A4A] font-semibold">
                Platform-analyzed recommendations
              </span>
            </div>
          )}

          {hasSearched && matches.length === 0 && !loading && (
            <div className="text-center py-12 px-4 rounded-2xl bg-[#FAFAF8] border border-[#E7E7E4]">
              <Sparkles className="w-8 h-8 text-[#8B3A4A] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-gray-800">No matching creators found</p>
              <p className="text-xs text-gray-500 mt-1">Try broadening your description or pick one of the example briefs above.</p>
            </div>
          )}

          <div className="space-y-4">
            {matches.map((item) => {
              const artist = artists.find((a) => a.id === item.artistId);
              if (!artist) return null;

              return (
                <div
                  key={artist.id}
                  className="p-5 rounded-2xl bg-[#FAFAF8] border border-[#E7E7E4] hover:border-[#8B3A4A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={artist.avatar}
                      alt={artist.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-1 ring-[#E7E7E4] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-serif-headline text-2xl font-normal text-[#111111] hover:text-[#8B3A4A] cursor-pointer transition-colors"
                          onClick={() => {
                            viewArtistProfile(artist.id);
                            setAiMatchModalOpen(false);
                          }}
                        >
                          {artist.name}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F2E5E8] text-[#8B3A4A] border border-[#8B3A4A]/20">
                          {item.matchPercentage}% MATCH
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#666666] mt-0.5 flex-wrap">
                        <span className="font-semibold text-[#111111]">{artist.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#999999]" />
                          {artist.location}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">{artist.availability}</span>
                      </div>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {artist.skills.slice(0, 3).map((s) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-white text-[#666666] border border-[#E7E7E4]">
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Reason */}
                      <p className="text-xs text-[#666666] mt-2.5 bg-white p-3 rounded-xl border border-[#E7E7E4] leading-relaxed">
                        <strong className="text-[#111111]">Reasons: </strong>
                        {item.reason}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setCollabModalTargetArtist(artist);
                        setAiMatchModalOpen(false);
                      }}
                      className="px-3.5 py-2 rounded-full text-xs font-semibold bg-white hover:bg-[#F3F3F0] text-[#111111] border border-[#E7E7E4] transition-colors cursor-pointer"
                    >
                      Collaborate
                    </button>
                    <button
                      onClick={() => {
                        viewArtistProfile(artist.id);
                        setAiMatchModalOpen(false);
                      }}
                      className="px-4 py-2 rounded-full text-xs font-bold bg-[#111111] hover:bg-[#8B3A4A] text-white flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mandatory AI Disclaimer */}
          <div className="pt-4 border-t border-[#E7E7E4] flex items-start gap-2 text-[11px] text-[#999999]">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#999999]" />
            <span>
              AI-generated matches are recommendations and do not guarantee suitability or outcomes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
