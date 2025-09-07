import { supabase } from "@/integrations/supabase/client";

export async function ensureMatchedPod() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { assigned: null, alreadyMember: false };
  const key = `matched:${session.user.id}`;
  if (localStorage.getItem(key)) return { assigned: null, alreadyMember: true };

  const { data, error } = await supabase.functions.invoke("match", { body: {} });
  if (error) throw error;
  localStorage.setItem(key, "1");
  return data as { assigned: string; alreadyMember: boolean };
}
