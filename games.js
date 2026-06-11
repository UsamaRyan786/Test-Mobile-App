import { attachLessonIds } from "./lessons";
import { BASIC_SHAPES, getShapeName } from "./shapes";

const MIN_NUMBER = 1;
const MAX_NUMBER = 10;

const GRADIENTS = [
  ["#86EFAC", "#22C55E"],
  ["#93C5FD", "#3B82F6"],
  ["#FDBA74", "#F97316"],
  ["#F9A8D4", "#EC4899"],
  ["#E879F9", "#A855F7"],
  ["#FCD34D", "#D97706"],
  ["#67E8F9", "#0891B2"],
  ["#C4B5FD", "#8B5CF6"],
  ["#5EEAD4", "#14B8A6"],
  ["#FDE047", "#EAB308"],
  ["#FDA4AF", "#F43F5E"],
  ["#A5B4FC", "#6366F1"],
  ["#CBD5E1", "#64748B"],
  ["#F0ABFC", "#D946EF"],
  ["#FCA5A5", "#EF4444"],
  ["#6EE7B7", "#10B981"],
  ["#7DD3FC", "#0284C7"],
  ["#F9A8D4", "#DB2777"],
  ["#FDE68A", "#CA8A04"],
  ["#A7F3D0", "#059669"]
];

const EMOJIS = [
  "🌻", "🚀", "🦁", "🌸", "🗼", "🏜️", "⚔️", "🏰", "🥷", "✨",
  "🪞", "🐸", "🔍", "🦇", "🎢", "🐝", "🦋", "🐞", "🐢", "🦊",
  "🐼", "🐨", "🦄", "🐙", "🦀", "🐳", "🌈", "⭐", "🔥", "💎",
  "🎯", "🎲", "🧩", "🎨", "🎵", "🏆", "🌙", "☀️", "🍎", "🍕",
  "⚡", "🌊", "🏔️", "🌺", "🍀", "🎪", "🛸", "🤖", "👾", "🧁"
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeChoices(value, min, max) {
  const choices = new Set([value]);
  while (choices.size < 4) {
    choices.add(Math.min(max, Math.max(min, value + randomInt(-3, 3))));
  }
  return shuffle([...choices]);
}

function makeChoicesFromRange(value, min, max) {
  const choices = new Set([value]);
  while (choices.size < 4) {
    choices.add(randomInt(min, max));
  }
  return shuffle([...choices]);
}

function pickGradient(index) {
  return GRADIENTS[index % GRADIENTS.length];
}

function pickEmoji(index) {
  return EMOJIS[index % EMOJIS.length];
}

function defineGame(index, fields) {
  return {
    gradient: pickGradient(index),
    accent: "#1E3A5F",
    category: "challenge",
    display: "equation",
    showEquals: true,
    wideText: false,
    sequenceText: false,
    instruction: "Pick the correct answer!",
    targetLabel: "🧮 Solve this",
    prompt: "Choose the correct answer!",
    config: {},
    ...fields
  };
}

function buildAdditionRound(config = {}) {
  const aMin = config.aMin ?? 1;
  const aMax = config.aMax ?? 8;
  const bMin = config.bMin ?? 1;
  const bMax = config.bMax ?? 8;
  const a = randomInt(aMin, aMax);
  const b = randomInt(bMin, bMax);
  const target = a + b;
  return {
    label: `${a} + ${b}`,
    target,
    choices: makeChoicesFromRange(target, config.choiceMin ?? 2, config.choiceMax ?? 20)
  };
}

function buildSubtractionRound(config = {}) {
  const bMin = config.bMin ?? 1;
  const bMax = config.bMax ?? 4;
  const b = randomInt(bMin, bMax);
  const aMin = config.aMin ?? b + 1;
  const aMax = config.aMax ?? 12;
  const a = randomInt(Math.max(aMin, b + 1), Math.max(aMax, b + 1));
  const target = a - b;
  return {
    label: `${a} - ${b}`,
    target,
    choices: makeChoicesFromRange(target, config.choiceMin ?? 1, config.choiceMax ?? 15)
  };
}

function buildMultiplicationRound(config = {}) {
  const fixedB = config.fixedB;
  const a = randomInt(config.aMin ?? 2, config.aMax ?? (fixedB ? 9 : 5));
  const b = fixedB ?? randomInt(config.bMin ?? 2, config.bMax ?? 5);
  const target = a * b;
  return {
    label: `${a} × ${b}`,
    target,
    choices: makeChoicesFromRange(target, config.choiceMin ?? 4, config.choiceMax ?? 81)
  };
}

function buildDivisionRound(config = {}) {
  const divisor = config.fixedDivisor ?? randomInt(config.divMin ?? 2, config.divMax ?? 5);
  const quotient = randomInt(config.qMin ?? 2, config.qMax ?? 5);
  const dividend = divisor * quotient;
  return {
    label: `${dividend} ÷ ${divisor}`,
    target: quotient,
    choices: makeChoicesFromRange(quotient, config.choiceMin ?? 1, config.choiceMax ?? 12)
  };
}

function buildMissingRound(config = {}) {
  const ops = config.ops ?? ["add", "sub", "mul", "div"];
  const op = ops[randomInt(0, ops.length - 1)];

  if (op === "add") {
    const a = randomInt(1, 8);
    const b = randomInt(1, 8);
    const sum = a + b;
    const hideFirst = randomInt(0, 1) === 1;
    const target = hideFirst ? a : b;
    const shown = hideFirst ? b : a;
    return {
      label: `? + ${shown} = ${sum}`,
      target,
      choices: makeChoicesFromRange(target, 1, 12)
    };
  }

  if (op === "sub") {
    const a = randomInt(5, 12);
    const b = randomInt(1, 4);
    const diff = a - b;
    if (randomInt(0, 1) === 1) {
      return {
        label: `${a} - ? = ${diff}`,
        target: b,
        choices: makeChoicesFromRange(b, 1, 12)
      };
    }
    return {
      label: `? - ${b} = ${diff}`,
      target: a,
      choices: makeChoicesFromRange(a, 1, 12)
    };
  }

  if (op === "mul") {
    const a = randomInt(2, 5);
    const b = randomInt(2, 5);
    const product = a * b;
    const hideFirst = randomInt(0, 1) === 1;
    const target = hideFirst ? a : b;
    const shown = hideFirst ? b : a;
    return {
      label: `? × ${shown} = ${product}`,
      target,
      choices: makeChoicesFromRange(target, 2, 12)
    };
  }

  const divisor = randomInt(2, 5);
  const quotient = randomInt(2, 5);
  const dividend = divisor * quotient;
  if (randomInt(0, 1) === 1) {
    return {
      label: `${dividend} ÷ ? = ${quotient}`,
      target: divisor,
      choices: makeChoicesFromRange(divisor, 2, 12)
    };
  }
  return {
    label: `? ÷ ${divisor} = ${quotient}`,
    target: dividend,
    choices: makeChoicesFromRange(dividend, 4, 25)
  };
}

function buildMixedRound(config = {}) {
  const builders = [];
  const ops = config.ops ?? ["add", "sub", "mul", "div"];
  if (ops.includes("add")) builders.push(() => buildAdditionRound(config.add));
  if (ops.includes("sub")) builders.push(() => buildSubtractionRound(config.sub));
  if (ops.includes("mul")) builders.push(() => buildMultiplicationRound(config.mul));
  if (ops.includes("div")) builders.push(() => buildDivisionRound(config.div));
  return builders[randomInt(0, builders.length - 1)]();
}

function buildCompareRound(config = {}) {
  const max = config.max ?? 12;
  const pick = config.pick ?? "max";
  const a = randomInt(1, max);
  let b = randomInt(1, max);
  while (b === a) b = randomInt(1, max);
  const target = pick === "min" ? Math.min(a, b) : Math.max(a, b);
  return {
    label: `${a}  vs  ${b}`,
    target,
    choices: makeChoicesFromRange(target, 1, max)
  };
}

function buildSequenceRound(config = {}) {
  const start = randomInt(config.startMin ?? 1, config.startMax ?? 6);
  const step =
    config.step ??
    randomInt(config.stepMin ?? 1, config.stepMax ?? 2);
  const seq = [start, start + step, start + step * 2];
  const target = start + step * 3;
  return {
    label: `${seq.join(", ")}, ?`,
    target,
    choices: makeChoicesFromRange(target, 1, config.choiceMax ?? 20)
  };
}

function buildMakeTotalRound(config = {}) {
  const total = config.total ?? 10;
  const a = randomInt(1, total - 1);
  const target = total - a;
  return {
    label: `${a} + ? = ${total}`,
    target,
    choices: makeChoicesFromRange(target, 1, total)
  };
}

function buildDoubleRound(config = {}) {
  const n = randomInt(config.min ?? 1, config.max ?? 8);
  const target = n * 2;
  return {
    label: config.label ?? `Double ${n}`,
    target,
    choices: makeChoicesFromRange(target, 2, config.choiceMax ?? 16)
  };
}

function buildTripleRound(config = {}) {
  const n = randomInt(config.min ?? 1, config.max ?? 6);
  const target = n * 3;
  return {
    label: `Triple ${n}`,
    target,
    choices: makeChoicesFromRange(target, 3, config.choiceMax ?? 18)
  };
}

function buildHalfRound(config = {}) {
  const n = randomInt(config.min ?? 2, config.max ?? 12) * 2;
  const target = n / 2;
  return {
    label: `Half of ${n}`,
    target,
    choices: makeChoicesFromRange(target, 1, config.choiceMax ?? 12)
  };
}

function buildSquareRound(config = {}) {
  const n = randomInt(config.min ?? 2, config.max ?? 6);
  const target = n * n;
  return {
    label: `${n} × ${n}`,
    target,
    choices: makeChoicesFromRange(target, 4, config.choiceMax ?? 36)
  };
}

function buildBeforeAfterRound(config = {}) {
  const mode = config.mode ?? "both";
  const n = randomInt(config.min ?? 2, config.max ?? 9);

  if (mode === "before") {
    return {
      label: `Before ${n} comes ?`,
      target: n - 1,
      choices: makeChoicesFromRange(n - 1, 1, Math.max(10, n))
    };
  }
  if (mode === "after") {
    return {
      label: `After ${n} comes ?`,
      target: n + 1,
      choices: makeChoicesFromRange(n + 1, 1, Math.max(12, n + 2))
    };
  }
  if (mode === "between") {
    const lowMin = config.min ?? 2;
    const lowMax = config.max ?? 8;
    const low = randomInt(lowMin, lowMax);
    return {
      label: `Between ${low} and ${low + 2} ?`,
      target: low + 1,
      choices: makeChoicesFromRange(low + 1, 1, Math.max(12, low + 3))
    };
  }

  if (randomInt(0, 1) === 1) {
    return buildBeforeAfterRound({ ...config, mode: "after" });
  }
  return buildBeforeAfterRound({ ...config, mode: "before" });
}

function buildDotsRound(config = {}) {
  const min = config.min ?? MIN_NUMBER;
  const max = config.max ?? MAX_NUMBER;
  const target = randomInt(min, max);
  return {
    label: `${target} dots`,
    target,
    choices: makeChoices(target, min, max)
  };
}

function buildAddThreeRound(config = {}) {
  const a = randomInt(1, 5);
  const b = randomInt(1, 5);
  const c = randomInt(1, 4);
  const target = a + b + c;
  return {
    label: `${a} + ${b} + ${c}`,
    target,
    choices: makeChoicesFromRange(target, 3, config.choiceMax ?? 20)
  };
}

function buildParityRound(config = {}) {
  const wantOdd = config.parity === "odd";
  const target = wantOdd ? randomInt(0, 9) * 2 + 1 : randomInt(1, 9) * 2;
  const choices = new Set([target]);

  while (choices.size < 4) {
    const n = randomInt(1, 20);
    const isOdd = n % 2 === 1;
    if (isOdd !== wantOdd) {
      choices.add(n);
    }
  }

  return {
    label: wantOdd ? "Pick an odd number" : "Pick an even number",
    target,
    choices: shuffle([...choices])
  };
}

function buildSubSameRound() {
  const a = randomInt(3, 12);
  return {
    label: `${a} - ${a}`,
    target: 0,
    choices: makeChoicesFromRange(0, 0, 4)
  };
}

function buildCountBackRound() {
  const start = randomInt(6, 12);
  const seq = [start, start - 1, start - 2];
  const target = start - 3;
  return {
    label: `${seq.join(", ")}, ?`,
    target,
    choices: makeChoicesFromRange(target, 1, 12)
  };
}

function buildMultiplyByRound(config = {}) {
  const factor = config.factor ?? 0;
  const n = randomInt(config.min ?? 1, config.max ?? 9);
  const target = n * factor;
  return {
    label: `${n} × ${factor}`,
    target,
    choices: makeChoicesFromRange(target, 0, config.choiceMax ?? 20)
  };
}

function buildDivideSimpleRound(config = {}) {
  const n = randomInt(config.min ?? 2, config.max ?? 9);
  const target = config.divisor === 1 ? n : n;
  return {
    label: `${n} ÷ ${config.divisor ?? 1}`,
    target,
    choices: makeChoicesFromRange(target, 1, config.choiceMax ?? 12)
  };
}

function makeShapeNameChoices(shapeId, pool = BASIC_SHAPES) {
  const choices = new Set([shapeId]);
  while (choices.size < 4) {
    choices.add(pool[randomInt(0, pool.length - 1)].id);
  }
  return shuffle([...choices]);
}

function buildShapeNameRound(config = {}) {
  const pool = config.shapes ?? BASIC_SHAPES;
  const shape = pool[randomInt(0, pool.length - 1)];
  return {
    label: shape.emoji,
    shapeEmoji: shape.emoji,
    target: shape.id,
    choices: makeShapeNameChoices(shape.id, pool),
    choiceType: "shapeName"
  };
}

function buildShapeSidesRound(config = {}) {
  const pool = (config.shapes ?? BASIC_SHAPES).filter((shape) => shape.sides >= 3);
  const shape = pool[randomInt(0, pool.length - 1)];
  const target = shape.sides;
  return {
    label: shape.emoji,
    shapeEmoji: shape.emoji,
    target,
    choices: makeChoicesFromRange(target, Math.max(0, target - 2), target + 3),
    choiceType: "number"
  };
}

function buildShapeCountRound(config = {}) {
  const min = config.min ?? 1;
  const max = config.max ?? 8;
  const target = randomInt(min, max);
  const shape = BASIC_SHAPES[randomInt(0, BASIC_SHAPES.length - 1)];
  return {
    label: `${shape.emoji} × ${target}`,
    shapeEmoji: shape.emoji,
    shapeCount: target,
    target,
    choices: makeChoicesFromRange(target, min, max + 2),
    choiceType: "number"
  };
}

function buildBodmasRound(config = {}) {
  const kind =
    config.kind ||
    ["bracket_add", "bracket_mul", "md_first", "md_sub", "div_add", "full"][randomInt(0, 5)];

  if (kind === "bracket_add") {
    const a = randomInt(1, 4);
    const b = randomInt(1, 4);
    const c = randomInt(1, 5);
    const target = a + b + c;
    return {
      label: `(${a} + ${b}) + ${c}`,
      target,
      choices: makeChoicesFromRange(target, Math.max(1, target - 4), target + 6)
    };
  }

  if (kind === "bracket_mul") {
    const a = randomInt(1, 4);
    const b = randomInt(1, 4);
    const c = randomInt(2, 4);
    const target = (a + b) * c;
    return {
      label: `(${a} + ${b}) × ${c}`,
      target,
      choices: makeChoicesFromRange(target, Math.max(1, target - 5), target + 8)
    };
  }

  if (kind === "md_first") {
    const a = randomInt(1, 6);
    const b = randomInt(2, 4);
    const c = randomInt(2, 4);
    const target = a + b * c;
    return {
      label: `${a} + ${b} × ${c}`,
      target,
      choices: makeChoicesFromRange(target, Math.max(1, target - 5), target + 8)
    };
  }

  if (kind === "md_sub") {
    const b = randomInt(2, 4);
    const c = randomInt(2, 4);
    const target = randomInt(2, 8);
    const a = target + b * c;
    return {
      label: `${a} − ${b} × ${c}`,
      target,
      choices: makeChoicesFromRange(target, Math.max(0, target - 4), target + 6)
    };
  }

  if (kind === "div_add") {
    const divisor = randomInt(2, 4);
    const quotient = randomInt(2, 5);
    const add = randomInt(1, 4);
    const dividend = divisor * quotient;
    const target = quotient + add;
    return {
      label: `${dividend} ÷ ${divisor} + ${add}`,
      target,
      choices: makeChoicesFromRange(target, Math.max(1, target - 3), target + 6)
    };
  }

  if (kind === "full") {
    const a = randomInt(1, 3);
    const b = randomInt(1, 3);
    const c = randomInt(2, 3);
    const d = randomInt(1, 4);
    const target = (a + b) * c + d;
    return {
      label: `(${a} + ${b}) × ${c} + ${d}`,
      target,
      choices: makeChoicesFromRange(target, Math.max(1, target - 6), target + 10)
    };
  }

  const a = randomInt(2, 5);
  const b = randomInt(2, 4);
  const c = randomInt(2, 4);
  const target = a + b * c;
  return {
    label: `${a} + ${b} × ${c}`,
    target,
    choices: makeChoicesFromRange(target, Math.max(1, target - 5), target + 8)
  };
}

/** Extra round builders & games for Pakistani curriculum classes. */

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
  "ten"
];

const STORY_NAMES = ["Ali", "Sara", "Ahmed", "Fatima", "Hassan", "Ayesha"];
const STORY_ITEMS = ["apples", "mangoes", "books", "stickers", "biscuits", "balloons"];

function buildNumberWordRound(config = {}) {
  const min = config.min ?? 0;
  const max = config.max ?? 10;
  const target = randomInt(min, max);
  return {
    label: NUMBER_WORDS[target],
    target,
    choices: makeChoicesFromRange(target, min, max)
  };
}

function buildTimeHourRound(config = {}) {
  const hour = randomInt(config.min ?? 1, config.max ?? 12);
  const halfPast = config.halfPast;
  const label = halfPast ? `🕧 ${hour}:30` : `🕐 ${hour} o'clock`;
  return {
    label,
    target: hour,
    choices: makeChoicesFromRange(hour, 1, 12)
  };
}

function buildMoneyAddRound(config = {}) {
  const a = randomInt(config.aMin ?? 1, config.aMax ?? 10);
  const b = randomInt(config.bMin ?? 1, config.bMax ?? 10);
  const target = a + b;
  return {
    label: `Rs. ${a} + Rs. ${b}`,
    target,
    choices: makeChoicesFromRange(target, config.choiceMin ?? 2, config.choiceMax ?? 20)
  };
}

function buildQuarterRound(config = {}) {
  const n = randomInt(config.min ?? 1, config.max ?? 8) * 4;
  const target = n / 4;
  return {
    label: `Quarter of ${n}`,
    target,
    choices: makeChoicesFromRange(target, 1, config.choiceMax ?? 12)
  };
}

function buildDecimalTenthsRound(config = {}) {
  const a = randomInt(1, 8);
  const b = randomInt(1, Math.min(9 - a, 8));
  const targetTenths = a + b;
  return {
    label: `0.${a} + 0.${b}`,
    target: targetTenths,
    choices: makeChoicesFromRange(targetTenths, 2, 18),
    choiceType: "decimalTenth"
  };
}

function buildDecimalCompareRound(config = {}) {
  const max = config.max ?? 9;
  const a = randomInt(1, max);
  let b = randomInt(1, max);
  while (b === a) {
    b = randomInt(1, max);
  }
  const pickMax = config.pick !== "min";
  const target = pickMax ? Math.max(a, b) : Math.min(a, b);
  return {
    label: `0.${a}  vs  0.${b}`,
    target,
    choices: makeChoicesFromRange(target, 1, max),
    choiceType: "decimalTenth"
  };
}

function buildPercentOfRound(config = {}) {
  const percents = config.percents ?? [10, 25, 50];
  const pct = percents[randomInt(0, percents.length - 1)];
  const multiplier = 100 / pct;
  const base = randomInt(1, Math.min(10, config.baseMax ?? 10)) * multiplier;
  const target = (base * pct) / 100;
  return {
    label: `${pct}% of ${base}`,
    target,
    choices: makeChoicesFromRange(target, 1, config.choiceMax ?? 50)
  };
}

function buildAlgebraRound(config = {}) {
  const add = randomInt(config.addMin ?? 1, config.addMax ?? 9);
  const x = randomInt(config.xMin ?? 1, config.xMax ?? 12);
  const total = x + add;
  return {
    label: `x + ${add} = ${total}`,
    target: x,
    choices: makeChoicesFromRange(x, 1, config.choiceMax ?? 15),
    display: "sequence",
    sequenceText: true,
    showEquals: false
  };
}

function buildPerimeterRound(config = {}) {
  const shape = config.shape ?? (randomInt(0, 1) === 0 ? "square" : "rectangle");
  if (shape === "rectangle") {
    const length = randomInt(2, 8);
    const width = randomInt(2, 6);
    const target = 2 * (length + width);
    return {
      label: `Rectangle ${length} cm × ${width} cm — perimeter?`,
      target,
      choices: makeChoicesFromRange(target, 8, config.choiceMax ?? 40)
    };
  }
  const side = randomInt(2, 9);
  const target = side * 4;
  return {
    label: `Square side ${side} cm — perimeter?`,
    target,
    choices: makeChoicesFromRange(target, 8, config.choiceMax ?? 40)
  };
}

function buildWordProblemRound(config = {}) {
  const op = config.op ?? "add";
  const name = STORY_NAMES[randomInt(0, STORY_NAMES.length - 1)];
  const item = STORY_ITEMS[randomInt(0, STORY_ITEMS.length - 1)];

  if (op === "sub") {
    const b = randomInt(1, 5);
    const a = randomInt(b + 1, 12);
    const target = a - b;
    return {
      label: `${name} had ${a} ${item} and ate ${b}. How many left?`,
      target,
      choices: makeChoicesFromRange(target, 0, config.choiceMax ?? 15)
    };
  }

  const a = randomInt(1, config.aMax ?? 8);
  const b = randomInt(1, config.bMax ?? 8);
  const target = a + b;
  return {
    label: `${name} has ${a} ${item} and gets ${b} more. How many altogether?`,
    target,
    choices: makeChoicesFromRange(target, 2, config.choiceMax ?? 20)
  };
}

/** Games with lessonId set — mapped directly to Pakistani curriculum classes. */
const CURRICULUM_GAME_DEFS = [
  // counting
  {
    id: "countStars",
    lessonId: "counting",
    category: "counting",
    title: "Star Counter",
    description: "Count the twinkling stars from 1 to 10!",
    emoji: "⭐",
    roundType: "dots",
    display: "dots",
    showEquals: false,
    config: { min: 1, max: 10 },
    instruction: "Count the stars!",
    targetLabel: "⭐ Count the stars",
    prompt: "How many stars?"
  },
  {
    id: "countFlowers",
    lessonId: "counting",
    category: "counting",
    title: "Flower Field",
    description: "Count flowers in the garden!",
    emoji: "🌸",
    roundType: "dots",
    display: "dots",
    showEquals: false,
    config: { min: 2, max: 8 },
    instruction: "Count each flower!",
    targetLabel: "🌸 Count the flowers",
    prompt: "How many flowers?"
  },
  // count20
  {
    id: "dotsTeens",
    lessonId: "count20",
    category: "counting",
    title: "Teen Dot Trail",
    description: "Count dots from 6 up to 20!",
    emoji: "🎈",
    roundType: "dots",
    display: "dots",
    showEquals: false,
    config: { min: 6, max: 20 },
    instruction: "Count all the dots!",
    targetLabel: "🎈 Count the teen dots",
    prompt: "How many dots?"
  },
  {
    id: "skipBy2Early",
    lessonId: "count20",
    category: "patterns",
    title: "Count by Twos",
    description: "2, 4, 6, 8 — what comes next?",
    emoji: "🐸",
    roundType: "sequence",
    display: "sequence",
    sequenceText: true,
    showEquals: false,
    config: { step: 2, startMin: 2, startMax: 6, choiceMax: 24 },
    instruction: "Skip count by twos!",
    targetLabel: "2️⃣ Count by 2s",
    prompt: "What number comes next?"
  },
  // count100
  {
    id: "dotsMassive",
    lessonId: "count100",
    category: "counting",
    title: "Mega Dot Meadow",
    description: "Count big groups up to 25!",
    emoji: "🌻",
    roundType: "dots",
    display: "dots",
    showEquals: false,
    config: { min: 10, max: 25 },
    instruction: "Count carefully!",
    targetLabel: "🌻 Count the big group",
    prompt: "How many dots?"
  },
  {
    id: "skipBy20",
    lessonId: "count100",
    category: "patterns",
    title: "Jump by 20s",
    description: "20, 40, 60 — keep counting!",
    emoji: "🏃",
    roundType: "sequence",
    display: "sequence",
    sequenceText: true,
    showEquals: false,
    config: { step: 20, startMin: 20, startMax: 40, choiceMax: 100 },
    instruction: "What comes next?",
    targetLabel: "🏃 Skip by 20s",
    prompt: "What number comes next?"
  },
  // numbers
  {
    id: "numberWord",
    lessonId: "numbers",
    category: "counting",
    title: "Number Word Match",
    description: "Hear the word — pick the number!",
    emoji: "🔤",
    roundType: "numberWord",
    display: "word",
    showEquals: false,
    config: { min: 0, max: 10 },
    instruction: "Pick the matching number!",
    targetLabel: "🔤 Word to number",
    prompt: "Which number matches the word?"
  },
  {
    id: "zeroHero",
    lessonId: "numbers",
    category: "counting",
    title: "Zero Hero",
    description: "Learn that zero means nothing!",
    emoji: "0️⃣",
    roundType: "dots",
    display: "dots",
    showEquals: false,
    config: { min: 0, max: 0 },
    instruction: "How many dots?",
    targetLabel: "0️⃣ Count zero",
    prompt: "How many dots do you see?"
  },
  {
    id: "tenPerfect",
    lessonId: "numbers",
    category: "counting",
    title: "Perfect Ten",
    description: "Spot exactly ten objects!",
    emoji: "🔟",
    roundType: "dots",
    display: "dots",
    showEquals: false,
    config: { min: 10, max: 10 },
    instruction: "Count to ten!",
    targetLabel: "🔟 Ten objects",
    prompt: "How many are there?"
  },
  // numberLine
  {
    id: "afterTeen",
    lessonId: "numberLine",
    category: "patterns",
    title: "After Teens",
    description: "What comes after teen numbers?",
    emoji: "➡️",
    roundType: "beforeAfter",
    display: "sequence",
    sequenceText: true,
    showEquals: false,
    config: { mode: "after", min: 11, max: 19 },
    instruction: "Pick the number after!",
    targetLabel: "➡️ What comes after?",
    prompt: "Choose the correct number!"
  },
  {
    id: "betweenTeens",
    lessonId: "numberLine",
    category: "patterns",
    title: "Between Teens",
    description: "Find the number in the middle!",
    emoji: "🎯",
    roundType: "beforeAfter",
    display: "sequence",
    sequenceText: true,
    showEquals: false,
    config: { mode: "between", min: 11, max: 17 },
    instruction: "What sits in between?",
    targetLabel: "🎯 Between which numbers?",
    prompt: "Pick the middle number!"
  },
  // compare
  {
    id: "compareTiny",
    lessonId: "compare",
    category: "compare",
    title: "Tiny Compare",
    description: "Compare numbers 1 to 5!",
    emoji: "🐣",
    roundType: "compare",
    display: "compare",
    wideText: true,
    showEquals: false,
    config: { max: 5 },
    instruction: "Which is bigger?",
    targetLabel: "🐣 Compare small numbers",
    prompt: "Tap the bigger number!"
  },
  {
    id: "compareTeens",
    lessonId: "compare",
    category: "compare",
    title: "Teen Compare",
    description: "Compare numbers up to 20!",
    emoji: "⚖️",
    roundType: "compare",
    display: "compare",
    wideText: true,
    showEquals: false,
    config: { max: 20 },
    instruction: "Which is bigger?",
    targetLabel: "⚖️ Compare teen numbers",
    prompt: "Tap the bigger number!"
  },
  // evenOdd
  {
    id: "evenPairs",
    lessonId: "evenOdd",
    category: "evenOdd",
    title: "Even Pairs",
    description: "Find numbers that split into pairs!",
    emoji: "👫",
    roundType: "parity",
    display: "word",
    showEquals: false,
    config: { parity: "even" },
    instruction: "Pick an even number!",
    targetLabel: "👫 Even pairs",
    prompt: "Which number is even?"
  },
  {
    id: "oddTrail",
    lessonId: "evenOdd",
    category: "evenOdd",
    title: "Odd Trail",
    description: "Spot the odd numbers!",
    emoji: "🦉",
    roundType: "parity",
    display: "word",
    showEquals: false,
    config: { parity: "odd" },
    instruction: "Pick an odd number!",
    targetLabel: "🦉 Odd numbers",
    prompt: "Which number is odd?"
  },
  // shapes
  {
    id: "roundShapes",
    lessonId: "shapes",
    category: "shapes",
    title: "Round Shape Hunt",
    description: "Name circles, ovals, and hearts!",
    emoji: "⭕",
    roundType: "shapeName",
    display: "shape",
    showEquals: false,
    config: { shapes: BASIC_SHAPES.filter((shape) => shape.group === "round") },
    instruction: "What round shape is this?",
    targetLabel: "⭕ Round shapes",
    prompt: "Tap the shape name!"
  },
  {
    id: "cornerShapes",
    lessonId: "shapes",
    category: "shapes",
    title: "Corner Counter",
    description: "Shapes with straight sides and corners!",
    emoji: "🟧",
    roundType: "shapeSides",
    display: "shape",
    showEquals: false,
    config: { shapes: BASIC_SHAPES.filter((shape) => shape.group === "corners" && shape.sides >= 3) },
    instruction: "How many sides?",
    targetLabel: "🟧 Count corners",
    prompt: "How many sides?"
  },
  // patternsIntro
  {
    id: "patternOnes",
    lessonId: "patternsIntro",
    category: "patterns",
    title: "One Step Pattern",
    description: "1, 2, 3, 4 — what comes next?",
    emoji: "1️⃣",
    roundType: "sequence",
    display: "sequence",
    sequenceText: true,
    showEquals: false,
    config: { step: 1, startMin: 1, startMax: 5, choiceMax: 12 },
    instruction: "Complete the pattern!",
    targetLabel: "1️⃣ Simple pattern",
    prompt: "What comes next?"
  },
  {
    id: "patternTwos",
    lessonId: "patternsIntro",
    category: "patterns",
    title: "Two Step Pattern",
    description: "Patterns that jump by 2!",
    emoji: "2️⃣",
    roundType: "sequence",
    display: "sequence",
    sequenceText: true,
    showEquals: false,
    config: { step: 2, startMin: 2, startMax: 4, choiceMax: 16 },
    instruction: "Spot the pattern!",
    targetLabel: "2️⃣ Jump by 2",
    prompt: "What comes next?"
  },
  // addition
  {
    id: "addWithin20",
    lessonId: "addition",
    category: "addition",
    title: "Add to Twenty",
    description: "Addition within 20 — Grade 1 style!",
    emoji: "📚",
    roundType: "addition",
    config: { aMax: 10, bMax: 10, choiceMax: 20 },
    instruction: "Add the numbers!",
    targetLabel: "📚 Add within 20",
    prompt: "What's the sum?"
  },
  {
    id: "addStory",
    lessonId: "addition",
    category: "addition",
    title: "Story Sums",
    description: "Solve addition word stories!",
    emoji: "📖",
    roundType: "wordProblem",
    config: { op: "add", aMax: 8, bMax: 8, choiceMax: 16 },
    instruction: "Listen to the story!",
    targetLabel: "📖 Word problem",
    prompt: "How many altogether?"
  },
  // numberBonds
  {
    id: "makeFifteen",
    lessonId: "numberBonds",
    category: "addition",
    title: "Make Fifteen",
    description: "Find the missing number to make 15!",
    emoji: "🖐️",
    roundType: "makeTotal",
    display: "sequence",
    sequenceText: true,
    config: { total: 15 },
    instruction: "Make fifteen!",
    targetLabel: "🖐️ Make 15",
    prompt: "What number is missing?"
  },
  // subtraction
  {
    id: "subOneLess",
    lessonId: "subtraction",
    category: "subtraction",
    title: "One Less",
    description: "Subtract 1 from any number!",
    emoji: "⬇️",
    roundType: "subtraction",
    config: { bMin: 1, bMax: 1, aMin: 2, aMax: 15 },
    instruction: "Take away one!",
    targetLabel: "⬇️ One less",
    prompt: "What's left?"
  },
  {
    id: "subWithin20",
    lessonId: "subtraction",
    category: "subtraction",
    title: "Subtract to Twenty",
    description: "Subtraction within 20!",
    emoji: "📕",
    roundType: "subtraction",
    config: { aMin: 5, aMax: 20, bMin: 1, bMax: 9, choiceMax: 20 },
    instruction: "Subtract!",
    targetLabel: "📕 Within 20",
    prompt: "What's the difference?"
  },
  // timeBasics
  {
    id: "clockHour",
    lessonId: "timeBasics",
    category: "patterns",
    title: "O'Clock Quiz",
    description: "Read the hour on the clock!",
    emoji: "🕐",
    roundType: "timeHour",
    display: "word",
    showEquals: false,
    config: { min: 1, max: 12 },
    instruction: "What hour is it?",
    targetLabel: "🕐 Read the clock",
    prompt: "What hour do you see?"
  },
  {
    id: "halfPast",
    lessonId: "timeBasics",
    category: "patterns",
    title: "Half Past",
    description: "Learn half-past times!",
    emoji: "🕧",
    roundType: "timeHour",
    display: "word",
    showEquals: false,
    config: { min: 1, max: 12, halfPast: true },
    instruction: "What hour is half past?",
    targetLabel: "🕧 Half past",
    prompt: "Which hour is shown?"
  },
  // money
  {
    id: "coinCount",
    lessonId: "money",
    category: "counting",
    title: "Coin Counter",
    description: "Count Pakistani rupee coins!",
    emoji: "🪙",
    roundType: "dots",
    display: "dots",
    showEquals: false,
    config: { min: 1, max: 10 },
    instruction: "Count the coins!",
    targetLabel: "🪙 Count the coins",
    prompt: "How many coins?"
  },
  {
    id: "rupeeAdd",
    lessonId: "money",
    category: "addition",
    title: "Rupee Shop",
    description: "Add rupee amounts together!",
    emoji: "🇵🇰",
    roundType: "moneyAdd",
    config: { aMax: 10, bMax: 10, choiceMax: 20 },
    instruction: "Add the rupees!",
    targetLabel: "🇵🇰 Rs. addition",
    prompt: "What's the total in rupees?"
  },
  // measure
  {
    id: "measureCompare",
    lessonId: "measure",
    category: "compare",
    title: "Long or Short",
    description: "Compare bigger measurements!",
    emoji: "📏",
    roundType: "compare",
    display: "compare",
    wideText: true,
    showEquals: false,
    config: { max: 30 },
    instruction: "Which is longer (bigger)?",
    targetLabel: "📏 Compare lengths",
    prompt: "Tap the bigger number!"
  },
  {
    id: "lengthAdd",
    lessonId: "measure",
    category: "addition",
    title: "Length Add",
    description: "Add two lengths in centimetres!",
    emoji: "📐",
    roundType: "addition",
    config: { aMax: 15, bMax: 15, choiceMax: 30 },
    instruction: "Add the lengths!",
    targetLabel: "📐 cm addition",
    prompt: "What's the total length?"
  },
  // multiplication
  {
    id: "mulIntro",
    lessonId: "multiplication",
    category: "multiplication",
    title: "Groups of Two",
    description: "Small multiplication intro!",
    emoji: "🥚",
    roundType: "multiplication",
    config: { aMax: 3, bMax: 3, choiceMax: 9 },
    instruction: "Multiply!",
    targetLabel: "🥚 Small groups",
    prompt: "What's the product?"
  },
  {
    id: "skipAfterMul",
    lessonId: "multiplication",
    category: "patterns",
    title: "Skip Count Link",
    description: "Skip counting helps times tables!",
    emoji: "🔗",
    roundType: "sequence",
    display: "sequence",
    sequenceText: true,
    showEquals: false,
    config: { step: 3, startMin: 3, startMax: 6, choiceMax: 24 },
    instruction: "What comes next?",
    targetLabel: "🔗 Skip ×3",
    prompt: "What number comes next?"
  },
  // division
  {
    id: "divShare3",
    lessonId: "division",
    category: "division",
    title: "Share Three Ways",
    description: "Share equally among 3 friends!",
    emoji: "🍪",
    roundType: "division",
    config: { divMin: 3, divMax: 3, qMin: 2, qMax: 5 },
    instruction: "How many each?",
    targetLabel: "🍪 Share by 3",
    prompt: "How many in each group?"
  },
  {
    id: "divShare4",
    lessonId: "division",
    category: "division",
    title: "Share Four Ways",
    description: "Divide into 4 equal groups!",
    emoji: "🧁",
    roundType: "division",
    config: { divMin: 4, divMax: 4, qMin: 2, qMax: 5 },
    instruction: "Share equally!",
    targetLabel: "🧁 Share by 4",
    prompt: "How many in each group?"
  },
  // fractions
  {
    id: "quarterPie",
    lessonId: "fractions",
    category: "division",
    title: "Quarter Pie",
    description: "Find one quarter of a number!",
    emoji: "🥧",
    roundType: "quarter",
    instruction: "Find the quarter!",
    targetLabel: "🥧 Quarter of",
    prompt: "What is one quarter?"
  },
  {
    id: "halfQuick",
    lessonId: "fractions",
    category: "division",
    title: "Quick Halves",
    description: "Fast half-of practice!",
    emoji: "🌙",
    roundType: "half",
    config: { min: 2, max: 20 },
    instruction: "Find half!",
    targetLabel: "🌙 Half of",
    prompt: "What is half?"
  },
  // timesTables — table 10–12 added in games.js TABLE_GAMES
  {
    id: "tableChamp",
    lessonId: "timesTables",
    category: "multiplication",
    title: "Table Champion",
    description: "Harder tables up to 12!",
    emoji: "🏆",
    roundType: "multiplication",
    config: { aMax: 12, bMax: 12, choiceMax: 144 },
    instruction: "Solve the table!",
    targetLabel: "🏆 × up to 12",
    prompt: "What's the product?"
  },
  // patterns
  {
    id: "skipBy4",
    lessonId: "patterns",
    category: "patterns",
    title: "Step by 4",
    description: "Patterns jumping by 4!",
    emoji: "4️⃣",
    roundType: "sequence",
    display: "sequence",
    sequenceText: true,
    showEquals: false,
    config: { step: 4, startMin: 4, startMax: 8, choiceMax: 32 },
    instruction: "What comes next?",
    targetLabel: "4️⃣ Skip by 4",
    prompt: "What number comes next?"
  },
  {
    id: "patternMix",
    lessonId: "patterns",
    category: "patterns",
    title: "Pattern Mix",
    description: "Tricky growing patterns!",
    emoji: "🌀",
    roundType: "sequence",
    display: "sequence",
    sequenceText: true,
    showEquals: false,
    config: { stepMin: 2, stepMax: 5, choiceMax: 30 },
    instruction: "Spot the rule!",
    targetLabel: "🌀 Growing pattern",
    prompt: "What comes next?"
  },
  // decimals
  {
    id: "decimalAdd",
    lessonId: "decimals",
    category: "mixed",
    title: "Tenths Add",
    description: "Add decimal tenths like 0.2 + 0.3!",
    emoji: "🔢",
    roundType: "decimalTenths",
    display: "sequence",
    sequenceText: true,
    showEquals: false,
    instruction: "Add the tenths!",
    targetLabel: "🔢 Add tenths",
    prompt: "What is the sum?"
  },
  {
    id: "decimalCompare",
    lessonId: "decimals",
    category: "compare",
    title: "Decimal Compare",
    description: "Which decimal is bigger?",
    emoji: "⚖️",
    roundType: "decimalCompare",
    display: "compare",
    wideText: true,
    showEquals: false,
    instruction: "Compare decimals!",
    targetLabel: "⚖️ Compare decimals",
    prompt: "Which is bigger?"
  },
  // percentage
  {
    id: "percentFifty",
    lessonId: "percentage",
    category: "mixed",
    title: "Fifty Percent",
    description: "Find 50% — that's half!",
    emoji: "💯",
    roundType: "percentOf",
    config: { percents: [50] },
    instruction: "Find 50%!",
    targetLabel: "💯 50 percent",
    prompt: "What is 50%?"
  },
  {
    id: "percentTen",
    lessonId: "percentage",
    category: "mixed",
    title: "Ten Percent",
    description: "Find 10% of a number!",
    emoji: "🔟",
    roundType: "percentOf",
    config: { percents: [10, 25] },
    instruction: "Find the percent!",
    targetLabel: "🔟 Percent of",
    prompt: "What is the answer?"
  },
  // algebraBasics
  {
    id: "findX",
    lessonId: "algebraBasics",
    category: "mixed",
    title: "Find x",
    description: "Solve simple algebra equations!",
    emoji: "🔤",
    roundType: "algebra",
    display: "sequence",
    sequenceText: true,
    showEquals: false,
    config: { addMin: 1, addMax: 8, xMin: 1, xMax: 10 },
    instruction: "What is x?",
    targetLabel: "🔤 Find x",
    prompt: "What number is x?"
  },
  {
    id: "solveX",
    lessonId: "algebraBasics",
    category: "mixed",
    title: "Equation Balance",
    description: "Harder x + a = b problems!",
    emoji: "⚖️",
    roundType: "algebra",
    display: "sequence",
    sequenceText: true,
    showEquals: false,
    config: { addMin: 3, addMax: 12, xMin: 2, xMax: 15, choiceMax: 20 },
    instruction: "Balance the equation!",
    targetLabel: "⚖️ Solve for x",
    prompt: "What is x?"
  },
  // geometry
  {
    id: "squarePerimeter",
    lessonId: "geometry",
    category: "mixed",
    title: "Square Perimeter",
    description: "Add all four sides of a square!",
    emoji: "🟧",
    roundType: "perimeter",
    config: { shape: "square" },
    instruction: "Find the perimeter!",
    targetLabel: "🟧 Square perimeter",
    prompt: "What is the perimeter?"
  },
  {
    id: "rectPerimeter",
    lessonId: "geometry",
    category: "mixed",
    title: "Rectangle Perimeter",
    description: "Perimeter of rectangles!",
    emoji: "🟦",
    roundType: "perimeter",
    config: { shape: "rectangle" },
    instruction: "Add all the sides!",
    targetLabel: "🟦 Rectangle perimeter",
    prompt: "What is the perimeter?"
  },
  {
    id: "geoStory",
    lessonId: "geometry",
    category: "mixed",
    title: "Math Stories",
    description: "Real-life word problems!",
    emoji: "📝",
    roundType: "wordProblem",
    config: { op: "add", aMax: 10, bMax: 10, choiceMax: 20 },
    instruction: "Read the story!",
    targetLabel: "📝 Word problem",
    prompt: "What's the answer?"
  },
  {
    id: "geoSubtract",
    lessonId: "geometry",
    category: "mixed",
    title: "Take Away Stories",
    description: "Subtraction word problems!",
    emoji: "📗",
    roundType: "wordProblem",
    config: { op: "sub", choiceMax: 15 },
    instruction: "Listen to the story!",
    targetLabel: "📗 Take away story",
    prompt: "How many are left?"
  },
  // mixed
  {
    id: "mixedLite",
    lessonId: "mixed",
    category: "mixed",
    title: "Quick Mix",
    description: "Easy + and − mixed!",
    emoji: "🎲",
    roundType: "mixed",
    config: { ops: ["add", "sub"] },
    instruction: "Add or subtract!",
    targetLabel: "🎲 Quick mix",
    prompt: "What's the answer?"
  },
  // challenge
  {
    id: "allOpsRace",
    lessonId: "challenge",
    category: "challenge",
    title: "All Ops Race",
    description: "Every operation at speed!",
    emoji: "🏁",
    roundType: "mixed",
    instruction: "Solve fast!",
    targetLabel: "🏁 All operations",
    prompt: "Pick the answer!"
  },
  // bodmasBrackets
  {
    id: "bracketPractice",
    lessonId: "bodmasBrackets",
    category: "bodmas",
    title: "Bracket Practice",
    description: "Solve what's inside ( ) first!",
    emoji: "🪝",
    roundType: "bodmas",
    config: { kind: "bracket_add" },
    wideText: true,
    sequenceText: true,
    instruction: "Brackets first!",
    targetLabel: "🪝 Bracket sums",
    prompt: "What is the answer?"
  },
  {
    id: "bracketTimes",
    lessonId: "bodmasBrackets",
    category: "bodmas",
    title: "Bracket Multiply",
    description: "(a + b) × c — bracket then times!",
    emoji: "✖️",
    roundType: "bodmas",
    config: { kind: "bracket_mul" },
    wideText: true,
    sequenceText: true,
    instruction: "Bracket, then multiply!",
    targetLabel: "🪝 Bracket ×",
    prompt: "What is the answer?"
  },
  // bodmasMulDiv
  {
    id: "mulBeforeAdd",
    lessonId: "bodmasMulDiv",
    category: "bodmas",
    title: "× Before +",
    description: "Always multiply before adding!",
    emoji: "⏩",
    roundType: "bodmas",
    config: { kind: "md_first" },
    wideText: true,
    sequenceText: true,
    instruction: "× comes first!",
    targetLabel: "⏩ Multiply first",
    prompt: "What is the answer?"
  },
  {
    id: "divBeforeAdd",
    lessonId: "bodmasMulDiv",
    category: "bodmas",
    title: "÷ Before +",
    description: "Divide before you add!",
    emoji: "➗",
    roundType: "bodmas",
    config: { kind: "div_add" },
    wideText: true,
    sequenceText: true,
    instruction: "÷ comes first!",
    targetLabel: "➗ Divide first",
    prompt: "What is the answer?"
  },
  // bodmasFull
  {
    id: "fullBodmasQuiz",
    lessonId: "bodmasFull",
    category: "bodmas",
    title: "Full Rule Quiz",
    description: "Brackets, ×÷, then +−!",
    emoji: "🏆",
    roundType: "bodmas",
    config: { kind: "full" },
    wideText: true,
    sequenceText: true,
    instruction: "Full BODMAS rule!",
    targetLabel: "🏆 Complete BODMAS",
    prompt: "What is the answer?"
  },
  // bodmasIntro
  {
    id: "bodmasWarmup",
    lessonId: "bodmasIntro",
    category: "bodmas",
    title: "BODMAS Warm-up",
    description: "Multiply before you add!",
    emoji: "📐",
    roundType: "bodmas",
    config: { kind: "md_first" },
    wideText: true,
    sequenceText: true,
    instruction: "Use BODMAS!",
    targetLabel: "📐 × before +",
    prompt: "What is the answer?"
  }
];

const ROUND_BUILDERS = {
  dots: buildDotsRound,
  addition: buildAdditionRound,
  subtraction: buildSubtractionRound,
  multiplication: buildMultiplicationRound,
  division: buildDivisionRound,
  missing: buildMissingRound,
  mixed: buildMixedRound,
  compare: buildCompareRound,
  sequence: buildSequenceRound,
  makeTotal: buildMakeTotalRound,
  double: buildDoubleRound,
  triple: buildTripleRound,
  half: buildHalfRound,
  square: buildSquareRound,
  beforeAfter: buildBeforeAfterRound,
  addThree: buildAddThreeRound,
  parity: buildParityRound,
  multiplyBy: buildMultiplyByRound,
  divideSimple: buildDivideSimpleRound,
  subSame: buildSubSameRound,
  countBack: buildCountBackRound,
  bodmas: buildBodmasRound,
  shapeName: buildShapeNameRound,
  shapeSides: buildShapeSidesRound,
  shapeCount: buildShapeCountRound,
  numberWord: buildNumberWordRound,
  timeHour: buildTimeHourRound,
  moneyAdd: buildMoneyAddRound,
  quarter: buildQuarterRound,
  decimalTenths: buildDecimalTenthsRound,
  decimalCompare: buildDecimalCompareRound,
  percentOf: buildPercentOfRound,
  algebra: buildAlgebraRound,
  perimeter: buildPerimeterRound,
  wordProblem: buildWordProblemRound
};

const BASE_GAMES = [
  defineGame(0, { id: "match", category: "counting", title: "Number Match Garden", description: "Count the colorful dots and pick the right number!", emoji: "🌻", roundType: "dots", display: "dots", instruction: "Tap the matching number!", targetLabel: "🔢 Count these dots", prompt: "Which number matches?", showEquals: false }),
  defineGame(1, { id: "addition", category: "addition", title: "Addition Adventure", description: "Add numbers together and become a math hero!", emoji: "🚀", roundType: "addition", instruction: "Add the numbers!", targetLabel: "➕ Add this", prompt: "What's the sum?" }),
  defineGame(2, { id: "subtraction", category: "subtraction", title: "Subtraction Safari", description: "Take away numbers on a wild math safari!", emoji: "🦁", roundType: "subtraction", instruction: "Subtract the numbers!", targetLabel: "➖ Subtract this", prompt: "What's the difference?" }),
  defineGame(3, { id: "multiplication", category: "multiplication", title: "Multiplication Meadow", description: "Multiply numbers and watch them bloom!", emoji: "🌸", roundType: "multiplication", config: { aMax: 5, bMax: 5 }, instruction: "Multiply the numbers!", targetLabel: "✖️ Multiply this", prompt: "What's the product?" }),
  defineGame(4, { id: "timesTables", category: "multiplication", title: "Times Table Tower", description: "Master bigger times tables from 2 to 9!", emoji: "🗼", roundType: "multiplication", config: { aMax: 9, bMax: 9 }, instruction: "Solve the times table!", targetLabel: "✖️ Times tables", prompt: "What's the product?" }),
  defineGame(5, { id: "division", category: "division", title: "Division Desert", description: "Share numbers equally with division!", emoji: "🏜️", roundType: "division", instruction: "How many in each group?", targetLabel: "➗ Divide this", prompt: "What's the answer?" }),
  defineGame(6, { id: "mixed", category: "mixed", title: "Arithmetic Arena", description: "Add, subtract, multiply, and divide — all mixed up!", emoji: "⚔️", roundType: "mixed", instruction: "Solve the problem — any operation!", targetLabel: "🧮 All arithmetic", prompt: "Pick the correct answer!" }),
  defineGame(7, { id: "compare", category: "compare", title: "Compare Castle", description: "Find the bigger number between two friends!", emoji: "🏰", roundType: "compare", display: "compare", wideText: true, showEquals: false, instruction: "Pick the bigger number!", targetLabel: "⚖️ Which is bigger?", prompt: "Tap the bigger number!" }),
  defineGame(8, { id: "sequence", category: "patterns", title: "Number Ninja", description: "Spot the pattern and find what comes next!", emoji: "🥷", roundType: "sequence", display: "sequence", sequenceText: true, showEquals: false, instruction: "What number comes next?", targetLabel: "🔮 Complete the pattern", prompt: "What comes next in the pattern?" }),
  defineGame(9, { id: "makeTen", category: "addition", title: "Make Ten Magic", description: "Find the missing number to make ten!", emoji: "✨", roundType: "makeTotal", config: { total: 10 }, display: "sequence", sequenceText: true, instruction: "Find the missing number!", targetLabel: "🪄 Make ten!", prompt: "What number makes ten?" }),
  defineGame(10, { id: "doubles", category: "multiplication", title: "Double Trouble", description: "Double a number and find the answer!", emoji: "🪞", roundType: "double", instruction: "What is the double?", targetLabel: "🪞 Double it!", prompt: "What's the double?" }),
  defineGame(11, { id: "smaller", category: "compare", title: "Smaller Swamp", description: "Find the smaller number between two!", emoji: "🐸", roundType: "compare", config: { pick: "min" }, display: "compare", wideText: true, showEquals: false, instruction: "Pick the smaller number!", targetLabel: "🐸 Which is smaller?", prompt: "Tap the smaller number!" }),
  defineGame(12, { id: "missingAdd", category: "mixed", title: "Missing Mystery", description: "Find the hidden number in +, −, ×, or ÷ problems!", emoji: "🔍", roundType: "missing", display: "sequence", sequenceText: true, showEquals: false, instruction: "Find the hidden number!", targetLabel: "🔍 Find the missing piece", prompt: "What number is missing?" }),
  defineGame(13, { id: "countBack", category: "patterns", title: "Countdown Cave", description: "Count backwards and find what comes next!", emoji: "🦇", roundType: "countBack", display: "sequence", sequenceText: true, showEquals: false, instruction: "Count backwards — what's next?", targetLabel: "⏪ Count backwards", prompt: "What number comes next?" }),
  defineGame(14, { id: "beforeAfter", category: "patterns", title: "Before & After", description: "What number comes before or after?", emoji: "🎢", roundType: "beforeAfter", display: "sequence", sequenceText: true, showEquals: false, instruction: "Pick the right number!", targetLabel: "🎢 Before or after?", prompt: "Choose the correct number!" })
];

const EXTRA_GAME_DEFS = [
  {
    id: "shapeSpotter",
    category: "shapes",
    title: "Shape Spotter",
    description: "Look at the shape and pick its name!",
    emoji: "🔷",
    roundType: "shapeName",
    display: "shape",
    showEquals: false,
    instruction: "What shape is this?",
    targetLabel: "🔷 Name this shape",
    prompt: "Tap the shape name!"
  },
  {
    id: "shapeMatch",
    category: "shapes",
    title: "Shape Match",
    description: "Match each shape picture to the right name!",
    emoji: "🎯",
    roundType: "shapeName",
    display: "shape",
    showEquals: false,
    instruction: "Find the matching name!",
    targetLabel: "🎯 Match the shape",
    prompt: "Which name matches?"
  },
  {
    id: "shapeSides",
    category: "shapes",
    title: "Side Counter",
    description: "Count how many sides each shape has!",
    emoji: "📐",
    roundType: "shapeSides",
    display: "shape",
    showEquals: false,
    instruction: "How many sides?",
    targetLabel: "📐 Count the sides",
    prompt: "How many sides does it have?"
  },
  {
    id: "shapeCount",
    category: "shapes",
    title: "Shape Count Garden",
    description: "Count the shapes and pick the total!",
    emoji: "🌺",
    roundType: "shapeCount",
    display: "shapeCount",
    showEquals: false,
    instruction: "Count all the shapes!",
    targetLabel: "🔢 Count these shapes",
    prompt: "How many shapes?"
  },
  { id: "addTiny", category: "addition", title: "Tiny Totals", description: "Small additions from 1 to 5!", roundType: "addition", config: { aMax: 5, bMax: 5, choiceMax: 10 } },
  { id: "addMedium", category: "addition", title: "Medium Mix", description: "Add numbers up to 12!", roundType: "addition", config: { aMax: 12, bMax: 12, choiceMax: 24 } },
  { id: "addBig", category: "addition", title: "Big Sum Safari", description: "Larger additions for brave kids!", roundType: "addition", config: { aMin: 5, aMax: 15, bMin: 5, bMax: 15, choiceMax: 30 } },
  { id: "addThree", category: "addition", title: "Triple Add Trail", description: "Add three numbers together!", roundType: "addThree" },
  { id: "addOneMore", category: "addition", title: "One More Mountain", description: "Add 1 to numbers!", roundType: "addition", config: { bMin: 1, bMax: 1, aMin: 1, aMax: 15 } },
  { id: "addTens", category: "addition", title: "Ten Plus Town", description: "Add 10 to a number!", roundType: "addition", config: { bMin: 10, bMax: 10, aMin: 1, aMax: 9, choiceMax: 20 } },
  { id: "addZero", category: "addition", title: "Zero Zone", description: "Adding zero keeps the number!", roundType: "addition", config: { bMin: 0, bMax: 0, aMin: 1, aMax: 12 } },
  { id: "subTiny", category: "subtraction", title: "Tiny Takeaway", description: "Subtract small numbers!", roundType: "subtraction", config: { aMax: 8, bMax: 3 } },
  { id: "subBig", category: "subtraction", title: "Big Subtract Bay", description: "Subtract with bigger numbers!", roundType: "subtraction", config: { aMin: 10, aMax: 20, bMin: 1, bMax: 9, choiceMax: 20 } },
  { id: "subFromTen", category: "subtraction", title: "Ten Takeaway", description: "Start at 10 and subtract!", roundType: "subtraction", config: { aMin: 10, aMax: 10, bMin: 1, bMax: 9 } },
  { id: "subSame", category: "subtraction", title: "Same Number Subtract", description: "Subtract a number from itself!", roundType: "subSame" },
  { id: "mulBy0", category: "multiplication", title: "Zero Times Zoo", description: "Anything times zero is zero!", roundType: "multiplyBy", config: { factor: 0 } },
  { id: "mulBy1", category: "multiplication", title: "One Times World", description: "Multiplying by one stays the same!", roundType: "multiplyBy", config: { factor: 1 } },
  { id: "divBy1", category: "division", title: "Divide by One", description: "Dividing by one keeps the number!", roundType: "divideSimple", config: { divisor: 1 } },
  { id: "divBig", category: "division", title: "Big Divide Dunes", description: "Harder clean division problems!", roundType: "division", config: { divMax: 9, qMax: 9, choiceMax: 9 } },
  { id: "mixedAddSub", category: "mixed", title: "Plus Minus Mix", description: "Only addition and subtraction!", roundType: "mixed", config: { ops: ["add", "sub"] } },
  { id: "mixedMulDiv", category: "mixed", title: "Times Divide Dash", description: "Only multiply and divide!", roundType: "mixed", config: { ops: ["mul", "div"] } },
  { id: "missingPlus", category: "mixed", title: "Missing Plus", description: "Find the hidden addend!", roundType: "missing", config: { ops: ["add"] }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "missingMinus", category: "mixed", title: "Missing Minus", description: "Find the hidden number in subtraction!", roundType: "missing", config: { ops: ["sub"] }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "missingTimes", category: "mixed", title: "Missing Times", description: "Find the hidden factor!", roundType: "missing", config: { ops: ["mul"] }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "missingDivide", category: "mixed", title: "Missing Divide", description: "Find the hidden division number!", roundType: "missing", config: { ops: ["div"] }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "makeFive", category: "addition", title: "Make Five Forest", description: "Find the missing number to make 5!", roundType: "makeTotal", config: { total: 5 }, display: "sequence", sequenceText: true },
  { id: "makeTwenty", category: "addition", title: "Make Twenty Town", description: "Find the missing number to make 20!", roundType: "makeTotal", config: { total: 20 }, display: "sequence", sequenceText: true },
  { id: "triples", category: "multiplication", title: "Triple Trip", description: "Triple a number — that's ×3!", roundType: "triple" },
  { id: "halves", category: "division", title: "Half Moon Math", description: "Find half of an even number!", roundType: "half" },
  { id: "squares", category: "multiplication", title: "Square Castle", description: "Multiply a number by itself!", roundType: "square" },
  { id: "sequence3", category: "patterns", title: "Step by 3", description: "Patterns that jump by 3!", roundType: "sequence", config: { step: 3 }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "sequence5", category: "patterns", title: "Step by 5", description: "Patterns that jump by 5!", roundType: "sequence", config: { step: 5 }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "skipBy5", category: "patterns", title: "Skip Count 5s", description: "Count by fives!", roundType: "sequence", config: { step: 5, startMin: 5, startMax: 5 }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "skipBy10", category: "patterns", title: "Skip Count 10s", description: "Count by tens!", roundType: "sequence", config: { step: 10, startMin: 10, startMax: 10 }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "countBack2", category: "patterns", title: "Count Back 2s", description: "Go backwards by 2!", roundType: "countBack", display: "sequence", sequenceText: true, showEquals: false },
  { id: "dotsTiny", category: "counting", title: "Tiny Dot Garden", description: "Count just a few dots!", roundType: "dots", config: { min: 1, max: 5 }, display: "dots", showEquals: false, instruction: "Count the dots!", targetLabel: "🔢 Count these dots", prompt: "How many dots?" },
  { id: "dotsBig", category: "counting", title: "Big Dot Field", description: "Count up to 15 dots!", roundType: "dots", config: { min: 5, max: 15 }, display: "dots", showEquals: false, instruction: "Count all the dots!", targetLabel: "🔢 Count these dots", prompt: "How many dots?" },
  { id: "compareBig", category: "compare", title: "Big Compare Bay", description: "Compare numbers up to 20!", roundType: "compare", config: { max: 20 }, display: "compare", wideText: true, showEquals: false },
  { id: "betweenNumbers", category: "patterns", title: "In Between Island", description: "What number sits in the middle?", roundType: "beforeAfter", config: { mode: "between" }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "beforeOnly", category: "patterns", title: "Before Bridge", description: "What comes before?", roundType: "beforeAfter", config: { mode: "before" }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "afterOnly", category: "patterns", title: "After Alley", description: "What comes after?", roundType: "beforeAfter", config: { mode: "after" }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "pickOdd", category: "evenOdd", title: "Odd Owl", description: "Pick the odd number!", roundType: "parity", config: { parity: "odd" }, display: "word", showEquals: false, instruction: "Find the odd number!", targetLabel: "🦉 Pick odd", prompt: "Which is odd?" },
  { id: "pickEven", category: "evenOdd", title: "Even Elephant", description: "Pick the even number!", roundType: "parity", config: { parity: "even" }, display: "word", showEquals: false, instruction: "Find the even number!", targetLabel: "🐘 Pick even", prompt: "Which is even?" },
  { id: "doubleBig", category: "multiplication", title: "Double Dare", description: "Double bigger numbers!", roundType: "double", config: { min: 5, max: 12, choiceMax: 24 } },
  { id: "addFriends6", category: "addition", title: "Six Pack Sum", description: "Practice adding up to six!", roundType: "addition", config: { aMax: 6, bMax: 6 } },
  { id: "addFriends8", category: "addition", title: "Eight Great Add", description: "Practice adding up to eight!", roundType: "addition", config: { aMax: 8, bMax: 8 } },
  { id: "mulFast4", category: "multiplication", title: "Fast Fours", description: "Quick multiply up to 4!", roundType: "multiplication", config: { aMax: 4, bMax: 4, choiceMax: 16 } },
  { id: "divShare6", category: "division", title: "Share Six Snacks", description: "Division with divisor up to 6!", roundType: "division", config: { divMax: 6, qMax: 6 } },
  { id: "mathMarathon", category: "challenge", title: "Math Marathon", description: "Every operation — ultimate mix!", roundType: "mixed" },
  { id: "speedAdd", category: "challenge", title: "Speedy Sums", description: "Fast small additions!", roundType: "addition", config: { aMax: 6, bMax: 6, choiceMax: 12 } },
  { id: "brainTrainer", category: "challenge", title: "Brain Trainer", description: "Missing numbers in all operations!", roundType: "missing" },
  { id: "patternPro", category: "challenge", title: "Pattern Pro", description: "Tricky number sequences!", roundType: "sequence", config: { stepMin: 2, stepMax: 4 }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "bodmasOrderQuiz", category: "bodmas", title: "BODMAS Order Quiz", description: "Multiply before you add!", roundType: "bodmas", config: { kind: "md_first" }, wideText: true, sequenceText: true, instruction: "Use BODMAS order!", targetLabel: "📐 BODMAS order", prompt: "What is the answer?" },
  { id: "bodmasBracketBasics", category: "bodmas", title: "Bracket Basics", description: "Solve the bracket first!", roundType: "bodmas", config: { kind: "bracket_add" }, wideText: true, sequenceText: true, instruction: "Do brackets first!", targetLabel: "🪝 Brackets first", prompt: "What is the answer?" },
  { id: "bodmasBracketTimes", category: "bodmas", title: "Bracket Times", description: "(a + b) × c — brackets then multiply!", roundType: "bodmas", config: { kind: "bracket_mul" }, wideText: true, sequenceText: true, instruction: "Bracket first, then ×!", targetLabel: "🪝 Bracket ×", prompt: "What is the answer?" },
  { id: "bodmasMulFirst", category: "bodmas", title: "Multiply First", description: "× before + in BODMAS!", roundType: "bodmas", config: { kind: "md_first" }, wideText: true, sequenceText: true, instruction: "Multiply before adding!", targetLabel: "⏩ × before +", prompt: "What is the answer?" },
  { id: "bodmasDivFirst", category: "bodmas", title: "Divide First", description: "÷ before + in BODMAS!", roundType: "bodmas", config: { kind: "div_add" }, wideText: true, sequenceText: true, instruction: "Divide before adding!", targetLabel: "⏩ ÷ before +", prompt: "What is the answer?" },
  { id: "bodmasSubtractMix", category: "bodmas", title: "Subtract Mix", description: "Subtract after multiplying!", roundType: "bodmas", config: { kind: "md_sub" }, wideText: true, sequenceText: true, instruction: "× before −!", targetLabel: "⏩ × before −", prompt: "What is the answer?" },
  { id: "bodmasFullMix", category: "bodmas", title: "BODMAS Mix", description: "Brackets and ×÷ together!", roundType: "bodmas", config: { kind: "full" }, wideText: true, sequenceText: true, instruction: "Full BODMAS!", targetLabel: "🏆 Full BODMAS", prompt: "What is the answer?" },
  { id: "bodmasMaster", category: "bodmas", title: "BODMAS Master", description: "Every BODMAS rule mixed!", roundType: "bodmas", wideText: true, sequenceText: true, instruction: "Use the full BODMAS rule!", targetLabel: "👑 BODMAS Master", prompt: "What is the answer?" }
];

const TABLE_GAMES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n, i) =>
  defineGame(15 + i, {
    id: `mulTable${n}`,
    lessonId: "timesTables",
    category: "multiplication",
    title: `Times ${n} Trail`,
    description: `Practice multiplying by ${n}!`,
    emoji: pickEmoji(15 + i),
    roundType: "multiplication",
    config: { fixedB: n, aMin: 2, aMax: 9, bMin: n, bMax: n },
    instruction: `Multiply by ${n}!`,
    targetLabel: `✖️ ×${n} tables`,
    prompt: `What's ${n} times the number?`
  })
);

const ALL_EXTRA_DEFS = [...EXTRA_GAME_DEFS, ...CURRICULUM_GAME_DEFS];

const EXTRA_GAMES = ALL_EXTRA_DEFS.map((fields, index) =>
  defineGame(23 + index, {
    emoji: pickEmoji(23 + index),
    instruction: fields.instruction ?? "Pick the correct answer!",
    targetLabel: fields.targetLabel ?? "🧮 Solve this",
    prompt: fields.prompt ?? "Choose the correct answer!",
    showEquals: fields.showEquals ?? true,
    wideText: fields.wideText ?? false,
    sequenceText: fields.sequenceText ?? false,
    display: fields.display ?? "equation",
    ...fields
  })
);

export const GAME_CATEGORIES = [
  { id: "counting", label: "🔢 Counting" },
  { id: "shapes", label: "🔷 Shapes" },
  { id: "compare", label: "⚖️ Compare" },
  { id: "evenOdd", label: "🦉 Even & Odd" },
  { id: "addition", label: "➕ Addition" },
  { id: "subtraction", label: "➖ Subtraction" },
  { id: "multiplication", label: "✖️ Multiplication" },
  { id: "division", label: "➗ Division" },
  { id: "patterns", label: "🔮 Patterns" },
  { id: "mixed", label: "🎲 Mixed" },
  { id: "bodmas", label: "📐 BODMAS" },
  { id: "challenge", label: "🏆 Challenge" }
];

const RAW_GAMES = [...BASE_GAMES, ...TABLE_GAMES, ...EXTRA_GAMES];
export const GAMES = attachLessonIds(RAW_GAMES);

const GAME_MAP = Object.fromEntries(GAMES.map((game) => [game.id, game]));

export function getGameMeta(gameId) {
  return GAME_MAP[gameId] || GAMES[0];
}

export function createRound(gameId, options = {}) {
  const game = getGameMeta(gameId);
  const builder = ROUND_BUILDERS[game.roundType] || ROUND_BUILDERS.dots;
  const config = options.config ?? game.config;
  return builder(config);
}

export function isDotsGame(gameId) {
  return getGameMeta(gameId).display === "dots";
}

export function isShapeCountGame(gameId) {
  return getGameMeta(gameId).display === "shapeCount";
}

export function isShapeDisplayGame(gameId) {
  const display = getGameMeta(gameId).display;
  return display === "shape" || display === "shapeCount";
}

export function formatChoiceLabel(roundData, choice) {
  if (roundData?.choiceType === "shapeName") {
    return getShapeName(choice);
  }
  if (roundData?.choiceType === "decimalTenth") {
    return `0.${choice}`;
  }
  return String(choice);
}

export function showEqualsHint(gameId) {
  return getGameMeta(gameId).showEquals;
}

export function usesWideQuestionText(gameId) {
  return getGameMeta(gameId).wideText;
}

export function usesSequenceQuestionText(gameId) {
  return getGameMeta(gameId).sequenceText;
}

export function getInstruction(gameId) {
  return getGameMeta(gameId).instruction;
}

export function getTargetLabel(gameId) {
  return getGameMeta(gameId).targetLabel;
}

export function getPrompt(gameId, finished) {
  if (finished) return "🌟 Want to play again?";
  return getGameMeta(gameId).prompt;
}

export function getGamesByCategory() {
  return GAME_CATEGORIES.map((category) => ({
    ...category,
    games: GAMES.filter((game) => game.category === category.id)
  })).filter((section) => section.games.length > 0);
}
