import React from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/useCountdown";

const EASE = [0.22, 1, 0.36, 1];

export const Reveal = ({ children, delay = 0, y = 18, className = "", ...rest }) => {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className} {...rest}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
