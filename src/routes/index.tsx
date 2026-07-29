import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle, Trash2, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/lib/session";
import { AppShell } from "@/components/AppShell";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCompleteTask,
  useDeleteTask,
  useProfile,
  useTasks,
  type Task,
} from "@/lib/db";
import { skillByKey, todayISO } from "@/lib/game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Life Quest — transforme ta vie en jeu vidéo" },
      {
        name: "description",
        content:
          "Habitudes, tâches et objectifs transformés en aventure RPG : personnage évolutif, compétences, quêtes et succès.",
      },
      { property: "og:title", content: "Life Quest — transforme ta vie en jeu vidéo" },
      {
        property: "og:description",
        content: "Gagne de l'XP, monte de niveau et fais évoluer ton personnage 2D chaque jour.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { session, loading } = useSession();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Chargement…
      </div>
    );
  }
  return session ? <Today /> : <Landing />;
}

/* ---------------- Landing + auth ---------------- */

function Landing() {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const emailAuth = async () => {
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Compte créé", { description: "Tu peux commencer l'aventure." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur d'authentification");
    } finally {
      setBusy(false);
    }
  };

  const googleAuth = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error("Connexion Google impossible");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-8 px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <CharacterAvatar size={150} className="animate-pop" config={{ background: "night", effect: "glow" }} />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">Life Quest</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tes habitudes, tâches et objectifs deviennent une aventure. Gagne de l'XP, monte de niveau,
          fais évoluer ton personnage.
        </p>
      </div>

      <div className="space-y-4 rounded-3xl border border-border bg-card p-5">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/50 p-1">
          {(["signup", "signin"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-xl py-2 text-sm transition-colors ${
                mode === m ? "bg-secondary text-foreground" : "text-muted-foreground"
              }`}
            >
              {m === "signup" ? "Créer un compte" : "Se connecter"}
            </button>
          ))}
        </div>

        <Button variant="secondary" onClick={googleAuth} className="h-12 w-full rounded-2xl">
          Continuer avec Google
        </Button>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> ou par e-mail <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-2xl bg-muted/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-2xl bg-muted/50"
            />
          </div>
          <Button
            onClick={emailAuth}
            disabled={busy || !email || password.length < 6}
            className="h-12 w-full rounded-2xl"
          >
            {mode === "signup" ? "Commencer l'aventure" : "Reprendre l'aventure"}
          </Button>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        {[
          ["🎮", "Personnage 2D évolutif"],
          ["🔥", "Séries et habitudes"],
          ["🧠", "Compétences à niveaux"],
          ["🏆", "Quêtes et succès"],
        ].map(([icon, label]) => (
          <li key={label} className="rounded-2xl border border-border bg-card px-3 py-3">
            <span className="mr-2">{icon}</span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Today ---------------- */

const TABS = [
  { key: "daily", label: "Quotidiennes" },
  { key: "habit", label: "Habitudes" },
  { key: "task", label: "Tâches" },
] as const;

function Today() {
  const [tab, setTab] = useState<"daily" | "habit" | "task">("daily");
  const { data: tasks = [], isLoading } = useTasks();
  const { data: profile } = useProfile();
  const complete = useCompleteTask();
  const remove = useDeleteTask();
  const today = todayISO();

  const list = useMemo(
    () => tasks.filter((t) => t.kind === tab && !(t.kind === "task" && t.done)),
    [tasks, tab],
  );
  const doneTasks = useMemo(() => tasks.filter((t) => t.kind === "task" && t.done), [tasks]);

  const isDone = (t: Task) => (t.kind === "task" ? t.done : t.last_done_date === today);

  return (
    <AppShell
      title={`Salut ${profile?.display_name ?? ""}`}
      subtitle={profile?.title ? `${profile.title} · ${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}` : undefined}
    >
      <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl bg-muted/40 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl py-2 text-xs transition-colors ${
              tab === t.key ? "bg-secondary text-foreground" : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}

      {!isLoading && list.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Rien ici pour l'instant. Appuie sur le bouton + pour ajouter ta première entrée.
        </div>
      )}

      <ul className="space-y-2">
        {list.map((t) => {
          const skill = skillByKey(t.skill_key);
          const done = isDone(t);
          return (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
            >
              <button
                onClick={() => !done && complete.mutate(t)}
                disabled={done || complete.isPending}
                aria-label="Terminer"
                className="shrink-0 text-primary disabled:opacity-40"
              >
                {done ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${done ? "text-muted-foreground line-through" : ""}`}>
                  {t.title}
                </p>
                <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>+{t.xp} XP</span>
                  {skill && <span>{skill.icon} {skill.name}</span>}
                  {t.kind !== "task" && t.streak > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Flame className="h-3 w-3 text-accent" />
                      {t.streak}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => remove.mutate(t.id)}
                aria-label="Supprimer"
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>

      {tab === "task" && doneTasks.length > 0 && (
        <>
          <h2 className="mb-2 mt-6 text-xs uppercase tracking-wide text-muted-foreground">
            Terminées
          </h2>
          <ul className="space-y-2 opacity-60">
            {doneTasks.slice(0, 12).map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm line-through"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="truncate">{t.title}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </AppShell>
  );
}
