import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, BookOpen, CheckCircle2, Copy, Check } from "lucide-react";
import { PERSONAS } from "@/lib/handbookContent";
import { TiltCard } from "@/components/ui/TiltCard";

const EASE = [0.22, 1, 0.36, 1];

function Chapter({ c, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mt-8 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md p-6 sm:p-7"
    >
      <div className="flex items-baseline gap-3 border-b border-border/60 pb-3">
        <span className="font-mono text-sm font-semibold text-brass">0{c.n}</span>
        <h3 className="font-display text-2xl sm:text-3xl text-foreground">{c.title}</h3>
      </div>
      <p className="italic text-brass/90 mt-3 text-sm">{c.oneliner}</p>
      <div className="mt-4 space-y-3.5 text-secondary-foreground/85 leading-relaxed text-sm sm:text-base">
        {c.body.map((p, k) => (
          <p key={k}>{p}</p>
        ))}
      </div>
      {c.callout && (
        <div className="mt-5 rounded-xl border-l-2 border-brass bg-brass/10 p-4">
          <div className="mono-label text-brass mb-1 text-xs">[{c.callout.label}]</div>
          <p className="text-secondary-foreground/90 text-sm leading-relaxed">{c.callout.text}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function Handbook() {
  const [active, setActive] = useState(PERSONAS[0].id);
  const [copied, setCopied] = useState(false);
  const p = PERSONAS.find((x) => x.id === active) || PERSONAS[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCopyTemplate = () => {
    const text = p.template.lines.join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-brass selection:text-[#070A0F]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-[#070A0F]/85 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-full bg-brass flex items-center justify-center text-[#070A0F] font-display font-bold text-xs">
              P
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg text-foreground group-hover:text-brass transition-colors">
                Paramount MUN
              </span>
              <span className="mono-label text-brass text-[8px]">
                Delegate Field Manual
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="mono-label text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-xs"
            >
              <ArrowLeft size={13} />
              <span>Back to Home</span>
            </Link>
            <Link
              to="/register"
              data-testid="handbook-register"
              className="btn-luxury inline-flex h-9 items-center rounded-full bg-brass px-4 text-xs sm:text-sm font-semibold text-[#070A0F] hover:shadow-[0_0_20px_rgba(199,163,90,0.6)] transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Title Block */}
        <div>
          <div className="mono-label text-brass flex items-center gap-2">
            <BookOpen size={14} className="text-brass" />
            <span>The Delegate Diaries</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl text-foreground mt-3 leading-tight">
            The Delegate Diaries
          </h1>
          <p className="mono-label text-muted-foreground mt-3 text-xs sm:text-sm">
            Chapter IV · 2026 · Field manual for the floor
          </p>
        </div>

        {/* Persona Tabs */}
        <div data-testid="handbook-persona-tabs" className="mt-8 flex flex-wrap gap-2.5 p-1.5 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-xl">
          {PERSONAS.map((x) => {
            const isActive = active === x.id;
            return (
              <button
                key={x.id}
                data-testid={`handbook-tab-${x.id}`}
                onClick={() => setActive(x.id)}
                className={`relative rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "text-[#070A0F] font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeHandbookPageTab"
                    className="absolute inset-0 bg-gradient-to-r from-[#E7C978] via-[#C7A35A] to-[#D4AF37] rounded-xl shadow-[0_0_20px_rgba(199,163,90,0.5)]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{x.tab}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mt-10"
          >
            {/* Persona Hero */}
            <div className="inline-flex items-center rounded-full border border-brass/30 bg-brass/10 px-3 py-1 mono-label text-brass text-xs">
              {p.statusTag}
            </div>
            <h2 className="font-display text-3xl sm:text-5xl text-foreground mt-4 leading-tight">
              {p.hero} <span className="italic text-brass font-normal">— {p.subtitle}</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-secondary-foreground/90 leading-relaxed max-w-3xl">
              {p.hook}
            </p>

            {/* Diagnostic Box */}
            <div className="mt-8 rounded-2xl border border-border/80 bg-card/50 backdrop-blur-md p-6">
              <div className="mono-label text-brass mb-3 text-xs flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>{p.diagnostic.prompt}</span>
              </div>
              <div className="space-y-2.5">
                {p.diagnostic.items.map((it, k) => (
                  <label
                    key={k}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 accent-brass h-4 w-4 rounded"
                      data-testid={`handbook-diag-${p.id}-${k}`}
                    />
                    <span className="text-sm text-secondary-foreground/90">{it}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chapters */}
            <div data-testid="handbook-chapter-list">
              {p.chapters.map((c, i) => (
                <Chapter key={i} c={c} i={i} />
              ))}
            </div>

            {/* Speech Template Card */}
            <TiltCard className="mt-10 rounded-2xl border border-brass/40 bg-gradient-to-b from-[#0E1426] to-[#070A0F] p-6 sm:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between">
                <div className="mono-label text-brass text-xs">{p.template.label}</div>
                <button
                  onClick={handleCopyTemplate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brass/30 bg-brass/10 px-3 py-1 text-xs font-mono text-brass hover:bg-brass hover:text-[#070A0F] transition-all"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? "Copied" : "Copy Template"}</span>
                </button>
              </div>
              <div className="mt-4 space-y-3 font-mono text-xs sm:text-sm text-[#F2F0EA]/90 bg-black/40 border border-border/60 rounded-xl p-4 leading-relaxed">
                {p.template.lines.map((l, k) => (
                  <p key={k} className="flex items-start gap-2">
                    <span className="text-brass select-none">›</span>
                    <span>{l}</span>
                  </p>
                ))}
              </div>
            </TiltCard>

            {/* Closing Pull-Quote */}
            <div className="mt-10 rounded-2xl border border-brass/30 bg-card/60 backdrop-blur-md p-8 text-center">
              <div className="mono-label text-brass text-xs">If you remember only one thing</div>
              <p className="font-display text-2xl sm:text-4xl text-foreground mt-4">
                {p.closing.line}
              </p>
              <p className="italic text-muted-foreground mt-3 max-w-lg mx-auto text-sm sm:text-base">
                {p.closing.quote}
              </p>
              <div className="mt-5 flex items-center justify-center gap-2 text-brass text-xs font-mono uppercase tracking-wider">
                <Sparkles size={14} />
                <span>Now go read your agenda again.</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Page Footer */}
        <div className="mt-16 pt-8 border-t border-border/60 text-center">
          <p className="font-display text-2xl sm:text-3xl text-foreground">
            Prepared beats gifted. Every time.
          </p>
          <p className="mono-label text-muted-foreground mt-2 text-xs">
            Paramount International MUN · Delegate Handbook
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs font-mono">
            <Link to="/" className="text-foreground hover:text-brass transition-colors">
              Back to PIMUN
            </Link>
            <span className="text-border">·</span>
            <Link to="/register" className="text-foreground hover:text-brass transition-colors">
              Register
            </Link>
            <span className="text-border">·</span>
            <Link to="/#committees" className="text-foreground hover:text-brass transition-colors">
              Committees
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
