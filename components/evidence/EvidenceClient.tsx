"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Grid, 
  List, 
  ChevronDown, 
  UploadCloud, 
  MoreVertical, 
  PlayCircle,
  FileText,
  ZoomIn,
  ZoomOut,
  Download,
  Printer,
  X,
  Link as LinkIcon,
  CheckCircle,
  Plus,
  Search,
  Package
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type LinkedObligation = {
  id: string;
  obligation_summary: string;
  human_verified: boolean;
  contracts?: {
    id: string;
    title: string;
  } | null;
};

type EvidenceItem = {
  id: string;
  org_id: string;
  source: string;
  file_name: string | null;
  file_url: string | null;
  ai_summary: string | null;
  status: string | null;
  created_at: string;
  linked_obligations?: LinkedObligation[] | null;
};

type Obligation = {
  id: string;
  obligation_summary: string;
  clause_text: string | null;
  status: string | null;
  contracts?: {
    id: string;
    title: string;
  } | null;
};

export function EvidenceClient({
  evidence,
  obligations
}: {
  evidence: EvidenceItem[];
  obligations: Obligation[];
}) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedEv, setSelectedEv] = useState<EvidenceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const supabase = createClient();
  const router = useRouter();

  const [isLinking, setIsLinking] = useState(false);

  const togglePreview = (ev: EvidenceItem) => {
    setSelectedEv(ev);
    setPreviewOpen(true);
  };

  const handleLinkResourceMock = async () => {
    setIsLinking(true);
    try {
      const res = await fetch("/api/mock-evidence");
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to generate mock evidence");
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Error linking resource");
    } finally {
      setIsLinking(false);
    }
  };

  const handleLinkNewObligation = async (obId: string) => {
    if (!selectedEv) return;
    try {
      // Connect evidence item to another obligation by inserting a new link in V2
      const { error } = await supabase
        .from("obligation_evidence_links")
        .insert({
          obligation_id: obId,
          evidence_id: selectedEv.id,
          match_type: "full",
          human_verified: true
        });

      if (error) throw error;
      setPreviewOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to link obligation:", err);
    }
  };

  // Filtered evidence items
  const filteredEvidence = evidence.filter((ev) => {
    const matchesSearch =
      (ev.source || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.ai_summary || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.file_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] overflow-hidden">
      {/* HEADER BAR */}
      <section className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container-lowest shrink-0 mb-4 rounded-xl">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Evidence Library</h1>
          <span className="text-on-surface-variant font-normal text-sm">({filteredEvidence.length})</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="relative flex items-center bg-surface-container-high border border-outline-variant rounded-full px-3 py-1.5 w-64">
            <Search size={16} className="text-on-surface-variant" />
            <input
              className="bg-transparent border-none text-xs text-on-surface w-full placeholder:text-on-surface-variant ml-2 outline-none"
              placeholder="Search evidence logs..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-surface-container-high rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded flex items-center gap-2 text-xs font-semibold transition-colors ${
                viewMode === "grid" ? "bg-surface-container-highest text-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Grid size={14} /> Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded flex items-center gap-2 text-xs font-semibold transition-colors ${
                viewMode === "list" ? "bg-surface-container-highest text-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <List size={14} /> List
            </button>
          </div>

          <button 
            onClick={handleLinkResourceMock}
            disabled={isLinking}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs font-semibold shadow-md ${
              isLinking ? "bg-indigo-400 text-white cursor-not-allowed shadow-none" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-900/20"
            }`}
          >
            <UploadCloud size={16} className={isLinking ? "animate-pulse" : ""} /> 
            {isLinking ? "Linking..." : "Link Resource"}
          </button>
        </div>
      </section>

      <div className="flex-1 flex overflow-hidden">
        {/* GRID CONTENT */}
        <section className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredEvidence.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-surface-container/20 border border-outline-variant/30 rounded-2xl">
              <Package className="w-16 h-16 text-primary/40 mb-4" />
              <h3 className="text-lg font-bold mb-2">No Evidence Records Yet</h3>
              <p className="text-sm text-on-surface-variant max-w-md leading-relaxed">
                Connect compliance logs, SOC2 checklists, or certificates inside your contracts or link external data fields here to build your audit trial.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.05 } }
              }}
            >
              {filteredEvidence.map((ev, i) => (
                <motion.div 
                  key={ev.id}
                  variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                  onClick={() => togglePreview(ev)}
                  className="group bg-surface-container/30 border border-outline-variant/30 rounded-xl overflow-hidden hover:border-indigo-500 transition-all cursor-pointer relative shadow-sm"
                >
                  <div className="aspect-[4/3] bg-zinc-950/40 p-4 flex flex-col justify-center items-center relative">
                    <FileText size={40} className="text-indigo-400 opacity-60 mb-2 group-hover:scale-105 transition-transform" />
                    <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[180px]">{ev.source}</span>
                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full font-semibold text-[10px] shadow">View Details</span>
                    </div>
                  </div>
                  <div className="p-4 bg-surface-container/20 border-t border-outline-variant/30">
                    <div className="flex items-start justify-between mb-1.5">
                      <h4 className="text-xs font-semibold truncate flex-1">{ev.source}</h4>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-on-surface-variant">
                      <span>{new Date(ev.created_at).toLocaleDateString()}</span>
                      <span className="bg-indigo-900/20 border border-indigo-700/30 text-indigo-400 px-1.5 py-0.5 rounded uppercase font-bold">LOG</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* LIST VIEW */
            <div className="bg-surface-container/10 border border-outline-variant/30 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Source</th>
                    <th className="px-6 py-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Target Obligation</th>
                    <th className="px-6 py-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Summary</th>
                    <th className="px-6 py-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {filteredEvidence.map((ev) => (
                    <tr
                      key={ev.id}
                      onClick={() => togglePreview(ev)}
                      className="hover:bg-surface-container-high/40 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-xs font-semibold text-on-surface">{ev.source}</td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant truncate max-w-xs">
                        {ev.linked_obligations && ev.linked_obligations.length > 0 
                          ? ev.linked_obligations[0].obligation_summary 
                          : "General Compliance"}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">{ev.ai_summary}</td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant">{new Date(ev.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {previewOpen && selectedEv && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-zinc-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-surface-container w-full max-w-5xl h-full rounded-2xl border border-outline-variant shadow-2xl flex overflow-hidden"
            >
              {/* Preview Content Left */}
              <div className="flex-1 bg-zinc-950/40 flex flex-col p-6">
                <div className="flex justify-between items-center border-b border-outline-variant pb-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-primary animate-pulse" />
                    <span className="font-semibold text-sm">{selectedEv.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Active Audit Log</span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-zinc-950/30 rounded-xl mt-4 border border-outline-variant/30 flex flex-col justify-center items-center">
                  <Package size={48} className="text-indigo-400 mb-4 opacity-50" />
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2">Compliance Value Stream</p>
                  <p className="text-sm italic text-center max-w-md font-mono text-zinc-300">
                    &quot;{selectedEv.ai_summary}&quot;
                  </p>
                  <p className="text-xs text-zinc-500 mt-4">Filename: {selectedEv.file_name}</p>
                </div>
              </div>

              {/* Metadata Panel Right */}
              <div className="w-80 border-l border-outline-variant flex flex-col bg-surface-container-high overflow-hidden shrink-0">
                <div className="p-6 border-b border-outline-variant">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-on-surface">Audit Metadata</h2>
                    <button onClick={() => setPreviewOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">Source Pipeline</p>
                      <p className="text-xs font-semibold">{selectedEv.source}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">Audit Timestamp</p>
                      <p className="text-xs">{new Date(selectedEv.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">Status</p>
                      <p className="text-xs font-bold text-emerald-400 uppercase">{selectedEv.status || "Ready"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  <h2 className="text-xs font-bold text-on-surface mb-3">Linked Obligations</h2>
                  {selectedEv.linked_obligations && selectedEv.linked_obligations.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEv.linked_obligations.map(linked => (
                        <div key={linked.id} className="p-3 bg-zinc-950/40 rounded-lg border border-outline-variant group">
                          <div className="flex items-start gap-2 mb-2">
                            <LinkIcon size={12} className="text-indigo-400 mt-0.5" />
                            <p className="text-[11px] font-semibold text-on-surface truncate">{linked.contracts?.title}</p>
                          </div>
                          <p className="text-[10px] text-on-surface-variant leading-tight italic">&quot;{linked.obligation_summary}&quot;</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-on-surface-variant opacity-60">No obligation connected yet.</p>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-outline-variant/40">
                    <h3 className="text-xs font-bold mb-2">Link to New Obligation</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {obligations.map((ob) => (
                        <button
                          key={ob.id}
                          onClick={() => handleLinkNewObligation(ob.id)}
                          className="w-full text-left p-2 rounded hover:bg-surface-container-high/80 text-[10px] border border-outline-variant/30 flex items-center justify-between group"
                        >
                          <span className="truncate max-w-[180px] text-on-surface-variant group-hover:text-on-surface">{ob.obligation_summary}</span>
                          <Plus size={10} className="text-primary shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
