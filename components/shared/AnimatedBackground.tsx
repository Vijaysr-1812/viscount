"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <>
      <div className="mesh-bg" />
      <div className="grain-overlay" />
      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full pointer-events-none"
          style={{
            width: `${60 + i * 40}px`,
            height: `${60 + i * 40}px`,
            background: `radial-gradient(circle, ${
              i % 2 === 0
                ? "rgba(79,70,229,0.08)"
                : "rgba(195,192,255,0.05)"
            }, transparent)`,
            left: `${10 + i * 18}%`,
            top: `${15 + i * 12}%`,
            zIndex: -1,
          }}
          animate={{
            y: [0, -30, 10, -20, 0],
            x: [0, 15, -10, 5, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
            opacity: [0.3, 0.6, 0.4, 0.5, 0.3],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}
