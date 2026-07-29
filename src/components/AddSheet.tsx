import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SKILLS, xpForDifficulty } from "@/lib/game";
import { useCreateTask } from "@/lib/db";

const KINDS = [
  { key: "task", label: "Tâche", hint: "Une action ponctuelle" },
  { key: "habit", label: "Habitude", hint: "À répéter régulièrement" },
  { key: "daily", label: "Quotidienne", hint: "Chaque jour" },
] as const;

const DIFFS = [
  { v: 1, label: "Facile" },
  { v: 2, label: "Moyen" },
  { v: 3, label: "Dur" },
  { v: 4, label: "Épique" },
];

export function AddSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: () => void;
}) {
  const [kind, setKind] = useState<"task" | "habit" | "daily">("task");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [skillKey, setSkillKey] = useState<string>("focus");
  const [minutes, setMinutes] = useState("");
  const create = useCreateTask();

  const submit = async () => {
    if (!title.trim()) return;
    await create.mutateAsync({
      title: title.trim(),
      kind,
      difficulty,
      xp: xpForDifficulty(difficulty),
      skill_key: skillKey || null,
      minutes: Number(minutes) || 0,
    });
    setTitle("");
    setMinutes("");
    setDifficulty(1);
    onOpenChange(false);
    onCreated?.();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-border bg-card">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-lg">Nouvelle entrée</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-5 px-4 pb-8">
          <div className="grid grid-cols-3 gap-2">
            {KINDS.map((k) => (
              <button
                key={k.key}
                type="button"
                onClick={() => setKind(k.key)}
                className={`rounded-2xl border p-3 text-left transition-colors ${
                  kind === k.key ? "border-primary bg-secondary" : "border-border bg-muted/40"
                }`}
              >
                <div className="text-sm font-medium">{k.label}</div>
                <div className="text-[11px] text-muted-foreground">{k.hint}</div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Intitulé</Label>
            <Input
              id="title"
              value={title}
              placeholder="Ex : Réviser 30 min de maths"
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-2xl bg-muted/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Difficulté</Label>
            <div className="grid grid-cols-4 gap-2">
              {DIFFS.map((d) => (
                <button
                  key={d.v}
                  type="button"
                  onClick={() => setDifficulty(d.v)}
                  className={`rounded-2xl border px-2 py-2 text-xs transition-colors ${
                    difficulty === d.v ? "border-primary bg-secondary" : "border-border bg-muted/40"
                  }`}
                >
                  {d.label}
                  <div className="text-[10px] text-muted-foreground">+{xpForDifficulty(d.v)} XP</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Compétence associée</Label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.slice(0, 12).map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSkillKey(s.key === skillKey ? "" : s.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    skillKey === s.key ? "border-primary bg-secondary" : "border-border bg-muted/40"
                  }`}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minutes">Temps prévu (min, optionnel)</Label>
            <Input
              id="minutes"
              inputMode="numeric"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ""))}
              placeholder="30"
              className="rounded-2xl bg-muted/50"
            />
          </div>

          <Button
            onClick={submit}
            disabled={!title.trim() || create.isPending}
            className="h-12 w-full rounded-2xl text-base"
          >
            Ajouter
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
