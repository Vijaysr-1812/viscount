"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  AlertTriangle, 
  ExternalLink, 
  Clock, 
  Database,
  Loader2,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  ListFilter,
  CheckCircle,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const stagger: any = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp: any = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function KPICard({
  title,
  value,
  trend,
  color,
  children,
}: {
  title: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  color: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-surface-container border border-outline-variant p-5 rounded-2xl hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 cursor-pointer group"
      whileHover={{
        boxShadow: `0 0 20px ${color}15`,
        borderColor: `${color}30`,
      }}
    >
      <p className="text-[10px] font-bold tracking-wider uppercase text-on-surface-variant mb-4">
        {title}
      </p>
      <div className="flex items-end justify-between">
        <span className="text-[32px] font-bold leading-none tracking-tight" style={{ color }}>
          {value}
        </span>
        {trend && (
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded-full flex items-center gap-1 font-semibold ${
              trend.positive
                ? "text-emerald-400 bg-emerald-400/10"
                : "text-rose-400 bg-rose-400/10"
            }`}
          >
            <TrendingUp size={12} className={trend.positive ? "" : "rotate-180"} />
            {trend.value}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  );
}

export function DashboardClient({
  fullName,
  stats,
  contracts,
  activities,
  riskDistribution,
  complianceTrend
}: {
  fullName: string;
  stats: {
    contractsCount: number;
    obligationsCount: number;
    averageRisk: number;
    missingEvidenceCount: number;
  };
  contracts: Array<{
    id: string;
    title: string;
    risk_score: number;
    status: string;
    obligationsDone: number;
    obligationsTotal: number;
    obligationsPct: number;
  }>;
  activities: Array<{
    id: string;
    action: string;
    metadata: any;
    timestamp: string;
  }>;
  riskDistribution: {
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
  };
  complianceTrend: number[];
}) {
  const [seeding, setSeeding] = useState(false);
  const router = useRouter();

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const response = await fetch("/api/seed-sandbox", {
        method: "POST",
      });
      if (response.ok) {
        router.refresh();
      } else {
        console.error("Failed to seed sandbox data");
      }
    } catch (err) {
      console.error("Seeder exception:", err);
    } finally {
      setSeeding(false);
    }
  };

  // If there are no contracts, render the premium seeder landing page!
  if (stats.contractsCount === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4">
        <motion.div 
          className="max-w-2xl w-full bg-zinc-900 border border-outline-variant/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background glowing effects */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
              <Database className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Initialize Your Forensic Sandbox
            </h1>
            
            <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Welcome, <span className="text-indigo-400 font-semibold">{fullName}</span>! To unlock the premium analytics, Kanban boards, and evidence compliance logs, bootstrap your workspace with high-fidelity realistic sandbox data.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
              {[
                { icon: FileCheck2, title: "3 Sample Contracts", desc: "Realistic MSA, NDA, and Data Protection Addendums loaded." },
                { icon: ShieldCheck, title: "6 Obligations", desc: "AI-extracted obligations with custom risk matrices." },
                { icon: Sparkles, title: "Dynamic Verification", desc: "Active audit trails and linked telemetry evidence." }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-surface-container border border-outline-variant/20 p-4 rounded-xl space-y-2">
                    <Icon className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wide">{item.title}</h3>
                    <p className="text-[11px] text-zinc-400 leading-normal">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-6">
              <button
                onClick={handleSeedData}
                disabled={seeding}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
              >
                {seeding ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Seeding Workspace...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Bootstrap Sandbox Data
                  </>
                )}
              </button>
              <p className="text-[10px] text-zinc-500 mt-3 font-mono">
                Populates contracts, obligations, evidence, and audit logs.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active Dashboard
  return (
    <motion.div
      className="grid grid-cols-12 gap-6"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      {/* Left Column */}
      <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
        {/* Hero Section */}
        <motion.section
          variants={fadeUp}
          className="flex justify-between items-end bg-gradient-to-br from-zinc-900 to-zinc-950 border border-outline-variant p-8 rounded-2xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-[30px] font-extrabold text-white mb-2 tracking-tight">
              Good morning, {fullName.split('@')[0]}
              <motion.span
                className="inline-block ml-2"
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
              >
                👋
              </motion.span>
            </h2>
            <p className="text-zinc-400 max-w-md text-[13px] leading-relaxed">
              Your forensic compliance indexing is fully synced. You have <span className="text-indigo-400 font-semibold">{stats.contractsCount} active contracts</span> with outstanding compliance tracks active.
            </p>
            <div className="mt-6 flex gap-4">
              <Link href="/dashboard/contracts" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/20">
                Manage Contracts
              </Link>
              <Link href="/dashboard/timeline" className="bg-zinc-800 border border-outline-variant text-zinc-300 px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-zinc-700 transition-colors">
                Audit Timeline
              </Link>
            </div>
          </div>
          
          {/* Decorative wave */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
            <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path
                d="M0,100 C30,80 70,110 100,80 L100,0 L0,0 Z"
                fill="currentColor"
                className="text-indigo-500"
              />
            </svg>
          </div>
        </motion.section>

        {/* KPI Cards */}
        <motion.section
          className="grid grid-cols-1 sm:grid-cols-4 gap-4"
          variants={stagger}
        >
          <KPICard
            title="Active Contracts"
            value={stats.contractsCount}
            trend={{ value: "100%", positive: true }}
            color="#a5b4fc"
          />
          <KPICard title="Open Obligations" value={stats.obligationsCount} color="#e4e1ee">
            <div className="mt-3 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500 w-[66%]" />
              <div className="h-full bg-amber-500 w-[17%]" />
              <div className="h-full bg-rose-500 w-[17%]" />
            </div>
            <p className="text-[10px] text-on-surface-variant mt-2 flex justify-between">
              <span>66% Compliant</span>
              <span>17% Late</span>
            </p>
          </KPICard>
          <KPICard title="Org Risk Index" value="" color="#a5b4fc">
            <div className="flex flex-col items-center justify-center -mt-2">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    className="text-zinc-800"
                  />
                  <motion.path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="text-indigo-500"
                    strokeDasharray={`${stats.averageRisk}, 100`}
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{ strokeDasharray: `${stats.averageRisk}, 100` }}
                    transition={{ delay: 0.5, duration: 1 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono text-on-surface font-semibold text-xs">
                  {stats.averageRisk}
                </div>
              </div>
            </div>
          </KPICard>
          <KPICard title="Missing Evidence" value={stats.missingEvidenceCount} color="#fca5a5">
            <div className="flex justify-end -mt-6">
              <AlertTriangle size={24} className="text-rose-400 opacity-40 animate-pulse" />
            </div>
          </KPICard>
        </motion.section>

        {/* Charts Row */}
        <motion.section variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Distribution Donut */}
          <motion.div
            variants={fadeUp}
            className="bg-surface-container border border-outline-variant p-6 rounded-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Risk Distribution</h3>
            </div>
            <div className="flex items-center gap-6 h-40">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1f1f28" strokeWidth="10" />
                  <motion.circle
                    cx="50" cy="50" r="40" fill="transparent"
                    stroke="#10b981" strokeWidth="10"
                    initial={{ strokeDasharray: "0 251" }}
                    animate={{ strokeDasharray: "150 251" }}
                    transition={{ delay: 0.4, duration: 1 }}
                  />
                  <motion.circle
                    cx="50" cy="50" r="40" fill="transparent"
                    stroke="#f59e0b" strokeWidth="10"
                    strokeDashoffset="-150"
                    initial={{ strokeDasharray: "0 251" }}
                    animate={{ strokeDasharray: "60 251" }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  />
                  <motion.circle
                    cx="50" cy="50" r="40" fill="transparent"
                    stroke="#ef4444" strokeWidth="10"
                    strokeDashoffset="-210"
                    initial={{ strokeDasharray: "0 251" }}
                    animate={{ strokeDasharray: "41 251" }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-white">{stats.obligationsCount}</span>
                  <span className="text-[9px] text-on-surface-variant font-mono">Clauses</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                {[
                  { label: "Low Risk", color: "bg-emerald-500", pct: `${riskDistribution.lowRisk}` },
                  { label: "Medium", color: "bg-amber-500", pct: `${riskDistribution.mediumRisk}` },
                  { label: "High Risk", color: "bg-rose-500", pct: `${riskDistribution.highRisk}` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-[12px] flex-1 text-zinc-300">{item.label}</span>
                    <span className="font-mono text-[11px] text-zinc-400">{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Compliance Trend */}
          <motion.div
            variants={fadeUp}
            className="bg-surface-container border border-outline-variant p-6 rounded-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-semibold">Compliance Telemetry</h3>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-mono">TRAILING SCA</span>
            </div>
            <div className="h-40 w-full flex items-end gap-1.5">
              {complianceTrend.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t hover:opacity-80 transition-colors relative group cursor-pointer"
                  style={{
                    background: `rgba(99, 102, 241, ${0.2 + (h / 100) * 0.6})`,
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: "easeOut" }}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-950 border border-outline-variant text-[9px] p-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity font-mono">
                    {h}%
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[9px] text-zinc-400 font-mono">
              <span>Day 1</span>
              <span>Day 2</span>
              <span>Day 3</span>
              <span>Day 4</span>
              <span>Day 5</span>
            </div>
          </motion.div>
        </motion.section>

        {/* Contracts Table */}
        <motion.section
          variants={fadeUp}
          className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container/50">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Compliance Watchlist
            </h3>
            <Link href="/dashboard/contracts" className="text-indigo-400 text-[12px] font-semibold hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-3 text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">
                    Contract / ID
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">
                    Obligations Completed
                  </th>
                  <th className="px-6 py-3 text-[10px] font-bold tracking-wider uppercase text-on-surface-variant text-right">
                    Explore
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {contracts.map((c, i) => (
                  <tr
                    key={c.id}
                    className="hover:bg-surface-container-high/40 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/contracts/${c.id}`} className="block">
                        <p className="font-semibold text-zinc-200 hover:text-indigo-400 text-xs transition-colors">
                          {c.title}
                        </p>
                        <p className="font-mono text-[9px] text-zinc-500">
                          ID: {c.id.split('-')[0]}
                        </p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          c.risk_score > 70 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          c.risk_score > 30 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {c.risk_score} SCORE
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-xs">
                        <div className="flex-1 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${c.obligationsPct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-zinc-400 shrink-0">
                          {c.obligationsDone}/{c.obligationsTotal} ({c.obligationsPct}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/contracts/${c.id}`} className="text-on-surface-variant hover:text-indigo-400 transition-colors inline-block">
                        <ExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>

      {/* Right Rail — Activity Feed */}
      <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6">
        <motion.section
          variants={fadeUp}
          className="bg-surface-container border border-outline-variant rounded-2xl p-5 flex-1 flex flex-col shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Activity Feed</h3>
          </div>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {activities.length === 0 ? (
              <p className="text-[11px] text-zinc-500 text-center py-6">No recent events</p>
            ) : (
              activities.slice(0, 5).map((item, i) => (
                <div
                  key={item.id}
                  className="relative pl-5 border-l-2 border-zinc-800"
                >
                  <div
                    className="absolute -left-1.5 top-0.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border border-zinc-950"
                  />
                  <p className="text-[9px] font-mono text-zinc-500 uppercase mb-0.5">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[11px] text-zinc-200 font-bold mb-0.5">
                    {item.action}
                  </p>
                  {item.metadata && item.metadata.details && (
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                      {item.metadata.details}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
          <Link href="/dashboard/timeline" className="mt-4 text-center py-2 bg-zinc-800 border border-outline-variant text-zinc-300 text-[10px] font-bold rounded-lg hover:bg-zinc-700 transition-colors uppercase tracking-wider">
            View Full Log
          </Link>
        </motion.section>

        {/* Quick Tools */}
        <motion.section
          variants={fadeUp}
          className="bg-indigo-950/10 border border-indigo-500/10 rounded-2xl p-5 flex flex-col gap-4"
        >
          <h4 className="text-[10px] font-bold tracking-wider uppercase text-indigo-400">
            Forensic Tools
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: "🔍", label: "Evidence", href: "/dashboard/evidence" },
              { icon: "⚖️", label: "Obligations", href: "/dashboard/obligations" },
            ].map((tool) => (
              <Link
                key={tool.label}
                href={tool.href}
                className="flex flex-col items-center justify-center gap-1.5 p-3 bg-zinc-900 border border-outline-variant/30 rounded-xl hover:border-indigo-500 transition-all hover:scale-[1.02] text-center"
              >
                <span className="text-lg">{tool.icon}</span>
                <span className="text-[10px] font-semibold text-zinc-300">{tool.label}</span>
              </Link>
            ))}
          </div>
          <button 
            onClick={handleSeedData} 
            disabled={seeding}
            className="w-full mt-2 py-2 px-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            {seeding ? <Loader2 size={12} className="animate-spin" /> : <Database size={12} />}
            {seeding ? "Resetting..." : "Reset Sandbox Data"}
          </button>
        </motion.section>
      </aside>
    </motion.div>
  );
}
