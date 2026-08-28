import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { 
  Sparkles, 
  Quote, 
  Award, 
  Compass, 
  ShieldCheck, 
  Eye, 
  X, 
  Download, 
  ExternalLink 
} from "lucide-react";

export const MDMessage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pillars = [
    { label: "Courage to Voice", icon: Compass },
    { label: "Fearless Debate", icon: ShieldCheck },
    { label: "Youth Leadership", icon: Award },
  ];

  return (
    <section 
      id="director-message" 
      className="section-lazy relative py-20 sm:py-28 scroll-mt-20 overflow-hidden bg-gradient-to-b from-[#070A0F] via-[#0A0F1D] to-[#070A0F]"
    >
      {/* Ambient background glow & atmospheric lighting */}
      <div
        className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none opacity-15"
        style={{
          background: "radial-gradient(circle, #C7A35A 0%, rgba(20,30,55,0.8) 50%, transparent 75%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="absolute bottom-10 right-10 w-96 h-96 rounded-full pointer-events-none opacity-10"
        style={{
          background: "radial-gradient(circle, #C7A35A 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Subtle ornate top divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brass/40 to-transparent" />
          <div className="flex items-center gap-2 text-brass/80">
            <span className="text-[10px] tracking-widest uppercase font-mono">✦</span>
            <span className="text-xs tracking-[0.3em] uppercase font-mono text-brass">PARAMOUNT MUN 2026</span>
            <span className="text-[10px] tracking-widest uppercase font-mono">✦</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brass/40 to-transparent" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal>
            <div className="mono-label text-brass mb-3 flex items-center justify-center gap-2">
              <Sparkles size={13} className="text-brass animate-pulse" />
              / Leadership Address
            </div>
            <h2 className="section-heading text-foreground tracking-tight">
              A Message from the <span className="italic text-brass">Managing Director</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground font-light max-w-xl mx-auto">
              Guiding the visionary leaders of tomorrow with clarity, empathy, and diplomatic excellence.
            </p>
          </Reveal>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: MD Profile Dossier */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Reveal delay={0.05}>
              <TiltCard className="rounded-3xl overflow-hidden border border-brass/40 bg-gradient-to-b from-[#0E1426]/90 to-[#070A0F]/95 backdrop-blur-xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(199,163,90,0.1)] group hover:border-brass transition-all duration-500">
                
                {/* School Header inside card */}
                <div className="flex items-center justify-between pb-5 mb-5 border-b border-border/80">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/school-logo.png" 
                      alt="Paramount International School" 
                      className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(199,163,90,0.4)]"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div>
                      <div className="font-display text-base text-foreground tracking-wide">
                        PARAMOUNT
                      </div>
                      <div className="mono-label text-brass text-[8px] tracking-wider">
                        INTERNATIONAL SCHOOL
                      </div>
                    </div>
                  </div>
                  <span className="mono-label text-[9px] text-brass/80 px-2.5 py-1 rounded-full border border-brass/30 bg-brass/10">
                    Official Note
                  </span>
                </div>

                {/* Portrait with Ornate Gold Frame */}
                <div className="relative rounded-2xl p-1 bg-gradient-to-br from-[#E7C978] via-[#C7A35A] to-[#8C6B28] shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
                  <div className="relative rounded-[14px] overflow-hidden bg-[#070A0F] aspect-[4/5] sm:aspect-[3/4]">
                    <img
                      src="/md-portrait.jpg"
                      alt="Mrs. Rattan Lata Saroha - Managing Director"
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F] via-transparent to-transparent opacity-70" />
                    
                    {/* Floating pill over image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="mono-label text-[9px] text-[#FBE7B6] bg-[#070A0F]/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-brass/30">
                        Nurturing Leaders of Tomorrow
                      </span>
                    </div>
                  </div>
                </div>

                {/* Director Title Information */}
                <div className="mt-6 text-center">
                  <h3 className="font-display text-2xl sm:text-3xl text-foreground tracking-wide">
                    Mrs. Rattan Lata Saroha
                  </h3>
                  <div className="mono-label text-brass text-xs tracking-widest mt-1">
                    Managing Director
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Paramount International School
                  </div>
                </div>

                {/* 3 Core Pillars */}
                <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-border/80">
                  {pillars.map((p, idx) => {
                    const Icon = p.icon;
                    return (
                      <div 
                        key={idx} 
                        className="flex flex-col items-center text-center p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-brass/40 transition-colors"
                      >
                        <Icon size={16} className="text-brass mb-1.5" />
                        <span className="text-[10px] font-medium text-foreground/80 leading-tight">
                          {p.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* View Original Official Letterhead Button */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    data-testid="view-md-original-letter-btn"
                    className="w-full btn-luxury flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-mono tracking-wider uppercase bg-brass/10 border border-brass/40 text-brass hover:bg-brass hover:text-[#070A0F] hover:shadow-[0_0_20px_rgba(199,163,90,0.4)] transition-all duration-300"
                  >
                    <Eye size={14} />
                    <span>View Official Letterhead</span>
                  </button>
                </div>
              </TiltCard>
            </Reveal>

            {/* School Motto Banner */}
            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-brass/30 bg-gradient-to-r from-brass/10 via-brass/5 to-brass/10 p-4 text-center">
                <Quote size={18} className="text-brass/60 mx-auto mb-1" />
                <p className="font-display italic text-lg sm:text-xl text-[#FBE7B6] tracking-wide">
                  “ Education Inspires Thought. ”
                </p>
                <span className="mono-label text-[9px] text-brass/70 mt-1 block">
                  Paramount Institutional Motto
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Full Official Letter */}
          <div className="lg:col-span-7">
            <Reveal delay={0.08}>
              <div className="relative rounded-3xl border border-brass/35 bg-gradient-to-b from-[#0C1222]/95 via-[#0A0F1D]/90 to-[#070A0F]/95 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(199,163,90,0.08)]">
                
                {/* Decorative Top Accent */}
                <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-brass/70 to-transparent" />
                <div className="absolute top-3 right-5 pointer-events-none opacity-10">
                  <Quote size={80} className="text-brass" />
                </div>

                {/* Letter Header */}
                <div className="mb-6 pb-6 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="mono-label text-brass text-[10px]">
                      Official MUN Address
                    </span>
                    <h4 className="font-display text-xl sm:text-2xl text-foreground mt-0.5">
                      Welcome to Paramount MUN 2026
                    </h4>
                  </div>
                  <span className="mono-label text-xs text-muted-foreground/70 self-start sm:self-auto">
                    Chapter IV · 2026
                  </span>
                </div>

                {/* Letter Body */}
                <div className="space-y-5 text-secondary-foreground/90 text-sm sm:text-base leading-relaxed">
                  {/* Salutation */}
                  <p className="font-medium text-foreground tracking-wide">
                    Dear Delegates, Faculty Advisors, and Esteemed Guests,
                  </p>

                  {/* Paragraph 1 */}
                  <p>
                    It gives me immense pleasure to welcome you all to the <strong className="text-foreground font-semibold">Paramount Model United Nations Conference</strong>. At Paramount, we believe in nurturing young minds with not just knowledge, but the confidence to voice their opinions, the courage to challenge norms, and the clarity to envision a better tomorrow.
                  </p>

                  {/* Paragraph 2 */}
                  <p>
                    Model United Nations is more than a simulation — it is a platform that fosters leadership, diplomacy, and critical thinking. Watching our students engage in global issues with such passion and intellect is truly inspiring and fills us with pride. This conference represents the spirit of collaboration and the power of youth in driving positive change in the world.
                  </p>

                  {/* Highlight Callout Box / Paragraph 3 */}
                  <div className="my-6 p-5 sm:p-6 rounded-2xl border-l-4 border-brass bg-gradient-to-r from-brass/15 via-brass/[0.06] to-transparent shadow-inner">
                    <p className="font-display text-lg sm:text-xl text-[#FBE7B6] leading-relaxed italic">
                      “To all the delegates: I urge you to debate fearlessly, respect every perspective, and carry forward the values of empathy, responsibility, and peace that the United Nations stands for. May this MUN leave you more aware, more empowered, and more ready to shape the world around you.”
                    </p>
                  </div>

                  {/* Paragraph 4 */}
                  <p>
                    I extend my heartfelt gratitude to the organizing committee, the faculty, and every participant who has made this event possible. Let this be a memorable experience of learning, leadership, and legacy.
                  </p>

                  {/* Paragraph 5 */}
                  <p className="text-foreground/95 font-medium">
                    Wishing you all the very best for a successful and impactful conference.
                  </p>
                </div>

                {/* Sign-off Block */}
                <div className="mt-8 pt-6 border-t border-border/80 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                  <div>
                    <span className="mono-label text-muted-foreground text-xs block mb-2">
                      Warm regards,
                    </span>
                    
                    {/* Handwritten Script Signature */}
                    <div className="font-script text-3xl sm:text-4xl text-brass font-bold tracking-wide select-none filter drop-shadow-[0_0_8px_rgba(199,163,90,0.3)]">
                      Rattan Lata Saroha
                    </div>

                    <div className="mt-2">
                      <div className="font-display text-lg text-foreground font-semibold">
                        Mrs. Rattan Lata Saroha
                      </div>
                      <div className="mono-label text-brass text-[10px] tracking-wider">
                        Managing Director
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Paramount International School
                      </div>
                    </div>
                  </div>

                  {/* Institutional Seal Badge */}
                  <div className="self-start sm:self-end flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-border/60">
                    <img 
                      src="/school-logo.png" 
                      alt="Paramount Seal" 
                      className="w-11 h-11 object-contain mix-blend-screen opacity-90"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="text-left">
                      <span className="mono-label text-[9px] text-brass block">Paramount MUN</span>
                      <span className="text-[11px] text-muted-foreground font-mono">Chapter IV · 2026</span>
                    </div>
                  </div>
                </div>

              </div>
            </Reveal>
          </div>

        </div>
      </div>

      {/* Lightbox / Modal for High-Res Official Flyer */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative max-w-2xl w-full max-h-[90vh] bg-[#070A0F] rounded-3xl border border-brass/50 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(199,163,90,0.25)] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:px-6 sm:py-4 border-b border-border flex items-center justify-between bg-[#0E1426]/90">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-brass" />
                  <div>
                    <h3 className="font-display text-lg text-foreground">
                      Official Managing Director's Message
                    </h3>
                    <p className="mono-label text-[9px] text-brass">
                      Paramount International School
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/md-message.jpg"
                    download="Paramount-MUN-MD-Message.jpg"
                    className="p-2 rounded-full border border-border bg-card hover:border-brass text-muted-foreground hover:text-brass transition-colors"
                    title="Download Poster"
                  >
                    <Download size={16} />
                  </a>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 rounded-full border border-border bg-card hover:border-brass text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Image View */}
              <div className="overflow-y-auto p-4 flex justify-center bg-black/40">
                <img
                  src="/md-message.jpg"
                  alt="Official Message from Managing Director - Mrs. Rattan Lata Saroha"
                  className="max-w-full h-auto rounded-xl shadow-2xl border border-brass/30"
                />
              </div>

              {/* Modal Footer */}
              <div className="p-3.5 px-6 border-t border-border bg-[#0E1426]/90 flex items-center justify-between text-xs text-muted-foreground">
                <span className="mono-label text-[10px] text-brass">“Education Inspires Thought.”</span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs text-brass hover:underline font-mono"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
