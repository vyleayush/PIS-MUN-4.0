import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Maximize2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Share2,
  Eye,
  X,
  Layers,
  Award,
  Calendar,
  ShieldCheck,
  ZoomIn,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { toast } from "sonner";

const HIGHLIGHTS = [
  {
    icon: Layers,
    title: "5 Dynamic Committees",
    desc: "Complete agendas for UNGA (AI Combat), AIPPM (Electoral Reforms), WHO, UNCSW (Pink Tax), and UNHRC.",
    badge: "Agendas & Portfolios",
  },
  {
    icon: Award,
    title: "Rewards & Cash Prizes",
    desc: "Best Delegate (₹3,100), High Commendation (₹2,100), Special Mentions (Trophies), Certificates & Kits for all.",
    badge: "₹3,100 / ₹2,100 Cash",
  },
  {
    icon: Calendar,
    title: "Participation & Fee",
    desc: "₹1,700 for Non-Paramount students / ₹1,500 for Paramount students. 9th & 10th October 2026.",
    badge: "9–10 Oct 2026",
  },
  {
    icon: ShieldCheck,
    title: "Conference Incharges",
    desc: "Garima Rana (+91 88829 57182) & Surbhi Sachdeva (+91 97188 19355) · paramountmun.26@gmail.com",
    badge: "Official Contacts",
  },
];

export const BrochureSection = () => {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState("native"); // 'native' | 'drive'
  const [copiedLink, setCopiedLink] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const pdfUrl = "/Brochure.pdf";
  const shareableUrl = typeof window !== "undefined" ? `${window.location.origin}/brochure` : "/brochure";

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = "Paramount_MUN_2026_Official_Brochure.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Brochure download started! (~40 MB)");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    toast.success("Brochure link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleReloadIframe = () => {
    setIframeKey((prev) => prev + 1);
    toast.info("Refreshed brochure viewer");
  };

  return (
    <section id="brochure" className="section-lazy relative py-20 sm:py-28 scroll-mt-20 overflow-hidden">
      {/* Ambient background glows */}
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, #C7A35A 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="absolute bottom-10 -right-20 w-96 h-96 rounded-full pointer-events-none opacity-15"
        style={{
          background: "radial-gradient(circle, #4AA3DF 0%, transparent 70%)",
          filter: "blur(110px)",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Reveal>
              <div className="mono-label text-brass mb-3 flex items-center gap-2">
                <FileText size={15} className="text-brass" />
                <span>/ Official Conference Dossier</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-brass animate-pulse" />
              </div>
              <h2 className="section-heading text-foreground">
                Conference Brochure.
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="mt-4 max-w-2xl text-base sm:text-lg text-secondary-foreground/80 leading-relaxed">
                Everything you need to navigate Chapter IV. Explore the complete conference prospectus
                in our live interactive viewer below or download your personal copy.
              </p>
            </Reveal>
          </div>

          {/* Quick CTA Actions */}
          <Reveal delay={0.1}>
            <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
              <button
                onClick={handleDownload}
                data-testid="brochure-download-top-btn"
                className="btn-luxury inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E7C978] via-[#C7A35A] to-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#070A0F] hover:shadow-[0_0_30px_rgba(199,163,90,0.7)] transition-all"
              >
                <Download size={16} className="text-[#070A0F]" />
                <span>Download Brochure</span>
                <span className="text-[10px] font-mono opacity-80 px-1.5 py-0.5 rounded bg-black/20">
                  PDF · 40MB
                </span>
              </button>

              <Link
                to="/brochure"
                data-testid="brochure-fullpage-link"
                className="card-luxury inline-flex items-center gap-2 rounded-full border border-brass/40 bg-card/70 backdrop-blur-md px-5 py-3 text-sm font-medium text-foreground hover:border-brass hover:text-brass transition-all"
              >
                <Maximize2 size={15} />
                <span>Full Page View</span>
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Highlight Badges */}
        <Reveal delay={0.15}>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HIGHLIGHTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md hover:border-brass/50 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brass/10 flex items-center justify-center text-brass group-hover:bg-brass group-hover:text-[#070A0F] transition-colors">
                      <Icon size={16} />
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded bg-white/5 border border-border/50">
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="font-display text-base text-foreground group-hover:text-brass transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-secondary-foreground/70 mt-1.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Live Brochure Viewer Main Container */}
        <Reveal delay={0.2}>
          <div className="mt-8 rounded-3xl border border-brass/30 bg-[#0A0E1A]/90 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(199,163,90,0.12)] overflow-hidden">
            {/* Viewer Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-border/80 bg-card/50">
              {/* Left Title & Status */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                </div>
                <div className="h-4 w-px bg-border/80 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-brass hidden sm:block" />
                  <span className="font-mono text-xs text-foreground font-semibold">
                    Paramount_MUN_Chapter_IV_Brochure.pdf
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brass/20 text-brass hidden md:inline">
                    Live Viewer
                  </span>
                </div>
              </div>

              {/* Right Action Tools */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReloadIframe}
                  title="Reload document"
                  className="p-2 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  title="Copy shareable link"
                  className="p-2 rounded-lg border border-border/60 text-muted-foreground hover:text-brass hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
                >
                  {copiedLink ? <Check size={14} className="text-brass" /> : <Copy size={14} />}
                  <span className="hidden sm:inline">{copiedLink ? "Copied" : "Share"}</span>
                </button>

                <button
                  onClick={() => setIsFullscreenOpen(true)}
                  data-testid="brochure-modal-trigger"
                  className="p-2 rounded-lg border border-brass/40 bg-brass/10 text-brass hover:bg-brass hover:text-[#070A0F] transition-all text-xs flex items-center gap-1.5 font-medium"
                >
                  <Maximize2 size={14} />
                  <span>Expand Fullscreen</span>
                </button>

                <button
                  onClick={handleDownload}
                  data-testid="brochure-viewer-download"
                  className="p-2 rounded-lg bg-brass text-[#070A0F] hover:bg-brass-light transition-all text-xs flex items-center gap-1.5 font-semibold"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Embedded Live Viewer Area */}
            <div className="relative w-full bg-[#05070B] aspect-[4/3] sm:aspect-[16/10] md:h-[650px] lg:h-[720px] overflow-hidden">
              {/* Native PDF Object / Iframe */}
              <object
                key={iframeKey}
                data={`${pdfUrl}#view=FitH&toolbar=1&navpanes=0`}
                type="application/pdf"
                className="w-full h-full border-0"
              >
                {/* Fallback iframe */}
                <iframe
                  src={`${pdfUrl}#view=FitH`}
                  title="Paramount MUN Official Brochure"
                  className="w-full h-full border-0"
                >
                  {/* Fallback if browser does not support embedded PDF */}
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-card/60">
                    <FileText size={48} className="text-brass mb-4 animate-bounce" />
                    <h3 className="font-display text-2xl text-foreground">
                      Brochure Preview Ready
                    </h3>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">
                      Your browser does not support direct PDF embedding. You can view or download the full high-resolution brochure directly.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-luxury inline-flex items-center gap-2 rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-[#070A0F]"
                      >
                        <ExternalLink size={15} />
                        <span>Open in New Tab</span>
                      </a>
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 rounded-full border border-brass/40 px-6 py-2.5 text-sm font-medium text-foreground hover:text-brass"
                      >
                        <Download size={15} />
                        <span>Download PDF</span>
                      </button>
                    </div>
                  </div>
                </iframe>
              </object>
            </div>

            {/* Bottom Info & Direct Link Bar */}
            <div className="p-4 sm:p-5 border-t border-border/80 bg-card/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles size={14} className="text-brass" />
                <span>Tip: Click "Expand Fullscreen" or open in a new tab for two-page reading mode.</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brass hover:underline flex items-center gap-1 font-mono"
                >
                  <span>Direct PDF Link</span>
                  <ExternalLink size={12} />
                </a>
                <span className="text-border">·</span>
                <Link
                  to="/register"
                  className="font-semibold text-foreground hover:text-brass transition-colors font-mono"
                >
                  Proceed to Registration →
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Fullscreen Interactive Modal */}
      <AnimatePresence>
        {isFullscreenOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full h-full max-w-7xl rounded-2xl border border-brass/40 bg-[#070A0F] shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/80 bg-card/70 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-brass" />
                  <div>
                    <h3 className="font-display text-base sm:text-lg text-foreground leading-tight">
                      Paramount MUN — Official Brochure (Chapter IV)
                    </h3>
                    <p className="mono-label text-[10px] text-muted-foreground">
                      Live High-Resolution Document Viewer
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brass px-3.5 py-1.5 text-xs font-semibold text-[#070A0F] hover:bg-brass-light transition-all"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Download PDF</span>
                  </button>

                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
                    title="Open in new window"
                  >
                    <ExternalLink size={15} />
                    <span className="hidden sm:inline">New Tab</span>
                  </a>

                  <button
                    onClick={() => setIsFullscreenOpen(false)}
                    className="p-1.5 rounded-lg border border-border/80 text-foreground hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40 transition-colors"
                    aria-label="Close fullscreen modal"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal PDF Viewer Body */}
              <div className="flex-1 w-full h-full bg-[#05070B] overflow-hidden">
                <iframe
                  src={`${pdfUrl}#view=Fit&toolbar=1`}
                  title="Fullscreen Brochure View"
                  className="w-full h-full border-0"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
