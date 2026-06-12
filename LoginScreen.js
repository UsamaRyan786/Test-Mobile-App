import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginUser, registerUser } from "./authStorage";

const THEME = {
  bg: ["#BAE6FD", "#DDD6FE", "#FBCFE8", "#FEF9C3"],
  text: "#1E3A5F",
  textSoft: "#5B7A9A",
  coral: "#FF6B9D",
  sky: "#38BDF8",
  purple: "#A78BFA"
};

export default function LoginScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);

    try {
      if (mode === "signup" && password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const result =
        mode === "login"
          ? await loginUser({ username, password })
          : await registerUser({ username, password, displayName });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      onAuthenticated(result.user);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setConfirmPassword("");
  }

  return (
    <LinearGradient colors={THEME.bg} style={styles.gradientRoot}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.screen}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroCard}>
              <LinearGradient colors={["#38BDF8", "#FBBF24"]} style={styles.logoBadge}>
                <Text style={styles.logoBadgeText}>123</Text>
              </LinearGradient>
              <Text style={styles.title}>Math Talk</Text>
              <Text style={styles.subtitle}>
                {mode === "login"
                  ? "Sign in to save your classes, scores, and badges."
                  : "Create a profile so each learner keeps their own progress."}
              </Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {mode === "login" ? "Welcome back" : "Create account"}
              </Text>

              {mode === "signup" ? (
                <View style={styles.field}>
                  <Text style={styles.label}>Display name</Text>
                  <TextInput
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="e.g. Ayesha"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              ) : null}

              <View style={styles.field}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="learner123"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 4 characters"
                  placeholderTextColor="#94A3B8"
                  style={styles.input}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {mode === "signup" ? (
                <View style={styles.field}>
                  <Text style={styles.label}>Confirm password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Repeat password"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              ) : null}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !loading && styles.pressedButton,
                  loading && styles.disabledButton
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {mode === "login" ? "Sign in" : "Create account"}
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => switchMode(mode === "login" ? "signup" : "login")}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressedButton]}
              >
                <Text style={styles.secondaryButtonText}>
                  {mode === "login"
                    ? "New here? Create an account"
                    : "Already have an account? Sign in"}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.noteText}>
              Progress is saved on this device for each account. Passwords are stored securely on
              the phone and are not sent online.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientRoot: {
    flex: 1
  },
  safeArea: {
    flex: 1
  },
  flex: {
    flex: 1
  },
  screen: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: "center"
  },
  heroCard: {
    alignItems: "center",
    marginBottom: 20
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  logoBadgeText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF"
  },
  title: {
    color: THEME.text,
    fontSize: 30,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 8,
    color: THEME.textSoft,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 320
  },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 22,
    padding: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.95)",
    shadowColor: "#60A5FA",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  formTitle: {
    color: THEME.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 16
  },
  field: {
    marginBottom: 14
  },
  label: {
    color: THEME.textSoft,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    color: THEME.text,
    fontSize: 16,
    fontWeight: "600"
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12
  },
  primaryButton: {
    backgroundColor: THEME.coral,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900"
  },
  secondaryButton: {
    marginTop: 14,
    alignItems: "center",
    paddingVertical: 8
  },
  secondaryButtonText: {
    color: THEME.purple,
    fontSize: 14,
    fontWeight: "800"
  },
  noteText: {
    marginTop: 18,
    color: THEME.textSoft,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center"
  },
  pressedButton: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  },
  disabledButton: {
    opacity: 0.7
  }
});
