// Sports Simulation Engine (Soccer / Basketball / Golf)
import { GameRecord } from '@/data/gameDatabase';
import { soundManager } from './SoundManager';

interface SportsEngineOptions {
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

export function startSportsEngine({
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
}: SportsEngineOptions) {
  const isBasketball = game.name.toLowerCase().includes('basketball') || game.name.toLowerCase().includes('hoop');
  const isGolf = game.name.toLowerCase().includes('golf') || game.name.toLowerCase().includes('putt');
  // Default is Soccer Penalty Shootout

  // Ball
  let ballX = width / 2;
  let ballY = height - 80;
  let ballVx = 0;
  let ballVy = 0;
  let ballInFlight = false;
  let ballRadius = isBasketball ? 14 : isGolf ? 8 : 12;

  // Aiming arrow
  let aimAngle = -Math.PI / 2;
  let power = 0;
  let powerCharging = false;
  let powerDir = 1;

  // Target / Goalie / Hoop / Hole
  let goalieX = width / 2;
  let goalieVx = 2.8;
  const goalWidth = 320;
  let attempts = 5;
  let goalsScored = 0;

  const onPointerDown = () => {
    if (!ballInFlight) {
      powerCharging = true;
    }
  };

  const onPointerUp = () => {
    if (powerCharging && !ballInFlight) {
      powerCharging = false;
      const shotSpeed = 10 + (power / 100) * 14;
      ballVx = Math.cos(aimAngle) * shotSpeed;
      ballVy = Math.sin(aimAngle) * shotSpeed;
      ballInFlight = true;
      soundManager.playShoot();
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (ballInFlight) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (width / rect.width);
    const my = (e.clientY - rect.top) * (height / rect.height);
    aimAngle = Math.atan2(my - ballY, mx - ballX);
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointermove', onPointerMove);

  let animationFrameId: number | null = null;

  const loop = () => {
    if (!isPlayingRef.current) return;
    if (!isPausedRef.current && !gameOverRef.current) {
      const keys = activeKeys;

      // Aim with keyboard
      if (!ballInFlight) {
        if (keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('a')) aimAngle -= 0.035;
        if (keys.has('ArrowRight') || keys.has('KeyD') || keys.has('d')) aimAngle += 0.035;
        aimAngle = Math.max(-Math.PI * 0.85, Math.min(-Math.PI * 0.15, aimAngle));

        if (keys.has('Space') || keys.has(' ')) {
          powerCharging = true;
        } else if (powerCharging) {
          onPointerUp();
        }
      }

      // Charge power gauge
      if (powerCharging) {
        power += 2.5 * powerDir;
        if (power >= 100) { power = 100; powerDir = -1; }
        if (power <= 10) { power = 10; powerDir = 1; }
      }

      // Move Goalie
      goalieX += goalieVx;
      if (goalieX < width / 2 - goalWidth / 2 + 30 || goalieX > width / 2 + goalWidth / 2 - 30) {
        goalieVx *= -1;
      }

      // Ball Physics
      if (ballInFlight) {
        ballX += ballVx;
        ballY += ballVy;
        if (isBasketball || isGolf) ballVy += 0.35; // Gravity

        // Target checking
        if (isBasketball) {
          // Hoop at width/2, height 120
          if (Math.hypot(ballX - width / 2, ballY - 120) < 22 && ballVy > 0) {
            // Basket scored!
            goalsScored++;
            setScore(s => s + 300);
            soundManager.playScore();
            resetShot(true);
          }
        } else if (isGolf) {
          // Hole at width/2, 90
          if (Math.hypot(ballX - width / 2, ballY - 90) < 18) {
            goalsScored++;
            setScore(s => s + 500);
            soundManager.playScore();
            resetShot(true);
          }
        } else {
          // Soccer: Goal line at y = 110
          if (ballY <= 110) {
            // Check if saved by goalie
            if (Math.abs(ballX - goalieX) < 38) {
              soundManager.playHit();
              resetShot(false);
            } else if (ballX > width / 2 - goalWidth / 2 && ballX < width / 2 + goalWidth / 2) {
              // GOAL!
              goalsScored++;
              setScore(s => s + 250);
              soundManager.playWin();
              resetShot(true);
            } else {
              // Missed wide
              soundManager.playHit();
              resetShot(false);
            }
          }
        }

        // Out of bounds reset
        if (ballY < 40 || ballX < 0 || ballX > width || ballY > height + 40) {
          resetShot(false);
        }
      }

      // -------------------------------------------------------------
      // RENDER SPORTS STADIUM
      // -------------------------------------------------------------
      // Field Turf
      const fieldGrad = ctx.createLinearGradient(0, 0, 0, height);
      fieldGrad.addColorStop(0, '#15803d');
      fieldGrad.addColorStop(1, '#166534');
      ctx.fillStyle = fieldGrad;
      ctx.fillRect(0, 0, width, height);

      // Pitch Grass stripes
      ctx.fillStyle = '#ffffff0a';
      for (let y = 0; y < height; y += 40) {
        if ((y / 40) % 2 === 0) ctx.fillRect(0, y, width, 40);
      }

      if (isBasketball) {
        // Hardwood Court
        ctx.fillStyle = '#b45309';
        ctx.fillRect(100, 40, width - 200, height - 60);

        // Hoop Backboard & Rim
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(width / 2 - 40, 75, 80, 8);
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 4;
        ctx.strokeRect(width / 2 - 20, 83, 40, 16);
      } else {
        // Goal Net / Posts (Soccer)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(width / 2 - goalWidth / 2, 70, 8, 80);
        ctx.fillRect(width / 2 + goalWidth / 2 - 8, 70, 8, 80);
        ctx.fillRect(width / 2 - goalWidth / 2, 70, goalWidth, 8);

        // Net netting
        ctx.strokeStyle = '#ffffff33';
        ctx.lineWidth = 1;
        for (let nx = width / 2 - goalWidth / 2; nx <= width / 2 + goalWidth / 2; nx += 16) {
          ctx.beginPath(); ctx.moveTo(nx, 70); ctx.lineTo(nx, 150); ctx.stroke();
        }

        // Goalkeeper
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(goalieX - 18, 90, 36, 40, 8);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Penalty Spot / Tee
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(width / 2, height - 80, 4, 0, Math.PI * 2);
      ctx.fill();

      // Aiming Trajectory Arrow
      if (!ballInFlight) {
        ctx.strokeStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(ballX, ballY);
        ctx.lineTo(ballX + Math.cos(aimAngle) * 90, ballY + Math.sin(aimAngle) * 90);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      }

      // Ball
      ctx.fillStyle = isBasketball ? '#ea580c' : isGolf ? '#ffffff' : '#f8fafc';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Soccer Ball Hexagons
      if (!isBasketball && !isGolf) {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // HUD: Attempts & Power Meter
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`GOALS: ${goalsScored} / ${5 - attempts}  ·  SHOTS LEFT: ${attempts}`, 20, 30);

      // Power Gauge
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(width - 150, 20, 130, 16);
      ctx.fillStyle = power > 75 ? '#ef4444' : '#10b981';
      ctx.fillRect(width - 150, 20, (power / 100) * 130, 16);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(width - 150, 20, 130, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('POWER', width - 85, 32);
    }
    animationFrameId = requestAnimationFrame(loop);
  };

  const resetShot = (scored: boolean) => {
    ballInFlight = false;
    ballX = width / 2;
    ballY = height - 80;
    ballVx = 0;
    ballVy = 0;
    power = 0;
    attempts--;

    if (attempts <= 0) {
      setTimeout(() => {
        handleEndGame(scoreRef.current, goalsScored >= 3 ? 'victory' : 'game_over', `Match Finished! Goals Scored: ${goalsScored}/5!`);
      }, 500);
    }
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointermove', onPointerMove);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}
