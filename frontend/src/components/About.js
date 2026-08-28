import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { ASSET } from "@/lib/assets";
import { Award, Compass, Shield, Users } from "lucide-react";

const STATS = [
  { value: "05", label: "Specialized Committees", icon: Compass },
  { value: "250+", label: "Delegates Last Chapter", icon: Users },
  { value: "IV", label: "Historic Chapter", icon: Award },
  { value: "02", label: "Days of Intense Debate", icon: Shield },
];

function AnimatedStatValue({ target }) {
  const [display, setDisplay] = useState(target === "IV" ? "I" : target.startsWith("0") ? "00" : "0");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  useEffect(() => {
    if (!isInView) return;

    if (target === "IV") {
      const romans = ["I", "II", "III", "IV"];
      let idx = 0;
      const interval = setInterval(() => {
        setDisplay(romans[idx]);
        idx++;
        if (idx >= romans.length) clearInterval(interval);
      }, 200);
      return () => clearInterval(interval);
    }

    const numMatch = target.match(/\d+/);
    const suffix = target.replace(/\d+/g, "");
    const padZeros = target.startsWith("0");
    if (!numMatch) {
      setDisplay(target);
      return;
    }

    const end = parseInt(numMatch[0], 10);
    let current = 0;
    const duration = 1200;
    const stepTime = 25;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      let formatted = Math.floor(current).toString();
      if (padZeros && formatted.length < 2) formatted = "0" + formatted;
      setDisplay(formatted + suffix);
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref} className="tabular-nums">{display}</span>;
}

export const About = () => (
  <section id="about" className="section-lazy relative py-20 sm:py-28 scroll-mt-20 overflow-hidden">
    {/* Decorative background glow */}
    <div
      className="absolute top-1/2 left-0 w-96 h-96 rounded-full pointer-events-none opacity-15"
      style={{
        background: "radial-gradient(circle, #C7A35A 0%, transparent 70%)",
        filter: "blur(80px)",
      }}
    />

    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-7">
          <Reveal>
            <div className="mono-label text-brass mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brass" />
              / About the conference
            </div>
            <h2 className="section-heading text-foreground max-w-xl">
              Not another certificate-farm MUN.
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-6 space-y-4 max-w-xl text-secondary-foreground/85 leading-relaxed text-base sm:text-lg">
              <p>
                Most conferences hand you a placard and hope for the best. We don't. Paramount International MUN is built around one belief: a good delegate isn't the one who talks the most — it's the one who moves the room.
              </p>
              <p>
                Real agendas. Executive boards that push you. Committees that reward research, not volume. Whether it's your first placard or your fortieth, you'll leave sharper than you came.
              </p>
            </div>
          </Reveal>
        </div>
        <div className="lg:col-span-5">
          <Reveal delay={0.1}>
            <TiltCard className="rounded-3xl overflow-hidden border border-border/80 grain glow-hover transition-all duration-500 hover:border-brass/70 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
              <img
                src={ASSET.paramountPlacard}
                alt="The Paramount Model United Nations"
                loading="lazy"
                className="w-full h-72 sm:h-84 object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div>
                  <div className="mono-label text-brass text-[10px]">On the floor</div>
                  <div className="font-display text-2xl sm:text-3xl text-foreground">The Paramount MUN</div>
                </div>
                <span className="mono-label text-[10px] text-brass px-3 py-1 rounded-full border border-brass/40 bg-[#070A0F]/80 backdrop-blur-md">
                  Chapter IV
                </span>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>

      {/* SaaS Metric Cards */}
      <Reveal delay={0.15}>
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <TiltCard
                key={s.label}
                className="rounded-2xl border border-border/80 bg-gradient-to-b from-[#0E1426]/70 to-[#070A0F]/70 backdrop-blur-xl p-6 sm:p-7 flex flex-col justify-between group hover:border-brass/60 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brass/10 border border-brass/20 flex items-center justify-center text-brass group-hover:bg-brass group-hover:text-[#070A0F] transition-colors">
                    <Icon size={20} />
                  </div>
                  <span className="mono-label text-muted-foreground/60 text-[10px]">
                    0{idx + 1}
                  </span>
                </div>
                <div>
                  <span className="font-display text-4xl sm:text-5xl text-brass group-hover:text-[#FBE7B6] transition-colors block">
                    <AnimatedStatValue target={s.value} />
                  </span>
                  <span className="mono-label text-muted-foreground group-hover:text-foreground/90 mt-2 block text-xs">
                    {s.label}
                  </span>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </Reveal>
    </div>
  </section>
);
