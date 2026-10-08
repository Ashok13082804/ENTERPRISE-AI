import { GAME_DATABASE, GameRecord, getGameById } from '@/data/gameDatabase';

/**
 * Searches the 432 Game Database to find a game mentioned in a user's prompt.
 * Matches by explicit ID (e.g. GAME-001, GAME-86, game 5) or by game name/slug.
 */
export function findGameInQuery(query: string): GameRecord | null {
  if (!query) return null;
  const q = query.trim().toLowerCase();

  // 1. Direct ID match (e.g., "GAME-001", "game 86", "game-154")
  const idMatch = q.match(/game[\s-_]*([0-9]{1,3})/i);
  if (idMatch && idMatch[1]) {
    const num = parseInt(idMatch[1], 10);
    const formattedId = `GAME-${num.toString().padStart(3, '0')}`;
    const found = getGameById(formattedId);
    if (found) return found;
  }

  // 2. Exact or close name match against the 432 games
  // Sort by name length descending so longer titles (e.g. "Space Invaders") match before "Space"
  const sortedGames = [...GAME_DATABASE].sort((a, b) => b.name.length - a.name.length);
  for (const game of sortedGames) {
    const nameLower = game.name.toLowerCase();
    // Check if the query contains the full game name as a word or phrase
    if (q.includes(nameLower)) {
      return game;
    }
  }

  // 3. Fallback: match by gameplay category
  for (const game of GAME_DATABASE) {
    if (game.gameplayCategory && q.includes(game.gameplayCategory.replace('_', ' '))) {
      return game;
    }
  }

  return null;
}

/**
 * Checks if the user is asking for instructions, rules, manual, or how to play.
 */
export function isHowToPlayQuery(query: string): boolean {
  return /how (to|do I|can I) play|instructions?|rules?|user manual|manual|controls?|how it works|guide|how do you play/i.test(query);
}

/**
 * Generates an exhaustive, beautifully structured markdown manual for AI Chat response.
 */
export function formatGameManualMarkdown(game: GameRecord): string {
  const m = game.manual;
  const controls = game.controls;

  const stepsFormatted = m.howToPlay.map((step, idx) => `${idx + 1}. **${step}**`).join('\n');
  const rulesFormatted = m.rules.map(rule => `- ⚖️ ${rule}`).join('\n');
  const proTipsFormatted = m.proTips.map(tip => `- 💡 ${tip}`).join('\n');
  const featuresFormatted = game.features.map(f => `- ✨ ${f}`).join('\n');

  return `### 📖 User Manual & How-to-Play Guide: **${game.name}** (\`${game.id}\`)

> **${game.description}**

---

### 🕹️ Game Specifications
| Attribute | Detail |
| :--- | :--- |
| **Game ID** | \`${game.id}\` (Game #${game.numericId} of 432) |
| **Category** | **${game.category}** · *${game.subcategory}* |
| **Engine / Dimension** | **${game.type}** (${game.engine}) |
| **Difficulty Level** | **${game.difficulty}** |
| **Special Modes** | ${game.is_ai ? '🤖 AI Opponent ' : ''}${game.is_multiplayer ? '👥 2-Player Local ' : ''}⭐ Solo Arcade |

---

### 🎯 Objective
**${game.objective}**

---

### 🚀 How to Play (Step-by-Step)
${stepsFormatted}

---

### ⚖️ Official Rules & Mechanics
${rulesFormatted}

---

### 🎮 Controls & Input Scheme
- **Keyboard Controls:**
${controls.keys.map(k => `  - \`[${k.key}]\`: ${k.action}`).join('\n')}
- **On-Screen Interactive Gamepad:**
  - Directional D-Pad: \`[▲ UP]\`, \`[▼ DOWN]\`, \`[◄ LEFT]\`, \`[► RIGHT]\`
  - Action Triggers: \`[🔥 ACTION / FIRE / JUMP]\` and \`[⚡ BOOST]\`
  - Session Controls: \`[📖 MANUAL]\`, \`[⏸ PAUSE]\`, \`[🔄 RESTART]\`
- **Mouse / Touch:** ${controls.mouse || controls.touch || 'Full touch & click interactive interface'}

---

### 🏆 Scoring Formula & Win Condition
- **Scoring System:** ${m.scoringSystem}
- **Winning Condition:** ${m.winCondition}

---

### 💡 Pro Tips & Advanced Strategies
${proTipsFormatted}

---

### ✨ Engine Features
${featuresFormatted}

---
🎮 **Ready to play now?** Click the button or navigate to \`/game-hub/${game.id.toLowerCase()}\` to jump straight into the arena!`;
}
