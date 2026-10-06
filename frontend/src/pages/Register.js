import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, BookOpen, FileText } from "lucide-react";

export default function Register() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-brass selection:text-black">
      {/* Header */}
      <header className="border-b border-border/80 sticky top-0 z-40 bg-background/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex flex-col leading-none group">
            <span className="font-display text-lg sm:text-xl text-foreground group-hover:text-brass transition-colors">
              Paramount MUN
            </span>
            <span className="mono-label text-brass text-[9px] tracking-widest uppercase">
              Chapter IV · 2026
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 mono-label text-amber-300 text-[10px] px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Registrations Closed
            </span>
            <Link
              to="/"
              className="mono-label text-muted-foreground hover:text-brass transition-colors text-xs flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl border border-brass/25 bg-card/60 backdrop-blur-xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_35px_rgba(199,163,90,0.08)] overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-1/4 w-72 h-44 rounded-full bg-brass/10 blur-[70px] pointer-events-none"
          />

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Registration Window Officially Closed</span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-5xl text-foreground tracking-tight leading-tight">
            Registrations for Chapter IV are now closed.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-secondary-foreground/85 leading-relaxed">
            Thank you for the overwhelming response and enthusiasm! The delegate registration window for{" "}
            <strong className="text-brass font-medium">Paramount International MUN Chapter IV</strong> is officially closed.
          </p>

          {/* Key Delegate Guidance Cards */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-border/80 bg-white/[0.02] flex flex-col justify-between">
              <div>
                <div className="mono-label text-brass text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-brass" />
                  <span>Already Registered?</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Your registration is securely recorded. Official committee seat allotments, background guides, and conference confirmations are dispatched to your registered email address upon verification.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border/80 bg-white/[0.02] flex flex-col justify-between">
              <div>
                <div className="mono-label text-brass text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ShieldCheck size={15} className="text-brass" />
                  <span>Secretariat Contact</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Have an allotment inquiry or urgent question? Contact the organizing secretariat directly at:
                </p>
                <a
                  href="mailto:paramountinternationalmun.26@gmail.com"
                  className="mt-2 text-xs font-mono text-brass hover:underline break-all block"
                >
                  paramountinternationalmun.26@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Conference Details Banner */}
          <div className="mt-6 p-4 rounded-xl border border-brass/20 bg-brass/[0.04] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-foreground">
            <div className="flex items-center gap-2">
              <span className="text-brass font-bold">Conference Dates:</span>
              <span>9–10 October 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brass font-bold">Venue:</span>
              <span>Paramount International School, Dwarka</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 pt-6 border-t border-border/60 flex flex-wrap items-center gap-3">
            <Link
              to="/handbook"
              className="btn-luxury inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#E7C978] via-[#C7A35A] to-[#D4AF37] px-6 text-xs sm:text-sm font-semibold text-[#070A0F] hover:shadow-[0_0_25px_rgba(199,163,90,0.6)] transition-all"
            >
              <BookOpen size={15} />
              <span>Read Delegate Manual</span>
            </Link>

            <Link
              to="/brochure"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card/80 px-5 text-xs sm:text-sm font-medium text-foreground hover:border-brass hover:text-brass transition-all"
            >
              <FileText size={15} />
              <span>View Brochure Dossier</span>
            </Link>

            <Link
              to="/"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card/80 px-5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              <span>Back to Home</span>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer minimal */}
      <footer className="py-6 border-t border-border/60 text-center text-xs font-mono text-muted-foreground">
        © 2026 Paramount International MUN · All rights reserved.
      </footer>
    </div>
  );
}
