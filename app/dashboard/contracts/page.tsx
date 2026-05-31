import { createClient } from '@/utils/supabase/server';
import { ContractsClient } from '@/components/contracts/ContractsClient';
import { redirect } from 'next/navigation';

export default async function ContractsPage() {
  const supabase = await createClient();

  // Ensure user is authenticated (middleware handles this, but good practice)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { getUserOrg } = await import('@/utils/org');
  const orgId = await getUserOrg(supabase, user.id);

  if (!orgId) {
    console.error('No org found for user');
    return null;
  }

  // Fetch contracts for this org, ordered by creation date descending
  const { data: contracts, error } = await supabase
    .from('contracts')
    .select('id, title, status, created_at, risk_scores(overall_score)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contracts:', error);
  }

  const mappedContracts = (contracts || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    created_at: c.created_at,
    risk_score: c.risk_scores?.[0]?.overall_score || 0
  }));

  // Pass to client component
  return (
    <ContractsClient 
      initialContracts={mappedContracts} 
    />
  );
}
