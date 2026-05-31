"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Download,
  Calendar,
  ChevronDown,
  Check,
  UploadCloud,
  ShieldCheck,
  AlertTriangle,
  Gavel,
  ChevronRight,
  Bot,
  X,
  Link as LinkIcon,
  TrendingUp,
  FileText,
  Search
} from "lucide-react";

type TimelineEvent = {
  id: string;
  contract_id: string;
  org_id: string;
  title: string;
  description: string | null;
  event_type?: string | null;
  occurred_at: string;
  contracts?: {
    id: string;
    title: string;
  } | null;
};

export function TimelineClient({
  events
}: {
  events: TimelineEvent[];
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleDetail = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  };

  const getEventIcon = (event: TimelineEvent) => {
    const t = (event.title || "").toLowerCase() + " " + (event.description || "").toLowerCase() + " " + (event.event_type || "").toLowerCase();
    
    if (t.includes("breach") || t.includes("disput") || t.includes("risk")) {
      return { icon: AlertTriangle, bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/40", glow: "rgba(244,63,94,0.4)" };
    }
    if (t.includes("evidence") || t.includes("verif") || t.includes("compliant")) {
      return { icon: ShieldCheck, bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/40", glow: "rgba(16,185,129,0.4)" };
    }
    if (t.includes("ai") || t.includes("analy") || t.includes("extracted")) {
      return { icon: Bot, bg: "bg-secondary-container/40", text: "text-secondary", border: "border-secondary/40", glow: "rgba(195,192,255,0.4)" };
    }
    if (t.includes("ingest") || t.includes("upload") || t.includes("created")) {
      return { icon: UploadCloud, bg: "bg-primary/20", text: "text-primary", border: "border-primary/40", glow: "rgba(195,192,255,0.4)" };
    }
    return { icon: Gavel, bg: "bg-zinc-800", text: "text-on-surface-variant", border: "border-outline-variant", glow: "rgba(255,255,255,0.1)" };
  };

  const staggerIn: any = {
    hidden: { opacity: 0, y: 15 },
    show: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  const filteredEvents = events.filter(ev => {
    if (activeFilter !== "all") {
       const t = (ev.title || "").toLowerCase() + " " + (ev.description || "").toLowerCase() + " " + (ev.event_type || "").toLowerCase();
       if (activeFilter === "ingestion" && !t.includes("ingest") && !t.includes("upload") && !t.includes("created")) return false;
       if (activeFilter === "ai audit" && !t.includes("ai") && !t.includes("analy") && !t.includes("extracted")) return false;
       if (activeFilter === "evidence" && !t.includes("evidence") && !t.includes("verif") && !t.includes("compliant")) return false;
       if (activeFilter === "dispute" && !t.includes("breach") && !t.includes("disput") && !t.includes("risk")) return false;
    }
    if (searchQuery) {
       const q = searchQuery.toLowerCase();
       return (ev.title || "").toLowerCase().includes(q) || 
              (ev.description || "").toLowerCase().includes(q) || 
              (ev.event_type || "").toLowerCase().includes(q) ||
              (ev.contracts?.title || "").toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-130px)] overflow-hidden relative">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full filter blur-[100px] opacity-10 bg-primary/20 w-[600px] h-[600px] -top-20 -left-20 animate-pulse" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 relative z-10">
        <div className="max-w-4xl mx-auto pb-12">
          {/* Header Section */}
          <motion.div 
            custom={0}
            initial="hidden"
            animate="show"
            variants={staggerIn}
            className="mb-8 flex flex-col gap-4"
          >
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[11px] font-semibold text-primary mb-1 block uppercase tracking-widest">
                  Forensic Timeline
                </span>
                <h1 className="text-3xl font-bold text-on-surface">Compliance Timeline</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                  <input
                    type="text"
                    placeholder="Search milestones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-surface-container-high/40 border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors w-64 text-on-surface placeholder:text-on-surface-variant/50"
                  />
                </div>
                <button className="bg-surface-container-high/40 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 text-on-surface-variant border border-outline-variant hover:text-on-surface hover:border-primary/50 transition-all shadow-sm">
                  <Download size={16} />
                  <span className="text-sm">Export Timeline</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-high/40 backdrop-blur-md p-3 rounded-xl border border-outline-variant">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-surface-container/50 px-4 py-1.5 rounded-lg border border-outline-variant text-sm font-semibold">
                  <FileText size={16} className="text-primary animate-pulse" />
                  <span>Auditing {filteredEvents.length} Historical Milestones</span>
                </div>
                
                <div className="h-6 w-[1px] bg-outline-variant mx-1 hidden sm:block"></div>
                
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                  {[
                    { id: "all", label: "All" },
                    { id: "ingestion", label: "Ingestion", styles: "bg-primary/20 text-primary border-primary/30" },
                    { id: "ai audit", label: "AI Audit", styles: "bg-secondary-container/30 text-secondary border-secondary/30" },
                    { id: "evidence", label: "Evidence", styles: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
                    { id: "dispute", label: "Dispute", styles: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                        activeFilter === f.id || (f.id === 'all' && activeFilter === 'all')
                          ? (f.styles || "bg-surface-container-highest text-on-surface border-outline-variant")
                          : "bg-surface-container/30 text-on-surface-variant border-transparent hover:border-outline-variant"
                      } ${activeFilter === f.id ? 'ring-1 ring-white/20' : ''}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline Wrapper */}
          <div className="relative mt-8 pt-8">
            {filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container/20 border border-outline-variant/30 rounded-2xl">
                <Calendar className="w-16 h-16 text-primary/30 mb-4" />
                <h3 className="text-lg font-bold mb-2">No Timeline Events Found</h3>
                <p className="text-sm text-on-surface-variant max-w-md leading-relaxed mb-4">
                  {events.length === 0 
                    ? "Timeline events are automatically created during contract uploads, obligation extractions, and compliance status updates." 
                    : "No events match your current filters. Try adjusting your search query or category filters."}
                </p>
              </div>
            ) : (
              <>
                {/* Central Line */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute left-1/2 top-0 bottom-0 w-[2px] transform -translate-x-1/2 bg-gradient-to-b from-primary via-secondary to-outline-variant"
                />

                <div className="space-y-16 relative">
                  {filteredEvents.map((event, index) => {
                    const side = index % 2 === 0 ? "left" : "right";
                    const itemStyle = getEventIcon(event);
                    const EventIcon = itemStyle.icon;
                    const formattedDate = new Date(event.occurred_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <motion.div 
                        key={event.id}
                        custom={index + 1} 
                        initial="hidden" 
                        animate="show" 
                        variants={staggerIn} 
                        className="flex items-center w-full group relative z-10"
                      >
                        {side === "left" ? (
                          <>
                            {/* Left Side Event */}
                            <div className="w-1/2 pr-12 flex justify-end">
                              <div 
                                className="bg-surface-container-low/60 backdrop-blur-xl p-5 rounded-xl w-full max-w-md relative border border-outline-variant hover:border-primary transition-all duration-300 shadow-md cursor-pointer"
                                onClick={() => toggleDetail(event)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${itemStyle.bg} flex items-center justify-center`}>
                                      <EventIcon size={16} className={itemStyle.text} />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-bold text-on-surface">{event.title}</h4>
                                      <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider truncate max-w-[200px]">
                                        {event.contracts?.title || "Contract Management"}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="font-mono text-[10px] opacity-60 shrink-0">{formattedDate}</span>
                                </div>
                                <p className="text-xs text-on-surface-variant leading-relaxed mb-3 line-clamp-2">
                                  {event.description || `Compliance event triggered by Viscount engine.`}
                                </p>
                                <div className="flex items-center justify-between border-t border-outline-variant/40 pt-2.5">
                                  <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded border border-outline-variant/50 text-on-surface-variant">
                                    FORENSIC AUDITOR
                                  </span>
                                  <ChevronRight size={14} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                                </div>
                              </div>
                            </div>
                            <div className="absolute left-1/2 w-4.5 h-4.5 rounded-full bg-primary transform -translate-x-1/2 shadow-[0_0_12px_rgba(195,192,255,0.5)] border-4 border-background z-20"></div>
                            <div className="w-1/2 pl-12"></div>
                          </>
                        ) : (
                          <>
                            {/* Right Side Event */}
                            <div className="w-1/2 pr-12"></div>
                            <div className="absolute left-1/2 w-4.5 h-4.5 rounded-full bg-secondary transform -translate-x-1/2 shadow-[0_0_12px_rgba(195,192,255,0.5)] border-4 border-background z-20"></div>
                            <div className="w-1/2 pl-12 flex justify-start">
                              <div 
                                className="bg-surface-container-low/60 backdrop-blur-xl p-5 rounded-xl w-full max-w-md relative border border-outline-variant hover:border-secondary transition-all duration-300 shadow-md cursor-pointer"
                                onClick={() => toggleDetail(event)}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg ${itemStyle.bg} flex items-center justify-center`}>
                                      <EventIcon size={16} className={itemStyle.text} />
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-bold text-on-surface">{event.title}</h4>
                                      <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider truncate max-w-[200px]">
                                        {event.contracts?.title || "Contract Management"}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="font-mono text-[10px] opacity-60 shrink-0">{formattedDate}</span>
                                </div>
                                <p className="text-xs text-on-surface-variant leading-relaxed mb-3 line-clamp-2">
                                  {event.description || `Compliance event triggered by Viscount engine.`}
                                </p>
                                <div className="flex items-center justify-between border-t border-outline-variant/40 pt-2.5">
                                  <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded border border-outline-variant/50 text-on-surface-variant">
                                    FORENSIC AUDITOR
                                  </span>
                                  <ChevronRight size={14} className="text-on-surface-variant group-hover:text-secondary transition-colors" />
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Drawer (Drilldown Detail Panel) */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: detailOpen && selectedEvent ? 0 : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="w-80 bg-surface-container-high/90 backdrop-blur-2xl border-l border-outline-variant h-full absolute right-0 top-0 p-5 flex flex-col gap-5 overflow-y-auto z-40 shadow-2xl"
      >
        {selectedEvent && (
          <>
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 shrink-0">
              <h3 className="text-base font-bold text-primary">Milestone Metadata</h3>
              <button onClick={() => setDetailOpen(false)} className="text-on-surface-variant hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            <section className="space-y-4">
              <div className="bg-surface-container-high/40 p-4 rounded-xl border border-outline-variant backdrop-blur-sm">
                <span className="text-[10px] font-semibold text-on-surface-variant mb-1.5 block uppercase tracking-wider">Target Contract</span>
                <div className="flex items-center gap-3">
                  <LinkIcon size={14} className="text-secondary" />
                  <p className="text-xs font-semibold text-on-surface truncate">{selectedEvent.contracts?.title || "Legal Agreement"}</p>
                </div>
              </div>
              
              <div className="bg-surface-container-high/40 p-4 rounded-xl border border-outline-variant backdrop-blur-sm">
                <span className="text-[10px] font-semibold text-on-surface-variant mb-1.5 block uppercase tracking-wider">Audit Result</span>
                <div className="flex items-center gap-3">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <p className="text-xs font-semibold text-on-surface">AI Status: Verified</p>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Payload Metadata</h4>
              <div className="bg-zinc-950 p-3 rounded-lg border border-outline-variant max-h-48 overflow-y-auto custom-scrollbar font-mono text-[9px] text-zinc-400 leading-normal">
                {selectedEvent.description || "No additional metadata payload found."}
              </div>
            </section>

            <section className="mt-auto pt-6 border-t border-outline-variant flex flex-col gap-2 shrink-0">
              <button 
                onClick={() => setDetailOpen(false)} 
                className="w-full py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-md"
              >
                Acknowledge Milestone
              </button>
            </section>
          </>
        )}
      </motion.aside>
    </div>
  );
}
