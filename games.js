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
      choices: makeChoicesFromRange(n - 1, 1, 10)
    };
  }
  if (mode === "after") {
    return {
      label: `After ${n} comes ?`,
      target: n + 1,
      choices: makeChoicesFromRange(n + 1, 1, 12)
    };
  }
  if (mode === "between") {
    const low = randomInt(2, 8);
    return {
      label: `Between ${low} and ${low + 2} ?`,
      target: low + 1,
      choices: makeChoicesFromRange(low + 1, 1, 10)
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
  countBack: buildCountBackRound
};

const BASE_GAMES = [
  defineGame(0, { id: "match", category: "counting", title: "Number Match Garden", description: "Count the colorful dots and pick the right number!", emoji: "🌻", roundType: "dots", display: "dots", instruction: "Tap the matching number!", targetLabel: "🔢 Count these dots", prompt: "Which number matches?", showEquals: false }),
  defineGame(1, { id: "addition", category: "addition", title: "Addition Adventure", description: "Add numbers together and become a math hero!", emoji: "🚀", roundType: "addition", instruction: "Add the numbers!", targetLabel: "➕ Add this", prompt: "What's the sum?" }),
  defineGame(2, { id: "subtraction", category: "subtraction", title: "Subtraction Safari", description: "Take away numbers on a wild math safari!", emoji: "🦁", roundType: "subtraction", instruction: "Subtract the numbers!", targetLabel: "➖ Subtract this", prompt: "What's the difference?" }),
  defineGame(3, { id: "multiplication", category: "multiplication", title: "Multiplication Meadow", description: "Multiply numbers and watch them bloom!", emoji: "🌸", roundType: "multiplication", config: { aMax: 5, bMax: 5 }, instruction: "Multiply the numbers!", targetLabel: "✖️ Multiply this", prompt: "What's the product?" }),
  defineGame(4, { id: "timesTables", category: "multiplication", title: "Times Table Tower", description: "Master bigger times tables from 2 to 9!", emoji: "🗼", roundType: "multiplication", config: { aMax: 9, bMax: 9 }, instruction: "Solve the times table!", targetLabel: "✖️ Times tables", prompt: "What's the product?" }),
  defineGame(5, { id: "division", category: "division", title: "Division Desert", description: "Share numbers equally with division!", emoji: "🏜️", roundType: "division", instruction: "How many in each group?", targetLabel: "➗ Divide this", prompt: "What's the answer?" }),
  defineGame(6, { id: "mixed", category: "mixed", title: "Arithmetic Arena", description: "Add, subtract, multiply, and divide — all mixed up!", emoji: "⚔️", roundType: "mixed", instruction: "Solve the problem — any operation!", targetLabel: "🧮 All arithmetic", prompt: "Pick the correct answer!" }),
  defineGame(7, { id: "compare", category: "counting", title: "Compare Castle", description: "Find the bigger number between two friends!", emoji: "🏰", roundType: "compare", display: "compare", wideText: true, showEquals: false, instruction: "Pick the bigger number!", targetLabel: "⚖️ Which is bigger?", prompt: "Tap the bigger number!" }),
  defineGame(8, { id: "sequence", category: "patterns", title: "Number Ninja", description: "Spot the pattern and find what comes next!", emoji: "🥷", roundType: "sequence", display: "sequence", sequenceText: true, showEquals: false, instruction: "What number comes next?", targetLabel: "🔮 Complete the pattern", prompt: "What comes next in the pattern?" }),
  defineGame(9, { id: "makeTen", category: "addition", title: "Make Ten Magic", description: "Find the missing number to make ten!", emoji: "✨", roundType: "makeTotal", config: { total: 10 }, display: "sequence", sequenceText: true, instruction: "Find the missing number!", targetLabel: "🪄 Make ten!", prompt: "What number makes ten?" }),
  defineGame(10, { id: "doubles", category: "multiplication", title: "Double Trouble", description: "Double a number and find the answer!", emoji: "🪞", roundType: "double", instruction: "What is the double?", targetLabel: "🪞 Double it!", prompt: "What's the double?" }),
  defineGame(11, { id: "smaller", category: "counting", title: "Smaller Swamp", description: "Find the smaller number between two!", emoji: "🐸", roundType: "compare", config: { pick: "min" }, display: "compare", wideText: true, showEquals: false, instruction: "Pick the smaller number!", targetLabel: "🐸 Which is smaller?", prompt: "Tap the smaller number!" }),
  defineGame(12, { id: "missingAdd", category: "mixed", title: "Missing Mystery", description: "Find the hidden number in +, −, ×, or ÷ problems!", emoji: "🔍", roundType: "missing", display: "sequence", sequenceText: true, showEquals: false, instruction: "Find the hidden number!", targetLabel: "🔍 Find the missing piece", prompt: "What number is missing?" }),
  defineGame(13, { id: "countBack", category: "patterns", title: "Countdown Cave", description: "Count backwards and find what comes next!", emoji: "🦇", roundType: "countBack", display: "sequence", sequenceText: true, showEquals: false, instruction: "Count backwards — what's next?", targetLabel: "⏪ Count backwards", prompt: "What number comes next?" }),
  defineGame(14, { id: "beforeAfter", category: "patterns", title: "Before & After", description: "What number comes before or after?", emoji: "🎢", roundType: "beforeAfter", display: "sequence", sequenceText: true, showEquals: false, instruction: "Pick the right number!", targetLabel: "🎢 Before or after?", prompt: "Choose the correct number!" })
];

const EXTRA_GAME_DEFS = [
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
  { id: "compareBig", category: "counting", title: "Big Compare Bay", description: "Compare numbers up to 20!", roundType: "compare", config: { max: 20 }, display: "compare", wideText: true, showEquals: false },
  { id: "betweenNumbers", category: "patterns", title: "In Between Island", description: "What number sits in the middle?", roundType: "beforeAfter", config: { mode: "between" }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "beforeOnly", category: "patterns", title: "Before Bridge", description: "What comes before?", roundType: "beforeAfter", config: { mode: "before" }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "afterOnly", category: "patterns", title: "After Alley", description: "What comes after?", roundType: "beforeAfter", config: { mode: "after" }, display: "sequence", sequenceText: true, showEquals: false },
  { id: "pickOdd", category: "counting", title: "Odd Owl", description: "Pick the odd number!", roundType: "parity", config: { parity: "odd" }, display: "word", showEquals: false, instruction: "Find the odd number!", targetLabel: "🦉 Pick odd", prompt: "Which is odd?" },
  { id: "pickEven", category: "counting", title: "Even Elephant", description: "Pick the even number!", roundType: "parity", config: { parity: "even" }, display: "word", showEquals: false, instruction: "Find the even number!", targetLabel: "🐘 Pick even", prompt: "Which is even?" },
  { id: "doubleBig", category: "multiplication", title: "Double Dare", description: "Double bigger numbers!", roundType: "double", config: { min: 5, max: 12, choiceMax: 24 } },
  { id: "addFriends6", category: "addition", title: "Six Pack Sum", description: "Practice adding up to six!", roundType: "addition", config: { aMax: 6, bMax: 6 } },
  { id: "addFriends8", category: "addition", title: "Eight Great Add", description: "Practice adding up to eight!", roundType: "addition", config: { aMax: 8, bMax: 8 } },
  { id: "mulFast4", category: "multiplication", title: "Fast Fours", description: "Quick multiply up to 4!", roundType: "multiplication", config: { aMax: 4, bMax: 4, choiceMax: 16 } },
  { id: "divShare6", category: "division", title: "Share Six Snacks", description: "Division with divisor up to 6!", roundType: "division", config: { divMax: 6, qMax: 6 } },
  { id: "mathMarathon", category: "challenge", title: "Math Marathon", description: "Every operation — ultimate mix!", roundType: "mixed" },
  { id: "speedAdd", category: "challenge", title: "Speedy Sums", description: "Fast small additions!", roundType: "addition", config: { aMax: 6, bMax: 6, choiceMax: 12 } },
  { id: "brainTrainer", category: "challenge", title: "Brain Trainer", description: "Missing numbers in all operations!", roundType: "missing" },
  { id: "patternPro", category: "challenge", title: "Pattern Pro", description: "Tricky number sequences!", roundType: "sequence", config: { stepMin: 2, stepMax: 4 }, display: "sequence", sequenceText: true, showEquals: false }
];

const TABLE_GAMES = [2, 3, 4, 5, 6, 7, 8, 9].map((n, i) =>
  defineGame(15 + i, {
    id: `mulTable${n}`,
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

const EXTRA_GAMES = EXTRA_GAME_DEFS.map((fields, index) =>
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
  { id: "counting", label: "🔢 Counting & Compare" },
  { id: "addition", label: "➕ Addition" },
  { id: "subtraction", label: "➖ Subtraction" },
  { id: "multiplication", label: "✖️ Multiplication" },
  { id: "division", label: "➗ Division" },
  { id: "patterns", label: "🔮 Patterns" },
  { id: "mixed", label: "🎲 Mixed" },
  { id: "challenge", label: "🏆 Challenge" }
];

export const GAMES = [...BASE_GAMES, ...TABLE_GAMES, ...EXTRA_GAMES];

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
