import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight } from 'lucide-react';

interface CinematicHeroProps {
  onEnterArtverse: () => void;
}

const CAPTIONS = [
  { start: 0,  end: 3,  label: 'VISUAL ARTIST',  text: 'Every canvas begins with a vision.' },
  { start: 3,  end: 6,  label: 'SINGER',          text: 'Every voice deserves to be heard.' },
  { start: 6,  end: 9,  label: 'DANCER',          text: 'Every movement tells a story.' },
  { start: 9,  end: 12, label: 'PHOTOGRAPHER',    text: 'Every frame captures a moment.' },
  { start: 12, end: 16, label: 'FILMMAKER',        text: 'Every story starts with a vision.' },
  { start: 16, end: 20, label: 'DESIGNER',         text: 'Every idea can become something extraordinary.' },
];

export const CinematicHero: React.FC<CinematicHeroProps> = ({ onEnterArtverse }) => {
  const { setCurrentPage } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentCaption, setCurrentCaption] = useState<typeof CAPTIONS[0] | null>(null);
  const [captionVisible, setCaptionVisible] = useState(false);
  const captionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLabelRef = useRef<string | null>(null);

  const markVideoLoaded = useCallback(() => {
    setVideoLoaded(true);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (!videoLoaded && vid.currentTime > 0) {
      setVideoLoaded(true);
    }

    // Use modulo so captions cycle reliably on every loop iteration
    const t = vid.currentTime % 20;
    const active = CAPTIONS.find(c => t >= c.start && t < c.end);

    if (active) {
      if (lastLabelRef.current !== active.label) {
        lastLabelRef.current = active.label;
        setCaptionVisible(false);
        if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
        captionTimerRef.current = setTimeout(() => {
          setCurrentCaption(active);
          setCaptionVisible(true);
        }, 250);
      }
    } else {
      setCaptionVisible(false);
    }
  }, [videoLoaded]);

  // Reset caption label on each loop so captions re-trigger cleanly
  const handleVideoLoop = useCallback(() => {
    lastLabelRef.current = null;
    setCaptionVisible(false);
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    if (vid) {
      if (vid.readyState >= 2) {
        setVideoLoaded(true);
      }
      vid.play().catch(() => {
        // Autoplay policy fallback: muted video will still play
      });
    }

    return () => {
      if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
    };
  }, []);

  return (
    <div className="av-fullscreen-hero">

      {/* ── Top Bar Header: Brand & Quick Navigation ── */}
      <header className="absolute top-6 left-6 right-6 sm:left-12 sm:right-12 z-20 flex items-center justify-between">
        <div
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play().catch(() => {});
            }
          }}
          className="flex items-center gap-2 cursor-pointer select-none group"
          title="ARTVERSE"
        >
          <span className="font-serif-headline text-3xl sm:text-4xl font-normal tracking-tight text-[#FAFAF8] group-hover:text-[#E8B4A0] transition-colors">
            ARTVERSE
          </span>
          <span className="w-2 h-2 rounded-full bg-[#E8B4A0] mt-1" />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCurrentPage('signin');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className="px-4 py-2 rounded-full text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onEnterArtverse}
            className="px-5 py-2 rounded-full text-xs font-bold text-white bg-[#8B3A4A] hover:bg-[#732D3B] transition-all cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <span>Enter Artverse</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── Background video (looping) ── */}
      <video
        ref={videoRef}
        className={`av-bg-video${videoLoaded ? ' av-bg-video--visible' : ''}`}
        src="/artverse-hero.mp4"
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={markVideoLoaded}
        onCanPlay={markVideoLoaded}
        onPlay={markVideoLoaded}
        onPlaying={markVideoLoaded}
        onSeeked={handleVideoLoop}
      />

      {/* Cinematic gradient overlays */}
      <div className="av-overlay av-overlay--bottom" />
      <div className="av-overlay av-overlay--left" />
      <div className="av-overlay av-overlay--top" />

      {/* Loading spinner */}
      {!videoLoaded && (
        <div className="av-loading">
          <div className="av-loading__ring" />
        </div>
      )}

      {/* ── Live caption (right side, during video) ── */}
      <div className={`av-live-caption${captionVisible ? ' av-live-caption--visible' : ''}`}>
        {currentCaption && (
          <>
            <span className="av-live-caption__label">{currentCaption.label}</span>
            <p className="av-live-caption__text">"{currentCaption.text}"</p>
          </>
        )}
      </div>

      {/* ── Main content overlay (bottom-left) ── */}
      <div className="av-content">
        <div className="av-content__eyebrow">
          <span className="av-content__dot" />
          <span className="av-content__eyebrow-text">Visual Art · Music · Dance · Photography · Film · Design</span>
        </div>

        <h1 className="av-content__headline">
          Somewhere, someone is<br />
          creating <em className="av-content__accent">something<br />extraordinary.</em>
        </h1>

        <p className="av-content__sub">
          ARTVERSE connects undiscovered local talent with people,<br className="av-br-desktop" />
          projects and opportunities around the world.
        </p>

        <button className="av-enter-cta" onClick={() => onEnterArtverse()}>
          ENTER ARTVERSE
          <span className="av-enter-cta__arrow">→</span>
        </button>
      </div>
    </div>
  );
};
