import { SupabaseClient } from '@supabase/supabase-js';

export async function getUserOrg(supabase: SupabaseClient, userId: string): Promise<string | null> {
  // 1. Check if user has a default org in profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('default_org_id')
    .eq('id', userId)
    .single();

  if (profile?.default_org_id) {
    return profile.default_org_id;
  }

  // 2. Check if they are a member of any org
  const { data: member } = await supabase
    .from('organization_members')
    .select('org_id')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (member?.org_id) {
    // Optionally update their profile
    await supabase.from('user_profiles').update({ default_org_id: member.org_id }).eq('id', userId);
    return member.org_id;
  }

  // 3. Auto-create a default Personal Workspace
  const slug = 'personal-' + userId;
  let orgId;

  const { data: newOrg, error: orgErr } = await supabase
    .from('organizations')
    .insert({
      name: 'Personal Workspace',
      slug: slug,
      owner_id: userId
    })
    .select('id')
    .single();

  if (orgErr) {
    if (orgErr.code === '23505') { // Unique constraint violation (race condition)
      const { data: existing } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .single();
        
      if (existing) {
        orgId = existing.id;
      } else {
        console.error("Failed to recover from org race condition");
        return null;
      }
    } else {
      console.error("Failed to auto-create org:", orgErr);
      return null;
    }
  } else {
    orgId = newOrg.id;
  }

  // 4. Add them as owner
  await supabase.from('organization_members').insert({
    org_id: orgId,
    user_id: userId,
    role: 'owner'
  });

  // 5. Create or update profile
  const { error: profileCheckErr } = await supabase
    .from('user_profiles')
    .update({ default_org_id: orgId })
    .eq('id', userId);

  // Note: the DB trigger `handle_new_user` might have created the profile,
  // but if it didn't update correctly, we can ignore the error for now.

  return orgId;
}
