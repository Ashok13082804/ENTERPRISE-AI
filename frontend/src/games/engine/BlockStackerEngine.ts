// Tetris Block Stacker & Building Engine
import { GameRecord } from '@/data/gameDatabase';
import { soundManager } from './SoundManager';

interface BlockStackerEngineOptions {
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

export function startBlockStackerEngine({
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
}: BlockStackerEngineOptions) {
  // 10 cols x 18 rows
  const cols = 10;
  const rows = 18;
  const blockSize = 24;
  const boardW = cols * blockSize;
  const boardH = rows * blockSize;
  const startX = (width - boardW) / 2;
  const startY = (height - boardH) / 2;

  // Shapes
  const shapes = [
    { matrix: [[1, 1, 1, 1]], color: '#06b6d4' }, // I
    { matrix: [[1, 1], [1, 1]], color: '#facc15' }, // O
    { matrix: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' }, // T
    { matrix: [[1, 0, 0], [1, 1, 1]], color: '#f97316' }, // L
    { matrix: [[0, 0, 1], [1, 1, 1]], color: '#3b82f6' }, // J
    { matrix: [[0, 1, 1], [1, 1, 0]], color: '#10b981' }, // S
    { matrix: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' }, // Z
  ];

  let board: string[][] = Array(rows).fill(null).map(() => Array(cols).fill(''));

  let currentPiece = getRandomPiece();
  let pieceX = 3;
  let pieceY = 0;
  let dropInterval = 650;
  let lastDropTime = 0;
  let linesCleared = 0;

  function getRandomPiece() {
    const s = shapes[Math.floor(Math.random() * shapes.length)];
    return { matrix: s.matrix, color: s.color };
  }

  const collide = (mat: number[][], px: number, py: number) => {
    for (let r = 0; r < mat.length; r++) {
      for (let c = 0; c < mat[r].length; c++) {
        if (mat[r][c] !== 0) {
          const bx = px + c;
          const by = py + r;
          if (bx < 0 || bx >= cols || by >= rows || (by >= 0 && board[by][bx] !== '')) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotate = (mat: number[][]) => {
    return mat[0].map((_, index) => mat.map(row => row[index]).reverse());
  };

  const mergePiece = () => {
    for (let r = 0; r < currentPiece.matrix.length; r++) {
      for (let c = 0; c < currentPiece.matrix[r].length; c++) {
        if (currentPiece.matrix[r][c] !== 0) {
          if (pieceY + r < 0) {
            handleEndGame(scoreRef.current, 'game_over', '💥 Blocks reached the top! Game Over!');
            return;
          }
          board[pieceY + r][pieceX + c] = currentPiece.color;
        }
      }
    }

    // Check line clears
    let cleared = 0;
    for (let r = rows - 1; r >= 0; r--) {
      if (board[r].every(cell => cell !== '')) {
        board.splice(r, 1);
        board.unshift(Array(cols).fill(''));
        cleared++;
        r++;
      }
    }

    if (cleared > 0) {
      soundManager.playScore();
      linesCleared += cleared;
      setScore(s => s + cleared * 150);
      if (linesCleared >= 10) {
        handleEndGame(scoreRef.current + 1000, 'victory', `🏆 Master Architect! 10 Lines Cleared for ${game.name}!`);
        return;
      }
    }

    currentPiece = getRandomPiece();
    pieceX = 3;
    pieceY = 0;

    if (collide(currentPiece.matrix, pieceX, pieceY)) {
      handleEndGame(scoreRef.current, 'game_over', '💥 Grid Overfilled! Game Over!');
    }
  };

  let lastInputTime = 0;
  const onKeyDown = (e: KeyboardEvent) => {
    const now = Date.now();
    if (now - lastInputTime < 80) return;

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.code === 'KeyA') {
      if (!collide(currentPiece.matrix, pieceX - 1, pieceY)) {
        pieceX--;
        lastInputTime = now;
        soundManager.playMove();
      }
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.code === 'KeyD') {
      if (!collide(currentPiece.matrix, pieceX + 1, pieceY)) {
        pieceX++;
        lastInputTime = now;
        soundManager.playMove();
      }
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.code === 'KeyW') {
      const rot = rotate(currentPiece.matrix);
      if (!collide(rot, pieceX, pieceY)) {
        currentPiece.matrix = rot;
        lastInputTime = now;
        soundManager.playJump();
      }
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.code === 'KeyS') {
      if (!collide(currentPiece.matrix, pieceX, pieceY + 1)) {
        pieceY++;
        lastInputTime = now;
      }
    } else if (e.code === 'Space' || e.key === ' ') {
      // Hard Drop
      while (!collide(currentPiece.matrix, pieceX, pieceY + 1)) {
        pieceY++;
      }
      mergePiece();
      lastInputTime = now;
      soundManager.playHit();
    }
  };
  window.addEventListener('keydown', onKeyDown);

  let animationFrameId: number | null = null;

  const loop = (timestamp: number) => {
    if (!isPlayingRef.current) return;
    if (!isPausedRef.current && !gameOverRef.current) {
      if (timestamp - lastDropTime > dropInterval) {
        lastDropTime = timestamp;
        if (!collide(currentPiece.matrix, pieceX, pieceY + 1)) {
          pieceY++;
        } else {
          mergePiece();
        }
      }

      // -------------------------------------------------------------
      // RENDER BLOCK STACKER
      // -------------------------------------------------------------
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Playfield Border
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(startX, startY, boardW, boardH);
      ctx.strokeStyle = '#38bdf844';
      ctx.lineWidth = 3;
      ctx.strokeRect(startX, startY, boardW, boardH);

      // Draw Grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath(); ctx.moveTo(startX, startY + r * blockSize); ctx.lineTo(startX + boardW, startY + r * blockSize); ctx.stroke();
      }
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath(); ctx.moveTo(startX + c * blockSize, startY); ctx.lineTo(startX + c * blockSize, startY + boardH); ctx.stroke();
      }

      // Fixed Board Blocks
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (board[r][c] !== '') {
            ctx.fillStyle = board[r][c];
            ctx.shadowColor = board[r][c];
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(startX + c * blockSize + 1, startY + r * blockSize + 1, blockSize - 2, blockSize - 2, 4);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Falling Current Piece
      for (let r = 0; r < currentPiece.matrix.length; r++) {
        for (let c = 0; c < currentPiece.matrix[r].length; c++) {
          if (currentPiece.matrix[r][c] !== 0) {
            ctx.fillStyle = currentPiece.color;
            ctx.shadowColor = currentPiece.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(
              startX + (pieceX + c) * blockSize + 1,
              startY + (pieceY + r) * blockSize + 1,
              blockSize - 2,
              blockSize - 2,
              4
            );
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // HUD
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`LINES CLEARED: ${linesCleared} / 10`, 20, 30);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('Move: [A]/[D] · Rotate: [W] / Up · Fast Drop: [S] · Hard Drop: [SPACE]', 20, 50);
    }
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}
