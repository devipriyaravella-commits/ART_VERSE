import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, Handshake, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CollaborationModal: React.FC = () => {
  const { collabModalTargetArtist, setCollabModalTargetArtist, currentUser, sendCollaboration, notify } = useApp();

  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('Illustration, Brand Identity');
  const [type, setType] = useState('Paid Commission');
  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState('₹45,000 / Negotiation open');
  const [timeline, setTimeline] = useState('4-6 Weeks');
  const [senderName, setSenderName] = useState(currentUser?.name || 'Alex Rivera');
  const [senderEmail, setSenderEmail] = useState(currentUser?.email || 'alex.curator@artverse.demo');

  if (!collabModalTargetArtist) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !message.trim()) {
      notify('Please provide project title and message', 'error');
      return;
    }

    const skillsArray = requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);

    sendCollaboration({
      senderId: currentUser?.id || 'guest-sender',
      senderName,
      senderEmail,
      receiverId: collabModalTargetArtist.id,
      projectTitle,
      projectDescription,
      requiredSkills: skillsArray,
      type,
      message,
      budget,
      timeline
    });

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    setCollabModalTargetArtist(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-[#E7E7E4] p-6 sm:p-8 shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={() => setCollabModalTargetArtist(null)}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <img
            src={collabModalTargetArtist.avatar}
            alt={collabModalTargetArtist.name}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#8B3A4A]/30"
          />
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#8B3A4A] font-semibold">
              <Handshake className="w-3.5 h-3.5" />
              <span>Direct Collaboration Request</span>
            </div>
            <h3 className="font-serif-headline text-2xl font-normal text-gray-900">
              Work with {collabModalTargetArtist.name}
            </h3>
            <p className="text-[11px] text-gray-500">
              {collabModalTargetArtist.category} • {collabModalTargetArtist.location}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-800 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-[#E7E7E4] text-gray-900 focus:bg-white focus:outline-none focus:border-[#8B3A4A]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-800 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-[#E7E7E4] text-gray-900 focus:bg-white focus:outline-none focus:border-[#8B3A4A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">
              Project Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Cultural Campaign Visuals / Pop-Up Exhibition"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-[#E7E7E4] text-gray-900 focus:bg-white focus:outline-none focus:border-[#8B3A4A]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">
              Project Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of the creative endeavor..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-[#E7E7E4] text-gray-900 focus:bg-white focus:outline-none focus:border-[#8B3A4A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-800 mb-1">
                Required Skills
              </label>
              <input
                type="text"
                placeholder="e.g. Illustration, Brand Identity"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-[#E7E7E4] text-gray-900 focus:bg-white focus:outline-none focus:border-[#8B3A4A]"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-800 mb-1">
                Timeline
              </label>
              <input
                type="text"
                placeholder="e.g. 4-6 Weeks / Immediate"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-[#E7E7E4] text-gray-900 focus:bg-white focus:outline-none focus:border-[#8B3A4A]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">
              Estimated Compensation / Budget
            </label>
            <input
              type="text"
              placeholder="e.g. ₹45,000 / $600 USD"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-[#E7E7E4] text-gray-900 focus:bg-white focus:outline-none focus:border-[#8B3A4A]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">
              Personal Message to Creator
            </label>
            <textarea
              rows={3}
              required
              placeholder="Share why you selected this artist, expectations, and vision..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-[#E7E7E4] text-gray-900 focus:bg-white focus:outline-none focus:border-[#8B3A4A] leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCollabModalTargetArtist(null)}
              className="px-4 py-2 rounded-full font-semibold text-gray-600 hover:text-gray-900 bg-white border border-[#E7E7E4] hover:border-[#E8D3D8] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full font-bold bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-md shadow-[#8B3A4A]/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Collaboration Proposal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
