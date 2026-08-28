import { useState, useEffect } from "react";

// Conference schedule (IST)
export const DAY1_START = new Date("2026-10-09T09:00:00+05:30");
export const DAY2_START = new Date("2026-10-10T09:00:00+05:30");
export const CONF_END = new Date("2026-10-10T18:00:00+05:30");

function diff(target, now) {
  let d = Math.max(0, target - now);
  const days = Math.floor(d / 86400000); d -= days * 86400000;
  const hours = Math.floor(d / 3600000); d -= hours * 3600000;
  const minutes = Math.floor(d / 60000); d -= minutes * 60000;
  const seconds = Math.floor(d / 1000);
  return { days, hours, minutes, seconds };
}

// phase: 'counting' | 'day1' | 'day2' | 'ended'
export function useCountdown() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  let phase = "counting";
  if (now >= CONF_END) phase = "ended";
  else if (now >= DAY2_START) phase = "day2";
  else if (now >= DAY1_START) phase = "day1";

  return { ...diff(DAY1_START, now), phase };
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);
  return reduced;
}
