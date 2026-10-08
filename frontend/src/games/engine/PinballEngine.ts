// Kinetic Arcade Pinball Game Engine
import { GameRecord } from '@/data/gameDatabase';
import { soundManager } from './SoundManager';

interface PinballEngineOptions {
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

export function startPinballEngine({
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
}: PinballEngineOptions) {
  // Table dimensions & layout
  const tableX = 140;
  const tableW = width - 280; // 520px wide
  const tableH = height - 20;

  // Ball properties
  interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    trail: { x: number; y: number; alpha: number }[];
  }

  let balls: Ball[] = [
    { x: tableX + tableW - 35, y: tableH - 60, vx: 0, vy: -16, radius: 9, trail: [] }
  ];
  let ballsRemaining = 3;
  let plungerCharging = false;
  let plungerPower = 0;
  let multiballActive = false;

  // Flippers setup
  const flipperLength = 70;
  const leftFlipper = {
    x: tableX + tableW * 0.35,
    y: tableH - 65,
    angle: 0.45,
    baseAngle: 0.45,
    targetAngle: -0.5,
    active: false,
    speed: 0.28,
  };

  const rightFlipper = {
    x: tableX + tableW * 0.65,
    y: tableH - 65,
    angle: Math.PI - 0.45,
    baseAngle: Math.PI - 0.45,
    targetAngle: Math.PI + 0.5,
    active: false,
    speed: 0.28,
  };

  // Bumpers
  interface Bumper {
    x: number;
    y: number;
    radius: number;
    points: number;
    color: string;
    hitGlow: number;
  }

  const bumpers: Bumper[] = [
    { x: tableX + tableW * 0.5, y: 130, radius: 26, points: 250, color: '#f59e0b', hitGlow: 0 },
    { x: tableX + tableW * 0.35, y: 195, radius: 24, points: 150, color: '#ec4899', hitGlow: 0 },
    { x: tableX + tableW * 0.65, y: 195, radius: 24, points: 150, color: '#06b6d4', hitGlow: 0 },
    { x: tableX + tableW * 0.5, y: 260, radius: 20, points: 500, color: '#a855f7', hitGlow: 0 },
  ];

  // Slingshots (Triangular kickers)
  const slingshots = [
    { x1: tableX + 50, y1: tableH - 180, x2: tableX + 85, y2: tableH - 100, x3: tableX + 40, y3: tableH - 100, kickGlow: 0 },
    { x1: tableX + tableW - 85, y1: tableH - 180, x2: tableX + tableW - 50, y2: tableH - 100, x3: tableX + tableW - 40, y3: tableH - 100, kickGlow: 0 },
  ];

  // Top Rollover Lanes (A - B - C)
  const rollovers = [
    { x: tableX + tableW * 0.38, y: 65, w: 22, h: 28, lit: false, label: 'A' },
    { x: tableX + tableW * 0.50, y: 65, w: 22, h: 28, lit: false, label: 'B' },
    { x: tableX + tableW * 0.62, y: 65, w: 22, h: 28, lit: false, label: 'C' },
  ];

  // Drop targets (3 targets on upper left)
  const dropTargets = [
    { x: tableX + 25, y: 140, w: 12, h: 28, hit: false },
    { x: tableX + 25, y: 175, w: 12, h: 28, hit: false },
    { x: tableX + 25, y: 210, w: 12, h: 28, hit: false },
  ];

  // Particle effects
  let particles: { x: number; y: number; vx: number; vy: number; color: string; life: number }[] = [];

  const spawnParticles = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1.0,
      });
    }
  };

  // Launch plunger
  const launchPlunger = () => {
    if (balls.length === 0) {
      if (ballsRemaining > 0) {
        ballsRemaining--;
        balls.push({
          x: tableX + tableW - 35,
          y: tableH - 60,
          vx: 0,
          vy: -(14 + plungerPower * 0.15),
          radius: 9,
          trail: []
        });
        soundManager.playShoot();
      }
    } else {
      // Check if any ball is in plunger lane
      const laneBall = balls.find(b => b.x > tableX + tableW - 50 && b.y > tableH - 120);
      if (laneBall) {
        laneBall.vy = -(14 + plungerPower * 0.16);
        laneBall.vx = -1.5;
        soundManager.playShoot();
      }
    }
    plungerPower = 0;
    plungerCharging = false;
  };

  // Pointer / Click Controls
  const handlePointerDown = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (width / rect.width);
    const clickY = (e.clientY - rect.top) * (height / rect.height);

    if (clickX < width / 2) {
      leftFlipper.active = true;
      soundManager.playJump();
    } else if (clickX > tableX + tableW - 55 && clickY > tableH - 140) {
      plungerCharging = true;
    } else {
      rightFlipper.active = true;
      soundManager.playJump();
    }
  };

  const handlePointerUp = () => {
    leftFlipper.active = false;
    rightFlipper.active = false;
    if (plungerCharging) {
      launchPlunger();
    }
  };

  canvas.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointerup', handlePointerUp);

  let animationFrameId: number | null = null;
  const gravity = 0.22;

  const loop = () => {
    if (!isPlayingRef.current) return;
    if (!isPausedRef.current && !gameOverRef.current) {
      // Key input for flippers & plunger
      const keys = activeKeys;
      const leftActive = keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('a') || leftFlipper.active;
      const rightActive = keys.has('ArrowRight') || keys.has('KeyD') || keys.has('d') || rightFlipper.active;
      const plungerActive = keys.has('Space') || keys.has('ArrowDown') || keys.has('KeyS') || plungerCharging;

      // Charge plunger
      if (plungerActive) {
        plungerPower = Math.min(100, plungerPower + 3);
      } else if (plungerPower > 0) {
        launchPlunger();
      }

      // Animate left flipper
      if (leftActive) {
        leftFlipper.angle = Math.max(leftFlipper.targetAngle, leftFlipper.angle - leftFlipper.speed);
      } else {
        leftFlipper.angle = Math.min(leftFlipper.baseAngle, leftFlipper.angle + leftFlipper.speed);
      }

      // Animate right flipper
      if (rightActive) {
        rightFlipper.angle = Math.min(rightFlipper.targetAngle, rightFlipper.angle + rightFlipper.speed);
      } else {
        rightFlipper.angle = Math.max(rightFlipper.baseAngle, rightFlipper.angle - rightFlipper.speed);
      }

      // Update bumper glow
      bumpers.forEach(b => {
        if (b.hitGlow > 0) b.hitGlow -= 0.05;
      });

      // Update particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
      });
      particles = particles.filter(p => p.life > 0);

      // Process balls
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        b.vy += gravity;

        // Velocity drag
        b.vx *= 0.996;
        b.vy *= 0.996;

        b.x += b.vx;
        b.y += b.vy;

        // Trail
        b.trail.push({ x: b.x, y: b.y, alpha: 0.6 });
        if (b.trail.length > 7) b.trail.shift();
        b.trail.forEach(t => (t.alpha -= 0.08));

        // Table Outer Wall Collisions
        // Left wall
        if (b.x - b.radius < tableX + 15) {
          b.x = tableX + 15 + b.radius;
          b.vx = Math.abs(b.vx) * 0.75;
          soundManager.playHit();
        }
        // Right wall
        if (b.x + b.radius > tableX + tableW - 15) {
          b.x = tableX + tableW - 15 - b.radius;
          b.vx = -Math.abs(b.vx) * 0.75;
          soundManager.playHit();
        }
        // Top curved wall
        if (b.y - b.radius < 30) {
          b.y = 30 + b.radius;
          b.vy = Math.abs(b.vy) * 0.75;
          soundManager.playHit();
        }

        // Upper right arch guide (curved shooter alley exit into top)
        if (b.x > tableX + tableW - 55 && b.y < 90 && b.vy < 0) {
          b.vx = -4.5;
          b.vy = 2;
        }

        // Plunger lane wall separator
        if (b.x > tableX + tableW - 55 && b.y > 90 && b.y < tableH - 30) {
          if (b.x - b.radius < tableX + tableW - 55 && b.vx > 0) {
            b.x = tableX + tableW - 55 - b.radius;
            b.vx = -Math.abs(b.vx) * 0.8;
          }
        }

        // Bumper Collisions
        bumpers.forEach(bm => {
          const dx = b.x - bm.x;
          const dy = b.y - bm.y;
          const dist = Math.hypot(dx, dy);
          if (dist < b.radius + bm.radius) {
            const angle = Math.atan2(dy, dx);
            const bounceSpeed = 10;
            b.vx = Math.cos(angle) * bounceSpeed;
            b.vy = Math.sin(angle) * bounceSpeed;
            bm.hitGlow = 1.0;
            spawnParticles(bm.x, bm.y, bm.color, 14);
            soundManager.playScore();
            setScore(s => s + bm.points);
          }
        });

        // Slingshot Collisions
        slingshots.forEach(s => {
          const midX = (s.x1 + s.x2) / 2;
          const midY = (s.y1 + s.y2) / 2;
          if (Math.hypot(b.x - midX, b.y - midY) < 28) {
            b.vx *= -1.3;
            b.vy = -Math.abs(b.vy) - 4;
            s.kickGlow = 1.0;
            spawnParticles(midX, midY, '#38bdf8', 10);
            soundManager.playHit();
            setScore(s => s + 75);
          }
          if (s.kickGlow > 0) s.kickGlow -= 0.05;
        });

        // Top Rollover Lanes
        rollovers.forEach(r => {
          if (!r.lit && Math.abs(b.x - (r.x + r.w / 2)) < 16 && Math.abs(b.y - (r.y + r.h / 2)) < 16) {
            r.lit = true;
            spawnParticles(r.x + r.w / 2, r.y + r.h / 2, '#facc15', 8);
            soundManager.playScore();
            setScore(s => s + 200);

            // Multiball jackpot if all 3 lit
            if (rollovers.every(ro => ro.lit)) {
              rollovers.forEach(ro => (ro.lit = false));
              setScore(s => s + 1500);
              multiballActive = true;
              soundManager.playWin();
              if (balls.length < 3) {
                balls.push({
                  x: tableX + tableW * 0.5,
                  y: 100,
                  vx: (Math.random() - 0.5) * 8,
                  vy: -4,
                  radius: 9,
                  trail: []
                });
              }
            }
          }
        });

        // Drop Targets
        dropTargets.forEach(dt => {
          if (!dt.hit && Math.abs(b.x - (dt.x + dt.w / 2)) < b.radius + dt.w / 2 && Math.abs(b.y - (dt.y + dt.h / 2)) < b.radius + dt.h / 2) {
            dt.hit = true;
            b.vx = Math.abs(b.vx) * 0.8 + 2;
            spawnParticles(dt.x + dt.w / 2, dt.y + dt.h / 2, '#ef4444', 10);
            soundManager.playHit();
            setScore(s => s + 350);

            if (dropTargets.every(d => d.hit)) {
              setTimeout(() => dropTargets.forEach(d => (d.hit = false)), 1200);
              setScore(s => s + 1000);
              soundManager.playScore();
            }
          }
        });

        // Flipper Collisions
        // Left Flipper line segment
        const lfTipX = leftFlipper.x + Math.cos(leftFlipper.angle) * flipperLength;
        const lfTipY = leftFlipper.y + Math.sin(leftFlipper.angle) * flipperLength;
        const distL = distToSegment({ x: b.x, y: b.y }, { x: leftFlipper.x, y: leftFlipper.y }, { x: lfTipX, y: lfTipY });
        if (distL < b.radius + 6) {
          const flipperSpeedMultiplier = leftActive ? 1.6 : 0.8;
          b.vy = -(Math.abs(b.vy) * 0.7 + 7) * flipperSpeedMultiplier;
          b.vx += (leftActive ? 4 : 1.5);
          spawnParticles(b.x, b.y, '#38bdf8', 6);
          soundManager.playJump();
          setScore(s => s + 25);
        }

        // Right Flipper line segment
        const rfTipX = rightFlipper.x + Math.cos(rightFlipper.angle) * flipperLength;
        const rfTipY = rightFlipper.y + Math.sin(rightFlipper.angle) * flipperLength;
        const distR = distToSegment({ x: b.x, y: b.y }, { x: rightFlipper.x, y: rightFlipper.y }, { x: rfTipX, y: rfTipY });
        if (distR < b.radius + 6) {
          const flipperSpeedMultiplier = rightActive ? 1.6 : 0.8;
          b.vy = -(Math.abs(b.vy) * 0.7 + 7) * flipperSpeedMultiplier;
          b.vx -= (rightActive ? 4 : 1.5);
          spawnParticles(b.x, b.y, '#38bdf8', 6);
          soundManager.playJump();
          setScore(s => s + 25);
        }

        // Ball Drain (Bottom gap between flippers)
        if (b.y > height + 20) {
          balls.splice(i, 1);
          if (balls.length === 0) {
            if (ballsRemaining > 1) {
              ballsRemaining--;
              balls.push({
                x: tableX + tableW - 35,
                y: tableH - 60,
                vx: 0,
                vy: -15,
                radius: 9,
                trail: []
              });
              soundManager.playScore();
            } else {
              ballsRemaining = 0;
              handleEndGame(scoreRef.current, 'game_over', `💥 All Pinballs Drained! High Score: ${scoreRef.current}`);
              return;
            }
          }
        }
      }

      // -------------------------------------------------------------
      // RENDER PINBALL TABLE
      // -------------------------------------------------------------
      // Background Room / Cabinet Bezel
      ctx.fillStyle = '#080c16';
      ctx.fillRect(0, 0, width, height);

      // Outer Glow & Shadow
      ctx.shadowColor = '#6366f144';
      ctx.shadowBlur = 24;

      // Pinball Table Field
      const tableGrad = ctx.createLinearGradient(tableX, 0, tableX + tableW, height);
      tableGrad.addColorStop(0, '#0c1222');
      tableGrad.addColorStop(0.5, '#111827');
      tableGrad.addColorStop(1, '#070b14');
      ctx.fillStyle = tableGrad;
      ctx.beginPath();
      ctx.roundRect(tableX, 15, tableW, tableH, 24);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Neon Table Edge Rail
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(tableX + 4, 19, tableW - 8, tableH - 8, 20);
      ctx.stroke();

      // Top Arch Curve
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(tableX + tableW / 2, 70, tableW / 2 - 12, Math.PI, 0);
      ctx.stroke();

      // Ambient Arcade Decals / Artwork on Table
      ctx.strokeStyle = '#312e8133';
      ctx.lineWidth = 2;
      for (let ring = 40; ring <= 140; ring += 30) {
        ctx.beginPath();
        ctx.arc(tableX + tableW * 0.5, 200, ring, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Orbit Ramps (Neon guide lines)
      ctx.strokeStyle = '#06b6d466';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(tableX + 45, tableH - 120);
      ctx.lineTo(tableX + 45, 90);
      ctx.arcTo(tableX + tableW / 2, 35, tableX + tableW - 70, 90, 70);
      ctx.lineTo(tableX + tableW - 70, tableH - 120);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top Rollover Lanes
      rollovers.forEach(r => {
        ctx.fillStyle = r.lit ? '#facc15' : '#334155';
        ctx.shadowColor = r.lit ? '#facc15' : 'transparent';
        ctx.shadowBlur = r.lit ? 12 : 0;
        ctx.beginPath();
        ctx.roundRect(r.x, r.y, r.w, r.h, 6);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = r.lit ? '#000000' : '#94a3b8';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(r.label, r.x + r.w / 2, r.y + 19);
      });

      // Drop Target Bank
      dropTargets.forEach(dt => {
        ctx.fillStyle = dt.hit ? '#334155' : '#ef4444';
        ctx.shadowColor = dt.hit ? 'transparent' : '#ef4444';
        ctx.shadowBlur = dt.hit ? 0 : 8;
        ctx.beginPath();
        ctx.roundRect(dt.x, dt.y, dt.w, dt.h, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Slingshots
      slingshots.forEach(s => {
        ctx.fillStyle = s.kickGlow > 0 ? '#38bdf8' : '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = s.kickGlow > 0 ? 16 : 4;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.lineTo(s.x2, s.y2);
        ctx.lineTo(s.x3, s.y3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Bumpers
      bumpers.forEach(bm => {
        ctx.shadowColor = bm.color;
        ctx.shadowBlur = bm.hitGlow > 0 ? 25 : 12;
        ctx.fillStyle = bm.color;
        ctx.beginPath();
        ctx.arc(bm.x, bm.y, bm.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bm.x, bm.y, bm.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Points label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${bm.points}`, bm.x, bm.y + 3);
      });

      // Plunger Lane (Right edge)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(tableX + tableW - 48, 90, 36, tableH - 110);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(tableX + tableW - 48, 90, 36, tableH - 110);

      // Plunger Spring
      const springTop = tableH - 50 + (plungerPower * 0.3);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let y = tableH - 20; y >= springTop; y -= 6) {
        ctx.lineTo(tableX + tableW - 30 + ((y % 12 === 0) ? 6 : -6), y);
      }
      ctx.stroke();

      // Flippers
      // Left Flipper
      ctx.save();
      ctx.translate(leftFlipper.x, leftFlipper.y);
      ctx.rotate(leftFlipper.angle);
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(0, -6, flipperLength, 12, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Right Flipper
      ctx.save();
      ctx.translate(rightFlipper.x, rightFlipper.y);
      ctx.rotate(rightFlipper.angle);
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(0, -6, flipperLength, 12, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.shadowBlur = 0;

      // Particles
      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Balls & Trails
      balls.forEach(b => {
        b.trail.forEach(t => {
          ctx.fillStyle = `rgba(240, 240, 255, ${Math.max(0, t.alpha)})`;
          ctx.beginPath();
          ctx.arc(t.x, t.y, b.radius * 0.7, 0, Math.PI * 2);
          ctx.fill();
        });

        // Steel pinball with chrome shine
        const ballGrad = ctx.createRadialGradient(b.x - 3, b.y - 3, 1, b.x, b.y, b.radius);
        ballGrad.addColorStop(0, '#ffffff');
        ballGrad.addColorStop(0.3, '#cbd5e1');
        ballGrad.addColorStop(0.8, '#64748b');
        ballGrad.addColorStop(1, '#334155');
        ctx.fillStyle = ballGrad;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Side HUD Paneling
      // Left Panel: Balls Left & Multiball Status
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(16, 40, 108, 160, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PINBALLS', 70, 62);

      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < ballsRemaining ? '#38bdf8' : '#334155';
        ctx.shadowColor = i < ballsRemaining ? '#38bdf8' : 'transparent';
        ctx.shadowBlur = i < ballsRemaining ? 8 : 0;
        ctx.beginPath();
        ctx.arc(42 + i * 28, 85, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = multiballActive ? '#10b981' : '#64748b';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(multiballActive ? 'MULTIBALL!' : 'LIT LANES: A-B-C', 70, 125);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText('Press SPACE', 70, 155);
      ctx.fillText('to Launch Ball', 70, 170);

      // Right Panel: Plunger Power Meter & Flipper Guide
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(width - 124, 40, 108, 160, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('PLUNGER', width - 70, 62);

      // Power Gauge
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(width - 96, 75, 52, 14);
      const powerGrad = ctx.createLinearGradient(width - 96, 0, width - 44, 0);
      powerGrad.addColorStop(0, '#10b981');
      powerGrad.addColorStop(0.5, '#f59e0b');
      powerGrad.addColorStop(1, '#ef4444');
      ctx.fillStyle = powerGrad;
      ctx.fillRect(width - 96, 75, (plungerPower / 100) * 52, 14);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(width - 96, 75, 52, 14);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText('Left Flipper: [A] / ←', width - 70, 120);
      ctx.fillText('Right Flipper: [D] / →', width - 70, 140);
      ctx.fillText('Plunger: [SPACE] / ↓', width - 70, 160);
    }
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    canvas.removeEventListener('pointerdown', handlePointerDown);
    window.removeEventListener('pointerup', handlePointerUp);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}

// Helper: Distance from point to line segment
function distToSegment(p: { x: number; y: number }, v: { x: number; y: number }, w: { x: number; y: number }) {
  const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}
