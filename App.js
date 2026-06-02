import { useEffect, useMemo, useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  View
} from "react-native";

const MAX_ROUNDS = 8;
const MIN_NUMBER = 1;
const MAX_NUMBER = 10;

const DOT_COLORS = ["#ffd166", "#06d6a0", "#ef476f", "#118ab2"];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeChoices(value) {
  const choices = new Set([value]);

  while (choices.size < 4) {
    const offset = randomInt(-3, 3);
    const next = Math.min(MAX_NUMBER, Math.max(MIN_NUMBER, value + offset));
    choices.add(next);
  }

  return shuffle([...choices]);
}

function createRound() {
  const target = randomInt(MIN_NUMBER, MAX_NUMBER);
  return {
    target,
    choices: makeChoices(target)
  };
}

export default function App() {
  const feedbackTimer = useRef(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [roundData, setRoundData] = useState(() => createRound());
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("Tap the matching number.");
  const [finished, setFinished] = useState(false);

  const dots = useMemo(
    () => Array.from({ length: roundData.target }, (_, index) => index),
    [roundData.target]
  );

  useEffect(() => {
    return () => {
      if (feedbackTimer.current) {
        clearTimeout(feedbackTimer.current);
      }
    };
  }, []);

  function startGame() {
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }

    setScore(0);
    setRound(1);
    setRoundData(createRound());
    setSelected(null);
    setMessage("Tap the matching number.");
    setFinished(false);
  }

  function goToNextRound(nextScore) {
    if (round >= MAX_ROUNDS) {
      setFinished(true);
      setMessage(`Game finished! You matched ${nextScore} out of ${MAX_ROUNDS}.`);
      return;
    }

    setRound((currentRound) => currentRound + 1);
    setRoundData(createRound());
    setSelected(null);
    setMessage("Tap the matching number.");
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
      isCorrect
        ? "Great counting!"
        : `Almost! This group has ${roundData.target} dots.`
    );

    feedbackTimer.current = setTimeout(() => goToNextRound(nextScore), 1100);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#e9f7ee" />
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Number Match Garden</Text>
            <Text style={styles.title}>Pick the number that matches the dots.</Text>
          </View>

          <View style={styles.flowerRow} accessibilityElementsHidden>
            {DOT_COLORS.map((color, index) => (
              <View key={color} style={styles.flowerStem}>
                <View style={[styles.flower, { backgroundColor: color }]}>
                  <View style={styles.flowerShine} />
                </View>
                <View style={[styles.stem, { height: 38 + index * 7 }]} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.statusBar}>
            <View style={styles.statBox}>
              <Text style={styles.label}>Score</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.label}>Round</Text>
              <Text style={styles.statValue}>
                {round}/{MAX_ROUNDS}
              </Text>
            </View>

            <Pressable
              onPress={startGame}
              style={({ pressed }) => [
                styles.newButton,
                pressed && styles.pressedButton
              ]}
              accessibilityRole="button"
              accessibilityLabel="Start a new game"
            >
              <Text style={styles.buttonIcon}>↻</Text>
              <Text style={styles.newButtonText}>New</Text>
            </Pressable>
          </View>

          <View style={styles.targetCard}>
            <Text style={styles.label}>Count these</Text>
            <View style={styles.dotsGrid} accessibilityLabel={`${roundData.target} dots to count`}>
              {dots.map((dot) => (
                <View
                  key={dot}
                  style={[
                    styles.dot,
                    { backgroundColor: DOT_COLORS[dot % DOT_COLORS.length] }
                  ]}
                />
              ))}
            </View>
          </View>

          <Text style={styles.prompt}>
            {finished ? "Want to play again?" : "Which number matches?"}
          </Text>

          {finished ? (
            <Pressable
              onPress={startGame}
              style={({ pressed }) => [
                styles.playAgainButton,
                pressed && styles.pressedButton
              ]}
              accessibilityRole="button"
              accessibilityLabel="Play again"
            >
              <Text style={styles.playIcon}>▶</Text>
              <Text style={styles.playAgainText}>Play Again</Text>
            </Pressable>
          ) : (
            <View style={styles.choices}>
              {roundData.choices.map((choice) => {
                const isCorrectChoice = selected !== null && choice === roundData.target;
                const isWrongChoice = selected === choice && choice !== roundData.target;

                return (
                  <Pressable
                    key={choice}
                    onPress={() => chooseNumber(choice)}
                    style={({ pressed }) => [
                      styles.choiceButton,
                      isCorrectChoice && styles.correctChoice,
                      isWrongChoice && styles.wrongChoice,
                      pressed && selected === null && styles.pressedChoice
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Choose ${choice}`}
                  >
                    <Text style={styles.choiceText}>{choice}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={[styles.messageBox, finished && styles.successMessage]}>
            <Text style={[styles.messageIcon, finished && styles.successIcon]}>
              {finished ? "★" : "✦"}
            </Text>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e9f7ee"
  },
  screen: {
    flexGrow: 1,
    padding: 18,
    backgroundColor: "#e9f7ee"
  },
  hero: {
    minHeight: 170,
    justifyContent: "space-between",
    gap: 14
  },
  heroCopy: {
    maxWidth: 560
  },
  eyebrow: {
    color: "#667085",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  title: {
    marginTop: 8,
    color: "#27313b",
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 40
  },
  flowerRow: {
    height: 76,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 16
  },
  flowerStem: {
    alignItems: "center",
    justifyContent: "flex-end"
  },
  flower: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 9,
    shadowColor: "#27313b",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  flowerShine: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff"
  },
  stem: {
    width: 7,
    marginTop: -2,
    borderRadius: 4,
    backgroundColor: "#254d35"
  },
  panel: {
    marginTop: 18,
    padding: 14,
    borderWidth: 2,
    borderColor: "#dde6dc",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    shadowColor: "#27313b",
    shadowOpacity: 0.15,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5
  },
  statusBar: {
    flexDirection: "row",
    gap: 10
  },
  statBox: {
    flex: 1,
    minHeight: 72,
    padding: 12,
    borderWidth: 2,
    borderColor: "#dde6dc",
    borderRadius: 8,
    backgroundColor: "#f8fff9"
  },
  label: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  statValue: {
    marginTop: 5,
    color: "#27313b",
    fontSize: 28,
    fontWeight: "900"
  },
  newButton: {
    width: 82,
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderRadius: 8,
    backgroundColor: "#168aad"
  },
  newButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900"
  },
  buttonIcon: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 26
  },
  targetCard: {
    minHeight: 240,
    marginTop: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#dde6dc",
    borderRadius: 8,
    backgroundColor: "#f2fff5"
  },
  dotsGrid: {
    flex: 1,
    minHeight: 190,
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "center",
    gap: 13
  },
  dot: {
    width: 48,
    height: 48,
    borderWidth: 4,
    borderColor: "#27313b",
    borderRadius: 24
  },
  prompt: {
    marginTop: 18,
    marginBottom: 12,
    color: "#27313b",
    fontSize: 24,
    fontWeight: "900"
  },
  choices: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  choiceButton: {
    width: "47%",
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#b6d8c3",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    shadowColor: "#b6d8c3",
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3
  },
  pressedChoice: {
    transform: [{ translateY: 3 }]
  },
  choiceText: {
    color: "#27313b",
    fontSize: 44,
    fontWeight: "900"
  },
  correctChoice: {
    borderColor: "#2fbf71",
    backgroundColor: "#dff8e8"
  },
  wrongChoice: {
    borderColor: "#ef476f",
    backgroundColor: "#ffe7ec"
  },
  playAgainButton: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    backgroundColor: "#2fbf71"
  },
  playAgainText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900"
  },
  playIcon: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "900"
  },
  messageBox: {
    minHeight: 58,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 2,
    borderColor: "#f1c453",
    borderRadius: 8,
    backgroundColor: "#fff4cf"
  },
  successMessage: {
    borderColor: "#2fbf71",
    backgroundColor: "#dcfce7"
  },
  messageText: {
    flex: 1,
    color: "#27313b",
    fontSize: 17,
    fontWeight: "900"
  },
  messageIcon: {
    color: "#9b7200",
    fontSize: 23,
    fontWeight: "900"
  },
  successIcon: {
    color: "#1b8f50"
  },
  pressedButton: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }]
  }
});
