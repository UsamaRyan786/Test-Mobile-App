export const BADGE_CATEGORIES = [
  { id: "starter", label: "🌱 Starter" },
  { id: "milestones", label: "🎯 Milestones" },
  { id: "coins", label: "🪙 Coin Hunter" },
  { id: "explorer", label: "🗺️ Explorer" },
  { id: "mastery", label: "💯 Mastery" },
  { id: "records", label: "🏆 Records" },
  { id: "accuracy", label: "🧠 Accuracy" },
  { id: "session", label: "⚡ Session" },
  { id: "games", label: "🎮 Game Badges" },
  { id: "skills", label: "🥇 Skills" },
  { id: "legend", label: "🎖️ Legend" }
];

function getStarsForScore(score, maxRounds) {
  if (score >= maxRounds - 2) return 3;
  if (score >= Math.floor(maxRounds * 0.67)) return 2;
  if (score >= Math.floor(maxRounds * 0.42)) return 1;
  return 0;
}

function getDashboardStats(games, maxRounds, highScores) {
  const records = games.map((game) => ({
    game,
    record: highScores[game.id] || { best: 0, plays: 0 }
  }));

  const totalPlays = records.reduce((sum, item) => sum + item.record.plays, 0);
  const totalBest = records.reduce((sum, item) => sum + item.record.best, 0);
  const perfectGames = records.filter((item) => item.record.best === maxRounds).length;
  const threeStarGames = records.filter(
    (item) => getStarsForScore(item.record.best, maxRounds) === 3
  ).length;
  const twoStarGames = records.filter(
    (item) => getStarsForScore(item.record.best, maxRounds) >= 2
  ).length;
  const topRecord = [...records].sort((a, b) => b.record.best - a.record.best)[0];

  return { records, totalPlays, totalBest, perfectGames, threeStarGames, twoStarGames, topRecord };
}

function buildBadgeContext(games, maxRounds, highScores, rewards, event = {}) {
  const stats = getDashboardStats(games, maxRounds, highScores);
  const gamesPlayed = stats.records.filter((item) => item.record.plays > 0).length;
  const maxStars = Math.max(
    0,
    ...stats.records.map((item) => getStarsForScore(item.record.best, maxRounds))
  );
  const rewardStats = rewards.stats || { recordBreaks: 0, totalCorrect: 0 };

  const gamePlays = {};
  const gamePerfect = {};
  const gameThreeStar = {};

  for (const game of games) {
    const record = highScores[game.id] || { plays: 0, best: 0 };
    gamePlays[game.id] = record.plays;
    gamePerfect[game.id] = record.best === maxRounds;
    gameThreeStar[game.id] = getStarsForScore(record.best, maxRounds) === 3;
  }

  return {
    totalPlays: stats.totalPlays,
    totalBest: stats.totalBest,
    perfectGameCount: stats.perfectGames,
    threeStarGameCount: stats.threeStarGames,
    twoStarGameCount: stats.twoStarGames,
    gamesPlayed,
    maxStars,
    coins: rewards.coins,
    unlockedCount: Object.keys(rewards.badges).length,
    recordBreaks: rewardStats.recordBreaks,
    totalCorrect: rewardStats.totalCorrect,
    beatRecord: event.beatRecord === true,
    gameId: event.gameId,
    score: event.score ?? 0,
    sessionGameId: event.gameId,
    sessionScore: event.score ?? 0,
    gamePlays,
    gamePerfect,
    gameThreeStar
  };
}

function milestoneBadge(id, emoji, title, description, reward, category, check) {
  return { id, emoji, title, description, reward, category, check };
}

function descriptionFor(prefix, value, maxRounds) {
  if (prefix === "plays") return `${value} completed games`;
  if (prefix === "coins") return `${value} garden coins`;
  if (prefix === "games") return `${value} different games`;
  if (prefix === "perfect") return `${value} perfect games`;
  if (prefix === "records") return `${value} high score records broken`;
  if (prefix === "correct") return `${value} lifetime correct answers`;
  if (prefix === "score") return `at least ${value} correct in one game`;
  if (prefix === "star_games") return `${value} games with 3 stars`;
  if (prefix === "two_star") return `${value} games with 2+ stars`;
  if (prefix === "total_best") return `${value} combined best-score points`;
  if (prefix === "legend") return `${value} total badges unlocked`;
  return String(value);
}

function thresholdBadges(prefix, emoji, category, thresholds, maxRounds, rewardFor, labelFor, checkFn) {
  return thresholds.map((value) =>
    milestoneBadge(
      `${prefix}_${value}`,
      emoji,
      labelFor(value),
      `Reach ${descriptionFor(prefix, value, maxRounds)}`,
      rewardFor(value),
      category,
      (ctx) => checkFn(ctx, value)
    )
  );
}

function rewardForTier(value, base = 8) {
  return base + Math.floor(Math.log10(value + 1) * 8);
}

export function buildBadges(games, maxRounds) {
  const badges = [
    milestoneBadge(
      "first_game",
      "🌱",
      "First Steps",
      "Complete your first game",
      10,
      "starter",
      (ctx) => ctx.totalPlays >= 1
    ),
    milestoneBadge(
      "star_hunter",
      "⭐",
      "Star Hunter",
      "Earn 2 stars in any game",
      15,
      "starter",
      (ctx) => ctx.maxStars >= 2
    ),
    milestoneBadge(
      "super_star",
      "🌟",
      "Super Star",
      "Earn 3 stars in any game",
      25,
      "starter",
      (ctx) => ctx.maxStars >= 3
    ),
    milestoneBadge(
      "perfect_run",
      "💯",
      "Perfect Run",
      "Get every question right in a game",
      50,
      "starter",
      (ctx) => ctx.perfectGameCount >= 1
    ),
    milestoneBadge(
      "explorer",
      "🗺️",
      "Game Explorer",
      "Try 4 different games",
      20,
      "starter",
      (ctx) => ctx.gamesPlayed >= 4
    ),
    milestoneBadge(
      "math_master",
      "👑",
      "Math Master",
      "Try all 12 games",
      60,
      "starter",
      (ctx) => ctx.gamesPlayed >= games.length
    ),
    milestoneBadge(
      "coin_collector",
      "🪙",
      "Coin Collector",
      "Collect 100 garden coins",
      20,
      "starter",
      (ctx) => ctx.coins >= 100
    ),
    milestoneBadge(
      "dedicated",
      "🔥",
      "On Fire!",
      "Complete 20 games in total",
      30,
      "starter",
      (ctx) => ctx.totalPlays >= 20
    ),
    milestoneBadge(
      "high_scorer",
      "🏆",
      "Record Breaker",
      "Set a new high score",
      15,
      "starter",
      (ctx) => ctx.beatRecord
    ),
    milestoneBadge(
      "addition_fan",
      "🚀",
      "Addition Fan",
      "Play Addition Adventure 3 times",
      15,
      "starter",
      (ctx) => ctx.gamePlays.addition >= 3
    ),
    milestoneBadge(
      "counting_champ",
      "🌻",
      "Counting Champ",
      "Perfect score in Number Match Garden",
      25,
      "starter",
      (ctx) => ctx.gamePerfect.match
    ),
    milestoneBadge(
      "badge_legend",
      "🎖️",
      "Badge Legend",
      "Unlock 6 badges",
      40,
      "legend",
      (ctx) => ctx.unlockedCount >= 6
    )
  ];

  badges.push(
    ...thresholdBadges(
      "plays",
      "🎮",
      "milestones",
      [2, 3, 5, 8, 10, 15, 25, 40, 50, 60],
      maxRounds,
      (v) => rewardForTier(v, 6),
      (v) => (v === 2 ? "Double Play" : `${v} Games`),
      (ctx, v) => ctx.totalPlays >= v
    )
  );

  badges.push(
    ...thresholdBadges(
      "coins",
      "💰",
      "coins",
      [25, 50, 150, 250, 400, 600, 1000, 2000, 3500, 5000],
      maxRounds,
      (v) => rewardForTier(v, 5),
      (v) => (v === 25 ? "Penny Pincher" : `${v} Coins`),
      (ctx, v) => ctx.coins >= v
    )
  );

  badges.push(
    ...thresholdBadges(
      "games",
      "🧭",
      "explorer",
      [2, 3, 5, 6, 7, 8, 9, 10],
      maxRounds,
      (v) => 8 + v * 2,
      (v) => `${v} Games Tried`,
      (ctx, v) => ctx.gamesPlayed >= v
    )
  );

  badges.push(
    ...thresholdBadges(
      "perfect",
      "✨",
      "mastery",
      [2, 3, 4, 5, 6, 8],
      maxRounds,
      (v) => 12 + v * 4,
      (v) => `${v} Perfect Games`,
      (ctx, v) => ctx.perfectGameCount >= v
    )
  );

  badges.push(
    ...thresholdBadges(
      "records",
      "📈",
      "records",
      [1, 2, 3, 5, 10, 20],
      maxRounds,
      (v) => 10 + v * 3,
      (v) => (v === 1 ? "First Record" : `${v} Records`),
      (ctx, v) => ctx.recordBreaks >= v
    )
  );

  badges.push(
    ...thresholdBadges(
      "correct",
      "🧮",
      "accuracy",
      [30, 60, 120, 200, 350, 500],
      maxRounds,
      (v) => rewardForTier(v, 10),
      (v) => `${v} Correct`,
      (ctx, v) => ctx.totalCorrect >= v
    )
  );

  badges.push(
    ...thresholdBadges(
      "score",
      "🎯",
      "session",
      [6, 7, 8, 9, 10, 11],
      maxRounds,
      (v) => 8 + v * 2,
      (v) => `Score ${v}+`,
      (ctx, v) => ctx.score >= v
    )
  );

  badges.push(
    ...thresholdBadges(
      "star_games",
      "🌠",
      "mastery",
      [2, 3, 4, 5, 6, 8, 10, 12],
      maxRounds,
      (v) => 10 + v * 3,
      (v) => `${v} Star Games`,
      (ctx, v) => ctx.threeStarGameCount >= v
    )
  );

  badges.push(
    ...thresholdBadges(
      "legend",
      "🏅",
      "legend",
      [25, 50, 75, 100],
      maxRounds,
      (v) => 20 + Math.floor(v / 5),
      (v) => `Legend ${v}`,
      (ctx, v) => ctx.unlockedCount >= v
    )
  );

  for (const game of games) {
    const shortName = game.title.replace(/ Adventure| Safari| Meadow| Castle| Magic| Trouble| Swamp| Mystery| Cave| Garden| Ninja| & After/g, "");

    badges.push(
      milestoneBadge(
        `play5_${game.id}`,
        game.emoji,
        `${shortName} Regular`,
        `Play ${game.title} 5 times`,
        12,
        "games",
        (ctx) => ctx.gamePlays[game.id] >= 5
      ),
      milestoneBadge(
        `play10_${game.id}`,
        game.emoji,
        `${shortName} Veteran`,
        `Play ${game.title} 10 times`,
        18,
        "games",
        (ctx) => ctx.gamePlays[game.id] >= 10
      ),
      milestoneBadge(
        `perfect_${game.id}`,
        "💎",
        `${shortName} Perfect`,
        `Get ${maxRounds}/${maxRounds} in ${game.title}`,
        18,
        "games",
        (ctx) => ctx.gamePerfect[game.id]
      ),
      milestoneBadge(
        `star3_${game.id}`,
        "🌟",
        `${shortName} Superstar`,
        `Earn 3 stars in ${game.title}`,
        14,
        "games",
        (ctx) => ctx.gameThreeStar[game.id]
      ),
      milestoneBadge(
        `ace_${game.id}`,
        "🥇",
        `${shortName} Ace`,
        `Score 10+ in one ${game.title} run`,
        16,
        "skills",
        (ctx) => ctx.sessionGameId === game.id && ctx.sessionScore >= 10
      )
    );
  }

  badges.push(
    ...thresholdBadges(
      "total_best",
      "📊",
      "mastery",
      [48, 60, 72, 84, 96, 108, 120],
      maxRounds,
      (v) => 10 + Math.floor(v / 12),
      (v) => `${v} Best Points`,
      (ctx, v) => ctx.totalBest >= v
    )
  );

  badges.push(
    ...thresholdBadges(
      "two_star",
      "✨",
      "mastery",
      [1, 2, 3, 4, 6, 8, 10],
      maxRounds,
      (v) => 8 + v * 3,
      (v) => `${v} Two-Star Games`,
      (ctx, v) => ctx.twoStarGameCount >= v
    )
  );

  badges.push(
    ...thresholdBadges(
      "plays",
      "🕹️",
      "milestones",
      [70, 80, 100, 125, 150],
      maxRounds,
      (v) => rewardForTier(v, 8),
      (v) => `${v} Games`,
      (ctx, v) => ctx.totalPlays >= v
    )
  );

  badges.push(
    ...thresholdBadges(
      "correct",
      "🎓",
      "accuracy",
      [750, 1000, 1500, 2000],
      maxRounds,
      (v) => rewardForTier(v, 12),
      (v) => `${v} Correct`,
      (ctx, v) => ctx.totalCorrect >= v
    )
  );

  badges.push(
    ...thresholdBadges(
      "records",
      "🔥",
      "records",
      [30, 40, 50],
      maxRounds,
      (v) => 15 + v * 2,
      (v) => `${v} Records`,
      (ctx, v) => ctx.recordBreaks >= v
    )
  );

  return badges;
}

export function evaluateBadges(badgeList, games, maxRounds, highScores, rewards, event = {}) {
  const ctx = buildBadgeContext(games, maxRounds, highScores, rewards, event);
  const checks = {};

  for (const badge of badgeList) {
    checks[badge.id] = badge.check(ctx);
  }

  return checks;
}

export function updateRewardStats(rewards, score, beatRecord) {
  if (!rewards.stats) {
    rewards.stats = { recordBreaks: 0, totalCorrect: 0 };
  }

  rewards.stats.totalCorrect += score;
  if (beatRecord) {
    rewards.stats.recordBreaks += 1;
  }
}

export function getBadgesByCategory(badges) {
  return BADGE_CATEGORIES.map((category) => ({
    ...category,
    badges: badges.filter((badge) => badge.category === category.id)
  })).filter((section) => section.badges.length > 0);
}
