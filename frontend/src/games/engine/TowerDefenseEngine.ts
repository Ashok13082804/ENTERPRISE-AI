// Tactical Tower Defense & Strategy Engine
import { GameRecord } from '@/data/gameDatabase';
import { soundManager } from './SoundManager';

interface TowerDefenseEngineOptions {
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

export function startTowerDefenseEngine({
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
}: TowerDefenseEngineOptions) {
  // Winding path waypoints
  const path = [
    { x: 0, y: 150 },
    { x: 220, y: 150 },
    { x: 220, y: 350 },
    { x: 480, y: 350 },
    { x: 480, y: 180 },
    { x: 700, y: 180 },
    { x: 700, y: 450 },
    { x: width, y: 450 },
  ];

  // Turret building spots
  interface TurretSlot {
    x: number;
    y: number;
    hasTurret: boolean;
    type?: 'laser' | 'cannon';
    level: number;
    range: number;
    damage: number;
    cooldown: number;
    lastShot: number;
    targetAngle: number;
  }

  const slots: TurretSlot[] = [
    { x: 120, y: 220, hasTurret: true, type: 'laser', level: 1, range: 130, damage: 15, cooldown: 18, lastShot: 0, targetAngle: 0 },
    { x: 300, y: 280, hasTurret: false, level: 1, range: 130, damage: 15, cooldown: 18, lastShot: 0, targetAngle: 0 },
    { x: 390, y: 240, hasTurret: true, type: 'cannon', level: 1, range: 160, damage: 35, cooldown: 45, lastShot: 0, targetAngle: 0 },
    { x: 590, y: 270, hasTurret: false, level: 1, range: 130, damage: 15, cooldown: 18, lastShot: 0, targetAngle: 0 },
    { x: 620, y: 100, hasTurret: false, level: 1, range: 130, damage: 15, cooldown: 18, lastShot: 0, targetAngle: 0 },
  ];

  // Creep enemies
  interface Creep {
    x: number;
    y: number;
    pathIndex: number;
    speed: number;
    hp: number;
    maxHp: number;
    reward: number;
    color: string;
  }

  let creeps: Creep[] = [];
  let baseHp = 100;
  let gold = 150;
  let wave = 1;
  let spawnTimer = 0;
  let creepsInWave = 12;
  let creepsSpawned = 0;

  // Projectiles
  let projectiles: { x: number; y: number; tx: number; ty: number; speed: number; damage: number; color: string }[] = [];

  const onPointerDown = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (width / rect.width);
    const cy = (e.clientY - rect.top) * (height / rect.height);

    slots.forEach(s => {
      if (Math.hypot(cx - s.x, cy - s.y) < 28) {
        if (!s.hasTurret && gold >= 50) {
          gold -= 50;
          s.hasTurret = true;
          s.type = Math.random() < 0.5 ? 'laser' : 'cannon';
          soundManager.playScore();
        } else if (s.hasTurret && gold >= 30) {
          gold -= 30;
          s.level++;
          s.damage += 10;
          soundManager.playJump();
        }
      }
    });
  };
  canvas.addEventListener('pointerdown', onPointerDown);

  let animationFrameId: number | null = null;

  const loop = () => {
    if (!isPlayingRef.current) return;
    if (!isPausedRef.current && !gameOverRef.current) {
      // Spawn Creeps
      spawnTimer++;
      if (spawnTimer % 40 === 0 && creepsSpawned < creepsInWave) {
        creepsSpawned++;
        creeps.push({
          x: path[0].x,
          y: path[0].y,
          pathIndex: 0,
          speed: 1.6 + wave * 0.2,
          hp: 40 + wave * 25,
          maxHp: 40 + wave * 25,
          reward: 20,
          color: wave % 2 === 0 ? '#ec4899' : '#a855f7',
        });
      }

      // Update Creeps
      for (let i = creeps.length - 1; i >= 0; i--) {
        const c = creeps[i];
        const targetPoint = path[c.pathIndex + 1];

        if (!targetPoint) {
          // Reached Base!
          baseHp -= 15;
          creeps.splice(i, 1);
          soundManager.playHit();
          if (baseHp <= 0) {
            handleEndGame(scoreRef.current, 'game_over', '💥 Crystal Base Overrun by invaders!');
            return;
          }
          continue;
        }

        const dx = targetPoint.x - c.x;
        const dy = targetPoint.y - c.y;
        const dist = Math.hypot(dx, dy);

        if (dist < c.speed) {
          c.pathIndex++;
        } else {
          c.x += (dx / dist) * c.speed;
          c.y += (dy / dist) * c.speed;
        }

        // Check if dead
        if (c.hp <= 0) {
          creeps.splice(i, 1);
          gold += c.reward;
          setScore(s => s + c.reward * 5);
          soundManager.playScore();
        }
      }

      // Check wave progression
      if (creepsSpawned >= creepsInWave && creeps.length === 0) {
        wave++;
        creepsSpawned = 0;
        creepsInWave += 5;
        gold += 80;
        soundManager.playWin();
        if (wave > 5) {
          handleEndGame(scoreRef.current + 2000, 'victory', `🏆 All Strategic Waves Defended! Score: ${scoreRef.current + 2000}`);
          return;
        }
      }

      // Update Turrets & Firing
      slots.forEach(s => {
        if (!s.hasTurret) return;
        s.lastShot++;

        // Find nearest creep in range
        let nearestCreep: Creep | null = null;
        let minDist = s.range;

        creeps.forEach(c => {
          const d = Math.hypot(c.x - s.x, c.y - s.y);
          if (d < minDist) {
            minDist = d;
            nearestCreep = c;
          }
        });

        if (nearestCreep) {
          const target = nearestCreep as Creep;
          s.targetAngle = Math.atan2(target.y - s.y, target.x - s.x);

          if (s.lastShot >= s.cooldown) {
            s.lastShot = 0;
            target.hp -= s.damage;
            soundManager.playShoot();

            // Projectile beam
            projectiles.push({
              x: s.x,
              y: s.y,
              tx: target.x,
              ty: target.y,
              speed: 12,
              damage: s.damage,
              color: s.type === 'laser' ? '#06b6d4' : '#f59e0b',
            });
          }
        }
      });

      // Update Projectiles
      projectiles.forEach(p => {
        p.speed -= 2;
      });
      projectiles = projectiles.filter(p => p.speed > 0);

      // -------------------------------------------------------------
      // RENDER TOWER DEFENSE
      // -------------------------------------------------------------
      // Terrain
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Path Road
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 42;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let pt = 1; pt < path.length; pt++) {
        ctx.lineTo(path[pt].x, path[pt].y);
      }
      ctx.stroke();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 36;
      ctx.stroke();

      // Projectiles / Laser Beams
      projectiles.forEach(p => {
        ctx.strokeStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.tx, p.ty);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Turret Build Slots
      slots.forEach(s => {
        ctx.fillStyle = s.hasTurret ? '#1e293b' : '#334155';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (s.hasTurret) {
          // Turret Barrel
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.targetAngle);

          ctx.fillStyle = s.type === 'laser' ? '#06b6d4' : '#f59e0b';
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 8;
          ctx.fillRect(0, -5, 24, 10);

          // Turret Core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
          ctx.shadowBlur = 0;

          // Level tag
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`LV${s.level}`, s.x, s.y + 32);
        } else {
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('+50G', s.x, s.y + 4);
        }
      });

      // Creeps
      creeps.forEach(c => {
        ctx.fillStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Health Bar
        const barW = 22;
        const hpPercent = Math.max(0, c.hp / c.maxHp);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(c.x - barW / 2, c.y - 18, barW, 4);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(c.x - barW / 2, c.y - 18, barW * hpPercent, 4);
      });

      // Base Crystal (Destination)
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(width - 40, 450, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // HUD
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`GOLD: ${gold}G  ·  BASE HP: ${baseHp}%  ·  WAVE: ${wave}/5`, 20, 30);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText('Click Slots to Build Turrets (50G) or Upgrade (30G)', 20, 50);
    }
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}
