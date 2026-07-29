// Life Quest — game rules, catalogs and progression math.

export type Interest = {
  key: string;
  label: string;
  icon: string;
};

export const INTERESTS: Interest[] = [
  { key: "study", label: "Études", icon: "📚" },
  { key: "sport", label: "Sport", icon: "🏃" },
  { key: "mind", label: "Bien-être", icon: "🧘" },
  { key: "creative", label: "Créativité", icon: "🎨" },
  { key: "code", label: "Code & Tech", icon: "💻" },
  { key: "money", label: "Finances", icon: "💰" },
  { key: "social", label: "Relations", icon: "🤝" },
  { key: "home", label: "Maison", icon: "🏠" },
  { key: "music", label: "Musique", icon: "🎧" },
  { key: "read", label: "Lecture", icon: "📖" },
  { key: "cook", label: "Cuisine", icon: "🍳" },
  { key: "sleep", label: "Sommeil", icon: "🌙" },
];

export type Skill = {
  key: string;
  name: string;
  icon: string;
  interest: string;
  color: string;
  unlockLevel: number;
  description: string;
};

export const SKILLS: Skill[] = [
  { key: "focus", name: "Concentration", icon: "🎯", interest: "study", color: "chart-1", unlockLevel: 1, description: "Rester sur une tâche sans se disperser." },
  { key: "knowledge", name: "Savoir", icon: "📚", interest: "study", color: "chart-3", unlockLevel: 1, description: "Apprendre et retenir de nouvelles choses." },
  { key: "endurance", name: "Endurance", icon: "🏃", interest: "sport", color: "chart-2", unlockLevel: 1, description: "Tenir la distance, physiquement." },
  { key: "strength", name: "Force", icon: "💪", interest: "sport", color: "chart-5", unlockLevel: 3, description: "Progresser en puissance et en constance." },
  { key: "calm", name: "Sérénité", icon: "🧘", interest: "mind", color: "chart-4", unlockLevel: 1, description: "Méditation, respiration, gestion du stress." },
  { key: "discipline", name: "Discipline", icon: "⛓️", interest: "mind", color: "chart-1", unlockLevel: 2, description: "Faire ce qui est prévu, même sans envie." },
  { key: "creativity", name: "Créativité", icon: "🎨", interest: "creative", color: "chart-4", unlockLevel: 1, description: "Créer, dessiner, écrire, imaginer." },
  { key: "craft", name: "Artisanat", icon: "🛠️", interest: "creative", color: "chart-5", unlockLevel: 4, description: "Fabriquer et bricoler de vos mains." },
  { key: "logic", name: "Logique", icon: "💻", interest: "code", color: "chart-3", unlockLevel: 1, description: "Résoudre des problèmes, coder, analyser." },
  { key: "wealth", name: "Fortune", icon: "💰", interest: "money", color: "gold", unlockLevel: 1, description: "Épargner, budgéter, investir." },
  { key: "charisma", name: "Charisme", icon: "🤝", interest: "social", color: "chart-2", unlockLevel: 1, description: "Créer et entretenir des liens." },
  { key: "order", name: "Ordre", icon: "🏠", interest: "home", color: "chart-1", unlockLevel: 1, description: "Un espace rangé, une tête rangée." },
  { key: "rhythm", name: "Rythme", icon: "🎧", interest: "music", color: "chart-4", unlockLevel: 2, description: "Pratique musicale et sens du tempo." },
  { key: "curiosity", name: "Curiosité", icon: "📖", interest: "read", color: "chart-3", unlockLevel: 1, description: "Lire, explorer, questionner." },
  { key: "nutrition", name: "Nutrition", icon: "🍳", interest: "cook", color: "chart-2", unlockLevel: 2, description: "Bien manger, cuisiner maison." },
  { key: "recovery", name: "Récupération", icon: "🌙", interest: "sleep", color: "chart-3", unlockLevel: 1, description: "Sommeil régulier et vraie récup'." },
  { key: "willpower", name: "Volonté", icon: "🔥", interest: "mind", color: "chart-5", unlockLevel: 6, description: "Tenir des séries longues sans craquer." },
  { key: "mastery", name: "Maîtrise", icon: "👑", interest: "study", color: "gold", unlockLevel: 10, description: "L'excellence dans la durée." },
];

export const skillByKey = (key?: string | null) => SKILLS.find((s) => s.key === key);

// ---------- progression ----------
export const xpForLevel = (level: number) => 80 + (level - 1) * 45;

export function levelFromXp(totalXp: number) {
  let level = 1;
  let remaining = Math.max(0, totalXp);
  while (remaining >= xpForLevel(level) && level < 200) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return { level, current: remaining, needed: xpForLevel(level) };
}

export const skillLevelFromXp = (xp: number) => Math.max(1, Math.floor(xp / 100) + 1);
export const skillProgress = (xp: number) => xp % 100;

export const TITLES: { level: number; title: string }[] = [
  { level: 1, title: "Novice" },
  { level: 3, title: "Apprenti" },
  { level: 5, title: "Explorateur" },
  { level: 8, title: "Artisan du quotidien" },
  { level: 12, title: "Vétéran" },
  { level: 16, title: "Stratège" },
  { level: 20, title: "Maître du temps" },
  { level: 30, title: "Légende vivante" },
];

export const titleForLevel = (level: number) =>
  [...TITLES].reverse().find((t) => level >= t.level)?.title ?? "Novice";

// ---------- cosmetics ----------
export type CosmeticSlot = "hair" | "outfit" | "accessory" | "pet" | "background" | "effect";

export type Cosmetic = {
  key: string;
  slot: CosmeticSlot;
  label: string;
  level: number;
  value?: string;
};

export const COSMETICS: Cosmetic[] = [
  // hair
  { key: "short", slot: "hair", label: "Court", level: 1 },
  { key: "buzz", slot: "hair", label: "Rasé", level: 1 },
  { key: "curly", slot: "hair", label: "Bouclé", level: 2 },
  { key: "long", slot: "hair", label: "Long", level: 3 },
  { key: "bun", slot: "hair", label: "Chignon", level: 5 },
  { key: "mohawk", slot: "hair", label: "Crête", level: 8 },
  { key: "flame", slot: "hair", label: "Cheveux de braise", level: 14 },
  // outfit
  { key: "tee", slot: "outfit", label: "T-shirt", level: 1 },
  { key: "hoodie", slot: "outfit", label: "Sweat", level: 2 },
  { key: "sport", slot: "outfit", label: "Tenue de sport", level: 4 },
  { key: "suit", slot: "outfit", label: "Costume", level: 7 },
  { key: "armor", slot: "outfit", label: "Armure légère", level: 11 },
  { key: "cloak", slot: "outfit", label: "Cape d'ombre", level: 16 },
  // accessory
  { key: "none", slot: "accessory", label: "Aucun", level: 1 },
  { key: "glasses", slot: "accessory", label: "Lunettes", level: 2 },
  { key: "headphones", slot: "accessory", label: "Casque", level: 4 },
  { key: "cap", slot: "accessory", label: "Casquette", level: 6 },
  { key: "crown", slot: "accessory", label: "Couronne", level: 15 },
  // pets
  { key: "none", slot: "pet", label: "Aucun", level: 1 },
  { key: "cat", slot: "pet", label: "Chat", level: 5 },
  { key: "dog", slot: "pet", label: "Chien", level: 7 },
  { key: "owl", slot: "pet", label: "Chouette", level: 10 },
  { key: "dragon", slot: "pet", label: "Dragonnet", level: 18 },
  // backgrounds
  { key: "plain", slot: "background", label: "Uni", level: 1 },
  { key: "night", slot: "background", label: "Nuit étoilée", level: 3 },
  { key: "forest", slot: "background", label: "Forêt", level: 6 },
  { key: "desk", slot: "background", label: "Bureau", level: 9 },
  { key: "summit", slot: "background", label: "Sommet", level: 13 },
  { key: "void", slot: "background", label: "Vide cosmique", level: 20 },
  // effects
  { key: "none", slot: "effect", label: "Aucun", level: 1 },
  { key: "glow", slot: "effect", label: "Aura", level: 4 },
  { key: "sparks", slot: "effect", label: "Étincelles", level: 8 },
  { key: "orbit", slot: "effect", label: "Orbe en orbite", level: 12 },
  { key: "storm", slot: "effect", label: "Tempête", level: 17 },
];

export const SKIN_TONES = ["#f2d3b8", "#e0b492", "#c58c62", "#96603d", "#6b422a", "#452c1c"];
export const HAIR_COLORS = ["#2b2b30", "#4b3524", "#8a5a2b", "#c9a227", "#8f8f96", "#5d6f8a", "#8a5d7a"];
export const OUTFIT_COLORS = ["#5f7a72", "#7a6a5f", "#5f6a7a", "#7a5f6a", "#6a7a5f", "#4c4c55"];

export type AvatarConfig = {
  skin: string;
  hair: string;
  hairColor: string;
  outfit: string;
  outfitColor: string;
  accessory: string;
  pet: string;
  background: string;
  effect: string;
};

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: SKIN_TONES[1],
  hair: "short",
  hairColor: HAIR_COLORS[0],
  outfit: "tee",
  outfitColor: OUTFIT_COLORS[0],
  accessory: "none",
  pet: "none",
  background: "plain",
  effect: "none",
};

export const APP_THEMES = [
  { key: "slate", label: "Ardoise", level: 1 },
  { key: "ember", label: "Braise", level: 5 },
  { key: "abyss", label: "Abysse", level: 9 },
  { key: "orchid", label: "Orchidée", level: 14 },
  { key: "sand", label: "Sable", level: 19 },
];

// ---------- achievements ----------
export type StatsSnapshot = {
  level: number;
  totalXp: number;
  streak: number;
  bestStreak: number;
  tasksDone: number;
  habitsDone: number;
  dailiesDone: number;
  studyMinutes: number;
  perfectDays: number;
  weekXp: number;
  skillsMaxLevel: number;
  earlyBird: number;
  nightOwl: number;
};

export type Achievement = {
  key: string;
  name: string;
  desc: string;
  icon: string;
  check: (s: StatsSnapshot) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  { key: "first_level", name: "Premier niveau", desc: "Atteindre le niveau 2", icon: "⭐", check: (s) => s.level >= 2 },
  { key: "level_5", name: "En route", desc: "Atteindre le niveau 5", icon: "🌟", check: (s) => s.level >= 5 },
  { key: "level_10", name: "Aguerri", desc: "Atteindre le niveau 10", icon: "🏅", check: (s) => s.level >= 10 },
  { key: "level_20", name: "Héros local", desc: "Atteindre le niveau 20", icon: "🎖️", check: (s) => s.level >= 20 },
  { key: "first_task", name: "Le grand départ", desc: "Terminer une première tâche", icon: "✅", check: (s) => s.tasksDone >= 1 },
  { key: "tasks_10", name: "Dix de der", desc: "Terminer 10 tâches", icon: "🔟", check: (s) => s.tasksDone >= 10 },
  { key: "tasks_50", name: "Machine", desc: "Terminer 50 tâches", icon: "⚙️", check: (s) => s.tasksDone >= 50 },
  { key: "tasks_100", name: "Centurion", desc: "Terminer 100 tâches", icon: "💯", check: (s) => s.tasksDone >= 100 },
  { key: "tasks_500", name: "Inarrêtable", desc: "Terminer 500 tâches", icon: "🚀", check: (s) => s.tasksDone >= 500 },
  { key: "habits_25", name: "Habitué", desc: "Réaliser 25 habitudes", icon: "🔁", check: (s) => s.habitsDone >= 25 },
  { key: "habits_100", name: "Seconde nature", desc: "Réaliser 100 habitudes", icon: "♾️", check: (s) => s.habitsDone >= 100 },
  { key: "streak_3", name: "Ça démarre", desc: "Série de 3 jours", icon: "🔥", check: (s) => s.bestStreak >= 3 },
  { key: "streak_7", name: "Une semaine pleine", desc: "Série de 7 jours", icon: "📅", check: (s) => s.bestStreak >= 7 },
  { key: "streak_30", name: "Série de 30 jours", desc: "Tenir 30 jours d'affilée", icon: "🗓️", check: (s) => s.bestStreak >= 30 },
  { key: "streak_100", name: "Centenaire", desc: "Série de 100 jours", icon: "🏔️", check: (s) => s.bestStreak >= 100 },
  { key: "study_10h", name: "Studieux", desc: "10 h de travail cumulées", icon: "📖", check: (s) => s.studyMinutes >= 600 },
  { key: "study_100h", name: "Érudit", desc: "100 h de travail cumulées", icon: "🎓", check: (s) => s.studyMinutes >= 6000 },
  { key: "perfect_day", name: "Journée parfaite", desc: "Tout terminer sur une journée", icon: "🌞", check: (s) => s.perfectDays >= 1 },
  { key: "perfect_5", name: "Cinq sans faute", desc: "5 journées parfaites", icon: "🏆", check: (s) => s.perfectDays >= 5 },
  { key: "week_500", name: "Semaine chargée", desc: "500 XP en une semaine", icon: "⚡", check: (s) => s.weekXp >= 500 },
  { key: "skill_5", name: "Spécialiste", desc: "Une compétence niveau 5", icon: "🧠", check: (s) => s.skillsMaxLevel >= 5 },
  { key: "skill_10", name: "Expert", desc: "Une compétence niveau 10", icon: "🥇", check: (s) => s.skillsMaxLevel >= 10 },
  { key: "early_bird", name: "Lève-tôt", desc: "10 tâches avant 8 h", icon: "🌅", check: (s) => s.earlyBird >= 10 },
  { key: "night_owl", name: "Oiseau de nuit", desc: "10 tâches après 22 h", icon: "🦉", check: (s) => s.nightOwl >= 10 },
  { key: "xp_1000", name: "Mille XP", desc: "Cumuler 1000 XP", icon: "💎", check: (s) => s.totalXp >= 1000 },
  { key: "xp_10000", name: "Dix mille XP", desc: "Cumuler 10 000 XP", icon: "👑", check: (s) => s.totalXp >= 10000 },
];

// ---------- epic quests ----------
export type EpicQuest = {
  key: string;
  name: string;
  desc: string;
  icon: string;
  target: number;
  reward: number;
  metric: keyof StatsSnapshot;
};

export const EPIC_QUESTS: EpicQuest[] = [
  { key: "perfect_week", name: "Semaine sans faille", desc: "7 jours d'affilée sans oublier une seule habitude", icon: "🛡️", target: 7, reward: 300, metric: "bestStreak" },
  { key: "hundred_tasks", name: "Cent travaux", desc: "Terminer 100 tâches au total", icon: "⚔️", target: 100, reward: 400, metric: "tasksDone" },
  { key: "month_streak", name: "La grande série", desc: "Tenir une série de 30 jours", icon: "🌋", target: 30, reward: 800, metric: "bestStreak" },
  { key: "scholar", name: "Le grand savoir", desc: "Cumuler 50 h de travail concentré", icon: "🏛️", target: 3000, reward: 600, metric: "studyMinutes" },
  { key: "habit_master", name: "Maître des habitudes", desc: "Réaliser 200 habitudes", icon: "🔮", target: 200, reward: 500, metric: "habitsDone" },
  { key: "ascension", name: "Ascension", desc: "Atteindre le niveau 20", icon: "🗻", target: 20, reward: 1000, metric: "level" },
  { key: "polymath", name: "Polymathe", desc: "Monter une compétence au niveau 10", icon: "🧩", target: 10, reward: 450, metric: "skillsMaxLevel" },
  { key: "ten_perfect", name: "Dix soleils", desc: "10 journées parfaites", icon: "☀️", target: 10, reward: 550, metric: "perfectDays" },
];

// ---------- daily quests ----------
export type DailyQuestTemplate = {
  key: string;
  label: string;
  icon: string;
  interests: string[];
  xp: number;
};

export const DAILY_QUESTS: DailyQuestTemplate[] = [
  { key: "dq_focus", label: "25 minutes de travail sans téléphone", icon: "🎯", interests: ["study", "code"], xp: 30 },
  { key: "dq_read", label: "Lire 10 pages", icon: "📖", interests: ["read", "study"], xp: 20 },
  { key: "dq_move", label: "Bouger 20 minutes", icon: "🏃", interests: ["sport"], xp: 25 },
  { key: "dq_water", label: "Boire 1,5 L d'eau", icon: "💧", interests: ["sport", "mind"], xp: 15 },
  { key: "dq_meditate", label: "5 minutes de respiration", icon: "🧘", interests: ["mind", "sleep"], xp: 15 },
  { key: "dq_tidy", label: "Ranger un espace 10 minutes", icon: "🏠", interests: ["home"], xp: 15 },
  { key: "dq_code", label: "Écrire du code 30 minutes", icon: "💻", interests: ["code"], xp: 30 },
  { key: "dq_create", label: "Créer quelque chose (esquisse, texte, son)", icon: "🎨", interests: ["creative", "music"], xp: 25 },
  { key: "dq_budget", label: "Noter ses dépenses du jour", icon: "💰", interests: ["money"], xp: 15 },
  { key: "dq_call", label: "Prendre des nouvelles d'un proche", icon: "🤝", interests: ["social"], xp: 20 },
  { key: "dq_cook", label: "Cuisiner un repas maison", icon: "🍳", interests: ["cook"], xp: 20 },
  { key: "dq_sleep", label: "Être au lit avant 23 h", icon: "🌙", interests: ["sleep", "mind"], xp: 25 },
  { key: "dq_music", label: "Pratiquer un instrument 15 minutes", icon: "🎧", interests: ["music"], xp: 25 },
  { key: "dq_nosugar", label: "Une journée sans sucre ajouté", icon: "🥗", interests: ["cook", "sport"], xp: 25 },
  { key: "dq_walk", label: "Marcher 6 000 pas", icon: "👟", interests: ["sport", "mind"], xp: 20 },
];

export function pickDailyQuests(interests: string[], seed: number, count = 3) {
  const pool = DAILY_QUESTS.filter(
    (q) => interests.length === 0 || q.interests.some((i) => interests.includes(i)),
  );
  const source = pool.length >= count ? pool : DAILY_QUESTS;
  const sorted = [...source].sort(
    (a, b) => hash(a.key + seed) - hash(b.key + seed),
  );
  return sorted.slice(0, count);
}

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 100000;
  return h;
}

export function suggestSkills(interests: string[]) {
  const picked = SKILLS.filter((s) => interests.includes(s.interest) && s.unlockLevel <= 2);
  if (picked.length >= 3) return picked.slice(0, 6).map((s) => s.key);
  return [...new Set([...picked.map((s) => s.key), "focus", "discipline", "calm"])].slice(0, 6);
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function xpForDifficulty(difficulty: number) {
  return [10, 20, 35, 60][Math.min(3, Math.max(0, difficulty - 1))];
}
