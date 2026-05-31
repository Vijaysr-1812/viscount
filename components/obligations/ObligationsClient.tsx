"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  MoreVertical,
  Plus,
  Paperclip,
  CheckCircle2,
  Gavel,
  ChevronDown,
  Calendar,
  Filter,
  View,
  Table as TableIcon,
  Search,
  RefreshCw,
  ClipboardList
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type Obligation = {
  id: string;
  contract_id: string;
  org_id: string;
  obligation_summary: string;
  clause_text: string | null;
  severity: string | null;
  status: string | null;
  created_at: string;
  contracts?: {
    id: string;
    title: string;
  } | null;
  evidenceLinks?: any[];
};

type Contract = {
  id: string;
  title: string;
  risk_score: number | null;
};

export function ObligationsClient({
  initialObligations,
  initialContracts
}: {
  initialObligations: Obligation[];
  initialContracts: Contract[];
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOb, setSelectedOb] = useState<Obligation | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContractFilter, setSelectedContractFilter] = useState("all");
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState("all");

  const supabase = createClient();
  const router = useRouter();

  const handleUpdateStatus = async (obId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from("obligations")
        .update({ status: newStatus })
        .eq("id", obId);

      if (error) throw error;
      
      // Update local state if selected is active
      if (selectedOb && selectedOb.id === obId) {
        setSelectedOb({ ...selectedOb, status: newStatus });
      }
      
      router.refresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleDrawer = (ob: Obligation) => {
    setSelectedOb(ob);
    setDrawerOpen(true);
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariant: any = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 26 } },
  };

  // Filtered obligations
  const filteredObligations = initialObligations.filter((ob) => {
    const matchesSearch =
      ob.obligation_summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ob.clause_text || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ob.contracts?.title || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesContract =
      selectedContractFilter === "all" || ob.contract_id === selectedContractFilter;

    const matchesSeverity =
      selectedSeverityFilter === "all" ||
      (ob.severity || "").toLowerCase() === selectedSeverityFilter.toLowerCase();

    return matchesSearch && matchesContract && matchesSeverity;
  });

  // Columns config
  const columns = [
    { title: "Pending", statusKey: "pending", colorClass: "bg-amber-500", glowClass: "rgba(245,158,11,0.5)" },
    { title: "Evidence Submitted", statusKey: "evidence_submitted", colorClass: "bg-blue-500", glowClass: "rgba(59,130,246,0.5)" },
    { title: "Verified", statusKey: "verified", colorClass: "bg-emerald-500", glowClass: "rgba(16,185,129,0.5)" },
    { title: "Disputed / Breached", statusKey: "disputed", colorClass: "bg-rose-500", glowClass: "rgba(244,63,94,0.5)" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] overflow-hidden">
      {/* Header Controls */}
      <section className="flex flex-col gap-4 relative z-10 mb-4 shrink-0">
        <div className="flex justify-between items-end">
          <div className="flex items-baseline gap-2">
            <h1 className="text-3xl font-bold text-on-surface">Obligations</h1>
            <span className="font-mono text-on-surface-variant text-sm opacity-60">
              ({filteredObligations.length})
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-surface-container/60 backdrop-blur-sm p-1 rounded-lg border border-outline-variant">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1 rounded-md flex items-center gap-2 text-sm shadow-sm transition-all ${
                  viewMode === "kanban"
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <View size={16} />
                Kanban
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded-md flex items-center gap-2 text-sm transition-all ${
                  viewMode === "table"
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <TableIcon size={16} />
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container/40 backdrop-blur-md p-3 rounded-xl border border-outline-variant">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex items-center bg-surface-container-lowest/50 border border-outline-variant rounded-lg px-3 py-1 w-64 group focus-within:border-primary transition-all">
              <Search size={16} className="text-on-surface-variant shrink-0" />
              <input
                className="bg-transparent border-none text-xs text-on-surface w-full placeholder:text-on-surface-variant ml-2 outline-none"
                placeholder="Search obligation clauses..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Contract Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-surface-container-lowest/50 border border-outline-variant rounded-lg pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:border-primary cursor-pointer"
                value={selectedContractFilter}
                onChange={(e) => setSelectedContractFilter(e.target.value)}
              >
                <option value="all">All Contracts</option>
                {initialContracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
            </div>

            {/* Severity Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-surface-container-lowest/50 border border-outline-variant rounded-lg pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:border-primary cursor-pointer"
                value={selectedSeverityFilter}
                onChange={(e) => setSelectedSeverityFilter(e.target.value)}
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical Risk</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
            </div>

            {(searchQuery || selectedContractFilter !== "all" || selectedSeverityFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedContractFilter("all");
                  setSelectedSeverityFilter("all");
                }}
                className="text-primary text-xs font-semibold hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <span className="text-on-surface-variant">Group by:</span>
            <span className="font-semibold bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant">Status</span>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden">
        {filteredObligations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-surface-container/20 backdrop-blur-sm border border-outline-variant/30 rounded-2xl">
            <ClipboardList className="w-16 h-16 text-primary/40 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold mb-2">No Obligations Found</h3>
            <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
              Ensure you have selected the correct filters. If your workspace is empty, head over to the **Upload Center** to ingest your first PDF or Word agreement and extract its active obligations!
            </p>
          </div>
        ) : viewMode === "kanban" ? (
          /* KANBAN VIEW */
          <div className="h-full flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {columns.map((col) => {
              const colObs = filteredObligations.filter(
                (ob) => {
                  const s = (ob.status || "pending").toLowerCase();
                  if (col.statusKey === "disputed") return s === "disputed" || s === "breached";
                  return s === col.statusKey;
                }
              );

              return (
                <div key={col.statusKey} className="flex-shrink-0 w-80 flex flex-col gap-3 h-full">
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container/40 backdrop-blur-md border border-outline-variant/30 sticky top-0 z-20 shrink-0">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: col.statusKey === "pending" ? "#f59e0b" :
                                           col.statusKey === "evidence_submitted" ? "#3b82f6" :
                                           col.statusKey === "verified" ? "#10b981" : "#f43f5e",
                          boxShadow: `0 0 8px ${col.glowClass}`
                        }}
                      ></div>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
                        {col.title}
                      </h3>
                      <span className="text-xs text-on-surface-variant font-mono opacity-60">
                        {colObs.length}
                      </span>
                    </div>
                  </div>

                  {/* Cards List */}
                  <motion.div
                    className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-1 pb-16"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                  >
                    {colObs.map((ob) => (
                      <motion.div
                        key={ob.id}
                        variants={cardVariant}
                        onClick={() => toggleDrawer(ob)}
                        className="bg-surface-container/40 backdrop-blur-sm border border-outline-variant/30 p-4 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-surface-container/60 group relative overflow-hidden shadow-sm hover:shadow transition-all"
                      >
                        <div className="flex justify-between items-start mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              ob.severity === "high" || ob.severity === "critical" ? "bg-error" :
                              ob.severity === "medium" ? "bg-amber-500" : "bg-emerald-500"
                            }`}></span>
                            <span className="text-[9px] font-bold font-mono tracking-wider text-on-surface-variant truncate max-w-[180px] uppercase">
                              {ob.contracts?.title || "Contract Detail"}
                            </span>
                          </div>
                        </div>
                        <p className="text-[13px] text-on-surface line-clamp-2 leading-snug mb-3 font-semibold">
                          {ob.obligation_summary}
                        </p>
                        <p className="text-[11px] text-on-surface-variant line-clamp-2 italic mb-3">
                          {ob.clause_text}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-container-highest/60 border border-outline-variant/30 text-on-surface-variant">
                            {ob.status}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono font-bold uppercase ${
                              ob.severity === "high" || ob.severity === "critical" ? "text-error" :
                              ob.severity === "medium" ? "text-amber-500" : "text-emerald-400"
                            }`}>
                              {ob.severity}
                            </span>
                          </div>
                        </div>
                        <div
                          className="absolute bottom-0 left-0 h-[2px] w-full"
                          style={{
                            backgroundColor: col.statusKey === "pending" ? "rgba(245,158,11,0.2)" :
                                             col.statusKey === "evidence_submitted" ? "rgba(59,130,246,0.2)" :
                                             col.statusKey === "verified" ? "rgba(16,185,129,0.2)" : "rgba(244,63,94,0.2)"
                          }}
                        >
                          <div
                            className="h-full"
                            style={{
                              width: ob.severity === "high" || ob.severity === "critical" ? "100%" :
                                     ob.severity === "medium" ? "60%" : "30%",
                              backgroundColor: col.statusKey === "pending" ? "#f59e0b" :
                                               col.statusKey === "evidence_submitted" ? "#3b82f6" :
                                               col.statusKey === "verified" ? "#10b981" : "#f43f5e"
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="h-full bg-surface-container/20 border border-outline-variant/30 rounded-xl overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Contract</th>
                    <th className="px-6 py-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Obligation</th>
                    <th className="px-6 py-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Severity</th>
                    <th className="px-6 py-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {filteredObligations.map((ob) => (
                    <tr
                      key={ob.id}
                      onClick={() => toggleDrawer(ob)}
                      className="hover:bg-surface-container-high/40 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-semibold text-xs text-on-surface truncate max-w-[200px]">
                        {ob.contracts?.title || "Contract"}
                      </td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant max-w-lg truncate font-medium">
                        {ob.obligation_summary}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className={`font-mono font-bold uppercase ${
                          ob.severity === "high" || ob.severity === "critical" ? "text-error" :
                          ob.severity === "medium" ? "text-amber-500" : "text-emerald-400"
                        }`}>
                          {ob.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          ob.status === "verified" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          ob.status === "evidence_submitted" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                          ob.status === "disputed" || ob.status === "breached" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {ob.status || "pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer & Backdrop */}
      <AnimatePresence>
        {drawerOpen && selectedOb && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-surface-container-lowest/60 backdrop-blur-sm z-40 pointer-events-auto"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-screen w-[480px] bg-surface-container-high/90 backdrop-blur-2xl border-l border-outline-variant z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-outline-variant">
                <div className="flex items-center gap-3">
                  <MoreVertical size={20} className="text-primary" />
                  <h2 className="text-xl font-bold text-on-surface">
                    Obligation Details
                  </h2>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 custom-scrollbar">
                {/* Header Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-outline-variant/30 backdrop-blur-md">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant block mb-1">
                      SEVERITY
                    </span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        selectedOb.severity === "high" || selectedOb.severity === "critical" ? "bg-error animate-pulse" :
                        selectedOb.severity === "medium" ? "bg-amber-500" : "bg-emerald-500"
                      }`}></div>
                      <span className="text-lg font-bold text-on-surface capitalize">
                        {selectedOb.severity}
                      </span>
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-outline-variant/30 backdrop-blur-md">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant block mb-1">
                      COMPLIANCE STATUS
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold uppercase ${
                        selectedOb.status === "verified" ? "text-emerald-400" :
                        selectedOb.status === "evidence_submitted" ? "text-blue-400" :
                        selectedOb.status === "disputed" || selectedOb.status === "breached" ? "text-rose-400" : "text-amber-500"
                      }`}>
                        {selectedOb.status || "pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Clause Title & Info */}
                <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-outline-variant/30">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant block mb-1.5">
                    ASSOCIATED AGREEMENT
                  </span>
                  <p className="text-sm font-semibold text-on-surface">
                    {selectedOb.contracts?.title || "Contract Details"}
                  </p>
                  <p className="text-[10px] font-mono text-outline mt-1 font-bold">
                    ID: {selectedOb.contract_id.substring(0, 13)}...
                  </p>
                </div>

                {/* Clause Text */}
                <div className="bg-surface-container-lowest/30 p-4 rounded-xl border border-outline-variant/30">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant block mb-2.5">
                    OBLIGATION SUMMARY
                  </span>
                  <p className="text-sm text-on-surface font-semibold mb-3">
                    {selectedOb.obligation_summary}
                  </p>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant block mb-2.5">
                    EXTRACTED CLAUSE TEXT
                  </span>
                  <p className="text-sm text-on-surface italic leading-relaxed">
                    &quot;{selectedOb.clause_text}&quot;
                  </p>
                </div>

                {/* AI Reasoning */}
                <div className="bg-primary-container/10 p-4 rounded-xl border border-primary/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-primary">
                      AI Legal Reasoning
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Compliance is currently tracked as <strong>{selectedOb.status || "pending"}</strong>. Update its status below to reflect real-world verification or dispute logs.
                  </p>
                </div>

                {/* Linked Evidence */}
                {selectedOb.evidenceLinks && selectedOb.evidenceLinks.length > 0 && (
                  <div className="bg-surface-container-lowest/50 p-4 rounded-xl border border-outline-variant/30">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant block mb-3">
                      LINKED EVIDENCE ({selectedOb.evidenceLinks.length})
                    </span>
                    <div className="flex flex-col gap-3">
                      {selectedOb.evidenceLinks.map((link: any, i: number) => {
                        const ev = Array.isArray(link.evidence) ? link.evidence[0] : link.evidence;
                        if (!ev) return null;
                        return (
                          <a
                            key={i}
                            href={ev.file_url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block p-3 rounded-lg border border-outline-variant/50 hover:border-primary/50 hover:bg-surface-container/50 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <Paperclip className="w-4 h-4 mt-0.5 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-semibold text-on-surface truncate mb-1 group-hover:text-primary transition-colors">
                                  {ev.file_name || "Unknown File"}
                                </p>
                                {ev.ai_summary && (
                                  <p className="text-[11px] text-on-surface-variant line-clamp-2">
                                    {ev.ai_summary}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                    link.match_type === 'full' ? 'bg-emerald-500/10 text-emerald-400' :
                                    link.match_type === 'partial' ? 'bg-amber-500/10 text-amber-500' :
                                    'bg-surface-container-high text-on-surface-variant'
                                  }`}>
                                    {link.match_type} MATCH
                                  </span>
                                  {link.confidence_score && (
                                    <span className="text-[10px] font-mono text-on-surface-variant opacity-80">
                                      {Math.round(link.confidence_score * 100)}% Confidence
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-outline-variant flex gap-3 bg-surface-container-lowest/50 backdrop-blur-xl">
                <button
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus(selectedOb.id, "verified")}
                  className="flex-1 bg-primary text-on-primary py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-115 active:scale-[0.98] transition-all shadow-md shadow-primary/20 text-xs"
                >
                  <CheckCircle2 size={16} />
                  {isUpdating ? "Updating..." : "Mark Verified"}
                </button>
                <button
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus(selectedOb.id, "disputed")}
                  className="flex-1 bg-surface-container text-on-surface border border-outline-variant py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high active:scale-[0.98] transition-all text-xs"
                >
                  <Gavel size={16} />
                  {isUpdating ? "Updating..." : "Dispute Status"}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
