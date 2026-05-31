"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  PieChart,
  ClipboardList,
  Gavel,
  Settings,
  ChevronDown,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Download,
  FileText
} from "lucide-react";

export default function AuditReportGeneratorPage() {
  const [reportType, setReportType] = useState("full");
  const [options, setOptions] = useState({
    executiveSummary: true,
    riskMatrix: true,
    evidenceLog: false,
    disputeHistory: false
  });
  const [contracts, setContracts] = useState<any[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchContracts() {
      const { data } = await supabase
        .from('contracts')
        .select(`
          id, 
          title,
          risk_scores(overall_score),
          obligations(id, status)
        `);
      if (data) setContracts(data);
    }
    fetchContracts();
  }, []);

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      window.print();
    }, 1500);
  };
  
  const selectedContract = contracts.find(c => c.id === selectedContractId);
  const activeContracts = selectedContract ? [selectedContract] : contracts;
  
  // Calculate dynamic metrics
  const totalContracts = activeContracts.length;
  let totalObligations = 0;
  let complianceDeviations = 0;
  let riskScoreSum = 0;
  let contractsWithRisk = 0;

  activeContracts.forEach(c => {
    const obs = c.obligations || [];
    totalObligations += obs.length;
    complianceDeviations += obs.filter((o: any) => o.status === 'breached' || o.status === 'disputed').length;

    const riskArr = c.risk_scores || [];
    if (riskArr.length > 0) {
      riskScoreSum += riskArr[0].overall_score || 0;
      contractsWithRisk++;
    }
  });

  const avgRisk = contractsWithRisk > 0 ? Math.round(riskScoreSum / contractsWithRisk) : 0;
  let evidenceScore = "A+";
  if (avgRisk > 30) evidenceScore = "B";
  if (avgRisk > 60) evidenceScore = "C";
  if (avgRisk > 80) evidenceScore = "F";
  let evidenceColor = "text-emerald-600";
  if (evidenceScore === "B") evidenceColor = "text-amber-600";
  if (evidenceScore === "C" || evidenceScore === "F") evidenceColor = "text-red-600";

  const complianceRate = totalObligations > 0 
    ? Math.round(((totalObligations - complianceDeviations) / totalObligations) * 1000) / 10 
    : 100;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden relative bg-transparent print:h-auto print:overflow-visible print:block">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden print:hidden">
        <div className="absolute rounded-full filter blur-[100px] opacity-10 bg-primary/20 w-[600px] h-[600px] -top-20 -left-20 animate-pulse" />
        <div className="absolute rounded-full filter blur-[100px] opacity-5 bg-secondary-container/20 w-[500px] h-[500px] top-1/2 left-[40%] animate-pulse" style={{ animationDelay: "-2s" }} />
      </div>

      {/* PREVIEW SECTION (60%) */}
      <section className="w-full lg:w-3/5 bg-transparent flex flex-col relative z-10 border-r border-outline-variant/30 print:w-full print:border-none print:block print:overflow-visible">
        {/* Preview Controls */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-outline-variant/20 bg-surface-container-low/50 backdrop-blur-md mx-4 mt-4 rounded-t-2xl shadow-sm print:hidden">
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Live Preview</span>
            <div className="h-4 w-px bg-outline-variant/50"></div>
            <div className="flex items-center gap-2 bg-surface-container-highest/30 rounded-full px-3 py-1 border border-outline-variant/30">
              <button className="text-on-surface-variant hover:text-primary transition-colors"><ZoomOut size={16} /></button>
              <span className="font-mono text-[10px] px-2">85%</span>
              <button className="text-on-surface-variant hover:text-primary transition-colors"><ZoomIn size={16} /></button>
            </div>
          </div>
          <div className="flex items-center gap-3 text-on-surface-variant">
            <button className="p-1 hover:bg-white/5 rounded transition-colors"><ChevronLeft size={20} /></button>
            <span className="text-xs font-semibold">Page 1 / 12</span>
            <button className="p-1 hover:bg-white/5 rounded transition-colors"><ChevronRight size={20} /></button>
          </div>
        </header>

        {/* Document Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col items-center gap-12 bg-surface-container-lowest/30 backdrop-blur-sm mx-4 mb-4 rounded-b-2xl shadow-inner print:overflow-visible print:p-0 print:m-0 print:shadow-none print:bg-white print:block">
          {/* A4 Representation */}
          <div className="w-full max-w-[700px] bg-white p-12 sm:p-16 flex flex-col text-zinc-900 shadow-2xl relative overflow-hidden group print:max-w-none print:w-full print:shadow-none print:p-0 print:overflow-visible">
            {/* Shimmer effect for rendering */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-zinc-100/50 to-transparent group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            
            <div className="flex justify-between items-start mb-16">
              <div className="w-16 h-16 bg-zinc-100 flex items-center justify-center border border-zinc-200 shadow-sm">
                <span className="text-[10px] font-bold text-zinc-400 tracking-widest">LOGO</span>
              </div>
              <div className="text-right">
                <h2 className="text-zinc-400 text-[10px] font-bold tracking-widest uppercase">PRIVATE &amp; CONFIDENTIAL</h2>
                <p className="text-zinc-500 text-xs mt-1 font-mono">Audit Ref: #AI-77291-B</p>
              </div>
            </div>

            <h1 className="text-3xl font-serif font-bold border-b-2 border-zinc-900 pb-4 mb-8 tracking-tight">Forensic Compliance Audit Report</h1>
            
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">TARGET CONTRACT</h3>
                <p className="font-bold text-lg font-serif">{selectedContract ? selectedContract.title : "Portfolio Overview"}</p>
                <p className="text-zinc-600 text-sm">Compliance & Audit Department</p>
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">AUDIT PERIOD</h3>
                <p className="font-bold text-lg font-serif">Q3 2023 — Q4 2023</p>
                <p className="text-zinc-600 text-sm">Generated on Nov 14, 2024</p>
              </div>
            </div>

            <div className="bg-zinc-50 p-6 border-l-4 border-indigo-600 mb-12 shadow-sm">
              <h4 className="font-bold text-sm mb-3 tracking-wide">EXECUTIVE SUMMARY</h4>
              <p className="text-zinc-600 leading-relaxed text-sm font-serif">
                This forensic audit examines {totalContracts} service level agreements and master service contracts. Initial analysis indicates a {complianceRate}% compliance rate across primary operational obligations, with identified risks localized in historical vendor amendments from 2018-2020.
              </p>
            </div>

            <div className="space-y-4 mb-16">
              <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                <span className="font-semibold text-sm">Total Contracts Analyzed</span>
                <span className="font-mono text-sm font-bold">{totalContracts}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                <span className="font-semibold text-sm">Total Obligations</span>
                <span className="font-mono text-sm font-bold">{totalObligations}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                <span className="font-semibold text-sm">Compliance Deviations</span>
                <span className={`font-mono text-sm font-bold ${complianceDeviations > 0 ? "text-red-600" : ""}`}>
                  {complianceDeviations.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-100">
                <span className="font-semibold text-sm">Overall Evidence Score</span>
                <span className={`font-mono text-sm font-bold ${evidenceColor}`}>{evidenceScore}</span>
              </div>
            </div>

            <div className="mt-auto pt-16 flex justify-between items-end">
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Powered by Viscount AI</div>
              <div className="text-[10px] text-zinc-400 font-bold">Page 1</div>
            </div>
          </div>

          {/* Page 2 Placeholder */}
          <div className="w-full max-w-[700px] bg-white opacity-40 p-16 flex flex-col scale-95 origin-top blur-[1px] print:hidden">
            <div className="h-4 w-1/3 bg-zinc-200 mb-8"></div>
            <div className="h-2 w-full bg-zinc-100 mb-3"></div>
            <div className="h-2 w-full bg-zinc-100 mb-3"></div>
            <div className="h-2 w-2/3 bg-zinc-100 mb-8"></div>
            <div className="h-32 w-full bg-zinc-50 border border-zinc-100"></div>
          </div>
        </div>
      </section>

      {/* CONFIGURATION PANEL (40%) */}
      <section className="w-full lg:w-2/5 bg-surface-container-low/30 backdrop-blur-md flex flex-col z-10 relative print:hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="flex flex-col gap-8">
            {/* Report Type */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-on-surface tracking-tight">Report Configuration</h3>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-3 uppercase tracking-widest">Report Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "full", icon: PieChart, title: "Full Audit", desc: "Complete forensic deep-dive" },
                  { id: "compliance", icon: ClipboardList, title: "Compliance", desc: "Regulatory summary view" },
                  { id: "dispute", icon: Gavel, title: "Dispute Package", desc: "Evidence for litigation" },
                  { id: "custom", icon: Settings, title: "Custom", desc: "Build from scratch" },
                ].map((type) => (
                  <div 
                    key={type.id} 
                    onClick={() => setReportType(type.id)}
                    className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                      reportType === type.id 
                        ? "bg-primary-container/10 border-primary shadow-[0_0_15px_rgba(79,70,229,0.1)]" 
                        : "bg-surface-container/50 border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <type.icon size={20} className={reportType === type.id ? "text-primary" : "text-on-surface-variant"} />
                      {reportType === type.id && <div className="w-2 h-2 rounded-full bg-primary mt-1"></div>}
                    </div>
                    <div className="font-bold text-sm text-on-surface">{type.title}</div>
                    <div className="text-[11px] text-on-surface-variant mt-1">{type.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scope */}
            <div className="flex flex-col gap-4">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Audit Scope</label>
              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-on-surface-variant">Contract Selection</span>
                  <div className="relative">
                    <select 
                      className="w-full appearance-none bg-surface-container border border-outline-variant/50 rounded-lg p-3 text-sm font-semibold text-on-surface focus:outline-none focus:border-primary hover:border-primary/50 transition-colors cursor-pointer"
                      value={selectedContractId}
                      onChange={(e) => setSelectedContractId(e.target.value)}
                    >
                      <option value="all">All Contracts (Portfolio)</option>
                      {contracts.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-on-surface-variant">Date Range</span>
                  <div className="bg-surface-container border border-outline-variant/50 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:border-primary/50 transition-colors">
                    <span className="text-sm font-semibold text-on-surface">Aug 2023 — Feb 2024</span>
                    <Calendar size={18} className="text-on-surface-variant" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modules */}
            <div className="flex flex-col gap-4">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Included Modules</label>
              <div className="space-y-2 bg-surface-container-lowest/50 p-2 rounded-xl border border-outline-variant/30">
                {[
                  { key: "executiveSummary", label: "Executive Summary" },
                  { key: "riskMatrix", label: "Risk Matrix Visualization" },
                  { key: "evidenceLog", label: "Detailed Evidence Log" },
                  { key: "disputeHistory", label: "Dispute & Resolution History" }
                ].map((mod) => (
                  <div 
                    key={mod.key}
                    className="flex justify-between items-center p-3 hover:bg-surface-container/50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => toggleOption(mod.key as keyof typeof options)}
                  >
                    <span className="text-sm font-semibold text-on-surface">{mod.label}</span>
                    {options[mod.key as keyof typeof options] ? (
                      <ToggleRight size={24} className="text-primary" />
                    ) : (
                      <ToggleLeft size={24} className="text-on-surface-variant opacity-50" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Export Settings */}
            <div className="flex flex-col gap-4">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Format</label>
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 border-2 border-primary bg-primary/10 text-primary rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                  <FileText size={16} /> PDF
                </button>
                <button className="flex-1 py-2.5 border border-outline-variant text-on-surface-variant hover:bg-surface-container rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                  <span className="font-mono text-xs">.docx</span> Word
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Generate Button Container */}
        <div className="p-6 border-t border-outline-variant/30 bg-surface/50 backdrop-blur-xl shrink-0 relative overflow-hidden">
          {/* Animated gradient border top */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full text-on-primary py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg relative overflow-hidden group ${isGenerating ? 'bg-indigo-400 cursor-not-allowed shadow-none' : 'bg-primary hover:scale-[1.02] active:scale-[0.98] shadow-primary/20'}`}
          >
            {!isGenerating && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>}
            <Download size={20} className={`relative z-10 ${isGenerating ? 'animate-bounce' : ''}`} />
            <span className="relative z-10">{isGenerating ? "Generating..." : "Generate Audit Report"}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
