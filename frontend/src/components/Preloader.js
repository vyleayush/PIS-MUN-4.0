import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HERO_PHOTOS, COMMITTEE_LOGOS, ASSET } from "@/lib/assets";

const STATUS_MESSAGES = [
  "Summoning the General Assembly...",
  "Authenticating Diplomatic Portfolios...",
  "Reviewing Committee Agendas...",
  "Polishing the Golden Placards...",
  "Gaveling to Order · Chapter IV...",
  "Welcome, Distinguished Delegates.",
];

export const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);

  useEffect(() => {
    // 1. Proactive preloading of key assets
    const imagesToPreload = [
      ...HERO_PHOTOS,
      ...Object.values(COMMITTEE_LOGOS),
      ASSET.paramountPlacard,
      ASSET.groupPhoto,
      ASSET.school,
    ];

    let loadedCount = 0;
    const totalImages = imagesToPreload.length;

    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => {
        loadedCount += 1;
        // As images load, elevate target progress up to 90%
        targetProgress.current = Math.max(
          targetProgress.current,
          Math.min(90, Math.floor((loadedCount / totalImages) * 90))
        );
      };
    });

    // 2. Continuous smooth lerp towards 100%
    const startTime = Date.now();
    const minDuration = 1000; // 1.0s minimum for fast luxury feel

    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 250);

    const animFrame = () => {
      const elapsed = Date.now() - startTime;
      const timeRatio = Math.min(1, elapsed / minDuration);
      // S-curve easing for smooth natural acceleration and deceleration
      const easeTime =
        timeRatio < 0.5
          ? 2 * timeRatio * timeRatio
          : -1 + (4 - 2 * timeRatio) * timeRatio;

      const timeBasedTarget = Math.floor(easeTime * 100);
      const combinedTarget = Math.max(timeBasedTarget, targetProgress.current);

      // Lerp current progress towards combined target
      currentProgress.current += (combinedTarget - currentProgress.current) * 0.25;

      if (timeRatio >= 1 || currentProgress.current >= 98) {
        setProgress(100);
        clearInterval(statusInterval);
        setTimeout(() => {
          setIsFinished(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 200);
        }, 150);
      } else {
        setProgress(Math.floor(currentProgress.current));
        requestAnimationFrame(animFrame);
      }
    };

    const rafId = requestAnimationFrame(animFrame);

    // Failsafe: force complete after 1.8 seconds if it's struggling
    const failsafe = setTimeout(() => {
      setProgress(100);
      clearInterval(statusInterval);
      setIsFinished(true);
      if (onComplete) onComplete();
    }, 1800);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(statusInterval);
      clearTimeout(failsafe);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: "blur(10px)",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070A0F] text-[#F2F0EA] overflow-hidden select-none"
        >
          {/* Ambient golden glow spheres */}
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-20"
            style={{
              background: "radial-gradient(circle, #C7A35A 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full pointer-events-none opacity-20"
            style={{
              background: "radial-gradient(circle, #C7A35A 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          {/* Central Emblem & Brand Identity */}
          <div className="relative flex flex-col items-center">
            {/* Concentric orbital rings */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center mb-8">
              {/* Outer dashed spinning ring */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#C7A35A]/30 animate-spin-slow" />
              {/* Middle reverse solid ring with golden notch */}
              <div className="absolute inset-2 rounded-full border border-[#C7A35A]/20 animate-spin-reverse-slow">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#E7C978] shadow-[0_0_8px_#C7A35A]" />
              </div>
              {/* Glowing inner core ring */}
              <div className="absolute inset-5 rounded-full border border-[#C7A35A]/50 animate-pulse-gold" />

              {/* Inner Medallion */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-[#1E2A44] to-[#0E1426] border border-[#C7A35A]/70 flex flex-col items-center justify-center shadow-[0_0_35px_rgba(199,163,90,0.3)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(199,163,90,0.25),transparent_70%)]" />
                <span className="font-display text-2xl sm:text-3xl font-semibold text-[#E7C978] tracking-widest relative z-10">
                  IV
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] text-[#C7A35A] uppercase relative z-10 mt-0.5">
                  PIMUN
                </span>
              </motion.div>
            </div>

            {/* Typography */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center"
            >
              <span className="mono-label text-[#C7A35A] tracking-[0.25em] text-[10px] sm:text-[11px] block mb-1">
                PARAMOUNT INTERNATIONAL MUN
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-[#F2F0EA] tracking-wide">
                Chapter IV · 2026
              </h2>
            </motion.div>

            {/* Progress Counter & Bar */}
            <div className="w-64 sm:w-80 mt-8 flex flex-col items-center">
              {/* Numeric Percentage */}
              <div className="w-full flex justify-between items-baseline mb-2">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={statusIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="font-mono text-[11px] text-[#9A98A0] tracking-wider truncate max-w-[200px]"
                  >
                    {STATUS_MESSAGES[statusIndex]}
                  </motion.span>
                </AnimatePresence>
                <span className="font-mono text-xs text-[#E7C978] font-medium tabular-nums ml-2">
                  {progress}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-1 bg-[#1E2A44]/80 rounded-full overflow-hidden relative p-[1px] border border-[#C7A35A]/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#8F6F34] via-[#C7A35A] to-[#FBE7B6] rounded-full relative"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.1 }}
                >
                  {/* Leading glow head */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_2px_#E7C978]" />
                </motion.div>
              </div>
            </div>

            {/* Sub-label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 font-script text-[#C7A35A] text-lg sm:text-xl"
            >
              where the sharpest idea wins
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
