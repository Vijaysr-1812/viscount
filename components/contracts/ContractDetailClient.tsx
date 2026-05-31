"use client";

import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Share2, 
  FileText, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  Printer, 
  Maximize2, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Link2,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

type Contract = {
  id: string;
  title: string;
  status: string | null;
  risk_scores?: any[];
  file_url: string | null;
  created_at: string;
};

type EvidenceItem = {
  id: string;
  source: string;
  file_name: string;
  is_verified?: boolean | null;
  created_at: string;
};

type Obligation = {
  id: string;
  obligation_summary: string;
  clause_text: string | null;
  severity: string | null;
  status: string | null;
  created_at: string;
  obligation_evidence_links?: any[];
};

type TimelineEvent = {
  id: string;
  contract_id: string;
  title: string;
  description: string;
  occurred_at: string;
};

export function ContractDetailClient({ 
  contract, 
  initialObligations,
  initialTimelineEvents
}: { 
  contract: Contract; 
  initialObligations: Obligation[];
  initialTimelineEvents: TimelineEvent[];
}) {
  const [activeTab, setActiveTab] = useState("obligations");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedObligationId, setSelectedObligationId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"document" | "kanban">("document");

  const tabs = ["Obligations", "Evidence", "Risk", "Timeline"];
  const statusColors: Record<string, string> = { 
    emerald: "bg-emerald-500", 
    amber: "bg-amber-500", 
    rose: "bg-rose-500",
    blue: "bg-blue-500" 
  };

  const riskScore = contract.risk_scores && contract.risk_scores.length > 0 ? contract.risk_scores[0].overall_score : 0;

  // Group obligations by category
  const categoriesMap = useMemo(() => {
    const map: Record<string, Obligation[]> = {};
    initialObligations.forEach((ob) => {
      const cat = ob.clause_text ? ob.clause_text.substring(0, 30) + '...' : "General Clauses";
      if (!map[cat]) {
        map[cat] = [];
      }
      map[cat].push(ob);
    });
    return map;
  }, [initialObligations]);

  // Generate clauses list for navigation
  const dynamicClauses = useMemo(() => {
    return Object.entries(categoriesMap).map(([category, obs], index) => {
      // Determine overall status based on worst status
      let status = "emerald";
      if (obs.some((o) => o.status === "breached")) {
        status = "rose";
      } else if (obs.some((o) => o.status === "disputed" || o.status === "pending")) {
        status = "amber";
      }

      return {
        title: category,
        status,
        children: obs
      };
    });
  }, [categoriesMap]);

  const toggleCategory = (title: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // All linked evidence items
  const allEvidence = useMemo(() => {
    const list: EvidenceItem[] = [];
    initialObligations.forEach((ob) => {
      if (ob.obligation_evidence_links && ob.obligation_evidence_links.length > 0) {
        ob.obligation_evidence_links.forEach(link => {
          if (link.evidence) list.push({
            ...link.evidence,
            is_verified: link.human_verified
          });
        });
      }
    });
    return list;
  }, [initialObligations]);

  // Dynamic recommendations for Risk tab
  const riskRecommendations = useMemo(() => {
    const recs: string[] = [];
    const breached = initialObligations.filter(o => o.status === 'breached');
    const pending = initialObligations.filter(o => o.status === 'pending');

    if (breached.length > 0) {
      recs.push(`Address ${breached.length} active compliance breaches immediately to prevent legal penalties.`);
    }
    if (pending.length > 0) {
      recs.push(`Provide missing verification evidence for ${pending.length} pending obligations.`);
    }
    if (riskScore > 70) {
      recs.push("Review high concentration of liabilities and adjust indemnification clauses.");
    }
    if (recs.length === 0) {
      recs.push("No immediate compliance actions required. Keep monitoring evidence pipelines.");
    }
    return recs;
  }, [initialObligations, riskScore]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="-mx-6 -my-6 flex flex-col h-[calc(100vh-64px)]">
      {/* Top Action Bar */}
      <header className="h-16 flex justify-between items-center px-6 bg-surface border-b border-outline-variant shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/contracts" className="p-1 hover:bg-surface-container-high rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-on-surface-variant" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">{contract.title}</h1>
            </div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">
              WORKSPACE • {contract.status || 'UNKNOWN'} • {contract.id.split('-')[0]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-on-surface hover:bg-surface-container-high border border-outline-variant rounded-xl transition-colors text-[13px] font-medium">
            <Share2 size={16} /> Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-[13px] font-semibold shadow-lg shadow-indigo-900/20">
            <FileText size={16} /> Generate Report
          </button>
        </div>
      </header>

      {/* Three-column workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* LEFT: Clause Navigator */}
        <aside className="w-72 bg-surface-container border-r border-outline-variant flex flex-col shrink-0">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-3 py-2 text-[13px] focus:border-indigo-500 transition-all outline-none" 
                placeholder="Search clauses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-0.5 custom-scrollbar">
            {dynamicClauses.length === 0 ? (
              <p className="text-xs text-on-surface-variant p-4 text-center">No categories found</p>
            ) : (
              dynamicClauses.map((clause, i) => {
                const isExpanded = expandedCategories[clause.title] ?? (i === 0);
                return (
                  <div key={clause.title}>
                    <div 
                      onClick={() => toggleCategory(clause.title)}
                      className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-colors ${isExpanded ? "bg-indigo-500/10 text-indigo-400" : "hover:bg-surface-container-high text-on-surface-variant"}`}
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="text-[13px] font-semibold truncate flex-1">{clause.title}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusColors[clause.status]}`} />
                    </div>
                    {isExpanded && clause.children.map((child) => (
                      <div 
                        key={child.id} 
                        onClick={() => {
                          setSelectedObligationId(child.id);
                          setActiveTab("obligations");
                        }}
                        className={`ml-6 mr-1 mt-0.5 flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors text-xs ${selectedObligationId === child.id ? "bg-surface-container-highest text-indigo-400 border border-indigo-500/20" : "hover:bg-surface-container-high text-on-surface-variant"}`}
                      >
                        <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${
                          child.status === 'breached' ? 'bg-rose-500' :
                          child.status === 'pending' || child.status === 'disputed' ? 'bg-amber-500' :
                          child.status === 'verified' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`} />
                        <span className="line-clamp-2 leading-relaxed">{child.obligation_summary}</span>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* CENTER: Document Viewer */}
        <section className="flex-1 bg-surface-container-lowest flex flex-col relative h-full">
          {/* Floating toolbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-surface-container/80 backdrop-blur-md border border-outline-variant px-4 py-2 rounded-full flex items-center gap-3 shadow-2xl">
              <div className="flex items-center gap-2 border-r border-outline-variant pr-3">
                <button className="p-1 hover:bg-surface-container-high rounded-lg"><ZoomOut size={14} /></button>
                <span className="text-[13px] font-mono">100%</span>
                <button className="p-1 hover:bg-surface-container-high rounded-lg"><ZoomIn size={14} /></button>
              </div>
              <div className="flex items-center gap-2 border-r border-outline-variant pr-3">
                <button onClick={() => setViewMode("document")} className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all ${viewMode === "document" ? "bg-indigo-600 text-white shadow-lg" : "text-on-surface hover:bg-surface-container-high"}`}>Document</button>
                <button onClick={() => setViewMode("kanban")} className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all ${viewMode === "kanban" ? "bg-indigo-600 text-white shadow-lg" : "text-on-surface hover:bg-surface-container-high"}`}>Kanban</button>
              </div>
              <button className="p-1 hover:bg-surface-container-high rounded-lg"><Printer size={16} /></button>
              <button className="p-1 hover:bg-surface-container-high rounded-lg"><Maximize2 size={16} /></button>
            </div>
          </div>

          {/* Document Viewer / Kanban Board */}
          <div className="flex-1 w-full h-full p-4 pt-16 flex justify-center overflow-y-auto custom-scrollbar">
            {viewMode === "kanban" ? (
              <motion.div 
                className="w-full h-full flex gap-4 overflow-x-auto pb-4 custom-scrollbar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Pending Column */}
                <div className="w-80 shrink-0 flex flex-col bg-surface-container-low rounded-xl border border-outline-variant/50 overflow-hidden h-max max-h-full">
                  <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-500 font-bold text-xs flex justify-between items-center">
                    <span>PENDING VERIFICATION</span>
                    <span className="bg-amber-500/20 px-2 py-0.5 rounded-full">{initialObligations.filter(o => o.status === 'pending' || !o.status).length}</span>
                  </div>
                  <div className="p-2 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                    {initialObligations.filter(o => o.status === 'pending' || !o.status).map(ob => (
                      <div key={ob.id} onClick={() => setSelectedObligationId(ob.id)} className={`p-3 bg-surface border rounded-lg cursor-pointer hover:border-amber-500 transition-colors ${selectedObligationId === ob.id ? "border-amber-500 shadow-md" : "border-outline-variant"}`}>
                        <p className="text-[11px] font-bold text-on-surface mb-1">{ob.obligation_summary}</p>
                        <p className="text-[10px] text-on-surface-variant line-clamp-2">{ob.clause_text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Verified Column */}
                <div className="w-80 shrink-0 flex flex-col bg-surface-container-low rounded-xl border border-outline-variant/50 overflow-hidden h-max max-h-full">
                  <div className="p-3 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-500 font-bold text-xs flex justify-between items-center">
                    <span>VERIFIED</span>
                    <span className="bg-emerald-500/20 px-2 py-0.5 rounded-full">{initialObligations.filter(o => o.status === 'verified').length}</span>
                  </div>
                  <div className="p-2 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                    {initialObligations.filter(o => o.status === 'verified').map(ob => (
                      <div key={ob.id} onClick={() => setSelectedObligationId(ob.id)} className={`p-3 bg-surface border rounded-lg cursor-pointer hover:border-emerald-500 transition-colors ${selectedObligationId === ob.id ? "border-emerald-500 shadow-md" : "border-outline-variant"}`}>
                        <p className="text-[11px] font-bold text-on-surface mb-1">{ob.obligation_summary}</p>
                        <p className="text-[10px] text-on-surface-variant line-clamp-2">{ob.clause_text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breached/Disputed Column */}
                <div className="w-80 shrink-0 flex flex-col bg-surface-container-low rounded-xl border border-outline-variant/50 overflow-hidden h-max max-h-full">
                  <div className="p-3 bg-rose-500/10 border-b border-rose-500/20 text-rose-500 font-bold text-xs flex justify-between items-center">
                    <span>BREACHED / DISPUTED</span>
                    <span className="bg-rose-500/20 px-2 py-0.5 rounded-full">{initialObligations.filter(o => o.status === 'breached' || o.status === 'disputed').length}</span>
                  </div>
                  <div className="p-2 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                    {initialObligations.filter(o => o.status === 'breached' || o.status === 'disputed').map(ob => (
                      <div key={ob.id} onClick={() => setSelectedObligationId(ob.id)} className={`p-3 bg-surface border rounded-lg cursor-pointer hover:border-rose-500 transition-colors ${selectedObligationId === ob.id ? "border-rose-500 shadow-md" : "border-outline-variant"}`}>
                        <p className="text-[11px] font-bold text-on-surface mb-1">{ob.obligation_summary}</p>
                        <p className="text-[10px] text-on-surface-variant line-clamp-2">{ob.clause_text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : contract.file_url ? (
              <motion.div
                className="w-full max-w-4xl bg-surface-container-low border border-outline-variant/30 shadow-2xl relative h-full rounded-xl overflow-hidden self-start flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 z-10" />
                <iframe src={contract.file_url} className="w-full flex-1" title={contract.title} />
              </motion.div>
            ) : (
              <motion.div
                className="w-full max-w-4xl bg-zinc-900 border border-outline-variant/30 shadow-2xl p-10 sm:p-16 text-zinc-100 leading-relaxed relative min-h-[800px] rounded-xl overflow-hidden self-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
                <div className="flex justify-between items-center mb-8 border-b border-outline-variant pb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="text-indigo-400" size={24} />
                    <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant font-mono">Forensic Sandbox Vault</span>
                  </div>
                  <span className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-mono">SECURE</span>
                </div>
                
                <h2 className="text-2xl font-bold mb-6 text-indigo-300">
                  {contract.title}
                </h2>
                
                <div className="prose prose-invert max-w-none text-sm space-y-6 text-zinc-300 leading-7">
                  <p className="italic text-zinc-400">
                    Document Analysis successfully completed. The forensic engine has parsed and mapped the following clauses to active Supabase compliance pipelines. Select obligations from the sidebar or tabs to drill down.
                  </p>
                  
                  {initialObligations.length === 0 ? (
                    <div className="p-8 text-center bg-surface-container-low border border-dashed border-outline-variant rounded-xl mt-6">
                      <p className="text-on-surface-variant text-sm">No obligations extracted. Click &quot;Seed Sandbox Data&quot; on the main dashboard to populate realistic compliance tracks.</p>
                    </div>
                  ) : (
                    initialObligations.map((ob, idx) => (
                      <div 
                        key={ob.id}
                        className={`p-4 rounded-xl border transition-all ${selectedObligationId === ob.id ? "bg-indigo-950/20 border-indigo-500 ring-1 ring-indigo-500/30" : "bg-surface-container-high/40 border-outline-variant/20 hover:border-indigo-500/50"}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Clause #{idx + 1}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            ob.status === 'breached' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            ob.status === 'pending' || ob.status === 'disputed' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            ob.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>{ob.status || 'pending'}</span>
                        </div>
                        <p className="text-zinc-200">{ob.obligation_summary}</p>
                        <p className="text-zinc-400 text-xs mt-2 italic">{ob.clause_text}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* RIGHT: Evidence & Details */}
        <aside className="w-96 bg-surface border-l border-outline-variant flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant px-2 bg-surface-container-low shrink-0">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-4 py-3 text-[11px] font-semibold tracking-wider uppercase border-b-2 transition-colors ${
                  activeTab === tab.toLowerCase()
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="overflow-y-auto flex-1 p-4 space-y-4 custom-scrollbar">
            
            {/* OBLIGATIONS TAB */}
            {activeTab === "obligations" && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-semibold">Active Obligations ({initialObligations.length})</span>
                </div>

                {initialObligations.length === 0 ? (
                  <div className="p-4 bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl text-center">
                    <span className="text-[12px] text-on-surface-variant">No obligations extracted yet.</span>
                  </div>
                ) : (
                  initialObligations.map((ob, i) => (
                    <motion.div
                      key={ob.id}
                      id={`ob-${ob.id}`}
                      className={`bg-surface-container-high border rounded-xl p-4 hover:border-indigo-500 transition-all cursor-pointer group ${selectedObligationId === ob.id ? "border-indigo-500 shadow-lg ring-1 ring-indigo-500/20" : "border-outline-variant"}`}
                      onClick={() => setSelectedObligationId(ob.id)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          ob.status === 'breached' ? 'bg-rose-500/10 text-rose-500' :
                          ob.status === 'pending' || ob.status === 'disputed' ? 'bg-amber-500/10 text-amber-500' :
                          ob.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-indigo-500/10 text-indigo-400'
                        }`}>{ob.status || 'pending'}</span>
                        <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                          {ob.severity} Risk
                        </span>
                      </div>
                      <h4 className="text-[13px] font-bold mb-2 group-hover:text-indigo-400 transition-colors">{ob.obligation_summary}</h4>
                      <p className="text-[12px] text-on-surface-variant leading-relaxed mb-3 italic">&quot;{ob.clause_text}&quot;</p>
                      
                      {/* Linked Evidence Section */}
                      {ob.obligation_evidence_links && ob.obligation_evidence_links.length > 0 ? (
                        <div className="space-y-1.5 mb-3">
                          <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider flex items-center gap-1">
                            <Link2 size={10} className="text-indigo-400" /> Linked Evidence ({ob.obligation_evidence_links.length})
                          </p>
                          {ob.obligation_evidence_links.map((link) => (
                            <div key={link.id} className="p-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg flex items-center justify-between">
                              <span className="text-[10px] font-mono truncate max-w-[160px]">{link.evidence?.source || "Unknown source"}</span>
                              <span className={`text-[9px] px-1.5 rounded font-bold ${link.human_verified ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                                {link.human_verified ? "Verified" : "Pending"}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 bg-surface-container-lowest rounded-lg border border-dashed border-outline-variant text-center mb-3">
                          <span className="text-[11px] text-on-surface-variant">No compliance evidence linked</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-outline-variant flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-on-surface-variant uppercase font-semibold tracking-wider">AI Confidence</span>
                          <div className="w-24 h-1 bg-surface-container-lowest rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-indigo-500 w-[95%]" />
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-indigo-400">95%</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </>
            )}

            {/* EVIDENCE TAB */}
            {activeTab === "evidence" && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-semibold">Contract Evidence Library ({allEvidence.length})</span>
                </div>

                {allEvidence.length === 0 ? (
                  <div className="p-8 text-center bg-surface-container-low border border-dashed border-outline-variant rounded-xl">
                    <p className="text-on-surface-variant text-xs">No evidence records connected to obligations in this contract.</p>
                  </div>
                ) : (
                  allEvidence.map((ev) => (
                    <div key={ev.id} className="p-3 bg-surface-container-high border border-outline-variant rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-400" /> {ev.source}
                        </span>
                        <span className={`text-[9px] px-1.5 rounded font-bold ${ev.is_verified ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                          {ev.is_verified ? "Verified" : "Pending"}
                        </span>
                      </div>
                      <div className="p-2 bg-surface-container-lowest rounded border border-outline-variant/20 text-[11px] font-mono text-zinc-300">
                        &quot;{ev.file_name}&quot;
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
                        <Clock size={10} />
                        <span>{new Date(ev.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* RISK TAB */}
            {activeTab === "risk" && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-surface-container-high to-surface border border-outline-variant rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={18} className="text-indigo-400" />
                    <span className="text-[13px] font-semibold">Risk Analysis Overview</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-zinc-800" />
                        <motion.circle
                          cx="48" cy="48" r="40" fill="transparent" stroke="currentColor" strokeWidth="6"
                          className="text-indigo-500"
                          strokeDasharray="251.2"
                          initial={{ strokeDashoffset: 251.2 }}
                          animate={{ strokeDashoffset: 251.2 - (251.2 * riskScore) / 100 }}
                          transition={{ delay: 0.2, duration: 1.2 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold">{riskScore}</span>
                        <span className="text-[8px] uppercase tracking-wider text-zinc-400">Score</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`text-md font-bold ${
                        riskScore > 70 ? 'text-rose-400' :
                        riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {riskScore > 70 ? 'High Risk' :
                         riskScore > 30 ? 'Moderate' : 'Low Risk'}
                      </span>
                      <p className="text-[10px] text-on-surface-variant max-w-[130px] leading-relaxed">Derived from legal liability and obligations status.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-high border border-outline-variant rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mitigation Recommendations</h4>
                  <ul className="space-y-2.5">
                    {riskRecommendations.map((rec, idx) => (
                      <li key={idx} className="flex gap-2 text-xs leading-relaxed text-zinc-200">
                        <AlertCircle size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TIMELINE TAB */}
            {activeTab === "timeline" && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[13px] font-semibold">Audit Event Timeline ({initialTimelineEvents.length})</span>
                </div>

                {initialTimelineEvents.length === 0 ? (
                  <div className="p-8 text-center bg-surface-container-low border border-dashed border-outline-variant rounded-xl">
                    <p className="text-on-surface-variant text-xs">No timeline events recorded yet.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
                    {initialTimelineEvents.map((evt, idx) => (
                      <div key={evt.id} className="relative">
                        <div className="absolute -left-[20px] top-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-950 bg-indigo-500 shadow" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-on-surface leading-tight">{evt.title}</p>
                          {evt.description && (
                            <p className="text-[11px] text-on-surface-variant leading-relaxed">{evt.description}</p>
                          )}
                          <div className="flex items-center gap-1.5 text-[9px] text-on-surface-variant font-medium">
                            <Calendar size={10} />
                            <span>{new Date(evt.occurred_at || new Date()).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>

          {/* Footer */}
          <div className="p-4 bg-surface-container border-t border-outline-variant shrink-0">
            <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider uppercase text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Pipeline Sync: Active</span>
              <span>v2.5.0-forensic</span>
            </div>
          </div>
        </aside>
      </main>
    </motion.div>
  );
}
