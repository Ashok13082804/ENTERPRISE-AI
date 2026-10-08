// Puzzle & Match-3 Gems Engine
import { GameRecord } from '@/data/gameDatabase';
import { soundManager } from './SoundManager';

interface PuzzleEngineOptions {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  game: GameRecord;
  width: number;
  height: number;
  activeKeys: Set<string>;
  scoreRef: React.MutableRefObject<number>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  isPlayingRef: React.MutableRefObject<boolean>;
  isPausedRef: React.MutableRefObject<boolean>;
  gameOverRef: React.MutableRefObject<boolean>;
  handleEndGame: (finalScore: number, outcome: 'victory' | 'game_over' | 'completed', message: string) => void;
}

export function startPuzzleEngine({
  canvas,
  ctx,
  game,
  width,
  height,
  activeKeys,
  scoreRef,
  setScore,
  isPlayingRef,
  isPausedRef,
  gameOverRef,
  handleEndGame,
}: PuzzleEngineOptions) {
  // 8x8 Gem Match-3 Grid
  const gridSize = 8;
  const gemColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7'];
  const gemSize = 44;
  const boardW = gridSize * gemSize;
  const boardH = gridSize * gemSize;
  const startX = (width - boardW) / 2;
  const startY = (height - boardH) / 2;

  let grid: number[][] = [];
  for (let r = 0; r < gridSize; r++) {
    grid[r] = [];
    for (let c = 0; c < gridSize; c++) {
      grid[r][c] = Math.floor(Math.random() * gemColors.length);
    }
  }

  let selectedGem: { r: number; c: number } | null = null;
  let matchesFound = 0;
  let movesLeft = 20;

  // Swap gems
  const swapGems = (r1: number, c1: number, r2: number, c2: number) => {
    const temp = grid[r1][c1];
    grid[r1][c1] = grid[r2][c2];
    grid[r2][c2] = temp;

    const matched = checkAndClearMatches();
    if (!matched) {
      // Revert if no match
      setTimeout(() => {
        grid[r2][c2] = grid[r1][c1];
        grid[r1][c1] = temp;
      }, 200);
    } else {
      movesLeft--;
      soundManager.playScore();
      if (movesLeft <= 0) {
        handleEndGame(scoreRef.current, 'completed', `Puzzle Match Finished! Final Score: ${scoreRef.current}`);
      }
    }
  };

  const checkAndClearMatches = () => {
    let hasMatch = false;
    const toClear: boolean[][] = Array(gridSize).fill(false).map(() => Array(gridSize).fill(false));

    // Horizontal
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize - 2; c++) {
        const val = grid[r][c];
        if (val !== -1 && val === grid[r][c + 1] && val === grid[r][c + 2]) {
          toClear[r][c] = true;
          toClear[r][c + 1] = true;
          toClear[r][c + 2] = true;
          hasMatch = true;
        }
      }
    }

    // Vertical
    for (let c = 0; c < gridSize; c++) {
      for (let r = 0; r < gridSize - 2; r++) {
        const val = grid[r][c];
        if (val !== -1 && val === grid[r + 1][c] && val === grid[r + 2][c]) {
          toClear[r][c] = true;
          toClear[r + 1][c] = true;
          toClear[r + 2][c] = true;
          hasMatch = true;
        }
      }
    }

    if (hasMatch) {
      let count = 0;
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (toClear[r][c]) {
            grid[r][c] = Math.floor(Math.random() * gemColors.length); // Drop new gem
            count++;
          }
        }
      }
      setScore(s => s + count * 60);
      matchesFound += count;
    }

    return hasMatch;
  };

  const onPointerDown = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (width / rect.width);
    const cy = (e.clientY - rect.top) * (height / rect.height);

    const c = Math.floor((cx - startX) / gemSize);
    const r = Math.floor((cy - startY) / gemSize);

    if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
      if (!selectedGem) {
        selectedGem = { r, c };
        soundManager.playJump();
      } else {
        const dr = Math.abs(selectedGem.r - r);
        const dc = Math.abs(selectedGem.c - c);
        if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
          swapGems(selectedGem.r, selectedGem.c, r, c);
        }
        selectedGem = null;
      }
    }
  };
  canvas.addEventListener('pointerdown', onPointerDown);

  let animationFrameId: number | null = null;

  const loop = () => {
    if (!isPlayingRef.current) return;
    if (!isPausedRef.current && !gameOverRef.current) {
      // -------------------------------------------------------------
      // RENDER PUZZLE GEMS
      // -------------------------------------------------------------
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, width, height);

      // Board Frame
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(startX - 12, startY - 12, boardW + 24, boardH + 24, 16);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gems
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const gx = startX + c * gemSize + gemSize / 2;
          const gy = startY + r * gemSize + gemSize / 2;
          const isSelected = selectedGem && selectedGem.r === r && selectedGem.c === c;

          const color = gemColors[grid[r][c]];
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = isSelected ? 18 : 8;

          // Faceted gem diamond / octagon
          ctx.beginPath();
          ctx.arc(gx, gy, isSelected ? 18 : 15, 0, Math.PI * 2);
          ctx.fill();

          // Highlight facet
          ctx.fillStyle = '#ffffff66';
          ctx.beginPath();
          ctx.arc(gx - 4, gy - 4, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // HUD
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`MOVES LEFT: ${movesLeft}  ·  MATCHES: ${matchesFound}`, 20, 30);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('Click & Swap Adjacent Jewels to Align 3 of the Same Color!', 20, 50);
    }
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}
