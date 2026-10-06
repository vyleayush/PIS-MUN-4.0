import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, FileText } from "lucide-react";
import { Countdown } from "@/components/Countdown";
import { Reveal } from "@/components/Reveal";
import { ASSET } from "@/lib/assets";

export const RegisterCTA = () => (
  <section className="section-lazy relative py-20 lg:py-28 overflow-hidden grain">
    <div className="absolute inset-0">
      <img src={ASSET.groupPhoto} alt="" aria-hidden loading="lazy" className="h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(7,10,15,0.85), rgba(7,10,15,0.95))" }} />
    </div>

    {/* Central ambient glow */}
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full pointer-events-none opacity-20"
      style={{
        background: "radial-gradient(circle, #C7A35A 0%, transparent 70%)",
        filter: "blur(80px)",
      }}
    />

    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <Reveal>
        <div className="mono-label text-brass mb-4 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          / Chapter IV · Registrations Officially Closed
        </div>
        <h2 className="section-heading text-foreground">Registrations Are Now Closed.</h2>
        <p className="mt-5 max-w-xl mx-auto text-secondary-foreground/85 leading-relaxed">
          Thank you for the tremendous interest! Delegate registrations for Chapter IV are now concluded. Committee seat allotments and details are being dispatched to registered delegates.
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <div className="mt-8 flex justify-center">
          <div className="p-4 rounded-2xl border border-brass/20 bg-card/60 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <Countdown />
          </div>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="mt-8 flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              data-testid="cta-register-button"
              className="btn-luxury group inline-flex h-12 items-center gap-2 rounded-full bg-white/10 border border-white/20 px-8 text-sm font-semibold text-foreground hover:bg-white/15 hover:border-brass/40 transition-all active:scale-95"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Registrations Closed</span>
            </Link>
            <Link
              to="/handbook"
              className="btn-luxury group inline-flex h-12 items-center gap-2 rounded-full bg-brass px-8 text-sm font-semibold text-[#070A0F] hover:bg-brass-hover transition-all shadow-[0_0_25px_rgba(199,163,90,0.4)] hover:shadow-[0_0_40px_rgba(199,163,90,0.7)] active:scale-95"
            >
              <BookOpen size={16} />
              <span>Read Delegate Manual</span>
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Registration Status: <strong>Officially Closed</strong></span>
            </span>
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-brass/10 border border-brass/30 text-brass font-medium">
              Conference: 9–10 October 2026
            </span>
          </div>
          <p className="mt-3 mono-label text-muted-foreground text-xs">For queries, email paramountinternationalmun.26@gmail.com</p>
        </div>
      </Reveal>
    </div>
  </section>
);
