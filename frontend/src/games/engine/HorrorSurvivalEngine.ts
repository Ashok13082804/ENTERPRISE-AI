// Horror & Zombie Flashlight Survival Engine
import { GameRecord } from '@/data/gameDatabase';
import { soundManager } from './SoundManager';

interface HorrorSurvivalEngineOptions {
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

export function startHorrorSurvivalEngine({
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
}: HorrorSurvivalEngineOptions) {
  // Survivor
  let playerX = width / 2;
  let playerY = height / 2;
  let playerAngle = 0;
  let playerHp = 100;
  let ammo = 36;
  const speed = 4.2;

  // Bullets
  let bullets: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
  let lastShootTime = 0;

  // Zombies / Monsters
  interface Zombie {
    x: number;
    y: number;
    speed: number;
    hp: number;
    color: string;
  }
  let zombies: Zombie[] = [];
  let spawnTimer = 0;
  let surviveSeconds = 45;
  let timerInterval: number | null = null;

  // Mouse aim
  const onPointerMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (width / rect.width);
    const my = (e.clientY - rect.top) * (height / rect.height);
    playerAngle = Math.atan2(my - playerY, mx - playerX);
  };

  const shoot = () => {
    const now = Date.now();
    if (now - lastShootTime < 180) return;
    lastShootTime = now;

    if (ammo > 0) {
      ammo--;
      soundManager.playShoot();
      bullets.push({
        x: playerX + Math.cos(playerAngle) * 16,
        y: playerY + Math.sin(playerAngle) * 16,
        vx: Math.cos(playerAngle) * 14,
        vy: Math.sin(playerAngle) * 14,
        life: 45,
      });
    } else {
      soundManager.playHit();
    }
  };

  const onPointerDown = () => {
    shoot();
  };

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerdown', onPointerDown);

  // Survival countdown
  timerInterval = window.setInterval(() => {
    if (!isPlayingRef.current || isPausedRef.current || gameOverRef.current) return;
    surviveSeconds--;
    if (surviveSeconds <= 0) {
      soundManager.playWin();
      handleEndGame(scoreRef.current + 2000, 'victory', `🏆 Survived the Horror Night in ${game.name}! Score: ${scoreRef.current + 2000}`);
    }
  }, 1000);

  let animationFrameId: number | null = null;

  const loop = () => {
    if (!isPlayingRef.current) return;
    if (!isPausedRef.current && !gameOverRef.current) {
      const keys = activeKeys;

      // 8-way movement
      if (keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('a')) playerX = Math.max(30, playerX - speed);
      if (keys.has('ArrowRight') || keys.has('KeyD') || keys.has('d')) playerX = Math.min(width - 30, playerX + speed);
      if (keys.has('ArrowUp') || keys.has('KeyW') || keys.has('w')) playerY = Math.max(30, playerY - speed);
      if (keys.has('ArrowDown') || keys.has('KeyS') || keys.has('s')) playerY = Math.min(height - 30, playerY + speed);

      if (keys.has('Space') || keys.has(' ')) shoot();

      // Spawn Zombies from dark borders
      spawnTimer++;
      if (spawnTimer % 35 === 0 && zombies.length < 24) {
        const edge = Math.floor(Math.random() * 4);
        let zx = 0;
        let zy = 0;
        if (edge === 0) { zx = Math.random() * width; zy = -20; }
        else if (edge === 1) { zx = width + 20; zy = Math.random() * height; }
        else if (edge === 2) { zx = Math.random() * width; zy = height + 20; }
        else { zx = -20; zy = Math.random() * height; }

        zombies.push({
          x: zx,
          y: zy,
          speed: 1.4 + Math.random() * 1.2,
          hp: 2,
          color: '#15803d',
        });
      }

      // Update Bullets
      for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
        const b = bullets[bIdx];
        b.x += b.vx;
        b.y += b.vy;
        b.life--;

        if (b.life <= 0) {
          bullets.splice(bIdx, 1);
          continue;
        }

        // Bullet vs Zombie
        for (let zIdx = zombies.length - 1; zIdx >= 0; zIdx--) {
          const z = zombies[zIdx];
          if (Math.hypot(b.x - z.x, b.y - z.y) < 18) {
            bullets.splice(bIdx, 1);
            z.hp--;
            soundManager.playHit();
            if (z.hp <= 0) {
              zombies.splice(zIdx, 1);
              setScore(s => s + 100);
              // Ammo drop
              if (Math.random() < 0.25) ammo = Math.min(60, ammo + 6);
            }
            break;
          }
        }
      }

      // Update Zombies
      for (let zIdx = zombies.length - 1; zIdx >= 0; zIdx--) {
        const z = zombies[zIdx];
        const angle = Math.atan2(playerY - z.y, playerX - z.x);
        z.x += Math.cos(angle) * z.speed;
        z.y += Math.sin(angle) * z.speed;

        // Player damage
        if (Math.hypot(playerX - z.x, playerY - z.y) < 22) {
          playerHp -= 0.6;
          if (playerHp <= 0) {
            soundManager.playHit();
            handleEndGame(scoreRef.current, 'game_over', '💥 Mauled by the undead horde!');
            return;
          }
        }
      }

      // -------------------------------------------------------------
      // RENDER HORROR SURVIVAL
      // -------------------------------------------------------------
      // Dark Wood Floor
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      // Floor Planks
      ctx.strokeStyle = '#14141f';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Bullets
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;
      bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Zombies
      zombies.forEach(z => {
        ctx.fillStyle = z.color;
        ctx.beginPath();
        ctx.arc(z.x, z.y, 11, 0, Math.PI * 2);
        ctx.fill();

        // Glowing red eyes
        const zAngle = Math.atan2(playerY - z.y, playerX - z.x);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(z.x + Math.cos(zAngle + 0.3) * 6, z.y + Math.sin(zAngle + 0.3) * 6, 2, 0, Math.PI * 2);
        ctx.arc(z.x + Math.cos(zAngle - 0.3) * 6, z.y + Math.sin(zAngle - 0.3) * 6, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Survivor Avatar
      ctx.save();
      ctx.translate(playerX, playerY);
      ctx.rotate(playerAngle);

      // Gun
      ctx.fillStyle = '#64748b';
      ctx.fillRect(8, 2, 12, 4);

      // Body
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // DYNAMIC REAL-TIME FLASHLIGHT CONE & DARKNESS MASK
      ctx.save();
      const darknessCanvas = document.createElement('canvas');
      darknessCanvas.width = width;
      darknessCanvas.height = height;
      const dCtx = darknessCanvas.getContext('2d');
      if (dCtx) {
        // Fill darkness
        dCtx.fillStyle = 'rgba(3, 4, 8, 0.94)';
        dCtx.fillRect(0, 0, width, height);

        // Cut out Flashlight Cone
        dCtx.globalCompositeOperation = 'destination-out';
        const flashGrad = dCtx.createRadialGradient(playerX, playerY, 15, playerX, playerY, 260);
        flashGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        flashGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.7)');
        flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        dCtx.fillStyle = flashGrad;
        dCtx.beginPath();
        dCtx.moveTo(playerX, playerY);
        dCtx.arc(playerX, playerY, 260, playerAngle - 0.55, playerAngle + 0.55);
        dCtx.closePath();
        dCtx.fill();

        // Ambient glow around player
        dCtx.beginPath();
        dCtx.arc(playerX, playerY, 40, 0, Math.PI * 2);
        dCtx.fill();

        ctx.drawImage(darknessCanvas, 0, 0);
      }
      ctx.restore();

      // HUD
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`HEALTH: ${Math.max(0, Math.round(playerHp))}%  ·  AMMO: ${ammo} RDS  ·  TIME UNTIL DAWN: ${surviveSeconds}s`, 20, 30);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('Aim with Mouse/Touch · Move with WASD/Arrows · Click / Space to Shoot', 20, 50);
    }
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerdown', onPointerDown);
    if (timerInterval) clearInterval(timerInterval);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}
