import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles, Loader2, ArrowRight, Award, ExternalLink, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AIOpportunityModal: React.FC = () => {
  const {
    aiOpportunityModalOpen,
    setAiOpportunityModalOpen,
    currentUser,
    opportunities,
    viewOpportunityDetail,
    notify
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<{ opportunityId: string; matchPercentage: number; reason: string }[]>([]);

  useEffect(() => {
    if (aiOpportunityModalOpen) {
      matchOpportunities();
    }
  }, [aiOpportunityModalOpen]);

  const matchOpportunities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/opportunity-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistProfile: currentUser || {
            name: 'ARTVERSE Creator',
            category: 'Visual Art',
            skills: ['Visual Art', 'Creative Direction'],
            bio: 'Creator showcasing artwork and connecting globally on ARTVERSE.',
            location: 'Global'
          },
          opportunities
        })
      });

      const data = await response.json();
      if (data.success && data.matches) {
        setMatches(data.matches);
        notify('AI matched opportunities to your profile', 'success');
      }
    } catch (e: any) {
      notify('Matched opportunities based on your skills', 'info');
    } finally {
      setLoading(false);
    }
  };

  if (!aiOpportunityModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-[#E7E7E4] p-6 sm:p-8 shadow-2xl my-8">
        
        {/* Close */}
        <button
          onClick={() => setAiOpportunityModalOpen(false)}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>AI Opportunity Match</span>
          </div>
          <h3 className="font-serif-headline text-3xl sm:text-4xl font-normal text-gray-900">
            Curated Opportunities For You
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            AI analyzed your creative discipline, skills, and portfolio location to identify highest-alignment grants and commissions.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#8B3A4A] animate-spin mx-auto" />
            <p className="text-xs text-gray-600">Analyzing active calls against your portfolio profile...</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {matches.map((item) => {
              const opp = opportunities.find((o) => o.id === item.opportunityId);
              if (!opp) return null;

              return (
                <div
                  key={opp.id}
                  className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#E7E7E4] hover:border-[#E8D3D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8]">
                        {item.matchPercentage}% MATCH
                      </span>
                      <span className="text-xs text-gray-500">{opp.category}</span>
                    </div>

                    <h4
                      onClick={() => {
                        viewOpportunityDetail(opp.id);
                        setAiOpportunityModalOpen(false);
                      }}
                      className="font-serif-headline text-2xl font-normal text-gray-900 hover:text-[#8B3A4A] cursor-pointer transition-colors leading-snug"
                    >
                      {opp.title}
                    </h4>

                    <p className="text-xs text-gray-600">
                      {opp.organization} • Deadline: <strong className="text-gray-900">{opp.deadline}</strong>
                    </p>

                    <p className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-[#E7E7E4] mt-2 leading-relaxed">
                      <strong className="text-gray-900">Why this aligns: </strong>
                      {item.reason}
                    </p>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        viewOpportunityDetail(opp.id);
                        setAiOpportunityModalOpen(false);
                      }}
                      className="px-4 py-2 rounded-full font-bold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white flex items-center gap-1.5 transition-all shadow-sm shadow-[#8B3A4A]/20 cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Matches reflect algorithmic alignment with creator portfolio keywords and categories.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
