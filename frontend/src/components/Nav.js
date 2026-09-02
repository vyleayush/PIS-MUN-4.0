import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, BookOpen, ChevronRight, Calendar, MapPin } from "lucide-react";

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

  // Handle scroll detection and section spy
  useEffect(() => {
    let ticking = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setScrolled(currentScrollY > 20);

          // Only hide on scroll down if mobile menu is closed
          if (!open) {
            if (currentScrollY > lastScrollY && currentScrollY > 120) {
              setVisible(false);
            } else if (currentScrollY < lastScrollY) {
              setVisible(true);
            }
          }
          lastScrollY = currentScrollY;

          // Section spy on home page
          if (location.pathname === "/") {
            const sections = LINKS.map((l) => l.href.replace("#", ""));
            const scrollPosition = currentScrollY + 180;

            for (let i = sections.length - 1; i >= 0; i--) {
              const el = document.getElementById(sections[i]);
              if (el && el.offsetTop <= scrollPosition) {
                setActiveSection(sections[i]);
                ticking = false;
                return;
              }
            }
            if (currentScrollY < 180) {
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
  }, [location.pathname, open]);

  // Close mobile menu on route change or ESC key
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll slightly when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const goSection = (href) => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/" + href);
    } else {
      const el = document.querySelector(href);
      if (el) {
        const yOffset = -80;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  };

  return (
    <>
      {/* Dimmed Backdrop Overlay on Mobile when Menu is Open */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-[#04060A]/75 backdrop-blur-md z-40 md:hidden pointer-events-auto"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className="fixed top-2.5 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none flex justify-center">
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{
            y: visible || open ? 0 : -100,
            opacity: visible || open ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 28,
            mass: 0.6,
          }}
          className={`pointer-events-auto w-full max-w-5xl transition-all duration-300 relative border ${
            open
              ? "rounded-[24px] sm:rounded-[28px] bg-[#070A11]/95 backdrop-blur-3xl border-brass/40 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(199,163,90,0.18)] p-3 sm:p-4"
              : scrolled
              ? "rounded-full bg-[#070A0F]/85 backdrop-blur-2xl border-brass/35 shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_16px_rgba(199,163,90,0.12)] py-1.5 sm:py-2 px-3.5 sm:px-5"
              : "rounded-full bg-[#070A0F]/75 backdrop-blur-xl border-white/10 shadow-[0_6px_24px_rgba(0,0,0,0.45)] py-1.5 sm:py-2 px-3.5 sm:px-5"
          }`}
        >
          {/* Top Edge Glow line */}
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brass/60 to-transparent pointer-events-none" />

          {/* Top Row / Main Nav Bar */}
          <div className="flex items-center justify-between">
            {/* Brand / Logo */}
            <Link
              to="/"
              data-testid="nav-logo"
              onClick={() => setOpen(false)}
              className="group flex items-center gap-2.5 leading-none transition-transform hover:scale-[1.02]"
            >
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brass/25 bg-black/50 shadow-[0_0_12px_rgba(199,163,90,0.15)]">
                <img
                  src="/school-logo.png"
                  alt="Paramount School"
                  className="h-full w-full object-contain mix-blend-screen opacity-95"
                  style={{
                    filter: "invert(1) sepia(1) saturate(5) hue-rotate(200deg)",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="hidden h-full w-full items-center justify-center text-brass">
                  <BookOpen size={16} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-[17px] sm:text-lg text-foreground group-hover:text-brass transition-colors tracking-wide leading-tight">
                  Paramount MUN
                </span>
                <span className="mono-label text-brass/90 text-[8.5px] sm:text-[9px] flex items-center gap-1 leading-none mt-0.5 font-medium tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-brass inline-block animate-pulse" />
                  CHAPTER IV · 2026
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

            {/* Desktop Register CTA Button */}
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

            {/* Mobile Actions: Register Mini Button & Menu Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="inline-flex h-7.5 items-center gap-1 rounded-full bg-gradient-to-r from-[#E7C978] via-[#C7A35A] to-[#D4AF37] px-3 text-[11px] font-bold text-[#070A0F] shadow-[0_0_12px_rgba(199,163,90,0.35)] active:scale-95 transition-transform"
              >
                <span>Register</span>
              </Link>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen((o) => !o)}
                data-testid="nav-mobile-toggle"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                className={`relative flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                  open
                    ? "border-brass/60 bg-brass/20 text-brass shadow-[0_0_12px_rgba(199,163,90,0.3)]"
                    : "border-white/15 bg-white/5 text-foreground hover:border-brass/50 hover:bg-white/10"
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {open ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <X size={17} strokeWidth={2.4} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Menu size={17} strokeWidth={2.4} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Smooth Mobile Dropdown Menu */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="md:hidden overflow-hidden"
              >
                <div className="pt-3 pb-1 border-t border-white/10 mt-3 flex flex-col gap-1">
                  {/* Navigation Links */}
                  <div className="grid grid-cols-1 gap-1 py-1">
                    {LINKS.map((l, i) => {
                      const secId = l.href.replace("#", "");
                      const isActive = activeSection === secId;

                      return (
                        <motion.button
                          key={l.href}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ delay: i * 0.03, duration: 0.2 }}
                          onClick={() => goSection(l.href)}
                          className={`w-full text-left py-2.5 px-3.5 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                            isActive
                              ? "bg-brass/15 text-brass border border-brass/30 shadow-[0_0_12px_rgba(199,163,90,0.12)]"
                              : "text-neutral-300 hover:text-white hover:bg-white/5 active:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                isActive ? "bg-brass scale-125" : "bg-white/20 group-hover:bg-brass/60"
                              }`}
                            />
                            <span className="font-mono text-xs uppercase tracking-wider font-medium">
                              {l.label}
                            </span>
                          </div>
                          <ChevronRight
                            size={14}
                            className={`transition-transform duration-200 group-hover:translate-x-0.5 ${
                              isActive ? "text-brass" : "text-neutral-500 group-hover:text-brass"
                            }`}
                          />
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Highlight Manual Link Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ delay: LINKS.length * 0.03, duration: 0.2 }}
                    className="pt-1.5 pb-1"
                  >
                    <Link
                      to="/handbook"
                      onClick={() => setOpen(false)}
                      className="group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-brass/15 via-brass/5 to-transparent border border-brass/30 hover:border-brass/60 transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.3)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brass/20 text-brass border border-brass/30 group-hover:scale-105 transition-transform">
                          <BookOpen size={15} />
                        </div>
                        <div>
                          <div className="font-mono text-xs font-semibold text-brass tracking-wide uppercase">
                            Delegate Field Manual
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">
                            Committees, Rules & Agendas
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={15} className="text-brass group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>

                  {/* Register Callout for Mobile */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ delay: (LINKS.length + 1) * 0.03, duration: 0.2 }}
                    className="pt-1"
                  >
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E7C978] via-[#C7A35A] to-[#D4AF37] text-[#070A0F] font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(199,163,90,0.4)] active:scale-[0.98] transition-transform"
                    >
                      <Sparkles size={14} className="text-[#070A0F]" />
                      <span>Register for Chapter IV</span>
                    </Link>
                  </motion.div>

                  {/* Footer info badge */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-center justify-center gap-3 pt-2 text-[10px] text-neutral-400 font-mono"
                  >
                    <span className="flex items-center gap-1">
                      <Calendar size={11} className="text-brass" /> 9–10 Oct 2026
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className="text-brass" /> Paramount School
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      </div>
    </>
  );
};

