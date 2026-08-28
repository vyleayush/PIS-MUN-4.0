import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Sparkles, Compass, ShieldCheck, Flame, FileText } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { Hero3DScene } from "@/components/Hero3DScene";
import { HERO_PHOTOS } from "@/lib/assets";
import { usePrefersReducedMotion } from "@/hooks/useCountdown";

const HOLD = 5500;

function Sprinkles() {
  const bits = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        left: Math.random() * 100,
        size: 2.5 + Math.random() * 3,
        dur: 7 + Math.random() * 6,
        delay: -Math.random() * 8,
        drift: (Math.random() * 60 - 30).toFixed(0) + "px",
      })),
    []
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          className="pmun-sprinkle"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
            willChange: "transform",
            "--drift": b.drift,
          }}
        />
      ))}
    </div>
  );
}

function Wires() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-[4]"
      preserveAspectRatio="none"
      viewBox="0 0 1200 800"
      aria-hidden
    >
      <path
        d="M-20 210 C 300 120, 900 300, 1220 170"
        fill="none"
        stroke="rgba(199,163,90,0.35)"
        strokeWidth="1.2"
        strokeDasharray="6 4"
      />
      <path
        d="M-20 560 C 320 660, 880 480, 1220 610"
        fill="none"
        stroke="rgba(74,163,223,0.25)"
        strokeWidth="1.2"
      />
      <circle cx="300" cy="176" r="3" fill="#E7C978" opacity="0.9" />
      <circle cx="900" cy="243" r="3" fill="#E7C978" opacity="0.8" />
      <circle cx="880" cy="497" r="3" fill="#4AA3DF" opacity="0.7" />
    </svg>
  );
}

export const Hero = () => {
  const [index, setIndex] = useState(0);
  const reduced = usePrefersReducedMotion();
  const timer = useRef(null);

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 420], [1, 0]);
  const yShift = useTransform(scrollY, [0, 480], [0, -50]);
  const scale = useTransform(scrollY, [0, 480], [1, 1.05]);

  useEffect(() => {
    HERO_PHOTOS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (reduced) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % HERO_PHOTOS.length), HOLD);
    return () => clearInterval(timer.current);
  }, [reduced]);

  const zoomIn = index % 2 === 0;

  return (
    <section className="relative min-h-screen w-full overflow-hidden grain flex items-center justify-center">
      {/* Background Photo Parallax Layer */}
      <motion.div className="absolute inset-0 bg-[#070A0F]" style={reduced ? {} : { scale }}>
        <AnimatePresence mode="sync">
          <motion.img
            key={index}
            src={HERO_PHOTOS[index]}
            alt="Paramount International MUN"
            className="absolute inset-0 h-full w-full object-cover opacity-45"
            initial={{ opacity: 0, scale: reduced ? 1 : zoomIn ? 1 : 1.08 }}
            animate={{ opacity: 0.45, scale: reduced ? 1 : zoomIn ? 1.08 : 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.2 },
              scale: { duration: (HOLD + 1200) / 1000, ease: "linear" },
            }}
          />
        </AnimatePresence>
      </motion.div>

      {/* Scrim & Cinematic Lighting Gradients */}
      <div
        className="absolute inset-0 z-[3]"
        style={{
          background:
            "radial-gradient(1300px 700px at 50% 35%, rgba(7,10,15,0.4), rgba(7,10,15,0.85) 65%, rgba(7,10,15,0.96)), linear-gradient(180deg, rgba(7,10,15,0.65), rgba(7,10,15,0.95))",
        }}
      />

      <Wires />
      {!reduced && <Sprinkles />}

      {/* 3D Kinetic Model (Always running at high speed) */}
      {!reduced && <Hero3DScene />}

      {/* Content Container (transitions smoothly on scroll) */}
      <motion.div
        style={reduced ? {} : { opacity, y: yShift }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col items-center justify-center text-center pt-28 pb-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="flex flex-col items-center"
        >
          {/* SaaS Live Announcement Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="group relative inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-brass/40 bg-[#0E1426]/75 backdrop-blur-xl shadow-[0_0_20px_rgba(199,163,90,0.25)] hover:border-brass/70 transition-all cursor-default mb-4"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brass opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brass" />
            </span>
            <span className="mono-label text-brass text-[10px] sm:text-xs tracking-wider">
              Registrations Live · Chapter IV
            </span>
            <span className="text-secondary-foreground/60 text-xs hidden sm:inline">|</span>
            <span className="text-secondary-foreground/80 text-xs hidden sm:inline font-mono">
              9 &amp; 10 Oct 2026
            </span>
          </motion.div>

          {/* Script accent */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-script text-brass text-2xl sm:text-3xl mb-1 flex items-center gap-2"
          >
            <Sparkles size={18} className="text-brass animate-pulse" />
            chapter four is coming…
            <Sparkles size={18} className="text-brass animate-pulse" />
          </motion.div>

          {/* 3D Metallic Poster Title */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <div className="title-3d-sub mb-1">The</div>
            <h1 className="title-3d tracking-tight">
              Paramount<br />
              <span className="block text-gradient-gold">Model United Nations</span>
            </h1>
          </motion.div>

          {/* Subtitle / Punchline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-6 max-w-2xl text-base sm:text-lg text-secondary-foreground/90 leading-relaxed font-normal"
          >
            Two days. Five committees. One room where the loudest idea doesn't win — the sharpest one does. Chapter IV is now open.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.48 }}
            className="font-script text-brass text-2xl sm:text-3xl mt-3"
          >
            see you on the floor :)
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-8 flex flex-wrap gap-4 justify-center"
          >
            <Link
              to="/register"
              data-testid="hero-register-now-button"
              className="btn-luxury group inline-flex h-12 sm:h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-[#E7C978] via-[#C7A35A] to-[#D4AF37] px-8 sm:px-10 text-sm sm:text-base font-semibold text-[#070A0F] hover:shadow-[0_0_40px_rgba(199,163,90,0.8)] transition-all"
            >
              <Sparkles size={18} className="text-[#070A0F]" />
              <span>Register Now</span>
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>

            <button
              data-testid="hero-view-committees-button"
              onClick={() => document.querySelector("#committees")?.scrollIntoView({ behavior: "smooth" })}
              className="card-luxury inline-flex h-12 sm:h-14 items-center rounded-full border border-brass/40 bg-card/60 backdrop-blur-md px-7 sm:px-9 text-sm sm:text-base font-medium text-foreground hover:border-brass hover:text-brass transition-all"
            >
              View Committees
            </button>

            <button
              data-testid="hero-view-brochure-button"
              onClick={() => document.querySelector("#brochure")?.scrollIntoView({ behavior: "smooth" })}
              className="card-luxury inline-flex h-12 sm:h-14 items-center gap-2 rounded-full border border-brass/30 bg-brass/10 backdrop-blur-md px-6 sm:px-7 text-sm font-medium text-brass hover:bg-brass hover:text-[#070A0F] transition-all"
            >
              <FileText size={16} />
              <span>Brochure</span>
            </button>

            <button
              data-testid="hero-view-handbook-button"
              onClick={() => document.querySelector("#handbook")?.scrollIntoView({ behavior: "smooth" })}
              className="card-luxury inline-flex h-12 sm:h-14 items-center rounded-full border border-border/80 bg-card/40 backdrop-blur-md px-6 sm:px-7 text-sm font-medium text-muted-foreground hover:border-brass/50 hover:text-foreground transition-all"
            >
              Delegate Handbook
            </button>
          </motion.div>

          {/* Dates & Venue Info Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md hover:border-brass/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-brass/10 flex items-center justify-center text-brass">
                <Flame size={18} />
              </div>
              <div className="text-left">
                <div className="mono-label text-muted-foreground text-[10px]">Conference Dates</div>
                <div className="font-display text-xl sm:text-2xl text-foreground">9 &amp; 10 October 2026</div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md hover:border-brass/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-brass/10 flex items-center justify-center text-brass">
                <MapPin size={18} className="animate-bounce" style={{ animationDuration: "2.2s" }} />
              </div>
              <div className="text-left">
                <div className="mono-label text-muted-foreground text-[10px]">The Venue</div>
                <div className="font-display text-xl sm:text-2xl text-foreground">Paramount International School</div>
              </div>
            </div>
          </motion.div>

          {/* Countdown timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.75 }}
            className="mt-10 flex flex-col items-center gap-3 p-4 sm:p-5 rounded-3xl border border-brass/30 bg-card/50 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(199,163,90,0.15)]"
          >
            <div className="mono-label text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brass beacon-pulse" />
              <span>Countdown to Opening Plenary</span>
            </div>
            <Countdown />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Carousel photo indicator dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {HERO_PHOTOS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Photo slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? "w-8 bg-brass shadow-[0_0_10px_#C7A35A]" : "w-2 bg-white/20 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};
