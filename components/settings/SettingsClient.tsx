"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  BrainCircuit,
  User,
  Building2,
  Key,
  Wallet,
  Settings as SettingsIcon,
  HelpCircle,
  CheckCircle2,
  Info,
  Rocket,
  Loader2
} from "lucide-react";

export function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const [model, setModel] = useState<"pro" | "flash">(initialSettings?.ai_model || "pro");
  const [sensitivity, setSensitivity] = useState(initialSettings?.sensitivity || 88);
  const [riskWeight, setRiskWeight] = useState<"conservative" | "moderate" | "aggressive">(initialSettings?.risk_weight || "moderate");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleModelChange = (m: "pro" | "flash") => { setModel(m); setHasChanges(true); };
  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSensitivity(Number(e.target.value)); setHasChanges(true); };
  const handleRiskWeightChange = (w: "conservative" | "moderate" | "aggressive") => { setRiskWeight(w); setHasChanges(true); };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, sensitivity, riskWeight })
      });
      if (res.ok) {
        setHasChanges(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setModel(initialSettings?.ai_model || "pro");
    setSensitivity(initialSettings?.sensitivity || 88);
    setRiskWeight(initialSettings?.risk_weight || "moderate");
    setHasChanges(false);
  };

  const staggerIn: any = {
    hidden: { opacity: 0, y: 20 },
    show: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-transparent relative">
      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* Settings Sidebar (Internal) */}
        <aside className="w-64 border-r border-outline-variant bg-surface-container-lowest/50 backdrop-blur-md p-6 flex flex-col gap-8 hidden md:flex overflow-y-auto">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-on-surface-variant px-4 mb-2 uppercase tracking-widest">Workspace</span>
            <button className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl px-4 py-3 transition-colors">
              <User size={18} /> <span className="text-sm font-semibold">Profile</span>
            </button>
            <button className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl px-4 py-3 transition-colors">
              <Building2 size={18} /> <span className="text-sm font-semibold">Organization</span>
            </button>
            <button className="flex items-center gap-3 bg-primary-container/10 text-primary rounded-xl px-4 py-3 transition-colors border border-primary/20">
              <BrainCircuit size={18} /> <span className="text-sm font-bold">AI Preferences</span>
            </button>
            <button className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl px-4 py-3 transition-colors">
              <Key size={18} /> <span className="text-sm font-semibold">API Keys</span>
            </button>
            <button className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl px-4 py-3 transition-colors">
              <Wallet size={18} /> <span className="text-sm font-semibold">Billing</span>
            </button>
          </div>
          
          <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-outline-variant/50">
            <button className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl px-4 py-3 transition-colors">
              <SettingsIcon size={18} /> <span className="text-sm font-semibold">Global Settings</span>
            </button>
            <button className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl px-4 py-3 transition-colors">
              <HelpCircle size={18} /> <span className="text-sm font-semibold">Support</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 pb-32">
          <div className="max-w-5xl mx-auto flex flex-col gap-8">
            <motion.header custom={0} initial="hidden" animate="show" variants={staggerIn} className="flex flex-col gap-2 mb-4">
              <h1 className="text-3xl font-bold text-on-surface tracking-tight">AI Preferences</h1>
              <p className="text-on-surface-variant text-sm max-w-2xl leading-relaxed">
                Configure how Viscount AI handles legal forensic analysis, risk scoring, and evidence extraction.
              </p>
            </motion.header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 flex flex-col gap-8">
                
                {/* Model Selection */}
                <motion.div custom={1} initial="hidden" animate="show" variants={staggerIn} className="bg-surface-container/40 backdrop-blur-md p-6 rounded-2xl border border-outline-variant shadow-lg flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-on-surface">Model Selection</h3>
                      <p className="text-sm text-on-surface-variant mt-1">Select the primary LLM for contract interpretation.</p>
                    </div>
                    <span className="bg-primary-container/20 text-primary border border-primary/30 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">High Precision</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                      onClick={() => handleModelChange("pro")}
                      className={`relative flex flex-col p-5 rounded-xl cursor-pointer transition-all ${model === "pro" ? "border-2 border-primary bg-primary-container/10 shadow-[0_0_15px_rgba(79,70,229,0.15)]" : "border-2 border-transparent bg-surface-container hover:bg-surface-container-high border-outline-variant"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-on-surface">V-Legal 4.0 (Pro)</span>
                        {model === "pro" && <CheckCircle2 size={20} className="text-primary" />}
                      </div>
                      <span className="text-xs text-on-surface-variant leading-relaxed">Optimized for multi-clause dependency logic.</span>
                    </div>

                    <div 
                      onClick={() => handleModelChange("flash")}
                      className={`relative flex flex-col p-5 rounded-xl cursor-pointer transition-all ${model === "flash" ? "border-2 border-primary bg-primary-container/10 shadow-[0_0_15px_rgba(79,70,229,0.15)]" : "border-2 border-transparent bg-surface-container hover:bg-surface-container-high border-outline-variant"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-on-surface">V-Legal 3.5 (Flash)</span>
                        {model === "flash" && <CheckCircle2 size={20} className="text-primary" />}
                      </div>
                      <span className="text-xs text-on-surface-variant leading-relaxed">Faster processing for bulk documentation.</span>
                    </div>
                  </div>
                </motion.div>

                {/* Confidence Thresholds */}
                <motion.div custom={2} initial="hidden" animate="show" variants={staggerIn} className="bg-surface-container/40 backdrop-blur-md p-6 rounded-2xl border border-outline-variant shadow-lg flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">Confidence Thresholds</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Adjust the level of certainty required before AI markers are auto-validated.</p>
                  </div>
                  
                  <div className="flex flex-col gap-8 mt-2">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-on-surface">Extraction Sensitivity</label>
                        <span className="font-mono font-bold text-primary text-sm">{sensitivity}%</span>
                      </div>
                      <input 
                        type="range" min="50" max="99" value={sensitivity} onChange={handleSensitivityChange}
                        className="w-full h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary" 
                      />
                      <div className="flex justify-between text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                        <span>Permissive</span>
                        <span>Strict</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-on-surface">Risk Scoring Weight</label>
                        <span className="font-mono font-bold text-primary text-sm capitalize">{riskWeight}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <button onClick={() => handleRiskWeightChange("conservative")} className={`py-2 px-4 rounded-lg text-xs font-bold transition-colors ${riskWeight === "conservative" ? "border border-primary bg-primary-container/20 text-primary" : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"}`}>Conservative</button>
                        <button onClick={() => handleRiskWeightChange("moderate")} className={`py-2 px-4 rounded-lg text-xs font-bold transition-colors ${riskWeight === "moderate" ? "border border-primary bg-primary-container/20 text-primary" : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"}`}>Moderate</button>
                        <button onClick={() => handleRiskWeightChange("aggressive")} className={`py-2 px-4 rounded-lg text-xs font-bold transition-colors ${riskWeight === "aggressive" ? "border border-primary bg-primary-container/20 text-primary" : "border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"}`}>Aggressive</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Integrations */}
                <motion.div custom={3} initial="hidden" animate="show" variants={staggerIn} className="bg-surface-container/40 backdrop-blur-md p-6 rounded-2xl border border-outline-variant shadow-lg flex flex-col gap-6">
                  <h3 className="text-lg font-bold text-on-surface">Integrations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 bg-[#4A154B] rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-on-surface">Slack Notifications</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">Connected to #legal-ops</p>
                      </div>
                      <SettingsIcon size={18} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                    </div>
                    <div className="p-4 bg-surface-container-low border border-outline-variant rounded-xl flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                        {/* Placeholder for Google Drive icon */}
                        <div className="w-5 h-5 bg-blue-500 rounded-sm"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-on-surface">Google Drive</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">Auto-sync enabled</p>
                      </div>
                      <SettingsIcon size={18} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* Right Sidebar */}
              <aside className="flex flex-col gap-8">
                
                <motion.div custom={4} initial="hidden" animate="show" variants={staggerIn} className="bg-surface-container/40 backdrop-blur-md p-6 rounded-2xl border border-outline-variant shadow-lg flex flex-col gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none"></div>
                  
                  <h3 className="text-lg font-bold text-on-surface relative z-10">Billing Summary</h3>
                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-on-surface-variant">Current Plan</span>
                      <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Professional Tier</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        <span>Credits Used</span>
                        <span className="font-mono">14.2k / 20k</span>
                      </div>
                      <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-indigo-500 h-full w-[71%]"></div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-outline-variant/50">
                      <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">You have used 71% of your monthly analysis credits.</p>
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg shadow-indigo-600/20 active:scale-[0.98]">
                        Upgrade to Enterprise
                      </button>
                    </div>
                  </div>
                </motion.div>

                <motion.div custom={5} initial="hidden" animate="show" variants={staggerIn} className="bg-surface-container-low/50 backdrop-blur-md p-6 rounded-2xl border border-dashed border-outline-variant flex flex-col items-center text-center gap-3">
                  <Rocket size={32} className="text-primary mb-2" />
                  <p className="text-lg font-bold text-on-surface">Beta Access</p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">You&apos;re currently in the early access pool for Multi-Jurisdiction Analysis.</p>
                  <button className="text-primary text-xs font-bold underline mt-2 hover:text-indigo-400">View roadmap</button>
                </motion.div>

              </aside>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Save Bar */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4"
          >
            <div className="bg-surface-container-highest/90 backdrop-blur-xl border border-primary/30 rounded-full px-6 py-4 flex items-center justify-between gap-8 shadow-2xl max-w-2xl w-full">
              <div className="flex items-center gap-3">
                <Info size={20} className="text-primary" />
                <span className="text-on-surface text-sm font-semibold">You have unsaved changes in AI Preferences.</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={handleDiscard}
                  disabled={isSaving}
                  className="text-on-surface-variant hover:text-on-surface transition-colors text-sm font-semibold px-4 py-2 disabled:opacity-50"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
