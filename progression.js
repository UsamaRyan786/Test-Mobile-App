import {
  CATEGORY_LESSON,
  getLessonForCategory,
  getLessonUnlockHint,
  isLessonComplete,
  isLessonUnlocked
} from "./lessons";
import { getPlayableLessonTitles, isGameUnlockedByLesson } from "./lessonMap";

export const PROGRESS_KEY = "@mathGarden/progress";
export const LEVELS_PER_TIER = 10;
export const PASS_SCORE = 8;
export const MIN_LEVEL_FOR_NEXT_CATEGORY = 3;

export const LEARNING_PATH = [
  { id: "addition", label: "Plus", emoji: "➕", color: "#22C55E" },
  { id: "subtraction", label: "Minus", emoji: "➖", color: "#3B82F6" },
  { id: "multiplication", label: "Times", emoji: "✖️", color: "#EC4899" },
  { id: "division", label: "Divide", emoji: "➗", color: "#F97316" }
];

const BONUS_CATEGORIES = new Set(["patterns", "mixed", "challenge"]);

function emptyGameProgress() {
  return { tier: 1, maxLevel: 1, maxTier: 1, levels: {} };
}

export function createDefaultProgress() {
  return { games: {}, lessons: {} };
}

export function getGameProgress(progress, gameId) {
  return progress?.games?.[gameId] || emptyGameProgress();
}

function levelKey(tier, level) {
  return `${tier}:${level}`;
}

export function getLevelRecord(progress, gameId, tier, level) {
  return getGameProgress(progress, gameId).levels[levelKey(tier, level)] || null;
}

export function getHighestPassedLevel(progress, gameId, tier = 1) {
  const gameProgress = getGameProgress(progress, gameId);
  let highest = 0;

  for (let level = 1; level <= LEVELS_PER_TIER; level++) {
    const record = gameProgress.levels[levelKey(tier, level)];
    if (record?.passed) {
      highest = level;
    }
  }

  return highest;
}

export function getMaxUnlockedLevel(progress, gameId, tier = 1) {
  const gameProgress = getGameProgress(progress, gameId);
  if (tier === 2 && gameProgress.maxTier < 2) {
    return 0;
  }
  if (tier === 2) {
    return gameProgress.maxTier >= 2 ? gameProgress.maxLevelTier2 || 1 : 0;
  }
  return gameProgress.maxLevel || 1;
}

export function isLevelUnlocked(progress, gameId, tier, level) {
  if (level < 1 || level > LEVELS_PER_TIER) {
    return false;
  }
  if (tier === 2) {
    if (getHighestPassedLevel(progress, gameId, 1) < LEVELS_PER_TIER) {
      return false;
    }
    return level <= getMaxUnlockedLevel(progress, gameId, 2);
  }
  return level <= getMaxUnlockedLevel(progress, gameId, 1);
}

export function isTierUnlocked(progress, gameId, tier) {
  if (tier === 1) {
    return true;
  }
  return getHighestPassedLevel(progress, gameId, 1) >= LEVELS_PER_TIER;
}

function categoryHasMinProgress(progress, categoryId, minLevel, games) {
  return games
    .filter((game) => game.category === categoryId)
    .some((game) => getHighestPassedLevel(progress, game.id, 1) >= minLevel);
}

export function isCategoryLessonComplete(progress, categoryId) {
  if (BONUS_CATEGORIES.has(categoryId)) {
    return isLessonComplete(progress, "division");
  }

  const lessonId = CATEGORY_LESSON[categoryId];
  if (!lessonId) {
    return false;
  }

  return isLessonComplete(progress, lessonId);
}

export function isCategoryUnlocked(progress, categoryId) {
  return isCategoryLessonComplete(progress, categoryId);
}

export function isGameUnlocked(progress, game) {
  return isGameUnlockedByLesson(progress, game);
}

export function getCategoryUnlockHint(categoryId, progress) {
  if (BONUS_CATEGORIES.has(categoryId)) {
    if (!isLessonComplete(progress, "division")) {
      return "Listen to Division Class first! 🎧";
    }
    return null;
  }

  const lessonId = CATEGORY_LESSON[categoryId];
  if (!lessonId) {
    return "Complete a math class first! 📚";
  }

  if (!isLessonUnlocked(progress, lessonId)) {
    return getLessonUnlockHint(lessonId);
  }

  if (!isLessonComplete(progress, lessonId)) {
    const lesson = getLessonForCategory(categoryId);
    return `Finish ${lesson?.title || "the class"} to play these games! 🎧`;
  }

  return null;
}

export function getPathStepStatus(progress, stepId, games) {
  const unlocked = isLessonComplete(progress, stepId);
  const mastered = categoryHasMinProgress(progress, stepId, LEVELS_PER_TIER, games);
  const started = categoryHasMinProgress(progress, stepId, 1, games);
  return { unlocked, started, mastered };
}

function computeDifficulty(tier, level) {
  if (tier === 1) {
    return 0.55 + (level - 1) * 0.05;
  }
  return 1.05 + (level - 1) * 0.06;
}

function bump(value, factor, min = 1) {
  if (value == null) {
    return value;
  }
  return Math.max(min, Math.round(value * factor));
}

export function getScaledConfig(baseConfig = {}, roundType, tier, level) {
  const factor = computeDifficulty(tier, level);
  const config = { ...baseConfig };

  ["aMin", "aMax", "bMin", "bMax", "choiceMin", "choiceMax", "min", "max", "total", "step", "startMin", "startMax", "divMax", "qMax"].forEach(
    (key) => {
      if (config[key] != null) {
        config[key] = bump(config[key], factor, key.includes("Min") || key === "min" ? 1 : 2);
      }
    }
  );

  if (roundType === "dots" && !baseConfig.min && !baseConfig.max) {
    config.min = bump(1, factor, 1);
    config.max = bump(10, factor, 4);
  }

  if (roundType === "compare" && config.max == null) {
    config.max = bump(10, factor, 4);
  }

  if (roundType === "sequence" && config.step == null && config.stepMin == null) {
    config.step = Math.min(5, Math.max(1, Math.round(2 * factor)));
  }

  if (roundType === "multiplication" && Object.keys(baseConfig).length === 0) {
    config.aMax = bump(5, factor, 2);
    config.bMax = bump(5, factor, 2);
  }

  if (roundType === "division" && Object.keys(baseConfig).length === 0) {
    config.divMax = bump(5, factor, 2);
    config.qMax = bump(5, factor, 2);
  }

  return config;
}

export function recordLevelResult(progress, gameId, tier, level, score, maxRounds) {
  const next = {
    ...progress,
    games: { ...progress.games }
  };

  const gameProgress = { ...getGameProgress(next, gameId), levels: { ...getGameProgress(next, gameId).levels } };
  const key = levelKey(tier, level);
  const previous = gameProgress.levels[key] || { best: 0, passed: false };
  const passed = score >= PASS_SCORE;

  gameProgress.levels[key] = {
    best: Math.max(previous.best, score),
    passed: previous.passed || passed,
    lastScore: score,
    attempts: (previous.attempts || 0) + 1
  };

  if (tier === 1) {
    if (passed && level >= gameProgress.maxLevel && level < LEVELS_PER_TIER) {
      gameProgress.maxLevel = level + 1;
    }
    if (passed && level === LEVELS_PER_TIER) {
      gameProgress.maxTier = 2;
      gameProgress.maxLevelTier2 = Math.max(gameProgress.maxLevelTier2 || 1, 1);
    }
  } else if (passed && level >= (gameProgress.maxLevelTier2 || 1) && level < LEVELS_PER_TIER) {
    gameProgress.maxLevelTier2 = level + 1;
  }

  next.games[gameId] = gameProgress;
  return next;
}

export function didPassLevel(score) {
  return score >= PASS_SCORE;
}

export function getTierLabel(tier) {
  return tier === 2 ? "Advanced" : "Starter";
}

export function getPlayableCategoryLabels(progress, games = []) {
  if (games.length === 0) {
    return [];
  }
  return getPlayableLessonTitles(progress, games);
}
