"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Package,
  Clock,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Plus,
  PieChart,
  UploadCloud,
} from "lucide-react";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { UserProfileMenu } from "@/components/dashboard/UserProfileMenu";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/contracts", icon: FileText, label: "Contracts" },
  { href: "/dashboard/obligations", icon: ClipboardList, label: "Obligations" },
  { href: "/dashboard/evidence", icon: Package, label: "Evidence" },
  { href: "/dashboard/timeline", icon: Clock, label: "Timeline" },
  { href: "/dashboard/risk", icon: BarChart3, label: "Risk" },
  { href: "/dashboard/reports", icon: PieChart, label: "Audit" },
  { href: "/dashboard/upload", icon: UploadCloud, label: "Upload" },
];

const bottomNav = [
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "#", icon: HelpCircle, label: "Support" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div className="min-h-screen">
      <AnimatedBackground />

      {/* Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 h-full bg-surface-container/80 backdrop-blur-xl border-r border-outline-variant flex flex-col z-50 overflow-hidden print:hidden"
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 p-4 mb-2">
          <motion.div
            className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-primary-container/20"
            whileHover={{ scale: 1.05 }}
          >
            V
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-lg font-semibold text-primary">
                  Viscount AI
                </h1>
                <p className="text-[11px] text-on-surface-variant opacity-70">
                  Legal Workspace
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* New Analysis button */}
        <div className="px-3 mb-2">
          <button
            className={`bg-primary-container text-white rounded-xl py-2 font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 w-full ${
              collapsed ? "px-2" : "px-4"
            }`}
          >
            <Plus size={18} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap text-[13px]"
                >
                  New Analysis
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group relative ${
                  isActive
                    ? "bg-secondary-container/80 text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container-high/50"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <item.icon size={20} className="shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-[13px] overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom nav */}
        <div className="flex flex-col gap-1 px-3 border-t border-outline-variant pt-3 pb-3">
          {bottomNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 text-on-surface-variant hover:bg-surface-container-high/50 rounded-xl px-3 py-2.5 transition-colors ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[13px] overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ))}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center gap-3 text-on-surface-variant hover:bg-surface-container-high/50 rounded-xl px-3 py-2 transition-colors mt-1"
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span className="text-[13px]">Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Top Bar */}
      <motion.header
        className="fixed top-0 right-0 h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center px-6 z-40 print:hidden"
        animate={{ left: sidebarWidth }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-4">
          <nav className="flex items-center text-[13px] text-on-surface-variant gap-1.5">
            <span>Workspace</span>
            <span className="text-outline">›</span>
            <span className="text-on-surface font-semibold capitalize">
              {pathname === "/dashboard"
                ? "Dashboard"
                : pathname.split("/").pop()?.replace(/-/g, " ")}
            </span>
          </nav>
        </div>

        {/* Search */}
        <div className="relative hidden md:block cursor-pointer" onClick={() => setIsCommandPaletteOpen(true)}>
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
          />
          <input
            readOnly
            className="bg-surface-container-lowest border border-outline-variant rounded-full pl-10 pr-14 py-1.5 text-[13px] w-80 focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none transition-all text-on-surface placeholder:text-outline cursor-pointer pointer-events-none"
            placeholder="Search contracts, tasks, or evidence (⌘K)"
            type="text"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 bg-surface-container-highest text-[10px] px-1.5 py-0.5 rounded border border-outline-variant text-outline pointer-events-none">
            ⌘K
          </kbd>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <button className="relative text-on-surface-variant hover:text-primary transition-colors">
            <Bell size={20} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-error rounded-full" />
          </button>
          <div className="h-6 w-px bg-outline-variant" />
          <UserProfileMenu />
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="pt-16 min-h-screen print:pt-0 print:m-0 print:min-h-0"
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="px-6 pb-8 print:p-0">
          <div className="max-w-[1400px] mx-auto py-6 print:max-w-none print:p-0">{children}</div>
        </div>
      </motion.main>
      {/* Global Command Palette */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </div>
  );
}
