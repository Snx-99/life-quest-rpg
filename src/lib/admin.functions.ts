import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roleRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Accès refusé");

    const [{ data: profiles }, { count: taskCount }, { data: completions }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id,email,display_name,level,xp,streak,best_streak,created_at,last_active_date,onboarded")
        .order("created_at", { ascending: false })
        .limit(500),
      supabaseAdmin.from("tasks").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("completions").select("xp,day").limit(5000),
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const list = profiles ?? [];

    return {
      users: list,
      totals: {
        users: list.length,
        onboarded: list.filter((p) => p.onboarded).length,
        activeToday: list.filter((p) => p.last_active_date === today).length,
        tasks: taskCount ?? 0,
        completions: completions?.length ?? 0,
        xp: (completions ?? []).reduce((s, c) => s + (c.xp ?? 0), 0),
      },
    };
  });
