import { createClient } from "@/utils/supabase/server";
import { TimelineClient } from "@/components/timeline/TimelineClient";
import { redirect } from "next/navigation";
import { getUserOrg } from "@/utils/org";

export const dynamic = 'force-dynamic';

export default async function TimelinePage() {
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

  // 2. Fetch timeline events ordered by occurred_at descending
  const { data: events, error } = await supabase
    .from('timeline_events')
    .select('*, contracts(id, title)')
    .eq('org_id', orgId)
    .order('occurred_at', { ascending: false });

  if (error) {
    console.error("Error fetching timeline events:", error);
  }

  // 3. Map timeline relations defensively
  const mappedEvents = (events || []).map((ev: any) => ({
    id: ev.id,
    contract_id: ev.contract_id,
    org_id: ev.org_id,
    title: ev.title,
    description: ev.description,
    event_type: ev.event_type,
    occurred_at: ev.occurred_at,
    contracts: Array.isArray(ev.contracts)
      ? ev.contracts[0] || null
      : ev.contracts || null
  }));

  return (
    <TimelineClient 
      events={mappedEvents}
    />
  );
}
