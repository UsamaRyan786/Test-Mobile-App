import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  Platform,
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
import {
  buildBadges,
  evaluateBadges,
  getBadgesByCategory,
  updateRewardStats
} from "./badges";
import {
  GAMES,
  createRound,
  getGameMeta,
  isDotsGame,
  isShapeCountGame,
  isShapeDisplayGame,
  formatChoiceLabel,
  showEqualsHint,
  usesWideQuestionText,
  usesSequenceQuestionText,
  getInstruction,
  getTargetLabel,
  getPrompt
} from "./games";
import { getShapeName } from "./shapes";
import {
  PROGRESS_KEY,
  LEVELS_PER_TIER,
  PASS_SCORE,
  MIN_LEVEL_FOR_NEXT_CATEGORY,
  LEARNING_PATH,
  createDefaultProgress,
  getGameProgress,
  getLevelRecord,
  isLevelUnlocked,
  isTierUnlocked,
  isGameUnlocked,
  getPathStepStatus,
  getScaledConfig,
  recordLevelResult,
  didPassLevel,
  getPlayableCategoryLabels,
  getTierLabel
} from "./progression";
import LessonClassroom, { stopClassroomSpeech } from "./LessonClassroom";
import { buildLessonOutro, speakLesson, stopLessonSpeech } from "./lessonSpeech";
import VoiceAnswerPanel, { stopGameVoiceInput } from "./VoiceAnswerPanel";
import {
  LESSONS,
  isLessonComplete,
  isLessonUnlocked,
  getLessonUnlockHint,
  getLessonProgress,
  getResumeSlideIndex,
  saveLessonCheckpoint,
  markLessonStepComplete,
  completeLesson,
  getCompletedLessonCount
} from "./lessons";
import { getGameUnlockHint, getLessonGameSections } from "./lessonMap";
import { TEACHER_LABEL } from "./teacherConfig";

const MAX_ROUNDS = 12;
const MAX_SCORE = 5000;
const APP_TOP_INSET =
  Platform.OS === "android" ? (StatusBar.currentHeight ?? 28) + 8 : 10;
const HIGH_SCORES_KEY = "@mathGarden/highScores";
const REWARDS_KEY = "@mathGarden/rewards";

function toDisplayScore(correctCount) {
  const value = Number(correctCount) || 0;
  return Math.round((value / MAX_ROUNDS) * MAX_SCORE);
}

function formatScoreLabel(correctCount) {
  return `${toDisplayScore(correctCount)}/${MAX_SCORE}`;
}

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


const BADGES = buildBadges(GAMES, MAX_ROUNDS);

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

async function loadRewards() {
  try {
    const raw = await AsyncStorage.getItem(REWARDS_KEY);
    return raw ? JSON.parse(raw) : { coins: 0, badges: {}, stats: { recordBreaks: 0, totalCorrect: 0 } };
  } catch {
    return { coins: 0, badges: {}, stats: { recordBreaks: 0, totalCorrect: 0 } };
  }
}

async function saveRewards(rewards) {
  await AsyncStorage.setItem(REWARDS_KEY, JSON.stringify(rewards));
}

async function loadProgress() {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : createDefaultProgress();
  } catch {
    return createDefaultProgress();
  }
}

async function saveProgressData(progress) {
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

const DEFAULT_REWARDS = { coins: 0, badges: {}, stats: { recordBreaks: 0, totalCorrect: 0 } };

async function clearAllAppData() {
  await AsyncStorage.multiRemove([HIGH_SCORES_KEY, REWARDS_KEY, PROGRESS_KEY]);
}

async function applyRewards(gameId, score, beatRecord, highScores) {
  const rewards = await loadRewards();
  let coinsEarned = score * 2 + 10 + getStars(score) * 8;

  if (score === MAX_ROUNDS) {
    coinsEarned += 40;
  }
  if (beatRecord) {
    coinsEarned += 15;
  }

  rewards.coins += coinsEarned;
  updateRewardStats(rewards, score, beatRecord);

  const newBadges = [];
  let foundNewBadge = true;

  while (foundNewBadge) {
    foundNewBadge = false;
    const checks = evaluateBadges(BADGES, GAMES, MAX_ROUNDS, highScores, rewards, {
      beatRecord,
      gameId,
      score
    });

    for (const badge of BADGES) {
      if (rewards.badges[badge.id] || !checks[badge.id]) {
        continue;
      }

      rewards.badges[badge.id] = Date.now();
      rewards.coins += badge.reward;
      newBadges.push(badge);
      foundNewBadge = true;
    }
  }

  await saveRewards(rewards);
  return { rewards, coinsEarned, newBadges };
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
  if (score >= MAX_ROUNDS - 2) return 3;
  if (score >= Math.floor(MAX_ROUNDS * 0.67)) return 2;
  if (score >= Math.floor(MAX_ROUNDS * 0.42)) return 1;
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

function MenuGameCard({
  game,
  index,
  onPress,
  bestScore = 0,
  hasPlayed = false,
  locked = false,
  unlockHint = "",
  levelLabel = "Lv 1"
}) {
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

  const cardScale = Animated.multiply(
    slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.94, 1]
    }),
    scaleAnim
  );

  const entranceStyle = {
    opacity: slideAnim,
    transform: [{ scale: cardScale }]
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
    <Animated.View style={[entranceStyle, styles.menuGameCardWrap, locked && styles.gameCardLockedWrap]}>
      <Pressable
        onPress={locked ? undefined : onPress}
        onPressIn={locked ? undefined : handlePressIn}
        onPressOut={locked ? undefined : handlePressOut}
        accessibilityRole="button"
        accessibilityState={{ disabled: locked }}
      >
        <LinearGradient colors={game.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gameCard}>
          {locked ? (
            <View style={styles.gameCardLockOverlay}>
              <Text style={styles.gameCardLockEmoji}>🔒</Text>
              <Text style={styles.gameCardLockText}>{unlockHint}</Text>
            </View>
          ) : null}
          <View style={styles.gameCardScoreBadge}>
            <Text style={styles.gameCardScoreLabel}>Best</Text>
            <Text style={styles.gameCardScoreValue}>
              {hasPlayed ? formatScoreLabel(bestScore) : "—"}
            </Text>
          </View>
          <View style={styles.gameCardLevelBadge}>
            <Text style={styles.gameCardLevelText}>{levelLabel}</Text>
          </View>
          <View style={styles.gameCardEmojiWrap}>
            <Text style={styles.gameCardEmoji}>{game.emoji}</Text>
          </View>
          <View style={styles.gameCardContent}>
            <Text style={styles.gameCardTitle}>{game.title}</Text>
            <Text style={styles.gameCardDescription}>{game.description}</Text>
            <View style={styles.gameCardFooter}>
              <View style={styles.playChip}>
                <Text style={styles.playChipText}>{locked ? "Locked" : "Choose level →"}</Text>
              </View>
              {hasPlayed && !locked && <StarRating count={getStars(bestScore)} compact />}
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

function ChoiceButton({ choice, label, onPress, disabled, isCorrect, isWrong, compact }) {
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
        accessibilityLabel={`Choose ${label ?? choice}`}
      >
        <Text style={[styles.choiceText, compact && styles.choiceTextCompact]}>{label ?? choice}</Text>
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
            {hasPlayed ? formatScoreLabel(record.best) : "—"}
          </Text>
          {hasPlayed && <StarRating count={stars} compact />}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function BadgeCard({ badge, unlocked, index }) {
  const popAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    popAnim.setValue(0);
    Animated.spring(popAnim, {
      toValue: 1,
      delay: index * 50,
      friction: 7,
      tension: 60,
      useNativeDriver: true
    }).start();
  }, [index, popAnim]);

  const cardStyle = {
    opacity: popAnim,
    transform: [
      {
        scale: popAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1]
        })
      }
    ]
  };

  return (
    <Animated.View style={[styles.badgeCard, !unlocked && styles.badgeCardLocked, cardStyle]}>
      <Text style={[styles.badgeEmoji, !unlocked && styles.badgeEmojiLocked]}>{badge.emoji}</Text>
      <Text style={[styles.badgeTitle, !unlocked && styles.badgeTextLocked]}>{badge.title}</Text>
      <Text style={[styles.badgeDescription, !unlocked && styles.badgeTextLocked]} numberOfLines={2}>
        {badge.description}
      </Text>
      <Text style={[styles.badgeReward, !unlocked && styles.badgeTextLocked]}>
        {unlocked ? `+${badge.reward} 🪙 earned` : `Reward: ${badge.reward} 🪙`}
      </Text>
    </Animated.View>
  );
}

function LessonVisual({ visual }) {
  if (!visual) {
    return null;
  }

  if (visual.type === "dots") {
    return (
      <View style={styles.lessonVisualBox}>
        <View style={styles.lessonDotsRow}>
          {Array.from({ length: visual.count }, (_, index) => (
            <Text key={index} style={styles.lessonVisualItem}>
              {visual.item}
            </Text>
          ))}
        </View>
        <Text style={styles.lessonVisualCaption}>Count: {visual.count}</Text>
      </View>
    );
  }

  if (visual.type === "match") {
    return (
      <View style={styles.lessonVisualBox}>
        <View style={styles.lessonDotsRow}>
          {Array.from({ length: visual.count }, (_, index) => (
            <Text key={index} style={styles.lessonVisualItem}>
              {visual.item}
            </Text>
          ))}
        </View>
        <Text style={styles.lessonEquationText}>
          {visual.count} {visual.item} = {visual.count}
        </Text>
      </View>
    );
  }

  if (visual.type === "groups") {
    const total = visual.left + visual.right;
    return (
      <View style={styles.lessonVisualBox}>
        <View style={styles.lessonGroupsRow}>
          <View style={styles.lessonGroup}>
            {Array.from({ length: visual.left }, (_, index) => (
              <Text key={`l-${index}`} style={styles.lessonVisualItem}>
                {visual.item}
              </Text>
            ))}
          </View>
          <Text style={styles.lessonSymbol}>{visual.symbol}</Text>
          <View style={styles.lessonGroup}>
            {Array.from({ length: visual.right }, (_, index) => (
              <Text key={`r-${index}`} style={styles.lessonVisualItem}>
                {visual.item}
              </Text>
            ))}
          </View>
          <Text style={styles.lessonSymbol}>=</Text>
          <View style={styles.lessonGroup}>
            {Array.from({ length: total }, (_, index) => (
              <Text key={`t-${index}`} style={styles.lessonVisualItem}>
                {visual.item}
              </Text>
            ))}
          </View>
        </View>
        <Text style={styles.lessonEquationText}>
          {visual.left} {visual.symbol} {visual.right} = {total}
        </Text>
      </View>
    );
  }

  if (visual.type === "equation") {
    return (
      <View style={styles.lessonVisualBox}>
        <View style={styles.lessonEquationRow}>
          {visual.parts.map((part, index) => (
            <Text
              key={`${part}-${index}`}
              style={[
                styles.lessonEquationPart,
                part === visual.highlight && styles.lessonEquationHighlight
              ]}
            >
              {part}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  if (visual.type === "takeaway") {
    const left = visual.start - visual.remove;
    return (
      <View style={styles.lessonVisualBox}>
        <View style={styles.lessonGroupsRow}>
          <View style={styles.lessonGroup}>
            {Array.from({ length: visual.start }, (_, index) => (
              <Text
                key={`s-${index}`}
                style={[styles.lessonVisualItem, index >= left && styles.lessonVisualFade]}
              >
                {visual.item}
              </Text>
            ))}
          </View>
        </View>
        <Text style={styles.lessonEquationText}>
          {visual.start} − {visual.remove} = {left}
        </Text>
      </View>
    );
  }

  if (visual.type === "groupsRepeat") {
    const total = visual.groups * visual.perGroup;
    return (
      <View style={styles.lessonVisualBox}>
        <View style={styles.lessonRepeatGrid}>
          {Array.from({ length: visual.groups }, (_, groupIndex) => (
            <View key={groupIndex} style={styles.lessonRepeatGroup}>
              {Array.from({ length: visual.perGroup }, (_, itemIndex) => (
                <Text key={itemIndex} style={styles.lessonVisualItemSmall}>
                  {visual.item}
                </Text>
              ))}
            </View>
          ))}
        </View>
        <Text style={styles.lessonEquationText}>
          {visual.perGroup} × {visual.groups} = {total}
        </Text>
      </View>
    );
  }

  if (visual.type === "share") {
    const each = visual.total / visual.groups;
    return (
      <View style={styles.lessonVisualBox}>
        <View style={styles.lessonRepeatGrid}>
          {Array.from({ length: visual.groups }, (_, groupIndex) => (
            <View key={groupIndex} style={styles.lessonShareGroup}>
              <Text style={styles.lessonShareLabel}>Friend {groupIndex + 1}</Text>
              {Array.from({ length: each }, (_, itemIndex) => (
                <Text key={itemIndex} style={styles.lessonVisualItemSmall}>
                  {visual.item}
                </Text>
              ))}
            </View>
          ))}
        </View>
        <Text style={styles.lessonEquationText}>
          {visual.total} ÷ {visual.groups} = {each}
        </Text>
      </View>
    );
  }

  if (visual.type === "skip") {
    const values = Array.from({ length: visual.times }, (_, index) => (index + 1) * visual.step);
    return (
      <View style={styles.lessonVisualBox}>
        <View style={styles.lessonSkipRow}>
          {values.map((value) => (
            <View key={value} style={styles.lessonSkipBubble}>
              <Text style={styles.lessonSkipNumber}>{value}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.lessonEquationText}>
          Count by {visual.step}s: {values.join(", ")}
        </Text>
      </View>
    );
  }

  if (visual.type === "celebrate") {
    return (
      <View style={styles.lessonCelebrateBox}>
        <Text style={styles.lessonCelebrateEmoji}>{visual.emoji}</Text>
      </View>
    );
  }

  return null;
}

function ClassCard({ lesson, progress, index, onPress }) {
  const unlocked = isLessonUnlocked(progress, lesson.id);
  const completed = isLessonComplete(progress, lesson.id);
  const resumeSlide = getResumeSlideIndex(progress, lesson.id);
  const hint = getLessonUnlockHint(lesson.id);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.setValue(0);
    Animated.spring(slideAnim, {
      toValue: 1,
      delay: index * 100,
      friction: 7,
      tension: 50,
      useNativeDriver: true
    }).start();
  }, [index, slideAnim]);

  const entranceStyle = {
    opacity: slideAnim,
    transform: [
      {
        scale: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1]
        })
      }
    ]
  };

  return (
    <Animated.View style={entranceStyle}>
      <Pressable
        onPress={unlocked ? onPress : undefined}
        style={({ pressed }) => [pressed && unlocked && styles.pressedButton]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !unlocked }}
      >
        <LinearGradient
          colors={unlocked ? lesson.gradient : ["#475569", "#334155"]}
          style={[styles.classCard, !unlocked && styles.classCardLocked]}
        >
          {!unlocked ? (
            <View style={styles.classCardLock}>
              <Text style={styles.classCardLockEmoji}>🔒</Text>
              <Text style={styles.classCardLockText}>{hint}</Text>
            </View>
          ) : null}
          <Text style={styles.classCardEmoji}>{lesson.emoji}</Text>
          <View style={styles.classCardBody}>
            <Text style={styles.classCardTitle}>{lesson.title}</Text>
            <Text style={styles.classCardSubtitle}>{lesson.subtitle}</Text>
            <Text style={styles.classCardMeta}>
              🎧 {lesson.slides.length} steps ·{" "}
              {completed
                ? "✅ Tap to replay →"
                : unlocked
                  ? resumeSlide > 0
                    ? `Continue step ${resumeSlide + 1} →`
                    : "Tap to start →"
                  : "Locked"}
            </Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function LearningPathBar({ progress }) {
  return (
    <LinearGradient colors={["#ECFDF5", "#D1FAE5"]} style={styles.learningPathBar}>
      <Text style={styles.learningPathTitle}>🛤️ Your Learning Path</Text>
      <Text style={styles.learningPathSubtitle}>
        Listen to each class · Finish the class to unlock those games only
      </Text>
      <View style={styles.learningPathRow}>
        {LEARNING_PATH.map((step, index) => {
          const status = getPathStepStatus(progress, step.id, GAMES);
          return (
            <View key={step.id} style={styles.learningPathStepWrap}>
              <View
                style={[
                  styles.learningPathStep,
                  !status.unlocked && styles.learningPathStepLocked,
                  status.mastered && styles.learningPathStepMastered
                ]}
              >
                <Text style={styles.learningPathStepEmoji}>{status.unlocked ? step.emoji : "🔒"}</Text>
                <Text style={styles.learningPathStepLabel}>{step.label}</Text>
                {status.mastered ? <Text style={styles.learningPathStepBadge}>⭐</Text> : null}
              </View>
              {index < LEARNING_PATH.length - 1 ? (
                <Text style={styles.learningPathArrow}>→</Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </LinearGradient>
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
  const [rewards, setRewards] = useState({ coins: 0, badges: {} });
  const [sessionReward, setSessionReward] = useState(null);
  const [progress, setProgress] = useState(createDefaultProgress());
  const [selectedTier, setSelectedTier] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedLesson, setSelectedLesson] = useState(LESSONS[1]);
  const [lessonSlide, setLessonSlide] = useState(0);
  const [lessonSlideKey, setLessonSlideKey] = useState(0);
  const [lessonFinished, setLessonFinished] = useState(false);
  const [lessonReplay, setLessonReplay] = useState(false);
  const [slideSpeechComplete, setSlideSpeechComplete] = useState(false);
  const lessonSlideRef = useRef(lessonSlide);
  const slideSpeechCompleteRef = useRef(slideSpeechComplete);
  const progressRef = useRef(progress);

  useEffect(() => {
    lessonSlideRef.current = lessonSlide;
  }, [lessonSlide]);

  useEffect(() => {
    slideSpeechCompleteRef.current = slideSpeechComplete;
  }, [slideSpeechComplete]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (screen !== "lesson" || lessonFinished) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => subscription.remove();
  }, [screen, lessonFinished]);

  const unlockedBadgeCount = Object.keys(rewards.badges).length;

  const dots = useMemo(() => {
    if (isDotsGame(selectedGame.id) || isShapeCountGame(selectedGame.id)) {
      return Array.from({ length: roundData.target }, (_, index) => index);
    }
    return [];
  }, [roundData.target, selectedGame.id]);

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
    Promise.all([loadHighScores(), loadRewards(), loadProgress()]).then(
      ([scores, rewardData, progressData]) => {
        setHighScores(scores);
        setRewards(rewardData);
        setProgress(progressData);
      }
    );
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

  function clearGameSessionState() {
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
      feedbackTimer.current = null;
    }
    stopGameVoiceInput();
    setScore(0);
    setRound(1);
    setSelected(null);
    setFinished(false);
    setIsNewRecord(false);
    setSessionReward(null);
  }

  function startRound(gameId, tier = 1, level = 1) {
    clearGameSessionState();

    const game = getGameMeta(gameId);
    const config = getScaledConfig(game.config, game.roundType, tier, level);

    setSelectedTier(tier);
    setSelectedLevel(level);
    setRoundData(createRound(gameId, { config }));
    setRoundKey((k) => k + 1);
    setMessage(getInstruction(gameId));
  }

  function selectGame(game) {
    if (!isGameUnlocked(progress, game)) {
      return;
    }
    clearGameSessionState();
    setSelectedGame(game);
    setSelectedTier(1);
    setScreen("levels");
  }

  function startLevel(game, tier, level) {
    setSelectedGame(game);
    startRound(game.id, tier, level);
    setScreen("game");
  }

  function backToLevels() {
    clearGameSessionState();
    setScreen("levels");
  }

  function backToMenu() {
    persistLessonCheckpoint();
    stopClassroomSpeech();
    stopLessonSpeech();
    clearGameSessionState();
    setScreen("menu");
  }

  function persistLessonCheckpoint() {
    if (screen !== "lesson" || lessonReplay || lessonFinished || !selectedLesson) {
      return;
    }

    const currentProgress = progressRef.current;
    if (isLessonComplete(currentProgress, selectedLesson.id)) {
      return;
    }

    const lesson = selectedLesson;
    const savedSlide = getLessonProgress(currentProgress, selectedLesson.id).slide ?? 0;
    const activeSlide = lessonSlideRef.current;
    const speechDone = slideSpeechCompleteRef.current;
    let resumeSlide = Math.max(savedSlide, activeSlide);

    if (speechDone) {
      resumeSlide = Math.max(resumeSlide, Math.min(activeSlide + 1, lesson.slides.length - 1));
    }

    resumeSlide = Math.min(resumeSlide, lesson.slides.length - 1);

    if (savedSlide === resumeSlide) {
      return;
    }

    const updated = saveLessonCheckpoint(currentProgress, selectedLesson.id, resumeSlide);
    setProgress(updated);
    progressRef.current = updated;
    saveProgressData(updated);
  }

  const onSlideSpeechProgress = useCallback((complete) => {
    setSlideSpeechComplete(complete);
    slideSpeechCompleteRef.current = complete;

    if (!complete || lessonReplay || lessonFinished || !selectedLesson) {
      return;
    }

    const currentProgress = progressRef.current;
    if (isLessonComplete(currentProgress, selectedLesson.id)) {
      return;
    }

    const activeSlide = lessonSlideRef.current;
    const resumeAt = Math.min(activeSlide + 1, selectedLesson.slides.length - 1);
    const savedSlide = getLessonProgress(currentProgress, selectedLesson.id).slide ?? 0;

    if (resumeAt <= savedSlide) {
      return;
    }

    const updated = saveLessonCheckpoint(currentProgress, selectedLesson.id, resumeAt);
    setProgress(updated);
    progressRef.current = updated;
    saveProgressData(updated);
  }, [lessonReplay, lessonFinished, selectedLesson]);

  function leaveLessonForClasses() {
    persistLessonCheckpoint();
    stopClassroomSpeech();
    setScreen("classes");
  }

  function openDashboard() {
    setScreen("dashboard");
  }

  function confirmResetProgress() {
    Alert.alert(
      "Reset all progress?",
      "This clears classes, game levels, high scores, coins, and badges on this device. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Reset", style: "destructive", onPress: resetAppProgress }
      ]
    );
  }

  async function resetAppProgress() {
    stopClassroomSpeech();
    stopLessonSpeech();
    stopGameVoiceInput();
    await clearAllAppData();
    setHighScores({});
    setRewards(DEFAULT_REWARDS);
    setProgress(createDefaultProgress());
    setSelectedGame(GAMES[0]);
    setSelectedTier(1);
    setSelectedLevel(1);
    setScore(0);
    setSessionReward(null);
    setSelectedLesson(LESSONS[0]);
    setLessonSlide(0);
    setLessonSlideKey((key) => key + 1);
    setLessonFinished(false);
    setLessonReplay(false);
    setScreen("menu");
  }

  function openClasses() {
    setScreen("classes");
  }

  function openLesson(lesson) {
    if (!isLessonUnlocked(progress, lesson.id)) {
      return;
    }
    stopClassroomSpeech();
    setSelectedLesson(lesson);
    const completed = isLessonComplete(progress, lesson.id);
    setLessonReplay(completed);
    setLessonSlide(completed ? 0 : getResumeSlideIndex(progress, lesson.id));
    setLessonSlideKey((key) => key + 1);
    setLessonFinished(false);
    setSlideSpeechComplete(false);
    setScreen("lesson");
  }

  function nextLessonSlide() {
    if (!slideSpeechComplete) {
      return;
    }
    stopClassroomSpeech();
    const lesson = selectedLesson;
    const isLast = lessonSlide >= lesson.slides.length - 1;
    const replaying = lessonReplay || isLessonComplete(progress, lesson.id);

    if (isLast) {
      if (!replaying) {
        const updated = completeLesson(progress, lesson.id);
        setProgress(updated);
        saveProgressData(updated);
      }
      setLessonFinished(true);
      speakLesson(buildLessonOutro(lesson));
      return;
    }

    const nextSlide = lessonSlide + 1;
    if (!replaying) {
      const updated = markLessonStepComplete(progressRef.current, lesson.id, lessonSlide);
      setProgress(updated);
      progressRef.current = updated;
      saveProgressData(updated);
    }
    setLessonSlide(nextSlide);
    setLessonSlideKey((key) => key + 1);
    setSlideSpeechComplete(false);
  }

  function replayLesson() {
    stopClassroomSpeech();
    setLessonReplay(true);
    setSlideSpeechComplete(false);
    setLessonSlide(0);
    setLessonSlideKey((key) => key + 1);
    setLessonFinished(false);
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

      recordGameScore(selectedGame.id, nextScore).then(async (record) => {
        const updatedScores = { ...highScores, [selectedGame.id]: record };
        setHighScores(updatedScores);

        const updatedProgress = recordLevelResult(
          progress,
          selectedGame.id,
          selectedTier,
          selectedLevel,
          nextScore,
          MAX_ROUNDS
        );
        setProgress(updatedProgress);
        await saveProgressData(updatedProgress);

        const result = await applyRewards(selectedGame.id, nextScore, beatRecord, updatedScores);
        setRewards(result.rewards);
        setSessionReward({
          coinsEarned: result.coinsEarned,
          newBadges: result.newBadges,
          totalCoins: result.rewards.coins
        });
      });

      setIsNewRecord(beatRecord);

      const stars = getStars(nextScore);
      const starMsg =
        stars === 3
          ? "Amazing! You're a math superstar!"
          : stars === 2
            ? "Great job! Keep practicing!"
            : "Nice try! Play again to improve!";
      const recordMsg = beatRecord ? " 🏆 New high score!" : "";
      const passMsg = didPassLevel(nextScore)
        ? ` Level ${selectedLevel} passed!${
            selectedLevel < LEVELS_PER_TIER
              ? ` Level ${selectedLevel + 1} unlocked!`
              : selectedTier === 1
                ? " Advanced mode unlocked!"
                : ""
          }`
        : ` Score ${PASS_SCORE}+ needed to pass Level ${selectedLevel}.`;
      setMessage(`${starMsg}${recordMsg}${passMsg} Score: ${formatScoreLabel(nextScore)}`);
      pulseMessage();
      return;
    }

    setRound((currentRound) => currentRound + 1);
    const game = getGameMeta(selectedGame.id);
    const config = getScaledConfig(game.config, game.roundType, selectedTier, selectedLevel);
    setRoundData(createRound(selectedGame.id, { config }));
    setRoundKey((k) => k + 1);
    setSelected(null);
    setMessage(getInstruction(selectedGame.id));
  }

  function chooseNumber(number) {
    if (selected !== null || finished) {
      return;
    }

    stopGameVoiceInput();

    const isCorrect = number === roundData.target;
    const nextScore = isCorrect ? score + 1 : score;

    setSelected(number);
    setScore(nextScore);
    const answerLabel =
      roundData.choiceType === "shapeName" ? getShapeName(roundData.target) : String(roundData.target);
    setMessage(isCorrect ? "🎉 Awesome! You got it!" : `💪 Almost! The answer is ${answerLabel}.`);
    pulseMessage();

    feedbackTimer.current = setTimeout(() => goToNextRound(nextScore), 1200);
  }

  function renderMenu() {
    const { totalPlays, topRecord, perfectGames } = getDashboardStats(highScores);

    return (
      <ScreenShell>
        <ScrollView contentContainerStyle={[styles.screen, styles.menuScreen]} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.menuHeader, logoStyle]}>
            <LinearGradient colors={["#FDE68A", "#FBBF24"]} style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>🌈</Text>
            </LinearGradient>
            <View style={styles.heroCopy}>
              <Text style={styles.logoTitle}>Math Talk</Text>
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

          <LinearGradient colors={["#FFF7ED", "#FFEDD5"]} style={styles.menuRewardsBar}>
            <View style={styles.menuRewardItem}>
              <Text style={styles.menuRewardEmoji}>🪙</Text>
              <Text style={styles.menuRewardValue}>{rewards.coins}</Text>
              <Text style={styles.menuRewardLabel}>Garden Coins</Text>
            </View>
            <View style={styles.menuRewardDivider} />
            <View style={styles.menuRewardItem}>
              <Text style={styles.menuRewardEmoji}>🎖️</Text>
              <Text style={styles.menuRewardValue}>
                {unlockedBadgeCount}/{BADGES.length}
              </Text>
              <Text style={styles.menuRewardLabel}>Badges</Text>
            </View>
          </LinearGradient>

          <LinearGradient colors={["#EEF2FF", "#E0E7FF"]} style={styles.classesPromo}>
            <View style={styles.classesPromoCopy}>
              <Text style={styles.classesPromoTitle}>📚 Math Classes</Text>
              <Text style={styles.classesPromoText}>
                {TEACHER_LABEL} speaks and draws on the whiteboard! {getCompletedLessonCount(progress)}/
                {LESSONS.length} classes done.
              </Text>
            </View>
            <Pressable
              onPress={openClasses}
              style={({ pressed }) => [styles.classesPromoButton, pressed && styles.pressedButton]}
            >
              <Text style={styles.classesPromoButtonText}>Start Class →</Text>
            </Pressable>
          </LinearGradient>

          <View style={styles.sectionHeader}>
            <Text style={styles.eyebrow}>✦ Pick Your Adventure ✦</Text>
            <Animated.Text style={[styles.title, titleStyle]}>Which game shall we play?</Animated.Text>
            <Text style={styles.subtitle}>
              Listen in class first — then play only the games you have learned!
            </Text>
          </View>

          {getPlayableCategoryLabels(progress, GAMES).length > 0 ? (
            <View style={styles.playableHint}>
              <Text style={styles.playableHintText}>
                🎮 Unlocked games: {getPlayableCategoryLabels(progress, GAMES).join(" · ")}
              </Text>
            </View>
          ) : (
            <View style={styles.playableHint}>
              <Text style={styles.playableHintText}>
                🎧 Start with Counting Class to unlock your first games!
              </Text>
            </View>
          )}

          <LearningPathBar progress={progress} />

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
                Top score: {topRecord.game.emoji} {topRecord.game.title} ({formatScoreLabel(topRecord.record.best)})
                {" · "}
                {totalPlays} play{totalPlays === 1 ? "" : "s"}
                {perfectGames > 0 ? ` · ${perfectGames} perfect` : ""}
              </Text>
            )}
          </LinearGradient>

          <View style={styles.menuGamesBlock}>
          {getLessonGameSections(GAMES).map((section) => {
            const sectionLabel = `${section.emoji} ${section.menuLabel || section.title.replace(" Class", "")}`;
            const lessonComplete = isLessonComplete(progress, section.id);
            const lessonAccessible = isLessonUnlocked(progress, section.id);
            const sectionHint = !lessonAccessible
              ? getLessonUnlockHint(section.id)
              : !lessonComplete
                ? `Finish ${section.title} to play these games! 🎧`
                : null;

            if (!lessonAccessible && sectionHint) {
              return (
                <View key={section.id} style={styles.gameCategorySection}>
                  <View style={styles.gameCategoryHeader}>
                    <Text style={styles.gameCategoryTitle}>{sectionLabel}</Text>
                    <Text style={styles.gameCategoryLockHint}>🔒 {sectionHint}</Text>
                  </View>
                </View>
              );
            }
            if (!lessonAccessible) {
              return null;
            }

            return (
              <View key={section.id} style={styles.gameCategorySection}>
                <View style={styles.gameCategoryHeader}>
                  <Text style={styles.gameCategoryTitle}>{sectionLabel}</Text>
                  {!lessonComplete && sectionHint ? (
                    <Text style={styles.gameCategoryLockHint}>🔒 {sectionHint}</Text>
                  ) : null}
                </View>
                <View style={styles.gameCategoryList}>
                  {section.games.map((game, gameIndex) => {
                    const record = highScores[game.id] || { best: 0, plays: 0 };
                    const index = gameIndex;
                    const gameProgress = getGameProgress(progress, game.id);
                    const locked = !isGameUnlocked(progress, game);
                    const gameHint = locked ? getGameUnlockHint(progress, game) : null;
                    const levelLabel = isTierUnlocked(progress, game.id, 2)
                      ? `Lv ${gameProgress.maxLevel}/10 · ★ Advanced`
                      : `Lv ${gameProgress.maxLevel}/${LEVELS_PER_TIER}`;

                    return (
                      <MenuGameCard
                        key={game.id}
                        game={game}
                        index={index}
                        bestScore={record.best}
                        hasPlayed={record.plays > 0}
                        locked={locked}
                        unlockHint={gameHint || sectionHint || "Complete the class first!"}
                        levelLabel={levelLabel}
                        onPress={() => selectGame(game)}
                      />
                    );
                  })}
                </View>
              </View>
            );
          })}
          </View>

          <View style={styles.menuFooter}>
            <Pressable
              onPress={confirmResetProgress}
              style={({ pressed }) => [styles.menuResetButton, pressed && styles.pressedButton]}
              accessibilityRole="button"
              accessibilityLabel="Reset all progress"
            >
              <Text style={styles.menuResetButtonText}>↺ Reset all progress</Text>
              <Text style={styles.menuResetButtonHint}>
                Clears classes, coins, badges, scores, and locks games again
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenShell>
    );
  }

  function renderLevelSelect() {
    const tier2Open = isTierUnlocked(progress, selectedGame.id);
    const levels = Array.from({ length: LEVELS_PER_TIER }, (_, index) => index + 1);

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
              <Text style={styles.gameEmoji}>{selectedGame.emoji}</Text>
              <Animated.Text style={[styles.gameTitle, titleStyle]}>{selectedGame.title}</Animated.Text>
            </View>
          </View>

          <LinearGradient colors={["#FFFFFF", "#FFFBEB"]} style={styles.levelSelectPanel}>
            <Text style={styles.levelSelectTitle}>Pick a Level</Text>
            <Text style={styles.levelSelectSubtitle}>
              Score {formatScoreLabel(PASS_SCORE)} or more to pass · Each level gets a little harder
            </Text>

            <View style={styles.tierToggleRow}>
              <Pressable
                onPress={() => setSelectedTier(1)}
                style={({ pressed }) => [
                  styles.tierToggleButton,
                  selectedTier === 1 && styles.tierToggleButtonActive,
                  pressed && styles.pressedButton
                ]}
              >
                <Text
                  style={[
                    styles.tierToggleText,
                    selectedTier === 1 && styles.tierToggleTextActive
                  ]}
                >
                  🌱 Starter
                </Text>
              </Pressable>
              <Pressable
                onPress={() => tier2Open && setSelectedTier(2)}
                style={({ pressed }) => [
                  styles.tierToggleButton,
                  selectedTier === 2 && styles.tierToggleButtonActive,
                  !tier2Open && styles.tierToggleButtonDisabled,
                  pressed && tier2Open && styles.pressedButton
                ]}
              >
                <Text
                  style={[
                    styles.tierToggleText,
                    selectedTier === 2 && styles.tierToggleTextActive,
                    !tier2Open && styles.tierToggleTextDisabled
                  ]}
                >
                  {tier2Open ? "🔥 Advanced" : "🔒 Advanced"}
                </Text>
              </Pressable>
            </View>

            {!tier2Open ? (
              <Text style={styles.tierHint}>Pass all 10 Starter levels to unlock Advanced mode!</Text>
            ) : null}

            <View style={styles.levelGrid}>
              {levels.map((level) => {
                const unlocked = isLevelUnlocked(progress, selectedGame.id, selectedTier, level);
                const record = getLevelRecord(progress, selectedGame.id, selectedTier, level);

                return (
                  <Pressable
                    key={`${selectedTier}-${level}`}
                    disabled={!unlocked}
                    onPress={() => startLevel(selectedGame, selectedTier, level)}
                    style={({ pressed }) => [
                      styles.levelButton,
                      !unlocked && styles.levelButtonLocked,
                      record?.passed && styles.levelButtonPassed,
                      pressed && unlocked && styles.pressedButton
                    ]}
                  >
                    <Text style={[styles.levelButtonNumber, !unlocked && styles.levelButtonTextLocked]}>
                      {level}
                    </Text>
                    {record?.passed ? <Text style={styles.levelButtonCheck}>✓</Text> : null}
                    {record?.best ? (
                      <Text style={styles.levelButtonScore}>{formatScoreLabel(record.best)}</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </LinearGradient>
        </ScrollView>
      </ScreenShell>
    );
  }

  function renderGame() {
    const stars = getStars(score);
    const gameHighScore = highScores[selectedGame.id];
    const sessionScoreLabel = formatScoreLabel(score);
    const bestScoreLabel =
      (gameHighScore?.plays ?? 0) > 0
        ? formatScoreLabel(gameHighScore.best ?? 0)
        : `0/${MAX_SCORE}`;

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
              <View style={styles.gameTitleCopy}>
                <Animated.Text style={[styles.gameTitle, titleStyle]}>{selectedGame.title}</Animated.Text>
                <Text style={styles.gameLevelBand}>
                  {getTierLabel(selectedTier)} · Level {selectedLevel}/{LEVELS_PER_TIER}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressLabel}>
                Round {Math.min(round, MAX_ROUNDS)}/{MAX_ROUNDS} · Need {PASS_SCORE}+ to pass
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
                <Text style={styles.statValue}>{sessionScoreLabel}</Text>
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
                <Text style={styles.statValue}>{bestScoreLabel}</Text>
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
              ) : isShapeCountGame(selectedGame.id) ? (
                <View
                  style={styles.shapeCountGrid}
                  accessibilityLabel={`${roundData.target} shapes to count`}
                >
                  {dots.map((dot) => (
                    <Text key={`${roundKey}-${dot}`} style={styles.shapeCountEmoji}>
                      {roundData.shapeEmoji}
                    </Text>
                  ))}
                </View>
              ) : isShapeDisplayGame(selectedGame.id) ? (
                <View style={styles.shapeDisplayCard} accessibilityLabel="Shape to identify">
                  <Text style={styles.shapeDisplayEmoji}>{roundData.shapeEmoji}</Text>
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
                {didPassLevel(score) ? (
                  <Text style={styles.levelPassBanner}>✅ Level {selectedLevel} passed!</Text>
                ) : (
                  <Text style={styles.levelFailBanner}>
                    Score {formatScoreLabel(PASS_SCORE)}+ needed to pass Level {selectedLevel}
                  </Text>
                )}
                {sessionReward && (
                  <LinearGradient colors={["#FEF3C7", "#FDE68A"]} style={styles.sessionRewardBox}>
                    <Text style={styles.sessionRewardTitle}>🎁 Rewards Earned!</Text>
                    <Text style={styles.sessionRewardCoins}>
                      +{sessionReward.coinsEarned} Garden Coins 🪙
                    </Text>
                    <Text style={styles.sessionRewardTotal}>
                      Total coins: {sessionReward.totalCoins}
                    </Text>
                    {sessionReward.newBadges.slice(0, 3).map((badge) => (
                      <View key={badge.id} style={styles.newBadgeUnlock}>
                        <Text style={styles.newBadgeUnlockTitle}>
                          {badge.emoji} New Badge: {badge.title}
                        </Text>
                        <Text style={styles.newBadgeUnlockDesc}>{badge.description}</Text>
                        {badge.reward > 0 && (
                          <Text style={styles.newBadgeUnlockBonus}>Bonus +{badge.reward} 🪙</Text>
                        )}
                      </View>
                    ))}
                    {sessionReward.newBadges.length > 3 && (
                      <Text style={styles.newBadgeMore}>
                        +{sessionReward.newBadges.length - 3} more badge
                        {sessionReward.newBadges.length - 3 === 1 ? "" : "s"} unlocked!
                      </Text>
                    )}
                  </LinearGradient>
                )}
                <StarRating count={stars} />
                <Pressable
                  onPress={() => startLevel(selectedGame, selectedTier, selectedLevel)}
                  style={({ pressed }) => [styles.playAgainButton, pressed && styles.pressedButton]}
                  accessibilityRole="button"
                >
                  <LinearGradient colors={gameTheme.gradient} style={styles.playAgainGradient}>
                    <Text style={styles.playIcon}>▶</Text>
                    <Text style={styles.playAgainText}>Play Again!</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable
                  onPress={backToLevels}
                  style={({ pressed }) => [styles.levelsLinkButton, pressed && styles.pressedButton]}
                >
                  <Text style={styles.levelsLinkText}>← Choose another level</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <VoiceAnswerPanel
                  choices={roundData.choices}
                  choiceType={roundData.choiceType || "number"}
                  disabled={selected !== null}
                  roundKey={`${roundKey}-${round}`}
                  onAnswer={chooseNumber}
                />
                <View style={styles.choices}>
                {roundData.choices.map((choice) => {
                  const isCorrectChoice = selected !== null && choice === roundData.target;
                  const isWrongChoice = selected === choice && choice !== roundData.target;

                  return (
                    <ChoiceButton
                      key={choice}
                      choice={choice}
                      label={formatChoiceLabel(roundData, choice)}
                      compact={roundData.choiceType === "shapeName"}
                      disabled={selected !== null}
                      isCorrect={isCorrectChoice}
                      isWrong={isWrongChoice}
                      onPress={() => chooseNumber(choice)}
                    />
                  );
                })}
                </View>
              </>
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

  function renderClasses() {
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
            <View style={styles.gameTitleCopy}>
              <Text style={styles.gameTitle}>📚 Math Classes</Text>
              <Text style={styles.gameLevelBand}>Learn first, then play games!</Text>
            </View>
          </View>

          <LinearGradient colors={["#FEF3C7", "#FDE68A"]} style={styles.classesIntro}>
            <Text style={styles.classesIntroTitle}>Listen like a real classroom</Text>
            <Text style={styles.classesIntroText}>
              {TEACHER_LABEL} speaks each lesson aloud while drawing on the whiteboard. Finish a
              class to unlock its games. You can replay any finished class anytime — it will not
              lock or change your games.
            </Text>
          </LinearGradient>

          <View style={styles.classList}>
            {LESSONS.map((lesson, index) => (
              <ClassCard
                key={lesson.id}
                lesson={lesson}
                progress={progress}
                index={index}
                onPress={() => openLesson(lesson)}
              />
            ))}
          </View>
        </ScrollView>
      </ScreenShell>
    );
  }

  function renderLesson() {
    const lesson = selectedLesson;
    const slide = lesson.slides[lessonSlide];
    const isLastSlide = lessonSlide >= lesson.slides.length - 1;

    return (
      <ScreenShell>
        <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
          <View style={styles.gameHeader}>
            {lessonFinished ? (
              <Pressable
                onPress={leaveLessonForClasses}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressedButton]}
              >
                <Text style={styles.backButtonText}>← Classes</Text>
              </Pressable>
            ) : (
              <View style={styles.lessonHeaderSpacer} />
            )}
            <View style={styles.gameTitleCopy}>
              <Text style={styles.gameTitle}>{lesson.title}</Text>
              <Text style={styles.gameLevelBand}>
                Step {lessonSlide + 1} of {lesson.slides.length}
              </Text>
            </View>
          </View>

          <View style={styles.lessonProgressRow}>
            {lesson.slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.lessonProgressDot,
                  index <= lessonSlide && styles.lessonProgressDotActive,
                  index === lessonSlide && styles.lessonProgressDotCurrent
                ]}
              />
            ))}
          </View>

          <LinearGradient colors={["#FFFFFF", "#FFFBEB"]} style={styles.lessonPanel}>
            {!lessonFinished ? (
              <>
                <LessonClassroom
                  lesson={selectedLesson}
                  slide={slide}
                  slideIndex={lessonSlide}
                  slideKey={`${selectedLesson.id}-${lessonSlide}-${lessonSlideKey}`}
                  onSlideSpeechProgress={onSlideSpeechProgress}
                />
                <Pressable
                  onPress={nextLessonSlide}
                  disabled={!slideSpeechComplete}
                  style={({ pressed }) => [
                    styles.lessonNextButton,
                    !slideSpeechComplete && styles.lessonNextButtonDisabled,
                    pressed && slideSpeechComplete && styles.pressedButton
                  ]}
                >
                  <LinearGradient
                    colors={slideSpeechComplete ? lesson.gradient : ["#CBD5E1", "#94A3B8"]}
                    style={styles.lessonNextGradient}
                  >
                    <Text
                      style={[
                        styles.lessonNextText,
                        !slideSpeechComplete && styles.lessonNextTextWaiting
                      ]}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.82}
                    >
                      {!slideSpeechComplete
                        ? `Listen to ${TEACHER_LABEL} first`
                        : isLastSlide
                          ? "Finish Class! 🎉"
                          : "Next Step →"}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </>
            ) : (
              <View style={styles.lessonFinishBlock}>
                <Text style={styles.lessonFinishEmoji}>{lessonReplay ? "↺" : "🎓"}</Text>
                <Text style={styles.lessonFinishTitle}>
                  {lessonReplay ? "Great Review!" : "Class Complete!"}
                </Text>
                <Text style={styles.lessonFinishBody}>
                  {lessonReplay
                    ? `You watched ${lesson.title} again. Your unlocked games stay exactly the same — keep playing anytime!`
                    : `You finished ${lesson.title}. Matching games are now unlocked — go practice!`}
                </Text>
                <Pressable
                  onPress={backToMenu}
                  style={({ pressed }) => [styles.lessonNextButton, pressed && styles.pressedButton]}
                >
                  <LinearGradient colors={lesson.gradient} style={styles.lessonNextGradient}>
                    <Text style={styles.lessonNextText}>Play Games 🎮</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable
                  onPress={replayLesson}
                  style={({ pressed }) => [styles.levelsLinkButton, pressed && styles.pressedButton]}
                >
                  <Text style={styles.levelsLinkText}>↺ Watch class again</Text>
                </Pressable>
              </View>
            )}
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
              <DashboardStatPill emoji="🪙" label="Coins" value={rewards.coins} />
              <DashboardStatPill emoji="🎮" label="Plays" value={totalPlays} />
              <DashboardStatPill emoji="🎖️" label="Badges" value={unlockedBadgeCount} />
            </View>
            {topRecord?.record.best > 0 && (
              <View style={styles.dashboardChampion}>
                <Text style={styles.dashboardChampionLabel}>Top game</Text>
                <Text style={styles.dashboardChampionText}>
                  {topRecord.game.emoji} {topRecord.game.title} — {formatScoreLabel(topRecord.record.best)}
                </Text>
              </View>
            )}
          </LinearGradient>

          <Text style={styles.dashboardSectionTitle}>High Scores</Text>
          <View style={styles.dashboardList}>
            {sortedRecords.map(({ game, record }, index) => (
              <DashboardScoreRow key={game.id} game={game} record={record} index={index} />
            ))}
          </View>

          <Text style={styles.dashboardSectionTitle}>Badges & Rewards</Text>
          <Text style={styles.dashboardBadgesHint}>
            {unlockedBadgeCount}/{BADGES.length} badges unlocked — play more to collect them all!
          </Text>
          {getBadgesByCategory(BADGES).map((section) => (
            <View key={section.id} style={styles.badgeCategorySection}>
              <Text style={styles.badgeCategoryTitle}>{section.label}</Text>
              <View style={styles.badgeGrid}>
                {section.badges.map((badge, index) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    unlocked={Boolean(rewards.badges[badge.id])}
                    index={index}
                  />
                ))}
              </View>
            </View>
          ))}

        </ScrollView>
      </ScreenShell>
    );
  }

  if (screen === "dashboard") {
    return renderDashboard();
  }
  if (screen === "classes") {
    return renderClasses();
  }
  if (screen === "lesson") {
    return renderLesson();
  }
  if (screen === "levels") {
    return renderLevelSelect();
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
    paddingTop: APP_TOP_INSET
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
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 28,
    zIndex: 1
  },
  menuScreen: {
    paddingTop: 0
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    shadowColor: "#60A5FA",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F59E0B",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  logoBadgeText: {
    fontSize: 26
  },
  heroCopy: {
    flex: 1
  },
  logoTitle: {
    color: THEME.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3
  },
  logoSubtitle: {
    marginTop: 2,
    color: THEME.textSoft,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600"
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 4
  },
  eyebrow: {
    color: THEME.purple,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4
  },
  title: {
    marginTop: 6,
    color: THEME.text,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30
  },
  subtitle: {
    marginTop: 6,
    color: THEME.textSoft,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500"
  },
  playableHint: {
    marginTop: 8,
    marginBottom: 0,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.85)"
  },
  playableHintText: {
    color: THEME.text,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  },
  menuGamesBlock: {
    alignSelf: "stretch",
    width: "100%"
  },
  gameCategorySection: {
    marginTop: 14,
    gap: 8,
    alignSelf: "stretch",
    width: "100%"
  },
  gameCategoryHeader: {
    gap: 4
  },
  gameCategoryTitle: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: "800"
  },
  gameCategoryLockHint: {
    color: THEME.textSoft,
    fontSize: 12,
    fontWeight: "600"
  },
  gameCategoryList: {
    gap: 10,
    alignSelf: "stretch",
    width: "100%"
  },
  learningPathBar: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)"
  },
  learningPathTitle: {
    color: THEME.text,
    fontSize: 15,
    fontWeight: "900"
  },
  learningPathSubtitle: {
    marginTop: 4,
    color: THEME.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
  },
  learningPathRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    flexWrap: "wrap",
    gap: 4
  },
  learningPathStepWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  learningPathStep: {
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.75)",
    minWidth: 52
  },
  learningPathStepLocked: {
    opacity: 0.55
  },
  learningPathStepMastered: {
    borderWidth: 2,
    borderColor: THEME.gold
  },
  learningPathStepEmoji: {
    fontSize: 18
  },
  learningPathStepLabel: {
    marginTop: 2,
    color: THEME.text,
    fontSize: 10,
    fontWeight: "800"
  },
  learningPathStepBadge: {
    fontSize: 9
  },
  learningPathArrow: {
    color: THEME.textSoft,
    fontSize: 14,
    fontWeight: "800"
  },
  classesPromo: {
    marginTop: 0,
    marginBottom: 0,
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)"
  },
  classesPromoCopy: {
    flex: 1
  },
  classesPromoTitle: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: "900"
  },
  classesPromoText: {
    marginTop: 3,
    color: THEME.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
  },
  classesPromoButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#6366F1"
  },
  classesPromoButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900"
  },
  classesIntro: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 12
  },
  classesIntroTitle: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: "900"
  },
  classesIntroText: {
    marginTop: 6,
    color: THEME.textSoft,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600"
  },
  classList: {
    gap: 10
  },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    gap: 12,
    overflow: "hidden",
    minHeight: 88
  },
  classCardLocked: {
    opacity: 0.92
  },
  classCardLock: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.62)",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    zIndex: 2
  },
  classCardLockEmoji: {
    fontSize: 24
  },
  classCardLockText: {
    marginTop: 6,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center"
  },
  classCardEmoji: {
    fontSize: 32
  },
  classCardBody: {
    flex: 1
  },
  classCardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900"
  },
  classCardSubtitle: {
    marginTop: 2,
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "600"
  },
  classCardMeta: {
    marginTop: 6,
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "700"
  },
  lessonProgressRow: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 12,
    justifyContent: "center"
  },
  lessonProgressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E2E8F0"
  },
  lessonProgressDotActive: {
    backgroundColor: "#93C5FD"
  },
  lessonProgressDotCurrent: {
    width: 22,
    backgroundColor: "#3B82F6"
  },
  lessonPanel: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    gap: 10
  },
  lessonSlideEmoji: {
    fontSize: 36,
    textAlign: "center"
  },
  lessonSlideTitle: {
    color: THEME.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center"
  },
  lessonSlideBody: {
    color: THEME.textSoft,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    textAlign: "center"
  },
  lessonVisualBox: {
    marginTop: 4,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    gap: 10
  },
  lessonDotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8
  },
  lessonVisualItem: {
    fontSize: 28
  },
  lessonVisualItemSmall: {
    fontSize: 20
  },
  lessonVisualFade: {
    opacity: 0.25
  },
  lessonVisualCaption: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: "800"
  },
  lessonGroupsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  lessonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF"
  },
  lessonSymbol: {
    fontSize: 24,
    fontWeight: "900",
    color: THEME.text
  },
  lessonEquationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10
  },
  lessonEquationPart: {
    fontSize: 32,
    fontWeight: "900",
    color: THEME.text
  },
  lessonEquationHighlight: {
    color: "#059669"
  },
  lessonEquationText: {
    color: THEME.text,
    fontSize: 18,
    fontWeight: "900"
  },
  lessonRepeatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10
  },
  lessonRepeatGroup: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    maxWidth: 120,
    justifyContent: "center"
  },
  lessonShareGroup: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    gap: 4,
    minWidth: 72
  },
  lessonShareLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textSoft
  },
  lessonSkipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8
  },
  lessonSkipBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center"
  },
  lessonSkipNumber: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: "900"
  },
  lessonCelebrateBox: {
    paddingVertical: 20,
    alignItems: "center"
  },
  lessonCelebrateEmoji: {
    fontSize: 72
  },
  lessonTipBox: {
    padding: 14,
    borderRadius: 16
  },
  lessonTipLabel: {
    color: THEME.text,
    fontSize: 13,
    fontWeight: "900"
  },
  lessonTipText: {
    marginTop: 4,
    color: THEME.textSoft,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700"
  },
  lessonNextButton: {
    marginTop: 6,
    borderRadius: 16,
    overflow: "hidden",
    alignSelf: "stretch"
  },
  lessonNextButtonDisabled: {
    opacity: 0.88
  },
  lessonNextGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50
  },
  lessonNextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 20,
    width: "100%"
  },
  lessonNextTextWaiting: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
    paddingHorizontal: 4
  },
  lessonFinishBlock: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 8
  },
  lessonFinishEmoji: {
    fontSize: 44
  },
  lessonFinishTitle: {
    color: THEME.text,
    fontSize: 22,
    fontWeight: "900"
  },
  lessonFinishBody: {
    color: THEME.textSoft,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    textAlign: "center"
  },
  gameCardLockedWrap: {
    opacity: 0.72
  },
  menuGameCardWrap: {
    alignSelf: "stretch",
    width: "100%"
  },
  gameCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    gap: 12,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  gameCardScoreBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
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
    marginTop: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900"
  },
  gameCardLevelBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 10,
    backgroundColor: "rgba(30,58,95,0.35)"
  },
  gameCardLevelText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800"
  },
  gameCardLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(30,58,95,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 2
  },
  gameCardLockEmoji: {
    fontSize: 28
  },
  gameCardLockText: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center"
  },
  gameCardEmojiWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center"
  },
  gameCardEmoji: {
    fontSize: 28
  },
  gameCardContent: {
    flex: 1,
    paddingRight: 44
  },
  gameCardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  gameCardDescription: {
    marginTop: 4,
    color: "rgba(255,255,255,0.92)",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600"
  },
  playChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.3)"
  },
  gameCardFooter: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6
  },
  menuScoreSummary: {
    marginTop: 12,
    marginBottom: 0,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#F59E0B",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
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
    gap: 10,
    marginBottom: 12
  },
  gameTitleBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  gameTitleCopy: {
    flex: 1
  },
  gameEmoji: {
    fontSize: 28
  },
  gameTitle: {
    color: THEME.text,
    fontSize: 20,
    fontWeight: "900",
    flexShrink: 1
  },
  gameLevelBand: {
    marginTop: 2,
    color: THEME.textSoft,
    fontSize: 12,
    fontWeight: "700"
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#BFDBFE",
    shadowColor: "#93C5FD",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  backButtonText: {
    color: "#2563EB",
    fontWeight: "900",
    fontSize: 13
  },
  lessonHeaderSpacer: {
    width: 108,
    height: 38
  },
  progressSection: {
    marginBottom: 12
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
    height: 10,
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
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#FBBF24",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  statusBar: {
    flexDirection: "row",
    gap: 8
  },
  statBox: {
    flex: 1,
    minHeight: 72,
    padding: 8,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)"
  },
  statEmoji: {
    fontSize: 18,
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
    marginTop: 2,
    color: THEME.text,
    fontSize: 20,
    fontWeight: "900"
  },
  targetCard: {
    minHeight: 180,
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)"
  },
  targetLabel: {
    color: THEME.text,
    fontSize: 14,
    fontWeight: "900"
  },
  dotsGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 120
  },
  shapeCountGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 120
  },
  shapeCountEmoji: {
    fontSize: 40,
    lineHeight: 48
  },
  shapeDisplayCard: {
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120
  },
  shapeDisplayEmoji: {
    fontSize: 88,
    lineHeight: 100
  },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    overflow: "hidden"
  },
  dotShine: {
    position: "absolute",
    top: 6,
    left: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.55)"
  },
  questionCard: {
    marginTop: 12,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  questionGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  questionText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  compareQuestionText: {
    fontSize: 40,
    letterSpacing: 3
  },
  sequenceQuestionText: {
    fontSize: 28,
    letterSpacing: 1
  },
  questionHint: {
    marginTop: 4,
    color: "rgba(255,255,255,0.85)",
    fontSize: 18,
    fontWeight: "800"
  },
  prompt: {
    marginTop: 14,
    textAlign: "center",
    color: THEME.text,
    fontSize: 15,
    fontWeight: "800"
  },
  choices: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between"
  },
  choiceWrapper: {
    width: "47%",
    shadowColor: "#60A5FA",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  choiceButton: {
    minHeight: 84,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 18,
    backgroundColor: "#E0F2FE",
    shadowColor: "#38BDF8",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3
  },
  choiceText: {
    color: THEME.text,
    fontSize: 36,
    fontWeight: "900"
  },
  choiceTextCompact: {
    fontSize: 18,
    letterSpacing: 0.2
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
  levelPassBanner: {
    color: "#059669",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center"
  },
  levelFailBanner: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center"
  },
  levelSelectPanel: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  levelSelectTitle: {
    color: THEME.text,
    fontSize: 20,
    fontWeight: "900"
  },
  levelSelectSubtitle: {
    marginTop: 8,
    color: THEME.textSoft,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600"
  },
  tierToggleRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  tierToggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent"
  },
  tierToggleButtonActive: {
    backgroundColor: "#DBEAFE",
    borderColor: "#3B82F6"
  },
  tierToggleButtonDisabled: {
    opacity: 0.6
  },
  tierToggleText: {
    color: THEME.textSoft,
    fontSize: 14,
    fontWeight: "800"
  },
  tierToggleTextActive: {
    color: THEME.text
  },
  tierToggleTextDisabled: {
    color: THEME.textSoft
  },
  tierHint: {
    marginTop: 10,
    color: THEME.textSoft,
    fontSize: 13,
    fontWeight: "600"
  },
  levelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18
  },
  levelButton: {
    width: "18%",
    minWidth: 58,
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
    padding: 4
  },
  levelButtonLocked: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
    opacity: 0.55
  },
  levelButtonPassed: {
    borderColor: "#22C55E",
    backgroundColor: "#ECFDF5"
  },
  levelButtonNumber: {
    color: THEME.text,
    fontSize: 20,
    fontWeight: "900"
  },
  levelButtonTextLocked: {
    color: THEME.textSoft
  },
  levelButtonCheck: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "900"
  },
  levelButtonScore: {
    color: THEME.textSoft,
    fontSize: 9,
    fontWeight: "700"
  },
  levelsLinkButton: {
    paddingVertical: 10
  },
  levelsLinkText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "800"
  },
  starRow: {
    flexDirection: "row",
    gap: 8
  },
  starIcon: {
    fontSize: 32
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
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  playAgainText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  playIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900"
  },
  messageBox: {
    minHeight: 52,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: "#FDE68A",
    borderRadius: 16,
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 22
  },
  dashboardHero: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginBottom: 16,
    shadowColor: "#FBBF24",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  dashboardHeroTitle: {
    color: THEME.text,
    fontSize: 20,
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
    gap: 8,
    marginTop: 12
  },
  dashboardStatPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  dashboardStatEmoji: {
    fontSize: 22
  },
  dashboardStatValue: {
    marginTop: 4,
    color: THEME.text,
    fontSize: 18,
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
  },
  menuRewardsBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  menuRewardItem: {
    flex: 1,
    alignItems: "center"
  },
  menuRewardEmoji: {
    fontSize: 20
  },
  menuRewardValue: {
    marginTop: 2,
    color: THEME.text,
    fontSize: 18,
    fontWeight: "900"
  },
  menuRewardLabel: {
    marginTop: 2,
    color: THEME.textSoft,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  menuRewardDivider: {
    width: 1,
    height: 40,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.8)"
  },
  menuFooter: {
    marginTop: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,0.25)"
  },
  menuResetButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    gap: 3
  },
  menuResetButtonText: {
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "800"
  },
  menuResetButtonHint: {
    color: "#991B1B",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15
  },
  sessionRewardBox: {
    width: "100%",
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FBBF24",
    gap: 8
  },
  sessionRewardTitle: {
    color: "#92400E",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  sessionRewardCoins: {
    color: THEME.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center"
  },
  sessionRewardTotal: {
    color: THEME.textSoft,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4
  },
  newBadgeUnlock: {
    marginTop: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.9)"
  },
  newBadgeUnlockTitle: {
    color: THEME.text,
    fontSize: 15,
    fontWeight: "900"
  },
  newBadgeUnlockDesc: {
    marginTop: 4,
    color: THEME.textSoft,
    fontSize: 13,
    fontWeight: "600"
  },
  newBadgeUnlockBonus: {
    marginTop: 6,
    color: "#92400E",
    fontSize: 13,
    fontWeight: "800"
  },
  newBadgeMore: {
    marginTop: 8,
    color: THEME.text,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center"
  },
  dashboardBadgesHint: {
    color: THEME.textSoft,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    marginBottom: 14,
    marginTop: -4
  },
  badgeCategorySection: {
    marginBottom: 18
  },
  badgeCategoryTitle: {
    color: THEME.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between"
  },
  badgeCard: {
    width: "47%",
    minHeight: 128,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FDE68A",
    shadowColor: "#F59E0B",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  badgeCardLocked: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
    shadowOpacity: 0
  },
  badgeEmoji: {
    fontSize: 28
  },
  badgeEmojiLocked: {
    opacity: 0.35
  },
  badgeTitle: {
    marginTop: 8,
    color: THEME.text,
    fontSize: 14,
    fontWeight: "900"
  },
  badgeDescription: {
    marginTop: 4,
    color: THEME.textSoft,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600"
  },
  badgeReward: {
    marginTop: 8,
    color: "#92400E",
    fontSize: 11,
    fontWeight: "800"
  },
  badgeTextLocked: {
    opacity: 0.55
  }
});
