"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  AlertTriangle,
  FileText,
  TrendingDown,
  Activity
} from "lucide-react";

type Contract = {
  id: string;
  title: string;
  contract_type: string | null;
  status: string | null;
  risk_score: number | null;
  created_at: string;
};

type Obligation = {
  id: string;
  contract_id: string;
  obligation_summary: string;
  clause_text: string | null;
  severity: string | null;
  status: string | null;
};

export function RiskClient({
  contracts,
  obligations
}: {
  contracts: Contract[];
  obligations: Obligation[];
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Calculate live global risk score
  const analyzedContracts = contracts.filter(c => c.risk_score !== null && c.risk_score > 0);
  const averageRiskScore = analyzedContracts.length > 0
    ? Math.round(analyzedContracts.reduce((acc, c) => acc + (c.risk_score || 0), 0) / analyzedContracts.length)
    : 0;

  // Breakdown metrics
  const totalObs = obligations.length;
  const pendingObs = obligations.filter(o => o.status === "pending").length;
  const breachedObs = obligations.filter(o => o.status === "breached").length;
  const atRiskObs = obligations.filter(o => o.status === "disputed").length;
  const compliantObs = obligations.filter(o => o.status === "verified" || o.status === "evidence_submitted").length;

  const missingEvidencePct = totalObs > 0 ? Math.round((pendingObs / totalObs) * 100) : 0;
  const overduePct = totalObs > 0 ? Math.round((breachedObs / totalObs) * 100) : 0;
  const compliantPct = totalObs > 0 ? Math.round((compliantObs / totalObs) * 100) : 0;

  // Generate dynamic AI Recommendations from actual database obligations
  const outstandingIssues = obligations.filter(
    (o) => o.status === "breached" || o.status === "disputed"
  );

  // Group portfolio by contract types dynamically
  const typeCounts: Record<string, number> = {};
  contracts.forEach((c) => {
    const type = c.contract_type || "Commercial Agreement";
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const portfolioComposition = Object.entries(typeCounts).map(([type, count]) => ({
    label: type,
    count
  })).slice(0, 3); // top 3

  const staggerIn: any = {
    hidden: { opacity: 0, y: 15 },
    show: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.08, duration: 0.5, ease: "easeOut" }
    })
  };

  const getRiskStatusLabel = (score: number) => {
    if (score === 0) return { text: "No Data", color: "text-zinc-500", border: "border-zinc-800" };
    if (score < 35) return { text: "Low Risk", color: "text-emerald-400", border: "border-emerald-500/30" };
    if (score < 65) return { text: "Moderate Risk", color: "text-amber-500", border: "border-amber-500/30" };
    return { text: "Critical Risk", color: "text-error", border: "border-error/30" };
  };

  const riskLabel = getRiskStatusLabel(averageRiskScore);

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] overflow-hidden relative bg-transparent">
      {/* Dynamic Background Blur */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full filter blur-[120px] opacity-15 bg-primary/20 w-[600px] h-[600px] -top-20 -left-20 animate-pulse" />
        <div className="absolute rounded-full filter blur-[120px] opacity-10 bg-secondary/15 w-[500px] h-[500px] top-1/2 left-1/3 animate-pulse animate-delay-2000" />
      </div>

      {/* Mouse Glow */}
      <div 
        className="fixed w-[600px] h-[600px] pointer-events-none z-0 rounded-full transition-opacity duration-300 opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(195, 192, 255, 0.04) 0%, rgba(195, 192, 255, 0) 70%)",
          left: mousePosition.x,
          top: mousePosition.y,
          transform: "translate(-50%, -50%)"
        }}
      />

      {/* HEADER BAR */}
      <header className="flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container-lowest/40 backdrop-blur-xl z-10 shrink-0 mb-4 rounded-xl">
        <div className="flex items-center gap-6">
          <div className="relative flex items-center bg-surface-container-high/60 border border-outline-variant rounded-full px-4 py-1.5 w-64 group focus-within:border-primary transition-all">
            <Search size={16} className="text-on-surface-variant" />
            <input 
              className="bg-transparent border-none focus:ring-0 text-xs text-on-surface w-full placeholder:text-on-surface-variant ml-2 outline-none" 
              placeholder="Search risk drivers..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-primary-container text-white px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-transform active:scale-95 shadow-md shadow-primary-container/20">
            Export Risk Report
          </button>
        </div>
      </header>

      {/* CONTENT CANVAS */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 relative z-10 pb-16 pr-1">
        
        {/* Top Hero Radial and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            custom={1} initial="hidden" animate="show" variants={staggerIn}
            className="lg:col-span-2 bg-surface/80 backdrop-blur-xl rounded-xl border border-outline-variant p-6 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group hover:border-primary/50 transition-colors shadow-md"
          >
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0 opacity-40"></div>
            
            {/* Radial Gauge */}
            <div className="relative w-44 h-44 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shrink-0">
              <div className="absolute inset-0 rounded-full border-[6px] border-surface-container-highest"></div>
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="47" fill="transparent" stroke="#25242e" strokeWidth="6" />
                <motion.circle 
                  cx="50" cy="50" r="47" 
                  fill="transparent" 
                  stroke={averageRiskScore < 35 ? "#10b981" : averageRiskScore < 65 ? "#f59e0b" : "#f43f5e"} 
                  strokeWidth="6" 
                  strokeDasharray="295" 
                  initial={{ strokeDashoffset: 295 }}
                  animate={{ strokeDashoffset: 295 - (295 * Math.min(averageRiskScore || 10, 100)) / 100 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  strokeLinecap="round" 
                />
              </svg>
              <div className="text-center">
                <span className="text-4xl font-bold text-on-surface block leading-none tracking-tight">{averageRiskScore || "—"}</span>
                <span className={`text-[9px] font-bold tracking-widest uppercase mt-2 block ${riskLabel.color}`}>
                  {riskLabel.text}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <h1 className="text-2xl font-bold text-on-surface tracking-tight">Global Risk Integrity Score</h1>
              <p className="text-xs text-on-surface-variant max-w-md leading-relaxed">
                Calculated dynamically as the average risk index across all active database contracts ({analyzedContracts.length} analyzed agreements).
              </p>
              
              <div className="flex items-end gap-1.5 h-12 w-full max-w-xs pt-2">
                {contracts.filter(c => c.risk_score !== null && c.risk_score > 0).slice(0, 7).reverse().map((c, i, arr) => (
                  <div 
                    key={c.id} 
                    className={`flex-1 rounded-t-sm ${i === arr.length - 1 ? 'bg-primary' : 'bg-primary/30'}`} 
                    style={{ height: `${Math.max(c.risk_score || 15, 15)}%` }}
                    title={`${c.title}: ${c.risk_score}`}
                  ></div>
                ))}
                {contracts.filter(c => c.risk_score !== null && c.risk_score > 0).length === 0 && (
                  <div className="flex-1 rounded-t-sm bg-primary/30" style={{ height: "15%" }}></div>
                )}
              </div>
              <p className="text-[9px] text-on-surface-variant font-mono tracking-tight uppercase">REAL-TIME PORTFOLIO INTEGRITY INDEX</p>
            </div>
          </motion.div>

          {/* AI Recommendations Stack */}
          <motion.div custom={2} initial="hidden" animate="show" variants={staggerIn} className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-0.5">
              <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">AI Recommendations</h3>
              <span className="text-[9px] bg-primary-container/20 text-primary px-2 py-0.5 rounded-full font-bold">
                {outstandingIssues.length} OUTSTANDING
              </span>
            </div>
            
            {outstandingIssues.length === 0 ? (
              <div className="flex-1 bg-surface/40 backdrop-blur-xl border border-outline-variant p-4 rounded-xl flex flex-col justify-center items-center text-center">
                <Sparkles className="w-8 h-8 text-primary mb-2 animate-bounce" />
                <p className="text-xs font-semibold">Perfect Compliance Health!</p>
                <p className="text-[10px] text-on-surface-variant mt-1">No breached or high-risk obligations detected.</p>
              </div>
            ) : (
              outstandingIssues.slice(0, 2).map((issue, idx) => (
                <div 
                  key={issue.id}
                  className="bg-surface/80 backdrop-blur-xl border border-outline-variant p-4 rounded-xl space-y-1.5 hover:-translate-y-0.5 hover:shadow-md hover:border-primary transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-primary group-hover:rotate-12 transition-transform" />
                    <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors truncate max-w-[200px]">
                      Resolve {issue.obligation_summary || "Obligation"}
                    </p>
                  </div>
                  <p className="text-[10px] text-on-surface-variant line-clamp-2 leading-relaxed">
                    {issue.clause_text || issue.obligation_summary}
                  </p>
                </div>
              ))
            )}
          </motion.div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[
            { label: "Missing Evidence", val: `${missingEvidencePct}%`, count: `${pendingObs} items`, color: "bg-amber-500", text: "text-amber-500", w: `${missingEvidencePct}%` },
            { label: "Overdue Obligations", val: `${overduePct}%`, count: `${breachedObs} items`, color: "bg-rose-500", text: "text-rose-500", w: `${overduePct}%` },
            { label: "At Risk Clauses", val: `${Math.round((atRiskObs / (totalObs || 1)) * 100)}%`, count: `${atRiskObs} items`, color: "bg-blue-400", text: "text-blue-400", w: `${Math.round((atRiskObs / (totalObs || 1)) * 100)}%` },
            { label: "Compliant Index", val: `${compliantPct}%`, count: `${compliantObs} items`, color: "bg-emerald-500", text: "text-emerald-500", w: `${compliantPct}%` },
          ].map((stat, i) => (
            <motion.div key={i} custom={i + 3} initial="hidden" animate="show" variants={staggerIn} className="bg-surface/80 backdrop-blur-xl border border-outline-variant p-4 rounded-xl space-y-3 hover:-translate-y-0.5 hover:shadow transition-all group overflow-hidden relative">
              <div className="flex justify-between items-start relative z-10">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
                <span className={`font-mono text-xs font-bold ${stat.text}`}>{stat.count}</span>
              </div>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="text-2xl font-bold text-on-surface">{stat.val}</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden relative z-10">
                <div className={`${stat.color} h-full transition-all duration-700`} style={{ width: stat.w }}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts & Factors Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Trend Chart */}
          <motion.div custom={7} initial="hidden" animate="show" variants={staggerIn} className="lg:col-span-2 bg-surface/80 backdrop-blur-xl border border-outline-variant p-5 rounded-xl space-y-4 hover:border-primary/30 transition-colors shadow shadow-inner relative">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Dynamic Risk Trends</h3>
              <p className="text-[10px] text-on-surface-variant">Live visual indicator of contract and risk distributions</p>
            </div>
            
            <div className="h-44 w-full flex items-end gap-2 border-b border-outline-variant pb-2">
              {contracts.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant opacity-50">Awaiting uploaded contracts...</div>
              ) : (
                contracts.slice(0, 10).map((c, i) => (
                  <div key={c.id} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                    <div 
                      className={`w-full rounded-t-sm hover:brightness-110 transition-all ${
                        (c.risk_score || 0) < 35 ? "bg-emerald-500/40" :
                        (c.risk_score || 0) < 65 ? "bg-amber-500/40" : "bg-rose-500/40"
                      }`}
                      style={{ height: `${Math.max(c.risk_score || 10, 15)}px` }}
                    >
                      <div className="absolute scale-0 group-hover:scale-100 bg-surface-container-highest text-[9px] px-1.5 py-0.5 rounded border border-outline-variant -translate-y-8 z-20 whitespace-nowrap transition-transform">
                        {c.title}: {c.risk_score}
                      </div>
                    </div>
                    <span className="text-[8px] font-mono text-on-surface-variant truncate w-full text-center">{c.title.substring(0, 4)}</span>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Contributing Factors */}
          <motion.div custom={8} initial="hidden" animate="show" variants={staggerIn} className="bg-surface/80 backdrop-blur-xl border border-outline-variant p-5 rounded-xl space-y-4 hover:border-primary/30 transition-colors shadow">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Portfolio Composition</h3>
              <p className="text-[10px] text-on-surface-variant">Contract distributions by classification</p>
            </div>
            
            <div className="space-y-4 pt-2">
              {portfolioComposition.length === 0 ? (
                <p className="text-xs text-on-surface-variant opacity-60 text-center py-8">No contracts classified yet.</p>
              ) : (
                portfolioComposition.map((f, i) => {
                  const pct = Math.round((f.count / contracts.length) * 100);
                  return (
                    <div key={f.label} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono font-semibold">
                        <span className="truncate max-w-[160px]">{f.label}</span>
                        <span className="text-on-surface-variant">{f.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-700" 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* Dynamic Alert Banner */}
        {breachedObs > 0 && (
          <motion.div 
            custom={9} initial="hidden" animate="show" variants={staggerIn}
            className="bg-surface-container-low border border-rose-500/30 p-4 rounded-xl hover:border-rose-500/50 transition-colors shadow-sm"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle size={22} className="text-rose-500 animate-pulse shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-on-surface mb-0.5">Critical Performance Discrepancy</p>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  We identified {breachedObs} breached compliance obligations in your workspace. Review the obligations page to evaluate active disputes or mark evidence verified.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
