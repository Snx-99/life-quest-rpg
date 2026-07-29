import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useProfile, useSkills } from "@/lib/db";
import { SKILLS, levelFromXp, skillLevelFromXp, skillProgress } from "@/lib/game";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Compétences — Life Quest" },
      { name: "description", content: "Fais évoluer tes compétences, chacune avec son propre niveau, et débloque-en de nouvelles." },
      { property: "og:title", content: "Compétences — Life Quest" },
      { property: "og:description", content: "Chaque compétence a son niveau et influence ton personnage." },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  const { data: profile } = useProfile();
  const { data: mine = [] } = useSkills();
  const level = levelFromXp(profile?.xp ?? 0).level;
  const owned = new Map(mine.map((s) => [s.skill_key, s]));

  const unlocked = SKILLS.filter((s) => owned.has(s.key) || s.unlockLevel <= level);
  const locked = SKILLS.filter((s) => !owned.has(s.key) && s.unlockLevel > level);

  return (
    <AppShell title="Compétences" subtitle="Chaque action nourrit une compétence">
      <ul className="space-y-2">
        {unlocked.map((s) => {
          const xp = owned.get(s.key)?.xp ?? 0;
          return (
            <li key={s.key} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{s.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.description}</p>
                </div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-primary">
                  Nv. {skillLevelFromXp(xp)}
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${skillProgress(xp)}%` }} />
              </div>
            </li>
          );
        })}
      </ul>

      {locked.length > 0 && (
        <>
          <h2 className="mb-2 mt-6 text-xs uppercase tracking-wide text-muted-foreground">
            À débloquer
          </h2>
          <ul className="space-y-2">
            {locked.map((s) => (
              <li
                key={s.key}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card/40 px-4 py-3 opacity-60"
              >
                <span className="text-xl grayscale">{s.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.description}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">Nv. {s.unlockLevel}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
}
