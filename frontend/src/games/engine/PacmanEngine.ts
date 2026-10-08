// Neon Maze & Pacman Engine
import { GameRecord } from '@/data/gameDatabase';
import { soundManager } from './SoundManager';

interface PacmanEngineOptions {
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

export function startPacmanEngine({
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
}: PacmanEngineOptions) {
  // 19x15 Tile Grid
  const cols = 20;
  const rows = 12;
  const tileSize = 36;
  const offsetX = (width - cols * tileSize) / 2;
  const offsetY = (height - rows * tileSize) / 2;

  // 1 = Wall, 0 = Pellet, 2 = Power Pellet, 3 = Empty / Ghost House
  const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,2,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,0,1,1,3,3,1,1,0,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,1,3,3,3,3,1,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,0,1,1,1,1,1,1,0,0,1,0,1,0,1],
    [1,0,1,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,0,0,0,1,0,1,1,1,0,1],
    [1,2,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  // Player Pacman
  let pacX = 1;
  let pacY = 1;
  let pacDirX = 0;
  let pacDirY = 0;
  let nextDirX = 0;
  let nextDirY = 0;
  let mouthAngle = 0.2;
  let mouthDir = 1;
  let lives = 3;

  // Ghosts
  const ghosts = [
    { x: 9, y: 5, color: '#ef4444', dirX: 1, dirY: 0, scared: false, name: 'Blinky' },
    { x: 10, y: 5, color: '#ec4899', dirX: -1, dirY: 0, scared: false, name: 'Pinky' },
    { x: 9, y: 6, color: '#06b6d4', dirX: 0, dirY: -1, scared: false, name: 'Inky' },
    { x: 10, y: 6, color: '#f59e0b', dirX: 0, dirY: 1, scared: false, name: 'Clyde' },
  ];

  let scaredTimer = 0;
  let lastMoveTime = 0;
  let moveInterval = 140;

  let totalPellets = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (maze[r][c] === 0 || maze[r][c] === 2) totalPellets++;
    }
  }

  let animationFrameId: number | null = null;

  const loop = (timestamp: number) => {
    if (!isPlayingRef.current) return;
    if (!isPausedRef.current && !gameOverRef.current) {
      const keys = activeKeys;

      // Handle Direction changes
      if (keys.has('ArrowUp') || keys.has('KeyW') || keys.has('w')) {
        nextDirX = 0; nextDirY = -1;
      } else if (keys.has('ArrowDown') || keys.has('KeyS') || keys.has('s')) {
        nextDirX = 0; nextDirY = 1;
      } else if (keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('a')) {
        nextDirX = -1; nextDirY = 0;
      } else if (keys.has('ArrowRight') || keys.has('KeyD') || keys.has('d')) {
        nextDirX = 1; nextDirY = 0;
      }

      if (scaredTimer > 0) scaredTimer--;

      if (timestamp - lastMoveTime > moveInterval) {
        lastMoveTime = timestamp;

        // Try to apply next direction if valid
        const nextNx = pacX + nextDirX;
        const nextNy = pacY + nextDirY;
        if (nextNx >= 0 && nextNx < cols && nextNy >= 0 && nextNy < rows && maze[nextNy][nextNx] !== 1) {
          pacDirX = nextDirX;
          pacDirY = nextDirY;
        }

        // Move Pacman
        const nx = pacX + pacDirX;
        const ny = pacY + pacDirY;
        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] !== 1) {
          pacX = nx;
          pacY = ny;

          // Eat Pellet
          if (maze[pacY][pacX] === 0) {
            maze[pacY][pacX] = 3;
            soundManager.playScore();
            setScore(s => s + 10);
            totalPellets--;
          } else if (maze[pacY][pacX] === 2) {
            maze[pacY][pacX] = 3;
            soundManager.playScore();
            setScore(s => s + 50);
            scaredTimer = 50;
            soundManager.playWin();
            totalPellets--;
          }

          if (totalPellets <= 0) {
            handleEndGame(scoreRef.current + 1000, 'victory', `🏆 Maze Mastered! All Pellets Consumed! Score: ${scoreRef.current + 1000}`);
            return;
          }
        }

        // Animate mouth
        mouthAngle += 0.1 * mouthDir;
        if (mouthAngle > 0.45 || mouthAngle < 0.05) mouthDir *= -1;

        // Move Ghosts (Simple AI: choose valid corridor direction)
        ghosts.forEach(g => {
          const dirs = [
            { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
          ];
          // Filter valid moves
          const validDirs = dirs.filter(d => {
            const gx = g.x + d.x;
            const gy = g.y + d.y;
            return gx >= 0 && gx < cols && gy >= 0 && gy < rows && maze[gy][gx] !== 1 && !(d.x === -g.dirX && d.y === -g.dirY);
          });

          if (validDirs.length > 0) {
            // Pick direction closest to pacman if not scared, or random
            if (scaredTimer === 0 && Math.random() < 0.6) {
              validDirs.sort((a, b) => {
                const distA = Math.hypot(g.x + a.x - pacX, g.y + a.y - pacY);
                const distB = Math.hypot(g.x + b.x - pacX, g.y + b.y - pacY);
                return distA - distB;
              });
              g.dirX = validDirs[0].x;
              g.dirY = validDirs[0].y;
            } else {
              const pick = validDirs[Math.floor(Math.random() * validDirs.length)];
              g.dirX = pick.x;
              g.dirY = pick.y;
            }
          } else {
            g.dirX = -g.dirX;
            g.dirY = -g.dirY;
          }

          g.x += g.dirX;
          g.y += g.dirY;

          // Ghost collision with Pacman
          if (g.x === pacX && g.y === pacY) {
            if (scaredTimer > 0) {
              // Ghost eaten
              g.x = 9;
              g.y = 5;
              soundManager.playScore();
              setScore(s => s + 200);
            } else {
              soundManager.playHit();
              lives--;
              if (lives > 0) {
                pacX = 1;
                pacY = 1;
                pacDirX = 0;
                pacDirY = 0;
              } else {
                handleEndGame(scoreRef.current, 'game_over', '💥 Caught by ghost in the labyrinth!');
                return;
              }
            }
          }
        });
      }

      // -------------------------------------------------------------
      // RENDER PAC-MAN MAZE
      // -------------------------------------------------------------
      ctx.fillStyle = '#050711';
      ctx.fillRect(0, 0, width, height);

      // Draw Maze Tiles
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cellX = offsetX + c * tileSize;
          const cellY = offsetY + r * tileSize;

          if (maze[r][c] === 1) {
            // Neon Blue Wall
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(cellX, cellY, tileSize, tileSize);
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#3b82f6';
            ctx.shadowBlur = 8;
            ctx.strokeRect(cellX + 2, cellY + 2, tileSize - 4, tileSize - 4);
            ctx.shadowBlur = 0;
          } else if (maze[r][c] === 0) {
            // Pellet
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(cellX + tileSize / 2, cellY + tileSize / 2, 3.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (maze[r][c] === 2) {
            // Power Pellet (Pulsing)
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(cellX + tileSize / 2, cellY + tileSize / 2, 7 + Math.sin(timestamp * 0.008) * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Draw Pac-Man
      const pacPixelX = offsetX + pacX * tileSize + tileSize / 2;
      const pacPixelY = offsetY + pacY * tileSize + tileSize / 2;

      let rotation = 0;
      if (pacDirX === 1) rotation = 0;
      else if (pacDirX === -1) rotation = Math.PI;
      else if (pacDirY === 1) rotation = Math.PI / 2;
      else if (pacDirY === -1) rotation = -Math.PI / 2;

      ctx.save();
      ctx.translate(pacPixelX, pacPixelY);
      ctx.rotate(rotation);
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 14, mouthAngle * Math.PI, (2 - mouthAngle) * Math.PI);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.shadowBlur = 0;

      // Draw Ghosts
      ghosts.forEach(g => {
        const gx = offsetX + g.x * tileSize + tileSize / 2;
        const gy = offsetY + g.y * tileSize + tileSize / 2;
        const gColor = (scaredTimer > 0 && (scaredTimer > 15 || Math.floor(scaredTimer / 2) % 2 === 0)) ? '#38bdf8' : g.color;

        ctx.fillStyle = gColor;
        ctx.shadowColor = gColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(gx, gy - 2, 13, Math.PI, 0, false);
        ctx.lineTo(gx + 13, gy + 12);
        // Tentacles
        ctx.lineTo(gx + 6, gy + 8);
        ctx.lineTo(gx, gy + 12);
        ctx.lineTo(gx - 6, gy + 8);
        ctx.lineTo(gx - 13, gy + 12);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(gx - 4, gy - 3, 3.5, 0, Math.PI * 2);
        ctx.arc(gx + 4, gy - 3, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(gx - 4 + g.dirX * 1.5, gy - 3 + g.dirY * 1.5, 1.8, 0, Math.PI * 2);
        ctx.arc(gx + 4 + g.dirX * 1.5, gy - 3 + g.dirY * 1.5, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // HUD
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`LIVES: ${'● '.repeat(lives)}`, 20, 25);
      if (scaredTimer > 0) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`POWER TIME: ${Math.ceil(scaredTimer / 5)}s`, 120, 25);
      }
    }
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}
