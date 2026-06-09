import { EXTRA_LESSONS } from "./lessonsExtra";

const CORE_LESSON_DEFS = [
  {
    id: "counting",
    category: "counting",
    title: "Counting Class",
    subtitle: "Learn to count objects!",
    emoji: "🔢",
    gradient: ["#93C5FD", "#3B82F6"],
    unlockAfter: null,
    slides: [
      {
        title: "What is Counting?",
        emoji: "🌻",
        body: "Counting means saying numbers in order — one, two, three — to find how many things you have.",
        tip: "Each flower gets its own number. Do not skip any!",
        visual: { type: "dots", count: 5, item: "🌸", itemLabel: "flower" }
      },
      {
        title: "Touch Each One",
        emoji: "👆",
        body: "Point to each apple on the board and say the next number out loud.",
        tip: "Go slow and steady — that is how big kids count!",
        visual: { type: "dots", count: 4, item: "🍎", itemLabel: "apple" }
      },
      {
        title: "Numbers Match Groups",
        emoji: "🎯",
        body: "Three stars on the board means the number 3. The last number you say tells you how many there are.",
        tip: "When you finish counting, that last number is your answer!",
        visual: { type: "match", count: 3, item: "⭐", itemLabel: "star" }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You learned to count! Dot-counting games like Number Match Garden are unlocked for you now.",
        tip: "Next time, try Shapes Class to learn circles, squares, and triangles!",
        visual: { type: "celebrate", emoji: "🌈" }
      }
    ]
  },
  {
    id: "addition",
    category: "addition",
    title: "Addition Class",
    subtitle: "Learn what plus (+) means!",
    emoji: "➕",
    gradient: ["#86EFAC", "#22C55E"],
    unlockAfter: "evenOdd",
    slides: [
      {
        title: "What is Addition?",
        emoji: "🍎",
        body: "Addition means putting groups together to find the total — how many altogether.",
        tip: "We write it with the + sign, which means “and”.",
        narration:
          "Hello! Today we learn addition. Addition means putting groups together to find how many altogether. Look at the whiteboard. We use the plus sign, and it means and.",
        visual: { type: "groups", left: 2, right: 1, symbol: "+", item: "🍎" }
      },
      {
        title: "Put Them Together",
        emoji: "🤝",
        body: "2 apples and 1 apple make 3 apples. You combined both groups!",
        tip: "2 + 1 = 3",
        visual: { type: "equation", parts: ["2", "+", "1", "=", "3"], highlight: "3" }
      },
      {
        title: "Bigger Example",
        emoji: "🐝",
        body: "3 bees join 2 more bees. Count all the bees together!",
        tip: "3 + 2 = 5",
        visual: { type: "groups", left: 3, right: 2, symbol: "+", item: "🐝" }
      },
      {
        title: "The Plus Sign",
        emoji: "➕",
        body: "The + sign tells you to add. Read it as “plus” or “and”.",
        tip: "4 + 2 means start with 4, then add 2 more.",
        visual: { type: "equation", parts: ["4", "+", "2", "=", "6"], highlight: "6" }
      },
      {
        title: "Class Complete!",
        emoji: "🚀",
        body: "You know what addition means! Now play addition games to practice.",
        tip: "Aim for 8 or more correct answers to pass each level!",
        visual: { type: "celebrate", emoji: "🚀" }
      }
    ]
  },
  {
    id: "subtraction",
    category: "subtraction",
    title: "Subtraction Class",
    subtitle: "Learn what minus (−) means!",
    emoji: "➖",
    gradient: ["#93C5FD", "#6366F1"],
    unlockAfter: "addition",
    slides: [
      {
        title: "What is Subtraction?",
        emoji: "🍪",
        body: "Subtraction means taking away. You start with some and remove a part.",
        tip: "We use the − sign, which means “take away”.",
        visual: { type: "takeaway", start: 5, remove: 2, item: "🍪" }
      },
      {
        title: "What's Left?",
        emoji: "🦁",
        body: "You had 5 cookies. You ate 2. How many are left?",
        tip: "5 − 2 = 3",
        visual: { type: "equation", parts: ["5", "−", "2", "=", "3"], highlight: "3" }
      },
      {
        title: "Count What's Left",
        emoji: "🎈",
        body: "4 balloons and 1 flies away. Count the balloons that stay.",
        tip: "4 − 1 = 3",
        visual: { type: "takeaway", start: 4, remove: 1, item: "🎈" }
      },
      {
        title: "Minus Means Less",
        emoji: "➖",
        body: "Subtraction always makes the number smaller (unless you subtract zero).",
        tip: "7 − 3 = 4",
        visual: { type: "equation", parts: ["7", "−", "3", "=", "4"], highlight: "4" }
      },
      {
        title: "Class Complete!",
        emoji: "🦁",
        body: "Awesome! You understand subtraction. Time to play subtraction games!",
        tip: "Remember: take away, then count what's left.",
        visual: { type: "celebrate", emoji: "🦁" }
      }
    ]
  },
  {
    id: "multiplication",
    category: "multiplication",
    title: "Multiplication Class",
    subtitle: "Learn what times (×) means!",
    emoji: "✖️",
    gradient: ["#F9A8D4", "#EC4899"],
    unlockAfter: "subtraction",
    slides: [
      {
        title: "What is Multiplication?",
        emoji: "🌸",
        body: "Multiplication is adding the same number again and again — equal groups!",
        tip: "3 × 2 means three groups of two.",
        visual: { type: "groupsRepeat", groups: 3, perGroup: 2, item: "🌸" }
      },
      {
        title: "Equal Groups",
        emoji: "🥚",
        body: "2 bags with 3 eggs each. Count all the eggs: 3 + 3 = 6.",
        tip: "3 × 2 = 6 (or 2 × 3 = 6)",
        visual: { type: "groupsRepeat", groups: 2, perGroup: 3, item: "🥚" }
      },
      {
        title: "The Times Sign",
        emoji: "✖️",
        body: "The × sign means “groups of”. 4 × 2 means 4 groups of 2.",
        tip: "4 × 2 = 8",
        visual: { type: "equation", parts: ["4", "×", "2", "=", "8"], highlight: "8" }
      },
      {
        title: "Skip Counting",
        emoji: "🐸",
        body: "Multiplying by 2 is like counting by twos: 2, 4, 6, 8…",
        tip: "5 × 2 = 10 — five jumps of two!",
        visual: { type: "skip", step: 2, times: 5, item: "🐸" }
      },
      {
        title: "Class Complete!",
        emoji: "🌸",
        body: "You get multiplication! Play times-table games to grow stronger.",
        tip: "Think “groups of” whenever you see ×.",
        visual: { type: "celebrate", emoji: "🗼" }
      }
    ]
  },
  {
    id: "division",
    category: "division",
    title: "Division Class",
    subtitle: "Learn what divide (÷) means!",
    emoji: "➗",
    gradient: ["#FDBA74", "#F97316"],
    unlockAfter: "multiplication",
    slides: [
      {
        title: "What is Division?",
        emoji: "🍕",
        body: "Division means sharing equally. Split a total into same-size groups.",
        tip: "We use the ÷ sign — “shared equally”.",
        visual: { type: "share", total: 6, groups: 2, item: "🍕" }
      },
      {
        title: "Fair Shares",
        emoji: "🏜️",
        body: "6 crackers shared by 2 friends — each friend gets 3.",
        tip: "6 ÷ 2 = 3",
        visual: { type: "equation", parts: ["6", "÷", "2", "=", "3"], highlight: "3" }
      },
      {
        title: "How Many in Each?",
        emoji: "🐰",
        body: "8 carrots for 4 bunnies. Each bunny gets the same amount.",
        tip: "8 ÷ 4 = 2 carrots each",
        visual: { type: "share", total: 8, groups: 4, item: "🥕" }
      },
      {
        title: "Division Checks Multiplication",
        emoji: "🔄",
        body: "If 3 × 4 = 12, then 12 ÷ 4 = 3. They are math partners!",
        tip: "12 ÷ 3 = 4 too!",
        visual: { type: "equation", parts: ["12", "÷", "3", "=", "4"], highlight: "4" }
      },
      {
        title: "Class Complete!",
        emoji: "🏜️",
        body: "You learned division! Share-and-split games await you.",
        tip: "Ask: “How many in each group?” when you divide.",
        visual: { type: "celebrate", emoji: "➗" }
      }
    ]
  }
];

const CORE_LESSONS = [
  CORE_LESSON_DEFS[0],
  CORE_LESSON_DEFS[1],
  CORE_LESSON_DEFS[2],
  CORE_LESSON_DEFS[3],
  CORE_LESSON_DEFS[4]
];

export { CORE_LESSONS };

export const LESSONS = [
  CORE_LESSONS[0],
  EXTRA_LESSONS[0],
  EXTRA_LESSONS[1],
  EXTRA_LESSONS[2],
  CORE_LESSONS[1],
  CORE_LESSONS[2],
  CORE_LESSONS[3],
  CORE_LESSONS[4],
  EXTRA_LESSONS[3],
  EXTRA_LESSONS[4],
  EXTRA_LESSONS[5],
  EXTRA_LESSONS[6],
  EXTRA_LESSONS[7],
  EXTRA_LESSONS[8],
  EXTRA_LESSONS[9]
];

export const ALL_LESSONS = LESSONS;

const LESSON_MAP = Object.fromEntries(LESSONS.map((lesson) => [lesson.id, lesson]));

export const CATEGORY_LESSON = {
  counting: "counting",
  shapes: "shapes",
  addition: "addition",
  subtraction: "subtraction",
  multiplication: "multiplication",
  division: "division"
};

export function getLesson(lessonId) {
  return LESSON_MAP[lessonId] || LESSONS[0];
}

export function getLessonForCategory(categoryId) {
  const lessonId = CATEGORY_LESSON[categoryId];
  return lessonId ? getLesson(lessonId) : null;
}

export function getLessonProgress(progress, lessonId) {
  return progress?.lessons?.[lessonId] || { completed: false, slide: 0 };
}

export function getResumeSlideIndex(progress, lessonId) {
  if (isLessonComplete(progress, lessonId)) {
    return 0;
  }

  const lesson = getLesson(lessonId);
  const saved = getLessonProgress(progress, lessonId).slide ?? 0;
  return Math.max(0, Math.min(saved, lesson.slides.length - 1));
}

export function saveLessonCheckpoint(progress, lessonId, slideIndex) {
  if (isLessonComplete(progress, lessonId)) {
    return progress;
  }

  const lesson = getLesson(lessonId);
  const clamped = Math.max(0, Math.min(slideIndex, lesson.slides.length - 1));
  const next = {
    ...progress,
    lessons: { ...progress.lessons }
  };
  const current = getLessonProgress(next, lessonId);
  next.lessons[lessonId] = {
    ...current,
    slide: clamped
  };
  return next;
}

export function markLessonStepComplete(progress, lessonId, completedSlideIndex) {
  return saveLessonCheckpoint(progress, lessonId, completedSlideIndex + 1);
}

export function isLessonComplete(progress, lessonId) {
  return Boolean(getLessonProgress(progress, lessonId).completed);
}

export function isLessonUnlocked(progress, lessonId) {
  const lesson = getLesson(lessonId);
  if (!lesson.unlockAfter) {
    return true;
  }
  return isLessonComplete(progress, lesson.unlockAfter);
}

export function getLessonUnlockHint(lessonId) {
  const lesson = getLesson(lessonId);
  if (!lesson.unlockAfter) {
    return null;
  }
  const prev = getLesson(lesson.unlockAfter);
  return `Finish ${prev.title} first!`;
}

export function recordLessonSlide(progress, lessonId, slideIndex) {
  if (isLessonComplete(progress, lessonId)) {
    return progress;
  }

  const next = {
    ...progress,
    lessons: { ...progress.lessons }
  };
  const current = getLessonProgress(next, lessonId);
  next.lessons[lessonId] = {
    ...current,
    slide: Math.max(current.slide || 0, slideIndex)
  };
  return next;
}

export function completeLesson(progress, lessonId) {
  if (isLessonComplete(progress, lessonId)) {
    return progress;
  }

  const next = recordLessonSlide(progress, lessonId, getLesson(lessonId).slides.length - 1);
  next.lessons[lessonId] = {
    ...next.lessons[lessonId],
    completed: true,
    completedAt: Date.now()
  };
  return next;
}

export function getCompletedLessonCount(progress) {
  return LESSONS.filter((lesson) => isLessonComplete(progress, lesson.id)).length;
}

export function getLessonForGameCategory(categoryId) {
  return getLessonForCategory(categoryId);
}
