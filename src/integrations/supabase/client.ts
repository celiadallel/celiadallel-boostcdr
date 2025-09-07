import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Enable production mode - Supabase is now active
const FORCE_OFFLINE = false; // Production mode activated
let supabase: ReturnType<typeof createClient>;
let supabaseAvailable = false;

// Ensure environment variables are present
if (!FORCE_OFFLINE && supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      },
      db: {
        schema: 'public'
      }
    });
    supabaseAvailable = true;
    console.log("✅ Supabase client ready - Production mode");
    console.log("🔗 Supabase URL:", supabaseUrl);
    console.log("🔑 Anon Key configured:", supabaseAnonKey ? "Yes" : "No");
  } catch (error) {
    console.error("❌ Supabase client creation failed:", error);
    supabaseAvailable = false;
  }
} else {
  console.log("⚠️ Supabase not available - Missing environment variables");
  console.log("URL exists:", !!supabaseUrl);
  console.log("Key exists:", !!supabaseAnonKey);
  console.log("FORCE_OFFLINE:", FORCE_OFFLINE);
  supabaseAvailable = false;
}

// Create a proper mock client if Supabase is not available
if (!supabaseAvailable) {
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.reject(new Error("Supabase not configured")),
      signInWithOAuth: () => Promise.reject(new Error("Supabase not configured")),
      signOut: () => Promise.reject(new Error("Supabase not configured")),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: () => Promise.reject(new Error("Supabase not configured")),
      admin: {
        createUser: () => Promise.reject(new Error("Supabase not configured")),
        inviteUserByEmail: () => Promise.reject(new Error("Supabase not configured"))
      }
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.reject(new Error("Supabase not configured"))
        }),
        head: () => Promise.reject(new Error("Supabase not configured"))
      }),
      upsert: () => Promise.reject(new Error("Supabase not configured")),
      insert: () => Promise.reject(new Error("Supabase not configured"))
    }),
    functions: { 
      invoke: () => Promise.reject(new Error("Supabase not configured")) 
    }
  } as any;
}

export { supabase, supabaseAvailable };