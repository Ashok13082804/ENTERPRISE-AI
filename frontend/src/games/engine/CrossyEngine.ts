// Crossy Road / Highway Crossing Engine
import { GameRecord } from '@/data/gameDatabase';
import { soundManager } from './SoundManager';

interface CrossyEngineOptions {
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

export function startCrossyEngine({
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
}: CrossyEngineOptions) {
  const laneHeight = 50;
  const numLanes = 10;
  let playerCol = 8;
  let playerRow = 9; // starts at bottom grass
  const colWidth = 50;
  let furthestRow = 9;

  // Lanes definition
  // types: 'grass' | 'road' | 'river'
  const lanes = [
    { type: 'grass', color: '#15803d' },
    { type: 'river', speed: 2.2, dir: 1, logs: [{ x: 100, w: 120 }, { x: 400, w: 140 }, { x: 700, w: 110 }] },
    { type: 'river', speed: 2.8, dir: -1, logs: [{ x: 50, w: 130 }, { x: 350, w: 120 }, { x: 650, w: 140 }] },
    { type: 'grass', color: '#166534' },
    { type: 'road', speed: 3.5, dir: 1, cars: [{ x: 120, w: 60, color: '#ef4444' }, { x: 420, w: 60, color: '#f59e0b' }, { x: 680, w: 60, color: '#ec4899' }] },
    { type: 'road', speed: 4.8, dir: -1, cars: [{ x: 80, w: 75, color: '#38bdf8' }, { x: 380, w: 75, color: '#a855f7' }, { x: 640, w: 75, color: '#10b981' }] },
    { type: 'road', speed: 3.2, dir: 1, cars: [{ x: 150, w: 55, color: '#fbbf24' }, { x: 500, w: 55, color: '#f43f5e' }] },
    { type: 'grass', color: '#15803d' },
    { type: 'road', speed: 4.0, dir: -1, cars: [{ x: 200, w: 65, color: '#06b6d4' }, { x: 550, w: 65, color: '#ec4899' }] },
    { type: 'grass', color: '#166534' },
  ];

  let hopOffsetY = 0;
  let isHopping = false;
  let lastKeyTime = 0;

  const hop = (dCol: number, dRow: number) => {
    const now = Date.now();
    if (now - lastKeyTime < 130) return;
    lastKeyTime = now;

    playerCol = Math.max(1, Math.min(15, playerCol + dCol));
    const nextRow = Math.max(0, Math.min(numLanes - 1, playerRow + dRow));

    if (nextRow < playerRow) {
      if (nextRow < furthestRow) {
        furthestRow = nextRow;
        setScore(s => s + 100);
      }
    }
    playerRow = nextRow;
    soundManager.playJump();

    if (playerRow === 0) {
      setScore(s => s + 1000);
      soundManager.playWin();
      handleEndGame(scoreRef.current + 1000, 'victory', '🏆 River & Highway Successfully Crossed!');
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.code === 'KeyW' || e.code === 'ArrowUp') hop(0, -1);
    else if (e.key === 'ArrowDown' || e.key === 's' || e.code === 'KeyS' || e.code === 'ArrowDown') hop(0, 1);
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.code === 'KeyA' || e.code === 'ArrowLeft') hop(-1, 0);
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.code === 'KeyD' || e.code === 'ArrowRight') hop(1, 0);
  };
  window.addEventListener('keydown', onKeyDown);

  const onPointerDown = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const clickY = (e.clientY - rect.top) * (height / rect.height);
    const playerPixelY = playerRow * laneHeight + laneHeight / 2;
    if (clickY < playerPixelY) hop(0, -1);
    else hop(0, 1);
  };
  canvas.addEventListener('pointerdown', onPointerDown);

  let animationFrameId: number | null = null;

  const loop = () => {
    if (!isPlayingRef.current) return;
    if (!isPausedRef.current && !gameOverRef.current) {
      const currentLane = lanes[playerRow];
      const playerX = playerCol * colWidth + colWidth / 2;

      // Update cars & river logs
      lanes.forEach((lane, r) => {
        if (lane.type === 'road' && lane.cars) {
          lane.cars.forEach(car => {
            car.x += (lane.speed || 3) * (lane.dir || 1);
            if (lane.dir === 1 && car.x > width + 80) car.x = -80;
            if (lane.dir === -1 && car.x < -80) car.x = width + 80;

            // Collision check
            if (playerRow === r) {
              if (playerX > car.x - 15 && playerX < car.x + car.w + 15) {
                soundManager.playHit();
                handleEndGame(scoreRef.current, 'game_over', '💥 Squashed by highway traffic!');
              }
            }
          });
        } else if (lane.type === 'river' && lane.logs) {
          let onLog = false;
          lane.logs.forEach(log => {
            log.x += (lane.speed || 2) * (lane.dir || 1);
            if (lane.dir === 1 && log.x > width + 100) log.x = -100;
            if (lane.dir === -1 && log.x < -100) log.x = width + 100;

            if (playerRow === r) {
              if (playerX > log.x && playerX < log.x + log.w) {
                onLog = true;
                playerCol += ((lane.speed || 2) * (lane.dir || 1)) / colWidth;
              }
            }
          });

          // Fell in river check
          if (playerRow === r && !onLog) {
            soundManager.playHit();
            handleEndGame(scoreRef.current, 'game_over', '🌊 Fell into raging rapids!');
          }
        }
      });

      // -------------------------------------------------------------
      // RENDER CROSSY ROAD
      // -------------------------------------------------------------
      // Draw Lanes
      lanes.forEach((lane, r) => {
        const laneY = r * laneHeight;
        if (lane.type === 'grass') {
          ctx.fillStyle = lane.color || '#166534';
          ctx.fillRect(0, laneY, width, laneHeight);
          // Flower bushes
          ctx.fillStyle = '#facc15';
          for (let f = 30; f < width; f += 90) {
            ctx.beginPath();
            ctx.arc(f, laneY + 25, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (lane.type === 'road') {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, laneY, width, laneHeight);
          // Dashes
          ctx.strokeStyle = '#facc1555';
          ctx.lineWidth = 2;
          ctx.setLineDash([12, 12]);
          ctx.beginPath();
          ctx.moveTo(0, laneY + laneHeight / 2);
          ctx.lineTo(width, laneY + laneHeight / 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Cars
          lane.cars?.forEach(car => {
            ctx.fillStyle = car.color;
            ctx.shadowColor = car.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(car.x, laneY + 8, car.w, laneHeight - 16, 6);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Windshield
            ctx.fillStyle = '#ffffffaa';
            ctx.fillRect(car.x + (lane.dir === 1 ? car.w - 18 : 6), laneY + 12, 12, laneHeight - 24);
          });
        } else if (lane.type === 'river') {
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(0, laneY, width, laneHeight);

          // Logs
          lane.logs?.forEach(log => {
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.roundRect(log.x, laneY + 7, log.w, laneHeight - 14, 8);
            ctx.fill();

            // Wood grain rings
            ctx.strokeStyle = '#92400e';
            ctx.lineWidth = 2;
            ctx.strokeRect(log.x + 4, laneY + 10, log.w - 8, laneHeight - 20);
          });
        }
      });

      // Player Hopper (Mascot / Chicken / Frog)
      const pX = playerCol * colWidth + colWidth / 2;
      const pY = playerRow * laneHeight + laneHeight / 2;

      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(pX, pY, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Beak / Eyes
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(pX - 4, pY - 12);
      ctx.lineTo(pX, pY - 19);
      ctx.lineTo(pX + 4, pY - 12);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(pX - 4, pY - 4, 2.5, 0, Math.PI * 2);
      ctx.arc(pX + 4, pY - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    canvas.removeEventListener('pointerdown', onPointerDown);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}
