import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getAdminOverview,
  renameAllUsers,
  renameUser,
  resetProgress,
  setUnlockAll,
  undoRenameAll,
  undoReset,
} from "@/lib/admin.functions";

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
  const qc = useQueryClient();
  const fetchOverview = useServerFn(getAdminOverview);
  const unlockAllFn = useServerFn(setUnlockAll);
  const renameFn = useServerFn(renameUser);
  const renameAllFn = useServerFn(renameAllUsers);
  const undoRenameFn = useServerFn(undoRenameAll);
  const resetFn = useServerFn(resetProgress);
  const undoResetFn = useServerFn(undoReset);

  const [pattern, setPattern] = useState("Aventurier {n}");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
  });

  const run = useMutation({
    mutationFn: async (action: () => Promise<{ count?: number }>) => action(),
    onSuccess: async (res) => {
      toast.success(res?.count !== undefined ? `${res.count} compte(s) mis à jour` : "Fait");
      await qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const busy = run.isPending;

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

          <section className="mt-6 rounded-3xl border border-border bg-card p-4">
            <h2 className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
              Actions globales
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                disabled={busy}
                className="h-11 rounded-2xl"
                onClick={() => run.mutate(() => unlockAllFn({ data: { value: true } }))}
              >
                Tout débloquer
              </Button>
              <Button
                variant="secondary"
                disabled={busy}
                className="h-11 rounded-2xl"
                onClick={() => run.mutate(() => unlockAllFn({ data: { value: false } }))}
              >
                Tout reverrouiller
              </Button>
              <Button
                variant="destructive"
                disabled={busy}
                className="h-11 rounded-2xl"
                onClick={() => {
                  if (confirm("Réinitialiser la progression de tous les comptes ?"))
                    run.mutate(() => resetFn({ data: {} }));
                }}
              >
                Tout réinitialiser
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                className="h-11 rounded-2xl"
                onClick={() => run.mutate(() => undoResetFn({ data: {} }))}
              >
                Annuler la réinit.
              </Button>
            </div>

            <p className="mb-2 mt-4 text-[11px] text-muted-foreground">
              Renommer tous les utilisateurs ({"{n}"} = numéro)
            </p>
            <div className="flex gap-2">
              <Input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="h-11 rounded-2xl"
              />
              <Button
                disabled={busy}
                className="h-11 rounded-2xl"
                onClick={() => run.mutate(() => renameAllFn({ data: { pattern } }))}
              >
                Appliquer
              </Button>
            </div>
            <Button
              variant="outline"
              disabled={busy}
              className="mt-2 h-11 w-full rounded-2xl"
              onClick={() => run.mutate(() => undoRenameFn({}))}
            >
              Annuler le renommage
            </Button>
          </section>

          <h2 className="mb-2 mt-6 text-xs uppercase tracking-wide text-muted-foreground">
            Comptes créés
          </h2>
          <ul className="space-y-2">
            {data.users.map((u) => (
              <li key={u.id} className="rounded-2xl border border-border bg-card px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{u.display_name ?? "Sans nom"}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Nv.{u.level} · {u.xp} XP · 🔥{u.streak}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <MiniButton
                    onClick={() => {
                      setEditing(editing === u.id ? null : u.id);
                      setEditName(u.display_name ?? "");
                    }}
                  >
                    Renommer
                  </MiniButton>
                  <MiniButton
                    onClick={() => run.mutate(() => unlockAllFn({ data: { userId: u.id, value: true } }))}
                  >
                    Débloquer
                  </MiniButton>
                  <MiniButton
                    onClick={() => run.mutate(() => unlockAllFn({ data: { userId: u.id, value: false } }))}
                  >
                    Reverrouiller
                  </MiniButton>
                  <MiniButton
                    onClick={() => run.mutate(() => resetFn({ data: { userId: u.id } }))}
                  >
                    Réinitialiser
                  </MiniButton>
                  <MiniButton
                    onClick={() => run.mutate(() => undoResetFn({ data: { userId: u.id } }))}
                  >
                    Annuler
                  </MiniButton>
                </div>

                {editing === u.id && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-10 rounded-2xl"
                    />
                    <Button
                      disabled={busy}
                      className="h-10 rounded-2xl"
                      onClick={() =>
                        run.mutate(async () => {
                          await renameFn({ data: { userId: u.id, name: editName } });
                          setEditing(null);
                          return {};
                        })
                      }
                    >
                      OK
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
}

function MiniButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] transition-colors hover:bg-secondary"
    >
      {children}
    </button>
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
