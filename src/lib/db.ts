import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUserId } from "@/lib/session";
import {
  ACHIEVEMENTS,
  levelFromXp,
  skillLevelFromXp,
  titleForLevel,
  todayISO,
  type StatsSnapshot,
} from "@/lib/game";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  best_streak: number;
  last_active_date: string | null;
  onboarded: boolean;
  interests: string[];
  title: string;
  theme: string;
  avatar: Record<string, string>;
  unlocked: Record<string, unknown>;
  study_minutes: number;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  kind: "daily" | "habit" | "task";
  skill_key: string | null;
  difficulty: number;
  xp: number;
  minutes: number;
  due_date: string | null;
  done: boolean;
  archived: boolean;
  last_done_date: string | null;
  streak: number;
  created_at: string;
};

export type Completion = {
  id: string;
  kind: "daily" | "habit" | "task";
  title: string | null;
  skill_key: string | null;
  xp: number;
  minutes: number;
  day: string;
  created_at: string;
};

export type UserSkill = { id: string; skill_key: string; level: number; xp: number };

export function useProfile() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId!).maybeSingle();
      if (error) throw error;
      if (data) return data as unknown as Profile;
      // Fallback if the signup trigger has not run yet.
      const { data: created, error: insertError } = await supabase
        .from("profiles")
        .insert({ id: userId! })
        .select("*")
        .single();
      if (insertError) throw insertError;
      return created as unknown as Profile;
    },
  });
}

export function useIsAdmin() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["role", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}

export function useTasks() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["tasks", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("archived", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Task[];
    },
  });
}

export function useCompletions() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["completions", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("completions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as unknown as Completion[];
    },
  });
}

export function useSkills() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["skills", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_skills").select("*");
      if (error) throw error;
      return (data ?? []) as unknown as UserSkill[];
    },
  });
}

export function useAchievements() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["achievements", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_achievements").select("*");
      if (error) throw error;
      return (data ?? []) as { achievement_key: string; unlocked_at: string }[];
    },
  });
}

export function useQuests() {
  const userId = useUserId();
  return useQuery({
    queryKey: ["quests", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_quests").select("*");
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        quest_key: string;
        progress: number;
        target: number;
        completed: boolean;
        day: string | null;
      }[];
    },
  });
}

export function buildStats(
  profile: Profile | undefined,
  completions: Completion[],
  skills: UserSkill[],
): StatsSnapshot {
  const level = profile ? levelFromXp(profile.xp).level : 1;
  const byDay = new Map<string, number>();
  let tasksDone = 0;
  let habitsDone = 0;
  let dailiesDone = 0;
  let earlyBird = 0;
  let nightOwl = 0;
  let weekXp = 0;
  const weekAgo = Date.now() - 7 * 86400000;

  for (const c of completions) {
    if (c.kind === "task") tasksDone += 1;
    if (c.kind === "habit") habitsDone += 1;
    if (c.kind === "daily") dailiesDone += 1;
    byDay.set(c.day, (byDay.get(c.day) ?? 0) + c.xp);
    const t = new Date(c.created_at);
    if (t.getHours() < 8) earlyBird += 1;
    if (t.getHours() >= 22) nightOwl += 1;
    if (t.getTime() >= weekAgo) weekXp += c.xp;
  }

  const perfectDays = [...byDay.values()].filter((xp) => xp >= 60).length;

  return {
    level,
    totalXp: profile?.xp ?? 0,
    streak: profile?.streak ?? 0,
    bestStreak: profile?.best_streak ?? 0,
    tasksDone: tasksDone + dailiesDone,
    habitsDone,
    dailiesDone,
    studyMinutes: profile?.study_minutes ?? 0,
    perfectDays,
    weekXp,
    skillsMaxLevel: skills.reduce((m, s) => Math.max(m, skillLevelFromXp(s.xp)), 0),
    earlyBird,
    nightOwl,
  };
}

export function useCompleteTask() {
  const userId = useUserId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (task: Task) => {
      if (!userId) throw new Error("Non connecté");
      const day = todayISO();

      const { error: cErr } = await supabase.from("completions").insert({
        user_id: userId,
        task_id: task.id,
        kind: task.kind,
        title: task.title,
        skill_key: task.skill_key,
        xp: task.xp,
        minutes: task.minutes,
        day,
      });
      if (cErr) throw cErr;

      if (task.kind === "task") {
        await supabase.from("tasks").update({ done: true }).eq("id", task.id);
      } else {
        await supabase
          .from("tasks")
          .update({
            last_done_date: day,
            streak: task.last_done_date === previousDay(day) || !task.last_done_date ? task.streak + 1 : 1,
          })
          .eq("id", task.id);
      }

      // profile progression
      const { data: profileRow } = await supabase.from("profiles").select("*").eq("id", userId).single();
      const p = profileRow as unknown as Profile;
      const nextXp = p.xp + task.xp;
      const nextLevel = levelFromXp(nextXp).level;
      let streak = p.streak;
      if (p.last_active_date !== day) {
        streak = p.last_active_date === previousDay(day) ? p.streak + 1 : 1;
      }
      await supabase
        .from("profiles")
        .update({
          xp: nextXp,
          level: nextLevel,
          coins: p.coins + Math.round(task.xp / 5),
          streak,
          best_streak: Math.max(p.best_streak, streak),
          last_active_date: day,
          study_minutes: p.study_minutes + (task.minutes || 0),
          title: titleForLevel(nextLevel),
        })
        .eq("id", userId);

      // skill progression
      if (task.skill_key) {
        const { data: existing } = await supabase
          .from("user_skills")
          .select("*")
          .eq("skill_key", task.skill_key)
          .maybeSingle();
        const skillXp = ((existing as unknown as UserSkill)?.xp ?? 0) + task.xp;
        await supabase.from("user_skills").upsert(
          {
            user_id: userId,
            skill_key: task.skill_key,
            xp: skillXp,
            level: skillLevelFromXp(skillXp),
          },
          { onConflict: "user_id,skill_key" },
        );
      }

      return { levelUp: nextLevel > p.level, level: nextLevel, xp: task.xp };
    },
    onSuccess: async (res) => {
      toast.success(`+${res.xp} XP`, {
        description: res.levelUp ? `Niveau ${res.level} atteint !` : undefined,
      });
      await qc.invalidateQueries();
      await syncAchievements(userId, qc);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export async function syncAchievements(
  userId: string | null,
  qc: ReturnType<typeof useQueryClient>,
) {
  if (!userId) return;
  const [{ data: profileRow }, { data: completions }, { data: skills }, { data: owned }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("completions").select("*").limit(2000),
      supabase.from("user_skills").select("*"),
      supabase.from("user_achievements").select("achievement_key"),
    ]);

  const stats = buildStats(
    (profileRow ?? undefined) as unknown as Profile | undefined,
    (completions ?? []) as unknown as Completion[],
    (skills ?? []) as unknown as UserSkill[],
  );
  const ownedKeys = new Set((owned ?? []).map((a) => a.achievement_key));
  const newly = ACHIEVEMENTS.filter((a) => !ownedKeys.has(a.key) && a.check(stats));
  if (newly.length) {
    await supabase
      .from("user_achievements")
      .insert(newly.map((a) => ({ user_id: userId, achievement_key: a.key })));
    newly.forEach((a) => toast(`${a.icon} Succès débloqué`, { description: a.name }));
    await qc.invalidateQueries({ queryKey: ["achievements", userId] });
  }
}

export function previousDay(day: string) {
  const d = new Date(day + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useCreateTask() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Task>) => {
      if (!userId) throw new Error("Non connecté");
      const { error } = await supabase.from("tasks").insert({ ...input, user_id: userId } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ajouté à ton aventure");
      qc.invalidateQueries({ queryKey: ["tasks", userId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTask() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").update({ archived: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", userId] }),
  });
}

export function useUpdateProfile() {
  const userId = useUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      if (!userId) throw new Error("Non connecté");
      const { error } = await supabase.from("profiles").update(patch as never).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", userId] }),
    onError: (e: Error) => toast.error(e.message),
  });
}
