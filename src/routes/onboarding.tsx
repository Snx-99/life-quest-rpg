import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { useProfile, useUpdateProfile } from "@/lib/db";
import { useSession, useUserId } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_AVATAR,
  HAIR_COLORS,
  INTERESTS,
  OUTFIT_COLORS,
  SKILL_PLACEHOLDER,
  SKIN_TONES,
  SKILLS,
  suggestSkills,
} from "@/lib/game";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Configuration du profil — Life Quest" },
      { name: "description", content: "Crée ton personnage, choisis tes centres d'intérêt et tes compétences de départ." },
      { property: "og:title", content: "Configuration du profil — Life Quest" },
      { property: "og:description", content: "Crée ton personnage et tes compétences de départ." },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const userId = useUserId();
  const { session, loading } = useSession();
  const { data: profile } = useProfile();
  const update = useUpdateProfile();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [avatar, setAvatar] = useState({ ...DEFAULT_AVATAR });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (profile) {
      setName((n) => n || profile.display_name || "");
      if (profile.onboarded) navigate({ to: "/" });
    }
  }, [profile, navigate]);

  const toggle = (key: string) =>
    setInterests((prev) => (prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]));

  const finish = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const keys = suggestSkills(interests);
      await supabase.from("user_skills").upsert(
        keys.map((k) => ({ user_id: userId, skill_key: k, xp: 0, level: 1 })),
        { onConflict: "user_id,skill_key" },
      );
      await update.mutateAsync({
        display_name: name.trim() || "Aventurier",
        interests,
        avatar,
        onboarded: true,
      });
      navigate({ to: "/" });
    } finally {
      setSaving(false);
    }
  };

  const suggested = suggestSkills(interests);

  return (
    <div className="mx-auto min-h-screen w-full max-w-md px-6 py-10">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Étape {step + 1} / 3</p>

      {step === 0 && (
        <section className="mt-4 space-y-5">
          <h1 className="text-2xl font-semibold">Comment on t'appelle ?</h1>
          <div className="space-y-2">
            <Label htmlFor="name">Nom d'aventurier</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ton prénom ou un pseudo"
              className="h-12 rounded-2xl bg-muted/50"
            />
          </div>
          <Button className="h-12 w-full rounded-2xl" onClick={() => setStep(1)}>
            Continuer
          </Button>
        </section>
      )}

      {step === 1 && (
        <section className="mt-4 space-y-5">
          <h1 className="text-2xl font-semibold">Tes centres d'intérêt</h1>
          <p className="text-sm text-muted-foreground">
            On en déduit tes compétences de départ et tes quêtes journalières.
          </p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button
                key={i.key}
                onClick={() => toggle(i.key)}
                className={`rounded-full border px-3 py-2 text-sm transition-colors ${
                  interests.includes(i.key)
                    ? "border-primary bg-secondary"
                    : "border-border bg-muted/40 text-muted-foreground"
                }`}
              >
                {i.icon} {i.label}
              </button>
            ))}
          </div>
          {interests.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm">
              <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                Compétences suggérées
              </p>
              <div className="flex flex-wrap gap-2">
                {suggested.map((k) => {
                  const s = SKILLS.find((x) => x.key === k);
                  return (
                    <span key={k} className="rounded-full bg-secondary px-3 py-1 text-xs">
                      {s?.icon} {s?.name ?? SKILL_PLACEHOLDER}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          <Button
            className="h-12 w-full rounded-2xl"
            disabled={interests.length === 0}
            onClick={() => setStep(2)}
          >
            Continuer
          </Button>
        </section>
      )}

      {step === 2 && (
        <section className="mt-4 space-y-5">
          <h1 className="text-2xl font-semibold">Ton personnage</h1>
          <div className="flex justify-center">
            <CharacterAvatar config={avatar} size={160} />
          </div>

          <Palette
            label="Peau"
            colors={SKIN_TONES}
            value={avatar.skin}
            onChange={(c) => setAvatar({ ...avatar, skin: c })}
          />
          <Palette
            label="Cheveux"
            colors={HAIR_COLORS}
            value={avatar.hairColor}
            onChange={(c) => setAvatar({ ...avatar, hairColor: c })}
          />
          <Palette
            label="Tenue"
            colors={OUTFIT_COLORS}
            value={avatar.outfitColor}
            onChange={(c) => setAvatar({ ...avatar, outfitColor: c })}
          />

          <div className="space-y-2">
            <Label>Coiffure</Label>
            <div className="flex flex-wrap gap-2">
              {["short", "buzz", "curly"].map((h) => (
                <button
                  key={h}
                  onClick={() => setAvatar({ ...avatar, hair: h })}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    avatar.hair === h ? "border-primary bg-secondary" : "border-border bg-muted/40"
                  }`}
                >
                  {h === "short" ? "Court" : h === "buzz" ? "Rasé" : "Bouclé"}
                </button>
              ))}
            </div>
          </div>

          <Button className="h-12 w-full rounded-2xl" onClick={finish} disabled={saving}>
            Commencer l'aventure
          </Button>
        </section>
      )}
    </div>
  );
}

function Palette({
  label,
  colors,
  value,
  onChange,
}: {
  label: string;
  colors: string[];
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            aria-label={`${label} ${c}`}
            onClick={() => onChange(c)}
            style={{ backgroundColor: c }}
            className={`h-9 w-9 rounded-full border-2 ${
              value === c ? "border-primary" : "border-transparent"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
