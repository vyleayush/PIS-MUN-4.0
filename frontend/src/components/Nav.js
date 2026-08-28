import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, BookOpen, FileText } from "lucide-react";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Committees", href: "#committees" },
  { label: "Handbook", href: "#handbook" },
  { label: "Schedule", href: "#schedule" },
  { label: "Gallery", href: "#gallery" },
  { label: "FAQ", href: "#faq" },
];

export const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [hoveredLink, setHoveredLink] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let ticking = false;
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setScrolled(currentScrollY > 20);
          
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setVisible(false);
          } else if (currentScrollY < lastScrollY) {
            setVisible(true);
          }
          lastScrollY = currentScrollY;

          // Section spy
          if (location.pathname === "/") {
            const sections = LINKS.map((l) => l.href.replace("#", ""));
            const scrollPosition = currentScrollY + 160;

            for (let i = sections.length - 1; i >= 0; i--) {
              const el = document.getElementById(sections[i]);
              if (el && el.offsetTop <= scrollPosition) {
                setActiveSection(sections[i]);
                ticking = false;
                return;
              }
            }
            if (currentScrollY < 160) {
              setActiveSection("");
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const goSection = (href) => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/" + href);
    } else {
      const el = document.querySelector(href);
      if (el) {
        const yOffset = -70;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="fixed top-2.5 sm:top-3.5 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none flex justify-center">
      <motion.header
        initial={{ y: -80, opacity: 0, scaleX: 0.3, scaleY: 0.8 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0, scaleX: 1, scaleY: 1 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
          mass: 0.5,
          opacity: { duration: 0.2 }
        }}
        style={{ originX: 0.5, originY: 0 }}
        className={`pointer-events-auto w-full max-w-5xl rounded-full transition-all duration-300 relative border ${
          scrolled
            ? "bg-[#070A0F]/85 backdrop-blur-2xl border-brass/35 shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_16px_rgba(199,163,90,0.12)] py-1.5 sm:py-2 px-3.5 sm:px-5"
            : "bg-[#070A0F]/70 backdrop-blur-xl border-white/10 shadow-[0_6px_24px_rgba(0,0,0,0.45)] py-1.5 sm:py-2 px-3.5 sm:px-5"
        }`}
      >
        {/* Top Edge Glow line */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brass/60 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            data-testid="nav-logo"
            className="group flex items-center gap-2.5 leading-none transition-transform hover:scale-[1.02]"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brass/20 bg-black/40">
              <img 
                src="/school-logo.png" 
                alt="Paramount School" 
                className="h-full w-full object-contain mix-blend-screen opacity-95" 
                style={{ 
                  filter: 'invert(1) sepia(1) saturate(5) hue-rotate(200deg)',
                }}
                onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} 
              />
              <div className="hidden h-full w-full items-center justify-center text-[#0066ff] drop-shadow-[0_0_10px_rgba(0,102,255,0.8)]">
                <BookOpen size={16} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-base sm:text-lg text-foreground group-hover:text-brass transition-colors tracking-wide leading-tight">
                Paramount MUN
              </span>
              <span className="mono-label text-brass text-[8px] sm:text-[9px] flex items-center gap-1 leading-none mt-0.5">
                <span className="w-1 h-1 rounded-full bg-brass inline-block animate-ping" />
                Chapter IV · 2026
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {LINKS.map((l) => {
              const secId = l.href.replace("#", "");
              const isActive = activeSection === secId;
              const isHovered = hoveredLink === l.href;

              return (
                <button
                  key={l.href}
                  data-testid={`nav-${secId}`}
                  onClick={() => goSection(l.href)}
                  onMouseEnter={() => setHoveredLink(l.href)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className={`relative px-2.5 lg:px-3 py-1 rounded-full text-[11px] lg:text-xs font-mono tracking-wider transition-colors duration-200 uppercase ${
                    isActive
                      ? "text-brass font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {(isActive || isHovered) && (
                    <motion.div
                      layoutId="navPillIndicator"
                      className={`absolute inset-0 rounded-full ${
                        isActive
                          ? "bg-brass/15 border border-brass/40 shadow-[0_0_10px_rgba(199,163,90,0.2)]"
                          : "bg-white/5"
                      }`}
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </button>
              );
            })}

            {/* Direct Link to Standalone Manual */}
            <Link
              to="/handbook"
              data-testid="nav-handbook-standalone"
              onMouseEnter={() => setHoveredLink("/handbook")}
              onMouseLeave={() => setHoveredLink(null)}
              className="relative px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider transition-colors duration-200 uppercase text-brass/90 hover:text-brass flex items-center gap-1 bg-brass/10 border border-brass/20 hover:border-brass/50 ml-1"
            >
              <BookOpen size={11} className="text-brass" />
              <span>Manual</span>
            </Link>
          </nav>

          {/* Register CTA Button */}
          <div className="hidden sm:flex items-center gap-2">
            <Link
              to="/register"
              data-testid="nav-register"
              className="btn-luxury group inline-flex h-8 sm:h-8.5 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E7C978] via-[#C7A35A] to-[#D4AF37] px-3.5 sm:px-4 text-xs font-semibold text-[#070A0F] hover:shadow-[0_0_20px_rgba(199,163,90,0.6)] transition-all"
            >
              <Sparkles size={12} className="text-[#070A0F] group-hover:rotate-12 transition-transform" />
              <span>Register</span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/register"
              className="inline-flex h-7 items-center rounded-full bg-brass px-2.5 text-[11px] font-semibold text-[#070A0F]"
            >
              Register
            </Link>
            <button
              className="text-foreground p-1.5 rounded-full border border-border/80 bg-card/60 hover:border-brass transition-colors"
              onClick={() => setOpen((o) => !o)}
              data-testid="nav-mobile-toggle"
              aria-label="Menu"
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.96 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden pt-3 pb-2 border-t border-border/60 mt-2 flex flex-col gap-1.5 overflow-hidden"
            >
              {LINKS.map((l, i) => (
                <motion.button
                  key={l.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => goSection(l.href)}
                  className="text-left mono-label text-muted-foreground hover:text-brass py-1.5 px-3 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-between text-xs"
                >
                  <span>{l.label}</span>
                  <span className="text-[10px] text-brass">→</span>
                </motion.button>
              ))}
              <Link
                to="/handbook"
                onClick={() => setOpen(false)}
                className="mono-label text-muted-foreground hover:text-brass py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={13} />
                  <span>Full Delegate Field Manual</span>
                </div>
                <span>→</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </div>
  );
};
