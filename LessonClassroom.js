import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { buildSlideSpeechPlan, getBoardCountLabel, speakLesson, speakLessonSequence, stopLessonSpeech } from "./lessonSpeech";

const TEACHER = {
  name: "Teacher Maya",
  emoji: "👩‍🏫"
};

function AnimatedItem({ delay, children, style }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 450,
      delay,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true
    }).start();
  }, [anim, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1]
              })
            }
          ]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}

function WhiteboardDrawing({ visual, slideKey, revealedCount, boardLabel }) {
  if (!visual) {
    return (
      <View style={styles.boardEmpty}>
        <Text style={styles.boardEmptyText}>Watch and listen…</Text>
      </View>
    );
  }

  if (visual.type === "dots" || visual.type === "match") {
    const showCount = revealedCount ?? visual.count;
    const labels = boardLabel || "Count each one:";

    return (
      <View style={styles.boardContent}>
        {showCount > 0 ? <Text style={styles.boardLabel}>{labels}</Text> : null}
        <View style={styles.boardRow}>
          {Array.from({ length: visual.count }, (_, index) => {
            if (index >= showCount) {
              return null;
            }

            return (
              <AnimatedItem key={`${slideKey}-${index}`} delay={80} style={styles.boardDotWrap}>
                <View style={styles.boardCircle}>
                  <Text style={styles.boardCircleEmoji}>{visual.item}</Text>
                </View>
                <Text style={styles.boardDotNumber}>{index + 1}</Text>
              </AnimatedItem>
            );
          })}
        </View>
        {showCount >= visual.count ? (
          <AnimatedItem delay={120}>
            <View style={styles.boardAnswerBox}>
              <Text style={styles.boardAnswerText}>Total = {visual.count}</Text>
            </View>
          </AnimatedItem>
        ) : showCount === 0 ? (
          <Text style={styles.boardWaitingText}>Watch Teacher Maya draw…</Text>
        ) : null}
      </View>
    );
  }

  if (visual.type === "groups") {
    const total = visual.left + visual.right;
    return (
      <View style={styles.boardContent}>
        <View style={styles.boardRow}>
          <AnimatedItem delay={0} style={styles.boardGroupBox}>
            <Text style={styles.boardGroupTitle}>Group A</Text>
            <View style={styles.boardRow}>
              {Array.from({ length: visual.left }, (_, index) => (
                <Text key={index} style={styles.boardItemEmoji}>
                  {visual.item}
                </Text>
              ))}
            </View>
          </AnimatedItem>
          <AnimatedItem delay={400}>
            <Text style={styles.boardOp}>{visual.symbol}</Text>
          </AnimatedItem>
          <AnimatedItem delay={700} style={styles.boardGroupBox}>
            <Text style={styles.boardGroupTitle}>Group B</Text>
            <View style={styles.boardRow}>
              {Array.from({ length: visual.right }, (_, index) => (
                <Text key={index} style={styles.boardItemEmoji}>
                  {visual.item}
                </Text>
              ))}
            </View>
          </AnimatedItem>
        </View>
        <AnimatedItem delay={1100}>
          <Text style={styles.boardOp}>=</Text>
        </AnimatedItem>
        <AnimatedItem delay={1400} style={styles.boardGroupBoxWide}>
          <Text style={styles.boardGroupTitle}>All together</Text>
          <View style={styles.boardRow}>
            {Array.from({ length: total }, (_, index) => (
              <Text key={index} style={styles.boardItemEmoji}>
                {visual.item}
              </Text>
            ))}
          </View>
        </AnimatedItem>
        <AnimatedItem delay={1700}>
          <Text style={styles.boardEquation}>
            {visual.left} {visual.symbol} {visual.right} = {total}
          </Text>
        </AnimatedItem>
      </View>
    );
  }

  if (visual.type === "equation") {
    return (
      <View style={styles.boardContent}>
        <View style={styles.boardEquationRow}>
          {visual.parts.map((part, index) => (
            <AnimatedItem key={`${slideKey}-${part}-${index}`} delay={index * 350}>
              <Text
                style={[
                  styles.boardEquationBig,
                  part === visual.highlight && styles.boardEquationHighlight
                ]}
              >
                {part}
              </Text>
            </AnimatedItem>
          ))}
        </View>
      </View>
    );
  }

  if (visual.type === "takeaway") {
    const left = visual.start - visual.remove;
    return (
      <View style={styles.boardContent}>
        <Text style={styles.boardLabel}>Start with {visual.start}:</Text>
        <View style={styles.boardRow}>
          {Array.from({ length: visual.start }, (_, index) => (
            <AnimatedItem key={index} delay={index * 180}>
              <View style={[styles.boardCircle, index >= left && styles.boardCircleFade]}>
                <Text style={styles.boardCircleEmoji}>{visual.item}</Text>
                {index >= left ? <Text style={styles.boardCross}>✕</Text> : null}
              </View>
            </AnimatedItem>
          ))}
        </View>
        <AnimatedItem delay={visual.start * 180 + 300}>
          <Text style={styles.boardEquation}>
            {visual.start} − {visual.remove} = {left}
          </Text>
        </AnimatedItem>
      </View>
    );
  }

  if (visual.type === "groupsRepeat") {
    const total = visual.groups * visual.perGroup;
    return (
      <View style={styles.boardContent}>
        <Text style={styles.boardLabel}>Equal groups:</Text>
        <View style={styles.boardRepeatGrid}>
          {Array.from({ length: visual.groups }, (_, groupIndex) => (
            <AnimatedItem key={groupIndex} delay={groupIndex * 400} style={styles.boardGroupBox}>
              <Text style={styles.boardGroupTitle}>Group {groupIndex + 1}</Text>
              <View style={styles.boardRow}>
                {Array.from({ length: visual.perGroup }, (_, itemIndex) => (
                  <Text key={itemIndex} style={styles.boardItemEmojiSmall}>
                    {visual.item}
                  </Text>
                ))}
              </View>
            </AnimatedItem>
          ))}
        </View>
        <AnimatedItem delay={visual.groups * 400 + 200}>
          <Text style={styles.boardEquation}>
            {visual.perGroup} × {visual.groups} = {total}
          </Text>
        </AnimatedItem>
      </View>
    );
  }

  if (visual.type === "share") {
    const each = visual.total / visual.groups;
    return (
      <View style={styles.boardContent}>
        <Text style={styles.boardLabel}>Share {visual.total} equally:</Text>
        <View style={styles.boardRepeatGrid}>
          {Array.from({ length: visual.groups }, (_, groupIndex) => (
            <AnimatedItem key={groupIndex} delay={groupIndex * 450} style={styles.boardShareBox}>
              <Text style={styles.boardGroupTitle}>Friend {groupIndex + 1}</Text>
              {Array.from({ length: each }, (_, itemIndex) => (
                <Text key={itemIndex} style={styles.boardItemEmojiSmall}>
                  {visual.item}
                </Text>
              ))}
            </AnimatedItem>
          ))}
        </View>
        <AnimatedItem delay={visual.groups * 450 + 200}>
          <Text style={styles.boardEquation}>
            {visual.total} ÷ {visual.groups} = {each}
          </Text>
        </AnimatedItem>
      </View>
    );
  }

  if (visual.type === "skip") {
    const values = Array.from({ length: visual.times }, (_, index) => (index + 1) * visual.step);
    return (
      <View style={styles.boardContent}>
        <Text style={styles.boardLabel}>Jump by {visual.step}:</Text>
        <View style={styles.boardRow}>
          {values.map((value, index) => (
            <AnimatedItem key={value} delay={index * 250}>
              <View style={styles.boardSkipBubble}>
                <Text style={styles.boardSkipNumber}>{value}</Text>
              </View>
            </AnimatedItem>
          ))}
        </View>
      </View>
    );
  }

  if (visual.type === "celebrate") {
    return (
      <View style={styles.boardCelebrate}>
        <AnimatedItem delay={0}>
          <Text style={styles.boardCelebrateEmoji}>{visual.emoji}</Text>
        </AnimatedItem>
        <AnimatedItem delay={400}>
          <Text style={styles.boardCelebrateText}>Great job, class!</Text>
        </AnimatedItem>
      </View>
    );
  }

  return null;
}

export default function LessonClassroom({ lesson, slide, slideIndex, slideKey }) {
  const [speaking, setSpeaking] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [liveCaption, setLiveCaption] = useState(slide.body);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const usesRevealSync =
    slide.visual?.type === "dots" || slide.visual?.type === "match" || slide.visual?.type === "celebrate";

  useEffect(() => {
    let active = true;
    const plan = buildSlideSpeechPlan(slide, lesson, slideIndex);
    const syncReveal =
      plan.mode === "sequence" &&
      (slide.visual?.type === "dots" || slide.visual?.type === "match" || slide.visual?.type === "celebrate");

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );

    stopLessonSpeech();
    setSpeaking(true);
    setLiveCaption(slide.body);
    setRevealedCount(syncReveal ? 0 : slide.visual?.count ?? 0);
    loop.start();

    const handleStepStart = (step) => {
      if (!active) {
        return;
      }
      setLiveCaption(step.text);
      if (typeof step.reveal === "number") {
        setRevealedCount(step.reveal);
      }
    };

    if (plan.mode === "sequence") {
      speakLessonSequence(plan.steps, {
        onStepStart: handleStepStart,
        onDone: () => {
          if (active) {
            setSpeaking(false);
            loop.stop();
            pulseAnim.setValue(0);
          }
        }
      });
    } else {
      speakLesson(plan.text, {
        onDone: () => {
          if (active) {
            setSpeaking(false);
            loop.stop();
            pulseAnim.setValue(0);
          }
        }
      });
    }

    return () => {
      active = false;
      stopLessonSpeech();
      loop.stop();
    };
  }, [lesson.id, slideIndex, slideKey]);

  function replaySpeech() {
    stopLessonSpeech();
    setSpeaking(true);
    setLiveCaption(slide.body);
    setRevealedCount(usesRevealSync ? 0 : slide.visual?.count ?? 0);

    const plan = buildSlideSpeechPlan(slide, lesson, slideIndex);

    if (plan.mode === "sequence") {
      speakLessonSequence(plan.steps, {
        onStepStart: (step) => {
          setLiveCaption(step.text);
          if (typeof step.reveal === "number") {
            setRevealedCount(step.reveal);
          }
        },
        onDone: () => setSpeaking(false)
      });
    } else {
      speakLesson(plan.text, {
        onDone: () => setSpeaking(false)
      });
    }
  }

  const mouthScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08]
  });

  return (
    <View style={styles.classroom}>
      <View style={styles.teacherPanel}>
        <Animated.View style={[styles.teacherAvatar, speaking && { transform: [{ scale: mouthScale }] }]}>
          <Text style={styles.teacherEmoji}>{TEACHER.emoji}</Text>
        </Animated.View>
        <View style={styles.teacherCopy}>
          <Text style={styles.teacherName}>{TEACHER.name}</Text>
          <Text style={styles.teacherStatus}>{speaking ? "🎤 Speaking…" : "👂 Listen closely!"}</Text>
          <Text style={styles.teacherSlideTitle}>{slide.title}</Text>
        </View>
        <Pressable onPress={replaySpeech} style={styles.replayButton}>
          <Text style={styles.replayButtonText}>🔊 Again</Text>
        </Pressable>
      </View>

      <View style={styles.whiteboardFrame}>
        <View style={styles.whiteboardHeader}>
          <Text style={styles.whiteboardTitle}>📋 Whiteboard</Text>
          <View style={styles.chalkTray}>
            <View style={[styles.chalk, { backgroundColor: "#FFFFFF" }]} />
            <View style={[styles.chalk, { backgroundColor: "#FDE047" }]} />
            <View style={[styles.chalk, { backgroundColor: "#86EFAC" }]} />
          </View>
        </View>
        <View style={styles.whiteboardSurface}>
          <WhiteboardDrawing
            visual={slide.visual}
            slideKey={slideKey}
            revealedCount={usesRevealSync ? revealedCount : undefined}
            boardLabel={getBoardCountLabel(slide.visual)}
          />
        </View>
      </View>

      <View style={styles.captionBox}>
        <Text style={styles.captionLive}>{speaking ? "Teacher Maya says:" : "Remember:"}</Text>
        <Text style={styles.captionText}>{liveCaption}</Text>
        <Text style={styles.captionTip}>💡 {slide.tip}</Text>
      </View>
    </View>
  );
}

export function stopClassroomSpeech() {
  stopLessonSpeech();
}

const styles = StyleSheet.create({
  classroom: { gap: 14 },
  teacherPanel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    borderWidth: 2,
    borderColor: "#FDE68A"
  },
  teacherAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  teacherEmoji: { fontSize: 32 },
  teacherCopy: { flex: 1 },
  teacherName: { color: "#1E3A5F", fontSize: 16, fontWeight: "900" },
  teacherStatus: { marginTop: 2, color: "#5B7A9A", fontSize: 12, fontWeight: "700" },
  teacherSlideTitle: { marginTop: 4, color: "#1E3A5F", fontSize: 14, fontWeight: "800" },
  replayButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#6366F1"
  },
  replayButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  whiteboardFrame: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#8B5E3C",
    backgroundColor: "#8B5E3C"
  },
  whiteboardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#A16207"
  },
  whiteboardTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  chalkTray: { flexDirection: "row", gap: 4 },
  chalk: { width: 18, height: 6, borderRadius: 3 },
  whiteboardSurface: { minHeight: 220, padding: 16, backgroundColor: "#1F4D3A" },
  boardEmpty: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 180 },
  boardEmptyText: { color: "rgba(255,255,255,0.7)", fontSize: 16, fontWeight: "700" },
  boardWaitingText: { color: "rgba(255,255,255,0.55)", fontSize: 14, fontWeight: "700", marginTop: 8 },
  boardContent: { alignItems: "center", gap: 12 },
  boardLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  boardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 8
  },
  boardDotWrap: { alignItems: "center", gap: 4 },
  boardCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)"
  },
  boardCircleFade: { opacity: 0.35 },
  boardCircleEmoji: { fontSize: 22 },
  boardCross: { position: "absolute", color: "#FCA5A5", fontSize: 28, fontWeight: "900" },
  boardDotNumber: { color: "#FDE047", fontSize: 12, fontWeight: "900" },
  boardAnswerBox: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FDE047",
    borderStyle: "dashed"
  },
  boardAnswerText: { color: "#FDE047", fontSize: 20, fontWeight: "900" },
  boardGroupBox: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderStyle: "dashed",
    alignItems: "center",
    gap: 6
  },
  boardGroupBoxWide: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#86EFAC",
    alignItems: "center",
    gap: 6
  },
  boardGroupTitle: { color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "800" },
  boardItemEmoji: { fontSize: 26 },
  boardItemEmojiSmall: { fontSize: 20 },
  boardOp: { color: "#FDE047", fontSize: 28, fontWeight: "900", marginHorizontal: 4 },
  boardEquation: { color: "#FFFFFF", fontSize: 24, fontWeight: "900" },
  boardEquationRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 },
  boardEquationBig: { color: "#FFFFFF", fontSize: 36, fontWeight: "900" },
  boardEquationHighlight: { color: "#86EFAC" },
  boardRepeatGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10 },
  boardShareBox: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FDBA74",
    alignItems: "center",
    minWidth: 72,
    gap: 4
  },
  boardSkipBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  boardSkipNumber: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  boardCelebrate: { alignItems: "center", justifyContent: "center", minHeight: 180, gap: 10 },
  boardCelebrateEmoji: { fontSize: 64 },
  boardCelebrateText: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  captionBox: { padding: 14, borderRadius: 16, backgroundColor: "#F8FAFC", gap: 8 },
  captionLive: { color: "#6366F1", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  captionText: { color: "#1E3A5F", fontSize: 16, lineHeight: 24, fontWeight: "600" },
  captionTip: { color: "#5B7A9A", fontSize: 14, lineHeight: 20, fontWeight: "700" }
});
