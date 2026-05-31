"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const variant =
    pathname === "/signup"
      ? "signup"
      : pathname === "/forgot-password"
      ? "forgot"
      : pathname === "/verify-email"
      ? "verify"
      : "login";

  return (
    <main className="flex flex-col md:flex-row min-h-screen">
      {/* LEFT: Form Column */}
      <section className="w-full md:w-1/2 flex flex-col justify-between p-6 relative z-10 bg-surface">
        {/* Brand Anchor */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-container/20 group-hover:scale-105 transition-transform">
              V
            </div>
            <span className="text-2xl font-bold text-on-surface tracking-tight">
              VISCOUNT AI
            </span>
          </Link>
        </motion.div>

        {/* Animated Form Container */}
        <div className="max-w-md w-full mx-auto py-8 flex-1 flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Links */}
        <motion.footer
          className="flex flex-wrap justify-center md:justify-start gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <a className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant hover:text-on-surface transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant hover:text-on-surface transition-colors" href="#">
            Terms of Service
          </a>
          <a className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant hover:text-on-surface transition-colors" href="#">
            Security
          </a>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant/50 ml-auto hidden md:block">
            © 2024 Viscount AI
          </span>
        </motion.footer>
      </section>

      {/* RIGHT: Visual Column */}
      <AuthVisualPanel variant={variant} />
    </main>
  );
}
