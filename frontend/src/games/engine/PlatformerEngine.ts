// 2D Side-Scrolling Platformer & Adventure Engine
import { GameRecord } from '@/data/gameDatabase';
import { soundManager } from './SoundManager';

interface PlatformerEngineOptions {
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

export function startPlatformerEngine({
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
}: PlatformerEngineOptions) {
  // Player
  const player = {
    x: 80,
    y: height - 120,
    vx: 0,
    vy: 0,
    w: 26,
    h: 36,
    isGrounded: false,
    speed: 5.5,
    jumpPower: -12.5,
    facing: 1,
  };

  const gravity = 0.58;

  // Platforms
  const platforms = [
    { x: 0, y: height - 40, w: width, h: 40, type: 'ground' },
    { x: 180, y: height - 120, w: 120, h: 18, type: 'brick' },
    { x: 360, y: height - 190, w: 140, h: 18, type: 'brick' },
    { x: 220, y: height - 260, w: 100, h: 18, type: 'brick' },
    { x: 550, y: height - 140, w: 130, h: 18, type: 'brick' },
    { x: 670, y: height - 230, w: 110, h: 18, type: 'brick' },
  ];

  // Coins / Collectibles
  let coins = [
    { x: 230, y: height - 150, collected: false },
    { x: 420, y: height - 220, collected: false },
    { x: 270, y: height - 290, collected: false },
    { x: 610, y: height - 170, collected: false },
    { x: 720, y: height - 260, collected: false },
    { x: 480, y: height - 70, collected: false },
  ];

  // Patrolling Enemies
  let enemies = [
    { x: 380, y: height - 215, w: 24, h: 24, vx: 1.5, minX: 360, maxX: 480, alive: true },
    { x: 580, y: height - 165, w: 24, h: 24, vx: -1.5, minX: 550, maxX: 660, alive: true },
    { x: 300, y: height - 64, w: 24, h: 24, vx: 2, minX: 180, maxX: 600, alive: true },
  ];

  // Flagpole goal
  const goal = { x: width - 70, y: height - 230, w: 12, h: 190 };

  const jump = () => {
    if (player.isGrounded) {
      player.vy = player.jumpPower;
      player.isGrounded = false;
      soundManager.playJump();
    }
  };

  const onPointerDown = () => {
    jump();
  };
  canvas.addEventListener('pointerdown', onPointerDown);

  let animationFrameId: number | null = null;

  const loop = () => {
    if (!isPlayingRef.current) return;
    if (!isPausedRef.current && !gameOverRef.current) {
      const keys = activeKeys;

      // Left/Right
      if (keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('a')) {
        player.vx = -player.speed;
        player.facing = -1;
      } else if (keys.has('ArrowRight') || keys.has('KeyD') || keys.has('d')) {
        player.vx = player.speed;
        player.facing = 1;
      } else {
        player.vx *= 0.75;
      }

      // Jump
      if (keys.has('ArrowUp') || keys.has('KeyW') || keys.has('w') || keys.has('Space')) {
        jump();
      }

      // Apply Gravity
      player.vy += gravity;
      player.x += player.vx;
      player.y += player.vy;

      // Platform Collisions
      player.isGrounded = false;
      platforms.forEach(p => {
        if (
          player.x + player.w > p.x &&
          player.x < p.x + p.w &&
          player.y + player.h >= p.y &&
          player.y + player.h <= p.y + p.h + 12 &&
          player.vy >= 0
        ) {
          player.y = p.y - player.h;
          player.vy = 0;
          player.isGrounded = true;
        }
      });

      // Bounds
      player.x = Math.max(10, Math.min(width - player.w - 10, player.x));

      // Collect Coins
      coins.forEach(c => {
        if (!c.collected && Math.hypot(player.x + player.w / 2 - c.x, player.y + player.h / 2 - c.y) < 24) {
          c.collected = true;
          soundManager.playScore();
          setScore(s => s + 100);
        }
      });

      // Update Enemies
      enemies.forEach(e => {
        if (!e.alive) return;
        e.x += e.vx;
        if (e.x < e.minX || e.x > e.maxX) e.vx *= -1;

        // Player collision
        if (
          player.x + player.w > e.x &&
          player.x < e.x + e.w &&
          player.y + player.h > e.y &&
          player.y < e.y + e.h
        ) {
          // Stomp on top
          if (player.vy > 1 && player.y + player.h < e.y + 16) {
            e.alive = false;
            player.vy = -8;
            soundManager.playScore();
            setScore(s => s + 250);
          } else {
            soundManager.playHit();
            handleEndGame(scoreRef.current, 'game_over', '💥 Defeated by stage monster!');
            return;
          }
        }
      });

      // Reach Goal Flag
      if (player.x + player.w >= goal.x && player.y + player.h >= goal.y) {
        soundManager.playWin();
        handleEndGame(scoreRef.current + 1500, 'victory', `🏆 Level Completed for ${game.name}! Final Score: ${scoreRef.current + 1500}`);
        return;
      }

      // -------------------------------------------------------------
      // RENDER PLATFORMER
      // -------------------------------------------------------------
      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.7, '#1e293b');
      skyGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant mountains / clouds
      ctx.fillStyle = '#1e293b66';
      ctx.beginPath();
      ctx.moveTo(40, height - 40);
      ctx.lineTo(160, height - 180);
      ctx.lineTo(280, height - 40);
      ctx.moveTo(340, height - 40);
      ctx.lineTo(500, height - 220);
      ctx.lineTo(660, height - 40);
      ctx.fill();

      // Platforms
      platforms.forEach(p => {
        if (p.type === 'ground') {
          ctx.fillStyle = '#15803d';
          ctx.fillRect(p.x, p.y, p.w, 8);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(p.x, p.y + 8, p.w, p.h - 8);
        } else {
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.roundRect(p.x, p.y, p.w, p.h, 6);
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Coins
      coins.forEach(c => {
        if (!c.collected) {
          ctx.fillStyle = '#facc15';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Enemies
      enemies.forEach(e => {
        if (!e.alive) return;
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(e.x, e.y, e.w, e.h, 6);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(e.x + (e.vx > 0 ? 16 : 8), e.y + 8, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Goal Flagpole
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(goal.x + goal.w, goal.y);
      ctx.lineTo(goal.x + goal.w + 35, goal.y + 20);
      ctx.lineTo(goal.x + goal.w, goal.y + 40);
      ctx.fill();

      // Player Avatar
      ctx.save();
      ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
      ctx.scale(player.facing, 1);

      // Body
      ctx.fillStyle = '#3b82f6';
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-player.w / 2, -player.h / 2, player.w, player.h, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Head / Visor
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, -player.h / 2 + 4, 10, 8);

      ctx.restore();

      // Controls HUD
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Move: [A]/[D] or Arrows · Jump: [W] / [Space] / Click · Stomp on Monsters!', 20, 25);
    }
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}
