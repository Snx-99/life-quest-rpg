import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Flame, Coins } from "lucide-react";
import { Dock } from "@/components/Dock";
import { useSession } from "@/lib/session";
import { useProfile } from "@/lib/db";
import { levelFromXp } from "@/lib/game";

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (profile && !profile.onboarded) navigate({ to: "/onboarding" });
  }, [profile, navigate]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const theme = profile?.theme ?? "slate";
    document.documentElement.className = theme === "slate" ? "" : `theme-${theme}`;
  }, [profile?.theme]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Chargement…
      </div>
    );
  }

  const prog = levelFromXp(profile?.xp ?? 0);

  return (
    <div className="min-h-screen pb-32">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl">
        <div className="mx-auto w-full max-w-xl">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-accent" />
                {profile?.streak ?? 0} j
              </span>
              <span className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-gold" />
                {profile?.coins ?? 0}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-primary">
              Nv. {prog.level}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.round((prog.current / prog.needed) * 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground">
              {prog.current}/{prog.needed}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-5 py-5">{children}</main>
      <Dock />
    </div>
  );
}
