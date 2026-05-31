import { createClient } from "@/utils/supabase/server";
import { ContractDetailClient } from "@/components/contracts/ContractDetailClient";
import { notFound, redirect } from "next/navigation";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // Ensure user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Ensure organization exists
  const { getUserOrg } = await import("@/utils/org");
  const orgId = await getUserOrg(supabase, user.id);

  if (!orgId) {
    notFound();
  }

  // Fetch the specific contract with its risk score
  const { data: contract, error } = await supabase
    .from('contracts')
    .select('*, risk_scores(*)')
    .eq('id', id)
    .eq('org_id', orgId)
    .single();

  if (error || !contract) {
    console.error("Error fetching contract:", error);
    notFound();
  }

  // Fetch the extracted obligations along with their linked evidence
  const { data: obligations, error: obsError } = await supabase
    .from('obligations')
    .select(`
      *, 
      obligation_evidence_links (
        *,
        evidence (*)
      )
    `)
    .eq('contract_id', id)
    .order('created_at', { ascending: false });

  if (obsError) {
    console.error("Error fetching obligations:", obsError);
  }

  // Fetch timeline events for this contract
  const { data: timelineEvents, error: timeError } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('contract_id', id)
    .order('occurred_at', { ascending: false });

  if (timeError) {
    console.error("Error fetching timeline events:", timeError);
  }

  return (
    <ContractDetailClient 
      contract={contract} 
      initialObligations={obligations || []} 
      initialTimelineEvents={timelineEvents || []}
    />
  );
}
