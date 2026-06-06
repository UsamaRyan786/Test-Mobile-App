import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import {
  checkVoiceAnswerSupport,
  createVoiceAnswerSession,
  ensureMicPermission,
  stopVoiceAnswerSession
} from "./voiceAnswer";

export default function VoiceAnswerPanel({ choices, disabled, roundKey, onAnswer }) {
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
        setHint("Tap the mic and say your answer!");
      } else if (result.reason) {
        setHint(result.reason);
      }
    });
  }, []);

  useEffect(() => {
    stopActiveSession();
    setTranscript("");
    if (!disabled && available) {
      setHint("Tap the mic and say your answer!");
    }
  }, [roundKey, disabled, available]);

  useEffect(() => {
    return () => stopActiveSession();
  }, []);

  useEffect(() => {
    if (!listening) {
      pulseAnim.setValue(0);
      return;
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

  function stopActiveSession() {
    sessionRef.current?.stop();
    sessionRef.current = null;
    setListening(false);
  }

  async function handleMicPress() {
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
    setHint("Listening… say a number from the choices!");

    sessionRef.current = createVoiceAnswerSession({
      choices,
      onTranscript: setTranscript,
      onListeningChange: setListening,
      onResult: (answer, heard) => {
        setHint(`Heard "${heard}" → ${answer}`);
        setListening(false);
        onAnswer(answer);
      },
      onError: (message) => {
        setHint(message);
        setListening(false);
      }
    });
  }

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
      <Text style={styles.subtitle}>Say the number out loud, or tap a button below.</Text>

      <Pressable
        onPress={handleMicPress}
        disabled={disabled || !available}
        style={({ pressed }) => [
          styles.micButton,
          (!available || disabled) && styles.micButtonDisabled,
          listening && styles.micButtonActive,
          pressed && available && !disabled && styles.micButtonPressed
        ]}
      >
        <Animated.View style={[styles.micInner, listening && pulseStyle]}>
          <Text style={styles.micEmoji}>{listening ? "🔴" : "🎤"}</Text>
          <Text style={styles.micLabel}>{listening ? "Listening…" : "Tap to speak"}</Text>
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
  },
  fallbackNote: {
    color: "#64748B",
    fontSize: 12,
    fontStyle: "italic"
  }
});
