function classSlides(topic, emoji, tip, visual) {
  return [
    {
      title: `What is ${topic}?`,
      emoji,
      body: tip,
      tip: "Watch the whiteboard and listen to Teacher Maya!",
      visual
    },
    {
      title: "Look at the Example",
      emoji: "📋",
      body: "Study the picture on the whiteboard carefully.",
      tip: "Say the answer out loud before you play games!",
      visual
    },
    {
      title: "Remember the Rule",
      emoji: "💡",
      body: tip,
      tip: "You will only play games that match this class.",
      visual: { type: "celebrate", emoji }
    },
    {
      title: "Class Complete!",
      emoji: "🎓",
      body: `Great job! You finished ${topic} class.`,
      tip: "Your matching games are now unlocked on the home screen!",
      visual: { type: "celebrate", emoji: "🌟" }
    }
  ];
}

export const EXTRA_LESSONS = [
  {
    id: "compare",
    category: "compare",
    menuLabel: "Compare",
    title: "Compare Class",
    subtitle: "Learn bigger and smaller numbers!",
    emoji: "⚖️",
    gradient: ["#BFDBFE", "#3B82F6"],
    unlockAfter: "counting",
    slides: classSlides(
      "Compare",
      "⚖️",
      "Compare means finding which number is bigger or smaller.",
      { type: "equation", parts: ["7", ">", "3"], highlight: "7" }
    )
  },
  {
    id: "evenOdd",
    category: "evenOdd",
    menuLabel: "Even & Odd",
    title: "Even & Odd Class",
    subtitle: "Learn even and odd numbers!",
    emoji: "🦉",
    gradient: ["#E9D5FF", "#A855F7"],
    unlockAfter: "compare",
    slides: classSlides(
      "Even and Odd",
      "🦉",
      "Even numbers can be split into pairs. Odd numbers have one left over.",
      { type: "equation", parts: ["4", "=", "even"], highlight: "even" }
    )
  },
  {
    id: "patterns",
    category: "patterns",
    menuLabel: "Patterns",
    title: "Patterns Class",
    subtitle: "Spot number patterns and sequences!",
    emoji: "🔮",
    gradient: ["#DDD6FE", "#8B5CF6"],
    unlockAfter: "division",
    slides: classSlides(
      "Patterns",
      "🔮",
      "Patterns are numbers that follow a rule, like counting by twos or fives.",
      { type: "equation", parts: ["2", ",", "4", ",", "6", "…"], highlight: "6" }
    )
  },
  {
    id: "mixed",
    category: "mixed",
    menuLabel: "Mixed",
    title: "Mixed Operations Class",
    subtitle: "Practice + − × ÷ together!",
    emoji: "🎲",
    gradient: ["#FDE68A", "#D97706"],
    unlockAfter: "patterns",
    slides: classSlides(
      "Mixed Operations",
      "🎲",
      "Mixed means different operations in one practice — add, subtract, multiply, or divide.",
      { type: "equation", parts: ["3", "+", "4", "×", "2"], highlight: "11" }
    )
  },
  {
    id: "bodmasIntro",
    category: "bodmas",
    menuLabel: "BODMAS Intro",
    title: "BODMAS Intro Class",
    subtitle: "Meet the order of operations!",
    emoji: "📐",
    gradient: ["#FBCFE8", "#EC4899"],
    unlockAfter: "mixed",
    slides: [
      {
        title: "What is BODMAS?",
        emoji: "📐",
        body: "BODMAS tells us which part of a sum to solve first: Brackets, Orders, Divide, Multiply, Add, Subtract.",
        tip: "B → O → D → M → A → S",
        visual: { type: "equation", parts: ["B", "O", "D", "M", "A", "S"], highlight: "B" }
      },
      {
        title: "Brackets First",
        emoji: "🪝",
        body: "Always solve brackets ( ) first — they come before everything else!",
        tip: "(2 + 3) means solve 2 + 3 inside the bracket first.",
        visual: { type: "equation", parts: ["(", "2", "+", "3", ")", "×", "4"], highlight: "5" }
      },
      {
        title: "× and ÷ Before + and −",
        emoji: "✖️",
        body: "Multiply and divide come before add and subtract.",
        tip: "In 3 + 4 × 2, do 4 × 2 first!",
        visual: { type: "equation", parts: ["3", "+", "4", "×", "2", "=", "11"], highlight: "11" }
      },
      {
        title: "Class Complete!",
        emoji: "🎓",
        body: "You met BODMAS! Next classes teach brackets, then ×÷, then full BODMAS games.",
        tip: "Try BODMAS Order Quiz when it unlocks!",
        visual: { type: "celebrate", emoji: "📐" }
      }
    ]
  },
  {
    id: "bodmasBrackets",
    category: "bodmas",
    menuLabel: "Brackets",
    title: "Brackets Class",
    subtitle: "Brackets ( ) come first!",
    emoji: "🪝",
    gradient: ["#F9A8D4", "#DB2777"],
    unlockAfter: "bodmasIntro",
    slides: classSlides(
      "Brackets",
      "🪝",
      "Work out the bracket first, then use that answer in the rest of the sum.",
      { type: "equation", parts: ["(", "2", "+", "3", ")", "+", "4", "=", "9"], highlight: "9" }
    )
  },
  {
    id: "bodmasMulDiv",
    category: "bodmas",
    menuLabel: "× ÷ First",
    title: "Multiply & Divide First Class",
    subtitle: "Do × and ÷ before + and −!",
    emoji: "⏩",
    gradient: ["#FDBA74", "#EA580C"],
    unlockAfter: "bodmasBrackets",
    slides: classSlides(
      "Multiply and Divide First",
      "⏩",
      "When there are no brackets, multiply and divide before you add or subtract.",
      { type: "equation", parts: ["5", "+", "2", "×", "3", "=", "11"], highlight: "11" }
    )
  },
  {
    id: "bodmasFull",
    category: "bodmas",
    menuLabel: "Full BODMAS",
    title: "Full BODMAS Class",
    subtitle: "Brackets, then ×÷, then +−!",
    emoji: "🏆",
    gradient: ["#FCA5A5", "#DC2626"],
    unlockAfter: "bodmasMulDiv",
    slides: classSlides(
      "Full BODMAS",
      "🏆",
      "Use the full rule: brackets first, then multiply and divide, then add and subtract.",
      { type: "equation", parts: ["(", "1", "+", "2", ")", "×", "3", "+", "4", "=", "13"], highlight: "13" }
    )
  },
  {
    id: "challenge",
    category: "challenge",
    menuLabel: "Challenge",
    title: "Challenge Class",
    subtitle: "Super mixed practice for experts!",
    emoji: "🥇",
    gradient: ["#FEF08A", "#CA8A04"],
    unlockAfter: "bodmasFull",
    slides: classSlides(
      "Challenge",
      "🥇",
      "Challenge games mix everything you learned — count, patterns, operations, and BODMAS!",
      { type: "celebrate", emoji: "🏆" }
    )
  }
];
