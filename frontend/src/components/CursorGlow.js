import React, { useEffect, useRef, useState } from "react";

// Hardware-accelerated golden cursor with GPU-composited layers
export const CursorGlow = () => {
  const dot = useRef(null);
  const ring = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia || !window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.body.classList.add("cursor-none");

    let raf = null;
    let isHovering = false;
    let isLoopRunning = false;

    const startLoop = () => {
      if (!isLoopRunning) {
        isLoopRunning = true;
        loop();
      }
    };

    const move = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      if (dot.current) {
        dot.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      startLoop();
    };

    const over = (e) => {
      const isInteractive = !!(e.target && e.target.closest && e.target.closest("a,button,input,select,textarea,[role='button'],label,[data-testid]"));
      if (isInteractive !== isHovering) {
        isHovering = isInteractive;
        document.body.classList.toggle("cursor-hover", isInteractive);
      }
    };

    const loop = () => {
      const dx = pos.current.x - ringPos.current.x;
      const dy = pos.current.y - ringPos.current.y;
      ringPos.current.x += dx * 0.25;
      ringPos.current.y += dy * 0.25;

      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        raf = requestAnimationFrame(loop);
      } else {
        isLoopRunning = false;
      }
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    startLoop();

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("mouseover", over);
      cancelAnimationFrame(raf);
      document.body.classList.remove("cursor-none", "cursor-hover");
    };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <div ref={dot} className="pmun-cursor-dot" style={{ willChange: "transform" }} aria-hidden />
      <div ref={ring} className="pmun-cursor-ring" style={{ willChange: "transform" }} aria-hidden />
    </>
  );
};
