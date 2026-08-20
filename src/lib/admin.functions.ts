import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, loadAdmin } from "@/lib/admin.server";

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const supabaseAdmin = await loadAdmin();

    const [{ data: profiles }, { count: taskCount }, { data: completions }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select(
          "id,email,display_name,level,xp,streak,best_streak,created_at,last_active_date,onboarded,unlocked",
        )
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

/** Débloque (ou reverrouille) tous les cosmétiques/thèmes pour un utilisateur ou pour tous. */
export const setUnlockAll = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId?: string; value: boolean }) => data)
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const supabaseAdmin = await loadAdmin();
    const targets = data.userId
      ? [{ id: data.userId, unlocked: null as Record<string, unknown> | null }]
      : ((await supabaseAdmin.from("profiles").select("id,unlocked")).data ?? []);

    for (const t of targets) {
      const current = (t.unlocked ?? {}) as Record<string, unknown>;
      await supabaseAdmin
        .from("profiles")
        .update({ unlocked: { ...current, all: data.value } })
        .eq("id", t.id);
    }
    return { count: targets.length };
  });

/** Renomme un utilisateur. */
export const renameUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; name: string }) => data)
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const supabaseAdmin = await loadAdmin();
    const name = data.name.trim().slice(0, 40);
    if (!name) throw new Error("Nom vide");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ display_name: name })
      .eq("id", data.userId);
    if (error) throw error;
    return { ok: true };
  });

/** Renomme tous les utilisateurs avec un motif ({n} = index). */
export const renameAllUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { pattern: string }) => data)
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const supabaseAdmin = await loadAdmin();
    const pattern = data.pattern.trim().slice(0, 40);
    if (!pattern) throw new Error("Motif vide");
    const { data: rows } = await supabaseAdmin
      .from("profiles")
      .select("id,display_name,unlocked")
      .order("created_at", { ascending: true });
    let i = 0;
    for (const row of rows ?? []) {
      i += 1;
      const current = (row.unlocked ?? {}) as Record<string, unknown>;
      await supabaseAdmin
        .from("profiles")
        .update({
          display_name: pattern.replaceAll("{n}", String(i)),
          unlocked: { ...current, prev_name: row.display_name },
        })
        .eq("id", row.id);
    }
    return { count: i };
  });

/** Annule le renommage groupé. */
export const undoRenameAll = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const supabaseAdmin = await loadAdmin();
    const { data: rows } = await supabaseAdmin.from("profiles").select("id,unlocked");
    let count = 0;
    for (const row of rows ?? []) {
      const current = (row.unlocked ?? {}) as Record<string, unknown>;
      if (!("prev_name" in current)) continue;
      const { prev_name, ...rest } = current;
      await supabaseAdmin
        .from("profiles")
        .update({ display_name: (prev_name as string | null) ?? null, unlocked: rest as never })
        .eq("id", row.id);
      count += 1;
    }
    return { count };
  });

/** Réinitialise la progression (sauvegarde restaurable). */
export const resetProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId?: string }) => data)
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const supabaseAdmin = await loadAdmin();
    let query = supabaseAdmin
      .from("profiles")
      .select("id,level,xp,coins,streak,best_streak,study_minutes,title,unlocked");
    if (data.userId) query = query.eq("id", data.userId);
    const { data: rows } = await query;

    for (const row of rows ?? []) {
      const current = (row.unlocked ?? {}) as Record<string, unknown>;
      const backup = {
        level: row.level,
        xp: row.xp,
        coins: row.coins,
        streak: row.streak,
        best_streak: row.best_streak,
        study_minutes: row.study_minutes,
        title: row.title,
      };
      await supabaseAdmin
        .from("profiles")
        .update({
          ...({
            level: 1,
            xp: 0,
            coins: 50,
            streak: 0,
            best_streak: 0,
            study_minutes: 0,
            title: "Novice",
          } as const),
          unlocked: { ...current, backup },
        })
        .eq("id", row.id);
    }
    return { count: rows?.length ?? 0 };
  });

/** Annule la dernière réinitialisation. */
export const undoReset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId?: string }) => data)
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const supabaseAdmin = await loadAdmin();
    let query = supabaseAdmin.from("profiles").select("id,unlocked");
    if (data.userId) query = query.eq("id", data.userId);
    const { data: rows } = await query;

    let count = 0;
    for (const row of rows ?? []) {
      const current = (row.unlocked ?? {}) as Record<string, unknown>;
      const backup = current.backup as Record<string, unknown> | undefined;
      if (!backup) continue;
      const { backup: _drop, ...rest } = current;
      await supabaseAdmin
        .from("profiles")
        .update({ ...backup, unlocked: rest as never })
        .eq("id", row.id);
      count += 1;
    }
    return { count };
  });
