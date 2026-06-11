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

const HOMOPHONE_WORDS = new Set(["to", "too", "for", "oh", "won", "ate", "tree", "free"]);

export function parseSpokenNumber(transcript, allowedValues = null) {
  if (!transcript) {
    return null;
  }

  const text = transcript.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  const allowed =
    allowedValues == null
      ? null
      : allowedValues.map((value) => Number(value)).filter((value) => !Number.isNaN(value));

  const digitMatches = text.match(/\d+/g) || [];
  for (const match of digitMatches) {
    const value = Number(match);
    if (allowed == null || allowed.includes(value)) {
      return value;
    }
  }

  const words = text.split(" ").filter(Boolean);
  for (const word of words) {
    if (HOMOPHONE_WORDS.has(word)) {
      continue;
    }
    const value = WORD_NUMBERS[word];
    if (value != null && (allowed == null || allowed.includes(value))) {
      return value;
    }
  }

  for (const word of words) {
    const value = WORD_NUMBERS[word];
    if (value != null && (allowed == null || allowed.includes(value))) {
      return value;
    }
  }

  return null;
}

function normalizeTranscript(transcript) {
  return transcript.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}

function matchShapeChoice(transcript, choices, strict = false) {
  const text = normalizeTranscript(transcript);
  if (!text) {
    return null;
  }

  for (const choice of choices) {
    const name = getShapeName(choice).toLowerCase();
    if (text === name) {
      return choice;
    }
    const pattern = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    if (pattern.test(text)) {
      return choice;
    }
  }

  if (strict) {
    return null;
  }

  for (const choice of choices) {
    const name = getShapeName(choice).toLowerCase();
    if (text.includes(name)) {
      return choice;
    }
  }

  return null;
}

export function matchSpokenToChoices(transcript, choices = [], choiceType = "number", strict = false) {
  if (!transcript || !choices.length) {
    return null;
  }

  if (choiceType === "shapeName") {
    return matchShapeChoice(transcript, choices, strict);
  }

  const numericChoices = choices.map((value) => Number(value)).filter((value) => !Number.isNaN(value));
  const parsed = parseSpokenNumber(transcript, numericChoices);
  if (parsed != null && numericChoices.includes(parsed)) {
    return parsed;
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

function resolveAnswerFromEvent(event, choices, choiceType, strictExpected, expected) {
  const transcripts = extractTranscriptsFromEvent(event);
  const effectiveChoices =
    strictExpected && expected != null
      ? choiceType === "shapeName"
        ? [expected]
        : [Number(expected)]
      : choices;

  const tryResolve = (requireFinal) => {
    if (requireFinal && !event.isFinal) {
      return null;
    }

    for (const transcript of transcripts) {
      const answer = matchSpokenToChoices(transcript, effectiveChoices, choiceType, strictExpected);
      if (answer != null) {
        return { answer, transcript };
      }
    }

    return null;
  };

  return tryResolve(true) || tryResolve(false);
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
  strictExpected = false,
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

  const hintChoices =
    strictExpected && expected != null
      ? choiceType === "shapeName"
        ? [expected]
        : [expected]
      : choices;
  const numberHints = buildChoiceHints(hintChoices, choiceType, expected);
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

      const resolved = resolveAnswerFromEvent(event, choices, choiceType, strictExpected, expected);
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
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 1200,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 800,
        EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 400
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
