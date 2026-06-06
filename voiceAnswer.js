import Constants from "expo-constants";
import { requireOptionalNativeModule } from "expo";

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

export function parseSpokenAnswer(transcript, choices = []) {
  const parsed = parseSpokenNumber(transcript);
  if (parsed == null) {
    return null;
  }

  const validChoices = choices.map((value) => Number(value)).filter((value) => !Number.isNaN(value));
  if (validChoices.length === 0 || validChoices.includes(parsed)) {
    return parsed;
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

export async function checkVoiceAnswerSupport() {
  if (isExpoGo()) {
    return {
      available: false,
      reason: "Expo Go cannot listen to your voice. Tap the number buttons below."
    };
  }

  const module = getSpeechModule();
  if (!module) {
    return {
      available: false,
      reason: "Voice needs a dev build. Run: npx expo run:android"
    };
  }

  try {
    if (typeof module.isRecognitionAvailable === "function" && !module.isRecognitionAvailable()) {
      return { available: false, reason: "Speech recognition is not available on this device." };
    }
    return { available: true, reason: null };
  } catch {
    return { available: false, reason: "Speech recognition could not start." };
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

  const numberHints = [];
  const maxChoice = Math.max(...choices.map(Number), expected || 0, 10);
  for (let value = 1; value <= Math.min(maxChoice, 15); value += 1) {
    numberHints.push(String(value));
    const word = Object.entries(WORD_NUMBERS).find(([, num]) => num === value)?.[0];
    if (word) {
      numberHints.push(word);
    }
  }

  let finished = false;

  const subscriptions = [
    module.addListener("start", () => onListeningChange?.(true)),
    module.addListener("end", () => onListeningChange?.(false)),
    module.addListener("result", (event) => {
      if (finished) {
        return;
      }

      const transcript = event.results?.[0]?.transcript || "";
      if (transcript) {
        onTranscript?.(transcript);
      }

      const answer = parseSpokenAnswer(transcript, choices);
      if (answer == null) {
        return;
      }

      if (!event.isFinal && transcript.trim().split(/\s+/).length > 3) {
        return;
      }

      finished = true;
      onResult?.(answer, transcript);
      try {
        module.stop();
      } catch {
        // ignore
      }
    }),
    module.addListener("error", (event) => {
      if (event.error === "aborted" || event.error === "no-speech") {
        return;
      }
      onError?.(event.message || "Could not hear you. Tap the mic and try again!");
      onListeningChange?.(false);
    })
  ];

  try {
    module.start({
      lang: "en-US",
      interimResults: true,
      continuous: false,
      maxAlternatives: 5,
      contextualStrings: numberHints,
      iosTaskHint: "confirmation",
      androidIntentOptions: {
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 2500,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 1800
      }
    });
  } catch (error) {
    onError?.(error?.message || "Could not start the microphone.");
    return { stop: () => {} };
  }

  return {
    stop() {
      finished = true;
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
