"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function UserProfileMenu() {
  const router = useRouter();
  const supabase = createClient();
  const menuRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string; role: string; initials: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user }, error: authErr } = await supabase.auth.getUser();
      if (authErr || !user) {
        setLoading(false);
        return;
      }

      // Fetch user profile
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      // Fetch org role
      const { data: member } = await supabase
        .from("organization_members")
        .select("role")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      const fullName = userProfile?.full_name || user.email?.split("@")[0] || "User";
      
      // Get initials (e.g. "John Doe" -> "JD")
      const initials = fullName
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

      let displayRole = "Member";
      if (member?.role === "owner") displayRole = "Workspace Owner";
      if (member?.role === "admin") displayRole = "Admin";

      setProfile({
        full_name: fullName,
        role: displayRole,
        initials: initials,
      });
      setLoading(false);
    }

    fetchProfile();

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center animate-pulse">
        <Loader2 size={16} className="text-outline animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
      >
        <div className="text-right hidden sm:block">
          <p className="text-[13px] font-semibold text-on-surface">
            {profile.full_name}
          </p>
          <p className="text-[10px] text-on-surface-variant">
            {profile.role}
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary-container/20 border border-outline-variant flex items-center justify-center text-primary font-bold text-sm">
          {profile.initials}
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-3 border-b border-outline-variant sm:hidden">
              <p className="text-[13px] font-semibold text-on-surface truncate">
                {profile.full_name}
              </p>
              <p className="text-[10px] text-on-surface-variant truncate">
                {profile.role}
              </p>
            </div>
            <div className="p-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded-lg transition-colors"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/dashboard/settings");
                }}
              >
                <UserIcon size={14} />
                Profile Settings
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-error hover:bg-error-container/50 hover:text-error rounded-lg transition-colors mt-1"
                onClick={handleSignOut}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
