import * as Speech from "expo-speech";
import { TEACHER_NAME } from "./teacherConfig";

const SPEECH_OPTIONS = {
  language: "en-US",
  pitch: 1.05,
  rate: 0.78
};

const NUMBER_WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen"
];

const ITEM_LABELS = {
  "🌸": { singular: "flower", plural: "flowers" },
  "🌻": { singular: "sunflower", plural: "sunflowers" },
  "🍎": { singular: "apple", plural: "apples" },
  "⭐": { singular: "star", plural: "stars" },
  "🐝": { singular: "bee", plural: "bees" },
  "🍪": { singular: "cookie", plural: "cookies" },
  "🍕": { singular: "pizza slice", plural: "pizza slices" },
  "🎈": { singular: "balloon", plural: "balloons" },
  "🦁": { singular: "lion", plural: "lions" },
  "🥚": { singular: "egg", plural: "eggs" },
  "🥕": { singular: "carrot", plural: "carrots" },
  "🐸": { singular: "frog", plural: "frogs" }
};

let activeSequence = null;

function capitalize(text) {
  if (!text) {
    return text;
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getItemLabel(emoji, override) {
  if (override) {
    const plural = override.endsWith("s") ? override : `${override}s`;
    return { singular: override, plural };
  }
  return ITEM_LABELS[emoji] || { singular: "object", plural: "objects" };
}

function numberWord(value) {
  return NUMBER_WORDS[value] ?? String(value);
}

export function buildCorrectFeedback(expected) {
  const word = numberWord(expected);
  return `Wonderful! Yes! ${capitalize(word)} is correct! You are doing amazing!`;
}

export function buildWrongFeedback(expected) {
  const word = numberWord(expected);
  return `Not quite. The answer is ${expected}. Say ${word} again.`;
}

export function buildAnswerPrompt(expected) {
  const word = numberWord(expected);
  return `Your turn! Say ${word}. Tap ${expected} or use the microphone.`;
}

export function buildAnswerReprompt(expected) {
  const word = numberWord(expected);
  return `Pardon me, I am still waiting. Please say ${word} clearly, or tap ${expected} on the screen.`;
}

export const ANSWER_SILENCE_MS = 6000;

function buildCountingSteps(slide, lesson, slideIndex) {
  const visual = slide.visual;
  const count = visual.count;
  const labels = getItemLabel(visual.item, visual.itemLabel);
  const steps = [];

  if (slideIndex === 0) {
    steps.push({
      delayBefore: 500,
      text: `Hello boys and girls! I am ${TEACHER_NAME}, your math teacher. Welcome to ${lesson.title}! We will learn step by step, nice and slow.`,
      reveal: 0,
      pauseAfter: 500
    });
  } else {
    steps.push({
      delayBefore: 400,
      text: `${slide.title}. Listen carefully and watch the whiteboard.`,
      reveal: 0,
      pauseAfter: 400
    });
  }

  steps.push({
    delayBefore: 300,
    text: `Look at the whiteboard. I am drawing ${count} ${labels.plural}. Point to each ${labels.singular} with your finger as we count.`,
    reveal: 0,
    pauseAfter: 500
  });

  for (let index = 1; index <= count; index += 1) {
    const word = numberWord(index);
    steps.push({
      delayBefore: index === 1 ? 350 : 250,
      text:
        index === 1
          ? `One! Here is one ${labels.singular}. Look at the board.`
          : `${capitalize(word)}! Now we have ${word} ${labels.plural} on the board.`,
      reveal: index,
      pauseAfter: 450,
      rate: 0.68
    });
    steps.push({
      delayBefore: 200,
      text: `Your turn! Say ${word}.`,
      reveal: index,
      waitForAnswer: index,
      pauseAfter: 350,
      rate: 0.72
    });
  }

  steps.push({
    delayBefore: 350,
    text: `How many ${labels.plural} did we count altogether? Say the total number.`,
    reveal: count,
    waitForAnswer: count,
    pauseAfter: 400
  });

  steps.push({
    delayBefore: 250,
    text: `Yes! ${capitalize(numberWord(count))}! There are ${count} ${labels.plural}. ${slide.tip}`,
    reveal: count,
    pauseAfter: 300
  });

  return steps;
}

function buildCelebrateSteps(slide) {
  return [
    {
      delayBefore: 400,
      text: `Wonderful job! ${slide.body}`,
      reveal: 1,
      pauseAfter: 500
    },
    {
      delayBefore: 200,
      text: slide.tip,
      reveal: 1,
      pauseAfter: 300
    }
  ];
}

function buildSimpleSteps(slide, lesson, slideIndex) {
  const intro =
    slideIndex === 0
      ? `Hello boys and girls! I am ${TEACHER_NAME}, your math teacher. Welcome to ${lesson.title}! `
      : "";

  return [
    {
      delayBefore: 400,
      text: `${intro}${slide.title}. ${slide.body} Remember this: ${slide.tip}`,
      reveal: null,
      pauseAfter: 300
    }
  ];
}

export function buildSlideSpeechPlan(slide, lesson, slideIndex = 0) {
  if (Array.isArray(slide.narrationSteps) && slide.narrationSteps.length > 0) {
    return { mode: "sequence", steps: slide.narrationSteps };
  }

  const visual = slide.visual;
  if (visual?.type === "dots" || visual?.type === "match") {
    return { mode: "sequence", steps: buildCountingSteps(slide, lesson, slideIndex) };
  }

  if (visual?.type === "celebrate") {
    return { mode: "sequence", steps: buildCelebrateSteps(slide) };
  }

  if (slide.narration) {
    return { mode: "single", text: slide.narration };
  }

  return { mode: "sequence", steps: buildSimpleSteps(slide, lesson, slideIndex) };
}

export function buildSlideNarration(slide, lesson, slideIndex = 0) {
  const plan = buildSlideSpeechPlan(slide, lesson, slideIndex);
  if (plan.mode === "single") {
    return plan.text;
  }
  return plan.steps.map((step) => step.text).join(" ");
}

export function speakLessonFeedback(text, callbacks = {}) {
  Speech.stop();
  Speech.speak(text, {
    ...SPEECH_OPTIONS,
    onDone: callbacks.onDone,
    onStopped: callbacks.onDone,
    onError: callbacks.onDone
  });
}

export function speakLesson(text, callbacks = {}) {
  stopLessonSpeech();
  Speech.speak(text, {
    ...SPEECH_OPTIONS,
    onDone: callbacks.onDone,
    onStopped: callbacks.onDone,
    onError: callbacks.onDone
  });
}

export function speakLessonSequence(steps, callbacks = {}) {
  stopLessonSpeech();

  let cancelled = false;
  let stepIndex = 0;
  let delayTimer = null;
  let pauseTimer = null;
  let continueNext = null;

  function cleanup() {
    cancelled = true;
    continueNext = null;
    if (delayTimer) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }
    if (pauseTimer) {
      clearTimeout(pauseTimer);
      pauseTimer = null;
    }
    Speech.stop();
    activeSequence = null;
  }

  function finish() {
    cleanup();
    callbacks.onDone?.();
  }

  function speakNext() {
    if (cancelled || stepIndex >= steps.length) {
      finish();
      return;
    }

    const step = steps[stepIndex];
    stepIndex += 1;

    delayTimer = setTimeout(() => {
      if (cancelled) {
        return;
      }

      callbacks.onStepStart?.(step, stepIndex - 1);

      Speech.speak(step.text, {
        ...SPEECH_OPTIONS,
        rate: step.rate ?? SPEECH_OPTIONS.rate,
        onDone: () => {
          if (cancelled) {
            return;
          }
          callbacks.onStepEnd?.(step, stepIndex - 1);

          if (step.waitForAnswer != null) {
            continueNext = () => {
              continueNext = null;
              pauseTimer = setTimeout(speakNext, step.pauseAfter ?? 300);
            };
            callbacks.onWaitForAnswer?.(step, continueNext);
            return;
          }

          pauseTimer = setTimeout(speakNext, step.pauseAfter ?? 350);
        },
        onStopped: finish,
        onError: () => {
          if (!cancelled) {
            pauseTimer = setTimeout(speakNext, step.pauseAfter ?? 200);
          }
        }
      });
    }, step.delayBefore ?? 0);
  }

  activeSequence = {
    stop: cleanup,
    continue: () => {
      if (continueNext) {
        continueNext();
      }
    }
  };
  speakNext();
  return activeSequence;
}

export function continueLessonSequence() {
  activeSequence?.continue?.();
}

export function stopLessonSpeech() {
  activeSequence?.stop();
  activeSequence = null;
  Speech.stop();
}

export async function getIsSpeaking() {
  return Speech.isSpeakingAsync();
}

export function buildLessonIntro(lesson) {
  return `Welcome to ${lesson.title}! ${lesson.subtitle} Listen carefully and watch the whiteboard.`;
}

export function buildLessonOutro(lesson) {
  return `Wonderful work! You finished ${lesson.title}. Your matching games are ready in Math Talk!`;
}

export function getBoardCountLabel(visual) {
  if (!visual || (visual.type !== "dots" && visual.type !== "match")) {
    return "Count each one:";
  }
  const labels = getItemLabel(visual.item, visual.itemLabel);
  return `Count each ${labels.singular}:`;
}
