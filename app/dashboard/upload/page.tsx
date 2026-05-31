"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  FileAudio,
  Code,
  FolderArchive,
  X,
  CheckCircle2,
  TableProperties,
  ToggleLeft,
  ToggleRight,
  FolderOpen,
  CloudCog,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { getUserOrg } from "@/utils/org";

type UploadedFile = {
  id: string;
  title: string;
  type: string;
  progress: number;
  status: "uploading" | "extracting" | "complete" | "error" | "warning";
  errorMsg?: string;
};

function ExtractionTerminal() {
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    "Initializing neural parse...",
    "Extracting optical layout...",
    "Identifying key indemnity clauses...",
    "Cross-referencing risk matrix...",
    "Synthesizing compliance data..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx(prev => (prev + 1 < messages.length ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-3 bg-zinc-950 border border-outline-variant/50 rounded-lg p-3 flex flex-col gap-1.5 shadow-inner">
      {messages.slice(0, msgIdx + 1).map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: i === msgIdx ? 1 : 0.4, x: 0 }}
          className="font-mono text-[10px] flex items-center gap-1.5"
        >
          <span className="text-secondary/50">{'>_'}</span>
          <span className={i === msgIdx ? "text-secondary font-semibold" : "text-zinc-500"}>{msg}</span>
          {i === msgIdx && (
            <motion.span 
              animate={{ opacity: [0, 1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8 }} 
              className="w-1.5 h-3 bg-secondary ml-1 inline-block" 
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default function UploadCenterPage() {
  const [activeTab, setActiveTab] = useState<"contract" | "evidence" | "bulk">("contract");
  const [deepAudit, setDeepAudit] = useState(true);
  const [autoMap, setAutoMap] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClient();
  const router = useRouter();

  // Basic check to ensure user is logged in
  const [userId, setUserId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        const org = await getUserOrg(supabase, data.user.id);
        setOrgId(org);
      }
    });
  }, [supabase]);

  const staggerIn = {
    hidden: { opacity: 0, y: 20 },
    show: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.5, ease: "easeOut" as const }
    })
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !userId) return;

    const file = files[0];
    const fileId = crypto.randomUUID();
    
    // Add to queue
    const newFile: UploadedFile = {
      id: fileId,
      title: file.name,
      type: file.type.includes("pdf") ? "PDF" : "DOCX",
      progress: 0,
      status: "uploading"
    };
    
    setUploadedFiles(prev => [newFile, ...prev]);
    setIsUploading(true);

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop() || 'pdf';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${orgId}/${fileName}`;
      const bucketName = activeTab === 'evidence' ? 'evidence' : 'contract_documents';

      // Simulate progress for UI purposes since supabase-js doesn't have native upload progress yet
      const progressInterval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => {
          if (f.id === fileId && f.progress < 90) {
            return { ...f, progress: f.progress + 10 };
          }
          return f;
        }));
      }, 200);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      // Update state to extracting
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, progress: 100, status: "extracting" } : f
      ));

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // 3. Insert into Database
      let resourceId;
      if (activeTab === 'evidence') {
        const { data: evData, error: evError } = await supabase
          .from('evidence')
          .insert({
            org_id: orgId,
            uploaded_by: userId,
            file_name: file.name,
            evidence_type: fileExt.toLowerCase() === 'pdf' ? 'pdf' : 'text',
            file_url: publicUrl,
            status: 'uploading',
            source: 'manual_upload'
          })
          .select()
          .single();

        if (evError || !evData) throw evError;
        resourceId = evData.id;
      } else {
        const { data: contractData, error: dbError } = await supabase
          .from('contracts')
          .insert({
            org_id: orgId,
            uploaded_by: userId,
            title: file.name,
            contract_type: 'Master Service Agreement',
            file_url: publicUrl,
            status: 'uploading'
          })
          .select()
          .single();

        if (dbError || !contractData) throw dbError;
        resourceId = contractData.id;
      }

      // 4. Trigger AI Extraction
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: "extracting" } : f
      ));

      const apiUrl = activeTab === 'evidence' ? '/api/analyze-evidence' : '/api/analyze-contract';
      const requestBody = activeTab === 'evidence' 
        ? { evidenceId: resourceId, filePath: filePath }
        : { contractId: resourceId, filePath: filePath };

      const aiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "AI Analysis Failed");
      }

      const aiData = await aiResponse.json();
      
      const isFallback = aiData.extraction?.is_sandbox_fallback || aiData.is_sandbox_fallback;

      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: isFallback ? "warning" : "complete",
          errorMsg: isFallback ? "OpenAI Quota Exceeded. Used Mock Sandbox Data." : undefined
        } : f
      ));
      setIsUploading(false);

    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: "error", errorMsg: error.message } : f
      ));
      setIsUploading(false);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-transparent relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full filter blur-[120px] opacity-10 bg-primary/20 w-[600px] h-[600px] top-0 left-0 animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <motion.div custom={0} initial="hidden" animate="show" variants={staggerIn} className="mb-8">
            <h1 className="text-3xl font-bold text-on-surface mb-2 tracking-tight">Upload Center</h1>
            <p className="text-on-surface-variant max-w-2xl text-sm leading-relaxed">
              Forensic ingestion engine for legal documents and evidentiary artifacts. Our AI automatically extracts clauses, maps obligations, and validates authenticity.
            </p>
          </motion.div>

          {/* Segmented Tabs */}
          <motion.div custom={1} initial="hidden" animate="show" variants={staggerIn} className="flex border-b border-outline-variant gap-8 mb-8">
            {[
              { id: "contract", icon: FileText, label: "Upload Contract" },
              { id: "evidence", icon: CheckCircle2, label: "Upload Evidence" },
              { id: "bulk", icon: FolderArchive, label: "Bulk Upload" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 font-semibold flex items-center gap-2 text-sm transition-colors relative ${
                  activeTab === tab.id ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <tab.icon size={18} /> {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="upload-tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />
                )}
              </button>
            ))}
          </motion.div>

          {/* Bento Layout Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Upload Area */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Drop Zone */}
              <motion.div 
                custom={2} 
                initial="hidden" 
                animate="show" 
                variants={staggerIn} 
                className={`relative group cursor-pointer h-[320px] ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
                onClick={handleFileClick}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-container to-secondary-container rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant bg-surface-container-low/50 backdrop-blur-sm rounded-xl p-8 transition-all hover:border-primary-container hover:bg-surface-container/50">
                  <div className={`w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-6 transition-transform shadow-lg ${isUploading ? 'animate-pulse' : 'group-hover:scale-110'}`}>
                    <UploadCloud size={32} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-on-surface">
                    {isUploading ? 'Uploading artifact...' : 'Drag and drop artifacts'}
                  </h3>
                  <p className="text-on-surface-variant text-center max-w-sm mb-8 text-sm">
                    Support for PDF, DOCX, ZIP, and forensic data exports. Maximum single file size 500MB.
                  </p>
                  <div className="flex gap-4">
                    <button 
                      className="bg-zinc-800 border border-zinc-700 text-on-surface px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors text-sm font-semibold flex items-center gap-2"
                      onClick={(e) => { e.stopPropagation(); handleFileClick(); }}
                    >
                      <FolderOpen size={16} /> Browse Files
                    </button>
                    <button 
                      className="bg-zinc-800 border border-zinc-700 text-on-surface px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors text-sm font-semibold flex items-center gap-2"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <CloudCog size={16} /> Import from Cloud
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* File Queue */}
              {uploadedFiles.length > 0 && (
                <motion.div custom={3} initial="hidden" animate="show" variants={staggerIn} className="bg-surface-container-low/80 backdrop-blur-md border border-outline-variant rounded-xl overflow-hidden shadow-lg">
                  <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-highest/20 flex justify-between items-center">
                    <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Active Queue ({uploadedFiles.length})</h3>
                    <button 
                      onClick={() => setUploadedFiles(prev => prev.filter(f => f.status !== 'complete' && f.status !== 'error'))}
                      className="text-primary text-xs font-semibold hover:underline"
                    >
                      Clear completed
                    </button>
                  </div>
                  <div className="divide-y divide-outline-variant/50">
                    
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="p-4 sm:p-6 flex items-center gap-4 group hover:bg-surface-container-high/30 transition-colors">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                          file.status === 'error' ? 'bg-error-container/20 text-error' :
                          file.status === 'complete' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-primary-container/20 text-primary'
                        }`}>
                          {file.status === 'complete' ? <Code size={24} /> : <FileText size={24} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-semibold text-on-surface truncate pr-4">{file.title}</div>
                            <span className="text-[10px] font-mono font-bold text-on-surface-variant uppercase bg-surface-container px-2 py-0.5 rounded border border-outline-variant shrink-0">{file.type}</span>
                          </div>
                          
                          {file.status === 'uploading' && (
                            <div className="flex items-center gap-4">
                              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div animate={{ width: `${file.progress}%` }} className="h-full bg-primary-container"></motion.div>
                              </div>
                              <span className="font-mono text-[10px] text-primary whitespace-nowrap font-bold">Uploading... {file.progress}%</span>
                            </div>
                          )}

                          {file.status === 'extracting' && (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-4">
                                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                                  <motion.div 
                                    className="absolute top-0 bottom-0 bg-secondary-container w-1/3"
                                    animate={{ left: ["-30%", "100%"] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                  />
                                </div>
                                <span className="font-mono text-[10px] text-secondary whitespace-nowrap font-bold flex items-center gap-1">
                                  <Loader2 size={10} className="animate-spin" /> Live Processing
                                </span>
                              </div>
                              <ExtractionTerminal />
                            </div>
                          )}

                          {file.status === 'complete' && (
                            <div className="flex items-center gap-2 text-emerald-500">
                              <CheckCircle2 size={14} />
                              <span className="text-xs font-semibold">Analysis Complete</span>
                            </div>
                          )}

                          {file.status === 'warning' && (
                            <div className="flex items-center gap-2 text-amber-500">
                              <AlertTriangle size={14} />
                              <span className="text-xs font-semibold">{file.errorMsg || 'Completed with warnings'}</span>
                            </div>
                          )}

                          {file.status === 'error' && (
                            <div className="flex items-center gap-2 text-error">
                              <X size={14} />
                              <span className="text-xs font-semibold text-error truncate">{file.errorMsg || 'Upload failed'}</span>
                            </div>
                          )}

                        </div>
                        <button 
                          onClick={() => removeFile(file.id)}
                          className={`text-on-surface-variant hover:text-error transition-opacity p-2 ${
                            (file.status === 'complete' || file.status === 'error' || file.status === 'warning') ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar / Config */}
            <div className="space-y-8">
              
              {/* Analysis Settings */}
              <motion.div custom={4} initial="hidden" animate="show" variants={staggerIn} className="bg-surface-container-low/80 backdrop-blur-md border border-outline-variant rounded-xl p-6 shadow-lg">
                <h4 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-6">Ingestion Pipeline</h4>
                <div className="space-y-6">
                  
                  <div className="flex items-center justify-between group cursor-pointer" onClick={() => setDeepAudit(!deepAudit)}>
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">Deep Forensic Audit</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">Verify digital signatures, metadata, and cross-reference entity graphs.</p>
                    </div>
                    {deepAudit ? <ToggleRight size={32} className="text-primary" /> : <ToggleLeft size={32} className="text-on-surface-variant opacity-50" />}
                  </div>

                  <div className="flex items-center justify-between group cursor-pointer" onClick={() => setAutoMap(!autoMap)}>
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">Automatic Mapping</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">Link uploaded evidence directly to existing master agreements via AI.</p>
                    </div>
                    {autoMap ? <ToggleRight size={32} className="text-primary" /> : <ToggleLeft size={32} className="text-on-surface-variant opacity-50" />}
                  </div>

                </div>
              </motion.div>

              {/* Bulk Import Card */}
              <motion.div custom={5} initial="hidden" animate="show" variants={staggerIn} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                <h4 className="text-xl font-bold text-primary mb-3">Bulk Mapping</h4>
                <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                  Import a CSV containing contract IDs and evidence links for automated high-throughput reconciliation.
                </p>
                <button className="w-full bg-zinc-800 border border-zinc-700 text-on-surface px-4 py-3 rounded-lg hover:bg-zinc-700 transition-all font-semibold flex items-center justify-center gap-2">
                  <TableProperties size={18} /> Download CSV Template
                </button>
              </motion.div>

              {/* Visual Context */}
              <motion.div custom={6} initial="hidden" animate="show" variants={staggerIn} className="rounded-xl overflow-hidden border border-outline-variant shadow-lg hidden lg:block bg-zinc-900 aspect-video relative flex items-center justify-center group">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity mix-blend-luminosity"></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
                 <span className="relative z-10 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-950/80 px-3 py-1 rounded backdrop-blur-md">Secure Vault</span>
              </motion.div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
