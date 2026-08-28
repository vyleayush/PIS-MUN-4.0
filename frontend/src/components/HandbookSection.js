import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Flame, Compass, FileText, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { PERSONAS } from "@/lib/handbookContent";

const EASE = [0.22, 1, 0.36, 1];

const QUICK_TIPS = [
  {
    icon: Flame,
    title: "Speak in Hour One",
    desc: "Break the seal early. The longer you hold your placard down, the heavier it feels.",
    badge: "Floor Rule #1",
  },
  {
    icon: Compass,
    title: "3 Essential Motions",
    desc: "GSL, Moderated Caucus, and Unmod. Master these 3 and you will command the room.",
    badge: "Procedure",
  },
  {
    icon: ShieldCheck,
    title: "The Redirect Defense",
    desc: "When challenged on POIs, concede minor details and pivot back to your core thesis.",
    badge: "Tactics",
  },
  {
    icon: FileText,
    title: "The 1-Page Doctrine",
    desc: "If your country policy doesn't fit on one crisp page, you don't fully command it yet.",
    badge: "Research",
  },
];

export const HandbookSection = () => {
  const [activePersonaId, setActivePersonaId] = useState(PERSONAS[0].id);
  const [checkedItems, setCheckedItems] = useState({});

  const persona = PERSONAS.find((p) => p.id === activePersonaId) || PERSONAS[0];

  const handleToggleCheck = (index) => {
    const key = `${activePersonaId}-${index}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const checkedCount = persona.diagnostic.items.filter(
    (_, i) => checkedItems[`${activePersonaId}-${i}`]
  ).length;

  return (
    <section id="handbook" className="section-lazy relative py-20 sm:py-28 scroll-mt-20 overflow-hidden">
      {/* Dynamic Background Glows */}
      <div
        className="absolute -top-32 right-1/4 w-96 h-96 rounded-full pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, #C7A35A 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="absolute -bottom-32 left-1/6 w-96 h-96 rounded-full pointer-events-none opacity-15"
        style={{
          background: "radial-gradient(circle, #4AA3DF 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Reveal>
              <div className="mono-label text-brass mb-3 flex items-center gap-2">
                <BookOpen size={15} className="text-brass" />
                <span>/ The Delegate Diaries</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-brass animate-pulse" />
              </div>
              <h2 className="section-heading text-foreground">
                The Delegate Handbook.
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-4 max-w-2xl text-base sm:text-lg text-secondary-foreground/80 leading-relaxed">
                A field manual written for the floor — zero filler, pure tactical clarity.
                Select your delegate persona below to unlock tailored battleplans and speech skeletons.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <Link
              to="/handbook"
              data-testid="handbook-section-view-full"
              className="btn-luxury inline-flex items-center gap-2 self-start md:self-auto rounded-full border border-brass/40 bg-card/80 backdrop-blur-md px-6 py-3 text-sm font-medium text-foreground hover:border-brass hover:text-brass transition-all shadow-[0_0_20px_rgba(199,163,90,0.2)]"
            >
              <Sparkles size={16} className="text-brass" />
              <span>Open Full Manual</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        {/* Persona Selector Tabs */}
        <Reveal delay={0.15}>
          <div className="mt-12 flex flex-wrap gap-2.5 p-1.5 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-xl max-w-fit">
            {PERSONAS.map((p) => {
              const isActive = p.id === activePersonaId;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePersonaId(p.id)}
                  data-testid={`handbook-section-tab-${p.id}`}
                  className={`relative px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? "text-[#070A0F] font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeHandbookTab"
                      className="absolute inset-0 bg-gradient-to-r from-[#E7C978] via-[#C7A35A] to-[#D4AF37] rounded-xl shadow-[0_0_20px_rgba(199,163,90,0.5)]"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{p.tab}</span>
                  {isActive && (
                    <span className="relative z-10 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/20 text-[#070A0F]">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Persona Active View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePersonaId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mt-8 grid lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left: Persona Overview & Diagnostic Card */}
            <div className="lg:col-span-7 space-y-6">
              <TiltCard className="rounded-2xl border border-border bg-card/60 backdrop-blur-md p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="mono-label px-3 py-1 rounded-full border border-brass/30 bg-brass/10 text-brass text-xs">
                    {persona.statusTag}
                  </span>
                  <span className="mono-label text-muted-foreground text-xs">
                    Chapter IV Field Kit
                  </span>
                </div>

                <h3 className="font-display text-3xl sm:text-4xl text-foreground mt-4">
                  {persona.hero}{" "}
                  <span className="italic text-brass font-normal">
                    — {persona.subtitle}
                  </span>
                </h3>

                <p className="mt-4 text-base sm:text-lg text-secondary-foreground/90 leading-relaxed">
                  {persona.hook}
                </p>

                {/* Diagnostic Checklist */}
                <div className="mt-6 rounded-xl border border-border/80 bg-background/50 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="mono-label text-brass text-xs flex items-center gap-1.5">
                      <Sparkles size={13} className="text-brass" />
                      <span>{persona.diagnostic.prompt}</span>
                    </div>
                    {checkedCount > 0 && (
                      <span className="mono-label text-xs text-[#EAD9B0] bg-brass/20 px-2 py-0.5 rounded-full">
                        {checkedCount} / {persona.diagnostic.items.length} matched
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {persona.diagnostic.items.map((item, idx) => {
                      const isChecked = !!checkedItems[`${activePersonaId}-${idx}`];
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleCheck(idx)}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                            isChecked
                              ? "border-brass/50 bg-brass/10 text-foreground"
                              : "border-border/60 bg-card/20 text-muted-foreground hover:border-brass/30 hover:text-foreground"
                          }`}
                        >
                          <div
                            className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-brass text-[#070A0F]"
                                : "border border-muted-foreground/60"
                            }`}
                          >
                            {isChecked && <CheckCircle2 size={13} />}
                          </div>
                          <span className="text-sm font-medium leading-tight">
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TiltCard>

              {/* Persona Chapters Preview */}
              <div className="space-y-4">
                {persona.chapters.slice(0, 2).map((c, i) => (
                  <TiltCard
                    key={i}
                    className="rounded-2xl border border-border/70 bg-card/40 backdrop-blur-md p-6"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-sm text-brass font-semibold">
                        0{c.n}
                      </span>
                      <h4 className="font-display text-2xl text-foreground">
                        {c.title}
                      </h4>
                    </div>
                    <p className="italic text-brass/90 text-sm mt-1">{c.oneliner}</p>
                    <p className="mt-3 text-sm text-secondary-foreground/80 leading-relaxed">
                      {c.body[0]}
                    </p>
                    {c.callout && (
                      <div className="mt-4 rounded-xl border-l-2 border-brass bg-brass/5 p-3 text-xs text-secondary-foreground/90">
                        <span className="font-mono uppercase text-brass font-bold mr-2">
                          [{c.callout.label}]
                        </span>
                        {c.callout.text}
                      </div>
                    )}
                  </TiltCard>
                ))}
              </div>
            </div>

            {/* Right: Speech Template & Strategy Cards */}
            <div className="lg:col-span-5 space-y-6">
              {/* Template Card */}
              <TiltCard
                glowColor="rgba(199, 163, 90, 0.4)"
                className="rounded-2xl border border-brass/40 bg-gradient-to-b from-[#0E1426] to-[#070A0F] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center justify-between">
                  <div className="mono-label text-brass text-xs flex items-center gap-1.5">
                    <FileText size={14} className="text-brass" />
                    <span>{persona.template.label}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brass/20 text-brass">
                    Copy-Ready
                  </span>
                </div>

                <div className="mt-4 space-y-3 font-mono text-xs sm:text-sm text-[#F2F0EA]/90 bg-black/40 border border-border/60 rounded-xl p-4 leading-relaxed">
                  {persona.template.lines.map((line, k) => (
                    <p key={k} className="flex items-start gap-2">
                      <span className="text-brass shrink-0 select-none">›</span>
                      <span>{line}</span>
                    </p>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border/60 text-center">
                  <p className="font-display text-xl text-foreground">
                    {persona.closing.line}
                  </p>
                  <p className="italic text-xs text-muted-foreground mt-2">
                    {persona.closing.quote}
                  </p>
                </div>
              </TiltCard>

              {/* Quick Tactical Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {QUICK_TIPS.map((tip, idx) => {
                  const Icon = tip.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-border/80 bg-card/30 backdrop-blur-sm hover:border-brass/50 transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-brass/10 flex items-center justify-center text-brass group-hover:bg-brass group-hover:text-[#070A0F] transition-colors">
                          <Icon size={16} />
                        </div>
                        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                          {tip.badge}
                        </span>
                      </div>
                      <h5 className="font-display text-lg text-foreground group-hover:text-brass transition-colors">
                        {tip.title}
                      </h5>
                      <p className="text-xs text-secondary-foreground/70 mt-1 leading-snug">
                        {tip.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Interactive Link */}
              <Link
                to="/handbook"
                className="flex items-center justify-between p-4 rounded-xl border border-brass/30 bg-brass/10 hover:bg-brass/20 text-brass transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brass animate-ping" />
                  <span className="font-mono text-xs uppercase tracking-widest text-foreground font-semibold">
                    Read All 5 Persona Handbooks
                  </span>
                </div>
                <ChevronRight size={18} className="text-brass transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
