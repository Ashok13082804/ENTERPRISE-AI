// Vertical Hopper & Doodle Jump Engine
import { GameRecord } from '@/data/gameDatabase';
import { soundManager } from './SoundManager';

interface DoodleJumpEngineOptions {
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

export function startDoodleJumpEngine({
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
}: DoodleJumpEngineOptions) {
  // Player
  let playerX = width / 2;
  let playerY = height - 120;
  let playerVy = -10;
  const gravity = 0.28;
  const bouncePower = -11.5;
  const playerRadius = 16;
  let cameraY = 0;
  let highestScore = 0;

  // Platforms
  interface Platform {
    x: number;
    y: number;
    w: number;
    h: number;
    type: 'static' | 'moving' | 'spring';
    vx?: number;
  }

  let platforms: Platform[] = [];
  for (let i = 0; i < 15; i++) {
    platforms.push({
      x: 180 + Math.random() * (width - 360),
      y: height - i * 65 - 40,
      w: 80,
      h: 14,
      type: i % 4 === 0 ? 'moving' : i % 7 === 0 ? 'spring' : 'static',
      vx: 1.8,
    });
  }

  let animationFrameId: number | null = null;

  const loop = () => {
    if (!isPlayingRef.current) return;
    if (!isPausedRef.current && !gameOverRef.current) {
      const keys = activeKeys;

      // Horizontal steer
      if (keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('a')) {
        playerX -= 6.5;
      }
      if (keys.has('ArrowRight') || keys.has('KeyD') || keys.has('d')) {
        playerX += 6.5;
      }

      // Screen wrapping
      if (playerX < 0) playerX = width;
      if (playerX > width) playerX = 0;

      // Physics
      playerVy += gravity;
      playerY += playerVy;

      // Camera scroll upward
      if (playerY < height * 0.45 && playerVy < 0) {
        const scrollDelta = -playerVy;
        playerY += scrollDelta;
        cameraY += scrollDelta;

        platforms.forEach(p => {
          p.y += scrollDelta;
        });

        const currentScore = Math.floor(cameraY);
        if (currentScore > highestScore) {
          highestScore = currentScore;
          setScore(highestScore);
        }

        // Recycle offscreen platforms
        platforms.forEach(p => {
          if (p.y > height + 20) {
            p.y = -20;
            p.x = 180 + Math.random() * (width - 360);
            p.type = Math.random() < 0.25 ? 'moving' : Math.random() < 0.15 ? 'spring' : 'static';
          }
        });
      }

      // Moving platforms update
      platforms.forEach(p => {
        if (p.type === 'moving' && p.vx) {
          p.x += p.vx;
          if (p.x < 140 || p.x + p.w > width - 140) p.vx *= -1;
        }

        // Bounce collision check while falling
        if (
          playerVy > 0 &&
          playerX + playerRadius > p.x &&
          playerX - playerRadius < p.x + p.w &&
          playerY + playerRadius >= p.y &&
          playerY + playerRadius <= p.y + p.h + 8
        ) {
          if (p.type === 'spring') {
            playerVy = bouncePower * 1.6;
            soundManager.playScore();
          } else {
            playerVy = bouncePower;
            soundManager.playJump();
          }
        }
      });

      // Fall off bottom check
      if (playerY > height + 40) {
        soundManager.playHit();
        handleEndGame(scoreRef.current, 'game_over', `💥 Fell off the stage! Highest Altitude: ${scoreRef.current}`);
        return;
      }

      // -------------------------------------------------------------
      // RENDER DOODLE JUMP
      // -------------------------------------------------------------
      // Notebook grid background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Vertical guide lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }

      // Platforms
      platforms.forEach(p => {
        ctx.fillStyle = p.type === 'spring' ? '#f59e0b' : p.type === 'moving' ? '#38bdf8' : '#10b981';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, p.h, 6);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Spring icon
        if (p.type === 'spring') {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x + p.w / 2 - 8, p.y);
          ctx.lineTo(p.x + p.w / 2, p.y - 6);
          ctx.lineTo(p.x + p.w / 2 + 8, p.y);
          ctx.stroke();
        }
      });

      // Player Hopper Mascot
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(playerX, playerY, playerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Snout / Nose & Eyes
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(playerX + (playerVy < 0 ? -4 : 4), playerY - 4, 3, 0, Math.PI * 2);
      ctx.fill();

      // HUD
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`ALTITUDE: ${highestScore}m`, 20, 30);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('Steer Left/Right with [A]/[D] or Arrow Keys · Bounce to the Sky!', 20, 50);
    }
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}
