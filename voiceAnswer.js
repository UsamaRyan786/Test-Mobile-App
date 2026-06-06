const WORD_NUMBERS = {
  zero: 0,
  oh: 0,
  one: 1,
  two: 2,
  three: 3,
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

export function parseSpokenAnswer(transcript, choices = []) {
  if (!transcript) {
    return null;
  }

  const text = transcript.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  const validChoices = choices.map((value) => Number(value)).filter((value) => !Number.isNaN(value));

  const digitMatch = text.match(/\d+/);
  if (digitMatch) {
    const parsed = Number(digitMatch[0]);
    if (validChoices.includes(parsed)) {
      return parsed;
    }
  }

  for (const choice of validChoices) {
    if (text.includes(String(choice))) {
      return choice;
    }
  }

  const words = text.split(" ");
  for (const word of words) {
    if (WORD_NUMBERS[word] != null && validChoices.includes(WORD_NUMBERS[word])) {
      return WORD_NUMBERS[word];
    }
  }

  for (const [word, value] of Object.entries(WORD_NUMBERS)) {
    if (text.includes(word) && validChoices.includes(value)) {
      return value;
    }
  }

  return null;
}

export function getSpeechModule() {
  try {
    const { ExpoSpeechRecognitionModule } = require("expo-speech-recognition");
    return ExpoSpeechRecognitionModule;
  } catch {
    return null;
  }
}

export async function checkVoiceAnswerSupport() {
  const module = getSpeechModule();
  if (!module) {
    return { available: false, reason: "Voice input needs a development build (not plain Expo Go)." };
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

  const current = await module.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await module.requestPermissionsAsync();
  return Boolean(requested.granted);
}

export function createVoiceAnswerSession({ choices, onTranscript, onResult, onError, onListeningChange }) {
  const module = getSpeechModule();
  if (!module) {
    onError?.("Voice input is not available.");
    return { stop: () => {} };
  }

  const subscriptions = [
    module.addListener("start", () => onListeningChange?.(true)),
    module.addListener("end", () => onListeningChange?.(false)),
    module.addListener("result", (event) => {
      const transcript = event.results?.[0]?.transcript || "";
      if (transcript) {
        onTranscript?.(transcript);
      }

      if (!event.isFinal) {
        return;
      }

      const answer = parseSpokenAnswer(transcript, choices);
      if (answer != null) {
        onResult?.(answer, transcript);
        module.stop();
      }
    }),
    module.addListener("error", (event) => {
      if (event.error === "aborted" || event.error === "no-speech") {
        return;
      }
      onError?.(event.message || "Could not hear you. Try again!");
      onListeningChange?.(false);
    })
  ];

  module.start({
    lang: "en-US",
    interimResults: true,
    continuous: false,
    maxAlternatives: 3,
    contextualStrings: choices.map(String),
    iosTaskHint: "confirmation",
    androidIntentOptions: {
      EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 1800
    }
  });

  return {
    stop() {
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
