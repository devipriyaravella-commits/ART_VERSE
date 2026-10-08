import React, { useState } from 'react';
import { Opportunity } from '../../types';
import { useApp } from '../../context/AppContext';
import { Calendar, Building2, ExternalLink, CheckCircle, Globe, Bookmark } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onApply?: () => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  const {
    notify,
    currentUser,
    setCurrentPage,
    viewOpportunityDetail,
    savedOpportunityIds,
    toggleSaveOpportunity
  } = useApp();

  const [applied, setApplied] = useState(false);
  const isSaved = savedOpportunityIds.includes(opportunity.id);

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      notify('Sign in to apply for this opportunity', 'info');
      setCurrentPage('login');
      return;
    }

    // Open detail modal so user sees full info before applying
    viewOpportunityDetail(opportunity.id);

    // If there's a real external URL, open it after a brief moment
    if (opportunity.applyUrl && opportunity.applyUrl.startsWith('http') && !opportunity.applyUrl.includes('demo')) {
      setTimeout(() => {
        window.open(opportunity.applyUrl, '_blank', 'noopener,noreferrer');
      }, 400);
      return;
    }

    // Mark as applied and celebrate
    setApplied(true);
    confetti({ particleCount: 80, spread: 65, origin: { y: 0.7 } });
    notify(`Application submitted for "${opportunity.title}"!`, 'success');
  };

  return (
    <div
      onClick={() => viewOpportunityDetail(opportunity.id)}
      className="editorial-card group p-6 sm:p-7 flex flex-col justify-between transition-all cursor-pointer bg-white border border-[#E7E7E4] shadow-xs"
    >
      <div>
        {/* Top Badges & Save */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8]">
              {opportunity.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-medium">
              Open
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-[#E7E7E4]">
              <Globe className="w-3 h-3 text-gray-500" />
              {opportunity.mode}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveOpportunity(opportunity.id);
            }}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isSaved ? 'text-[#8B3A4A]' : 'text-gray-400 hover:text-[#8B3A4A]'
            }`}
            title={isSaved ? 'Saved in collection' : 'Save opportunity'}
            aria-label="Save opportunity"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h4 className="font-serif-headline text-2xl sm:text-3xl font-normal text-gray-900 group-hover:text-[#8B3A4A] transition-colors leading-snug">
          {opportunity.title}
        </h4>

        {/* Organization */}
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
          <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-semibold text-gray-900">{opportunity.organization}</span>
          <span>•</span>
          <span>{opportunity.location}</span>
        </div>

        {/* Compensation / Prize callout */}
        {(opportunity.compensation || opportunity.prize) && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#F2E5E8]/70 border border-[#E8D3D8] flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
              Grant / Award
            </span>
            <span className="text-xs font-bold text-[#8B3A4A]">
              {opportunity.compensation || opportunity.prize}
            </span>
          </div>
        )}

        {/* Description snippet */}
        <p className="text-xs text-gray-600 mt-4 line-clamp-3 leading-relaxed">
          {opportunity.description}
        </p>
      </div>

      {/* Footer Details & Apply (Pink & White Buttons) */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>Deadline: <strong className="text-gray-900">{opportunity.deadline}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleApply}
            disabled={applied}
            className={`text-xs px-4 py-2 rounded-full font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              applied
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-sm shadow-[#8B3A4A]/20'
            }`}
          >
            {applied ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Applied</span>
              </>
            ) : (
              <>
                <span>Apply Now</span>
                <ExternalLink className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
