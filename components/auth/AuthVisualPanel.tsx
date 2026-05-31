"use client";

import { motion } from "framer-motion";

function FloatingCard({
  children,
  className,
  delay = 0,
  y = [-8, 8],
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: [number, number];
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        animate={{ y }}
        transition={{
          duration: 4 + delay,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function AnimatedSVGLine({
  d,
  color1,
  color2,
  delay,
  id,
}: {
  d: string;
  color1: string;
  color2: string;
  delay: number;
  id: string;
}) {
  return (
    <>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse">
          <stop stopColor={color1} />
          <stop offset="1" stopColor={color2} />
        </linearGradient>
      </defs>
      <motion.path
        d={d}
        stroke={`url(#${id})`}
        strokeWidth="1.5"
        strokeDasharray="4 4"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ delay, duration: 2, ease: "easeInOut" }}
      />
    </>
  );
}

export function AuthVisualPanel({ variant = "login" }: { variant?: "login" | "signup" | "forgot" | "verify" }) {
  return (
    <section className="hidden md:flex w-1/2 bg-surface-container-lowest relative items-center justify-center overflow-hidden border-l border-outline-variant">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(79,70,229,0.15) 0%, transparent 50%)",
        }}
        animate={{
          background: [
            "radial-gradient(circle at 70% 30%, rgba(79,70,229,0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 70%, rgba(79,70,229,0.2) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 30%, rgba(79,70,229,0.15) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 80%, rgba(195,192,255,0.05) 0%, transparent 40%)",
        }}
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, rgba(195,192,255,0.05) 0%, transparent 40%)",
            "radial-gradient(circle at 80% 20%, rgba(195,192,255,0.08) 0%, transparent 40%)",
            "radial-gradient(circle at 20% 80%, rgba(195,192,255,0.05) 0%, transparent 40%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Visual Composition */}
      <div className="relative w-full max-w-2xl px-8">
        {/* Faux Contract Document */}
        <motion.div
          className="bg-gradient-to-b from-surface-container to-surface border border-outline-variant rounded-xl p-8 relative z-0 shadow-2xl"
          style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.05)" }}
          initial={{ opacity: 0, y: 30, rotate: -2 }}
          animate={{ opacity: 0.85, y: 0, rotate: -1 }}
          transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
        >
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-2">
              <div className="h-4 w-48 bg-outline-variant/30 rounded-full" />
              <div className="h-3 w-32 bg-outline-variant/20 rounded-full" />
            </div>
            <div className="h-8 w-8 bg-outline-variant/20 rounded-lg" />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3 w-full bg-outline-variant/10 rounded-full" />
              <div className="h-3 w-5/6 bg-outline-variant/10 rounded-full" />
              <div className="h-3 w-4/6 bg-outline-variant/10 rounded-full" />
            </div>
            <div className="space-y-2 pt-2">
              <motion.div
                className="h-3 w-full bg-outline-variant/30 rounded-full border border-primary/30"
                animate={{ borderColor: ["rgba(195,192,255,0.3)", "rgba(79,70,229,0.6)", "rgba(195,192,255,0.3)"] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="h-3 w-full bg-outline-variant/10 rounded-full" />
              <div className="h-3 w-3/4 bg-outline-variant/10 rounded-full" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3 w-full bg-outline-variant/10 rounded-full" />
              <div className="h-3 w-full bg-outline-variant/10 rounded-full" />
              <div className="h-3 w-1/2 bg-outline-variant/10 rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* SVG Connecting Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          fill="none"
          viewBox="0 0 600 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <AnimatedSVGLine
            d="M380 160 C440 160 460 100 520 100"
            color1="#c3c0ff"
            color2="#4f46e5"
            delay={1}
            id="g1"
          />
          <AnimatedSVGLine
            d="M380 220 C440 220 480 300 540 300"
            color1="#c3c0ff"
            color2="#ffb695"
            delay={1.5}
            id="g2"
          />
          <AnimatedSVGLine
            d="M320 280 C380 280 400 350 460 350"
            color1="#4f46e5"
            color2="#c3c0ff"
            delay={2}
            id="g3"
          />
        </svg>

        {/* Floating Evidence Cards */}
        <FloatingCard
          className="absolute top-[5%] right-[-8%] w-56 z-20"
          delay={0.5}
          y={[-6, 6]}
        >
          <div className="glass border border-primary/40 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                Risk Analysis
              </span>
            </div>
            <p className="text-[13px] text-on-surface leading-relaxed">
              Clause 4.2 indicates potential non-compliance with regional data
              privacy statutes.
            </p>
          </div>
        </FloatingCard>

        <FloatingCard
          className="absolute bottom-[10%] right-[-12%] w-64 z-20"
          delay={0.8}
          y={[-10, 5]}
        >
          <div className="glass border border-tertiary/40 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-[11px] font-semibold text-tertiary uppercase tracking-wider">
                Evidence Match
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[12px]">
                <span className="text-on-surface-variant">Ref ID:</span>
                <span className="text-on-surface">EXT-9082-A</span>
              </div>
              <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-tertiary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ delay: 1.5, duration: 1.2, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </FloatingCard>

        {variant === "signup" && (
          <FloatingCard
            className="absolute top-[40%] left-[-15%] w-52 z-20"
            delay={1.2}
            y={[-5, 8]}
          >
            <div className="glass border border-secondary/30 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  Obligation
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant">
                Annual security audit due in 14 days
              </p>
            </div>
          </FloatingCard>
        )}

        {variant === "verify" && (
          <FloatingCard
            className="absolute top-[35%] left-[-20%] w-60 z-20"
            delay={1.2}
            y={[-5, 8]}
          >
            <div className="glass border border-emerald-500/40 rounded-xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">
                  Identity Verified
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant">
                Secure access tunnel established. Forensic workspace initializing.
              </p>
            </div>
          </FloatingCard>
        )}

        {/* Decorative blur orb */}
        <div className="absolute -bottom-16 -left-16 w-64 h-64 opacity-20 blur-3xl bg-primary-container rounded-full pointer-events-none" />
      </div>
    </section>
  );
}
