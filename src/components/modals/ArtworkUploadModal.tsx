import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ArtCategory } from '../../types';
import { X, Sparkles, UploadCloud, Check, Loader2, Tag, Info, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { storageService } from '../../services/storageService';

const SAMPLE_ART_IMAGES = [
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1200&q=80',
];

export const ArtworkUploadModal: React.FC = () => {
  const {
    uploadModalOpen,
    setUploadModalOpen,
    currentUser,
    addArtwork,
    updateArtwork,
    editingArtwork,
    setEditingArtwork,
    notify
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ArtCategory>('Visual Art');
  const [medium, setMedium] = useState('Mixed Media & Digital Ink');
  const [tagsInput, setTagsInput] = useState('Contemporary, Heritage, Cultural');
  const [imageUrl, setImageUrl] = useState(SAMPLE_ART_IMAGES[0]);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // AI Assistant states
  const [aiGenerating, setAiGenerating] = useState(false);
  const [roughNotes, setRoughNotes] = useState('');
  const [showAiHelper, setShowAiHelper] = useState(false);

  useEffect(() => {
    if (editingArtwork) {
      setTitle(editingArtwork.title || '');
      setDescription(editingArtwork.description || '');
      setCategory(editingArtwork.category || 'Visual Art');
      setMedium(editingArtwork.medium || 'Mixed Media');
      setTagsInput(editingArtwork.tags ? editingArtwork.tags.join(', ') : 'Contemporary, Original');
      setImageUrl(editingArtwork.imageUrl || SAMPLE_ART_IMAGES[0]);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Visual Art');
      setMedium('Mixed Media & Digital Ink');
      setTagsInput('Contemporary, Heritage, Cultural');
      setImageUrl(SAMPLE_ART_IMAGES[0]);
    }
    setUploadError(null);
    setUploadSuccess(false);
    setIsUploading(false);
  }, [editingArtwork, uploadModalOpen]);

  if (!uploadModalOpen) return null;

  const handleClose = () => {
    setUploadModalOpen(false);
    setEditingArtwork(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(false);

    // 1. Client file validation (type & size)
    const validation = storageService.validateFile(file, 'artwork');
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Upload to Supabase Storage artwork-images
    setIsUploading(true);
    try {
      const artistId = currentUser?.id || 'artist-1';
      const result = await storageService.uploadArtworkImage(file, artistId, editingArtwork?.id);
      setImageUrl(result.publicUrl);
      setUploadSuccess(true);
      notify('Artwork image uploaded successfully', 'success');
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed. Please try again.');
      notify(err.message || 'Image upload failed', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAiAssist = async () => {
    setAiGenerating(true);
    try {
      const response = await fetch('/api/gemini/artwork-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          draftDescription: roughNotes || description,
          category,
          medium
        })
      });

      const data = await response.json();
      if (data.success && data.result) {
        if (data.result.title) setTitle(data.result.title);
        if (data.result.description) setDescription(data.result.description);
        if (data.result.tags && Array.isArray(data.result.tags)) {
          setTagsInput(data.result.tags.join(', '));
        }
        if (data.result.suggestedCategory) {
          setCategory(data.result.suggestedCategory as ArtCategory);
        }
        notify('Title, description & tags generated by AI', 'success');
      }
    } catch (err: any) {
      notify('AI Assistant generated enhancements', 'info');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      notify('Please provide artwork title', 'error');
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingArtwork) {
      await updateArtwork(editingArtwork.id, {
        title,
        description: description || 'Original piece on ARTVERSE.',
        category,
        medium,
        tags: tagsArray.length > 0 ? tagsArray : ['Contemporary'],
        imageUrl: imageUrl || SAMPLE_ART_IMAGES[0]
      });
      handleClose();
      return;
    }

    await addArtwork({
      title,
      artistId: currentUser?.id || 'artist-1',
      artistName: currentUser?.name || 'Creator',
      artistAvatar:
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      artistLocation: (currentUser as any)?.location || 'Hyderabad, India',
      imageUrl: imageUrl || SAMPLE_ART_IMAGES[0],
      description: description || 'New original piece presented on ARTVERSE.',
      category,
      medium,
      tags: tagsArray.length > 0 ? tagsArray : ['Contemporary', 'Original'],
      isFeatured: false
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-[#E7E7E4] p-6 sm:p-8 shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8] mb-2">
            <UploadCloud className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>{editingArtwork ? 'Edit Artwork' : 'Curator Submission'}</span>
          </div>
          <h3 className="font-serif-headline text-3xl font-normal text-gray-900">
            {editingArtwork ? 'Update Artwork' : 'Publish Artwork to ARTVERSE'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {editingArtwork
              ? 'Update details or replace image for this portfolio piece.'
              : 'Showcase your craftsmanship to global explorers, patrons, and collectors.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Visual Artwork Selector & Supabase Storage File Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1.5">
              Artwork Image
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-2xl bg-gray-50 border border-[#E7E7E4]">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-200 shrink-0 ring-1 ring-gray-200 shadow-sm relative group">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.currentTarget.src = SAMPLE_ART_IMAGES[0];
                  }}
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-5 h-5 animate-spin text-[#8B3A4A]/70" />
                    <span className="text-[10px] mt-1 font-semibold">Uploading</span>
                  </div>
                )}
              </div>

              <div className="space-y-2.5 flex-1 w-full">
                {/* File Upload Trigger */}
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-[#F2E5E8] text-gray-800 hover:text-[#8B3A4A] border border-[#E7E7E4] hover:border-[#E8D3D8] transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B3A4A]" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5 text-[#8B3A4A]" />
                        <span>Choose Image File</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-gray-500">JPG, PNG, WEBP (max 15MB)</span>
                </div>

                {uploadSuccess && (
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Uploaded to Supabase Storage (artwork-images)</span>
                  </div>
                )}

                {uploadError && (
                  <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                    {uploadError}
                  </div>
                )}

                <input
                  type="url"
                  placeholder="Or paste direct image URL"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setUploadError(null);
                    setUploadSuccess(false);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B3A4A]"
                />

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">Sample art:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    {SAMPLE_ART_IMAGES.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setImageUrl(img);
                          setUploadError(null);
                          setUploadSuccess(false);
                        }}
                        className={`w-6 h-6 rounded-md overflow-hidden border-2 transition-transform shrink-0 cursor-pointer ${
                          imageUrl === img ? 'border-[#8B3A4A] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Artwork Assistant Banner */}
          <div className="p-4 rounded-2xl bg-[#F2E5E8]/70 border border-[#E8D3D8]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8B3A4A]" />
                <span className="text-xs font-bold text-[#8B3A4A]">
                  AI Artwork Description & Tag Assistant
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiHelper(!showAiHelper)}
                className="text-xs text-[#8B3A4A] font-semibold hover:underline cursor-pointer"
              >
                {showAiHelper ? 'Close AI Draft' : 'Refine with AI Draft'}
              </button>
            </div>

            {showAiHelper && (
              <div className="space-y-2 mt-3 pt-2 border-t border-[#E8D3D8]">
                <p className="text-[11px] text-gray-600">
                  Enter rough thoughts or theme, and AI will generate title, description, and tags:
                </p>
                <textarea
                  rows={2}
                  placeholder="e.g. Village temple at dawn with monsoon puddles reflecting lanterns..."
                  value={roughNotes}
                  onChange={(e) => setRoughNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B3A4A]"
                />
                <button
                  type="button"
                  disabled={aiGenerating}
                  onClick={handleAiAssist}
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#8B3A4A] hover:bg-[#732D3B] text-white flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Story & Tags</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                Artwork Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Fragments of Tomorrow"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B3A4A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ArtCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 focus:outline-none focus:border-[#8B3A4A]"
              >
                <option value="Visual Art">Visual Art</option>
                <option value="Digital Art">Digital Art</option>
                <option value="Photography">Photography</option>
                <option value="Design">Design</option>
                <option value="Music">Music</option>
                <option value="Dance">Dance</option>
                <option value="Film">Film</option>
                <option value="Writing">Writing</option>
                <option value="3D / Animation">3D / Animation</option>
              </select>
            </div>
          </div>

          {/* Medium */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Medium / Technique
            </label>
            <input
              type="text"
              placeholder="e.g. Gouache on Archival Paper / 35mm Film / Procreate"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B3A4A]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Artwork Story & Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the intention, emotional state, or cultural story..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B3A4A] leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#8B3A4A]" />
              <span>Tags (comma separated)</span>
            </label>
            <input
              type="text"
              placeholder="Contemporary, Urban, Abstract, Heritage"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7E7E4] text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#8B3A4A]"
            />
          </div>

          {/* Mandatory AI Disclaimer */}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 pt-1">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>AI-generated content should be reviewed and personalized before publishing.</span>
          </div>

          {/* Submit (Pink & White Buttons) */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-[#E7E7E4] hover:border-[#E8D3D8] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 rounded-full font-bold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white shadow-md shadow-[#8B3A4A]/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{editingArtwork ? 'Save Changes' : 'Publish to Gallery'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
