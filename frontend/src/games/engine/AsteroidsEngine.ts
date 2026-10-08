// Classic Vector Space Asteroids Engine
import { GameRecord } from '@/data/gameDatabase';
import { soundManager } from './SoundManager';

interface AsteroidsEngineOptions {
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

export function startAsteroidsEngine({
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
}: AsteroidsEngineOptions) {
  // Ship
  const ship = {
    x: width / 2,
    y: height / 2,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    rotationSpeed: 0.08,
    thrust: 0.18,
    friction: 0.985,
    radius: 14,
    invincibleTimer: 60,
  };

  let lasers: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
  let lastShootTime = 0;

  // Asteroid type
  interface Asteroid {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    size: 'large' | 'medium' | 'small';
    vertices: { x: number; y: number }[];
  }

  let asteroids: Asteroid[] = [];
  let particles: { x: number; y: number; vx: number; vy: number; color: string; life: number }[] = [];
  let lives = 3;

  const createAsteroidVertices = (radius: number) => {
    const numVerts = 10 + Math.floor(Math.random() * 5);
    const verts = [];
    for (let i = 0; i < numVerts; i++) {
      const angle = (i / numVerts) * Math.PI * 2;
      const r = radius * (0.75 + Math.random() * 0.45);
      verts.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }
    return verts;
  };

  // Spawn initial large asteroids
  for (let i = 0; i < 6; i++) {
    let ax = Math.random() * width;
    let ay = Math.random() * height;
    if (Math.hypot(ax - width / 2, ay - height / 2) < 160) {
      ax = 50;
    }
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.0 + Math.random() * 1.5;
    asteroids.push({
      x: ax,
      y: ay,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 40,
      size: 'large',
      vertices: createAsteroidVertices(40),
    });
  }

  const fireLaser = () => {
    const now = Date.now();
    if (now - lastShootTime < 160) return;
    lastShootTime = now;

    const tipX = ship.x + Math.cos(ship.angle) * 18;
    const tipY = ship.y + Math.sin(ship.angle) * 18;
    const laserSpeed = 12;

    lasers.push({
      x: tipX,
      y: tipY,
      vx: Math.cos(ship.angle) * laserSpeed + ship.vx * 0.3,
      vy: Math.sin(ship.angle) * laserSpeed + ship.vy * 0.3,
      life: 55,
    });
    soundManager.playShoot();
  };

  const handlePointerDown = (e: PointerEvent) => {
    fireLaser();
  };
  canvas.addEventListener('pointerdown', handlePointerDown);

  let animationFrameId: number | null = null;

  const loop = () => {
    if (!isPlayingRef.current) return;
    if (!isPausedRef.current && !gameOverRef.current) {
      const keys = activeKeys;

      // Rotate
      if (keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('a')) {
        ship.angle -= ship.rotationSpeed;
      }
      if (keys.has('ArrowRight') || keys.has('KeyD') || keys.has('d')) {
        ship.angle += ship.rotationSpeed;
      }

      // Thrust
      const isThrusting = keys.has('ArrowUp') || keys.has('KeyW') || keys.has('w');
      if (isThrusting) {
        ship.vx += Math.cos(ship.angle) * ship.thrust;
        ship.vy += Math.sin(ship.angle) * ship.thrust;

        // Exhaust particles
        particles.push({
          x: ship.x - Math.cos(ship.angle) * 14 + (Math.random() - 0.5) * 4,
          y: ship.y - Math.sin(ship.angle) * 14 + (Math.random() - 0.5) * 4,
          vx: -Math.cos(ship.angle) * (3 + Math.random() * 3) + (Math.random() - 0.5) * 2,
          vy: -Math.sin(ship.angle) * (3 + Math.random() * 3) + (Math.random() - 0.5) * 2,
          color: '#38bdf8',
          life: 0.6,
        });
      }

      // Shoot
      if (keys.has('Space') || keys.has(' ')) {
        fireLaser();
      }

      // Apply physics to ship
      ship.vx *= ship.friction;
      ship.vy *= ship.friction;
      ship.x += ship.vx;
      ship.y += ship.vy;

      // Screen wrapping for ship
      if (ship.x < 0) ship.x = width;
      if (ship.x > width) ship.x = 0;
      if (ship.y < 0) ship.y = height;
      if (ship.y > height) ship.y = 0;

      if (ship.invincibleTimer > 0) ship.invincibleTimer--;

      // Update lasers
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i];
        l.x += l.vx;
        l.y += l.vy;
        l.life--;

        // Screen wrap
        if (l.x < 0) l.x = width;
        if (l.x > width) l.x = 0;
        if (l.y < 0) l.y = height;
        if (l.y > height) l.y = 0;

        if (l.life <= 0) {
          lasers.splice(i, 1);
          continue;
        }

        // Collision with asteroids
        for (let aIdx = asteroids.length - 1; aIdx >= 0; aIdx--) {
          const a = asteroids[aIdx];
          if (Math.hypot(l.x - a.x, l.y - a.y) < a.radius) {
            lasers.splice(i, 1);
            asteroids.splice(aIdx, 1);
            soundManager.playExplosion();

            // Spawn explosion particles
            for (let p = 0; p < 16; p++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 1.5 + Math.random() * 4;
              particles.push({
                x: a.x,
                y: a.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                color: '#cbd5e1',
                life: 0.8,
              });
            }

            // Split asteroid
            if (a.size === 'large') {
              setScore(s => s + 50);
              for (let s = 0; s < 2; s++) {
                const ang = Math.random() * Math.PI * 2;
                asteroids.push({
                  x: a.x,
                  y: a.y,
                  vx: Math.cos(ang) * 2.2,
                  vy: Math.sin(ang) * 2.2,
                  radius: 24,
                  size: 'medium',
                  vertices: createAsteroidVertices(24),
                });
              }
            } else if (a.size === 'medium') {
              setScore(s => s + 100);
              for (let s = 0; s < 2; s++) {
                const ang = Math.random() * Math.PI * 2;
                asteroids.push({
                  x: a.x,
                  y: a.y,
                  vx: Math.cos(ang) * 3.2,
                  vy: Math.sin(ang) * 3.2,
                  radius: 14,
                  size: 'small',
                  vertices: createAsteroidVertices(14),
                });
              }
            } else {
              setScore(s => s + 200);
            }

            // Check wave cleared
            if (asteroids.length === 0) {
              setScore(s => s + 1000);
              soundManager.playWin();
              handleEndGame(scoreRef.current + 1000, 'victory', `🏆 Asteroid Sector Cleared! Score: ${scoreRef.current + 1000}`);
              return;
            }
            break;
          }
        }
      }

      // Update Asteroids
      asteroids.forEach(a => {
        a.x += a.vx;
        a.y += a.vy;

        // Screen wrap
        if (a.x < -a.radius) a.x = width + a.radius;
        if (a.x > width + a.radius) a.x = -a.radius;
        if (a.y < -a.radius) a.y = height + a.radius;
        if (a.y > height + a.radius) a.y = -a.radius;

        // Ship Collision
        if (ship.invincibleTimer === 0 && Math.hypot(ship.x - a.x, ship.y - a.y) < ship.radius + a.radius * 0.75) {
          soundManager.playHit();
          lives--;
          if (lives > 0) {
            ship.x = width / 2;
            ship.y = height / 2;
            ship.vx = 0;
            ship.vy = 0;
            ship.invincibleTimer = 90;
          } else {
            handleEndGame(scoreRef.current, 'game_over', '💥 Ship destroyed by asteroid impact!');
            return;
          }
        }
      });

      // Update particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
      });
      particles = particles.filter(p => p.life > 0);

      // -------------------------------------------------------------
      // RENDER ASTEROIDS
      // -------------------------------------------------------------
      ctx.fillStyle = '#050711';
      ctx.fillRect(0, 0, width, height);

      // Starfield background
      ctx.fillStyle = '#ffffff33';
      for (let s = 0; s < 45; s++) {
        const sx = ((s * 97) % width);
        const sy = ((s * 151) % height);
        ctx.fillRect(sx, sy, (s % 3 === 0) ? 2 : 1, (s % 3 === 0) ? 2 : 1);
      }

      // Particles
      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Asteroids
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#64748b';
      ctx.shadowBlur = 8;
      asteroids.forEach(a => {
        ctx.beginPath();
        ctx.moveTo(a.x + a.vertices[0].x, a.y + a.vertices[0].y);
        for (let i = 1; i < a.vertices.length; i++) {
          ctx.lineTo(a.x + a.vertices[i].x, a.y + a.vertices[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.stroke();
      });
      ctx.shadowBlur = 0;

      // Lasers
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      lasers.forEach(l => {
        ctx.beginPath();
        ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Player Ship
      if (ship.invincibleTimer % 8 < 5) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-14, -12);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-14, 12);
        ctx.closePath();
        ctx.fillStyle = '#0369a1';
        ctx.fill();
        ctx.stroke();

        // Cockpit
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(2, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0;
      }

      // HUD: Lives & Asteroids Left
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`SHIPS: ${'▲ '.repeat(lives)}`, 20, 30);
      ctx.fillText(`ASTEROIDS: ${asteroids.length}`, 20, 50);
    }
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    canvas.removeEventListener('pointerdown', handlePointerDown);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}
