import { LESSONS, getLesson, isLessonComplete, isLessonUnlocked, getLessonUnlockHint } from "./lessons";

export const LESSON_BY_CATEGORY = {
  counting: "counting",
  shapes: "shapes",
  compare: "compare",
  evenOdd: "evenOdd",
  addition: "addition",
  subtraction: "subtraction",
  multiplication: "multiplication",
  division: "division",
  patterns: "patterns",
  mixed: "mixed",
  bodmas: "bodmasFull",
  challenge: "challenge"
};

export const GAME_LESSON_OVERRIDES = {
  match: "counting",
  dotsTiny: "counting",
  dotsBig: "counting",
  compare: "compare",
  smaller: "compare",
  compareBig: "compare",
  pickOdd: "evenOdd",
  pickEven: "evenOdd",
  bodmasBracketBasics: "bodmasBrackets",
  bodmasBracketTimes: "bodmasBrackets",
  bodmasMulFirst: "bodmasMulDiv",
  bodmasDivFirst: "bodmasMulDiv",
  bodmasSubtractMix: "bodmasMulDiv",
  bodmasFullMix: "bodmasFull",
  bodmasMaster: "bodmasFull",
  bodmasOrderQuiz: "bodmasIntro"
};

export function resolveLessonId(game) {
  return GAME_LESSON_OVERRIDES[game.id] || LESSON_BY_CATEGORY[game.category] || "counting";
}

export function attachLessonIds(games) {
  return games.map((game) => ({
    ...game,
    lessonId: resolveLessonId(game)
  }));
}

export function getLessonForGame(game) {
  const lessonId = game.lessonId || resolveLessonId(game);
  return getLesson(lessonId);
}

export function isGameUnlockedByLesson(progress, game) {
  const lessonId = game.lessonId || resolveLessonId(game);
  return isLessonComplete(progress, lessonId);
}

export function getGameUnlockHint(progress, game) {
  const lessonId = game.lessonId || resolveLessonId(game);
  if (isLessonComplete(progress, lessonId)) {
    return null;
  }
  if (!isLessonUnlocked(progress, lessonId)) {
    return getLessonUnlockHint(lessonId);
  }
  const lesson = getLesson(lessonId);
  return `Finish ${lesson.title} to play this game! 🎧`;
}

export function getLessonGameSections(games) {
  return LESSONS.map((lesson) => ({
    ...lesson,
    games: games.filter((game) => (game.lessonId || resolveLessonId(game)) === lesson.id)
  })).filter((section) => section.games.length > 0);
}

export function getPlayableLessonTitles(progress, games) {
  return LESSONS.filter((lesson) => {
    const lessonGames = games.filter((game) => resolveLessonId(game) === lesson.id);
    return lessonGames.length > 0 && isLessonComplete(progress, lesson.id);
  }).map((lesson) => lesson.menuLabel || lesson.title.replace(" Class", ""));
}

export function getUnlockedGameCount(progress, games) {
  return games.filter((game) => isGameUnlockedByLesson(progress, game)).length;
}
