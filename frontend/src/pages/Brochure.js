import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Sparkles,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Eye,
  ShieldCheck,
  Award,
  Layers,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

export default function Brochure() {
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const pdfUrl = "/Brochure.pdf";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Brochure page link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-brass selection:text-[#070A0F] flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-[#070A0F]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-brass flex items-center justify-center text-[#070A0F] font-display font-bold text-sm shadow-[0_0_15px_rgba(199,163,90,0.4)]">
              P
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg text-foreground group-hover:text-brass transition-colors">
                Paramount MUN
              </span>
              <span className="mono-label text-brass text-[9px] mt-0.5">
                Official Brochure · Chapter IV
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/"
              className="mono-label text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-xs hidden sm:flex"
            >
              <ArrowLeft size={13} />
              <span>Back to Home</span>
            </Link>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-brass transition-colors"
            >
              {copied ? <Check size={13} className="text-brass" /> : <Copy size={13} />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
            </button>

            <button
              onClick={handleDownload}
              data-testid="page-brochure-download"
              className="btn-luxury inline-flex h-9 sm:h-10 items-center gap-2 rounded-full bg-gradient-to-r from-[#E7C978] via-[#C7A35A] to-[#D4AF37] px-4 sm:px-6 text-xs sm:text-sm font-semibold text-[#070A0F] hover:shadow-[0_0_25px_rgba(199,163,90,0.7)] transition-all"
            >
              <Download size={15} />
              <span>Download Brochure</span>
            </button>

            <Link
              to="/register"
              className="inline-flex h-9 sm:h-10 items-center rounded-full border border-brass/40 bg-card/60 px-4 sm:px-5 text-xs sm:text-sm font-medium text-foreground hover:border-brass hover:text-brass transition-all hidden md:inline-flex"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Title Bar & Quick Highlights */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-brass/20 bg-[#0A0E1A]/80 backdrop-blur-md">
          <div>
            <div className="mono-label text-brass flex items-center gap-2 text-xs">
              <FileText size={14} className="text-brass" />
              <span>Chapter IV · 9–10 October 2026</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-foreground mt-1">
              Paramount MUN Official Conference Dossier
            </h1>
            <p className="text-xs sm:text-sm text-secondary-foreground/80 mt-1 max-w-2xl">
              Complete prospectus featuring committee agendas, executive board profiles, delegate code of conduct, and schedule.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-brass/40 bg-brass/10 px-4 py-2 text-xs font-mono text-brass hover:bg-brass hover:text-[#070A0F] transition-all"
            >
              <ExternalLink size={14} />
              <span>Open Native PDF</span>
            </a>
            <button
              onClick={() => {
                setIframeKey((k) => k + 1);
                toast.info("Refreshed viewer");
              }}
              className="p-2 rounded-xl border border-border/70 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              title="Reload preview"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Live Interactive Viewer Frame */}
        <div className="flex-1 w-full rounded-2xl border border-border bg-[#05070B] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.7)] flex flex-col min-h-[600px] lg:min-h-[750px]">
          <object
            key={iframeKey}
            data={`${pdfUrl}#view=FitH&toolbar=1&navpanes=1`}
            type="application/pdf"
            className="w-full flex-1 border-0 min-h-[600px] lg:min-h-[750px]"
          >
            <iframe
              src={`${pdfUrl}#view=FitH`}
              title="Brochure Full Page Viewer"
              className="w-full flex-1 border-0 min-h-[600px] lg:min-h-[750px]"
            >
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <FileText size={48} className="text-brass mb-3" />
                <h3 className="font-display text-2xl text-foreground">PDF Document Ready</h3>
                <p className="text-muted-foreground text-sm mt-2 max-w-md">
                  If the embedded preview doesn't load on your browser, click below to open or download the PDF directly.
                </p>
                <div className="mt-6 flex gap-3">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-luxury rounded-full bg-brass px-6 py-2.5 text-sm font-semibold text-[#070A0F]"
                  >
                    Open PDF in New Window
                  </a>
                  <button
                    onClick={handleDownload}
                    className="rounded-full border border-brass/40 px-6 py-2.5 text-sm text-foreground hover:text-brass"
                  >
                    Download (40MB)
                  </button>
                </div>
              </div>
            </iframe>
          </object>
        </div>

        {/* Bottom Quick Navigation & Help */}
        <div className="grid sm:grid-cols-4 gap-4 pb-6">
          <div className="p-4 rounded-xl border border-border/70 bg-card/40 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brass/10 text-brass">
              <Layers size={18} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">5 Committees</h4>
              <p className="text-xs text-muted-foreground mt-0.5">UNGA, AIPPM, WHO, UNCSW & UNHRC</p>
              <Link to="/#committees" className="text-xs text-brass hover:underline mt-1 inline-block">
                View matrix →
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border/70 bg-card/40 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brass/10 text-brass">
              <Award size={18} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Cash Prizes</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Best Delegate: ₹3,100 · High Commendation: ₹2,100</p>
              <span className="text-[11px] text-brass/90 mt-1 inline-block">Trophies & kits for all</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border/70 bg-card/40 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brass/10 text-brass">
              <Calendar size={18} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">9 & 10 Oct 2026</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Fee: ₹2,000 / ₹1,500 (Paramount)</p>
              <span className="text-[11px] text-muted-foreground mt-1 inline-block">Sector 23, Dwarka</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border/70 bg-card/40 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-brass/10 text-brass">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Register Now</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Secure your country or portfolio.</p>
              <Link to="/register" className="text-xs text-brass hover:underline font-semibold mt-1 inline-block">
                Register for MUN →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
