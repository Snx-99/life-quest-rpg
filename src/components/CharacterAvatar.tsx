import type { AvatarConfig } from "@/lib/game";
import { DEFAULT_AVATAR } from "@/lib/game";

type Props = {
  config?: Partial<AvatarConfig> | null;
  size?: number;
  auraColor?: string | null;
  className?: string;
};

export function CharacterAvatar({ config, size = 180, auraColor, className }: Props) {
  const a: AvatarConfig = { ...DEFAULT_AVATAR, ...(config ?? {}) };

  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={(size * 140) / 120}
      className={className}
      role="img"
      aria-label="Personnage Life Quest"
    >
      <defs>
        <clipPath id="lq-frame">
          <rect x="0" y="0" width="120" height="140" rx="18" />
        </clipPath>
        <radialGradient id="lq-aura">
          <stop offset="0%" stopColor={auraColor ?? "var(--primary)"} stopOpacity="0.5" />
          <stop offset="100%" stopColor={auraColor ?? "var(--primary)"} stopOpacity="0" />
        </radialGradient>
      </defs>

      <g clipPath="url(#lq-frame)">
        <Background kind={a.background} />
        {a.effect === "glow" && <circle cx="60" cy="72" r="52" fill="url(#lq-aura)" />}
        {a.effect === "storm" && (
          <g opacity="0.55">
            <circle cx="60" cy="72" r="56" fill="url(#lq-aura)" />
            <path d="M52 30 l8 14 -6 2 8 14" stroke="var(--accent)" strokeWidth="2" fill="none" />
          </g>
        )}

        {/* body */}
        <g className={a.effect === "sparks" ? "animate-float" : undefined}>
          <Outfit kind={a.outfit} color={a.outfitColor} />
          {/* arms + head */}
          <circle cx="34" cy="98" r="6" fill={a.skin} />
          <circle cx="86" cy="98" r="6" fill={a.skin} />
          <rect x="49" y="58" width="22" height="12" rx="6" fill={a.skin} />
          <circle cx="60" cy="44" r="22" fill={a.skin} />
          {/* face */}
          <circle cx="52" cy="43" r="2.4" fill="#22222a" />
          <circle cx="68" cy="43" r="2.4" fill="#22222a" />
          <path d="M53 52 q7 6 14 0" stroke="#22222a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <Hair kind={a.hair} color={a.hairColor} />
          <Accessory kind={a.accessory} />
        </g>

        <Pet kind={a.pet} />

        {a.effect === "sparks" && (
          <g fill="var(--accent)">
            <circle cx="26" cy="52" r="2" className="animate-float" />
            <circle cx="96" cy="66" r="1.6" className="animate-float" />
            <circle cx="88" cy="34" r="1.4" className="animate-float" />
          </g>
        )}
        {a.effect === "orbit" && (
          <g className="animate-orbit" style={{ transformOrigin: "60px 72px" }}>
            <circle cx="60" cy="18" r="4" fill="var(--primary)" />
          </g>
        )}
      </g>
      <rect x="0.5" y="0.5" width="119" height="139" rx="18" fill="none" stroke="var(--border)" />
    </svg>
  );
}

function Background({ kind }: { kind: string }) {
  switch (kind) {
    case "night":
      return (
        <g>
          <rect width="120" height="140" fill="#1b2030" />
          <circle cx="90" cy="26" r="10" fill="#e8e2cf" opacity="0.55" />
          {[
            [20, 20],
            [40, 40],
            [100, 60],
            [30, 70],
            [72, 18],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.2" fill="#fff" opacity="0.6" />
          ))}
        </g>
      );
    case "forest":
      return (
        <g>
          <rect width="120" height="140" fill="#1e2822" />
          <path d="M10 120 l14 -40 14 40z M84 120 l14 -44 14 44z" fill="#2b3a30" />
          <rect y="118" width="120" height="22" fill="#26332b" />
        </g>
      );
    case "desk":
      return (
        <g>
          <rect width="120" height="140" fill="#232028" />
          <rect x="8" y="34" width="34" height="24" rx="3" fill="#2f2b36" />
          <rect x="82" y="44" width="26" height="14" rx="3" fill="#2f2b36" />
          <rect y="112" width="120" height="28" fill="#2b2733" />
        </g>
      );
    case "summit":
      return (
        <g>
          <rect width="120" height="140" fill="#20242d" />
          <path d="M0 120 l38 -58 26 34 20 -22 36 46z" fill="#2c313c" />
          <circle cx="26" cy="28" r="12" fill="#3a3f4c" opacity="0.7" />
        </g>
      );
    case "void":
      return (
        <g>
          <rect width="120" height="140" fill="#14121c" />
          <circle cx="60" cy="70" r="46" fill="none" stroke="#3a3350" strokeWidth="1" />
          <circle cx="60" cy="70" r="30" fill="none" stroke="#463c60" strokeWidth="1" />
        </g>
      );
    default:
      return <rect width="120" height="140" fill="var(--elevated)" />;
  }
}

function Hair({ kind, color }: { kind: string; color: string }) {
  switch (kind) {
    case "buzz":
      return <path d="M38 40 a22 22 0 0 1 44 0 a30 12 0 0 0 -44 0z" fill={color} opacity="0.85" />;
    case "curly":
      return (
        <g fill={color}>
          <circle cx="44" cy="30" r="9" />
          <circle cx="58" cy="24" r="10" />
          <circle cx="73" cy="30" r="9" />
        </g>
      );
    case "long":
      return (
        <g fill={color}>
          <path d="M38 42 a22 22 0 0 1 44 0 v34 h-8 V44 a14 14 0 0 0 -28 0 v32 h-8z" />
        </g>
      );
    case "bun":
      return (
        <g fill={color}>
          <circle cx="60" cy="16" r="8" />
          <path d="M38 42 a22 22 0 0 1 44 0 a30 14 0 0 0 -44 0z" />
        </g>
      );
    case "mohawk":
      return <path d="M56 12 h8 v24 h-8z" fill={color} />;
    case "flame":
      return (
        <g fill={color}>
          <path d="M46 30 q4 -20 14 -22 q2 12 8 14 q4 -6 8 -2 q2 12 -6 18z" />
        </g>
      );
    default:
      return <path d="M38 42 a22 22 0 0 1 44 0 a34 16 0 0 0 -44 -4z" fill={color} />;
  }
}

function Outfit({ kind, color }: { kind: string; color: string }) {
  const base = <path d="M36 132 v-38 a24 24 0 0 1 48 0 v38z" fill={color} />;
  switch (kind) {
    case "hoodie":
      return (
        <g>
          {base}
          <path d="M48 94 h24 v10 h-24z" fill="#00000033" />
          <path d="M58 94 v18 M62 94 v18" stroke="#ffffff33" strokeWidth="2" />
        </g>
      );
    case "sport":
      return (
        <g>
          {base}
          <path d="M36 108 h48" stroke="var(--primary)" strokeWidth="4" />
        </g>
      );
    case "suit":
      return (
        <g>
          {base}
          <path d="M60 94 l-10 38 h20z" fill="#1f1f26" />
          <path d="M58 94 h4 l-2 10z" fill="var(--accent)" />
        </g>
      );
    case "armor":
      return (
        <g>
          {base}
          <path d="M36 104 h48 v6 h-48z" fill="#8f96a3" opacity="0.5" />
          <circle cx="60" cy="98" r="5" fill="var(--gold)" opacity="0.8" />
        </g>
      );
    case "cloak":
      return (
        <g>
          <path d="M28 134 q10 -46 32 -46 q22 0 32 46z" fill="#1c1c26" />
          {base}
        </g>
      );
    default:
      return base;
  }
}

function Accessory({ kind }: { kind: string }) {
  switch (kind) {
    case "glasses":
      return (
        <g stroke="#22222a" strokeWidth="1.8" fill="none">
          <circle cx="52" cy="43" r="6" />
          <circle cx="68" cy="43" r="6" />
          <path d="M58 43 h4" />
        </g>
      );
    case "headphones":
      return (
        <g fill="#2f2f3a">
          <path d="M38 42 a22 22 0 0 1 44 0" fill="none" stroke="#2f2f3a" strokeWidth="4" />
          <rect x="33" y="38" width="8" height="14" rx="4" />
          <rect x="79" y="38" width="8" height="14" rx="4" />
        </g>
      );
    case "cap":
      return (
        <g fill="var(--primary)">
          <path d="M38 38 a22 20 0 0 1 44 0z" />
          <rect x="76" y="36" width="16" height="5" rx="2.5" />
        </g>
      );
    case "crown":
      return <path d="M46 24 l6 8 8 -12 8 12 6 -8 -2 12 h-24z" fill="var(--gold)" />;
    default:
      return null;
  }
}

function Pet({ kind }: { kind: string }) {
  if (kind === "none" || !kind) return null;
  const map: Record<string, string> = { cat: "🐱", dog: "🐶", owl: "🦉", dragon: "🐲" };
  return (
    <text x="98" y="128" fontSize="18" textAnchor="middle" className="animate-float">
      {map[kind] ?? "🐾"}
    </text>
  );
}
