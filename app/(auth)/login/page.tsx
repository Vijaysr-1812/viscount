"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function FloatingInput({
  id,
  label,
  type = "text",
  error,
  registration,
  endIcon,
}: {
  id: string;
  label: string;
  type?: string;
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm>["register"]>;
  endIcon?: React.ReactNode;
}) {
  return (
    <div className="relative floating-label-group">
      <input
        id={id}
        type={type}
        placeholder=" "
        className={`block w-full px-4 py-4 text-on-surface bg-surface-container-lowest border rounded-xl focus:ring-1 transition-all peer outline-none text-[14px] ${
          error
            ? "border-error focus:ring-error focus:border-error"
            : "border-outline-variant focus:ring-primary focus:border-primary"
        }`}
        {...registration}
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-4 text-on-surface-variant transition-all pointer-events-none origin-left text-[14px]"
      >
        {label}
      </label>
      {endIcon && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {endIcon}
        </div>
      )}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="text-error text-[12px] mt-1.5 pl-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitState("loading");
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setSubmitState("idle");
      setErrorMessage(error.message);
      return;
    }

    setSubmitState("success");
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1000);
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <motion.header
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-[32px] font-semibold text-on-surface tracking-tight leading-tight">
          Forensic access
        </h2>
        <p className="text-[14px] text-on-surface-variant">
          Analyze legal instruments with crystalline precision.
        </p>
      </motion.header>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-error-container/20 border border-error/50 rounded-xl text-error text-[13px] font-semibold"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        className="space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FloatingInput
          id="email"
          label="Email address"
          type="email"
          error={errors.email?.message}
          registration={register("email")}
        />

        <FloatingInput
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          error={errors.password?.message}
          registration={register("password")}
          endIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[13px] text-primary hover:underline transition-all"
          >
            Forgot password?
          </Link>
        </div>

        {/* Morphing Submit Button */}
        <motion.button
          type="submit"
          disabled={submitState !== "idle"}
          className={`w-full py-4 rounded-xl font-semibold text-[14px] transition-all duration-300 flex items-center justify-center gap-2 ${
            submitState === "success"
              ? "bg-emerald-600 text-white"
              : "bg-primary-container text-on-primary-container hover:opacity-90 active:scale-[0.98]"
          }`}
          whileTap={submitState === "idle" ? { scale: 0.98 } : {}}
          layout
        >
          <AnimatePresence mode="wait">
            {submitState === "idle" && (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Log in to Workspace
              </motion.span>
            )}
            {submitState === "loading" && (
              <motion.span
                key="loading"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
              >
                <Loader2 size={20} className="animate-spin" />
              </motion.span>
            )}
            {submitState === "success" && (
              <motion.span
                key="success"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Check size={20} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.form>

      {/* Divider */}
      <motion.div
        className="relative flex items-center py-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex-grow border-t border-outline-variant" />
        <span className="flex-shrink mx-4 text-on-surface-variant text-[11px] font-semibold uppercase tracking-widest">
          authorized providers
        </span>
        <div className="flex-grow border-t border-outline-variant" />
      </motion.div>

      {/* OAuth Buttons */}
      <motion.div
        className="grid grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button 
          onClick={() => handleOAuth('google')}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container border border-outline-variant rounded-xl text-[13px] text-on-surface hover:bg-surface-container-high hover:border-primary/30 transition-all duration-200 group"
        >
          <GoogleIcon size={18} />
          Google
        </button>
        <button 
          onClick={() => handleOAuth('github')}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container border border-outline-variant rounded-xl text-[13px] text-on-surface hover:bg-surface-container-high hover:border-primary/30 transition-all duration-200 group"
        >
          <GithubIcon size={18} />
          GitHub
        </button>
      </motion.div>

      {/* Sign up link */}
      <motion.p
        className="text-center text-[13px] text-on-surface-variant"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        New to the record room?{" "}
        <Link href="/signup" className="text-primary hover:underline transition-all font-medium">
          Request access
        </Link>
      </motion.p>
    </div>
  );
}
