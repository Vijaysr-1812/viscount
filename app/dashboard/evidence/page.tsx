import { createClient } from "@/utils/supabase/server";
import { EvidenceClient } from "@/components/evidence/EvidenceClient";
import { redirect } from "next/navigation";
import { getUserOrg } from "@/utils/org";

export default async function EvidenceLibraryPage() {
  const supabase = await createClient();

  // 1. Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const orgId = await getUserOrg(supabase, user.id);
  if (!orgId) {
    return <div>Error loading organization workspace.</div>;
  }

  // 2. Fetch evidence with links -> obligations -> contracts
  const { data: evidence, error: evError } = await supabase
    .from('evidence')
    .select(`
      *,
      obligation_evidence_links (
        id,
        human_verified,
        match_type,
        obligations (
          id,
          obligation_summary,
          contracts (id, title)
        )
      )
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (evError) {
    console.error("Error fetching evidence:", evError);
  }

  // 3. Fetch obligations for linking options
  const { data: obligations, error: obError } = await supabase
    .from('obligations')
    .select('id, obligation_summary, clause_text, status, contracts(id, title)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (obError) {
    console.error("Error fetching obligations:", obError);
  }

  // 4. Map evidence relations defensively to resolve TypeScript relation mismatches
  const mappedEvidence = (evidence || []).map((ev: any) => {
    // Collect obligations from links
    const obs: any[] = [];
    if (ev.obligation_evidence_links && ev.obligation_evidence_links.length > 0) {
      ev.obligation_evidence_links.forEach((link: any) => {
        let ob = link.obligations;
        if (Array.isArray(ob)) ob = ob[0];
        if (ob) {
          obs.push({
            id: ob.id,
            obligation_summary: ob.obligation_summary,
            human_verified: link.human_verified,
            contracts: Array.isArray(ob.contracts) ? ob.contracts[0] : ob.contracts
          });
        }
      });
    }

    return {
      id: ev.id,
      org_id: ev.org_id,
      source: ev.source,
      file_name: ev.file_name,
      file_url: ev.file_url,
      ai_summary: ev.ai_summary,
      status: ev.status,
      created_at: ev.created_at,
      linked_obligations: obs
    };
  });

  // 5. Map obligations relations defensively
  const mappedObligations = (obligations || []).map((ob: any) => ({
    id: ob.id,
    obligation_summary: ob.obligation_summary,
    clause_text: ob.clause_text || null,
    status: ob.status || null,
    contracts: Array.isArray(ob.contracts)
      ? ob.contracts[0] || null
      : ob.contracts || null
  }));

  return (
    <EvidenceClient 
      evidence={mappedEvidence}
      obligations={mappedObligations}
    />
  );
}
