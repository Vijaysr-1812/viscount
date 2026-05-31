import { FileText, Search, Link as LinkIcon, History, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  compact?: boolean;
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon = FileText, 
  primaryAction, 
  secondaryAction,
  compact = false 
}: EmptyStateProps) {
  if (compact) {
    return (
      <div className="bg-surface-container border border-outline-variant p-6 rounded-xl flex flex-col items-center justify-center h-full min-h-[300px]">
        <div className="mb-4 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-outline-variant/30" />
          <div className="w-2 h-2 rounded-full bg-outline-variant/50" />
          <div className="w-2 h-2 rounded-full bg-outline-variant/30" />
        </div>
        <Icon className="text-on-surface-variant/50 mb-3" size={40} />
        <h4 className="text-[14px] font-bold text-on-surface mb-2">{title}</h4>
        <p className="text-[13px] text-on-surface-variant text-center max-w-xs mb-4">
          {description}
        </p>
        {primaryAction && (
          <button 
            onClick={primaryAction.onClick}
            className="text-primary font-semibold text-[11px] tracking-wider uppercase hover:text-primary-container transition-colors flex items-center gap-1"
          >
            {primaryAction.label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface-container border border-outline-variant p-8 rounded-xl flex flex-col items-center justify-center min-h-[400px] text-center w-full">
      <div className="w-32 h-32 mb-8 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={80} className="text-outline-variant/30" strokeWidth={1} />
          <motion.div 
            className="absolute -top-2 -right-2 w-8 h-8 bg-primary/20 rounded-full border border-primary/30 flex items-center justify-center"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Search className="text-primary" size={16} />
          </motion.div>
        </div>
        <svg className="absolute inset-0 w-full h-full text-outline-variant/20" viewBox="0 0 100 100">
          <circle cx="50" cy="50" fill="none" r="48" stroke="currentColor" strokeDasharray="4 4" strokeWidth="0.5" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-on-surface mb-3">{title}</h2>
      <p className="text-[14px] text-on-surface-variant max-w-md mx-auto mb-8">
        {description}
      </p>
      <div className="flex gap-4">
        {primaryAction && (
          <button 
            onClick={primaryAction.onClick}
            className="bg-primary-container text-white font-bold px-6 py-2 rounded-xl hover:opacity-90 transition-colors shadow-lg shadow-primary-container/20"
          >
            {primaryAction.label}
          </button>
        )}
        {secondaryAction && (
          <button 
            onClick={secondaryAction.onClick}
            className="bg-surface-container-highest border border-outline-variant text-on-surface font-bold px-6 py-2 rounded-xl hover:bg-surface-variant transition-colors"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}
