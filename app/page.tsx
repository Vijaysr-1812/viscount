"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Shield, BarChart3, Clock, CheckCircle2 } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <div className="mesh-bg" />
      <div className="grain-overlay" />

      {/* Navigation */}
      <motion.header
        className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-2xl font-bold text-on-surface tracking-tight">
              VISCOUNT AI
            </span>
            <div className="hidden md:flex gap-6">
              {["Features", "How it Works", "Pricing", "Security"].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s/g, "-")}`}
                  className="text-on-surface-variant hover:text-primary transition-colors text-[14px]"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-on-surface-variant hover:text-on-surface text-[14px] transition-colors hidden md:block"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-primary-container text-on-primary-container px-4 py-2 rounded-xl text-[14px] font-semibold hover:opacity-90 transition-all"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </motion.header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          <motion.div className="max-w-4xl text-center z-10" {...fadeUp}>
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Zap size={14} />
              <span className="text-[11px] font-semibold tracking-widest uppercase">
                Forensic Legal Intelligence
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-bold text-on-surface mb-6 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Where contract promises meet{" "}
              <span className="text-primary">operational reality.</span>
            </motion.h1>

            <motion.p
              className="text-on-surface-variant text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Automatically extract legal obligations and reconcile them against
              real-time operational data. Stop guessing. Start proving.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Link
                href="/signup"
                className="bg-primary-container text-on-primary-container px-8 py-4 rounded-xl text-lg font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2"
              >
                Start Analysis Free
                <ArrowRight size={20} />
              </Link>
              <button className="border border-outline-variant bg-surface-container-high text-on-surface px-8 py-4 rounded-xl text-lg font-bold hover:bg-surface-container-highest transition-colors">
                Book a Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            className="mt-16 w-full max-w-5xl relative aspect-[21/9] rounded-2xl border border-outline-variant glass overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <div className="absolute inset-0 flex items-center justify-around px-8">
              {/* Contract doc */}
              <div className="w-64 h-72 bg-surface-container-low border border-outline-variant rounded-lg p-4 flex flex-col gap-2">
                <div className="h-4 w-3/4 bg-outline-variant/40 rounded" />
                <div className="h-2 w-full bg-outline-variant/20 rounded" />
                <div className="h-2 w-full bg-outline-variant/20 rounded" />
                <div className="h-10 w-full border border-primary/40 bg-primary/5 rounded flex items-center px-2 mt-2">
                  <span className="text-[10px] text-primary font-mono">
                    &quot;Clause 4.2: Data Sovereignty&quot;
                  </span>
                </div>
                <div className="h-2 w-2/3 bg-outline-variant/20 rounded mt-2" />
              </div>

              {/* Connection line */}
              <div className="flex-1 h-px bg-gradient-to-r from-primary/50 via-tertiary/50 to-primary/50 relative">
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-surface border border-outline rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <BarChart3 size={20} className="text-primary" />
                </motion.div>
              </div>

              {/* Evidence panel */}
              <div className="w-64 h-72 bg-surface-container-low border border-outline-variant rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={18} className="text-tertiary" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    PROD_DB_LOGS
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { k: "EU_REGION_VERIFIED", v: "TRUE", c: "text-primary" },
                    { k: "LATENCY_P99", v: "142ms", c: "text-tertiary" },
                    { k: "UPTIME_SLA", v: "99.97%", c: "text-emerald-400" },
                  ].map((item) => (
                    <div
                      key={item.k}
                      className="flex justify-between items-center py-1 border-b border-outline-variant/20"
                    >
                      <span className="text-[10px] font-mono">{item.k}</span>
                      <span className={`text-[10px] font-bold ${item.c}`}>
                        {item.v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
          <motion.div className="mb-12" {...fadeUp}>
            <h2 className="text-[32px] font-semibold text-on-surface tracking-tight">
              Intelligence at every layer.
            </h2>
            <p className="text-on-surface-variant text-[14px] mt-2">
              Precision instruments for modern legal operations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large feature */}
            <motion.div
              className="md:col-span-2 row-span-2 bg-surface-container border border-outline-variant rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-primary/30 transition-all"
              {...fadeUp}
            >
              <div className="z-10">
                <div className="w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center mb-4">
                  <Zap size={24} className="text-primary" />
                </div>
                <h3 className="text-[32px] font-semibold text-on-surface mb-2 tracking-tight">
                  Obligation Extraction
                </h3>
                <p className="text-on-surface-variant text-[14px] max-w-md">
                  Our neural engine scans thousands of pages to identify specific,
                  actionable obligations that generic LLMs miss.
                </p>
              </div>
              <motion.div
                className="mt-8 transform group-hover:scale-105 transition-transform duration-500"
              >
                <div className="bg-surface-container-highest rounded-lg p-4 border border-outline-variant shadow-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-3 h-3 rounded-full bg-error" />
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">
                      Critical Obligation Identified
                    </span>
                  </div>
                  <div className="font-mono text-[13px] text-primary">
                    SECTION 12.1: &quot;Provider must maintain 99.99% uptime for EU
                    region endpoints...&quot;
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="bg-surface-container border border-outline-variant rounded-xl p-6 group hover:border-tertiary/30 transition-all"
              {...fadeUp}
            >
              <div className="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center mb-4">
                <Clock size={20} className="text-tertiary" />
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">
                Evidence Matching
              </h3>
              <p className="text-on-surface-variant text-[13px]">
                Connect to AWS, Snowflake, or Salesforce to reconcile contractual
                promises with actual performance logs.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="bg-surface-container border border-outline-variant rounded-xl p-6 group hover:border-secondary/30 transition-all"
              {...fadeUp}
            >
              <div className="w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center mb-4">
                <Shield size={20} className="text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">
                Risk Scoring
              </h3>
              <p className="text-on-surface-variant text-[13px]">
                Real-time alerts when operational data drifts from contractual
                boundaries before the audit begins.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-surface-container-lowest py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-12" {...fadeUp}>
              <h2 className="text-5xl font-bold text-on-surface tracking-tight">
                Scales with your liability.
              </h2>
              <p className="text-on-surface-variant mt-4">
                Transparent pricing for forensic-grade legal tech.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {[
                {
                  name: "Starter",
                  price: "$0",
                  features: ["Up to 5 Contracts", "Basic Extraction", null],
                  cta: "Start Free",
                  highlight: false,
                },
                {
                  name: "Professional",
                  price: "$499",
                  features: [
                    "Unlimited Contracts",
                    "Full Data Reconciliation",
                    "Custom Risk Thresholds",
                    "API Access",
                  ],
                  cta: "Go Pro",
                  highlight: true,
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  features: [
                    "Dedicated Nodes",
                    "On-Prem Deployment",
                    "24/7 Forensic Support",
                  ],
                  cta: "Contact Sales",
                  highlight: false,
                },
              ].map((plan, i) => (
                <motion.div
                  key={plan.name}
                  className={`rounded-2xl p-8 flex flex-col ${
                    plan.highlight
                      ? "bg-primary-container/10 border-2 border-primary scale-105 relative"
                      : "glass"
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-3 py-1 rounded-full text-[11px] font-semibold">
                      MOST POPULAR
                    </div>
                  )}
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant mb-2">
                    {plan.name}
                  </span>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-[32px] font-semibold text-on-surface">
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-on-surface-variant">/mo</span>
                    )}
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((f, j) =>
                      f ? (
                        <li key={j} className="flex items-center gap-2 text-[13px]">
                          <CheckCircle2
                            size={16}
                            className="text-primary shrink-0"
                          />
                          {f}
                        </li>
                      ) : (
                        <li
                          key={j}
                          className="flex items-center gap-2 text-[13px] text-on-surface-variant/50"
                        >
                          <span className="w-4 h-4 rounded-full border border-outline-variant flex items-center justify-center text-[10px]">
                            ×
                          </span>
                          Data Reconciliation
                        </li>
                      )
                    )}
                  </ul>
                  <button
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      plan.highlight
                        ? "bg-primary text-on-primary hover:opacity-90"
                        : "border border-outline-variant hover:bg-surface-container-highest"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-container/10 via-surface to-primary-container/10 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />
          <motion.div className="relative z-10 max-w-2xl mx-auto" {...fadeUp}>
            <h2 className="text-4xl font-bold text-on-surface mb-4 tracking-tight">
              Ready to prove compliance?
            </h2>
            <p className="text-on-surface-variant text-lg mb-8">
              Join forward-thinking legal teams who trust Viscount AI.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-xl text-lg font-bold hover:scale-[1.02] transition-transform shadow-xl shadow-primary-container/20"
            >
              Start your free trial
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-outline-variant bg-surface-container-lowest">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-7xl mx-auto gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold text-on-surface">VISCOUNT AI</span>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">
              © 2024 Viscount AI. Forensic Legal Intelligence.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Security", "API Documentation"].map(
              (link) => (
                <a
                  key={link}
                  className="text-on-surface-variant hover:text-on-surface text-[11px] font-semibold tracking-wider uppercase transition-colors"
                  href="#"
                >
                  {link}
                </a>
              )
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
