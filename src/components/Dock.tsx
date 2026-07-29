import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home, Swords, Sparkles, User, Plus } from "lucide-react";
import { useState } from "react";
import { AddSheet } from "@/components/AddSheet";

const items = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/quests", label: "Quêtes", icon: Swords },
  { to: "/skills", label: "Compétences", icon: Sparkles },
  { to: "/profile", label: "Profil", icon: User },
] as const;

export function Dock() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const left = items.slice(0, 2);
  const right = items.slice(2);

  return (
    <>
      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex items-end gap-1 rounded-[2rem] border border-border/70 bg-card/85 px-3 py-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {left.map((i) => (
            <DockItem key={i.to} {...i} active={pathname === i.to} />
          ))}

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ajouter"
            className="mx-1 -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-90"
          >
            <Plus className="h-7 w-7" />
          </button>

          {right.map((i) => (
            <DockItem key={i.to} {...i} active={pathname === i.to} />
          ))}
        </div>
      </nav>

      <AddSheet open={open} onOpenChange={setOpen} onCreated={() => navigate({ to: "/" })} />
    </>
  );
}

function DockItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex w-16 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[10px] transition-colors ${
        active ? "bg-secondary text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="leading-none">{label}</span>
    </Link>
  );
}
