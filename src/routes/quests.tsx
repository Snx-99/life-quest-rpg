import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { buildStats, useAchievements, useCompletions, useProfile, useSkills } from "@/lib/db";
import { ACHIEVEMENTS, EPIC_QUESTS, pickDailyQuests, type StatsSnapshot } from "@/lib/game";

export const Route = createFileRoute("/quests")({
  head: () => ({
    meta: [
      { title: "Quêtes et succès — Life Quest" },
      { name: "description", content: "Grandes quêtes, quêtes journalières personnalisées et succès à débloquer." },
      { property: "og:title", content: "Quêtes et succès — Life Quest" },
      { property: "og:description", content: "Suis tes grandes quêtes et débloque des succès." },
    ],
  }),
  component: QuestsPage,
});

function QuestsPage() {
  const { data: profile } = useProfile();
  const { data: completions = [] } = useCompletions();
  const { data: skills = [] } = useSkills();
  const { data: owned = [] } = useAchievements();

  const stats = buildStats(profile, completions, skills);
  const ownedKeys = new Set(owned.map((a) => a.achievement_key));
  const daily = pickDailyQuests(profile?.interests ?? [], new Date().getDate());

  return (
    <AppShell title="Quêtes" subtitle="Objectifs du jour et grandes aventures">
      <h2 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Aujourd'hui</h2>
      <ul className="mb-6 space-y-2">
        {daily.map((q) => (
          <li key={q.key} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
            <span className="text-lg">{q.icon}</span>
            <span className="flex-1 text-sm">{q.label}</span>
            <span className="text-[11px] text-muted-foreground">+{q.xp} XP</span>
          </li>
        ))}
      </ul>

      <h2 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Grandes quêtes</h2>
      <ul className="mb-6 space-y-2">
        {EPIC_QUESTS.map((q) => {
          const value = Number(stats[q.metric as keyof StatsSnapshot] ?? 0);
          const pct = Math.min(100, Math.round((value / q.target) * 100));
          return (
            <li key={q.key} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="text-lg">{q.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{q.name}</p>
                  <p className="text-[11px] text-muted-foreground">{q.desc}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">+{q.reward} XP</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1 text-right text-[10px] text-muted-foreground">
                {Math.min(value, q.target)} / {q.target}
              </p>
            </li>
          );
        })}
      </ul>

      <h2 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
        Succès ({ownedKeys.size}/{ACHIEVEMENTS.length})
      </h2>
      <ul className="grid grid-cols-2 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const got = ownedKeys.has(a.key);
          return (
            <li
              key={a.key}
              className={`rounded-2xl border p-3 ${
                got ? "border-primary/50 bg-card" : "border-border bg-card/40 opacity-60"
              }`}
            >
              <div className="text-lg">{a.icon}</div>
              <p className="mt-1 text-xs font-medium">{a.name}</p>
              <p className="text-[10px] text-muted-foreground">{a.desc}</p>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
