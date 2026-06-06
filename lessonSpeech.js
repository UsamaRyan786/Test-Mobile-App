import * as Speech from "expo-speech";

const SPEECH_OPTIONS = {
  language: "en-US",
  pitch: 1.05,
  rate: 0.82
};

export function buildSlideNarration(slide, lesson) {
  if (slide.narration) {
    return slide.narration;
  }

  return `Hello! I am Teacher Maya. ${slide.title}. ${slide.body} Remember this: ${slide.tip}`;
}

export function speakLesson(text, callbacks = {}) {
  Speech.stop();
  Speech.speak(text, {
    ...SPEECH_OPTIONS,
    onDone: callbacks.onDone,
    onStopped: callbacks.onDone,
    onError: callbacks.onDone
  });
}

export function stopLessonSpeech() {
  Speech.stop();
}

export async function getIsSpeaking() {
  return Speech.isSpeakingAsync();
}

export function buildLessonIntro(lesson) {
  return `Welcome to ${lesson.title}! ${lesson.subtitle} Listen carefully and watch the whiteboard.`;
}

export function buildLessonOutro(lesson) {
  return `Wonderful work! You finished ${lesson.title}. Now you can play ${lesson.category} games in the math garden!`;
}
