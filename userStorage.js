import AsyncStorage from "@react-native-async-storage/async-storage";
import { createDefaultProgress } from "./progression";

const HIGH_SCORES_SUFFIX = "highScores";
const REWARDS_SUFFIX = "rewards";
const PROGRESS_SUFFIX = "progress";

let activeUserId = null;

export function setActiveUserId(userId) {
  activeUserId = userId || null;
}

export function getActiveUserId() {
  return activeUserId;
}

function requireUserId() {
  if (!activeUserId) {
    throw new Error("No active user for storage.");
  }
  return activeUserId;
}

function userStorageKey(suffix) {
  return `@mathGarden/users/${requireUserId()}/${suffix}`;
}

export const DEFAULT_REWARDS = {
  coins: 0,
  badges: {},
  stats: { recordBreaks: 0, totalCorrect: 0 }
};

export async function loadHighScores() {
  try {
    const raw = await AsyncStorage.getItem(userStorageKey(HIGH_SCORES_SUFFIX));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveHighScore(gameId, score) {
  const scores = await loadHighScores();
  const current = scores[gameId] || { best: 0, plays: 0 };
  const record = {
    best: Math.max(current.best, score),
    plays: current.plays + 1,
    lastScore: score
  };
  scores[gameId] = record;
  await AsyncStorage.setItem(userStorageKey(HIGH_SCORES_SUFFIX), JSON.stringify(scores));
  return record;
}

export async function loadRewards() {
  try {
    const raw = await AsyncStorage.getItem(userStorageKey(REWARDS_SUFFIX));
    return raw ? JSON.parse(raw) : DEFAULT_REWARDS;
  } catch {
    return DEFAULT_REWARDS;
  }
}

export async function saveRewards(rewards) {
  await AsyncStorage.setItem(userStorageKey(REWARDS_SUFFIX), JSON.stringify(rewards));
}

export async function loadProgress() {
  try {
    const raw = await AsyncStorage.getItem(userStorageKey(PROGRESS_SUFFIX));
    return raw ? JSON.parse(raw) : createDefaultProgress();
  } catch {
    return createDefaultProgress();
  }
}

export async function loadAppData() {
  try {
    const keys = [
      userStorageKey(HIGH_SCORES_SUFFIX),
      userStorageKey(REWARDS_SUFFIX),
      userStorageKey(PROGRESS_SUFFIX)
    ];
    const pairs = await AsyncStorage.multiGet(keys);
    const stored = Object.fromEntries(pairs);

    return {
      scores: stored[keys[0]] ? JSON.parse(stored[keys[0]]) : {},
      rewards: stored[keys[1]] ? JSON.parse(stored[keys[1]]) : DEFAULT_REWARDS,
      progress: stored[keys[2]] ? JSON.parse(stored[keys[2]]) : createDefaultProgress()
    };
  } catch {
    return { scores: {}, rewards: DEFAULT_REWARDS, progress: createDefaultProgress() };
  }
}

export async function saveProgressData(progress) {
  await AsyncStorage.setItem(userStorageKey(PROGRESS_SUFFIX), JSON.stringify(progress));
}

export async function clearAllAppData() {
  await AsyncStorage.multiRemove([
    userStorageKey(HIGH_SCORES_SUFFIX),
    userStorageKey(REWARDS_SUFFIX),
    userStorageKey(PROGRESS_SUFFIX)
  ]);
}
