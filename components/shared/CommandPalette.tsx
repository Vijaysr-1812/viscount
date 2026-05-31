"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, Sparkles, LayoutDashboard, FileText, 
  UploadCloud, Activity, ArrowUp, ArrowDown, 
  CornerDownLeft, Command, Search
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // If there's a global way to open it, handled by layout
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-32">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-[640px] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl flex flex-col overflow-hidden z-10 mx-4"
          >
            {/* Input Area */}
            <div className="relative flex items-center px-4 py-4 border-b border-outline-variant bg-surface">
              <Terminal className="text-primary mr-3" size={20} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-on-surface w-full font-body-md placeholder:text-on-surface-variant outline-none"
                placeholder="Type a command or search..."
                type="text"
              />
              <div className="flex items-center gap-1 ml-3 shrink-0">
                <span className="bg-surface-container-highest text-on-surface-variant font-mono text-[11px] font-semibold px-2 py-0.5 rounded border border-outline-variant">
                  ESC
                </span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="max-h-[480px] overflow-y-auto py-2 custom-scrollbar">
              {/* AI Ask Mode Section */}
              <div className="px-4 py-2 mb-2">
                <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-4 bg-gradient-to-br from-primary/10 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-primary" size={20} />
                    <span className="text-[11px] font-semibold tracking-wider text-primary">AI ASK MODE</span>
                    <span className="ml-auto text-on-surface-variant font-mono text-[10px]">Type / to trigger</span>
                  </div>
                  <div className="text-on-surface text-[13px] leading-relaxed italic opacity-80">
                    "Analyzing the termination clause in the current Master Service Agreement..."
                  </div>
                  <div className="mt-3 flex gap-1">
                    <div className="h-1 w-8 bg-primary rounded-full animate-pulse" />
                    <div className="h-1 w-8 bg-primary/30 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                    <div className="h-1 w-8 bg-primary/10 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>

              {/* Navigation Group */}
              <div className="mb-4">
                <h3 className="px-4 text-[11px] font-semibold tracking-wider text-on-surface-variant mb-2">Navigation</h3>
                <div className="px-2 space-y-0.5">
                  <div 
                    onClick={() => { router.push("/dashboard"); onClose(); }}
                    className="flex items-center px-4 py-2 rounded-xl hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="mr-3" size={20} />
                    <span className="text-[13px] flex-1">Dashboard</span>
                    <span className="opacity-40 font-mono text-[11px]">G D</span>
                  </div>
                  <div 
                    onClick={() => { router.push("/dashboard/contracts"); onClose(); }}
                    className="flex items-center px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <FileText className="mr-3" size={20} />
                    <span className="text-[13px] flex-1">Contracts Library</span>
                    <span className="opacity-40 font-mono text-[11px]">G C</span>
                  </div>
                </div>
              </div>

              {/* Recent Contracts */}
              <div className="mb-4">
                <h3 className="px-4 text-[11px] font-semibold tracking-wider text-on-surface-variant mb-2">Recent Contracts</h3>
                <div className="px-2 space-y-0.5">
                  <div 
                    onClick={() => { router.push("/dashboard/contracts/MSA-2024-0812"); onClose(); }}
                    className="flex items-center px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <FileText className="mr-3 text-tertiary" size={20} />
                    <span className="text-[13px] flex-1">MSA_2024_CloudCorp_v4.pdf</span>
                    <span className="opacity-40 text-[11px]">2h ago</span>
                  </div>
                  <div className="flex items-center px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer">
                    <FileText className="mr-3 text-tertiary" size={20} />
                    <span className="text-[13px] flex-1">Lease_Agreement_HQ_Final.docx</span>
                    <span className="opacity-40 text-[11px]">Yesterday</span>
                  </div>
                </div>
              </div>

              {/* Actions Group */}
              <div className="mb-2">
                <h3 className="px-4 text-[11px] font-semibold tracking-wider text-on-surface-variant mb-2">Actions</h3>
                <div className="px-2 space-y-0.5">
                  <div 
                    onClick={() => { router.push("/dashboard/upload"); onClose(); }}
                    className="flex items-center px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <UploadCloud className="mr-3" size={20} />
                    <span className="text-[13px] flex-1">Upload New Contract</span>
                    <span className="opacity-40 font-mono text-[11px] flex items-center gap-1">
                      <Command size={12} /> U
                    </span>
                  </div>
                  <div 
                    onClick={() => { router.push("/dashboard/reports"); onClose(); }}
                    className="flex items-center px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <Activity className="mr-3" size={20} />
                    <span className="text-[13px] flex-1">Run Compliance Audit</span>
                    <span className="opacity-40 font-mono text-[11px] flex items-center gap-1">
                      <Command size={12} /> R
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-outline-variant bg-surface-container-low flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <ArrowUp size={14} className="text-on-surface-variant" />
                  <ArrowDown size={14} className="text-on-surface-variant" />
                  <span className="text-[11px] font-semibold tracking-wider text-on-surface-variant">to navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <CornerDownLeft size={14} className="text-on-surface-variant" />
                  <span className="text-[11px] font-semibold tracking-wider text-on-surface-variant">to select</span>
                </div>
              </div>
              <div className="text-on-surface-variant text-[11px] font-semibold tracking-wider opacity-60">
                Viscount AI v2.4.0
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
