import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  buildStats,
  useAchievements,
  useCompletions,
  useIsAdmin,
  useProfile,
  useSkills,
  useUpdateProfile,
} from "@/lib/db";
import {
  APP_THEMES,
  COSMETICS,
  DEFAULT_AVATAR,
  HAIR_COLORS,
  OUTFIT_COLORS,
  SKIN_TONES,
  levelFromXp,
  skillLevelFromXp,
  SKILLS,
  type CosmeticSlot,
} from "@/lib/game";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profil et statistiques — Life Quest" },
      { name: "description", content: "Niveau, série, tâches terminées, XP hebdomadaire, temps d'étude et personnalisation du personnage." },
      { property: "og:title", content: "Profil et statistiques — Life Quest" },
      { property: "og:description", content: "Toutes tes statistiques de joueur au même endroit." },
    ],
  }),
  component: ProfilePage,
});

const SLOT_LABELS: Record<CosmeticSlot, string> = {
  hair: "Coiffure",
  outfit: "Tenue",
  accessory: "Accessoire",
  pet: "Compagnon",
  background: "Fond",
  effect: "Effet",
};

function ProfilePage() {
  const { data: profile } = useProfile();
  const { data: completions = [] } = useCompletions();
  const { data: skills = [] } = useSkills();
  const { data: achievements = [] } = useAchievements();
  const { data: isAdmin } = useIsAdmin();
  const update = useUpdateProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const stats = buildStats(profile, completions, skills);
  const level = levelFromXp(profile?.xp ?? 0).level;
  const avatar = { ...DEFAULT_AVATAR, ...(profile?.avatar ?? {}) };
  const topSkill = [...skills].sort((a, b) => b.xp - a.xp)[0];

  // last 6 months of XP
  const months: { label: string; xp: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    months.push({
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
      xp: completions.filter((c) => c.day.startsWith(key)).reduce((s, c) => s + c.xp, 0),
    });
  }

  const byDay = new Map<string, number>();
  completions.forEach((c) => byDay.set(c.day, (byDay.get(c.day) ?? 0) + c.xp));
  const bestDay = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];

  const setAvatarPart = (patch: Record<string, string>) =>
    update.mutate({ avatar: { ...avatar, ...patch } });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <AppShell title="Profil" subtitle={profile?.title}>
      <div className="flex flex-col items-center rounded-3xl border border-border bg-card p-5">
        <CharacterAvatar
          config={avatar}
          size={150}
          auraColor={topSkill ? `var(--${SKILLS.find((s) => s.key === topSkill.skill_key)?.color ?? "primary"})` : null}
        />
        <p className="mt-3 text-lg font-medium">{profile?.display_name}</p>
        <p className="text-xs text-muted-foreground">
          Niveau {level} · {profile?.email}
        </p>
        {topSkill && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            Compétence dominante :{" "}
            {SKILLS.find((s) => s.key === topSkill.skill_key)?.name} (nv.{" "}
            {skillLevelFromXp(topSkill.xp)}) — elle colore ton aura
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat label="Série actuelle" value={`${stats.streak} jours`} />
        <Stat label="Meilleure série" value={`${stats.bestStreak} jours`} />
        <Stat label="Tâches terminées" value={stats.tasksDone} />
        <Stat label="Habitudes réalisées" value={stats.habitsDone} />
        <Stat label="XP cette semaine" value={stats.weekXp} />
        <Stat label="Temps de travail" value={`${Math.round(stats.studyMinutes / 60)} h`} />
        <Stat label="Journées parfaites" value={stats.perfectDays} />
        <Stat
          label="Meilleure journée"
          value={bestDay ? `${bestDay[1]} XP` : "—"}
          hint={bestDay ? new Date(bestDay[0]).toLocaleDateString("fr-FR") : undefined}
        />
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-card p-4">
        <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
          XP des 6 derniers mois
        </p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={30} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="xp" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-card p-4">
        <p className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
          Personnalisation ({achievements.length} succès débloqués)
        </p>

        <ColorRow label="Peau" colors={SKIN_TONES} value={avatar.skin} onPick={(c) => setAvatarPart({ skin: c })} />
        <ColorRow label="Cheveux" colors={HAIR_COLORS} value={avatar.hairColor} onPick={(c) => setAvatarPart({ hairColor: c })} />
        <ColorRow label="Tenue" colors={OUTFIT_COLORS} value={avatar.outfitColor} onPick={(c) => setAvatarPart({ outfitColor: c })} />

        {(Object.keys(SLOT_LABELS) as CosmeticSlot[]).map((slot) => (
          <div key={slot} className="mt-4">
            <p className="mb-2 text-xs text-muted-foreground">{SLOT_LABELS[slot]}</p>
            <div className="flex flex-wrap gap-2">
              {COSMETICS.filter((c) => c.slot === slot).map((c) => {
                const locked = level < c.level;
                const active = (avatar as Record<string, string>)[
                  slot === "hair" ? "hair" : slot
                ] === c.key;
                return (
                  <button
                    key={slot + c.key}
                    disabled={locked}
                    onClick={() => setAvatarPart({ [slot]: c.key })}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      active ? "border-primary bg-secondary" : "border-border bg-muted/40"
                    } ${locked ? "opacity-40" : ""}`}
                  >
                    {c.label}
                    {locked && <span className="ml-1 text-[10px]">🔒 nv.{c.level}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-4">
          <p className="mb-2 text-xs text-muted-foreground">Thème de l'app</p>
          <div className="flex flex-wrap gap-2">
            {APP_THEMES.map((t) => {
              const locked = level < t.level;
              return (
                <button
                  key={t.key}
                  disabled={locked}
                  onClick={() => update.mutate({ theme: t.key })}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    profile?.theme === t.key ? "border-primary bg-secondary" : "border-border bg-muted/40"
                  } ${locked ? "opacity-40" : ""}`}
                >
                  {t.label}
                  {locked && <span className="ml-1 text-[10px]">🔒 nv.{t.level}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isAdmin && (
        <Link
          to="/admin"
          className="mt-4 flex items-center justify-between rounded-2xl border border-primary/50 bg-card px-4 py-3 text-sm"
        >
          Espace administrateur <span>→</span>
        </Link>
      )}

      <Button variant="secondary" onClick={signOut} className="mt-4 h-12 w-full rounded-2xl">
        Se déconnecter
      </Button>
    </AppShell>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ColorRow({
  label,
  colors,
  value,
  onPick,
}: {
  label: string;
  colors: string[];
  value: string;
  onPick: (c: string) => void;
}) {
  return (
    <div className="mt-3">
      <p className="mb-2 text-xs text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            aria-label={`${label} ${c}`}
            onClick={() => onPick(c)}
            style={{ backgroundColor: c }}
            className={`h-8 w-8 rounded-full border-2 ${value === c ? "border-primary" : "border-transparent"}`}
          />
        ))}
      </div>
    </div>
  );
}
