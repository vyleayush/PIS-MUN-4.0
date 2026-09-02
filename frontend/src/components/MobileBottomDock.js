import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Layers, FileText, BookOpen, ArrowUp } from "lucide-react";

export const MobileBottomDock = () => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [scrolledFar, setScrolledFar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShow(y > 280);
      setScrolledFar(y > 1400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide on registration, handbook, and admin routes
  if (location.pathname === "/register" || location.pathname.startsWith("/admin")) {
    return null;
  }

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      window.location.href = `/${id}`;
    } else {
      const el = document.querySelector(id);
      if (el) {
        const yOffset = -75;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-3.5 inset-x-3.5 z-40 md:hidden flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-[#070A12]/92 backdrop-blur-2xl border border-brass/35 shadow-[0_16px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(199,163,90,0.18)]"
        >
          {/* Quick Nav Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollToSection("#committees")}
              className="flex flex-col items-center justify-center h-11 px-2.5 rounded-xl hover:bg-white/5 text-neutral-300 hover:text-brass transition-colors active:scale-95"
              aria-label="Jump to Committees"
            >
              <Layers size={16} className="text-brass/90" />
              <span className="font-mono text-[9px] uppercase tracking-wider mt-0.5 font-medium">Agendas</span>
            </button>

            <button
              onClick={() => scrollToSection("#brochure")}
              className="flex flex-col items-center justify-center h-11 px-2.5 rounded-xl hover:bg-white/5 text-neutral-300 hover:text-brass transition-colors active:scale-95"
              aria-label="Jump to Brochure"
            >
              <FileText size={16} className="text-brass/90" />
              <span className="font-mono text-[9px] uppercase tracking-wider mt-0.5 font-medium">Brochure</span>
            </button>

            <Link
              to="/handbook"
              className="flex flex-col items-center justify-center h-11 px-2.5 rounded-xl hover:bg-white/5 text-neutral-300 hover:text-brass transition-colors active:scale-95"
              aria-label="View Handbook"
            >
              <BookOpen size={16} className="text-brass/90" />
              <span className="font-mono text-[9px] uppercase tracking-wider mt-0.5 font-medium">Manual</span>
            </Link>
          </div>

          {/* Primary CTA */}
          <div className="flex items-center gap-1.5 flex-1 justify-end">
            <Link
              to="/register"
              className="btn-luxury flex-1 flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl bg-gradient-to-r from-[#E7C978] via-[#C7A35A] to-[#D4AF37] text-[#070A0F] font-semibold text-xs shadow-[0_0_20px_rgba(199,163,90,0.45)] active:scale-95 transition-transform"
            >
              <Sparkles size={14} className="text-[#070A0F]" />
              <span>Register Now</span>
            </Link>

            {scrolledFar && (
              <button
                onClick={scrollToTop}
                className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-300 hover:text-brass hover:border-brass/40 transition-colors active:scale-90"
                aria-label="Scroll to top"
              >
                <ArrowUp size={16} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
