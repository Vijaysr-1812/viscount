import { motion } from "framer-motion";

export function SkeletonRow({ cols }: { cols: number[] }) {
  return (
    <div className="flex items-center px-4 py-3 border-b border-outline-variant/30 gap-4">
      {cols.map((width, i) => (
        <div key={i} className={`h-4 bg-surface-container-highest rounded animate-pulse w-[${width}%]`} style={{ width: `${width}%` }} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-surface-container/30 border border-outline-variant rounded-xl overflow-hidden">
      <div className="flex items-center px-4 py-3 bg-surface-container-high/60 border-b border-outline-variant gap-4">
        {[5, 25, 15, 15, 20, 20].map((w, i) => (
          <div key={i} className="h-3 bg-surface-container-highest rounded animate-pulse" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="divide-y divide-outline-variant/30">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center px-4 py-4 gap-4">
            <div className="w-[5%] h-4 bg-surface-container-highest rounded animate-pulse" />
            <div className="w-[25%] flex flex-col gap-2">
              <div className="h-4 bg-surface-container-highest rounded animate-pulse w-3/4" />
              <div className="h-3 bg-surface-container-highest rounded animate-pulse w-1/2" />
            </div>
            <div className="w-[15%] h-5 bg-surface-container-highest rounded animate-pulse" />
            <div className="w-[15%] h-4 bg-surface-container-highest rounded animate-pulse" />
            <div className="w-[20%] h-2 bg-surface-container-highest rounded-full animate-pulse" />
            <div className="w-[20%] h-4 bg-surface-container-highest rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="bg-surface-container border border-outline-variant p-6 rounded-xl space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-6 w-32 bg-surface-container-highest rounded animate-pulse" />
        <div className="h-4 w-12 bg-surface-container-highest rounded animate-pulse" />
      </div>
      <div className="flex justify-center py-8">
        <div className="h-32 w-32 rounded-full border-8 border-surface-container-highest relative">
          <div className="absolute inset-0 border-8 border-primary/20 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-surface-container-highest rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-surface-container-highest rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-surface-container-highest rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-4">
        <div className="h-10 bg-surface-container-highest rounded animate-pulse" />
        <div className="h-10 bg-surface-container-highest rounded animate-pulse" />
      </div>
    </div>
  );
}
