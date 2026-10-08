// Fruit Ninja Blade Slash Physics Engine
import { GameRecord } from '@/data/gameDatabase';
import { soundManager } from './SoundManager';

interface FruitNinjaEngineOptions {
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

export function startFruitNinjaEngine({
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
}: FruitNinjaEngineOptions) {
  interface Fruit {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    type: 'watermelon' | 'orange' | 'banana' | 'strawberry' | 'bomb';
    color: string;
    sliced: boolean;
    rotation: number;
    vRot: number;
  }

  interface Splatter {
    x: number;
    y: number;
    color: string;
    radius: number;
    alpha: number;
  }

  interface BladePoint {
    x: number;
    y: number;
    time: number;
  }

  let fruits: Fruit[] = [];
  let fruitIdCounter = 0;
  let splatters: Splatter[] = [];
  let bladeTrail: BladePoint[] = [];
  let isPointerDown = false;
  let lives = 3;
  let spawnTimer = 0;

  const fruitTypes: { type: 'watermelon' | 'orange' | 'banana' | 'strawberry' | 'bomb'; color: string; radius: number }[] = [
    { type: 'watermelon', color: '#10b981', radius: 28 },
    { type: 'orange', color: '#f97316', radius: 22 },
    { type: 'banana', color: '#facc15', radius: 24 },
    { type: 'strawberry', color: '#ef4444', radius: 18 },
    { type: 'bomb', color: '#1e293b', radius: 20 },
  ];

  const spawnFruitWave = () => {
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const typeDef = Math.random() < 0.15 ? fruitTypes[4] : fruitTypes[Math.floor(Math.random() * 4)];
      const startX = 150 + Math.random() * (width - 300);
      const angle = (Math.PI / 2) + (Math.random() - 0.5) * 0.5;
      const speed = 12 + Math.random() * 4;

      fruits.push({
        id: fruitIdCounter++,
        x: startX,
        y: height + 30,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed,
        radius: typeDef.radius,
        type: typeDef.type,
        color: typeDef.color,
        sliced: false,
        rotation: 0,
        vRot: (Math.random() - 0.5) * 0.1,
      });
    }
  };

  // Slicing logic
  const checkSlice = (p1: BladePoint, p2: BladePoint) => {
    fruits.forEach(f => {
      if (f.sliced) return;
      const dist = distToSegment(f, p1, p2);
      if (dist < f.radius + 8) {
        f.sliced = true;
        if (f.type === 'bomb') {
          soundManager.playExplosion();
          handleEndGame(scoreRef.current, 'game_over', '💥 Bomb Sliced! Game Over!');
          return;
        } else {
          soundManager.playScore();
          setScore(s => s + 50);

          // Spawn juice splatter
          for (let sp = 0; sp < 12; sp++) {
            splatters.push({
              x: f.x + (Math.random() - 0.5) * 20,
              y: f.y + (Math.random() - 0.5) * 20,
              color: f.color,
              radius: 4 + Math.random() * 8,
              alpha: 0.9,
            });
          }
        }
      }
    });
  };

  const onPointerDown = (e: PointerEvent) => {
    isPointerDown = true;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (width / rect.width);
    const y = (e.clientY - rect.top) * (height / rect.height);
    bladeTrail.push({ x, y, time: Date.now() });
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isPointerDown) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (width / rect.width);
    const y = (e.clientY - rect.top) * (height / rect.height);

    const now = Date.now();
    const newPoint = { x, y, time: now };
    if (bladeTrail.length > 0) {
      checkSlice(bladeTrail[bladeTrail.length - 1], newPoint);
    }
    bladeTrail.push(newPoint);
  };

  const onPointerUp = () => {
    isPointerDown = false;
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  let animationFrameId: number | null = null;
  const gravity = 0.28;

  const loop = () => {
    if (!isPlayingRef.current) return;
    if (!isPausedRef.current && !gameOverRef.current) {
      spawnTimer++;
      if (spawnTimer % 65 === 0) {
        spawnFruitWave();
      }

      // Update trail age
      const now = Date.now();
      bladeTrail = bladeTrail.filter(p => now - p.time < 120);

      // Update splatters
      splatters.forEach(s => {
        s.alpha -= 0.005;
      });
      splatters = splatters.filter(s => s.alpha > 0);

      // Update fruits
      for (let i = fruits.length - 1; i >= 0; i--) {
        const f = fruits[i];
        f.vy += gravity;
        f.x += f.vx;
        f.y += f.vy;
        f.rotation += f.vRot;

        // Dropped off bottom
        if (f.y > height + 60 && f.vy > 0) {
          if (!f.sliced && f.type !== 'bomb') {
            lives--;
            soundManager.playHit();
            if (lives <= 0) {
              handleEndGame(scoreRef.current, 'game_over', '💥 3 Fruits Missed! Dojo Training Ended!');
              return;
            }
          }
          fruits.splice(i, 1);
        }
      }

      // -------------------------------------------------------------
      // RENDER FRUIT NINJA
      // -------------------------------------------------------------
      // Wood Cutting Board Background
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, 450);
      bgGrad.addColorStop(0, '#2b1b17');
      bgGrad.addColorStop(1, '#150d0a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Splatters on Wood
      splatters.forEach(s => {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Fruits
      fruits.forEach(f => {
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);

        if (f.type === 'bomb') {
          ctx.fillStyle = '#0f172a';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
          ctx.fill();
          // Fuse
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, -f.radius);
          ctx.lineTo(6, -f.radius - 8);
          ctx.stroke();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(6, -f.radius - 8, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (f.sliced) {
          // Halved Fruit
          ctx.fillStyle = f.color;
          ctx.beginPath();
          ctx.arc(-8, 0, f.radius * 0.85, 0, Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(8, 0, f.radius * 0.85, Math.PI, 0);
          ctx.fill();
        } else {
          // Whole Fruit
          ctx.fillStyle = f.color;
          ctx.shadowColor = f.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
          ctx.fill();

          // Fruit core shine
          ctx.fillStyle = '#ffffff66';
          ctx.beginPath();
          ctx.arc(-f.radius * 0.3, -f.radius * 0.3, f.radius * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        ctx.shadowBlur = 0;
      });

      // Katana Neon Blade Trail
      if (bladeTrail.length > 1) {
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bladeTrail[0].x, bladeTrail[0].y);
        for (let t = 1; t < bladeTrail.length; t++) {
          ctx.lineTo(bladeTrail[t].x, bladeTrail[t].y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // HUD
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`LIVES: ${'❤️ '.repeat(lives)}`, 20, 30);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('Drag / Swipe to Slice Fruits!', 20, 50);
    }
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}

function distToSegment(p: { x: number; y: number }, v: { x: number; y: number }, w: { x: number; y: number }) {
  const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}
