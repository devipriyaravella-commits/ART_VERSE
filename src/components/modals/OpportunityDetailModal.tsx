import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Building2, ExternalLink, CheckCircle, Globe, Bookmark, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OpportunityDetailModal: React.FC = () => {
  const {
    selectedOpportunityId,
    setSelectedOpportunityId,
    opportunities,
    savedOpportunityIds,
    toggleSaveOpportunity,
    setAiOpportunityModalOpen,
    currentUser,
    setCurrentPage,
    notify
  } = useApp();

  const [applied, setApplied] = useState(false);

  if (!selectedOpportunityId) return null;

  const opportunity = opportunities.find((o) => o.id === selectedOpportunityId);
  if (!opportunity) return null;

  const isSaved = savedOpportunityIds.includes(opportunity.id);

  const handleApply = () => {
    if (!currentUser) {
      notify('Please login or sign in to submit your opportunity application', 'info');
      setSelectedOpportunityId(null);
      setCurrentPage('login');
      return;
    }

    setApplied(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    notify(`Application registered for "${opportunity.title}"`, 'success');
  };

  const related = opportunities.filter((o) => o.id !== opportunity.id && o.category === opportunity.category).slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-[#E7E7E4] p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close */}
        <button
          onClick={() => setSelectedOpportunityId(null)}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8]">
              {opportunity.category}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-[#E7E7E4]">
              {opportunity.mode}
            </span>
          </div>

          <h2 className="font-serif-headline text-3xl sm:text-4xl font-normal text-gray-900 leading-tight">
            {opportunity.title}
          </h2>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-bold text-gray-900">{opportunity.organization}</span>
            <span>•</span>
            <span>{opportunity.location}</span>
          </div>

          {/* Compensation / Award Banner */}
          {(opportunity.compensation || opportunity.prize) && (
            <div className="p-4 rounded-2xl bg-[#F2E5E8]/70 border border-[#E8D3D8] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B3A4A] block">
                  Compensation & Grant Support
                </span>
                <span className="font-serif-headline text-2xl font-normal text-gray-900">
                  {opportunity.compensation || opportunity.prize}
                </span>
              </div>
              <Award className="w-6 h-6 text-[#8B3A4A]" />
            </div>
          )}

          {/* Description */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
              Full Description
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {opportunity.description}
            </p>
          </div>

          {/* Requirements */}
          {opportunity.requirements && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                Submission Requirements
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-600 list-disc list-inside">
                {opportunity.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Eligibility */}
          {opportunity.eligibility && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                Eligibility
              </h4>
              <p className="text-xs text-gray-600">{opportunity.eligibility}</p>
            </div>
          )}

          {/* Action Row: Pink & White Buttons */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setAiOpportunityModalOpen(true);
                  setSelectedOpportunityId(null);
                }}
                className="px-4 py-2.5 rounded-full text-xs font-semibold bg-white hover:bg-[#F2E5E8] text-gray-800 hover:text-[#8B3A4A] border border-[#E7E7E4] hover:border-[#E8D3D8] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8B3A4A]" />
                <span>Find Opportunities For Me</span>
              </button>

              <button
                onClick={() => toggleSaveOpportunity(opportunity.id)}
                className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-[#8B3A4A] text-white border-[#8B3A4A] shadow-xs'
                    : 'bg-white hover:bg-[#F2E5E8] text-gray-600 hover:text-[#8B3A4A] border-[#E7E7E4]'
                }`}
                title={isSaved ? 'Saved' : 'Save opportunity'}
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleApply}
              disabled={applied}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                applied
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-md shadow-[#8B3A4A]/25'
              }`}
            >
              {applied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Application Submitted</span>
                </>
              ) : (
                <>
                  <span>Apply for Opportunity</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Related Opportunities */}
          {related.length > 0 && (
            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                Related Creative Calls
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {related.map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => setSelectedOpportunityId(opp.id)}
                    className="p-3.5 rounded-2xl bg-gray-50 hover:bg-[#F2E5E8]/40 border border-[#E7E7E4] hover:border-[#E8D3D8] cursor-pointer transition-colors shadow-2xs"
                  >
                    <span className="text-[11px] font-semibold text-[#8B3A4A] block mb-1">
                      {opp.category}
                    </span>
                    <h5 className="font-serif-headline text-lg font-normal text-gray-900 line-clamp-1">
                      {opp.title}
                    </h5>
                    <p className="text-[11px] text-gray-500 mt-0.5">{opp.organization}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
