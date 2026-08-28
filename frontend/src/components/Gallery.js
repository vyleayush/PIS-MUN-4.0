import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Reveal } from "@/components/Reveal";
import { GALLERY } from "@/lib/assets";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export const Gallery = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const openAt = (i) => {
    setActive(i);
    setOpen(true);
  };
  const prev = () => setActive((a) => (a - 1 + GALLERY.length) % GALLERY.length);
  const next = () => setActive((a) => (a + 1) % GALLERY.length);

  return (
    <section id="gallery" className="section-lazy relative py-16 sm:py-20 lg:py-28 scroll-mt-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="mono-label text-brass mb-4">/ Moodboard</div>
              <h2 className="section-heading text-foreground">Scenes from the floor.</h2>
            </div>
            <span className="hidden sm:block mono-label text-muted-foreground px-3 py-1 rounded-full border border-border bg-card">
              {GALLERY.length} frames
            </span>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-6 auto-rows-[140px] sm:auto-rows-[180px] gap-3.5">
          {GALLERY.map((g, i) => (
            <Reveal key={i} delay={(i % 4) * 0.05} className={g.span || "lg:col-span-2"}>
              <button
                data-testid={`gallery-tile-${i}`}
                onClick={() => openAt(i)}
                className="group relative h-full w-full overflow-hidden rounded-xl border border-border hover:border-brass/80 glow-hover transition-all duration-300 bg-card"
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 group-hover:brightness-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 justify-between">
                  <span className="mono-label text-[10px] text-white/90 truncate max-w-[80%]">
                    {g.alt}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-brass/90 text-[#070A0F] flex items-center justify-center shadow-[0_0_10px_#C7A35A]">
                    <Maximize2 size={13} />
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl bg-card border-border/80 p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]" data-testid="gallery-lightbox">
          <div className="relative overflow-hidden bg-[#070A0F]">
            <AnimatePresence mode="wait">
              <motion.img
                key={active}
                src={GALLERY[active].src}
                alt={GALLERY[active].alt}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.3 }}
                className="w-full max-h-[75vh] object-contain"
              />
            </AnimatePresence>
            <button
              onClick={prev}
              data-testid="gallery-prev"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-[#070A0F]/80 border border-border flex items-center justify-center text-foreground hover:text-brass hover:border-brass transition-colors shadow-lg"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              data-testid="gallery-next"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-[#070A0F]/80 border border-border flex items-center justify-center text-foreground hover:text-brass hover:border-brass transition-colors shadow-lg"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="px-5 py-3.5 flex items-center justify-between border-t border-border bg-card/60 backdrop-blur-sm">
            <span className="text-sm text-foreground/90 font-medium">{GALLERY[active].alt}</span>
            <span className="mono-label text-brass bg-brass/10 px-2.5 py-1 rounded border border-brass/30">
              {active + 1} / {GALLERY.length}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
