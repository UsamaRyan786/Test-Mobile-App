import { TEACHER_LABEL } from "./teacherConfig";
import { BASIC_SHAPES } from "./shapes";

function classSlides(topic, emoji, intro, visual, options = {}) {
  const { middle = [], completeTip } = options;
  const lastVisual = middle.length ? middle[middle.length - 1].visual : visual;
  return [
    {
      title: `What is ${topic}?`,
      emoji,
      body: intro,
      tip: `Watch the whiteboard and listen to ${TEACHER_LABEL}.`,
      visual
    },
    {
      title: "Study the Example",
      emoji: "📋",
      body: "Look carefully at the picture on the whiteboard.",
      tip: "Point to each part as you listen!",
      visual
    },
    ...middle,
    {
      title: "Say It Out Loud",
      emoji: "🗣️",
      body: "Say the rule in your own words — that helps you remember!",
      tip: intro,
      visual: lastVisual
    },
    {
      title: "Quick Review",
      emoji: "💡",
      body: intro,
      tip: "You will only play games that match this class.",
      visual: { type: "celebrate", emoji }
    },
    {
      title: "Class Complete!",
      emoji: "🎓",
      body: `Great job! You finished ${topic} class.`,
      tip: completeTip || "Your matching games are now unlocked on the home screen!",
      visual: { type: "celebrate", emoji: "🌟" }
    }
  ];
}

const EXTRA_LESSONS = [
  {
    id: "count20",
    category: "counting",
    menuLabel: "Count to 20",
    title: "Count to 20 Class",
    subtitle: "Count all the way to twenty!",
    emoji: "2️⃣0️⃣",
    gradient: ["#BAE6FD", "#0284C7"],
    unlockAfter: "counting",
    slides: [
      {
        title: "Count Past Ten",
        emoji: "🎈",
        body: "You know 1 to 10. Now we count higher — eleven, twelve, thirteen, and more!",
        tip: "After 10 comes 11. Keep going one number at a time.",
        visual: { type: "dots", count: 11, item: "🎈", itemLabel: "balloon" }
      },
      {
        title: "Teens Numbers",
        emoji: "🔢",
        body: "Eleven, twelve, thirteen… all the way to nineteen. These are the teen numbers!",
        tip: "Teen numbers start with 1 and end with 9 — like 15.",
        visual: { type: "equation", parts: ["11", "12", "13", "…", "19"], highlight: "15" }
      },
      {
        title: "Twenty!",
        emoji: "🌟",
        body: "Twenty is two tens — 10 and 10 more. That is a big kid number!",
        tip: "Count on your fingers twice to reach 20.",
        visual: { type: "dots", count: 20, item: "⭐", itemLabel: "star" }
      },
      {
        title: "Count Back from 20",
        emoji: "⏪",
        body: "Count backwards: 20, 19, 18, 17… all the way down to 1!",
        tip: "Going backwards is great practice for subtraction later.",
        visual: { type: "equation", parts: ["20", "19", "18", "17", "…"], highlight: "17" }
      },
      {
        title: "Practice Out Loud",
        emoji: "🗣️",
        body: "Count from 1 to 20 without skipping any number. Then try counting back!",
        tip: "Say each number clearly for the microphone.",
        visual: { type: "dots", count: 15, item: "🎈", itemLabel: "balloon" }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You can count to 20! Tiny Dot Garden and more counting games are unlocked.",
        tip: "Next: Count to 100 Class!",
        visual: { type: "celebrate", emoji: "2️⃣0️⃣" }
      }
    ]
  },
  {
    id: "count100",
    category: "counting",
    menuLabel: "Count to 100",
    title: "Count to 100 Class",
    subtitle: "Big numbers — tens and hundreds!",
    emoji: "💯",
    gradient: ["#C4B5FD", "#7C3AED"],
    unlockAfter: "count20",
    slides: [
      {
        title: "Count by Tens",
        emoji: "🔟",
        body: "10, 20, 30, 40… counting by tens is fast! Each jump is ten more.",
        tip: "Skip count: ten, twenty, thirty…",
        visual: { type: "equation", parts: ["10", "20", "30", "40", "50"], highlight: "30" }
      },
      {
        title: "Numbers 21 to 50",
        emoji: "📊",
        body: "Twenty-one, thirty-five, forty-eight — numbers keep growing past twenty!",
        tip: "Say the tens first, then the ones: thirty + five = 35.",
        visual: { type: "equation", parts: ["21", "35", "48"], highlight: "35" }
      },
      {
        title: "All the Way to 100",
        emoji: "💯",
        body: "One hundred is the goal! Ten groups of ten make 100.",
        tip: "100 is written as 1-0-0.",
        visual: { type: "celebrate", emoji: "💯" }
      },
      {
        title: "Numbers 51 to 99",
        emoji: "📈",
        body: "Fifty-one, sixty, seventy-five, ninety-nine — keep counting past fifty!",
        tip: "Say the tens, then the ones: sixty + four = 64.",
        visual: { type: "equation", parts: ["51", "64", "78", "99"], highlight: "64" }
      },
      {
        title: "Skip Back by Tens",
        emoji: "⏪",
        body: "100, 90, 80, 70… counting back by tens is fast too!",
        tip: "Skip counting works forwards and backwards.",
        visual: { type: "equation", parts: ["100", "90", "80", "70", "60"], highlight: "80" }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You can count to 100! Big Dot Field and skip-count games unlock now.",
        tip: "Next: Numbers Class — learn to recognise every number!",
        visual: { type: "celebrate", emoji: "💯" }
      }
    ]
  },
  {
    id: "numbers",
    category: "counting",
    menuLabel: "Numbers",
    title: "Numbers Class",
    subtitle: "Learn numbers 0 to 10!",
    emoji: "🔟",
    gradient: ["#FDE68A", "#F59E0B"],
    unlockAfter: "count100",
    slides: [
      {
        title: "Meet the Numbers",
        emoji: "🔟",
        body: "Numbers are symbols we use to count — 0, 1, 2, 3, and all the way to 10!",
        tip: "Each number has a name and a symbol.",
        visual: { type: "equation", parts: ["0", "1", "2", "3", "4"], highlight: "3" }
      },
      {
        title: "Zero and One",
        emoji: "0️⃣",
        body: "Zero means nothing. One means a single thing — one apple, one star!",
        tip: "0 is empty. 1 is the first counting number.",
        visual: { type: "dots", count: 1, item: "⭐", itemLabel: "star" }
      },
      {
        title: "Numbers 2 to 5",
        emoji: "🖐️",
        body: "Hold up your fingers! Two, three, four, five — each number is one more.",
        tip: "Count on your fingers as you say each number.",
        visual: { type: "dots", count: 5, item: "🌸", itemLabel: "flower" }
      },
      {
        title: "Numbers 6 to 10",
        emoji: "🔢",
        body: "Six, seven, eight, nine, ten! These are the big kid numbers up to ten.",
        tip: "Ten is two hands — all fingers up!",
        visual: { type: "dots", count: 10, item: "🎈", itemLabel: "balloon" }
      },
      {
        title: "Match Number to Dots",
        emoji: "🎯",
        body: "Seven dots on the board means the number 7. The symbol and the group must match!",
        tip: "Count the dots, then say the number name.",
        visual: { type: "match", count: 7, item: "🌸", itemLabel: "flower" }
      },
      {
        title: "Number Names",
        emoji: "🗣️",
        body: "Say each number name: zero, one, two… all the way to ten!",
        tip: "Number Word Match game will test your listening.",
        visual: { type: "equation", parts: ["0", "1", "2", "…", "10"], highlight: "10" }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You know numbers 0 to 10! Number Order Class is next.",
        tip: "Say each number out loud every day to remember them!",
        visual: { type: "celebrate", emoji: "🔟" }
      }
    ]
  },
  {
    id: "shapes",
    category: "shapes",
    menuLabel: "Shapes",
    title: "Shapes Class",
    subtitle: "Learn circles, squares, triangles & more!",
    emoji: "🔷",
    gradient: ["#FBCFE8", "#EC4899"],
    unlockAfter: "evenOdd",
    slides: [
      {
        title: "What Are Shapes?",
        emoji: "🔷",
        body: "Shapes are flat forms we see everywhere — on signs, toys, windows, and drawings!",
        tip: "Look around you. Can you spot a circle or a square?",
        visual: { type: "shapes", shapes: BASIC_SHAPES }
      },
      {
        title: "Round Shapes",
        emoji: "⭕",
        body: "Circle, oval, and heart are round shapes. They curve smoothly with no pointy corners.",
        tip: "A ball looks like a circle. An egg looks like an oval.",
        visual: {
          type: "shapes",
          shapes: BASIC_SHAPES.filter((shape) => shape.group === "round"),
          label: "Round shapes:"
        }
      },
      {
        title: "Shapes with Corners",
        emoji: "🟧",
        body: "Square, rectangle, triangle, star, and diamond have straight sides and corners.",
        tip: "A triangle has 3 sides. A square has 4 equal sides.",
        visual: {
          type: "shapes",
          shapes: BASIC_SHAPES.filter((shape) => shape.group === "corners"),
          label: "Shapes with corners:"
        }
      },
      {
        title: "Count the Shapes",
        emoji: "🔺",
        body: "You can count shapes just like you count objects. How many triangles do you see?",
        tip: "Point to each triangle and say one, two, three…",
        visual: { type: "dots", count: 4, item: "🔺", itemLabel: "triangle" }
      },
      {
        title: "Shapes Around You",
        emoji: "🏠",
        body: "Windows look like rectangles. Wheels look like circles. Shapes are everywhere!",
        tip: "Find one round shape and one shape with corners at home.",
        visual: { type: "shapes", shapes: BASIC_SHAPES.slice(0, 4) }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You learned basic shapes! Shape games are unlocked for you now.",
        tip: "Next: Patterns Class — spot colours and sequences!",
        visual: { type: "celebrate", emoji: "🔷" }
      }
    ]
  },
  {
    id: "compare",
    category: "compare",
    menuLabel: "Compare",
    title: "Compare Class",
    subtitle: "Learn bigger and smaller numbers!",
    emoji: "⚖️",
    gradient: ["#BFDBFE", "#3B82F6"],
    unlockAfter: "numberLine",
    slides: classSlides(
      "Compare",
      "⚖️",
      "Compare means finding which number is bigger or smaller.",
      { type: "equation", parts: ["7", ">", "3"], highlight: "7" },
      {
        middle: [
          {
            title: "Bigger Than",
            emoji: "📈",
            body: "7 is bigger than 3. We write 7 > 3.",
            tip: "The open side of > points to the bigger number!",
            visual: { type: "equation", parts: ["7", ">", "3"], highlight: "7" }
          },
          {
            title: "Smaller Than",
            emoji: "📉",
            body: "3 is smaller than 7. We write 3 < 7.",
            tip: "The point of < aims at the smaller number!",
            visual: { type: "equation", parts: ["3", "<", "7"], highlight: "3" }
          }
        ],
        completeTip: "Compare games unlock now! Next: Even & Odd Class."
      }
    )
  },
  {
    id: "numberLine",
    category: "patterns",
    menuLabel: "Number Order",
    title: "Number Order Class",
    subtitle: "What comes before and after!",
    emoji: "🎢",
    gradient: ["#A5F3FC", "#06B6D4"],
    unlockAfter: "numbers",
    slides: [
      {
        title: "The Number Line",
        emoji: "🎢",
        body: "Numbers go in order on a line — like steps on stairs. Each step is one more.",
        tip: "Left is smaller, right is bigger!",
        visual: { type: "equation", parts: ["1", "2", "3", "4", "5"], highlight: "3" }
      },
      {
        title: "What Comes After?",
        emoji: "➡️",
        body: "After 4 comes 5. After 7 comes 8. The next number is always one more!",
        tip: "After means the number to the right.",
        visual: { type: "equation", parts: ["6", "→", "7"], highlight: "7" }
      },
      {
        title: "What Comes Before?",
        emoji: "⬅️",
        body: "Before 9 is 8. Before 3 is 2. The number before is one less!",
        tip: "Before means the number to the left.",
        visual: { type: "equation", parts: ["4", "←", "3"], highlight: "3" }
      },
      {
        title: "In Between",
        emoji: "🎯",
        body: "What number is between 5 and 7? It's 6 — right in the middle!",
        tip: "Between means the number in the middle.",
        visual: { type: "equation", parts: ["5", "?", "7"], highlight: "6" }
      },
      {
        title: "Jump on the Line",
        emoji: "🦘",
        body: "Start at 4, jump forward 2 steps — you land on 6!",
        tip: "Moving right means bigger numbers.",
        visual: { type: "equation", parts: ["4", "→", "→", "6"], highlight: "6" }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You know number order! Pattern games will help you practice.",
        tip: "Next up: Even & Odd Class!",
        visual: { type: "celebrate", emoji: "🎢" }
      }
    ]
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
      { type: "equation", parts: ["4", "=", "even"], highlight: "even" },
      {
        middle: [
          {
            title: "Even in Pairs",
            emoji: "👫",
            body: "4 splits into two pairs with none left over — that is even!",
            tip: "2, 4, 6, 8, 10 are even numbers.",
            visual: { type: "dots", count: 4, item: "🌸", itemLabel: "flower" }
          },
          {
            title: "Odd Numbers",
            emoji: "🦉",
            body: "5 in pairs leaves one alone — that is odd!",
            tip: "1, 3, 5, 7, 9 are odd numbers.",
            visual: { type: "dots", count: 5, item: "⭐", itemLabel: "star" }
          }
        ],
        completeTip: "Even & Odd games unlock! Next: Shapes Class."
      }
    )
  },
  {
    id: "money",
    category: "addition",
    menuLabel: "Money",
    title: "Money & Coins Class",
    subtitle: "Count coins and make totals!",
    emoji: "🪙",
    gradient: ["#FEF08A", "#EAB308"],
    unlockAfter: "timeBasics",
    slides: [
      {
        title: "Pakistani Rupees",
        emoji: "🇵🇰",
        body: "In Pakistan we use rupees — Rs. Coins come in 1, 2, 5, and 10 rupee pieces!",
        tip: "Rs. means rupees — our money in Pakistan.",
        visual: { type: "dots", count: 3, item: "🪙", itemLabel: "rupee coin" }
      },
      {
        title: "Count the Coins",
        emoji: "💰",
        body: "If you have 4 coins of Rs. 5 each, count them: one, two, three, four!",
        tip: "Counting coins is just like counting objects.",
        visual: { type: "dots", count: 4, item: "🪙", itemLabel: "coin" }
      },
      {
        title: "Add Coins Together",
        emoji: "➕",
        body: "Rs. 2 plus Rs. 3 makes Rs. 5 altogether — same as 2 + 3 = 5!",
        tip: "Adding money uses the same maths as adding numbers!",
        visual: { type: "groups", left: 2, right: 3, symbol: "+", item: "🪙" }
      },
      {
        title: "At the Shop",
        emoji: "🏪",
        body: "A biscuit costs Rs. 5. You pay with a Rs. 10 coin. How much change?",
        tip: "10 − 5 = 5 rupees change!",
        visual: { type: "equation", parts: ["10", "−", "5", "=", "5"], highlight: "5" }
      },
      {
        title: "Simple Buying",
        emoji: "🛒",
        body: "Rs. 4 plus Rs. 6 for two snacks — that is Rs. 10 total!",
        tip: "Add prices when you buy more than one thing.",
        visual: { type: "groups", left: 4, right: 6, symbol: "+", item: "🪙" }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You can count and add coins! Keep practicing with addition games.",
        tip: "Next: Measure Class — long, short, and more!",
        visual: { type: "celebrate", emoji: "🪙" }
      }
    ]
  },
  {
    id: "measure",
    category: "compare",
    menuLabel: "Measure",
    title: "Measure Class",
    subtitle: "Long, short, heavy & light!",
    emoji: "📏",
    gradient: ["#BBF7D0", "#16A34A"],
    unlockAfter: "money",
    slides: [
      {
        title: "Compare Sizes",
        emoji: "📏",
        body: "Some things are long and some are short. We can compare how big things are!",
        tip: "Longer means more length. Shorter means less.",
        visual: { type: "equation", parts: ["long", ">", "short"], highlight: "long" }
      },
      {
        title: "Heavy and Light",
        emoji: "⚖️",
        body: "A big rock is heavy. A feather is light. Which weighs more?",
        tip: "Heavy goes down on a scale. Light goes up!",
        visual: { type: "equation", parts: ["🪨", ">", "🪶"], highlight: "🪨" }
      },
      {
        title: "More and Less",
        emoji: "🍎",
        body: "5 apples is more than 2 apples. 3 books is less than 7 books.",
        tip: "More means a bigger number. Less means a smaller number.",
        visual: { type: "groups", left: 5, right: 2, symbol: ">", item: "🍎" }
      },
      {
        title: "Centimetres",
        emoji: "📐",
        body: "We measure length in centimetres (cm). A pencil might be 15 cm long.",
        tip: "Longer objects have a bigger cm number.",
        visual: { type: "equation", parts: ["15", "cm", ">", "8", "cm"], highlight: "15" }
      },
      {
        title: "Which Is Longer?",
        emoji: "📏",
        body: "Compare two lengths: 12 cm vs 9 cm. 12 cm is longer!",
        tip: "Use compare skills for measurement too.",
        visual: { type: "equation", parts: ["12", "cm", "vs", "9", "cm"], highlight: "12" }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You learned to compare size and amount! Multiplication Class is next.",
        tip: "Use compare games to practice more and less!",
        visual: { type: "celebrate", emoji: "📏" }
      }
    ]
  },
  {
    id: "patterns",
    category: "patterns",
    menuLabel: "Patterns",
    title: "Patterns Class",
    subtitle: "Spot number patterns and sequences!",
    emoji: "🔮",
    gradient: ["#DDD6FE", "#8B5CF6"],
    unlockAfter: "timesTables",
    slides: classSlides(
      "Patterns",
      "🔮",
      "Patterns are numbers that follow a rule, like counting by twos or fives.",
      { type: "equation", parts: ["2", ",", "4", ",", "6", "…"], highlight: "6" },
      {
        middle: [
          {
            title: "Count by Twos",
            emoji: "2️⃣",
            body: "2, 4, 6, 8 — each step adds 2. What comes next?",
            tip: "8 + 2 = 10",
            visual: { type: "equation", parts: ["2", "4", "6", "8", "…"], highlight: "10" }
          },
          {
            title: "Count by Fives",
            emoji: "5️⃣",
            body: "5, 10, 15, 20 — jumping by five each time!",
            tip: "Skip counting helps with times tables.",
            visual: { type: "equation", parts: ["5", "10", "15", "20"], highlight: "25" }
          },
          {
            title: "Growing Patterns",
            emoji: "🌱",
            body: "Some patterns get bigger each step: 1, 3, 5, 7…",
            tip: "Find the rule, then predict the next number.",
            visual: { type: "equation", parts: ["1", "3", "5", "7", "9"], highlight: "9" }
          }
        ],
        completeTip: "Pattern games unlock! Keep spotting the rule."
      }
    )
  },
  {
    id: "patternsIntro",
    category: "patterns",
    menuLabel: "Patterns",
    title: "Patterns & Colours Class",
    subtitle: "Spot colours and simple sequences!",
    emoji: "🌈",
    gradient: ["#FDE68A", "#F97316"],
    unlockAfter: "shapes",
    slides: [
      {
        title: "Colours Everywhere",
        emoji: "🎨",
        body: "Red, blue, green, yellow — colours help us sort and match things!",
        tip: "Say the colour name out loud when you see it.",
        visual: { type: "equation", parts: ["🔴", "🔵", "🟢", "🟡"], highlight: "🔵" }
      },
      {
        title: "What Comes Next?",
        emoji: "🔮",
        body: "Red, blue, red, blue — what colour comes next? Patterns repeat!",
        tip: "Look for what repeats again and again.",
        visual: { type: "equation", parts: ["🔴", "🔵", "🔴", "🔵", "?"], highlight: "🔴" }
      },
      {
        title: "Number Patterns",
        emoji: "1️⃣",
        body: "1, 2, 3, 4 — numbers can make patterns too! What number comes after 4?",
        tip: "Counting in order is the simplest pattern.",
        visual: { type: "equation", parts: ["1", "2", "3", "4", "5"], highlight: "5" }
      },
      {
        title: "Skip by Twos",
        emoji: "2️⃣",
        body: "2, 4, 6 — a pattern that jumps by two each time!",
        tip: "What comes after 6? Say eight!",
        visual: { type: "equation", parts: ["2", "4", "6", "8"], highlight: "8" }
      },
      {
        title: "Make Your Own",
        emoji: "✏️",
        body: "Clap-stamp-clap-stamp — that is a sound pattern! Maths patterns work the same way.",
        tip: "Look for what repeats in colours, sounds, and numbers.",
        visual: { type: "equation", parts: ["🔴", "🔵", "🔴", "🔵", "?"], highlight: "🔴" }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You can spot patterns and colours! Pattern games unlock now.",
        tip: "Next: Addition Class — Grade 1 starts here!",
        visual: { type: "celebrate", emoji: "🌈" }
      }
    ]
  },
  {
    id: "numberBonds",
    category: "addition",
    menuLabel: "Number Bonds",
    title: "Number Bonds Class",
    subtitle: "Numbers that make 5, 10, and 20!",
    emoji: "🔗",
    gradient: ["#A7F3D0", "#059669"],
    unlockAfter: "addition",
    slides: [
      {
        title: "What Are Number Bonds?",
        emoji: "🔗",
        body: "Number bonds are pairs that make a total. 2 and 3 make 5!",
        tip: "Think: which two numbers join to make the target?",
        visual: { type: "equation", parts: ["2", "+", "3", "=", "5"], highlight: "5" }
      },
      {
        title: "Make Five",
        emoji: "🖐️",
        body: "Hold up 5 fingers. If 2 are down, 3 are up. 2 + 3 = 5!",
        tip: "Use your fingers to find the missing bond.",
        visual: { type: "groups", left: 2, right: 3, symbol: "+", item: "🌸" }
      },
      {
        title: "Make Ten",
        emoji: "🔟",
        body: "Ten is a magic number! 6 + 4 = 10 and 7 + 3 = 10.",
        tip: "Practice pairs that make 10 every day.",
        visual: { type: "equation", parts: ["6", "+", "4", "=", "10"], highlight: "10" }
      },
      {
        title: "Make Twenty",
        emoji: "2️⃣0️⃣",
        body: "Big kid bonds! 12 + 8 = 20 and 15 + 5 = 20.",
        tip: "Twenty is two tens — use that to help you.",
        visual: { type: "equation", parts: ["12", "+", "8", "=", "20"], highlight: "20" }
      },
      {
        title: "Find the Missing",
        emoji: "❓",
        body: "3 + ? = 10. The missing bond is 7!",
        tip: "Ask: what plus 3 makes 10?",
        visual: { type: "equation", parts: ["3", "+", "?", "=", "10"], highlight: "7" }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You know number bonds! Make Five, Make Ten, and Make Twenty games unlock.",
        tip: "Next: Subtraction Class!",
        visual: { type: "celebrate", emoji: "🔗" }
      }
    ]
  },
  {
    id: "timeBasics",
    category: "measure",
    menuLabel: "Time",
    title: "Time & Clock Class",
    subtitle: "Hours, minutes, and the clock!",
    emoji: "🕐",
    gradient: ["#BFDBFE", "#2563EB"],
    unlockAfter: "subtraction",
    slides: [
      {
        title: "Reading the Clock",
        emoji: "🕐",
        body: "A clock has two hands. The short hand shows the hour. The long hand shows minutes.",
        tip: "When the long hand points to 12, it is o'clock!",
        visual: { type: "equation", parts: ["🕐", "1", "o'clock"], highlight: "1" }
      },
      {
        title: "Hours of the Day",
        emoji: "☀️",
        body: "Morning, afternoon, evening, night — the day has 24 hours!",
        tip: "School time, lunch time, bedtime — all have a time.",
        visual: { type: "equation", parts: ["☀️", "morning", "🌙", "night"], highlight: "morning" }
      },
      {
        title: "Half Past",
        emoji: "🕧",
        body: "When the long hand points to 6, it is half past the hour — 30 minutes!",
        tip: "Half past 3 means 3:30.",
        visual: { type: "equation", parts: ["3", ":", "30"], highlight: "30" }
      },
      {
        title: "Quarter Past",
        emoji: "🕒",
        body: "When the long hand points to 3, it is quarter past — 15 minutes!",
        tip: "Quarter past 4 means 4:15.",
        visual: { type: "equation", parts: ["4", ":", "15"], highlight: "15" }
      },
      {
        title: "Days and Months",
        emoji: "📅",
        body: "Monday, Tuesday… seven days in a week. January to December — twelve months!",
        tip: "Your birthday is on a special date each year.",
        visual: { type: "equation", parts: ["Mon", "Tue", "Wed", "…", "Sun"], highlight: "Wed" }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You learned clock basics! Money & Coins Class is next.",
        tip: "Look at a real clock at home and say the time!",
        visual: { type: "celebrate", emoji: "🕐" }
      }
    ]
  },
  {
    id: "fractions",
    category: "division",
    menuLabel: "Fractions",
    title: "Fractions Class",
    subtitle: "Halves and quarters!",
    emoji: "🍕",
    gradient: ["#FECDD3", "#E11D48"],
    unlockAfter: "division",
    slides: [
      {
        title: "What Is a Half?",
        emoji: "🍕",
        body: "Cut a pizza into 2 equal pieces. Each piece is one half — written as ½!",
        tip: "Half means 2 equal parts.",
        visual: { type: "equation", parts: ["1", "÷", "2", "=", "½"], highlight: "½" }
      },
      {
        title: "What Is a Quarter?",
        emoji: "🥧",
        body: "Cut into 4 equal pieces. Each piece is one quarter — ¼!",
        tip: "Quarter means 4 equal parts.",
        visual: { type: "equation", parts: ["1", "÷", "4", "=", "¼"], highlight: "¼" }
      },
      {
        title: "Half of a Number",
        emoji: "🪓",
        body: "Half of 8 is 4. Split 8 into two equal groups!",
        tip: "8 ÷ 2 = 4 — that is half of 8.",
        visual: { type: "equation", parts: ["8", "÷", "2", "=", "4"], highlight: "4" }
      },
      {
        title: "Quarter of a Number",
        emoji: "🥧",
        body: "Quarter of 12 is 3. Split 12 into four equal groups!",
        tip: "12 ÷ 4 = 3 — that is one quarter of 12.",
        visual: { type: "equation", parts: ["12", "÷", "4", "=", "3"], highlight: "3" }
      },
      {
        title: "Half vs Quarter",
        emoji: "⚖️",
        body: "½ is bigger than ¼. Two quarters make a half!",
        tip: "Cut a roti in 2 for halves, in 4 for quarters.",
        visual: { type: "equation", parts: ["½", ">", "¼"], highlight: "½" }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You know halves and quarters! Half Moon Math unlocks now.",
        tip: "Next: Times Tables Class!",
        visual: { type: "celebrate", emoji: "🍕" }
      }
    ]
  },
  {
    id: "timesTables",
    category: "multiplication",
    menuLabel: "Times Tables",
    title: "Times Tables Class",
    subtitle: "Master tables from 2 to 12!",
    emoji: "🗼",
    gradient: ["#F9A8D4", "#DB2777"],
    unlockAfter: "fractions",
    slides: [
      {
        title: "Why Times Tables?",
        emoji: "🗼",
        body: "Times tables help you multiply fast! 2×3, 4×5, 7×8 — learn them by heart.",
        tip: "Practice one table at a time, starting with ×2.",
        visual: { type: "equation", parts: ["3", "×", "4", "=", "12"], highlight: "12" }
      },
      {
        title: "Table of 2",
        emoji: "2️⃣",
        body: "2, 4, 6, 8, 10 — skip counting by twos is the ×2 table!",
        tip: "2 × 5 = 10",
        visual: { type: "equation", parts: ["2", "4", "6", "8", "10"], highlight: "6" }
      },
      {
        title: "Table of 5",
        emoji: "5️⃣",
        body: "5, 10, 15, 20, 25 — the ×5 table is skip counting by fives!",
        tip: "5 × 6 = 30",
        visual: { type: "equation", parts: ["5", "10", "15", "20", "25"], highlight: "15" }
      },
      {
        title: "Tables 2 to 12",
        emoji: "📋",
        body: "Pakistani schools learn tables up to 12. Practice a little every day!",
        tip: "Say the whole table out loud: 3 ones are 3, 3 twos are 6…",
        visual: { type: "equation", parts: ["7", "×", "8", "=", "56"], highlight: "56" }
      },
      {
        title: "Table of 10",
        emoji: "🔟",
        body: "×10 is easy — just add a zero! 6 × 10 = 60.",
        tip: "10 × 10 = 100",
        visual: { type: "equation", parts: ["6", "×", "10", "=", "60"], highlight: "60" }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "Times table games from ×2 to ×12 are unlocked! Keep practicing!",
        tip: "Next: Advanced Patterns Class!",
        visual: { type: "celebrate", emoji: "🗼" }
      }
    ]
  },
  {
    id: "decimals",
    category: "mixed",
    menuLabel: "Decimals",
    title: "Decimals Class",
    subtitle: "Numbers with a dot!",
    emoji: "🔢",
    gradient: ["#A5F3FC", "#0891B2"],
    unlockAfter: "patterns",
    slides: classSlides(
      "Decimals",
      "🔢",
      "Decimals use a dot to show parts of a whole — like 0.5 means half.",
      { type: "equation", parts: ["0", ".", "5", "=", "½"], highlight: "0.5" },
      {
        middle: [
          {
            title: "Tenths Place",
            emoji: "🔢",
            body: "After the dot, the first digit is tenths. 0.3 means three tenths.",
            tip: "0.1, 0.2, 0.3… each step is one tenth more.",
            visual: { type: "equation", parts: ["0", ".", "1", "0", ".", "2", "0", ".", "3"], highlight: "0.2" }
          },
          {
            title: "Adding Tenths",
            emoji: "➕",
            body: "0.2 + 0.3 = 0.5 — add the parts after the dot.",
            tip: "Two tenths plus three tenths is five tenths.",
            visual: { type: "equation", parts: ["0.2", "+", "0.3", "=", "0.5"], highlight: "0.5" }
          },
          {
            title: "Compare Decimals",
            emoji: "⚖️",
            body: "0.7 is bigger than 0.4 — compare like whole numbers after the dot.",
            tip: "Which is bigger: 0.3 or 0.8?",
            visual: { type: "equation", parts: ["0.7", ">", "0.4"], highlight: "0.7" }
          }
        ],
        completeTip: "Decimal games unlock! Next: Percentage Class."
      }
    )
  },
  {
    id: "percentage",
    category: "mixed",
    menuLabel: "Percentage",
    title: "Percentage Class",
    subtitle: "Parts out of 100!",
    emoji: "💯",
    gradient: ["#DDD6FE", "#7C3AED"],
    unlockAfter: "decimals",
    slides: classSlides(
      "Percentage",
      "💯",
      "Percent means out of 100. 50% is the same as half — 50 out of 100.",
      { type: "equation", parts: ["50", "%", "=", "½"], highlight: "50%" },
      {
        middle: [
          {
            title: "Fifty Percent",
            emoji: "50",
            body: "50% of 20 is 10 — half of 20!",
            tip: "50% always means half.",
            visual: { type: "equation", parts: ["50", "%", "of", "20", "=", "10"], highlight: "10" }
          },
          {
            title: "Ten Percent",
            emoji: "🔟",
            body: "10% of 100 is 10. Move one place for tenths!",
            tip: "10% of 50 is 5.",
            visual: { type: "equation", parts: ["10", "%", "of", "100", "=", "10"], highlight: "10" }
          },
          {
            title: "Percent Grid",
            emoji: "💯",
            body: "Imagine 100 squares. Shade 25 — that is 25%!",
            tip: "25% is the same as one quarter.",
            visual: { type: "equation", parts: ["25", "%", "=", "¼"], highlight: "25%" }
          }
        ],
        completeTip: "Percentage games unlock! Next: Algebra Basics."
      }
    )
  },
  {
    id: "algebraBasics",
    category: "bodmas",
    menuLabel: "Algebra",
    title: "Algebra Basics Class",
    subtitle: "Letters for unknown numbers!",
    emoji: "🔤",
    gradient: ["#FBCFE8", "#BE185D"],
    unlockAfter: "percentage",
    slides: [
      {
        title: "What Is a Variable?",
        emoji: "🔤",
        body: "In algebra, a letter like x stands for a number we do not know yet.",
        tip: "x + 3 = 7 means find the number that makes this true.",
        visual: { type: "equation", parts: ["x", "+", "3", "=", "7"], highlight: "x" }
      },
      {
        title: "Simple Equations",
        emoji: "⚖️",
        body: "If x + 3 = 7, then x = 4. Both sides must balance!",
        tip: "What plus 3 makes 7? That is x.",
        visual: { type: "equation", parts: ["x", "=", "4"], highlight: "4" }
      },
      {
        title: "Order of Operations",
        emoji: "📐",
        body: "BODMAS tells us what to solve first — brackets, then ×÷, then +−.",
        tip: "B → O → D → M → A → S",
        visual: { type: "equation", parts: ["B", "O", "D", "M", "A", "S"], highlight: "B" }
      },
      {
        title: "Two-Step Equations",
        emoji: "2️⃣",
        body: "x + 5 = 12 means x = 7. Subtract 5 from both sides!",
        tip: "Keep both sides balanced like a scale.",
        visual: { type: "equation", parts: ["x", "+", "5", "=", "12"], highlight: "7" }
      },
      {
        title: "Try x − 2 = 6",
        emoji: "❓",
        body: "What number minus 2 equals 6? x = 8!",
        tip: "Add 2 to 6 to find x.",
        visual: { type: "equation", parts: ["x", "−", "2", "=", "6"], highlight: "8" }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You met algebra and BODMAS! BODMAS games unlock as you continue.",
        tip: "Next: Geometry Class!",
        visual: { type: "celebrate", emoji: "🔤" }
      }
    ]
  },
  {
    id: "geometry",
    category: "shapes",
    menuLabel: "Geometry",
    title: "Geometry & Word Problems Class",
    subtitle: "Angles, area, and real-life maths!",
    emoji: "📐",
    gradient: ["#BBF7D0", "#15803D"],
    unlockAfter: "algebraBasics",
    slides: [
      {
        title: "Shapes and Angles",
        emoji: "📐",
        body: "Triangles, squares, and rectangles have sides and corners called angles.",
        tip: "A square has 4 equal sides and 4 right angles.",
        visual: {
          type: "shapes",
          shapes: BASIC_SHAPES.filter((s) => s.name === "Square" || s.name === "Triangle")
        }
      },
      {
        title: "Perimeter",
        emoji: "📏",
        body: "Perimeter is the distance around a shape. Add all the sides!",
        tip: "A square with side 3 has perimeter 3 + 3 + 3 + 3 = 12.",
        visual: { type: "equation", parts: ["3", "+", "3", "+", "3", "+", "3", "=", "12"], highlight: "12" }
      },
      {
        title: "Word Problems",
        emoji: "📝",
        body: "Real maths uses words! 'Ali has 5 apples and buys 3 more' means 5 + 3.",
        tip: "Listen for plus, minus, times, and divide in the story.",
        visual: { type: "groups", left: 5, right: 3, symbol: "+", item: "🍎" }
      },
      {
        title: "Area Introduction",
        emoji: "🟦",
        body: "Area is space inside a shape. A 3×4 rectangle has area 12 square units.",
        tip: "Multiply length × width for rectangles.",
        visual: { type: "equation", parts: ["3", "×", "4", "=", "12"], highlight: "12" }
      },
      {
        title: "Right Angles",
        emoji: "📐",
        body: "A square corner is a right angle — like the corner of a book!",
        tip: "Triangles can have one right angle too.",
        visual: {
          type: "shapes",
          shapes: BASIC_SHAPES.filter((s) => s.name === "Square" || s.name === "Triangle")
        }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You learned geometry basics and word problems! Mixed practice is next.",
        tip: "Look for shapes and numbers around you every day!",
        visual: { type: "celebrate", emoji: "📐" }
      }
    ]
  },
  {
    id: "mixed",
    category: "mixed",
    menuLabel: "Mixed",
    title: "Mixed Operations Class",
    subtitle: "Practice + − × ÷ together!",
    emoji: "🎲",
    gradient: ["#FDE68A", "#D97706"],
    unlockAfter: "geometry",
    slides: classSlides(
      "Mixed Operations",
      "🎲",
      "Mixed means different operations in one practice — add, subtract, multiply, or divide.",
      { type: "equation", parts: ["3", "+", "4", "×", "2"], highlight: "11" },
      {
        middle: [
          {
            title: "Plus and Minus",
            emoji: "➕",
            body: "Read the sign! 9 + 4 = 13 and 9 − 4 = 5.",
            tip: "Look for + or − in every question.",
            visual: { type: "equation", parts: ["9", "+", "4", "=", "13"], highlight: "13" }
          },
          {
            title: "Times and Divide",
            emoji: "✖️",
            body: "6 × 3 = 18 and 18 ÷ 3 = 6 — they work together!",
            tip: "Check if the question uses × or ÷.",
            visual: { type: "equation", parts: ["6", "×", "3", "=", "18"], highlight: "18" }
          },
          {
            title: "Pick the Operation",
            emoji: "🧠",
            body: "Sharing equally? Use ÷. Groups of? Use ×. Altogether? Use +.",
            tip: "Read the words in the problem carefully.",
            visual: { type: "equation", parts: ["?", "read", "the", "sign"], highlight: "?" }
          }
        ],
        completeTip: "Mixed games unlock! Next: BODMAS Intro."
      }
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
        title: "Try an Example",
        emoji: "✏️",
        body: "5 + 2 × 3 — multiply first: 2 × 3 = 6, then 5 + 6 = 11.",
        tip: "Do not add 5 + 2 first!",
        visual: { type: "equation", parts: ["5", "+", "2", "×", "3", "=", "11"], highlight: "11" }
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
      { type: "equation", parts: ["(", "2", "+", "3", ")", "+", "4", "=", "9"], highlight: "9" },
      {
        middle: [
          {
            title: "Inside the Bracket",
            emoji: "🪝",
            body: "(4 + 1) = 5. Solve inside the bracket before anything else!",
            tip: "Bracket means do this part first.",
            visual: { type: "equation", parts: ["(", "4", "+", "1", ")", "=", "5"], highlight: "5" }
          },
          {
            title: "Bracket Then Multiply",
            emoji: "✖️",
            body: "(2 + 3) × 4 = 5 × 4 = 20.",
            tip: "Bracket answer first, then multiply.",
            visual: { type: "equation", parts: ["(", "2", "+", "3", ")", "×", "4", "=", "20"], highlight: "20" }
          }
        ],
        completeTip: "Bracket games unlock! Next: × ÷ First Class."
      }
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
      { type: "equation", parts: ["5", "+", "2", "×", "3", "=", "11"], highlight: "11" },
      {
        middle: [
          {
            title: "Multiply Before Add",
            emoji: "⏩",
            body: "8 + 3 × 2 = 8 + 6 = 14. Times before plus!",
            tip: "3 × 2 = 6 comes first.",
            visual: { type: "equation", parts: ["8", "+", "3", "×", "2", "=", "14"], highlight: "14" }
          },
          {
            title: "Divide Before Subtract",
            emoji: "➗",
            body: "10 − 8 ÷ 2 = 10 − 4 = 6. Divide before subtract!",
            tip: "8 ÷ 2 = 4 comes first.",
            visual: { type: "equation", parts: ["10", "−", "8", "÷", "2", "=", "6"], highlight: "6" }
          }
        ],
        completeTip: "×÷ first games unlock! Next: Full BODMAS."
      }
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
      { type: "equation", parts: ["(", "1", "+", "2", ")", "×", "3", "+", "4", "=", "13"], highlight: "13" },
      {
        middle: [
          {
            title: "Step by Step",
            emoji: "1️⃣",
            body: "(2 + 2) × 5 − 3 → bracket: 4 × 5 − 3 → times: 20 − 3 = 17.",
            tip: "One rule at a time!",
            visual: { type: "equation", parts: ["(", "2", "+", "2", ")", "×", "5", "−", "3"], highlight: "17" }
          },
          {
            title: "Full Example",
            emoji: "🏆",
            body: "3 + (4 + 1) × 2 = 3 + 5 × 2 = 3 + 10 = 13.",
            tip: "Bracket, then ×, then +.",
            visual: { type: "equation", parts: ["3", "+", "(", "4", "+", "1", ")", "×", "2", "=", "13"], highlight: "13" }
          }
        ],
        completeTip: "Full BODMAS games unlock! Next: Challenge Class."
      }
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
      { type: "celebrate", emoji: "🏆" },
      {
        middle: [
          {
            title: "You Know Counting",
            emoji: "🔢",
            body: "Count dots, compare numbers, and spot patterns — you learned it all!",
            tip: "Start each problem calmly.",
            visual: { type: "dots", count: 6, item: "⭐", itemLabel: "star" }
          },
          {
            title: "You Know Operations",
            emoji: "🧮",
            body: "+, −, ×, ÷ and BODMAS — use the right tool each time!",
            tip: "Read every sign before you answer.",
            visual: { type: "equation", parts: ["3", "+", "4", "×", "2", "=", "11"], highlight: "11" }
          },
          {
            title: "Expert Mode",
            emoji: "🥇",
            body: "Challenge games are the hardest — aim for 8 correct to pass each level!",
            tip: "You can replay any class to practise more.",
            visual: { type: "celebrate", emoji: "🏆" }
          }
        ],
        completeTip: "Challenge games unlocked — you are a math champion!"
      }
    )
  }
];

/** Pakistani curriculum order (Punjab / Federal / Sindh / Cambridge Primary aligned). */

export const LESSON_ORDER = [
  // Pre-Primary — number sense & shapes
  "counting",
  "count20",
  "count100",
  "numbers",
  "numberLine",
  "compare",
  "evenOdd",
  "shapes",
  "patternsIntro",
  // Grade 1 — operations & measurement
  "addition",
  "numberBonds",
  "subtraction",
  "timeBasics",
  "money",
  "measure",
  // Grade 2 — arithmetic & fractions intro
  "multiplication",
  "division",
  "fractions",
  // Grade 3 — times tables & patterns
  "timesTables",
  "patterns",
  // Grades 4–5 — decimals & percentage
  "decimals",
  "percentage",
  // Grades 6–8 — algebra & geometry
  "algebraBasics",
  "geometry",
  // Advanced practice
  "mixed",
  "bodmasIntro",
  "bodmasBrackets",
  "bodmasMulDiv",
  "bodmasFull",
  "challenge"
];

export const LESSON_META = {
  counting: { gradeBand: "Pre-Primary", voiceLevel: 1 },
  count20: { gradeBand: "Pre-Primary", voiceLevel: 1 },
  count100: { gradeBand: "Pre-Primary", voiceLevel: 1 },
  numbers: { gradeBand: "Pre-Primary", voiceLevel: 1 },
  numberLine: { gradeBand: "Pre-Primary", voiceLevel: 1 },
  compare: { gradeBand: "Pre-Primary", voiceLevel: 1 },
  evenOdd: { gradeBand: "Pre-Primary", voiceLevel: 1 },
  shapes: { gradeBand: "Pre-Primary", voiceLevel: 1 },
  patternsIntro: { gradeBand: "Pre-Primary", voiceLevel: 1 },
  addition: { gradeBand: "Grade 1", voiceLevel: 2 },
  numberBonds: { gradeBand: "Grade 1", voiceLevel: 2 },
  subtraction: { gradeBand: "Grade 1", voiceLevel: 3 },
  timeBasics: { gradeBand: "Grade 1", voiceLevel: 3 },
  money: { gradeBand: "Grade 1", voiceLevel: 2 },
  measure: { gradeBand: "Grade 1", voiceLevel: 2 },
  multiplication: { gradeBand: "Grade 2", voiceLevel: 4 },
  division: { gradeBand: "Grade 2", voiceLevel: 5 },
  fractions: { gradeBand: "Grade 2", voiceLevel: 6 },
  timesTables: { gradeBand: "Grade 3", voiceLevel: 4 },
  patterns: { gradeBand: "Grade 3", voiceLevel: 1 },
  decimals: { gradeBand: "Grade 4", voiceLevel: 7 },
  percentage: { gradeBand: "Grade 5", voiceLevel: 8 },
  algebraBasics: { gradeBand: "Grade 6", voiceLevel: 9 },
  geometry: { gradeBand: "Grade 7", voiceLevel: 10 },
  mixed: { gradeBand: "Practice", voiceLevel: 10 },
  bodmasIntro: { gradeBand: "Grade 6+", voiceLevel: 9 },
  bodmasBrackets: { gradeBand: "Grade 6+", voiceLevel: 9 },
  bodmasMulDiv: { gradeBand: "Grade 6+", voiceLevel: 9 },
  bodmasFull: { gradeBand: "Grade 6+", voiceLevel: 9 },
  challenge: { gradeBand: "Expert", voiceLevel: 10 }
};

export function applyLessonMeta(lesson) {
  const meta = LESSON_META[lesson.id] || {};
  return { ...lesson, ...meta };
}

export function buildCurriculumLessons(allLessons) {
  const map = Object.fromEntries(allLessons.map((lesson) => [lesson.id, lesson]));
  return LESSON_ORDER.map((id) => map[id]).filter(Boolean).map(applyLessonMeta);
}

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
        title: "Count to Ten",
        emoji: "🔟",
        body: "Practice counting to ten: one, two, three… all the way without skipping!",
        tip: "Use your fingers — one finger per number.",
        visual: { type: "dots", count: 10, item: "🌸", itemLabel: "flower" }
      },
      {
        title: "You're Ready!",
        emoji: "🎉",
        body: "You learned to count! Dot-counting games like Number Match Garden are unlocked for you now.",
        tip: "Next: Count to 20 Class — keep counting higher!",
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
    unlockAfter: "patternsIntro",
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
        title: "Add Within 20",
        emoji: "📚",
        body: "Grade 1 goal: add numbers up to 20, like 9 + 8 = 17!",
        tip: "Use number bonds to help — make ten first!",
        visual: { type: "equation", parts: ["9", "+", "8", "=", "17"], highlight: "17" }
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
    unlockAfter: "numberBonds",
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
        title: "Subtract Within 20",
        emoji: "📕",
        body: "15 − 7 = 8. Take away and count what is left!",
        tip: "Subtraction is the opposite of addition.",
        visual: { type: "equation", parts: ["15", "−", "7", "=", "8"], highlight: "8" }
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
    unlockAfter: "measure",
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
        title: "Arrays on the Board",
        emoji: "🥚",
        body: "3 rows of 4 eggs — that is 3 × 4 = 12 eggs in an array!",
        tip: "Rows × columns gives the total.",
        visual: { type: "groupsRepeat", groups: 3, perGroup: 4, item: "🥚" }
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
        title: "Remainders Intro",
        emoji: "🍬",
        body: "7 sweets shared by 2 friends — each gets 3 and 1 is left over.",
        tip: "Sometimes division leaves a remainder!",
        visual: { type: "share", total: 7, groups: 2, item: "🍬" }
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

export const LESSONS = buildCurriculumLessons([...CORE_LESSON_DEFS, ...EXTRA_LESSONS]);

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
  return progress?.lessons?.[lessonId] || { completed: false, slide: 0, speechReady: false };
}

export function getResumeSlideIndex(progress, lessonId) {
  if (isLessonComplete(progress, lessonId)) {
    return 0;
  }

  const lesson = getLesson(lessonId);
  const saved = getLessonProgress(progress, lessonId).slide ?? 0;
  return Math.max(0, Math.min(saved, lesson.slides.length - 1));
}

export function saveLessonCheckpoint(progress, lessonId, slideIndex, speechReady = false) {
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
  const savedSlide = Math.min(clamped, current.slide ?? clamped);
  next.lessons[lessonId] = {
    ...current,
    slide: savedSlide,
    speechReady: speechReady && savedSlide === clamped
  };
  return next;
}

export function markLessonStepComplete(progress, lessonId, completedSlideIndex) {
  if (isLessonComplete(progress, lessonId)) {
    return progress;
  }

  const lesson = getLesson(lessonId);
  const nextSlide = Math.min(completedSlideIndex + 1, lesson.slides.length - 1);
  const next = {
    ...progress,
    lessons: { ...progress.lessons }
  };
  const current = getLessonProgress(next, lessonId);
  next.lessons[lessonId] = {
    ...current,
    slide: nextSlide,
    speechReady: false
  };
  return next;
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

export const LESSON_BY_CATEGORY = {
  counting: "counting",
  shapes: "shapes",
  numbers: "numbers",
  numberLine: "numberLine",
  money: "money",
  measure: "measure",
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

/** Maps each game to the class that must be completed first (Pakistani curriculum order). */
export const GAME_LESSON_OVERRIDES = {
  // Pre-Primary — counting & number sense
  match: "counting",
  dotsTiny: "count20",
  dotsBig: "count100",
  skipBy10: "count100",
  beforeAfter: "numberLine",
  beforeOnly: "numberLine",
  afterOnly: "numberLine",
  betweenNumbers: "numberLine",
  compare: "compare",
  smaller: "compare",
  compareBig: "measure",
  pickOdd: "evenOdd",
  pickEven: "evenOdd",
  shapeSpotter: "shapes",
  shapeMatch: "shapes",
  shapeSides: "shapes",
  shapeCount: "shapes",
  sequence: "patternsIntro",
  skipBy5: "patternsIntro",

  // Grade 1 — operations & bonds
  addition: "addition",
  addTiny: "addition",
  addMedium: "addition",
  addBig: "addition",
  addThree: "addition",
  addOneMore: "addition",
  addTens: "addition",
  addZero: "addition",
  addFriends6: "addition",
  addFriends8: "addition",
  makeFive: "numberBonds",
  makeTen: "numberBonds",
  makeTwenty: "numberBonds",
  subtraction: "subtraction",
  subTiny: "subtraction",
  subBig: "subtraction",
  subFromTen: "subtraction",
  subSame: "subtraction",

  // Grade 2 — multiply & divide
  multiplication: "multiplication",
  mulFast4: "multiplication",
  mulBy0: "multiplication",
  mulBy1: "multiplication",
  doubles: "multiplication",
  triples: "multiplication",
  squares: "multiplication",
  doubleBig: "multiplication",
  division: "division",
  divBy1: "division",
  divBig: "division",
  divShare6: "division",
  halves: "fractions",

  // Grade 3 — times tables & patterns
  timesTables: "timesTables",
  mulTable2: "timesTables",
  mulTable3: "timesTables",
  mulTable4: "timesTables",
  mulTable5: "timesTables",
  mulTable6: "timesTables",
  mulTable7: "timesTables",
  mulTable8: "timesTables",
  mulTable9: "timesTables",
  mulTable10: "timesTables",
  mulTable11: "timesTables",
  mulTable12: "timesTables",
  tableChamp: "timesTables",
  sequence3: "patterns",
  sequence5: "patterns",
  countBack: "patterns",
  countBack2: "patterns",

  // Mixed & challenge
  mixed: "mixed",
  mixedAddSub: "mixed",
  mixedMulDiv: "mixed",
  missingAdd: "mixed",
  missingPlus: "mixed",
  missingMinus: "mixed",
  missingTimes: "mixed",
  missingDivide: "mixed",
  mathMarathon: "challenge",
  speedAdd: "challenge",
  brainTrainer: "challenge",
  patternPro: "patterns",

  // Algebra & BODMAS
  bodmasOrderQuiz: "algebraBasics",
  bodmasBracketBasics: "bodmasBrackets",
  bodmasBracketTimes: "bodmasBrackets",
  bodmasMulFirst: "bodmasMulDiv",
  bodmasDivFirst: "bodmasMulDiv",
  bodmasSubtractMix: "bodmasMulDiv",
  bodmasFullMix: "bodmasFull",
  bodmasMaster: "bodmasFull"
};

export function resolveLessonId(game) {
  if (game.lessonId) {
    return game.lessonId;
  }
  return GAME_LESSON_OVERRIDES[game.id] || LESSON_BY_CATEGORY[game.category] || "counting";
}

export function attachLessonIds(games) {
  return games.map((game) => ({
    ...game,
    lessonId: game.lessonId || resolveLessonId(game)
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
