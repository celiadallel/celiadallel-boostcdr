// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!; // Edge has service key, but anon is fine for RPC with RLS; we use admin client below if needed

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check existing memberships
    const { data: memberships, error: mErr } = await supabase
      .from("memberships")
      .select("pod_id")
      .eq("user_id", user.id);
    if (mErr) throw mErr;

    if (memberships && memberships.length > 0) {
      return new Response(JSON.stringify({ assigned: memberships[0].pod_id, alreadyMember: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Find pods sorted by member count asc
    const { data: pods, error: pErr } = await supabase
      .from("pods")
      .select("id")
      .eq("is_active", true)
      .limit(50);
    if (pErr) throw pErr;

    if (!pods || pods.length === 0) {
      return new Response(JSON.stringify({ error: "no_pods_available" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch counts and pick least used
    let chosen: string | null = null;
    let minCount = Number.POSITIVE_INFINITY;
    for (const pod of pods) {
      const { count } = await supabase
        .from("memberships")
        .select("user_id", { count: "exact", head: true })
        .eq("pod_id", pod.id);
      const c = count ?? 0;
      if (c < minCount) {
        minCount = c;
        chosen = pod.id;
      }
    }

    if (!chosen) chosen = pods[0].id;

    // Ensure profile
    await supabase.from("profiles").upsert({ id: user.id });

    // Insert membership
    const { error: insErr } = await supabase
      .from("memberships")
      .insert({ user_id: user.id, pod_id: chosen });
    if (insErr && insErr.code !== "23505") throw insErr; // ignore duplicate

    return new Response(JSON.stringify({ assigned: chosen, alreadyMember: false }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
