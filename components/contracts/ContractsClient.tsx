"use client";

import { motion } from "framer-motion";
import { FileText, Plus, Search, List, LayoutGrid, Filter, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Contract = {
  id: string;
  title: string;
  status: string;
  risk_score: number;
  created_at: string;
};

export function ContractsClient({ initialContracts }: { initialContracts: Contract[] }) {
  const router = useRouter();

  // Helper to generate a consistent mock obligations object based on the contract ID
  const getMockObligations = (id: string) => {
    // Generate a pseudo-random number based on the string length and character codes
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const total = 10 + (seed % 20); // 10 to 30
    const done = seed % total;
    const pct = Math.round((done / total) * 100);
    return { done, total, pct };
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active': return "bg-primary-container/20 text-primary border-primary/30";
      case 'pending': return "bg-surface-container-highest/40 text-on-surface-variant border-outline-variant";
      case 'expired': return "bg-error-container/20 text-error border-error/30";
      default: return "bg-surface-container-highest/40 text-on-surface-variant border-outline-variant";
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 7) return "bg-error";
    if (score >= 4) return "bg-tertiary";
    return "bg-primary";
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <nav className="flex text-on-surface-variant text-[12px] mb-2 gap-2">
            <span>Workspace</span><span>/</span><span className="text-on-surface">Legal Intelligence</span>
          </nav>
          <h1 className="text-[32px] font-semibold text-on-surface tracking-tight">Contracts</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-surface-container/50 rounded-lg p-1 border border-outline-variant">
            <button className="p-1.5 bg-surface-container-highest text-primary rounded-md shadow-sm"><List size={18} /></button>
            <button className="p-1.5 text-on-surface-variant hover:text-on-surface"><LayoutGrid size={18} /></button>
          </div>
          <button 
            onClick={() => router.push('/dashboard/upload')}
            className="bg-primary-container text-white px-4 py-2 rounded-xl text-[13px] font-semibold hover:opacity-90 flex items-center gap-2 shadow-lg shadow-primary-container/20"
          >
            <Plus size={16} /> Upload Contract
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container/40 backdrop-blur-md rounded-xl border border-outline-variant p-3 mb-6 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] flex items-center bg-surface-container-lowest/50 rounded-lg border border-outline-variant px-3 h-10">
          <Search size={16} className="text-on-surface-variant mr-2" />
          <input className="bg-transparent border-none focus:ring-0 text-[13px] w-full text-on-surface placeholder:text-outline outline-none" placeholder="Filter by keyword or party..." />
        </div>
        {["Status", "Risk Level", "Date Range"].map(f => (
          <button key={f} className="h-10 px-4 flex items-center gap-2 bg-surface-container-low/50 border border-outline-variant rounded-lg text-[13px] text-on-surface hover:bg-surface-container-high transition-colors">
            {f} <Filter size={14} />
          </button>
        ))}
      </div>

      {/* Active Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant mr-2">Active Filters:</span>
        <div className="flex items-center bg-primary-container/20 text-primary border border-primary/30 rounded-full px-3 py-1 gap-2 text-[12px] font-semibold">
          Status: Active <button className="hover:text-white"><X size={12} /></button>
        </div>
        <button className="text-primary text-[12px] font-semibold hover:underline ml-2">Clear all</button>
      </div>

      {/* Table */}
      <div className="bg-surface-container/30 backdrop-blur-lg rounded-xl border border-outline-variant overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-high/60 border-b border-outline-variant">
            <tr>
              <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded-sm bg-surface-container-lowest border-outline-variant text-primary" /></th>
              <th className="px-4 py-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Contract Title</th>
              <th className="px-4 py-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Status</th>
              <th className="px-4 py-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Risk Score</th>
              <th className="px-4 py-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Obligations</th>
              <th className="px-4 py-3 text-[11px] font-semibold tracking-wider uppercase text-on-surface-variant">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {initialContracts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText size={32} className="opacity-50" />
                    <p className="font-semibold text-on-surface">No contracts found</p>
                    <p className="text-sm">Upload a new contract to get started.</p>
                  </div>
                </td>
              </tr>
            )}
            {initialContracts.map((c, i) => {
              const obs = getMockObligations(c.id);
              return (
                <motion.tr
                  key={c.id}
                  className="glass-hover transition-all duration-300 group cursor-pointer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                >
                  <td className="px-4 py-4"><input type="checkbox" className="rounded-sm bg-surface-container-lowest border-outline-variant text-primary" /></td>
                  <td className="px-4 py-4">
                    <Link href={`/dashboard/contracts/${c.id}`} className="block">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-surface-container-highest/50 text-on-surface-variant rounded">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-[14px] text-on-surface group-hover:text-primary transition-colors">{c.title}</p>
                          <p className="text-[11px] font-mono text-on-surface-variant">ID: {c.id.split('-')[0]}</p>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${getStatusColor(c.status)}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getRiskColor(c.risk_score)} shadow-[0_0_8px_currentColor]`} />
                      <span className="font-mono text-[13px]">{c.risk_score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-32">
                      <div className="flex justify-between text-[11px] mb-1 font-semibold">
                        <span>{obs.pct}% matched</span>
                        <span>{obs.done}/{obs.total}</span>
                      </div>
                      <div className="w-full bg-surface-container-highest/40 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className="bg-primary h-1.5 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${obs.pct}%` }}
                          transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-on-surface-variant">
                    {new Date(c.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        <div className="bg-surface-container-low/60 px-4 py-3 border-t border-outline-variant flex items-center justify-between">
          <span className="text-[13px] text-on-surface-variant">
            Showing <span className="font-semibold text-on-surface">{initialContracts.length}</span> contracts
          </span>
        </div>
      </div>
    </motion.div>
  );
}
