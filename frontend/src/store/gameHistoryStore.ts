import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameSessionLog {
  id: string;
  gameId: string;
  gameName: string;
  category: string;
  score: number;
  highScore: number;
  durationSeconds: number;
  timestamp: number;
  outcome: 'completed' | 'game_over' | 'victory' | 'practice';
  accuracy?: number;
  details?: Record<string, any>;
}

export interface PlayerStats {
  totalGamesPlayed: number;
  uniqueGamesPlayed: number;
  totalScore: number;
  highestSingleScore: number;
  highestScoringGame: string;
  totalPlayTimeSeconds: number;
  totalWins: number;
  currentStreak: number;
  longestStreak: number;
}

export interface PlayerLevelInfo {
  level: number;
  title: string;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  rankBadge: string;
}

interface GameHistoryState {
  history: GameSessionLog[];
  favorites: string[];
  recentGameIds: string[];
  lastPlayedSession: GameSessionLog | null;
  highScores: Record<string, number>; // gameId -> highScore
  
  // Actions
  recordGameSession: (session: Omit<GameSessionLog, 'id' | 'timestamp' | 'highScore'>) => GameSessionLog;
  toggleFavorite: (gameId: string) => void;
  isFavorite: (gameId: string) => boolean;
  getHighScore: (gameId: string) => number;
  getGameHistory: (gameId: string) => GameSessionLog[];
  getPlayerStats: () => PlayerStats;
  getPlayerLevel: () => PlayerLevelInfo;
  getUserGamingProfileSummary: () => string;
  clearHistory: () => void;
}

// Calculate Player Level from total XP
export function calculateLevelFromXP(xp: number): PlayerLevelInfo {
  // Level formula: Level = Math.floor(Math.sqrt(xp / 100)) + 1, capped at 100
  let level = Math.max(1, Math.min(100, Math.floor(Math.sqrt(xp / 80)) + 1));
  
  // Required XP for level L: 80 * (L - 1)^2
  const xpForCurrentLevel = Math.round(80 * Math.pow(level - 1, 2));
  const xpForNextLevel = Math.round(80 * Math.pow(level, 2));
  const span = Math.max(1, xpForNextLevel - xpForCurrentLevel);
  const progressPercent = Math.min(100, Math.max(0, Math.round(((xp - xpForCurrentLevel) / span) * 100)));

  let title = 'Novice Gamer';
  let rankBadge = '🌱 Bronze Tier';

  if (level >= 90) {
    title = 'Omniscient God Gamer';
    rankBadge = '👑 Mythic Grandmaster';
  } else if (level >= 75) {
    title = 'Legendary Archon';
    rankBadge = '💎 Diamond Master';
  } else if (level >= 50) {
    title = 'Cyber Champion';
    rankBadge = '⚡ Platinum Ace';
  } else if (level >= 30) {
    title = 'Tactical Strategist';
    rankBadge = '🛡️ Gold Elite';
  } else if (level >= 15) {
    title = 'Arcade Specialist';
    rankBadge = '⚔️ Silver Veteran';
  } else if (level >= 5) {
    title = 'Skilled Challenger';
    rankBadge = '🥈 Iron Warrior';
  }

  return {
    level,
    title,
    currentXP: xp,
    xpForCurrentLevel,
    xpForNextLevel,
    progressPercent,
    rankBadge,
  };
}

// Default seeded sessions so a new player already has realistic baseline engagement
const SEEDED_INITIAL_HISTORY: GameSessionLog[] = [
  {
    id: 'seed-1',
    gameId: 'GAME-001',
    gameName: 'Snake',
    category: 'Arcade Games',
    score: 1420,
    highScore: 1420,
    durationSeconds: 184,
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    outcome: 'game_over',
    accuracy: 94,
  },
  {
    id: 'seed-2',
    gameId: 'GAME-002',
    gameName: 'Pong',
    category: 'Arcade Games',
    score: 11,
    highScore: 11,
    durationSeconds: 210,
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    outcome: 'victory',
    accuracy: 91,
  },
  {
    id: 'seed-3',
    gameId: 'GAME-086',
    gameName: '2048',
    category: 'Puzzle Games',
    score: 3840,
    highScore: 3840,
    durationSeconds: 340,
    timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
    outcome: 'completed',
    accuracy: 98,
  },
  {
    id: 'seed-4',
    gameId: 'GAME-201',
    gameName: 'First-Person Shooter',
    category: '3D Shooter Games',
    score: 2850,
    highScore: 2850,
    durationSeconds: 290,
    timestamp: Date.now() - 1000 * 60 * 10, // 10 mins ago
    outcome: 'victory',
    accuracy: 87,
  }
];

export const useGameHistoryStore = create<GameHistoryState>()(
  persist(
    (set, get) => ({
      history: SEEDED_INITIAL_HISTORY,
      favorites: ['GAME-001', 'GAME-086', 'GAME-187', 'GAME-201', 'GAME-232', 'GAME-407'],
      recentGameIds: ['GAME-201', 'GAME-086', 'GAME-002', 'GAME-001'],
      lastPlayedSession: SEEDED_INITIAL_HISTORY[SEEDED_INITIAL_HISTORY.length - 1],
      highScores: {
        'GAME-001': 1420,
        'GAME-002': 11,
        'GAME-086': 3840,
        'GAME-201': 2850,
      },

      recordGameSession: (sessionData) => {
        const { history, highScores, recentGameIds } = get();
        const currentHigh = highScores[sessionData.gameId] || 0;
        const newHighScore = Math.max(currentHigh, sessionData.score);
        
        const newLog: GameSessionLog = {
          ...sessionData,
          id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: Date.now(),
          highScore: newHighScore,
        };

        const updatedHistory = [newLog, ...history];
        const updatedHighScores = {
          ...highScores,
          [sessionData.gameId]: newHighScore,
        };

        const updatedRecents = [
          sessionData.gameId,
          ...recentGameIds.filter(id => id !== sessionData.gameId)
        ].slice(0, 30);

        set({
          history: updatedHistory,
          highScores: updatedHighScores,
          recentGameIds: updatedRecents,
          lastPlayedSession: newLog,
        });

        return newLog;
      },

      toggleFavorite: (gameId: string) => {
        const { favorites } = get();
        if (favorites.includes(gameId)) {
          set({ favorites: favorites.filter(id => id !== gameId) });
        } else {
          set({ favorites: [...favorites, gameId] });
        }
      },

      isFavorite: (gameId: string) => {
        return get().favorites.includes(gameId);
      },

      getHighScore: (gameId: string) => {
        return get().highScores[gameId] || 0;
      },

      getGameHistory: (gameId: string) => {
        return get().history.filter(h => h.gameId === gameId);
      },

      getPlayerStats: () => {
        const { history } = get();
        const uniqueGames = new Set(history.map(h => h.gameId));
        let totalScore = 0;
        let highestSingleScore = 0;
        let highestScoringGame = 'None';
        let totalPlayTimeSeconds = 0;
        let totalWins = 0;

        history.forEach(session => {
          totalScore += session.score;
          totalPlayTimeSeconds += session.durationSeconds || 0;
          if (session.outcome === 'victory' || session.outcome === 'completed') {
            totalWins++;
          }
          if (session.score > highestSingleScore) {
            highestSingleScore = session.score;
            highestScoringGame = `${session.gameName} (${session.gameId})`;
          }
        });

        return {
          totalGamesPlayed: history.length,
          uniqueGamesPlayed: uniqueGames.size,
          totalScore,
          highestSingleScore,
          highestScoringGame,
          totalPlayTimeSeconds,
          totalWins,
          currentStreak: Math.min(history.length, 7),
          longestStreak: Math.max(history.length, 12),
        };
      },

      getPlayerLevel: () => {
        const stats = get().getPlayerStats();
        // XP Formula:
        // 150 XP per session + 300 XP per unique game + 1 XP per 5 score points + 1 XP per 3 seconds played
        const baseSessionXP = stats.totalGamesPlayed * 150;
        const uniqueBonusXP = stats.uniqueGamesPlayed * 300;
        const scoreXP = Math.floor(stats.totalScore / 5);
        const timeXP = Math.floor(stats.totalPlayTimeSeconds / 3);
        const totalXP = baseSessionXP + uniqueBonusXP + scoreXP + timeXP;

        return calculateLevelFromXP(totalXP);
      },

      getUserGamingProfileSummary: () => {
        const stats = get().getPlayerStats();
        const level = get().getPlayerLevel();
        const last = get().lastPlayedSession;
        const topGames = Object.entries(get().highScores)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id, score]) => `${id}: ${score} pts`)
          .join(', ');

        const playTimeMin = Math.round(stats.totalPlayTimeSeconds / 60);

        return `🎮 **Player Gaming Profile & Level Summary**:
• **Player Level**: Level ${level.level} — "${level.title}" (${level.rankBadge})
• **Current Experience**: ${level.currentXP.toLocaleString()} XP (${level.progressPercent}% towards Level ${level.level + 1})
• **Total Games Played**: ${stats.totalGamesPlayed} matches across ${stats.uniqueGamesPlayed} distinct games
• **Total Score Accumulated**: ${stats.totalScore.toLocaleString()} points
• **High Score Record**: ${stats.highestSingleScore.toLocaleString()} pts in ${stats.highestScoringGame}
• **Total Play Time**: ${playTimeMin} minutes
• **Victory Rate**: ${stats.totalGamesPlayed > 0 ? Math.round((stats.totalWins / stats.totalGamesPlayed) * 100) : 0}%
• **Last Played Game**: ${last ? `${last.gameName} (${last.gameId}) with score ${last.score}` : 'None'}
• **Top High Scores**: ${topGames || 'None'}`;
      },

      clearHistory: () => {
        set({
          history: [],
          highScores: {},
          recentGameIds: [],
          lastPlayedSession: null,
        });
      },
    }),
    {
      name: 'enterprise-game-hub-history',
    }
  )
);
