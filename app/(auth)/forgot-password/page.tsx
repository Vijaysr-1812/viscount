"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Loader2, Check, ArrowLeft, Mail } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setSubmitState("loading");
    console.log("Reset email:", data.email);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSubmitState("success");
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[13px] text-on-surface-variant hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </motion.div>

      <motion.header
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-[32px] font-semibold text-on-surface tracking-tight leading-tight">
          Reset password
        </h2>
        <p className="text-[14px] text-on-surface-variant">
          Enter your email address and we&apos;ll send you a secure reset link.
        </p>
      </motion.header>

      <AnimatePresence mode="wait">
        {submitState !== "success" ? (
          <motion.form
            key="form"
            className="space-y-4"
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative floating-label-group">
              <input
                id="email"
                type="email"
                placeholder=" "
                className={`block w-full px-4 py-4 text-on-surface bg-surface-container-lowest border rounded-xl focus:ring-1 transition-all peer outline-none text-[14px] ${
                  errors.email
                    ? "border-error focus:ring-error focus:border-error"
                    : "border-outline-variant focus:ring-primary focus:border-primary"
                }`}
                {...register("email")}
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-4 text-on-surface-variant transition-all pointer-events-none origin-left text-[14px]"
              >
                Email address
              </label>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-error text-[12px] mt-1.5 pl-1"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={submitState === "loading"}
              className="w-full py-4 rounded-xl font-semibold text-[14px] bg-primary-container text-on-primary-container hover:opacity-90 transition-all flex items-center justify-center gap-2"
              whileTap={{ scale: 0.98 }}
            >
              {submitState === "loading" ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Mail size={18} />
                  Send reset link
                </>
              )}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container border border-outline-variant rounded-xl p-8 text-center space-y-4"
          >
            <motion.div
              className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            >
              <Check size={28} className="text-emerald-500" />
            </motion.div>
            <h3 className="text-[20px] font-semibold text-on-surface">
              Check your inbox
            </h3>
            <p className="text-[14px] text-on-surface-variant max-w-xs mx-auto">
              We&apos;ve sent a password reset link to your email. The link expires in 30 minutes.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-primary text-[13px] font-medium hover:underline mt-4"
            >
              <ArrowLeft size={14} />
              Return to login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
