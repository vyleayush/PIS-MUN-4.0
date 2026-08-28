import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Download, Users, ArrowRight, RotateCw, RotateCcw, Sparkles } from "lucide-react";
import { getCommittees } from "@/lib/api";
import { COMMITTEE_LOGOS } from "@/lib/assets";
import { Reveal } from "@/components/Reveal";
import { CommitteeScene } from "@/components/CommitteeScene";

const FACE = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };

const DEFAULT_COMMITTEES = [
  {
    slug: "unga",
    name: "UNGA",
    full_name: "United Nations General Assembly",
    agenda: "Addressing global security architecture, state sovereignty, and conflict de-escalation protocols in Eastern Europe and the Middle East.",
    tag: "Flagship committee · General Assembly",
    open_count: 42,
    total_count: 60,
  },
  {
    slug: "aippm",
    name: "AIPPM",
    full_name: "All India Political Parties Meet",
    agenda: "Reviewing the implementation and socio-economic ramifications of the Uniform Civil Code with special focus on federal autonomy.",
    tag: "Indian crisis committee",
    open_count: 28,
    total_count: 50,
  },
  {
    slug: "who",
    name: "WHO",
    full_name: "World Health Organization",
    agenda: "Combating the rise of lifestyle diseases among youth and working class (obesity, hypertension, and occupational health).",
    tag: "Specialized agency",
    open_count: 36,
    total_count: 60,
  },
  {
    slug: "uncsw",
    name: "UNCSW",
    full_name: "UN Commission on the Status of Women",
    agenda: "Promoting Gender Equality in the Digital Age with Special Emphasis on Bridging the Digital Gender Divide & role of Pink Tax.",
    tag: "Specialized · Gender & tech",
    open_count: 31,
    total_count: 60,
  },
  {
    slug: "unhrc",
    name: "UNHRC",
    full_name: "UN Human Rights Council",
    agenda: "Ensuring Human Rights while Expanding National Digital Identity Systems and biometric surveillance frameworks.",
    tag: "Rights & digital identity",
    open_count: 39,
    total_count: 60,
  },
];

function Emblem({ slug, size = 48 }) {
  const src = COMMITTEE_LOGOS[slug];
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-white/95 border border-border shrink-0 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.4)] p-1 transition-transform group-hover:scale-105"
      style={{ width: size, height: size }}
    >
      <img src={src} alt={`${slug} emblem`} loading="lazy" className="h-full w-full object-contain" />
    </div>
  );
}

function FlipCard({ c, index }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="h-[350px]" style={{ perspective: "2000px" }}>
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* FRONT */}
        <button
          data-testid={`committee-card-${c.slug}`}
          onClick={() => setFlipped(true)}
          className="group absolute inset-0 flex flex-col rounded-3xl border border-border/80 bg-gradient-to-b from-[#0E1426]/90 to-[#070A0F]/90 backdrop-blur-xl p-6 text-left hover:border-brass/80 glow-hover transition-all overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          style={FACE}
        >
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-brass/10 rounded-full filter blur-3xl group-hover:bg-brass/25 transition-colors pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <Emblem slug={c.slug} />
              <div>
                <h3 className="font-display text-4xl text-foreground group-hover:text-brass transition-colors leading-tight">
                  {c.name}
                </h3>
                <span className="mono-label text-brass/80 text-[10px]">
                  Committee 0{index + 1}
                </span>
              </div>
            </div>
            <span className="mono-label text-muted-foreground group-hover:text-brass transition-colors text-xs">
              Flip →
            </span>
          </div>

          <p className="mt-4 text-xs font-mono uppercase tracking-wider text-brass relative z-10">{c.tag}</p>
          <p className="mt-2 text-sm text-secondary-foreground/80 relative z-10 leading-relaxed line-clamp-2">
            {c.full_name}
          </p>

          <div className="mt-auto relative z-10 pt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                data-testid={`committee-seats-${c.slug}`}
                className="mono-label rounded-full border border-brass/30 bg-[#1A1710]/80 px-3.5 py-1 text-brass text-xs flex items-center gap-2 shadow-[0_0_12px_rgba(199,163,90,0.2)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brass beacon-pulse" />
                {c.open_count} of {c.total_count} open
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-brass group-hover:translate-x-1 transition-transform">
              <RotateCw size={13} className="transition-transform duration-500 group-hover:rotate-180" />
              <span>Tap to inspect agenda</span>
            </div>
          </div>
        </button>

        {/* BACK */}
        <div
          data-testid={`committee-detail-${c.slug}`}
          className="absolute inset-0 flex flex-col rounded-3xl border border-brass/60 bg-gradient-to-b from-[#0E1426] to-[#070A0F] p-6 shadow-[0_0_40px_rgba(199,163,90,0.25)]"
          style={{ ...FACE, transform: "rotateY(180deg)" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Emblem slug={c.slug} size={40} />
              <div>
                <div className="mono-label text-brass text-[10px]">{c.tag}</div>
                <h3 className="font-display text-3xl text-foreground leading-none mt-1">{c.name}</h3>
              </div>
            </div>
            <button
              onClick={() => setFlipped(false)}
              data-testid={`committee-flip-back-${c.slug}`}
              className="h-8 w-8 shrink-0 rounded-full border border-border bg-card/60 flex items-center justify-center text-muted-foreground hover:text-brass hover:border-brass transition-colors"
              aria-label="Flip back"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto no-scrollbar pr-1">
            <div className="mono-label text-brass text-[10px] mb-1">Agenda Focus</div>
            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">{c.agenda}</p>

            <div className="mt-4">
              <div className="rounded-xl border border-border/80 bg-white/[0.03] p-3">
                <div className="flex items-center gap-1.5 mono-label text-muted-foreground text-[10px]">
                  <Users size={12} className="text-brass" /> Live allotment status
                </div>
                <div className="font-display text-2xl text-brass mt-0.5">
                  {c.open_count}
                  <span className="text-muted-foreground text-base">/{c.total_count}</span>{" "}
                  <span className="text-muted-foreground text-xs font-mono">seats open</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              to="/handbook"
              data-testid={`committee-download-handbook-${c.slug}`}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card/80 text-xs font-medium text-foreground hover:border-brass hover:text-brass transition-all"
            >
              <Download size={13} /> Handbook
            </Link>
            <Link
              to="/register"
              className="btn-luxury inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E7C978] via-[#C7A35A] to-[#D4AF37] text-xs font-semibold text-[#070A0F] transition-all shadow-[0_0_20px_rgba(199,163,90,0.4)]"
            >
              Register <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export const Committees = () => {
  const [committees, setCommittees] = useState(DEFAULT_COMMITTEES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCommittees()
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) {
          setCommittees(d);
        }
      })
      .catch(() => {
        setCommittees(DEFAULT_COMMITTEES);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="committees" className="section-lazy relative py-20 sm:py-28 scroll-mt-20 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="hidden lg:block absolute -top-10 right-0 h-[320px] w-full pointer-events-none">
            <CommitteeScene />
          </div>
          <Reveal>
            <div className="mono-label text-brass mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-brass" />
              <span>/ 05 Committees · Chapter IV</span>
            </div>
            <h2 className="section-heading text-foreground max-w-2xl">
              Five committees.<br />One will be yours.
            </h2>
            <p className="mt-4 max-w-xl text-base sm:text-lg text-secondary-foreground/80 leading-relaxed">
              Tap any placard to flip it in 3D — inspect the agenda, chair vision, and live seat matrix updated in real time.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[350px] rounded-3xl border border-border bg-card animate-pulse" />
            ))}

          {committees.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: (i % 3) * 0.1 }}
            >
              <FlipCard c={c} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
