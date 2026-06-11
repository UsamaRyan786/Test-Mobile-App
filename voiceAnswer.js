import Constants from "expo-constants";
import { requireOptionalNativeModule } from "expo";
import { getShapeName } from "./shapes";

const WORD_NUMBERS = {
  zero: 0,
  oh: 0,
  one: 1,
  won: 1,
  two: 2,
  to: 2,
  too: 2,
  three: 3,
  tree: 3,
  free: 3,
  four: 4,
  for: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  ate: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30
};

const LISTEN_TIMEOUT_MS = 5000;

export function parseSpokenNumber(transcript) {
  if (!transcript) {
    return null;
  }

  const text = transcript.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  const digitMatch = text.match(/\d+/);
  if (digitMatch) {
    return Number(digitMatch[0]);
  }

  const words = text.split(" ");
  for (const word of words) {
    if (WORD_NUMBERS[word] != null) {
      return WORD_NUMBERS[word];
    }
  }

  for (const [word, value] of Object.entries(WORD_NUMBERS)) {
    if (text.includes(word)) {
      return value;
    }
  }

  return null;
}

function normalizeTranscript(transcript) {
  return transcript.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function matchShapeChoice(transcript, choices) {
  const text = normalizeTranscript(transcript);
  if (!text) {
    return null;
  }

  for (const choice of choices) {
    const name = getShapeName(choice).toLowerCase();
    if (text === name || text.includes(name)) {
      return choice;
    }
  }

  for (const choice of choices) {
    const name = getShapeName(choice).toLowerCase();
    const prefix = name.slice(0, Math.min(4, name.length));
    if (prefix.length >= 3 && text.includes(prefix)) {
      return choice;
    }
  }

  return null;
}

export function matchSpokenToChoices(transcript, choices = [], choiceType = "number") {
  if (!transcript || !choices.length) {
    return null;
  }

  if (choiceType === "shapeName") {
    return matchShapeChoice(transcript, choices);
  }

  const numericChoices = choices.map((value) => Number(value)).filter((value) => !Number.isNaN(value));
  const parsed = parseSpokenNumber(transcript);
  if (parsed != null && numericChoices.includes(parsed)) {
    return parsed;
  }

  const text = normalizeTranscript(transcript);
  for (const choice of numericChoices) {
    const pattern = new RegExp(`\\b${choice}\\b`);
    if (pattern.test(text)) {
      return choice;
    }
  }

  return null;
}

export function parseSpokenAnswer(transcript, choices = [], choiceType = "number") {
  return matchSpokenToChoices(transcript, choices, choiceType);
}

function buildChoiceHints(choices = [], choiceType = "number", expected) {
  const hints = new Set();

  for (const choice of choices) {
    if (choiceType === "shapeName") {
      hints.add(getShapeName(choice));
      continue;
    }

    const value = Number(choice);
    if (Number.isNaN(value)) {
      continue;
    }

    hints.add(String(value));
    const word = Object.entries(WORD_NUMBERS).find(([, num]) => num === value)?.[0];
    if (word) {
      hints.add(word);
    }
  }

  if (expected != null && choiceType !== "shapeName") {
    const expectedValue = Number(expected);
    if (!Number.isNaN(expectedValue)) {
      hints.add(String(expectedValue));
      const word = Object.entries(WORD_NUMBERS).find(([, num]) => num === expectedValue)?.[0];
      if (word) {
        hints.add(word);
      }
    }
  }

  return [...hints];
}

function extractTranscriptsFromEvent(event) {
  const transcripts = [];

  for (const result of event.results || []) {
    if (result?.transcript) {
      transcripts.push(result.transcript);
    }

    for (const alternative of result?.alternatives || []) {
      if (alternative?.transcript) {
        transcripts.push(alternative.transcript);
      }
    }
  }

  if (event.results?.[0]?.transcript) {
    transcripts.unshift(event.results[0].transcript);
  }

  return [...new Set(transcripts.filter(Boolean))];
}

function resolveAnswerFromEvent(event, choices, choiceType) {
  const transcripts = extractTranscriptsFromEvent(event);

  for (const transcript of transcripts) {
    const answer = matchSpokenToChoices(transcript, choices, choiceType);
    if (answer != null) {
      return { answer, transcript };
    }
  }

  return null;
}

let speechModuleCache;

function isExpoGo() {
  return Constants.appOwnership === "expo";
}

function loadSpeechModule() {
  try {
    const module = requireOptionalNativeModule("ExpoSpeechRecognition");
    if (!module) {
      return null;
    }

    const stop = module.stop?.bind(module);
    const abort = module.abort?.bind(module);
    if (stop) {
      module.stop = () => stop();
    }
    if (abort) {
      module.abort = () => abort();
    }

    return module;
  } catch {
    return null;
  }
}

export function getSpeechModule() {
  if (speechModuleCache === undefined) {
    speechModuleCache = loadSpeechModule();
  }
  return speechModuleCache;
}

let supportCache;

export async function checkVoiceAnswerSupport() {
  if (supportCache) {
    return supportCache;
  }

  if (isExpoGo()) {
    supportCache = {
      available: false,
      reason: "Expo Go cannot listen to your voice. Tap the number buttons below."
    };
    return supportCache;
  }

  const module = getSpeechModule();
  if (!module) {
    supportCache = {
      available: false,
      reason: "Voice needs a dev build. Run: npx expo run:android"
    };
    return supportCache;
  }

  try {
    if (typeof module.isRecognitionAvailable === "function" && !module.isRecognitionAvailable()) {
      supportCache = { available: false, reason: "Speech recognition is not available on this device." };
      return supportCache;
    }
    supportCache = { available: true, reason: null };
    return supportCache;
  } catch {
    supportCache = { available: false, reason: "Speech recognition could not start." };
    return supportCache;
  }
}

export async function ensureMicPermission() {
  const module = getSpeechModule();
  if (!module) {
    return false;
  }

  try {
    const current = await module.getPermissionsAsync();
    if (current.granted) {
      return true;
    }

    const requested = await module.requestPermissionsAsync();
    return Boolean(requested.granted);
  } catch {
    return false;
  }
}

export function createVoiceAnswerSession({
  choices,
  expected,
  choiceType = "number",
  onTranscript,
  onResult,
  onError,
  onListeningChange
}) {
  const module = getSpeechModule();
  if (!module) {
    onError?.("Voice input is not available.");
    return { stop: () => {} };
  }

  const numberHints = buildChoiceHints(choices, choiceType, expected);
  let finished = false;
  let listenTimeout = null;

  const finishSession = (stopModule = true) => {
    if (finished) {
      return;
    }

    finished = true;
    if (listenTimeout) {
      clearTimeout(listenTimeout);
      listenTimeout = null;
    }

    if (stopModule) {
      try {
        module.stop();
      } catch {
        // ignore
      }
    }
  };

  const subscriptions = [
    module.addListener("start", () => onListeningChange?.(true)),
    module.addListener("end", () => onListeningChange?.(false)),
    module.addListener("result", (event) => {
      if (finished) {
        return;
      }

      const transcripts = extractTranscriptsFromEvent(event);
      const latest = transcripts[0] || "";
      if (latest) {
        onTranscript?.(latest);
      }

      const resolved = resolveAnswerFromEvent(event, choices, choiceType);
      if (!resolved) {
        return;
      }

      finishSession(true);
      onResult?.(resolved.answer, resolved.transcript);
    }),
    module.addListener("error", (event) => {
      if (event.error === "aborted") {
        return;
      }

      if (event.error === "no-speech") {
        onError?.("Didn't hear an answer. Tap the mic and try again.");
      } else {
        onError?.(event.message || "Could not hear you. Tap the mic and try again!");
      }
      finishSession(false);
      onListeningChange?.(false);
    })
  ];

  listenTimeout = setTimeout(() => {
    if (finished) {
      return;
    }

    finishSession(true);
    onError?.("That took too long. Tap an answer or tap the mic again.");
    onListeningChange?.(false);
  }, LISTEN_TIMEOUT_MS);

  try {
    module.start({
      lang: "en-US",
      interimResults: true,
      continuous: false,
      maxAlternatives: 5,
      contextualStrings: numberHints,
      iosTaskHint: "confirmation",
      androidIntentOptions: {
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 900,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 600,
        EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 300
      }
    });
  } catch (error) {
    if (listenTimeout) {
      clearTimeout(listenTimeout);
    }
    onError?.(error?.message || "Could not start the microphone.");
    return { stop: () => {} };
  }

  return {
    stop() {
      finished = true;
      if (listenTimeout) {
        clearTimeout(listenTimeout);
        listenTimeout = null;
      }
      subscriptions.forEach((subscription) => subscription.remove());
      try {
        module.abort();
      } catch {
        try {
          module.stop();
        } catch {
          // ignore
        }
      }
      onListeningChange?.(false);
    }
  };
}

export function stopVoiceAnswerSession() {
  const module = getSpeechModule();
  if (!module) {
    return;
  }

  try {
    module.abort();
  } catch {
    try {
      module.stop();
    } catch {
      // ignore
    }
  }
}
