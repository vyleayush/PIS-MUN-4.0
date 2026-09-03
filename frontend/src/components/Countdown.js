import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DAY1_START, DAY2_START, CONF_END, diff, usePrefersReducedMotion } from "@/hooks/useCountdown";
import { Sparkles, Calendar, Clock, ArrowRight } from "lucide-react";

// Day 1 & Day 2 Stages Definition
const STAGES = [
  {
    id: "day1",
    dayLabel: "Day 01",
    dateText: "Friday, 9 October 2026",
    shortDate: "9 Oct",
    target: DAY1_START,
    timing: "09:00 AM IST",
    event: "Opening Plenary & Committee Session I",
    badge: "Chapter IV Commences",
  },
  {
    id: "day2",
    dayLabel: "Day 02",
    dateText: "Saturday, 10 October 2026",
    shortDate: "10 Oct",
    target: DAY2_START,
    timing: "09:00 AM IST",
    event: "Crisis Session & Valedictory Ceremony",
    badge: "Crisis & Closing Gala",
  },
];

// Flip / Rolling Number Unit
const FlipDigitCard = ({ value, label, testid, compact = false, reducedMotion = false }) => {
  const formatted = String(value).padStart(2, "0");

  return (
    <div
      className={`relative flex flex-col items-center rounded-xl sm:rounded-2xl border border-brass/35 bg-gradient-to-b from-[#161B28]/95 to-[#0B0F19]/95 backdrop-blur-md overflow-hidden ${
        compact
          ? "px-2 py-2 min-w-[50px] sm:min-w-[62px]"
          : "px-2.5 py-2.5 sm:px-4 sm:py-3.5 min-w-[58px] sm:min-w-[86px]"
      }`}
      style={{ perspective: "600px" }}
    >
      {/* Subtle mechanical flip split-line */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/40 shadow-[0_1px_0_rgba(255,255,255,0.05)] z-20" />

      {/* Top highlight glare */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.04] to-transparent z-10" />

      {/* Number container with rolling / flip animation */}
      <div
        className={`relative overflow-hidden flex items-center justify-center ${
          compact ? "h-6 sm:h-8" : "h-8 sm:h-12"
        }`}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={formatted}
            data-testid={testid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1], // 600ms smooth cubic-bezier transition
            }}
            className={`font-mono tabular-nums font-bold text-foreground inline-block select-none ${
              compact
                ? "text-lg sm:text-2xl"
                : "text-2xl sm:text-4xl text-[#F4EBD0]"
            }`}
          >
            {formatted}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Unit label */}
      <span className="mono-label text-brass/85 mt-1 sm:mt-1.5 text-[8.5px] sm:text-[10px] tracking-wider uppercase z-20">
        {label}
      </span>
    </div>
  );
};

export const Countdown = ({ compact = false }) => {
  const reducedMotion = usePrefersReducedMotion();
  const [now, setNow] = useState(() => new Date());
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoTimerRef = useRef(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine conference live phase
  const isEnded = now >= CONF_END;
  const isDay2Live = now >= DAY2_START && now < CONF_END;
  const isDay1Live = now >= DAY1_START && now < DAY2_START;

  // Auto-transition between Day 1 and Day 2 (every 6 seconds)
  useEffect(() => {
    if (compact || isPaused || isEnded) return;

    autoTimerRef.current = setInterval(() => {
      setActiveStageIdx((prev) => (prev === 0 ? 1 : 0));
    }, 6000);

    return () => clearInterval(autoTimerRef.current);
  }, [compact, isPaused, isEnded]);

  // If live during day 2, default to day 2 target
  useEffect(() => {
    if (isDay2Live) {
      setActiveStageIdx(1);
    }
  }, [isDay2Live]);

  const currentStage = STAGES[activeStageIdx];
  const { days, hours, minutes, seconds } = diff(currentStage.target, now);

  // Live state banner once conference is underway
  if (isEnded || isDay1Live || isDay2Live) {
    const liveState = isEnded
      ? { tag: "That's a wrap", text: "See you in Chapter V", sub: "Paramount MUN 2026 concluded" }
      : isDay2Live
      ? { tag: "Day 02 In Session", text: "Crisis & Valedictory is Live", sub: "Paramount International School" }
      : { tag: "Day 01 In Session", text: "Opening Plenary is Live", sub: "Paramount International School" };

    return (
      <div
        data-testid="countdown-live-state"
        className="inline-flex items-center gap-3.5 rounded-2xl border border-brass/40 bg-gradient-to-r from-[#1A1710] to-[#0E1426] px-5 py-4 shadow-[0_0_25px_rgba(199,163,90,0.2)]"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brass opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-brass shadow-[0_0_10px_#C7A35A]" />
        </span>
        <div className="text-left">
          <div className="mono-label text-brass text-[10.5px] uppercase tracking-widest">{liveState.tag}</div>
          <div className="font-display text-xl sm:text-2xl text-foreground leading-tight mt-0.5">{liveState.text}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{liveState.sub}</div>
        </div>
      </div>
    );
  }

  // Compact mode for small cards / CTA sections
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <FlipDigitCard value={days} label="Days" testid="countdown-days" compact reducedMotion={reducedMotion} />
          <span className="text-brass/40 font-mono text-lg font-bold -mt-3">:</span>
          <FlipDigitCard value={hours} label="Hrs" testid="countdown-hours" compact reducedMotion={reducedMotion} />
          <span className="text-brass/40 font-mono text-lg font-bold -mt-3">:</span>
          <FlipDigitCard value={minutes} label="Min" testid="countdown-minutes" compact reducedMotion={reducedMotion} />
          <span className="text-brass/40 font-mono text-lg font-bold -mt-3">:</span>
          <FlipDigitCard value={seconds} label="Sec" testid="countdown-seconds" compact reducedMotion={reducedMotion} />
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-brass/80">
          <Calendar size={12} className="text-brass" />
          <span>9–10 October 2026</span>
        </div>
      </div>
    );
  }

  // Full Two-Stage Interactive Countdown
  return (
    <motion.div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      animate={
        reducedMotion
          ? {}
          : {
              boxShadow: [
                "0 15px 35px rgba(0,0,0,0.65), 0 0 16px rgba(199,163,90,0.12)",
                "0 20px 45px rgba(0,0,0,0.75), 0 0 32px rgba(199,163,90,0.28)",
                "0 15px 35px rgba(0,0,0,0.65), 0 0 16px rgba(199,163,90,0.12)",
              ],
            }
      }
      transition={{
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="relative flex flex-col items-center w-full max-w-xl mx-auto rounded-3xl border border-brass/40 bg-gradient-to-b from-[#101626]/90 via-[#0B0F19]/90 to-[#070A10]/95 backdrop-blur-xl p-4 sm:p-6 text-center shadow-[0_15px_40px_rgba(0,0,0,0.65),0_0_25px_rgba(199,163,90,0.18)] overflow-hidden"
    >
      {/* Decorative top brass accent line with subtle sheen */}
      <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-brass/60 to-transparent" />

      {/* Header Tagline: Two Days. One Experience. */}
      <div className="flex items-center gap-2 mb-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brass opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brass" />
        </span>
        <span className="mono-label text-brass text-[11px] sm:text-xs font-semibold tracking-widest uppercase">
          Two Days. One Experience.
        </span>
      </div>

      {/* Stage Selector Pills (Day 1 / Day 2 with auto-transition) */}
      <div className="inline-flex items-center p-1 rounded-full border border-brass/25 bg-black/40 backdrop-blur-sm mb-4">
        {STAGES.map((s, idx) => {
          const isActive = idx === activeStageIdx;
          return (
            <button
              key={s.id}
              onClick={() => {
                setActiveStageIdx(idx);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 8000);
              }}
              className={`relative px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-mono transition-all duration-300 flex items-center gap-1.5 ${
                isActive
                  ? "text-[#FDFBF7] font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activePill"
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-brass/80 to-[#D7B56B] shadow-[0_0_12px_rgba(199,163,90,0.4)]"
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Calendar size={12} className={isActive ? "text-background" : "text-brass"} />
                <span className={isActive ? "text-background font-bold" : ""}>{s.dayLabel}</span>
                <span className={`text-[10.5px] opacity-75 ${isActive ? "text-background/90" : ""}`}>
                  ({s.shortDate})
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Animated Date & Timing Info */}
      <div className="relative overflow-hidden h-12 sm:h-14 flex items-center justify-center w-full mb-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStage.id}
            initial={reducedMotion ? { opacity: 0 } : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: -16, opacity: 0 }}
            transition={{
              duration: 0.6, // 600ms transition
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex flex-col items-center justify-center"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-brass font-medium tracking-wide">
              <span>{currentStage.dateText}</span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-1 text-foreground/90 font-mono">
                <Clock size={12} className="text-brass" />
                {currentStage.timing}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground/90 font-sans mt-0.5 flex items-center gap-1.5">
              <Sparkles size={11} className="text-brass" />
              <span>{currentStage.event}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rolling / Flip Digit Countdown Units */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <FlipDigitCard value={days} label="Days" testid="countdown-days" reducedMotion={reducedMotion} />
        <span className="text-brass/40 font-mono text-xl sm:text-2xl font-bold -mt-4">:</span>
        <FlipDigitCard value={hours} label="Hours" testid="countdown-hours" reducedMotion={reducedMotion} />
        <span className="text-brass/40 font-mono text-xl sm:text-2xl font-bold -mt-4">:</span>
        <FlipDigitCard value={minutes} label="Minutes" testid="countdown-minutes" reducedMotion={reducedMotion} />
        <span className="text-brass/40 font-mono text-xl sm:text-2xl font-bold -mt-4">:</span>
        <FlipDigitCard value={seconds} label="Seconds" testid="countdown-seconds" reducedMotion={reducedMotion} />
      </div>

      {/* Auto-transition indicator footer */}
      <div className="mt-4 flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-muted-foreground/80">
        <span>Counting down to {currentStage.dayLabel} Opening</span>
        <span className="text-brass/40">•</span>
        <span className="text-brass/80 flex items-center gap-1">
          Auto-transitions Day 1 & Day 2 <ArrowRight size={10} />
        </span>
      </div>
    </motion.div>
  );
};

