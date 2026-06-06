import * as Speech from "expo-speech";

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

function buildCountingSteps(slide, lesson, slideIndex) {
  const visual = slide.visual;
  const count = visual.count;
  const labels = getItemLabel(visual.item, visual.itemLabel);
  const steps = [];

  if (slideIndex === 0) {
    steps.push({
      delayBefore: 500,
      text: `Hello boys and girls! I am Teacher Maya. Welcome to ${lesson.title}! We will learn step by step, nice and slow.`,
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
          ? `One! Here is one ${labels.singular}. Say one with me. One.`
          : `${capitalize(word)}! That is ${word} ${labels.plural}. Say ${word}.`,
      reveal: index,
      pauseAfter: index === count ? 650 : 500,
      rate: 0.68
    });
  }

  steps.push({
    delayBefore: 350,
    text: `Great counting! We found ${count} ${labels.plural}. The last number we said is ${numberWord(count)}. So the answer is ${count}!`,
    reveal: count,
    pauseAfter: 450
  });

  steps.push({
    delayBefore: 250,
    text: slide.tip,
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
      ? `Hello boys and girls! I am Teacher Maya. Welcome to ${lesson.title}! `
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

  function cleanup() {
    cancelled = true;
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

  activeSequence = { stop: cleanup };
  speakNext();
  return activeSequence;
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
  return `Wonderful work! You finished ${lesson.title}. Your matching games are ready in the math garden!`;
}

export function getBoardCountLabel(visual) {
  if (!visual || (visual.type !== "dots" && visual.type !== "match")) {
    return "Count each one:";
  }
  const labels = getItemLabel(visual.item, visual.itemLabel);
  return `Count each ${labels.singular}:`;
}
