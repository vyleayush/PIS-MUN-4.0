import React, { useRef } from "react";

export function TiltCard({
  children,
  className = "",
  glowColor = "rgba(199, 163, 90, 0.25)",
  maxTilt = 8,
  ...props
}) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const rafRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    if (rafRef.current) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) {
        rafRef.current = null;
        return;
      }
      const rect = cardRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rX = ((y - centerY) / centerY) * -maxTilt;
      const rY = ((x - centerX) / centerX) * maxTilt;

      cardRef.current.style.transform = `perspective(1000px) rotateX(${rX.toFixed(2)}deg) rotateY(${rY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;

      if (glowRef.current) {
        const gx = ((x / rect.width) * 100).toFixed(1);
        const gy = ((y / rect.height) * 100).toFixed(1);
        glowRef.current.style.opacity = "1";
        glowRef.current.style.background = `radial-gradient(350px circle at ${gx}% ${gy}%, ${glowColor}, transparent 65%)`;
      }
      rafRef.current = null;
    });
  };

  const handleMouseEnter = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.1s ease-out";
    }
  };

  const handleMouseLeave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = "0";
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Hardware-accelerated spotlight glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 z-10"
      />
      {children}
    </div>
  );
}
