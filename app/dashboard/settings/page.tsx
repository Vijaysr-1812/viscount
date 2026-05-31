import { createClient } from "@/utils/supabase/server";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { redirect } from "next/navigation";
import { getUserOrg } from "@/utils/org";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const orgId = await getUserOrg(supabase, user.id);
  if (!orgId) {
    return <div>Error loading organization workspace.</div>;
  }

  // Fetch org settings
  const { data: orgData } = await supabase
    .from('organizations')
    .select('settings')
    .eq('id', orgId)
    .single();

  const initialSettings = orgData?.settings || {};

  return <SettingsClient initialSettings={initialSettings} />;
}
