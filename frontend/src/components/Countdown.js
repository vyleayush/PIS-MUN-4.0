import React from "react";
import { useCountdown } from "@/hooks/useCountdown";

const Unit = ({ value, label, testid }) => (
  <div className="flex flex-col items-center rounded-xl sm:rounded-2xl border border-border/80 bg-white/[0.02] px-2.5 py-2.5 sm:px-4 sm:py-4 min-w-[58px] sm:min-w-[84px] shadow-sm">
    <span data-testid={testid} className="font-mono tabular-nums text-xl sm:text-4xl text-foreground font-semibold">
      {String(value).padStart(2, "0")}
    </span>
    <span className="mono-label text-muted-foreground mt-0.5 text-[8.5px] sm:text-[11px]">{label}</span>
  </div>
);

export const Countdown = ({ compact = false }) => {
  const { days, hours, minutes, seconds, phase } = useCountdown();

  if (phase !== "counting") {
    const map = {
      day1: { tag: "Happening now", text: "Day 1 is live" },
      day2: { tag: "Happening now", text: "Day 2 is live" },
      ended: { tag: "That's a wrap", text: "See you next chapter" },
    };
    const s = map[phase];
    return (
      <div data-testid="countdown-live-state" className="inline-flex items-center gap-3 rounded-2xl border border-[#3A2F18] bg-[#1A1710] px-5 py-4">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brass opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brass" />
        </span>
        <div>
          <div className="mono-label text-brass">{s.tag}</div>
          <div className="font-display text-2xl text-foreground leading-none mt-1">{s.text}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${compact ? "" : ""}`}>
      <Unit value={days} label="Days" testid="countdown-days" />
      <Unit value={hours} label="Hrs" testid="countdown-hours" />
      <Unit value={minutes} label="Min" testid="countdown-minutes" />
      <Unit value={seconds} label="Sec" testid="countdown-seconds" />
    </div>
  );
};
