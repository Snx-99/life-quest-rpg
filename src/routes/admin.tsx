import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { getAdminOverview } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration — Life Quest" },
      { name: "description", content: "Statistiques de l'application, comptes créés et export des données." },
      { property: "og:title", content: "Administration — Life Quest" },
      { property: "og:description", content: "Tableau de bord administrateur de Life Quest." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
  });

  const download = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `life-quest-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell title="Administration" subtitle="Vue d'ensemble de Life Quest">
      {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {error && <p className="text-sm text-destructive">Accès refusé ou erreur de chargement.</p>}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Cell label="Comptes" value={data.totals.users} />
            <Cell label="Profils complétés" value={data.totals.onboarded} />
            <Cell label="Actifs aujourd'hui" value={data.totals.activeToday} />
            <Cell label="Tâches créées" value={data.totals.tasks} />
            <Cell label="Complétions" value={data.totals.completions} />
            <Cell label="XP distribuée" value={data.totals.xp} />
          </div>

          <Button onClick={download} className="mt-4 h-12 w-full rounded-2xl">
            Télécharger l'export des données
          </Button>

          <h2 className="mb-2 mt-6 text-xs uppercase tracking-wide text-muted-foreground">
            Comptes créés
          </h2>
          <ul className="space-y-2">
            {data.users.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{u.display_name ?? "Sans nom"}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Nv.{u.level} · {u.xp} XP · 🔥{u.streak}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
}

function Cell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
