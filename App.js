import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MAX_ROUNDS = 8;
const HIGH_SCORES_KEY = "@mathGarden/highScores";
const MIN_NUMBER = 1;
const MAX_NUMBER = 10;

const THEME = {
  bg: ["#C9EFFF", "#E8F5FF", "#FFF4E6"],
  sky: "#7DD3FC",
  coral: "#FF6B9D",
  mint: "#4ADE80",
  gold: "#FBBF24",
  purple: "#A78BFA",
  text: "#1E3A5F",
  textSoft: "#5B7A9A"
};

const DOT_COLORS = ["#FBBF24", "#4ADE80", "#FF6B9D", "#60A5FA", "#A78BFA", "#FB923C"];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeChoices(value, min, max) {
  const choices = new Set([value]);

  while (choices.size < 4) {
    const next = Math.min(max, Math.max(min, value + randomInt(-3, 3)));
    choices.add(next);
  }

  return shuffle([...choices]);
}

function makeChoicesFromRange(value, min, max) {
  const choices = new Set([value]);

  while (choices.size < 4) {
    const next = randomInt(min, max);
    choices.add(next);
  }

  return shuffle([...choices]);
}

function createRound(gameId) {
  if (gameId === "addition") {
    const a = randomInt(1, 8);
    const b = randomInt(1, 8);
    const target = a + b;
    return {
      label: `${a} + ${b}`,
      target,
      choices: makeChoicesFromRange(target, 2, 16)
    };
  }

  if (gameId === "subtraction") {
    const a = randomInt(5, 12);
    const b = randomInt(1, 4);
    const target = a - b;
    return {
      label: `${a} - ${b}`,
      target,
      choices: makeChoicesFromRange(target, 1, 12)
    };
  }

  if (gameId === "multiplication") {
    const a = randomInt(2, 5);
    const b = randomInt(2, 5);
    const target = a * b;
    return {
      label: `${a} × ${b}`,
      target,
      choices: makeChoicesFromRange(target, 4, 25)
    };
  }

  if (gameId === "compare") {
    const a = randomInt(1, 12);
    let b = randomInt(1, 12);
    while (b === a) {
      b = randomInt(1, 12);
    }
    const target = Math.max(a, b);
    return {
      label: `${a}  vs  ${b}`,
      target,
      choices: makeChoicesFromRange(target, 1, 12)
    };
  }

  if (gameId === "sequence") {
    const start = randomInt(1, 6);
    const step = randomInt(1, 2);
    const seq = [start, start + step, start + step * 2];
    const target = start + step * 3;
    return {
      label: `${seq.join(", ")}, ?`,
      target,
      choices: makeChoicesFromRange(target, 1, 16)
    };
  }

  if (gameId === "makeTen") {
    const a = randomInt(1, 9);
    const target = 10 - a;
    return {
      label: `${a} + ? = 10`,
      target,
      choices: makeChoicesFromRange(target, 1, 9)
    };
  }

  if (gameId === "doubles") {
    const n = randomInt(1, 8);
    const target = n * 2;
    return {
      label: `Double ${n}`,
      target,
      choices: makeChoicesFromRange(target, 2, 16)
    };
  }

  if (gameId === "smaller") {
    const a = randomInt(1, 12);
    let b = randomInt(1, 12);
    while (b === a) {
      b = randomInt(1, 12);
    }
    const target = Math.min(a, b);
    return {
      label: `${a}  vs  ${b}`,
      target,
      choices: makeChoicesFromRange(target, 1, 12)
    };
  }

  if (gameId === "missingAdd") {
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

  if (gameId === "countBack") {
    const start = randomInt(6, 12);
    const seq = [start, start - 1, start - 2];
    const target = start - 3;
    return {
      label: `${seq.join(", ")}, ?`,
      target,
      choices: makeChoicesFromRange(target, 1, 12)
    };
  }

  if (gameId === "beforeAfter") {
    const n = randomInt(2, 9);
    if (randomInt(0, 1) === 1) {
      return {
        label: `After ${n} comes ?`,
        target: n + 1,
        choices: makeChoicesFromRange(n + 1, 1, 10)
      };
    }
    return {
      label: `Before ${n} comes ?`,
      target: n - 1,
      choices: makeChoicesFromRange(n - 1, 1, 10)
    };
  }

  const target = randomInt(MIN_NUMBER, MAX_NUMBER);
  return {
    label: `${target} dots`,
    target,
    choices: makeChoices(target, MIN_NUMBER, MAX_NUMBER)
  };
}

const GAMES = [
  {
    id: "match",
    title: "Number Match Garden",
    description: "Count the colorful dots and pick the right number!",
    emoji: "🌻",
    gradient: ["#86EFAC", "#22C55E"],
    accent: "#15803D"
  },
  {
    id: "addition",
    title: "Addition Adventure",
    description: "Add numbers together and become a math hero!",
    emoji: "🚀",
    gradient: ["#93C5FD", "#3B82F6"],
    accent: "#1D4ED8"
  },
  {
    id: "subtraction",
    title: "Subtraction Safari",
    description: "Take away numbers on a wild math safari!",
    emoji: "🦁",
    gradient: ["#FDBA74", "#F97316"],
    accent: "#C2410C"
  },
  {
    id: "multiplication",
    title: "Multiplication Meadow",
    description: "Multiply numbers and watch them bloom!",
    emoji: "🌸",
    gradient: ["#F9A8D4", "#EC4899"],
    accent: "#BE185D"
  },
  {
    id: "compare",
    title: "Compare Castle",
    description: "Find the bigger number between two friends!",
    emoji: "🏰",
    gradient: ["#C4B5FD", "#8B5CF6"],
    accent: "#6D28D9"
  },
  {
    id: "sequence",
    title: "Number Ninja",
    description: "Spot the pattern and find what comes next!",
    emoji: "🥷",
    gradient: ["#5EEAD4", "#14B8A6"],
    accent: "#0F766E"
  },
  {
    id: "makeTen",
    title: "Make Ten Magic",
    description: "Find the missing number to make ten!",
    emoji: "✨",
    gradient: ["#FDE047", "#EAB308"],
    accent: "#A16207"
  },
  {
    id: "doubles",
    title: "Double Trouble",
    description: "Double a number and find the answer!",
    emoji: "🪞",
    gradient: ["#FDA4AF", "#F43F5E"],
    accent: "#BE123C"
  },
  {
    id: "smaller",
    title: "Smaller Swamp",
    description: "Find the smaller number between two!",
    emoji: "🐸",
    gradient: ["#86EFAC", "#059669"],
    accent: "#047857"
  },
  {
    id: "missingAdd",
    title: "Missing Mystery",
    description: "Find the hidden number in the sum!",
    emoji: "🔍",
    gradient: ["#A5B4FC", "#6366F1"],
    accent: "#4338CA"
  },
  {
    id: "countBack",
    title: "Countdown Cave",
    description: "Count backwards and find what comes next!",
    emoji: "🦇",
    gradient: ["#CBD5E1", "#64748B"],
    accent: "#475569"
  },
  {
    id: "beforeAfter",
    title: "Before & After",
    description: "What number comes before or after?",
    emoji: "🎢",
    gradient: ["#F0ABFC", "#D946EF"],
    accent: "#A21CAF"
  }
];

async function loadHighScores() {
  try {
    const raw = await AsyncStorage.getItem(HIGH_SCORES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveHighScore(gameId, score) {
  const scores = await loadHighScores();
  const current = scores[gameId] || { best: 0, plays: 0 };
  const record = {
    best: Math.max(current.best, score),
    plays: current.plays + 1,
    lastScore: score
  };
  scores[gameId] = record;
  await AsyncStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
  return record;
}

function isDotsGame(gameId) {
  return gameId === "match";
}

function showEqualsHint(gameId) {
  return !["compare", "smaller", "sequence", "countBack", "beforeAfter", "missingAdd"].includes(gameId);
}

function usesWideQuestionText(gameId) {
  return ["compare", "smaller"].includes(gameId);
}

function usesSequenceQuestionText(gameId) {
  return ["sequence", "countBack", "beforeAfter"].includes(gameId);
}

function getInstruction(gameId) {
  if (gameId === "match") return "Tap the matching number!";
  if (gameId === "compare") return "Pick the bigger number!";
  if (gameId === "smaller") return "Pick the smaller number!";
  if (gameId === "sequence") return "What number comes next?";
  if (gameId === "countBack") return "Count backwards — what's next?";
  if (gameId === "beforeAfter") return "Pick the right number!";
  if (gameId === "makeTen") return "Find the missing number!";
  if (gameId === "missingAdd") return "Find the hidden number!";
  if (gameId === "doubles") return "What is the double?";
  return "Pick the correct answer!";
}

function getTargetLabel(gameId) {
  if (gameId === "match") return "🔢 Count these dots";
  if (gameId === "compare") return "⚖️ Which is bigger?";
  if (gameId === "smaller") return "🐸 Which is smaller?";
  if (gameId === "sequence") return "🔮 Complete the pattern";
  if (gameId === "countBack") return "⏪ Count backwards";
  if (gameId === "beforeAfter") return "🎢 Before or after?";
  if (gameId === "makeTen") return "🪄 Make ten!";
  if (gameId === "missingAdd") return "🔍 Find the missing piece";
  if (gameId === "doubles") return "🪞 Double it!";
  return "🧮 Solve this";
}

function getPrompt(gameId, finished) {
  if (finished) return "🌟 Want to play again?";
  if (gameId === "match") return "Which number matches?";
  if (gameId === "compare") return "Tap the bigger number!";
  if (gameId === "smaller") return "Tap the smaller number!";
  if (gameId === "sequence") return "What comes next in the pattern?";
  if (gameId === "countBack") return "What number comes next?";
  if (gameId === "beforeAfter") return "Choose the correct number!";
  if (gameId === "makeTen") return "What number makes ten?";
  if (gameId === "missingAdd") return "What number is missing?";
  if (gameId === "doubles") return "What's the double?";
  return "Choose the correct answer!";
}

function getDashboardStats(highScores) {
  const records = GAMES.map((game) => ({
    game,
    record: highScores[game.id] || { best: 0, plays: 0 }
  }));

  const totalPlays = records.reduce((sum, item) => sum + item.record.plays, 0);
  const totalBest = records.reduce((sum, item) => sum + item.record.best, 0);
  const perfectGames = records.filter((item) => item.record.best === MAX_ROUNDS).length;
  const topRecord = [...records].sort((a, b) => b.record.best - a.record.best)[0];

  return { records, totalPlays, totalBest, perfectGames, topRecord };
}

function getStars(score) {
  if (score >= 7) return 3;
  if (score >= 5) return 2;
  if (score >= 3) return 1;
  return 0;
}

function FloatingBubble({ style, delay = 0, duration = 4000 }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, duration, floatAnim]);

  const animatedStyle = {
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -18]
        })
      },
      {
        scale: floatAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.08, 1]
        })
      }
    ],
    opacity: floatAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.35, 0.55, 0.35]
    })
  };

  return <Animated.View style={[style, animatedStyle]} />;
}

function BackgroundDecor() {
  return (
    <View style={styles.backgroundExtras} pointerEvents="none">
      <FloatingBubble style={styles.bubbleOne} delay={0} duration={3500} />
      <FloatingBubble style={styles.bubbleTwo} delay={600} duration={4200} />
      <FloatingBubble style={styles.bubbleThree} delay={300} duration={3800} />
      <Text style={styles.decorStarOne}>⭐</Text>
      <Text style={styles.decorStarTwo}>✨</Text>
      <Text style={styles.decorCloud}>☁️</Text>
    </View>
  );
}

function MenuGameCard({ game, index, onPress, bestScore = 0, hasPlayed = false }) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    slideAnim.setValue(0);
    Animated.spring(slideAnim, {
      toValue: 1,
      delay: index * 120,
      friction: 7,
      tension: 50,
      useNativeDriver: true
    }).start();
  }, [index, slideAnim]);

  const entranceStyle = {
    opacity: slideAnim,
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0]
        })
      },
      { scale: scaleAnim }
    ]
  };

  function handlePressIn() {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 8,
      useNativeDriver: true
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true
    }).start();
  }

  return (
    <Animated.View style={entranceStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
      >
        <LinearGradient colors={game.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gameCard}>
          <View style={styles.gameCardScoreBadge}>
            <Text style={styles.gameCardScoreLabel}>Best</Text>
            <Text style={styles.gameCardScoreValue}>
              {hasPlayed ? `${bestScore}/${MAX_ROUNDS}` : "—"}
            </Text>
          </View>
          <View style={styles.gameCardEmojiWrap}>
            <Text style={styles.gameCardEmoji}>{game.emoji}</Text>
          </View>
          <View style={styles.gameCardContent}>
            <Text style={styles.gameCardTitle}>{game.title}</Text>
            <Text style={styles.gameCardDescription}>{game.description}</Text>
            <View style={styles.gameCardFooter}>
              <View style={styles.playChip}>
                <Text style={styles.playChipText}>Let's play! →</Text>
              </View>
              {hasPlayed && <StarRating count={getStars(bestScore)} compact />}
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function AnimatedDot({ index, color, roundKey }) {
  const popAnim = useRef(new Animated.Value(0)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    popAnim.setValue(0);
    Animated.spring(popAnim, {
      toValue: 1,
      delay: index * 70,
      friction: 4,
      tension: 120,
      useNativeDriver: true
    }).start();

    const wobble = Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleAnim, {
          toValue: 1,
          duration: 900 + index * 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(wobbleAnim, {
          toValue: 0,
          duration: 900 + index * 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    wobble.start();
    return () => wobble.stop();
  }, [index, roundKey, popAnim, wobbleAnim]);

  const dotStyle = {
    transform: [
      {
        scale: popAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1]
        })
      },
      {
        rotate: wobbleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["-6deg", "6deg"]
        })
      }
    ]
  };

  return (
    <Animated.View style={[styles.dot, { backgroundColor: color }, dotStyle]}>
      <View style={styles.dotShine} />
    </Animated.View>
  );
}

function ChoiceButton({ choice, onPress, disabled, isCorrect, isWrong }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isWrong) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true })
      ]).start();
    }
  }, [isWrong, shakeAnim]);

  useEffect(() => {
    if (isCorrect) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 400, useNativeDriver: true })
        ]),
        { iterations: 3 }
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [isCorrect, glowAnim]);

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      {
        translateX: shakeAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-8, 0, 8]
        })
      }
    ]
  };

  const glowStyle = {
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.15, 0.45]
    })
  };

  function handlePressIn() {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 8,
      useNativeDriver: true
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true
    }).start();
  }

  return (
    <Animated.View style={[styles.choiceWrapper, animatedStyle, isCorrect && glowStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.choiceButton,
          isCorrect && styles.correctChoice,
          isWrong && styles.wrongChoice
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Choose ${choice}`}
      >
        <Text style={styles.choiceText}>{choice}</Text>
      </Pressable>
    </Animated.View>
  );
}

function StarRating({ count, compact = false }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3].map((star) => (
        <Text
          key={star}
          style={[
            compact ? styles.starIconSmall : styles.starIcon,
            star <= count ? styles.starFilled : styles.starEmpty
          ]}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

function DashboardStatPill({ emoji, label, value }) {
  return (
    <View style={styles.dashboardStatPill}>
      <Text style={styles.dashboardStatEmoji}>{emoji}</Text>
      <Text style={styles.dashboardStatValue}>{value}</Text>
      <Text style={styles.dashboardStatLabel}>{label}</Text>
    </View>
  );
}

function DashboardScoreRow({ game, record, index }) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.setValue(0);
    Animated.spring(slideAnim, {
      toValue: 1,
      delay: index * 60,
      friction: 8,
      tension: 50,
      useNativeDriver: true
    }).start();
  }, [index, slideAnim]);

  const rowStyle = {
    opacity: slideAnim,
    transform: [
      {
        translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-24, 0]
        })
      }
    ]
  };

  const stars = getStars(record.best);
  const hasPlayed = record.plays > 0;

  return (
    <Animated.View style={rowStyle}>
      <LinearGradient colors={["#FFFFFF", "#FFFBEB"]} style={styles.dashboardRow}>
        <LinearGradient colors={game.gradient} style={styles.dashboardRowEmojiWrap}>
          <Text style={styles.dashboardRowEmoji}>{game.emoji}</Text>
        </LinearGradient>
        <View style={styles.dashboardRowContent}>
          <Text style={styles.dashboardRowTitle}>{game.title}</Text>
          <Text style={styles.dashboardRowMeta}>
            {hasPlayed ? `${record.plays} play${record.plays === 1 ? "" : "s"}` : "Not played yet"}
          </Text>
        </View>
        <View style={styles.dashboardRowScoreBlock}>
          <Text style={styles.dashboardRowScore}>
            {hasPlayed ? `${record.best}/${MAX_ROUNDS}` : "—"}
          </Text>
          {hasPlayed && <StarRating count={stars} compact />}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function ScreenShell({ children }) {
  return (
    <LinearGradient colors={THEME.bg} style={styles.gradientRoot}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.bg[0]} />
        <BackgroundDecor />
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function App() {
  const feedbackTimer = useRef(null);
  const titleAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const messageAnim = useRef(new Animated.Value(1)).current;
  const [screen, setScreen] = useState("menu");
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [roundData, setRoundData] = useState(() => createRound(GAMES[0].id));
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState(getInstruction(GAMES[0].id));
  const [finished, setFinished] = useState(false);
  const [roundKey, setRoundKey] = useState(0);
  const [highScores, setHighScores] = useState({});
  const [isNewRecord, setIsNewRecord] = useState(false);

  const currentHighScore = highScores[selectedGame.id]?.best ?? 0;

  const dots = useMemo(
    () =>
      isDotsGame(selectedGame.id)
        ? Array.from({ length: roundData.target }, (_, index) => index)
        : [],
    [roundData.target, selectedGame.id]
  );

  const gameTheme = GAMES.find((g) => g.id === selectedGame.id) || GAMES[0];

  const titleStyle = {
    transform: [
      {
        scale: titleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1]
        })
      }
    ],
    opacity: titleAnim
  };

  const logoStyle = {
    transform: [
      {
        rotate: logoAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["-3deg", "3deg"]
        })
      },
      {
        scale: logoAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.05]
        })
      }
    ]
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", `${(round / MAX_ROUNDS) * 100}%`]
  });

  useEffect(() => {
    Animated.spring(titleAnim, {
      toValue: 1,
      friction: 7,
      tension: 50,
      useNativeDriver: true
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(logoAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();

    return () => {
      if (feedbackTimer.current) {
        clearTimeout(feedbackTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    loadHighScores().then(setHighScores);
  }, [screen]);

  useEffect(() => {
    progressAnim.setValue(0);
    Animated.spring(progressAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: false
    }).start();
  }, [round, finished, screen, progressAnim]);

  function pulseMessage() {
    messageAnim.setValue(0.85);
    Animated.spring(messageAnim, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true
    }).start();
  }

  function startRound(gameId) {
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }

    setScore(0);
    setRound(1);
    setRoundData(createRound(gameId));
    setRoundKey((k) => k + 1);
    setSelected(null);
    setMessage(getInstruction(gameId));
    setFinished(false);
    setIsNewRecord(false);
  }

  function selectGame(game) {
    setSelectedGame(game);
    startRound(game.id);
    setScreen("game");
  }

  function backToMenu() {
    setScreen("menu");
  }

  function openDashboard() {
    setScreen("dashboard");
  }

  async function recordGameScore(gameId, score) {
    const record = await saveHighScore(gameId, score);
    setHighScores((prev) => ({ ...prev, [gameId]: record }));
    return record;
  }

  function goToNextRound(nextScore) {
    if (round >= MAX_ROUNDS) {
      setFinished(true);
      const prevBest = highScores[selectedGame.id]?.best ?? 0;
      const beatRecord = nextScore > prevBest;

      recordGameScore(selectedGame.id, nextScore);
      setIsNewRecord(beatRecord);

      const stars = getStars(nextScore);
      const starMsg =
        stars === 3
          ? "Amazing! You're a math superstar!"
          : stars === 2
            ? "Great job! Keep practicing!"
            : "Nice try! Play again to improve!";
      const recordMsg = beatRecord ? " 🏆 New high score!" : "";
      setMessage(`${starMsg}${recordMsg} Score: ${nextScore}/${MAX_ROUNDS}`);
      pulseMessage();
      return;
    }

    setRound((currentRound) => currentRound + 1);
    setRoundData(createRound(selectedGame.id));
    setRoundKey((k) => k + 1);
    setSelected(null);
    setMessage(getInstruction(selectedGame.id));
  }

  function chooseNumber(number) {
    if (selected !== null || finished) {
      return;
    }

    const isCorrect = number === roundData.target;
    const nextScore = isCorrect ? score + 1 : score;

    setSelected(number);
    setScore(nextScore);
    setMessage(
      isCorrect ? "🎉 Awesome! You got it!" : `💪 Almost! The answer is ${roundData.target}.`
    );
    pulseMessage();

    feedbackTimer.current = setTimeout(() => goToNextRound(nextScore), 1200);
  }

  function renderMenu() {
    const { totalPlays, topRecord, perfectGames } = getDashboardStats(highScores);

    return (
      <ScreenShell>
        <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.menuHeader, logoStyle]}>
            <LinearGradient colors={["#FDE68A", "#FBBF24"]} style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>🌈</Text>
            </LinearGradient>
            <View style={styles.heroCopy}>
              <Text style={styles.logoTitle}>Math Garden</Text>
              <Text style={styles.logoSubtitle}>Fun & colorful math for curious kids!</Text>
            </View>
            <Pressable
              onPress={openDashboard}
              style={({ pressed }) => [styles.dashboardFab, pressed && styles.pressedButton]}
              accessibilityRole="button"
              accessibilityLabel="Open high scores dashboard"
            >
              <Text style={styles.dashboardFabEmoji}>🏆</Text>
            </Pressable>
          </Animated.View>

          <View style={styles.sectionHeader}>
            <Text style={styles.eyebrow}>✦ Pick Your Adventure ✦</Text>
            <Animated.Text style={[styles.title, titleStyle]}>Which game shall we play?</Animated.Text>
            <Text style={styles.subtitle}>
              12 fun math games — count, add, subtract, multiply, and climb the high score board!
            </Text>
          </View>

          <LinearGradient colors={["#FFFFFF", "#FEF3C7"]} style={styles.menuScoreSummary}>
            <View style={styles.menuScoreSummaryHeader}>
              <Text style={styles.menuScoreSummaryTitle}>🏆 High Scores</Text>
              <Pressable onPress={openDashboard} style={styles.menuScoreSummaryLink}>
                <Text style={styles.menuScoreSummaryLinkText}>See all →</Text>
              </Pressable>
            </View>
            {totalPlays === 0 ? (
              <Text style={styles.menuScoreSummaryText}>
                No scores yet — pick a game below and set your first record!
              </Text>
            ) : (
              <Text style={styles.menuScoreSummaryText}>
                Top score: {topRecord.game.emoji} {topRecord.game.title} ({topRecord.record.best}/{MAX_ROUNDS})
                {" · "}
                {totalPlays} play{totalPlays === 1 ? "" : "s"}
                {perfectGames > 0 ? ` · ${perfectGames} perfect` : ""}
              </Text>
            )}
          </LinearGradient>

          <View style={styles.gameList}>
            {GAMES.map((game, index) => {
              const record = highScores[game.id] || { best: 0, plays: 0 };
              return (
                <MenuGameCard
                  key={game.id}
                  game={game}
                  index={index}
                  bestScore={record.best}
                  hasPlayed={record.plays > 0}
                  onPress={() => selectGame(game)}
                />
              );
            })}
          </View>
        </ScrollView>
      </ScreenShell>
    );
  }

  function renderGame() {
    const stars = getStars(score);

    return (
      <ScreenShell>
        <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
          <View style={styles.gameHeader}>
            <Pressable
              onPress={backToMenu}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressedButton]}
            >
              <Text style={styles.backButtonText}>← Home</Text>
            </Pressable>
            <View style={styles.gameTitleBlock}>
              <Text style={styles.gameEmoji}>{gameTheme.emoji}</Text>
              <Animated.Text style={[styles.gameTitle, titleStyle]}>{selectedGame.title}</Animated.Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressLabel}>
                Round {Math.min(round, MAX_ROUNDS)}/{MAX_ROUNDS}
              </Text>
            </View>
            <View style={styles.loadingBarContainer}>
              <Animated.View style={[styles.loadingBarFill, { width: progressWidth }]}>
                <LinearGradient
                  colors={gameTheme.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loadingBarGradient}
                />
              </Animated.View>
            </View>
          </View>

          <LinearGradient colors={["#FFFFFF", "#FFFBEB"]} style={styles.panel}>
            <View style={styles.statusBar}>
              <LinearGradient colors={["#DBEAFE", "#BFDBFE"]} style={styles.statBox}>
                <Text style={styles.statEmoji}>🏆</Text>
                <Text style={styles.label}>Score</Text>
                <Text style={styles.statValue}>{score}</Text>
              </LinearGradient>
              <LinearGradient colors={["#FCE7F3", "#FBCFE8"]} style={styles.statBox}>
                <Text style={styles.statEmoji}>🎯</Text>
                <Text style={styles.label}>Round</Text>
                <Text style={styles.statValue}>
                  {finished ? MAX_ROUNDS : round}/{MAX_ROUNDS}
                </Text>
              </LinearGradient>
              <LinearGradient colors={["#FEF3C7", "#FDE68A"]} style={styles.statBox}>
                <Text style={styles.statEmoji}>⭐</Text>
                <Text style={styles.label}>Best</Text>
                <Text style={styles.statValue}>
                  {currentHighScore}/{MAX_ROUNDS}
                </Text>
              </LinearGradient>
            </View>

            <LinearGradient colors={["#FFF1F2", "#FFE4E6"]} style={styles.targetCard}>
              <Text style={styles.targetLabel}>{getTargetLabel(selectedGame.id)}</Text>
              {isDotsGame(selectedGame.id) ? (
                <View style={styles.dotsGrid} accessibilityLabel={`${roundData.target} dots to count`}>
                  {dots.map((dot) => (
                    <AnimatedDot
                      key={`${roundKey}-${dot}`}
                      index={dot}
                      color={DOT_COLORS[dot % DOT_COLORS.length]}
                      roundKey={roundKey}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.questionCard}>
                  <LinearGradient colors={gameTheme.gradient} style={styles.questionGradient}>
                    <Text
                      style={[
                        styles.questionText,
                        usesWideQuestionText(selectedGame.id) && styles.compareQuestionText,
                        usesSequenceQuestionText(selectedGame.id) && styles.sequenceQuestionText
                      ]}
                    >
                      {roundData.label}
                    </Text>
                    {showEqualsHint(selectedGame.id) && (
                      <Text style={styles.questionHint}>= ?</Text>
                    )}
                  </LinearGradient>
                </View>
              )}
            </LinearGradient>

            <Text style={styles.prompt}>{getPrompt(selectedGame.id, finished)}</Text>

            {finished ? (
              <View style={styles.finishBlock}>
                {isNewRecord && (
                  <View style={styles.newRecordBadge}>
                    <Text style={styles.newRecordText}>🏆 New High Score!</Text>
                  </View>
                )}
                <StarRating count={stars} />
                <Pressable
                  onPress={() => selectGame(selectedGame)}
                  style={({ pressed }) => [styles.playAgainButton, pressed && styles.pressedButton]}
                  accessibilityRole="button"
                >
                  <LinearGradient colors={gameTheme.gradient} style={styles.playAgainGradient}>
                    <Text style={styles.playIcon}>▶</Text>
                    <Text style={styles.playAgainText}>Play Again!</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <View style={styles.choices}>
                {roundData.choices.map((choice) => {
                  const isCorrectChoice = selected !== null && choice === roundData.target;
                  const isWrongChoice = selected === choice && choice !== roundData.target;

                  return (
                    <ChoiceButton
                      key={choice}
                      choice={choice}
                      disabled={selected !== null}
                      isCorrect={isCorrectChoice}
                      isWrong={isWrongChoice}
                      onPress={() => chooseNumber(choice)}
                    />
                  );
                })}
              </View>
            )}

            <Animated.View
              style={[
                styles.messageBox,
                finished && styles.successMessage,
                { transform: [{ scale: messageAnim }] }
              ]}
            >
              <Text style={[styles.messageIcon, finished && styles.successIcon]}>
                {finished ? "🎊" : selected === null ? "💡" : message.includes("Awesome") ? "🎉" : "💪"}
              </Text>
              <Text style={styles.messageText}>{message}</Text>
            </Animated.View>
          </LinearGradient>
        </ScrollView>
      </ScreenShell>
    );
  }

  function renderDashboard() {
    const { records, totalPlays, totalBest, perfectGames, topRecord } = getDashboardStats(highScores);
    const sortedRecords = [...records].sort((a, b) => b.record.best - a.record.best);

    return (
      <ScreenShell>
        <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
          <View style={styles.gameHeader}>
            <Pressable
              onPress={backToMenu}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressedButton]}
            >
              <Text style={styles.backButtonText}>← Home</Text>
            </Pressable>
            <View style={styles.gameTitleBlock}>
              <Text style={styles.gameEmoji}>🏆</Text>
              <Animated.Text style={[styles.gameTitle, titleStyle]}>High Scores</Animated.Text>
            </View>
          </View>

          <LinearGradient colors={["#FFFFFF", "#FFFBEB"]} style={styles.dashboardHero}>
            <Text style={styles.dashboardHeroTitle}>Your Math Journey</Text>
            <Text style={styles.dashboardHeroSubtitle}>
              {totalPlays === 0
                ? "Play a game to start earning high scores!"
                : `You've played ${totalPlays} time${totalPlays === 1 ? "" : "s"} — keep going!`}
            </Text>
            <View style={styles.dashboardStatsRow}>
              <DashboardStatPill emoji="🎮" label="Total Plays" value={totalPlays} />
              <DashboardStatPill emoji="⭐" label="Best Points" value={totalBest} />
              <DashboardStatPill emoji="💯" label="Perfect" value={perfectGames} />
            </View>
            {topRecord?.record.best > 0 && (
              <View style={styles.dashboardChampion}>
                <Text style={styles.dashboardChampionLabel}>Top game</Text>
                <Text style={styles.dashboardChampionText}>
                  {topRecord.game.emoji} {topRecord.game.title} — {topRecord.record.best}/{MAX_ROUNDS}
                </Text>
              </View>
            )}
          </LinearGradient>

          <Text style={styles.dashboardSectionTitle}>All Games</Text>
          <View style={styles.dashboardList}>
            {sortedRecords.map(({ game, record }, index) => (
              <DashboardScoreRow key={game.id} game={game} record={record} index={index} />
            ))}
          </View>
        </ScrollView>
      </ScreenShell>
    );
  }

  if (screen === "dashboard") {
    return renderDashboard();
  }
  if (screen === "game") {
    return renderGame();
  }
  return renderMenu();
}

const styles = StyleSheet.create({
  gradientRoot: {
    flex: 1
  },
  safeArea: {
    flex: 1,
    paddingTop: 8
  },
  backgroundExtras: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: "hidden"
  },
  bubbleOne: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(251, 191, 36, 0.3)",
    top: -60,
    left: -50
  },
  bubbleTwo: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(74, 222, 128, 0.25)",
    top: 140,
    right: -60
  },
  bubbleThree: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(96, 165, 250, 0.2)",
    bottom: -100,
    left: 20
  },
  decorStarOne: {
    position: "absolute",
    top: 90,
    right: 30,
    fontSize: 28,
    opacity: 0.7
  },
  decorStarTwo: {
    position: "absolute",
    bottom: 180,
    right: 50,
    fontSize: 22,
    opacity: 0.6
  },
  decorCloud: {
    position: "absolute",
    top: 50,
    left: 40,
    fontSize: 36,
    opacity: 0.5
  },
  screen: {
    flexGrow: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 36,
    zIndex: 1
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    padding: 18,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#60A5FA",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F59E0B",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5
  },
  logoBadgeText: {
    fontSize: 32
  },
  heroCopy: {
    flex: 1
  },
  logoTitle: {
    color: THEME.text,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5
  },
  logoSubtitle: {
    marginTop: 4,
    color: THEME.textSoft,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600"
  },
  sectionHeader: {
    marginBottom: 8
  },
  eyebrow: {
    color: THEME.purple,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  title: {
    marginTop: 8,
    color: THEME.text,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38
  },
  subtitle: {
    marginTop: 10,
    color: THEME.textSoft,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500"
  },
  gameList: {
    marginTop: 20,
    gap: 16
  },
  gameCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 24,
    gap: 16,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  gameCardScoreBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)"
  },
  gameCardScoreLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  gameCardScoreValue: {
    marginTop: 2,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900"
  },
  gameCardEmojiWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center"
  },
  gameCardEmoji: {
    fontSize: 36
  },
  gameCardContent: {
    flex: 1,
    paddingRight: 52
  },
  gameCardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  gameCardDescription: {
    marginTop: 6,
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600"
  },
  playChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.3)"
  },
  gameCardFooter: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  menuScoreSummary: {
    marginTop: 16,
    marginBottom: 4,
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#F59E0B",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  menuScoreSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
  menuScoreSummaryTitle: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: "900"
  },
  menuScoreSummaryLink: {
    paddingVertical: 4,
    paddingHorizontal: 8
  },
  menuScoreSummaryLinkText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "800"
  },
  menuScoreSummaryText: {
    color: THEME.textSoft,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600"
  },
  playChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800"
  },
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16
  },
  gameTitleBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  gameEmoji: {
    fontSize: 32
  },
  gameTitle: {
    flex: 1,
    color: THEME.text,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#BFDBFE",
    shadowColor: "#93C5FD",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  backButtonText: {
    color: "#2563EB",
    fontWeight: "900",
    fontSize: 14
  },
  progressSection: {
    marginBottom: 16
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  progressLabel: {
    color: THEME.textSoft,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  loadingBarContainer: {
    height: 14,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  loadingBarFill: {
    height: "100%",
    borderRadius: 999,
    overflow: "hidden"
  },
  loadingBarGradient: {
    flex: 1,
    borderRadius: 999
  },
  panel: {
    padding: 20,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#FBBF24",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10
  },
  statusBar: {
    flexDirection: "row",
    gap: 8
  },
  statBox: {
    flex: 1,
    minHeight: 82,
    padding: 10,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)"
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 2
  },
  label: {
    color: THEME.textSoft,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  statValue: {
    marginTop: 4,
    color: THEME.text,
    fontSize: 24,
    fontWeight: "900"
  },
  targetCard: {
    minHeight: 220,
    marginTop: 16,
    padding: 20,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)"
  },
  targetLabel: {
    color: THEME.text,
    fontSize: 15,
    fontWeight: "900"
  },
  dotsGrid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 140
  },
  dot: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden"
  },
  dotShine: {
    position: "absolute",
    top: 8,
    left: 10,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.55)"
  },
  questionCard: {
    marginTop: 16,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  questionGradient: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  questionText: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  compareQuestionText: {
    fontSize: 48,
    letterSpacing: 4
  },
  sequenceQuestionText: {
    fontSize: 34,
    letterSpacing: 1
  },
  questionHint: {
    marginTop: 4,
    color: "rgba(255,255,255,0.85)",
    fontSize: 24,
    fontWeight: "800"
  },
  prompt: {
    marginTop: 20,
    textAlign: "center",
    color: THEME.text,
    fontSize: 17,
    fontWeight: "800"
  },
  choices: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between"
  },
  choiceWrapper: {
    width: "47%",
    shadowColor: "#60A5FA",
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  choiceButton: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderRadius: 24,
    backgroundColor: "#E0F2FE",
    shadowColor: "#38BDF8",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  choiceText: {
    color: THEME.text,
    fontSize: 46,
    fontWeight: "900"
  },
  correctChoice: {
    borderColor: "#4ADE80",
    backgroundColor: "#DCFCE7"
  },
  wrongChoice: {
    borderColor: "#FF6B9D",
    backgroundColor: "#FFE4E6"
  },
  finishBlock: {
    marginTop: 12,
    alignItems: "center",
    gap: 16
  },
  starRow: {
    flexDirection: "row",
    gap: 8
  },
  starIcon: {
    fontSize: 44
  },
  starIconSmall: {
    fontSize: 16
  },
  starFilled: {
    color: "#FBBF24"
  },
  starEmpty: {
    color: "#E5E7EB"
  },
  playAgainButton: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  playAgainGradient: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  playAgainText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  playIcon: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900"
  },
  messageBox: {
    minHeight: 64,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "#FDE68A",
    borderRadius: 22,
    backgroundColor: "#FFFBEB"
  },
  successMessage: {
    borderColor: "#86EFAC",
    backgroundColor: "#DCFCE7"
  },
  messageText: {
    flex: 1,
    color: THEME.text,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22
  },
  messageIcon: {
    fontSize: 28
  },
  successIcon: {
    fontSize: 30
  },
  pressedButton: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }]
  },
  dashboardFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FDE68A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F59E0B",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  dashboardFabEmoji: {
    fontSize: 26
  },
  dashboardHero: {
    padding: 22,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    marginBottom: 20,
    shadowColor: "#FBBF24",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  dashboardHeroTitle: {
    color: THEME.text,
    fontSize: 24,
    fontWeight: "900"
  },
  dashboardHeroSubtitle: {
    marginTop: 8,
    color: THEME.textSoft,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600"
  },
  dashboardStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18
  },
  dashboardStatPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  dashboardStatEmoji: {
    fontSize: 22
  },
  dashboardStatValue: {
    marginTop: 6,
    color: THEME.text,
    fontSize: 22,
    fontWeight: "900"
  },
  dashboardStatLabel: {
    marginTop: 4,
    color: THEME.textSoft,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    textAlign: "center"
  },
  dashboardChampion: {
    marginTop: 16,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FEF3C7",
    borderWidth: 2,
    borderColor: "#FDE68A"
  },
  dashboardChampionLabel: {
    color: "#92400E",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  dashboardChampionText: {
    marginTop: 4,
    color: THEME.text,
    fontSize: 15,
    fontWeight: "800"
  },
  dashboardSectionTitle: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12
  },
  dashboardList: {
    gap: 12
  },
  dashboardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  dashboardRowEmojiWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  dashboardRowEmoji: {
    fontSize: 26
  },
  dashboardRowContent: {
    flex: 1
  },
  dashboardRowTitle: {
    color: THEME.text,
    fontSize: 14,
    fontWeight: "900"
  },
  dashboardRowMeta: {
    marginTop: 3,
    color: THEME.textSoft,
    fontSize: 12,
    fontWeight: "600"
  },
  dashboardRowScoreBlock: {
    alignItems: "flex-end",
    minWidth: 58
  },
  dashboardRowScore: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: "900"
  },
  newRecordBadge: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
    borderWidth: 2,
    borderColor: "#FBBF24"
  },
  newRecordText: {
    color: "#92400E",
    fontSize: 16,
    fontWeight: "900"
  }
});
