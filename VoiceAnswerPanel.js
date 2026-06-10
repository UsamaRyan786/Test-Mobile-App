import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import {
  checkVoiceAnswerSupport,
  createVoiceAnswerSession,
  ensureMicPermission,
  stopVoiceAnswerSession
} from "./voiceAnswer";

export default function VoiceAnswerPanel({
  choices,
  choiceType = "number",
  disabled,
  roundKey,
  autoListen = true,
  onAnswer
}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [hint, setHint] = useState("");
  const [available, setAvailable] = useState(false);
  const [checked, setChecked] = useState(false);
  const sessionRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkVoiceAnswerSupport().then((result) => {
      setAvailable(result.available);
      setChecked(true);
      if (result.available) {
        setHint("Say your answer — mic starts automatically.");
      } else if (result.reason) {
        setHint(result.reason);
      }
    });
  }, []);

  function stopActiveSession() {
    sessionRef.current?.stop();
    sessionRef.current = null;
    setListening(false);
  }

  const startListening = useCallback(async () => {
    if (disabled || !available || listening) {
      return;
    }

    const granted = await ensureMicPermission();
    if (!granted) {
      setHint("Microphone permission is needed to speak your answer.");
      return;
    }

    stopActiveSession();
    setTranscript("");
    setHint(choiceType === "shapeName" ? "Listening… say the shape name!" : "Listening… say your number!");

    sessionRef.current = createVoiceAnswerSession({
      choices,
      choiceType,
      onTranscript: setTranscript,
      onListeningChange: setListening,
      onResult: (answer, heard) => {
        setHint(`Heard "${heard}"`);
        setListening(false);
        onAnswer(answer);
      },
      onError: (message) => {
        setHint(message);
        setListening(false);
      }
    });
  }, [available, choiceType, choices, disabled, listening, onAnswer]);

  useEffect(() => {
    stopActiveSession();
    setTranscript("");
    if (!disabled && available) {
      setHint(autoListen ? "Say your answer — mic starts automatically." : "Tap the mic and say your answer!");
    }
  }, [roundKey, disabled, available, autoListen]);

  useEffect(() => {
    if (!autoListen || disabled || !available) {
      return undefined;
    }

    const timer = setTimeout(() => {
      startListening();
    }, 400);

    return () => clearTimeout(timer);
  }, [roundKey, disabled, available, autoListen, startListening]);

  useEffect(() => {
    return () => stopActiveSession();
  }, []);

  useEffect(() => {
    if (!listening) {
      pulseAnim.setValue(0);
      return undefined;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [listening, pulseAnim]);

  const pulseStyle = {
    transform: [
      {
        scale: pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.12]
        })
      }
    ],
    opacity: pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.82]
    })
  };

  if (checked && !available) {
    return null;
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>🎤 Speak Your Answer</Text>
      <Text style={styles.subtitle}>Say your answer out loud, or tap a button below.</Text>

      <Pressable
        onPress={startListening}
        disabled={disabled || !available || listening}
        style={({ pressed }) => [
          styles.micButton,
          (!available || disabled) && styles.micButtonDisabled,
          listening && styles.micButtonActive,
          pressed && available && !disabled && !listening && styles.micButtonPressed
        ]}
      >
        <Animated.View style={[styles.micInner, listening && pulseStyle]}>
          <Text style={styles.micEmoji}>{listening ? "🔴" : "🎤"}</Text>
          <Text style={styles.micLabel}>{listening ? "Listening…" : "Tap to speak again"}</Text>
        </Animated.View>
      </Pressable>

      {transcript ? <Text style={styles.transcript}>You said: "{transcript}"</Text> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function stopGameVoiceInput() {
  stopVoiceAnswerSession();
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 6,
    marginBottom: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#F0F9FF",
    borderWidth: 2,
    borderColor: "#BAE6FD",
    gap: 6
  },
  title: {
    color: "#1E3A5F",
    fontSize: 15,
    fontWeight: "900"
  },
  subtitle: {
    color: "#5B7A9A",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
  },
  micButton: {
    marginTop: 2,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#6366F1"
  },
  micButtonActive: {
    backgroundColor: "#DC2626"
  },
  micButtonDisabled: {
    backgroundColor: "#94A3B8"
  },
  micButtonPressed: {
    opacity: 0.92
  },
  micInner: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  micEmoji: {
    fontSize: 24
  },
  micLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900"
  },
  transcript: {
    color: "#1D4ED8",
    fontSize: 14,
    fontWeight: "700"
  },
  hint: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600"
  }
});
