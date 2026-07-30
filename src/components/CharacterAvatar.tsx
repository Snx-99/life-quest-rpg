import type { AvatarConfig } from "@/lib/game";
import { DEFAULT_AVATAR } from "@/lib/game";

type Props = {
  config?: Partial<AvatarConfig> | null;
  size?: number;
  auraColor?: string | null;
  className?: string;
};

/** Darken a color by mixing it with black (works with hex + css colors). */
const dark = (c: string, pct = 70) => `color-mix(in srgb, ${c} ${pct}%, #000)`;
/** Lighten a color by mixing it with white. */
const light = (c: string, pct = 82) => `color-mix(in srgb, ${c} ${pct}%, #fff)`;

const OUTLINE = "#17161d";

function P({ x, y, w = 1, h = 1, fill }: { x: number; y: number; w?: number; h?: number; fill: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={fill} />;
}

/**
 * Pixel-art character sprite (Pokémon gen-5 inspired).
 * Grid is 36 x 42 "pixels", rendered with crisp edges so it scales cleanly.
 */
export function CharacterAvatar({ config, size = 180, auraColor, className }: Props) {
  const a: AvatarConfig = { ...DEFAULT_AVATAR, ...(config ?? {}) };
  const skin = a.skin;
  const skinShade = dark(skin, 80);
  const skinLight = light(skin, 88);

  return (
    <svg
      viewBox="0 0 36 42"
      width={size}
      height={(size * 42) / 36}
      className={className}
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
      role="img"
      aria-label="Personnage Life Quest"
    >
      <defs>
        <clipPath id="lq-frame">
          <rect x="0" y="0" width="36" height="42" rx="5" />
        </clipPath>
        <radialGradient id="lq-aura">
          <stop offset="0%" stopColor={auraColor ?? "var(--primary)"} stopOpacity="0.45" />
          <stop offset="100%" stopColor={auraColor ?? "var(--primary)"} stopOpacity="0" />
        </radialGradient>
      </defs>

      <g clipPath="url(#lq-frame)">
        <Background kind={a.background} />

        {a.effect === "glow" && <circle cx="18" cy="22" r="17" fill="url(#lq-aura)" />}
        {a.effect === "storm" && (
          <g>
            <circle cx="18" cy="22" r="18" fill="url(#lq-aura)" />
            <g fill="var(--accent)" opacity="0.85">
              <P x={13} y={4} w={2} h={2} />
              <P x={14} y={6} w={2} h={2} />
              <P x={12} y={8} w={3} h={1} />
              <P x={24} y={9} w={2} h={2} />
            </g>
          </g>
        )}

        {/* ground shadow */}
        <g fill="#00000055">
          <P x={11} y={39} w={14} h={1} />
          <P x={13} y={40} w={10} h={1} />
        </g>

        <g className={a.effect === "sparks" ? "animate-float" : undefined}>
          {a.outfit === "cloak" && <CloakBack color={a.outfitColor} />}

          {/* legs */}
          <P x={14} y={33} w={3} h={5} fill={dark(a.outfitColor, 55)} />
          <P x={19} y={33} w={3} h={5} fill={dark(a.outfitColor, 45)} />
          <P x={13} y={38} w={4} h={2} fill="#2b2933" />
          <P x={19} y={38} w={4} h={2} fill="#232129" />

          {/* torso */}
          <Outfit kind={a.outfit} color={a.outfitColor} />

          {/* arms */}
          <P x={10} y={23} w={3} h={7} fill={dark(a.outfitColor, 88)} />
          <P x={23} y={23} w={3} h={7} fill={dark(a.outfitColor, 68)} />
          <P x={10} y={30} w={3} h={3} fill={skin} />
          <P x={23} y={30} w={3} h={3} fill={skinShade} />

          {/* neck */}
          <P x={16} y={19} w={4} h={3} fill={skinShade} />

          {/* head */}
          <P x={12} y={7} w={12} h={13} fill={skin} />
          <P x={11} y={9} w={1} h={9} fill={skin} />
          <P x={24} y={9} w={1} h={9} fill={skinShade} />
          <P x={21} y={7} w={3} h={13} fill={skinShade} />
          <P x={12} y={8} w={3} h={3} fill={skinLight} />
          {/* jaw outline */}
          <g fill={OUTLINE}>
            <P x={12} y={20} w={12} h={1} />
            <P x={11} y={8} w={1} h={1} />
            <P x={24} y={8} w={1} h={1} />
          </g>

          {/* eyes */}
          <g fill={OUTLINE}>
            <P x={14} y={13} w={2} h={3} />
            <P x={20} y={13} w={2} h={3} />
          </g>
          <g fill="#ffffff">
            <P x={14} y={13} w={1} h={1} />
            <P x={20} y={13} w={1} h={1} />
          </g>
          {/* blush + mouth */}
          <P x={13} y={17} w={2} h={1} fill={dark(skin, 78)} />
          <P x={21} y={17} w={2} h={1} fill={dark(skin, 78)} />
          <P x={17} y={17} w={2} h={1} fill={dark(skin, 55)} />

          <Hair kind={a.hair} color={a.hairColor} />
          <Accessory kind={a.accessory} />
        </g>

        <Pet kind={a.pet} />

        {a.effect === "sparks" && (
          <g fill="var(--accent)">
            <P x={7} y={14} w={2} h={2} />
            <P x={28} y={20} w={2} h={2} />
            <P x={26} y={9} w={1} h={1} />
          </g>
        )}
        {a.effect === "orbit" && (
          <g className="animate-orbit" style={{ transformOrigin: "18px 22px" }}>
            <P x={16} y={2} w={3} h={3} fill="var(--primary)" />
          </g>
        )}
      </g>
      <rect x="0.5" y="0.5" width="35" height="41" rx="5" fill="none" stroke="var(--border)" strokeWidth="0.5" />
    </svg>
  );
}

function Background({ kind }: { kind: string }) {
  switch (kind) {
    case "night":
      return (
        <g>
          <P x={0} y={0} w={36} h={42} fill="#1b2030" />
          <P x={25} y={5} w={5} h={5} fill="#e8e2cf" />
          <P x={26} y={4} w={3} h={1} fill="#e8e2cf" />
          <P x={26} y={10} w={3} h={1} fill="#e8e2cf" />
          {[
            [5, 5],
            [11, 11],
            [30, 17],
            [8, 20],
            [21, 4],
          ].map(([x, y], i) => (
            <P key={i} x={x} y={y} fill="#ffffffaa" />
          ))}
          <P x={0} y={35} w={36} h={7} fill="#232a3b" />
        </g>
      );
    case "forest":
      return (
        <g>
          <P x={0} y={0} w={36} h={42} fill="#1e2822" />
          <g fill="#2b3a30">
            <P x={4} y={20} w={6} h={2} />
            <P x={5} y={16} w={4} h={4} />
            <P x={6} y={13} w={2} h={3} />
            <P x={27} y={22} w={6} h={2} />
            <P x={28} y={17} w={4} h={5} />
            <P x={29} y={14} w={2} h={3} />
          </g>
          <P x={0} y={34} w={36} h={8} fill="#26332b" />
        </g>
      );
    case "desk":
      return (
        <g>
          <P x={0} y={0} w={36} h={42} fill="#232028" />
          <P x={3} y={9} w={11} h={8} fill="#2f2b36" />
          <P x={4} y={10} w={9} h={6} fill="#3a3646" />
          <P x={24} y={13} w={8} h={5} fill="#2f2b36" />
          <P x={0} y={33} w={36} h={9} fill="#2b2733" />
        </g>
      );
    case "summit":
      return (
        <g>
          <P x={0} y={0} w={36} h={42} fill="#20242d" />
          <P x={7} y={6} w={4} h={4} fill="#3a3f4c" />
          <g fill="#2c313c">
            <P x={0} y={30} w={36} h={12} />
            <P x={6} y={26} w={10} h={4} />
            <P x={9} y={22} w={5} h={4} />
            <P x={22} y={27} w={10} h={3} />
          </g>
          <P x={10} y={22} w={3} h={2} fill="#4b5160" />
        </g>
      );
    case "void":
      return (
        <g>
          <P x={0} y={0} w={36} h={42} fill="#14121c" />
          <g fill="#3a3350">
            <P x={4} y={21} w={28} h={1} />
            <P x={18} y={4} w={1} h={34} />
          </g>
          <g fill="#463c60">
            <P x={9} y={12} w={18} h={1} />
            <P x={9} y={30} w={18} h={1} />
          </g>
        </g>
      );
    default:
      return (
        <g>
          <P x={0} y={0} w={36} h={42} fill="var(--elevated)" />
          <P x={0} y={34} w={36} h={8} fill="var(--muted)" />
        </g>
      );
  }
}

function Hair({ kind, color }: { kind: string; color: string }) {
  const s = dark(color, 75);
  switch (kind) {
    case "buzz":
      return (
        <g>
          <P x={12} y={6} w={12} h={2} fill={color} />
          <P x={11} y={8} w={1} h={2} fill={s} />
          <P x={24} y={8} w={1} h={2} fill={s} />
        </g>
      );
    case "curly":
      return (
        <g>
          <P x={12} y={4} w={12} h={4} fill={color} />
          <P x={11} y={6} w={1} h={4} fill={color} />
          <P x={24} y={6} w={1} h={4} fill={s} />
          <P x={13} y={3} w={3} h={1} fill={color} />
          <P x={18} y={2} w={3} h={2} fill={color} />
          <P x={22} y={3} w={2} h={1} fill={s} />
        </g>
      );
    case "long":
      return (
        <g>
          <P x={11} y={5} w={14} h={4} fill={color} />
          <P x={10} y={7} w={2} h={16} fill={color} />
          <P x={24} y={7} w={2} h={16} fill={s} />
          <P x={12} y={9} w={2} h={2} fill={color} />
          <P x={22} y={9} w={2} h={2} fill={s} />
        </g>
      );
    case "bun":
      return (
        <g>
          <P x={15} y={0} w={6} h={4} fill={color} />
          <P x={14} y={1} w={1} h={2} fill={s} />
          <P x={21} y={1} w={1} h={2} fill={s} />
          <P x={12} y={5} w={12} h={3} fill={color} />
          <P x={11} y={7} w={1} h={3} fill={s} />
          <P x={24} y={7} w={1} h={3} fill={s} />
        </g>
      );
    case "mohawk":
      return (
        <g>
          <P x={16} y={1} w={4} h={7} fill={color} />
          <P x={19} y={2} w={1} h={6} fill={s} />
          <P x={12} y={6} w={4} h={2} fill={s} />
          <P x={20} y={6} w={4} h={2} fill={s} />
        </g>
      );
    case "flame":
      return (
        <g>
          <P x={12} y={5} w={12} h={3} fill={color} />
          <P x={13} y={2} w={2} h={3} fill={color} />
          <P x={17} y={0} w={2} h={5} fill={light(color, 70)} />
          <P x={21} y={2} w={2} h={3} fill={s} />
          <P x={11} y={7} w={1} h={3} fill={s} />
          <P x={24} y={7} w={1} h={3} fill={s} />
        </g>
      );
    default:
      return (
        <g>
          <P x={12} y={5} w={12} h={4} fill={color} />
          <P x={11} y={7} w={1} h={4} fill={color} />
          <P x={24} y={7} w={1} h={4} fill={s} />
          <P x={13} y={4} w={9} h={1} fill={color} />
          <P x={12} y={9} w={3} h={1} fill={color} />
          <P x={21} y={9} w={3} h={1} fill={s} />
        </g>
      );
  }
}

function CloakBack({ color }: { color: string }) {
  return (
    <g fill="#1c1c26">
      <P x={8} y={22} w={20} h={14} />
      <P x={7} y={28} w={22} h={9} />
      <P x={9} y={21} w={18} h={1} fill={dark(color, 45)} />
    </g>
  );
}

function Outfit({ kind, color }: { kind: string; color: string }) {
  const s = dark(color, 72);
  const base = (
    <g>
      <P x={12} y={21} w={12} h={13} fill={color} />
      <P x={21} y={21} w={3} h={13} fill={s} />
      <P x={12} y={21} w={3} h={2} fill={light(color, 88)} />
    </g>
  );
  switch (kind) {
    case "hoodie":
      return (
        <g>
          {base}
          <P x={13} y={21} w={10} h={2} fill={dark(color, 55)} />
          <P x={17} y={23} w={1} h={5} fill="#ffffff44" />
          <P x={19} y={23} w={1} h={5} fill="#ffffff44" />
          <P x={14} y={29} w={8} h={3} fill={dark(color, 82)} />
        </g>
      );
    case "sport":
      return (
        <g>
          {base}
          <P x={12} y={26} w={12} h={2} fill="var(--primary)" />
          <P x={17} y={21} w={2} h={5} fill="var(--primary)" />
        </g>
      );
    case "suit":
      return (
        <g>
          {base}
          <P x={16} y={21} w={4} h={13} fill="#1f1f26" />
          <P x={15} y={21} w={1} h={6} fill="#2a2a33" />
          <P x={20} y={21} w={1} h={6} fill="#2a2a33" />
          <P x={17} y={22} w={2} h={3} fill="var(--accent)" />
        </g>
      );
    case "armor":
      return (
        <g>
          {base}
          <P x={12} y={22} w={12} h={4} fill="#8f96a3" />
          <P x={12} y={26} w={12} h={1} fill="#6d7482" />
          <P x={16} y={27} w={4} h={4} fill="var(--gold)" />
          <P x={17} y={28} w={2} h={2} fill={light("var(--gold)", 60)} />
        </g>
      );
    case "cloak":
      return (
        <g>
          {base}
          <P x={12} y={21} w={12} h={2} fill="#1c1c26" />
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
        <g fill={OUTLINE}>
          <P x={13} y={12} w={4} h={1} />
          <P x={19} y={12} w={4} h={1} />
          <P x={13} y={16} w={4} h={1} />
          <P x={19} y={16} w={4} h={1} />
          <P x={13} y={13} w={1} h={3} />
          <P x={16} y={13} w={1} h={3} />
          <P x={19} y={13} w={1} h={3} />
          <P x={22} y={13} w={1} h={3} />
          <P x={17} y={13} w={2} h={1} />
          <g fill="#ffffff33">
            <P x={14} y={13} w={2} h={3} />
            <P x={20} y={13} w={2} h={3} />
          </g>
        </g>
      );
    case "headphones":
      return (
        <g fill="#2f2f3a">
          <P x={13} y={3} w={10} h={2} />
          <P x={11} y={5} w={2} h={2} />
          <P x={23} y={5} w={2} h={2} />
          <P x={9} y={7} w={3} h={6} />
          <P x={24} y={7} w={3} h={6} />
          <P x={10} y={8} w={1} h={4} fill="var(--primary)" />
        </g>
      );
    case "cap":
      return (
        <g fill="var(--primary)">
          <P x={12} y={3} w={12} h={3} />
          <P x={13} y={2} w={10} h={1} />
          <P x={11} y={6} w={14} h={1} />
          <P x={24} y={5} w={7} h={2} fill={dark("var(--primary)", 78)} />
        </g>
      );
    case "crown":
      return (
        <g fill="var(--gold)">
          <P x={13} y={2} w={10} h={2} />
          <P x={13} y={0} w={2} h={2} />
          <P x={17} y={0} w={2} h={2} />
          <P x={21} y={0} w={2} h={2} />
          <P x={17} y={2} w={2} h={1} fill={light("var(--gold)", 55)} />
        </g>
      );
    default:
      return null;
  }
}

function Pet({ kind }: { kind: string }) {
  if (!kind || kind === "none") return null;
  const palettes: Record<string, { body: string; dark: string; extra: string }> = {
    cat: { body: "#c8a37a", dark: "#9b7a56", extra: "#f2e3cf" },
    dog: { body: "#8f7358", dark: "#6b5540", extra: "#efe6d8" },
    owl: { body: "#7f8ba0", dark: "#5c6678", extra: "#f0d27a" },
    dragon: { body: "#5f9c86", dark: "#3f6f5f", extra: "#e0b25c" },
  };
  const c = palettes[kind] ?? palettes.cat;
  return (
    <g className="animate-float">
      {/* body */}
      <P x={27} y={33} w={7} h={5} fill={c.body} />
      <P x={31} y={33} w={3} h={5} fill={c.dark} />
      <P x={27} y={38} w={2} h={1} fill={c.dark} />
      <P x={31} y={38} w={2} h={1} fill={c.dark} />
      {/* head */}
      <P x={26} y={28} w={6} h={5} fill={c.body} />
      <P x={30} y={28} w={2} h={5} fill={c.dark} />
      {/* eyes */}
      <P x={27} y={30} w={1} h={1} fill={OUTLINE} />
      <P x={30} y={30} w={1} h={1} fill={OUTLINE} />
      {kind === "cat" && (
        <g fill={c.body}>
          <P x={26} y={26} w={2} h={2} />
          <P x={30} y={26} w={2} h={2} fill={c.dark} />
          <P x={34} y={30} w={1} h={5} fill={c.dark} />
        </g>
      )}
      {kind === "dog" && (
        <g>
          <P x={25} y={28} w={2} h={4} fill={c.dark} />
          <P x={31} y={28} w={2} h={4} fill={c.dark} />
          <P x={28} y={32} w={2} h={1} fill={c.extra} />
        </g>
      )}
      {kind === "owl" && (
        <g>
          <P x={26} y={27} w={1} h={1} fill={c.dark} />
          <P x={31} y={27} w={1} h={1} fill={c.dark} />
          <P x={28} y={31} w={2} h={1} fill={c.extra} />
          <P x={25} y={34} w={2} h={3} fill={c.dark} />
        </g>
      )}
      {kind === "dragon" && (
        <g>
          <P x={28} y={26} w={1} h={2} fill={c.extra} />
          <P x={30} y={26} w={1} h={2} fill={c.extra} />
          <P x={24} y={31} w={3} h={4} fill={c.dark} />
          <P x={34} y={32} w={2} h={4} fill={c.dark} />
        </g>
      )}
    </g>
  );
}
