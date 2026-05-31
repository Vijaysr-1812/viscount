"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, RefreshCw, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const supabase = createClient();
  
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleResend = async () => {
    if (!email) {
      setErrorMessage("No email address provided to resend.");
      return;
    }

    setResendStatus("loading");
    setCanResend(false);
    setErrorMessage(null);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (error) {
      setResendStatus("error");
      setErrorMessage(error.message);
      setCanResend(true); // Allow immediate retry on error
    } else {
      setResendStatus("success");
      setResendTimer(60); // Reset cooldown
      
      // Reset success state after a few seconds
      setTimeout(() => setResendStatus("idle"), 5000);
    }
  };

  return (
    <div className="space-y-8 text-center">
      {/* Animated mail icon */}
      <motion.div
        className="w-20 h-20 mx-auto relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          className="w-20 h-20 bg-primary-container/10 rounded-2xl flex items-center justify-center border border-primary/20"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(79,70,229,0.1)",
              "0 0 0 20px rgba(79,70,229,0)",
              "0 0 0 0 rgba(79,70,229,0.1)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Mail size={32} className="text-primary" />
        </motion.div>
        <motion.div
          className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
        >
          <CheckCircle2 size={14} className="text-white" />
        </motion.div>
      </motion.div>

      <motion.header
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-[32px] font-semibold text-on-surface tracking-tight leading-tight">
          Verify your email
        </h2>
        <p className="text-[14px] text-on-surface-variant max-w-sm mx-auto">
          We&apos;ve sent a verification link to {email ? <span className="font-semibold text-primary">{email}</span> : "your email address"}. 
          Please check your inbox and click the link to activate your workspace.
        </p>
      </motion.header>

      {/* Verification steps */}
      <motion.div
        className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-4 text-left"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[
          { step: "1", text: "Open the email from Viscount AI", done: true },
          { step: "2", text: "Click the verification link", done: false },
          { step: "3", text: "Start analyzing contracts", done: false },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold ${
                item.done
                  ? "bg-emerald-500/20 text-emerald-500"
                  : "bg-surface-container-highest text-on-surface-variant"
              }`}
            >
              {item.done ? <CheckCircle2 size={14} /> : item.step}
            </div>
            <span
              className={`text-[13px] ${
                item.done ? "text-on-surface" : "text-on-surface-variant"
              }`}
            >
              {item.text}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-error-container/20 border border-error/50 rounded-xl text-error text-[13px] font-semibold flex items-center gap-2"
          >
            <AlertCircle size={16} />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resend button */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={handleResend}
          disabled={!canResend || resendStatus === "loading"}
          className={`inline-flex items-center gap-2 text-[13px] font-medium transition-all ${
            canResend && resendStatus !== "loading"
              ? "text-primary hover:underline cursor-pointer"
              : "text-on-surface-variant/50 cursor-not-allowed"
          }`}
        >
          <RefreshCw size={14} className={resendStatus === "loading" ? "animate-spin" : ""} />
          {resendStatus === "loading"
            ? "Sending..."
            : resendStatus === "success"
            ? "Email sent successfully!"
            : canResend
            ? "Resend verification email"
            : `Resend in ${resendTimer}s`}
        </button>

        <div className="pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary-container rounded-xl font-semibold text-[14px] hover:opacity-90 transition-all"
          >
            Continue to Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
