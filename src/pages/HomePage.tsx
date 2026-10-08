import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Artist, Artwork, Opportunity } from '../types';
import {
  ArrowRight,
  Globe2,
  ArrowUpRight,
  Calendar,
  Building2,
  ExternalLink,
  MapPin,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const ENGAGEMENT_CHART_DATA = [
  { month: 'May', impressions: 3200, saves: 420 },
  { month: 'Jun', impressions: 5800, saves: 780 },
  { month: 'Jul', impressions: 9400, saves: 1350 },
  { month: 'Aug', impressions: 14200, saves: 2180 },
  { month: 'Sep', impressions: 19800, saves: 3100 },
  { month: 'Oct', impressions: 26500, saves: 4250 }
];

export const HomePage: React.FC = () => {
  const {
    artists,
    artworks,
    opportunities,
    setCurrentPage,
    setSelectedArtistId,
    setSelectedArtworkId,
    viewArtistProfile,
    viewArtworkDetail,
    viewOpportunityDetail,
    currentUser,
    toggleFollowArtist,
    notify
  } = useApp();

  const navigateTo = (page: any) => {
    setCurrentPage(page);
    setSelectedArtistId(null);
    setSelectedArtworkId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Guarantee strict artist deduplication by lowercase name
  const uniqueArtists = useMemo(() => {
    const seen = new Set<string>();
    const list: Artist[] = [];
    for (const a of artists) {
      const key = (a.name || '').toLowerCase().trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        list.push(a);
      }
    }
    return list;
  }, [artists]);

  // Dynamic database-driven featured creator for hero spotlight (used by artist sections)
  const featuredCreator = uniqueArtists.find((a) => a.isFeatured) || uniqueArtists[0];

  // SECTION 3: 3 Curated Artists (Excluding duplicate entries)
  const curatedArtists = useMemo(() => {
    return uniqueArtists.slice(0, 3);
  }, [uniqueArtists]);

  // SECTION 4: 6 Unique Artworks with guaranteed varied imagery
  const uniqueArtworks = useMemo(() => {
    const seenTitles = new Set<string>();
    const list: Artwork[] = [];
    for (const art of artworks) {
      if (!seenTitles.has(art.title.toLowerCase())) {
        seenTitles.add(art.title.toLowerCase());
        list.push(art);
      }
    }
    return list.slice(0, 6);
  }, [artworks]);

  // SECTION 6: 3 Rising creators with platform engagement velocity
  const emergingCreators = useMemo(() => {
    const rising = uniqueArtists.filter((a) => a.isRising);
    return (rising.length >= 3 ? rising : uniqueArtists).slice(0, 3);
  }, [uniqueArtists]);

  // SECTION 8: 3 Curated Opportunities
  const previewOpportunities = useMemo(() => {
    return opportunities.slice(0, 3);
  }, [opportunities]);

  const handleAuthAction = (actionMessage: string) => {
    if (!currentUser) {
      notify(actionMessage, 'info');
      setCurrentPage('login');
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-28 sm:space-y-36 pb-28 text-[#111111] bg-[#FAFAF8] font-sans">

      {/* ============================================================ */}
      {/* SECTION 1 — EDITORIAL HERO */}
      {/* ============================================================ */}
      <section className="pt-10 sm:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

          {/* Left: Headline + Buttons */}
          <div className="lg:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B3A4A]" />
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[#8B3A4A]">
                CONTEMPORARY GALLERY &amp; GLOBAL TALENT NETWORK
              </span>
            </div>

            <h1 className="font-serif-headline text-5xl sm:text-7xl lg:text-[80px] font-normal tracking-tight text-[#111111] leading-[1.04]">
              Somewhere, someone is creating{' '}
              <span className="italic text-[#8B3A4A]">something extraordinary.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#666666] max-w-xl leading-relaxed font-sans">
              ARTVERSE connects undiscovered local talent with people, projects
              and opportunities around the world.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={() => navigateTo('artists')}
                className="px-8 py-3.5 rounded-full font-semibold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white transition-all flex items-center justify-center gap-2 tracking-wide cursor-pointer shadow-sm hover:shadow-md"
              >
                <span>Explore Artists</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateTo('signin')}
                className="px-8 py-3.5 rounded-full font-semibold text-xs bg-[#FFFFFF] hover:bg-[#F2E5E8]/60 text-[#111111] border border-[#E7E7E4] hover:border-[#E8D3D8] hover:text-[#8B3A4A] transition-all tracking-wide text-center cursor-pointer"
              >
                Join ARTVERSE
              </button>
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-8 pt-4 border-t border-[#E7E7E4]">
              {[
                { label: 'Creators', value: '2,400+' },
                { label: 'Countries', value: '38' },
                { label: 'Opportunities', value: '900+' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="font-serif-headline text-2xl font-normal text-[#111111]">{stat.value}</p>
                  <p className="text-[11px] text-[#999999] uppercase tracking-widest font-sans">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Featured Creator Spotlight */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative aspect-[4/5] rounded-[28px] overflow-hidden border border-[#E7E7E4] bg-[#F3F3F0] group/spotlight cursor-pointer shadow-lg"
              onClick={() => featuredCreator && viewArtistProfile(featuredCreator.id)}
            >
              <img
                src={featuredCreator?.coverImage || featuredCreator?.avatar || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=80'}
                alt={`Creator Spotlight — ${featuredCreator?.name || 'Artist'}`}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/spotlight:scale-105"
                onError={(e: any) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-[#111111]/20 to-transparent" />
              <div className="absolute top-5 left-5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/60 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  CREATOR SPOTLIGHT
                </span>
              </div>
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
                <h3 className="font-serif-headline text-3xl font-normal text-white">
                  {featuredCreator?.name || 'Discover Creators'}
                </h3>
                <p className="text-xs text-white/75 font-sans">
                  {featuredCreator?.title} · {featuredCreator?.location}
                </p>
                <p className="text-[11px] text-[#F2E5E8]/70 font-sans line-clamp-2 pt-1">
                  {featuredCreator?.bio}
                </p>
              </div>
            </motion.div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white border border-[#E7E7E4] rounded-2xl px-4 py-3 shadow-md flex items-center gap-3 z-10">
              <div className="w-8 h-8 rounded-full bg-[#F2E5E8] flex items-center justify-center">
                <span className="text-[#8B3A4A] text-sm font-bold">✦</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#111111] tracking-wide">ARTVERSE</p>
                <p className="text-[10px] text-[#999999]">Global Creative Platform</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — THE CORE MESSAGE (Open Editorial Layout) */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16 border-t border-b border-[#E7E7E4]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Copy: Open Editorial Typography */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B3A4A] block">
                THE CORE REALITY
              </span>

              <h2 className="font-serif-headline text-4xl sm:text-6xl font-normal text-[#111111] leading-tight">
                Talent is everywhere.{' '}
                <span className="italic text-[#8B3A4A] block sm:inline">Opportunity isn't.</span>
              </h2>

              <p className="text-sm sm:text-base text-[#666666] leading-relaxed max-w-xl font-sans">
                Thousands of creators build extraordinary work in local studios, neighborhoods and independent creative spaces. Many struggle to reach audiences, collaborators and opportunities beyond their immediate geography.
              </p>

              <div className="pt-2 pl-4 border-l-2 border-[#8B3A4A]">
                <p className="text-sm sm:text-[15px] font-medium text-[#111111] leading-relaxed font-sans">
                  "ARTVERSE connects local creative talent with the people, projects and opportunities that can help their work travel further."
                </p>
              </div>
            </div>

            {/* Right Side: Ship / Voyage Artwork communicating distance & crossing borders */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden border border-[#E7E7E4] bg-[#F3F3F0]">
                <img
                  src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=80"
                  alt="Vessel on Open Waters — Reaching Beyond Borders"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                  onError={(e: any) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <p className="text-[11px] text-[#F2E5E8] uppercase tracking-wider font-semibold">
                    The Crossing
                  </p>
                  <p className="text-xs text-white/90 font-serif-headline italic">
                    From local creative roots to global cultural dialogues.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — MEET THE PEOPLE BEHIND THE WORK */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B3A4A] block mb-2">
              CURATED PROFILES
            </span>
            <h2 className="font-serif-headline text-3xl sm:text-5xl font-normal text-[#111111]">
              Meet the people behind the work.
            </h2>
          </div>

          <button
            onClick={() => navigateTo('artists')}
            className="text-xs font-semibold text-[#111111] hover:text-[#8B3A4A] flex items-center gap-1.5 transition-colors self-start md:self-end cursor-pointer group"
          >
            <span>View All Artists</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* 3 Unique Artist Cards: Editorial Creator Profiles without social clutter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {curatedArtists.map((artist) => (
            <div
              key={artist.id}
              className="p-6 sm:p-7 rounded-[24px] bg-[#FFFFFF] border border-[#E7E7E4] hover:border-[#8B3A4A] transition-all flex flex-col justify-between space-y-6 shadow-2xs"
            >
              <div className="space-y-4">
                {/* Header: Avatar, Name, Location */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-13 h-13 rounded-full object-cover ring-1 ring-[#E7E7E4] shrink-0"
                    onError={(e: any) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif-headline text-2xl font-normal text-[#111111] truncate">
                      {artist.name}
                    </h3>
                    <p className="text-xs text-[#666666] font-medium truncate">
                      {artist.category} · {artist.location}
                    </p>
                  </div>
                </div>

                {/* Short Bio */}
                <p className="text-xs text-[#666666] leading-relaxed line-clamp-3 font-sans">
                  {artist.bio}
                </p>

                {/* 2–3 Skills: Clean typographic separator, ZERO PILLS */}
                <div className="text-[11.5px] text-[#666666] font-medium flex items-center flex-wrap gap-1.5 pt-1">
                  {artist.skills.slice(0, 3).map((skill, sIdx) => (
                    <React.Fragment key={skill}>
                      <span>{skill}</span>
                      {sIdx < Math.min(2, artist.skills.length - 1) && (
                        <span className="text-[#999999]" aria-hidden="true">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Card Footer: Availability & Profile Link */}
              <div className="pt-4 border-t border-[#E7E7E4] flex items-center justify-between">
                <span className="text-[11px] text-[#666666] font-medium">
                  {artist.availability}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (handleAuthAction('Sign in to follow creators')) {
                        toggleFollowArtist(artist.id);
                      }
                    }}
                    className="text-xs font-semibold text-[#666666] hover:text-[#8B3A4A] transition-colors cursor-pointer px-2.5 py-1"
                  >
                    Follow
                  </button>

                  <button
                    onClick={() => viewArtistProfile(artist.id)}
                    className="text-xs font-semibold text-[#8B3A4A] hover:text-[#732D3B] flex items-center gap-1 transition-colors cursor-pointer group/link"
                  >
                    <span>Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-link:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — WORK WORTH STOPPING FOR (Asymmetric Editorial Gallery) */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B3A4A] block mb-2">
              FEATURED ARTWORK
            </span>
            <h2 className="font-serif-headline text-3xl sm:text-5xl font-normal text-[#111111]">
              Work worth stopping for.
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 font-sans">
              Explore selected works from creators building their own visual language.
            </p>
          </div>

          <button
            onClick={() => navigateTo('artwork')}
            className="text-xs font-semibold text-[#111111] hover:text-[#8B3A4A] flex items-center gap-1.5 transition-colors self-start md:self-end cursor-pointer group"
          >
            <span>Explore Artwork Gallery</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Asymmetric Editorial Artwork Layout: Lead Artwork + Balanced Secondary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Work 1 (Lead Prominent Artwork: 7 Cols) */}
          {uniqueArtworks[0] && (
            <div
              onClick={() => viewArtworkDetail(uniqueArtworks[0].id)}
              className="md:col-span-7 group rounded-[24px] overflow-hidden bg-[#FFFFFF] border border-[#E7E7E4] hover:border-[#8B3A4A] transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F3F3F0]">
                <img
                  src={uniqueArtworks[0].imageUrl}
                  alt={uniqueArtworks[0].title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e: any) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-serif-headline text-2xl sm:text-3xl font-normal text-[#111111] group-hover:text-[#8B3A4A] transition-colors">
                    {uniqueArtworks[0].title}
                  </h4>
                  <p className="text-xs text-[#666666] mt-0.5 font-sans">
                    {uniqueArtworks[0].artistName} · {uniqueArtworks[0].category}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#8B3A4A] flex items-center gap-1">
                  <span>View</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          )}

          {/* Work 2 (Side Artwork: 5 Cols) */}
          {uniqueArtworks[1] && (
            <div
              onClick={() => viewArtworkDetail(uniqueArtworks[1].id)}
              className="md:col-span-5 group rounded-[24px] overflow-hidden bg-[#FFFFFF] border border-[#E7E7E4] hover:border-[#8B3A4A] transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
            >
              <div className="relative aspect-[16/10] md:aspect-[4/3] w-full overflow-hidden bg-[#F3F3F0]">
                <img
                  src={uniqueArtworks[1].imageUrl}
                  alt={uniqueArtworks[1].title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e: any) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-serif-headline text-2xl font-normal text-[#111111] group-hover:text-[#8B3A4A] transition-colors">
                    {uniqueArtworks[1].title}
                  </h4>
                  <p className="text-xs text-[#666666] mt-0.5 font-sans">
                    {uniqueArtworks[1].artistName} · {uniqueArtworks[1].category}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#8B3A4A] flex items-center gap-1">
                  <span>View</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          )}

          {/* Work 3, 4, 5 (Tri-column Row: 4 Cols each) */}
          {uniqueArtworks.slice(2, 5).map((art) => (
            <div
              key={art.id}
              onClick={() => viewArtworkDetail(art.id)}
              className="md:col-span-4 group rounded-[24px] overflow-hidden bg-[#FFFFFF] border border-[#E7E7E4] hover:border-[#8B3A4A] transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3F3F0]">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e: any) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-serif-headline text-2xl font-normal text-[#111111] group-hover:text-[#8B3A4A] transition-colors">
                    {art.title}
                  </h4>
                  <p className="text-xs text-[#666666] mt-0.5 font-sans">
                    {art.artistName} · {art.category}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#8B3A4A] flex items-center gap-1">
                  <span>View</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — HOW DISCOVERY WORKS ON ARTVERSE */}
      {/* Horizontal Editorial Timeline on Desktop, Vertical on Mobile */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16 border-t border-b border-[#E7E7E4] space-y-12">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B3A4A] block mb-2">
              HOW DISCOVERY WORKS
            </span>
            <h2 className="font-serif-headline text-3xl sm:text-5xl font-normal text-[#111111]">
              From being unseen{' '}
              <span className="italic text-[#8B3A4A] block sm:inline">to being discovered.</span>
            </h2>
          </div>

          {/* 5-Step Editorial Journey */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 sm:gap-6 relative">
            {[
              {
                num: '01',
                title: 'UNSEEN',
                desc: 'Talent exists across local creative communities.'
              },
              {
                num: '02',
                title: 'DISCOVERED',
                desc: 'Creators build visible portfolios and are surfaced to relevant audiences.'
              },
              {
                num: '03',
                title: 'CONNECTED',
                desc: 'Artists meet curators, collaborators, brands and creative communities.'
              },
              {
                num: '04',
                title: 'COLLABORATING',
                desc: 'Talent turns into commissions, projects, exhibitions and creative partnerships.'
              },
              {
                num: '05',
                title: 'GLOBAL',
                desc: 'Local perspectives reach wider audiences and international opportunities.'
              }
            ].map((step, idx) => (
              <div key={step.num} className="space-y-3 relative group">
                <div className="text-xs font-mono font-medium text-[#8B3A4A] border-t border-[#E7E7E4] group-hover:border-[#8B3A4A] pt-3 transition-colors">
                  {step.num}
                </div>
                <h4 className="font-serif-headline text-2xl font-normal text-[#111111]">
                  {step.title}
                </h4>
                <p className="text-xs text-[#666666] leading-relaxed font-sans">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — BEFORE EVERYONE KNOWS THEIR NAME */}
      {/* Platform Engagement Data (Subtle Minimalist Chart + Velocity Cards) */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B3A4A] block mb-2">
              MOMENTUM & VELOCITY
            </span>
            <h2 className="font-serif-headline text-3xl sm:text-5xl font-normal text-[#111111]">
              Before everyone knows their name.
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 font-sans">
              Discover creators gaining meaningful attention across the ARTVERSE community.
            </p>
          </div>

          <button
            onClick={() => navigateTo('rising-talent')}
            className="text-xs font-semibold text-[#111111] hover:text-[#8B3A4A] flex items-center gap-1.5 transition-colors self-start md:self-end cursor-pointer group"
          >
            <span>Explore Rising Creators</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Clearly Labeled Subtle Chart (NOT a finance dashboard) */}
        <div className="p-6 sm:p-8 rounded-[24px] bg-[#FFFFFF] border border-[#E7E7E4] space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10.5px] uppercase font-bold tracking-widest text-[#8B3A4A] block">
                PLATFORM ENGAGEMENT DATA
              </span>
              <p className="text-xs text-[#666666] font-sans">
                Monthly audience discovery impressions and curator saves across emerging portfolios.
              </p>
            </div>
            <span className="text-xs font-medium text-[#666666]">
              Updated October 2026
            </span>
          </div>

          <div className="h-44 w-full pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ENGAGEMENT_CHART_DATA}>
                <defs>
                  <linearGradient id="artverseAccentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B3A4A" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8B3A4A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#999999" fontSize={11} tickLine={false} />
                <YAxis stroke="#999999" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: 'none',
                    padding: '8px 12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="#8B3A4A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#artverseAccentGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3 Emerging Creator Cards with Platform Engagement Velocity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {emergingCreators.map((creator) => (
            <div
              key={creator.id}
              onClick={() => viewArtistProfile(creator.id)}
              className="p-6 rounded-[24px] bg-[#FFFFFF] border border-[#E7E7E4] hover:border-[#8B3A4A] transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-2xs group"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-[#E7E7E4]"
                    onError={(e: any) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div className="min-w-0">
                    <h4 className="font-serif-headline text-2xl font-normal text-[#111111] group-hover:text-[#8B3A4A] transition-colors truncate">
                      {creator.name}
                    </h4>
                    <p className="text-xs text-[#666666] font-medium truncate">
                      {creator.title}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-[#666666] space-y-1 font-sans">
                  <p className="line-clamp-2">{creator.statement || creator.bio}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7E7E4] flex items-center justify-between text-xs text-[#666666]">
                <span className="font-medium text-[#8B3A4A]">{creator.viewsGrowth} Velocity</span>
                <span className="font-semibold text-[#111111] flex items-center gap-0.5 group-hover:text-[#8B3A4A] transition-colors">
                  <span>Explore Work</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — FROM LOCAL STUDIOS TO THE GLOBAL STAGE */}
      {/* Minimal Regional Visualization (Thin lines, white background, no neon) */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 rounded-[24px] bg-[#FFFFFF] border border-[#E7E7E4] space-y-10 shadow-2xs">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B3A4A] block">
              GLOBAL TALENT DISCOVERY
            </span>
            <h2 className="font-serif-headline text-3xl sm:text-5xl font-normal text-[#111111] leading-tight">
              From local studios{' '}
              <span className="italic text-[#8B3A4A] block sm:inline">to the global stage.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-sans">
              Discover creative voices across regions, communities and disciplines.
            </p>
          </div>

          {/* Minimal Regional Grid (White, thin lines, subtle markers) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { country: 'India', flag: '🇮🇳', region: 'South Asia', activeHub: 'Hyderabad & Mumbai' },
              { country: 'Japan', flag: '🇯🇵', region: 'East Asia', activeHub: 'Tokyo & Kyoto' },
              { country: 'United Kingdom', flag: '🇬🇧', region: 'Western Europe', activeHub: 'London' },
              { country: 'UAE', flag: '🇦🇪', region: 'Middle East', activeHub: 'Dubai' },
              { country: 'Nigeria', flag: '🇳🇬', region: 'West Africa', activeHub: 'Lagos' },
              { country: 'United States', flag: '🇺🇸', region: 'North America', activeHub: 'New York & SF' }
            ].map((node) => (
              <div
                key={node.country}
                onClick={() => navigateTo('global-stage')}
                className="p-4 rounded-[18px] bg-[#FAFAF8] border border-[#E7E7E4] hover:border-[#8B3A4A] transition-all cursor-pointer space-y-2 group"
              >
                <span className="text-2xl block">{node.flag}</span>
                <h4 className="font-serif-headline text-xl font-normal text-[#111111] group-hover:text-[#8B3A4A] transition-colors">
                  {node.country}
                </h4>
                <p className="text-[11px] text-[#666666] font-sans truncate">
                  {node.activeHub}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E7E7E4]">
            <p className="text-xs text-[#999999] font-sans">
              Curatorial and community representation across participating regions.
            </p>
            <button
              onClick={() => navigateTo('global-stage')}
              className="text-xs font-semibold text-[#8B3A4A] hover:text-[#732D3B] flex items-center gap-1.5 transition-colors cursor-pointer self-start"
            >
              <span>Explore Global Stage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — YOUR NEXT OPPORTUNITY IS WAITING */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B3A4A] block mb-2">
              OPPORTUNITY HUB
            </span>
            <h2 className="font-serif-headline text-3xl sm:text-5xl font-normal text-[#111111]">
              Your next opportunity is waiting.
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 font-sans">
              Find grants, residencies, exhibitions and creative calls that can move your work forward.
            </p>
          </div>

          <button
            onClick={() => navigateTo('opportunities')}
            className="text-xs font-semibold text-[#111111] hover:text-[#8B3A4A] flex items-center gap-1.5 transition-colors self-start md:self-end cursor-pointer group"
          >
            <span>View All Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* 3 Opportunity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewOpportunities.map((opp) => (
            <div
              key={opp.id}
              onClick={() => viewOpportunityDetail(opp.id)}
              className="p-6 sm:p-7 rounded-[24px] bg-[#FFFFFF] border border-[#E7E7E4] hover:border-[#8B3A4A] transition-all cursor-pointer flex flex-col justify-between space-y-5 shadow-2xs group"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-[#8B3A4A]">
                    {opp.category}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Open
                  </span>
                </div>

                <h4 className="font-serif-headline text-2xl font-normal text-[#111111] group-hover:text-[#8B3A4A] transition-colors leading-snug">
                  {opp.title}
                </h4>

                <div className="text-xs text-[#666666] space-y-1 font-sans">
                  <p className="font-medium text-[#111111]">{opp.organization}</p>
                  <p>{opp.location}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#F3F3F0] text-xs space-y-1 font-sans">
                  <span className="text-[10px] uppercase font-semibold text-[#666666] tracking-wider block">
                    Benefit / Award
                  </span>
                  <span className="font-semibold text-[#111111] block">
                    {opp.compensation || opp.prize || 'Exhibition & Production Grant'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E7E7E4] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#666666]">
                  <Calendar className="w-3.5 h-3.5 text-[#999999]" />
                  <span>{opp.deadline}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (handleAuthAction('Sign in to submit an application for this opportunity')) {
                      viewOpportunityDetail(opp.id);
                    }
                  }}
                  className="font-semibold text-[#8B3A4A] hover:text-[#732D3B] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — JOIN THE NETWORK (Dark ARTVERSE CTA Section) */}
      {/* ============================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-12 sm:p-20 rounded-[28px] bg-[#111111] text-white relative overflow-hidden space-y-7 shadow-xl">
          <span className="text-[11px] uppercase font-bold tracking-widest text-[#F2E5E8] block">
            START YOUR JOURNEY
          </span>

          <h2 className="font-serif-headline text-4xl sm:text-6xl lg:text-[68px] font-normal text-white max-w-2xl mx-auto leading-tight">
            Your talent deserves to be seen.
          </h2>

          <p className="text-sm sm:text-base text-gray-300 max-w-lg mx-auto leading-relaxed font-sans">
            Build your presence, discover opportunities, connect with collaborators and take your work further.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigateTo('signin')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white transition-all tracking-wide cursor-pointer"
            >
              Join ARTVERSE →
            </button>
            <button
              onClick={() => navigateTo('artists')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-xs bg-[#FFFFFF] hover:bg-[#FAFAF8] text-[#111111] transition-all tracking-wide cursor-pointer"
            >
              Explore Artists →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
