import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

export const ACCOUNTS_KEY = "@mathGarden/accounts";
export const SESSION_KEY = "@mathGarden/session";

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function normalizeDisplayName(displayName, username) {
  const value = String(displayName || "").trim();
  return value || username;
}

async function hashPassword(password, salt) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  );
}

function createUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function loadAccounts() {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveAccounts(accounts) {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function getSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) {
    return null;
  }

  const accounts = await loadAccounts();
  const account = accounts.find((item) => item.id === session.userId);
  if (!account) {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }

  return {
    id: account.id,
    username: account.username,
    displayName: account.displayName
  };
}

export async function registerUser({ username, password, displayName }) {
  const cleanUsername = normalizeUsername(username);
  const cleanPassword = String(password || "");
  const cleanDisplayName = normalizeDisplayName(displayName, cleanUsername);

  if (cleanUsername.length < 3) {
    return { ok: false, error: "Username must be at least 3 characters." };
  }
  if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
    return { ok: false, error: "Username can use letters, numbers, dots, dashes, and underscores." };
  }
  if (cleanPassword.length < 4) {
    return { ok: false, error: "Password must be at least 4 characters." };
  }

  const accounts = await loadAccounts();
  if (accounts.some((item) => item.username === cleanUsername)) {
    return { ok: false, error: "That username is already taken." };
  }

  const salt = await Crypto.getRandomBytesAsync(16).then((bytes) =>
    Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
  );
  const passwordHash = await hashPassword(cleanPassword, salt);
  const user = {
    id: createUserId(),
    username: cleanUsername,
    displayName: cleanDisplayName,
    passwordHash,
    salt,
    createdAt: Date.now()
  };

  accounts.push(user);
  await saveAccounts(accounts);
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));

  return {
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName
    }
  };
}

export async function loginUser({ username, password }) {
  const cleanUsername = normalizeUsername(username);
  const cleanPassword = String(password || "");

  if (!cleanUsername || !cleanPassword) {
    return { ok: false, error: "Enter your username and password." };
  }

  const accounts = await loadAccounts();
  const account = accounts.find((item) => item.username === cleanUsername);
  if (!account) {
    return { ok: false, error: "Username or password is incorrect." };
  }

  const passwordHash = await hashPassword(cleanPassword, account.salt);
  if (passwordHash !== account.passwordHash) {
    return { ok: false, error: "Username or password is incorrect." };
  }

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ userId: account.id }));

  return {
    ok: true,
    user: {
      id: account.id,
      username: account.username,
      displayName: account.displayName
    }
  };
}

export async function logoutUser() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
